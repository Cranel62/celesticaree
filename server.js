require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/celesticaree';

// XAMPP MySQL Connection Pool
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'celesticaree',
  waitForConnections: true,
  connectionLimit: 10
});

// Constants
const ADMIN_EMAIL_DOMAIN = '@celesticare.admin.com';
const ADMIN_SECRET_KEY = 'CelestiCare2025!';
const DEFAULT_PASSWORD = 'CelestiCare123!';
const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.ca',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.fr', 'outlook.de'
];

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  sql_id: { type: Number, index: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  name: { type: String, default: '' },
  birthdate: { type: String, default: '' },
  gender: { type: String, default: '' },
  zodiac_sign: { type: String, default: '' },
  undertone: { type: String, default: '' },
  season: { type: String, default: '' },
  aesthetic_result: { type: String, default: '' },
  style_result: { type: String, default: '' },
  security_setup_complete: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', userSchema);

// Establish Database Connections
mongoose.connect(MONGO_URI)
  .then(() => console.log(` Connected to MongoDB database: ${mongoose.connection.name}`))
  .catch(err => console.error('MongoDB connection error:', err));

mysqlPool.query('SELECT 1')
  .then(() => console.log(` Connected to XAMPP MySQL database: ${process.env.MYSQL_DATABASE || 'celesticaree'}`))
  .catch(err => console.error('XAMPP MySQL connection error:', err.message));

// Helper: MySQL connection fallback error
function databaseError(res, error) {
  if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      success: false,
      error: 'The MySQL database is unavailable. Start MySQL in XAMPP and try again.'
    });
  }
  console.error('Database request error:', error.message);
  return res.status(500).json({ success: false, error: 'Database error. Please try again later.' });
}

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'celesticare_secret_key_session_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));

// =========================================================================
// AUTHENTICATION & FORGOT PASSWORD ROUTES
// =========================================================================

// 1. Current Session Status (/api/auth/me)
app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false, user: null });
  }
  try {
    const [rows] = await mysqlPool.query(
      `SELECT id, username, name, email, role, zodiac_sign, undertone, 
              DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate, 
              gender, season, aesthetic_result, style_result, is_admin, 
              security_setup_complete 
       FROM users WHERE id = ? LIMIT 1`,
      [req.session.userId]
    );
    const user = rows[0];
    if (!user) {
      req.session.destroy();
      return res.json({ authenticated: false, user: null });
    }
    res.json({ authenticated: true, user });
  } catch (err) {
    res.status(500).json({ authenticated: false, error: err.message });
  }
});

// 2. Live Default Password Check
app.post('/api/auth/check-default', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ has_default_password: false });
  try {
    const [rows] = await mysqlPool.query('SELECT password FROM users WHERE email = ? LIMIT 1', [email.trim().toLowerCase()]);
    const storedPassword = rows[0]?.password?.replace(/^\$2y\$/, '$2a$');
    if (storedPassword && await bcrypt.compare(DEFAULT_PASSWORD, storedPassword)) {
      return res.json({ has_default_password: true });
    }
    res.json({ has_default_password: false });
  } catch {
    res.json({ has_default_password: false });
  }
});

// 3. Forgot Password Route
app.post(['/api/forgot-password', '/api/api_forgot_password.php'], async (req, res) => {
  const { email, action, check_default } = req.body;
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) {
    return res.status(400).json({ success: false, error: 'Please enter your email address.' });
  }

  try {
    const [rows] = await mysqlPool.query(
      'SELECT id, password, security_setup_complete FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
      [trimmedEmail]
    );
    const user = rows[0];

    // Live Check for default password
    if (action === 'check_default' || check_default === true || check_default === 'true') {
      if (user) {
        const storedPassword = user.password.replace(/^\$2y\$/, '$2a$');
        const isDefault = await bcrypt.compare(DEFAULT_PASSWORD, storedPassword);
        return res.json({ has_default_password: isDefault });
      }
      return res.json({ has_default_password: false });
    }

    // Submit flow
    if (user) {
      const storedPassword = user.password.replace(/^\$2y\$/, '$2a$');
      const isDefault = await bcrypt.compare(DEFAULT_PASSWORD, storedPassword);

      if (isDefault) {
        return res.json({
          success: true,
          show_default_button: true,
          has_default_password: true,
          message: 'This account has a default password. Click the button below to see it.'
        });
      }

      if (user.security_setup_complete == 1) {
        return res.json({
          success: true,
          requires_security_questions: true,
          user_id: user.id,
          email: trimmedEmail
        });
      } else {
        return res.json({
          success: false,
          no_security_setup: true,
          error: "This account doesn't have security questions set up. Please contact an administrator for password reset."
        });
      }
    }

    return res.json({
      success: true,
      message: "If this email exists in our system, you'll receive instructions shortly."
    });
  } catch (err) {
    databaseError(res, err);
  }
});

// 4. Verify Security Answers Route
app.post(['/api/verify-security', '/api/verify_security.php'], async (req, res) => {
  const { user_id, answer1, answer2, answer3 } = req.body;

  if (!user_id || !answer1?.trim() || !answer2?.trim() || !answer3?.trim()) {
    return res.status(400).json({ success: false, error: 'All answers are required.' });
  }

  try {
    const [rows] = await mysqlPool.query(
      'SELECT security_answer1, security_answer2, security_answer3 FROM users WHERE id = ? LIMIT 1',
      [user_id]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const valid1 = await bcrypt.compare(answer1.trim(), user.security_answer1);
    const valid2 = await bcrypt.compare(answer2.trim(), user.security_answer2);
    const valid3 = await bcrypt.compare(answer3.trim(), user.security_answer3);

    if (valid1 && valid2 && valid3) {
      req.session.userId = user_id;
      return res.json({ success: true, message: 'Security answers verified successfully!' });
    } else {
      return res.status(400).json({ success: false, error: 'One or more answers are incorrect.' });
    }
  } catch (err) {
    databaseError(res, err);
  }
});

// 5. Change Password Route
app.post(['/api/change-password', '/api/api_change_password.php'], async (req, res) => {
  const userId = req.session?.userId || req.body.user_id;
  const { current_password, new_password, is_recovery } = req.body;

  if (!userId || !new_password) {
    return res.status(400).json({ success: false, message: 'User ID and new password are required' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  try {
    const [rows] = await mysqlPool.query('SELECT password FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!is_recovery) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'Current password is required' });
      }
      const isMatch = await bcrypt.compare(current_password, user.password.replace(/^\$2y\$/, '$2a$'));
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await mysqlPool.query('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, userId]);
    await MongoUser.findOneAndUpdate({ sql_id: userId }, { password: newPasswordHash });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Database error occurred' });
  }
});

// 6. Register: Syncs to XAMPP MySQL & MongoDB with Optional Guest Profile Fields
app.post(['/api/auth/register', '/api/modal_register.php'], async (req, res) => {
  const { username, email, password, is_admin, name, birthdate, gender, zodiac_sign, undertone, season } = req.body;
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedUsername = (username || '').trim();

  if (!trimmedUsername || !trimmedEmail || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const isAdmin = trimmedEmail.includes(ADMIN_EMAIL_DOMAIN);
  if (!isAdmin) {
    const domain = trimmedEmail.split('@')[1];
    if (!ALLOWED_DOMAINS.includes(domain)) {
      return res.status(400).json({ success: false, error: 'Only Gmail, Yahoo, Hotmail, and Outlook emails are allowed.' });
    }
    if (password.includes(' ') || password.length < 8 || !/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 chars, 1 uppercase, and no spaces.' });
    }
  } else {
    if (password !== ADMIN_SECRET_KEY) {
      return res.status(400).json({ success: false, error: 'Invalid admin secret key.' });
    }
  }

  try {
    const [existingRows] = await mysqlPool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [trimmedEmail]);
    if (existingRows[0]) {
      return res.status(400).json({ success: false, error: 'This email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await mysqlPool.query(
      `INSERT INTO users (username, email, password, role, is_admin, name, birthdate, gender, zodiac_sign, undertone, season) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trimmedUsername, 
        trimmedEmail, 
        hashedPassword, 
        'user', 
        isAdmin ? 1 : 0,
        name || null,
        birthdate || null,
        gender || null,
        zodiac_sign || null,
        undertone || null,
        season || null
      ]
    );

    await MongoUser.findOneAndUpdate(
      { email: trimmedEmail },
      {
        sql_id: result.insertId,
        username: trimmedUsername,
        email: trimmedEmail,
        password: hashedPassword,
        is_admin: isAdmin,
        role: 'user',
        name: name || '',
        birthdate: birthdate || '',
        gender: gender || '',
        zodiac_sign: zodiac_sign || '',
        undertone: undertone || '',
        season: season || ''
      },
      { upsert: true, new: true }
    );

    req.session.userId = result.insertId;
    const userObj = { 
      id: result.insertId, 
      username: trimmedUsername, 
      email: trimmedEmail, 
      is_admin: isAdmin ? 1 : 0,
      name: name || '',
      birthdate: birthdate || '',
      gender: gender || '',
      zodiac_sign: zodiac_sign || '',
      undertone: undertone || '',
      season: season || ''
    };

    res.json({ success: true, user: userObj, message: 'Account created successfully!' });
  } catch (err) {
    databaseError(res, err);
  }
});

// 7. Login (Supports both standard /api/auth/login and legacy /api/modal_login.php)
app.post(['/api/auth/login', '/api/modal_login.php'], async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return res.status(400).json({ success: false, error: 'Both fields are required.' });
  }

  const isAdmin = trimmedEmail.includes(ADMIN_EMAIL_DOMAIN);
  if (isAdmin && password !== ADMIN_SECRET_KEY) {
    return res.status(400).json({ success: false, error: 'Invalid admin credentials.' });
  }

  try {
    const [rows] = await mysqlPool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [trimmedEmail]);
    const user = rows[0];
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password.replace(/^\$2y\$/, '$2a$'));
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid email or password.' });
    }

    req.session.userId = user.id;
    const { password: storedPassword, ...userObj } = user;
    const isDefaultPass = await bcrypt.compare(DEFAULT_PASSWORD, storedPassword.replace(/^\$2y\$/, '$2a$'));

    res.json({
      success: true,
      user: userObj,
      needs_password_change: isDefaultPass,
      redirect: isAdmin ? '/admin/manage_users' : '/dashboard'
    });
  } catch (err) {
    databaseError(res, err);
  }
});

// 8. Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// =========================================================================
// PROFILE CRUD SPECIFICATION
// =========================================================================

// 1. GET Profile
app.get('/api/user/profile', async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const [rows] = await mysqlPool.query(
      `SELECT id, username, name, email, role, zodiac_sign, undertone, 
              DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate, 
              gender, season, aesthetic_result, style_result, is_admin, 
              security_setup_complete, deleted_at 
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );
    const user = rows[0];

    if (!user || user.deleted_at !== null) {
      req.session.destroy();
      return res.status(403).json({ success: false, message: 'Account has been archived or no longer exists.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    databaseError(res, err);
  }
});

// 2. POST Profile (Save profile data from get to know or onboarding)
app.post('/api/user/profile', async (req, res) => {
  const userId = req.session?.userId || req.body.userId || req.body.user_id;
  const { name, birthdate, gender, zodiac_sign } = req.body;

  if (!userId) {
    return res.json({ success: true, message: 'Saved to guest state only.' });
  }

  try {
    await mysqlPool.query(
      'UPDATE users SET name = ?, birthdate = ?, gender = ?, zodiac_sign = ? WHERE id = ?',
      [name || null, birthdate || null, gender || null, zodiac_sign || null, userId]
    );

    await MongoUser.findOneAndUpdate(
      { sql_id: userId },
      { name, birthdate, gender, zodiac_sign }
    );

    const [rows] = await mysqlPool.query(
      `SELECT id, username, name, email, role, zodiac_sign, undertone, 
              DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate, 
              gender, season, is_admin 
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );
    res.status(201).json({ success: true, message: 'Profile updated successfully', user: rows[0] });
  } catch (err) {
    databaseError(res, err);
  }
});

// 3. UPDATE / PUT Profile
app.put('/api/user/profile', async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { name, gender, birthdate, zodiac_sign, current_password, new_password, forced_change } = req.body;

  try {
    const [rows] = await mysqlPool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let updatedHashedPassword = user.password;
    if (new_password) {
      if (!current_password && !forced_change) {
        return res.status(400).json({ success: false, message: 'Current password is required.' });
      }

      if (!forced_change) {
        const isMatch = await bcrypt.compare(current_password, user.password.replace(/^\$2y\$/, '$2a$'));
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password incorrect.' });
        }
      }

      if (new_password.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }
      updatedHashedPassword = await bcrypt.hash(new_password, 10);
    }

    const updatedName = name !== undefined ? name : user.name;
    const updatedGender = gender !== undefined ? gender : user.gender;
    const updatedBirthdate = birthdate !== undefined ? birthdate : user.birthdate;
    const updatedZodiac = zodiac_sign !== undefined ? zodiac_sign : user.zodiac_sign;

    // Update MySQL
    await mysqlPool.query(
      'UPDATE users SET name = ?, gender = ?, birthdate = ?, zodiac_sign = ?, password = ? WHERE id = ?',
      [updatedName, updatedGender, updatedBirthdate, updatedZodiac, updatedHashedPassword, userId]
    );

    // Sync MongoDB
    await MongoUser.findOneAndUpdate(
      { sql_id: userId },
      {
        name: updatedName,
        gender: updatedGender,
        birthdate: updatedBirthdate,
        zodiac_sign: updatedZodiac,
        password: updatedHashedPassword
      }
    );

    const [updatedRows] = await mysqlPool.query(
      `SELECT id, username, name, email, role, zodiac_sign, undertone, 
              DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate, 
              gender, season, aesthetic_result, style_result, is_admin, 
              security_setup_complete 
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    res.json({ success: true, message: 'Profile updated successfully!', user: updatedRows[0] });
  } catch (err) {
    databaseError(res, err);
  }
});

// Backward compatibility with save_profile_ajax
app.post('/api/user/save_profile_ajax', async (req, res) => {
  req.method = 'PUT';
  return app._router.handle(req, res);
});

// 4. DELETE Profile
app.delete('/api/user/profile', async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await mysqlPool.query('DELETE FROM users WHERE id = ?', [userId]);
    await MongoUser.findOneAndDelete({ sql_id: userId });

    req.session.destroy(err => {
      if (err) return res.status(500).json({ success: false, message: 'Session termination error' });
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Profile deleted successfully' });
    });
  } catch (err) {
    databaseError(res, err);
  }
});

// =========================================================================
// OUTFITS & STYLE RESULTS
// =========================================================================

app.post(['/api/save_outfit.php', '/api/outfits/save'], async (req, res) => {
  const userId = req.session?.userId || req.body.user_id || req.body.userId;
  const { outfit, outfit_data, style, clothing_style, gender } = req.body;

  const rawItems = outfit_data || outfit || [];
  const normalizedItems = Array.isArray(rawItems)
    ? rawItems.map(item => (typeof item === 'string' ? { src: item } : item))
    : [];

  const topStyle = clothing_style || style || '';
  const chosenGender = gender || 'fem';

  try {
    if (userId) {
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS user_outfits (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          outfit_data LONGTEXT NOT NULL,
          clothing_style VARCHAR(100),
          gender VARCHAR(20),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX (user_id)
        )
      `).catch(() => {});

      await mysqlPool.query(
        `INSERT INTO user_outfits (user_id, outfit_data, clothing_style, gender, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, JSON.stringify(normalizedItems), topStyle, chosenGender]
      );

      if (topStyle) {
        await mysqlPool.query('UPDATE users SET style_result = ? WHERE id = ?', [topStyle, userId]);
        await MongoUser.findOneAndUpdate({ sql_id: userId }, { style_result: topStyle });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Outfit and style result persisted successfully',
      outfit: normalizedItems,
      style: topStyle
    });
  } catch (err) {
    console.error('Save outfit error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/user/style-result', '/api/save_style_result.php'], async (req, res) => {
  const userId = req.session?.userId || req.body.user_id;
  const style = req.body.style || req.body.style_result;

  if (!style) {
    return res.status(400).json({ success: false, message: 'Style is required' });
  }

  try {
    if (userId) {
      await mysqlPool.query('UPDATE users SET style_result = ? WHERE id = ?', [style, userId]);
      await MongoUser.findOneAndUpdate({ sql_id: userId }, { style_result: style });
    }
    return res.status(200).json({ success: true, style_result: style });
  } catch (err) {
    databaseError(res, err);
  }
});

app.get('/api/user/outfits', async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.json({ success: true, outfits: [] });
  }

  try {
    const [rows] = await mysqlPool.query(
      'SELECT outfit_data, gender, clothing_style FROM user_outfits WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.json({ success: true, outfits: [] });
    }

    let parsedOutfits = [];
    if (rows[0].outfit_data) {
      try {
        parsedOutfits = typeof rows[0].outfit_data === 'string' 
          ? JSON.parse(rows[0].outfit_data) 
          : rows[0].outfit_data;
      } catch {
        parsedOutfits = [];
      }
    }

    res.json({
      success: true,
      outfits: Array.isArray(parsedOutfits) ? parsedOutfits : [],
      gender: rows[0]?.gender || 'fem',
      style: rows[0]?.clothing_style || ''
    });
  } catch (err) {
    console.error('Outfit fetch error:', err.message);
    res.json({ success: true, outfits: [] });
  }
});

// =========================================================================
// AESTHETICS ROUTE
// =========================================================================

app.post(['/api/aesthetic', '/api/api_save_aesthetic.php'], async (req, res) => {
  const userId = req.session?.userId || req.body.user_id;
  const aesthetic = req.body.aesthetic_result || req.body.aesthetic;

  if (!userId || !aesthetic) {
    return res.status(400).json({ success: false, message: 'User ID and aesthetic required' });
  }

  try {
    await mysqlPool.query(
      'UPDATE users SET aesthetic_result = ? WHERE id = ?',
      [aesthetic, userId]
    );

    await MongoUser.findOneAndUpdate(
      { sql_id: userId },
      { aesthetic_result: aesthetic }
    );

    res.json({
      success: true,
      message: 'Aesthetic saved successfully',
      aesthetic
    });
  } catch (err) {
    console.error('Aesthetic save error:', err);
    databaseError(res, err);
  }
});

// =========================================================================
// SECURITY QUESTIONS & RECOVERY VALIDATION ROUTES
// =========================================================================

app.get('/api/user/security-setup', async (req, res) => {
  const userId = req.session?.userId || req.query.user_id;

  const securityQuestionsList = [
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was your first car?",
    "What elementary school did you attend?",
    "What is your favorite book?",
    "What is your favorite movie?",
    "What was your childhood nickname?",
    "What is your favorite food?",
    "What is the name of your best friend?"
  ];

  if (!userId) {
    return res.json({
      success: true,
      questionsList: securityQuestionsList,
      userSecurity: {}
    });
  }

  try {
    const [rows] = await mysqlPool.query(
      'SELECT security_question1, security_question2, security_question3, security_setup_complete FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    res.json({
      success: true,
      questionsList: securityQuestionsList,
      userSecurity: rows[0] || {}
    });
  } catch (err) {
    databaseError(res, err);
  }
});

app.get('/api/user/get-recovery-questions', async (req, res) => {
  const userId = req.query.user_id || req.session?.userId;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required.' });
  }

  try {
    const [rows] = await mysqlPool.query(
      'SELECT id, security_question1, security_question2, security_question3, security_setup_complete FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    const user = rows[0];
    if (!user || !user.security_setup_complete) {
      return res.status(404).json({
        success: false,
        error: "This account doesn't have security questions configured."
      });
    }

    res.json({
      success: true,
      questions: [
        user.security_question1,
        user.security_question2,
        user.security_question3
      ]
    });
  } catch (err) {
    databaseError(res, err);
  }
});

app.post('/api/user/security-setup', async (req, res) => {
  const userId = req.session?.userId || req.body.user_id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized. User ID required.' });
  }

  const { question1, answer1, question2, answer2, question3, answer3 } = req.body;

  if (!question1 || !answer1?.trim() || !question2 || !answer2?.trim() || !question3 || !answer3?.trim()) {
    return res.status(400).json({ success: false, error: 'All questions and answers are required.' });
  }

  try {
    const hashedAnswer1 = await bcrypt.hash(answer1.trim(), 10);
    const hashedAnswer2 = await bcrypt.hash(answer2.trim(), 10);
    const hashedAnswer3 = await bcrypt.hash(answer3.trim(), 10);

    await mysqlPool.query(
      `UPDATE users SET 
        security_question1 = ?,
        security_answer1 = ?,
        security_question2 = ?,
        security_answer2 = ?,
        security_question3 = ?,
        security_answer3 = ?,
        security_setup_complete = 1
       WHERE id = ?`,
      [question1, hashedAnswer1, question2, hashedAnswer2, question3, hashedAnswer3, userId]
    );

    await MongoUser.findOneAndUpdate(
      { sql_id: userId },
      { security_setup_complete: true }
    );

    res.json({ success: true, message: 'Security questions saved successfully!' });
  } catch (err) {
    databaseError(res, err);
  }
});

// =========================================================================
// USER FEEDBACK ROUTE
// =========================================================================

app.post('/api/feedback', async (req, res) => {
  const userId = req.session?.userId || req.body.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User must be logged in to submit feedback' });
  }

  const { experience, fashion_match, favorite_feature, vibe, suggestions } = req.body;

  try {
    await mysqlPool.query(
      `INSERT INTO user_feedback (user_id, experience, fashion_match, favorite_feature, vibe, suggestions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, String(experience || 5), fashion_match, favorite_feature, vibe, suggestions || '']
    );

    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (err) {
    databaseError(res, err);
  }
});

// =========================================================================
// MOODBOARD DATA ENDPOINT
// =========================================================================

app.get(['/api/moodboard', '/api/user/moodboard'], async (req, res) => {
  const userId = req.session?.userId || req.query.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }

  try {
    const [userRows] = await mysqlPool.query(
      `SELECT id, username, name, email, aesthetic_result, style_result, 
              zodiac_sign, undertone, season, gender, 
              DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate 
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const user = userRows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [outfitRows] = await mysqlPool.query(
      `SELECT outfit_data, clothing_style, gender, created_at 
       FROM user_outfits 
       WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    let outfitItems = [];
    if (outfitRows && outfitRows.length > 0 && outfitRows[0].outfit_data) {
      try {
        outfitItems = typeof outfitRows[0].outfit_data === 'string'
          ? JSON.parse(outfitRows[0].outfit_data)
          : outfitRows[0].outfit_data;
      } catch {
        outfitItems = [];
      }
    }

    return res.json({
      success: true,
      user: {
        ...user,
        zodiac_sign: user.zodiac_sign || 'Not set',
        undertone: user.undertone || 'Not set',
        season: user.season || 'Not set',
        aesthetic_result: (user.aesthetic_result || '').trim(),
        style_result: (user.style_result || '').trim()
      },
      outfits: Array.isArray(outfitItems) ? outfitItems : []
    });
  } catch (err) {
    databaseError(res, err);
  }
});

// =========================================================================
// UNDERTONE & ONBOARDING DATA SAVE ENDPOINT
// =========================================================================

app.post(['/api/undertone/save', '/api/api_save_undertone.php'], async (req, res) => {
  const userId = req.session?.userId || req.body.user_id || req.body.userId;
  const { undertone, zodiac, zodiac_sign, season, name, birthdate, gender } = req.body;

  if (!userId) {
    return res.status(200).json({ success: true, message: 'Saved to guest state.' });
  }

  const effectiveZodiac = zodiac || zodiac_sign;

  try {
    await mysqlPool.query(
      `UPDATE users SET 
        undertone = COALESCE(?, undertone), 
        zodiac_sign = COALESCE(?, zodiac_sign), 
        season = COALESCE(?, season),
        name = COALESCE(?, name),
        birthdate = COALESCE(?, birthdate),
        gender = COALESCE(?, gender)
       WHERE id = ?`,
      [
        undertone || null, 
        effectiveZodiac || null, 
        season || null,
        name || null,
        birthdate || null,
        gender || null,
        userId
      ]
    );

    await MongoUser.findOneAndUpdate(
      { sql_id: userId },
      { 
        ...(undertone && { undertone }),
        ...(effectiveZodiac && { zodiac_sign: effectiveZodiac }),
        ...(season && { season }),
        ...(name && { name }),
        ...(birthdate && { birthdate }),
        ...(gender && { gender })
      }
    );

    res.json({ success: true, message: 'Data synced successfully!' });
  } catch (err) {
    databaseError(res, err);
  }
});

app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));