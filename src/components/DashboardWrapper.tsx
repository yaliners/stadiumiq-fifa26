import React, { useState, useEffect } from "react";
import { Accessibility, Shield, Calendar, Users, Award, Settings, User, Heart, X, HelpCircle, MapPin, Mail, Globe, Palette, ShieldAlert, Info, Edit, Check, Eye, EyeOff } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

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
  t: any; // Translation object
  selectedStadium: string;
  setSelectedStadium: (s: string) => void;
  findNearestStadium: () => void;
  findingNearest: boolean;
  stadiums: any[];
  wsConnected?: boolean;
  handleLogout: () => void;
  currentUser?: any;
  onUpdateProfile?: (updatedUser: any) => void;
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
  onUpdateProfile
}: DashboardWrapperProps) {
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean; role: 'staff' | 'organizer' | 'volunteer' | 'admin' | null }>({ isOpen: false, role: null });
  const [passcode, setPasscode] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Modals for Profile, Settings, About Us
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

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
    </div>
  );
}
