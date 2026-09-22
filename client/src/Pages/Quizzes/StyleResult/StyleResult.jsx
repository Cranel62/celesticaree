import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './StyleResult.module.css';

const STYLE_INFO = {
  minimalist: {
    name: 'Minimalist Elegance',
    description: 'Clean, simple, and timeless pieces. Less is more and comfort meets elegance.',
    tips: 'Focus on neutral colors and classic cuts. Keep accessories minimal.',
    colors: 'White, black, beige, grey',
    occasions: 'Everyday, casual, office'
  },
  businesswear: {
    name: 'Professional Businesswear',
    description: 'Polished, professional, and structured looks perfect for work and meetings.',
    tips: 'Stick to tailored pieces. Use subtle patterns.',
    colors: 'Navy, black, grey, white',
    occasions: 'Work, meetings, interviews'
  },
  elegant: {
    name: 'Classic Elegance',
    description: 'Sophisticated, classy, and luxurious styles with refined silhouettes.',
    tips: 'Add statement accessories and elegant shoes.',
    colors: 'Pastels, jewel tones, black, white',
    occasions: 'Formal events, parties, dinners'
  },
  creative: {
    name: 'Creative Expression',
    description: 'Bold, artistic, and expressive looks that show your personality.',
    tips: 'Mix textures, patterns, and colors. Be fearless.',
    colors: 'Bright, contrasting, eclectic',
    occasions: 'Art events, casual outings, fashion-forward settings'
  },
  soft: {
    name: 'Soft Elegance',
    description: 'Gentle, pastel, and cozy pieces that create a soft, approachable vibe.',
    tips: 'Layer soft fabrics. Stick to calming colors.',
    colors: 'Pastels, cream, light pink, baby blue',
    occasions: 'Casual outings, coffee dates, indoor events'
  },
  rough: {
    name: 'Rough Edge',
    description: 'Edgy, casual, and street-inspired styles that stand out with attitude.',
    tips: 'Use denim, leather, and layered streetwear.',
    colors: 'Black, grey, earthy tones',
    occasions: 'Street, casual outings, concerts'
  },
  streetwear: {
    name: 'Urban Streetwear',
    description: 'Urban, trendy, and casual styles that combine comfort with flair.',
    tips: 'Layer hoodies, jackets, and sneakers. Use bold logos.',
    colors: 'Black, white, bold bright accents',
    occasions: 'Casual hangouts, street style, city walks'
  }
};

function createItemLayout(items = []) {
  const count = items.length;
  if (!count) return [];

  const gridPositions = [
    { x: -0.32, y: -0.32, scale: 0.85, rotation: -5, zIndex: 20 },
    { x: 0,     y: -0.35, scale: 0.85, rotation: 0,  zIndex: 20 },
    { x: 0.32,  y: -0.32, scale: 0.85, rotation: 5,  zIndex: 20 },
    { x: -0.35, y: 0,     scale: 0.9,  rotation: -7, zIndex: 25 },
    { x: 0,     y: 0,     scale: 1.0,  rotation: 0,  zIndex: 30 },
    { x: 0.35,  y: 0,     scale: 0.9,  rotation: 7,  zIndex: 25 },
    { x: -0.32, y: 0.32,  scale: 0.85, rotation: -5, zIndex: 20 },
    { x: 0,     y: 0.35,  scale: 0.85, rotation: 0,  zIndex: 20 },
    { x: 0.32,  y: 0.32,  scale: 0.85, rotation: 5,  zIndex: 20 }
  ];

  if (count <= 2) {
    return items.map((item, i) => ({
      item,
      x: (i - 0.5) * 0.45,
      y: 0,
      scale: 0.95,
      rotation: i === 0 ? -4 : 4,
      zIndex: 30 - i
    }));
  }

  if (count <= 4) {
    const positions = [
      { x: -0.25, y: -0.25, scale: 0.9, rotation: -4 },
      { x: 0.25,  y: -0.25, scale: 0.9, rotation: 4 },
      { x: -0.25, y: 0.25,  scale: 0.9, rotation: 3 },
      { x: 0.25,  y: 0.25,  scale: 0.9, rotation: -3 }
    ];
    return items.map((item, i) => ({
      item,
      ...positions[i],
      zIndex: 25 - i
    }));
  }

  const layout = [];
  for (let i = 0; i < Math.min(count, gridPositions.length); i++) {
    layout.push({
      item: items[i],
      x: gridPositions[i].x,
      y: gridPositions[i].y,
      scale: gridPositions[i].scale,
      rotation: gridPositions[i].rotation,
      zIndex: gridPositions[i].zIndex - Math.floor(i / 3)
    });
  }

  return layout;
}

export default function StyleResult() {
  const location = useLocation();
  const { user, updateUserProfile } = useAuth();
  const searchParams = new URLSearchParams(location.search);

  const styleParam =
    searchParams.get('style') ||
    sessionStorage.getItem('temp_style_result') ||
    user?.style_result ||
    'creative';

  const [outfitItems, setOutfitItems] = useState([]);
  const info = STYLE_INFO[styleParam] || STYLE_INFO.minimalist;
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    let itemsFound = false;

    // 1. Recover outfit from local storage or cached session
    const rawOutfit = sessionStorage.getItem('temp_outfit');
    if (rawOutfit) {
      try {
        const parsed = JSON.parse(rawOutfit);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOutfitItems(parsed);
          itemsFound = true;
        }
      } catch (err) {
        console.error("Invalid cached outfit:", err);
      }
    }

    // 2. Fetch from backend if session storage is empty
    const apiBase = 'http://localhost:5000';
    if (!itemsFound) {
      fetch(`${apiBase}/api/user/outfits`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.outfits) && data.outfits.length > 0) {
            setOutfitItems(data.outfits);
            sessionStorage.setItem('temp_outfit', JSON.stringify(data.outfits));
          }
        })
        .catch(err => console.warn('Could not sync remote outfit:', err));
    }

    sessionStorage.setItem('temp_style_result', styleParam);

    // 3. Prevent infinite loop: Only sync once per page load
    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;

      fetch(`${apiBase}/api/user/style-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ style: styleParam })
      }).catch(err => console.warn('Failed style sync:', err));

      if (updateUserProfile && user && user.style_result !== styleParam) {
        updateUserProfile({ style_result: styleParam });
      }
    }
  }, [styleParam]); // Removed 'user' and 'updateUserProfile' to break loop

  const itemLayout = createItemLayout(outfitItems);

  // Normalizes image URLs and falls back cleanly
  const resolveImageSrc = (item) => {
    let src = '';
    if (typeof item === 'string') src = item;
    else src = item?.src || item?.image || item?.url || item?.clothingSrc || '';

    if (!src) return '';
    // Ensure absolute path from domain root for public folder assets
    if (!src.startsWith('http') && !src.startsWith('/')) {
      src = '/' + src;
    }
    return src;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.styleResultContainer}>
        {/* Left Side - 3x3 Dynamic Fashion Grid */}
        <section className={styles.fashionDisplay}>
          <div className={styles.displayWrapper}>
            <div className={styles.itemsContainer}>
              {itemLayout.length > 0 ? (
                itemLayout.map((data, index) => {
                  const imageSrc = resolveImageSrc(data.item);
                  if (!imageSrc) return null;

                  return (
                    <img
                      key={index}
                      src={imageSrc}
                      className={styles.styleItem}
                      style={{
                        transform: `translate(calc(-50% + ${data.x * 100}%), calc(-50% + ${data.y * 100}%)) scale(${data.scale}) rotate(${data.rotation}deg)`,
                        zIndex: data.zIndex,
                        animationDelay: `${index * 0.1}s`
                      }}
                      onError={(e) => {
                        // Fallback placeholder if file path is missing
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      alt="Fashion Item"
                    />
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <p>Curated style pieces synced to your profile.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side - Analysis and Details */}
        <section className={styles.styleInfo}>
          <div className={styles.styleBadge}>Style Analysis</div>
          <h1 className={styles.styleTitle}>{info.name}</h1>
          <p className={styles.styleDescription}>{info.description}</p>

          <div className={styles.infoCard}>
            <strong>Style Tips</strong>
            <p>{info.tips}</p>
          </div>

          <div className={styles.infoCard}>
            <strong>Color Palette</strong>
            <p>{info.colors}</p>
          </div>

          <div className={styles.infoCard}>
            <strong>Perfect For</strong>
            <p>{info.occasions}</p>
          </div>

          <div className={styles.infoCard}>
            <strong>Outfit Details</strong>
            <p>{outfitItems.length} carefully curated pieces</p>
          </div>

          <div className={styles.actionButtons}>
            <Link to="/dashboard" className={`${styles.actionBtn} ${styles.btnPrimary}`}>
              Dashboard
            </Link>
            <Link to="/moodboard/result" className={`${styles.actionBtn} ${styles.btnSecondary}`}>
              Moodboard
            </Link>
            <Link to="/quizzes/style-quiz" className={`${styles.actionBtn} ${styles.btnSuccess}`}>
              Try Again
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}