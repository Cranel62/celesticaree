import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

// ==========================================
// IMPORT YOUR LOCAL MEDIA ASSETS HERE:
// ==========================================
// Place 'zodiac_circle.png' inside 'src/assets/images/'
import zodiacCircleImg from '../../assets/images/zodiac_circle.png';

// Place 'Astral.mp3' inside 'src/assets/audio/'
//import backgroundMusicAudio from '../../assets/audio/Astral.mp3';
// import backgroundMusicAudio from '../../assets/audio/Astral.mp3';
const backgroundMusicAudio = "";

const zodiacSigns = [
  { symbol: '♈', name: 'Aries', desc: 'Bold & Dynamic - Confident, energetic styles with fiery accents' },
  { symbol: '♉', name: 'Taurus', desc: 'Luxurious & Earthy - Quality fabrics and nature-inspired tones' },
  { symbol: '♊', name: 'Gemini', desc: 'Versatile & Expressive - Mix-and-match pieces for every occasion' },
  { symbol: '♋', name: 'Cancer', desc: 'Comforting & Nostalgic - Soft textures and sentimental pieces' },
  { symbol: '♌', name: 'Leo', desc: 'Dramatic & Regal - Bold statements and attention-grabbing pieces' },
  { symbol: '♍', name: 'Virgo', desc: 'Refined & Practical - Tailored fits and functional elegance' },
  { symbol: '♎', name: 'Libra', desc: 'Harmonious & Chic - Balanced ensembles and romantic touches' },
  { symbol: '♏', name: 'Scorpio', desc: 'Intense & Mysterious - Dark hues and transformative pieces' },
  { symbol: '♐', name: 'Sagittarius', desc: 'Adventurous & Free - Bohemian styles and travel-ready outfits' },
  { symbol: '♑', name: 'Capricorn', desc: 'Classic & Ambitious - Timeless silhouettes and professional elegance' },
  { symbol: '♒', name: 'Aquarius', desc: 'Innovative & Unique - Futuristic cuts and unconventional styling' },
  { symbol: '♓', name: 'Pisces', desc: 'Dreamy & Artistic - Flowing fabrics and ethereal, romantic looks' },
];

export default function LandingPage() {
  const wheelRef = useRef(null);
  const audioRef = useRef(null);
  const starfieldRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Rotating Zodiac Wheel Animation
  useEffect(() => {
    let rafId = null;
    let lastTime = 0;
    let angle = 0;
    const ROTATIONS_PER_SECOND = 0.1;
    const degreesPerMs = (ROTATIONS_PER_SECOND * 360) / 1000;

    function step(now) {
      if (!lastTime) lastTime = now;
      const delta = now - lastTime;
      lastTime = now;
      angle = (angle + delta * degreesPerMs) % 360;

      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${angle}deg)`;
      }
      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // 2. Starfield & Shooting Stars Animations
  useEffect(() => {
    const starfield = starfieldRef.current;
    if (!starfield) return;

    const stars = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() < 0.1 ? Math.random() * 4 + 3 : Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      const baseOpacity = Math.random() * 0.8 + 0.2;
      star.style.opacity = baseOpacity;

      if (size > 3) {
        star.style.boxShadow = '0 0 8px 3px rgba(255, 255, 255, 0.9)';
      }

      starfield.appendChild(star);
      stars.push({
        element: star,
        baseOpacity,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    let starRafId = null;
    function animateStars() {
      stars.forEach(star => {
        const opacity = star.baseOpacity * (0.7 + 0.3 * Math.sin(Date.now() * star.speed / 1000));
        star.element.style.opacity = opacity;
      });
      starRafId = requestAnimationFrame(animateStars);
    }
    starRafId = requestAnimationFrame(animateStars);

    // Shooting stars
    let shootingTimeoutId = null;
    function createShootingStar() {
      if (!starfieldRef.current) return;
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      shootingStar.style.left = `${Math.random() * 100}%`;
      shootingStar.style.top = `${Math.random() * 30}%`;

      const angle = Math.random() * 30 + 15;
      const duration = Math.random() * 1500 + 800;
      const distance = Math.random() * 150 + 250;

      shootingStar.style.animation = `shootStar ${duration}ms linear forwards`;
      shootingStar.style.setProperty('--translateX', `${distance * Math.cos(angle * Math.PI / 180)}px`);
      shootingStar.style.setProperty('--translateY', `${distance * Math.sin(angle * Math.PI / 180)}px`);

      starfieldRef.current.appendChild(shootingStar);

      setTimeout(() => {
        if (shootingStar.parentNode) {
          shootingStar.parentNode.removeChild(shootingStar);
        }
      }, duration);

      const nextInterval = Math.random() * 4000 + 1000;
      shootingTimeoutId = setTimeout(createShootingStar, nextInterval);
    }

    shootingTimeoutId = setTimeout(createShootingStar, 1500);

    return () => {
      if (starRafId) cancelAnimationFrame(starRafId);
      if (shootingTimeoutId) clearTimeout(shootingTimeoutId);
      if (starfield) starfield.innerHTML = '';
    };
  }, []);

  // 3. Audio & Music Handlers
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.3;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          const handleFirstClick = () => {
            if (audioRef.current) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
            window.removeEventListener('click', handleFirstClick);
          };
          window.addEventListener('click', handleFirstClick, { once: true });
        });
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (!isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
      });
      return;
    }

    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

  return (
    <div className="landing-page-wrapper">
      {/* Background Audio */}
      <audio ref={audioRef} loop src={backgroundMusicAudio} />

      {/* Floating Music Control */}
      <div 
        className={`music-control ${isMuted || !isPlaying ? 'muted' : ''}`}
        onClick={toggleMusic}
        title="Toggle Audio"
      >
        {!isPlaying ? '▶️' : isMuted ? '🔇' : '🔈'}
      </div>

      {/* Dynamic Starfield */}
      <div className="starfield" ref={starfieldRef}></div>

      <div className="content-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-text">
            <h1>Let the stars guide your taste</h1>
            <p>
              The stylist of the stars, CelestiCare, gives you the latest fashion tips by using your zodiac sign
              and matching it to your preferred style preferences and aesthetics.
            </p>
            <a href="/get-to-know" className="hero-btn">Get Started</a>
          </div>

          <div className="hero-image">
            <img 
              ref={wheelRef} 
              src={zodiacCircleImg} 
              alt="Zodiac Wheel" 
              className="wheel" 
              draggable="false" 
            />
          </div>
        </section>

        {/* New Features Intro */}
        <div className="new-features-intro">
          <div className="container">
            <h3>⟡˙⋆ Introducing Deeper Cosmic Insights ⋆˙⟡</h3>
            <p>We've expanded our celestial offerings to provide you with more personalized guidance than ever before</p>
          </div>
        </div>

        {/* Mystic Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Discover Our New Mystic Features</h2>
            <p className="section-subtitle">Go beyond your sun sign with comprehensive astrological readings and tarot guidance</p>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-planet-ringed"></i>
                    <i className="fas fa-map-marked-alt" style={{ fontSize: '1.5rem', marginLeft: '5px' }}></i>
                  </div>
                  <h4>Complete Birth Chart</h4>
                  <p>Get your full planetary placements and houses by providing your birth time and location. We calculate your Moon sign, Rising sign, and all celestial positions for a truly personalized reading.</p>
                  <div className="feature-badge">New: Philippines Locations Only</div>
                  <div style={{ fontSize: '0.8rem', color: '#c19bfa', marginTop: '10px' }}>
                    <i className="fas fa-city"></i> City & Province Required
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-crystal-ball"></i>
                    <span className="cards-stack" style={{ marginLeft: '5px' }}>
                      <i className="fas fa-clover"></i>
                      <i className="fas fa-spade"></i>
                    </span>
                  </div>
                  <h4>Mystic Arcana Tarot</h4>
                  <p>Access all 78 cards of the tarot - Major Arcana, Cups, Wands, Swords, and Pentacles. Choose between:</p>
                  <ul style={{ color: '#e0e0ff', textAlign: 'left', marginTop: '10px', fontSize: '0.9rem', listStyle: 'none', paddingLeft: 0 }}>
                    <li><i className="fas fa-star" style={{ color: '#c19bfa', marginRight: '5px' }}></i> Single Card Reading</li>
                    <li><i className="fas fa-star" style={{ color: '#c19bfa', marginRight: '5px' }}></i> Four-Card Spread: Head, Heart, Past, Path</li>
                  </ul>
                  <div className="feature-badge">Deep Conflict Resolution</div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-brain"></i>
                    <i className="fas fa-heart" style={{ color: '#ff6b6b', marginLeft: '5px' }}></i>
                  </div>
                  <h4>Head vs. Heart Guidance</h4>
                  <p>Our four-card spread reveals the conflict between your rational thoughts and emotional desires, then consults on your possible path forward with clarity and purpose.</p>
                  <div className="feature-badge">Personalized Path Consulting</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="features-section" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="container">
            <h2 className="section-title">How CelestiCare Works</h2>
            <p className="section-subtitle">We combine astrology with fashion to help you express your true self through clothing.</p>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="small-card">
                  <div className="feature-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h4>Personalized Moodboard</h4>
                  <p>Receive a personalized magazine-style visual summary of your complete style profile and personal data.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="small-card">
                  <div className="feature-icon">
                    <i className="fas fa-palette"></i>
                  </div>
                  <h4>Color Guidance</h4>
                  <p>Discover which colors will bring you positive energy and complement your natural aura each day.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="small-card">
                  <div className="feature-icon">
                    <i className="fas fa-tshirt"></i>
                  </div>
                  <h4>Virtual Style Studio</h4>
                  <p>A virtual closet where users mix-and-match fashion items to discover their personal style through interactive dressing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Zodiacs */}
        <section className="zodiac-section">
          <div className="container">
            <h2 className="section-title">Explore Zodiac Fashion</h2>
            <p className="section-subtitle">Each sign has unique style characteristics. Discover yours!</p>

            <div className="row g-4">
              {zodiacSigns.map((zodiac) => (
                <div key={zodiac.name} className="col-md-3 col-6">
                  <div className="zodiac-card">
                    <div className="zodiac-icon">{zodiac.symbol}</div>
                    <h5>{zodiac.name}</h5>
                    <p className="zodiac-desc">{zodiac.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Transform Your Style?</h2>
              <p>Join thousands of fashion-forward individuals who use astrology to enhance their personal style and discover deeper cosmic insights.</p>
              <a href="/register" className="cta-btn">Sign In to Your Account</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 mb-4">
                <div className="footer-brand">CELESTICARE</div>
                <p className="footer-description">
                  Where astrology meets fashion. Discover your unique style through the wisdom of the stars and express your true cosmic self.
                </p>
                <div className="social-links">
                  <a href="https://www.facebook.com/" title="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="https://www.instagram.com/" title="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="https://x.com/" title="Twitter"><i className="fab fa-twitter"></i></a>
                  <a href="https://ph.pinterest.com/" title="Pinterest"><i className="fab fa-pinterest"></i></a>
                </div>
              </div>

              <div className="col-lg-3 col-md-4 mb-4">
                <div className="footer-links">
                  <h5>Quick Links</h5>
                  <a href="/">Home</a>
                  <a href="/zodiac">Zodiacs</a>
                  <a href="/forecast">Arcana</a>
                  <a href="/about">About Us</a>
                </div>
              </div>

              <div className="col-lg-4 col-md-4 mb-4">
                <div className="footer-links">
                  <h5>Newsletter</h5>
                  <p className="footer-description" style={{ marginBottom: '1rem' }}>Get daily fashion tips based on your zodiac sign.</p>
                  <div className="input-group mb-3">
                    <input type="email" className="form-control subscribe-input" placeholder="Your email address" />
                    <button className="btn subscribe-btn">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <p className="mb-0">&copy; 2026 CelestiCare. All rights reserved.</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <a href="/privacy" className="me-3">Privacy Policy</a>
                  <a href="/terms">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}