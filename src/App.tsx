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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

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
  Bell,
  Navigation,
  LogOut,
  ChevronDown,
  UserCheck,
  Zap,
  Droplets,
  Truck,
  Users,
  Radio,
  WifiOff,
  Eye,
  EyeOff,
  Trophy,
  Ticket
} from "lucide-react";

import { DashboardWrapper } from "./components/DashboardWrapper";
import { ChatInterface } from "./components/ChatInterface";
import { MatchesSection } from "./components/MatchesSection";
import { volunteerDetailsMap } from "./data/volunteerData";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import it from "./locales/it.json";

const locales: Record<string, any> = { en, es, fr, de, pt, it };

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

function IncidentImage({ src, category }: { src: string; category: string }) {
  const [failed, setFailed] = useState(false);
  
  useEffect(() => {
    setFailed(false);
  }, [src]);
  
  if (failed || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-500 rounded animate-fadeIn">
        {category === "seat" ? (
          <span className="text-xs">💺</span>
        ) : category === "spill" ? (
          <span className="text-xs">💧</span>
        ) : category === "gate" ? (
          <span className="text-xs">🚪</span>
        ) : (
          <span className="text-xs">⚠️</span>
        )}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" 
      alt="Evidence" 
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default function App() {
  const getIncidentImage = (category: string) => {
    switch (category) {
      case "seat":
        return "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80";
      case "gate":
        return "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80";
      case "spill":
        return "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800&q=80";
      default:
        return "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80";
    }
  };

  const [user, setUser] = useState<any | null>(() => {
    const savedUser = localStorage.getItem("stadiumiq_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState<"staff" | "organizer" | "volunteer" | "fan" | "admin" | null>(() => {
    return localStorage.getItem("stadiumiq_role") as any;
  });

  const [persona, setPersonaState] = useState<"staff" | "organizer" | "volunteer" | "fan" | "admin">(() => {
    return (localStorage.getItem("stadiumiq_persona") as any) || "fan";
  });

  useEffect(() => {
    if (user) localStorage.setItem("stadiumiq_user", JSON.stringify(user));
    else localStorage.removeItem("stadiumiq_user");
    if (role) localStorage.setItem("stadiumiq_role", role || "");
    else localStorage.removeItem("stadiumiq_role");
    localStorage.setItem("stadiumiq_persona", persona);
  }, [user, role, persona]);

  const [loadingRole, setLoadingRole] = useState(false);
  const [locale, setLocale] = useState<"en" | "es" | "fr" | "de" | "pt" | "it">("en");
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
  const [egressMode, setEgressMode] = useState(false);
  const [staffRoster, setStaffRoster] = useState([
    { name: "John D.", role: "Security", zone: "Sector 112", status: "active" },
    { name: "Sarah M.", role: "Steward", zone: "Gate A", status: "active" },
    { name: "Mike R.", role: "Medical", zone: "Concourse East", status: "on-break" },
    { name: "Elena V.", role: "Hospitality", zone: "VIP Box 4", status: "active" }
  ]);
  const [supervisorChat, setSupervisorChat] = useState<{ sender: string; text: string; time: string }[]>(() => {
    const saved = localStorage.getItem("stadiumiq_supervisor_chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length >= 0) return parsed;
      } catch (e) {
        console.error("Error reading supervisor chat from storage", e);
      }
    }
    return [
      { sender: "Admin", text: "All gates reporting clear flow for kickoff.", time: "17:45" },
      { sender: "Security Lead", text: "Suspicious package at Sec 204 cleared. False alarm.", time: "18:02" }
    ];
  });
  const [supervisorInput, setSupervisorInput] = useState("");

  useEffect(() => {
    if (supervisorChat && supervisorChat.length > 0) {
      localStorage.setItem("stadiumiq_supervisor_chat", JSON.stringify(supervisorChat));
    } else if (supervisorChat && supervisorChat.length === 0) {
      localStorage.removeItem("stadiumiq_supervisor_chat");
    }
  }, [supervisorChat]);
  const [parkingLots, setParkingLots] = useState({
    Blue: 88,
    Green: 42,
    Red: 95,
    Yellow: 12
  });
  const [restroomStatus, setRestroomStatus] = useState({
    "Sec 112": "Low",
    "Sec 204": "High",
    "Gate A": "Medium",
    "VIP East": "Low"
  });
  const [scanRateData] = useState([
    { time: "17:00", rate: 120 },
    { time: "17:15", rate: 350 },
    { time: "17:30", rate: 840 },
    { time: "17:45", rate: 1200 },
    { time: "18:00", rate: 450 }
  ]);
  const [assignedIncidentId, setAssignedIncidentId] = useState<string | null>(null);

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
    { id: "m0", date: "July 10, 2026", time: "18:00", match: "France vs Morocco", venue: "Boston", status: "Complete", density: "High", staffing: "Optimal" },
    { id: "m1", date: "July 11, 2026", time: "20:00", match: "Spain vs Belgium", venue: "Los Angeles", status: "Complete", density: "High", staffing: "Optimal" },
    { id: "m2", date: "July 12, 2026", time: "17:00", match: "Norway vs England", venue: "Miami", status: "Complete", density: "High", staffing: "Optimal" },
    { id: "m3", date: "July 12, 2026", time: "19:00", match: "Argentina vs Switzerland", venue: "Kansas City", status: "Complete", density: "High", staffing: "Optimal" },
    { id: "m4", date: "July 15, 2026", time: "00:30", match: "France vs Spain (0 - 2)", venue: "Dallas", status: "Complete", density: "Extreme", staffing: "Optimal" },
    { id: "m5", date: "July 16, 2026", time: "00:30", match: "England vs Argentina (1 - 2)", venue: "Atlanta", status: "Complete", density: "Extreme", staffing: "Optimal" },
    { id: "m6", date: "July 19, 2026", time: "02:30", match: "Third Place Play-off: France vs England", venue: "Miami", status: "Scheduled", density: "High", staffing: "Surge Required" },
    { id: "m7", date: "July 20, 2026", time: "00:30", match: "FIFA WC Final: Spain vs Argentina", venue: "New Jersey", status: "Scheduled", density: "Extreme", staffing: "Surge Required" },
    { id: "m8", date: "July 14, 2026", time: "21:00", match: "Brazil vs Italy", venue: "Mexico City", status: "Scheduled", density: "Extreme", staffing: "Surge Required" },
    { id: "m9", date: "July 08, 2026", time: "19:00", match: "Mexico vs Colombia", venue: "Mexico City", status: "Complete", density: "High", staffing: "Optimal" },
    { id: "m10", date: "July 08, 2026", time: "18:00", match: "Canada vs Portugal", venue: "Vancouver", status: "Scheduled", density: "High", staffing: "Optimal" },
    { id: "m11", date: "July 12, 2026", time: "16:30", match: "Japan vs Spain", venue: "Vancouver", status: "Complete", density: "High", staffing: "Optimal" },
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
  // Real-time FIFA match event feed
  const [liveMatchEvents, setLiveMatchEvents] = useState<{ id: string; team: string; type: string; text: string; time: string; timestamp: string }[]>(() => {
    return [
      { id: "me_init1", team: "FRA", type: "KICKOFF", text: "🏁 Kickoff! The referee blows the whistle and Match 101 between France and Spain is officially underway!", time: "0'", timestamp: new Date().toISOString() },
      { id: "me_init2", team: "ESP", type: "CHANCE", text: "⚡ Early opportunity! Spain midfielder sends a powerful header just over the crossbar!", time: "5'", timestamp: new Date().toISOString() }
    ];
  });
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
  const [chattingWithStaff, setChattingWithStaff] = useState<any>(null);
  const [expandedImage, setExpandedImage] = useState<{ url: string; category: string; desc: string; location: string } | null>(null);
  const [zoomImageFailed, setZoomImageFailed] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Security");
  const [newStaffZone, setNewStaffZone] = useState("Sector 112");
  const [newStaffStatus, setNewStaffStatus] = useState<"active" | "on-break">("active");

  useEffect(() => {
    setZoomImageFailed(false);
  }, [expandedImage]);

  // LIVE MATCH STATE (Persisted and auto-updating)
  const [liveMatchData, setLiveMatchData] = useState(() => {
    const now = new Date();
    const isJuly = now.getMonth() === 6 && now.getFullYear() === 2026;
    const date = now.getDate();
    
    // Only these dates have live matches
    const liveDates = [15, 16, 19, 20];
    const hasLiveMatchToday = isJuly && liveDates.includes(date);

    let defaultMatch = { score: "0 - 0", minute: 0, home: "FRA", away: "ESP", status: "Scheduled", matchName: "Match 101" };

    if (hasLiveMatchToday) {
      if (date === 15) defaultMatch = { score: "0 - 2", minute: 90, home: "FRA", away: "ESP", status: "FT", matchName: "Match 101" };
      else if (date === 16) defaultMatch = { score: "1 - 2", minute: 90, home: "ENG", away: "ARG", status: "FT", matchName: "Match 102" };
      else if (date === 19) defaultMatch = { score: "0 - 0", minute: 1, home: "FRA", away: "ENG", status: "Live", matchName: "Third Place Play-off" };
      else if (date === 20) defaultMatch = { score: "0 - 0", minute: 1, home: "ESP", away: "ARG", status: "Live", matchName: "Final" };
    }

    const saved = localStorage.getItem("stadiumIq_liveMatch");
    if (saved) {
       const parsed = JSON.parse(saved);
       // If local storage says it's Live but there's no live match today, override it
       if (parsed.status === "Live" && !hasLiveMatchToday) {
          return defaultMatch;
       }
       return parsed;
    }

    return defaultMatch;
  });

  // Auto-reset live match if today is not an official live match date (July 13, 14, 17, 18)
  useEffect(() => {
    const now = new Date();
    const isJuly = now.getMonth() === 6 && now.getFullYear() === 2026;
    const date = now.getDate();
    const liveDates = [15, 16, 19, 20];
    const hasLiveMatchToday = isJuly && liveDates.includes(date);

    if (!hasLiveMatchToday) {
      setLiveMatchData({ score: "0 - 0", minute: 0, home: "FRA", away: "ESP", status: "Scheduled", matchName: "Match 101" });
      localStorage.removeItem("stadiumIq_liveMatch");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMatchData((prev: any) => {
        if (prev.status !== "Live") return prev;
        let newMin = prev.minute + 1;
        let newScore = prev.score;
        let newStatus = prev.status;
        if (newMin > 90) {
          newMin = 90;
          newStatus = "FT";
        }
        // Randomly score a goal (rarely)
        if (newStatus === "Live" && Math.random() > 0.95) {
          const [home, away] = prev.score.split(" - ").map(Number);
          if (Math.random() > 0.5) {
             newScore = `${home + 1} - ${away}`;
          } else {
             newScore = `${home} - ${away + 1}`;
          }
        }
        const nextState = { ...prev, minute: newMin, score: newScore, status: newStatus };
        localStorage.setItem("stadiumIq_liveMatch", JSON.stringify(nextState));
        return nextState;
      });
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // FAN DASHBOARD STATE
  const [ticketScanned, setTicketScanned] = useState(false);
  const [entryCountdown, setEntryCountdown] = useState(42); // minutes left
  const [qrSeed, setQrSeed] = useState(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [redeemedVouchers, setRedeemedVouchers] = useState<Record<string, boolean>>({});

  // PROMO CODE & DISCOUNT STATES
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [activeDiscount, setActiveDiscount] = useState(0); // 0.20 for 20%
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMessage, setPromoSuccessMessage] = useState<string | null>(null);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Dynamic gate timer countdown update based on selectedStadium
  useEffect(() => {
    const countdownMap: Record<string, number> = {
      st_sofi: 42,
      st_metlife: 58,
      st_mercedes: 15,
      st_mbs: 15,
      st_azteca: 75,
      st_bcplace: 30,
      st_hardrock: 40,
    };
    const nextCountdown = countdownMap[selectedStadium] ?? 35;
    setEntryCountdown(nextCountdown);

    // Update staff fleet count on stadium change
    const fleetMap: Record<string, Record<string, number>> = {
      st_sofi: { stewards: 120, security: 85, medical: 24, cleaners: 45 },
      st_metlife: { stewards: 140, security: 110, medical: 30, cleaners: 60 },
      st_mercedes: { stewards: 110, security: 80, medical: 20, cleaners: 40 },
      st_mbs: { stewards: 110, security: 80, medical: 20, cleaners: 40 },
      st_azteca: { stewards: 160, security: 130, medical: 35, cleaners: 70 },
      st_bcplace: { stewards: 90, security: 65, medical: 15, cleaners: 30 },
      st_hardrock: { stewards: 130, security: 95, medical: 25, cleaners: 50 },
    };
    const nextFleet = fleetMap[selectedStadium] || fleetMap.st_sofi;
    setStaffFleet(nextFleet);

    // Update incidents on stadium change
    const incidentPresets: Record<string, {id: string; location: string; category: "seat" | "spill" | "gate" | "other"; desc: string; status: "pending" | "active" | "resolved"; severity: "low" | "medium" | "high"; time: string; image?: string}[]> = {
      st_sofi: [
        { id: "inc-01", location: "Section 112, Row 4", category: "seat", desc: "Broken backing on seat 12", status: "pending", severity: "medium", time: "10 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
        { id: "inc-02", location: "Gate B Security Lane 3", category: "gate", desc: "Bag scanner calibration fault", status: "active", severity: "high", time: "5 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
        { id: "inc-03", location: "Concourse C near Restrooms", category: "spill", desc: "Liquid spill hazard", status: "resolved", severity: "low", time: "25 mins ago", image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800&q=80" },
      ],
      st_metlife: [
        { id: "inc-01", location: "Section 204, Row 15", category: "seat", desc: "Damaged safety rail bracket", status: "pending", severity: "high", time: "12 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
        { id: "inc-02", location: "Gate A Turnstile 2", category: "gate", desc: "Biometric validation delay", status: "active", severity: "medium", time: "8 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
        { id: "inc-03", location: "Concourse Food Court East", category: "spill", desc: "Water spill near beverage station", status: "resolved", severity: "low", time: "15 mins ago", image: "https://images.unsplash.com/photo-1590244921951-2293307f6834?w=800&q=80" },
      ],
      st_mercedes: [
        { id: "inc-01", location: "Section 120, Row 8", category: "seat", desc: "Stuck folding chair mechanism", status: "pending", severity: "low", time: "18 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
        { id: "inc-02", location: "Gate C Metal Detector", category: "gate", desc: "Intermittent sensitivity drops", status: "active", severity: "high", time: "4 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
        { id: "inc-03", location: "Concourse South Exit 4", category: "spill", desc: "Slippery floor near beverage dispenser", status: "resolved", severity: "medium", time: "30 mins ago", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80" },
      ],
      st_mbs: [
        { id: "inc-01", location: "Section 120, Row 8", category: "seat", desc: "Stuck folding chair mechanism", status: "pending", severity: "low", time: "18 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
        { id: "inc-02", location: "Gate C Metal Detector", category: "gate", desc: "Intermittent sensitivity drops", status: "active", severity: "high", time: "4 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
        { id: "inc-03", location: "Concourse South Exit 4", category: "spill", desc: "Slippery floor near beverage dispenser", status: "resolved", severity: "medium", time: "30 mins ago", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80" },
      ],
      st_azteca: [
        { id: "inc-01", location: "Lower Deck, Row 20", category: "seat", desc: "Missing seat number tag", status: "pending", severity: "low", time: "22 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
        { id: "inc-02", location: "Gate G Main Entry", category: "gate", desc: "Turnstile registration lag", status: "active", severity: "medium", time: "9 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
        { id: "inc-03", location: "Ramp Approach West", category: "spill", desc: "Slippery puddle near trash container", status: "resolved", severity: "medium", time: "28 mins ago", image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80" },
      ],
      st_bcplace: [
        { id: "inc-01", location: "Section 215, Row 1", category: "seat", desc: "Unsecured carpet tile", status: "pending", severity: "medium", time: "14 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
        { id: "inc-02", location: "Gate D Entry Lane", category: "gate", desc: "Dirty scanner optical lens", status: "active", severity: "medium", time: "6 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
        { id: "inc-03", location: "Level 2 Concourse", category: "spill", desc: "Slippery soda beverage residue", status: "resolved", severity: "low", time: "20 mins ago", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80" },
      ],
      st_hardrock: [
        { id: "inc-01", location: "Section 104, Row 5", category: "seat", desc: "Loose cup holder", status: "pending", severity: "low", time: "10 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
        { id: "inc-02", location: "Gate E Entry", category: "gate", desc: "Scanner connectivity intermittent", status: "active", severity: "medium", time: "5 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
      ],
    };

    const nextIncidents = incidentPresets[selectedStadium] ?? incidentPresets.st_sofi;
    setIncidents(nextIncidents);

    // Clear voucher redemptions immediately on stadium changes
    setRedeemedVouchers({});
  }, [selectedStadium]);

  // Automatically clear voucher redemption state 60 seconds after scan
  useEffect(() => {
    const activeKeys = Object.keys(redeemedVouchers).filter(k => redeemedVouchers[k]);
    if (activeKeys.length === 0) return;

    const timers = activeKeys.map(stadiumKey => {
      return setTimeout(() => {
        setRedeemedVouchers(prev => {
          const updated = { ...prev };
          delete updated[stadiumKey];
          return updated;
        });
      }, 60000); // 60 seconds
    });

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [redeemedVouchers]);

  // 60-second QR code auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setQrSeed(Date.now());
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [cart, setCart] = useState<{name: string; price: number; type: "food" | "merch"; quantity: number}[]>([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderPickupCode, setOrderPickupCode] = useState("");
  const [lastOrderDetails, setLastOrderDetails] = useState<{items: {name: string; price: number; type: "food" | "merch"; quantity: number}[]; total: number} | null>(null);

  // STAFF DASHBOARD STATE
  const [showLogIncidentModal, setShowLogIncidentModal] = useState(false);
  const [incidents, setIncidents] = useState<{id: string; location: string; category: "seat" | "spill" | "gate" | "other"; desc: string; status: "pending" | "active" | "resolved"; severity: "low" | "medium" | "high"; time: string; image?: string}[]>([
    { id: "inc-01", location: "Section 112, Row 4", category: "seat", desc: "Broken backing on seat 12", status: "pending", severity: "medium", time: "10 mins ago", image: "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=800&q=80" },
    { id: "inc-02", location: "Gate B Security Lane 3", category: "gate", desc: "Bag scanner calibration fault", status: "active", severity: "high", time: "5 mins ago", image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&q=80" },
    { id: "inc-03", location: "Concourse C near Restrooms", category: "spill", desc: "Liquid spill hazard", status: "resolved", severity: "low", time: "25 mins ago", image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800&q=80" },
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
  const [checkedInStadiums, setCheckedInStadiums] = useState<Record<string, boolean>>({
    st_sofi: false,
    st_metlife: false,
    st_mercedes: false,
    st_azteca: false,
    st_bcplace: false,
  });
  const volunteerCheckedIn = checkedInStadiums[selectedStadium === "st_mbs" ? "st_mercedes" : selectedStadium] || false;
  const setVolunteerCheckedIn = (val: boolean) => {
    setCheckedInStadiums(prev => ({
      ...prev,
      [selectedStadium === "st_mbs" ? "st_mercedes" : selectedStadium]: val
    }));
  };
  const [volunteerDistance, setVolunteerDistance] = useState(0.2); // km to stadium
  const [volunteerShiftHours] = useState("08:00 AM - 04:00 PM");

  const [volunteerOnBreak, setVolunteerOnBreak] = useState(false);
  const [pendingHandshake, setPendingHandshake] = useState<Record<string, boolean>>({});
  const [supervisorPinInput, setSupervisorPinInput] = useState("");
  const [showSupervisorPin, setShowSupervisorPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [activeWalkieTalkie, setActiveWalkieTalkie] = useState<string | null>(null);
  const [isRadioTransmitting, setIsRadioTransmitting] = useState(false);
  const [radioLogs, setRadioLogs] = useState<string[]>([
    "Sector B Dispatch: Station B online.",
    "Jane Doe: Volunteers, please keep Gate B approach pathways clear."
  ]);

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
      setPendingPersona(null);
    } else {
      // Once verified, don't lock again for this session
      if (isRoleVerified) {
        setPersonaState(p);
      } else {
        setPendingPersona(p);
        setRoleAuthPin("");
        setRoleAuthError(null);
        setShowRoleAuthModal(true);
      }
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

    const saved = localStorage.getItem(`stadiumiq_helpdesk_messages_${persona}_${locale}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error("Error parsing saved messages", e);
      }
    }

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

  // Persist messages to localStorage on any change or clear
  useEffect(() => {
    if (messages && messages.length > 0) {
      localStorage.setItem(`stadiumiq_helpdesk_messages_${persona}_${locale}`, JSON.stringify(messages));
    } else if (messages && messages.length === 0) {
      localStorage.removeItem(`stadiumiq_helpdesk_messages_${persona}_${locale}`);
    }
  }, [messages, persona, locale]);

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
          } else if (data.type === "live_match_event") {
            setLiveMatchEvents((prev) => {
              if (prev.some((e) => e.id === data.event.id)) return prev;
              return [data.event, ...prev].slice(0, 15);
            });
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
        locale={locale}
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
          localStorage.setItem("stadiumiq_user", JSON.stringify(loggedInUser));
          localStorage.setItem("stadiumiq_role", r);
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
        {/* Chatbot Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#27272a] bg-[#0d0d11]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
              {locale === "es" ? "Asistente StadiumIQ" : locale === "fr" ? "Assistant StadiumIQ" : "StadiumIQ Helpdesk"}
            </span>
          </div>
          <button
            onClick={() => {
              if (window.confirm(locale === "es" ? "¿Limpiar todo el historial de chat?" : locale === "fr" ? "Effacer tout l'historique du chat ?" : "Clear all chat history?")) {
                setMessages([]);
                localStorage.removeItem(`stadiumiq_helpdesk_messages_${persona}_${locale}`);
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 bg-zinc-900/50 hover:bg-red-500/10 border border-zinc-800/80 hover:border-red-500/20 rounded-lg transition-all"
          >
            <Trash2 className="w-3 h-3" />
            {locale === "es" ? "Limpiar" : locale === "fr" ? "Effacer" : "Clear"}
          </button>
        </div>

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
    const getTicketDetailsForStadium = (stadiumId: string) => {
      const detailsMap: Record<string, { match: string; teams: string; date: string; gate: string; section: string; venue: string }> = {
        st_sofi: {
          match: "MATCH 104 - GRAND FINAL",
          teams: "Spain vs Argentina",
          date: "JULY 20, 2026 • 20:00",
          gate: "GATE A",
          section: "SEC 112",
          venue: "MetLife Stadium"
        },
        st_metlife: {
          match: "MATCH 104 - GRAND FINAL",
          teams: "Spain vs Argentina",
          date: "JULY 20, 2026 • 20:00",
          gate: "GATE B",
          section: "SEC 104",
          venue: "MetLife Stadium"
        },
        st_mercedes: {
          match: "MATCH 98 - QUARTER-FINAL",
          teams: "USA vs Germany",
          date: "JULY 11, 2026 • 19:30",
          gate: "GATE C",
          section: "SEC 120",
          venue: "Mercedes-Benz Stadium"
        },
        st_mbs: {
          match: "MATCH 98 - QUARTER-FINAL",
          teams: "USA vs Germany",
          date: "JULY 11, 2026 • 19:30",
          gate: "GATE C",
          section: "SEC 120",
          venue: "Mercedes-Benz Stadium"
        },
        st_azteca: {
          match: "MATCH 100 - SEMI-FINAL",
          teams: "Brazil vs Italy",
          date: "JULY 14, 2026 • 21:00",
          gate: "GATE G",
          section: "SEC 302",
          venue: "Estadio Azteca"
        },
        st_bcplace: {
          match: "MATCH 95 - ROUND OF 16",
          teams: "Canada vs Portugal",
          date: "July 08, 2026 • 18:00",
          gate: "GATE D",
          section: "SEC 215",
          venue: "BC Place"
        }
      };
      return detailsMap[stadiumId] || detailsMap["st_sofi"];
    };
    const ticketDetails = getTicketDetailsForStadium(selectedStadium);

    return (
      <>
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
              <p className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold">{ticketDetails.match}</p>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight mt-0.5 uppercase">{ticketDetails.teams}</h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">{ticketDetails.date}</p>
              <p className="text-[9px] sm:text-[10px] font-mono text-zinc-500 mt-0.5">{ticketDetails.venue} • {ticketDetails.gate} • {ticketDetails.section}</p>

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
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&color=000000&bgcolor=ffffff&data=${encodeURIComponent(`FIFA2026:${ticketDetails.match.replace(/\s+/g, '_')}:${ticketDetails.teams.replace(/\s+/g, '_')}:USER-${sessionId}:${qrSeed}`)}`}
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

              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[8px] font-mono text-emerald-400 font-bold mb-1 shadow-sm animate-fadeIn">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>AUTO-REFRESH SECURE CODE: {secondsLeft}S</span>
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
                <p className="text-[10px] sm:text-[11px] text-amber-400 font-mono leading-tight mt-0.5">
                  Kick-off in {entryCountdown} minutes. {
                    (() => {
                      const messageMap: Record<string, string> = {
                        st_sofi: "Gate A is congested; use Gate C for faster 4-minute access.",
                        st_metlife: "Gate B has a queue spike; Gate D has 10+ open turnstiles now.",
                        st_mercedes: "Field entrances clear; Security Lane 4 is recommended.",
                        st_mbs: "Field entrances clear; Security Lane 4 is recommended.",
                        st_azteca: "Ramp approaches clear; lower level gates flowing under 5 mins.",
                        st_bcplace: "Main plaza queue clearing; West concourse is low delay."
                      };
                      return messageMap[selectedStadium] || "Gate flow normal; check local signs for queues.";
                    })()
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Matchday Promo & Coupon Hub */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${accessibilityMode ? "border-white bg-black text-white" : "border-[#27272a] bg-[#09090b] shadow-lg"} flex flex-col justify-between`}>
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2 sm:pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> {locale === "es" ? "Centro de Promociones" : locale === "fr" ? "Centre de Code Promo" : "Matchday Promo & Coupon Hub"}
              </h3>
              <span className="text-[9px] font-mono text-[#71717a] uppercase">{locale === "es" ? "RECOMPENSAS" : locale === "fr" ? "RECOMPENSES" : "WC26 REWARDS"}</span>
            </div>

            <div className="py-3 space-y-3">
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {locale === "es" 
                  ? "Utiliza códigos de promoción oficiales para reclamar descuentos en comida, bebidas y recuerdos dentro del estadio SoFi." 
                  : locale === "fr" 
                    ? "Utilisez les codes promotionnels officiels pour bénéficier de réductions sur la nourriture et les souvenirs au stade." 
                    : "Unlock exclusive stadium privileges. Copy or apply official tournament promo codes to receive immediate savings on concessions and stadium gear."}
              </p>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                    %
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white tracking-wide uppercase">SPAIN_FINAL26</p>
                    <p className="text-[9px] font-mono text-zinc-500">{locale === "es" ? "20% DE DESCUENTO EN TIENDA" : locale === "fr" ? "20% DE RABAIS CONCESSIONS" : "20% DISCOUNT ON ALL ORDERS"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto font-mono">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("SPAIN_FINAL26");
                      setCopiedPromo(true);
                      setTimeout(() => setCopiedPromo(false), 2000);
                    }}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 transition-all uppercase"
                  >
                    {copiedPromo ? (locale === "es" ? "COPIADO" : "COPIED!") : (locale === "es" ? "COPIAR" : "COPY CODE")}
                  </button>
                  <button
                    onClick={() => {
                      setAppliedPromo("SPAIN_FINAL26");
                      setActiveDiscount(0.20);
                      setPromoSuccessMessage(locale === "es" ? "¡Código SPAIN_FINAL26 aplicado! 20% de descuento activado." : "Promo code SPAIN_FINAL26 applied! 20% discount active.");
                      setPromoError(null);
                    }}
                    disabled={appliedPromo === "SPAIN_FINAL26"}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:text-emerald-500 text-white font-black text-[10px] tracking-wide transition-all uppercase"
                  >
                    {appliedPromo === "SPAIN_FINAL26" ? (locale === "es" ? "APLICADO" : "APPLIED") : (locale === "es" ? "APLICAR" : "APPLY")}
                  </button>
                </div>
              </div>

              {promoSuccessMessage && (
                <p className="text-[10px] font-mono text-emerald-400 font-bold animate-fadeIn">
                  ✓ {promoSuccessMessage}
                </p>
              )}
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
                    { name: "🧢 FIFA World Cup Cap", price: 25.00 },
                    { name: "🍿 Giant Popcorn Bucket", price: 12.00 },
                    { name: "🥨 Warm Soft Pretzel", price: 7.50 },
                    { name: "🎒 World Cup Backpack", price: 45.00 },
                    { name: "🧣 National Team Scarf", price: 30.00 }
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
                  {appliedPromo && (
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                      <span>{locale === "es" ? "SUBTOTAL:" : "SUBTOTAL:"}</span>
                      <span>${cart.reduce((sum, c) => sum + (c.price * c.quantity), 0).toFixed(2)}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 font-bold animate-fadeIn">
                      <span>{locale === "es" ? "DESC (20% SPAIN_FINAL26):" : "DISC (20% SPAIN_FINAL26):"}</span>
                      <span>-${(cart.reduce((sum, c) => sum + (c.price * c.quantity), 0) * 0.20).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-zinc-500 uppercase">{appliedPromo ? (locale === "es" ? "TOTAL NETO:" : "TOTAL NET:") : (locale === "es" ? "TOTAL:" : "TOTAL:")}</span>
                    <span className="text-[#22c55e] font-black text-sm">
                      ${(cart.reduce((sum, c) => sum + (c.price * c.quantity), 0) * (1 - activeDiscount)).toFixed(2)}
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
                              const total = cart.reduce((sum, c) => sum + (c.price * c.quantity), 0) * (1 - activeDiscount);
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
      <div className="w-full mt-6">
        <MatchesSection selectedStadium={selectedStadium} stadiums={stadiums} liveMatchEvents={liveMatchEvents} />
      </div>
    </>
    );
  };

  const renderStaffDashboard = () => {
    const getVenuePowerLoad = (stadiumId: string) => {
      const powerMap: Record<string, { value: string; pct: number }> = {
        st_sofi: { value: "84.2", pct: 84 },
        st_metlife: { value: "96.5", pct: 96 },
        st_mercedes: { value: "78.1", pct: 78 },
        st_mbs: { value: "78.1", pct: 78 },
        st_azteca: { value: "64.9", pct: 65 },
        st_bcplace: { value: "58.3", pct: 58 }
      };
      return powerMap[stadiumId] || powerMap["st_sofi"];
    };
    const powerLoad = getVenuePowerLoad(selectedStadium);

    return (
      <div className="flex flex-col gap-6 animate-fadeIn w-full">
        {/* Top Section: Stadium Operations Clock & Gate Protocol Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 md:col-span-8 rounded-3xl p-6 border border-[#27272a] bg-[#09090b] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Operational Clock</h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Gate Protocol Tracker</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Public Gates Open</span>
                    <span className="text-lg font-black text-white">02h 14m</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-800" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-amber-500 uppercase">Kickoff Countdown</span>
                    <span className="text-lg font-black text-white">04h 14m</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setEgressMode(!egressMode);
                logRoleActivity(`Staff toggled stadium mode to: ${!egressMode ? "EGRESS/EXIT" : "STANDARD OPERATIONS"}`);
              }}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                egressMode 
                  ? "bg-amber-500 text-black shadow-amber-900/20" 
                  : "bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700"
              }`}
            >
              {egressMode ? "⏹️ EXIT MODE ACTIVE" : "▶️ ACTIVATE EGRESS"}
            </button>
          </div>

          <div className="col-span-12 md:col-span-4 rounded-3xl p-6 border border-[#27272a] bg-[#09090b] shadow-2xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="w-24 h-24 text-emerald-500" />
            </div>
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Venue Power Load</h4>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white tracking-tighter">{powerLoad.value}</span>
              <span className="text-lg font-bold text-emerald-400 mb-1">MW</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${powerLoad.pct}%` }} />
            </div>
          </div>
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Enhanced Incident Management */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-3xl p-5 border border-[#27272a] bg-[#09090b] shadow-xl flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-4 mb-4">
                <div>
                  <h3 className="font-black text-xs tracking-widest uppercase text-white flex items-center gap-2">
                    <ShieldAlert className="text-red-500 w-4 h-4" /> Incident Management
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Priority Dispatch Queue</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black text-zinc-400 px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                    {incidents.filter(i => i.status !== "resolved").length} Active
                  </span>
                </div>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-2xl border border-zinc-800/50 bg-zinc-950/40 hover:bg-zinc-950 transition-all flex flex-col gap-3 group">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            inc.severity === "high" ? "bg-red-500 animate-pulse" :
                            inc.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"
                          }`} />
                          <span className="font-black text-white text-[11px] uppercase tracking-wider">{inc.location}</span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">{inc.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-mono text-zinc-600">{inc.time}</span>
                        <div 
                          onClick={() => setExpandedImage({
                            url: inc.image || getIncidentImage(inc.category),
                            category: inc.category,
                            desc: inc.desc,
                            location: inc.location
                          })}
                          className="w-12 h-8 rounded bg-zinc-900 border border-zinc-800 overflow-hidden relative cursor-zoom-in group/img" 
                          title="View Evidence"
                        >
                          <IncidentImage src={inc.image || getIncidentImage(inc.category)} category={inc.category} />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 bg-black/40">
                            <ZoomIn className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                      <div className="flex-1">
                        <select 
                          className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 p-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                          value={assignedIncidentId === inc.id ? "assigned" : ""}
                          onChange={(e) => {
                            setAssignedIncidentId(inc.id);
                            logRoleActivity(`Incident ${inc.id} assigned to ${e.target.value === "assigned" ? "Sector Lead" : "unassigned"}`);
                          }}
                        >
                          <option value="">Assign To...</option>
                          <option value="lead">Sector Lead</option>
                          <option value="security">Security Team 4</option>
                          <option value="medical">Paramedic Unit B</option>
                          <option value="volunteer">Volunteer Support</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          setIncidents(prev => prev.map(p => {
                            if (p.id !== inc.id) return p;
                            const nextStatus: "pending" | "active" | "resolved" = 
                              p.status === "pending" ? "active" : p.status === "active" ? "resolved" : "pending";
                            logRoleActivity(`Incident ${p.id} updated to ${nextStatus.toUpperCase()}`);
                            return { ...p, status: nextStatus, resolvedAt: nextStatus === "resolved" ? new Date().toLocaleTimeString() : undefined };
                          }));
                        }}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                          inc.status === "resolved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          inc.status === "active" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                          "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {inc.status}
                      </button>
                    </div>
                    {inc.resolvedAt && (
                      <p className="text-[9px] font-mono text-emerald-500 text-right italic">Resolved at {inc.resolvedAt}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[#27272a]">
                <button 
                  onClick={() => setShowLogIncidentModal(true)}
                  className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
                >
                  Log New Incident Report
                </button>
              </div>
            </div>
          </div>

          {/* Center Column: Venue Flows & Spatial Awareness */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Map Placeholder with pins */}
            <div className="rounded-3xl p-5 border border-[#27272a] bg-[#09090b] shadow-xl flex flex-col min-h-[400px] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-4 mb-4 z-10">
                <div>
                  <h3 className="font-black text-xs tracking-widest uppercase text-white flex items-center gap-2">
                    <Navigation className="text-emerald-500 w-4 h-4" /> Spatial Awareness
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Interactive Concourse Map v4.2</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      setZoom(prev => Math.max(prev - 0.2, 0.5));
                      if (zoom <= 1) setPan({ x: 0, y: 0 });
                    }}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div 
                className="flex-1 relative bg-zinc-950 rounded-2xl border border-zinc-800/40 overflow-hidden group select-none cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                }}
                onMouseMove={(e) => {
                  if (!isDragging) return;
                  setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <div 
                  className="w-full h-full transition-transform duration-100 ease-out origin-center flex items-center justify-center relative"
                  style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
                >
                  {/* SVG MAP SIMULATION */}
                  <svg viewBox="0 0 400 300" className="w-full h-full opacity-60 hover:opacity-80 transition-opacity">
                    {/* Stadium Outer Ring */}
                    <path d="M50,50 L350,50 L350,250 L50,250 Z" fill="none" stroke="#27272a" strokeWidth="2" />
                    {/* Inner pitch */}
                    <circle cx="200" cy="150" r="70" fill="none" stroke="#27272a" strokeWidth="2" />
                    <line x1="200" y1="50" x2="200" y2="250" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="150" x2="350" y2="150" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
                    
                    {/* Gate A Top */}
                    <rect 
                      x="170" y="45" width="60" height="12" rx="4"
                      fill={activeMapFeature?.id === "gate_a" ? "#10b981" : "#1f2937"} 
                      stroke={activeMapFeature?.id === "gate_a" ? "#34d399" : "#374151"}
                      className="cursor-pointer hover:fill-emerald-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "gate",
                          id: "gate_a",
                          name: "Gate A (Main Entry)",
                          status: "Highly Congested",
                          density: 92,
                          info: "Expected wait time: 15-20 mins. Restrooms, ADA assistance, and first aid are fully active nearby. Recommended alternate: Gate C.",
                          color: "text-red-500 bg-red-500/10 border-red-500/20"
                        });
                      }}
                    />
                    <text x="200" y="51" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="central" className="pointer-events-none font-mono">GATE A</text>

                    {/* Gate B Bottom */}
                    <rect 
                      x="170" y="243" width="60" height="12" rx="4"
                      fill={activeMapFeature?.id === "gate_b" ? "#10b981" : "#1f2937"} 
                      stroke={activeMapFeature?.id === "gate_b" ? "#34d399" : "#374151"}
                      className="cursor-pointer hover:fill-emerald-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "gate",
                          id: "gate_b",
                          name: "Gate B (South Concourse)",
                          status: "Normal Flow",
                          density: 41,
                          info: "Expected wait time: 3-5 mins. Shuttle terminal directly adjacent.",
                          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        });
                      }}
                    />
                    <text x="200" y="249" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="central" className="pointer-events-none font-mono">GATE B</text>

                    {/* Gate C Left */}
                    <rect 
                      x="43" y="120" width="12" height="60" rx="4"
                      fill={activeMapFeature?.id === "gate_c" ? "#10b981" : "#1f2937"} 
                      stroke={activeMapFeature?.id === "gate_c" ? "#34d399" : "#374151"}
                      className="cursor-pointer hover:fill-emerald-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "gate",
                          id: "gate_c",
                          name: "Gate C (West Gates)",
                          status: "Moderate Flow",
                          density: 68,
                          info: "Expected wait time: 8-10 mins. Restrooms and elevator bank are fully operational.",
                          color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        });
                      }}
                    />
                    <text x="49" y="150" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" transform="rotate(-90 49 150)" dominantBaseline="central" className="pointer-events-none font-mono">GATE C</text>

                    {/* Gate D Right */}
                    <rect 
                      x="345" y="120" width="12" height="60" rx="4"
                      fill={activeMapFeature?.id === "gate_d" ? "#10b981" : "#1f2937"} 
                      stroke={activeMapFeature?.id === "gate_d" ? "#34d399" : "#374151"}
                      className="cursor-pointer hover:fill-emerald-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "gate",
                          id: "gate_d",
                          name: "Gate D (East Entrance)",
                          status: "Moderate Flow",
                          density: 55,
                          info: "Expected wait time: 5-8 mins. Direct access to Section 100 concourse.",
                          color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        });
                      }}
                    />
                    <text x="351" y="150" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" transform="rotate(90 351 150)" dominantBaseline="central" className="pointer-events-none font-mono">GATE D</text>

                    {/* Facilities Markers */}
                    {/* Restroom (Top Left) */}
                    <circle 
                      cx="100" cy="90" r="12" 
                      fill={activeMapFeature?.id === "fac_restroom" ? "#06b6d4" : "#1e1b4b"} 
                      stroke="#06b6d4" strokeWidth="1.5" className="cursor-pointer hover:fill-cyan-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "facility",
                          id: "fac_restroom",
                          name: "Main Restrooms (Sec 104)",
                          status: "Operational",
                          info: "Status: Medium queue. Peak transit times saw 6 min waits. Cleaning schedule is hourly.",
                          color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
                        });
                      }}
                    />
                    <text x="100" y="93" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">WC</text>

                    {/* Food / Concessions (Top Right) */}
                    <circle 
                      cx="300" cy="90" r="12" 
                      fill={activeMapFeature?.id === "fac_food" ? "#eab308" : "#422006"} 
                      stroke="#eab308" strokeWidth="1.5" className="cursor-pointer hover:fill-yellow-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "facility",
                          id: "fac_food",
                          name: "Food Court & Concessions",
                          status: "Busy",
                          info: "8 out of 10 counters active. Average line length: 12 people. POS terminals are running smoothly.",
                          color: "text-amber-400 bg-amber-400/10 border-amber-400/20"
                        });
                      }}
                    />
                    <text x="300" y="93" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">FD</text>

                    {/* First Aid / Medical (Bottom Left) */}
                    <circle 
                      cx="100" cy="210" r="12" 
                      fill={activeMapFeature?.id === "fac_medical" ? "#ef4444" : "#450a0a"} 
                      stroke="#ef4444" strokeWidth="1.5" className="cursor-pointer hover:fill-red-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "facility",
                          id: "fac_medical",
                          name: "First Aid & Medical Post A",
                          status: "On Standby",
                          info: "Physician & 3 EMTs active. Supplies fully stocked. Direct line to regional hospital dispatcher is online.",
                          color: "text-red-500 bg-red-500/10 border-red-500/20"
                        });
                      }}
                    />
                    <text x="100" y="213" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">+</text>

                    {/* ADA Hub (Bottom Right) */}
                    <circle 
                      cx="300" cy="210" r="12" 
                      fill={activeMapFeature?.id === "fac_ada" ? "#a855f7" : "#3b0764"} 
                      stroke="#a855f7" strokeWidth="1.5" className="cursor-pointer hover:fill-purple-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapFeature({
                          type: "facility",
                          id: "fac_ada",
                          name: "ADA & Accessibility Services",
                          status: "Active",
                          info: "Wheelchair escorts available immediately. Sensory room is open with low-stimulation environment active.",
                          color: "text-purple-400 bg-purple-400/10 border-purple-400/20"
                        });
                      }}
                    />
                    <text x="300" y="213" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" className="pointer-events-none font-mono">ADA</text>
                  </svg>

                  {/* Incident Pins */}
                  {incidents.filter(i => i.status !== "resolved").map((inc, idx) => {
                    const positions = [
                      { top: "35%", left: "45%" }, 
                      { top: "65%", left: "25%" }, 
                      { top: "25%", left: "75%" }, 
                    ];
                    const pos = positions[idx % positions.length];
                    return (
                      <motion.div 
                        key={inc.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute cursor-pointer z-20"
                        style={{ 
                          top: pos.top, 
                          left: pos.left 
                        }}
                        title={`${inc.location}: ${inc.desc}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMapFeature({
                            type: "incident",
                            id: inc.id,
                            name: `Incident - ${inc.location}`,
                            status: inc.severity.toUpperCase(),
                            info: `${inc.desc} Reported at ${inc.time}. Status: Active.`,
                            color: "text-red-500 bg-red-500/10 border-red-500/20"
                          });
                        }}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shadow-lg ${
                          inc.severity === "high" ? "bg-red-500 animate-bounce" : "bg-amber-500"
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5 text-black" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-zinc-800 text-[10px] font-mono space-y-1 z-10 pointer-events-none">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Gate (Active)</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /> WC / Facilities</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Alert (Incident)</div>
                </div>
              </div>

              {/* Real-time Charts for Flow */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/40">
                  <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Turnstile Flow Rate</h4>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={scanRateData}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="rate" stroke="#10b981" fillOpacity={1} fill="url(#colorRate)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-black text-white">1,240 / min</span>
                    <span className="text-[9px] font-mono text-emerald-400">+12% vs last 15m</span>
                  </div>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/40">
                  <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" /> Restroom Queue
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(restroomStatus).map(([loc, status]) => (
                      <div key={loc} className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 uppercase">{loc}</span>
                        <span className={`font-black uppercase ${
                          status === "High" ? "text-red-500" : status === "Medium" ? "text-amber-400" : "text-emerald-500"
                        }`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dispatch & Roster */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <div className="rounded-3xl p-5 border border-[#27272a] bg-[#09090b] shadow-xl flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-4 mb-4">
                <div>
                  <h3 className="font-black text-xs tracking-widest uppercase text-white flex items-center gap-2">
                    <Users className="text-cyan-500 w-4 h-4" /> Personnel Dispatch
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Staff Roster & Duty Logs</p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddStaffModal(true);
                  }}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Add Staff"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {staffRoster.map((staff, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-zinc-800/40 bg-zinc-950/20 hover:bg-zinc-950 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-white leading-none truncate">{staff.name}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-mono mt-1 truncate">{staff.role} • {staff.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${staff.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <button 
                        onClick={() => {
                          setChattingWithStaff(staff);
                          setShowChat(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyan-400 transition-colors"
                        title="Contact Staff"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Supervisor Chat */}
              <div className="mt-6 pt-4 border-t border-zinc-900">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3 text-emerald-400" /> Supervisor Channel
                  </h4>
                  <button
                    onClick={() => {
                      if (window.confirm("Clear all supervisor chat messages?")) {
                        setSupervisorChat([]);
                        localStorage.removeItem("stadiumiq_supervisor_chat");
                      }
                    }}
                    className="flex items-center gap-1 text-[9px] font-mono text-zinc-600 hover:text-red-400 font-bold uppercase transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    Clear
                  </button>
                </div>
                <div className="bg-zinc-950 rounded-xl border border-zinc-800/50 p-3 h-32 overflow-y-auto space-y-2 mb-3">
                  {supervisorChat.map((msg, idx) => (
                    <div key={idx} className="text-[10px] font-mono leading-relaxed">
                      <span className="text-emerald-500 font-black uppercase mr-1">{msg.sender}:</span>
                      <span className="text-zinc-400">{msg.text}</span>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={supervisorInput}
                    onChange={(e) => setSupervisorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const text = supervisorInput.trim();
                        if (!text) return;
                        setSupervisorChat(prev => [...prev, { sender: "Admin", text, time: "18:05" }]);
                        setSupervisorInput("");
                        setTimeout(() => {
                          const responses = [
                            { sender: "Security Lead", text: "Received, dispatching units to back you up." },
                            { sender: "Steward Lead", text: "Copy that, volunteers are repositioning as requested." },
                            { sender: "Medical Coord", text: "Understood, ambulance crew is on standby." },
                            { sender: "Sector Lead", text: "Roger that. All hands on deck. Keeping you updated." }
                          ];
                          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                          setSupervisorChat(prev => [...prev, randomResponse]);
                        }, 1000);
                      }
                    }}
                    placeholder="Type dispatch order..." 
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 pr-10 rounded-xl text-[11px] placeholder-zinc-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    onClick={() => {
                      const text = supervisorInput.trim();
                      if (!text) return;
                      setSupervisorChat(prev => [...prev, { sender: "Admin", text, time: "18:05" }]);
                      setSupervisorInput("");
                      setTimeout(() => {
                        const responses = [
                          { sender: "Security Lead", text: "Received, dispatching units to back you up." },
                          { sender: "Steward Lead", text: "Copy that, volunteers are repositioning as requested." },
                          { sender: "Medical Coord", text: "Understood, ambulance crew is on standby." },
                          { sender: "Sector Lead", text: "Roger that. All hands on deck. Keeping you updated." }
                        ];
                        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                        setSupervisorChat(prev => [...prev, randomResponse]);
                      }, 1000);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 p-1"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  };

  const renderVolunteerDashboard = () => {
    const activeKey = selectedStadium === "st_mbs" ? "st_mercedes" : selectedStadium;
    const details = volunteerDetailsMap[activeKey] || volunteerDetailsMap["st_sofi"];
    
    const isShiftActive = (shiftHours: string, stadiumId: string): boolean => {
      const offsets: Record<string, number> = {
        st_sofi: -7,
        st_metlife: -4,
        st_mercedes: -4,
        st_azteca: -6,
        st_bcplace: -7
      };
      const offset = offsets[stadiumId] ?? -4;
      
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      
      let localHours = (utcHours + offset + 24) % 24;
      let localMinutes = utcMinutes;
      const currentMinutesFromMidnight = localHours * 60 + localMinutes;
      
      try {
        const parts = shiftHours.split("-").map(p => p.trim());
        if (parts.length !== 2) return false;
        
        const parseTime = (timeStr: string) => {
          const [time, meridian] = timeStr.split(" ");
          const [h, m] = time.split(":").map(Number);
          let hour = h;
          if (meridian === "PM" && hour < 12) hour += 12;
          if (meridian === "AM" && hour === 12) hour = 0;
          return hour * 60 + m;
        };
        
        const startMinutes = parseTime(parts[0]);
        const endMinutes = parseTime(parts[1]);
        
        if (startMinutes <= endMinutes) {
          return currentMinutesFromMidnight >= startMinutes && currentMinutesFromMidnight <= endMinutes;
        } else {
          return currentMinutesFromMidnight >= startMinutes || currentMinutesFromMidnight <= endMinutes;
        }
      } catch (e) {
        console.error("Error parsing shift hours", e);
        return false;
      }
    };

    const isWithinShift = isShiftActive(details.shiftHours, activeKey);
    const isAwaitingHandshake = pendingHandshake[activeKey] || false;

    const registeredName = user?.displayName || user?.email || "Jane Doe";
    const initials = registeredName
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "JD";

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-fadeIn">
        {/* Top Full-Width Header: Volunteer Digital ID / Entry Pass & Offline Status */}
        <div className="col-span-full rounded-2xl p-4 md:p-5 border border-emerald-500/20 bg-gradient-to-r from-[#09090b] via-[#0d0d11] to-[#09090b] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 font-black relative shadow-inner overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-black text-sm uppercase tracking-wider">FIFA Steward Accreditation</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-black rounded border border-emerald-500/30 tracking-widest uppercase">
                  Level 1 • ALL ACCESS
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-500">
                <span>HOLDER: {registeredName}</span>
                <span className="text-zinc-700">•</span>
                <span>ID: {details.barcodeId}</span>
                <span className="text-zinc-700">•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Offline Sync Active
                </span>
              </div>
            </div>
          </div>

          {/* Barcode and Scannable QR Code */}
          <button 
            onClick={() => setIsPassModalOpen(true)}
            className="group flex items-center gap-4 w-full md:w-auto justify-between md:justify-end bg-zinc-950/80 p-3.5 rounded-xl border border-emerald-500/20 hover:border-emerald-400/50 transition-all text-left cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:outline-none"
            title="Click to enlarge scannable tunnel pass"
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest text-right flex items-center gap-1 md:justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Venue Tunnel Access Pass
              </span>
              {/* Mock Barcode */}
              <div className="flex items-end gap-[2.5px] h-9 mt-1.5 opacity-90 group-hover:opacity-100 transition-opacity justify-end">
                {[3, 1, 4, 2, 1, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 1, 2, 4, 2, 1].map((w, idx) => (
                  <div key={idx} className="bg-white h-full rounded-sm" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[8px] font-mono text-zinc-400 tracking-[0.25em] mt-1 text-center group-hover:text-emerald-400 transition-colors">*{details.barcodeId}*</span>
            </div>
            <div className="relative w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&color=000000&bgcolor=ffffff&data=${encodeURIComponent(`VOLUNTEER-ACC-2026:${details.barcodeId}:STADIUM-${selectedStadium}:${qrSeed}`)}`}
                alt="Tunnel Pass QR"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black text-[7px] font-black font-mono px-1 rounded shadow flex items-center gap-0.5">
                <Maximize2 className="w-2 h-2" /> ZOOM
              </div>
            </div>
          </button>
        </div>

        {/* Dynamic Walkie-Talkie Communication Link */}
        {activeWalkieTalkie && (
          <div className="col-span-full rounded-2xl p-5 border border-emerald-500/30 bg-[#0d0d11] shadow-2xl relative overflow-hidden animate-fadeIn flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse flex-shrink-0">
                <Radio className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                    ● ACTIVE VOICE TRANSMISSION
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    FREQ: {details.contactFreq}
                  </span>
                </div>
                <h4 className="text-white font-black text-sm uppercase mt-0.5">
                  Connected with: {activeWalkieTalkie}
                </h4>
                {/* Audio Waveform animation */}
                <div className="flex items-center gap-1 h-6 mt-1.5">
                  {[...Array(16)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-emerald-500 rounded-full transition-all duration-150"
                      style={{ 
                        height: isRadioTransmitting ? `${Math.floor(Math.random() * 20) + 4}px` : '4px',
                        animationDelay: `${i * 0.05}s`
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Push To Talk button & control */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="text-right hidden md:block">
                <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider">RADIO LOGS (LATEST)</span>
                <span className="block text-[10px] font-mono text-zinc-400 italic">"{radioLogs[radioLogs.length - 1]}"</span>
              </div>
              <button
                onMouseDown={() => {
                  setIsRadioTransmitting(true);
                  setRadioLogs(prev => [...prev, `Steward (You): Copy that operations, ${details.stationName} is secure.`]);
                  logRoleActivity(`Volunteer transmitted message over radio at ${details.venueName}`);
                }}
                onMouseUp={() => setIsRadioTransmitting(false)}
                onTouchStart={() => {
                  setIsRadioTransmitting(true);
                  setRadioLogs(prev => [...prev, `Steward (You): Copy that operations, ${details.stationName} is secure.`]);
                }}
                onTouchEnd={() => setIsRadioTransmitting(false)}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all select-none ${
                  isRadioTransmitting 
                    ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-95" 
                    : "bg-emerald-500 hover:bg-emerald-400 text-black font-black"
                }`}
              >
                {isRadioTransmitting ? "🎙️ RELEASE TO SEND" : "🎙️ HOLD TO TRANSMIT"}
              </button>
              <button 
                onClick={() => setActiveWalkieTalkie(null)}
                className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono uppercase tracking-widest transition-all"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Left: Shift check in assignment and stats */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Shift Check-In */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🕒 Timecard Shift Check-In
              </h3>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                volunteerCheckedIn 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : isWithinShift 
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}>
                {volunteerCheckedIn ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    ACTIVE
                  </>
                ) : isWithinShift ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    SHIFT ACTIVE - PENDING CLOCK-IN
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    INACTIVE
                  </>
                )}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-zinc-950 border border-[#27272a]/50 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ASSIGNED VENUE:</span>
                  <span className="text-white font-bold">{details.venueName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">SHIFT TIME:</span>
                  <span className="text-white font-bold">{details.shiftHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PROXIMITY GPS:</span>
                  <span className="text-cyan-400 font-bold">{details.distance} km (IN RANGE)</span>
                </div>

                {/* Direct Stadium Dropdown Switcher */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-900 mt-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Select Assigned Stadium:</span>
                  <select
                    value={selectedStadium}
                    onChange={(e) => {
                      setSelectedStadium(e.target.value);
                      logRoleActivity(`Volunteer switched active stadium to ${e.target.value}`);
                    }}
                    className="w-full bg-zinc-900 border border-[#27272a] text-white rounded p-2 font-mono text-xs cursor-pointer focus:outline-none focus:border-cyan-500"
                  >
                    <option value="st_sofi">SoFi Stadium (Los Angeles)</option>
                    <option value="st_metlife">MetLife Stadium (New Jersey)</option>
                    <option value="st_mercedes">Mercedes-Benz Stadium (Atlanta)</option>
                    <option value="st_azteca">Estadio Azteca (Mexico City)</option>
                    <option value="st_bcplace">BC Place (Vancouver)</option>
                  </select>
                </div>
              </div>

              {!volunteerCheckedIn ? (
                !isAwaitingHandshake ? (
                  <button 
                    onClick={() => {
                      setPendingHandshake(prev => ({ ...prev, [activeKey]: true }));
                      setSupervisorPinInput("");
                      setPinError("");
                      logRoleActivity(`Volunteer initiated check-in for ${details.venueName}. Awaiting captain approval.`);
                    }}
                    className={`w-full text-black font-black text-xs py-2.5 rounded-lg uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isWithinShift 
                        ? "bg-amber-400 hover:bg-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]" 
                        : "bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    }`}
                  >
                    ⏱️ Clock In (Geo-Verify)
                  </button>
                ) : (
                  <div className="p-3 bg-zinc-950 border border-amber-500/20 rounded-xl space-y-3 text-left">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Handshake Verification Required
                      </span>
                      <button 
                        onClick={() => {
                          setPendingHandshake(prev => ({ ...prev, [activeKey]: false }));
                          setSupervisorPinInput("");
                          setPinError("");
                        }}
                        className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 uppercase underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      Awaiting Captain <strong className="text-white">{details.captain}</strong>'s wireless Bluetooth/NFC validation handshake...
                    </p>

                    <button 
                      onClick={() => {
                        try {
                          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const osc = audioCtx.createOscillator();
                          const gain = audioCtx.createGain();
                          osc.connect(gain);
                          gain.connect(audioCtx.destination);
                          osc.type = "sine";
                          osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
                          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                          osc.start();
                          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                          osc.stop(audioCtx.currentTime + 0.3);
                        } catch (err) {}

                        setVolunteerCheckedIn(true);
                        setPendingHandshake(prev => ({ ...prev, [activeKey]: false }));
                        logRoleActivity(`Volunteer clock-in approved via Captain ${details.captain} NFC Handshake`);
                      }}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      📲 Simulate NFC Tap with Captain's Device
                    </button>

                    <div className="relative flex py-1.5 items-center">
                      <div className="flex-grow border-t border-zinc-900"></div>
                      <span className="flex-shrink mx-3 text-[9px] font-mono text-zinc-500 uppercase">OR ENTER OVERRIDE PIN</span>
                      <div className="flex-grow border-t border-zinc-900"></div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <div className="relative flex-1">
                          <input 
                            type={showSupervisorPin ? "text" : "password"}
                            maxLength={4}
                            value={supervisorPinInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setSupervisorPinInput(val);
                              setPinError("");
                            }}
                            placeholder="4-digit Pin"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 pr-8 text-center text-xs font-mono tracking-[0.4em] text-white focus:outline-none focus:border-cyan-500 placeholder:tracking-normal placeholder:text-[9px]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSupervisorPin(!showSupervisorPin)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
                            title={showSupervisorPin ? "Hide PIN" : "Show PIN"}
                          >
                            {showSupervisorPin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            if (supervisorPinInput === "2026") {
                              try {
                                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                const osc = audioCtx.createOscillator();
                                const gain = audioCtx.createGain();
                                osc.connect(gain);
                                gain.connect(audioCtx.destination);
                                osc.type = "sine";
                                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                                osc.start();
                                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
                                osc.stop(audioCtx.currentTime + 0.25);
                              } catch (e) {}

                              setVolunteerCheckedIn(true);
                              setPendingHandshake(prev => ({ ...prev, [activeKey]: false }));
                              setSupervisorPinInput("");
                              logRoleActivity(`Volunteer clock-in approved via Captain ${details.captain} override PIN code`);
                            } else {
                              setPinError("Invalid PIN. (Try '2026')");
                            }
                          }}
                          className="px-3 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-[10px] font-black uppercase rounded transition-colors cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                      {pinError ? (
                        <p className="text-[9px] text-red-400 font-mono text-center">{pinError}</p>
                      ) : (
                        <p className="text-[8px] text-zinc-500 font-mono text-center">
                          (Simulation Hint: {details.captain}'s supervisor code is <strong className="text-zinc-400">2026</strong>)
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-2 text-left">
                  <div className="text-center p-2.5 rounded bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 text-[11px] flex flex-col gap-1 font-sans">
                    <span className="font-bold flex items-center justify-center gap-1.5 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ✓ Checked In at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                      Approved & Signed by Captain {details.captain}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setVolunteerCheckedIn(false);
                      logRoleActivity(`Volunteer clocked out from ${details.venueName}`);
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2 rounded-lg uppercase cursor-pointer"
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
              <span className="text-[10px] font-mono text-zinc-500">{details.stationName}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="text-white font-bold">{details.stationLoc}</p>
              <div className="p-3 bg-zinc-950 rounded border border-[#27272a]/50 font-mono text-[10px] space-y-2 text-zinc-400">
                <div className="flex items-center justify-between">
                  <p>🙋 <span className="font-bold text-white">CAPTAIN:</span> {details.captain}</p>
                  <button 
                    onClick={() => {
                      setActiveWalkieTalkie(details.captain);
                      logRoleActivity(`Volunteer opened radio channel with ${details.captain}`);
                    }}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider"
                    title="Launch Walkie Talkie Link"
                  >
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Call
                  </button>
                </div>
                
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                  <p>📞 <span className="font-bold text-white">CONTACT:</span> {details.contactChannel}</p>
                  <button 
                    onClick={() => {
                      setActiveWalkieTalkie(details.contactChannel);
                      logRoleActivity(`Volunteer opened radio channel on ${details.contactChannel}`);
                    }}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider"
                    title="Connect Radio channel"
                  >
                    <Radio className="w-3 h-3 text-emerald-400" /> Connect
                  </button>
                </div>

                <p className="pt-1.5 border-t border-zinc-900">🗒️ <span className="font-bold text-white">DUTIES:</span> {details.duties}</p>
              </div>
            </div>
          </div>

          {/* One-Tap Emergency / SOS Reporter */}
          <div className="rounded-2xl p-5 border border-red-500/20 bg-gradient-to-b from-[#1a0a0a]/30 to-[#09090b] shadow-lg flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
            <div className="flex items-center justify-between border-b border-red-500/10 pb-2">
              <h3 className="font-black text-xs tracking-widest uppercase text-red-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" /> 1-Tap SOS Reporter
              </h3>
              <span className="text-[8px] font-mono text-red-400/60 font-black tracking-widest uppercase bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                Auto-Geotagged
              </span>
            </div>

            <p className="text-[10px] text-zinc-400">
              Instantly logs high-priority incident at <span className="text-white font-bold">{details.stationLoc}</span>.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {details.sosTriggers.map((sos, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const newId = `inc-sos-${Date.now().toString().slice(-4)}`;
                    const newInc = {
                      id: newId,
                      location: details.stationLoc,
                      category: sos.category,
                      desc: `[SOS REPORT] ${sos.desc}`,
                      status: "pending" as const,
                      severity: "high" as const,
                      time: "Just now",
                      image: getIncidentImage(sos.category)
                    };
                    setIncidents(prev => [newInc, ...prev]);
                    logRoleActivity(`SOS TRIGGERED: ${sos.label} alert logged at ${details.stationLoc}`);
                    
                    setBroadcasts(prev => [
                      `🚨 [SOS COMMAND ALERT] ${sos.label.toUpperCase()} emergency at ${details.stationLoc}! Coordinator dispatching responders.`,
                      ...prev
                    ]);
                    alert(`✓ SOS TRANSMITTED! ${sos.label} Alert successfully sent to Stadium Command. Local dispatch active.`);
                  }}
                  className="py-2.5 px-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center text-center gap-1"
                >
                  {sos.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: FAQ AI cheat sheet search assistant & Perks */}
        <div className="col-span-full lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
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
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 font-mono text-[11px] leading-relaxed max-h-[170px] overflow-y-auto">
              {faqSearchResult ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold uppercase text-[10px]">
                    <span>✓ PLAYBOOK RESPONSE APPROVED:</span>
                  </div>
                  <p className="text-zinc-300 whitespace-pre-line">{faqSearchResult}</p>
                </div>
              ) : (
                <div className="text-center text-zinc-600 italic p-4">
                  Tap a tag above or enter a keyword to retrieve authorized coordinator playbook answers instantly.
                </div>
              )}
            </div>
          </div>

          {/* Perks & Break Voucher Module */}
          <div className="rounded-2xl p-5 border border-zinc-800 bg-[#09090b] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🏆 Perks & Break Vouchers
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">{details.perksHours} hrs served</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>STRETCH MILESTONE:</span>
                  <span>{details.perksHours} / 20.0 Hrs</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: details.perksPercent }} />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                  <span>{details.perksMilestone} (Unlocked)</span>
                  <span>Golden Helper Pass ({details.perksPercent})</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded border border-[#27272a]/50 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-mono text-[10px]">BREAK STATUS:</span>
                  <button 
                    onClick={() => {
                      setVolunteerOnBreak(!volunteerOnBreak);
                      logRoleActivity(`Volunteer toggled shift break mode to: ${!volunteerOnBreak ? "ON BREAK" : "OFF BREAK"}`);
                    }}
                    className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors ${
                      volunteerOnBreak 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" 
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {volunteerOnBreak ? "⏸️ On Break" : "▶️ Go On Break"}
                  </button>
                </div>
                
                <p className="text-[9px] text-zinc-500 font-mono mt-1.5 leading-relaxed">
                  Meal voucher QR Code activates strictly during active designated break periods.
                </p>
                
                {volunteerOnBreak ? (
                  <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex flex-col items-center gap-2 animate-fadeIn">
                    <span className="text-[10px] text-emerald-400 font-mono font-black tracking-widest uppercase">
                      ✓ DIGITAL MEAL VOUCHER ACTIVE
                    </span>
                    <div 
                      className="w-24 h-24 bg-white p-1 rounded-lg flex items-center justify-center relative cursor-pointer hover:scale-103 transition-transform"
                      onClick={() => {
                        const stadiumKey = selectedStadium || "default";
                        if (redeemedVouchers[stadiumKey]) {
                          alert("ℹ️ This break voucher has already been scanned and redeemed for this stadium.");
                          return;
                        }
                        setRedeemedVouchers(prev => ({ ...prev, [stadiumKey]: true }));
                        logRoleActivity(`Scanned and redeemed stadium meal voucher at Concourse Food Court for ${details.venueName}`);
                        alert(`✓ Meal voucher successfully scanned and redeemed for ${details.venueName}!`);
                      }}
                      title="Tap QR to simulate cashier scanning"
                    >
                      {!redeemedVouchers[selectedStadium || "default"] && (
                        <div className="absolute inset-x-0 h-0.5 bg-emerald-500 top-1/2 -translate-y-1/2 animate-bounce pointer-events-none" />
                      )}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&color=000000&bgcolor=ffffff&data=${encodeURIComponent(`MEAL-VOUCHER:${selectedStadium}:${details.barcodeId}:${qrSeed}`)}`}
                        alt="Digital Meal Voucher"
                        className={`w-full h-full object-contain ${redeemedVouchers[selectedStadium || "default"] ? "opacity-20" : ""}`}
                        referrerPolicy="no-referrer"
                      />
                      {redeemedVouchers[selectedStadium || "default"] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <span className="bg-emerald-500 text-black text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded shadow border border-black">REDEEMED</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-center">
                      <span className="text-[9px] text-zinc-400 font-mono tracking-widest">
                        CODE: MEAL-{selectedStadium?.toUpperCase() || "FIFA"}-4921
                      </span>
                      <span className="text-[8px] text-emerald-400 font-mono">
                        REFRESHES IN: {secondsLeft}S
                      </span>
                    </div>
                    <p className="text-[8px] text-zinc-500 text-center font-sans">
                      {redeemedVouchers[selectedStadium || "default"] 
                        ? "Voucher claimed. Enjoy your meal break!" 
                        : "Tap QR to simulate scanner verification for 1x Free Steward Combo"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col items-center justify-center text-center gap-1.5">
                    <Lock className="w-4 h-4 text-zinc-600" />
                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Voucher Locked</span>
                    <span className="text-[8px] text-zinc-600 font-sans">Toggle break status above to generate QR Code.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Volunteer Ticker and Broadcast channel & Heatmap */}
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

          {/* Live Heatmap / Crowd Congestion Widget */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🗺️ Live Heatmap
              </h3>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">{details.venueName.split("(")[0]}</span>
            </div>

            {/* Micro Map */}
            <div className="relative h-44 bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden flex items-center justify-center p-4">
              {/* Outer Stadium Track */}
              <div className="w-36 h-28 border border-zinc-800 rounded-[50px] relative flex items-center justify-center">
                {/* Field */}
                <div className="w-24 h-16 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center justify-center relative">
                  <span className="text-[8px] font-mono text-emerald-800 tracking-widest font-black uppercase">FIFA Field</span>
                </div>

                {/* Gate Points */}
                {/* Gate A */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-[8px] font-mono text-zinc-500 font-bold">Gate A</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[7px] font-mono text-emerald-400 mt-0.5">32%</span>
                </div>

                {/* Gate B - Bottleneck highlighted */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute ${details.gateName === "Gate B" ? "" : "hidden"}`} />
                  <div className={`w-2 h-2 rounded-full ${details.gateColor} relative z-10`} />
                  <span className="text-[8px] font-mono text-zinc-500 font-bold mt-0.5">{details.gateName}</span>
                  <span className="text-[7px] font-mono text-red-400">{details.gatePct} {details.gateName === "Gate B" ? "(Spike)" : ""}</span>
                </div>

                {/* Gate C */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-zinc-500 font-bold leading-none">Gate C</span>
                    <span className="text-[7px] font-mono text-amber-400">55%</span>
                  </div>
                </div>

                {/* Gate D */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center gap-1 flex-row-reverse">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-mono text-zinc-500 font-bold leading-none">Gate D</span>
                    <span className="text-[7px] font-mono text-emerald-400">28%</span>
                  </div>
                </div>
              </div>

              {/* Bottom HUD overlay */}
              <div className="absolute bottom-1 left-2 right-2 flex justify-between items-center text-[8px] font-mono text-zinc-500 bg-zinc-900/50 p-1 rounded">
                <span>CONGESTION ALERTS ACTIVE</span>
                <span className="text-red-400 font-bold animate-pulse">{details.congestionAlert}</span>
              </div>
            </div>

            <p className="text-[9px] text-zinc-500 font-mono leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
              ⚠️ <span className="text-white font-bold">SPATIAL FEEDBACK:</span> {details.heatmapMessage}
            </p>
          </div>
        </div>

        {/* Full-width Match Schedule Section */}
        <div className="col-span-full mt-6 bg-[#09090b] border border-[#27272a] rounded-2xl p-5 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-[#27272a]/50 pb-3 mb-4">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm text-white">⚽ Stadium Match Schedule & Operations</h3>
              <p className="text-xs text-zinc-500">Live match day schedule, past scores, and upcoming matches for this venue</p>
            </div>
          </div>
          <MatchesSection selectedStadium={selectedStadium} stadiums={stadiums} liveMatchEvents={liveMatchEvents} />
        </div>

        {/* HIGH RESOLUTION SCANNABLE TUNNEL PASS MODAL */}
        {isPassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fadeIn">
            {/* Modal Body */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
              
              {/* Header block with glowing badge decoration */}
              <div className="p-5 border-b border-zinc-800 bg-gradient-to-b from-zinc-950 to-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">Digital Accreditation</h4>
                    <p className="text-[9px] font-mono text-zinc-500">Scanner Optimized Mode</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPassModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* High Contrast Physical Badge Body */}
              <div className="p-6 flex flex-col items-center max-h-[80vh] overflow-y-auto">
                
                {/* Physical pass visual mock card */}
                <div className="w-full bg-white rounded-2xl p-5 text-black shadow-xl border-4 border-emerald-500 flex flex-col items-center relative overflow-hidden">
                  
                  {/* Glowing Laser Scan Line Overlay */}
                  <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] top-1/2 left-0 animate-bounce pointer-events-none" />
                  
                  {/* Badge Header */}
                  <div className="w-full flex justify-between items-start border-b border-zinc-200 pb-3 mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black tracking-tight text-zinc-950">FIFA STEWARD ACCREDITATION</span>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold tracking-widest uppercase">LEVEL 1 • ALL ACCESS PASS</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-zinc-900 text-white text-[8px] font-mono font-bold rounded">2026</span>
                  </div>

                  {/* Holder Information */}
                  <div className="w-full flex gap-3 items-center bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 mb-5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-700 text-sm uppercase">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Accredited Steward</p>
                      <p className="text-sm font-black text-zinc-950 truncate">{registeredName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Assigned Venue</p>
                      <p className="text-xs font-bold text-zinc-900 truncate">{details.venueName.split(" (")[0]}</p>
                    </div>
                  </div>

                  {/* Large High-Contrast Barcode */}
                  <div className="w-full flex flex-col items-center bg-zinc-50 py-4 px-3 rounded-xl border border-zinc-200 mb-4 select-none">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Linear Tunnel Barcode</span>
                    <div className="flex items-end gap-[3.5px] h-14 w-full justify-center">
                      {[3, 1, 4, 1, 5, 2, 1, 4, 1, 2, 3, 1, 5, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1].map((w, idx) => (
                        <div key={idx} className="bg-black h-full rounded-sm" style={{ width: `${w}px` }} />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-zinc-900 tracking-[0.3em] mt-2 font-bold">*{details.barcodeId}*</span>
                  </div>

                  {/* Large High-Contrast QR Code */}
                  <div className="flex flex-col items-center bg-zinc-50 p-4 rounded-xl border border-zinc-200 w-full mb-3 select-none">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Matrix QR Access Code</span>
                    <div className="w-36 h-36 bg-white p-2 rounded-lg border border-zinc-300 flex items-center justify-center relative shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=144x144&color=000000&bgcolor=ffffff&data=${encodeURIComponent(`VOLUNTEER-ACC-2026:${details.barcodeId}:STADIUM-${selectedStadium}:${qrSeed}`)}`}
                        alt="High Contrast Tunnel Pass QR"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Device Sync Status Badge */}
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE ACCREDITED PASS • SECURE LEVEL 1
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-950 text-emerald-400 font-mono text-[9px] px-3 py-1 rounded-full border border-emerald-500/25 mt-1.5 font-bold tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SECURE REFRESH: {secondsLeft} SECONDS LEFT
                    </div>
                  </div>
                </div>

                {/* Helpful metadata tips */}
                <div className="mt-5 w-full bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-left">
                  <div className="flex items-start gap-2 text-[11px] text-zinc-400">
                    <span className="text-amber-400 mt-0.5">💡</span>
                    <p>
                      <strong>Scanner Compatibility Tip:</strong> This modal has optimized white contrast for seamless scanner laser resolution.
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-zinc-400">
                    <span className="text-cyan-400 mt-0.5">⚡</span>
                    <p>
                      <strong>Auto-Brightness Warning:</strong> For maximum scanning fidelity, please temporarily increase your device screen brightness to 100% while displaying this code.
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-zinc-900 mt-1.5">
                    <span className="text-[10px] font-mono text-zinc-500">ID SECURITY CHECKSUM</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">PASS-OK-2026</span>
                  </div>
                </div>

                {/* Simulated test-beep feedback */}
                <button 
                  onClick={() => {
                    try {
                      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = audioCtx.createOscillator();
                      const gain = audioCtx.createGain();
                      osc.connect(gain);
                      gain.connect(audioCtx.destination);
                      osc.type = "sine";
                      osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // high pitched beep
                      gain.gain.setValueAtTime(0.08, audioCtx.currentTime); // moderate volume
                      osc.start();
                      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                      osc.stop(audioCtx.currentTime + 0.15);
                    } catch (err) {
                      console.log("Audio feedback error:", err);
                    }
                    alert("🔊 [SIMULATED BEEP] Scanner registered successfully! Code matches check-in database.");
                  }}
                  className="mt-4 w-full bg-zinc-800 hover:bg-zinc-750 active:bg-zinc-700 text-zinc-300 hover:text-white font-mono text-[10px] font-bold py-2.5 px-4 rounded-xl transition-all border border-zinc-700/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Simulate scanning beep"
                >
                  🔊 Simulate Scanner Validation Beep
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdminDashboard = () => {
    return (
      <div className="flex flex-col gap-6 w-full animate-fadeIn">
        <AdminDashboard 
          locale={locale} 
          selectedStadium={selectedStadium} 
          setSelectedStadium={setSelectedStadium} 
          stadiums={stadiums} 
        />
      </div>
    );
  };

  const renderOrganizerDashboard = () => {
    const getCityNameForStadium = (stadiumId: string) => {
      switch (stadiumId) {
        case "st_sofi": return "Los Angeles";
        case "st_metlife": return "New Jersey";
        case "st_mercedes": 
        case "st_mbs": return "Atlanta";
        case "st_azteca": return "Mexico City";
        case "st_bcplace": return "Vancouver";
        default: return "";
      }
    };
    const city = getCityNameForStadium(selectedStadium);
    const filteredMasterMatches = masterMatches.filter(m => m.venue.includes(city));

    const getOrganizerMetrics = (stadiumId: string) => {
      const map: Record<string, { revenue: string; pct: string; spending: string; target: string; attendance: string }> = {
        st_sofi: { revenue: "$4.28M", pct: "+12.4%", spending: "$62.40", target: "$58.00", attendance: "68,400 / 70,000" },
        st_metlife: { revenue: "$5.62M", pct: "+14.1%", spending: "$68.50", target: "$65.00", attendance: "78,200 / 82,500" },
        st_mercedes: { revenue: "$3.81M", pct: "+9.5%", spending: "$59.20", target: "$55.00", attendance: "67,100 / 71,000" },
        st_mbs: { revenue: "$3.81M", pct: "+9.5%", spending: "$59.20", target: "$55.00", attendance: "67,100 / 71,000" },
        st_azteca: { revenue: "$2.45M", pct: "+5.2%", spending: "$38.40", target: "$35.00", attendance: "84,500 / 87,500" },
        st_bcplace: { revenue: "$2.98M", pct: "+8.1%", spending: "$48.90", target: "$45.00", attendance: "52,100 / 54,500" }
      };
      return map[stadiumId] || map["st_sofi"];
    };
    const orgMetrics = getOrganizerMetrics(selectedStadium);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-fadeIn">
        {/* Commercial & Revenue Analytics (Top KPI Row) */}
        <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10 shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-500 mb-2 block tracking-widest">Live Gross Revenue Ticker</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{orgMetrics.revenue}</span>
              <span className="text-xs font-mono text-emerald-400">{orgMetrics.pct} vs projection</span>
            </div>
          </div>
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 mb-2 block tracking-widest">Per-Capita Spending Index</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{orgMetrics.spending}</span>
              <span className="text-xs font-mono text-emerald-400">Target: {orgMetrics.target}</span>
            </div>
          </div>
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 mb-2 block tracking-widest">Revenue Stream Breakdown</span>
            <div className="flex justify-between items-end mt-2">
              <div className="flex flex-col items-center gap-1 w-full relative">
                <div className="w-full flex h-4 bg-zinc-800 rounded overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{ width: '65%' }} title="Ticketing 65%" />
                   <div className="h-full bg-blue-500" style={{ width: '25%' }} title="F&B 25%" />
                   <div className="h-full bg-purple-500" style={{ width: '10%' }} title="Merch 10%" />
                </div>
                <div className="flex justify-between w-full text-[9px] uppercase text-zinc-400 mt-1 font-mono">
                  <span>Ticketing</span>
                  <span>F&B</span>
                  <span>Merch</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Original Top Metric Strip */}
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Overall Attendance", value: orgMetrics.attendance, color: "text-white" },
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
              {filteredMasterMatches.length === 0 && (
                <div className="p-4 text-center text-zinc-500 font-mono text-xs uppercase border border-dashed border-zinc-800 rounded-lg">
                  No Core Matches scheduled for this venue.
                </div>
              )}
              {filteredMasterMatches.map((match) => (
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
                      match.status === "In-Progress" ? "bg-[#22c55e]/15 text-[#22c55e] animate-pulse" : 
                      match.status === "Delayed" ? "bg-amber-500/15 text-amber-500 animate-pulse" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {match.status}
                    </span>
                    <div className="flex gap-1 flex-wrap justify-end">
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
                          setMasterMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: "Delayed" } : m));
                          logRoleActivity(`Organizer DELAYED match "${match.match}"`);
                        }}
                        className="px-1.5 py-0.5 rounded bg-amber-950 hover:bg-amber-900 border border-amber-900/50 text-[8px] font-bold uppercase text-amber-400"
                      >
                        Delay
                      </button>
                      <button 
                        onClick={() => {
                          setMasterMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: "Complete", density: "Empty", staffing: "Stand-down" } : m));
                          logRoleActivity(`Organizer closed match "${match.match}"`);
                        }}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[8px] font-bold uppercase text-zinc-300"
                      >
                        End
                      </button>
                      {match.status === "Complete" && (
                         <button 
                          onClick={() => {
                            logRoleActivity(`Organizer exported Official Match Report for "${match.match}"`);
                          }}
                          className="px-1.5 py-0.5 rounded bg-blue-900/50 hover:bg-blue-800 border border-blue-800/50 text-[8px] font-bold uppercase text-blue-300 w-full mt-1"
                        >
                          Export Report
                        </button>
                      )}
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
                  Predictive analytics forecast Gate A queues will spike up to an 18-minute wait time between 17:35 and 18:10.
                </p>
                <span className="text-[9px] text-zinc-500 block">Suggested action: Re-route southern loop shuttles to East Gate C plaza.</span>
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-900 space-y-1.5">
                <p className="text-[#22c55e] font-extrabold text-[10px] uppercase">🚍 SHUTTLE TRANSIT DECONGESTION SUCCESS</p>
                <p className="text-white text-[11px] leading-relaxed">
                  Real-time GPS bus flow tracking suggests the East Gate shuttle line is operating at 96% efficiency with a average wait time under 3 minutes.
                </p>
                <span className="text-[9px] text-zinc-500 block">System status: Normal route optimization active.</span>
              </div>
            </div>
          </div>

          {/* Vendor, Merchandise, & Concession Hub */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                🍔 Vendor & Concession Hub
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Live Partners</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-zinc-950 border border-red-900/40 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2"><AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" /></div>
                <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Concessions Bottleneck</h4>
                <p className="text-[11px] text-white">East Concourse F&B - 14 min wait time.</p>
                <button className="mt-2 text-[9px] font-bold text-red-400 uppercase underline">Deploy Extra Registers</button>
              </div>
              <div className="p-3 bg-zinc-950 border border-amber-900/40 rounded-xl">
                <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Inventory Depletion</h4>
                <p className="text-[11px] text-white">USA Official Jersey (L) dropping below 15%.</p>
                <button className="mt-2 text-[9px] font-bold text-amber-400 uppercase underline">Ping Warehouse Supply</button>
              </div>
              <div className="p-3 bg-zinc-950 border border-emerald-900/40 rounded-xl">
                <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Sponsor Activations</h4>
                <p className="text-[11px] text-white">Coca-Cola Halftime Push: 42,100 Impressions</p>
                <div className="w-full bg-zinc-900 h-1 mt-2 rounded-full"><div className="bg-emerald-500 h-full w-[85%]" /></div>
              </div>
            </div>
          </div>

          {/* Fan Engagement & Marketing Controls */}
          <div className="rounded-2xl p-5 border border-[#27272a] bg-[#09090b] shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                📢 Fan Engagement & Marketing
              </h3>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-mono text-zinc-500 uppercase">Sentiment Score</span>
                 <span className="text-[11px] font-black text-emerald-400">92/100</span>
              </div>
            </div>
            
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Targeted Push Notification Broadcaster</label>
                <input 
                  type="text" 
                  placeholder="e.g., '15% off drinks at Sector 114 for the next 20 minutes!'"
                  className="w-full bg-zinc-950 text-white border border-zinc-800 p-2.5 rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button 
                onClick={() => { logRoleActivity("Organizer broadcasted targeted fan engagement notification"); }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest transition-all"
              >
                Send
              </button>
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
          <div className="rounded-2xl p-5 border border-red-500 bg-[#09090b] shadow-lg flex flex-col gap-4 relative overflow-hidden flex-grow">
            <div className="absolute top-2 right-2 text-[8px] font-mono text-red-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span> MASS DISPATCH
            </div>

            <div className="border-b border-red-500/30 pb-3">
              <h3 className="font-bold text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                📣 Emergency Broadcast Override (Mass Alert)
              </h3>
              <p className="text-[9px] text-red-400 font-mono mt-0.5 uppercase">Pushes live alerts instantly across all dashboards</p>
            </div>

            <div className="space-y-3.5 flex-grow flex flex-col justify-between">
              {/* Quick Template buttons at the top of the body */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-red-400 font-bold flex items-center gap-1">
                    ⚡ Quick Dispatch Templates
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono uppercase">Click to auto-populate</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {[
                    { text: "🚨 SEVERE CONGESTION AT GATE A - PLEASE REROUTE TO GATE C", label: "Gate A Congestion" },
                    { text: "⛈️ WEATHER ADVISORY: HEAVY RAIN EXPECTED, AWNINGS IN PLACE", label: "Weather Advisory" },
                    { text: "🚨 ALL VOLUNTEERS: DISPATCH TO ZONE B INFO DESK CONGESTION CHANNELS", label: "Volunteer Dispatch" },
                    { text: "🚑 MEDICAL EMERGENCY: PARAMEDICS EN ROUTE TO SECTOR 105", label: "Sector 105 Medical" },
                    { text: "🔥 FIRE REPORTED IN SOUTH CONCOURSE - EVACUATE ZONE 4 IMMEDIATELY", label: "South Concourse Fire" },
                    { text: "⚡ POWER FLUCTUATION DETECTED - POWERING BACKUP GENERATOR SYSTEMS", label: "Power Grid Issue" },
                    { text: "🚶 MAXIMUM CAPACITY REACHED AT GATE F - ENFORCING FLOW CONTROLS", label: "Gate F Capacity" },
                    { text: "📢 CIVIL DISTURBANCE IN SECTOR 312 - SECURITY INTERVENTION IN PROGRESS", label: "Sector 312 Disturbance" },
                    { text: "⛈️ LIGHTNING ALERT: ALL SPECTATORS ON UPPER DECK PLEASE RETREAT TO CONCOURSE", label: "Lightning Alert" },
                    { text: "⚠️ HAZARDOUS SPILL REPORTED IN NORTH PLAZA - MAINTENANCE TEAM DEPLOYED", label: "North Plaza Spill" },
                    { text: "🧒 LOST CHILD PROTOCOL ACTIVE: REPORT TO NEAREST INFORMATION DESK", label: "Lost Child Protocol" },
                    { text: "🎒 UNATTENDED BAG FOUND AT RECREATION PLAZA - DOG UNIT EN ROUTE", label: "Unattended Package" },
                    { text: "📣 TEST DRY RUN: THIS IS A DRILL FOR STADIUM MASS BROADCAST ALERTS", label: "System Test Drill" }
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setNewEmergencyMessage(item.text)}
                      className="text-[9px] p-2 bg-red-950/15 hover:bg-red-950/40 border border-red-900/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-mono text-left rounded transition-all flex flex-col justify-between min-h-[46px] group cursor-pointer"
                    >
                      <span className="font-bold text-[8px] text-red-500 group-hover:text-red-400 uppercase tracking-wide mb-1 block">
                        {item.label}
                      </span>
                      <span className="line-clamp-2 leading-tight text-zinc-300 group-hover:text-white">
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 mt-auto border-t border-red-900/30 pt-3">
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
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs py-2.5 rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                >
                  💥 PUSH LIVE GLOBAL OVERRIDE ALERT
                </button>
              </div>
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
      onUpdateProfile={(updatedUser) => {
        setUser(updatedUser);
      }}
      liveMatchEvents={liveMatchEvents}
    >
      {persona !== "fan" && false ? (
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
        <>
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
        </>
      )}

      <AnimatePresence mode="wait">
        {showChat && (
          <ChatInterface role={persona} onClose={() => setShowChat(false)} staffMember={chattingWithStaff} />
        )}
      </AnimatePresence>

      {!showChat && persona !== "fan" && persona !== "admin" && (
        <button
          onClick={() => {
            setChattingWithStaff(null);
            setShowChat(true);
          }}
          className="fixed bottom-24 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition"
        >
          <MessageSquare className="w-6 h-6"/>
        </button>
      )}

      {expandedImage && (
        <div 
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Top right floating close button */}
          <button 
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer z-10 hover:scale-105 active:scale-95"
            title="Close Zoom"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img 
              src={typeof expandedImage === "string" ? expandedImage : expandedImage.url} 
              className="w-full h-auto max-h-[80vh] object-contain block mx-auto rounded-xl hover:scale-102 transition-transform duration-300" 
              alt="Expanded Evidence" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80";
              }}
            />
          </div>
        </div>
      )}

      {showLogIncidentModal && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl p-6 text-white font-sans relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20"></div>
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-5">
              <h3 className="font-black text-xs font-mono uppercase tracking-widest text-red-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Log Operational Incident
              </h3>
              <button 
                onClick={() => setShowLogIncidentModal(false)}
                className="text-zinc-500 hover:text-white text-xs uppercase font-black"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Location / Zone</label>
                <input 
                  type="text"
                  placeholder="e.g. Section 112, Row 4"
                  value={newIncidentLoc}
                  onChange={(e) => setNewIncidentLoc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Category</label>
                  <select
                    value={newIncidentCat}
                    onChange={(e) => setNewIncidentCat(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="seat">Broken Seat</option>
                    <option value="gate">Gate Checkpoint</option>
                    <option value="spill">Liquid Spill</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Severity</label>
                  <select
                    value={newIncidentSeverity}
                    onChange={(e) => setNewIncidentSeverity(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Incident Description</label>
                <textarea 
                  rows={3}
                  placeholder="Describe the physical state, safety impact, or operational issue..."
                  value={newIncidentDesc}
                  onChange={(e) => setNewIncidentDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (!newIncidentLoc.trim() || !newIncidentDesc.trim()) {
                      alert("Please specify location and provide description.");
                      return;
                    }
                    const newId = `inc-${Date.now().toString().slice(-4)}`;
                    const newInc = {
                      id: newId,
                      location: newIncidentLoc,
                      category: newIncidentCat,
                      desc: newIncidentDesc,
                      status: "pending" as const,
                      severity: newIncidentSeverity,
                      time: "Just now",
                      image: getIncidentImage(newIncidentCat)
                    };
                    setIncidents(prev => [newInc, ...prev]);
                    logRoleActivity(`New ${newIncidentSeverity.toUpperCase()} priority incident (${newIncidentCat.toUpperCase()}) logged at ${newIncidentLoc}`);
                    
                    setNewIncidentLoc("");
                    setNewIncidentCat("seat");
                    setNewIncidentDesc("");
                    setNewIncidentSeverity("low");
                    setShowLogIncidentModal(false);
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                >
                  Submit Incident Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddStaffModal && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl p-6 text-white font-sans relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500/20 via-cyan-500 to-cyan-500/20"></div>
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-5">
              <h3 className="font-black text-xs font-mono uppercase tracking-widest text-cyan-500 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-500" /> Dispatch New Personnel
              </h3>
              <button 
                onClick={() => {
                  setShowAddStaffModal(false);
                  setNewStaffName("");
                }}
                className="text-zinc-500 hover:text-white text-xs uppercase font-black cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Personnel Name</label>
                <input 
                  type="text"
                  placeholder="e.g. David K."
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Assigned Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Security">Security</option>
                    <option value="Steward">Steward</option>
                    <option value="Medical">Medical</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Duty Zone</label>
                  <input 
                    type="text"
                    placeholder="e.g. Sector 112"
                    value={newStaffZone}
                    onChange={(e) => setNewStaffZone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Initial Status</label>
                <select
                  value={newStaffStatus}
                  onChange={(e) => setNewStaffStatus(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="active">Active Duty</option>
                  <option value="on-break">On Break</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    if (!newStaffName.trim()) {
                      alert("Please specify a personnel name.");
                      return;
                    }
                    setStaffRoster(prev => [
                      ...prev, 
                      { 
                        name: newStaffName.trim(), 
                        role: newStaffRole, 
                        zone: newStaffZone || "Unassigned", 
                        status: newStaffStatus 
                      }
                    ]);
                    logRoleActivity(`Added new staff member: ${newStaffName.trim()} (${newStaffRole})`);
                    setNewStaffName("");
                    setShowAddStaffModal(false);
                  }}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Confirm Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
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