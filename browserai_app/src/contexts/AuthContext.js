import React, { useContext, useState, useEffect } from "react"
import axios from "axios";
import {auth} from "../server.js"

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  // Your server's API endpoints
  const API_BASE_URL = "http://localhost:3000/api";

  async function signup(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        email,
        password,
      });
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Error creating user:", error.message);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });
      console.log("Login successful:", response.data);
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Error logging in:", error.message);
      throw error;
    }
  }

  async function logout() {
    try {
      const response = await axios.post(`${API_BASE_URL}/logout`);
      console.log("Logout successful:", response.data);
      setCurrentUser(null); // Clear the current user from state after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log(user);
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])


  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
