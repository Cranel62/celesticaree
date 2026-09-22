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

// Direct calls to Express on port 5000 when on port 5173
const API_BASE = window.location.port === '5173' ? 'http://localhost:5000' : '';

export default function SecuritySetup() {
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useAuth();

  // If reset_user_id exists, we are in password reset validator mode
  const resetUserId = sessionStorage.getItem('reset_user_id');
  const isValidatorMode = Boolean(resetUserId && !user);

  const [questionsList, setQuestionsList] = useState(FALLBACK_QUESTIONS);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
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

  useEffect(() => {
    if (isValidatorMode) {
      // 1. Validator Mode: Retrieve the account's existing saved questions
      fetch(`${API_BASE}/api/user/get-recovery-questions?user_id=${resetUserId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.questions) && data.questions.length === 3) {
            setAssignedQuestions(data.questions);
            setFormData((prev) => ({
              ...prev,
              question1: data.questions[0],
              question2: data.questions[1],
              question3: data.questions[2]
            }));
          } else {
            setError(data.error || 'Unable to retrieve recovery questions for this account.');
          }
        })
        .catch(() => setError('Cannot connect to recovery services.'));
    } else if (user) {
      // 2. Setup Mode: Retrieve options for a logged-in user configuring their questions
      fetch(`${API_BASE}/api/user/security-setup`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.questionsList?.length) setQuestionsList(data.questionsList);
            if (data.userSecurity) {
              setFormData((prev) => ({
                ...prev,
                question1: data.userSecurity.security_question1 || '',
                question2: data.userSecurity.security_question2 || '',
                question3: data.userSecurity.security_question3 || ''
              }));
            }
          }
        })
        .catch(() => {});
    }
  }, [isValidatorMode, resetUserId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { answer1, answer2, answer3, question1, question2, question3 } = formData;
    if (!answer1.trim() || !answer2.trim() || !answer3.trim()) {
      setError('All 3 answers are required.');
      return;
    }

    setLoading(true);

    if (isValidatorMode) {
      // === VALIDATE ANSWERS & FORWARD TO CHANGE PASSWORD ===
      try {
        const response = await fetch(`${API_BASE}/api/verify-security`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: resetUserId,
            answer1,
            answer2,
            answer3
          })
        });

        const data = await response.json();

        if (data.success) {
          setMessage('Answers verified! Redirecting to set your new password...');
          setTimeout(() => {
            navigate('/auth/change-password');
          }, 1200);
        } else {
          setError(data.error || 'One or more security answers are incorrect.');
        }
      } catch {
        setError('Server communication error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // === SETUP QUESTIONS TO PROFILE ===
      if (!question1 || !question2 || !question3) {
        setError('Please select all 3 questions.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/user/security-setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            user_id: user?.id || user?.sql_id
          })
        });

        const data = await response.json();

        if (data.success) {
          setMessage('Security questions saved successfully!');
          if (fetchUserProfile) await fetchUserProfile();
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setError(data.error || 'Failed to save security questions.');
        }
      } catch {
        setError('Database error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.securityContainer}>
        <div className={styles.securityCard}>
          <h2 className={styles.title}>
            <i className="fas fa-shield-alt me-2"></i>
            {isValidatorMode ? 'Verify Your Identity' : 'Secure Your Account'}
          </h2>

          <div className={styles.infoBox}>
            <i className="fas fa-info-circle me-2" style={{ color: '#6b5b95' }}></i>
            {isValidatorMode
              ? 'Answer your security questions to confirm your identity and change your password.'
              : "Set up security questions to protect your account. You'll need these if you forget your password."}
          </div>

          {message && <div className={styles.alertSuccess}>{message}</div>}
          {error && <div className={styles.alertDanger}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Question 1 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Security Question 1</label>
              {isValidatorMode ? (
                <div className={styles.staticQuestion}>
                  {assignedQuestions[0] || 'Loading question...'}
                </div>
              ) : (
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
              )}
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
              {isValidatorMode ? (
                <div className={styles.staticQuestion}>
                  {assignedQuestions[1] || 'Loading question...'}
                </div>
              ) : (
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
              )}
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
              {isValidatorMode ? (
                <div className={styles.staticQuestion}>
                  {assignedQuestions[2] || 'Loading question...'}
                </div>
              ) : (
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
              )}
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
                <i className="fas fa-check-circle me-2"></i>
                {loading
                  ? 'Verifying...'
                  : isValidatorMode
                  ? 'Verify Answers & Reset'
                  : 'Save Security Questions'}
              </button>
              <Link to={user ? '/dashboard' : '/login'} className={styles.btnSkip}>
                {user ? 'Remind Me Later' : 'Back to Login'}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}