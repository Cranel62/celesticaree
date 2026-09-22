import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logoutUser();
    navigate('/'); // Redirects directly to Landing Page
  };

  return (
    <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
      <div className="container-fluid">
        <Link to="/" className={`navbar-brand ${styles.navbarBrand}`} onClick={closeMenu}>
<Link to="/" className={`navbar-brand ${styles.navbarBrand}`} onClick={closeMenu}>
  <span className={styles.customCImage} aria-label="C" />
  <span className={styles.brandText}>ELESTICARE</span>
</Link>
        </Link>

        <button
          className={`navbar-toggler ${styles.navbarToggler}`}
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className={styles.navbarTogglerIcon}></span>
        </button>

        <div className={`navbar-collapse justify-content-end ${styles.navbarCollapse} ${isOpen ? styles.show : ''}`}>
          <ul className={`navbar-nav ${styles.navbarNav}`}>
            {isAuthenticated ? (
              <>
                <li className={`nav-item ${styles.navItem}`}>
                  <Link to="/dashboard" className={`nav-link ${styles.navLink}`} onClick={closeMenu}>
                    <i className={`fas fa-th-large ${styles.navFaIcon}`}></i>
                    <span>User Dashboard</span>
                  </Link>
                </li>

                <li className={`nav-item ${styles.navItem}`}>
                  <Link to="/zodiac" className={`nav-link ${styles.navLink}`} onClick={closeMenu}>
                    <i className={`fas fa-star-and-crescent ${styles.navFaIcon}`}></i>
                    <span>AstroView</span>
                  </Link>
                </li>

                <li className={`nav-item ${styles.navItem}`}>
                  <Link to="/forecast" className={`nav-link ${styles.navLink}`} onClick={closeMenu}>
                    <div className={styles.mysticIcon}>
                      <div className={styles.spiritBall}></div>
                      <div className={`${styles.tarotCard} ${styles.cardTop}`}></div>
                      <div className={`${styles.tarotCard} ${styles.cardRight}`}></div>
                      <div className={`${styles.tarotCard} ${styles.cardBottom}`}></div>
                      <div className={`${styles.tarotCard} ${styles.cardLeft}`}></div>
                    </div>
                    <span>Mystic Arcana</span>
                  </Link>
                </li>

                <li className={`nav-item ${styles.navItem}`}>
                  <Link to="/about" className={`nav-link ${styles.navLink}`} onClick={closeMenu}>
                    <i className={`fas fa-info-circle ${styles.navFaIcon}`}></i>
                    <span>About Us</span>
                  </Link>
                </li>

                <li className={`nav-item ${styles.navItem}`}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`nav-link ${styles.navLink} ${styles.textDanger}`}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <i className={`fas fa-sign-out-alt ${styles.navFaIcon}`}></i>
                    <span>Logout ({user?.username || 'User'})</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className={`nav-item ${styles.navItem}`}>
                  <Link to="/" className={`nav-link ${styles.navLink}`} onClick={closeMenu}>
                    <i className={`fas fa-home ${styles.navFaIcon}`}></i>
                    <span>Home</span>
                  </Link>
                </li>
                <li className={`nav-item ${styles.navItem}`}>
                  <Link to="/about" className={`nav-link ${styles.navLink}`} onClick={closeMenu}>
                    <i className={`fas fa-info-circle ${styles.navFaIcon}`}></i>
                    <span>About</span>
                  </Link>
                </li>
                <li className={`nav-item ${styles.navItem}`}>
                  <Link to="/login" className={`nav-link ${styles.navLink}`} onClick={closeMenu}>
                    <i className={`fas fa-user-plus ${styles.navFaIcon}`}></i>
                    <span>Login</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}