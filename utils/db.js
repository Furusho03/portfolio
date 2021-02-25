const mongoose = require('mongoose');
// Env
const dbUri = process.env.DATABASE_URI;

function connectDB() {
  mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDBの接続に失敗しました'));
  db.once('open', () => {
    console.log('データベースと接続しました');
  });
}

module.exports = connectDB;
