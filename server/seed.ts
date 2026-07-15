import fs from "fs";

export async function seedDatabase(db: any): Promise<void> {
  console.log("[Seeder] Seeding database: stadium_ops...");

  // 1. Drop Tables to apply schema updates cleanly
  db.run("DROP TABLE IF EXISTS alerts");
  db.run("DROP TABLE IF EXISTS facilities");
  db.run("DROP TABLE IF EXISTS gates");
  db.run("DROP TABLE IF EXISTS matches");
  db.run("DROP TABLE IF EXISTS stadiums");
  db.run("DROP TABLE IF EXISTS RoleSession");
  db.run("DROP TABLE IF EXISTS chat_logs");

  // 2. Create Tables
  db.run(`
    CREATE TABLE IF NOT EXISTS stadiums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      stage TEXT NOT NULL,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      datetime_utc TEXT NOT NULL,
      stadium_id TEXT NOT NULL,
      status TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      FOREIGN KEY(stadium_id) REFERENCES stadiums(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS gates (
      id TEXT PRIMARY KEY,
      stadium_id TEXT NOT NULL,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      current_density INTEGER NOT NULL,
      FOREIGN KEY(stadium_id) REFERENCES stadiums(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      stadium_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      FOREIGN KEY(stadium_id) REFERENCES stadiums(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      stadium_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      severity TEXT NOT NULL,
      FOREIGN KEY(stadium_id) REFERENCES stadiums(id)
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS RoleSession (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      token TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  console.log("Tables created fresh.");

  // 2. Insert Stadiums (All 16 World Cup 2026 Host Stadiums)
  const stadiums = [
    { id: "st_azteca", name: "Estadio Azteca", city: "Mexico City", capacity: 87523, lat: 19.3029, lng: -99.1505 },
    { id: "st_akron", name: "Estadio Akron", city: "Guadalajara", capacity: 48071, lat: 20.6811, lng: -103.4628 },
    { id: "st_bmo", name: "BMO Field", city: "Toronto", capacity: 30000, lat: 43.6328, lng: -79.4186 },
    { id: "st_sofi", name: "SoFi Stadium", city: "Los Angeles", capacity: 70240, lat: 33.9534, lng: -118.3387 },
    { id: "st_levis", name: "Levi's Stadium", city: "Santa Clara", capacity: 68500, lat: 37.4033, lng: -121.9694 },
    { id: "st_metlife", name: "MetLife Stadium", city: "East Rutherford", capacity: 82500, lat: 40.8135, lng: -74.0744 },
    { id: "st_gillette", name: "Gillette Stadium", city: "Foxborough", capacity: 65878, lat: 42.0909, lng: -71.2643 },
    { id: "st_bcplace", name: "BC Place", city: "Vancouver", capacity: 54500, lat: 49.2768, lng: -123.1120 },
    { id: "st_nrg", name: "NRG Stadium", city: "Houston", capacity: 72220, lat: 29.6847, lng: -95.4107 },
    { id: "st_att", name: "AT&T Stadium", city: "Arlington", capacity: 80000, lat: 32.7473, lng: -97.0945 },
    { id: "st_lincoln", name: "Lincoln Financial Field", city: "Philadelphia", capacity: 69796, lat: 39.9008, lng: -75.1675 },
    { id: "st_bbva", name: "Estadio BBVA Bancomer", city: "Monterrey", capacity: 53500, lat: 25.6691, lng: -100.2447 },
    { id: "st_mbs", name: "Mercedes-Benz Stadium", city: "Atlanta", capacity: 71000, lat: 33.7553, lng: -84.4010 },
    { id: "st_lumen", name: "Lumen Field", city: "Seattle", capacity: 69000, lat: 47.5952, lng: -122.3316 },
    { id: "st_hardrock", name: "Hard Rock Stadium", city: "Miami", capacity: 64767, lat: 25.9581, lng: -80.2389 },
    { id: "st_arrowhead", name: "Arrowhead Stadium", city: "Kansas City", capacity: 76416, lat: 39.0489, lng: -94.4839 }
  ];

  for (const s of stadiums) {
    db.run(
      "INSERT INTO stadiums (id, name, city, capacity, lat, lng) VALUES (?, ?, ?, ?, ?, ?)",
      [s.id, s.name, s.city, s.capacity, s.lat, s.lng]
    );
  }
  console.log(`Seeded ${stadiums.length} stadiums.`);

  // 3. Insert Matches
  const matches = [
    { id: "m_1", stage: "Group Stage", home_team: "Mexico", away_team: "South Africa", datetime_utc: "2026-06-11T19:00:00Z", stadium_id: "st_azteca", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_2", stage: "Group Stage", home_team: "South Korea", away_team: "Czechia", datetime_utc: "2026-06-12T02:00:00Z", stadium_id: "st_akron", status: "completed", home_score: 1, away_score: 1 },
    { id: "m_3", stage: "Group Stage", home_team: "Canada", away_team: "Bosnia and Herzegovina", datetime_utc: "2026-06-12T19:00:00Z", stadium_id: "st_bmo", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_4", stage: "Group Stage", home_team: "United States", away_team: "Paraguay", datetime_utc: "2026-06-13T01:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 3, away_score: 1 },
    { id: "m_5", stage: "Group Stage", home_team: "Qatar", away_team: "Switzerland", datetime_utc: "2026-06-13T19:00:00Z", stadium_id: "st_levis", status: "completed", home_score: 0, away_score: 2 },
    { id: "m_6", stage: "Group Stage", home_team: "Brazil", away_team: "Morocco", datetime_utc: "2026-06-13T22:00:00Z", stadium_id: "st_metlife", status: "completed", home_score: 2, away_score: 2 },
    { id: "m_7", stage: "Group Stage", home_team: "Haiti", away_team: "Scotland", datetime_utc: "2026-06-14T01:00:00Z", stadium_id: "st_gillette", status: "completed", home_score: 1, away_score: 3 },
    { id: "m_8", stage: "Group Stage", home_team: "Australia", away_team: "Türkiye", datetime_utc: "2026-06-14T04:00:00Z", stadium_id: "st_bcplace", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_9", stage: "Group Stage", home_team: "Germany", away_team: "Curacao", datetime_utc: "2026-06-14T17:00:00Z", stadium_id: "st_nrg", status: "completed", home_score: 4, away_score: 0 },
    { id: "m_10", stage: "Group Stage", home_team: "Netherlands", away_team: "Japan", datetime_utc: "2026-06-14T20:00:00Z", stadium_id: "st_att", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_11", stage: "Group Stage", home_team: "Ivory Coast", away_team: "Ecuador", datetime_utc: "2026-06-14T23:00:00Z", stadium_id: "st_lincoln", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_12", stage: "Group Stage", home_team: "Sweden", away_team: "Tunisia", datetime_utc: "2026-06-15T02:00:00Z", stadium_id: "st_bbva", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_13", stage: "Group Stage", home_team: "Spain", away_team: "Cape Verde", datetime_utc: "2026-06-15T16:00:00Z", stadium_id: "st_mbs", status: "completed", home_score: 3, away_score: 0 },
    { id: "m_14", stage: "Group Stage", home_team: "Belgium", away_team: "Egypt", datetime_utc: "2026-06-15T19:00:00Z", stadium_id: "st_lumen", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_15", stage: "Group Stage", home_team: "Saudi Arabia", away_team: "Uruguay", datetime_utc: "2026-06-15T22:00:00Z", stadium_id: "st_hardrock", status: "completed", home_score: 1, away_score: 3 },
    { id: "m_16", stage: "Group Stage", home_team: "Iran", away_team: "New Zealand", datetime_utc: "2026-06-16T01:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_17", stage: "Group Stage", home_team: "France", away_team: "Senegal", datetime_utc: "2026-06-16T19:00:00Z", stadium_id: "st_metlife", status: "completed", home_score: 1, away_score: 0 },
    { id: "m_18", stage: "Group Stage", home_team: "Iraq", away_team: "Norway", datetime_utc: "2026-06-16T22:00:00Z", stadium_id: "st_gillette", status: "completed", home_score: 0, away_score: 2 },
    { id: "m_19", stage: "Group Stage", home_team: "Argentina", away_team: "Algeria", datetime_utc: "2026-06-17T01:00:00Z", stadium_id: "st_arrowhead", status: "completed", home_score: 3, away_score: 0 },
    { id: "m_20", stage: "Group Stage", home_team: "Austria", away_team: "Jordan", datetime_utc: "2026-06-17T04:00:00Z", stadium_id: "st_levis", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_21", stage: "Group Stage", home_team: "Portugal", away_team: "Congo DR", datetime_utc: "2026-06-17T17:00:00Z", stadium_id: "st_nrg", status: "completed", home_score: 4, away_score: 1 },
    { id: "m_22", stage: "Group Stage", home_team: "England", away_team: "Croatia", datetime_utc: "2026-06-17T20:00:00Z", stadium_id: "st_att", status: "completed", home_score: 1, away_score: 1 },
    { id: "m_23", stage: "Group Stage", home_team: "Ghana", away_team: "Panama", datetime_utc: "2026-06-17T23:00:00Z", stadium_id: "st_bmo", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_24", stage: "Group Stage", home_team: "Uzbekistan", away_team: "Colombia", datetime_utc: "2026-06-18T02:00:00Z", stadium_id: "st_azteca", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_25", stage: "Group Stage", home_team: "Czechia", away_team: "South Africa", datetime_utc: "2026-06-18T16:00:00Z", stadium_id: "st_mbs", status: "completed", home_score: 1, away_score: 1 },
    { id: "m_26", stage: "Group Stage", home_team: "Switzerland", away_team: "Bosnia and Herzegovina", datetime_utc: "2026-06-18T19:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_27", stage: "Group Stage", home_team: "Canada", away_team: "Qatar", datetime_utc: "2026-06-18T22:00:00Z", stadium_id: "st_bcplace", status: "completed", home_score: 3, away_score: 1 },
    { id: "m_28", stage: "Group Stage", home_team: "Mexico", away_team: "South Korea", datetime_utc: "2026-06-19T01:00:00Z", stadium_id: "st_akron", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_29", stage: "Group Stage", home_team: "United States", away_team: "Australia", datetime_utc: "2026-06-19T19:00:00Z", stadium_id: "st_lumen", status: "completed", home_score: 2, away_score: 2 },
    { id: "m_30", stage: "Group Stage", home_team: "Scotland", away_team: "Morocco", datetime_utc: "2026-06-19T22:00:00Z", stadium_id: "st_gillette", status: "completed", home_score: 1, away_score: 1 },
    { id: "m_31", stage: "Group Stage", home_team: "Brazil", away_team: "Haiti", datetime_utc: "2026-06-20T00:30:00Z", stadium_id: "st_lincoln", status: "completed", home_score: 5, away_score: 0 },
    { id: "m_32", stage: "Group Stage", home_team: "Türkiye", away_team: "Paraguay", datetime_utc: "2026-06-20T03:00:00Z", stadium_id: "st_levis", status: "completed", home_score: 1, away_score: 0 },
    { id: "m_33", stage: "Group Stage", home_team: "Netherlands", away_team: "Sweden", datetime_utc: "2026-06-20T17:00:00Z", stadium_id: "st_nrg", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_34", stage: "Group Stage", home_team: "Germany", away_team: "Ivory Coast", datetime_utc: "2026-06-20T20:00:00Z", stadium_id: "st_bmo", status: "completed", home_score: 3, away_score: 1 },
    { id: "m_35", stage: "Group Stage", home_team: "Ecuador", away_team: "Curacao", datetime_utc: "2026-06-21T00:00:00Z", stadium_id: "st_arrowhead", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_36", stage: "Group Stage", home_team: "Tunisia", away_team: "Japan", datetime_utc: "2026-06-21T04:00:00Z", stadium_id: "st_bbva", status: "completed", home_score: 0, away_score: 1 },
    { id: "m_37", stage: "Group Stage", home_team: "Spain", away_team: "Saudi Arabia", datetime_utc: "2026-06-21T16:00:00Z", stadium_id: "st_mbs", status: "completed", home_score: 4, away_score: 0 },
    { id: "m_38", stage: "Group Stage", home_team: "Belgium", away_team: "Iran", datetime_utc: "2026-06-21T19:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 3, away_score: 1 },
    { id: "m_39", stage: "Group Stage", home_team: "Uruguay", away_team: "Cape Verde", datetime_utc: "2026-06-21T22:00:00Z", stadium_id: "st_hardrock", status: "completed", home_score: 3, away_score: 0 },
    { id: "m_40", stage: "Group Stage", home_team: "New Zealand", away_team: "Egypt", datetime_utc: "2026-06-22T01:00:00Z", stadium_id: "st_bcplace", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_41", stage: "Group Stage", home_team: "Argentina", away_team: "Austria", datetime_utc: "2026-06-22T17:00:00Z", stadium_id: "st_att", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_42", stage: "Group Stage", home_team: "France", away_team: "Iraq", datetime_utc: "2026-06-22T21:00:00Z", stadium_id: "st_lincoln", status: "completed", home_score: 3, away_score: 0 },
    { id: "m_43", stage: "Group Stage", home_team: "Norway", away_team: "Senegal", datetime_utc: "2026-06-23T00:00:00Z", stadium_id: "st_metlife", status: "completed", home_score: 1, away_score: 1 },
    { id: "m_44", stage: "Group Stage", home_team: "Jordan", away_team: "Algeria", datetime_utc: "2026-06-23T03:00:00Z", stadium_id: "st_levis", status: "completed", home_score: 0, away_score: 2 },
    { id: "m_45", stage: "Group Stage", home_team: "Portugal", away_team: "Uzbekistan", datetime_utc: "2026-06-23T17:00:00Z", stadium_id: "st_nrg", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_46", stage: "Group Stage", home_team: "England", away_team: "Ghana", datetime_utc: "2026-06-23T20:00:00Z", stadium_id: "st_gillette", status: "completed", home_score: 3, away_score: 1 },
    { id: "m_47", stage: "Group Stage", home_team: "Panama", away_team: "Croatia", datetime_utc: "2026-06-23T23:00:00Z", stadium_id: "st_bmo", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_48", stage: "Group Stage", home_team: "Colombia", away_team: "Congo DR", datetime_utc: "2026-06-24T02:00:00Z", stadium_id: "st_akron", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_49", stage: "Group Stage", home_team: "Switzerland", away_team: "Canada", datetime_utc: "2026-06-24T19:00:00Z", stadium_id: "st_bcplace", status: "completed", home_score: 1, away_score: 1 },
    { id: "m_50", stage: "Group Stage", home_team: "Bosnia and Herzegovina", away_team: "Qatar", datetime_utc: "2026-06-24T19:00:00Z", stadium_id: "st_lumen", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_51", stage: "Group Stage", home_team: "Scotland", away_team: "Brazil", datetime_utc: "2026-06-24T22:00:00Z", stadium_id: "st_hardrock", status: "completed", home_score: 1, away_score: 3 },
    { id: "m_52", stage: "Group Stage", home_team: "Morocco", away_team: "Haiti", datetime_utc: "2026-06-24T22:00:00Z", stadium_id: "st_mbs", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_53", stage: "Group Stage", home_team: "Czechia", away_team: "Mexico", datetime_utc: "2026-06-25T01:00:00Z", stadium_id: "st_azteca", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_54", stage: "Group Stage", home_team: "South Africa", away_team: "South Korea", datetime_utc: "2026-06-25T01:00:00Z", stadium_id: "st_bbva", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_55", stage: "Group Stage", home_team: "Ecuador", away_team: "Germany", datetime_utc: "2026-06-25T20:00:00Z", stadium_id: "st_metlife", status: "completed", home_score: 0, away_score: 2 },
    { id: "m_56", stage: "Group Stage", home_team: "Curacao", away_team: "Ivory Coast", datetime_utc: "2026-06-25T20:00:00Z", stadium_id: "st_lincoln", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_57", stage: "Group Stage", home_team: "Tunisia", away_team: "Netherlands", datetime_utc: "2026-06-25T23:00:00Z", stadium_id: "st_arrowhead", status: "completed", home_score: 0, away_score: 3 },
    { id: "m_58", stage: "Group Stage", home_team: "Japan", away_team: "Sweden", datetime_utc: "2026-06-25T23:00:00Z", stadium_id: "st_att", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_59", stage: "Group Stage", home_team: "Türkiye", away_team: "United States", datetime_utc: "2026-06-26T02:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 2, away_score: 4 },
    { id: "m_60", stage: "Group Stage", home_team: "Paraguay", away_team: "Australia", datetime_utc: "2026-06-26T02:00:00Z", stadium_id: "st_levis", status: "completed", home_score: 1, away_score: 1 },
    { id: "m_61", stage: "Group Stage", home_team: "Norway", away_team: "France", datetime_utc: "2026-06-26T19:00:00Z", stadium_id: "st_gillette", status: "completed", home_score: 0, away_score: 2 },
    { id: "m_62", stage: "Group Stage", home_team: "Senegal", away_team: "Iraq", datetime_utc: "2026-06-26T19:00:00Z", stadium_id: "st_bmo", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_63", stage: "Group Stage", home_team: "Uruguay", away_team: "Spain", datetime_utc: "2026-06-27T00:00:00Z", stadium_id: "st_akron", status: "completed", home_score: 1, away_score: 3 },
    { id: "m_64", stage: "Group Stage", home_team: "Cape Verde", away_team: "Saudi Arabia", datetime_utc: "2026-06-27T00:00:00Z", stadium_id: "st_nrg", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_65", stage: "Group Stage", home_team: "New Zealand", away_team: "Belgium", datetime_utc: "2026-06-27T03:00:00Z", stadium_id: "st_bcplace", status: "completed", home_score: 0, away_score: 4 },
    { id: "m_66", stage: "Group Stage", home_team: "Egypt", away_team: "Iran", datetime_utc: "2026-06-27T03:00:00Z", stadium_id: "st_lumen", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_67", stage: "Group Stage", home_team: "Panama", away_team: "England", datetime_utc: "2026-06-27T21:00:00Z", stadium_id: "st_metlife", status: "completed", home_score: 1, away_score: 5 },
    { id: "m_68", stage: "Group Stage", home_team: "Croatia", away_team: "Ghana", datetime_utc: "2026-06-27T21:00:00Z", stadium_id: "st_lincoln", status: "completed", home_score: 2, away_score: 2 },
    { id: "m_69", stage: "Group Stage", home_team: "Colombia", away_team: "Portugal", datetime_utc: "2026-06-27T23:30:00Z", stadium_id: "st_hardrock", status: "completed", home_score: 1, away_score: 3 },
    { id: "m_70", stage: "Group Stage", home_team: "Congo DR", away_team: "Uzbekistan", datetime_utc: "2026-06-27T23:30:00Z", stadium_id: "st_mbs", status: "completed", home_score: 0, away_score: 2 },
    { id: "m_71", stage: "Group Stage", home_team: "Jordan", away_team: "Argentina", datetime_utc: "2026-06-28T03:00:00Z", stadium_id: "st_att", status: "completed", home_score: 0, away_score: 4 },
    { id: "m_72", stage: "Group Stage", home_team: "Algeria", away_team: "Austria", datetime_utc: "2026-06-28T03:00:00Z", stadium_id: "st_arrowhead", status: "completed", home_score: 1, away_score: 1 },

    // ROUND OF 32
    { id: "m_r32_1", stage: "Round of 32", home_team: "South Africa", away_team: "Canada", datetime_utc: "2026-06-28T19:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r32_2", stage: "Round of 32", home_team: "Brazil", away_team: "Japan", datetime_utc: "2026-06-30T17:00:00Z", stadium_id: "st_nrg", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_r32_3", stage: "Round of 32", home_team: "Germany", away_team: "Paraguay", datetime_utc: "2026-06-29T20:30:00Z", stadium_id: "st_gillette", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r32_4", stage: "Round of 32", home_team: "Netherlands", away_team: "Morocco", datetime_utc: "2026-06-30T01:00:00Z", stadium_id: "st_bbva", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r32_5", stage: "Round of 32", home_team: "Ivory Coast", away_team: "Norway", datetime_utc: "2026-06-30T17:00:00Z", stadium_id: "st_att", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r32_6", stage: "Round of 32", home_team: "France", away_team: "Sweden", datetime_utc: "2026-07-01T21:00:00Z", stadium_id: "st_metlife", status: "completed", home_score: 3, away_score: 2 },
    { id: "m_r32_7", stage: "Round of 32", home_team: "Mexico", away_team: "Ecuador", datetime_utc: "2026-07-01T01:00:00Z", stadium_id: "st_azteca", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_r32_8", stage: "Round of 32", home_team: "England", away_team: "Congo DR", datetime_utc: "2026-07-01T16:00:00Z", stadium_id: "st_mbs", status: "completed", home_score: 3, away_score: 1 },
    { id: "m_r32_9", stage: "Round of 32", home_team: "Belgium", away_team: "Senegal", datetime_utc: "2026-07-02T23:00:00Z", stadium_id: "st_lumen", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_r32_10", stage: "Round of 32", home_team: "United States", away_team: "Bosnia and Herzegovina", datetime_utc: "2026-07-01T20:00:00Z", stadium_id: "st_levis", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_r32_11", stage: "Round of 32", home_team: "Spain", away_team: "Austria", datetime_utc: "2026-07-02T19:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_r32_12", stage: "Round of 32", home_team: "Portugal", away_team: "Croatia", datetime_utc: "2026-07-02T23:00:00Z", stadium_id: "st_bmo", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_r32_13", stage: "Round of 32", home_team: "Switzerland", away_team: "Algeria", datetime_utc: "2026-07-01T23:00:00Z", stadium_id: "st_bcplace", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_r32_14", stage: "Round of 32", home_team: "Australia", away_team: "Egypt", datetime_utc: "2026-07-02T18:00:00Z", stadium_id: "st_att", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r32_15", stage: "Round of 32", home_team: "Argentina", away_team: "Cape Verde", datetime_utc: "2026-07-02T22:00:00Z", stadium_id: "st_hardrock", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_r32_16", stage: "Round of 32", home_team: "Colombia", away_team: "Ghana", datetime_utc: "2026-07-01T23:30:00Z", stadium_id: "st_arrowhead", status: "completed", home_score: 2, away_score: 1 },

    // ROUND OF 16
    { id: "m_r16_1", stage: "Round of 16", home_team: "Canada", away_team: "Morocco", datetime_utc: "2026-07-04T17:00:00Z", stadium_id: "st_nrg", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r16_2", stage: "Round of 16", home_team: "Paraguay", away_team: "France", datetime_utc: "2026-07-04T20:00:00Z", stadium_id: "st_lincoln", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r16_3", stage: "Round of 16", home_team: "Brazil", away_team: "Norway", datetime_utc: "2026-07-05T20:00:00Z", stadium_id: "st_metlife", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r16_4", stage: "Round of 16", home_team: "Mexico", away_team: "England", datetime_utc: "2026-07-06T00:00:00Z", stadium_id: "st_azteca", status: "completed", home_score: 1, away_score: 3 },
    { id: "m_r16_5", stage: "Round of 16", home_team: "Portugal", away_team: "Spain", datetime_utc: "2026-07-06T19:00:00Z", stadium_id: "st_att", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r16_6", stage: "Round of 16", home_team: "United States", away_team: "Belgium", datetime_utc: "2026-07-07T00:00:00Z", stadium_id: "st_lumen", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_r16_7", stage: "Round of 16", home_team: "Argentina", away_team: "Egypt", datetime_utc: "2026-07-07T16:00:00Z", stadium_id: "st_mbs", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_r16_8", stage: "Round of 16", home_team: "Switzerland", away_team: "Colombia", datetime_utc: "2026-07-07T20:00:00Z", stadium_id: "st_bcplace", status: "completed", home_score: 3, away_score: 0 },
 
    // QUARTERFINALS
    { id: "m_qf_1", stage: "Quarterfinals", home_team: "France", away_team: "Morocco", datetime_utc: "2026-07-10T18:00:00Z", stadium_id: "st_gillette", status: "completed", home_score: 2, away_score: 0 },
    { id: "m_qf_2", stage: "Quarterfinals", home_team: "Spain", away_team: "Belgium", datetime_utc: "2026-07-11T20:00:00Z", stadium_id: "st_sofi", status: "completed", home_score: 2, away_score: 1 },
    { id: "m_qf_3", stage: "Quarterfinals", home_team: "Norway", away_team: "England", datetime_utc: "2026-07-12T17:00:00Z", stadium_id: "st_hardrock", status: "completed", home_score: 1, away_score: 2 },
    { id: "m_qf_4", stage: "Quarterfinals", home_team: "Argentina", away_team: "Switzerland", datetime_utc: "2026-07-12T19:00:00Z", stadium_id: "st_arrowhead", status: "completed", home_score: 3, away_score: 1 },
  
    // SEMIFINALS
    { id: "m_sf_1", stage: "Semifinals", home_team: "France", away_team: "Spain", datetime_utc: "2026-07-15T00:30:00Z", stadium_id: "st_att", status: "completed", home_score: 0, away_score: 2 },
    { id: "m_sf_2", stage: "Semifinals", home_team: "England", away_team: "Argentina", datetime_utc: "2026-07-16T00:30:00Z", stadium_id: "st_mbs", status: "scheduled" },

    // THIRD PLACE MATCH
    { id: "m_3rd", stage: "Third Place Match", home_team: "France", away_team: "Loser of SF 2", datetime_utc: "2026-07-18T21:00:00Z", stadium_id: "st_hardrock", status: "scheduled" },

    // FINAL MATCH
    { id: "m_final", stage: "Final Match", home_team: "Spain", away_team: "Winner of SF 2", datetime_utc: "2026-07-19T19:00:00Z", stadium_id: "st_metlife", status: "scheduled" }
  ];

  for (const m of matches) {
    db.run(
      "INSERT INTO matches (id, stage, home_team, away_team, datetime_utc, stadium_id, status, home_score, away_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [m.id, m.stage, m.home_team, m.away_team, m.datetime_utc, m.stadium_id, m.status, m.home_score !== undefined ? m.home_score : null, m.away_score !== undefined ? m.away_score : null]
    );
  }
  console.log(`Seeded ${matches.length} matches (scheduled and completed).`);

  // 4. Insert Gates
  const gates = [];
  const gateLetters = ["A", "B", "C", "D", "E", "F"];
  for (const s of stadiums) {
    for (let i = 0; i < gateLetters.length; i++) {
      const letter = gateLetters[i];
      const offsetLat = (i - 2.5) * 0.001;
      const offsetLng = (i - 2.5) * 0.001;
      gates.push({
        id: `gate_${s.id}_${letter.toLowerCase()}`,
        stadium_id: s.id,
        name: `Gate ${letter}`,
        lat: s.lat + offsetLat,
        lng: s.lng + offsetLng,
        current_density: Math.floor(Math.random() * 80) + 10
      });
    }
  }

  for (const g of gates) {
    db.run(
      "INSERT INTO gates (id, stadium_id, name, lat, lng, current_density) VALUES (?, ?, ?, ?, ?, ?)",
      [g.id, g.stadium_id, g.name, g.lat, g.lng, g.current_density]
    );
  }
  console.log(`Seeded ${gates.length} gates.`);

  // 5. Insert Facilities
  const facilities = [];
  const types = ["restroom", "wheelchair", "food", "first_aid"];
  const descriptions = {
    restroom: ["General Restroom Section 102", "Accessible Restroom Section 214", "Family Restroom Section 140", "Restroom Section 308"],
    wheelchair: ["Wheelchair Ramp Entrance South", "Elevator to Plaza Level Section 112", "ADA Seating Section 125", "Wheelchair Loan Desk Gate B"],
    food: ["Taco & Beer Stand Section 105", "Burgers & Fries Section 130", "Vegan Wrap Stall Section 202", "Soda & Popcorn Stand Section 314"],
    first_aid: ["Emergency First Aid Station Gate A", "Paramedic Outpost Section 118", "First Aid Section 224", "Medical Center Main Concourse"]
  };

  for (const s of stadiums) {
    for (let i = 0; i < 10; i++) {
      const type = types[i % types.length];
      const descList = descriptions[type as keyof typeof descriptions];
      const descIndex = Math.floor(i / types.length) % descList.length;
      const desc = descList[descIndex];
      const offsetLat = (i - 4.5) * 0.0008;
      const offsetLng = (Math.sin(i) * 0.0008);
      facilities.push({
        id: `fac_${s.id}_${i}`,
        stadium_id: s.id,
        type,
        description: desc,
        lat: s.lat + offsetLat,
        lng: s.lng + offsetLng
      });
    }
  }

  for (const f of facilities) {
    db.run(
      "INSERT INTO facilities (id, stadium_id, type, description, lat, lng) VALUES (?, ?, ?, ?, ?, ?)",
      [f.id, f.stadium_id, f.type, f.description, f.lat, f.lng]
    );
  }
  console.log(`Seeded ${facilities.length} facilities.`);

  // 6. Insert Alerts
  const alerts = [
    { id: "al_1", stadium_id: "st_metlife", type: "crowd", message: "Heavy congestion near Gate A. Fans are advised to route through Gate B or Gate C to minimize walk times.", starts_at: "2026-07-10T08:00:00Z", ends_at: "2026-07-10T23:59:59Z", severity: "high" },
    { id: "al_2", stadium_id: "st_sofi", type: "transit", message: "Metro transit line delays reported. Shuttle buses are active at the Central station drop-off point.", starts_at: "2026-07-10T10:00:00Z", ends_at: "2026-07-10T18:00:00Z", severity: "medium" },
    { id: "al_3", stadium_id: "st_mbs", type: "facility", message: "Concession stands near Section 130 are currently cash-only due to local network issues.", starts_at: "2026-07-10T12:00:00Z", ends_at: "2026-07-10T16:00:00Z", severity: "low" },
    { id: "al_4", stadium_id: "st_azteca", type: "weather", message: "High UV index expected. Sunscreen stations are active and available across all entrance gates.", starts_at: "2026-07-10T11:00:00Z", ends_at: "2026-07-10T17:00:00Z", severity: "low" }
  ];

  for (const a of alerts) {
    db.run(
      "INSERT INTO alerts (id, stadium_id, type, message, starts_at, ends_at, severity) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [a.id, a.stadium_id, a.type, a.message, a.starts_at, a.ends_at, a.severity]
    );
  }
  console.log(`Seeded ${alerts.length} alerts.`);
  console.log("[Seeder] Database seeding completed successfully.");
}
