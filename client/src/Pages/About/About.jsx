import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './About.module.css';

export default function About({ isAuthenticated = false }) {
  const [activeTab, setActiveTab] = useState('who');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  // Feedback form state
  const [formData, setFormData] = useState({
    experience: '',
    fashion_match: '',
    favorite_feature: '',
    vibe: '',
    suggestions: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Endpoint where your backend handles feedback submission
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('✨ Thank you for your feedback!');
        setFormData({ experience: '', fashion_match: '', favorite_feature: '', vibe: '', suggestions: '' });
      } else {
        setMessage('❌ Error submitting feedback. Please try again.');
      }
    } catch {
      setMessage('✨ Thank you for your feedback!'); // Fallback preview
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage('');
  };

  return (
    <div className={styles.aboutContainer}>
      <main className={styles.pageWrapper}>
        <section className={styles.aboutCard}>
          <div className={styles.aboutHeader}>
            <h1>CELESTICARE</h1>
            <div className={styles.subtitle}>ABOUT US</div>
          </div>

          <div className={styles.aboutBody}>
            {/* Navigation Tabs */}
            <div className={styles.infoTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'who' ? styles.active : ''}`}
                onClick={() => setActiveTab('who')}
              >
                Who We Are
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'team' ? styles.active : ''}`}
                onClick={() => setActiveTab('team')}
              >
                Our Team
              </button>
            </div>

            {/* Tab 1: Who We Are */}
            {activeTab === 'who' && (
              <section>
                <div className={styles.sectionHeadline}>
                  <h2>Style Written in the Stars</h2>
                  <div className={styles.subline}>
                    Celesticare blends astrology and fashion to help you express who you are —
                    not just what's trending. We create personalized style guidance based on your
                    zodiac traits, energy, and aesthetic identity.
                  </div>
                </div>

                <article className={styles.infoCard}>
                  <h3>Our Purpose</h3>
                  <div className={styles.subsectionTitle}>Fashion Meets Self-Discovery</div>
                  <p>
                    We believe style should feel personal. Instead of asking "What's popular right now?"
                    we ask "What feels like you?" Celesticare turns your birth details and sign traits
                    into wearable inspiration — outfits, palettes, and aesthetics you actually connect with.
                  </p>
                  <p>
                    Through our platform, users can create a profile, share birth information,
                    and receive curated outfit and beauty suggestions inspired by their sign.
                    From daily looks to special moments, we aim to make getting dressed feel
                    intentional, confident, and meaningful.
                  </p>

                  <div className={styles.subsectionTitle} style={{ marginTop: '2rem' }}>Mission</div>
                  <p>
                    To empower individuality through a thoughtful blend of astrology and fashion —
                    helping people express their real selves, not just follow trends.
                  </p>

                  <div className={styles.subsectionTitle} style={{ marginTop: '2rem' }}>Vision</div>
                  <p>
                    To become the go-to space for cosmic styling: a platform where identity,
                    creativity, and wardrobe come together.
                  </p>
                </article>
              </section>
            )}

            {/* Tab 2: Team */}
            {activeTab === 'team' && (
              <section>
                <div className={styles.sectionHeadline}>
                  <h2>Meet the Team</h2>
                  <div className={styles.subline}>
                    The people shaping Celesticare and building the experience.
                  </div>
                </div>

                <article className={styles.infoCard}>
                  <h3>Core Team</h3>
                  <div className={styles.teamGrid}>
                    <div className={styles.teamCard}>
                      <div className={styles.memberRole}>Project Manager, Systems Analyst, Main Developer, UI/UX Programmer & Database Admin</div>
                      <div className={styles.memberName}>Elle Skye S. Babao</div>
                      <div className={styles.memberDesc}>
                        Leads vision, user experience, and delivery. Aligns timelines, coordinates the team,
                        and shapes the interface so Celesticare feels intuitive, elegant, and emotionally resonant.
                      </div>
                    </div>

                    <div className={styles.teamCard}>
                      <div className={styles.memberRole}>Asset Developer, Presentation Manager, UI Designer & Records Manager</div>
                      <div className={styles.memberName}>Ma. Monica L. Deloa</div>
                      <div className={styles.memberDesc}>
                        Bridges the gap between design and development. Crafts the user interface, manages digital
                        assets and project records, ensuring the astrology-driven features are functional and beautiful.
                      </div>
                    </div>

                    <div className={styles.teamCard}>
                      <div className={styles.memberRole}>Documentation Specialist, Presentation Lead, Diagram Manager & Tester</div>
                      <div className={styles.memberName}>Nicole G. Dequito</div>
                      <div className={styles.memberDesc}>
                        Builds the project's information backbone. Creates comprehensive documentation, manages
                        visual diagrams and presentations, and conducts testing to ensure every component works as intended.
                      </div>
                    </div>

                    <div className={styles.teamCard}>
                      <div className={styles.memberRole}>Documentation Specialist, Tester & UI Designer</div>
                      <div className={styles.memberName}>Alyssa Kate C. Dimaano</div>
                      <div className={styles.memberDesc}>
                        Creates with intention and verifies with precision. Shapes the user interface while maintaining
                        project documentation and conducting tests to ensure every design decision is purposeful.
                      </div>
                    </div>

                    <div className={styles.teamCard}>
                      <div className={styles.memberRole}>Assistant Programmer, Optimization Analyst, Iteration & Feedback Coordinator</div>
                      <div className={styles.memberName}>Camille M. Vallinan</div>
                      <div className={styles.memberDesc}>
                        Maintains clarity across the project. Creates and organizes documentation, diagrams,
                        and reports so the system stays understandable, scalable, and future-ready.
                      </div>
                    </div>

                    <div className={styles.teamCard}>
                      <div className={styles.memberRole}>Former Dev</div>
                      <div className={styles.memberName}>Bryan Josef Sarmiento</div>
                      <div className={styles.memberDesc}>
                        Helped Bring Life to Celesticare when it first started.
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            )}
          </div>
        </section>
      </main>

      {/* Trigger Button */}
      <button className={styles.feedbackBtn} onClick={() => setIsModalOpen(true)}>
        <i className="fas fa-comment-dots" style={{ marginRight: '8px' }}></i> Give Feedback
      </button>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modalContent}>
            {isAuthenticated ? (
              <>
                <div className={styles.modalHeader}>
                  <h2>Share Your Experience</h2>
                  <button className={styles.closeModal} onClick={closeModal}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                  {message && <div className={styles.message}>{message}</div>}
                  <form onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                      <label>Overall Experience</label>
                      <select name="experience" value={formData.experience} onChange={handleInputChange} required>
                        <option value="">Select your experience</option>
                        <option value="5">Excellent ⭐⭐⭐⭐⭐</option>
                        <option value="4">Great ⭐⭐⭐⭐</option>
                        <option value="3">Average ⭐⭐⭐</option>
                        <option value="2">Fair ⭐⭐</option>
                        <option value="1">Poor ⭐</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Did the fashion suggestions match your vibe?</label>
                      <select name="fashion_match" value={formData.fashion_match} onChange={handleInputChange} required>
                        <option value="">Select an option</option>
                        <option value="Very accurate">Very accurate</option>
                        <option value="Somewhat">Somewhat</option>
                        <option value="Not really">Not really</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Favorite Feature</label>
                      <select name="favorite_feature" value={formData.favorite_feature} onChange={handleInputChange} required>
                        <option value="">Select your favorite</option>
                        <option value="Color Analysis">Color Analysis</option>
                        <option value="Fashion Forecast">Fashion Forecast</option>
                        <option value="Aesthetic Quiz">Aesthetic Quiz</option>
                        <option value="Virtual Style Studio">Virtual Style Studio</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Describe the website's vibe in one word</label>
                      <input
                        type="text"
                        name="vibe"
                        value={formData.vibe}
                        onChange={handleInputChange}
                        placeholder="e.g., Magical, Chic, Inspiring"
                        required
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Any suggestions or wishes?</label>
                      <textarea
                        name="suggestions"
                        rows="3"
                        value={formData.suggestions}
                        onChange={handleInputChange}
                        placeholder="Tell us what you'd love to see..."
                      ></textarea>
                    </div>

                    <button type="submit" className={styles.submitBtn}>Submit Feedback</button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2>Join Our Community</h2>
                  <button className={styles.closeModal} onClick={closeModal}>&times;</button>
                </div>
                <div className={styles.modalBody} style={{ textAlign: 'center' }}>
                  <i className="fas fa-users" style={{ fontSize: '3rem', color: '#6b5b95', marginBottom: '1rem' }}></i>
                  <h4 style={{ color: '#2e2e2e', marginBottom: '15px' }}>Want to share your thoughts?</h4>
                  <p style={{ color: '#575767', marginBottom: '25px' }}>
                    Create an account to provide feedback and get personalized style recommendations!
                  </p>
                  <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <Link to="/login" className={styles.loginPromptBtn} onClick={closeModal}>Login</Link>
                    <Link to="/register" className={`${styles.loginPromptBtn} ${styles.loginPromptBtnBlack}`} onClick={closeModal}>Sign Up</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}