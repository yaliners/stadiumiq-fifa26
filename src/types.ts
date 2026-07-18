export interface StadiumData {
  id: string;
  name: string;
  city: string;
  capacity: number;
  lat: number;
  lng: number;
}

export interface MatchData {
  id: string;
  stage: string;
  home_team: string;
  away_team: string;
  datetime_utc: string;
  stadium_id: string;
  status: string;
  stadium_name?: string;
  stadium_city?: string;
}

export interface GateData {
  id: string;
  stadium_id: string;
  name: string;
  lat: number;
  lng: number;
  current_density: number;
}

export interface FacilityData {
  id: string;
  stadium_id: string;
  type: "restroom" | "wheelchair" | "food" | "first_aid";
  description: string;
  lat: number;
  lng: number;
}

export interface AlertData {
  id: string;
  stadium_id: string;
  type: string;
  message: string;
  starts_at: string;
  ends_at: string;
  severity: "low" | "medium" | "high";
}

export interface Message {
  id: string;
  sender: "user" | "stadiumiq";
  text: string;
  confidence?: "grounded" | "uncertain" | "general_knowledge";
  source_type?: "decision_engine" | "gemini" | "fallback" | "timeout";
  model_tier?: string;
  isError?: boolean;
  timestamp?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  author?: string;
  timestamp: string | number | Date | object;
}

export interface MapFeature {
  type: string;
  id: string;
  name: string;
  status: string;
  density?: number;
  info: string;
  color: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  zone: string;
  status: "active" | "on-break" | "dispatched" | "offline";
  coordinates: [number, number];
  phone?: string;
  lastActive?: string;
}

export interface LiveMatchData {
  score: string;
  minute: number;
  home: string;
  away: string;
  status: string;
  matchName: string;
}
