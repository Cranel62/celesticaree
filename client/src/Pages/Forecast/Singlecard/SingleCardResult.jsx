import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './SingleCardResult.module.css';
import tarotBack from '../../../images/tarot-back.png';

const tarotImages = import.meta.glob('../../../images/Tarots/**/*.{jpg,JPG}', {
  eager: true,
  import: 'default',
  query: '?url'
});

// Fallback card dataset replicating PHP tarot database structure
const DEFAULT_CARD = {
  id: 0,
  name: 'The Fool',
  arcana: 'major',
  suit: 'major',
  essence: 'A new adventure begins with a leap of faith.',
  upright: 'New beginnings, innocence, spontaneity, a free spirit, and stepping into the unknown.',
  keywords: 'Beginnings, Innocence, Leap of Faith, Freedom',
  challenge: 'Impulsiveness or failing to see the cliff ahead.',
  opportunity: 'Unrestricted potential and fresh starts waiting to unfold.',
  ritual: 'Light a clear quartz candle and step outside into the morning breeze.',
  affirmation: 'I step forward fearlessly into uncharted possibilities.',
  archetype: 'The Divine Child, The Wanderer, The Innocent',
  myth: 'Dionysus as the innocent youth, stepping onto the winding spiritual path.',
  question: 'What new beginning is asking for your leap of courage?',
  advice: 'Trust the unknown and take that first authentic step.',
  shadow_work: 'Where are you being reckless under the guise of being carefree?',
  soul_question: 'What would you attempt if you knew you could not fail?',
  fashion: 'Earthy silhouettes, lightweight flowing dusters, and whimsical accessories.',
  color_hexes: '#8a6a9a,#b59dab,#d0b0d0,#3a2a3a',
  style_tip: 'Pair relaxed bohemian fits with a statement celestial pouch.',
  style_challenge: 'Wear one vibrant, uncoordinated accessory purely for joy.'
};

export default function SingleCardResult() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(DEFAULT_CARD);
  const [isSavedReading, setIsSavedReading] = useState(false);
  const [savedCreatedAt, setSavedCreatedAt] = useState(null);
  const [saveIndicatorText, setSaveIndicatorText] = useState('');

  // Entrance animation states
  const [entranceFadeOut, setEntranceFadeOut] = useState(false);
  const [entranceHidden, setEntranceHidden] = useState(false);

  const staticCardRef = useRef(null);

  // Time of Day determination
  const { timeOfDay, timeMessage } = useMemo(() => {
    const hour = new Date().getHours();
    const period = hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening');
    return {
      timeOfDay: period,
      timeMessage: card[period] || card.essence
    };
  }, [card]);

  // Generate 100 persistent background stars
  const stars = useMemo(() => {
    return Array.from({ length: 100 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
  }, []);

  const enrichCardWithImage = (c) => {
    if (!c) return c;
    const isMajor = c.arcana === 'major' || c.suit === 'major' || !c.suit;
    const folder = isMajor ? 'Major' : (c.suit.charAt(0).toUpperCase() + c.suit.slice(1));
    const suffix = `/Tarots/${folder}/${c.id}.jpg`.toLowerCase();
    const imageEntry = Object.entries(tarotImages).find(([path]) => path.toLowerCase().endsWith(suffix));
    return {
      ...c,
      front_image: imageEntry ? imageEntry[1] : tarotBack
    };
  };

  useEffect(() => {
    const readingId = searchParams.get('reading_id');
    const cardParam = searchParams.get('card');

    const loadCardData = async () => {
      setLoading(true);

      // Branch A: Loading an archived saved reading from backend DB[cite: 2]
      if (readingId && user?.id) {
        try {
          const res = await fetch(`/api/tarot/get_reading.php?reading_id=${readingId}&user_id=${user.id}`);
          const data = await res.json();
          if (data?.reading) {
            setIsSavedReading(true);
            setSavedCreatedAt(data.reading.created_at);

            const savedCards = typeof data.reading.cards === 'string'
              ? JSON.parse(data.reading.cards)
              : data.reading.cards;

            if (savedCards && savedCards.length > 0) {
              const fullCard = enrichCardWithImage(savedCards[0].card || savedCards[0]);
              setCard({ ...DEFAULT_CARD, ...fullCard });
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Failed to load saved single reading:', err);
        }
      }

      // Branch B: Loading card freshly drawn or from sessionStorage[cite: 2]
      const sessionCardStr = sessionStorage.getItem('singleCardReading');
      if (sessionCardStr) {
        try {
          const stored = JSON.parse(sessionCardStr);
          const fullCard = enrichCardWithImage(stored);
          setCard({ ...DEFAULT_CARD, ...fullCard });

          if (user?.id) {
            autoSaveSingleReading(fullCard);
          }
        } catch (e) {
          console.error('Error parsing singleCardReading from session:', e);
        }
      } else if (cardParam) {
        // Fallback using card ID passed via query parameters[cite: 2]
        const cardId = parseInt(cardParam, 10);
        const resolved = enrichCardWithImage({ ...DEFAULT_CARD, id: cardId });
        setCard(resolved);
      }

      setLoading(false);
    };

    loadCardData();
  }, [searchParams, user]);

  // Entrance Card Animation Lifecycle[cite: 2]
  useEffect(() => {
    if (loading) return;

    const fadeTimer = setTimeout(() => {
      setEntranceFadeOut(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      setEntranceHidden(true);
    }, 2700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [loading]);

  const autoSaveSingleReading = async (c) => {
    try {
      const payload = {
        reading_type: 'single',
        cards: [{
          id: c.id,
          name: c.name,
          arcana: c.arcana || 'major',
          suit: c.suit || ''
        }],
        interpretation: c.upright || '',
        spread_data: {
          time_of_day: timeOfDay,
          time_message: timeMessage
        }
      };

      const res = await fetch('/api/tarot/api_save_reading.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('last_reading_id', data.reading_id);
        sessionStorage.setItem('last_reading_type', 'single');
        setSaveIndicatorText('✨ Reading saved to your cosmic journal');
        setTimeout(() => setSaveIndicatorText(''), 4000);
      }
    } catch (e) {
      console.warn('Auto-save single card failed:', e);
    }
  };

  // 3D Card Hover Perspective on static element[cite: 2]
  const handleCardMouseMove = (e) => {
    const el = staticCardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${y * -3}deg)`;
  };

  const handleCardMouseLeave = () => {
    if (staticCardRef.current) {
      staticCardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    }
  };

  const colors = useMemo(() => {
    if (card.color_hexes) {
      return card.color_hexes.split(',').map((c) => c.trim());
    }
    if (card.colors) {
      return card.colors.split(',').map((c) => c.trim());
    }
    return ['#8a6a9a', '#5a3a6a', '#3a2a4a', '#2a1a3a'];
  }, [card]);

  const keywords = useMemo(() => {
    return card.keywords ? card.keywords.split(',').map((k) => k.trim()) : [];
  }, [card]);

  const archetypes = useMemo(() => {
    return card.archetype ? card.archetype.split(',').map((a) => a.trim()) : [];
  }, [card]);

  return (
    <div className={styles.pageWrapper}>
      {/* Mystical Stars */}
      <div className={styles.stars}>
        {stars.map((s, idx) => (
          <div
            key={idx}
            className={styles.star}
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.animationDelay,
              animationDuration: s.animationDuration
            }}
          />
        ))}
      </div>

      {/* Floating Center Entrance Card[cite: 2] */}
      {!loading && !entranceHidden && (
        <div className={`${styles.cardEntrance} ${entranceFadeOut ? styles.fadeOut : ''}`}>
          <div className={`${styles.mysticalCard} ${styles.entranceCard}`}>
            <img
              src={card.front_image}
              alt={card.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                            e.currentTarget.src = tarotBack;
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Consulting the cosmos...</p>
        </div>
      ) : (
        <div className={styles.readingLayout}>
          {/* LEFT COLUMN - Static Card[cite: 2] */}
          <div className={styles.cardColumn}>
            <div className={styles.cardStatic}>
              <div
                ref={staticCardRef}
                className={styles.mysticalCard}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <img
                  src={card.front_image}
                  alt={card.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                      e.currentTarget.src = tarotBack;
                  }}
                />
              </div>

              <div className={styles.essenceText}>"{card.essence}"</div>

              {isSavedReading && savedCreatedAt && (
                <div className={styles.savedBadge}>
                  📜 Saved reading from {new Date(savedCreatedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Info Panels[cite: 2] */}
          <div className={styles.infoColumn}>
            {/* Time of Day Message[cite: 2] */}
            <div className={`${styles.infoPanel} ${styles.timePanel}`}>
              <div className={styles.panelHeader}>
                <span className={styles.panelIcon}>⌛</span>
                <span className={styles.panelTitle}>
                  This {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                </span>
              </div>
              <div className={styles.timeMessage}>{timeMessage}</div>
            </div>

            {/* Core Meaning & Keywords[cite: 2] */}
            <div className={styles.infoPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelIcon}>📋</span>
                <span className={styles.panelTitle}>Meaning</span>
              </div>
              <div className={styles.panelContent}>{card.upright}</div>

              <div className={styles.keywordCloud}>
                {keywords.map((keyword, i) => (
                  <span key={i} className={styles.keywordItem}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Dual Challenge & Opportunity[cite: 2] */}
            <div className={styles.dualLayout}>
              <div className={`${styles.dualItem} ${styles.challenge}`}>
                <div className={styles.dualLabel}>Challenge</div>
                <div className={styles.dualText}>{card.challenge}</div>
              </div>
              <div className={`${styles.dualItem} ${styles.opportunity}`}>
                <div className={styles.dualLabel}>Opportunity</div>
                <div className={styles.dualText}>{card.opportunity}</div>
              </div>
            </div>

            {/* Ritual[cite: 2] */}
            <div className={styles.ritualCard}>
              <div className={styles.ritualText}>{card.ritual}</div>
            </div>

            {/* Affirmation[cite: 2] */}
            <div className={styles.affirmationBox}>
              <div className={styles.affirmationText}>{card.affirmation}</div>
            </div>

            {/* Archetype & Myth[cite: 2] */}
            <div className={styles.infoPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelIcon}>🏛️</span>
                <span className={styles.panelTitle}>Archetype</span>
              </div>

              <div className={styles.archetypeTags}>
                {archetypes.map((arch, i) => (
                  <span key={i} className={styles.archetypeTag}>
                    {arch}
                  </span>
                ))}
              </div>

              <div className={styles.mythBlock}>{card.myth}</div>
            </div>

            {/* Reflection[cite: 2] */}
            <div className={styles.infoPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelIcon}>💭</span>
                <span className={styles.panelTitle}>Reflection</span>
              </div>
              <div className={styles.reflectionQuestion}>{card.question}</div>
              <div className={styles.reflectionAdvice}>{card.advice}</div>
            </div>

            {/* Shadow Work[cite: 2] */}
            <details className={styles.shadowDetails}>
              <summary className={styles.shadowSummary}>🌑 Shadow Work</summary>
              <div className={styles.shadowContent}>{card.shadow_work}</div>
            </details>

            {/* Soul Question[cite: 2] */}
            <div className={styles.soulQuestionBox}>
              <div className={styles.soulQuestionText}>{card.soul_question}</div>
            </div>

            {/* Style & Fashion[cite: 2] */}
            <div className={styles.infoPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelIcon}>👚</span>
                <span className={styles.panelTitle}>Style</span>
              </div>
              <div className={styles.panelContent}>{card.fashion}</div>

              {/* Color Palette[cite: 2] */}
              <div className={styles.colorPalette}>
                {colors.map((hex, idx) => (
                  <div
                    key={idx}
                    className={styles.colorItem}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  >
                    <span className={styles.colorHex}>{hex}</span>
                  </div>
                ))}
              </div>

              <div className={styles.styleTip}>{card.style_tip}</div>

              <div className={styles.styleChallengeBox}>
                {card.style_challenge}
              </div>
            </div>

            {/* Action Buttons[cite: 2] */}
            <div className={styles.buttonWrapper}>
              <Link to="/forecast/single-card" className={styles.returnButton}>
                ← New Reading
              </Link>
              {user && (
                <Link to="/forecast/history" className={styles.returnButton} style={{ marginLeft: '1rem' }}>
                  📜 History
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Save Toast Notification[cite: 2] */}
      {saveIndicatorText && (
        <div className={styles.saveIndicator}>
          {saveIndicatorText}
        </div>
      )}
    </div>
  );
}