import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Forecast.module.css';

export default function Forecast() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [recentReading, setRecentReading] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerFading, setBannerFading] = useState(false);

  // Fetch recent reading (last 7 days) and handle load transition
  useEffect(() => {
    let timer;
    const fetchRecentReading = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`/api/tarot/recent?user_id=${user.id}`, {
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.reading) {
              const dismissed = sessionStorage.getItem(`dismissed_recent_reading_${data.reading.id}`);
              if (dismissed !== 'true') {
                setRecentReading(data.reading);
                setShowBanner(true);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load recent tarot reading:', err);
        }
      }
    };

    fetchRecentReading();

    // 1.5s splash fade out
    timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  // Dismiss reading banner with animation and session storage flag
  const handleDismissBanner = () => {
    if (!recentReading) return;
    setBannerFading(true);
    sessionStorage.setItem(`dismissed_recent_reading_${recentReading.id}`, 'true');
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  // Continue recent reading
  const handleContinueReading = () => {
    if (!recentReading) return;
    const targetRoute =
      recentReading.reading_type === 'single'
        ? `/forecast/single-card-result?reading_id=${recentReading.id}`
        : `/forecast/heart-head-path?reading_id=${recentReading.id}`;
    navigate(targetRoute);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <div className={styles.mysticalContainer}>
      {/* Loading Screen Overlay */}
      {loading && (
        <div className={styles.mysticalLoading}>
          <div className={styles.loadingSymbol}>🔮</div>
        </div>
      )}

      {/* Recent Reading Banner */}
      {showBanner && recentReading && (
        <div
          className={`${styles.recentReadingBanner} ${
            bannerFading ? styles.fadeOut : ''
          }`}
        >
          <div className={styles.recentReadingContent}>
            <div className={styles.recentReadingIcon}>
              {recentReading.reading_type === 'single' ? '🔮' : '❤️'}
            </div>
            <div className={styles.recentReadingText}>
              <h3>Continue Your Reading</h3>
              <p>
                You have a{' '}
                {recentReading.reading_type === 'single'
                  ? 'Single Card'
                  : 'Heart, Head & Path'}{' '}
                reading from {formatDate(recentReading.created_at)}
              </p>
            </div>
            <button
              type="button"
              className={styles.recentReadingButton}
              onClick={handleContinueReading}
            >
              Continue Reading →
            </button>
            <button
              type="button"
              className={styles.recentReadingDismiss}
              onClick={handleDismissBanner}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tarot Content / Deck Mode Picker */}
      <div id="tarot-root" className={styles.tarotRoot}>
        <div className={styles.selectionContainer}>
          <h1 className={styles.oracleTitle}>The Cards of Fate</h1>
          <p className={styles.oracleSubtitle}>
            Unveil cosmic insights and discover celestial clarity for your path ahead.
          </p>

          <div className={styles.cardsGrid}>
            {/* Single Card Reading Mode */}
            <div
              className={styles.readingOptionCard}
              onClick={() => navigate('/forecast/single-card')}
            >
              <div className={styles.optionIcon}>🔮</div>
              <h2 className={styles.optionTitle}>Single Card</h2>
              <p className={styles.optionDesc}>
                A quick pull focusing on immediate energy, daily guidance, or a direct answer.
              </p>
              <button type="button" className={styles.btnSelectMode}>
                Draw One Card
              </button>
            </div>

            {/* Four-Card Reading Mode */}
            <div
              className={styles.readingOptionCard}
              onClick={() => navigate('/forecast/heart-head-path')}
            >
              <div className={styles.optionIcon}>❤️</div>
              <h2 className={styles.optionTitle}>Heart, Head & Path</h2>
              <p className={styles.optionDesc}>
                A deep multi-card spread analyzing emotion, logic, obstacles, and future journey.
              </p>
              <button type="button" className={styles.btnSelectMode}>
                Begin Spread
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}