require('dotenv').config();

const fs = require('fs');
const mongoose = require('mongoose');

const USER_CSV = process.argv[2] || 'C:/Users/Mark Soriano/Downloads/celesticaree.csv';
const OUTFIT_CSV = process.argv[3] || 'C:/Users/Mark Soriano/Downloads/celesticaree.outfits.csv';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/celesticaree';

const userSchema = new mongoose.Schema({
  legacyId: Number,
  username: { type: String, required: true },
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  is_admin: Boolean,
  zodiac_sign: String,
  undertone: String,
  birthdate: String,
  gender: String,
  season: String,
  aesthetic_result: String,
  style_result: String,
  security_question1: String,
  security_answer1: String,
  security_question2: String,
  security_answer2: String,
  security_question3: String,
  security_answer3: String,
  security_setup_complete: Boolean,
  show_reset_notification: Boolean,
  created_at: Date,
  updated_at: Date,
  birth_time: String,
  birth_place: String,
  deleted_at: Date
}, { strict: false, collection: 'users' });

const outfitItemSchema = new mongoose.Schema({
  src: String,
  style: String,
  category: String,
  position: { left: String, top: String }
}, { _id: false });

const outfitSchema = new mongoose.Schema({
  legacyId: Number,
  userId: Number,
  clothingSrc: String,
  clothingCategory: String,
  clothingStyle: String,
  gender: String,
  outfitData: [outfitItemSchema]
}, { strict: false, collection: 'outfits' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Outfit = mongoose.models.Outfit || mongoose.model('Outfit', outfitSchema);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value);
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value);
    if (row.some(cell => cell !== '')) rows.push(row);
  }

  return rows;
}

function rowsToObjects(rows) {
  const headers = rows[0].map(header => header.trim());
  return rows.slice(1).map(row => Object.fromEntries(
    headers.map((header, index) => [header, row[index] ?? ''])
  ));
}

function nullable(value) {
  const normalized = String(value ?? '').trim();
  return !normalized || normalized.toUpperCase() === 'NULL' ? undefined : normalized;
}

function numberOrUndefined(value) {
  const normalized = nullable(value);
  if (normalized === undefined) return undefined;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

function booleanValue(value) {
  return String(value).trim() === '1' || String(value).toLowerCase() === 'true';
}

function parseDate(value) {
  const normalized = nullable(value);
  return normalized ? new Date(normalized) : undefined;
}

function readUserRows() {
  const rows = rowsToObjects(parseCsv(fs.readFileSync(USER_CSV, 'utf8')));
  return rows.filter(row => Number.isFinite(Number(row.id)) && row.email && row.password && row.username);
}

function readOutfitRows() {
  const rows = rowsToObjects(parseCsv(fs.readFileSync(OUTFIT_CSV, 'utf8')));
  return rows.filter(row => Number.isFinite(Number(row.legacyId)) && Number.isFinite(Number(row.userId)));
}

function toUser(row) {
  return {
    legacyId: numberOrUndefined(row.id),
    username: row.username,
    name: nullable(row.name) || '',
    email: row.email.trim().toLowerCase(),
    password: row.password.replace(/^\$2y\$/, '$2a$'),
    is_admin: booleanValue(row.is_admin),
    zodiac_sign: nullable(row.zodiac_sign) || '',
    undertone: nullable(row.undertone) || '',
    birthdate: nullable(row.birthdate) || '',
    gender: nullable(row.gender) || '',
    season: nullable(row.season) || '',
    aesthetic_result: nullable(row.aesthetic_result),
    style_result: nullable(row.style_result),
    security_question1: nullable(row.security_question1),
    security_answer1: nullable(row.security_answer1),
    security_question2: nullable(row.security_question2),
    security_answer2: nullable(row.security_answer2),
    security_question3: nullable(row.security_question3),
    security_answer3: nullable(row.security_answer3),
    security_setup_complete: booleanValue(row.security_setup_complete),
    show_reset_notification: booleanValue(row.show_reset_notification),
    created_at: parseDate(row.created_at),
    updated_at: parseDate(row.updated_at),
    birth_time: nullable(row.birth_time),
    birth_place: nullable(row.birth_place),
    deleted_at: parseDate(row.deleted_at)
  };
}

function toOutfit(row) {
  const outfitData = [0, 1]
    .map(index => {
      const src = nullable(row[`outfitData[${index}].src`]);
      if (!src) return null;
      return {
        src,
        style: nullable(row[`outfitData[${index}].style`]),
        category: nullable(row[`outfitData[${index}].category`]),
        position: {
          left: nullable(row[`outfitData[${index}].position.left`]),
          top: nullable(row[`outfitData[${index}].position.top`])
        }
      };
    })
    .filter(Boolean);

  return {
    legacyId: numberOrUndefined(row.legacyId),
    userId: numberOrUndefined(row.userId),
    clothingSrc: nullable(row.clothingSrc) || '',
    clothingCategory: nullable(row.clothingCategory),
    clothingStyle: nullable(row.clothingStyle),
    gender: nullable(row.gender),
    outfitData
  };
}

async function importData() {
  const users = readUserRows().map(toUser);
  const outfits = readOutfitRows().map(toOutfit);

  await mongoose.connect(MONGO_URI);

  const userOperations = users.map(user => ({
    updateOne: {
      filter: { legacyId: user.legacyId },
      update: { $set: user },
      upsert: true
    }
  }));
  const outfitOperations = outfits.map(outfit => ({
    updateOne: {
      filter: { legacyId: outfit.legacyId },
      update: { $set: outfit },
      upsert: true
    }
  }));

  if (userOperations.length) await User.bulkWrite(userOperations);
  if (outfitOperations.length) await Outfit.bulkWrite(outfitOperations);

  const [userCount, outfitCount] = await Promise.all([
    User.countDocuments({ legacyId: { $in: users.map(user => user.legacyId) } }),
    Outfit.countDocuments({ legacyId: { $in: outfits.map(outfit => outfit.legacyId) } })
  ]);

  console.log(`Imported ${userCount} users and ${outfitCount} outfits into ${mongoose.connection.name}.`);
  await mongoose.disconnect();
}

importData().catch(async error => {
  console.error(`Import failed: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});