import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './AestheticWelcome.module.css';

export default function AestheticWelcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const liveAesthetic = sessionStorage.getItem('temp_aesthetic_result') || user?.aesthetic_result;
    if (liveAesthetic) {
      navigate('/quizzes/aesthetic-result?aesthetic=' + encodeURIComponent(liveAesthetic));
    }
  }, [user, navigate]);

  const handleBegin = (e) => {
    e.preventDefault();
    setFading(true);
    setTimeout(() => {
      navigate('/quizzes/aesthetic-quiz');
    }, 600);
  };

  return (
    <div className={`${styles.pageWrapper} ${fading ? styles.fadeBlurOut : ''}`}>
      <div className={styles.resultContainer}>
        <div className={styles.resultBox}>
          <div className={styles.brandTitle}>CELESTICARE</div>
          <h2>Discover Your Aesthetic Essence</h2>
          <p>
            Every individual has a unique style energy — a blend of personality, mood, and self-expression.
            Knowing your aesthetic helps you express your identity confidently and create a cohesive wardrobe that truly reflects who you are.
          </p>
          <button onClick={handleBegin} className={styles.btnContinue}>
            Begin
          </button>
        </div>
      </div>
    </div>
  );
}