import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './FeedbackModal.module.css';

export default function FeedbackModal({ isOpen, onClose, defaultFeature = 'Style Quiz' }) {
  const { user } = useAuth();

  const [experience, setExperience] = useState(5);
  const [fashionMatch, setFashionMatch] = useState('Very accurate');
  const [favoriteFeature, setFavoriteFeature] = useState(defaultFeature);
  const [vibe, setVibe] = useState('cool');
  const [suggestions, setSuggestions] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ text: '', isError: false });

    const currentUserId = user?.id || sessionStorage.getItem('user_id');

    try {
      const response = await fetch('/api/api_save_feedback.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: currentUserId,
          experience: String(experience),
          fashion_match: fashionMatch,
          favorite_feature: favoriteFeature,
          vibe,
          suggestions
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatusMessage({ text: 'Thank you for your feedback! ✨', isError: false });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ text: data.message || 'Failed to send feedback.', isError: true });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Network error. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <button className={styles.closeBtn} onClick={onClose} type="button">
          &times;
        </button>

        <h2 className={styles.title}>Share Your Experience</h2>
        <p className={styles.subtitle}>Help us refine your CelestiCare aesthetic!</p>

        {statusMessage.text && (
          <div className={statusMessage.isError ? styles.alertError : styles.alertSuccess}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Experience Rating */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Rate your overall experience (1-5)</label>
            <div className={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  className={`${styles.starBtn} ${experience >= val ? styles.starActive : ''}`}
                  onClick={() => setExperience(val)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Fashion Match Accuracy */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>How accurate was your fashion match?</label>
            <select
              className={styles.select}
              value={fashionMatch}
              onChange={(e) => setFashionMatch(e.target.value)}
            >
              <option value="Very accurate">Very accurate</option>
              <option value="Somewhat accurate">Somewhat accurate</option>
              <option value="Neutral">Neutral</option>
              <option value="Not accurate">Not accurate</option>
            </select>
          </div>

          {/* Favorite Feature */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Favorite Feature</label>
            <select
              className={styles.select}
              value={favoriteFeature}
              onChange={(e) => setFavoriteFeature(e.target.value)}
            >
              <option value="Style Quiz">Style Quiz</option>
              <option value="Aesthetic Quiz">Aesthetic Quiz</option>
              <option value="Undertone Test">Undertone Test</option>
              <option value="Moodboard">Moodboard</option>
            </select>
          </div>

          {/* Vibe selection */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>What vibe did you get?</label>
            <div className={styles.vibePills}>
              {['cool', 'warm', 'chic', 'rebellious', 'vintage'].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`${styles.pill} ${vibe === item ? styles.pillActive : ''}`}
                  onClick={() => setVibe(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Any suggestions for improvement?</label>
            <textarea
              className={styles.textarea}
              rows="3"
              placeholder="Tell us what you'd love to see next..."
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Submitting...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}