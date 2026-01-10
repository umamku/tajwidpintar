import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut
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
  Camera: (props) => (<IconWrapper {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></IconWrapper>),
  // Ikon Image (Galeri) tetap kita simpan, meskipun UI hanya pakai 1 tombol (Camera) yang fungsinya ganda
  Image: (props) => (<IconWrapper {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></IconWrapper>)
};

// --- Configuration ---
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
const analytics = getAnalytics(app);

const appId = 'tajwid-app-production';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// --- Helper: Call Gemini API (Updated for Recitation) ---
async function askGemini(question, knowledgeContext, imageData = null) {
  const cleanKey = apiKey ? apiKey.trim() : "";
  if (!cleanKey) return "Error: API Key kosong/salah.";

  const targetModel = "gemini-2.5-flash"; 
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`;

  // --- PROMPT BARU: INTEGRASI SYEIKH AYMAN ---
  const systemPrompt = `
    Anda adalah Asisten Ustadz dalam bidang Ilmu Tajwid Al-Qur'an dari Markaz Qur'an Darussalam.
    
    SUMBER PENGETAHUAN:
    1. TEKS AL-QUR'AN (Hafalan Internal): Gunakan untuk identifikasi ayat.
    2. ILMU TAJWID (Context Data): Gunakan untuk hukum tajwid.
    
    INSTRUKSI AUDIO (SYEIKH AYMAN RUSHDI SUWAID):
    - Jika user meminta membacakan ayat, ATAU jika kamu membahas/mengidentifikasi ayat tertentu dari gambar/pertanyaan, lampirkan tag khusus di akhir jawaban:
      [[RECITE:NomorSurat:NomorAyat]]
    - Contoh: Untuk Al-Fatihah ayat 1, tulis [[RECITE:1:1]].
    - Jika ayatnya banyak, boleh lampirkan beberapa tag.
    
    INSTRUKSI UMUM:
    - Jawablah dengan ramah selayaknya Ustadz.
    - JANGAN menampilkan ID referensi database.
    - Jika ada gambar: Analisis teksnya, sebutkan Nama Surat & Ayatnya, lalu analisis tajwidnya.

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

  const payload = {
    contents: [{ parts: parts }]
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Error:", data.error);
      return `Error AI (${data.error.code}): ${data.error.message}`;
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI tidak memberikan jawaban.";
  } catch (error) {
    console.error("Network Error:", error);
    return "Maaf, koneksi internet terganggu.";
  }
}

// --- Helper: Extract Text (Admin OCR) ---
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
    console.error("OCR Error:", error);
    throw new Error("Gagal membaca gambar.");
  }
}

// --- Components ---

const Navbar = ({ currentMode, setMode, isAdminAuthenticated, setIsAdminModeAttempt }) => (
  <nav className="bg-teal-900 text-white shadow-lg sticky top-0 z-50 border-b border-amber-500/30">
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex justify-between items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-amber-200 overflow-hidden w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center relative">
          <img src="https://i.ibb.co.com/xSB9ct1R/Logo-Markaz-OKE-1.jpg" alt="Logo Markaz Qur'an" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex'; }} />
          <div className="fallback-icon hidden items-center justify-center text-teal-800 w-full h-full absolute inset-0 bg-white"><Icons.Book size={24} /></div>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-lg sm:text-2xl font-bold tracking-tight leading-none">Tajwid<span className="text-amber-400">Pintar</span></span>
          <span className="text-[10px] sm:text-xs text-teal-100 font-medium tracking-wide mt-0.5 sm:mt-1 opacity-90 line-clamp-1">Markaz Qur'an Darussalam</span>
        </div>
      </div>
      <div className="flex bg-teal-800/50 rounded-full p-1 border border-teal-700 backdrop-blur-sm shrink-0">
        
        {/* --- TOMBOL USER (MODIFIKASI DISINI) --- */}
        <button 
            onClick={async () => { 
                // FITUR BARU: Jika user adalah admin, logout dari Firebase saat pindah ke mode user.
                // Ini memaksa admin login ulang jika ingin kembali ke dashboard nanti.
                if (isAdminAuthenticated) {
                    try {
                        await signOut(auth); 
                    } catch (error) {
                        console.error("Gagal logout otomatis:", error);
                    }
                }
                setMode('user'); 
            }} 
            className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${currentMode === 'user' ? 'bg-amber-500 text-teal-950 shadow-md font-bold' : 'text-teal-100 hover:text-white hover:bg-teal-700'}`}
        >
          <Icons.User size={14} className="mr-1.5 sm:mr-2" /><span className="hidden sm:inline">Tanya Ustadz</span><span className="sm:hidden">Tanya</span>
        </button>

        <button onClick={() => { if (isAdminAuthenticated) { setMode('admin'); } else { setIsAdminModeAttempt(true); } }} className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${currentMode === 'admin' ? 'bg-white text-teal-800 shadow-md font-bold' : 'text-teal-100 hover:text-white hover:bg-teal-700'}`}>
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
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email Admin</label><input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition p-2">{showPassword ? <Icons.EyeOff size={20} /> : <Icons.Eye size={20} />}</button></div></div>
          {error && <div className="p-3 rounded-lg text-sm bg-red-100 text-red-700 border border-red-200 flex items-center gap-2"><Icons.Shield size={16} /><span>{error}</span></div>}
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg transition disabled:opacity-50 flex justify-center items-center gap-2">{loading ? <Icons.Loader size={20} /> : 'Masuk Dashboard'}</button>
        </form>
      </div>
    </div>
  );
};

// --- USER VIEW: Chat & Voice Interface ---
const ChatInterface = ({ knowledgeList }) => {
  const [messages, setMessages] = useState([{ id: 1, role: 'ai', text: 'Assalamu’alaikum. Saya Asisten Tajwid dari Markaz Qur\'an Darussalam.\nSetiap jawaban saya merujuk pada referensi kitab para ulama yang tersimpan di database, bukan opini AI. Silakan tanyakan seputar tajwid, minta contoh bacaan (Syeikh Ayman Suwaid), atau kirim foto ayat untuk dianalisis.' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(null);
  
  // --- STATE GAMBAR USER ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const speak = (text, msgId) => {
    window.speechSynthesis.cancel();
    if (isSpeaking === msgId) { setIsSpeaking(null); return; }
    const cleanText = text
      .replace(/\[\[AUDIO:\s*[^\]]+\]\]/g, '')  // Hapus tag Audio Admin
      .replace(/\[\[RECITE:\s*[^\]]+\]\]/g, '') // Hapus tag Audio Syeikh
      .replace(/<[^>]*>/g, '')                  // Hapus semua tag HTML (seperti <strong>)
      .replace(/[`]/g, '')
      .replace(/\*/g, '')                       // Hapus SEMUA bintang (*), bukan cuma (**)
      .replace(/[\[\]\(\)]/g, '')               // Hapus kurung siku [] dan kurung biasa ()
      .trim();
    if (!cleanText) return;
    const sentences = cleanText.match(/[^\.!\?]+[\.!\?]+/g) || [cleanText];
    let currentSentence = 0;
    const speakNextSentence = () => {
      if (currentSentence < sentences.length) {
        const utterance = new SpeechSynthesisUtterance(sentences[currentSentence]);
        utterance.lang = 'id-ID'; utterance.rate = 1.0;
        utterance.onstart = () => setIsSpeaking(msgId);
        utterance.onend = () => { currentSentence++; if (currentSentence < sentences.length) speakNextSentence(); else setIsSpeaking(null); };
        utterance.onerror = (e) => { console.error("Speech Error:", e); setIsSpeaking(null); };
        window.speechSynthesis.speak(utterance);
      }
    };
    speakNextSentence();
  };

  const copyToClipboard = (text, msgId) => {
    const cleanText = text.replace(/\[\[AUDIO:\s*[^\]]+\]\]/g, '')
                          .replace(/\[\[RECITE:\s*[^\]]+\]\]/g, '') // Bersihkan tag Recite
                          .replace(/\*\*/g, '');
    navigator.clipboard.writeText(cleanText).then(() => { setCopiedId(msgId); setTimeout(() => setCopiedId(null), 2000); });
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const findAudioData = (id) => { const item = knowledgeList.find(k => k.id === id); return item ? item.audioData : null; };

  const renderMessageContent = (text) => {
    // Split by AUDIO tag first
    //const parts = text.split(/(\[\[AUDIO:\s*[^\]]+\]\]|\[\[RECITE:\s*[^\]]+\]\])/g);
      const formattedText = text.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
  
      const parts = formattedText.split(/(\[\[AUDIO:\s*[^\]]+\]\]|\[\[RECITE:\s*[^\]]+\]\])/g);

    
    return parts.map((part, index) => {
      // 1. Cek Admin Audio (Contoh Potongan)
      const matchAudio = part.match(/\[\[AUDIO:\s*([^\]]+)\]\]/);
      if (matchAudio) {
        const rawId = matchAudio[1].trim(); const audioId = rawId.replace(/[.,!?;:]$/, ''); const audioSrc = findAudioData(audioId);
        if (audioSrc) return <div key={index} className="mt-3 mb-3 bg-teal-50 p-3 sm:p-4 rounded-xl border border-teal-200 shadow-sm"><p className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2"><div className="bg-teal-600 text-white p-1 rounded-full"><Icons.Play size={14}/></div>Contoh Bacaan (Admin):</p><audio controls className="w-full h-8 sm:h-10" src={audioSrc} /></div>;
        else return <span key={index} className="text-xs text-amber-600 italic bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1 inline-block">(Audio belum tersedia)</span>;
      }

      // 2. Cek Recite API (Syeikh Ayman Suwaid)
      const matchRecite = part.match(/\[\[RECITE:(\d+):(\d+)\]\]/);
      if (matchRecite) {
         const surah = matchRecite[1].padStart(3, '0');
         const ayah = matchRecite[2].padStart(3, '0');
         const url = `https://everyayah.com/data/Ayman_Sowaid_64kbps/${surah}${ayah}.mp3`;
         return (
            <div key={index} className="mt-3 mb-3 bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-200 shadow-sm">
              <p className="text-sm font-bold text-indigo-800 mb-2 flex items-center gap-2">
                <div className="bg-indigo-600 text-white p-1 rounded-full"><Icons.Mic size={14}/></div>
                Syeikh Ayman Suwaid (QS {parseInt(surah)}:{parseInt(ayah)}):
              </p>
              <audio controls className="w-full h-8 sm:h-10" src={url} />
            </div>
         );
      }

      // 3. Render Teks Biasa
      const textParts = part.split(/\*\*(.*?)\*\*/g);
      return <span key={index}>{textParts.map((subPart, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-teal-900">{subPart}</strong> : subPart)}</span>;
    });
  };

  // --- LOGIKA GAMBAR ---
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => { setSelectedImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleSend = async (e) => {
    e.preventDefault();

    // 1. SIMPAN DATA KE VARIABEL LOKAL DULU
    // (Penting: agar kita bisa langsung membersihkan UI tanpa kehilangan data yang mau dikirim)
    const currentInput = input;
    const currentImageFile = selectedImage;
    const currentImagePreview = imagePreview;

    // Cek validasi menggunakan variabel lokal
    if (!currentInput.trim() && !currentImageFile) return;

    // 2. LANGSUNG BERSIHKAN UI DI SINI (Supaya thumbnail & teks hilang seketika)
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // 3. TAMPILKAN PESAN USER KE LAYAR (Pakai data dari variabel lokal)
    const userText = currentInput.trim() ? currentInput : (currentImageFile ? "Mohon analisis gambar ini." : "");
    const userMsg = { 
        id: Date.now(), 
        role: 'user', 
        text: userText, 
        imagePreview: currentImagePreview // Gunakan preview yg disimpan di lokal tadi
    };
    
    // Siapkan riwayat untuk konteks AI
    const chatHistory = messages.slice(-5).map(m => `${m.role === 'user' ? 'USER' : 'USTADZ'}: ${m.text}`).join('\n');
    
    setMessages(prev => [...prev, userMsg]); 
    setIsTyping(true);

    // 4. PROSES GAMBAR (Jika ada)
    // Kita gunakan 'currentImageFile' bukan 'selectedImage' karena state sudah null
    let imageDataForAI = null;
    if (currentImageFile) {
        try {
            imageDataForAI = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve({ base64: event.target.result.split(',')[1], mimeType: currentImageFile.type });
                reader.onerror = reject;
                reader.readAsDataURL(currentImageFile);
            });
        } catch (err) { 
            alert("Gagal proses gambar."); 
            setIsTyping(false); 
            return; 
        }
    }

    // 5. KIRIM KE AI
    const knowledgeContext = knowledgeList.map(item => `MATERI: ${item.title}\nKATEGORI: ${item.category}\nSUMBER: ${item.source || 'Tidak disebutkan'}\nPENJELASAN: ${item.content}\n${item.audioData ? `[AUDIO_ID: ${item.id}]` : ''}\n---`).join('\n');
    
    // Pastikan prompt knowledge context ikut terkirim
    const answer = await askGemini(userMsg.text, `RIWAYAT:\n${chatHistory}\nDATABASE:\n${knowledgeContext}`, imageDataForAI);
    
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: answer }]);
    setIsTyping(false);
    
    // clearImageSelection(); // <-- INI DIHAPUS SAJA karena sudah dibersihkan di langkah no. 2
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) { alert("Maaf, browser Anda tidak mendukung fitur input suara."); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'id-ID'; recognition.onstart = () => setIsListening(true); recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => { setInput(event.results[0][0].transcript); }; recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-teal-100">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-teal-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[88%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 sm:gap-3`}>
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.role === 'user' ? 'bg-slate-700 border-slate-600' : 'bg-teal-600 border-teal-500'}`}>
                {msg.role === 'user' ? <Icons.User size={16} className="text-white" /> : <Icons.User size={16} className="text-white" />}
              </div>
              <div className={`relative group p-3 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-none' : 'bg-white text-slate-800 border border-teal-100 rounded-tl-none'}`}>
                
                {msg.role === 'user' && (
                   <button onClick={() => copyToClipboard(msg.text, msg.id)} className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-teal-600 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10" title="Salin Pesan">{copiedId === msg.id ? <Icons.Check size={12} className="text-green-500" /> : <Icons.Copy size={12} />}</button>
                )}

                {msg.role === 'ai' ? (
                  <div className="flex flex-col">
                    <div className="whitespace-pre-wrap">{renderMessageContent(msg.text)}</div>
                    <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => speak(msg.text, msg.id)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${isSpeaking === msg.id ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-inner' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-teal-600 hover:bg-white shadow-sm'}`}>{isSpeaking === msg.id ? <><Icons.Stop size={12} className="animate-pulse" /> STOP</> : <><Icons.Play size={12} /> DENGAR</>}</button>
                        <button onClick={() => copyToClipboard(msg.text, msg.id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-slate-50 text-slate-400 hover:text-teal-600 border-slate-100 transition">{copiedId === msg.id ? <><Icons.Check size={12} className="text-green-500"/> DISALIN</> : <><Icons.Copy size={12} /> SALIN</>}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                      {/* TAMPILKAN PREVIEW DI BALON CHAT USER JIKA ADA */}
                      {msg.imagePreview && <img src={msg.imagePreview} alt="Uploaded" className="h-16 w-auto rounded-lg mb-2 border border-slate-200" />}
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex justify-start ml-10 sm:ml-12"><div className="bg-white border border-teal-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm"><Icons.Loader size={14} className="text-teal-500 animate-spin" /><span className="text-xs text-slate-400 font-medium ml-2">Sedang mencari dalil...</span></div></div>}
        <div ref={messagesEndRef} />
      </div>
      
      {/* AREA INPUT DENGAN GAMBAR */}
      <div className="p-3 sm:p-4 bg-white border-t border-teal-100 relative">
        {/* Preview Gambar Sebelum Kirim */}
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
          {/* Input File Tersembunyi (Single Input for All) */}
          {/* MENGHAPUS capture="environment" AGAR BROWSER MENAMPILKAN PILIHAN (KAMERA/GALERI) */}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />

          {/* Tombol Kamera & Suara */}
          <div className="flex gap-1 shrink-0">
             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 sm:p-3.5 rounded-full border shadow-sm bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition" title="Kirim Gambar/Foto"><Icons.Camera size={20} /></button>
             <button type="button" onClick={handleVoiceInput} className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 border flex items-center justify-center shadow-sm ${isListening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-teal-600'}`} title="Rekam Suara">{isListening ? <Icons.MicOff size={20} /> : <Icons.Mic size={20} />}</button>
          </div>

          <input autoFocus type="text" className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition text-slate-700 placeholder:text-slate-400 text-sm sm:text-base" placeholder={selectedImage ? "Tambahkan keterangan gambar..." : "Tanya Ustadz..."} value={input} onChange={(e) => setInput(e.target.value)} disabled={isTyping} />
          <button type="submit" disabled={(!input.trim() && !selectedImage) || isTyping} className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition disabled:opacity-50 shadow-md"><Icons.Send size={18} /></button>
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

// --- LANGKAH A: TARUH DI SINI ---
  const existingSources = useMemo(() => {
    const sources = knowledgeList
      .map(item => item.source)
      .filter(source => source && source.trim() !== "");
    return [...new Set(sources)]; 
  }, [knowledgeList]);

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
    setIsAnalyzingImage(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let textToProcess = "";
        
        // 1. Ambil teks dasar (OCR jika gambar, teks jika file md/txt)
        if (file.type.startsWith('image/')) {
          const base64Data = event.target.result.split(',')[1];
          textToProcess = await extractTextFromImage(base64Data, file.type);
        } else {
          textToProcess = event.target.result;
        }

        if (!textToProcess) throw new Error("Teks kosong");

        // 2. Gunakan Gemini 2.5 Flash untuk Analisis Auto-Fill
        const cleanKey = apiKey ? apiKey.trim() : "";
        const targetModel = "gemini-2.5-flash"; 
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`;
        
        const prompt = `Analisis teks Tajwid ini. Berikan HANYA JSON murni tanpa kata-kata lain.
          Pilihan Kategori: Hukum Nun Mati & Tanwin, Hukum Mim Mati, Hukum Mad, Hukum Idgham, Qalqalah, Makharijul Huruf, Sifat Huruf, Waqaf & Ibtida.
          JSON:
          {
            "judul": "judul materi",
            "kategori": "pilih satu dari daftar di atas",
            "tags": "3 kata kunci",
            "konten": "transkripsi lengkap"
          }
          Teks: ${textToProcess}`;

        const aiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const aiData = await aiResponse.json();
        const rawJson = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleanJson = rawJson.replace(/```json|```/g, "").trim();
        const result = JSON.parse(cleanJson);

        // 3. Masukkan ke Form secara Otomatis
        setFormData(prev => ({
          ...prev,
          title: result.judul || "Materi Baru",
          category: result.kategori || "",
          tags: result.tags || "",
          content: result.konten || textToProcess
        }));

      } catch (err) {
        console.error("Auto-fill error:", err);
        alert("Gagal mengisi otomatis, teks dimasukkan manual ke kolom konten.");
        setFormData(prev => ({
          ...prev,
          content: prev.content ? prev.content + "\n\n" + (event.target.result) : "Gagal Auto-fill"
        }));
      } finally {
        setIsAnalyzingImage(false);
      }
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
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
  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
    <Icons.Book size={14} className="text-teal-600"/> Sumber Kitab
  </label>
  <input 
    type="text" 
    list="list-sumber" 
    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none text-sm" 
    placeholder="Ketik atau pilih sumber..." 
    value={formData.source} 
    onChange={(e) => setFormData({...formData, source: e.target.value})} 
  />
  <datalist id="list-sumber">
    {existingSources.map((src, index) => (
      <option key={index} value={src} />
    ))}
  </datalist>
</div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Icons.Mic size={14} className="text-teal-600"/> <span className="ml-1">Audio Contoh (Opsional)</span></label>
                {!formData.audioData ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition ${isRecording ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                      {isRecording ? <><Icons.Stop size={16} /> Stop</> : <><Icons.Mic size={16}/> Rekam</>}</button>
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
// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('user'); 
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal login
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Firestore Path
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const collectionPath = ['artifacts', appId, 'public', 'data', 'tajwid_knowledge'];

  // --- LOGIKA UTAMA (YANG DIPERBAIKI) ---
  // Mendeteksi status login secara otomatis & real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && !currentUser.isAnonymous) {
        // KASUS 1: TERDETEKSI ADMIN
        // Otomatis pindah ke mode admin & tutup loading/modal
        setMode('admin'); 
        setShowLoginModal(false); 
        setLoading(false);
      } else if (!currentUser) {
        // KASUS 2: BELUM ADA USER
        // Login sebagai tamu (Anonymous) dulu
        signInAnonymously(auth).catch((err) => console.error("Anon Auth Error", err));
      } else {
        // KASUS 3: TAMU (ANONYMOUS)
        // Biarkan di mode user
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Ambil Data Materi (Tetap Sama) ---
  useEffect(() => {
    // Hanya ambil data jika user sudah siap (baik admin maupun tamu)
    if (!user) return;

    const q = query(collection(db, ...collectionPath));
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Urutkan dari yang terbaru
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setKnowledgeList(items);
      setLoading(false);
    });

    return () => unsubscribeData();
  }, [user]); // Dependency ke 'user' agar aman

  // --- Keamanan Anti-Inspect (Tetap Sama) ---
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- Helper untuk Tombol Navbar ---
  // Cek apakah user saat ini adalah admin (bukan tamu)
  const isUserAdmin = user && !user.isAnonymous;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <Navbar 
        currentMode={mode} 
        setMode={setMode} 
        isAdminAuthenticated={isUserAdmin} // Gunakan status user langsung dari Firebase
        setIsAdminModeAttempt={setShowLoginModal}
      />

      {showLoginModal && (
        <AdminLogin 
          // Tidak butuh onLogin manual lagi, karena useEffect di atas akan menangani
          onClose={() => setShowLoginModal(false)}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {!user || loading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] text-slate-400">
            <Icons.Loader size={48} />
            <p className="mt-4 text-sm font-medium animate-pulse">Menyiapkan Data...</p>
          </div>
        ) : mode === 'admin' && isUserAdmin ? (
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
{/* --- LABEL VERSI APLIKASI (TAMBAHKAN DI SINI) --- */}
      <footer className="max-w-6xl mx-auto px-4 py-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
  TajwidPintar v1.0.0-Stable
</span>
        </div>
        <p className="text-[9px] text-slate-400 mt-2 font-medium tracking-wide">
          © 2026 Markaz Qur'an Darussalam
        </p>
    </footer>
    </div>
  );
}