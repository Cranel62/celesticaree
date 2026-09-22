import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './BodyTypeAnalysis.module.css';

const FEMININE_TYPES = [
  { label: 'Hourglass', img: '/quizzes/assets/fem_hourglass.png' },
  { label: 'Inverted Triangle', img: '/quizzes/assets/fem_inverted.png' },
  { label: 'Pear', img: '/quizzes/assets/fem_pear.png' },
  { label: 'Rectangle', img: '/quizzes/assets/fem_rectangle.png' },
  { label: 'Round', img: '/quizzes/assets/fem_round.png' },
  { label: 'Standard', img: '/quizzes/assets/fem_standard.png' }
];

const MASCULINE_TYPES = [
  { label: 'Trapezoid', img: '/quizzes/assets/masc_trapezoid.png' },
  { label: 'Rectangle', img: '/quizzes/assets/masc_rectangle.png' },
  { label: 'Round', img: '/quizzes/assets/masc_round.png' },
  { label: 'Triangle', img: '/quizzes/assets/masc_triangle.png' },
  { label: 'Inverted Triangle', img: '/quizzes/assets/masc_inverted.png' }
];

export default function BodyTypeAnalysis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBodyType, setSelectedBodyType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const gender = user?.gender?.toLowerCase() === 'masculine' ? 'masculine' : 'feminine';
  const silhouettes = gender === 'masculine' ? MASCULINE_TYPES : FEMININE_TYPES;

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.bgAccent} ${styles.bgAccentOne}`} />
      <div className={`${styles.bgAccent} ${styles.bgAccentTwo}`} />

      <div className={styles.containerBodytype}>
        <h1 className={styles.title}>Body Type Analysis</h1>
        <p className={styles.subtitle}>
          Select the silhouette that best represents your body shape to personalize your style recommendations.
        </p>

        <div className={styles.bodytypeGrid}>
          {silhouettes.map((item, idx) => (
            <div
              key={idx}
              className={`${styles.bodytypeCard} ${gender === 'masculine' ? styles.mascCard : ''} ${selectedBodyType === item.label ? styles.selected : ''}`}
              onClick={() => setSelectedBodyType(item.label)}
            >
              <img src={item.img} alt={item.label} />
              <div className={styles.bodytypeLabel}>{item.label}</div>
            </div>
          ))}
        </div>

        {selectedBodyType && (
          <button className={styles.continueBtn} onClick={() => setShowModal(true)}>
            Continue
          </button>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h5>Discover Your Stylistic Vibe</h5>
            <p>
              Every person carries a signature visual rhythm — a harmony between personality, energy, and style.
              Let’s begin shaping how you see and express yourself.
              <br /><br />
              Dress your Personal Mannequin. You can right click to remove unwanted clothing.
            </p>
            <button
              className={styles.modalBtn}
              onClick={() => navigate('/quizzes/style-quiz')}
            >
              Go to Style Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}