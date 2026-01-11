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
  query,
  setDoc
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
  Image: (props) => (<IconWrapper {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></IconWrapper>),
  // Tambahkan di dalam object Icons = { ... }
Gift: (props) => (<IconWrapper {...props}><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></IconWrapper>),
  // Tambahkan ikon ini:
  UserPlus: (props) => (<IconWrapper {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></IconWrapper>),
  Activity: (props) => (<IconWrapper {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></IconWrapper>),
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
// --- Helper: Call Gemini API (Updated for Recitation & Audio Check) ---
async function askGemini(question, knowledgeContext, imageData = null, audioData = null) {
  const cleanKey = apiKey ? apiKey.trim() : "";
  if (!cleanKey) return "Error: API Key kosong/salah.";

  const targetModel = "gemini-2.5-flash"; 
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${cleanKey}`;

  // --- PROMPT BARU: INTEGRASI TEXT, GAMBAR, & AUDIO ---
  const systemPrompt = `
    Anda adalah Asisten Ustadz dalam bidang Ilmu Tajwid Al-Qur'an dari Markaz Qur'an Darussalam.
    
    SUMBER PENGETAHUAN:
    1. TEKS AL-QUR'AN (Hafalan Internal): Gunakan untuk identifikasi ayat.
    2. ILMU TAJWID (Context Data): Gunakan untuk hukum tajwid.
    
    INSTRUKSI AUDIO (SYEIKH AYMAN RUSHDI SUWAID):
    1. Jika Anda menggunakan tag [[RECITE:Surah:Ayah]] (Audio Eksternal), Anda BOLEH menyebut "Ini bacaan dari Syeikh Ayman Suwaid".
    2. Jika Anda menggunakan ID dari Context Data (misal: [[AUDIO:xyz123]]), JANGAN menyebut Syeikh Ayman. Cukup sebut "Berikut contoh bacaannya:" atau "Silakan simak audio materi ini:".
    
    INSTRUKSI KHUSUS FITUR "SIMAK BACAAN" (JIKA ADA INPUT AUDIO):
    1. Simak audio user layaknya Ustadz menyimak setoran hafalan.
    2. Identifikasi Surat dan Ayat apa yang sedang dibaca.
    3. Evaluasi aspek: Makharijul Huruf (ketepatan huruf), Panjang Pendek (Mad), dan Ghunnah (dengung).
    4. Berikan koreksi yang spesifik namun sopan. Contoh: "Huruf 'Ain terdengar kurang jelas", atau "Mad di kata X terlalu pendek".
    5. Berikan pujian jika bacaan sudah fasih.

    INSTRUKSI UMUM:
    - Jawablah dengan ramah selayaknya Ustadz.
    - JANGAN menampilkan ID referensi database.
    - Jika ada gambar: Analisis teksnya, sebutkan Nama Surat & Ayatnya, lalu analisis tajwidnya.

    [CONTEXT DATA MULAI]
    ${knowledgeContext}
    [CONTEXT DATA SELESAI]
  `;

  // Tentukan pertanyaan user (Prioritas: Input Teks -> Input Audio -> Default)
  let userQuery = question;
  if (!userQuery && audioData) {
      userQuery = "Tolong simak bacaan saya dalam audio ini. Apakah ada kesalahan tajwid atau makhraj?";
  } else if (!userQuery) {
      userQuery = "Jelaskan hukum tajwid pada gambar ini.";
  }

  const finalPrompt = systemPrompt + "\n\n" + "PERTANYAAN USER: " + userQuery;

  const parts = [{ text: finalPrompt }];
  
  // 1. Handle Gambar (Fitur Lama)
  if (imageData) {
      parts.push({
          inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.base64
          }
      });
  }

  // 2. Handle Audio (Fitur Baru)
  if (audioData) {
      parts.push({
          inlineData: {
              mimeType: audioData.mimeType, // e.g., 'audio/webm' atau 'audio/mp3'
              data: audioData.base64
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

const Navbar = ({ currentMode, setMode, isAdminAuthenticated, setIsAdminModeAttempt, onOpenRegistration }) => (
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

      {/* ... kode logo ... */}
      
      
      {/* Tombol Donasi */}

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


const DonationModal = ({ onClose }) => {
  
  // GANTI NOMOR INI DENGAN NOMOR WA BENDAHARA ASLI
  const bendaharaWA = "6287886744301"; 

  const handleContact = () => {
    const text = `Assalamu'alaikum Admin/Bendahara, saya ingin berpartisipasi dalam Infaq Dakwah melalui Markaz Qur'an Darussalam. Mohon informasi nomor rekeningnya.`;
    const url = `https://wa.me/${bendaharaWA}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition z-10"><Icons.X size={18}/></button>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center text-white shrink-0">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner border border-white/30">
            <Icons.Gift size={32} className="text-white drop-shadow-sm" />
          </div>
          <h2 className="text-xl font-bold">Dukung Program Dakwah</h2>
          <p className="text-amber-50 text-xs mt-1 opacity-90">
            Salurkan partisipasi dalam proyek kebaikan
          </p>
        </div>

        {/* Konten */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Info Masking */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 text-center space-y-3">
             <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-sm border border-teal-100 text-teal-600">
                <Icons.Lock size={28} />
             </div>
             
             <div>
                <p className="text-sm font-bold text-teal-900">Informasi Rekening</p>
                <p className="text-xs text-slate-500 leading-relaxed px-2 mt-1">
                   Untuk berinfaq, silakan hubungi bendahara Markaz Qur'an Darussalam.
                </p>
             </div>

             <button 
                onClick={handleContact} 
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition flex justify-center items-center gap-2 text-sm"
             >
                <Icons.Send size={16} /> Chat WhatsApp Bendahara
             </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-500 italic font-medium leading-relaxed">
              "Barangsiapa yang menunjuki kepada kebaikan, maka dia akan mendapatkan pahala seperti pahala orang yang mengerjakannya."
            </p>
            <p className="text-[9px] text-teal-600 font-bold mt-1">(HR. Muslim)</p>
          </div>

        </div>
      </div>
    </div>
  );
};

const RegistrationModal = ({ onClose }) => {
  const [form, setForm] = useState({ nama: '', usia: '', program: '', noWA: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- LOGIKA KIRIM KE WHATSAPP ---
    // Ganti nomor ini dengan nomor Admin Pendaftaran Markaz Qur'an
    const adminWA = "6282260801051"; 
    
    const text = `
*Assalamu'alaikum Admin Markaz Qur'an,*
Saya ingin mendaftar belajar. Berikut datanya:

👤 Nama: ${form.nama}
🎂 Usia: ${form.usia} tahun
📱 WhatsApp: ${form.noWA}
📚 Program: ${form.program}

Mohon info selanjutnya. Terima kasih.
    `.trim();

    const url = `https://wa.me/${adminWA}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-teal-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-teal-700 p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg text-white"><Icons.UserPlus size={24}/></div>
             <div>
               <h2 className="text-lg font-bold text-white leading-none">Formulir Pendaftaran</h2>
               <p className="text-teal-100 text-xs mt-1">Mari belajar Al-Qur'an bersanad</p>
             </div>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white transition"><Icons.X size={24}/></button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
            <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none transition" placeholder="Sesuai KTP" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Usia</label>
                <input type="number" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none transition" placeholder="Tahun" value={form.usia} onChange={e => setForm({...form, usia: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                <input type="tel" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none transition" placeholder="0812..." value={form.noWA} onChange={e => setForm({...form, noWA: e.target.value})} />
             </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Program</label>
            <div className="grid grid-cols-1 gap-2">
                {['Tahsin (Perbaikan Bacaan)', 'Tahfidz (Hafalan)', 'Bahasa Arab Al-Qur\'an', 'Talaqqi Bersanad', 'Belajar Ilmu Tafsir'].map((prog) => (
                    <label key={prog} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.program === prog ? 'bg-teal-50 border-teal-500 shadow-sm' : 'border-slate-200 hover:border-teal-300'}`}>
                        <input type="radio" name="program" value={prog} checked={form.program === prog} onChange={() => setForm({...form, program: prog})} className="accent-teal-600 w-4 h-4" />
                        <span className={`text-sm ${form.program === prog ? 'font-bold text-teal-800' : 'text-slate-600'}`}>{prog}</span>
                    </label>
                ))}
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg transition flex justify-center items-center gap-2 mt-2">
             <Icons.Send size={18} /> Kirim ke WhatsApp Admin
          </button>
          
          <p className="text-center text-[10px] text-slate-400">
            Data akan dikirim melalui WhatsApp untuk proses administrasi selanjutnya.
          </p>

        </form>
      </div>
    </div>
  );
};

// --- USER VIEW: Chat & Voice Interface ---
// --- USER VIEW: Chat & Voice Interface ---
// --- USER VIEW: Chat & Voice Interface ---
// --- USER VIEW: Chat & Voice Interface ---
const ChatInterface = ({ knowledgeList, onOpenRegistration, isRegistrationOpen }) => {
  // Update Pesan Pembuka untuk memberitahu fitur baru
  const [messages, setMessages] = useState([{ id: 1, role: 'ai', text: 'Assalamu’alaikum. Saya Asisten Tajwid dari Markaz Qur\'an Darussalam.\nSetiap jawaban saya merujuk pada referensi kitab para ulama yang tersimpan di database, bukan opini AI. Silakan tanyakan seputar tajwid, minta contoh bacaan (Syeikh Ayman Suwaid), atau kirim foto ayat untuk dianalisis.\n\n🆕 **FITUR BARU:** Saya bisa menyimak bacaan Anda! Klik tombol **Ungu (Gelombang)** di bawah, bacakan ayat, dan saya akan mengoreksi tajwidnya.' }]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // State untuk Input Suara (Speech-to-Text / Mic Merah)
  const [isListening, setIsListening] = useState(false); 
  
  // [BARU] State untuk Mode Simak (Audio Analysis / Mic Ungu)
  const [isSimakMode, setIsSimakMode] = useState(false); 

  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(null);
   
  // State Gambar
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // [BARU] Ref untuk menampung proses rekaman simak
  const simakRecorderRef = useRef(null);

  // State Banner
  const [showBanner, setShowBanner] = useState(true);

  // Ref Textarea
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; 
    }
  }, [input]);

  const speak = (text, msgId) => {
    window.speechSynthesis.cancel();
    if (isSpeaking === msgId) { setIsSpeaking(null); return; }
    const cleanText = text
      .replace(/\[\[AUDIO:\s*[^\]]+\]\]/g, '') 
      .replace(/\[\[RECITE:\s*[^\]]+\]\]/g, '')
      .replace(/\[\[DAFTAR_KELAS\]\]/g, '')
      .replace(/<[^>]*>/g, '')                  
      .replace(/[`]/g, '')
      .replace(/\*/g, '')                       
      .replace(/[\[\]\(\)]/g, '')               
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
                          .replace(/\[\[RECITE:\s*[^\]]+\]\]/g, '')
                          .replace(/\[\[DAFTAR_KELAS\]\]/g, '') 
                          .replace(/\*\*/g, '');
    navigator.clipboard.writeText(cleanText).then(() => { setCopiedId(msgId); setTimeout(() => setCopiedId(null), 2000); });
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const findAudioData = (id) => { const item = knowledgeList.find(k => k.id === id); return item ? item.audioData : null; };

  // Cari fungsi renderMessageContent yang lama, GANTI dengan ini:
  const renderMessageContent = (text) => {
      const formattedText = text.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
      
      // Update Regex untuk mendeteksi [[DAFTAR_KELAS]] juga
      const parts = formattedText.split(/(\[\[AUDIO:\s*[^\]]+\]\]|\[\[RECITE:\s*[^\]]+\]\]|\[\[DAFTAR_KELAS\]\])/g);
   
    return parts.map((part, index) => {
      
      // 1. Cek Tag Daftar Kelas (FITUR BARU)
      if (part === '[[DAFTAR_KELAS]]') {
         return (
             <div key={index} className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 italic mb-2">
                   ⚠️ <b>Catatan Penting:</b> Pengecekan bacaan ini bersifat <b>pemeriksaan awal</b>. Untuk kesempurnaan bacaan dan pengambilan sanad, Anda tetap wajib talaqqi (bertemu langsung) dengan Guru/Ustadz.
                </p>
                <button 
                    onClick={onOpenRegistration}
                    className="flex items-center gap-2 bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow-sm w-full sm:w-auto justify-center"
                >
                    <Icons.UserPlus size={14} /> Daftar Jadi Peserta Tahsin
                </button>
             </div>
         );
      }

      {/*// 2. Cek Admin Audio 
      const matchAudio = part.match(/\[\[AUDIO:\s*([^\]]+)\]\]/);
      if (matchAudio) {
        const rawId = matchAudio[1].trim(); const audioId = rawId.replace(/[.,!?;:]$/, ''); const audioSrc = findAudioData(audioId);
        if (audioSrc) return <div key={index} className="mt-3 mb-3 bg-teal-50 p-3 sm:p-4 rounded-xl border border-teal-200 shadow-sm"><p className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2"><div className="bg-teal-600 text-white p-1 rounded-full"><Icons.Play size={14}/></div>Contoh Bacaan (Admin):</p><audio controls className="w-full h-8 sm:h-10" src={audioSrc} /></div>;
        else return <span key={index} className="text-xs text-amber-600 italic bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1 inline-block">(Audio belum tersedia)</span>;
      }

      // 3. Cek Recite API
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
      }*/}

      // Langkah A: Cek apakah ini tag Audio (AUDIO atau RECITE)
      const matchGeneral = part.match(/\[\[(AUDIO|RECITE):\s*([^\]]+)\]\]/);
      
      if (matchGeneral) {
          const content = matchGeneral[2].trim(); // Ambil isinya (misal: "1:1" atau "zyE...")

          // Langkah B: Cek apakah isinya Angka:Angka? (Tanda pasti Syeikh Ayman)
          const matchSurahAyah = content.match(/^(\d+):(\d+)$/);
          
          if (matchSurahAyah) {
              // --- Render Player Syeikh Ayman ---
              const surah = matchSurahAyah[1].padStart(3, '0');
              const ayah = matchSurahAyah[2].padStart(3, '0');
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
          } else {
              // Langkah C: Jika BUKAN Angka, berarti pasti ID Database (Audio Admin)
              // (Meskipun labelnya RECITE, kita paksa cari di database admin)
              const audioId = content.replace(/[.,!?;:]$/, ''); // Bersihkan tanda baca
              const audioSrc = findAudioData(audioId);
              
              if (audioSrc) {
                  // --- Render Player Audio Admin ---
                  return (
                      <div key={index} className="mt-3 mb-3 bg-teal-50 p-3 sm:p-4 rounded-xl border border-teal-200 shadow-sm">
                          <p className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
                              <div className="bg-teal-600 text-white p-1 rounded-full"><Icons.Play size={14}/></div>
                              Contoh Bacaan (Admin):
                          </p>
                          <audio controls className="w-full h-8 sm:h-10" src={audioSrc} />
                      </div>
                  );
              } else {
                  // Jika ID tidak ditemukan di database
                  return <span key={index} className="text-xs text-amber-600 italic bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1 inline-block">(Audio belum tersedia)</span>;
              }
          }
      }

      

      // 4. Render Teks Biasa
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

  // --- [BARU] LOGIKA SIMAK BACAAN (KOREKSI SUARA) ---
  const handleSimakMode = async () => {
    // 1. Jika sedang merekam, STOP dan Kirim
    if (isSimakMode && simakRecorderRef.current) {
        simakRecorderRef.current.stop();
        setIsSimakMode(false);
        return;
    }

    // 2. Jika belum merekam, MULAI rekam
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        simakRecorderRef.current = mediaRecorder;
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            // Proses Audio Blob menjadi File
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
            
            // Tampilkan pesan User secara Visual
            const userMsg = { id: Date.now(), role: 'user', text: "🎤 [Mengirim Rekaman Suara untuk Dikoreksi...]" };
            setMessages(prev => [...prev, userMsg]);
            setIsTyping(true);

            // Convert ke Base64 untuk dikirim ke Gemini
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1]; // Hapus header data:audio/...
                
                // Siapkan Context Database
                const chatHistory = messages.slice(-5).map(m => `${m.role === 'user' ? 'USER' : 'USTADZ'}: ${m.text}`).join('\n');
                const knowledgeContext = knowledgeList.map(item => `MATERI: ${item.title}\nKATEGORI: ${item.category}\nSUMBER: ${item.source || 'Tidak disebutkan'}\nPENJELASAN: ${item.content}\n${item.audioData ? `[AUDIO_ID: ${item.id}]` : ''}\n---`).join('\n');

                // Panggil Gemini dengan Parameter Audio (Parameter ke-4)
                const answer = await askGemini(
                    null, // text prompt kosong (biar askGemini yang tentukan defaultnya)
                    `RIWAYAT:\n${chatHistory}\nDATABASE:\n${knowledgeContext}`, 
                    null, // no image
                    { base64: base64Audio, mimeType: 'audio/webm' } // Audio Payload
                );

                const finalAnswer = answer + "\n\n[[DAFTAR_KELAS]]";

                setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: finalAnswer }]);
                setIsTyping(false);
            };
            
            // Matikan track mic (Stop hardware)
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsSimakMode(true);

    } catch (err) {
        alert("Gagal mengakses mikrofon. Pastikan izin diberikan.");
        console.error(err);
    }
  };

  // --- Logic Kirim Pesan Biasa (Teks / Gambar) ---
  const handleSend = async (e) => {
    e.preventDefault();

    const currentInput = input;
    const currentImageFile = selectedImage;
    const currentImagePreview = imagePreview;

    if (!currentInput.trim() && !currentImageFile) return;

    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    const userText = currentInput.trim() ? currentInput : (currentImageFile ? "Mohon analisis gambar ini." : "");
    const userMsg = { 
        id: Date.now(), 
        role: 'user', 
        text: userText, 
        imagePreview: currentImagePreview 
    };
    
    const chatHistory = messages.slice(-5).map(m => `${m.role === 'user' ? 'USER' : 'USTADZ'}: ${m.text}`).join('\n');
    
    setMessages(prev => [...prev, userMsg]); 
    setIsTyping(true);

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

    const knowledgeContext = knowledgeList.map(item => `MATERI: ${item.title}\nKATEGORI: ${item.category}\nSUMBER: ${item.source || 'Tidak disebutkan'}\nPENJELASAN: ${item.content}\n${item.audioData ? `[AUDIO_ID: ${item.id}]` : ''}\n---`).join('\n');
    
    // Panggil Gemini (Mode Teks/Gambar)
    const answer = await askGemini(userMsg.text, `RIWAYAT:\n${chatHistory}\nDATABASE:\n${knowledgeContext}`, imageDataForAI);
    
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: answer }]);
    setIsTyping(false);
  };

  // --- Logic Voice Typing (Speech-to-Text) ---
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) { alert("Maaf, browser Anda tidak mendukung fitur input suara."); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'id-ID'; recognition.onstart = () => setIsListening(true); recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => { setInput(event.results[0][0].transcript); }; recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-teal-100">
      
      {/* --- BANNER PENDAFTARAN --- */}
      {showBanner && isRegistrationOpen && (
        <div 
          onClick={onOpenRegistration}
          className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors group relative z-10"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-amber-200 text-amber-700 p-1.5 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Icons.UserPlus size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-800 group-hover:text-amber-900">Pendaftaran Peserta Baru Dibuka</span>
              <span className="text-[10px] text-amber-600 group-hover:text-amber-700">Klik untuk belajar qur'an</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-amber-400 group-hover:translate-x-1 transition-transform">
                <IconWrapper size={16}><polyline points="9 18 15 12 9 6" /></IconWrapper>
             </div>
             <button 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setShowBanner(false);
                }}
                className="ml-2 text-amber-400 hover:text-red-500 hover:bg-amber-100 p-1 rounded-full transition-colors z-20"
                title="Tutup Info"
             >
                <Icons.X size={16} />
             </button>
          </div>
        </div>
      )}

      {/* --- AREA CHAT --- */}
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
                      {msg.imagePreview && <img src={msg.imagePreview} alt="Uploaded" className="h-16 w-auto rounded-lg mb-2 border border-slate-200" />}
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex justify-start ml-10 sm:ml-12"><div className="bg-white border border-teal-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm"><Icons.Loader size={14} className="text-teal-500 animate-spin" /><span className="text-xs text-slate-400 font-medium ml-2">Sedang {isSimakMode ? 'menganalisis suara...' : 'mencari dalil...'}</span></div></div>}
        <div ref={messagesEndRef} />
      </div>
      
      {/* --- AREA INPUT --- */}
      <div className="p-3 sm:p-4 bg-white border-t border-teal-100 relative">
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
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />

          {/* AREA TOMBOL KIRI (Upload & Simak) */}
          <div className="flex gap-1 shrink-0">
             {/* Tombol Kamera */}
             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 sm:p-3.5 rounded-full border shadow-sm bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-teal-600 transition" title="Kirim Gambar/Foto"><Icons.Camera size={20} /></button>
             
             {/* --- [BARU] TOMBOL SIMAK BACAAN (UNGGULAN) --- */}
             <button 
                type="button" 
                onClick={handleSimakMode} 
                className={`p-3 sm:p-3.5 rounded-full transition-all duration-300 border flex items-center justify-center shadow-md ${isSimakMode ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse ring-4 ring-indigo-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white'}`} 
                title="Koreksi Bacaan (Simak AI)"
             >
                {/* Gunakan ikon Stop saat merekam, dan Activity (Gelombang) saat standby */}
                {isSimakMode ? <Icons.Stop size={20} /> : <Icons.Activity size={20} />}
             </button>
             {/* ------------------------------------------- */}
          </div>

          <textarea
            ref={textareaRef}
            autoFocus
            rows={1}
            className="w-full pl-4 sm:pl-5 pr-12 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition text-slate-700 placeholder:text-slate-400 text-sm sm:text-base resize-none overflow-hidden"
            placeholder={selectedImage ? "Tambahkan keterangan gambar..." : "Tanya atau klik ikon Gelombang..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || isSimakMode}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() || selectedImage) {
                    handleSend(e);
                }
                }
            }}
            />

          {/* Tombol Kanan: Kirim Teks ATAU Voice Typing */}
          {input.trim() || selectedImage ? (
             <button type="submit" disabled={isTyping} className="absolute right-2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition disabled:opacity-50 shadow-md"><Icons.Send size={18} /></button>
          ) : (
             <button type="button" onClick={handleVoiceInput} className={`absolute right-2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-teal-600 bg-transparent'}`} title="Ketik dengan Suara"><Icons.Mic size={18} /></button>
          )}

        </form>
      </div>
    </div>
  );
};

// --- ADMIN VIEW: Upload & Input ---
const AdminPanel = ({ knowledgeList, user, collectionPath, isRegistrationOpen, onToggleRegistration }) => {
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

  // --- Helpers & Handlers (TETAP SAMA) ---
  const existingSources = useMemo(() => {
    const sources = knowledgeList.map(item => item.source).filter(source => source && source.trim() !== "");
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
        if (file.type.startsWith('image/')) {
          const base64Data = event.target.result.split(',')[1];
          textToProcess = await extractTextFromImage(base64Data, file.type);
        } else {
          textToProcess = event.target.result;
        }
        if (!textToProcess) throw new Error("Teks kosong");

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

  // --- TAMPILAN 1: FORM INPUT/EDIT (TETAP SAMA) ---
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
                <input type="text" list="list-sumber" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-teal-100 outline-none text-sm" placeholder="Ketik atau pilih sumber..." value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
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

  // --- TAMPILAN 2: LIST DASHBOARD (DEFAULT) ---
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* FITUR BARU: PANEL KONTROL PENDAFTARAN */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-full ${isRegistrationOpen ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'} transition-colors`}>
              <Icons.UserPlus size={24} />
           </div>
           <div>
              <h3 className="font-bold text-slate-800">Status Pendaftaran Santri</h3>
              <p className={`text-xs font-medium ${isRegistrationOpen ? 'text-green-600' : 'text-slate-500'}`}>
                {isRegistrationOpen ? '● Sedang Dibuka (Aktif)' : '○ Sedang Ditutup'}
              </p>
           </div>
        </div>
        
        {/* Tombol Toggle Switch */}
        <button 
          onClick={onToggleRegistration}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${isRegistrationOpen ? 'bg-teal-500' : 'bg-slate-300'}`}
        >
           <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ${isRegistrationOpen ? 'translate-x-8' : 'translate-x-0'}`} />
        </button>
      </div>

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
// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('user'); 
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  // State Status Pendaftaran (Default True)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true); 

  // =================================================================
  // 1. DEFINISI KONSTANTA (HANYA SATU KALI DEKLARASI)
  // =================================================================
  // Kembalikan ke 'default-app-id' agar data lama terbaca kembali
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  
  // Path Database Materi
  const collectionPath = ['artifacts', appId, 'public', 'data', 'tajwid_knowledge'];
  
  // Path Database Setting (Pendaftaran)
  const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_config', 'general_settings');


  // =================================================================
  // 2. LOGIKA / USE EFFECT
  // =================================================================

  // A. Cek Status Login (Auth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        // Jika Admin Login
        setMode('admin'); 
        setShowLoginModal(false); 
        setLoading(false);
      } else if (!currentUser) {
        // Jika belum ada user, login tamu
        signInAnonymously(auth).catch((err) => console.error("Anon Auth Error", err));
      } else {
        // Jika tamu sudah login
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // B. Ambil Data Materi & Settingan (Realtime)
  useEffect(() => {
    if (!user) return;

    // 1. Ambil Materi
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

    // 2. Ambil Status Pendaftaran
    const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Cek field 'registration_active', jika false baru tutup
        setIsRegistrationOpen(data.registration_active !== false); 
      } else {
        // Jika dokumen belum dibuat, default BUKA
        setIsRegistrationOpen(true);
      }
    });

    return () => {
        unsubscribeData();
        unsubscribeSettings();
    };
  }, [user]); // Dependency user saja cukup

  // C. Fungsi Toggle Status Pendaftaran (Dipanggil dari AdminPanel)
  const handleToggleRegistration = async () => {
    try {
        await setDoc(settingsDocRef, { 
            registration_active: !isRegistrationOpen,
            updated_at: serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.error("Gagal update status:", err);
        alert("Gagal mengubah status pendaftaran.");
    }
  };

  // D. Keamanan Anti-Inspect Element
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

  // Helper boolean
  const isUserAdmin = user && !user.isAnonymous;

  // =================================================================
  // 3. TAMPILAN (RETURN)
  // =================================================================
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* HEADER / NAVBAR */}
      <Navbar 
        currentMode={mode} 
        setMode={setMode} 
        isAdminAuthenticated={isUserAdmin}
        setIsAdminModeAttempt={setShowLoginModal}
      />

      {/* MODALS */}
      {showLoginModal && (
        <AdminLogin onClose={() => setShowLoginModal(false)} />
      )}
      {showDonation && (
        <DonationModal onClose={() => setShowDonation(false)} />
      )}
      {showRegistration && (
        <RegistrationModal onClose={() => setShowRegistration(false)} />
      )}

      {/* KONTEN UTAMA */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {!user || loading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] text-slate-400">
            <Icons.Loader size={48} className="animate-spin" />
            <p className="mt-4 text-sm font-medium animate-pulse">Menyiapkan Data...</p>
          </div>
        ) : mode === 'admin' && isUserAdmin ? (
          
          /* MODE ADMIN */
          <AdminPanel 
            knowledgeList={knowledgeList} 
            user={user} 
            collectionPath={collectionPath}
            // Kirim props Toggle ke sini
            isRegistrationOpen={isRegistrationOpen}
            onToggleRegistration={handleToggleRegistration} 
          />

        ) : (
          
          /* MODE USER */
          <div className="max-w-3xl mx-auto">
             <div className="mb-4 sm:mb-6 text-center px-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-900 tracking-tight mb-2">
                  Tajwid<span className="text-amber-500">Pintar</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm sm:text-base">Asisten Cerdas Markaz Qur'an Darussalam</p>
             </div>
             
             <ChatInterface 
                knowledgeList={knowledgeList} 
                onOpenRegistration={() => setShowRegistration(true)} 
                // Kirim status agar banner bisa muncul/hilang
                isRegistrationOpen={isRegistrationOpen}
             />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-4 py-6 text-center space-y-4">
        
        {/* Label Versi */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm cursor-default">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            TajwidPintar v2.2-Stable
          </span>
        </div>

        {/* Tombol Donasi */}
        <div className="flex justify-center">
            <button 
                onClick={() => setShowDonation(true)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
            >
                <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <IconWrapper size={14}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></IconWrapper>
                </div>
                <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-medium group-hover:text-slate-600 transition-colors">Partisipasi Kebaikan</p>
                    <p className="text-[10px] font-bold text-slate-500 group-hover:text-teal-700 transition-colors">Infaq Dakwah</p>
                </div>
            </button>
        </div>

        {/* Copyright */}
        <p className="text-[9px] text-slate-400 font-medium tracking-wide">
          © 2026 Markaz Qur'an Darussalam
        </p>
      </footer>

    </div>
  );
}