const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("./db.js"); // ⚠️ fichier de connexion à MySQL

const app = express();
const PORT = 8000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(bodyParser.json());

const saltRounds = 10;

// 🔐 Middleware vérification token en base
const authMiddleware = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  console.log("TOKEN utilisé :", token);

  if (!token) return res.status(403).json({ message: "Token manquant" });

  db.query("SELECT id FROM users WHERE api_token = ?", [token], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    req.userId = results[0].id;
    next();
  });
};


// ✅ Inscription utilisateur
app.post("/api/registration", async (req, res) => {
  console.log("Corps de la requête:", req.body);
  const { nom, prenom, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [`${nom} ${prenom}`, email, hashedPassword, "client"], (err) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.status(201).json({ message: "Inscription réussie" });
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur (catch)" });
  }
});

// ✅ Connexion utilisateur
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Tentative de connexion :", email);

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Email déjà utilisé" });
}

    if (results.length === 0) return res.status(401).json({ message: "Email inconnu" });

    const user = results[0];
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) return res.status(401).json({ message: "Mot de passe invalide" });

    // Générer et stocker un nouveau token
    const token = crypto.randomBytes(16).toString("hex");

    db.query("UPDATE users SET api_token = ? WHERE id = ?", [token, user.id], (err) => {
      if (err) {
        console.error("Erreur enregistrement token :", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      res.json({
        apiToken: token,
        roles: [user.role]
      });
    });
  });
});

// ✅ Route protégée : infos utilisateur
app.get("/api/account/me", authMiddleware, (req, res) => {
  db.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(results[0]);
  });
});

app.listen(PORT, () => {
  console.log(`✅ API server connecté sur http://localhost:${PORT}/api/`);
}); 