import React, { useState, useEffect } from "react";
import { Accessibility, Shield, Calendar, Users, Award, Settings, User, Heart, X, HelpCircle, MapPin, Clock, Mail, Globe, Palette, ShieldAlert, Info, Edit, Check, Eye, EyeOff, Share2, Clipboard, ExternalLink, Download, Laptop, Smartphone, Tablet } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { upcomingMatches } from "../data/matches";

export const bannerTranslations = {
  en: {
    title: "🥉 FIFA WORLD CUP 2026 — THIRD PLACE PLAY-OFF",
    teams: "🇫🇷 France vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
    date: "Friday, July 17, 2026 • 12:30 PM (Local)",
    stadium: "Hard Rock Stadium, Miami",
    live: "LIVE NOW ⚽",
    upcoming: "UPCOMING 📅",
    concluded: "CONCLUDED 🏁",
    score: "Live Score",
    minute: "Minute",
    concludedWinner: "Concluded: France won 2-1"
  },
  es: {
    title: "🥉 COPA MUNDIAL DE LA FIFA 2026 — TERCER PUESTO",
    teams: "🇫🇷 Francia vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra",
    date: "Viernes, 17 de Julio de 2026 • 12:30 PM (Local)",
    stadium: "Hard Rock Stadium, Miami",
    live: "EN VIVO ⚽",
    upcoming: "PRÓXIMO 📅",
    concluded: "CONCLUIDO 🏁",
    score: "Resultado en Vivo",
    minute: "Minuto",
    concludedWinner: "Concluido: Francia ganó 2-1"
  },
  fr: {
    title: "🥉 COUPE DU MONDE DE LA FIFA 2026 — TROISIÈME PLACE",
    teams: "🇫🇷 France vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Angleterre",
    date: "Vendredi 17 Juillet 2026 • 12h30 (Local)",
    stadium: "Hard Rock Stadium, Miami",
    live: "EN DIRECT ⚽",
    upcoming: "À VENIR 📅",
    concluded: "TERMINÉ 🏁",
    score: "Score en Direct",
    minute: "Minute",
    concludedWinner: "Terminé: France a gagné 2-1"
  },
  de: {
    title: "🥉 FIFA FUSSBALL-WELTMEISTERSCHAFT 2026 — SPIEL UM PLATZ 3",
    teams: "🇫🇷 Frankreich vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
    date: "Freitag, 17. Juli 2026 • 12:30 Uhr (Lokal)",
    stadium: "Hard Rock Stadium, Miami",
    live: "LIVE ⚽",
    upcoming: "BEVORSTEHEND 📅",
    concluded: "BEENDET 🏁",
    score: "Live-Ergebnis",
    minute: "Minute",
    concludedWinner: "Beendet: Frankreich gewann 2-1"
  },
  pt: {
    title: "🥉 COPA DO MUNDO FIFA 2026 — DISPUTA DO 3º LUGAR",
    teams: "🇫🇷 França vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra",
    date: "Sexta-feira, 17 de Julho de 2026 • 12:30 (Local)",
    stadium: "Hard Rock Stadium, Miami",
    live: "AO VIVO ⚽",
    upcoming: "PRÓXIMO 📅",
    concluded: "CONCLUÍDO 🏁",
    score: "Placar ao Vivo",
    minute: "Minuto",
    concludedWinner: "Concluído: França venceu por 2-1"
  },
  it: {
    title: "🥉 COPPA DEL MONDO FIFA 2026 — FINALE 3° POSTO",
    teams: "🇫🇷 Francia vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inghilterra",
    date: "Venerdì 17 Luglio 2026 • 12:30 (Locale)",
    stadium: "Hard Rock Stadium, Miami",
    live: "LIVE ⚽",
    upcoming: "IN ARRIVO 📅",
    concluded: "CONCLUSO 🏁",
    score: "Punteggio Live",
    minute: "Minuto",
    concludedWinner: "Concluso: La Francia ha vinto 2-1"
  }
};

const ThirdPlacePlayoffBanner = ({ locale }: { locale: "en" | "es" | "fr" | "de" | "pt" | "it" }) => {
  const trans = bannerTranslations[locale] || bannerTranslations.en;
  
  // Real-time date context: July 17, 2026 at 12:30 PM PDT/Local (-07:00 offset to match user environment)
  const matchTime = new Date("2026-07-17T12:30:00-07:00").getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = matchTime - now;

  let displayStatus: "upcoming" | "live" | "concluded" = "upcoming";
  let countdownString = "";
  let liveScoreText = "0 - 0";
  let liveMinuteText = "1'";

  if (diff > 0) {
    displayStatus = "upcoming";
    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / (24 * 3600));
    const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${hours.toString().padStart(2, "0")}h`);
    parts.push(`${minutes.toString().padStart(2, "0")}m`);
    parts.push(`${seconds.toString().padStart(2, "0")}s`);
    countdownString = `T-MINUS ${parts.join(" ")}`;
  } else if (diff > -2 * 60 * 60 * 1000) {
    // 2 hours duration
    displayStatus = "live";
    const elapsedMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
    const m = Math.min(elapsedMinutes, 120);
    liveMinuteText = m > 90 ? `90+${m - 90}'` : `${m}'`;
    
    if (m < 22) {
      liveScoreText = "0 - 0";
    } else if (m < 61) {
      liveScoreText = "1 - 0";
    } else if (m < 83) {
      liveScoreText = "1 - 1";
    } else {
      liveScoreText = "2 - 1";
    }
  } else {
    displayStatus = "concluded";
  }

  return (
    <div 
      id="third-place-playoff-banner"
      role="region"
      aria-label="Third Place Play-off Live Banner"
      className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
        displayStatus === "live"
          ? "border-red-500/30 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
          : displayStatus === "upcoming"
            ? "border-emerald-500/20 bg-[#09090b]/80 shadow-[0_0_20px_rgba(16,185,129,0.04)]"
            : "border-zinc-800 bg-[#09090b]/40 text-zinc-400"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r pointer-events-none ${
        displayStatus === "live"
          ? "from-red-500/5 to-transparent"
          : displayStatus === "upcoming"
            ? "from-emerald-500/5 to-transparent"
            : "from-zinc-500/5 to-transparent"
      }`} />

      <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest font-mono uppercase border ${
              displayStatus === "live"
                ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                : displayStatus === "upcoming"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-zinc-800 text-zinc-500 border-zinc-700/50"
            }`}>
              {displayStatus === "live" ? trans.live : displayStatus === "upcoming" ? trans.upcoming : trans.concluded}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              {locale === "es" ? "Partido 103" : locale === "fr" ? "Match 103" : "Match 103"}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-black tracking-wider text-zinc-400 uppercase font-sans mb-0.5">
              {trans.title}
            </h4>
            <p className="text-sm font-black text-white tracking-wide">
              {trans.teams}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" /> {trans.date}
            </span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {trans.stadium}
            </span>
          </div>
        </div>

        <div className="flex items-center md:justify-end gap-3 min-w-[200px]">
          {displayStatus === "upcoming" && (
            <div className="p-3 px-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 w-full md:w-auto text-center md:text-right">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono mb-0.5">
                {locale === "es" ? "CUENTA REGRESIVA" : locale === "fr" ? "REBOURS" : "KICKOFF COUNTDOWN"}
              </div>
              <div className="text-base font-black text-emerald-400 font-mono tracking-wider">
                {countdownString}
              </div>
            </div>
          )}

          {displayStatus === "live" && (
            <div className="p-3 px-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 w-full md:w-auto flex items-center justify-between md:justify-end gap-5">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest font-mono mb-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> {trans.live}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {trans.minute}: <strong className="text-white font-black">{liveMinuteText}</strong>
                </span>
              </div>
              <div className="text-xl font-black text-white font-mono tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
                {liveScoreText}
              </div>
            </div>
          )}

          {displayStatus === "concluded" && (
            <div className="p-3 px-4 rounded-xl bg-zinc-950/40 border border-zinc-900/60 w-full md:w-auto text-center md:text-right">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono mb-0.5">
                {locale === "es" ? "PARTIDO CONCLUIDO" : locale === "fr" ? "MATCH TERMINÉ" : "MATCH CONCLUDED"}
              </div>
              <div className="text-xs font-bold text-zinc-500 font-mono">
                {trans.concludedWinner}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface Stadium {
  id: string;
  name: string;
  city?: string;
  lat?: number;
  lng?: number;
  capacity?: string;
}

export interface CurrentUser {
  uid: string;
  displayName?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phoneNumber?: string;
  age?: number | string;
  password?: string;
  photoURL?: string | null;
  role?: string;
}

interface DashboardWrapperProps {
  locale: "en" | "es" | "fr" | "de" | "pt" | "it";
  setLocale: (lang: "en" | "es" | "fr" | "de" | "pt" | "it") => void;
  persona: "staff" | "organizer" | "volunteer" | "fan" | "admin";
  setPersona: (p: "staff" | "organizer" | "volunteer" | "fan" | "admin") => void;
  accessibilityMode: boolean;
  setAccessibilityMode: (mode: boolean) => void;
  children: React.ReactNode;
  globalEmergencyOverride: string | null;
  setGlobalEmergencyOverride: (msg: string | null) => void;
  sessionId: string;
  t: Record<string, any>; // Translation object with string keys
  selectedStadium: string;
  setSelectedStadium: (s: string) => void;
  findNearestStadium: () => void;
  findingNearest: boolean;
  stadiums: Stadium[];
  wsConnected?: boolean;
  handleLogout: () => void;
  currentUser?: CurrentUser;
  onUpdateProfile?: (updatedUser: CurrentUser) => void;
  liveMatchEvents?: { id: string; team: string; type: string; text: string; time: string; timestamp: string }[];
}

export function DashboardWrapper({
  locale,
  setLocale,
  persona,
  setPersona,
  accessibilityMode,
  setAccessibilityMode,
  children,
  globalEmergencyOverride,
  setGlobalEmergencyOverride,
  sessionId,
  t,
  selectedStadium,
  setSelectedStadium,
  findNearestStadium,
  findingNearest,
  stadiums,
  wsConnected = true,
  handleLogout,
  currentUser,
  onUpdateProfile,
  liveMatchEvents
}: DashboardWrapperProps) {
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean; role: 'staff' | 'organizer' | 'volunteer' | 'admin' | null }>({ isOpen: false, role: null });
  const [passcode, setPasscode] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Modals for Profile, Settings, About Us
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showShareHub, setShowShareHub] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [mockupTab, setMockupTab] = useState<"admin" | "organizer" | "staff" | "volunteer" | "fan">("admin");

  // Filter upcoming matches to only include live (within 2.5 hours of start time) or future ones
  const liveAndUpcomingMatches = upcomingMatches.filter(m => {
    const matchTime = new Date(`${m.date} ${m.time}`).getTime();
    const conclusionTime = matchTime + 2.5 * 60 * 60 * 1000;
    return Date.now() < conclusionTime;
  });

  // Promo Hub live match countdown state
  const [promoMatchId, setPromoMatchId] = useState<string>(() => {
    const validMatches = upcomingMatches.filter(m => {
      const matchTime = new Date(`${m.date} ${m.time}`).getTime();
      const conclusionTime = matchTime + 2.5 * 60 * 60 * 1000;
      return Date.now() < conclusionTime;
    });
    return validMatches[0]?.id || "u2";
  });
  const [countdownText, setCountdownText] = useState<string>("Initializing...");

  useEffect(() => {
    const updateCountdown = () => {
      const match = upcomingMatches.find(m => m.id === promoMatchId);
      if (!match) {
        setCountdownText("N/A");
        return;
      }
      
      const matchDateTimeStr = `${match.date} ${match.time}`;
      const matchTime = new Date(matchDateTimeStr).getTime();
      const now = Date.now();
      const diff = matchTime - now;

      if (diff <= 0) {
        const conclusionTime = matchTime + 2.5 * 60 * 60 * 1000;
        if (now < conclusionTime) {
          setCountdownText("LIVE NOW ⚽");
        } else {
          setCountdownText("Concluded 🏁");
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const hStr = String(hours).padStart(2, "0");
        const mStr = String(minutes).padStart(2, "0");
        const sStr = String(seconds).padStart(2, "0");
        
        setCountdownText(`${hStr}h : ${mStr}m : ${sStr}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [promoMatchId]);

  // Profile Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [currentUser?.photoURL]);

  useEffect(() => {
    if (showProfileModal && currentUser) {
      setEditDisplayName(currentUser.displayName || "");
      setEditFirstName(currentUser.firstName || "");
      setEditLastName(currentUser.lastName || "");
      setEditEmail(currentUser.email || "");
      setEditPhoneNumber(currentUser.phoneNumber || "");
      setEditAge(currentUser.age !== undefined && currentUser.age !== null ? String(currentUser.age) : "");
      setEditPassword(currentUser.password || "");
      setSaveError("");
      setSaveSuccess(false);
      setIsEditing(false);
    }
  }, [showProfileModal, currentUser]);
  
  // Settings customization
  const [stadiumTheme, setStadiumTheme] = useState<"standard" | "light">("standard");
  const [colorAccent, setColorAccent] = useState<"emerald" | "purple" | "cyan" | "amber" | "rose">("emerald");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load color accent and theme from localStorage
  useEffect(() => {
    const savedAccent = localStorage.getItem("stadiumiq_accent") as any;
    const savedTheme = localStorage.getItem("stadiumiq_theme") as any;
    if (savedAccent) setColorAccent(savedAccent);
    if (savedTheme) setStadiumTheme(savedTheme);
  }, []);

  const handleAccentChange = (accent: typeof colorAccent) => {
    setColorAccent(accent);
    localStorage.setItem("stadiumiq_accent", accent);
  };

  const handleThemeChange = (theme: typeof stadiumTheme) => {
    setStadiumTheme(theme);
    localStorage.setItem("stadiumiq_theme", theme);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const userId = currentUser?.uid || "fifa-admin-9x2";
      const updatedUserFields = {
        displayName: editDisplayName || currentUser?.displayName || "FIFA User",
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail || currentUser?.email || "",
        phoneNumber: editPhoneNumber,
        age: editAge ? Number(editAge) : null,
        password: editPassword || null,
        role: currentUser?.role || persona || "fan"
      };

      // 1. Save to Firestore
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, updatedUserFields, { merge: true });

      // 2. Try to update Firebase Auth if logged in
      if (auth.currentUser) {
        try {
          const { updateProfile } = await import("firebase/auth");
          await updateProfile(auth.currentUser, {
            displayName: editDisplayName || currentUser?.displayName || "FIFA User"
          });
        } catch (authErr) {
          console.warn("Auth display name update failed:", authErr);
        }

        // Try updating email in Firebase Auth if it changed and is valid
        if (editEmail && editEmail !== auth.currentUser.email && editEmail.includes("@")) {
          try {
            const { updateEmail } = await import("firebase/auth");
            await updateEmail(auth.currentUser, editEmail);
          } catch (authErr) {
            console.warn("Auth email update failed (requires recent login):", authErr);
          }
        }

        // Try updating password in Firebase Auth if it was changed
        if (editPassword && editPassword !== currentUser?.password && editPassword.length >= 6) {
          try {
            const { updatePassword } = await import("firebase/auth");
            await updatePassword(auth.currentUser, editPassword);
          } catch (authErr) {
            console.warn("Auth password update failed (requires recent login):", authErr);
          }
        }
      }

      // 3. Notify parent component to update user state
      if (onUpdateProfile) {
        onUpdateProfile({
          ...currentUser,
          ...updatedUserFields,
          uid: userId
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setSaveError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePersonaClick = async (p: "staff" | "organizer" | "volunteer" | "fan" | "admin") => {
    if (p === persona) return;
    setPersona(p);
  };

  const allowedRoles = ["staff", "organizer", "volunteer", "fan", "admin"];

  // Accent color classes mapping
  const accentClasses = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40",
  };

  const themeBgClass = accessibilityMode
    ? "bg-black text-white"
    : stadiumTheme === "light"
      ? "bg-slate-50 text-slate-950 selection:bg-emerald-200"
      : "bg-[#050505] text-[#f4f4f5] selection:bg-emerald-500/30";

  return (
    <div 
      id="dashboard-root-wrapper"
      className={`min-h-screen flex flex-col justify-between transition-all duration-300 ${themeBgClass} ${
        accessibilityMode ? "theme-accessibility" : stadiumTheme === "light" ? "theme-light" : "theme-standard"
      }`}
    >
      <div className="flex-1 flex flex-col">
        {/* HEADER NAVBAR - FIXED/STICKY NAVIGATIONAL LAYOUT */}
        <header 
          id="navbar-header"
          className={`sticky top-0 z-50 transition-colors duration-200 border-b ${
            accessibilityMode 
              ? "border-white bg-black" 
              : stadiumTheme === "light"
                ? "border-slate-200 bg-white/95 backdrop-blur-md"
                : "border-[#27272a] bg-[#09090b]/95 backdrop-blur-md"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4">
            {/* Logo & Branding (Left Side) */}
            <div className="flex items-center gap-4 flex-1 min-w-[280px]">
              <div 
                id="brand-icon-badge"
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all shrink-0 ${
                  accessibilityMode 
                    ? "bg-white text-black border border-white" 
                    : persona === "admin"
                      ? "bg-rose-500 text-black shadow-[0_0_15px_rgba(244,63,94,0.35)]"
                      : persona === "organizer"
                        ? "bg-[#a855f7] text-black shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                        : persona === "volunteer"
                          ? "bg-[#06b6d4] text-black shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                          : persona === "fan"
                            ? "bg-[#f59e0b] text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                            : "bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.35)]"
                }`}
              >
                <span className="font-black text-xl leading-none">
                  {persona === "admin" ? "A" : persona === "organizer" ? "O" : persona === "volunteer" ? "V" : persona === "fan" ? "F" : "S"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 id="app-main-title" className={`text-lg font-bold tracking-tight uppercase flex flex-wrap items-center gap-2 leading-tight ${stadiumTheme === "light" ? "text-slate-900" : "text-white"}`}>
                  <span className="truncate">{t.title || "StadiumIQ"}</span>
                  <span 
                    id="role-status-badge"
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold border shrink-0 ${
                      accessibilityMode 
                        ? "bg-white text-black border-white" 
                        : persona === "admin"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : persona === "organizer"
                            ? "bg-[#a855f7]/10 border-[#a855f7]/30 text-[#c084fc]"
                            : persona === "volunteer"
                              ? "bg-[#06b6d4]/10 border-[#06b6d4]/30 text-[#22d3ee]"
                              : persona === "fan"
                                ? "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#fbbf24]"
                                : "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80]"
                    }`}
                  >
                    {persona === "admin" ? "ADMIN MODE" : persona === "organizer" ? (t.active_role_organizer || "ORGANIZER MODE") : persona === "volunteer" ? (t.active_role_volunteer || "VOLUNTEER MODE") : persona === "fan" ? (t.active_role_fan || "FAN MODE") : (t.active_role_staff || "STAFF MODE")}
                  </span>
                </h1>
                <p id="app-main-subtitle" className={`text-[10px] font-mono leading-none tracking-wider uppercase mt-1 truncate ${
                  accessibilityMode ? "text-white" : "text-[#71717a]"
                }`}>
                  {t.subtitle || "Smart Stadium & Operations"}
                </p>
              </div>
              <div className="flex flex-col border-l border-[#27272a] pl-3 ml-2 sm:pl-4 sm:ml-4 shrink-0 overflow-hidden">
                <p className={`text-[9px] sm:text-[10px] font-mono font-bold leading-none ${stadiumTheme === "light" ? "text-slate-900" : "text-white"}`}>
                  {currentTime.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC
                </p>
                <p className="text-[8px] sm:text-[9px] text-[#71717a] font-mono uppercase mt-0.5 whitespace-nowrap">
                  {currentTime.toLocaleDateString("en-GB", { timeZone: "UTC", weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Controls and Persona Selectors (Right Corner) */}
            <div 
              id="header-controls-right"
              className="flex items-center gap-3 sm:gap-4 flex-row justify-end w-full md:w-auto relative"
            >
              {/* 2. GLOBAL VENUE (VENUE SELECTOR & GPS) */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-medium shrink-0" aria-label="Venue Selector">
                {!accessibilityMode && <span className="text-[#71717a] font-mono hidden md:inline">{(t.venue || "VENUE")}:</span>}
                <div className="flex items-center gap-1.5 bg-[#18181b]/50 border border-[#27272a] rounded p-1">
                  <button
                    onClick={findNearestStadium}
                    disabled={findingNearest}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border shrink-0 ${
                      accessibilityMode
                        ? "bg-white text-black border-white"
                        : findingNearest
                          ? "bg-[#18181b] border-[#27272a] text-[#71717a]"
                          : "bg-[#18181b] border-[#27272a] hover:border-[#22c55e] text-zinc-400 hover:text-white"
                    }`}
                    title="Find nearest World Cup venue via GPS"
                  >
                    {findingNearest ? "🛰️..." : "🛰️ GPS"}
                  </button>
                  <select
                    value={selectedStadium}
                    onChange={(e) => setSelectedStadium(e.target.value)}
                    className="bg-transparent border-0 text-white text-[11px] font-mono font-bold focus:outline-none pr-4 pl-1 py-0.5 cursor-pointer shrink-0"
                  >
                    {stadiums.length > 0 ? (
                      stadiums.map((s) => (
                        <option key={s.id} value={s.id === "st_mbs" ? "st_mercedes" : s.id} className="bg-[#09090b] text-white">
                          {s.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="st_sofi" className="bg-[#09090b] text-white">SoFi Stadium</option>
                        <option value="st_metlife" className="bg-[#09090b] text-white">MetLife Stadium</option>
                        <option value="st_mercedes" className="bg-[#09090b] text-white">Mercedes-Benz</option>
                        <option value="st_azteca" className="bg-[#09090b] text-white">Estadio Azteca</option>
                        <option value="st_bcplace" className="bg-[#09090b] text-white">BC Place</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* 2.5 SHARE & PROMO HUB */}
              <button
                id="promo-hub-trigger"
                onClick={() => setShowShareHub(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-400 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 hover:text-emerald-300 transition-all font-mono text-xs font-bold shrink-0 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:scale-102 active:scale-98"
                title="Open StadiumIQ Share Hub & Media Kit"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">PROMO HUB</span>
                <span className="inline sm:hidden text-[11px]">PROMO</span>
              </button>

              {/* 3. PROFILE DROPDOWN */}
              <div className="relative shrink-0">
                <button 
                  id="profile-dropdown-trigger"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 hover:scale-105 active:scale-95 transition-all p-1 rounded-full border ${stadiumTheme === "light" ? "border-slate-300 hover:border-emerald-500 bg-slate-100" : "border-zinc-800 hover:border-emerald-500 bg-zinc-950"}`}
                  title="Open user profile menu"
                >
                  {currentUser?.photoURL && !avatarFailed ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="User avatar" 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-xs shrink-0">
                      {(currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </button>
                {showDropdown && (
                  <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl p-2 z-50 border ${stadiumTheme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-700 text-white"}`}>
                    <div className="px-4 py-2.5 border-b border-zinc-800/20 mb-1.5">
                      <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold truncate">{currentUser?.displayName || "FIFA Coordinator"}</p>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">{currentUser?.email || "fifa@stadiumiq.com"}</p>
                    </div>
                    <button 
                      onClick={() => { setShowProfileModal(true); setShowDropdown(false); }}
                      className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-zinc-800/10 hover:text-emerald-400 transition-colors ${stadiumTheme === "light" ? "hover:bg-slate-100" : "hover:bg-zinc-800"}`}
                    >
                      <User className="w-4 h-4 text-emerald-500" /> Profile
                    </button>
                    <button 
                      onClick={() => { setShowSettingsModal(true); setShowDropdown(false); }}
                      className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-zinc-800/10 hover:text-emerald-400 transition-colors ${stadiumTheme === "light" ? "hover:bg-slate-100" : "hover:bg-zinc-800"}`}
                    >
                      <Settings className="w-4 h-4 text-emerald-500" /> Settings
                    </button>
                    <button 
                      onClick={() => { setShowAboutModal(true); setShowDropdown(false); }}
                      className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-zinc-800/10 hover:text-emerald-400 transition-colors ${stadiumTheme === "light" ? "hover:bg-slate-100" : "hover:bg-zinc-800"}`}
                    >
                      <HelpCircle className="w-4 h-4 text-emerald-500" /> About Us
                    </button>
                    <button 
                      onClick={() => { handleLogout(); setShowDropdown(false); }} 
                      className={`flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-t border-zinc-800/20 mt-2 rounded-lg`}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* 4. ACTIVE ROLE SELECTOR (ONLY CURRENT ROLE SHOWS) */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-medium shrink-0" aria-label="Persona Selector">
                {!accessibilityMode && <span className="text-[#71717a] font-mono hidden md:inline">{(t.role || "ROLE")}:</span>}
                <div id="role-selector-buttons" className="flex items-center">
                  <button
                    id={`role-btn-${persona}`}
                    className={`px-2.5 py-1 text-[11px] font-mono uppercase rounded border transition-all shrink-0 ${
                      accessibilityMode
                        ? "bg-white text-black font-bold border border-white"
                        : persona === "admin"
                          ? "bg-red-500/20 text-red-400 border-red-500/30 font-bold"
                          : persona === "organizer"
                            ? "bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/30 font-bold"
                            : persona === "volunteer"
                              ? "bg-[#06b6d4]/20 text-[#22d3ee] border border-[#06b6d4]/30 font-bold"
                              : persona === "fan"
                                ? "bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30 font-bold"
                                : "bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 font-bold"
                    }`}
                  >
                    {persona === "admin" ? "Admin" : persona === "staff" ? (t.role_staff || "Staff") : persona === "organizer" ? (t.role_organizer || "Organizer") : persona === "volunteer" ? (t.role_volunteer || "Volunteer") : (t.role_fan || "Fan")}
                  </button>
                </div>
              </div>

              {/* 5. ACTIVE INDICATOR & WS LIVE FEED */}
              {!accessibilityMode && (
                <div className="hidden lg:flex items-center space-x-3 border-l border-[#27272a] pl-4 shrink-0">
                  <div id="ai-active-indicator" className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      persona === "organizer" ? "bg-[#a855f7]" :
                      persona === "volunteer" ? "bg-[#06b6d4]" :
                      persona === "fan" ? "bg-[#f59e0b]" : "bg-[#22c55e]"
                    }`}></div>
                    <span className={`text-[10px] font-mono uppercase ${
                      persona === "organizer" ? "text-[#c084fc]" :
                      persona === "volunteer" ? "text-[#22d3ee]" :
                      persona === "fan" ? "text-[#fbbf24]" : "text-[#22c55e]"
                    }`}>
                      GEMINI {persona}: ACTIVE
                    </span>
                  </div>
                  
                  <div id="ws-feed-indicator" className="flex items-center space-x-1.5 border-l border-[#27272a] pl-3">
                    <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${wsConnected ? "text-emerald-400" : "text-rose-400 font-bold"}`}>
                      {wsConnected ? "FEED LIVE" : "FEED OFFLINE"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT CONTAINER */}
        <main id="dashboard-main-content" className="max-w-7xl mx-auto px-6 pt-6 pb-20 md:pb-6 w-full flex flex-col gap-6 flex-1">
          {/* GLOBAL EMERGENCY OVERRIDE BANNER */}
          {globalEmergencyOverride && (
            <div id="global-emergency-override-banner" className="p-4 bg-red-600/10 border border-red-500 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <h4 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Global Broadcast Command Alert</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">{globalEmergencyOverride}</p>
                </div>
              </div>
              <button 
                id="dismiss-emergency-override"
                onClick={() => setGlobalEmergencyOverride(null)}
                className="text-xs text-red-400 hover:text-white underline uppercase font-mono"
              >
                DISMISS
              </button>
            </div>
          )}

          {/* WEBSOCKET DISCONNECTED ALERT */}
          {!wsConnected && (
            <div id="ws-disconnected-alert-banner" className="p-3 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                    {locale === "es" ? "Canal de operaciones sin conexión" : locale === "fr" ? "Flux d'opérations hors ligne" : "Live operations feed offline"}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {locale === "es" 
                      ? "Se perdió la conexión en vivo. Mostrando estado local en caché; intentando reconectar..." 
                      : locale === "fr" 
                        ? "Connexion perdue. Affichage de l'état local mis en cache; reconnexion..." 
                        : "Lost connection to stadium sensors. Showing cached local state; attempting to reconnect..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-red-400 font-mono text-[10px] font-bold">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                <span>RECONNECTING</span>
              </div>
            </div>
          )}

          {/* Live Match Details Banner (Third Place Play-off - July 17, 12:30 PM) */}
          <ThirdPlacePlayoffBanner locale={locale} />

          {/* Children Dashboard View */}
          {children}
        </main>
      </div>

      {/* FOOTER NAVBAR (Real Telemetry Logs) */}
      <footer 
        id="dashboard-footer"
        className={`py-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-medium uppercase tracking-wider pb-24 md:pb-4 ${
          accessibilityMode 
            ? "border-white bg-black text-white font-black" 
            : "bg-[#09090b] border-[#27272a] text-[#71717a]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
          <span className="font-mono text-[9px] bg-[#18181b] border border-[#27272a] px-2 py-1 rounded">Session ID: {sessionId ? sessionId.toUpperCase() : "8F2A9X1L"}</span>
          <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border text-[9px] font-bold ${
            accessibilityMode
              ? "border-white bg-black text-white"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            <span>✓</span>
            <span>AA Contrast Compliant</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Powered by Google Gemini</span>
          <span>© FIFA 2026</span>
        </div>
      </footer>

      {/* RESPONSIVE BOTTOM TAB NAVIGATION FOR MOBILE */}
      <nav
        id="mobile-bottom-nav"
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t px-2 py-2 flex items-center justify-around backdrop-blur-lg ${
          accessibilityMode
            ? "bg-black border-white text-white font-black border-t-2"
            : "bg-[#09090b]/95 border-[#27272a] text-[#71717a] shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
        }`}
      >
        {(["admin", "staff", "organizer", "volunteer", "fan"] as const).map((p) => {
          const isActive = persona === p;
          
          // Select appropriate icon
          const IconComponent = 
            p === "admin" ? ShieldAlert :
            p === "staff" ? Shield :
            p === "organizer" ? Calendar :
            p === "volunteer" ? Users : Award;

          // Color accents
          const accentColorClass = 
            accessibilityMode
              ? isActive ? "text-white bg-white/20 border border-white font-bold" : "text-white/60"
              : p === "admin"
                ? isActive ? "text-red-400 bg-red-500/10 border-red-500/30 font-bold" : "hover:text-[#f4f4f5]"
                : p === "organizer"
                  ? isActive ? "text-[#c084fc] bg-[#a855f7]/10 border-[#a855f7]/30 font-bold" : "hover:text-[#f4f4f5]"
                  : p === "volunteer"
                    ? isActive ? "text-[#22d3ee] bg-[#06b6d4]/10 border-[#06b6d4]/30 font-bold" : "hover:text-[#f4f4f5]"
                    : p === "fan"
                      ? isActive ? "text-[#fbbf24] bg-[#f59e0b]/10 border-[#f59e0b]/30 font-bold" : "hover:text-[#f4f4f5]"
                      : isActive ? "text-[#4ade80] bg-[#22c55e]/10 border-[#22c55e]/30 font-bold" : "hover:text-[#f4f4f5]";

          const label = 
            p === "admin" ? "Admin" :
            p === "staff" ? (t.role_staff || "Staff") : 
            p === "organizer" ? (t.role_organizer || "Organizer") : 
            p === "volunteer" ? (t.role_volunteer || "Volunteer") : 
            (t.role_fan || "Fan");

          return (
            <button
              key={p}
              onClick={() => handlePersonaClick(p)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-all border border-transparent ${accentColorClass}`}
            >
              <IconComponent className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* MODALS */}
      
      {/* 1. PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn animate-duration-200">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 ${stadiumTheme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-800 text-white"}`}>
            <button 
              onClick={() => {
                setShowProfileModal(false);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-800/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center mt-4">
              <div className="relative">
                 {currentUser?.photoURL && !avatarFailed ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500/50 shadow-xl"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-black border-4 border-emerald-500/50 shadow-xl">
                    {(editDisplayName?.[0] || currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U").toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold font-mono rounded-full uppercase border-2 border-zinc-900">
                  {persona}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mt-4">{currentUser?.displayName || "FIFA Coordinator"}</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser?.email || "fifa@stadiumiq.com"}</p>
              
              <div className="w-full border-t border-zinc-800/10 dark:border-zinc-800/60 my-5"></div>
              
              {!isEditing ? (
                <>
                  <div className="w-full space-y-3.5 text-left text-sm">
                    <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                      <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Account ID</span>
                      <span className="font-mono text-xs font-bold select-all truncate max-w-[200px]">{currentUser?.uid || "fifa-admin-9x2"}</span>
                    </div>
                    {currentUser?.firstName && (
                      <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                        <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">First Name</span>
                        <span className="font-bold">{currentUser.firstName}</span>
                      </div>
                    )}
                    {currentUser?.lastName && (
                      <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                        <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Last Name</span>
                        <span className="font-bold">{currentUser.lastName}</span>
                      </div>
                    )}
                    {currentUser?.phoneNumber && (
                      <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                        <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Phone</span>
                        <span className="font-bold">{currentUser.phoneNumber}</span>
                      </div>
                    )}
                    {currentUser?.age !== undefined && currentUser?.age !== null && (
                      <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                        <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Age</span>
                        <span className="font-bold">{currentUser.age}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                      <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Active Workspace</span>
                      <span className="font-bold capitalize">{selectedStadium === "st_sofi" ? "SoFi Stadium" : selectedStadium === "st_metlife" ? "MetLife Stadium" : selectedStadium === "st_mercedes" || selectedStadium === "st_mbs" ? "Mercedes-Benz" : "StadiumIQ Arena"}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                      <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Security clearance</span>
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold rounded border border-rose-500/20 uppercase tracking-widest">
                        {persona === "fan" ? "Level 1 (Fan Access)" : "Level 4 (Operational Access)"}
                      </span>
                    </div>
                    
                    {currentUser?.password && (
                      <div className="flex justify-between items-center bg-zinc-800/10 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/10 dark:border-zinc-800/40">
                        <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Account Password</span>
                        <span className="font-mono text-xs font-bold text-zinc-500">••••••••</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full flex gap-3 mt-6">
                    {(persona === "fan" || persona === "volunteer") && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" /> Edit Profile
                      </button>
                    )}
                    <button 
                      onClick={() => setShowProfileModal(false)}
                      className={`py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-950/20 cursor-pointer ${
                        persona === "fan" || persona === "volunteer" ? "flex-1" : "w-full"
                      }`}
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="w-full text-left space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Full Display Name</label>
                    <input 
                      type="text" 
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Display Name" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">First Name</label>
                      <input 
                        type="text" 
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        placeholder="First Name" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        placeholder="Last Name" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email address" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={editPhoneNumber}
                        onChange={(e) => setEditPhoneNumber(e.target.value)}
                        placeholder="Phone" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Age</label>
                      <input 
                        type="number" 
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        placeholder="Age" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">Login Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Enter new password" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {saveError && (
                    <div className="text-red-400 text-xs font-mono bg-red-950/20 border border-red-800/30 p-2.5 rounded-xl">
                      {saveError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="text-emerald-400 text-xs font-mono bg-emerald-950/20 border border-emerald-800/30 p-2.5 rounded-xl flex items-center gap-2">
                      <Check className="w-4 h-4 animate-bounce" /> Profile saved successfully!
                    </div>
                  )}

                  <div className="w-full flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={saveLoading}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer"
                    >
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SETTINGS MODAL (Moved from individual tabs - Language, Theme, and Color) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative ${stadiumTheme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-800 text-white"}`}>
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-800/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 uppercase tracking-tight text-emerald-400">
              <Settings className="w-5 h-5" /> Settings Console
            </h3>
            
            <div className="space-y-6">
              {/* Language Selector */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Locale Translation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["en", "es", "fr", "de", "pt", "it"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLocale(lang)}
                      className={`py-2 px-3 text-xs font-mono uppercase rounded-xl border transition-all ${
                        locale === lang
                          ? "bg-emerald-600 text-white border-emerald-500 font-bold"
                          : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/60"
                      }`}
                    >
                      {lang === "en" ? "English" : lang === "es" ? "Español" : lang === "fr" ? "Français" : lang === "de" ? "Deutsch" : lang === "pt" ? "Português" : "Italiano"}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Accessibility className="w-3.5 h-3.5 text-emerald-400" /> Visual Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { handleThemeChange("standard"); setAccessibilityMode(false); }}
                    className={`py-2.5 px-3 text-xs rounded-xl border transition-all ${
                      stadiumTheme === "standard" && !accessibilityMode
                        ? "bg-emerald-600 text-white border-emerald-500 font-bold"
                        : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300"
                    }`}
                  >
                    🏟️ Slate Dark
                  </button>
                  <button
                    onClick={() => { handleThemeChange("light"); setAccessibilityMode(false); }}
                    className={`py-2.5 px-3 text-xs rounded-xl border transition-all ${
                      stadiumTheme === "light" && !accessibilityMode
                        ? "bg-emerald-600 text-white border-emerald-500 font-bold"
                        : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300"
                    }`}
                  >
                    ☀️ Stadium Light
                  </button>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => { setAccessibilityMode(!accessibilityMode); }}
                    className={`w-full py-2.5 px-3 text-xs rounded-xl border transition-all flex items-center justify-center gap-2 ${
                      accessibilityMode
                        ? "bg-emerald-600 text-white border-emerald-500 font-bold"
                        : "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300"
                    }`}
                  >
                    <Accessibility className="w-4 h-4" /> WCAG High Contrast AA
                  </button>
                </div>
              </div>

              {/* Color Accent Picker */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" /> Color Accent
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(["emerald", "purple", "cyan", "amber", "rose"] as const).map((accent) => {
                    const bgColors = {
                      emerald: "bg-emerald-500",
                      purple: "bg-purple-500",
                      cyan: "bg-cyan-500",
                      amber: "bg-amber-500",
                      rose: "bg-rose-500",
                    };
                    return (
                      <button
                        key={accent}
                        onClick={() => handleAccentChange(accent)}
                        title={`Select ${accent} accent`}
                        className={`h-10 rounded-xl border-2 flex items-center justify-center transition-all ${bgColors[accent]} ${
                          colorAccent === accent 
                            ? "border-white scale-110 shadow-lg" 
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                      >
                        {colorAccent === accent && (
                          <span className="text-white text-xs font-black">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-8 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* 3. ABOUT US MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative ${stadiumTheme === "light" ? "bg-white border-slate-200 text-slate-800" : "bg-zinc-900 border-zinc-800 text-white"}`}>
            <button 
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-800/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mt-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-emerald-400 uppercase">About StadiumIQ</h3>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-1">FIFA Operations Console v2.6.0</p>
            </div>

            <div className="w-full border-t border-zinc-800/10 dark:border-zinc-800/60 my-5"></div>

            <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
              <p>
                StadiumIQ is a secure, intelligent operations dashboard designed specifically for the FIFA World Cup 2026 tournament. It handles real-time telemetry, venue synchronization, and incident logs.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Headquarters</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      FIFA-Strasse 20, P.O. Box 8044,<br />
                      Zürich, Switzerland
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Contact Operations</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      <a href="mailto:ops@fifa-stadiumiq.org" className="text-emerald-400 hover:underline">ops@fifa-stadiumiq.org</a><br />
                      <a href="mailto:support@stadiumiq.com" className="text-emerald-400 hover:underline">support@stadiumiq.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowAboutModal(false)}
              className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              Close Info
            </button>
          </div>
        </div>
      )}

      {/* 4. STADIUMIQ SHARE HUB & PROMO KIT MODAL */}
      {showShareHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-5xl rounded-3xl border border-zinc-800 bg-[#0c0c0e] text-white p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            
            {/* Close Button */}
            <button 
              id="share-hub-close-top"
              onClick={() => setShowShareHub(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Share2 className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                    StadiumIQ <span className="text-emerald-400">Matchday Promo Hub</span>
                  </h2>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-0.5">FIFA World Cup 2026 Matchday Hub & Broadcast Console</p>
                </div>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
                Live Match Operations 🚀
              </div>
            </div>

            {/* Interactive Match Countdown Dashboard */}
            <div className="bg-[#141416] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-widest font-bold">⚽ Matchday Live Operations Countdown</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Target Match:</span>
                  <select 
                    value={promoMatchId} 
                    onChange={(e) => setPromoMatchId(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {liveAndUpcomingMatches.map(m => (
                      <option key={m.id} value={m.id}>{m.teams} ({m.venue})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-zinc-950 px-5 py-3 border border-zinc-800 rounded-xl w-full md:w-auto justify-center md:justify-start">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Operational T-Minus</span>
                  <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 tracking-wider drop-shadow-[0_0_10px_rgba(52,211,153,0.2)] animate-pulse">
                    {countdownText}
                  </div>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold">Stadium:</span>
                  <span className="text-xs text-zinc-200 font-mono">
                    {(liveAndUpcomingMatches.find(m => m.id === promoMatchId) || upcomingMatches.find(m => m.id === promoMatchId))?.venue || "N/A"}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    {(liveAndUpcomingMatches.find(m => m.id === promoMatchId) || upcomingMatches.find(m => m.id === promoMatchId))?.date} @ {(liveAndUpcomingMatches.find(m => m.id === promoMatchId) || upcomingMatches.find(m => m.id === promoMatchId))?.time} UTC
                  </span>
                </div>
              </div>
            </div>

            {/* Main Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT PANEL (8 cols in LG): SOCIAL POST CREATIVE KIT */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">Step 1:</span>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-200">Share Your Tournament Story</h3>
                </div>

                {/* Pre-written Posts Generator */}
                <div className="space-y-4">
                  {[
                    {
                      title: "🎭 Scenario Story (High-Stakes Preparations)",
                      description: "Guides readers through a kickoff scenario showing how StadiumIQ coordinates complex roles and live operations.",
                      text: `The gates open in exactly 2 hours. Over 80,000 passionate football fans are descending upon the stadium. 

How does an elite tournament operations team coordinate stadium security, 300+ ground volunteers, facility responders, and thousands of concurrent fans in real-time? 

Enter StadiumIQ 🏟️ — the unified Tournament Operations & Companion Center custom-designed to optimize high-stakes matches during the FIFA World Cup 2026.

By synchronizing five key roles, StadiumIQ transforms live event management under immense pressure:
1. 👑 Control Admins: Multi-user state synchronization and full audit logs.
2. 📢 Operations Organizers: Instantly broadcast emergency routing and dispatch responders.
3. 👮 Field Security: Real-time incident logging and location-aware dispatch routing.
4. 🙋 Volunteer Concierge: Digital seat finders, ADA compliance, and dynamic support checklists.
5. ⚽ Fan Companion: Real-time concession queue wait times, active gate status, and direct assistant hotlines.

From kickoff countdowns to live crowd control overlays, StadiumIQ ensures the focus remains where it belongs: the beautiful game. 🚀

#StadiumIQ #FIFAWorldCup #MatchdayOperations #SportsTech #ReactJS #FullStack`
                    },
                    {
                      title: "💻 Technical Deep-Dive (Tournament Technology Stack)",
                      description: "Highlights the high-availability technical stack, offline-capable databases, and smart dispatch algorithms.",
                      text: `When 90,000 spectators connect to stadium networks, latency and intermittent connectivity can break traditional operations.

That's why we engineered StadiumIQ 🏟️ with a resilient, full-stack, offline-capable architecture optimized for high-density tournament environments:

⚡ Low-Latency Backend: Powered by Express and an optimized, in-memory SQLite buffer with automatic synchronization backends.
🛰️ Real-Time Telemetry: Live gate throughput tracking and location-aware dispatch routing to match closest officers to crowd-control events.
🤖 AI-Derived Safety Guardrails: Integrated Gemini models to parse spectator and staff feedback. If AI confidence drops below 85%, the system automatically flags the incident to human command for immediate override.
📱 Multi-Device Ready: Seamlessly scales from desktop control centers to field staff hand-held terminals and consumer mobile companion apps.

The result? A secure, zero-overhead stadium command center built to survive the stress of World Cup matchdays. ⚽

#SoftwareEngineering #SportsAnalytics #WebDevelopment #RealTimeApplications #NodeJS`
                    },
                    {
                      title: "⚡ Fan First Design (Aesthetic & Features)",
                      description: "A fast, clean, and highly readable summary highlighting fan-focused features and event operations.",
                      text: `A world-class tournament isn't just about what happens on the pitch — it’s about the spectator's journey from the parking lot to their seat.

StadiumIQ 🏟️ bridges the gap between stadium operations and the fan in Sector 102:

🍔 Smart Concession Tracking: Aggregated fan telemetry reports live wait times so spectators can grab food and return without missing a goal.
🚪 Gate Flow Optimization: Real-time queue algorithms detect bottlenecks at Gate C and recommend dynamic redirects through the app.
🙋 Ground Volunteer Enablement: Equips volunteers with digital assistance checklists and real-time incident reporting directly to security.
🔒 Role-Based Access Control: Absolute data security, ensuring fan privacy while maintaining administrative oversight.

Ready to level up event management? Let's build the future of sports venues together. ⚽

#FanExperience #TournamentManagement #StadiumOperations #ProductDesign #TailwindCSS`
                    },
                    {
                      title: "🎮 Matchday Simulation Hub",
                      description: "Focuses on our continuous countdowns, simulation of active games, and real-time alert systems.",
                      text: `Managing a high-stakes FIFA match is a game of seconds. 

StadiumIQ 🏟️ brings tournament-grade operational power to your screen. With our simulated matchday controller, you can live-test emergency alerts, manage incident reports, track live volunteer tasks, and view live interactive countdowns for upcoming matches:

⏰ Live Kickoff Countdown: Tracks real-time countdowns to scheduled fixtures.
🔔 Broadcaster Interface: Test-fire global announcements and view immediate, live-updated client UI overlays.
🚨 Live Incident Command: Report medical or security events, dispatch personnel, and track response metrics in real-time.

Experience the thrill of managing world-class events under pressure with StadiumIQ.

#EventOps #StadiumTech #WebSimulation #TypeScript #React`
                    }
                  ].map((post, idx) => (
                    <div key={post.title} className="border border-zinc-800/80 bg-zinc-900/30 rounded-2xl p-4 hover:border-emerald-500/20 transition-all flex flex-col gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-white">{post.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{post.description}</p>
                      </div>
                      
                      <div className="relative">
                        <textarea
                          id={`share-hub-post-text-${idx}`}
                          readOnly
                          value={post.text}
                          className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 resize-none select-all"
                        />
                        <button
                          id={`share-hub-post-copy-btn-${idx}`}
                          onClick={() => {
                            navigator.clipboard.writeText(post.text);
                            setCopiedIndex(idx);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase font-mono shadow-md transition-all active:scale-95"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              <span>COPIED!</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-3 h-3" />
                              <span>COPY POST</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL (5 cols in LG): ROLE INTERACTIVE MOCKUP STUDIO */}
              <div className="lg:col-span-5 flex flex-col gap-4 border-l border-zinc-800/80 lg:pl-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">Step 2:</span>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-200">Visual Mockup Studio</h3>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  We render live interactive mini-consoles in pure CSS for you to showcase. Use the tabs below to switch and inspect roles:
                </p>

                {/* Mockup Persona Tabs */}
                <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                  {(["admin", "organizer", "staff", "volunteer", "fan"] as const).map((roleKey) => (
                    <button
                      key={roleKey}
                      id={`share-hub-mockup-tab-${roleKey}`}
                      onClick={() => setMockupTab(roleKey)}
                      className={`py-1 text-[10px] font-mono font-bold rounded uppercase transition-all ${
                        mockupTab === roleKey
                          ? roleKey === "admin"
                            ? "bg-rose-500 text-black shadow-md"
                            : roleKey === "organizer"
                              ? "bg-[#a855f7] text-black shadow-md"
                              : roleKey === "staff"
                                ? "bg-[#22c55e] text-black shadow-md"
                                : roleKey === "volunteer"
                                  ? "bg-[#06b6d4] text-black shadow-md"
                                  : "bg-[#f59e0b] text-black shadow-md"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {roleKey}
                    </button>
                  ))}
                </div>

                {/* Simulated High-Fi Device Monitor / Frame */}
                <div className="bg-[#141416] border border-zinc-800 rounded-2xl p-4 shadow-inner relative flex flex-col gap-4">
                  
                  {/* Outer Frame Chrome Bar */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-1 text-[9px] font-mono text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                    </div>
                    <span className="uppercase text-[8px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/60 font-black">
                      {mockupTab === "admin" ? "🖥️ DESKTOP VIEW" : mockupTab === "organizer" ? "🖥️ OPERATIONS DESK" : "📱 HANDHELD DEVICE"}
                    </span>
                    <span className="opacity-60">10:45 AM UTC</span>
                  </div>

                  {/* HTML/CSS Screen Mockups */}
                  {mockupTab === "admin" && (
                    <div className="bg-[#09090b] border border-rose-500/30 rounded-xl p-4 font-mono text-[11px] text-zinc-300 shadow-lg">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                        <span className="text-rose-400 font-bold flex items-center gap-1">👑 StadiumIQ Admin Control</span>
                        <span className="text-[8px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded uppercase font-bold">RBAC Active</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-zinc-500">Master DB Sync:</span><span className="text-emerald-400 font-bold">Synchronized</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">Guardrail Engine:</span><span className="text-emerald-400 font-bold">98.2% Safe</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">Active Roles Logged:</span><span className="text-zinc-100 font-bold">5 Portals Live</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500">Fallback Routing:</span><span className="text-zinc-100">&lt; 85% Auto-triage</span></div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] space-y-1">
                        <div className="text-zinc-500 font-bold">System Actions History:</div>
                        <div className="text-zinc-400 truncate">● Admin updated security gate telemetry - 10:40 AM</div>
                        <div className="text-zinc-400 truncate">● System auto-sync backup written back - 10:15 AM</div>
                      </div>
                    </div>
                  )}

                  {mockupTab === "organizer" && (
                    <div className="bg-[#09090b] border border-[#a855f7]/30 rounded-xl p-4 font-mono text-[11px] text-zinc-300 shadow-lg">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                        <span className="text-[#c084fc] font-bold flex items-center gap-1">📢 Operations Organizer Hub</span>
                        <span className="text-[8px] bg-[#a855f7]/10 text-[#c084fc] px-1.5 py-0.5 rounded uppercase font-bold">Broadcaster</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-zinc-950 p-2 border border-zinc-800 rounded text-zinc-400 text-[10px] leading-relaxed">
                          <div className="text-[#c084fc] font-black mb-1">🚨 Quick Broadcast Preset #1</div>
                          "Security Alert: Gate A is currently bottlenecked. Fans please reroute to Gate B."
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[9px] text-center font-bold">
                          <div className="bg-[#18181b] p-1.5 border border-zinc-800 rounded text-[#c084fc]">Weather: Clear</div>
                          <div className="bg-[#18181b] p-1.5 border border-zinc-800 rounded text-emerald-400">WS Live Feed</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {mockupTab === "staff" && (
                    <div className="bg-[#09090b] border border-emerald-500/30 rounded-xl p-4 font-mono text-[11px] text-zinc-300 shadow-lg">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                        <span className="text-[#4ade80] font-bold flex items-center gap-1">👮 Security & Staff Patrol</span>
                        <span className="text-[8px] bg-emerald-500/10 text-[#4ade80] px-1.5 py-0.5 rounded uppercase font-bold">Patrol</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-rose-950/40 border border-rose-500/20 p-2.5 rounded text-[10px] space-y-1">
                          <div className="flex justify-between text-rose-400 font-bold"><span>🚨 Medical Event</span><span className="animate-pulse">● HIGH PRIO</span></div>
                          <div className="text-zinc-300">Spectator collapsed near Section 102. Responders routed.</div>
                        </div>
                        <div className="bg-zinc-950 p-1.5 border border-zinc-800 rounded text-[9px] flex justify-between items-center text-zinc-400">
                          <span>Nearest Officer: John</span>
                          <span className="text-emerald-400 font-bold">Sector 2</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {mockupTab === "volunteer" && (
                    <div className="bg-[#09090b] border border-cyan-500/30 rounded-xl p-4 font-mono text-[11px] text-zinc-300 shadow-lg">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                        <span className="text-cyan-400 font-bold flex items-center gap-1">🙋 Volunteer Concierge</span>
                        <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded uppercase font-bold">Support</span>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded text-center text-[8px] font-bold text-zinc-500">
                          <div className="bg-cyan-500/20 border border-cyan-500/40 p-1 rounded text-cyan-300">102A</div>
                          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded">102B</div>
                          <div className="bg-cyan-500/20 border border-cyan-500/40 p-1 rounded text-cyan-300">102C</div>
                          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded">102D</div>
                        </div>
                        <p className="text-[9px] text-zinc-400 leading-tight">Instant lookup of seating coordinates, ADA accessibility entrances, and custom checklist routines.</p>
                      </div>
                    </div>
                  )}

                  {mockupTab === "fan" && (
                    <div className="bg-[#09090b] border border-amber-500/30 rounded-xl p-4 font-mono text-[11px] text-zinc-300 shadow-lg">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                        <span className="text-amber-400 font-bold flex items-center gap-1">⚽ Fan Stadium Companion</span>
                        <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">Fan Portal</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="bg-zinc-950 p-2 border border-zinc-800 rounded flex justify-between items-center text-[10px]">
                          <span>🍔 Concession Line Wait:</span>
                          <span className="text-emerald-400 font-bold">~5 Mins</span>
                        </div>
                        <div className="bg-zinc-950 p-2 border border-zinc-800 rounded flex justify-between items-center text-[10px]">
                          <span>🚪 Gate Flow Status:</span>
                          <span className="text-emerald-400 font-bold">Optimized</span>
                        </div>
                        <div className="bg-zinc-950 p-2 border border-zinc-800 rounded flex justify-between items-center text-[10px]">
                          <span>📍 Smart GPS Seating Map:</span>
                          <span className="text-amber-400 font-bold">Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informational Guidelines on taking high-res screenshot */}
                  <div className="bg-[#1c1c1e] border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2">
                    <h5 className="text-[11px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      How to capture your live visuals
                    </h5>
                    <ul className="space-y-1 text-[10px] text-zinc-400 leading-relaxed list-disc list-inside">
                      <li>
                        Toggle the **Role Selector** in the main header bar to switch personas.
                      </li>
                      <li>
                        Navigate to the actual live page and use <kbd className="px-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 font-mono text-[9px]">Cmd+Shift+4</kbd> (Mac) or <kbd className="px-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 font-mono text-[9px]">Win+Shift+S</kbd> (Windows) to crop a gorgeous screenshot.
                      </li>
                      <li>
                        Since you are running the live, high-resolution web app, your captured screenshots will be incredibly crisp and professional!
                      </li>
                    </ul>
                  </div>

                </div>

                {/* Viral Marketing Bonus Tip */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wide">Pro-Marketing Tip</h5>
                    <p className="text-[10px] text-zinc-300 leading-relaxed mt-0.5">
                      Pairing a high-resolution screenshot of the **Admin Page** alongside your **Security & Fan** mobile mockups on LinkedIn shows off the extreme full-stack capability of your StadiumIQ build, demonstrating the high-fidelity operational design of your platform!
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-800/80 pt-5 flex items-center justify-between gap-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">StadiumIQ Live Broadcast Kit — Share Your Platform</span>
              <button 
                id="share-hub-close-bottom"
                onClick={() => setShowShareHub(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl transition-all shadow-lg text-sm uppercase font-mono"
              >
                Close Share Hub
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
