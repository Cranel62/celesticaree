import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SecuritySetup.module.css';

const FALLBACK_QUESTIONS = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was your first car?",
  "What elementary school did you attend?",
  "What is your favorite book?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What is your favorite food?",
  "What is the name of your best friend?"
];

export default function SecuritySetup() {
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();

  const [questionsList, setQuestionsList] = useState(FALLBACK_QUESTIONS);
  const [formData, setFormData] = useState({
    question1: '',
    answer1: '',
    question2: '',
    answer2: '',
    question3: '',
    answer3: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Detect whether user is logged in or recovering via forgot-password
  const effectiveUserId = user?.id || user?.sql_id || sessionStorage.getItem('reset_user_id');

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const queryParam = effectiveUserId ? `?user_id=${effectiveUserId}` : '';
        const res = await fetch(`/api/user/security-setup${queryParam}`, { credentials: 'include' });
        
        if (!res.ok) return;

        const data = await res.json();
        if (data.success) {
          if (data.questionsList?.length) setQuestionsList(data.questionsList);
          if (data.userSecurity) {
            setFormData(prev => ({
              ...prev,
              question1: data.userSecurity.security_question1 || '',
              question2: data.userSecurity.security_question2 || '',
              question3: data.userSecurity.security_question3 || ''
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
      }
    };

    fetchExisting();
  }, [effectiveUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { question1, answer1, question2, answer2, question3, answer3 } = formData;
    if (!question1 || !answer1.trim() || !question2 || !answer2.trim() || !question3 || !answer3.trim()) {
      setError('All questions and answers are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/security-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          user_id: effectiveUserId
        })
      });
      const data = await res.json();

      if (data.success) {
        setMessage('Security questions saved successfully!');
        if (fetchUserProfile) await fetchUserProfile();
        setTimeout(() => {
          navigate(user ? '/dashboard' : '/login');
        }, 1500);
      } else {
        setError(data.error || 'Failed to save security questions.');
      }
    } catch {
      setError('Database error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.securityContainer}>
        <div className={styles.securityCard}>
          <h2 className={styles.title}>
            <i className="fas fa-shield-alt me-2"></i>Secure Your Account
          </h2>

          <div className={styles.infoBox}>
            <i className="fas fa-info-circle me-2" style={{ color: '#6b5b95' }}></i>
            Set up security questions to protect your account. You'll need these if you forget your password.
          </div>

          {message && <div className={styles.alertSuccess}>{message}</div>}
          {error && <div className={styles.alertDanger}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Question 1 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Security Question 1</label>
              <select
                className={styles.formSelect}
                value={formData.question1}
                onChange={(e) => setFormData({ ...formData, question1: e.target.value })}
                required
              >
                <option value="">Select a question</option>
                {questionsList.map((q, idx) => (
                  <option key={idx} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.formControl}
                placeholder="Your answer"
                value={formData.answer1}
                onChange={(e) => setFormData({ ...formData, answer1: e.target.value })}
                required
              />
            </div>

            {/* Question 2 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Security Question 2</label>
              <select
                className={styles.formSelect}
                value={formData.question2}
                onChange={(e) => setFormData({ ...formData, question2: e.target.value })}
                required
              >
                <option value="">Select a question</option>
                {questionsList.map((q, idx) => (
                  <option key={idx} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.formControl}
                placeholder="Your answer"
                value={formData.answer2}
                onChange={(e) => setFormData({ ...formData, answer2: e.target.value })}
                required
              />
            </div>

            {/* Question 3 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Security Question 3</label>
              <select
                className={styles.formSelect}
                value={formData.question3}
                onChange={(e) => setFormData({ ...formData, question3: e.target.value })}
                required
              >
                <option value="">Select a question</option>
                {questionsList.map((q, idx) => (
                  <option key={idx} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.formControl}
                placeholder="Your answer"
                value={formData.answer3}
                onChange={(e) => setFormData({ ...formData, answer3: e.target.value })}
                required
              />
            </div>

            <div className={styles.buttonStack}>
              <button type="submit" className={styles.btnSave} disabled={loading}>
                <i className="fas fa-save me-2"></i>
                {loading ? 'Saving...' : 'Save Security Questions'}
              </button>
              <Link to={user ? "/dashboard" : "/login"} className={styles.btnSkip}>
                <i className="fas fa-clock me-2"></i>{user ? "Remind Me Later" : "Cancel"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}