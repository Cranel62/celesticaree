import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SingleCard.module.css';
import tarotBack from '../../../images/tarot-back.png';

const CARD_COUNT = 12;
const CARD_WIDTH = 200;
const CARD_HEIGHT = 290;
const CONTAINER_HEIGHT = 350;   

export default function SingleCard() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('initial');
  const [deckOpacity, setDeckOpacity] = useState(1);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const animationRef = useRef(null);

  const starsData = useMemo(() => Array.from({ length: 150 }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`
  })), []);

  const startShuffle = () => {
    if (phase !== 'initial') return;
    setPhase('fading');
    setTimeout(() => setPhase('shuffling'), 500);
  };

  useEffect(() => {
    if (phase !== 'shuffling') return undefined;

    let step = 0;
    let startTime = performance.now();
    const stepDuration = 1;

    const animate = now => {
      const elapsed = (now - startTime) / 1000;
      const width = containerRef.current?.clientWidth || 800;
      const centerX = width / 2 - CARD_WIDTH / 2;
      const centerY = CONTAINER_HEIGHT / 2 - CARD_HEIGHT / 2;

      if (step <= 3) {
        const progress = Math.min(elapsed / stepDuration, 1);
        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          let x;
          let y;
          let rotate;
          let scale = 1;

          if (step === 0) {
            x = centerX + (index * 4 - 24) * progress;
            y = centerY - 5 - index * 0.5 + (index * 2 - 5) * progress;
            rotate = (index * 2 - 12) * progress;
          } else if (step === 1) {
            const fanX = centerX + index * 4 - 24;
            const fanY = centerY + index * 2 - 10;
            x = fanX * (1 - progress) + centerX * progress;
            y = fanY * (1 - progress) + (centerY - 10) * progress;
            rotate = (index * 2 - 12) * (1 - progress);
          } else if (step === 2) {
            const side = index % 2 === 0 ? -1 : 1;
            x = centerX + side * 70 * progress;
            y = centerY - 10 - progress * 10 + Math.sin(index) * 10 * progress;
            rotate = side * 10 * progress;
          } else {
            const side = index % 2 === 0 ? -1 : 1;
            x = centerX + side * 50 + Math.sin(progress * Math.PI * 8 + index) * 40;
            y = centerY - 20 + Math.cos(progress * Math.PI * 6 + index) * 15;
            rotate = side * 8 + Math.sin(progress * Math.PI * 10 + index) * 20;
            scale = 0.9 + 0.2 * Math.sin(progress * Math.PI * 12 + index);
          }

          card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
          card.style.left = '0';
          card.style.top = '0';
        });

        if (progress >= 1) {
          step += 1;
          startTime = now;
        }
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      cancelAnimationFrame(animationRef.current);
      setDeckOpacity(0);
      setTimeout(() => {
        const cardId = Math.floor(Math.random() * 78) + 1;
        navigate(`/forecast/single-card-result?card=${cardId}`);
      }, 300);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [navigate, phase]);

  return (
    <div className={styles.pageWrapper}>
      <button type="button" className={styles.backButton} onClick={() => navigate('/forecast')}>
        Back
      </button>

      <div className={styles.stars}>
        {starsData.map((star, index) => (
          <div key={index} className={styles.star} style={star} />
        ))}
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Single Card Reading</h1>
          <p>One card holds today's message for you</p>
        </div>

        <div className={styles.cardContainer} ref={containerRef}>
          {(phase === 'initial' || phase === 'fading') && (
            <div
              className={`${styles.singleCard} ${phase === 'fading' ? styles.fadeOut : ''}`}
              onClick={startShuffle}
              role="button"
              tabIndex={0}
              onKeyDown={event => event.key === 'Enter' && startShuffle()}
            >
              <div className={styles.cardBackPattern}>
                <img src={tarotBack} alt="Tarot card back" />
              </div>
            </div>
          )}

          {phase === 'shuffling' && (
            <div className={styles.deckContainer}>
              {Array.from({ length: CARD_COUNT }, (_, index) => (
                <div
                  key={index}
                  ref={element => { cardRefs.current[index] = element; }}
                  className={styles.deckCard}
                  style={{ zIndex: index, opacity: deckOpacity }}
                >
                  <img src={tarotBack} alt="Tarot card back" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.messageArea}>
          {phase === 'initial' && <span className={styles.instructionText}>Click the card to begin</span>}
          {(phase === 'fading' || phase === 'shuffling') && (
            <span className={styles.shuffleText}>Shuffling the mystical deck...</span>
          )}
        </div>
      </div>
    </div>
  );
}
