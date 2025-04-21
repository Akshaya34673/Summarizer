import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Card, Spinner } from "react-bootstrap";

const ChatBox = ({ darkMode, colors }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);  // Store previous questions and answers

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("question", question);

      const res = await axios.post("http://localhost:8000/chat/", formData);

      // Append the new question and answer to history
      setHistory([
        ...history,
        { question, answer: res.data.answer || "No answer received." },
      ]);

      setQuestion(""); // Clear the input field
    } catch (error) {
      console.error("Error:", error);
      setHistory([
        ...history,
        { question, answer: "Something went wrong." },
      ]);
      setQuestion(""); // Clear the input field
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="p-3 my-3"
      style={{
        backgroundColor: "var(--light-color)",
        color: "var(--text-color)",
        borderColor: "var(--text-light)",
      }}
    >
      {/* Display the history of questions and answers */}
      {history.length > 0 && (
        <div>
          {history.map((item, index) => (
            <div key={index} style={{ marginBottom: "20px", clear: "both" }}>
              {/* Question Bubble - Right */}
              <div
                style={{
                  display: "inline-block",
                  maxWidth: "60%",
                  backgroundColor: "var(--text-light)", // Change this color as needed
                  color: "white",
                  borderRadius: "15px",
                  padding: "10px 20px",
                  marginBottom: "10px",
                  textAlign: "left",
                  float: "right", // Makes the question bubble float to the right
                }}
              >
                <strong>Q: </strong>{item.question}
              </div>

              {/* Answer Bubble - Left */}
              <div
                style={{
                  display: "inline-block",
                  maxWidth: "60%",
                  backgroundColor: "var(--text-light)", // Change this color as needed
                  color: "black",
                  borderRadius: "15px",
                  padding: "10px 20px",
                  marginLeft: "10px",
                  textAlign: "left",
                  float: "left", // Makes the answer bubble float to the left
                }}
              >
                <strong>A: </strong>{item.answer}
              </div>

              {/* Clear float after the pair */}
              <div style={{ clear: "both" }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Question Form */}
      <Form onSubmit={handleAsk}>
        <Form.Group controlId="chatQuestion">
          <Form.Label style={{ color: "var(--primary-color)" }}>
            Ask a Question
          </Form.Label>
          <Form.Control
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question about the paper..."
            required
            style={{
              backgroundColor: "var(--light-color)", // Or "#2c3e50" for dark background
              color: "var(--text-color)", // This makes sure typed text is visible
              border: "1px solid var(--text-light)",
              caretColor: "var(--text-color)", // Makes blinking cursor visible too
            }}
          />
        </Form.Group>
        <Button className="mt-2" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Ask"}
        </Button>
      </Form>
    </Card>
  );
};

export default ChatBox;
