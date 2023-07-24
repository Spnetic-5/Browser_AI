
import firebase from "firebase/app/dist/index.cjs.js"
import 'firebase/firestore/dist/index.cjs.js'
import 'firebase/auth/dist/index.cjs.js'
import express from "express";
import cors from "cors";
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors()); // Enable CORS for all routes


app.get("/api/getData", async (req, res) => {
  const { userEmail } = req.query;

  try {
    // Access your Firebase resources here
    const snapshot = await db
      .collection('prompts')
      .orderBy('timestamp', 'desc')
      .get();

    const userPrompts = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((prompt) => prompt.email === userEmail);

    res.json({ message: "Data fetched from Firebase successfully.", data: userPrompts });
  } catch (error) {
    console.error("Error fetching data from Firestore:", error);
    res.status(500).json({ error: "Error fetching data from Firestore" });
  }
});

// READ
app.get("/api/prompts", async (req, res) => {
  try {
    const snapshot = await db
      .collection("prompts")
      .orderBy("timestamp", "desc")
      .get();

    const prompts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts from Firestore:", error);
    res.status(500).json({ error: "Error fetching prompts from Firestore" });
  }
});

// DELETE
app.delete("/api/prompts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection("prompts").doc(id).delete();
    res.json({ message: "Prompt deleted successfully." });
  } catch (error) {
    console.error("Error deleting prompt from Firestore:", error);
    res.status(500).json({ error: "Error deleting prompt from Firestore" });
  }
});

// CREATE OR UPDATE
app.post("/api/prompts", async (req, res) => {
  const { email, title, description } = req.body;

  if (!email || !title || !description) {
    return res.status(400).json({ error: "All fields are mandatory." });
  }

  const data = {
    email,
    title,
    description,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await db.collection("prompts").add(data);
    res.json({ message: "Prompt created successfully.", id: docRef.id });
  } catch (error) {
    console.error("Error creating prompt in Firestore:", error);
    res.status(500).json({ error: "Error creating prompt in Firestore" });
  }
});

app.get("/api/checkAuthStatus", async (req, res) => {
  try {
    const user = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // Unsubscribe immediately after getting the user data
        resolve(user);
      });
    });

    if (user) {
      // User is authenticated
      res.json({ user: user });
    } else {
      // User is not authenticated
      res.json({ user: null });
    }
  } catch (error) {
    console.error("Error checking authentication status:", error);
    res.status(500).json({ error: "Error checking authentication status" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Use Firebase Authentication to create a new user account
    await auth.createUserWithEmailAndPassword(email, password);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Unsubscribe immediately after getting the user data
      res.json({ user: user });
      resolve(user);
      console.log()
    });    
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Use Firebase Authentication to authenticate the user
    await auth.signInWithEmailAndPassword(email, password);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Unsubscribe immediately after getting the user data
      res.json({ user: user });
      resolve(user);
    });    
    
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Logout
app.post("/api/logout", async (req, res) => {
  try {
    // Use Firebase Authentication to sign out the user
    await auth.signOut();
    res.json({ message: "Logout successful." });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Error logging out" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
