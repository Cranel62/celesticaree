import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Zodiac.module.css';
import fireBackground from '../../images/fire_bg.jpeg';
import waterBackground from '../../images/water_bg.jpeg';
import airBackground from '../../images/air_bg.jpeg';
import earthBackground from '../../images/earth_bg.jpeg';
import vectorFrame from '../../images/vector.png';
import ariesIcon from '../../images/aries.png';
import leoIcon from '../../images/leo.png';
import sagittariusIcon from '../../images/sagittarius.png';
import taurusIcon from '../../images/taurus.png';
import virgoIcon from '../../images/virgo.png';
import capricornIcon from '../../images/capricorn.png';
import geminiIcon from '../../images/gemini.png';
import libraIcon from '../../images/libra.png';
import aquariusIcon from '../../images/aquarius.png';
import cancerIcon from '../../images/cancer.png';
import scorpioIcon from '../../images/scorpio.png';
import piscesIcon from '../../images/pisces.png';

const ELEMENTS = ['fire', 'water', 'air', 'earth'];

const ELEMENT_LABEL = {
  fire: 'Fire Signs',
  water: 'Water Signs',
  air: 'Air Signs',
  earth: 'Earth Signs'
};

const ELEMENT_SIGNS = {
  fire: ['aries', 'leo', 'sagittarius'],
  water: ['cancer', 'scorpio', 'pisces'],
  air: ['gemini', 'libra', 'aquarius'],
  earth: ['taurus', 'virgo', 'capricorn']
};

const ELEMENT_BG = {
  fire: fireBackground,
  water: waterBackground,
  air: airBackground,
  earth: earthBackground
};

const SIGN_DATA = {
  aries: {
    name: 'Aries', element: 'fire', tagline: 'The Fiery', dates: 'March 21 – April 19',
    traits: 'Bold, dynamic, and unafraid to take charge. Aries ignites movement wherever they go, driven by pure enthusiasm. Passion and courage define their leadership style.',
    element_desc: 'Energy, vitality, and initiative.', planet: 'Mars', planet_desc: 'The planet of action and strength.',
    bg: fireBackground, icon: ariesIcon
  },
  leo: {
    name: 'Leo', element: 'fire', tagline: 'The Blazing Feline', dates: 'July 23 – August 22',
    traits: 'Charismatic, confident, and warm-hearted. Leo lives to express and uplift, bringing light to every space they enter. Their generosity and creativity make them unforgettable.',
    element_desc: 'Passion, self-expression, and pride.', planet: 'Sun', planet_desc: 'The ruler of vitality and purpose.',
    bg: fireBackground, icon: leoIcon
  },
  sagittarius: {
    name: 'Sagittarius', element: 'fire', tagline: 'The Adventurous', dates: 'November 22 – December 21',
    traits: 'Adventurous, optimistic, and endlessly curious. Sagittarius seeks meaning through exploration, learning, and laughter. Their joy inspires others to look beyond limits.',
    element_desc: 'Growth, vision, and enthusiasm.', planet: 'Jupiter', planet_desc: 'The planet of expansion and wisdom.',
    bg: fireBackground, icon: sagittariusIcon
  },
  taurus: {
    name: 'Taurus', element: 'earth', tagline: 'The Grounded', dates: 'April 20 – May 20',
    traits: 'Loyal, sensual, and steadfast. Taurus finds peace in beauty and stability, creating comfort that lasts. Their calm nature anchors everyone around them.',
    element_desc: 'Practicality, security, and endurance.', planet: 'Venus', planet_desc: 'The planet of love and pleasure.',
    bg: earthBackground, icon: taurusIcon
  },
  virgo: {
    name: 'Virgo', element: 'earth', tagline: 'The Maiden', dates: 'August 23 – September 22',
    traits: 'Intelligent, detail-oriented, and quietly powerful. Virgo refines and improves everything they touch. Their thoughtful nature brings structure to chaos with grace.',
    element_desc: 'Precision, purpose, and balance.', planet: 'Mercury', planet_desc: 'The planet of logic and service.',
    bg: earthBackground, icon: virgoIcon
  },
  capricorn: {
    name: 'Capricorn', element: 'earth', tagline: 'The Ambitious', dates: 'December 22 – January 19',
    traits: 'Ambitious, responsible, and disciplined. Capricorn climbs steadily toward mastery, blending wisdom with willpower. They are builders of both success and legacy.',
    element_desc: 'Stability, focus, and determination.', planet: 'Saturn', planet_desc: 'The ruler of time, structure, and perseverance.',
    bg: earthBackground, icon: capricornIcon
  },
  gemini: {
    name: 'Gemini', element: 'air', tagline: 'The Versatile', dates: 'May 21 – June 20',
    traits: 'Quick-witted, adaptable, and endlessly curious. Gemini thrives on movement and conversation, forever gathering stories and insights. Their lively presence keeps energy flowing.',
    element_desc: 'Intellect, communication, and change.', planet: 'Mercury', planet_desc: 'The planet of thought and expression.',
    bg: airBackground, icon: geminiIcon
  },
  libra: {
    name: 'Libra', element: 'air', tagline: 'The Harmonizer', dates: 'September 23 – October 22',
    traits: 'Graceful, charming, and fair. Libra seeks equilibrium in beauty and relationships. They bring peace through empathy and elegant compromise.',
    element_desc: 'Balance, elegance, and awareness.', planet: 'Venus', planet_desc: 'Ruler of love, art, and diplomacy.',
    bg: airBackground, icon: libraIcon
  },
  aquarius: {
    name: 'Aquarius', element: 'air', tagline: 'The Innovator', dates: 'January 20 – February 18',
    traits: 'Innovative, independent, and forward-thinking. Aquarius lives for originality and ideas that serve humanity. Their perspective is futuristic, yet deeply humanitarian.',
    element_desc: 'Intellect, innovation, and freedom.', planet: 'Uranus', planet_desc: 'Planet of progress and change (traditionally Saturn).',
    bg: airBackground, icon: aquariusIcon
  },
  cancer: {
    name: 'Cancer', element: 'water', tagline: 'The Nurturer', dates: 'June 21 – July 22',
    traits: 'Sensitive, protective, and nurturing. Cancer builds emotional safety for themselves and their loved ones. They love through care, creating homes filled with warmth.',
    element_desc: 'Emotion, intuition, and protection.', planet: 'Moon', planet_desc: 'Ruler of feeling, memory, and instinct.',
    bg: waterBackground, icon: cancerIcon
  },
  scorpio: {
    name: 'Scorpio', element: 'water', tagline: 'The Intense', dates: 'October 23 – November 21',
    traits: 'Mysterious, passionate, and deeply loyal. Scorpio transforms pain into power and truth into intimacy. They live and love with unshakable intensity.',
    element_desc: 'Depth, passion, and renewal.', planet: 'Pluto', planet_desc: 'Ruler of transformation and desire (traditionally Mars).',
    bg: waterBackground, icon: scorpioIcon
  },
  pisces: {
    name: 'Pisces', element: 'water', tagline: 'The Whymsical', dates: 'February 19 – March 20',
    traits: 'Empathetic, creative, and soulful. Pisces channels emotion into imagination, seeing beauty where others see chaos. They live through intuition and compassion.',
    element_desc: 'Sensitivity, art, and spirituality.', planet: 'Neptune', planet_desc: 'Planet of dreams and inspiration (traditionally Jupiter).',
    bg: waterBackground, icon: piscesIcon
  }
};

export default function Zodiac() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFading, setIsFading] = useState(false);

  // Read view params with fallbacks matching PHP
  const view = searchParams.get('view') || 'element';
  const elemParam = (searchParams.get('elem') || 'fire').toLowerCase();
  const currentElem = ELEMENTS.includes(elemParam) ? elemParam : 'fire';
  const signParam = (searchParams.get('sign') || '').toLowerCase();

  const activeSign = SIGN_DATA[signParam];
  const isSignView = view === 'sign' && Boolean(activeSign);

  // Background and class styling
  const activeBg = isSignView ? activeSign.bg : ELEMENT_BG[currentElem];
  const bodyClass = isSignView ? activeSign.element : currentElem;

  const changeElement = (targetElem) => {
    setIsFading(true);
    setTimeout(() => {
      setSearchParams({ view: 'element', elem: targetElem });
      setIsFading(false);
    }, 400);
  };

  const getPrevElem = (elem) => {
    const i = ELEMENTS.indexOf(elem);
    return ELEMENTS[(i - 1 + ELEMENTS.length) % ELEMENTS.length];
  };

  const getNextElem = (elem) => {
    const i = ELEMENTS.indexOf(elem);
    return ELEMENTS[(i + 1) % ELEMENTS.length];
  };

  return (
    <div
      className={`${styles.zodiacPage} ${styles[bodyClass]} ${isFading ? styles.fadeOut : ''}`}
      style={{ backgroundImage: `url(${activeBg})` }}
    >
      <div className={styles.pageOverlay}>
        {isSignView ? (
          /* ================= SIGN DETAIL VIEW ================= */
          <main className={styles.signPage}>
            <div className={styles.signCard}>
              <h1 className={styles.signTitle}>{activeSign.name}</h1>
              <div className={styles.signTagline}>{activeSign.tagline}</div>
              <div className={styles.signDates}>{activeSign.dates}</div>

              <section className={styles.signSection}>
                <h3>Core Traits</h3>
                <p>{activeSign.traits}</p>
              </section>

              <section className={styles.signSection}>
                <h3>Element</h3>
                <p>
                  <strong>{activeSign.element.charAt(0).toUpperCase() + activeSign.element.slice(1)}</strong> — {activeSign.element_desc}
                </p>
              </section>

              <section className={styles.signSection}>
                <h3>Planet</h3>
                <p>
                  <strong>{activeSign.planet}</strong> — {activeSign.planet_desc}
                </p>
              </section>

              <div className={styles.signActions}>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={() => setSearchParams({ view: 'element', elem: activeSign.element })}
                >
                  Back to {activeSign.element.charAt(0).toUpperCase() + activeSign.element.slice(1)} signs
                </button>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={() => setSearchParams({ view: 'element', elem: 'fire' })}
                >
                  All Elements
                </button>
              </div>
            </div>
          </main>
        ) : (
          /* ================= ELEMENT GRID VIEW ================= */
          <main className={styles.mainContent}>
            <h2 className={styles.heading}>{ELEMENT_LABEL[currentElem]}</h2>

            {/* Carousel Previous */}
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={() => changeElement(getPrevElem(currentElem))}
              aria-label="Previous Element"
            >
              ←
            </button>

            {/* Grid of Signs */}
            <div className={styles.diamondContainer}>
              {ELEMENT_SIGNS[currentElem].map((slug) => {
                const sd = SIGN_DATA[slug];
                return (
                  <div
                    key={slug}
                    className={`${styles.diamondWrapper} ${styles[slug]}`}
                    onClick={() => setSearchParams({ view: 'sign', sign: slug })}
                  >
                    <div className={styles.diamondImages}>
                      {/* Vector Background Asset */}
                      <img
                        src={vectorFrame}
                        alt="Vector Background"
                        className={styles.vectorBg}
                      />

                      {/* Zodiac Icon Asset */}
                      <img
                        src={sd.icon}
                        alt={sd.name}
                        className={styles.zodiacIcon}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = vectorFrame;
                        }}
                      />

                      {/* Hover Name Overlay */}
                      <span className={styles.signName}>{sd.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Next */}
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={() => changeElement(getNextElem(currentElem))}
              aria-label="Next Element"
            >
              →
            </button>
          </main>
        )}
      </div>
    </div>
  );
}