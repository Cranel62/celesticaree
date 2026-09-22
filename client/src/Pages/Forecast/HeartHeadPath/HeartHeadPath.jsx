import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeartHeadPath.module.css';
import tarotBack from '../../../images/tarot-back.png';

const tarotImages = import.meta.glob('../../../images/Tarots/**/*.{jpg,JPG}', {
  eager: true,
  import: 'default',
  query: '?url'
});

const DUMMY_CARDS = [
  { id: 0, name: 'The Fool', suit: 'major' },
  { id: 1, name: 'The Magician', suit: 'major' },
  { id: 2, name: 'The High Priestess', suit: 'major' },
  { id: 3, name: 'The Empress', suit: 'major' },
  { id: 4, name: 'The Emperor', suit: 'major' },
  { id: 5, name: 'The Hierophant', suit: 'major' },
  { id: 6, name: 'The Lovers', suit: 'major' },
  { id: 7, name: 'The Chariot', suit: 'major' },
  { id: 8, name: 'Strength', suit: 'major' },
  { id: 9, name: 'The Hermit', suit: 'major' },
  { id: 10, name: 'Wheel of Fortune', suit: 'major' },
  { id: 11, name: 'Justice', suit: 'major' },
  { id: 12, name: 'The Hanged Man', suit: 'major' },
  { id: 13, name: 'Death', suit: 'major' },
  { id: 14, name: 'Temperance', suit: 'major' },
  { id: 15, name: 'The Devil', suit: 'major' },
  { id: 16, name: 'The Tower', suit: 'major' },
  { id: 17, name: 'The Star', suit: 'major' },
  { id: 18, name: 'The Moon', suit: 'major' },
  { id: 19, name: 'The Sun', suit: 'major' },
  { id: 20, name: 'Judgement', suit: 'major' },
  { id: 21, name: 'The World', suit: 'major' }
];

const POSITION_CONFIG = {
  past: { title: 'The Past', question: 'What brought you here?', icon: '📜' },
  heart: { title: 'The Heart', question: 'What do you truly feel?', icon: '❤️' },
  head: { title: 'The Head', question: 'What do you rationally think?', icon: '🧠' },
  path: { title: 'The Path', question: 'Where do you go from here?', icon: '🛤️' }
};

const PICK_ORDER = ['past', 'heart', 'head', 'path'];

export default function HeartHeadPath() {
  const navigate = useNavigate();

  // State Management
  const [selectedCards, setSelectedCards] = useState({
    past: null,
    heart: null,
    head: null,
    path: null
  });

  const [currentPosition, setCurrentPosition] = useState(null);
  const [nextPositionIndex, setNextPositionIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFanOverlay, setShowFanOverlay] = useState(false);
  const [fanCards, setFanCards] = useState([]);
  const [selectedFanCardId, setSelectedFanCardId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('The spirits are gathering...');
  const [mainMessage, setMainMessage] = useState('Click on The Past to begin');
  const [temporaryHighlight, setTemporaryHighlight] = useState(null);

  const messageTimeoutRef = useRef(null);

  // Generate 150 persistent background stars
  const stars = useMemo(() => {
    return Array.from({ length: 150 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 4}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
  }, []);

  const playFlipSound = () => {
    return undefined;
  };

  const showMessage = (msg, duration = 0) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMainMessage(msg);

    if (duration > 0) {
      messageTimeoutRef.current = setTimeout(() => {
        setNextPositionIndex((currIdx) => {
          if (currIdx < PICK_ORDER.length) {
            setMainMessage(`Click on ${POSITION_CONFIG[PICK_ORDER[currIdx]].title} to continue`);
          } else {
            setMainMessage('Your journey is complete...');
          }
          return currIdx;
        });
      }, duration);
    }
  };

  const getCardImagePath = (card) => {
    const suitFolder = card.suit === 'major'
      ? 'Major'
      : (card.suit ? card.suit.charAt(0).toUpperCase() + card.suit.slice(1) : 'Major');
    const cardSuffix = `/Tarots/${suitFolder}/${card.id}.jpg`.toLowerCase();
    const imageEntry = Object.entries(tarotImages).find(([path]) => path.toLowerCase().endsWith(cardSuffix));
    return imageEntry ? imageEntry[1] : tarotBack;
  };

  const getFanPosition = (index, total) => {
    const angle = (index - (total - 1) / 2) * 12;
    const radius = 280;
    const radians = (angle * Math.PI) / 180;

    return {
      x: Math.sin(radians) * radius,
      y: -Math.abs(Math.sin(radians) * 35) - 10,
      rotate: angle * -0.4
    };
  };

  const loadFanCards = async () => {
    setLoading(true);
    setLoadingText('The spirits are gathering...');

    setTimeout(async () => {
      try {
        const response = await fetch('../tarot/api_draw_fan.php?count=10');
        const data = await response.json();
        if (data.success && data.cards) {
          setFanCards(data.cards);
        } else {
          throw new Error('Fallback needed');
        }
      } catch {
        const shuffled = [...DUMMY_CARDS].sort(() => 0.5 - Math.random());
        setFanCards(shuffled.slice(0, 10));
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const activatePosition = (pos) => {
    if (isProcessing) return;

    if (pos !== PICK_ORDER[nextPositionIndex]) {
      showMessage(`✨ First complete ${POSITION_CONFIG[PICK_ORDER[nextPositionIndex]].title}`, 3000);
      setTemporaryHighlight(PICK_ORDER[nextPositionIndex]);
      setTimeout(() => setTemporaryHighlight(null), 1000);
      return;
    }

    if (selectedCards[pos]) {
      showMessage('This position already has a card', 2000);
      return;
    }

    setCurrentPosition(pos);
    setShowFanOverlay(true);
    setSelectedFanCardId(null);
    loadFanCards();
  };

  const selectFanCard = (card) => {
    if (!currentPosition || isProcessing) return;

    setIsProcessing(true);
    setSelectedFanCardId(card.id);
    playFlipSound();

    const activePos = currentPosition;
    const newSelectedCards = { ...selectedCards, [activePos]: card };
    setSelectedCards(newSelectedCards);

    setTimeout(() => {
      setShowFanOverlay(false);
      setSelectedFanCardId(null);

      const nextIdx = nextPositionIndex + 1;
      setNextPositionIndex(nextIdx);

      if (nextIdx >= PICK_ORDER.length) {
        completeReading(newSelectedCards);
      } else {
        const nextPos = PICK_ORDER[nextIdx];
        showMessage(`✨ Now choose ${POSITION_CONFIG[nextPos].title}`, 2000);

        setTimeout(() => {
          activatePosition(nextPos);
        }, 1500);
      }

      setIsProcessing(false);
    }, 800);
  };

  const closeFanOverlay = () => {
    if (window.confirm('Cancel picking this card?')) {
      setShowFanOverlay(false);
      setSelectedFanCardId(null);
    }
  };

  const completeReading = (finalCards) => {
    showMessage('Your journey is complete...');
    setLoading(true);
    setLoadingText('Weaving your destiny...');

    const readingData = {
      spread: PICK_ORDER.map((pos) => ({
        position: pos,
        title: POSITION_CONFIG[pos].title,
        icon: POSITION_CONFIG[pos].icon,
        card: finalCards[pos]
      }))
    };

    sessionStorage.setItem('heartHeadPathSpread', JSON.stringify(readingData));

    fetch('../tarot/api_save_spread_session.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readingData)
    }).catch((err) => console.warn('Could not save to session:', err));

    setTimeout(() => {
      navigate('/forecast/heart-head-path-result');
    }, 2000);
  };

  const handleBackClick = (e) => {
    e.preventDefault();
    if (window.confirm('Your reading in progress will be lost. Continue?')) {
      sessionStorage.removeItem('heartHeadPathSpread');
      navigate('/forecast');
    }
  };

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {/* Back button */}
      <button type="button" className={styles.backButton} onClick={handleBackClick}>
        ← Back
      </button>

      {/* Twinkling background stars */}
      <div className={styles.stars}>
        {stars.map((star, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration
            }}
          />
        ))}
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>𓆩♡𓆪 Heart, Head &amp; Path 𓆩♡𓆪</h1>
          <p>Four cards will reveal your inner journey</p>
        </div>

        {/* 4 Card Positions in one row */}
        <div className={styles.spreadRow}>
          {PICK_ORDER.map((pos, index) => {
            const isFilled = Boolean(selectedCards[pos]);
            const isActive = currentPosition === pos && !isFilled;
            const isTempGlow = temporaryHighlight === pos;

            return (
              <div
                key={pos}
                id={`position-${pos}`}
                className={`
                  ${styles.positionCard}
                  ${isFilled ? styles.filled : ''}
                  ${isActive ? styles.active : ''}
                  ${isTempGlow ? styles.temporaryGlow : ''}
                `}
                onClick={() => activatePosition(pos)}
              >
                {!isFilled ? (
                  <div className={styles.cardPlaceholder}>
                    <div className={styles.positionIcon}>{POSITION_CONFIG[pos].icon}</div>
                    <div className={styles.positionTitle}>{POSITION_CONFIG[pos].title}</div>
                    <div className={styles.positionQuestion}>{POSITION_CONFIG[pos].question}</div>
                  </div>
                ) : (
                  <div className={styles.filledCard}>
                    <img
                      src={getCardImagePath(selectedCards[pos])}
                      alt={selectedCards[pos].name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = tarotBack;
                        e.currentTarget.style.objectFit = 'cover';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Dots */}
        <div className={styles.progressIndicator}>
          {PICK_ORDER.map((pos, index) => {
            const isCompleted = Boolean(selectedCards[pos]);
            const isActive = index === nextPositionIndex;
            return (
              <div
                key={pos}
                className={`
                  ${styles.progressDot}
                  ${isCompleted ? styles.completed : ''}
                  ${isActive && !isCompleted ? styles.active : ''}
                `}
              />
            );
          })}
        </div>

        {/* Message Area */}
        <div className={styles.messageArea}>{mainMessage}</div>
      </div>

      {/* Fan overlay when picking card */}
      <div
        className={`${styles.fanOverlay} ${showFanOverlay ? styles.active : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeFanOverlay();
        }}
      >
        <button className={styles.fanClose} onClick={closeFanOverlay}>
          ✕ Close
        </button>

        <div className={styles.fanHeader}>
          <h2>{currentPosition ? `Choose ${POSITION_CONFIG[currentPosition].title}` : 'Choose Your Card'}</h2>
          <p>{currentPosition ? POSITION_CONFIG[currentPosition].question : 'Select the card that speaks to you'}</p>
        </div>

        <div className={styles.fanCardsContainer}>
          {fanCards.map((card, index) => {
            const pos = getFanPosition(index, fanCards.length);
            const isSelected = selectedFanCardId === card.id;
            const hasOtherSelection = selectedFanCardId !== null && !isSelected;

            return (
              <div
                key={card.id}
                className={styles.fanCard}
                style={{
                  '--rotate': `${pos.rotate}deg`,
                  transform: isSelected
                    ? 'scale(1.3) translateY(-80px)'
                    : `translateX(${pos.x}px) translateY(${pos.y}px) rotate(${pos.rotate}deg)`,
                  zIndex: isSelected ? 2000 : index,
                  animationDelay: `${index * 0.03}s`,
                  opacity: hasOtherSelection ? 0.3 : 1,
                  borderColor: isSelected ? '#c0a0c0' : '#8a6a9a',
                  boxShadow: isSelected ? '0 30px 60px rgba(200, 150, 220, 0.8)' : undefined
                }}
                onClick={() => selectFanCard(card)}
              >
                {!isSelected ? (
                  <div className={styles.cardBack}>
                    <img
                      src={tarotBack}
                      alt="Card Back"
                      className={styles.cardBackImage}
                    />
                  </div>
                ) : (
                  <div className={styles.cardFrontDisplay}>
                    <img
                      src={getCardImagePath(card)}
                      alt={card.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = tarotBack;
                        e.currentTarget.style.objectFit = 'cover';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.messageArea} style={{ marginTop: 0, color: '#c0a0c0' }}>
          ° Click a card to place it °
        </div>
      </div>

      {/* Loading Screen */}
      <div className={`${styles.loading} ${loading ? styles.active : ''}`}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>{loadingText}</div>
      </div>
    </div>
  );
}