import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import firebase from 'firebase';
import "../styles/dashboard.css";
import { auth, db } from '../server'

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [promptToUpdate, setPromptToUpdate] = useState(null);
  const history = useHistory();

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

  // READ
  useEffect(() => {
    const unsubscribe = db
      ?.collection('prompts')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const userPrompts = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((prompt) => prompt.email === currentUser.email);

        setPrompts(userPrompts);
        setPromptsLoading(false);
      });
    return unsubscribe
  }, [currentUser])


  // DELETE 
  const deletePrompt = async (id) => {
    await db?.collection('prompts')
      .doc(id)
      .delete()
      .catch((error) => alert(error.message));
  };


  // CREATE OR UPDATE 
  const createOrUpdatePrompt = () => {
    if (title && description && currentUser) {
      // setPromptsLoading(true);

      if (promptToUpdate) {
        // Perform update operation
        db.collection('prompts')
          .doc(promptToUpdate.id)
          .update({
            title: title,
            description: description,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          })
          .then(() => {
            // Reset form fields and promptToUpdate state after update
            clearInputFields();
            setPromptToUpdate(null);
          })
          .catch((error) => alert(error.message));
      } else {
        // Perform create operation
        db.collection('prompts')
          .add({
            email: currentUser.email,
            title: title,
            description: description,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          })
          .then(() => {
            // Reset form fields after create
            clearInputFields();
          })
          .catch((error) => alert(error.message));
      }
    } else {
      alert('All fields are mandatory');
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
            <h4 className="text-center m-4 text-2xl font-semibold">Loading your prompts . . .📑️</h4>
          ) : (
            <Card>
              <Card.Body>
                <h2 className="text-center mb-4 text-2xl font-semibold">Your Prompts 📑️</h2>
                {promptsLoading ? (
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
      <div className="logout-container">
        <Button variant="outline-primary" onClick={handleLogout}>
          Log Out
        </Button>

      </div>
    </div>
  );
}
