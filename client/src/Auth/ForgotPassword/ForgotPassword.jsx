import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const DEFAULT_PASSWORD = 'CelestiCare123!';

// Ensures calls hit Express on port 5000 in dev or Vite's proxy directly
const API_BASE = window.location.port === '5173' ? 'http://localhost:5000' : '';
const FORGOT_ENDPOINT = `${API_BASE}/api/forgot-password`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasDefaultPassword, setHasDefaultPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  // Live default password check
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 5) {
      setHasDefaultPassword(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(FORGOT_ENDPOINT, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            email: val.trim(),
            action: 'check_default'
          })
        });

        if (response.ok) {
          const data = await response.json();
          setHasDefaultPassword(Boolean(data?.has_default_password));
        } else {
          setHasDefaultPassword(false);
        }
      } catch {
        setHasDefaultPassword(false);
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(FORGOT_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email: trimmedEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || data?.message || 'Unable to process reset request.');
        return;
      }

      if (data.show_default_button || data.has_default_password) {
        setHasDefaultPassword(true);
        setMessage('This account has a default password. Click the button below to see it.');
      } else if (data.requires_security_questions) {
        sessionStorage.setItem('reset_email', trimmedEmail);
        sessionStorage.setItem('reset_user_id', data.user_id);
        navigate('/auth/security-setup');
      } else if (data.no_security_setup) {
        setError(data.error || "This account doesn't have security questions set up. Please contact an administrator for password reset.");
      } else {
        setMessage(data.message || "If this email exists in our system, you'll receive instructions shortly.");
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError('Cannot connect to the server. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPageWrapper}>
      <div className={styles.forgotContainer}>
        <div className={styles.forgotBox}>
          <button 
            type="button"
            className={styles.closeBtn} 
            onClick={() => navigate('/login')} 
            title="Back to Login"
          >
            &times;
          </button>

          <div className={styles.brandTitle}>CELESTICARE</div>
          <div className={styles.subtitle}>Reset Your Password</div>

          {message && <div className={styles.alertSuccess}>{message}</div>}
          {error && <div className={styles.alertDanger}>{error}</div>}

          {/* Default Password Display (Live or post-submit) */}
          {hasDefaultPassword && (
            <div className={styles.defaultSection}>
              <div className={styles.passwordDisplay}>
                <div className={styles.label}>
                  <i className="fas fa-key me-1"></i> Your Default Password
                </div>
                <div className={styles.password}>{DEFAULT_PASSWORD}</div>
                <div className={styles.note}>
                  You will be required to change this after logging in.
                </div>
              </div>

              <Link 
                to={`/login?email=${encodeURIComponent(email)}`} 
                className={styles.btnDefault}
              >
                Go to Login
              </Link>
            </div>
          )}

          <div className={styles.infoBox}>
            <i className="fas fa-info-circle me-2" style={{ color: '#6b5b95' }}></i>
            Enter your email address below. If you have security questions set up, you'll be asked to verify them.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                name="email"
                className={styles.formControl}
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.btnReset} 
              disabled={loading || hasDefaultPassword}
              title={hasDefaultPassword ? 'This account has a default password. Use the button above to login.' : ''}
            >
              {loading ? 'Sending...' : 'Send Reset Request'}
            </button>

            <Link to="/login" className={styles.btnBack}>
              Back to Login
            </Link>
          </form>

          <p className={styles.footerNote}>
            For security, we'll only reset passwords for accounts with security questions set up.
          </p>
        </div>
      </div>
    </div>
  );
}