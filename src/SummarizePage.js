import React, { useState, useEffect } from "react";
import { Container, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useDarkMode } from "./App";
import DictionaryWidget from './components/DictionaryWidget';
import ChatBox from "./components/ChatBox";
import TextToVoice from "./components/TextToVoice";
import axios from "axios";
import { FaHistory, FaClipboard, FaFileUpload, FaCheck, FaDownload, FaTrash } from "react-icons/fa";

const SummarizePage = () => {
  const darkMode = useDarkMode();
  const mutedColor = darkMode ? "#aaa" : "#6c757d";

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [error, setError] = useState("");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [copiedText, setCopiedText] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null); // New state for selected history item

  const colors = (darkMode) => ({
    primary: darkMode ? "#4d8bf5" : "#3a6fc9",
    secondary: darkMode ? "#e0e0e0" : "#1e2b3c",
    lightBg: darkMode ? "#1e2b3c" : "#f9f9f9",
    textDark: darkMode ? "#f5f5f5" : "#222",
    cardBg: darkMode ? "#24344e" : "#ffffff",
    sidebarBg: darkMode ? "#1e2b3c" : "#f8f9fa",
    borderColor: darkMode ? "#334a66" : "#e0e0e0",
    hoverBg: darkMode ? "#2a3e5c" : "#f0f0f0",
    buttonText: darkMode ? "#ffffff" : "#ffffff",
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:8000/summaries/");
        const items = response.data.map(item => ({
          id: item._id,
          name: item.filename,
          date: new Date(item.upload_date).toLocaleDateString(),
          summary: item.summary, // Store summary
          advantages: item.advantages || [], // Store advantages
          disadvantages: item.disadvantages || [], // Store disadvantages
          insights: item.insights || [], // Store insights
        }));
        setHistoryItems(items);
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };
    fetchHistory();
  }, []);

  const handleHistoryItemClick = (item) => {
    setSelectedHistoryItem(item); // Set the selected item
    setSummaryResult({
      summary: item.summary,
      advantages: item.advantages,
      disadvantages: item.disadvantages,
      insights: item.insights,
    }); // Display the summary
    setError(""); // Clear any errors
    setFile(null); // Clear current file to indicate we're viewing history
    setFileName("");
    setFileUploaded(false);
  };

  const handleDownloadSummary = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/download-summary/",
        { summary_text: summaryResult.summary },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'research_summary.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError("Failed to download summary");
    }
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/delete-summary/${id}`);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
      if (selectedHistoryItem && selectedHistoryItem.id === id) {
        setSelectedHistoryItem(null);
        setSummaryResult(null); // Clear summary if deleted item was selected
      }
    } catch (error) {
      setError("Failed to delete history item");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFileName(droppedFile.name);
      setFile(droppedFile);
      setSummaryResult(null);
      setError("");
      setFileUploaded(true);
      handleUpload(droppedFile);
      setSelectedHistoryItem(null); // Clear selected history item
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Unsupported file type. Please upload a PDF or Word document.");
      return;
    }
    setFileName(selectedFile.name);
    setFile(selectedFile);
    setSummaryResult(null);
    setError("");
    setFileUploaded(true);
    handleUpload(selectedFile);
    setSelectedHistoryItem(null); // Clear selected history item
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://localhost:8000/upload/", formData);
      const newItem = {
        id: response.data.paper_id,
        name: response.data.filename,
        date: response.data.date || new Date().toLocaleDateString(),
        summary: response.data.summary,
        advantages: [],
        disadvantages: [],
        insights: [],
      };
      setHistoryItems((prev) => [newItem, ...prev]);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSummaryResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("summary_length", summaryLength);
    try {
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setSummaryResult({
          summary: data.summary || "No summary available.",
          advantages: data.advantages || [],
          disadvantages: data.disadvantages || [],
          insights: data.insights || [],
        });
        setSelectedHistoryItem(null); // Clear selected history item
      } else {
        setError(data.error || "Something went wrong while summarizing.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryLengthChange = (length) => {
    setSummaryLength(length);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors(darkMode).lightBg }}>
      {/* Sidebar for History */}
      {showHistory && (
        <div
          style={{
            width: "280px",
            background: colors(darkMode).sidebarBg,
            padding: "1.5rem 1rem",
            borderRight: `1px solid ${colors(darkMode).borderColor}`,
            height: "100vh",
            overflowY: "auto",
            boxShadow: darkMode ? "1px 0 5px rgba(0,0,0,0.2)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
            <FaHistory style={{ marginRight: "0.5rem", color: colors(darkMode).primary }} />
            <h5 style={{ color: colors(darkMode).textDark, margin: 0, fontWeight: "600" }}>History</h5>
          </div>
          {historyItems.length === 0 ? (
            <p style={{ color: mutedColor, fontSize: "0.9rem", textAlign: "center", marginTop: "2rem" }}>
              No history yet
            </p>
          ) : (
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {historyItems.map((item, index) => (
                <li
                  key={item.id}
                  style={{
                    borderBottom: `1px solid ${colors(darkMode).borderColor}`,
                    padding: "0.75rem 0.5rem",
                    borderRadius: "4px",
                    marginBottom: "0.5rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    backgroundColor:
                      selectedHistoryItem?.id === item.id
                        ? colors(darkMode).primary
                        : index === 0
                        ? colors(darkMode).hoverBg
                        : "transparent",
                    color: selectedHistoryItem?.id === item.id ? colors(darkMode).buttonText : colors(darkMode).textDark,
                  }}
                  onClick={() => handleHistoryItemClick(item)}
                  onMouseEnter={(e) =>
                    selectedHistoryItem?.id !== item.id &&
                    (e.currentTarget.style.backgroundColor = colors(darkMode).hoverBg)
                  }
                  onMouseLeave={(e) =>
                    selectedHistoryItem?.id !== item.id &&
                    (e.currentTarget.style.backgroundColor = index === 0 ? colors(darkMode).hoverBg : "transparent")
                  }
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: "0.95rem",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ color: mutedColor, fontSize: "0.8rem", marginTop: "0.25rem" }}>
                        {item.date}
                      </div>
                    </div>
                    <Button
                      variant="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistoryItem(item.id);
                      }}
                      style={{
                        color: selectedHistoryItem?.id === item.id ? colors(darkMode).buttonText : mutedColor,
                        padding: "0.25rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FaTrash size={12} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <Container className="py-4" style={{ maxWidth: "900px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: colors(darkMode).textDark, fontWeight: "700" }}>
              Research Summarizer
            </h2>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline-secondary"
              size="sm"
              style={{
                borderColor: colors(darkMode).borderColor,
                color: colors(darkMode).textDark,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FaHistory size={14} /> {showHistory ? "Hide History" : "Show History"}
            </Button>
          </div>

          <p style={{ color: mutedColor, marginBottom: "2rem", fontSize: "1.1rem" }}>
            Upload your paper and get a concise summary with key advantages and limitations, or select a previous upload from history to view its summary.
          </p>

          {/* File Upload Card */}
          {!selectedHistoryItem && (
            <div
              className={`border rounded p-5 mb-4 text-center`}
              style={{
                borderStyle: isDragging ? "solid" : "dashed",
                borderWidth: isDragging ? "2px" : "1px",
                borderColor: isDragging ? colors(darkMode).primary : colors(darkMode).borderColor,
                backgroundColor: darkMode ? colors(darkMode).cardBg : "#ffffff",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                cursor: "pointer",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Form.Group controlId="formFile" className="mb-3">
                <div style={{ marginBottom: "1.5rem" }}>
                  <FaFileUpload size={48} style={{ color: colors(darkMode).primary, opacity: 0.8 }} />
                </div>
                <p className="fw-bold mb-3" style={{ color: colors(darkMode).textDark, fontSize: "1.2rem" }}>
                  Drag and drop your file here
                </p>
                <p style={{ color: mutedColor }} className="mb-3">or</p>
                <Form.Label
                  className="btn"
                  style={{
                    backgroundColor: colors(darkMode).primary,
                    color: colors(darkMode).buttonText,
                    padding: "0.5rem 1.5rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onMouseOver={(e) => e.target.style.opacity = 0.9}
                  onMouseOut={(e) => e.target.style.opacity = 1}
                >
                  Browse Files
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleFileChange}
                  />
                </Form.Label>
                <p style={{ color: mutedColor, fontSize: "0.875rem", marginTop: "1rem" }}>
                  Supported formats: PDF, DOC, DOCX
                </p>
              </Form.Group>
            </div>
          )}

          {/* File ready message */}
          {fileName && !selectedHistoryItem && (
            <div
              className="alert"
              style={{
                backgroundColor: darkMode ? "#2d3748" : "#e9f5f9",
                color: darkMode ? "#e2e8f0" : "#2a4365",
                border: "none",
                borderLeft: `4px solid ${colors(darkMode).primary}`,
                borderRadius: "4px",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                padding: "1rem 1.25rem",
              }}
            >
              <FaCheck style={{ marginRight: "0.75rem", color: "#48bb78" }} />
              <div>
                <strong>Ready to summarize:</strong> {fileName}
              </div>
            </div>
          )}

          {/* Summary length selection */}
          {fileUploaded && !selectedHistoryItem && (
            <div className="mb-4 text-center" style={{ marginTop: "2rem" }}>
              <div style={{ marginBottom: "1rem", color: colors(darkMode).textDark }}>
                Select summary length:
              </div>
              <div className="d-flex justify-content-center gap-2">
                <Button
                  variant={summaryLength === "short" ? "primary" : "outline-secondary"}
                  style={{
                    backgroundColor: summaryLength === "short" ? colors(darkMode).primary : "transparent",
                    borderColor: summaryLength === "short" ? colors(darkMode).primary : colors(darkMode).borderColor,
                    color: summaryLength === "short" ? colors(darkMode).buttonText : colors(darkMode).textDark,
                    minWidth: "100px",
                  }}
                  onClick={() => handleSummaryLengthChange("short")}
                >
                  Short
                </Button>
                <Button
                  variant={summaryLength === "medium" ? "primary" : "outline-secondary"}
                  style={{
                    backgroundColor: summaryLength === "medium" ? colors(darkMode).primary : "transparent",
                    borderColor: summaryLength === "medium" ? colors(darkMode).primary : colors(darkMode).borderColor,
                    color: summaryLength === "medium" ? colors(darkMode).buttonText : colors(darkMode).textDark,
                    minWidth: "100px",
                  }}
                  onClick={() => handleSummaryLengthChange("medium")}
                >
                  Medium
                </Button>
                <Button
                  variant={summaryLength === "long" ? "primary" : "outline-secondary"}
                  style={{
                    backgroundColor: summaryLength === "long" ? colors(darkMode).primary : "transparent",
                    borderColor: summaryLength === "long" ? colors(darkMode).primary : colors(darkMode).borderColor,
                    color: summaryLength === "long" ? colors(darkMode).buttonText : colors(darkMode).textDark,
                    minWidth: "100px",
                  }}
                  onClick={() => handleSummaryLengthChange("long")}
                >
                  Long
                </Button>
              </div>
            </div>
          )}

          {/* Summarize Button */}
          {!selectedHistoryItem && (
            <div className="text-center mt-4 mb-5">
              <Button
                variant="primary"
                style={{
                  backgroundColor: colors(darkMode).primary,
                  borderColor: colors(darkMode).primary,
                  color: colors(darkMode).buttonText,
                  padding: "0.75rem 2.5rem",
                  fontWeight: "500",
                  borderRadius: "4px",
                  opacity: (!file || loading || !fileUploaded) ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                disabled={!file || loading || !fileUploaded}
                onClick={handleSummarize}
                onMouseOver={(e) => {
                  if (!(!file || loading || !fileUploaded)) {
                    e.target.style.opacity = 0.9;
                  }
                }}
                onMouseOut={(e) => {
                  if (!(!file || loading || !fileUploaded)) {
                    e.target.style.opacity = 1;
                  }
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" style={{ marginRight: "0.5rem" }} />
                    Processing...
                  </>
                ) : (
                  "Summarize Now"
                )}
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert
              variant="danger"
              className="mt-4"
              style={{
                borderRadius: "4px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                border: "none",
                borderLeft: "4px solid #e53e3e",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Summary Output */}
          {summaryResult && (
            <div className="mt-5">
              <div
                className="rounded p-4"
                style={{
                  backgroundColor: darkMode ? colors(darkMode).cardBg : "#ffffff",
                  color: colors(darkMode).textDark,
                  border: `1px solid ${colors(darkMode).borderColor}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 style={{ color: colors(darkMode).primary, fontWeight: "600", margin: 0 }}>
                    {selectedHistoryItem ? `Summary of ${selectedHistoryItem.name}` : "Summary"}
                  </h4>
                  <div className="d-flex gap-2">
                    <Button
                      variant="link"
                      onClick={handleDownloadSummary}
                      style={{
                        color: colors(darkMode).primary,
                        textDecoration: "none",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      <FaDownload size={14} /> Download PDF
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleCopyText(summaryResult.summary)}
                      style={{
                        color: colors(darkMode).primary,
                        textDecoration: "none",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      {copiedText ? "Copied!" : (
                        <>
                          <FaClipboard size={14} /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <p style={{ lineHeight: "1.6", fontSize: "1.05rem" }}>
                  {summaryResult.summary || "No summary available."}
                </p>

                {summaryResult.advantages?.length > 0 && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "1rem",
                      backgroundColor: darkMode ? "rgba(72, 187, 120, 0.1)" : "rgba(72, 187, 120, 0.05)",
                      borderRadius: "4px",
                    }}
                  >
                    <h5 style={{ color: darkMode ? "#68d391" : "#38a169", fontWeight: "600", fontSize: "1.1rem" }}>
                      Advantages
                    </h5>
                    <ul style={{ paddingLeft: "1.5rem", marginTop: "0.75rem" }}>
                      {summaryResult.advantages.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "0.5rem" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summaryResult.disadvantages?.length > 0 && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "1rem",
                      backgroundColor: darkMode ? "rgba(245, 101, 101, 0.1)" : "rgba(245, 101, 101, 0.05)",
                      borderRadius: "4px",
                    }}
                  >
                    <h5 style={{ color: darkMode ? "#fc8181" : "#e53e3e", fontWeight: "600", fontSize: "1.1rem" }}>
                      Disadvantages
                    </h5>
                    <ul style={{ paddingLeft: "1.5rem", marginTop: "0.75rem" }}>
                      {summaryResult.disadvantages.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "0.5rem" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summaryResult.insights?.length > 0 && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "1rem",
                      backgroundColor: darkMode ? "rgba(66, 153, 225, 0.1)" : "rgba(66, 153, 225, 0.05)",
                      borderRadius: "4px",
                    }}
                  >
                    <h5 style={{ color: darkMode ? "#63b3ed" : "#3182ce", fontWeight: "600", fontSize: "1.1rem" }}>
                      Key Insights
                    </h5>
                    <ul style={{ paddingLeft: "1.5rem", marginTop: "0.75rem" }}>
                      {summaryResult.insights.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "0.5rem" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Text to Voice component */}
              <div style={{ marginTop: "1.5rem" }}>
                <TextToVoice summaryText={summaryResult.summary} />
              </div>
            </div>
          )}

          {/* Chat Box */}
          {summaryResult?.summary && (
            <div className="mt-5">
              <div
                className="rounded p-4"
                style={{
                  backgroundColor: darkMode ? colors(darkMode).cardBg : "#ffffff",
                  color: colors(darkMode).textDark,
                  border: `1px solid ${colors(darkMode).borderColor}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 style={{ color: colors(darkMode).primary, fontWeight: "600", margin: 0 }}>
                    Q&A: Ask Questions
                  </h4>
                </div>
                <ChatBox darkMode={darkMode} colors={colors} />
              </div>
            </div>
          )}
        </Container>

        {/* Dictionary Widget */}
        <div style={{ position: "fixed", bottom: "1rem", right: "1rem" }}>
          <DictionaryWidget />
        </div>
      </div>
    </div>
  );
};

export default SummarizePage;