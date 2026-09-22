import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AestheticQuiz.module.css';

const ALL_IMAGES = [
  { src: "acad1.jpg", aesthetic: "academia" },
  { src: "acad2.jpg", aesthetic: "academia" },
  { src: "acad3.jpg", aesthetic: "academia" },
  { src: "boho1.jpg", aesthetic: "boho" },
  { src: "boho2.jpg", aesthetic: "boho" },
  { src: "boho3.jpg", aesthetic: "boho" },
  { src: "coquette12.jpg", aesthetic: "coquette" },
  { src: "coquette2.jpg", aesthetic: "coquette" },
  { src: "coquette3.jpg", aesthetic: "coquette" },
  { src: "glam1.jpg", aesthetic: "luxurious" },
  { src: "glam2.jpg", aesthetic: "luxurious" },
  { src: "glam3.jpg", aesthetic: "luxurious" },
  { src: "grunge1.jpg", aesthetic: "grunge" },
  { src: "grunge2.jpg", aesthetic: "grunge" },
  { src: "grunge3.jpg", aesthetic: "grunge" },
  { src: "punk1.jpg", aesthetic: "punk" },
  { src: "punk2.jpg", aesthetic: "punk" },
  { src: "punk3.jpg", aesthetic: "punk" },
  { src: "y2k1.jpg", aesthetic: "y2k" },
  { src: "y2k2.jpg", aesthetic: "y2k" },
  { src: "y2k3.jpg", aesthetic: "y2k" }
].map(img => ({ src: `/quizzes/assets/${img.src}`, aesthetic: img.aesthetic }));

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function AestheticQuiz() {
  const navigate = useNavigate();
  const [imageSets, setImageSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [aestheticCounts, setAestheticCounts] = useState({
    boho: 0,
    academia: 0,
    coquette: 0,
    luxurious: 0,
    grunge: 0,
    punk: 0,
    y2k: 0
  });

  useEffect(() => {
    const shuffled = shuffle(ALL_IMAGES);
    const sets = [];
    for (let i = 0; i < 6; i++) {
      sets.push(shuffled.slice(i * 3, i * 3 + 3));
    }
    setImageSets(sets);
  }, []);

  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  const handleNext = () => {
    if (!selectedItem) return;

    // Record count
    const aesthetic = selectedItem.aesthetic;
    const nextCounts = {
      ...aestheticCounts,
      [aesthetic]: (aestheticCounts[aesthetic] || 0) + 1
    };
    setAestheticCounts(nextCounts);

    if (currentSet + 1 < imageSets.length) {
      setIsFlipped(!isFlipped);
      setSelectedItem(null);
      setCurrentSet(prev => prev + 1);
    } else {
      // Complete quiz
      const maxCount = Math.max(...Object.values(nextCounts));
      const topAesthetics = Object.keys(nextCounts).filter(a => nextCounts[a] === maxCount);
      const finalResult = topAesthetics[Math.floor(Math.random() * topAesthetics.length)];

      sessionStorage.setItem('temp_aesthetic_result', finalResult);
      navigate(`/quizzes/aesthetic-result?aesthetic=${encodeURIComponent(finalResult)}`);
    }
  };

  if (!imageSets.length) return null;

  const currentImages = imageSets[currentSet] || [];

  return (
    <div className={`${styles.pageWrapper} ${styles.fadeIn}`}>
      <div className={styles.quizWrapper}>
        <div className={`${styles.blackCard} ${isFlipped ? styles.flipped : ''}`}>
          <div className={styles.cardInner}>
            <div className={!isFlipped ? styles.cardFront : styles.cardBack}>
              <h2 className={styles.heading}>Pick the Image that Speaks to You</h2>
              <div className={styles.quizContainer}>
                {currentImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`${styles.quizOption} ${selectedItem?.src === img.src ? styles.selected : ''}`}
                    onClick={() => handleSelect(img)}
                  >
                    <img src={img.src} alt={img.aesthetic} />
                  </div>
                ))}
              </div>
              <button
                className={styles.btnNext}
                disabled={!selectedItem}
                onClick={handleNext}
              >
                {currentSet === 5 ? 'See Result' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}