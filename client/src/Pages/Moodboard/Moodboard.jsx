import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Moodboard.module.css';

const AESTHETICS = {
  academia: {
    color: '#271a0e',
    mood: 'Intellectual • Vintage • Poised',
    title: 'The Scholar',
    desc: "You're drawn to timeless sophistication — think books, tweed, and candlelit study sessions. You find beauty in intellect and classic detail.",
    assets: ['/quizzes/assets/acad1.jpg', '/quizzes/assets/acad2.jpg', '/quizzes/assets/acad3.jpg']
  },
  boho: {
    color: '#e38153',
    mood: 'Free-Spirited • Earthy • Artistic',
    title: 'The Bohemian Dreamer',
    desc: 'You embody freedom, creativity, and a love for earthy tones and textures. Every outfit tells a story — unbothered, soulful, and effortlessly chic.',
    assets: ['/quizzes/assets/boho1.jpg', '/quizzes/assets/boho2.jpg', '/quizzes/assets/boho3.jpg']
  },
  coquette: {
    color: '#f5c4d4',
    mood: 'Romantic • Vintage • Playful',
    title: 'The Coquette Muse',
    desc: 'Romantic and soft, your style leans into vintage elegance — ribbons, lace, and an air of flirtatious nostalgia.',
    assets: ['/quizzes/assets/coquette12.jpg', '/quizzes/assets/coquette2.jpg', '/quizzes/assets/coquette3.jpg']
  },
  grunge: {
    color: '#a1a1a1',
    mood: 'Edgy • Unfiltered • Rebellious',
    title: 'The Rebel Soul',
    desc: 'You thrive in expressive chaos — distressed textures, dark tones, and a bold disregard for convention define your edge.',
    assets: ['/quizzes/assets/grunge1.jpg', '/quizzes/assets/grunge2.jpg', '/quizzes/assets/grunge3.jpg']
  },
  punk: {
    color: '#ff0000',
    mood: 'Defiant • Raw • Bold',
    title: 'The Anarchic Icon',
    desc: 'You wear rebellion like armor — unapologetic, loud, and endlessly cool. Spikes, leather, and confidence are your essentials.',
    assets: ['/quizzes/assets/punk1.jpg', '/quizzes/assets/punk2.jpg', '/quizzes/assets/punk3.jpg']
  },
  y2k: {
    color: '#d46be3',
    mood: 'Playful • Futuristic • Glam',
    title: 'The Futuristic Popstar',
    desc: 'You radiate playful confidence with metallics, baby tees, and digital-era nostalgia. The early 2000s live in your sparkle.',
    assets: ['/quizzes/assets/y2k1.jpg', '/quizzes/assets/y2k2.jpg', '/quizzes/assets/y2k3.jpg']
  },
  luxurious: {
    color: '#c93939',
    mood: 'Elegant • Dazzling • Confident',
    title: 'The Luxe Visionary',
    desc: 'Glitter, confidence, and high drama — your aura screams sophistication and luxury. You turn moments into red-carpet statements.',
    assets: ['/quizzes/assets/glam1.jpg', '/quizzes/assets/glam2.jpg', '/quizzes/assets/glam3.jpg']
  }
};

const STYLES = {
  minimalist: {
    name: 'Minimalist Elegance',
    colors: 'White, black, beige, grey',
    desc: 'Clean, simple, and timeless pieces. Less is more and comfort meets elegance.'
  },
  businesswear: {
    name: 'Professional Businesswear',
    colors: 'Navy, black, grey, white',
    desc: 'Polished, professional, and structured looks perfect for work and meetings.'
  },
  elegant: {
    name: 'Classic Elegance',
    colors: 'Pastels, jewel tones, black, white',
    desc: 'Sophisticated, classy, and luxurious styles with refined silhouettes.'
  },
  creative: {
    name: 'Creative Expression',
    colors: 'Bright, contrasting, eclectic',
    desc: 'Bold, artistic, and expressive looks that show your personality.'
  },
  soft: {
    name: 'Soft Elegance',
    colors: 'Pastels, cream, light pink, baby blue',
    desc: 'Gentle, pastel, and cozy pieces that create a soft, approachable vibe.'
  },
  rough: {
    name: 'Rough Edge',
    colors: 'Black, grey, earthy tones',
    desc: 'Edgy, casual, and street-inspired styles that stand out with attitude.'
  },
  streetwear: {
    name: 'Urban Streetwear',
    colors: 'Black, white, bold bright accents',
    desc: 'Urban, trendy, and casual styles that combine comfort with flair.'
  }
};

const PALETTES = {
  Aries: {
    cool: ['#131111', '#6b0e3d', '#80012b', '#ad0f53', '#8b3979', '#f4338a'],
    warm: ['#40180b', '#88171c', '#d72113', '#f0500c', '#ff762d', '#ff9a51'],
    neutral: ['#7f1619', '#9b2627', '#bd5858', '#926454', '#b8717e', '#efaeb4']
  },
  Taurus: {
    cool: ['#22a068', '#ff5ee1', '#ff9afb', '#9bee99', '#ffc8fb', '#a7efcb'],
    warm: ['#2e3f16', '#3a5d09', '#7bab44', '#b25526', '#ff762d', '#ffc451'],
    neutral: ['#253e18', '#9d6f45', '#689257', '#c68139', '#eccb67', '#a4c49c']
  },
  Gemini: {
    cool: ['#052542', '#175374', '#9e37a0', '#b478cd', '#e669ef', '#82d3d7'],
    warm: ['#567b18', '#55844f', '#ffa408', '#fab738', '#afd84b', '#ffcf40'],
    neutral: ['#19344d', '#435c89', '#807145', '#5e666b', '#cea63f', '#96accd']
  },
  Cancer: {
    cool: ['#0c205b', '#212d9b', '#009cff', '#81b0ff', '#a3e6ff', '#85e9e9'],
    warm: ['#0c3b3b', '#097b77', '#17cba0', '#5df6bf', '#a5ffe7', '#b3ffc8'],
    neutral: ['#013b60', '#2b2f59', '#435c89', '#5e5f73', '#a5b2c2', '#cddfeb']
  },
  Leo: {
    cool: ['#5b204e', '#862d58', '#7c465d', '#cf1e5a', '#ff0068', '#be2736'],
    warm: ['#774526', '#c43b3b', '#ac4b2a', '#fa4d00', '#ff6a04', '#f28115'],
    neutral: ['#52351a', '#724923', '#a96236', '#c78d2f', '#d09940', '#edc98b']
  },
  Virgo: {
    cool: ['#043921', '#034d37', '#00835e', '#4bcbaa', '#4df2cc', '#a0dbbf'],
    warm: ['#0f3917', '#6d3d12', '#376b32', '#9d6216', '#5a6b19', '#e17e16'],
    neutral: ['#3b4626', '#596b3c', '#857039', '#a5a95e', '#d1ac6d', '#ddb793']
  },
  Libra: {
    cool: ['#622674', '#6d4b66', '#9b63c2', '#9683be', '#b4b0e1', '#ecc0d9'],
    warm: ['#569c7e', '#72af8e', '#ffaaa5', '#ffcbc3', '#dcedc1', '#ffe3c6'],
    neutral: ['#ecc0d9', '#7fa292', '#a6d2bb', '#f6bdb4', '#fdd8c6', '#fef0d5']
  },
  Scorpio: {
    cool: ['#191933', '#461d49', '#15456b', '#44229a', '#7648b0', '#3a89db'],
    warm: ['#730101', '#b70000', '#e2293b', '#b2301f', '#c76a50', '#c18584'],
    neutral: ['#110f0d', '#4c3860', '#662a48', '#504840', '#867a6e', '#d6d5da']
  },
  Sagittarius: {
    cool: ['#40007b', '#3830a0', '#24879d', '#7f1d80', '#ce2c82', '#ce6aac'],
    warm: ['#52201c', '#415715', '#fa7e1e', '#fe7735', '#aac265', '#edba4a'],
    neutral: ['#2c2956', '#4d234b', '#786988', '#6d76a7', '#5386a2', '#7b98b7']
  },
  Capricorn: {
    cool: ['#001b33', '#2e3958', '#267b64', '#4d90cf', '#77d6c2', '#78b895'],
    warm: ['#3e1f1c', '#2e472a', '#662f0b', '#ac6114', '#639261', '#fedca3'],
    neutral: ['#303c54', '#667f61', '#979593', '#8d7d6d', '#6b9da6', '#c4af90']
  },
  Aquarius: {
    cool: ['#293aaa', '#5f35b1', '#0768c9', '#ae4a8c', '#ad55ea', '#a09dea'],
    warm: ['#8a2a2b', '#108bff', '#ee8f21', '#f5c976', '#fffa81', '#eccbd1'],
    neutral: ['#44499a', '#4d90cf', '#78b895', '#75c3d0', '#76899f', '#bfafd3']
  },
  Pisces: {
    cool: ['#007392', '#727cd6', '#b2adfd', '#64ffd5', '#b1d6ff', '#b4fff6'],
    warm: ['#ff8080', '#ffab88', '#fcb9b0', '#ffd2c9', '#fcf0da', '#ffebeb'],
    neutral: ['#39536d', '#1ba8a0', '#9e99d1', '#8ed1d1', '#a9d8de', '#b5e8d5']
  }
};

const ASTRO_FACTS = {
  Aries: 'You are bold, ambitious, and a natural leader.',
  Taurus: 'You value comfort and beauty in all things.',
  Gemini: 'Your curiosity and wit make you adaptable.',
  Cancer: 'You are intuitive and deeply caring.',
  Leo: 'Your creativity shines brightly.',
  Virgo: 'You find harmony in order and detail.',
  Libra: 'Balance and beauty guide your choices.',
  Scorpio: "You're magnetic and passionate.",
  Sagittarius: 'Your adventurous heart inspires others.',
  Capricorn: 'You are grounded and ambitious.',
  Aquarius: 'You think differently and value authenticity.',
  Pisces: 'Your creativity and empathy define you.'
};

const ZODIAC_SYMBOLS = {
  Aries: '/assets/aries_circle.png',
  Taurus: '/assets/taurus_circle.png',
  Gemini: '/assets/gemini_circle.png',
  Cancer: '/assets/cancer_circle.png',
  Leo: '/assets/leo_circle.png',
  Virgo: '/assets/virgo_circle.png',
  Libra: '/assets/libra_circle.png',
  Scorpio: '/assets/scorpio_circle.png',
  Sagittarius: '/assets/sag_circle.png',
  Capricorn: '/assets/capricorn_circle.png',
  Aquarius: '/assets/aqua_circle.png',
  Pisces: '/assets/pisces_circle.png'
};

const DEFAULT_PALETTE = ['#8B5FBF', '#6D28D9', '#C084FC', '#495482', '#9b83d3', '#F8FAFC'];

export default function Moodboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    const fetchMoodboard = async () => {
      try {
        const res = await fetch('/api/moodboard', { credentials: 'include' });
        if (res.status === 401) {
          navigate('/login');
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          setProfile(data.user);
          setOutfits(data.outfits || []);
        }
      } catch (err) {
        console.error('Failed to load moodboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodboard();
  }, [navigate]);

  const handleMouseEnterWheel = () => {
    const rotate = () => {
      setRotation((prev) => (prev + 1) % 360);
      animRef.current = requestAnimationFrame(rotate);
    };
    animRef.current = requestAnimationFrame(rotate);
  };

  const handleMouseLeaveWheel = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setRotation(0);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Curating your editorial moodboard...</p>
      </div>
    );
  }

  const aestheticKey = (profile?.aesthetic_result || '').toLowerCase();
  const styleKey = (profile?.style_result || '').toLowerCase();
  const zodiac = profile?.zodiac_sign || 'Not set';
  const undertone = (profile?.undertone || '').toLowerCase();

  const aestheticData = AESTHETICS[aestheticKey] || AESTHETICS.boho;
  const styleData = STYLES[styleKey] || {
    name: 'Personal Style',
    colors: 'Your unique palette',
    desc: 'Your unique fashion sense.'
  };

  const astroFact = ASTRO_FACTS[zodiac] || 'Your zodiac influences your unique style expression.';
  const zodiacSymbol = ZODIAC_SYMBOLS[zodiac] || '/quizzes/assets/zodiac/default.png';

  const userPalette = PALETTES[zodiac]?.[undertone] || DEFAULT_PALETTE;
  const wheelImgPath = undertone && undertone !== 'not set'
    ? `/undertone/assets/${undertone}_wheel.png`
    : `/undertone/assets/neutral_wheel.png`;

  return (
    <div className={styles.editorialWrapper}>
      <div className={styles.editorialContainer}>
        {/* Magazine Header */}
        <header className={styles.magazineHeader}>
          <h1 className={styles.magazineTitle}>CelestiCare</h1>
          <p className={styles.magazineSubtitle}>Your Personal Style Editorial MoodBoard</p>
        </header>

        {/* Main Content Grid */}
        <div className={styles.mainContent}>
          {/* Left Panel: Aesthetic & Style */}
          <div className={styles.leftPanel}>
            {/* Aesthetic Section */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Aesthetic Signature</h2>
              <div className={styles.aestheticDisplay}>
                <div className={styles.aestheticImages}>
                  {aestheticData.assets.slice(0, 2).map((asset, idx) => (
                    <img
                      key={idx}
                      src={asset}
                      alt="Aesthetic inspiration"
                      className={styles.aestheticImage}
                      onError={(e) => { e.currentTarget.src = '/quizzes/assets/boho1.jpg'; }}
                    />
                  ))}
                </div>
                <div className={styles.aestheticInfo}>
                  <div className={styles.aestheticTag} style={{ background: aestheticData.color }}>
                    Aesthetic
                  </div>
                  <h3 className={styles.aestheticTitle}>{aestheticData.title}</h3>
                  <div className={styles.aestheticMood} style={{ color: aestheticData.color }}>
                    {aestheticData.mood}
                  </div>
                  <p className={styles.aestheticDesc}>{aestheticData.desc}</p>
                </div>
              </div>
            </div>

            {/* Style Section */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Style DNA</h2>
              <div className={styles.styleTag}>{styleData.name}</div>
              <p className={styles.aestheticDesc}>{styleData.desc}</p>
              <div style={{ marginTop: '1rem' }}>
                <strong style={{ fontSize: '0.95rem' }}>Recommended Colors:</strong>
                <div className={styles.colorPalette} style={{ marginTop: '0.5rem' }}>
                  {userPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className={styles.colorSwatch}
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Curated Outfit Collection */}
            {outfits.length > 0 && (
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Your Curated Collection</h2>
                <div className={styles.outfitGrid}>
                  {outfits.slice(0, 6).map((item, idx) => {
                    const imgSrc = typeof item === 'string' ? item : item?.src || '';
                    return (
                      <img
                        key={idx}
                        src={imgSrc}
                        alt="Fashion item"
                        className={styles.outfitItem}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Color & Zodiac */}
          <div className={styles.rightPanel}>
            {/* Color Analysis */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Color Analysis</h2>
              <p>
                <strong>Undertone: </strong>
                {profile?.undertone ? profile.undertone.toUpperCase() : 'Not set'}
              </p>

              {profile?.undertone && profile.undertone !== 'Not set' ? (
                <>
                  <div className={styles.colorWheelContainer}>
                    <img
                      src={wheelImgPath}
                      alt={`${profile.undertone} color wheel`}
                      className={styles.colorWheel}
                      style={{ transform: `rotate(${rotation}deg)` }}
                      onMouseEnter={handleMouseEnterWheel}
                      onMouseLeave={handleMouseLeaveWheel}
                      onError={(e) => { e.currentTarget.src = '/undertone/assets/neutral_wheel.png'; }}
                    />
                  </div>
                  <div className={styles.colorPalette}>
                    {userPalette.map((color, idx) => (
                      <div
                        key={idx}
                        className={styles.colorSwatch}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className={styles.placeholderText}>
                  Complete the color analysis quiz to see your personalized color wheel!
                </p>
              )}
            </div>

            {/* Celestial Influence */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Celestial Influence</h2>
              <div className={styles.zodiacDisplay}>
                <div className={styles.zodiacIcon}>
                  <img
                    src={zodiacSymbol}
                    alt={`${zodiac} symbol`}
                    className={styles.zodiacSymbol}
                    onError={(e) => { e.currentTarget.src = '/quizzes/assets/zodiac/default.png'; }}
                  />
                </div>
                <h4 style={{ fontWeight: '700', fontSize: '1.4rem' }}>{zodiac}</h4>
                <p className={styles.zodiacFact}>{astroFact}</p>
              </div>
            </div>

            {/* Your Style Story */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Your Style Story</h2>
              <div className={styles.styleStoryContent}>
                <p className={styles.styleStoryText}>
                  A unique blend of <strong>{aestheticData.title}</strong> aesthetic with{' '}
                  <strong>{styleData.name}</strong> sensibilities.{' '}
                  {zodiac !== 'Not set' && (
                    <>Your <strong>{zodiac}</strong> energy shines through in every curated piece, </>
                  )}
                  creating a signature look that's authentically you.
                </p>
                <div className={styles.styleStoryHighlights}>
                  <div className={styles.highlightItem}>
                    <span className={styles.highlightDot} style={{ background: aestheticData.color }}></span>
                    <span>{aestheticData.title}</span>
                  </div>
                  <div className={styles.highlightItem}>
                    <span
                      className={styles.highlightDot}
                      style={{ background: 'linear-gradient(135deg, #9177c0, #594082)' }}
                    ></span>
                    <span>{styleData.name}</span>
                  </div>
                  {zodiac !== 'Not set' && (
                    <div className={styles.highlightItem}>
                      <span className={styles.highlightDot} style={{ background: '#FFD700' }}></span>
                      <span>{zodiac} Energy</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refine Section */}
        <div className={styles.refineSection}>
          <div className={styles.refineCard}>
            <h2 className={styles.refineTitle}>Refine Your Style Journey</h2>
            <div className={styles.actionButtons}>
              <Link to="/quizzes/aesthetic-quiz" className={`${styles.actionBtn} ${styles.btnPrimary}`}>
                Refine Aesthetic
              </Link>
              <Link to="/quizzes/style-quiz" className={`${styles.actionBtn} ${styles.btnSecondary}`}>
                Update Style
              </Link>
              <Link to="/undertone/test" className={`${styles.actionBtn} ${styles.btnPrimary}`}>
                Color Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}