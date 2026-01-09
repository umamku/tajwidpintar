import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query 
} from 'firebase/firestore';

// --- ICONS COMPONENT (Fixed Syntax) ---
const IconWrapper = ({ children, size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

const Icons = {
  User: (props) => (<IconWrapper {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconWrapper>),
  Book: (props) => (<IconWrapper {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></IconWrapper>),
  Send: (props) => (<IconWrapper {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></IconWrapper>),
  Mic: (props) => (<IconWrapper {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></IconWrapper>),
  MicOff: (props) => (<IconWrapper {...props}><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></IconWrapper>),
  Play: (props) => (<IconWrapper {...props}><polygon points="5 3 19 12 5 21 5 3"/></IconWrapper>),
  Stop: (props) => (<IconWrapper {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></IconWrapper>),
  File: (props) => (<IconWrapper {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></IconWrapper>),
  Upload: (props) => (<IconWrapper {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconWrapper>),
  Loader: (props) => (<IconWrapper {...props} className={`animate-spin ${props.className || ''}`}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></IconWrapper>),
  Plus: (props) => (<IconWrapper {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></IconWrapper>),
  Trash2: (props) => (<IconWrapper {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></IconWrapper>),
  Edit: (props) => (<IconWrapper {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></IconWrapper>),
  Save: (props) => (<IconWrapper {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconWrapper>),
  ArrowLeft: (props) => (<IconWrapper {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></IconWrapper>),
  Search: (props) => (<IconWrapper {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></IconWrapper>),
  X: (props) => (<IconWrapper {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IconWrapper>),
  Shield: (props) => (<IconWrapper {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconWrapper>),
  Tag: (props) => (<IconWrapper {...props}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></IconWrapper>),
  Lock: (props) => (<IconWrapper {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconWrapper>),
  Eye: (props) => (<IconWrapper {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></IconWrapper>),
  EyeOff: (props) => (<IconWrapper {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></IconWrapper>),
  Copy: (props) => (<IconWrapper {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></IconWrapper>),
  Check: (props) => (<IconWrapper {...props}><polyline points="20 6 9 17 4 12"/></IconWrapper>),
  Camera: (props) => (<IconWrapper {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></IconWrapper>)
};

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDVyx5OZFRuUmB4Haq57urwiwOjzTR8tQw",
  authDomain: "tajwidpintar.firebaseapp.com",
  projectId: "tajwidpintar",
  storageBucket: "tajwidpintar.firebasestorage.app",
  messagingSenderId: "842067523940",
  appId: "1:842067523940:web:30a4e6ba820fa09d2d2271",
  measurementId: "G-LPQQP068K8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'tajwid-app-production';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// --- API HELPERS (IMPROVED PROMPT) ---
async function askGemini(question, knowledgeContext, imageData = null) {
  const cleanKey = apiKey ? apiKey.trim() : "";
  if (!cleanKey) return "Error: API Key kosong/salah.";

  const targetModel = "gemini-2.5-flash"; 
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`;

  // PROMPT DIPERBAIKI: 
  // 1. Dilarang menyebut "ID" atau "Kesesuaian Data".
  // 2. Diminta menjawab natural (Langsung jelaskan hukumnya).
  const systemPrompt = `
    Anda adalah Asisten Ustadz dalam bidang Ilmu Tajwid Al-Qur'an dari Markaz Qur'an Darussalam.
    
    INSTRUKSI UTAMA:
    1. Jawablah dengan gaya bahasa ustadz yang ramah, langsung pada inti penjelasan ilmunya.
    2. GUNAKAN informasi dari [CONTEXT DATA] sebagai dasar ilmu Anda secara implisit (tersirat).
    3. PENTING: JANGAN PERNAH menyebutkan "Berdasarkan data context", "ID: xyz", atau "Kesesuaian dengan data". Hal itu dilarang.
    4. Jika menganalisis gambar:
       - Langsung jelaskan hukum tajwid apa yang terlihat di gambar.
       - Jelaskan alasannya menggunakan teori yang ada di Context Data secara natural (contoh: "Ini adalah Ikhfa Syafawi karena Mim Mati bertemu Ba...").
       - Jangan membuat daftar perbandingan teknis. Langsung berikan ilmunya.

    [CONTEXT DATA MULAI]
    ${knowledgeContext}
    [CONTEXT DATA SELESAI]
  `;
  
  const finalPrompt = systemPrompt + "\n\n" + "PERTANYAAN USER: " + (question || "Jelaskan hukum tajwid pada gambar ini.");

  const parts = [{ text: finalPrompt }];
  
  if (imageData) {
      parts.push({
          inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.base64
          }
      });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: parts }] })
    });
    const data = await response.json();
    if (data.error) return `Error AI: ${data.error.message}`;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI tidak memberikan jawaban.";
  } catch (error) {
    return "Maaf, koneksi internet terganggu.";
  }
}

async function extractTextFromImage(base64Data, mimeType) {
  const cleanKey = apiKey ? apiKey.trim() : "";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${cleanKey}`;  
  const payload = {
    contents: [{
      parts: [
        { text: "Transkripsikan seluruh teks yang ada di dalam gambar ini dengan akurat untuk keperluan database ilmu Tajwid. Abaikan hiasan, fokus pada materi teksnya." },
        { inlineData: { mimeType: mimeType, data: base64Data } }
      ]
    }]
  };
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    throw new Error("Gagal membaca gambar.");
  }
}

// --- COMPONENTS ---
const Navbar = ({ currentMode, setMode, isAdminAuthenticated, setIsAdminModeAttempt }) => (
  <nav className="bg-teal-900 text-white shadow-lg sticky top-0 z-50 border-b border-amber-500/30">
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-amber-200 overflow-hidden w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center relative">
          <img src="https://i.ibb.co.com/xSB9ct1R/Logo-Markaz-OKE-1.jpg" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback').style.display = 'flex'; }} />
          <div className="fallback hidden items-center justify-center text-teal-800 w-full h-full absolute inset-0 bg-white"><Icons.Book size={24} /></div>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-lg sm:text-2xl font-bold tracking-tight leading-none">Tajwid<span className="text-amber-400">Pintar</span></span>
          <span className="text-[10px] sm:text-xs text-teal-100 font-medium tracking-wide mt-0.5 sm:mt-1 opacity-90 line-clamp-1">Markaz Qur'an Darussalam</span>
        </div>
      </div>
      <div className="flex bg-teal-800/50 rounded-full p-1 border border-teal-700 backdrop-blur-sm shrink-0">
        <button onClick={() => setMode('user')} className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${currentMode === 'user' ? 'bg-amber-500 text-teal-950 shadow-md font-bold' : 'text-teal-100 hover:text-white hover:bg-teal-700'}`}>
          <Icons.User size={14} className="mr-1.5 sm:mr-2" /><span className="hidden sm:inline">Tanya Ustadz</span><span className="sm:hidden">Tanya</span>
        </button>
        <button onClick={() => isAdminAuthenticated ? setMode('admin') : setIsAdminModeAttempt(true)} className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${currentMode === 'admin' ? 'bg-white text-teal-800 shadow-md font-bold' : 'text-teal-100 hover:text-white hover:bg-teal-700'}`}>
          <Icons.Shield size={14} className="mr-1.5 sm:mr-2" />Admin
        </button>
      </div>
    </div>
  </nav>
);

const AdminLogin = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Gagal login. Periksa email/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="bg-teal-900 p-6 text-center relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-teal-300 hover:text-white transition"><Icons.X size={20}/></button>
          <div className="bg-teal-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"><Icons.Lock size={32} className="text-amber-400" /></div>
          <h2 className="text-xl font-bold text-white">Login Admin</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email</label><input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition p-2">{showPassword ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}</button></div></div>
          {error && <div className="p-3 rounded-lg text-sm bg-red-100 text-red-700 border border-red-200 flex items-center gap-2"><Icons.Shield size={16} /><span>{error}</span></div>}
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg transition disabled:opacity-50 flex justify-center items-center gap-2">{loading ? <Icons.Loader size={20} /> : 'Masuk'}</button>
        </form>
      </div>
    </div>
  );
};

const ChatInterface = ({ knowledgeList }) => {
  const [messages, setMessages] = useState([{ id: 1, role: 'ai', text: 'Assalamu’alaikum. Saya Asisten Tajwid dari Markaz Qur\'an Darussalam. Silakan tanyakan hukum bacaan, minta contoh bacaan, atau kirim foto ayat/gambar untuk saya jelaskan hukum tajwidnya.' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(null);
  
  // --- STATES GAMBAR ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const speak = (text, msgId) => {
    window.speechSynthesis.cancel();
    if (isSpeaking === msgId) { setIsSpeaking(null); return; }
    const cleanText = text.replace(/\[\[AUDIO:\s*[^\]]+\]\]/g, '').replace(/\*\*/g, '').replace(/[\(\)]/g, '').trim();
    if (!cleanText) return;
    const sentences = cleanText.match(/[^\.!\?]+[\.!\?]+/g) || [cleanText];
    let currentSentence = 0;
    const speakNext = () => {
      if (currentSentence < sentences.length) {
        const u = new SpeechSynthesisUtterance(sentences[currentSentence]);
        u.lang = 'id-ID'; u.rate = 1.0;
        u.onstart = () => setIsSpeaking(msgId);
        u.onend = () => { currentSentence++; if (currentSentence < sentences.length) speakNext(); else setIsSpeaking(null); };
        window.speechSynthesis.speak(u);
      }
    };
    speakNext();
  };

  const copyToClipboard = (text, msgId) => {
    const cleanText = text.replace(/\[\[AUDIO:\s*[^\]]+\]\]/g, '').replace(/\*\*/g, '');
    navigator.clipboard.writeText(cleanText).then(() => { setCopiedId(msgId); setTimeout(() => setCopiedId(null), 2000); });
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const findAudioData = (id) => { const item = knowledgeList.find(k => k.id === id); return item ? item.audioData : null; };

  const renderMessageContent = (text) => {
    const parts = text.split(/(\[\[AUDIO:\s*[^\]]+\]\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[\[AUDIO:\s*([^\]]+)\]\]/);
      if (match) {
        const audioId = match[1].trim().replace(/[.,!?;:]$/, '');
        const audioSrc = findAudioData(audioId);
        if (audioSrc) return <div key={index} className="mt-3 mb-3 bg-teal-50 p-3 rounded-xl border border-teal-200 shadow-sm"><p className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2"><span className="bg-teal-600 text-white p-1 rounded-full"><Icons.Play size={14}/></span>Contoh Bacaan:</p><audio controls className="w-full h-8" src={audioSrc} /></div>;
        return <span key={index} className="text-xs text-amber-600 italic bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1 inline-block">(Audio belum tersedia)</span>;
      }
      return <span key={index}>{part.split(/\*\*(.*?)\*\*/g).map((s, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-teal-900">{s}</strong> : s)}</span>;
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => {
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;
    
    const userText = input.trim() ? input : (selectedImage ? "Mohon jelaskan hukum tajwid pada gambar ini." : "");
    const userMsg = { 
        id: Date.now(), 
        role: 'user', 
        text: userText,
        imagePreview: imagePreview 
    };

    setMessages(p => [...p, userMsg]); setInput(''); setIsTyping(true);

    let imageDataForAI = null;
    if (selectedImage) {
        try {
            imageDataForAI = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve({
                        base64: event.target.result.split(',')[1],
                        mimeType: selectedImage.type
                    });
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(selectedImage);
            });
        } catch (err) {
            alert("Gagal memproses gambar.");
            setIsTyping(false);
            clearImageSelection();
            return;
        }
    }

    const history = messages.slice(-5).map(m => `${m.role === 'user' ? 'USER' : 'USTADZ'}: ${m.text}`).join('\n');
    const context = knowledgeList.map(i => `MATERI: ${i.title}\nISI: ${i.content}\n${i.audioData ? `[AUDIO_ID: ${i.id}]` : ''}\n---`).join('\n');
    
    // Prompt sudah ditanam di dalam fungsi askGemini agar lebih bersih
    const ans = await askGemini(userMsg.text, context, imageDataForAI);
    
    setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: ans }]); 
    setIsTyping(false);
    clearImageSelection(); 
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) { alert("Browser tidak support voice."); return; }
    const r = new window.webkitSpeechRecognition();
    r.lang = 'id-ID'; r.onstart = () => setIsListening(true); r.onend = () => setIsListening(false);
    r.onresult = (e) => setInput(e.results[0][0].transcript); r.start();
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-white rounded-xl shadow-xl overflow-hidden border border-teal-100">
      <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-teal-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[88%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-slate-700 border-slate-600' : 'bg-teal-600 border-teal-500'}`}><Icons.User size={16} className="text-white" /></div>
              <div className={`relative group p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-none' : 'bg-white text-slate-800 border border-teal-100 rounded-tl-none'}`}>
                {msg.role === 'user' && (
                  <button onClick={() => copyToClipboard(msg.text, msg.id)} className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-teal-600 transition z-10">{copiedId === msg.id ? <Icons.Check size={12} className="text-green-500" /> : <Icons.Copy size={12} />}</button>
                )}
                {msg.role === 'ai' ? (
                  <div className="flex flex-col">
                    <div className="whitespace-pre-wrap">{renderMessageContent(msg.text)}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => speak(msg.text, msg.id)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${isSpeaking === msg.id ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 hover:text-teal-600'}`}>{isSpeaking === msg.id ? <><Icons.Stop size={12} className="animate-pulse" /> STOP</> : <><Icons.Play size={12} /> DENGAR</>}</button>
                      <button onClick={() => copyToClipboard(msg.text, msg.id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-slate-50 text-slate-400 hover:text-teal-600 border-slate-100 transition">{copiedId === msg.id ? <><Icons.Check size={12} className="text-green-500"/> DISALIN</> : <><Icons.Copy size={12} /> SALIN</>}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                      {msg.imagePreview && <img src={msg.imagePreview} alt="Sent" className="h-16 w-auto rounded-lg mb-2 border border-slate-200" />}
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && <div className="ml-10"><div className="bg-white border p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm"><Icons.Loader size={14} className="text-teal-500 animate-spin" /><span className="text-xs text-slate-400">Sedang menganalisis...</span></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-teal-100 relative">
        {imagePreview && (
            <div className="absolute bottom-full left-0 w-full bg-slate-50 p-3 border-t border-teal-100 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-300" />
                    <button onClick={clearImageSelection} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition"><Icons.X size={12} /></button>
                </div>
                <span className="text-xs text-slate-500 truncate flex-1">{selectedImage?.name || "Gambar terpilih"}</span>
            </div>
        )}

        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />

          <div className="flex gap-1 shrink-0">
             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full border shadow-sm bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition" title="Kirim Gambar/Foto"><Icons.Camera size={20} /></button>
             <button type="button" onClick={handleVoiceInput} className={`p-3 rounded-full border shadow-sm transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-teal-600'}`} title="Rekam Suara">{isListening ? <Icons.MicOff size={20} /> : <Icons.Mic size={20} />}</button>
          </div>

          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-teal-100 outline-none text-sm" placeholder={selectedImage ? "Tambahkan keterangan..." : "Tanya / Foto..."} value={input} onChange={(e) => setInput(e.target.value)} disabled={isTyping} />
          <button type="submit" disabled={(!input.trim() && !selectedImage) || isTyping} className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition shadow-md disabled:opacity-50"><Icons.Send size={18} /></button>
        </form>
      </div>
    </div>
  );
};

const AdminPanel = ({ knowledgeList, user, collectionPath }) => {
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState({ title: '', category: '', content: '', tags: '', source: '', audioData: '' });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const existingSources = useMemo(() => [...new Set(knowledgeList.map(i => i.source).filter(s => s))], [knowledgeList]);
  const filteredList = useMemo(() => knowledgeList.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.category.toLowerCase().includes(searchTerm.toLowerCase())), [knowledgeList, searchTerm]);

  const handleSave = async (e) => {
    e.preventDefault(); if (!user) return; setIsSubmitting(true);
    try {
      const data = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(t => t), updatedAt: serverTimestamp() };
      if (editingId) await updateDoc(doc(db, ...collectionPath, editingId), data);
      else await addDoc(collection(db, ...collectionPath), { ...data, createdAt: serverTimestamp() });
      setView('list'); setFormData({ title: '', category: '', content: '', tags: '', source: '', audioData: '' });
    } catch (err) { alert('Gagal simpan.'); } finally { setIsSubmitting(false); }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        let text = ev.target.result;
        if (file.type.startsWith('image/')) text = await extractTextFromImage(text.split(',')[1], file.type);
        setFormData(p => ({ ...p, content: text }));
      } catch (err) { alert('Gagal baca file.'); }
    };
    if (file.type.startsWith('image/')) reader.readAsDataURL(file); else reader.readAsText(file);
  };

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center mb-6"><button onClick={() => setView('list')} className="mr-4 p-2 rounded-full hover:bg-slate-200"><Icons.ArrowLeft size={24} /></button><h2 className="text-xl font-bold">{editingId ? 'Edit' : 'Baru'}</h2></div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          {!editingId && <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50"><Icons.File size={32} className="mx-auto mb-2 text-slate-400" /><p className="text-sm">Upload Dokumen/Gambar untuk Auto-Isi</p><input type="file" ref={fileInputRef} className="hidden" /></div>}
          <input className="w-full px-4 py-2 border rounded-xl" placeholder="Judul" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          <select className="w-full px-4 py-2 border rounded-xl" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}><option value="">Kategori...</option><option value="Hukum Nun Mati">Hukum Nun Mati</option><option value="Hukum Mad">Hukum Mad</option><option value="Makharijul Huruf">Makharijul Huruf</option><option value="Lainnya">Lainnya</option></select>
          <input className="w-full px-4 py-2 border rounded-xl" placeholder="Tags (koma)" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
          <input list="srcs" className="w-full px-4 py-2 border rounded-xl" placeholder="Sumber Kitab" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} /><datalist id="srcs">{existingSources.map((s, i) => <option key={i} value={s} />)}</datalist>
          <div className="flex gap-2"><input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setFormData({ ...formData, audioData: ev.target.result }); r.readAsDataURL(f); } }} /><button type="button" onClick={() => audioInputRef.current?.click()} className="flex-1 border p-2 rounded-xl flex justify-center gap-2"><Icons.Upload size={16} /> Upload Audio</button>{formData.audioData && <button type="button" onClick={() => setFormData({ ...formData, audioData: '' })} className="text-red-500 p-2 border rounded-xl"><Icons.Trash2 size={16} /></button>}</div>
          <textarea className="w-full px-4 py-2 border rounded-xl min-h-[200px]" placeholder="Konten..." value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
          <div className="flex justify-end gap-2"><button onClick={() => setView('list')} className="px-4 py-2 border rounded-lg">Batal</button><button onClick={handleSave} disabled={isSubmitting} className="px-6 py-2 bg-teal-600 text-white rounded-lg">{isSubmitting ? <Icons.Loader size={18} className="animate-spin" /> : 'Simpan'}</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border"><h2 className="font-bold text-teal-900">Database</h2><button onClick={() => { setEditingId(null); setFormData({ title: '', category: '', content: '', tags: '', source: '', audioData: '' }); setView('form'); }} className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2"><Icons.Plus size={18} /> Tambah</button></div>
      <div className="relative"><input className="w-full pl-10 px-4 py-2 border rounded-xl" placeholder="Cari..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /><Icons.Search className="absolute left-3 top-2.5 text-slate-400" size={18} /></div>
      <div className="grid gap-3">{filteredList.map(item => (
        <div key={item.id} className="bg-white p-4 rounded-xl border flex justify-between">
          <div><h3 className="font-bold">{item.title}</h3><span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">{item.category}</span></div>
          <div className="flex gap-2"><button onClick={() => { setEditingId(item.id); setFormData({ title: item.title, category: item.category, content: item.content, tags: item.tags.join(', '), source: item.source || '', audioData: item.audioData || '' }); setView('form'); }} className="p-2 text-teal-600 border rounded-lg"><Icons.Edit size={16} /></button><button onClick={async () => { if (confirm('Hapus?')) await deleteDoc(doc(db, ...collectionPath, item.id)); }} className="p-2 text-red-600 border rounded-lg"><Icons.Trash2 size={16} /></button></div>
        </div>
      ))}</div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('user');
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const collectionPath = ['artifacts', appId, 'public', 'data', 'tajwid_knowledge'];

  useEffect(() => { const unsub = onAuthStateChanged(auth, u => { setUser(u); if (u && !u.isAnonymous) { setMode('admin'); setShowLoginModal(false); } else if (!u) signInAnonymously(auth).catch(console.error); setLoading(false); }); return () => unsub(); }, []);
  useEffect(() => { if (!user) return; const unsub = onSnapshot(query(collection(db, ...collectionPath)), s => { setKnowledgeList(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))); }); return () => unsub(); }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <Navbar currentMode={mode} setMode={setMode} isAdminAuthenticated={user && !user.isAnonymous} setIsAdminModeAttempt={setShowLoginModal} />
      {showLoginModal && <AdminLogin onClose={() => setShowLoginModal(false)} />}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {!user || loading ? <div className="flex justify-center pt-20 text-slate-400"><Icons.Loader size={32} className="animate-spin" /></div> : mode === 'admin' && user && !user.isAnonymous ? <AdminPanel knowledgeList={knowledgeList} user={user} collectionPath={collectionPath} /> : <div className="max-w-3xl mx-auto"><div className="text-center mb-6"><h1 className="text-2xl font-bold text-teal-900">Tajwid<span className="text-amber-500">Pintar</span></h1><p className="text-slate-500 text-sm">Asisten Cerdas Markaz Qur'an Darussalam</p></div><ChatInterface knowledgeList={knowledgeList} /></div>}
      </main>
      <footer className="text-center py-6 text-[10px] text-slate-400">© 2026 Markaz Qur'an Darussalam • v1.1.3 Stable (Natural Response Fixed)</footer>
    </div>
  );
}