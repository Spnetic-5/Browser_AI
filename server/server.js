
import firebase from "firebase/app/dist/index.cjs.js"
import 'firebase/firestore/dist/index.cjs.js'
import 'firebase/auth/dist/index.cjs.js'
import express from "express";
import cors from "cors";
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
const port = process.env.PORT || 3000;

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
  const { userEmail } = req.query;
  try {
    const snapshot = await db
      .collection("prompts")
      .orderBy("timestamp", "desc")
      .get();

    const prompts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((prompt) => prompt.email === userEmail);

    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts from Firestore:", error);
    res.status(500).json({ error: "Error fetching prompts from Firestore" });
  }
});

// CREATE / UPDATE
app.post("/api/prompts/:id?", async (req, res) => {
  const { id } = req.params;
  const { email, title, description } = req.body;

  // Check if email is provided (mandatory for both create and update)
  if (!email) {
    return res.status(400).json({ error: "Email is mandatory." });
  }

  const data = {
    email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // If title and description are provided, add them to the data
  if (title) {
    data.title = title;
  }

  if (description) {
    data.description = description;
  }

  try {
    if (id) {
      // Update operation
      await db.collection("prompts").doc(id).set(data, { merge: true });
      res.json({ message: "Prompt updated successfully." });
    } else {
      // Create operation
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are mandatory for prompt creation." });
      }
      const docRef = await db.collection("prompts").add(data);
      res.json({ message: "Prompt created successfully.", id: docRef.id });
    }
  } catch (error) {
    console.error("Error creating/updating prompt in Firestore:", error);
    res.status(500).json({ error: "Error creating/updating prompt in Firestore" });
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
      res.json({ user: user.toJSON() }); // Convert user to JSON before sending
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
