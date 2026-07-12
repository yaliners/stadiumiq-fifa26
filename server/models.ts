export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: number;
  lat: number;
  lng: number;
}

export interface Match {
  id: string;
  stage: string;
  home_team: string;
  away_team: string;
  datetime_utc: string;
  stadium_id: string;
  status: string;
}

export interface Gate {
  id: string;
  stadium_id: string;
  name: string;
  lat: number;
  lng: number;
  current_density: number;
}

export interface Facility {
  id: string;
  stadium_id: string;
  type: string; // "restroom", "wheelchair", "food", "first_aid"
  description: string;
  lat: number;
  lng: number;
}

export interface Alert {
  id: string;
  stadium_id: string;
  type: string;
  message: string;
  starts_at: string;
  ends_at: string;
  severity: "low" | "medium" | "high";
}
