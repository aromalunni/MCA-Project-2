import React, { useState, useEffect, useRef, useCallback } from "react";
import { chatAPI, ttsAPI } from "../services/api";
import {
  BotMessageSquare, X, Send, User, Sparkles,
  Mic, MicOff, Volume2, VolumeX, Globe, ChevronDown,
  Scissors, Calendar, MapPin, Package, Star, PhoneCall,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const QUICK_REPLIES = [
  { label: "Services & Pricing", icon: Scissors },
  { label: "Book Appointment", icon: Calendar },
  { label: "Salon Locations", icon: MapPin },
  { label: "Loyalty Points", icon: Star },
  { label: "Beauty Store", icon: Package },
  { label: "Contact Support", icon: PhoneCall },
];

// Malayalam greeting / note
const LANG_GREETINGS = {
  "en-IN": "Ask in English or Malayalam 🌟",
  "ml-IN": "മലയാളത്തിൽ ചോദിക്കൂ 🌟",
};

export default function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState("en-IN");
  const [speaking, setSpeaking] = useState(false);
  const messagesEnd = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null); // for gTTS audio playback
  const sendMessageRef = useRef(null);

  // Re-init recognition when language changes
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => {
        if (sendMessageRef.current) sendMessageRef.current(transcript);
      }, 300);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [language]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser. Please use Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try { recognitionRef.current.start(); setIsListening(true); } catch (e) {}
    }
  }, [isListening]);

  // Use backend gTTS for real Malayalam TTS
  const speakText = useCallback(async (text) => {
    if (!voiceEnabled) return;
    // Stop current audio if any
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeaking(true);

    const cleanText = text
      .replace(/[#*`_~]/g, "")
      .replace(/\n+/g, ". ")
      .slice(0, 500); // limit

    // lang code for gTTS: 'ml' for Malayalam, 'en' for English
    const langCode = language === "ml-IN" ? "ml" : "en";

    try {
      const res = await ttsAPI.speak(cleanText, langCode);
      const url = URL.createObjectURL(res.data);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setSpeaking(false);
      await audio.play();
    } catch (e) {
      setSpeaking(false);
      // Silent fallback — don't crash the UI
    }
  }, [voiceEnabled, language]);

  useEffect(() => {
    if (isOpen && !loaded && user) loadHistory();
  }, [isOpen, user, loaded]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const cleanMessage = (msg) => {
    if (!msg) return "";
    return msg
      .replace(/^(SmartSalon Assistant:|Bot:|AI:|System:|Assistant:)\s*/i, "")
      .replace(/(\b.{10,})\b(\s+\1)+/gi, "$1") // remove near-duplicate sentences
      .trim();
  };

  const loadHistory = async () => {
    try {
      const res = await chatAPI.history();
      setMessages(res.data);
    } catch {
      setMessages([{
        id: 0,
        is_bot: true,
        message: "Hello! Welcome to SmartSalon 💎\nHow can I help you today?\n(Supports English & Malayalam voice)",
        created_at: new Date().toISOString(),
      }]);
    }
    setLoaded(true);
  };

  const sendMessage = async (text) => {
    const msg = (typeof text === "string" ? text : input).trim();
    if (!msg || sending) return;

    setMessages((prev) => [...prev, {
      id: Date.now(), is_bot: false, message: msg,
      created_at: new Date().toISOString(),
    }]);
    setInput("");
    setSending(true);

    try {
      const prompt = language === "ml-IN" ? `[Please reply in Malayalam language] ${msg}` : msg;
      const res = await chatAPI.send({ message: prompt });
      const botResponse = cleanMessage(res.data.response || res.data.message || "");
      setMessages((prev) => [...prev, {
        id: res.data.id, is_bot: true, message: botResponse,
        created_at: res.data.created_at,
      }]);
      speakText(botResponse);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, is_bot: true,
        message: "Sorry, I'm having trouble connecting. Please try again!",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  sendMessageRef.current = sendMessage;

  if (!user) return null;

  const isML = language === "ml-IN";

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 62, height: 62,
          background: isOpen
            ? "linear-gradient(135deg, #1e293b, #334155)"
            : "linear-gradient(135deg, #6c47ff 0%, #ec4899 100%)",
          boxShadow: isOpen
            ? "0 4px 16px rgba(0,0,0,0.3)"
            : "0 8px 28px rgba(108,71,255,0.45)",
          border: "none",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        aria-label="Open Chat"
      >
        {isOpen ? <X size={26} color="white" /> : <BotMessageSquare size={26} color="white" />}
        {!isOpen && <span className="chatbot-pulse" />}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="chatbot-window" style={{
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(108,71,255,0.18), 0 6px 20px rgba(0,0,0,0.1)",
          border: "1px solid rgba(108,71,255,0.15)",
        }}>

          {/* Header */}
          <div className="chatbot-header" style={{
            background: "linear-gradient(135deg, #6c47ff 0%, #a855f7 60%, #ec4899 100%)",
            padding: "1rem 1.25rem",
          }}>
            <div className="chatbot-header-info">
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                flexShrink: 0,
              }}>
                <Sparkles size={20} color="white" />
              </div>
              <div>
                <h4 style={{ color: "white", fontWeight: 800, fontSize: "0.95rem", marginBottom: 1 }}>
                  SmartSalon AI
                </h4>
                <span style={{
                  fontSize: "0.72rem", color: "rgba(255,255,255,0.85)", display: "flex",
                  alignItems: "center", gap: 4,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80" }} />
                  {isListening ? (isML ? "കേൾക്കുന്നു..." : "Listening...") : (isML ? "ഓൺലൈൻ" : "Online")}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(isML ? "en-IN" : "ml-IN")}
                title={isML ? "Switch to English" : "Switch to Malayalam"}
                style={{
                  background: isML ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  color: "white", padding: "4px 10px", borderRadius: 8,
                  fontSize: "0.72rem", fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s",
                }}
              >
                <Globe size={13} />
                {isML ? "മലയ" : "ENG"}
              </button>
              {/* Voice Toggle */}
              <button
                onClick={() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setSpeaking(false); } setVoiceEnabled(!voiceEnabled); }}
                title={voiceEnabled ? "Mute" : "Unmute voice"}
                style={{
                  background: voiceEnabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "white", width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)",
                  color: "white", width: 32, height: 32, borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Language hint strip */}
          <div style={{
            background: isML
              ? "linear-gradient(90deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))"
              : "rgba(108,71,255,0.04)",
            borderBottom: "1px solid rgba(108,71,255,0.08)",
            padding: "5px 14px",
            fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Globe size={11} />{LANG_GREETINGS[language]}
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6c47ff, #ec4899)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1rem", boxShadow: "0 8px 24px rgba(108,71,255,0.35)",
                }}>
                  <Sparkles size={28} color="white" />
                </div>
                <h4>SmartSalon AI Assistant</h4>
                <p>{isML ? "നിങ്ങൾക്ക് എന്ത് സഹായം നൽകട്ടെ?" : "How can I help you today?"}</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.is_bot ? "bot" : "user"}`}>
                <div className="chat-message-avatar" style={{
                  background: msg.is_bot
                    ? "linear-gradient(135deg, rgba(108,71,255,0.12), rgba(236,72,153,0.08))"
                    : "#f1f5f9",
                  border: msg.is_bot ? "1px solid rgba(108,71,255,0.15)" : "1px solid #e2e8f0",
                }}>
                  {msg.is_bot
                    ? <BotMessageSquare size={15} color="#6c47ff" />
                    : <User size={15} color="#64748b" />}
                </div>
                <div className="chat-message-bubble">
                  <p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
                    {cleanMessage(msg.response || msg.message)}
                  </p>
                  <span className="chat-time">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {sending && (
              <div className="chat-message bot">
                <div className="chat-message-avatar" style={{ background: "rgba(108,71,255,0.1)" }}>
                  <BotMessageSquare size={15} color="#6c47ff" />
                </div>
                <div className="chat-message-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="chatbot-quick-replies" style={{ padding: "0.75rem 1rem", gap: "0.5rem" }}>
              {QUICK_REPLIES.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(label)}
                  className="quick-reply-btn"
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="chatbot-input" style={{
            borderTop: "1px solid rgba(108,71,255,0.1)",
            padding: "0.75rem 1rem",
            background: "white",
          }}>
            <button
              className={`chatbot-mic-btn ${isListening ? "listening" : ""}`}
              onClick={toggleListening}
              title={isListening ? "Stop" : (isML ? "ശബ്ദം ഉപയോഗിക്കുക" : "Voice input")}
              style={{
                background: isListening
                  ? "linear-gradient(135deg, #ef4444, #f97316)"
                  : "var(--primary-glow)",
                color: isListening ? "white" : "var(--primary)",
              }}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
            <input
              type="text"
              placeholder={
                isListening
                  ? (isML ? "കേൾക്കുന്നു..." : "Listening...")
                  : (isML ? "മലയാളത്തിൽ ടൈപ്പ് ചെയ്യൂ..." : "Type a message...")
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={sending}
              style={{ fontFamily: isML ? "'Noto Sans Malayalam', sans-serif, inherit" : "inherit" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #6c47ff, #ec4899)"
                  : "#e2e8f0",
                color: input.trim() ? "white" : "#94a3b8",
                transition: "all 0.2s",
              }}
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
