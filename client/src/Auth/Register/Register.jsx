import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';

// Admin rules & allowed regular user domains from PHP
const ADMIN_EMAIL_DOMAIN = '@celesticare.admin.com';
const ADMIN_SECRET_KEY = 'CelestiCare2025!';

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

export default function Register() {
  const navigate = useNavigate();

  // Field values
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmAdminPassword, setShowConfirmAdminPassword] = useState(false);

  // Status & loaders
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic admin mode check
  const isAdminEmail = email.toLowerCase().includes(ADMIN_EMAIL_DOMAIN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    // 1. Basic validation
    if (!trimmedUsername || !trimmedEmail) {
      setErrorMessage('Username and email are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Invalid email format.');
      return;
    }

    // 2. Branch: Admin email flow
    if (isAdminEmail) {
      if (!adminPassword || !confirmAdminPassword) {
        setErrorMessage('Admin password fields are required.');
        return;
      }
      if (adminPassword !== confirmAdminPassword) {
        setErrorMessage('Admin passwords do not match!');
        return;
      }
      if (adminPassword !== ADMIN_SECRET_KEY) {
        setErrorMessage('Invalid admin password for admin email registration.');
        return;
      }
    } else {
      // 3. Branch: Regular user email flow
      const emailDomain = trimmedEmail.split('@')[1]?.toLowerCase();
      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        setErrorMessage('Only Gmail, Yahoo, Hotmail, and Outlook emails are allowed.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match!');
        return;
      }

      if (password.includes(' ')) {
        setErrorMessage('Password cannot contain spaces.');
        return;
      }

      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }

      if (!/[A-Z]/.test(password)) {
        setErrorMessage('Password must contain at least one uppercase letter.');
        return;
      }
    }

    setIsLoading(true);

    const chosenPassword = isAdminEmail ? adminPassword : password;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password: chosenPassword,
          is_admin: isAdminEmail
        })
      });

      const data = await response.json();

      if (data.success || response.ok) {
        if (isAdminEmail) {
          navigate('/login?admin_registered=1');
        } else {
          navigate('/login?registered=1');
        }
      } else {
        setErrorMessage(data.error || 'This email is already registered.');
      }
    } catch {
      // Local development fallback
      if (isAdminEmail) {
        navigate('/login?admin_registered=1');
      } else {
        navigate('/login?registered=1');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerPageWrapper}>
      <div className={styles.registerContainer}>
        <div className={styles.registerBox}>
          {/* Close button matching login */}
          <button 
            className={styles.closeBtn} 
            onClick={() => navigate('/')} 
            title="Back to Home"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className={styles.brandTitle}>CELESTICARE</div>
          <h2 className={styles.registerHeading}>Sign up to create your CelestiCare Profile!</h2>

          {errorMessage && <div className={styles.alertDanger}>{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                name="email"
                className={styles.formControl}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                name="username"
                className={styles.formControl}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Regular User Password Fields */}
            {!isAdminEmail ? (
              <div>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={styles.formControl}
                    placeholder="Password (min. 8 chars, 1 uppercase)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? 'far fa-eye-slash' : 'far fa-eye'}></i>
                  </button>
                </div>

                <div className={styles.passwordContainer}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    className={styles.formControl}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={showConfirmPassword ? 'far fa-eye-slash' : 'far fa-eye'}></i>
                  </button>
                </div>
              </div>
            ) : (
              /* Admin Password Fields */
              <div>
                <div className={styles.adminNotice}>
                  <i className="fas fa-shield-alt me-2"></i>Admin Account Registration
                </div>

                <div className={styles.passwordContainer}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    name="admin_password"
                    className={styles.formControl}
                    placeholder="Admin Password (Use: CelestiCare2025!)"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                  >
                    <i className={showAdminPassword ? 'far fa-eye-slash' : 'far fa-eye'}></i>
                  </button>
                </div>

                <div className={styles.passwordContainer}>
                  <input
                    type={showConfirmAdminPassword ? 'text' : 'password'}
                    name="confirm_admin_password"
                    className={styles.formControl}
                    placeholder="Confirm Admin Password"
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowConfirmAdminPassword(!showConfirmAdminPassword)}
                  >
                    <i className={showConfirmAdminPassword ? 'far fa-eye-slash' : 'far fa-eye'}></i>
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className={styles.btnRegister} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                'Register'
              )}
            </button>

            <p className={styles.textMuted}>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}