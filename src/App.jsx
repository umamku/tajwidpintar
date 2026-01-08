import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
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
import { getAnalytics } from "firebase/analytics";


// --- INLINE ICONS (STABIL & MANDIRI) ---
const IconWrapper = ({ children, size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

const Icons = {
  User: (props) => (
    <IconWrapper {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconWrapper>
  ),
  Book: (props) => (
    <IconWrapper {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></IconWrapper>
  ),
  Send: (props) => (
    <IconWrapper {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></IconWrapper>
  ),
  Mic: (props) => (
    <IconWrapper {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></IconWrapper>
  ),
  MicOff: (props) => (
    <IconWrapper {...props}><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></IconWrapper>
  ),
  Play: (props) => (
    <IconWrapper {...props}><polygon points="5 3 19 12 5 21 5 3"/></IconWrapper>
  ),
  Stop: (props) => (
    <IconWrapper {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></IconWrapper>
  ),
  File: (props) => (
    <IconWrapper {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></IconWrapper>
  ),
  Upload: (props) => (
    <IconWrapper {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></IconWrapper>
  ),
  Loader: (props) => (
    <IconWrapper {...props} className={`animate-spin ${props.className || ''}`}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></IconWrapper>
  ),
  Plus: (props) => (
    <IconWrapper {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></IconWrapper>
  ),
  Trash2: (props) => (
    <IconWrapper {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></IconWrapper>
  ),
  Edit: (props) => (
    <IconWrapper {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></IconWrapper>
  ),
  Save: (props) => (
    <IconWrapper {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconWrapper>
  ),
  ArrowLeft: (props) => (
    <IconWrapper {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></IconWrapper>
  ),
  Search: (props) => (
    <IconWrapper {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></IconWrapper>
  ),
  X: (props) => (
    <IconWrapper {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IconWrapper>
  ),
  Shield: (props) => (
    <IconWrapper {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconWrapper>
  ),
  Tag: (props) => (
    <IconWrapper {...props}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></IconWrapper>
  ),
  Lock: (props) => (
    <IconWrapper {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconWrapper>
  ),
  Eye: (props) => (
    <IconWrapper {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></IconWrapper>
  ),
  EyeOff: (props) => (
    <IconWrapper {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></IconWrapper>
  )
};

// --- Configuration ---

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVyx5OZFRuUmB4Haq57urwiwOjzTR8tQw",
  authDomain: "tajwidpintar.firebaseapp.com",
  projectId: "tajwidpintar",
  storageBucket: "tajwidpintar.firebasestorage.app",
  messagingSenderId: "842067523940",
  appId: "1:842067523940:web:30a4e6ba820fa09d2d2271",
  measurementId: "G-LPQQP068K8"
};


// Pastikan inisialisasi ini HANYA ADA SATU KALI
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);


// Konfigurasi ID Aplikasi
const appId = 'tajwid-app-production';

// API Key Gemini
const apiKey = "AIzaSyBF4Pp_Iqngxsbf7aealTu2MMRlP7FMo8o";

// --- SECURITY UTILITIES ---
// Menggunakan Base64 Encoding untuk "AdminMQD" agar tidak plain text di source code
const SECURE_TOKEN = "QWRtaW5NUUQ="; // Base64 dari "AdminMQD"

async function verifyPassword(inputPassword) {
  const cleanPassword = inputPassword.trim();
  
  // Metode 1: Coba Base64 Comparison (Kompatibilitas Tinggi)
  try {
    if (btoa(cleanPassword) === SECURE_TOKEN) return true;
  } catch (e) {
    console.error("Encoding error", e);
  }

  return false;
}

// --- Helper: Call Gemini API (Text Only) ---
async function askGemini(question, knowledgeContext) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `
    Anda adalah Asisten Ustadz dalam Ilmu Tajwid Al-Qur'an dari Markaz Qur'an Darussalam.
    Tugas Anda adalah menjawab pertanyaan user tentang hukum bacaan, cara membaca, dan kaidah tajwid HANYA berdasarkan CONTEXT yang diberikan di bawah ini.
    
    ATURAN PENTING:
    1. Jawab dengan sopan, menggunakan Bahasa Indonesia yang baik, dan sapaan yang santun.
    2. Gunakan informasi HANYA dari bagian "CONTEXT DATA".
    3. Jika jawaban ditemukan, SELALU sebutkan "Sumber Kitab/Rujukan" jika tersedia di data.
    4. Jika data memiliki Audio ID (ditandai dengan [AUDIO_ID: ...]), dan user meminta contoh bacaan atau relevan untuk diperdengarkan, sertakan tag khusus: "[[AUDIO: ...]]" di akhir atau di bagian yang relevan dalam jawaban Anda.
       Contoh: "Berikut adalah contoh bacaannya: [[AUDIO: doc123]]"
       PENTING: JANGAN PERNAH membuat tag [[AUDIO: ...]] jika data konteks memiliki tanda [NO_AUDIO].
       PENTING: Tulis ID audio persis seperti yang ada di context, jangan tambahkan tanda baca di dalamnya.
    5. Gunakan format **bold** untuk penekanan kata penting.
    6. Jika jawaban tidak ditemukan dalam CONTEXT, katakan: "Maaf, ilmu mengenai hal tersebut belum tersedia di database kami."
    7. Jangan mengarang hukum tajwid sendiri.

    CONTEXT DATA (KNOWLEDGE BANK):
    ${knowledgeContext}
  `;

  const payload = {
    contents: [{ parts: [{ text: question }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, terjadi kesalahan saat memproses jawaban.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, koneksi ke layanan AI terganggu.";
  }
}

// --- Helper: Call Gemini API for Image Extraction (OCR) ---
async function extractTextFromImage(base64Data, mimeType) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
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
    console.error("OCR Error:", error);
    throw new Error("Gagal membaca gambar.");
  }
}

// --- Components ---

const Navbar = ({ currentMode, setMode, isAdminAuthenticated, setIsAdminModeAttempt }) => (
  <nav className="bg-teal-900 text-white shadow-lg sticky top-0 z-50 border-b border-amber-500/30">
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center gap-2">
      <div className="flex items-center gap-3">
        {/* LOGO AREA */}
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-amber-200 overflow-hidden w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center relative">
          <img 
            src="https://i.ibb.co.com/xSB9ct1R/Logo-Markaz-OKE-1.jpg" 
            alt="Logo Markaz Qur'an" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
            }}
          />
          {/* Fallback Icon */}
          <div className="fallback-icon hidden items-center justify-center text-teal-800 w-full h-full absolute inset-0 bg-white">
             <Icons.Book size={24} />
          </div>
        </div>
        
        {/* TEXT AREA */}
        <div className="flex flex-col justify-center">
          <span className="text-lg sm:text-2xl font-bold tracking-tight leading-none">
            Tajwid<span className="text-amber-400">Pintar</span>
          </span>
          <span className="text-[10px] sm:text-xs text-teal-100 font-medium tracking-wide mt-0.5 sm:mt-1 opacity-90 line-clamp-1">
            Markaz Qur'an Darussalam
          </span>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex bg-teal-800/50 rounded-full p-1 border border-teal-700 backdrop-blur-sm shrink-0">
        <button
          onClick={() => setMode('user')}
          className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
            currentMode === 'user' 
              ? 'bg-amber-500 text-teal-950 shadow-md font-bold' 
              : 'text-teal-100 hover:text-white hover:bg-teal-700'
          }`}
        >
          <Icons.User size={14} className="mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Tanya Ustadz</span>
          <span className="sm:hidden">Tanya</span>
        </button>
        <button
          onClick={() => {
            if (isAdminAuthenticated) {
              setMode('admin');
            } else {
              setIsAdminModeAttempt(true); // Trigger Login Modal
            }
          }}
          className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
            currentMode === 'admin' 
              ? 'bg-white text-teal-800 shadow-md font-bold' 
              : 'text-teal-100 hover:text-white hover:bg-teal-700'
          }`}
        >
          <Icons.Shield size={14} className="mr-1.5 sm:mr-2" />
          Admin
        </button>
      </div>
    </div>
  </nav>
);

// --- SECURITY: ADMIN LOGIN COMPONENT ---
const AdminLogin = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Check lockout on mount
  useEffect(() => {
    const lockUntil = localStorage.getItem('adminLockoutUntil');
    if (lockUntil && new Date().getTime() < parseInt(lockUntil)) {
      setIsLocked(true);
      const remaining = Math.ceil((parseInt(lockUntil) - new Date().getTime()) / 1000);
      setTimeLeft(remaining);
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.ceil((parseInt(lockUntil) - now) / 1000);
        if (diff <= 0) {
          setIsLocked(false);
          localStorage.removeItem('adminLockoutUntil');
          clearInterval(timer);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError('');

    // Artificial delay untuk mencegah brute force (Timing Attack mitigation)
    await new Promise(r => setTimeout(r, 1000)); 

    const isValid = await verifyPassword(password);

    if (isValid) {
      onLogin();
    } else {
      // Logic lockout sederhana
      const currentAttempts = parseInt(localStorage.getItem('adminLoginAttempts') || '0') + 1;
      localStorage.setItem('adminLoginAttempts', currentAttempts.toString());
      
      setError('Password salah.');
      
      // Lockout setelah 3 kali gagal
      if (currentAttempts >= 3) {
        const lockTime = 30000; // 30 detik
        const unlockAt = new Date().getTime() + lockTime;
        localStorage.setItem('adminLockoutUntil', unlockAt.toString());
        localStorage.setItem('adminLoginAttempts', '0'); // Reset attempts after locking
        
        setIsLocked(true);
        setTimeLeft(30);
        setError('Terlalu banyak percobaan. Akses dikunci sementara.');
        
        // Start countdown locally
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsLocked(false);
              localStorage.removeItem('adminLockoutUntil');
              setError('');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    setLoading(false);
  };

  return (
    // Menggunakan fixed inset-0 dengan flex dan padding untuk memastikan centered di mobile
    // Menambahkan max-h dan overflow untuk konten modal agar tidak tertutup keyboard
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <div className="bg-teal-900 p-6 text-center relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-teal-300 hover:text-white transition"><Icons.X size={20}/></button>
          <div className="bg-teal-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Icons.Lock size={32} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Area Terbatas</h2>
          <p className="text-teal-200 text-xs mt-1">Hanya untuk Admin Markaz Qur'an</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password Admin</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || isLocked}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition p-2"
                disabled={loading || isLocked}
              >
                {showPassword ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${isLocked ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              <Icons.Shield size={16} className="shrink-0 mt-0.5" />
              <span>{error} {isLocked && <strong>({timeLeft}s)</strong>}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || isLocked || !password}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Icons.Loader size={20} /> : 'Masuk'}
          </button>
        </form>
        <div className="bg-slate-50 p-3 text-center text-[10px] text-slate-400 border-t border-slate-100 shrink-0">
          Sistem dilindungi dengan Anti-Bruteforce & Enkripsi
        </div>
      </div>
    </div>
  );
};

// --- USER VIEW: Chat & Voice Interface ---
const ChatInterface = ({ knowledgeList }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'ai', 
      text: 'Assalamu’alaikum. Saya Asisten Tajwid dari Markaz Qur\'an Darussalam. Silakan tanyakan hukum bacaan, makharijul huruf, atau minta contoh bacaan.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper to find audio data by ID
  const findAudioData = (id) => {
    const item = knowledgeList.find(k => k.id === id);
    return item ? item.audioData : null;
  };

  // Render message content with Audio Player AND Markdown Bold Support
  const renderMessageContent = (text) => {
    // 1. Split by Audio Tags first
    const parts = text.split(/(\[\[AUDIO:\s*[^\]]+\]\])/g);
    
    return parts.map((part, index) => {
      // Check if this part is an Audio Tag
      const match = part.match(/\[\[AUDIO:\s*([^\]]+)\]\]/);
      if (match) {
        const rawId = match[1].trim();
        const audioId = rawId.replace(/[.,!?;:]$/, ''); 
        const audioSrc = findAudioData(audioId);
        
        if (audioSrc) {
          return (
            <div key={index} className="mt-3 mb-3 bg-teal-50 p-3 sm:p-4 rounded-xl border border-teal-200 shadow-sm">
              <p className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
                <div className="bg-teal-600 text-white p-1 rounded-full"><Icons.Play size={14}/></div>
                Contoh Bacaan:
              </p>
              <audio controls className="w-full h-8 sm:h-10" src={audioSrc} />
            </div>
          );
        } else {
          return <span key={index} className="text-xs text-amber-600 italic bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1 inline-block">(Audio untuk materi ini belum tersedia)</span>;
        }
      }

      // 2. Process Text for Markdown Bold (**text**)
      const textParts = part.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={index}>
          {textParts.map((subPart, i) => {
            if (i % 2 === 1) {
              return <strong key={i} className="font-bold text-teal-900">{subPart}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  // Voice Recognition Setup
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Maaf, browser Anda tidak mendukung fitur input suara.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const contextString = knowledgeList.map(item => 
      `ID: ${item.id}
MATERI: ${item.title}
KATEGORI: ${item.category}
SUMBER KITAB: ${item.source || 'Tidak disebutkan'}
PENJELASAN: ${item.content}
KEYWORD: ${item.tags.join(', ')}
${item.audioData ? `[AUDIO_ID: ${item.id}]` : '[NO_AUDIO]'}
---`
    ).join('\n');

    const answer = await askGemini(userMsg.text, contextString);

    const aiMsg = { id: Date.now() + 1, role: 'ai', text: answer };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    // Menggunakan dvh untuk viewport height yang dinamis di mobile
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-teal-100">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-teal-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[88%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 sm:gap-3`}>
              {/* Avatar */}
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.role === 'user' ? 'bg-slate-700 border-slate-600' : 'bg-teal-600 border-teal-500'}`}>
                {msg.role === 'user' ? <Icons.User size={16} className="text-white" /> : <Icons.User size={16} className="text-white" />}
              </div>
              <div className={`p-3 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-teal-100 rounded-tl-none'
              }`}>
                {msg.role === 'ai' ? (
                  <div className="whitespace-pre-wrap">
                    {renderMessageContent(msg.text)}
                  </div>
                ) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start ml-10 sm:ml-12">
            <div className="bg-white border border-teal-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              <Icons.Loader size={14} className="text-teal-500 animate-spin" />
              <span className="text-xs text-slate-400 font-medium ml-2">Sedang mencari dalil...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 sm:p-4 bg-white border-t border-teal-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 border flex items-center justify-center shadow-sm ${
              isListening 
                ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-teal-600'
            }`}
            title="Tekan untuk bicara"
          >
            {isListening ? <Icons.MicOff size={20} /> : <Icons.Mic size={20} />}
          </button>

          <input
            type="text"
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition text-slate-700 placeholder:text-slate-400 text-sm sm:text-base"
            placeholder={isListening ? "Mendengarkan..." : "Ketik pertanyaan..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition disabled:opacity-50 shadow-md"
          >
            <Icons.Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ADMIN VIEW: Upload & Input ---
const AdminPanel = ({ knowledgeList, user, collectionPath }) => {
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState({ title: '', category: '', content: '', tags: '', source: '', audioData: '' });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ title: '', category: '', content: '', tags: '', source: '', audioData: '' });
    setView('form');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      tags: item.tags ? item.tags.join(', ') : '',
      source: item.source || '',
      audioData: item.audioData || ''
    });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus materi ini?')) {
      try {
        await deleteDoc(doc(db, ...collectionPath, id));
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { 
      alert("Ukuran file audio terlalu besar (Maks 500KB). Mohon gunakan durasi pendek.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setFormData(prev => ({ ...prev, audioData: event.target.result }));
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (blob.size > 500000) { alert("Rekaman terlalu besar."); return; }
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, audioData: reader.result }));
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Error:", err);
      alert("Gagal mengakses mikrofon.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteAudio = () => setFormData(prev => ({ ...prev, audioData: '' }));

  const processFile = async (file) => {
    if (!file) return;
    if (file.type === "text/plain" || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setFormData(prev => ({
          ...prev,
          content: prev.content ? prev.content + "\n\n" + text : text,
          title: prev.title || file.name.replace(/\.[^/.]+$/, "")
        }));
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      setIsAnalyzingImage(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result.split(',')[1];
          const extractedText = await extractTextFromImage(base64Data, file.type);
          setFormData(prev => ({
            ...prev,
            content: prev.content ? prev.content + "\n\n[Dari Gambar]: " + extractedText : "[Dari Gambar]: " + extractedText,
            title: prev.title || "Scan Materi Tajwid"
          }));
        } catch (err) {
          alert("Gagal membaca teks dari gambar.");
        } finally {
          setIsAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Format file tidak didukung.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChangeFile = (e) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        processFile(blob);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t), 
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(db, ...collectionPath, editingId), dataToSave);
      } else {
        await addDoc(collection(db, ...collectionPath), { ...dataToSave, createdAt: serverTimestamp() });
      }
      setView('list'); setEditingId(null);
      setFormData({ title: '', category: '', content: '', tags: '', source: '', audioData: '' });
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = useMemo(() => {
    return knowledgeList.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [knowledgeList, searchTerm]);

  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300" onPaste={handlePaste}>
        <div className="flex items-center mb-6">
          <button onClick={() => setView('list')} className="mr-3 sm:mr-4 p-2 rounded-full hover:bg-slate-200 text-slate-600 transition">
            <Icons.ArrowLeft size={24} />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{editingId ? 'Edit Materi' : 'Input Baru'}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-8 space-y-6">
            {!editingId && (
              <div 
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors cursor-pointer ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-teal-50'}`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {isAnalyzingImage ? (
                  <div className="flex flex-col items-center text-teal-600 animate-pulse">
                    <Icons.Loader size={32} className="animate-spin mb-2" />
                    <p className="font-medium mt-2 text-sm">Sedang memproses gambar...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center gap-4 mb-3 text-slate-400"><Icons.File size={32} /></div>
                    <p className="text-slate-700 font-medium mb-1 text-sm sm:text-base">Upload Dokumen / Gambar</p>
                    <p className="text-xs text-slate-500 mb-4">Paste gambar atau Drag & Drop file di sini</p>
                    <input type="file" ref={fileInputRef} onChange={handleChangeFile} className="hidden" accept=".txt,.md,.png,.jpg,.jpeg,.webp" />
                    <button type="button" className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs sm:text-sm hover:bg-slate-100 transition shadow-sm">Pilih File Manual</button>
                  </>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Materi</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition" placeholder="Contoh: Hukum Ikhfa Syafawi" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                  <div className="relative">
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none bg-white text-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                      <option value="">Pilih Kategori...</option>
                      <option value="Hukum Nun Mati & Tanwin">Hukum Nun Mati & Tanwin</option>
                      <option value="Hukum Mim Mati">Hukum Mim Mati</option>
                      <option value="Hukum Mad">Hukum Mad</option>
                      <option value="Hukum Idgham">Hukum Idgham</option>
                      <option value="Qalqalah">Qalqalah</option>
                      <option value="Makharijul Huruf">Makharijul Huruf</option>
                      <option value="Sifat Huruf">Sifat Huruf</option>
                      <option value="Waqaf & Ibtida">Waqaf & Ibtida</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tags</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition text-sm" placeholder="syafawi, mim mati" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2"><Icons.Book size={14} className="text-teal-600"/> Sumber Kitab</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition text-sm" placeholder="Contoh: Tuhfatul Athfal" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Icons.Mic size={14} className="text-teal-600"/> <span className="ml-1">Audio Contoh (Opsional)</span></label>
                {!formData.audioData ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition ${isRecording ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                      {isRecording ? <><Icons.Stop size={16} /> Stop</> : <><Icons.Mic size={16}/> Rekam</>}
                    </button>
                    <div className="flex-1">
                      <input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={handleAudioUpload} />
                      <button type="button" onClick={() => audioInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"><Icons.Upload size={16} /> Upload Audio</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-teal-200">
                    <div className="flex items-center gap-2 w-full"><div className="bg-teal-100 p-1.5 rounded-full text-teal-600"><Icons.Mic size={16} /></div><audio controls src={formData.audioData} className="w-full h-8" /></div>
                    <button onClick={deleteAudio} className="ml-2 p-2 text-slate-400 hover:text-red-500 transition" title="Hapus"><Icons.Trash2 size={16} /></button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Konten</label>
                <textarea required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition min-h-[200px] text-slate-700 leading-relaxed font-mono text-sm" placeholder="Isi materi..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 px-4 py-4 sm:px-8 sm:py-5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sticky bottom-0">
            <button onClick={() => setView('list')} className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition shadow-sm text-sm" type="button">Batal</button>
            <button onClick={handleSubmit} disabled={isSubmitting || isAnalyzingImage || isRecording} className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm">
              {isSubmitting ? <Icons.Loader size={18} /> : <Icons.Save size={18} />}
              {editingId ? 'Simpan Perubahan' : 'Simpan Materi'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View (Default)
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div><h2 className="text-xl font-bold text-teal-900">Database Tajwid</h2><p className="text-slate-500 text-sm">Kelola materi pembelajaran AI.</p></div>
        <button onClick={handleCreateNew} className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition hover:scale-[1.02] text-sm"><Icons.Plus size={18} /> Tambah Materi</button>
      </div>

      <div className="relative">
        <input type="text" placeholder="Cari materi..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-teal-50 focus:border-teal-300 outline-none transition shadow-sm text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search size={18} /></div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-teal-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"><Icons.Book className="text-teal-400" size={28} /></div>
            <h3 className="text-base font-medium text-slate-900">Belum ada materi</h3>
            <p className="text-slate-500 text-sm mb-4">Silakan input data baru.</p>
          </div>
        ) : (
          filteredList.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-teal-100">{item.category}</span>
                    {item.source && <span className="flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] border border-amber-100"><Icons.Book size={10} className="mr-1"/> {item.source}</span>}
                    {item.audioData && <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] border border-blue-100"><Icons.Mic size={10} className="mr-1"/> Audio</span>}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">{item.title}</h3>
                  <p className="text-slate-600 text-xs line-clamp-2">{item.content}</p>
                  {item.tags && item.tags.length > 0 && <div className="flex items-center gap-2 mt-1"><Icons.Tag size={12} className="text-slate-400" /><span className="text-xs text-slate-500 truncate">{item.tags.join(', ')}</span></div>}
                </div>
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button onClick={() => handleEdit(item)} className="flex-1 sm:flex-none p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition border border-slate-200 sm:border-transparent flex justify-center items-center"><Icons.Edit size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 sm:flex-none p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-slate-200 sm:border-transparent flex justify-center items-center"><Icons.Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('user'); 
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Security States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Firestore Path
  // Menggunakan fixed ID untuk persistensi data antar link share
  // KEMBALI KE DEFAULT DYNAMIC ID AGAR PERMISSION DITERIMA
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const collectionPath = ['artifacts', appId, 'public', 'data', 'tajwid_knowledge'];

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };

    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, ...collectionPath));
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setKnowledgeList(items);
      setLoading(false);
    });

    return () => unsubscribeData();
  }, [user]);

  // Handle Login Success
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowLoginModal(false);
    setMode('admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <Navbar 
        currentMode={mode} 
        setMode={setMode} 
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminModeAttempt={setShowLoginModal}
      />

      {showLoginModal && (
        <AdminLogin 
          onLogin={handleLoginSuccess} 
          onClose={() => setShowLoginModal(false)}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {!user || loading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] text-slate-400">
            <Icons.Loader size={48} />
            <p className="mt-4 text-sm font-medium animate-pulse">Menyiapkan Data...</p>
          </div>
        ) : mode === 'admin' ? (
          <AdminPanel knowledgeList={knowledgeList} user={user} collectionPath={collectionPath} />
        ) : (
          <div className="max-w-3xl mx-auto">
             <div className="mb-4 sm:mb-6 text-center px-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight mb-2">
                  Tajwid<span className="text-amber-500">Pintar</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm sm:text-base">Asisten Cerdas Markaz Qur'an Darussalam</p>
             </div>
             <ChatInterface knowledgeList={knowledgeList} />
          </div>
        )}
      </main>
    </div>
  );
}