import React, { useContext, useState, useEffect } from "react"
import axios from "axios";

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Get the user from local storage on initial load
    const user = sessionStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  });

  console.log(currentUser)

  const [loading, setLoading] = useState(true)

  // Your server's API endpoints
  const API_BASE_URL = "https://browserai.onrender.com/api";

  async function signup(email, password) {
    return axios.post(`${API_BASE_URL}/signup`, {
      email,
      password,
    })
    .then(response => {
      setCurrentUser(response.data.user);
      sessionStorage.setItem("currentUser", JSON.stringify(response.data.user));
      return response;
    })
    .catch(error => {
      console.error("Error creating user:", error.message);
      throw error;
    });
  }
  
  async function login(email, password) {
    return axios.post(`${API_BASE_URL}/login`, {
      email,
      password,
    })
    .then(response => {
      console.log("Login successful:", response.data);
      setCurrentUser(response.data.user);
      sessionStorage.setItem("currentUser", JSON.stringify(response.data.user));
      return response;
    })
    .catch(error => {
      console.error("Error logging in:", error.message);
      throw error;
    });
  }  

  async function logout() {
    try {
      const response = await axios.post(`${API_BASE_URL}/logout`);
      console.log("Logout successful:", response.data);
      setCurrentUser(null); // Clear the current user from state after logout
      sessionStorage.removeItem("currentUser");
    } catch (error) {
      console.error("Error logging out:", error.message);
      throw error;
    }
  }

  useEffect(() => {
    // Function to check user's authentication status on the server
    async function checkAuthStatus() {
      try {
        await axios.get(`${API_BASE_URL}/checkAuthStatus`);
        setLoading(false);
      } catch (error) {
        console.error("Error checking authentication status:", error.message);
        setLoading(false);
      }
    }
    // Call the function to check authentication status on component mount
    checkAuthStatus();
  }, []);


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
