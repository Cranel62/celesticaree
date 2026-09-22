require('dotenv').config();
const mongoose = require('mongoose');
const Outfit = require('./models/Outfit');

const rawOutfits = [
  {
    legacyId: 35,
    userId: 29,
    clothingStyle: "rough",
    gender: "fem",
    outfitData: [
      { src: "http://localhost/celesticare/quizzes/assets/fem/Untitled18_20251019102847.png", style: "rough", category: null },
      { src: "http://localhost/celesticare/quizzes/assets/fem/blackpunk.png", style: "rough", category: null }
    ]
  },
  {
    legacyId: 73,
    userId: 84,
    clothingStyle: "businesswear",
    gender: "fem",
    outfitData: [
      { src: "http://localhost/Celesticare-full/Celesticare/quizzes/assets/fem/businesstop1.png", style: "businesswear", category: "tops", position: { left: "10px", top: "48px" } }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/celesticaree');
    console.log(`Connected to MongoDB database: ${mongoose.connection.name}.`);

    await Outfit.deleteMany({});
    const inserted = await Outfit.insertMany(rawOutfits);

    console.log(`Inserted ${inserted.length} outfits into celesticaree MongoDB.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();