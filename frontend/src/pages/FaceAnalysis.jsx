import React, { useState, useRef } from "react";
import {
  Camera, Upload, Sparkles, User, Palette, Scissors,
  Sun, Heart, Star, RefreshCw, ChevronRight, Wand2, Volume2, MessageSquare, Send
} from "lucide-react";

const FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"];
const SKIN_TONES = ["Fair", "Light", "Medium", "Olive", "Tan", "Dark"];
const HAIR_TYPES = ["Straight", "Wavy", "Curly", "Coily"];

const HAIRSTYLE_SUGGESTIONS = {
  Oval: ["Layered cuts", "Side-swept bangs", "Long bob", "Pixie cut", "Beach waves"],
  Round: ["Long layers", "Side part", "Asymmetric bob", "High bun", "Volume on top"],
  Square: ["Soft layers", "Side-swept fringe", "Textured bob", "Loose waves", "Chin-length bob"],
  Heart: ["Side-parted bangs", "Medium layers", "Chin-length bob", "Soft curls", "Long waves"],
  Oblong: ["Bangs/Fringe", "Medium length", "Chin-length bob", "Side volume", "Layered cut"],
  Diamond: ["Side-swept bangs", "Chin-length styles", "Textured layers", "Bob cut", "Shoulder length"],
};

const SKINCARE_SUGGESTIONS = {
  Fair: ["SPF 50+ sunscreen daily", "Vitamin C serum", "Gentle cleanser", "Hyaluronic acid moisturizer"],
  Light: ["SPF 30-50 sunscreen", "Niacinamide serum", "AHA exfoliant", "Brightening cream"],
  Medium: ["SPF 30 sunscreen", "Retinol serum", "Glycolic cleanser", "Hydrating mask"],
  Olive: ["SPF 30 sunscreen", "Vitamin E cream", "Salicylic acid cleanser", "Anti-oxidant serum"],
  Tan: ["SPF 30 sunscreen", "Turmeric face pack", "Aloe vera gel", "Coconut oil moisturizer"],
  Dark: ["SPF 30 sunscreen", "Shea butter moisturizer", "Dark spot corrector", "Vitamin C serum"],
};

const COLOR_SUGGESTIONS = {
  Fair: ["Honey blonde", "Strawberry red", "Light brown", "Platinum highlights"],
  Light: ["Caramel brown", "Auburn red", "Warm blonde", "Chocolate lowlights"],
  Medium: ["Chestnut brown", "Copper highlights", "Dark caramel", "Burgundy"],
  Olive: ["Dark chocolate", "Warm auburn", "Espresso", "Mahogany"],
  Tan: ["Dark brown", "Deep burgundy", "Caramel highlights", "Black cherry"],
  Dark: ["Blue-black", "Deep plum", "Dark copper", "Espresso"],
};

export default function FaceAnalysis() {
  const [step, setStep] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [faceShape, setFaceShape] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [hairType, setHairType] = useState("");
  const [gender, setGender] = useState("women");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const fileRef = useRef();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setStep(1);
        setTimeout(() => {
          setFaceShape(FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)]);
          setSkinTone(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]);
          setHairType(HAIR_TYPES[Math.floor(Math.random() * HAIR_TYPES.length)]);
          setStep(2);
        }, 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setStep(0);
    setImagePreview(null);
    setFaceShape("");
    setSkinTone("");
    setHairType("");
    setChatMessages([]);
  };

  const synthesizeVoice = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      setIsSpeaking(true);
      const text = `Based on our AI analysis, you have a ${faceShape} face shape, ${skinTone} skin tone, and ${hairType} hair. We recommend styles like ${(HAIRSTYLE_SUGGESTIONS[faceShape] || HAIRSTYLE_SUGGESTIONS.Oval).slice(0, 2).join(" and ")}. For your skin, try ${(SKINCARE_SUGGESTIONS[skinTone] || SKINCARE_SUGGESTIONS.Medium).slice(0, 2).join(" and ")}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { role: "user", text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput("");
    // Mock AI response
    setTimeout(() => {
      setChatMessages([...newMsgs, { role: "ai", text: `I'd be happy to help you with ${chatInput.toLowerCase()}! Considering your ${faceShape} face shape, that would look fantastic.` }]);
    }, 1000);
  };

  return (
    <div className="up-page">
      <div className="up-page-header">
        <div className="up-page-header-icon"><Wand2 size={24} /></div>
        <div>
          <h1>Virtual Beauty Check</h1>
          <p>AI-powered face analysis and personalized beauty recommendations</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="up-face-steps">
        {["Upload Photo", "AI Analysis", "Customize", "Results"].map((label, i) => (
          <div key={label} className={`up-face-step ${step >= i ? "active" : ""} ${step === i ? "current" : ""}`}>
            <div className="up-face-step-num">{i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="up-face-upload up-animate-in">
          <div className="up-face-upload-box" onClick={() => fileRef.current?.click()}>
            <div className="up-face-upload-icon"><Camera size={48} /></div>
            <h3>Upload Your Photo</h3>
            <p>Take a clear selfie or upload a front-facing photo for best results</p>
            <button className="up-btn up-btn-primary"><Upload size={18} /> Choose Photo</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>
          <div className="up-face-gender">
            <button className={`up-pill ${gender === "women" ? "active" : ""}`} onClick={() => setGender("women")}>Women</button>
            <button className={`up-pill ${gender === "men" ? "active" : ""}`} onClick={() => setGender("men")}>Men</button>
          </div>
          <div className="up-face-tips">
            <h4>Tips for best results:</h4>
            <ul>
              <li>Use a front-facing photo with good lighting</li>
              <li>Remove glasses and accessories</li>
              <li>Keep your hair away from your face</li>
              <li>Use a plain background</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 1: Analyzing */}
      {step === 1 && (
        <div className="up-face-analyzing up-animate-in">
          <div className="up-face-analyzing-preview">
            <img src={imagePreview} alt="Your photo" />
            <div className="up-face-scan-overlay"><div className="up-face-scan-line" /></div>
          </div>
          <div className="up-face-analyzing-text">
            <span className="spinner" />
            <h3>Analyzing your features...</h3>
            <p>Our AI is detecting face shape, skin tone, and features</p>
          </div>
        </div>
      )}

      {/* Step 2: Customize */}
      {step === 2 && (
        <div className="up-face-customize up-animate-in">
          <div className="up-face-preview-card">
            <img src={imagePreview} alt="Your photo" />
            <div className="up-face-detected-badge"><Sparkles size={14} /> AI Detected</div>
          </div>
          <div className="up-face-options">
            <h3>Detected Features</h3>
            <p>Adjust if needed for more accurate results</p>

            <div className="up-face-option-group">
              <label><User size={16} /> Face Shape</label>
              <div className="up-face-pills">
                {FACE_SHAPES.map((s) => (
                  <button key={s} className={`up-pill ${faceShape === s ? "active" : ""}`}
                    onClick={() => setFaceShape(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="up-face-option-group">
              <label><Sun size={16} /> Skin Tone</label>
              <div className="up-face-pills">
                {SKIN_TONES.map((s) => (
                  <button key={s} className={`up-pill ${skinTone === s ? "active" : ""}`}
                    onClick={() => setSkinTone(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="up-face-option-group">
              <label><Scissors size={16} /> Hair Type</label>
              <div className="up-face-pills">
                {HAIR_TYPES.map((s) => (
                  <button key={s} className={`up-pill ${hairType === s ? "active" : ""}`}
                    onClick={() => setHairType(s)}>{s}</button>
                ))}
              </div>
            </div>

            <button className="up-btn up-btn-primary up-btn-lg" style={{ width: "100%", marginTop: "1rem" }}
              onClick={() => setStep(3)}>
              <Sparkles size={18} /> Get Recommendations <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <div className="up-face-results up-animate-in">
          <div className="up-face-results-header">
            <img src={imagePreview} alt="You" className="up-face-results-photo" />
            <div className="up-face-results-profile">
              <h2>Your Beauty Profile</h2>
              <div className="up-face-results-tags">
                <span className="up-tag"><User size={13} /> {faceShape} Face</span>
                <span className="up-tag"><Sun size={13} /> {skinTone} Skin</span>
                <span className="up-tag"><Scissors size={13} /> {hairType} Hair</span>
              </div>
            </div>
          </div>

          <div className="up-face-results-grid">
            <div className="up-face-result-card">
              <div className="up-face-result-header"><Scissors size={20} /> <h3>Recommended Hairstyles</h3></div>
              <ul className="up-face-result-list">
                {(HAIRSTYLE_SUGGESTIONS[faceShape] || HAIRSTYLE_SUGGESTIONS.Oval).map((s) => (
                  <li key={s}><Star size={13} /> {s}</li>
                ))}
              </ul>
            </div>
            <div className="up-face-result-card">
              <div className="up-face-result-header"><Heart size={20} /> <h3>Skincare Routine</h3></div>
              <ul className="up-face-result-list">
                {(SKINCARE_SUGGESTIONS[skinTone] || SKINCARE_SUGGESTIONS.Medium).map((s) => (
                  <li key={s}><Star size={13} /> {s}</li>
                ))}
              </ul>
            </div>
            <div className="up-face-result-card">
              <div className="up-face-result-header"><Palette size={20} /> <h3>Hair Color Recommendations</h3></div>
              <ul className="up-face-result-list">
                {(COLOR_SUGGESTIONS[skinTone] || COLOR_SUGGESTIONS.Medium).map((s) => (
                  <li key={s}><Star size={13} /> {s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wand2 size={20} color="var(--primary)" /> AI Beauty Assistant</h3>
              <button 
                onClick={synthesizeVoice} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isSpeaking ? 'var(--primary)' : 'var(--primary-glow)', color: isSpeaking ? 'white' : 'var(--primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <Volume2 size={16} /> {isSpeaking ? "Stop Speaking" : "Listen to Results"}
              </button>
            </div>
            
            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem', height: '200px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {chatMessages.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto', fontSize: '0.9rem' }}>
                  <MessageSquare size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p>Ask our AI assistant anything about your results or style!</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--primary)' : 'white', color: msg.role === 'user' ? 'white' : 'var(--text)', padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '80%', fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    {msg.text}
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleChat} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="E.g., What hair color suits me?" 
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
              />
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 1.2rem', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </form>
          </div>

          <div className="up-btn-group" style={{ justifyContent: "center", marginTop: "2rem" }}>
            <button className="up-btn up-btn-outline" onClick={reset}><RefreshCw size={18} /> Try Again</button>
            <button className="up-btn up-btn-primary" onClick={() => window.location.href = "/booking"}>
              <Scissors size={18} /> Book a Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
