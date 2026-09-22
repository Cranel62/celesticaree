import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './AestheticResult.module.css';

const AESTHETICS = {
  academia: {
    title: "The Scholar",
    desc: "You're drawn to timeless sophistication — think books, tweed, and candlelit study sessions. You find beauty in intellect and classic detail.",
    history: "Rooted in literary charm and old-world academia, this aesthetic draws from classic literature, university libraries, and British collegiate style.",
    mood: "Intellectual • Vintage • Poised",
    bg: "/quizzes/assets/acad_bg3.jpg",
    side1: "/quizzes/assets/acad1.jpg",
    side2: "/quizzes/assets/acad3.jpg",
    color: "rgb(186, 170, 158)",
    music: "/music/acad.mp3"
  },
  boho: {
    title: "The Bohemian Dreamer",
    desc: "You embody freedom, creativity, and a love for earthy tones and textures. Every outfit tells a story — unbothered, soulful, and effortlessly chic.",
    history: "Emerging from 1960s counterculture, Bohemian style fuses artistic expression with natural fabrics and global influences.",
    mood: "Free-Spirited • Earthy • Artistic",
    bg: "/quizzes/assets/boho_bg2.jpg",
    side1: "/quizzes/assets/boho2.jpg",
    side2: "/quizzes/assets/boho1.jpg",
    color: "#e38153",
    music: "/music/boho.mp3"
  },
  coquette: {
    title: "The Coquette Muse",
    desc: "Romantic and soft, your style leans into vintage elegance — ribbons, lace, and an air of flirtatious nostalgia.",
    history: "Blending Rococo-era charm with 90s Lolita revival, the Coquette aesthetic celebrates femininity and delicate romanticism.",
    mood: "Romantic • Vintage • Playful",
    bg: "/quizzes/assets/coquette_bg.jpg",
    side1: "/quizzes/assets/coquette2.jpg",
    side2: "/quizzes/assets/coquette12.jpg",
    color: "#f5c4d4",
    music: "/music/coquette.mp3"
  },
  grunge: {
    title: "The Rebel Soul",
    desc: "You thrive in expressive chaos — distressed textures, dark tones, and a bold disregard for convention define your edge.",
    history: "Born from 90s alternative rock culture, Grunge fashion embodies rebellion, comfort, and raw individuality.",
    mood: "Edgy • Unfiltered • Rebellious",
    bg: "/quizzes/assets/grunge_bg2.jpg",
    side1: "/quizzes/assets/grunge2.jpg",
    side2: "/quizzes/assets/grunge3.jpg",
    color: "rgb(180, 176, 198)",
    music: "/music/grunge.mp3"
  },
  punk: {
    title: "The Anarchic Icon",
    desc: "You wear rebellion like armor — unapologetic, loud, and endlessly cool. Spikes, leather, and confidence are your essentials.",
    history: "Emerging from 1970s UK subcultures, punk aesthetic rejected mainstream norms through fashion, music, and activism.",
    mood: "Defiant • Raw • Bold",
    bg: "/quizzes/assets/punk_bg1.jpg",
    side1: "/quizzes/assets/punk1.jpg",
    side2: "/quizzes/assets/punk3.jpg",
    color: "rgb(255, 0, 191)",
    music: "/music/punk.mp3"
  },
  y2k: {
    title: "The Futuristic Popstar",
    desc: "You radiate playful confidence with metallics, baby tees, and digital-era nostalgia. The early 2000s live in your sparkle.",
    history: "A revival of late 90s and early 2000s cyber fashion — glossy textures, technology-inspired motifs, and glittery confidence.",
    mood: "Playful • Futuristic • Glam",
    bg: "/quizzes/assets/y2k_bg2.jpg",
    side1: "/quizzes/assets/y2k1.jpg",
    side2: "/quizzes/assets/y2k3.jpg",
    color: "#d46be3",
    music: "/music/y2k.mp3"
  },
  luxurious: {
    title: "The Luxe Visionary",
    desc: "Glitter, confidence, and high drama — your aura screams sophistication and luxury. You turn moments into red-carpet statements.",
    history: "Rooted in Old Hollywood and modern couture, Glam embraces opulence, allure, and timeless beauty.",
    mood: "Elegant • Dazzling • Confident",
    bg: "/quizzes/assets/glam_bg1.jpg",
    side1: "/quizzes/assets/glam2.jpg",
    side2: "/quizzes/assets/glam1.jpg",
    color: "rgb(250, 202, 114)",
    music: "/music/glam.mp3"
  }
};

export default function AestheticResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  
  const searchParams = new URLSearchParams(location.search);
  
  // Logic matches PHP: $_GET['aesthetic'] ?? $_SESSION['aesthetic_result'] ?? $user['aesthetic_result']
  const rawAesthetic =
    searchParams.get('aesthetic') ||
    sessionStorage.getItem('aesthetic_result') ||
    user?.aesthetic_result;

  // Validate or redirect to quiz if none exists (PHP redirect behavior)
  const aestheticKey = rawAesthetic && AESTHETICS[rawAesthetic] ? rawAesthetic : null;
  const data = aestheticKey ? AESTHETICS[aestheticKey] : AESTHETICS['boho'];

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 1. Enforce authentication & redirect if no quiz result found
  useEffect(() => {
    if (!user && !sessionStorage.getItem('user_id')) {
      navigate('/auth/login');
      return;
    }

    if (!rawAesthetic) {
      navigate('/quizzes/aesthetic-quiz');
      return;
    }

    sessionStorage.setItem('aesthetic_result', aestheticKey);

    // 2. Direct Backend Call to api_save_aesthetic.php
  // 2. Direct Backend Call to save aesthetic
    const saveToBackend = async () => {
      const currentUserId = user?.id || sessionStorage.getItem('user_id');
      if (!currentUserId || !aestheticKey) return;

      try {
        const response = await fetch('/api/aesthetic', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            user_id: currentUserId,
            aesthetic_result: aestheticKey,
          }),
        });

        if (!response.ok) {
          console.warn(`Server responded with status ${response.status}`);
          return;
        }

        const resData = await response.json();
        if (resData.success) {
          if (updateUserProfile) {
            updateUserProfile({ aesthetic_result: aestheticKey });
          }
        }
      } catch (err) {
        console.error('Failed to save aesthetic result:', err);
      }
    };

    saveToBackend();
  }, [aestheticKey, rawAesthetic, user, navigate, updateUserProfile]);

  // 3. Audio handling matching PHP behavior
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch((error) => {
          console.log('Autoplay blocked:', error);
          setIsPlaying(false);
        });
    }
  }, [aestheticKey]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.muted = false;
          setIsMuted(false);
          setIsPlaying(true);
        })
        .catch((e) => console.log('Playback error:', e));
    } else {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  if (!aestheticKey) return null;

  return (
    <div className={styles.pageWrapper} style={{ backgroundImage: `url(${data.bg})` }}>
      {/* Background Audio with OGG fallback */}
      <audio ref={audioRef} loop>
        <source src={data.music} type="audio/mpeg" />
        <source src={data.music.replace('.mp3', '.ogg')} type="audio/ogg" />
      </audio>

      {/* Music Control Button */}
      <button
        className={`${styles.musicControl} ${isMuted || !isPlaying ? styles.muted : ''}`}
        onClick={toggleMusic}
        title={!isPlaying ? 'Click to play' : isMuted ? 'Click to unmute' : 'Click to mute'}
      >
        {!isPlaying ? '▶️' : isMuted ? '🔇' : '🔈'}
      </button>

      <div className={styles.resultOverlay}>
        <img src={data.side1} alt="Aesthetic Side 1" className={`${styles.sideImage} ${styles.sideLeft}`} />
        <img src={data.side2} alt="Aesthetic Side 2" className={`${styles.sideImage} ${styles.sideRight}`} />

        <div className={styles.resultCard}>
          <h1 className={styles.title} style={{ color: data.color }}>{data.title}</h1>

          <div className={styles.sectionLabel}>About</div>
          <p className={styles.description}>{data.desc}</p>

          <div className={styles.sectionLabel}>History</div>
          <p className={styles.description}>{data.history}</p>

          <div className={styles.sectionLabel}>Mood</div>
          <p className={`${styles.description} ${styles.mood}`} style={{ color: data.color }}>
            {data.mood}
          </p>

          <div className={styles.actions}>
            <Link
              to="/dashboard"
              className={styles.btnDashboard}
              style={{ backgroundColor: data.color }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = data.color;
                e.currentTarget.style.backgroundColor = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = data.color;
              }}
            >
              Back to Dashboard
            </Link>
            <Link
              to="/quizzes/aesthetic-quiz"
              className={styles.btnDashboard}
              style={{ backgroundColor: data.color }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = data.color;
                e.currentTarget.style.backgroundColor = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = data.color;
              }}
            >
              Retake Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}