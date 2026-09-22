import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Dashboard.module.css';

import warmWheelImg from '../../assets/images/warm_wheel.png';
import coolWheelImg from '../../assets/images/cool_wheel.png';
import neutralWheelImg from '../../assets/images/neutral_wheel.png';
import dashboardArtwork from '../../assets/images/dashboard.png';
import vectorArtwork from '../../assets/images/vector.png';
import zodiacCircleArtwork from '../../assets/images/zodiac_circle.png';
import fireBg from '../../assets/images/fire_bg.jpeg';
import airBg from '../../assets/images/air_bg.jpeg';
import waterBg from '../../assets/images/water_bg.jpeg';
import warmSkin from '../../assets/images/warm_skin.png';

const API_BASE = window.location.port === '5173' ? 'http://localhost:5000' : '';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const ZODIAC_DETAILS = {
  Aries: {
    personality: "Energetic, bold, confident, and adventurous.",
    element: "Fire",
    planet: "Mars",
    lucky_numbers: "1, 9, 14",
    strengths: "Courageous, passionate, determined",
    weaknesses: "Impulsive, impatient, short-tempered",
    traits: "Aries is about action and leadership, always ready to start new adventures and face challenges head-on.",
    compatibility: "Best matches with Leo and Sagittarius."
  },
  Taurus: {
    personality: "Patient, reliable, practical, and loving.",
    element: "Earth",
    planet: "Venus",
    lucky_numbers: "2, 6, 9",
    strengths: "Loyal, persistent, trustworthy",
    weaknesses: "Stubborn, possessive, resistant to change",
    traits: "Taurus values comfort and stability, enjoying the finer things in life and lasting relationships.",
    compatibility: "Best matches with Virgo and Capricorn."
  },
  Gemini: {
    personality: "Curious, adaptable, witty, and sociable.",
    element: "Air",
    planet: "Mercury",
    lucky_numbers: "3, 5, 7",
    strengths: "Intelligent, expressive, versatile",
    weaknesses: "Inconsistent, indecisive, restless",
    traits: "Gemini thrives on communication and learning, always exploring new ideas and experiences.",
    compatibility: "Best matches with Libra and Aquarius."
  },
  Cancer: {
    personality: "Emotional, caring, protective, and intuitive.",
    element: "Water",
    planet: "Moon",
    lucky_numbers: "2, 7, 11",
    strengths: "Loyal, empathetic, nurturing",
    weaknesses: "Moody, sensitive, clingy",
    traits: "Cancer values home, family, and emotional security, guided by deep feelings and compassion.",
    compatibility: "Best matches with Scorpio and Pisces."
  },
  Leo: {
    personality: "Confident, charismatic, generous, and creative.",
    element: "Fire",
    planet: "Sun",
    lucky_numbers: "1, 3, 10",
    strengths: "Ambitious, warm-hearted, loyal",
    weaknesses: "Arrogant, stubborn, attention-seeking",
    traits: "Leo loves to shine and lead, inspiring others through enthusiasm and self-expression.",
    compatibility: "Best matches with Aries and Sagittarius."
  },
  Virgo: {
    personality: "Practical, analytical, reliable, and modest.",
    element: "Earth",
    planet: "Mercury",
    lucky_numbers: "5, 14, 23",
    strengths: "Detail-oriented, hardworking, intelligent",
    weaknesses: "Overcritical, perfectionist, anxious",
    traits: "Virgo is focused on improvement, organization, and helping others in meaningful ways.",
    compatibility: "Best matches with Taurus and Capricorn."
  },
  Libra: {
    personality: "Charming, fair-minded, diplomatic, and sociable.",
    element: "Air",
    planet: "Venus",
    lucky_numbers: "6, 15, 24",
    strengths: "Cooperative, graceful, balanced",
    weaknesses: "Indecisive, people-pleasing, superficial",
    traits: "Libra values harmony and beauty, always striving to create peace and fairness in relationships.",
    compatibility: "Best matches with Gemini and Aquarius."
  },
  Scorpio: {
    personality: "Passionate, mysterious, determined, and resourceful.",
    element: "Water",
    planet: "Pluto (and Mars)",
    lucky_numbers: "8, 11, 18",
    strengths: "Loyal, brave, intuitive",
    weaknesses: "Jealous, secretive, controlling",
    traits: "Scorpio is about transformation, depth, and emotional power, often symbolizing rebirth and truth.",
    compatibility: "Best matches with Cancer and Pisces."
  },
  Sagittarius: {
    personality: "Adventurous, optimistic, honest, and free-spirited.",
    element: "Fire",
    planet: "Jupiter",
    lucky_numbers: "3, 9, 12",
    strengths: "Enthusiastic, open-minded, idealistic",
    weaknesses: "Impulsive, blunt, inconsistent",
    traits: "Sagittarius seeks knowledge and adventure, always aiming for growth and exploration.",
    compatibility: "Best matches with Aries and Leo."
  },
  Capricorn: {
    personality: "Ambitious, disciplined, responsible, and patient.",
    element: "Earth",
    planet: "Saturn",
    lucky_numbers: "4, 8, 22",
    strengths: "Practical, hardworking, dependable",
    weaknesses: "Pessimistic, rigid, workaholic",
    traits: "Capricorn strives for success and stability, valuing structure and long-term achievements.",
    compatibility: "Best matches with Taurus and Virgo."
  },
  Aquarius: {
    personality: "Innovative, original, independent, humanitarian.",
    element: "Air",
    planet: "Uranus",
    lucky_numbers: "2, 7, 11",
    strengths: "Innovative, idealistic, independent",
    weaknesses: "Unpredictable, aloof, stubborn",
    traits: "Aquarius is about innovation, individuality, and humanitarian causes, representing progressive ideas and social change.",
    compatibility: "Best matches with Gemini and Libra."
  },
  Pisces: {
    personality: "Compassionate, artistic, gentle, and empathetic.",
    element: "Water",
    planet: "Neptune",
    lucky_numbers: "3, 9, 12",
    strengths: "Imaginative, kind, intuitive",
    weaknesses: "Escapist, overly trusting, emotional",
    traits: "Pisces is deeply connected to dreams and emotions, often drawn to creativity and spirituality.",
    compatibility: "Best matches with Cancer and Scorpio."
  }
};

const AESTHETICS = {
  academia: { title: "The Scholar", color: "#271a0e", side1: dashboardArtwork },
  boho: { title: "The Bohemian Dreamer", color: "#e38153", side1: vectorArtwork },
  coquette: { title: "The Coquette Muse", color: "#f5c4d4", side1: zodiacCircleArtwork },
  grunge: { title: "The Rebel Soul", color: "#a1a1a1", side1: warmSkin },
  punk: { title: "The Anarchic Icon", color: "#ff0000", side1: fireBg },
  y2k: { title: "The Futuristic Popstar", color: "#d46be3", side1: airBg },
  luxurious: { title: "The Luxe Visionary", color: "#c93939", side1: waterBg }
};

const STYLES = {
  minimalist: { name: 'Minimalist Elegance', color: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', textColor: '#374151' },
  businesswear: { name: 'Professional Businesswear', color: 'linear-gradient(135deg, #1e3a8a, #3730a3)', textColor: '#ffffff' },
  elegant: { name: 'Classic Elegance', color: 'linear-gradient(135deg, #7e22ce, #c084fc)', textColor: '#ffffff' },
  creative: { name: 'Creative Expression', color: 'linear-gradient(135deg, #ea580c, #f59e0b)', textColor: '#ffffff' },
  soft: { name: 'Soft Elegance', color: 'linear-gradient(135deg, #f9a8d4, #f472b6)', textColor: '#ffffff' },
  rough: { name: 'Rough Edge', color: 'linear-gradient(135deg, #4b5563, #6b7280)', textColor: '#ffffff' },
  streetwear: { name: 'Urban Streetwear', color: 'linear-gradient(135deg, #000000, #374151)', textColor: '#ffffff' }
};

const COLOR_PALETTES = {
  Warm: ["#E69A5B", "#F5C16C", "#D76A03", "#C25B02", "#FFD27F"],
  Cool: ["#5B7BE6", "#A3C1F7", "#7089E3", "#4059C2", "#9EB8FF"],
  Neutral: ["#D7BFAE", "#C1B3A4", "#A8988B", "#8B7C6F", "#BFA98B"]
};

function getZodiacSign(month, day) {
  const zodiacs = [
    { sign: "Capricorn", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", start: [2, 19], end: [3, 20] },
    { sign: "Aries", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", start: [6, 21], end: [7, 22] },
    { sign: "Leo", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", start: [8, 23], end: [9, 22] },
    { sign: "Libra", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", start: [11, 22], end: [12, 21] }
  ];
  for (let z of zodiacs) {
    const [startMonth, startDay] = z.start;
    const [endMonth, endDay] = z.end;
    if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
      return z.sign;
    }
  }
  return "Capricorn";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, fetchUserProfile, updateUserProfile, deleteUserProfile } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ text: '', type: '' });

  const [editForm, setEditForm] = useState({
    name: '',
    gender: '',
    birthdate: '',
    zodiac_sign: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [forceNewPass, setForceNewPass] = useState('');
  const [forceConfirmPass, setForceConfirmPass] = useState('');
  const [showForcePass, setShowForcePass] = useState(false);
  const [forceStrength, setForceStrength] = useState({ percent: 0, label: 'Password strength', color: 'bg-secondary' });

  const [outfitItems, setOutfitItems] = useState([]);

  // Synchronize onboarding session inputs to the active user account
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchUserProfile();

    const syncPendingUserData = async () => {
      if (!user) return;
      const effectiveUserId = user.id || user.sql_id;

      // Check if session contains freshly input guest attributes
      const localName = sessionStorage.getItem('name') || getCookie('name');
      const localBirthdate = sessionStorage.getItem('birthdate') || getCookie('birthdate');
      const localGender = sessionStorage.getItem('gender') || getCookie('gender');
      const localZodiac = sessionStorage.getItem('zodiac_sign') || sessionStorage.getItem('temp_zodiac') || getCookie('zodiac_sign');
      const localUndertone = sessionStorage.getItem('undertone') || sessionStorage.getItem('temp_undertone') || getCookie('undertone');
      const localSeason = sessionStorage.getItem('season') || sessionStorage.getItem('temp_season') || getCookie('season');

      const needsProfileSync = (!user.name && localName) || (!user.birthdate && localBirthdate) || (!user.gender && localGender) || (!user.zodiac_sign && localZodiac);
      const needsUndertoneSync = (!user.undertone && localUndertone) || (!user.season && localSeason);

      if (needsProfileSync) {
        try {
          await fetch(`${API_BASE}/api/user/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: effectiveUserId,
              name: user.name || localName,
              birthdate: user.birthdate || localBirthdate,
              gender: user.gender || localGender,
              zodiac_sign: user.zodiac_sign || localZodiac
            })
          });
        } catch (err) {
          console.error("Profile sync error:", err);
        }
      }

      if (needsUndertoneSync) {
        try {
          await fetch(`${API_BASE}/api/undertone/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              user_id: effectiveUserId,
              undertone: user.undertone || localUndertone,
              zodiac: user.zodiac_sign || localZodiac,
              season: user.season || localSeason
            })
          });
        } catch (err) {
          console.error("Undertone sync error:", err);
        }
      }
    };

    syncPendingUserData();

    if (user) {
      setEditForm(prev => ({
        ...prev,
        name: user.name || sessionStorage.getItem('name') || '',
        gender: user.gender || sessionStorage.getItem('gender') || '',
        birthdate: user.birthdate || sessionStorage.getItem('birthdate') || '',
        zodiac_sign: user.zodiac_sign || sessionStorage.getItem('zodiac_sign') || ''
      }));

      if (sessionStorage.getItem('force_password_change') === 'true') {
        setShowForceModal(true);
      }
    }

    const fetchOutfits = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user/outfits`, { credentials: 'include' });
        const data = await res.json();
        if (data && data.outfits) {
          setOutfitItems(data.outfits);
        }
      } catch (err) {
        console.error("Outfit fetch error:", err);
      }
    };

    fetchOutfits();
  }, [loading, isAuthenticated, navigate]);

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ text: message, type });
    setTimeout(() => setAlertInfo({ text: '', type: '' }), 5000);
  };

  const handleBirthdateChange = (e) => {
    const bdate = e.target.value;
    let computedSign = editForm.zodiac_sign;
    if (bdate) {
      const d = new Date(bdate);
      if (!isNaN(d)) {
        computedSign = getZodiacSign(d.getMonth() + 1, d.getDate());
      }
    }
    setEditForm(prev => ({ ...prev, birthdate: bdate, zodiac_sign: computedSign }));
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();

    const { current_password, new_password, confirm_password } = editForm;
    if (current_password || new_password || confirm_password) {
      if (!current_password) {
        showAlert('Current password is required to change password', 'error');
        return;
      }
      if (!new_password) {
        showAlert('New password is required', 'error');
        return;
      }
      if (new_password.length < 6) {
        showAlert('New password must be at least 6 characters long', 'error');
        return;
      }
      if (new_password !== confirm_password) {
        showAlert('New passwords do not match', 'error');
        return;
      }
    }

    try {
      const result = await updateUserProfile(editForm);
      if (result.success) {
        showAlert(result.message || 'Profile updated successfully!', 'success');
        setEditForm(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }));
        setShowEditModal(false);
      } else {
        showAlert(result.message || 'Failed to update profile.', 'error');
      }
    } catch {
      showAlert('Network error while saving profile.', 'error');
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your profile? This permanently removes your account across all databases.');
    if (!confirmed) return;

    try {
      const result = await deleteUserProfile();
      if (result.success) {
        navigate('/');
      } else {
        showAlert(result.message || 'Failed to delete account.', 'error');
      }
    } catch {
      showAlert('Network error while deleting account.', 'error');
    }
  };

  const handleForcePasswordChange = (val) => {
    setForceNewPass(val);
    let s = 0;
    if (val.length >= 6) s += 25;
    if (/[A-Z]/.test(val)) s += 25;
    if (/[a-z]/.test(val)) s += 25;
    if (/[0-9]/.test(val)) s += 25;

    let label = 'Very weak';
    let color = 'bg-danger';
    if (s >= 75) { label = 'Strong'; color = 'bg-success'; }
    else if (s >= 50) { label = 'Good'; color = 'bg-info'; }
    else if (s >= 25) { label = 'Weak'; color = 'bg-warning'; }

    setForceStrength({ percent: s, label, color });
  };

  const handleForcePasswordSubmit = async () => {
    if (forceNewPass.length < 6) {
      showAlert('Password must be at least 6 characters.', 'error');
      return;
    }
    if (forceNewPass !== forceConfirmPass) {
      showAlert('Passwords do not match.', 'error');
      return;
    }
    if (forceNewPass === 'CelestiCare123!') {
      showAlert('New password cannot be the same as the default password.', 'error');
      return;
    }

    try {
      const result = await updateUserProfile({
        current_password: 'CelestiCare123!',
        new_password: forceNewPass,
        confirm_password: forceConfirmPass,
        forced_change: true
      });
      if (result.success) {
        sessionStorage.removeItem('force_password_change');
        showAlert('Password changed successfully! You can now access the dashboard.', 'success');
        setShowForceModal(false);
      } else {
        showAlert(result.message || 'Error updating password', 'error');
      }
    } catch {
      showAlert('Network error. Please try again.', 'error');
    }
  };

  if (loading || !user) return null;

  // Resolve user values with complete fallback cascades
  const resolvedName = user.name || sessionStorage.getItem('name') || getCookie('name') || 'Not set';
  const resolvedBirthdate = user.birthdate || sessionStorage.getItem('birthdate') || getCookie('birthdate') || 'Not set';
  const resolvedGender = user.gender || sessionStorage.getItem('gender') || getCookie('gender') || 'Not set';
  const currentZodiac = user.zodiac_sign || sessionStorage.getItem('temp_zodiac') || sessionStorage.getItem('zodiac_sign') || getCookie('zodiac_sign') || 'Not set';

  const rawUndertone = user.undertone || sessionStorage.getItem('temp_undertone') || sessionStorage.getItem('undertone') || getCookie('undertone');
  const currentUndertone = rawUndertone
    ? String(rawUndertone).trim().charAt(0).toUpperCase() + String(rawUndertone).trim().slice(1).toLowerCase()
    : 'Not set';

  const zodiacData = ZODIAC_DETAILS[currentZodiac] || {
    personality: "Complete your zodiac profile to unlock your astro details!",
    element: "Not set",
    planet: "Not set",
    lucky_numbers: "Not set",
    strengths: "Not set",
    weaknesses: "Not set",
    traits: "Complete your zodiac profile to unlock your astro details!",
    compatibility: "Not set"
  };

  const storedAestheticResult = user.aesthetic_result || sessionStorage.getItem('temp_aesthetic_result') || sessionStorage.getItem('aesthetic_result');
  const storedStyleResult = user.style_result || sessionStorage.getItem('temp_style_result') || sessionStorage.getItem('style_result');

  const aestheticKey = storedAestheticResult ? String(storedAestheticResult).toLowerCase() : undefined;
  const aestheticData = aestheticKey ? AESTHETICS[aestheticKey] : undefined;

  const styleKey = storedStyleResult ? String(storedStyleResult).toLowerCase() : undefined;
  const styleData = styleKey ? STYLES[styleKey] : undefined;

  return (
    <div className={styles.dashboardPage}>
      {alertInfo.text && (
        <div
          className={`${styles.alertCustom} ${alertInfo.type === 'success' ? 'alert alert-success' : 'alert alert-danger'}`}
          style={{ color: alertInfo.type === 'success' ? '#155724' : '#721c24' }}
        >
          {alertInfo.text}
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.mainCard}>
          {/* Header Row */}
          <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
            <div>
              <h2 className={styles.headerTitle}>
                The Universe Welcomes your presence, {user.username}!
              </h2>
              <p className={styles.headerSubtitle}>
                This is your profile dashboard where your zodiac style journey begins.
              </p>
            </div>
            <div className="d-flex flex-column align-items-end gap-2">
              <button className={styles.btnEditProfile} onClick={() => setShowEditModal(true)}>
                <i className="fas fa-edit me-2"></i> Edit Profile
              </button>
              
              {!user.security_setup_complete && (
                <Link to="/auth/security-setup" className={styles.btnSecureAccount}>
                  <i className="fas fa-shield-alt me-2"></i> Secure Account
                  <span className={styles.secureBadge}>!</span>
                </Link>
              )}
            </div>
          </div>

          {/* 6 Grid Panels */}
          <div className={styles.gridContainer}>
            {/* 1. Profile Section */}
            <div className={styles.profileSection}>
              <div className={styles.sectionTitle}>Profile</div>
              <div className={styles.profileInfo}>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Name:</span>
                  <span className={styles.profileValue}>{resolvedName}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Username:</span>
                  <span className={styles.profileValue}>{user.username}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Email:</span>
                  <span className={styles.profileValue}>{user.email}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Gender:</span>
                  <span className={styles.profileValue}>{resolvedGender}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Birthdate:</span>
                  <span className={styles.profileValue}>{resolvedBirthdate}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Zodiac:</span>
                  <span className={styles.profileValue}>{currentZodiac}</span>
                </div>
              </div>
            </div>

            {/* 2. Astro Insights Section */}
            <div className={styles.astroSection}>
              <div>
                <div className={styles.sectionTitle}>Astro Insights</div>
                <div className={styles.zodiacHeader}>
                  <div className={styles.zodiacName}>Your Zodiac Sign: {currentZodiac}</div>
                </div>
                <div className={styles.zodiacDetails}>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Personality:</span> <span className={styles.zodiacValue}>{zodiacData.personality}</span></div>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Element:</span> <span className={styles.zodiacValue}>{zodiacData.element}</span></div>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Ruling Planet:</span> <span className={styles.zodiacValue}>{zodiacData.planet}</span></div>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Lucky Numbers:</span> <span className={styles.zodiacValue}>{zodiacData.lucky_numbers}</span></div>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Strengths:</span> <span className={styles.zodiacValue}>{zodiacData.strengths}</span></div>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Weaknesses:</span> <span className={styles.zodiacValue}>{zodiacData.weaknesses}</span></div>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Traits:</span> <span className={styles.zodiacValue}>{zodiacData.traits}</span></div>
                  <div className={styles.zodiacDetailItem}><span className={styles.zodiacLabel}>Compatibility:</span> <span className={styles.zodiacValue}>{zodiacData.compatibility}</span></div>
                </div>
              </div>

              <div className="text-center mt-3">
                {resolvedBirthdate && resolvedBirthdate !== 'Not set' ? (
                  <Link to="/forecast" className={styles.astroGlowBtn}>VIEW FULL CHART</Link>
                ) : (
                  <>
                    <button className={styles.astroGlowBtn} disabled>VIEW FULL CHART</button>
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                      <i className="fas fa-info-circle me-1"></i> Set your birthdate in Edit Profile to access astro insights
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 3. Color Analysis Section */}
            <div className={styles.colorSection}>
              <div className={styles.sectionTitle}>Color Analysis</div>
              {currentUndertone !== 'Not set' ? (
                <div className={styles.colorContent}>
                  <p className="mb-1"><strong>Zodiac:</strong> {currentZodiac}</p>
                  <p className="mb-2"><strong>Undertone:</strong> {currentUndertone}</p>
                  <img
                    src={
                      currentUndertone === 'Warm' ? warmWheelImg :
                      currentUndertone === 'Cool' ? coolWheelImg :
                      neutralWheelImg
                    }
                    alt={`${currentUndertone} wheel`}
                    className={styles.colorWheel}
                    onError={(e) => { e.target.src = neutralWheelImg; }}
                  />
                  <div className="mb-3">
                    {COLOR_PALETTES[currentUndertone]?.map((c, i) => (
                      <div key={i} className={styles.colorSwatch} style={{ backgroundColor: c }}></div>
                    ))}
                  </div>
                  <Link to="/undertone/result" className={styles.btnStyle}>View Full Analysis</Link>
                </div>
              ) : (
                <div className="text-center py-4 my-auto">
                  <p className="text-muted mb-3">Complete color analysis to see your personal color palette</p>
                  <Link to="/get-to-know" className={styles.btnStyle}>Let's Go!</Link>
                </div>
              )}
            </div>

            {/* 4. Aesthetics Section */}
            <div className={styles.aestheticSection}>
              <div className={styles.sectionTitle}>Aesthetics</div>
              {aestheticData ? (
                <div className="text-center">
                  <div className={styles.enhancedBadge} style={{ background: aestheticData.color, color: '#fff' }}>
                    Your Aesthetic: {aestheticData.title}
                  </div>
                  <img src={aestheticData.side1} alt={aestheticKey} className={styles.enhancedAestheticImage} />
                  <Link to="/quizzes/aesthetic-result" className={styles.btnStyle}>View Result</Link>
                </div>
              ) : (
                <div className="text-center py-4 my-auto">
                  <p>Want to know your Aesthetic?</p>
                  <Link to="/quizzes/aesthetic-welcome" className={styles.btnStyle}>Let's Go!</Link>
                </div>
              )}
            </div>

            {/* 5. Style Section */}
            <div className={styles.outfitSection}>
              <div className={styles.sectionTitle}>Your Style</div>
              {styleData ? (
                <div className="text-center">
                  <div className={styles.enhancedBadge} style={{ background: styleData.color, color: styleData.textColor }}>
                    {styleData.name}
                  </div>
                  {outfitItems.length > 0 && (
                    <div className={styles.enhancedOutfitPreview}>
                      {outfitItems.slice(0, 3).map((it, idx) => (
                        <div key={idx} className={styles.enhancedClothingItem}>
                          <img src={it.src} alt={it.category || 'Item'} className={styles.enhancedClothingImg} />
                        </div>
                      ))}
                    </div>
                  )}
                  {outfitItems.length > 3 && (
                    <span className={styles.moreBadge}>+{outfitItems.length - 3} more items</span>
                  )}
                  <Link to="/quizzes/style-result" className={styles.btnStyle}>View Full Analysis</Link>
                </div>
              ) : (
                <div className="text-center py-4 my-auto">
                  <p>Want to know your Style?</p>
                  <Link to="/quizzes/style-quiz" className={styles.btnStyle}>Let's Go!</Link>
                </div>
              )}
            </div>

            {/* 6. Moodboard Section */}
            <div className={styles.moodboardSection}>
              <div className={styles.sectionTitle}>Moodboard</div>
              {aestheticData && styleData ? (
                <div className={styles.moodboardComplete}>
                  <div style={{ fontSize: '2.8rem' }}>🎨</div>
                  <h4 style={{ fontWeight: 700, margin: '8px 0' }}>Your Moodboard is Ready!</h4>
                  <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Explore your personalized style visualization</p>
                  <Link to="/moodboard/result" className={styles.btnStyle} style={{ background: '#fff', color: '#8B5FBF' }}>
                    View Moodboard
                  </Link>
                </div>
              ) : (
                <div className={styles.moodboardIncomplete}>
                  <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>🎨</div>
                  <h5 style={{ fontWeight: 600, color: '#6c757d' }}>Moodboard</h5>
                  <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>Complete your style journey to unlock</p>
                  <div className="d-flex flex-column gap-2 mt-2">
                    {!aestheticData && <Link to="/quizzes/aesthetic-welcome" className={styles.btnStyle}>Start Aesthetic Quiz</Link>}
                    {!styleData && <Link to="/quizzes/style-quiz" className={styles.btnStyle}>Start Style Quiz</Link>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>Edit Profile</h5>
              <button className={styles.closeModalBtn} onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditProfileSubmit}>
              <h6 style={{ color: '#8c77c5', marginBottom: '12px' }}><i className="fas fa-user me-2"></i> Basic Information</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#cfcfcf' }}>Full Name</label>
                  <input
                    type="text"
                    className={styles.formControl}
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#cfcfcf' }}>Gender</label>
                  <select
                    className={styles.formControl}
                    value={editForm.gender}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Select Gender</option>
                    <option value="Masculine">Masculine</option>
                    <option value="Feminine">Feminine</option>
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label" style={{ color: '#cfcfcf' }}>Date of Birth</label>
                  <input
                    type="date"
                    className={styles.formControl}
                    value={editForm.birthdate}
                    onChange={handleBirthdateChange}
                  />
                </div>
              </div>

              <h6 style={{ color: '#8c77c5', margin: '20px 0 10px' }}><i className="fas fa-lock me-2"></i> Change Password</h6>
              <small className="d-block mb-3" style={{ color: '#cfcfcf' }}>Leave password fields blank if you don't wish to change your password.</small>

              <div className="mb-3">
                <input
                  type="password"
                  className={styles.formControl}
                  placeholder="Current Password"
                  value={editForm.current_password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, current_password: e.target.value }))}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="password"
                    className={styles.formControl}
                    placeholder="New Password (min 6 chars)"
                    value={editForm.new_password}
                    onChange={(e) => setEditForm(prev => ({ ...prev, new_password: e.target.value }))}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <input
                    type="password"
                    className={styles.formControl}
                    placeholder="Confirm New Password"
                    value={editForm.confirm_password}
                    onChange={(e) => setEditForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <button type="submit" className={styles.btnSave}>
                  <i className="fas fa-save me-2"></i> Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  style={{ borderRadius: '25px', padding: '10px 20px', fontWeight: 600 }}
                  onClick={handleDeleteProfile}
                >
                  <i className="fas fa-trash-alt me-2"></i> Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORCE PASSWORD CHANGE MODAL */}
      {showForceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.forceModalContent}>
            <div className="alert alert-warning d-flex align-items-center mb-4" style={{ background: '#fff3cd', color: '#856404' }}>
              <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
              <div>
                <h5 className="mb-1" style={{ color: '#856404' }}>Security Alert - Password Change Required</h5>
                <p className="mb-0" style={{ color: '#856404' }}>For security reasons, you must change your default password before accessing the dashboard.</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Current Password</label>
              <input type="text" className={styles.formControl} value="CelestiCare123!" readOnly style={{ fontFamily: 'monospace' }} />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-white">New Password</label>
                <div className="position-relative">
                  <input
                    type={showForcePass ? 'text' : 'password'}
                    className={styles.formControl}
                    placeholder="Enter new password"
                    value={forceNewPass}
                    onChange={(e) => handleForcePasswordChange(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForcePass(!showForcePass)}
                    style={{ position: 'absolute', right: '15px', top: '25%', background: 'none', border: 'none', color: '#aaa' }}
                  >
                    <i className={showForcePass ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>
                  </button>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-white">Confirm New Password</label>
                <input
                  type="password"
                  className={styles.formControl}
                  placeholder="Confirm new password"
                  value={forceConfirmPass}
                  onChange={(e) => setForceConfirmPass(e.target.value)}
                />
              </div>
            </div>

            <div className="progress mb-2" style={{ height: '8px', background: '#4b4b4b' }}>
              <div className={`progress-bar ${forceStrength.color}`} style={{ width: `${forceStrength.percent}%` }}></div>
            </div>
            <small style={{ color: '#cfcfcf' }}>{forceStrength.label}</small>

            <button
              type="button"
              className="btn btn-success w-100 mt-4"
              style={{ borderRadius: '30px', padding: '12px' }}
              onClick={handleForcePasswordSubmit}
            >
              <i className="fas fa-key me-2"></i> Change Password Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}