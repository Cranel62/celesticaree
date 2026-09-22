const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  name: { type: String, default: '' },
  birthdate: { type: String, default: '' },
  gender: { type: String, default: '' },
  zodiac_sign: { type: String, default: '' },
  undertone: { type: String, default: '' },
  season: { type: String, default: '' },
  security_setup_complete: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

// Password hash hook
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Password verification method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);