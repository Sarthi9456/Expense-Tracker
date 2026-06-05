const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set');
  }

  mongoose.set('strictQuery', true);
  return mongoose.connect(uri);
}

module.exports = { connectMongo };

