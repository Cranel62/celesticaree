import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './HeartHeadPathResult.module.css';
import tarotBack from '../../../images/tarot-back.png';

const tarotImages = import.meta.glob('../../../images/Tarots/**/*.{jpg,JPG}', {
  eager: true,
  import: 'default',
  query: '?url'
});

export default function HeartHeadPathResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [spreadCards, setSpreadCards] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isSavedReading, setIsSavedReading] = useState(false);
  const [savedCreatedAt, setSavedCreatedAt] = useState(null);
  const [saveIndicatorText, setSaveIndicatorText] = useState('');

  // Generate 100 persistent stars
  const stars = useMemo(() => {
    return Array.from({ length: 100 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
  }, []);

  const enrichCardWithImage = (card) => {
    if (!card) return card;
    const isMajor = card.arcana === 'major' || card.suit === 'major' || !card.suit;
    const folder = isMajor ? 'Major' : (card.suit.charAt(0).toUpperCase() + card.suit.slice(1));
    const cardSuffix = `/Tarots/${folder}/${card.id}.jpg`.toLowerCase();
    const imageEntry = Object.entries(tarotImages).find(([path]) => path.toLowerCase().endsWith(cardSuffix));
    const localImage = imageEntry ? imageEntry[1] : tarotBack;

    return {
      ...card,
      front_image: localImage
    };
  };

  const calculateAnalysis = (cards) => {
    let past = null;
    let heart = null;
    let head = null;
    let path = null;

    cards.forEach((item) => {
      if (item.position === 'past') past = item.card;
      if (item.position === 'heart') heart = item.card;
      if (item.position === 'head') head = item.card;
      if (item.position === 'path') path = item.card;
    });

    if (heart && head && path) {
      const heartKeywords = heart.keywords || 'intuitive feelings';
      const headKeywords = head.keywords || 'analytical thoughts';
      const alignment = `Your heart speaks of ${heartKeywords} while your head considers ${headKeywords}.`;

      let synthesis = '';
      if (path.id === heart.id) {
        synthesis = 'The path mirrors your heart. Trust your feelings.';
      } else if (path.id === head.id) {
        synthesis = 'The path aligns with your head. Logic serves you.';
      } else {
        synthesis = `The path offers a third way: ${path.upright || path.name}`;
      }

      const coreQuestion = 'How will you honor both your heart and your head today?';

      return {
        alignment,
        synthesis,
        core_question: coreQuestion,
        heart_card: heart,
        head_card: head,
        path_card: path,
        past_card: past
      };
    }
    return null;
  };

  useEffect(() => {
    const readingId = searchParams.get('reading_id');

    const loadData = async () => {
      setLoading(true);

      // Branch A: Load from database via reading_id
      if (readingId && user?.id) {
        try {
          const res = await fetch(`/api/tarot/get_reading.php?reading_id=${readingId}&user_id=${user.id}`);
          const data = await res.json();
          if (data?.reading) {
            setIsSavedReading(true);
            setSavedCreatedAt(data.reading.created_at);

            const rawCards = typeof data.reading.cards === 'string'
              ? JSON.parse(data.reading.cards)
              : data.reading.cards;

            const mappedCards = rawCards.map((item) => ({
              position: item.position,
              title: item.title || item.position,
              icon: item.icon || '🔮',
              card: enrichCardWithImage(item.card || item)
            }));

            setSpreadCards(mappedCards);
            setAnalysis(calculateAnalysis(mappedCards));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Failed to load saved reading from API:', err);
        }
      }

      // Branch B: Read from SessionStorage
      const localDataStr = sessionStorage.getItem('heartHeadPathSpread');
      if (localDataStr) {
        try {
          const parsed = JSON.parse(localDataStr);
          if (parsed.spread && Array.isArray(parsed.spread)) {
            const mappedCards = parsed.spread.map((item) => ({
              position: item.position,
              title: item.title || item.position,
              icon: item.icon || '🔮',
              card: enrichCardWithImage(item.card)
            }));

            setSpreadCards(mappedCards);
            const calculated = calculateAnalysis(mappedCards);
            setAnalysis(calculated);

            // Auto-save reading to database if logged in and newly generated
            if (user?.id && mappedCards.length === 4 && calculated) {
              autoSaveReading(mappedCards, calculated);
            }
          }
        } catch (e) {
          console.error('Error parsing stored reading:', e);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [searchParams, user]);

  const autoSaveReading = async (cards, currentAnalysis) => {
    try {
      const payload = {
        reading_type: 'heart_path',
        cards: cards.map((c) => ({
          id: c.card.id,
          name: c.card.name,
          position: c.position,
          title: c.title,
          icon: c.icon,
          card: c.card
        })),
        interpretation: currentAnalysis.alignment || '',
        spread_data: {
          heart_card: currentAnalysis.heart_card?.name || '',
          head_card: currentAnalysis.head_card?.name || '',
          path_card: currentAnalysis.path_card?.name || '',
          alignment: currentAnalysis.alignment || '',
          synthesis: currentAnalysis.synthesis || '',
          core_question: currentAnalysis.core_question || ''
        }
      };

      const res = await fetch('/api/tarot/api_save_reading.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();

      if (resData.success) {
        sessionStorage.setItem('last_reading_id', resData.reading_id);
        sessionStorage.setItem('last_reading_type', 'heart_path');
        setSaveIndicatorText('✨ Reading saved to your cosmic journal');
        setTimeout(() => setSaveIndicatorText(''), 4000);
      }
    } catch (e) {
      console.warn('Auto-save tarot reading failed:', e);
    }
  };

  // Mystical card tilt tracking
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  const parseColors = (card) => {
    if (card?.color_hexes) {
      return card.color_hexes.split(',').map((c) => c.trim());
    }
    if (card?.colors) {
      return card.colors.split(',').map((c) => c.trim());
    }
    return ['#c0a0c0', '#8a6a9a'];
  };

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

      <div className={styles.container}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Gathering celestial reflections...</p>
          </div>
        ) : spreadCards.length === 4 ? (
          <>
            {/* Header */}
            <div className={styles.readingHeader}>
              <h1 className={styles.readingTitle}>☪︎ The Heart, Head &amp; Path ☪︎</h1>
              <p className={styles.readingSubtitle}>
                Three voices speak within you. The cards reveal their wisdom.
              </p>
            </div>

            {isSavedReading && savedCreatedAt && (
              <div style={{ textAlign: 'center' }}>
                <div className={styles.savedBadge}>
                  📜 Saved reading from {new Date(savedCreatedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            )}

            {/* 4-Card Spread Grid */}
            <div className={styles.spreadGrid}>
              {spreadCards.map((item) => {
                const card = item.card;
                const colors = parseColors(card);

                return (
                  <div
                    key={item.position}
                    className={styles.cardPosition}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={styles.positionHeader}>
                      <span className={styles.positionIcon}>{item.icon}</span>
                      <span className={styles.positionTitle}>{item.title}</span>
                      <span className={styles.positionElement}>{card.element || 'Mystical'}</span>
                    </div>

                    <div className={styles.cardMini}>
                      <div className={styles.cardIcon}>
                        <img
                          src={card.front_image}
                          alt={card.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = tarotBack;
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className={styles.cardName}>{card.name}</div>
                        <div className={styles.cardKeywords}>{card.keywords}</div>
                        {card.essence && (
                          <div className={styles.essenceTag}>✦ {card.essence}</div>
                        )}
                      </div>
                    </div>

                    <div className={styles.interpretation}>
                      <strong>Meaning:</strong> {card.upright}
                    </div>

                    <div className={styles.archetypeMyth}>
                      {card.archetype && (
                        <div className={styles.archetypeBox}>
                          <strong>Archetype</strong>
                          <span>{card.archetype}</span>
                        </div>
                      )}
                      {card.myth && (
                        <div className={styles.mythBox}>
                          <strong>Myth</strong>
                          <span>{card.myth}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.positionQuestion}>
                      ☁︎·₊° {card.question || 'What does this mean for you?'}
                    </div>

                    <div className={styles.fashionMini}>
                      <div className={styles.fashionTitle}>୨ৎ Style Wisdom</div>
                      <div className={styles.fashionText}>{card.fashion}</div>
                      <div className={styles.colorsMini}>
                        {colors.map((c, i) => (
                          <div
                            key={i}
                            className={styles.colorDot}
                            style={{ backgroundColor: c, color: c }}
                            title={c}
                          />
                        ))}
                      </div>
                      <div className={styles.styleTip}>
                        ✮ {card.style_tip}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inner Dialogue / Tension Analysis */}
            {analysis && (
              <div className={styles.tensionSection}>
                <h2 className={styles.tensionTitle}>⚖️ The Inner Dialogue</h2>

                <div className={styles.heartHeadContainer}>
                  {/* Heart Box */}
                  <div className={styles.heartBox}>
                    <div className={styles.heartSymbol}>❤️</div>
                    <h3 style={{ color: '#c06a9a' }}>The Heart</h3>
                    <div style={{ width: 120, height: 180, margin: '0 auto 0.8rem auto', overflow: 'hidden', borderRadius: 10, border: '2px solid #c06a9a' }}>
                      <img
                        src={analysis.heart_card?.front_image}
                        alt={analysis.heart_card?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1a0f1a' }}
                      />
                    </div>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f0d0f0' }}>
                      {analysis.heart_card?.name}
                    </p>
                    <p style={{ margin: '0.8rem 0', opacity: 0.9, fontSize: '0.95rem', fontWeight: 500, color: '#e0c0e0' }}>
                      {analysis.heart_card?.upright}
                    </p>
                    <div style={{ marginTop: '0.8rem', fontSize: '1rem', fontWeight: 600, color: '#d0b0d0' }}>
                      <strong style={{ color: '#c06a9a' }}>Wants: </strong>
                      {analysis.heart_card?.keywords ? analysis.heart_card.keywords.split(',')[0] : ''}
                    </div>
                  </div>

                  <div className={styles.vsCircle}>VS</div>

                  {/* Head Box */}
                  <div className={styles.headBox}>
                    <div className={styles.headSymbol}>🧠</div>
                    <h3 style={{ color: '#6a8ac0' }}>The Head</h3>
                    <div style={{ width: 120, height: 180, margin: '0 auto 0.8rem auto', overflow: 'hidden', borderRadius: 10, border: '2px solid #6a8ac0' }}>
                      <img
                        src={analysis.head_card?.front_image}
                        alt={analysis.head_card?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1a0f1a' }}
                      />
                    </div>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f0d0f0' }}>
                      {analysis.head_card?.name}
                    </p>
                    <p style={{ margin: '0.8rem 0', opacity: 0.9, fontSize: '0.95rem', fontWeight: 500, color: '#e0c0e0' }}>
                      {analysis.head_card?.upright}
                    </p>
                    <div style={{ marginTop: '0.8rem', fontSize: '1rem', fontWeight: 600, color: '#d0b0d0' }}>
                      <strong style={{ color: '#6a8ac0' }}>Thinks: </strong>
                      {analysis.head_card?.keywords ? analysis.head_card.keywords.split(',')[0] : ''}
                    </div>
                  </div>
                </div>

                <div className={styles.alignmentText}>
                  {analysis.alignment}
                </div>

                {/* Path Box */}
                <div className={styles.pathBox}>
                  <div className={styles.pathSymbol}>🛤️</div>
                  <h3 style={{ color: '#9a8ac0' }}>The Path Forward</h3>
                  <div style={{ width: 120, height: 180, margin: '0 auto 0.8rem auto', overflow: 'hidden', borderRadius: 10, border: '2px solid #9a8ac0' }}>
                    <img
                      src={analysis.path_card?.front_image}
                      alt={analysis.path_card?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1a0f1a' }}
                    />
                  </div>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.8rem', color: '#f0d0f0' }}>
                    {analysis.path_card?.name}
                  </p>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500, color: '#e0c0e0' }}>
                    {analysis.path_card?.upright}
                  </p>
                  <p style={{ marginTop: '1.2rem', color: '#d0b0d0', fontSize: '1rem', fontWeight: 600 }}>
                    {analysis.synthesis}
                  </p>
                </div>
              </div>
            )}

            {/* Style Synthesis Triad */}
            {analysis && (
              <div className={styles.styleSynthesis}>
                <div className={`${styles.styleCard} ${styles.heartStyle}`}>
                  <h4>❤️ Heart's Desire</h4>
                  <div style={{ width: 80, height: 120, margin: '0 auto 0.8rem auto', overflow: 'hidden', borderRadius: 8, border: '1px solid #c06a9a' }}>
                    <img
                      src={analysis.heart_card?.front_image}
                      alt={analysis.heart_card?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1a0f1a' }}
                    />
                  </div>
                  <p>{analysis.heart_card?.fashion}</p>
                  <div className={styles.colorsMini} style={{ justifyContent: 'center' }}>
                    {parseColors(analysis.heart_card).map((c, idx) => (
                      <div key={idx} className={styles.colorDot} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {analysis.heart_card?.style_tip}
                  </p>
                </div>

                <div className={`${styles.styleCard} ${styles.headStyle}`}>
                  <h4>🧠 Head's Logic</h4>
                  <div style={{ width: 80, height: 120, margin: '0 auto 0.8rem auto', overflow: 'hidden', borderRadius: 8, border: '1px solid #6a8ac0' }}>
                    <img
                      src={analysis.head_card?.front_image}
                      alt={analysis.head_card?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1a0f1a' }}
                    />
                  </div>
                  <p>{analysis.head_card?.fashion}</p>
                  <div className={styles.colorsMini} style={{ justifyContent: 'center' }}>
                    {parseColors(analysis.head_card).map((c, idx) => (
                      <div key={idx} className={styles.colorDot} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {analysis.head_card?.style_tip}
                  </p>
                </div>

                <div className={`${styles.styleCard} ${styles.pathStyle}`}>
                  <h4>🛤️ Path's Integration</h4>
                  <div style={{ width: 80, height: 120, margin: '0 auto 0.8rem auto', overflow: 'hidden', borderRadius: 8, border: '1px solid #9a8ac0' }}>
                    <img
                      src={analysis.path_card?.front_image}
                      alt={analysis.path_card?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1a0f1a' }}
                    />
                  </div>
                  <p>{analysis.path_card?.fashion}</p>
                  <div className={styles.colorsMini} style={{ justifyContent: 'center' }}>
                    {parseColors(analysis.path_card).map((c, idx) => (
                      <div key={idx} className={styles.colorDot} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {analysis.path_card?.style_tip}
                  </p>
                </div>
              </div>
            )}

            {/* Reflective Question */}
            {analysis && (
              <div className={styles.synthesisQuestion}>
                <p style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>🔮</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{analysis.core_question}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.buttonContainer}>
              <Link to="/forecast/heart-head-path" className={styles.button}>
                ← New Reading
              </Link>
              {user && (
                <Link to="/forecast/history" className={styles.button}>
                  📜 History
                </Link>
              )}
              <button
                type="button"
                className={styles.button}
                onClick={() => window.print()}
              >
                📖 Print
              </button>
            </div>
          </>
        ) : (
          /* Error State when no reading is loaded */
          <div className={styles.errorMessage}>
            <h2>🔮 No Reading Found</h2>
            <p>The spirits haven't chosen your cards yet.</p>
            <p style={{ marginBottom: '2rem' }}>Begin your journey by selecting your cards first.</p>
            <Link to="/forecast/heart-head-path" className={styles.button}>
              Start Heart, Head &amp; Path Reading
            </Link>
            {user && (
              <Link to="/forecast/history" className={styles.button} style={{ marginLeft: '1rem' }}>
                📜 View History
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Auto-Save Toast Indicator */}
      {saveIndicatorText && (
        <div className={styles.saveIndicator}>
          {saveIndicatorText}
        </div>
      )}
    </div>
  );
}