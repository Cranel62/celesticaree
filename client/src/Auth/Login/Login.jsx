import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

// Admin rules & allowed domain logic identical to PHP
const ADMIN_EMAIL_DOMAIN = '@celesticare.admin.com';
const ADMIN_SECRET_KEY = 'CelestiCare2025!';
const DEFAULT_PASSWORD = 'CelestiCare123!';

const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.ca',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'outlook.fr',
  'outlook.de'
];

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasDefaultPassword, setHasDefaultPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const debounceRef = useRef(null);

  // Read URL query params (e.g. ?registered=true)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered')) {
      setSuccessMessage('Registration successful! Please login.');
    }
  }, [location.search]);

  // Live email check debounce (500ms) for default password warning
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 5) {
      setHasDefaultPassword(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/check-default', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value.trim() })
        });
        const data = await response.json();
        setHasDefaultPassword(Boolean(data?.has_default_password));
      } catch {
        setHasDefaultPassword(false);
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedEmail = email.trim();

    // Field required verification
    if (!trimmedEmail || !password) {
      setErrorMessage('Both fields are required.');
      return;
    }

    const isAdminEmail = trimmedEmail.toLowerCase().includes(ADMIN_EMAIL_DOMAIN);

    // Regular user validation checks
    if (!isAdminEmail) {
      const emailDomain = trimmedEmail.split('@')[1]?.toLowerCase();
      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        setErrorMessage('Only Gmail, Yahoo, Hotmail, and Outlook emails are allowed.');
        return;
      }
      if (password.includes(' ')) {
        setErrorMessage('Password cannot contain spaces.');
        return;
      }
    } else {
      // Admin client check
      if (password !== ADMIN_SECRET_KEY) {
        setErrorMessage('Invalid admin credentials.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: trimmedEmail, password })
      });

      const data = await response.json();

      if (data.success) {
        if (password === DEFAULT_PASSWORD || data.needs_password_change) {
          sessionStorage.setItem('force_password_change', 'true');
        }

        const loggedInUser = data.user || { email: trimmedEmail, isAdmin: isAdminEmail };
        loginUser(loggedInUser);
        if (onLoginSuccess) onLoginSuccess(loggedInUser);

        navigate(data.redirect || (isAdminEmail ? '/admin/manage_users' : '/dashboard'));
      } else {
        setErrorMessage(data.error || 'Invalid email or password.');
      }
    } catch {
      // Fallback mock check for local dev testing
      if (isAdminEmail && password === ADMIN_SECRET_KEY) {
        if (onLoginSuccess) onLoginSuccess({ email: trimmedEmail, isAdmin: true });
        navigate('/admin/manage_users');
      } else {
        setErrorMessage('Unable to connect to authentication server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <button 
            className={styles.closeBtn} 
            onClick={() => navigate('/')} 
            title="Close and return to homepage"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className={styles.brandTitle}>CELESTICARE</div>
          <h2 className={styles.loginHeading}>Log in to your CelestiCare profile</h2>

          {/* Feedback banners */}
          {errorMessage && <div className={styles.alertDanger}>{errorMessage}</div>}
          {successMessage && <div className={styles.alertSuccess}>{successMessage}</div>}

          {/* Reset/Default password notice */}
          {hasDefaultPassword && (
            <div className={styles.defaultPasswordNotice}>
              <i className="fas fa-key me-2"></i>
              <strong>Your password has been reset to:</strong>
              <br />
              <span className={styles.defaultPasscode}>{DEFAULT_PASSWORD}</span>
              <br />
              <small>You will be required to change this after logging in.</small>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                name="email"
                className={styles.formControl}
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>

            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={styles.formControl}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={showPassword ? 'far fa-eye-slash' : 'far fa-eye'}></i>
              </button>
            </div>

            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <p className={styles.textMuted}>
              Don't have a CelestiCare profile? <Link to="/register">Sign up</Link>
            </p>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Link to="/forgot-password" className={styles.forgotPasswordLink}>
                <i className="fas fa-key me-1"></i> Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}