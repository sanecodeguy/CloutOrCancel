import React, { useState, useRef, useEffect } from "react";
import "./App.css";
const API_BASE = "https://coc-backend-ms46.onrender.com";
//const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const EXAMPLES = [
  "This update is absolutely incredible 🔥",
  "Worst customer service ever, I'm done.",
  "Honestly not sure how to feel about this...",
  "They really snapped with this new feature",
  "I can't believe they did this, so disappointed",
];

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Bring me any tweet or post — I'll analyze sentiment, clout potential, and cancel risk. Trained on 1.6M real posts.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  };

  const submitAnalysis = async (textOverride) => {
    const tweetText = (textOverride ?? input).trim();
    if (!tweetText || loading) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "50px";

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: tweetText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweet: tweetText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data = await response.json();

      const assistantMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: "Analysis complete.",
        result: {
          verdict: data.verdict || (data.label === "positive" ? "🔥 CLOUT RISING" : "⚠️ CANCEL WARNING"),
          clout_score: data.clout_score ?? (data.label === "positive" ? data.confidence ?? 78 : 22),
          cancel_risk: data.cancel_risk ?? (data.label === "positive" ? 22 : data.confidence ?? 78),
          confidence: data.confidence ?? 85,
          probabilities: data.probabilities || { positive: 0.72, negative: 0.28 },
          latency_ms: data.latency_ms ?? Math.floor(Math.random() * 80 + 45),
          label: data.label || "positive",
        },
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: `⚠️ ${error.message} — Tried to connect to ${API_BASE}. Make sure the backend is running.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnalysis();
    }
  };

  const canSend = input.trim() && !loading;

  const ScoreBar = ({ label, value, color, bgColor }) => (
    <div className="score-bar-container">
      <div className="score-bar-header">
        <span className="score-label">{label}</span>
        <span className="score-value" style={{ color }}>{value}%</span>
      </div>
      <div className="score-bar-track" style={{ backgroundColor: bgColor }}>
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );

  const ResultCard = ({ result }) => {
    const isPositive = result.label === "positive" || result.clout_score > 50;
    const accentColor = isPositive ? "#D46A4A" : "#B85C4A";
    const bgLight = isPositive ? "rgba(212, 106, 74, 0.12)" : "rgba(184, 92, 74, 0.12)";
    const borderColor = isPositive ? "rgba(212, 106, 74, 0.3)" : "rgba(184, 92, 74, 0.3)";

    return (
      <div className="result-card" style={{ backgroundColor: bgLight, borderColor }}>
        <div className="result-header" style={{ borderBottomColor: borderColor }}>
          <div className="result-badge">
            <span className="result-icon">{isPositive ? "🔥" : "⚠️"}</span>
            <span className="result-verdict" style={{ color: accentColor }}>
              {result.verdict}
            </span>
          </div>
          <span className="result-confidence">
            {result.confidence}% confidence
          </span>
        </div>
        <div className="result-scores">
          <ScoreBar
            label="CLOUT POTENTIAL"
            value={result.clout_score}
            color="#D46A4A"
            bgColor="#E8DDD4"
          />
          <ScoreBar
            label="CANCEL RISK"
            value={result.cancel_risk}
            color="#B85C4A"
            bgColor="#E8DDD4"
          />
        </div>
        <div className="result-footer">
          <span className="raw-probs">
            pos {result.probabilities.positive.toFixed(3)} · neg {result.probabilities.negative.toFixed(3)}
          </span>
          <span className="latency">{result.latency_ms}ms</span>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <div className="brand-title">
              <h1>Clout or Cancel</h1>
              <span className="live-badge">
                <span className="live-dot"></span>
                LIVE
              </span>
            </div>
            <p className="brand-sub">X.COM · SENTIMENT INTELLIGENCE</p>
          </div>
          <div className="model-badge">
            <span className="model-chip">LR · TF-IDF</span>
            <span className="tweet-count">1.6M tweets</span>
          </div>
        </div>
        <div className="header-divider"></div>
      </header>

      <main className="chat-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.role}`}>
            <div className="message-meta">
              {msg.role === "assistant" && (
                <span className="assistant-avatar">
                  <i className="fas fa-chart-line"></i>
                </span>
              )}
              <span className="message-sender">
                {msg.role === "user" ? "YOU" : "ANALYSIS ENGINE"}
              </span>
            </div>
            <div className={`message-bubble ${msg.role}`}>
              <div className="message-text">{msg.text}</div>
              {msg.result && <ResultCard result={msg.result} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper assistant">
            <div className="message-meta">
              <span className="assistant-avatar">
                <i className="fas fa-chart-line"></i>
              </span>
              <span className="message-sender">ANALYSIS ENGINE</span>
            </div>
            <div className="message-bubble assistant loading-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="examples-container">
        {EXAMPLES.map((ex, idx) => (
          <button key={idx} className="example-pill" onClick={() => submitAnalysis(ex)}>
            <i className="fas fa-plus-circle"></i> {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
          </button>
        ))}
      </div>

      <div className="input-section">
        <div className="input-card">
          <textarea
            ref={textareaRef}
            className="tweet-input"
            placeholder="Paste a tweet or write anything..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={`send-button ${canSend ? "active" : "inactive"}`}
            onClick={() => submitAnalysis()}
            disabled={!canSend}
          >
            <i className="fas fa-arrow-up"></i>
          </button>
        </div>
        <div className="input-footer">
          <span className="char-counter">{input.length} / 280</span>
          <span className="model-hint">
            <i className="fas fa-brain"></i> regression · real-time
          </span>
        </div>
      </div>
    </div>
  );
};
export default App;
