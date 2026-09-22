const mongoose = require('mongoose');

const outfitItemSchema = new mongoose.Schema({
  src: { type: String, required: true },
  style: { type: String, default: null },
  category: { type: String, default: null },
  position: {
    left: { type: String, default: null },
    top: { type: String, default: null }
  }
}, { _id: false });

const outfitSchema = new mongoose.Schema({
  legacyId: { type: Number },
  userId: { type: Number, required: true, index: true },
  clothingSrc: { type: String, default: '' },
  clothingCategory: { type: String, default: null },
  clothingStyle: { type: String, default: null },
  gender: { type: String, default: null },
  outfitData: [outfitItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Outfit', outfitSchema);