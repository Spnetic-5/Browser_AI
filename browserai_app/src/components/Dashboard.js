import React, { useState, useEffect, useCallback } from "react";
import { Card, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import "../styles/dashboard.css";
import axios from "axios";

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [promptToUpdate, setPromptToUpdate] = useState(null);
  const history = useHistory();

  const API_BASE_URL = "https://browserai.onrender.com/api";

  const handleUpdate = (id) => {
    const promptToUpdate = prompts.find((prompt) => prompt.id === id);
    if (promptToUpdate) {
      setPromptToUpdate(promptToUpdate)
      setTitle(promptToUpdate.title);
      setDescription(promptToUpdate.description);
    }
  };

  const handleLogout = async () => {
    setError("");
    try {
      await logout();
      history.push("/login");
    } catch {
      setError("Failed to log out");
    }
  };

  const fetchPrompts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/prompts?userEmail=${currentUser.email}`);
      setPrompts(response.data);
      setPromptsLoading(false);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      setPromptsLoading(false);
    }
  }, [currentUser]);

  // READ
  useEffect(() => {
    if (currentUser) {
      fetchPrompts();
    }
  }, [currentUser, fetchPrompts]);

  // DELETE
  const deletePrompt = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/prompts/${id}`);
      fetchPrompts();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      alert("Error deleting prompt.");
    }
  };

  // CREATE OR UPDATE
  const createOrUpdatePrompt = async () => {
    if (title && description && currentUser) {
      try {

        if (promptToUpdate) {
          // Perform update operation
          await axios.post(`${API_BASE_URL}/prompts/${promptToUpdate.id}`, {
            email: currentUser.email,
            title: title,
            description: description,
          });
          fetchPrompts();
        } else {
          // Perform create operation
          await axios.post(`${API_BASE_URL}/prompts`, {
            email: currentUser.email,
            title: title,
            description: description,
          });
          fetchPrompts();
        }

        // Reset form fields and promptToUpdate state after create/update
        clearInputFields();
      } catch (error) {
        console.error("Error creating/updating prompt:", error);
        alert("Error creating/updating prompt.");
      }
    } else {
      alert("All fields are mandatory");
      setPromptsLoading(false);
    }
  };


  const clearInputFields = () => {
    setDescription('')
    setTitle('')
    setPromptsLoading(false);
    setPromptToUpdate(null);
  }

  return (

    <div className="container mx-auto p-4">
       <div className="logout-container">
      <h4 className="text-center m-4 font-semibold">{currentUser.email}</h4>
        <Button variant="outline-primary" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
      <h1 className="heading text-center text-4xl font-bold mb-4">BrowserAi: ChatGPT Promts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Card with Form */}
        <div className="form-card">
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4 text-2xl font-semibold">Add or Update Prompt</h2>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-input mb-2 p-2 w-full border rounded-md"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-input mb-2 p-2 w-full border rounded-md"
                  rows="4"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="button-container-add">
                <Button variant="primary" onClick={createOrUpdatePrompt}>
                  {promptToUpdate ? "Update Prompt" : "Add Prompt"}
                </Button>
                <div className="cancel-container">
                  <Button variant="outline-primary" onClick={() => clearInputFields()}>
                    Cancel
                  </Button>
                </div>
              </div>
              {error && <p className="error">{error}</p>}
            </Card.Body>
          </Card>
        </div>

        {/* Right side - Prompts Cards List */}
        <div className="prompts-list">
          {promptsLoading ? (
            <h4 className="text-center m-4 text-2xl font-semibold">Loading your prompts . . . <span role="img" aria-label="doc"> 📑️ </span></h4>
          ) : (
            <Card>
              <Card.Body>
                <h2 className="text-center mb-4 text-2xl font-semibold">Your Prompts <span role="img" aria-label="list"> 📑️ </span></h2>
                {prompts.length > 0 ? (
                  <ul>
                    {prompts?.map((prompt) => (
                      <li key={prompt.id} className="mb-2">
                        <div className="border p-4 rounded-md shadow-md">
                          <h4 className="font-semibold text-xl">{prompt.title}</h4>
                          <p className="text-gray-600">{prompt.description}</p>
                          {/* {prompt.responses && <p className="text-gray-600">{prompt.responses}</p>} */}
                          <div className="button-container-update">
                            <Button variant="success" className="mr-2" onClick={() => handleUpdate(prompt.id)}>
                              Update
                            </Button>
                            <Button variant="danger" className="mr-2" onClick={() => deletePrompt(prompt.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <h4 className="text-center mb-4 text-2xl font-semibold">You have not added prompts yet!</h4>
                )
                }
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
