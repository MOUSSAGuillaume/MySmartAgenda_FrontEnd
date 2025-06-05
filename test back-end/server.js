const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8000; // Car ton script.js utilise : http://127.0.0.1:8000/api/

app.use(cors({
  origin: "http://localhost", // ou "http://localhost:80" ou même "*"
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json()); // ✅ recommandé avec Express moderne


// Base de données simulée
let todoList = [];
let appointments = [];

const fakeUser = {
  id: 1,
  name: "Alice Express",
  email: "alice@mock.com",
  role: "client",
  token: "fake-token"
};

// Middleware d’authentification simple
const authMiddleware = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (token !== fakeUser.token) {
    return res.status(403).json({ message: "Non autorisé" });
  }
  next();
};

// Route de connexion
app.post("/api/login", (req, res) => {
  const { email, mdp } = req.body;
  if (email === "alice@exemple.com" && mdp === "Azerty@11") {
    return res.json({
      apiToken: fakeUser.token,
      roles: ["client"]
    });
  }
  return res.status(401).json({ message: "Identifiants invalides" });
});

// Simule /account/me
app.get("/api/account/me", authMiddleware, (req, res) => {
  return res.json(fakeUser);
});

// Todo List
app.get("/api/todos", authMiddleware, (req, res) => res.json(todoList));
app.post("/api/todos", authMiddleware, (req, res) => {
  const newTodo = { id: Date.now(), ...req.body };
  todoList.push(newTodo);
  res.status(201).json(newTodo);
});

// RDV
app.get("/api/rdv", authMiddleware, (req, res) => res.json(appointments));
app.post("/api/rdv", authMiddleware, (req, res) => {
  const newRdv = { id: Date.now(), ...req.body };
  appointments.push(newRdv);
  res.status(201).json(newRdv);
});

// Démarrage
app.listen(PORT, () => {
  console.log(`✅ Fake API server running at http://127.0.0.1:${PORT}/api/`);
});
