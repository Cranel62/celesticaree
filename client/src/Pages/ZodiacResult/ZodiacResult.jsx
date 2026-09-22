import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ZodiacResult.module.css';

const ZODIAC_TRAITS = {
  Aries: 'The Bold',
  Taurus: 'The Grounded',
  Gemini: 'The Curious',
  Cancer: 'The Nurturer',
  Leo: 'The Radiant',
  Virgo: 'The Perfectionist',
  Libra: 'The Harmonizer',
  Scorpio: 'The Intense',
  Sagittarius: 'The Adventurer',
  Capricorn: 'The Ambitious',
  Aquarius: 'The Visionary',
  Pisces: 'The Whimsical'
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 86400 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
}

export default function ZodiacResult() {
  const navigate = useNavigate();
  const [sign, setSign] = useState('');
  const [trait, setTrait] = useState('');

  useEffect(() => {
    const currentSign =
      sessionStorage.getItem('zodiac_sign') ||
      sessionStorage.getItem('temp_zodiac') ||
      getCookie('zodiac_sign');
    
    if (!currentSign) {
      navigate('/get-to-know');
      return;
    }

    const currentTrait =
      ZODIAC_TRAITS[currentSign] ||
      sessionStorage.getItem('zodiac_trait') ||
      getCookie('zodiac_trait') ||
      'The Unique';

    setSign(currentSign);
    setTrait(currentTrait);

    sessionStorage.setItem('zodiac_sign', currentSign);
    sessionStorage.setItem('temp_zodiac', currentSign);
    sessionStorage.setItem('zodiac_trait', currentTrait);

    setCookie('zodiac_sign', currentSign, 30);
    setCookie('temp_zodiac', currentSign, 1);
    setCookie('zodiac_trait', currentTrait, 30);
  }, [navigate]);

  if (!sign) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.resultContainer}>
        <div className={styles.resultBox}>
          <div className={styles.brandTitle}>CELESTICARE</div>
          <h2>Your Sun Sign Is</h2>
          <h1>{sign}</h1>
          <p>{trait}</p>
          <Link to="/undertone/test" className={styles.btnContinue}>
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}