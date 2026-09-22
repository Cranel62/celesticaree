import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ChangePassword.module.css';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const resetUserId = sessionStorage.getItem('reset_user_id');
  const isRecoveryMode = Boolean(resetUserId && !user);
  const effectiveUserId = user?.id || user?.sql_id || resetUserId;

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isRecoveryMode && !formData.current_password) {
      setError('Current password is required.');
      return;
    }

    if (!formData.new_password || !formData.confirm_password) {
      setError('Please provide and confirm your new password.');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: effectiveUserId,
          current_password: formData.current_password,
          new_password: formData.new_password,
          is_recovery: isRecoveryMode
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        sessionStorage.removeItem('reset_user_id');
        sessionStorage.removeItem('reset_email');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(data.message || 'Failed to update password.');
      }
    } catch {
      setError('Cannot connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.card}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            title="Close"
          >
            &times;
          </button>

          <div className={styles.brandTitle}>CELESTICARE</div>
          <div className={styles.subtitle}>
            {isRecoveryMode ? 'Create New Password' : 'Change Your Password'}
          </div>

          {error && <div className={styles.alertDanger}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Current Password (only visible when changing password while already logged in) */}
            {!isRecoveryMode && (
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="current_password"
                    className={styles.formControl}
                    placeholder="Current Password"
                    value={formData.current_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => toggleVisibility('current')}
                  >
                    {showPassword.current ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="new_password"
                  className={styles.formControl}
                  placeholder="New Password (min. 6 characters)"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => toggleVisibility('new')}
                >
                  {showPassword.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  className={styles.formControl}
                  placeholder="Confirm New Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => toggleVisibility('confirm')}
                >
                  {showPassword.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}