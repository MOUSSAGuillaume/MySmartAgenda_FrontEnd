// db.js
require('dotenv').config(); // Charge les variables du fichier .env

const mysql = require('mysql2');

// Créer une connexion
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Tester la connexion
connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err.message);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

module.exports = connection;
