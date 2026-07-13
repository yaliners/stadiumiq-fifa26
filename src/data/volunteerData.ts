export interface VolunteerStadiumDetail {
  venueName: string;
  shiftHours: string;
  distance: number;
  stationName: string;
  stationLoc: string;
  captain: string;
  contactChannel: string;
  contactFreq: string;
  duties: string;
  perksMilestone: string;
  perksPercent: string;
  perksHours: number;
  barcodeId: string;
  gateName: string;
  gatePct: string;
  gateColor: string;
  sosTriggers: { label: string; category: "seat" | "spill" | "gate" | "other"; desc: string }[];
  congestionAlert: string;
  heatmapMessage: string;
}

export const volunteerDetailsMap: Record<string, VolunteerStadiumDetail> = {
  st_sofi: {
    venueName: "SoFi Stadium (LA)",
    shiftHours: "08:00 AM - 04:00 PM",
    distance: 0.2,
    stationName: "Station B",
    stationLoc: "Information Desk B (North Plaza - Sec 112)",
    captain: "Jane Doe",
    contactChannel: "Ch. 12 (Sector B)",
    contactFreq: "462.562 MHz",
    duties: "Distribute sensory kits, assist ticket scanning, provide wayfinding support to Gate C.",
    perksMilestone: "Bronze Steward Badge",
    perksPercent: "72.5%",
    perksHours: 14.5,
    barcodeId: "VOL-2026-9921",
    gateName: "Gate B",
    gatePct: "88%",
    gateColor: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]",
    sosTriggers: [
      { label: "🚑 Medical", category: "other", desc: "Medical assistance needed at Section 112 Info Desk" },
      { label: "⚠️ Spill Hazard", category: "spill", desc: "Slippery spill hazard reported near Station B" },
      { label: "👤 Fan Conflict", category: "other", desc: "Aggressive fan behavior near Section 112" },
      { label: "🛑 Gate Block", category: "gate", desc: "Gate bottleneck congestion spike at checkpoint" }
    ],
    congestionAlert: "GATE B BOTTLENECK",
    heatmapMessage: "Gate B approach corridor has a 35% congestion surge. Redirect entry traffic to Gate A/C."
  },
  st_metlife: {
    venueName: "MetLife Stadium (NY/NJ)",
    shiftHours: "09:00 AM - 05:00 PM",
    distance: 0.5,
    stationName: "Station A",
    stationLoc: "West Gate Welcome Center (Sec 140)",
    captain: "Marcus Vance",
    contactChannel: "Ch. 5 (West Entry)",
    contactFreq: "467.562 MHz",
    duties: "Direct VIP arrivals, distribute matchday guides, assist stroller and wheelchair check-in.",
    perksMilestone: "Silver Ambassador Badge",
    perksPercent: "85.0%",
    perksHours: 17.0,
    barcodeId: "VOL-2026-8842",
    gateName: "Gate A",
    gatePct: "92%",
    gateColor: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]",
    sosTriggers: [
      { label: "🚑 Medical", category: "other", desc: "Medical support required at West Gate Welcome Center" },
      { label: "⚠️ Spill Hazard", category: "spill", desc: "Slippery floor near Sec 140 elevator" },
      { label: "👤 Fan Conflict", category: "other", desc: "Verbal dispute in VIP queue Sec 140" },
      { label: "🛑 Gate Block", category: "gate", desc: "West Entry Gate A turnstile line 4 sensor failure" }
    ],
    congestionAlert: "GATE A BOTTLE-NECK",
    heatmapMessage: "Gate A VIP queue has an unexpected sensor disconnect. Direct attendees to side ticket desks."
  },
  st_mercedes: {
    venueName: "Mercedes-Benz Stadium (ATL)",
    shiftHours: "10:00 AM - 06:00 PM",
    distance: 0.1,
    stationName: "Station C",
    stationLoc: "Family Zone Play Area (Sec 224)",
    captain: "Sarah Jenkins",
    contactChannel: "Ch. 8 (Level 2)",
    contactFreq: "464.125 MHz",
    duties: "Supervise fan interactive games, manage toddler quiet zone capacity, and log safety incidents.",
    perksMilestone: "Youth Liaison Badge",
    perksPercent: "45.0%",
    perksHours: 9.0,
    barcodeId: "VOL-2026-7731",
    gateName: "Gate C",
    gatePct: "55%",
    gateColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
    sosTriggers: [
      { label: "🚑 Medical", category: "other", desc: "Minor injury at Family Zone play structure" },
      { label: "⚠️ Spill Hazard", category: "spill", desc: "Soda spill in Family Zone seating path" },
      { label: "👤 Fan Conflict", category: "other", desc: "Disruptive behaviour near Sec 224" },
      { label: "🛑 Gate Block", category: "gate", desc: "High congestion at elevator lobby Sec 224" }
    ],
    congestionAlert: "ZONE C CROWDED",
    heatmapMessage: "Family Zone Play Area approach has high stroller traffic. Manage elevator flow strictly."
  },
  st_azteca: {
    venueName: "Estadio Azteca (MEX)",
    shiftHours: "12:00 PM - 08:00 PM",
    distance: 0.8,
    stationName: "Station D",
    stationLoc: "East Tunnel Media Hub (Gate 1)",
    captain: "Carlos Ruiz",
    contactChannel: "Ch. 3 (Media Ops)",
    contactFreq: "469.325 MHz",
    duties: "Check press credentials, coordinate pitchside photographer access, escort broadcast crews.",
    perksMilestone: "Press Lead Badge",
    perksPercent: "60.0%",
    perksHours: 12.0,
    barcodeId: "VOL-2026-6649",
    gateName: "Gate D",
    gatePct: "28%",
    gateColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    sosTriggers: [
      { label: "🚑 Medical", category: "other", desc: "Heat fatigue reported near Gate 1 tunnel" },
      { label: "⚠️ Spill Hazard", category: "spill", desc: "Water leak in press hospitality corridor" },
      { label: "👤 Fan Conflict", category: "other", desc: "Unaccredited fan attempting tunnel access" },
      { label: "🛑 Gate Block", category: "gate", desc: "Media entry vehicle blockade at Gate 1" }
    ],
    congestionAlert: "TUNNEL 1 BUSY",
    heatmapMessage: "Tunnel 1 press zone is busy with broadcast crews. Keep pathways clear for player walkout."
  },
  st_bcplace: {
    venueName: "BC Place (VAN)",
    shiftHours: "07:30 AM - 03:30 PM",
    distance: 0.4,
    stationName: "Station E",
    stationLoc: "South Plaza Ticketing Checkpoint",
    captain: "Fiona Gallagher",
    contactChannel: "Ch. 10 (Access Control)",
    contactFreq: "461.225 MHz",
    duties: "Validate mobile tickets, resolve barcode scanning issues, redirect bag-check policy violators.",
    perksMilestone: "Access Champion Badge",
    perksPercent: "95.0%",
    perksHours: 19.0,
    barcodeId: "VOL-2026-5512",
    gateName: "Gate C",
    gatePct: "61%",
    gateColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
    sosTriggers: [
      { label: "🚑 Medical", category: "other", desc: "Fainting in South Ticketing queue" },
      { label: "⚠️ Spill Hazard", category: "spill", desc: "Ice/slush spill near ticketing gate" },
      { label: "👤 Fan Conflict", category: "other", desc: "Dispute over stadium bag policy" },
      { label: "🛑 Gate Block", category: "gate", desc: "Ticket scanner server connectivity drop" }
    ],
    congestionAlert: "SOUTH GATE SLOW",
    heatmapMessage: "South Plaza Ticket Validation queues experiencing high density. Open overflow lanes 8 & 9."
  }
};
