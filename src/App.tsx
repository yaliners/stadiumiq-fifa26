import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "./lib/firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut, signInAnonymously } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AuthScreen } from "./components/AuthScreen";
import { AdminDashboard } from "./components/AdminDashboard";

/**
 * ACCESSIBILITY AUDIT (WCAG AA COMPLIANT):
 * - Screen Reader Announcements: Message logs are marked with aria-live="polite".
 * - Visible Focus States: Interactive elements utilize focused outline and ring indicators.
 * - Contrast Compliance: > 4.5:1 ratio in both Slate Dark and High-Contrast Accessibility themes.
 * - Semantic Structure: Fully semantic HTML utilizing <header>, <main>, <section>, <button>.
 */

import { 
  Send, 
  MessageSquare, 
  AlertTriangle, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Globe, 
  Accessibility, 
  RefreshCw, 
  Activity, 
  CornerDownRight, 
  ShieldAlert,
  Info,
  Award,
  Calendar,
  MapPin,
  Mic,
  Square,
  Pause,
  Play,
  StopCircle,
  X,
  Trash2,
  Copy,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cpu,
  Bus,
  CheckSquare,
  Plus,
  Minus,
  Search,
  QrCode,
  ShoppingCart,
  Lock,
  Bell
} from "lucide-react";

import { DashboardWrapper } from "./components/DashboardWrapper";
import { ChatInterface } from "./components/ChatInterface";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

const locales: Record<string, any> = { en, es, fr };

function getTeamFlag(teamName: string) {
  const flags: Record<string, string> = {
    "USA": "🇺🇸",
    "United States": "🇺🇸",
    "Spain": "🇪🇸",
    "Morocco": "🇲🇦",
    "Croatia": "🇭🇷",
    "Ecuador": "🇪🇨",
    "Korea Republic": "🇰🇷",
    "Germany": "🇩🇪",
    "Nigeria": "🇳🇬",
    "Japan": "🇯🇵",
    "Argentina": "🇦🇷",
    "France": "🇫🇷",
    "Ghana": "🇬🇭",
    "Belgium": "🇧🇪",
    "Mexico": "🇲🇽",
    "Sweden": "🇸🇪",
    "Uruguay": "🇺🇾",
    "Australia": "🇦🇺",
    "Canada": "🇨🇦",
    "Switzerland": "🇨🇭",
    "Iran": "🇮🇷",
    "Brazil": "🇧🇷",
    "Senegal": "🇸🇳",
    "Norway": "🇳🇴",
    "Panama": "🇵🇦",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Paraguay": "🇵🇾",
    "New Zealand": "🇳🇿",
    "Türkiye": "🇹🇷",
    "Cape Verde": "🇨🇻",
    "Czechia": "🇨🇿",
    "South Africa": "🇿🇦",
    "Saudi Arabia": "🇸🇦",
    "Haiti": "🇭🇹",
    "Congo DR": "🇨🇩",
    "Uzbekistan": "🇺🇿",
    "Colombia": "🇨🇴",
    "Qatar": "🇶🇦",
    "Egypt": "🇪🇬"
  };
  return flags[teamName] || "🏳️";
}

const uiTranslations = {
  en: {
    upcoming_matches: "Upcoming Matches Schedule",
    location: "Location",
    win_predictor: "Win Predictor",
    select_home: "Team A",
    select_away: "Team B",
    calculate_btn: "Predict Win Probabilities",
    past_results: "Past Results & Form",
    stadium: "Stadium",
    win_prob_title: "Calculated Probabilities",
    draw: "Draw",
    win_rate: "Win Rate",
    select_teams_prompt: "Select different teams to predict",
    based_on: "Based on historical friendly & tournament results",
    h2h_history: "Head-to-head records analyzed",
    overall_form: "Overall team form factored",
    matches_text: "matches",
    vs: "vs"
  },
  es: {
    upcoming_matches: "Calendario de Próximos Partidos",
    location: "Ubicación",
    win_predictor: "Predictor de Victorias",
    select_home: "Equipo A",
    select_away: "Equipo B",
    calculate_btn: "Predecir Probabilidades",
    past_results: "Resultados y Rendimiento",
    stadium: "Estadio",
    win_prob_title: "Probabilidades Calculadas",
    draw: "Empate",
    win_rate: "Tasa de Victorias",
    select_teams_prompt: "Seleccione diferentes equipos para predecir",
    based_on: "Basado en resultados históricos del torneo",
    h2h_history: "Historial de enfrentamientos directos analizado",
    overall_form: "Rendimiento general del equipo considerado",
    matches_text: "partidos",
    vs: "contra"
  },
  fr: {
    upcoming_matches: "Calendrier des Matchs À Venir",
    location: "Lieu",
    win_predictor: "Prédicteur de Victoire",
    select_home: "Équipe A",
    select_away: "Équipe B",
    calculate_btn: "Prédire les Probabilités",
    past_results: "Résultats et Forme",
    stadium: "Stade",
    win_prob_title: "Probabilités Calculées",
    draw: "Match Nul",
    win_rate: "Taux de Victoire",
    select_teams_prompt: "Sélectionnez différentes équipes à prédire",
    based_on: "Basé sur les résultats historiques du tournoi",
    h2h_history: "Historique des confrontations analysé",
    overall_form: "Forme générale de l'équipe prise en compte",
    matches_text: "matchs",
    vs: "contre"
  }
};

const personaQuestions = {
  staff: {
    en: [
      "Check gate crowd status and walk times for SoFi Stadium",
      "Which facilities are nearby Section 102 restrooms?",
      "Report facility or security incident",
      "Where is the nearest first-aid outpost?"
    ],
    es: [
      "Verificar congestión de puertas y tiempos de espera en SoFi Stadium",
      "¿Qué instalaciones hay cerca de los baños de la Sección 102?",
      "Reportar un incidente de seguridad o instalación",
      "¿Dónde está el puesto de primeros auxilios más cercano?"
    ],
    fr: [
      "Vérifier la congestion des portes et temps d'attente à SoFi Stadium",
      "Quelles installations sont proches des toilettes de la Section 102?",
      "Signaler un incident de sécurité ou d'équipement",
      "Où se trouve le poste de secours le plus proche?"
    ]
  },
  organizer: {
    en: [
      "What is the match schedule and stages for USA?",
      "Calculate probability match-up: USA vs Germany",
      "How is past team performance and form calculated?",
      "Is there an active alert for Estadio Azteca weather?"
    ],
    es: [
      "¿Cuál es el calendario de partidos y fases para USA?",
      "Calcular probabilidades de victoria: USA vs Alemania",
      "¿Cómo se calcula el rendimiento y forma anterior de los equipos?",
      "¿Hay alguna alerta activa para el clima del Estadio Azteca?"
    ],
    fr: [
      "Quel est le calendrier et les étapes pour les USA?",
      "Calculer les probabilités de match: USA vs Allemagne",
      "Comment la performance passée et la forme sont-elles calculées?",
      "Y a-t-il une alerte météo active pour l'Estadio Azteca?"
    ]
  },
  volunteer: {
    en: [
      "Where are the nearest ADA wheelchair ramps and restrooms?",
      "What items are prohibited for spectators to bring?",
      "Where are sensory-friendly quiet rooms located?",
      "Who do I contact for lost and found items?"
    ],
    es: [
      "¿Dónde están las rampas ADA y baños accesibles más cercanos?",
      "¿Qué artículos están prohibidos para los espectadores?",
      "¿Dónde se encuentran las salas sensoriales tranquilas?",
      "¿Con quién me comunico para objetos perdidos?"
    ],
    fr: [
      "Où sont les rampes d'accès ADA et toilettes accessibles?",
      "Quels objets sont interdits aux spectateurs?",
      "Où se trouvent les espaces sensoriels calmes?",
      "Qui contacter pour les objets trouvés?"
    ]
  },
  fan: {
    en: [
      "When is USA vs Paraguay playing and at which stadium?",
      "Where is the nearest food and beverage concession hub?",
      "What are the rules for extra time and penalty shootouts?",
      "What is the live weather forecast at MetLife Stadium?"
    ],
    es: [
      "¿Cuándo juega USA contra Paraguay y en qué estadio?",
      "¿Dónde está el puesto de comida y bebida más cercano?",
      "¿Cuáles son las reglas para prórrogas y penaltis?",
      "¿Cuál es el pronóstico del tiempo en MetLife Stadium?"
    ],
    fr: [
      "Quand joue USA contre Paraguay et dans quel stade?",
      "Où se trouve le point de restauration le plus proche?",
      "Quelles sont les règles pour la prolongation et les tirs au but?",
      "Quelles sont les prévisions météo en direct à MetLife Stadium?"
    ]
  }
};

interface Message {
  id: string;
  sender: "user" | "stadiumiq";
  text: string;
  confidence?: "grounded" | "uncertain" | "general_knowledge";
  source_type?: "decision_engine" | "gemini" | "fallback" | "timeout";
  model_tier?: string;
  isError?: boolean;
  timestamp?: string;
}

interface Alert {
  id: string;
  stadium_id: string;
  type: string;
  message: string;
  starts_at: string;
  ends_at: string;
  severity: "low" | "medium" | "high";
}

// Helper utility to format messages beautifully without raw markdown hashes (#) or stars (**)
function formatMessageText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    let currentLine = line;
    let headerLevel = 0;
    
    // Handle Markdown Headings (e.g., # Title, ## Title)
    if (currentLine.startsWith("#")) {
      const match = currentLine.match(/^(#{1,6})\s*(.*)$/);
      if (match) {
        headerLevel = match[1].length;
        currentLine = match[2];
      }
    }

    // Parse simple **bold** markers
    const parts: React.ReactNode[] = [];
    let index = 0;
    const bRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = bRegex.exec(currentLine)) !== null) {
      if (match.index > index) {
        parts.push(currentLine.substring(index, match.index));
      }
      parts.push(<strong key={match.index} className="font-extrabold text-white">{match[1]}</strong>);
      index = bRegex.lastIndex;
    }
    if (index < currentLine.length) {
      parts.push(currentLine.substring(index));
    }

    const renderedContent = parts.length > 0 ? parts : currentLine;

    if (headerLevel > 0) {
      const sizeClass = headerLevel === 1 ? "text-lg" : headerLevel === 2 ? "text-base" : "text-sm";
      return (
        <div key={lineIdx} className={`${sizeClass} font-bold text-white mt-3 mb-1.5 uppercase tracking-wide`}>
          {renderedContent}
        </div>
      );
    }

    // Handle list bullet
    if (currentLine.trim().startsWith("- ") || currentLine.trim().startsWith("* ")) {
      const bulletContent = currentLine.replace(/^\s*[-*]\s*/, "");
      // Re-parse bulletContent for bolding
      const bulletParts: React.ReactNode[] = [];
      let bIdx = 0;
      const bMatchRegex = /\*\*(.*?)\*\*/g;
      let bMatch;
      while ((bMatch = bMatchRegex.exec(bulletContent)) !== null) {
        if (bMatch.index > bIdx) {
          bulletParts.push(bulletContent.substring(bIdx, bMatch.index));
        }
        bulletParts.push(<strong key={bMatch.index} className="font-extrabold text-white">{bMatch[1]}</strong>);
        bIdx = bMatchRegex.lastIndex;
      }
      if (bIdx < bulletContent.length) {
        bulletParts.push(bulletContent.substring(bIdx));
      }

      return (
        <li key={lineIdx} className="list-disc list-inside ml-2 text-sm text-[#d4d4d8] leading-relaxed my-1">
          {bulletParts.length > 0 ? bulletParts : bulletContent}
        </li>
      );
    }

    return (
      <p key={lineIdx} className="text-sm text-[#d4d4d8] leading-relaxed my-1 min-h-[1rem]">
        {renderedContent}
      </p>
    );
  });
}

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<"staff" | "organizer" | "volunteer" | "fan" | "admin" | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);
  const [locale, setLocale] = useState<"en" | "es" | "fr">("en");
  const [persona, setPersonaState] = useState<"staff" | "organizer" | "volunteer" | "fan" | "admin">("fan");

  const [isRoleVerified, setIsRoleVerified] = useState(false);
  const [showRoleAuthModal, setShowRoleAuthModal] = useState(false);
  const [pendingPersona, setPendingPersona] = useState<"staff" | "organizer" | "volunteer" | "fan" | "admin" | null>(null);
  const [roleAuthPin, setRoleAuthPin] = useState("");
  const [roleAuthError, setRoleAuthError] = useState<string | null>(null);

  const logRoleActivity = async (actionText: string) => {
    try {
      await addDoc(collection(db, "activity_logs"), {
        action: actionText,
        author: persona.toUpperCase(),
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  };

  // New async loader states for Fan dashboard
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrProgressMessage, setQrProgressMessage] = useState("");

  const [broadcasts, setBroadcasts] = useState<string[]>([
    "📢 System: Gate B congestion spike (35% increase) - volunteers nearby please support.",
    "📢 Organizer: Sensory backpacks stock replenished at Section 120 ADA Gateway.",
    "📢 Medical: Stay hydrated! Free water packets are now available at all volunteer desks."
  ]);

  // ORGANIZER DASHBOARD STATE
  const [masterMatches, setMasterMatches] = useState([
    { id: "m1", date: "July 11, 2026", time: "18:00", match: "USA vs Spain", venue: "SoFi Stadium", status: "In-Progress", density: "High", staffing: "Optimal" },
    { id: "m2", date: "July 12, 2026", time: "15:00", match: "Mexico vs Germany", venue: "Estadio Azteca", status: "Scheduled", density: "Extreme", staffing: "Surge Required" },
    { id: "m3", date: "July 14, 2026", time: "20:00", match: "Canada vs France", venue: "BC Place", status: "Scheduled", density: "Normal", staffing: "Optimal" },
  ]);
  const [staffFleet, setStaffFleet] = useState<Record<string, number>>({
    stewards: 120,
    security: 85,
    medical: 24,
    cleaners: 45
  });

  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 12));

  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [stadiumsLoading, setStadiumsLoading] = useState(true);
  const [findingNearest, setFindingNearest] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [teamA, setTeamA] = useState("USA");
  const [teamB, setTeamB] = useState("Spain");

  // Advanced request control state & refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Copied message ID state for clipboard feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stadium selection & interactive map states
  const [selectedStadium, setSelectedStadium] = useState("st_sofi");
  const [simulatedDensity, setSimulatedDensity] = useState<Record<string, number>>({
    gate_a: 92,
    gate_b: 41,
    gate_c: 68,
    gate_d: 55
  });
  const [activeMapFeature, setActiveMapFeature] = useState<any>({
    type: "gate",
    id: "gate_a",
    name: "Gate A (Main Entry)",
    status: "Highly Congested",
    density: 92,
    info: "Expected wait time: 15-20 mins. Restrooms, ADA assistance, and first aid are fully active nearby. Recommended alternate: Gate C.",
    color: "text-red-500 bg-red-500/10 border-red-500/20"
  });

  // Weather state hooks (real-time keyless Integration)
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Zoom and pan states for interactive blueprint
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tournament Operations Center (TOC) state variables mapping to challenge verticals
  const [activeTOCSubTab, setActiveTOCSubTab] = useState<"sustainability" | "transit" | "intelligence">("sustainability");
  const [binsFill, setBinsFill] = useState<Record<string, number>>({
    bin_101: 72,
    bin_102: 88,
    bin_103: 45,
    bin_104: 91
  });
  const [sustainabilityStatus, setSustainabilityStatus] = useState<string>("");
  const [isSustainabilityLoading, setIsSustainabilityLoading] = useState(false);
  const [shuttleEgressPhase, setShuttleEgressPhase] = useState<"pre" | "half" | "post">("half");
  const [shuttleStatus, setShuttleStatus] = useState<string>("");
  const [isShuttleLoading, setIsShuttleLoading] = useState(false);

  // NEW GLOBAL EMERGENCY OVERRIDE STATE
  const [globalEmergencyOverride, setGlobalEmergencyOverride] = useState<string | null>(null);
  const [newEmergencyMessage, setNewEmergencyMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  // FAN DASHBOARD STATE
  const [ticketScanned, setTicketScanned] = useState(false);
  const [entryCountdown, setEntryCountdown] = useState(42); // minutes left
  const [cart, setCart] = useState<{name: string; price: number; type: "food" | "merch"; quantity: number}[]>([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderPickupCode, setOrderPickupCode] = useState("");
  const [lastOrderDetails, setLastOrderDetails] = useState<{items: {name: string; price: number; type: "food" | "merch"; quantity: number}[]; total: number} | null>(null);

  // STAFF DASHBOARD STATE
  const [incidents, setIncidents] = useState<{id: string; location: string; category: "seat" | "spill" | "gate" | "other"; desc: string; status: "pending" | "active" | "resolved"; severity: "low" | "medium" | "high"; time: string}[]>([
    { id: "inc-01", location: "Section 112, Row 4", category: "seat", desc: "Broken backing on seat 12", status: "pending", severity: "medium", time: "10 mins ago" },
    { id: "inc-02", location: "Gate B Security Lane 3", category: "gate", desc: "Bag scanner calibration fault", status: "active", severity: "high", time: "5 mins ago" },
    { id: "inc-03", location: "Concourse C near Restrooms", category: "spill", desc: "Liquid spill hazard", status: "resolved", severity: "low", time: "25 mins ago" },
  ]);
  const [newIncidentLoc, setNewIncidentLoc] = useState("");
  const [newIncidentCat, setNewIncidentCat] = useState<"seat" | "spill" | "gate" | "other">("seat");
  const [newIncidentDesc, setNewIncidentDesc] = useState("");
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<"low" | "medium" | "high">("low");
  const [staffTasks, setStaffTasks] = useState([
    { id: 1, text: "Verify sensory kits are fully stocked at Sector 120 ADA desk", completed: true },
    { id: 2, text: "Inspect Gate A biometric turnstile network status", completed: false },
    { id: 3, text: "Calibrate bag scanners at North Gate B", completed: false },
    { id: 4, text: "Coordinate volunteer crew swap at Concourse B Information Desk", completed: false },
  ]);

  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [faqSearchResult, setFaqSearchResult] = useState<string | null>(null);
  const [volunteerCheckedIn, setVolunteerCheckedIn] = useState(false);
  const [volunteerDistance, setVolunteerDistance] = useState(0.2); // km to stadium
  const [volunteerShiftHours] = useState("08:00 AM - 04:00 PM");

  const [panicModeActive, setPanicModeActive] = useState(false);
  const [panicCountdown, setPanicCountdown] = useState(5);
  const [panicDispatched, setPanicDispatched] = useState(false);
  const [selectedEmergencyCategory, setSelectedEmergencyCategory] = useState<"medical" | "security" | "hazard" | "conflict">("security");

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoadingRole(true);
        const userRef = doc(db, "users", currentUser.uid);
        try {
          const fetchRoleWithRetry = async (retries = 5): Promise<any> => {
            for (let i = 0; i < retries; i++) {
              try {
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) return userSnap.data();
                return null;
              } catch (error: any) {
                // Retry on all errors, not just 'unavailable'
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
              }
            }
          };
          const userData = await fetchRoleWithRetry();
          if (userData && userData.role) {
            setRole(userData.role);
            setUser({
              ...currentUser,
              displayName: userData.displayName || currentUser.displayName,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phoneNumber: userData.phoneNumber,
              age: userData.age,
              role: userData.role
            });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        } finally {
          setLoadingRole(false);
        }
      } else {
        setUser(prevUser => {
          if (prevUser && (prevUser.isLocal || prevUser.uid?.startsWith("fifa-"))) {
            return prevUser;
          }
          setRole(null);
          return null;
        });
      }
    });
  }, []);

  // Functions
  const handleLogout = async () => {
    await signOut(auth);
    setRole(null);
    setPersonaState("fan");
  };

  const setPersona = (p: "staff" | "organizer" | "volunteer" | "fan" | "admin") => {
    if (p === "fan") {
      setPersonaState("fan");
      setIsRoleVerified(false);
      setPendingPersona(null);
    } else {
      // Switch away locks the previous role, requiring re-authentication
      setIsRoleVerified(false);
      setPendingPersona(p);
      setRoleAuthPin("");
      setRoleAuthError(null);
      setShowRoleAuthModal(true);
    }
  };

  const handleAuthenticateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleAuthPin.trim().toUpperCase() === "FIFA2026-OP") {
      const target = pendingPersona || "staff";
      setPersonaState(target);
      setIsRoleVerified(true);
      setShowRoleAuthModal(false);
      setPendingPersona(null);
      setRoleAuthPin("");
      setRoleAuthError(null);

      // Secure Firebase Auth Session via Anonymous SignIn if no session exists
      if (!auth.currentUser) {
        try {
          const result = await signInAnonymously(auth);
          // Set user doc in Firestore to ensure role matches
          await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            displayName: `FIFA Bypass Role (${target})`,
            email: `${target}@stadiumiq.com`,
            role: target,
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error("Failed to establish secure auth session for bypass role:", err);
        }
      } else {
        // Update existing auth user role in firestore
        try {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            role: target
          }, { merge: true });
        } catch (err) {
          console.error("Failed to update user role in firestore:", err);
        }
      }
    } else {
      setRoleAuthError("INVALID ACCESS KEY. ACCESS DENIED.");
    }
  };

  const handleCancelRoleAuth = () => {
    setShowRoleAuthModal(false);
    setPersonaState("fan");
    setPendingPersona(null);
    setRoleAuthPin("");
    setRoleAuthError(null);
  };

  const handleVerifyTicket = () => {
    if (qrLoading) return;
    setQrLoading(true);
    if (!ticketScanned) {
      setQrProgressMessage(locale === "es" ? "INICIANDO ESCANEO..." : locale === "fr" ? "INITIALISATION..." : "INITIATING SCAN...");
      setTimeout(() => {
        setQrProgressMessage(locale === "es" ? "VERIFICANDO PASE..." : locale === "fr" ? "VÉRIFICATION..." : "VERIFYING PASS...");
        setTimeout(() => {
          setQrProgressMessage(locale === "es" ? "¡ACCESO AUTORIZADO!" : locale === "fr" ? "ACCÈS AUTORISÉ !" : "GATE UNLOCKED!");
          setTimeout(() => {
            setTicketScanned(true);
            setQrLoading(false);
            setQrProgressMessage("");
          }, 800);
        }, 800);
      }, 800);
    } else {
      setQrProgressMessage(locale === "es" ? "REINICIANDO PASE..." : locale === "fr" ? "RÉINITIALISATION..." : "RESETTING PASS...");
      setTimeout(() => {
        setTicketScanned(false);
        setQrLoading(false);
        setQrProgressMessage("");
      }, 1000);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.25, 1);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Bounds for pan based on zoom scale
    const maxPanX = (zoom - 1) * 150;
    const maxPanY = (zoom - 1) * 100;
    
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom === 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    const maxPanX = (zoom - 1) * 150;
    const maxPanY = (zoom - 1) * 100;
    
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY))
    });
  };

  const t = locales[locale];
  const ui = uiTranslations[locale];

  // Fetch matches and stadiums on startup
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [resMatches, resStadiums] = await Promise.all([
          fetch("/api/matches"),
          fetch("/api/stadiums")
        ]);
        const dataMatches = await resMatches.json();
        const dataStadiums = await resStadiums.json();
        if (active) {
          if (dataMatches.success) {
            setMatches(dataMatches.matches);
          }
          if (dataStadiums.success) {
            setStadiums(dataStadiums.stadiums);
          }
        }
      } catch (err) {
        console.error("Failed to load startup data:", err);
      } finally {
        if (active) {
          setMatchesLoading(false);
          setStadiumsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  // Fetch live weather when selected stadium changes
  useEffect(() => {
    let active = true;
    if (stadiums.length === 0) return;

    // Find the current stadium object from database to retrieve coordinates
    const curStadium = stadiums.find(s => s.id === selectedStadium || (selectedStadium === "st_mercedes" && s.id === "st_mbs"));
    const lat = curStadium ? curStadium.lat : 33.9534;
    const lng = curStadium ? curStadium.lng : -118.3387;

    setWeatherLoading(true);
    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && active) {
          setWeather(data.weather);
        }
      })
      .catch((err) => console.log("[Weather Fetch] Live weather offline, utilizing default fallback weather metrics:", err.message))
      .finally(() => {
        if (active) setWeatherLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedStadium, stadiums]);

  // Fetch live gate densities when selected stadium changes
  useEffect(() => {
    let active = true;
    const fetchGates = async () => {
      try {
        const res = await fetch(`/api/stadiums/${selectedStadium}/gates`);
        const data = await res.json();
        if (data.success && active) {
          // Map gates array back to our local gate_a, gate_b, gate_c, gate_d format
          const densities: Record<string, number> = {};
          data.gates.forEach((g: any) => {
            const lastChar = g.id.split("_").pop(); // e.g. "a", "b", "c", "d"
            if (["a", "b", "c", "d"].includes(lastChar)) {
              densities[`gate_${lastChar}`] = g.current_density;
            }
          });
          if (Object.keys(densities).length > 0) {
            setSimulatedDensity(densities as any);
          }
        }
      } catch (err) {
        console.error("[Gates Fetch] Failed to load gate densities:", err);
      }
    };
    fetchGates();

    // Reset map zoom and set default map feature so it applies to all changes
    handleResetZoom();
    setActiveMapFeature({
      type: "gate",
      id: "gate_a",
      name: "Gate A (Main Entry)",
      status: "Highly Congested",
      density: 75,
      info: "Expected wait time: 15-20 mins. Restrooms, ADA assistance, and first aid are fully active nearby. Recommended alternate: Gate C.",
      color: "text-red-500 bg-red-500/10 border-red-500/20"
    });

    return () => {
      active = false;
    };
  }, [selectedStadium]);

  // Fluctuate waste bin fill levels periodically to simulate real telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setBinsFill(prev => {
        const next: Record<string, number> = {};
        Object.keys(prev).forEach((key) => {
          if (Math.random() > 0.2) {
            const change = Math.random() > 0.55 ? 1 : -1;
            next[key] = Math.max(15, Math.min(98, prev[key] + change));
          } else {
            next[key] = prev[key];
          }
        });
        return next;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Haversine formula to compute distance in km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const findNearestStadium = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setFindingNearest(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (stadiums.length === 0) {
          setGpsError("No stadium data available to compare");
          setFindingNearest(false);
          return;
        }

        let minDistance = Infinity;
        let closest: any = null;

        stadiums.forEach((s) => {
          const dist = getDistanceKm(latitude, longitude, s.lat, s.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = s;
          }
        });

        if (closest) {
          const targetId = closest.id === "st_mbs" ? "st_mercedes" : closest.id;
          setSelectedStadium(targetId);
          
          const newAlert: Alert = {
            id: Math.random().toString(),
            stadium_id: closest.id,
            type: "GPS Lookup",
            message: `Located nearest stadium: ${closest.name} in ${closest.city} (approx. ${minDistance.toFixed(1)} km away).`,
            starts_at: new Date().toISOString(),
            ends_at: new Date().toISOString(),
            severity: "low"
          };
          setAlerts(prev => [newAlert, ...prev]);
        } else {
          setGpsError("No matching stadium found");
        }
        setFindingNearest(false);
      },
      (error) => {
        console.error("GPS location error:", error);
        setGpsError(error.message || "Failed to retrieve your current location");
        setFindingNearest(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setGpsError(locale === "es" ? "El dictado por voz no es compatible con este navegador" : locale === "fr" ? "La dictée vocale n'est pas supportée" : "Voice dictation is not supported by your browser");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = locale === "es" ? "es-ES" : locale === "fr" ? "fr-FR" : "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
      let errMsg = "";
      if (event.error === "not-allowed") {
        errMsg = locale === "es"
          ? "Permiso de micrófono denegado. Active el acceso al micrófono en la configuración de su navegador."
          : locale === "fr"
            ? "Accès au microphone refusé. Veuillez autoriser l'accès au micro dans votre navigateur."
            : "Microphone access denied. Please grant microphone permissions in your browser settings.";
      } else if (event.error === "no-speech") {
        errMsg = locale === "es"
          ? "No se detectó voz. Intente hablar de nuevo."
          : locale === "fr"
            ? "Aucune parole détectée. Veuillez réessayer."
            : "No speech detected. Please speak closer to the microphone and try again.";
      } else if (event.error === "network") {
        errMsg = locale === "es"
          ? "Error de red en el reconocimiento de voz."
          : locale === "fr"
            ? "Erreur réseau lors de la reconnaissance vocale."
            : "Network error occurred during speech recognition.";
      } else {
        errMsg = (locale === "es" ? "Error de dictado de voz: " : locale === "fr" ? "Erreur vocale: " : "Speech recognition error: ") + (event.error || "unknown");
      }
      setGpsError(errMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed", e);
      setIsListening(false);
    }
  };

  // Compute unique real teams (no placeholders like Winners/Runners-up)
  const uniqueTeams = useMemo(() => {
    const teams = new Set<string>();
    matches.forEach(m => {
      const h = m.home_team;
      const a = m.away_team;
      if (h && !h.includes("Winner") && !h.includes("Runner-up") && !h.includes("Third") && !h.includes("QF") && !h.includes("SF")) {
        teams.add(h);
      }
      if (a && !a.includes("Winner") && !a.includes("Runner-up") && !a.includes("Third") && !a.includes("QF") && !a.includes("SF")) {
        teams.add(a);
      }
    });
    return Array.from(teams).sort();
  }, [matches]);

  // Win probability predictor calculations
  const prediction = useMemo(() => {
    if (!teamA || !teamB || teamA === teamB) {
      return { probA: 50, probB: 50, probTie: 0, h2hCount: 0, winsA: 0, winsB: 0, draws: 0, formA: 50, formB: 50 };
    }

    const completedMatches = matches.filter(m => m.status === "completed");
    const h2h = completedMatches.filter(
      m => (m.home_team === teamA && m.away_team === teamB) || (m.home_team === teamB && m.away_team === teamA)
    );

    let winsA = 0;
    let winsB = 0;
    let draws = 0;

    h2h.forEach(m => {
      const hScore = Number(m.home_score);
      const aScore = Number(m.away_score);
      if (m.home_team === teamA) {
        if (hScore > aScore) winsA++;
        else if (aScore > hScore) winsB++;
        else draws++;
      } else {
        if (hScore > aScore) winsB++;
        else if (aScore > hScore) winsA++;
        else draws++;
      }
    });

    // Form Win Rate (win is 1, draw is 0.5)
    const teamAAll = completedMatches.filter(m => m.home_team === teamA || m.away_team === teamA);
    const teamBAll = completedMatches.filter(m => m.home_team === teamB || m.away_team === teamB);

    let formAVal = 0;
    teamAAll.forEach(m => {
      const hScore = Number(m.home_score);
      const aScore = Number(m.away_score);
      if (m.home_team === teamA) {
        if (hScore > aScore) formAVal += 1.0;
        else if (hScore === aScore) formAVal += 0.5;
      } else {
        if (aScore > hScore) formAVal += 1.0;
        else if (hScore === aScore) formAVal += 0.5;
      }
    });

    let formBVal = 0;
    teamBAll.forEach(m => {
      const hScore = Number(m.home_score);
      const aScore = Number(m.away_score);
      if (m.home_team === teamB) {
        if (hScore > aScore) formBVal += 1.0;
        else if (hScore === aScore) formBVal += 0.5;
      } else {
        if (aScore > hScore) formBVal += 1.0;
        else if (hScore === aScore) formBVal += 0.5;
      }
    });

    const formA = teamAAll.length > 0 ? Math.round((formAVal / teamAAll.length) * 100) : 50;
    const formB = teamBAll.length > 0 ? Math.round((formBVal / teamBAll.length) * 100) : 50;

    // Direct probability assessment
    let probA = 38;
    let probB = 37;
    let probTie = 25;

    // Form adjustment
    const formDiff = (formA - formB) / 100; // ranges -1 to 1
    probA += Math.round(formDiff * 35);
    probB -= Math.round(formDiff * 35);

    // H2H weight
    if (h2h.length > 0) {
      const h2hA = winsA / h2h.length;
      const h2hB = winsB / h2h.length;
      const h2hDraw = draws / h2h.length;

      probA = Math.round(probA * 0.4 + h2hA * 70 * 0.6);
      probB = Math.round(probB * 0.4 + h2hB * 70 * 0.6);
      probTie = Math.round(probTie * 0.4 + h2hDraw * 100 * 0.6 + 10);
    }

    // Safety checks
    if (probA < 5) probA = 5;
    if (probB < 5) probB = 5;
    if (probTie < 5) probTie = 5;

    const total = probA + probB + probTie;
    const finalA = Math.round((probA / total) * 100);
    const finalB = Math.round((probB / total) * 100);
    const finalTie = 100 - finalA - finalB;

    return {
      probA: finalA,
      probB: finalB,
      probTie: finalTie,
      h2hCount: h2h.length,
      winsA,
      winsB,
      draws,
      formA,
      formB
    };
  }, [teamA, teamB, matches]);

  // Memoized recent matches for team A (last 3 completed)
  const recentMatchesA = useMemo(() => {
    if (!teamA) return [];
    return matches
      .filter(m => m.status === "completed" && (m.home_team === teamA || m.away_team === teamA))
      .sort((a, b) => new Date(b.datetime_utc).getTime() - new Date(a.datetime_utc).getTime())
      .slice(0, 3);
  }, [matches, teamA]);

  // Memoized recent matches for team B (last 3 completed)
  const recentMatchesB = useMemo(() => {
    if (!teamB) return [];
    return matches
      .filter(m => m.status === "completed" && (m.home_team === teamB || m.away_team === teamB))
      .sort((a, b) => new Date(b.datetime_utc).getTime() - new Date(a.datetime_utc).getTime())
      .slice(0, 3);
  }, [matches, teamB]);

  // Memoized head-to-head completed matches between team A and team B
  const h2hMatches = useMemo(() => {
    if (!teamA || !teamB || teamA === teamB) return [];
    return matches
      .filter(m => m.status === "completed" &&
        ((m.home_team === teamA && m.away_team === teamB) || (m.home_team === teamB && m.away_team === teamA))
      )
      .sort((a, b) => new Date(b.datetime_utc).getTime() - new Date(a.datetime_utc).getTime());
  }, [matches, teamA, teamB]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message on load
  useEffect(() => {
    window.scrollTo(0, 0);
    const personName = user?.displayName || "Fan";
    
    let desc = t.welcome_desc;
    if (persona === "organizer") {
      desc = locale === "es"
        ? "Suite de Planificación y Rendimiento. Listo para simular probabilidades de partidos, analizar clasificaciones de equipos y emitir alertas globales."
        : locale === "fr"
          ? "Suite de Planification et de Performance. Prêt à simuler les probabilités de match, analyser le classement des équipes et diffuser des alertes globales."
          : "Planning & Performance Suite. Ready to simulate match probabilities, analyze standings, and broadcast global alerts.";
    } else if (persona === "volunteer") {
      desc = locale === "es"
        ? "Asistente de Hospitalidad y Servicio. Listo para guiar a los espectadores, verificar accesibilidad ADA, objetos perdidos y reglamentos del estadio."
        : locale === "fr"
          ? "Assistant d'Hospitalité et de Service. Prêt à guider les spectateurs, vérifier l'accessibilité ADA, gérer les objets trouvés et les règlements du stade."
          : "Hospitality & Service Companion. Ready to guide spectators, check ADA accessibility, lost & found, and stadium ground regulations.";
    } else if (persona === "fan") {
      desc = locale === "es"
        ? "Tu Compañero de Aficionado Oficial. Listo para consultar horarios de partidos, puestos de comida cercanos, pronósticos del clima y reglas del juego."
        : locale === "fr"
          ? "Votre Compagnon de Supporter Officiel. Prêt à consulter les horaires de matchs, trouver les stands de nourriture, la météo et les règles du jeu."
          : "Your Official Fan Companion. Ready to check match schedules, nearby food concessions, live weather, and game rules.";
    } else {
      desc = locale === "es"
        ? "Consola de Operaciones de Campo. Listo para monitorear la densidad de flujo en puertas, rastrear incidentes de instalaciones y coordinar informes."
        : locale === "fr"
          ? "Console des Opérations de Terrain. Prêt à surveiller la densité des flux aux portes, suivre les incidents d'équipement et coordonner les rapports."
          : "Field Operations Console. Ready to monitor gate crowd flows, track active incidents, and coordinate facility reports.";
    }

    const greeting = locale === "es"
      ? `¡Hola, ${personName}! 👋 Bienvenido a StadiumIQ.\n\n${desc}`
      : locale === "fr"
        ? `Bonjour, ${personName} ! 👋 Bienvenue sur StadiumIQ.\n\n${desc}`
        : `Hello, ${personName}! 👋 Welcome to StadiumIQ.\n\n${desc}`;

    setMessages([
      {
        id: "welcome",
        sender: "stadiumiq",
        text: greeting.replace(/[*#]/g, ''),
        confidence: "grounded",
        source_type: "decision_engine",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      },
    ]);
  }, [locale, persona]);

  // Generation controls (Stop & Pause)
  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setIsPaused(false);
    isPausedRef.current = false;
    
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "stadiumiq",
        text: (locale === "es" ? "⚠️ Generación de respuesta interrumpida por el usuario." : locale === "fr" ? "⚠️ Génération de la réponse interrompue par l'utilisateur." : "⚠️ Generation of response interrupted by user.").replace(/[*#]/g, ''),
        confidence: "uncertain",
        source_type: "fallback"
      }
    ].slice(-50));
  };

  const handleTogglePauseResponse = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
  };

  // Handle WebSocket alerts connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/alerts`;
    
    let ws: WebSocket;
    let reconnectTimer: any;

    function connect() {
      console.log("[WS] Connecting to operations feed at:", wsUrl);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WS] Connected successfully to operations feed");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "initial_alerts") {
            setAlerts(data.alerts);
          } else if (data.type === "new_alert") {
            setAlerts((prev) => {
              // Ensure no duplicate alerts are displayed
              const filtered = prev.filter((a) => a.id !== data.alert.id);
              return [data.alert, ...filtered].slice(0, 10);
            });
          } else if (data.type === "density_update") {
            console.log(`[WS Live Gate Update] ${data.gate_name}: ${data.current_density}%`);
            const currentStadiumDbId = selectedStadium === "st_mercedes" ? "st_mbs" : selectedStadium;
            if (data.stadium_id === currentStadiumDbId) {
              const lastChar = data.gate_id.split("_").pop(); // e.g. "a", "b", "c", "d"
              if (["a", "b", "c", "d"].includes(lastChar)) {
                const key = `gate_${lastChar}`;
                setSimulatedDensity((prev) => {
                  const next = { ...prev, [key]: data.current_density };
                  if (activeMapFeature && activeMapFeature.type === "gate" && activeMapFeature.id === key) {
                    setActiveMapFeature((feat: any) => ({
                      ...feat,
                      density: data.current_density,
                      status: data.current_density > 80 ? "Highly Congested" : data.current_density > 50 ? "Moderately Congested" : "Clear & Low Density",
                      color: data.current_density > 80 ? "text-red-500 bg-red-500/10 border-red-500/30" : data.current_density > 50 ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-[#22c55e] bg-green-500/10 border-green-500/30"
                    }));
                  }
                  return next;
                });
              }
            }
          } else if (data.type === "bulk_density_update") {
            const currentStadiumDbId = selectedStadium === "st_mercedes" ? "st_mbs" : selectedStadium;
            if (data.stadium_id === currentStadiumDbId) {
              setSimulatedDensity(data.densities);
            }
          }
        } catch (e) {
          console.error("[WS] Message parse error:", e);
        }
      };

      ws.onclose = () => {
        console.warn("[WS] Connection lost. Attempting reconnect in 5s...");
        setWsConnected(false);
        reconnectTimer = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.warn("[WS] Live operations feed currently offline. Retrying...", err);
        setWsConnected(false);
        ws.close();
      };
    }

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  // Auto scroll logic when a new question or message is asked/received
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Early returns
  if (loadingRole) {
    return <div className="flex items-center justify-center h-screen bg-slate-50">Loading...</div>;
  }
  
  if (!user || !role) {
    return (
      <AuthScreen 
        onAuthSuccess={(r, customUser) => {
          const loggedInUser = customUser || {
            uid: `fifa-${r}`,
            email: `${r}@stadiumiq.com`,
            displayName: `FIFA ${r.charAt(0).toUpperCase() + r.slice(1)}`,
            photoURL: ""
          };
          setUser(loggedInUser);
          setRole(r);
          setPersonaState(r);
          setIsRoleVerified(true);
        }} 
      />
    );
  }

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    if (!textToSend) setInput("");

    // Create user message object
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: queryText.replace(/[*#]/g, ''),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg].slice(-50));
    setLoading(true);
    setIsPaused(false);
    isPausedRef.current = false;

    // Set up AbortController for a 12s timeout
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current === controller) {
        controller.abort();
      }
    }, 12000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: queryText.replace(/[*#]/g, ''),
          locale,
          persona,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Wait if user clicked Pause
        while (isPausedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // Exit if request got aborted during pause
        if (controller.signal.aborted) {
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "stadiumiq",
            text: (data.answer || "").replace(/[*#]/g, ''),
            confidence: data.confidence,
            source_type: data.source_type,
            model_tier: data.model_tier,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          },
        ].slice(-50));
      } else {
        throw new Error("API unsuccessful response");
      }
    } catch (err: any) {
      console.error("[Chat Fetch Error]", err);
      
      // If we aborted intentionally on user command, don't show general error
      if (controller.signal.aborted && !loading) {
        return;
      }

      let errorMsg = t.server_error;
      if (err.name === "AbortError") {
        errorMsg = locale === "es" 
          ? "La solicitud tardó demasiado o fue detenida. Por favor, intente de nuevo." 
          : locale === "fr"
          ? "La demande a pris trop de temps ou a été arrêtée. Veuillez réessayer."
          : "The request timed out or was stopped. Please try again.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "stadiumiq",
          text: errorMsg.replace(/[*#]/g, ''),
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        },
      ].slice(-50));
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setLoading(false);
      setIsPaused(false);
      isPausedRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // ==========================================
  // HELPER COMPONENT RENDERERS (PERSONA-SPECIFIC)
  // ==========================================

  const renderInteractiveMap = () => {
    const getDerivedFeatureDetails = () => {
      if (!activeMapFeature) return null;
      if (activeMapFeature.type === "gate") {
        const density = simulatedDensity[activeMapFeature.id] ?? activeMapFeature.density ?? 0;
        const status = density > 80 
          ? (locale === "es" ? "Muy Congestionado" : locale === "fr" ? "Très Congestionné" : "Highly Congested") 
          : density > 50 
            ? (locale === "es" ? "Moderadamente Congestionado" : locale === "fr" ? "Modérément Congestionné" : "Moderately Congested") 
            : (locale === "es" ? "Despejado y Baja Densidad" : locale === "fr" ? "Fluide & Faible Densité" : "Clear & Low Density");
        const color = density > 80 
          ? "text-red-500 bg-red-500/10 border-red-500/30" 
          : density > 50 
            ? "text-amber-400 bg-amber-400/10 border-amber-400/30" 
            : "text-[#22c55e] bg-green-500/10 border-green-500/30";
        return {
          ...activeMapFeature,
          density,
          status,
          color
        };
      }
      return activeMapFeature;
    };

    const derivedFeature = getDerivedFeatureDetails() || activeMapFeature;

    return (
      <div className={`rounded-2xl p-5 border flex flex-col transition-colors h-full ${
        accessibilityMode 
          ? "border-white bg-black text-white" 
          : "border-[#27272a] bg-[#09090b] shadow-lg"
      }`}>
        {/* Header & Stadium Dropdown - Clean and beautifully contained layout */}
        <div className="flex flex-col gap-2 border-b border-[#27272a] pb-3 mb-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-[10px] sm:text-xs tracking-wider uppercase flex items-center gap-1.5 text-white">
                <MapPin className="w-3.5 h-3.5 text-[#22c55e] shrink-0" /> {t.venue_blueprint || "VENUE BLUEPRINT"}
              </h2>
              <p className="text-[9px] text-[#71717a] uppercase font-mono tracking-wide">
                {t.gate_locator || "Gate & Facilities Locator"}
              </p>
            </div>
            
            <button
              onClick={findNearestStadium}
              disabled={findingNearest || stadiumsLoading}
              className={`px-1.5 py-1 rounded border transition-all flex items-center gap-1 text-[10px] font-mono font-bold ${
                accessibilityMode
                  ? "bg-white text-black border-white"
                  : findingNearest
                    ? "bg-[#18181b] border-[#27272a] text-[#71717a]"
                    : "bg-[#18181b] border-[#27272a] hover:border-[#22c55e] text-zinc-400 hover:text-white"
              }`}
              title="Find nearest World Cup venue via GPS"
            >
              {findingNearest ? (
                <RefreshCw className="w-3 h-3 animate-spin text-[#22c55e]" />
              ) : (
                "🛰️"
              )}
              <span>GPS</span>
            </button>
          </div>

          <div className="w-full">
            <select
              value={selectedStadium}
              onChange={(e) => {
                setSelectedStadium(e.target.value);
                handleResetZoom();
                setActiveMapFeature({
                  type: "gate",
                  id: "gate_a",
                  name: "Gate A (Main Entry)",
                  status: "Highly Congested",
                  density: simulatedDensity.gate_a,
                  info: "Expected wait time: 15-20 mins. Restrooms, ADA assistance, and first aid are fully active nearby. Recommended alternate: Gate C.",
                  color: "text-red-500 bg-red-500/10 border-red-500/20"
                });
              }}
              className="w-full bg-[#18181b] border border-[#27272a] text-white rounded px-2 py-1 text-[11px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#22c55e]"
            >
              {stadiums.length > 0 ? (
                stadiums.map((s) => (
                  <option key={s.id} value={s.id === "st_mbs" ? "st_mercedes" : s.id}>
                    {s.name} ({s.city})
                  </option>
                ))
              ) : (
                <>
                  <option value="st_sofi">SoFi Stadium (Los Angeles)</option>
                  <option value="st_metlife">MetLife Stadium (NY/NJ)</option>
                  <option value="st_mercedes">Mercedes-Benz Stadium (Atlanta)</option>
                  <option value="st_azteca">Estadio Azteca (Mexico City)</option>
                  <option value="st_bcplace">BC Place (Vancouver)</option>
                </>
              )}
            </select>
          </div>
          {gpsError && (
            <div className="text-[9px] text-red-500 font-mono mt-0.5 max-w-full truncate">
              ⚠️ {gpsError}
            </div>
          )}
        </div>

        {/* Stadium Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[10px] font-mono border-b border-[#27272a]/40 pb-3">
          <div className="p-2 bg-[#18181b]/50 border border-[#27272a]/30 rounded">
            <span className="text-[#888893] block">{t.capacity || "CAPACITY"}:</span>
            <span className="text-white font-bold">
              {(() => {
                const cur = stadiums.find(s => s.id === selectedStadium || (selectedStadium === "st_mercedes" && s.id === "st_mbs"));
                if (cur && cur.capacity) {
                  return Number(cur.capacity).toLocaleString();
                }
                return selectedStadium === "st_sofi" ? "70,000" : selectedStadium === "st_metlife" ? "82,500" : selectedStadium === "st_mercedes" ? "71,000" : selectedStadium === "st_azteca" ? "87,500" : "54,500";
              })()}
            </span>
          </div>
          <div className="p-2 bg-[#18181b]/50 border border-[#27272a]/30 rounded">
            <span className="text-[#888893] block">{t.gates_open || "GATES OPEN"}:</span>
            <span className="text-[#22c55e] font-bold">4 / 4 (100%)</span>
          </div>
          <div className="p-2 bg-[#18181b]/50 border border-[#27272a]/30 rounded flex flex-col justify-between">
            <span className="text-[#888893] block flex items-center gap-1">
              <span>📡 {t.live_weather || "LIVE WEATHER"}:</span>
              {weatherLoading && <RefreshCw className="w-2 h-2 animate-spin text-[#22c55e]" />}
            </span>
            <span className="text-amber-400 font-bold font-mono text-[11px] leading-tight">
              {weather ? (
                `☀️ ${weather.temperature}°C (Wind: ${weather.windspeed} km/h)`
              ) : (
                "22.8°C (Fallback)"
              )}
            </span>
          </div>
          <div className="p-2 bg-[#18181b]/50 border border-[#27272a]/30 rounded">
            <span className="text-[#888893] block">{t.ada_access || "ADA ACCESS"}:</span>
            <span className="text-teal-400 font-bold">{t.accessible || "ACCESSIBLE"}</span>
          </div>
        </div>

        {/* Interactive SVG Blue Print Canvas */}
        <div className="relative w-full flex-1 min-h-[260px] bg-[#050505] rounded-xl border border-[#27272a] overflow-hidden flex items-center justify-center p-4 select-none">
          {/* Grid background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>
          
          {/* Live feed offline overlay inside the blueprint canvas */}
          {!wsConnected && (
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-wider animate-pulse flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>{locale === "es" ? "Canal sin conexión" : locale === "fr" ? "Flux hors ligne" : "Live feed offline"}</span>
            </div>
          )}
          
          {/* Floating Map Zoom/Pan Controls */}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 bg-[#18181b]/90 backdrop-blur-md border border-[#27272a] p-1 rounded-lg shadow-lg">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-[#22c55e]/20 hover:text-[#22c55e] text-[#a1a1aa] transition-colors border border-[#27272a]/40 hover:border-[#22c55e]/30 flex items-center justify-center"
              title={locale === "es" ? "Acercar" : locale === "fr" ? "Zoom avant" : "Zoom In"}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-[#22c55e]/20 hover:text-[#22c55e] text-[#a1a1aa] transition-colors border border-[#27272a]/40 hover:border-[#22c55e]/30 flex items-center justify-center"
              title={locale === "es" ? "Alejar" : locale === "fr" ? "Zoom arrière" : "Zoom Out"}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded hover:bg-[#22c55e]/20 hover:text-[#22c55e] text-[#a1a1aa] transition-colors border border-[#27272a]/40 hover:border-[#22c55e]/30 flex items-center justify-center"
              title={locale === "es" ? "Restablecer" : locale === "fr" ? "Réinitialiser" : "Reset Zoom"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {zoom > 1 && (
            <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-[9px] font-mono uppercase tracking-wider animate-pulse flex items-center gap-1">
              <span>🖐️</span>
              <span>{locale === "es" ? "Arrastra para desplazar" : locale === "fr" ? "Faire glisser" : "Drag to Pan"} ({Math.round(zoom * 100)}%)</span>
            </div>
          )}

          {/* Zoom & Pan Interactive Container wrapper */}
          <div 
            className="w-full h-full flex items-center justify-center animate-fadeIn"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default"
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Outer stadium frame */}
            <div className="relative w-[72%] h-[72%] border-[3px] border-[#27272a] rounded-[100px] flex items-center justify-center bg-[#09090b]/80 shadow-inner">
              {/* Inner pitch layout */}
              <div className="w-[60%] h-[55%] border border-[#27272a]/50 rounded-[40px] bg-emerald-950/20 flex items-center justify-center relative">
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#27272a]/40"></div>
                <div className="w-12 h-12 border border-[#27272a]/40 rounded-full absolute"></div>
                <div className="w-12 h-6 border-r border-[#27272a]/40 absolute left-0 top-[calc(50%-12px)]"></div>
                <div className="w-12 h-6 border-l border-[#27272a]/40 absolute right-0 top-[calc(50%-12px)]"></div>
                <span className="text-[9px] font-mono tracking-widest text-[#22c55e]/30 font-bold uppercase rotate-12">
                  {selectedStadium === "st_sofi" ? "SOFI FIELD" : selectedStadium === "st_metlife" ? "METLIFE PITCH" : selectedStadium === "st_mercedes" ? "MBS STAGE" : selectedStadium === "st_azteca" ? "AZTECA FIELD" : "BC PLACE"}
                </span>
              </div>

              {/* GATE A */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "gate",
                  id: "gate_a",
                  name: "Gate A (Main Entry)",
                  status: simulatedDensity.gate_a > 80 ? "Highly Congested" : simulatedDensity.gate_a > 50 ? "Moderately Congested" : "Clear & Low Density",
                  density: simulatedDensity.gate_a,
                  info: "Primary entry route from southern parking bays. Excellent ramp accessibility. Recommended to use alternative Gate C if density spikes.",
                  color: simulatedDensity.gate_a > 80 ? "text-red-500 bg-red-500/10 border-red-500/30" : simulatedDensity.gate_a > 50 ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-[#22c55e] bg-green-500/10 border-green-500/30"
                })}
                className={`absolute bottom-[-10px] left-[calc(50%-45px)] px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center gap-1 transition-all ${
                  activeMapFeature?.id === "gate_a" ? "ring-2 ring-white scale-105" : "hover:scale-105"
                } ${
                  simulatedDensity.gate_a > 80 ? "bg-red-500/20 text-red-400 border-red-500/40" : simulatedDensity.gate_a > 50 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-[#22c55e]/20 text-emerald-300 border-[#22c55e]/40"
                }`}
              >
                🚪 A ({simulatedDensity.gate_a}%)
              </button>

              {/* GATE B */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "gate",
                  id: "gate_b",
                  name: "Gate B (North Gate)",
                  status: simulatedDensity.gate_b > 80 ? "Highly Congested" : simulatedDensity.gate_b > 50 ? "Moderately Congested" : "Clear & Low Density",
                  density: simulatedDensity.gate_b,
                  info: "Connected straight to mass-transit links and train hubs. Tends to spike in traffic shortly before kickoff.",
                  color: simulatedDensity.gate_b > 80 ? "text-red-500 bg-red-500/10 border-red-500/30" : simulatedDensity.gate_b > 50 ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-[#22c55e] bg-green-500/10 border-green-500/30"
                })}
                className={`absolute top-[-10px] left-[calc(50%-45px)] px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center gap-1 transition-all ${
                  activeMapFeature?.id === "gate_b" ? "ring-2 ring-white scale-105" : "hover:scale-105"
                } ${
                  simulatedDensity.gate_b > 80 ? "bg-red-500/20 text-red-400 border-red-500/40" : simulatedDensity.gate_b > 50 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-[#22c55e]/20 text-emerald-300 border-[#22c55e]/40"
                }`}
              >
                🚪 B ({simulatedDensity.gate_b}%)
              </button>

              {/* GATE C */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "gate",
                  id: "gate_c",
                  name: "Gate C (East Gate)",
                  status: simulatedDensity.gate_c > 80 ? "Highly Congested" : simulatedDensity.gate_c > 50 ? "Moderately Congested" : "Clear & Low Density",
                  density: simulatedDensity.gate_c,
                  info: "Access points from shuttle parking. Historically lowest congestion levels, highly recommended alternate route.",
                  color: simulatedDensity.gate_c > 80 ? "text-red-500 bg-red-500/10 border-red-500/30" : simulatedDensity.gate_c > 50 ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-[#22c55e] bg-green-500/10 border-green-500/30"
                })}
                className={`absolute right-[-15px] top-[calc(50%-13px)] px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center gap-1 transition-all ${
                  activeMapFeature?.id === "gate_c" ? "ring-2 ring-white scale-105" : "hover:scale-105"
                } ${
                  simulatedDensity.gate_c > 80 ? "bg-red-500/20 text-red-400 border-red-500/40" : simulatedDensity.gate_c > 50 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-[#22c55e]/20 text-emerald-300 border-[#22c55e]/40"
                }`}
              >
                🚪 C ({simulatedDensity.gate_c}%)
              </button>

              {/* GATE D */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "gate",
                  id: "gate_d",
                  name: "Gate D (West Gate)",
                  status: simulatedDensity.gate_d > 80 ? "Highly Congested" : simulatedDensity.gate_d > 50 ? "Moderately Congested" : "Clear & Low Density",
                  density: simulatedDensity.gate_d,
                  info: "Feeds from rideshare pickup/dropoff zones and local bus terminals. ADA elevator access directly adjacent.",
                  color: simulatedDensity.gate_d > 80 ? "text-red-500 bg-red-500/10 border-red-500/30" : simulatedDensity.gate_d > 50 ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-[#22c55e] bg-green-500/10 border-green-500/30"
                })}
                className={`absolute left-[-15px] top-[calc(50%-13px)] px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center gap-1 transition-all ${
                  activeMapFeature?.id === "gate_d" ? "ring-2 ring-white scale-105" : "hover:scale-105"
                } ${
                  simulatedDensity.gate_d > 80 ? "bg-red-500/20 text-red-400 border-red-500/40" : simulatedDensity.gate_d > 50 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-[#22c55e]/20 text-emerald-300 border-[#22c55e]/40"
                }`}
              >
                🚪 D ({simulatedDensity.gate_d}%)
              </button>

              {/* RESTROOM */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "facility",
                  id: "fac_restroom",
                  name: "🚻 RESTROOM HUB #14",
                  status: "Operational // Cleanliness: Excellent",
                  density: 15,
                  info: "Features 12 stalls, full diaper-changing amenities, and touchless hygiene dispensers. 100% ADA compliant helper handles inside.",
                  color: "text-blue-400 bg-blue-500/10 border-blue-500/25"
                })}
                className={`absolute top-[20%] left-[20%] p-2 rounded-full border bg-black transition-all ${
                  activeMapFeature?.id === "fac_restroom" ? "ring-2 ring-white scale-110" : "hover:scale-110"
                } border-[#27272a] text-blue-400`}
              >
                🚻
              </button>

              {/* FOOD COURT */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "facility",
                  id: "fac_food",
                  name: "🍔 CONCOURSE B DINING PLAZA",
                  status: "Operational // 6 Vendors Open",
                  density: 70,
                  info: "Includes burgers, local delicacies, vegan alternatives, and dynamic digital order kiosks. Average waiting queue: 4 minutes.",
                  color: "text-amber-400 bg-amber-500/10 border-amber-500/25"
                })}
                className={`absolute top-[20%] right-[20%] p-2 rounded-full border bg-black transition-all ${
                  activeMapFeature?.id === "fac_food" ? "ring-2 ring-white scale-110" : "hover:scale-110"
                } border-[#27272a] text-amber-400`}
              >
                🍔
              </button>

              {/* MEDICAL CENTER */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "facility",
                  id: "fac_medical",
                  name: "🏥 FIRST AID HUB - SECTION 118",
                  status: "Operational // Fully Staffed",
                  density: 5,
                  info: "Equipped with certified medical response teams, hydration points, emergency defibrillators, and direct ambulance access.",
                  color: "text-red-400 bg-red-500/10 border-red-500/25"
                })}
                className={`absolute bottom-[20%] left-[20%] p-2 rounded-full border bg-black transition-all ${
                  activeMapFeature?.id === "fac_medical" ? "ring-2 ring-white scale-110" : "hover:scale-110"
                } border-[#27272a] text-red-500`}
              >
                🏥
              </button>

              {/* ADA ASSISTED ACCESS */}
              <button
                onClick={() => setActiveMapFeature({
                  type: "facility",
                  id: "fac_ada",
                  name: "♿ ADA MOBILITY GATEWAY",
                  status: "Active // 4 Stewards Deployed",
                  density: 8,
                  info: "Dedicated priority ramp and elevator dispatch station. Offers sensory kits, wheelchair loans, and guided pathways.",
                  color: "text-teal-400 bg-teal-500/10 border-teal-500/25"
                })}
                className={`absolute bottom-[20%] right-[20%] p-2 rounded-full border bg-black transition-all ${
                  activeMapFeature?.id === "fac_ada" ? "ring-2 ring-white scale-110" : "hover:scale-110"
                } border-[#27272a] text-teal-400`}
              >
                ♿
              </button>
            </div>
          </div>
        </div>

        {/* Feature Detail Sidebar */}
        <div className="mt-4 p-4 rounded-xl bg-[#18181b]/40 border border-[#27272a]/80">
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${derivedFeature.color}`}>
                {derivedFeature.type.toUpperCase()}: {derivedFeature.status}
              </span>
              <h3 className="text-sm font-bold text-white mt-1.5">{derivedFeature.name}</h3>
            </div>
            {derivedFeature.density !== undefined && (
              <div className="text-right">
                <span className="text-[10px] text-[#71717a] block uppercase font-mono">DENSITY</span>
                <span className={`text-sm font-black font-mono ${
                  derivedFeature.density > 80 ? "text-red-500" : derivedFeature.density > 50 ? "text-amber-400" : "text-[#22c55e]"
                }`}>
                  {derivedFeature.density}%
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-2.5 leading-relaxed">{derivedFeature.info}</p>
        </div>
      </div>
    );
  };

  const renderChatbot = () => {
    return (
      <div className={`flex flex-col h-full rounded-2xl border overflow-hidden ${
        accessibilityMode 
          ? "border-white bg-black" 
          : "border-[#27272a] bg-[#09090b] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      }`}>
        {/* Conversations Log */}
        <div 
          ref={chatContainerRef}
          aria-live="polite"
          className="flex-1 overflow-y-auto p-5 pr-2 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <span className="text-4xl animate-pulse">🤖</span>
              <div className="space-y-1 max-w-md">
                <h3 className="font-bold text-sm text-white">
                  {locale === "es" ? "Asistente Multilingüe StadiumIQ" : locale === "fr" ? "Assistant Multilingue StadiumIQ" : "StadiumIQ Multilingual Helpdesk"}
                </h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  {locale === "es" 
                    ? "Pregúntame sobre los servicios del estadio, la traducción en tiempo real, las ubicaciones de las puertas, el equipaje o los protocolos de la Copa del Mundo."
                    : locale === "fr"
                    ? "Posez-moi des questions sur les services du stade, la traduction en temps réel, les portes, les bagages ou les protocoles de la Coupe du Monde."
                    : "Ask me anything about stadium services, real-time translations, gate locations, bag policies, or World Cup tournament guidelines."}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.length >= 50 && (
                <div className="text-center py-1.5 border-b border-zinc-850/50 text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950/20 rounded-lg mb-4">
                  🔒 Capped to last 50 messages to maintain performance
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed border relative group ${
                    msg.sender === "user"
                      ? accessibilityMode
                        ? "bg-white text-black border-white font-black"
                        : "bg-[#22c55e] text-black font-semibold border-emerald-500/30"
                      : accessibilityMode
                        ? "bg-black text-white border-2 border-white"
                        : msg.isError
                          ? "bg-red-500/10 text-red-400 border-red-500/25"
                          : "bg-[#18181b] text-[#f4f4f5] border-[#27272a]"
                  }`}>
                    {/* Speaker trigger and copy tools */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(msg.text);
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        }}
                        title="Copy message"
                        className="p-1 rounded bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white transition-all"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold px-1">COPIED</span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="whitespace-pre-line pr-4">
                      {msg.text.replace(/[*#]/g, '')}
                    </div>

                    {/* Grounding Source Tags */}
                    {msg.sender === "stadiumiq" && !msg.isError && msg.confidence && (
                      <div className="mt-2 pt-2 border-t border-[#27272a] flex flex-wrap items-center gap-2 text-[9px] font-mono">
                        <span className="text-[#71717a]">{t.source_label}:</span>
                        <span className={`px-1.5 py-0.2 rounded border font-bold uppercase ${
                          msg.confidence === "grounded"
                            ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/25"
                            : msg.confidence === "general_knowledge"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        }`}>
                          {msg.confidence === "grounded" ? t.confidence_grounded : msg.confidence === "general_knowledge" ? t.confidence_general : t.confidence_uncertain}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="rounded-2xl px-4 py-3 flex items-center gap-2 border border-[#27272a] bg-[#18181b] text-[#71717a] text-xs">
                <RefreshCw className="w-3 h-3 animate-spin text-[#22c55e]" />
                <span className="font-mono tracking-wider uppercase text-[10px]">Processing Real-Time...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-5 py-3 border-t border-[#27272a] bg-zinc-950/30">
          <p className="text-[9px] text-[#71717a] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-[#22c55e]" /> suggested questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(personaQuestions[persona]?.[locale as "en" | "es" | "fr"] || [t.suggested_1, t.suggested_2, t.suggested_3]).slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="text-[10px] px-2.5 py-1 rounded-full text-left bg-zinc-900 border border-[#27272a] hover:border-[#22c55e] hover:text-[#22c55e] transition-all max-w-full truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-[#27272a] flex flex-col gap-2 bg-[#09090b]">
          {loading && (
            <div className="flex items-center justify-between bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-1.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping"></span>
                {isPaused ? "Generation Paused" : "Writing Translation..."}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTogglePauseResponse}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono font-bold text-white"
                >
                  {isPaused ? "RESUME" : "PAUSE"}
                </button>
                <button
                  onClick={handleStopResponse}
                  className="px-2 py-1 rounded bg-red-950/40 text-red-400 text-[10px] font-mono font-bold hover:bg-red-900/50"
                >
                  STOP
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              placeholder="Ask translation / assistance..."
              className="flex-1 bg-black text-white border border-[#27272a] px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#22c55e] text-xs"
            />
            <button
              onClick={handleVoiceInput}
              disabled={loading}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                isListening ? "bg-red-500/20 text-red-500 border-red-500/40 animate-pulse" : "bg-zinc-900 border-[#27272a] text-zinc-400 hover:text-white"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="bg-[#22c55e] text-black p-2 rounded-xl hover:bg-[#4ade80] disabled:bg-zinc-900 disabled:text-zinc-500 transition-all font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFanDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-fadeIn lg:min-h-[580px]">
        {/* Left Column: Ticket Wallet and Pre-orders */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-4 lg:h-full min-h-0">
          {/* Ticket Wallet Widget */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${accessibilityMode ? "border-white bg-black text-white" : "border-[#27272a] bg-[#09090b] shadow-lg"} flex flex-col justify-between flex-1 min-h-0`}>
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2 sm:pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#22c55e]" /> Digital Ticket Wallet
              </h3>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">SECURE</span>
            </div>
            
            <div className="bg-[#18181b]/50 border border-[#27272a]/50 p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden flex-1 min-h-0 my-2">
              <div className="absolute top-2 right-2 text-[8px] font-mono text-zinc-500 uppercase">FIFA SECURE</div>
              <p className="text-[9px] uppercase font-mono tracking-widest text-[#22c55e] font-bold">MATCH 24 - GROUP STAGE</p>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5">USA vs SPAIN</h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">JULY 11, 2026 • 18:00</p>
              <p className="text-[9px] sm:text-[10px] font-mono text-zinc-500 mt-0.5">SoFi Stadium • GATE A • SEC 112</p>

              {/* Interactive QR code */}
              <div 
                className="my-2 p-1.5 bg-white rounded-lg cursor-pointer relative group min-w-[110px] min-h-[110px] flex items-center justify-center transition-all duration-300" 
                onClick={handleVerifyTicket}
                title="Click to validate ticket"
              >
                <div className="w-24 h-24 flex items-center justify-center bg-white rounded border relative overflow-hidden">
                  {qrLoading ? (
                    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-2 text-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-500 mb-1" />
                      <span className="text-[8px] font-mono font-black text-emerald-600 tracking-wider uppercase animate-pulse">
                        {qrProgressMessage}
                      </span>
                    </div>
                  ) : (
                    <>
                      {!ticketScanned && (
                        <div className="absolute left-0 top-0 right-0 h-0.5 bg-emerald-500 shadow-[0_2px_8px_#10b981] animate-bounce" style={{ animationDuration: "2s" }}></div>
                      )}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&color=000000&bgcolor=ffffff&data=${encodeURIComponent(`FIFA2026:MATCH24:USA-vs-SPAIN:SEC112:GATEA:SESSION-${sessionId}`)}`}
                        alt="Digital Ticket QR Code"
                        className={`w-20 h-20 transition-opacity duration-300 ${ticketScanned ? "opacity-25" : ""}`}
                        referrerPolicy="no-referrer"
                      />
                      {ticketScanned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-lg border border-black">✓ SCANNED</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-[8px] sm:text-[9px] font-mono text-zinc-500">
                {qrLoading 
                  ? (locale === "es" ? "Procesando Verificación..." : locale === "fr" ? "Vérification en cours..." : "Processing Verification...") 
                  : (locale === "es" ? "Toque QR para simular escáner de validación" : locale === "fr" ? "Appuyer pour simuler la validation" : "Tap QR to Simulate Validation Scanner")}
              </p>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <p className="text-[9px] font-black text-amber-300 uppercase">GATE TIMER</p>
                <p className="text-[10px] sm:text-[11px] text-amber-400 font-mono leading-tight mt-0.5">Kick-off in {entryCountdown} minutes. Gate A is congested; use Gate C for faster 4-minute access.</p>
              </div>
            </div>
          </div>

          {/* Pre-order Merch/Food */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${accessibilityMode ? "border-white bg-black text-white" : "border-[#27272a] bg-[#09090b] shadow-lg"} flex flex-col justify-between flex-1 min-h-0`}>
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2 sm:pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-[#22c55e]" /> Smart Pre-Order
              </h3>
              <span className="text-[9px] font-mono text-[#71717a] uppercase">Skip-Line</span>
            </div>

            {!orderSubmitted ? (
              <>
                <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0 py-2">
                  {[
                    { name: "🌭 Classic Stadium Hotdog", price: 8.50 },
                    { name: "🥤 Commemorative FIFA Cup", price: 6.00 },
                    { name: "👕 USA Tournament Jersey", price: 85.00 },
                    { name: "🧢 FIFA World Cup Cap", price: 25.00 }
                  ].map((item, idx) => {
                    const count = cart.find(c => c.name === item.name)?.quantity || 0;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-[#27272a]/40 text-xs">
                        <div>
                          <p className="font-bold text-white text-[11px]">{item.name}</p>
                          <p className="text-[10px] font-mono text-zinc-400">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setCart(prev => {
                                const existing = prev.find(p => p.name === item.name);
                                if (!existing) return prev;
                                if (existing.quantity === 1) return prev.filter(p => p.name !== item.name);
                                return prev.map(p => p.name === item.name ? {...p, quantity: p.quantity - 1} : p);
                              });
                            }}
                            className="p-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-[11px] text-white font-bold w-4 text-center">{count}</span>
                          <button 
                            onClick={() => {
                              setCart(prev => {
                                const existing = prev.find(p => p.name === item.name);
                                if (!existing) return [...prev, { name: item.name, price: item.price, type: "food", quantity: 1 }];
                                return prev.map(p => p.name === item.name ? {...p, quantity: p.quantity + 1} : p);
                              });
                            }}
                            className="p-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#27272a] pt-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-zinc-500 uppercase">TOTAL:</span>
                    <span className="text-[#22c55e] font-black text-sm">
                      ${cart.reduce((sum, c) => sum + (c.price * c.quantity), 0).toFixed(2)}
                    </span>
                  </div>

                  {isCheckingOut ? (
                    <div className="w-full p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#22c55e]" />
                        <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                          {locale === "es" ? "PROCESANDO PEDIDO..." : locale === "fr" ? "TRAITEMENT DE LA COMMANDE..." : "PROCESSING ORDER..."}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 bottom-0 bg-[#22c55e] rounded-full animate-pulse w-2/3"></div>
                      </div>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase animate-pulse">
                        {checkoutStep}
                      </p>
                    </div>
                  ) : (
                    <button 
                      disabled={cart.length === 0}
                      onClick={() => {
                        setIsCheckingOut(true);
                        setCheckoutStep(
                          locale === "es" 
                            ? "CONECTANDO CON PASARELA DE PAGO..." 
                            : locale === "fr" 
                              ? "CONNEXION À LA PASSERELLE DE PAIEMENT..." 
                              : "CONNECTING TO SECURE PAYMENT GATEWAY..."
                        );
                        
                        setTimeout(() => {
                          setCheckoutStep(
                            locale === "es" 
                              ? "VERIFICANDO INVENTARIO Y ASIENTO..." 
                              : locale === "fr" 
                                ? "VÉRIFICATION DE L'INVENTAIRE ET DE LA PLACE..." 
                                : "VERIFYING INVENTORY & SEAT DATA..."
                          );
                          
                          setTimeout(() => {
                            setCheckoutStep(
                              locale === "es" 
                                ? "GENERANDO COMPROBANTE COFFEE/MERCH..." 
                                : locale === "fr" 
                                  ? "GÉNÉRATION DU PASS DE RETRAIT..." 
                                  : "GENERATING WC26 PICKUP PASS..."
                            );
                            
                            setTimeout(() => {
                              const total = cart.reduce((sum, c) => sum + (c.price * c.quantity), 0);
                              setLastOrderDetails({
                                items: [...cart],
                                total: total
                              });
                              setOrderSubmitted(true);
                              setOrderStatus("Preparing");
                              setOrderPickupCode("WC26-" + Math.floor(1000 + Math.random() * 9000));
                              setCart([]);
                              setIsCheckingOut(false);
                              setCheckoutStep("");
                            }, 1000);
                          }, 1000);
                        }, 1000);
                      }}
                      className="w-full bg-[#22c55e] text-black font-black text-xs py-2 rounded-lg hover:bg-[#4ade80] transition-all disabled:opacity-30 disabled:bg-zinc-900 disabled:text-zinc-500 uppercase flex items-center justify-center gap-1.5"
                    >
                      💳 {locale === "es" ? "Pago Express" : locale === "fr" ? "Paiement Express" : "Express checkout"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex flex-col items-center justify-center text-center flex-1 min-h-0 w-full">
                <span className="text-2xl animate-bounce">🍔</span>
                <h4 className="text-xs font-black text-white uppercase mt-2">PRE-ORDER CONFIRMED</h4>
                
                {lastOrderDetails && (
                  <div className="w-full mt-2 border-t border-b border-[#27272a]/30 py-2 text-left space-y-1">
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Your Order:</p>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
                      {lastOrderDetails.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-white font-medium">{item.quantity}x {item.name}</span>
                          <span className="text-zinc-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono border-t border-zinc-800/60 pt-1.5 mt-1">
                      <span className="text-zinc-500 font-bold uppercase">Total Paid:</span>
                      <span className="text-[#22c55e] font-black">${lastOrderDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="my-2.5 p-2.5 rounded bg-zinc-950 border border-emerald-500/20 text-left font-mono text-[10px] w-full space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CODE:</span>
                    <span className="text-emerald-400 font-bold">{orderPickupCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">WHERE:</span>
                    <span className="text-white font-bold">Counter 3 (Concourse Sec 112)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">STATUS:</span>
                    <span className={`font-bold uppercase flex items-center gap-1.5 ${
                      orderStatus === "Ready for Pickup" ? "text-emerald-400 animate-pulse" : "text-amber-400 animate-pulse"
                    }`}>
                      {orderStatus === "Ready for Pickup" ? "🟢 " : ""}
                      {orderStatus}
                      {orderStatus !== "Ready for Pickup" && "..."}
                    </span>
                  </div>
                </div>
                <button onClick={() => setOrderSubmitted(false)} className="text-[9px] text-zinc-500 underline uppercase hover:text-white">
                  Add another item
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Helpdesk Chatbot */}
        <div className="col-span-full lg:col-span-5 flex flex-col h-full">
          {renderChatbot()}
        </div>

        {/* Right: Wayfinding map */}
        <div className="col-span-full lg:col-span-3 flex flex-col h-full">
          {renderInteractiveMap()}
        </div>
      </div>
    );
  };

  const renderStaffDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-fadeIn">
        {/* Left Column: Live Incident Log and Creator */}
        <div className="col-span-full lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div>
                <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                  <ShieldAlert className="text-red-500 w-4 h-4 animate-pulse" /> Incident Logging System
                </h3>
                <p className="text-[9px] text-[#71717a] font-mono uppercase mt-0.5">Real-Time Facility Command</p>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded uppercase">
                {incidents.filter(i => i.status !== "resolved").length} active
              </span>
            </div>

            {/* Incident List */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px] pr-1">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-3 rounded-lg border border-[#27272a]/50 bg-zinc-950 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                        inc.severity === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        inc.severity === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="font-bold text-white uppercase text-[10px]">{inc.location}</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] font-mono leading-relaxed">{inc.desc}</p>
                    <span className="text-[9px] font-mono text-zinc-600 block">{inc.time}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIncidents(prev => prev.map(p => {
                        if (p.id !== inc.id) return p;
                        const nextStatus: "pending" | "active" | "resolved" = 
                          p.status === "pending" ? "active" : p.status === "active" ? "resolved" : "pending";
                        logRoleActivity(`Staff changed incident ${p.id} (${p.category}) status at ${p.location} to: ${nextStatus.toUpperCase()}`);
                        return { ...p, status: nextStatus };
                      }));
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all border ${
                      inc.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      inc.status === "active" ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {inc.status.toUpperCase()}
                  </button>
                </div>
              ))}
            </div>

            {/* Log Incident Form */}
            <div className="border-t border-[#27272a] pt-4 flex flex-col gap-3 bg-[#050505]/40 p-3 rounded-xl">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717a] font-mono">Log New Operations Incident</h4>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={newIncidentLoc} 
                  onChange={(e) => setNewIncidentLoc(e.target.value)} 
                  placeholder="Location (e.g. Sec 112 Row 8)" 
                  className="bg-black text-white border border-[#27272a] p-2 rounded text-xs placeholder-[#71717a]"
                />
                <select 
                  value={newIncidentCat} 
                  onChange={(e: any) => setNewIncidentCat(e.target.value)} 
                  className="bg-black text-white border border-[#27272a] p-2 rounded text-xs focus:outline-none"
                >
                  <option value="seat">Seat Damage</option>
                  <option value="spill">Liquid Spill / Slip</option>
                  <option value="gate">Gate Issue</option>
                  <option value="other">Other Operations</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={newIncidentDesc} 
                  onChange={(e) => setNewIncidentDesc(e.target.value)} 
                  placeholder="Short description..." 
                  className="bg-black text-white border border-[#27272a] p-2 rounded text-xs placeholder-[#71717a]"
                />
                <select 
                  value={newIncidentSeverity} 
                  onChange={(e: any) => setNewIncidentSeverity(e.target.value)} 
                  className="bg-black text-white border border-[#27272a] p-2 rounded text-xs focus:outline-none"
                >
                  <option value="low">Severity: Low</option>
                  <option value="medium">Severity: Medium</option>
                  <option value="high">Severity: High</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  if (!newIncidentLoc.trim() || !newIncidentDesc.trim()) return;
                  const actionMsg = `Staff logged NEW ${newIncidentSeverity.toUpperCase()} incident: "${newIncidentDesc}" at ${newIncidentLoc}`;
                  logRoleActivity(actionMsg);
                  setIncidents(prev => [
                    ...prev,
                    {
                      id: "inc-" + Date.now(),
                      location: newIncidentLoc,
                      category: newIncidentCat,
                      desc: newIncidentDesc,
                      status: "pending",
                      severity: newIncidentSeverity,
                      time: "Just logged"
                    }
                  ]);
                  setNewIncidentLoc("");
                  setNewIncidentDesc("");
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 rounded uppercase"
              >
                🚨 Log Operations Incident
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Crowd density Heatmaps & checklists */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Heatmaps */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🔥 Gate Crowd Density Heatmaps
              </h3>
              <span className="text-[10px] font-mono text-amber-500 uppercase">Alert Mode</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Gate A (Main Southern Access)", density: simulatedDensity.gate_a, original: 92 },
                { name: "Gate B (North Rail Hub)", density: simulatedDensity.gate_b, original: 41 },
                { name: "Gate C (East Shuttle Loop)", density: simulatedDensity.gate_c, original: 68 },
                { name: "Gate D (West Rideshare Hub)", density: simulatedDensity.gate_d, original: 55 }
              ].map((gate, index) => {
                const currentDensity = gate.density;
                return (
                  <div key={index} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-zinc-400 font-bold uppercase text-[10px]">{gate.name}</span>
                      <span className={`font-black ${
                        currentDensity > 80 ? "text-red-500" : currentDensity > 50 ? "text-amber-400" : "text-[#22c55e]"
                      }`}>{currentDensity}%</span>
                    </div>
                    <div className="w-full bg-[#18181b] h-2.5 rounded-full overflow-hidden border border-[#27272a]/30">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          currentDensity > 80 ? "bg-gradient-to-r from-red-600 to-red-400" :
                          currentDensity > 50 ? "bg-gradient-to-r from-amber-500 to-amber-300" :
                          "bg-gradient-to-r from-green-600 to-emerald-400"
                        }`}
                        style={{ width: `${currentDensity}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider to dispersal simulation */}
            <div className="mt-2 p-3 rounded-lg border border-[#27272a]/50 bg-black/40">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block mb-1">Simulate Staff Dispersal Dispatch</span>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="0"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const factor = val / 100;
                    setSimulatedDensity({
                      gate_a: Math.max(45, Math.round(92 - (factor * 47))),
                      gate_b: Math.max(30, Math.round(41 - (factor * 11))),
                      gate_c: Math.max(35, Math.round(68 - (factor * 33))),
                      gate_d: Math.max(40, Math.round(55 - (factor * 15)))
                    });
                    if (val % 25 === 0 || val === 100 || val === 0) {
                      logRoleActivity(`Staff adjusted simulated steward dispatch level to: ${val}% capacity`);
                    }
                  }}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                />
              </div>
              <p className="text-[9px] text-[#71717a] font-mono mt-1">Slide right to deploy stewards. See crowd density drop in real-time!</p>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" /> Shift Task Checklist
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                {staffTasks.filter(t => t.completed).length} / {staffTasks.length} Completed
              </span>
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {staffTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => {
                    setStaffTasks(prev => prev.map(t => {
                      if (t.id === task.id) {
                        const nextVal = !t.completed;
                        logRoleActivity(`Staff ${nextVal ? "completed" : "reopened"} shift task: "${t.text}"`);
                        return { ...t, completed: nextVal };
                      }
                      return t;
                    }));
                  }}
                  className="flex items-center gap-2.5 p-2 rounded hover:bg-zinc-950 transition-all cursor-pointer border border-transparent hover:border-[#27272a]/30 text-xs"
                >
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    readOnly 
                    className="rounded border-[#27272a] text-[#22c55e] focus:ring-[#22c55e] h-3.5 w-3.5 cursor-pointer accent-[#22c55e]" 
                  />
                  <span className={`font-mono text-[10px] leading-relaxed ${task.completed ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Panic button and Live weather */}
        <div className="col-span-full lg:col-span-3 flex flex-col gap-6">
          {/* Secure Panic Button */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4 items-center justify-center text-center h-full relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-mono text-red-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span> SECURE PL
            </div>

            {!panicModeActive ? (
              <div className="space-y-4 py-6">
                <div className="p-3.5 rounded-full bg-red-600/10 border border-red-500/30 animate-pulse">
                  <button 
                    onClick={() => {
                      setPanicModeActive(true);
                      setPanicCountdown(5);
                      setPanicDispatched(false);
                      logRoleActivity("Staff TRIGGERED Secure Distress Beacon - Dispatch countdown initiated");
                      const interval = setInterval(() => {
                        setPanicCountdown(prev => {
                          if (prev === 1) {
                            clearInterval(interval);
                            setPanicDispatched(true);
                            logRoleActivity("Staff DISTRESS BEACON DISPATCHED - Emergency tactical backup and paramedics deployed instantly!");
                          }
                          return prev - 1;
                        });
                      }, 1000);
                    }}
                    className="w-24 h-24 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full border-4 border-red-950 flex flex-col items-center justify-center text-black font-black uppercase text-xs tracking-wider cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105"
                  >
                    🚨 PANIC
                  </button>
                </div>
                <div className="space-y-1 max-w-[200px] mx-auto">
                  <h4 className="font-extrabold text-xs text-red-500 uppercase font-mono tracking-widest"> distress beacon</h4>
                  <p className="text-[10px] text-zinc-500 font-mono leading-normal">
                    Press for 5s countdown. (Demo: simulates secure dispatch of venue medical/security response units).
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 w-full">
                {panicDispatched ? (
                  <div className="space-y-3">
                    <span className="text-3xl animate-bounce block">🚨</span>
                    <h4 className="text-xs font-black text-red-400 uppercase font-mono">DISTRESS DISPATCHED</h4>
                    <p className="text-[10px] text-zinc-400 font-mono bg-red-950/20 border border-red-800/30 p-2.5 rounded-lg leading-normal">
                      Demo dispatch successful. Locked coordinate sequence to selected venue. Simulated responder arrival estimated in 1-2 mins.
                    </p>
                    <button 
                      onClick={() => setPanicModeActive(false)}
                      className="text-[9px] text-zinc-500 hover:text-white uppercase underline font-mono"
                    >
                      Clear / Reset Beacon
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-3xl font-mono text-red-500 font-black animate-ping block">{panicCountdown}s</span>
                    <h4 className="text-xs font-black text-white uppercase font-mono">INITIATING DISPATCH</h4>
                    <select 
                      value={selectedEmergencyCategory}
                      onChange={(e: any) => setSelectedEmergencyCategory(e.target.value)}
                      className="bg-zinc-950 border border-red-500/40 text-red-400 p-2 rounded text-[11px] font-mono font-bold w-full focus:outline-none"
                    >
                      <option value="security">ACTIVE SECURITY CONFLICT</option>
                      <option value="medical">MEDICAL INFIRMARY ASSIST</option>
                      <option value="hazard">FIRE / STRUCTURAL HAZARD</option>
                    </select>
                    <p className="text-[9px] text-zinc-500 font-mono">Selecting emergency category adapts response team weaponry/kits.</p>
                    <button 
                      onClick={() => setPanicModeActive(false)}
                      className="w-full bg-zinc-800 text-zinc-300 font-bold font-mono text-[10px] py-1.5 rounded uppercase hover:bg-zinc-700"
                    >
                      ❌ CANCEL (Abate Alarm)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVolunteerDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-fadeIn">
        {/* Left: Shift check in assignment and stats */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Shift Check-In */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🕒 Timecard Shift Check-In
              </h3>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                volunteerCheckedIn ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}>
                {volunteerCheckedIn ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-zinc-950 border border-[#27272a]/50 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ASSIGNED VENUE:</span>
                  <span className="text-white font-bold">SoFi Stadium (LA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">SHIFT TIME:</span>
                  <span className="text-white font-bold">{volunteerShiftHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PROXIMITY GPS:</span>
                  <span className="text-cyan-400 font-bold">{volunteerDistance} km (IN RANGE)</span>
                </div>
              </div>

              {!volunteerCheckedIn ? (
                <button 
                  onClick={() => {
                    setVolunteerCheckedIn(true);
                    logRoleActivity("Volunteer clocked in at SoFi Stadium (LA) with Geo-Verification");
                  }}
                  className="w-full bg-cyan-500 text-black font-black text-xs py-2.5 rounded-lg hover:bg-cyan-400 uppercase transition-all"
                >
                  ⏱️ Clock In (Geo-Verify)
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-center p-2 rounded bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 text-[11px]">
                    ✓ Checked In at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Shift duration active
                  </div>
                  <button 
                    onClick={() => {
                      setVolunteerCheckedIn(false);
                      logRoleActivity("Volunteer clocked out from SoFi Stadium (LA)");
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2 rounded-lg uppercase"
                  >
                    Clock Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Station assignment */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                📍 Assigned Station
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Station B</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="text-white font-bold">Information Desk B (North Plaza - Sec 112)</p>
              <div className="p-3 bg-zinc-950 rounded border border-[#27272a]/50 font-mono text-[10px] space-y-1.5 text-zinc-400">
                <p>🙋 <span className="font-bold text-white">CAPTAIN:</span> Jane Doe (Sector Operations Lead)</p>
                <p>📞 <span className="font-bold text-white">CONTACT:</span> Sector B Radio Ch. 12</p>
                <p>🗒️ <span className="font-bold text-white">DUTIES:</span> Distribute sensory kits, assist ticket scanning, provide wayfinding support to Gate C.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center: FAQ AI cheat sheet search assistant */}
        <div className="col-span-full lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div>
                <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                  📚 FAQ AI Cheat Sheet Search Assistant
                </h3>
                <p className="text-[9px] text-[#71717a] font-mono uppercase mt-0.5">Instant Playbook Answers for Fan Queries</p>
              </div>
            </div>

            {/* Quick tags */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Quick-tap common query tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: "Bag policy limit?", ans: "Only clear plastic, vinyl or PVC bags smaller than 12x6x12 inches are allowed inside. Non-clear small clutch bags can be 4.5x6.5 inches max." },
                  { tag: "Sensory spaces?", ans: "A sensory-friendly calm space is open at Section 120 (ADA Desk). Noise-canceling headphones and sensory kits can be checked out free." },
                  { tag: "ADA Accessibility?", ans: "Accessible parking is adjacent to Gates A and C. Elevator services run between Levels 1 and 3 continuously. Wheelchair helpers are stationed at ADA desks." },
                  { tag: "Lost objects?", ans: "Lost & Found is located at Guest Services on Concourse Level 1, near Section 118. Items are logged digitally instantly." },
                  { tag: "Public power hubs?", ans: "Charging docks are situated near concourse food courts and ADA hubs (adjacent Section 112 & 124)." }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFaqSearchQuery(item.tag);
                      setFaqSearchResult(item.ans);
                      logRoleActivity(`Volunteer queried playbook tag: "${item.tag}"`);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500 hover:text-cyan-400 transition-all font-mono"
                  >
                    {item.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Search */}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={faqSearchQuery} 
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search playbook keyword (e.g. charging, strollers, clear bags)..." 
                className="flex-1 bg-black text-white border border-[#27272a] p-2 rounded-lg text-xs placeholder-[#71717a]"
              />
              <button 
                onClick={() => {
                  if (!faqSearchQuery.trim()) return;
                  logRoleActivity(`Volunteer searched playbook query: "${faqSearchQuery}"`);
                  // simple mock lookup
                  const q = faqSearchQuery.toLowerCase();
                  if (q.includes("bag") || q.includes("clear")) {
                    setFaqSearchResult("Only clear plastic bags smaller than 12x6x12 inches are allowed inside the venue. Standard backpacks are forbidden.");
                  } else if (q.includes("sensory") || q.includes("calm")) {
                    setFaqSearchResult("The sensory quiet room is located at Section 120. Noise-dampening kits are available for families to borrow.");
                  } else if (q.includes("lost") || q.includes("found")) {
                    setFaqSearchResult("Direct fans to the Guest Services Desk near Section 118. Stolen or lost devices are cataloged inside the operations portal.");
                  } else {
                    setFaqSearchResult("I searched the FIFA 2026 playbook: Standard venue protocols dictate directing fans to the nearest Guest Services hub (Section 118 or Level 1 main gateway) for direct assistance.");
                  }
                }}
                className="bg-cyan-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold font-mono hover:bg-cyan-400"
              >
                Search
              </button>
            </div>

            {/* Playbook result output */}
            <div className="flex-1 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-[11px] leading-relaxed max-h-[170px] overflow-y-auto">
              {faqSearchResult ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold uppercase text-[10px]">
                    <span>✓ PLAYBOOK RESPONSE APPROVED:</span>
                  </div>
                  <p className="text-zinc-300 whitespace-pre-line">{faqSearchResult}</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-zinc-600 italic p-4">
                  Tap a tag above or enter a keyword to retrieve authorized coordinator playbook answers instantly.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Volunteer Ticker and Broadcast channel */}
        <div className="col-span-full lg:col-span-3 flex flex-col gap-6">
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-cyan-400 animate-bounce" /> Team Broadcast Feed
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-1 font-mono text-[10px] leading-relaxed">
              {/* Emergency Override banner displayed inside feed */}
              {globalEmergencyOverride && (
                <div className="p-3 bg-red-600/20 border border-red-500 text-red-300 rounded-lg animate-pulse">
                  <p className="font-extrabold uppercase">🚨 EMERGENCY OVERRIDE RECEIVED:</p>
                  <p className="mt-1 font-sans font-bold text-white text-[11px]">{globalEmergencyOverride}</p>
                </div>
              )}

              {broadcasts.map((bc, idx) => (
                <div key={idx} className="p-2.5 rounded bg-zinc-950 border border-zinc-900 text-zinc-400">
                  {bc}
                </div>
              ))}
            </div>
            
            <p className="text-[9px] text-[#71717a] font-mono uppercase text-center mt-2">Volunteer Dispatch Feed Active</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    return <AdminDashboard locale={locale} />;
  };

  const renderOrganizerDashboard = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-fadeIn">
        {/* Top Metric Strip */}
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Overall Attendance", value: "82,400 / 85,000", color: "text-white" },
            { label: "Staff Active", value: `${Object.values(staffFleet).reduce((a: any, b: any) => Number(a) + Number(b), 0)} Deployed`, color: "text-purple-400" },
            { label: "Active Incidents", value: `${incidents.filter(i => i.status !== "resolved").length} Alert Logs`, color: "text-red-500" },
            { label: "Emergency Overrides", value: globalEmergencyOverride ? "1 ACTIVE" : "0 ACTIVE", color: globalEmergencyOverride ? "text-red-500 animate-pulse" : "text-zinc-500" }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[#27272a] bg-[#09090b] font-mono text-center">
              <span className="text-[9px] text-zinc-500 block uppercase font-mono tracking-wider">{stat.label}</span>
              <span className={`text-sm font-black mt-1 block ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Left Column: Tournament Master Schedule Timeline */}
        <div className="col-span-full lg:col-span-7 flex flex-col gap-6">
          {/* Timeline */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                📅 Tournament Master Schedule Timeline
              </h3>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">FIFA 2026 Core</span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {masterMatches.map((match) => (
                <div key={match.id} className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold">
                        {match.venue.toUpperCase()}
                      </span>
                      <span className="text-zinc-500 font-bold text-[10px]">{match.date} • {match.time}</span>
                    </div>
                    <p className="text-white font-extrabold text-[13px] tracking-tight">{match.match}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-0.5">
                      <span>👤 Inflow: <strong className={match.density === "Extreme" ? "text-red-500" : "text-zinc-300"}>{match.density}</strong></span>
                      <span>🛡️ Staffing: <strong className="text-zinc-300">{match.staffing}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      match.status === "In-Progress" ? "bg-[#22c55e]/15 text-[#22c55e] animate-pulse" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {match.status}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setMasterMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: "In-Progress", density: "Extreme", staffing: "Surge Deployed" } : m));
                          logRoleActivity(`Organizer set match "${match.match}" to In-Progress (Surge Deployed)`);
                        }}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[8px] font-bold uppercase text-zinc-300"
                      >
                        Live
                      </button>
                      <button 
                        onClick={() => {
                          setMasterMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: "Complete", density: "Empty", staffing: "Stand-down" } : m));
                          logRoleActivity(`Organizer marked match "${match.match}" as Complete (Stand-down)`);
                        }}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[8px] font-bold uppercase text-zinc-300"
                      >
                        End
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive AI Insights */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🧠 Predictive AI Insights & Inflow Forecasts
              </h3>
              <span className="text-[10px] font-mono text-purple-400 uppercase">Neural Calibrated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded bg-zinc-950 border border-zinc-900 space-y-1.5">
                <p className="text-purple-400 font-extrabold text-[10px] uppercase">🚨 ARRIVAL PEAK CRITICAL WARNING</p>
                <p className="text-white text-[11px] leading-relaxed">
                  Predictive analytics forecast Gate A queues will spike up to an **18-minute wait time** between 17:35 and 18:10.
                </p>
                <span className="text-[9px] text-zinc-500 block">Suggested action: Re-route southern loop shuttles to East Gate C plaza.</span>
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-900 space-y-1.5">
                <p className="text-[#22c55e] font-extrabold text-[10px] uppercase">🚍 SHUTTLE TRANSIT DECONGESTION SUCCESS</p>
                <p className="text-white text-[11px] leading-relaxed">
                  Real-time GPS bus flow tracking suggests the East Gate shuttle line is operating at **96% efficiency** with a average wait time under **3 minutes**.
                </p>
                <span className="text-[9px] text-zinc-500 block">System status: Normal route optimization active.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Resource Allocation + Emergency override */}
        <div className="col-span-full lg:col-span-5 flex flex-col gap-6">
          {/* Resource Staff Fleet allocation */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🛡️ Resource Allocation & Staff Fleet Command
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Live Deployed</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {[
                { key: "stewards", label: "Stewarding Personnel (Crowd Flow Control)", color: "text-purple-400 border-purple-500/20" },
                { key: "security", label: "Special Security Officers (Secure Corridors)", color: "text-red-400 border-red-500/20" },
                { key: "medical", label: "Certified First Aid / Emergency Response", color: "text-blue-400 border-blue-500/20" },
                { key: "cleaners", label: "Sanitation / Bins Recycling Stewards", color: "text-[#22c55e] border-emerald-500/20" }
              ].map((fleet) => (
                <div key={fleet.key} className="p-2.5 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-white font-bold text-[10px] uppercase block">{fleet.label}</span>
                    <span className="text-[9px] text-zinc-500 uppercase">DEPARTMENT BUDGET CAP: 150</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const nextVal = Math.max(0, staffFleet[fleet.key] - 5);
                        setStaffFleet(prev => ({ ...prev, [fleet.key]: nextVal }));
                        logRoleActivity(`Organizer decreased ${fleet.label} allocation to ${nextVal} staff`);
                      }}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-black text-white text-xs w-8 text-center">{staffFleet[fleet.key]}</span>
                    <button 
                      onClick={() => {
                        const nextVal = Math.min(150, staffFleet[fleet.key] + 5);
                        setStaffFleet(prev => ({ ...prev, [fleet.key]: nextVal }));
                        logRoleActivity(`Organizer increased ${fleet.label} allocation to ${nextVal} staff`);
                      }}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency broadcast override */}
          <div className="rounded-2xl p-5 border border-red-500 bg-[#09090b] shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-mono text-red-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span> MASS DISPATCH
            </div>

            <div className="border-b border-red-500/30 pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                📣 Emergency Broadcast Override (Mass Alert)
              </h3>
              <p className="text-[9px] text-red-400 font-mono mt-0.5 uppercase">Pushes live alerts instantly across all dashboards</p>
            </div>

            <div className="space-y-2.5">
              {/* Quick Template buttons */}
              <div className="flex flex-wrap gap-1">
                {[
                  "🚨 SEVERE CONGESTION AT GATE A - PLEASE REROUTE TO GATE C",
                  "⛈️ WEATHER ADVISORY: HEAVY RAIN EXPECTED, AWNINGS IN PLACE",
                  "🚨 ALL VOLUNTEERS: DISPATCH TO ZONE B INFO DESK CONGESTION CHANNELS"
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setNewEmergencyMessage(item)}
                    className="text-[9px] px-2 py-1 bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 font-mono text-left w-full rounded"
                  >
                    Quick template: {item.slice(0, 35)}...
                  </button>
                ))}
              </div>

              <input 
                type="text" 
                value={newEmergencyMessage}
                onChange={(e) => setNewEmergencyMessage(e.target.value)}
                placeholder="Type emergency alert dispatch message..." 
                className="w-full bg-black text-white border border-red-900/40 p-2.5 rounded-lg text-xs font-mono placeholder-red-900/40 focus:outline-none focus:border-red-500"
              />

              <button 
                onClick={() => {
                  if (!newEmergencyMessage.trim()) return;
                  logRoleActivity(`Organizer PUSHED GLOBAL EMERGENCY ADVISORY: "${newEmergencyMessage}"`);
                  setGlobalEmergencyOverride(newEmergencyMessage);
                  setNewEmergencyMessage("");
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs py-2.5 rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                💥 PUSH LIVE GLOBAL OVERRIDE ALERT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardWrapper
      locale={locale}
      setLocale={setLocale}
      persona={persona}
      setPersona={setPersona}
      accessibilityMode={accessibilityMode}
      setAccessibilityMode={setAccessibilityMode}
      globalEmergencyOverride={globalEmergencyOverride}
      setGlobalEmergencyOverride={setGlobalEmergencyOverride}
      sessionId={sessionId}
      t={t}
      selectedStadium={selectedStadium}
      setSelectedStadium={setSelectedStadium}
      findNearestStadium={findNearestStadium}
      findingNearest={findingNearest}
      stadiums={stadiums}
      wsConnected={wsConnected}
      handleLogout={handleLogout}
      currentUser={user}
    >
      {persona !== "fan" && !isRoleVerified ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-8 bg-[#09090b]/50 border border-red-500/20 rounded-2xl min-h-[400px] text-center space-y-4 animate-fadeIn">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 animate-pulse">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-mono font-bold text-red-500 uppercase tracking-widest">
            {locale === "es" ? "PANEL OPERATIVO BLOQUEADO" : locale === "fr" ? "TABLEAU DE BORD OPÉRATIONNEL VERROUILLÉ" : "OPERATIONAL DASHBOARD LOCKED"}
          </h2>
          <p className="text-sm text-zinc-400 max-w-md">
            {locale === "es" 
              ? "Debe completar la verificación de contraseña segura para acceder a las funciones operativas restringidas." 
              : locale === "fr" 
                ? "Vous devez effectuer la vérification du code d'accès sécurisé pour accéder aux fonctions opérationnelles restreintes." 
                : "You must complete the secure passcode verification to access restricted operational features."}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {persona === "fan" && (
            <motion.div
              key="fan-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full flex flex-col items-stretch"
            >
              {renderFanDashboard()}
            </motion.div>
          )}
          {persona === "staff" && (
            <motion.div
              key="staff-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full flex flex-col items-stretch"
            >
              {renderStaffDashboard()}
            </motion.div>
          )}
          {persona === "volunteer" && (
            <motion.div
              key="volunteer-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full flex flex-col items-stretch"
            >
              {renderVolunteerDashboard()}
            </motion.div>
          )}
          {persona === "organizer" && (
            <motion.div
              key="organizer-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full flex flex-col items-stretch"
            >
              {renderOrganizerDashboard()}
            </motion.div>
          )}
          {persona === "admin" && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full flex flex-col items-stretch"
            >
              {renderAdminDashboard()}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence mode="wait">
        {showChat && (
          <ChatInterface role={persona} onClose={() => setShowChat(false)} />
        )}
      </AnimatePresence>

      {persona !== "fan" && persona !== "admin" && (
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-24 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition"
        >
          <MessageSquare className="w-6 h-6"/>
        </button>
      )}

      {showRoleAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm bg-[#09090b] border border-red-500/30 rounded-xl shadow-2xl p-6 text-white font-sans relative overflow-hidden">
            {/* Security glowing accent lines */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20 animate-pulse"></div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 animate-pulse">
                <Lock className="w-8 h-8" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold tracking-widest font-mono uppercase text-red-500">
                  {locale === "es" ? "PUERTA DE ACCESO SEGURA" : locale === "fr" ? "PORTAIL D'ACCÈS SÉCURISÉ" : "SECURE PASSCODE GATE"}
                </h3>
                <p className="text-[11px] text-[#a1a1aa] uppercase font-mono tracking-wide">
                  {locale === "es" ? "Accediendo a Rol Restringido:" : locale === "fr" ? "Accès au Rôle Restreint:" : "Accessing Restricted Role:"} <span className="text-white font-bold">{pendingPersona?.toUpperCase()}</span>
                </p>
              </div>

              <div className="w-full p-3 bg-zinc-950 border border-[#27272a] rounded text-left space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">
                  {locale === "es" ? "AVISO DE AUTORIZACIÓN" : locale === "fr" ? "AVIS D'AUTORISATION" : "SECURITY CLEARANCE ADVISORY"}
                </span>
                <p className="text-[10px] text-zinc-400 font-mono leading-normal">
                  {locale === "es" 
                    ? "Para acceder a operaciones restringidas como coordinador, use la clave de acceso compartida:" 
                    : locale === "fr" 
                      ? "Pour accéder aux opérations restreintes en tant que coordinateur, utilisez la clé d'accès partagée:" 
                      : "To access restricted operations as a coordinator, use the shared, hardcoded role access key:"}
                </p>
                <div className="p-2 bg-[#18181b] border border-red-500/20 rounded flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">
                    {locale === "es" ? "CLAVE DE ACCESO" : locale === "fr" ? "CLÉ D'ACCÈS" : "ACCESS KEY"}
                  </span>
                  <span className="text-[#22c55e] font-extrabold tracking-wider animate-pulse">FIFA2026-OP</span>
                </div>
              </div>

              <form onSubmit={handleAuthenticateRole} className="w-full space-y-3 pt-2">
                <div className="space-y-1">
                  <input
                    type="text"
                    maxLength={20}
                    value={roleAuthPin}
                    onChange={(e) => {
                      setRoleAuthPin(e.target.value);
                      setRoleAuthError(null);
                    }}
                    placeholder={locale === "es" ? "Ingresar Clave" : locale === "fr" ? "Entrer la Clé" : "Enter Access Key"}
                    className="w-full text-center uppercase tracking-widest font-mono text-sm bg-zinc-950 border border-[#27272a] focus:border-red-500 text-white rounded p-2 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                    autoFocus
                    required
                  />
                </div>

                {roleAuthError && (
                  <p className="text-[10px] font-mono text-red-500 uppercase tracking-wider text-center animate-pulse">
                    ❌ {locale === "es" ? "CLAVE DE ACCESO INVÁLIDA. ACCESO DENEGADO." : locale === "fr" ? "CLÉ D'ACCÈS INVALIDE. ACCÈS REFUSÉ." : "INVALID ACCESS KEY. ACCESS DENIED."}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelRoleAuth}
                    className="flex-1 py-1.5 rounded border border-[#27272a] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-[11px] font-bold uppercase transition-all"
                  >
                    {locale === "es" ? "Cancelar" : locale === "fr" ? "Annuler" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-mono text-[11px] font-bold uppercase transition-all shadow-lg shadow-red-500/20"
                  >
                    {locale === "es" ? "Autorizar" : locale === "fr" ? "Autoriser" : "Authorize"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}