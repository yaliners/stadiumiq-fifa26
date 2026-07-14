import { safeDbQuery, dbAll, dbGet } from "./db";

export const PATTERNS = {
  schedule: /\bwhen\b.*\bvs\b|\bschedule\b|\bplaying\b/i,
  gate_density: /\bgate\s*[a-fA-F0-9]?\b|\bcrowd(ed)?\b|\bdensity\b|\bleast\s+crowded\b/i,
  facility: /\brestroom\b|\bwheelchair\b|\bfood\b|\bfirst.?aid\b|\baccessible\b/i,
  rules: /\bextra\s*time\b|\bpenalt(y|ies)\b|\bvar\b|\bknockout\b|\brule\b/i,
};

export interface DecisionEngineResponse {
  answer: string;
  confidence: "grounded" | "uncertain" | "general_knowledge";
  source_type: "decision_engine" | "gemini" | "fallback";
}

/**
 * Classifies a user query string against known deterministic patterns.
 */
export function classify(message: string): "schedule" | "gate_density" | "facility" | "rules" | null {
  if (PATTERNS.schedule.test(message)) return "schedule";
  if (PATTERNS.gate_density.test(message)) return "gate_density";
  if (PATTERNS.facility.test(message)) return "facility";
  if (PATTERNS.rules.test(message)) return "rules";
  return null;
}

/**
 * Handles "schedule" queries
 */
async function answerSchedule(message: string, locale: string): Promise<string> {
  const teams = [
    "USA", "United States", "Spain", "Morocco", "Croatia", "Ecuador", "Korea Republic", "South Korea", "Germany", 
    "Nigeria", "Japan", "Argentina", "France", "Ghana", "Belgium", "Mexico", "Curacao", "Netherlands", "Ivory Coast",
    "Sweden", "Uruguay", "Australia", "Canada", "Switzerland", "Iran", "Brazil", "Senegal", "Iraq", "Algeria",
    "Norway", "Panama", "England", "Paraguay", "New Zealand", "Türkiye", "Cape Verde", "Bosnia and Herzegovina", "Bosnia",
    "Czechia", "South Africa", "Saudi Arabia", "Haiti", "Congo DR", "Uzbekistan", "Colombia", "Qatar", "Egypt", "Scotland",
    "Tunisia", "Austria", "Jordan", "Portugal"
  ];

  // Find all teams mentioned in the query
  const queryTeams: string[] = [];
  for (const team of teams) {
    if (new RegExp("\\b" + team + "\\b", "i").test(message)) {
      let mapped = team;
      const lower = team.toLowerCase();
      if (lower === "usa" || lower === "united states") {
        mapped = "United States";
      } else if (lower === "bosnia" || lower === "bosnia and herzegovina") {
        mapped = "Bosnia and Herzegovina";
      } else if (lower === "korea republic" || lower === "south korea") {
        mapped = "South Korea";
      }
      if (!queryTeams.includes(mapped)) {
        queryTeams.push(mapped);
      }
    }
  }

  const result = await safeDbQuery(async (db) => {
    let query = "SELECT m.*, s.name as stadium_name FROM matches m JOIN stadiums s ON m.stadium_id = s.id";
    let params: (string | number | boolean | null)[] = [];
    if (queryTeams.length > 0) {
      const conditions = queryTeams.map(() => "(m.home_team LIKE ? OR m.away_team LIKE ?)").join(" OR ");
      query += ` WHERE ${conditions} ORDER BY m.datetime_utc ASC LIMIT 4`;
      queryTeams.forEach((t) => {
        params.push(`%${t}%`, `%${t}%`);
      });
    } else {
      query += " ORDER BY m.datetime_utc ASC LIMIT 3";
    }
    return dbAll(db, query, params);
  });

  if (!result || result.length === 0) {
    if (locale === "es") {
      return "No pudimos encontrar ningún partido programado para los equipos solicitados. Por favor, consulte el sitio web oficial de la FIFA.";
    } else if (locale === "fr") {
      return "Nous n'avons trouvé aucun match programmé pour les équipes demandées. Veuillez consulter le site officiel de la FIFA.";
    }
    return "We couldn't find any scheduled matches for the requested teams. Please check the official FIFA schedule.";
  }

  let scheduleLines = "";
  for (const m of result) {
    const dateStr = new Date(m.datetime_utc).toLocaleDateString(locale === "es" ? "es-ES" : locale === "fr" ? "fr-FR" : "en-US", {
      weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short"
    });
    const homeDisplayName = m.home_team === "United States" ? "United States (USA)" : m.home_team;
    const awayDisplayName = m.away_team === "United States" ? "United States (USA)" : m.away_team;
    scheduleLines += `- **${homeDisplayName} vs ${awayDisplayName}** (${m.stage})\n  🏟️ ${m.stadium_name} | 📅 ${dateStr}\n`;
  }

  if (locale === "es") {
    return `Aquí está el calendario de partidos correspondiente:\n\n${scheduleLines}\n💡 **Consejo de llegada**: Se recomienda llegar al menos 2.5 horas antes del partido para pasar los controles de seguridad sin prisas.`;
  } else if (locale === "fr") {
    return `Voici le calendrier des matchs correspondants :\n\n${scheduleLines}\n💡 **Conseil d'arrivée** : Il est recommandé d'arriver au moins 2,5 heures avant le coup d'envoi pour passer les contrôles de sécurité en toute tranquillité.`;
  }
  return `Here is the relevant match schedule:\n\n${scheduleLines}\n💡 **Arrival Tip**: We recommend arriving at least 2.5 hours before kickoff to comfortably clear stadium security checks.`;
}

/**
 * Handles "gate_density" queries
 */
async function answerGateDensity(message: string, locale: string): Promise<string> {
  // Extract gate letter if mentioned, e.g. "Gate A" or "Gate B"
  let gateLetter = "";
  const gateMatch = message.match(/\bgate\s*([a-fA-F])\b/i);
  if (gateMatch) {
    gateLetter = gateMatch[1].toUpperCase();
  }

  const result = await safeDbQuery(async (db) => {
    const allGates = dbAll(db, "SELECT g.*, s.name as stadium_name FROM gates g JOIN stadiums s ON g.stadium_id = s.id");
    return allGates;
  });

  if (!result || result.length === 0) {
    if (locale === "es") return "Error al recuperar datos de densidad de las puertas.";
    if (locale === "fr") return "Échec de la récupération des données de densité des portes.";
    return "Failed to retrieve gate density data.";
  }

  // Find the stadium that is mentioned, if any
  let stadiumKeyword = "MetLife Stadium";
  if (/sofi/i.test(message)) stadiumKeyword = "SoFi Stadium";
  else if (/akron|guadalajara/i.test(message)) stadiumKeyword = "Estadio Akron";
  else if (/bmo|toronto/i.test(message)) stadiumKeyword = "BMO Field";
  else if (/levis|santa clara/i.test(message)) stadiumKeyword = "Levi's Stadium";
  else if (/gillette|foxborough/i.test(message)) stadiumKeyword = "Gillette Stadium";
  else if (/nrg|houston/i.test(message)) stadiumKeyword = "NRG Stadium";
  else if (/att|arlington/i.test(message)) stadiumKeyword = "AT&T Stadium";
  else if (/lincoln|philadelphia/i.test(message)) stadiumKeyword = "Lincoln Financial Field";
  else if (/bbva|monterrey/i.test(message)) stadiumKeyword = "Estadio BBVA";
  else if (/mbs|mercedes|atlanta/i.test(message)) stadiumKeyword = "Mercedes-Benz Stadium";
  else if (/lumen|seattle/i.test(message)) stadiumKeyword = "Lumen Field";
  else if (/hardrock|miami/i.test(message)) stadiumKeyword = "Hard Rock Stadium";
  else if (/arrowhead|kansas/i.test(message)) stadiumKeyword = "Arrowhead Stadium";
  else if (/azteca|mexico/i.test(message)) stadiumKeyword = "Estadio Azteca";
  else if (/vancouver|bc/i.test(message)) stadiumKeyword = "BC Place";

  const stadiumGates = result.filter(g => g.stadium_name.toLowerCase().includes(stadiumKeyword.toLowerCase().split(" ")[0]));
  const targetGates = stadiumGates.length > 0 ? stadiumGates : result;

  // Sort to find the least crowded gate
  const sortedGates = [...targetGates].sort((a, b) => a.current_density - b.current_density);
  const bestGate = sortedGates[0];

  let queriedGate = targetGates.find(g => g.name.toLowerCase().endsWith(gateLetter.toLowerCase()));
  if (!queriedGate) {
    // If specific gate not found or not asked, default queriedGate to a random gate or the highest density one
    queriedGate = targetGates.find(g => g.name.includes("Gate A")) || targetGates[0];
  }

  const walkTimeBest = Math.round(bestGate.current_density * 0.15 + 2);
  const walkTimeQueried = Math.round(queriedGate.current_density * 0.15 + 2);

  if (locale === "es") {
    return `**Recomendado**: **${bestGate.name}** en **${bestGate.stadium_name}** — densidad actual de sólo **${bestGate.current_density}%**. Tiempo estimado de caminata: **${walkTimeBest} min**.
${queriedGate.name === bestGate.name ? "Esta es actualmente la puerta menos congestionada." : `**${queriedGate.name}** está actualmente al **${queriedGate.current_density}%** de su capacidad, con un tiempo de espera/caminata estimado de **${walkTimeQueried} min**.`}`;
  } else if (locale === "fr") {
    return `**Recommandé** : **${bestGate.name}** à **${bestGate.stadium_name}** — densité actuelle de seulement **${bestGate.current_density}%**. Temps de marche estimé : **${walkTimeBest} min**.
${queriedGate.name === bestGate.name ? "C'est actuellement la porte la moins encombrée." : `**${queriedGate.name}** est actuellement à **${queriedGate.current_density}%**, avec un temps d'attente/marche estimé à **${walkTimeQueried} min**.`}`;
  }
  return `**Recommended**: **${bestGate.name}** at **${bestGate.stadium_name}** — current density is only **${bestGate.current_density}%**. Estimated entry & walk time: **${walkTimeBest} min**.
${queriedGate.name === bestGate.name ? "This is currently the least crowded entrance." : `**${queriedGate.name}** is currently at **${queriedGate.current_density}%** density, with an estimated entry & walk time of **${walkTimeQueried} min**.`}`;
}

/**
 * Handles "facility" queries
 */
async function answerFacility(message: string, locale: string): Promise<string> {
  let type = "food";
  let facilityName = "Food Stall";
  
  if (/restroom|toilet|bathroom/i.test(message)) {
    type = "restroom";
    facilityName = locale === "es" ? "Aseos / Baño" : locale === "fr" ? "Toilettes" : "Restroom";
  } else if (/wheelchair|accessible|ada|elevator|ramp/i.test(message)) {
    type = "wheelchair";
    facilityName = locale === "es" ? "Servicios de Accesibilidad ADA" : locale === "fr" ? "Services d'accessibilité" : "Accessibility/ADA Service";
  } else if (/first.?aid|medical|doctor|paramedic|hospital/i.test(message)) {
    type = "first_aid";
    facilityName = locale === "es" ? "Primeros Auxilios / Médicos" : locale === "fr" ? "Premiers Secours" : "First Aid / Medical Station";
  } else if (/food|beer|drink|eat|concession/i.test(message)) {
    type = "food";
    facilityName = locale === "es" ? "Comida y Bebida" : locale === "fr" ? "Restauration" : "Food & Beverage Concession";
  }

  // Extract stadium keyword if any
  let stadiumKeyword = "";
  if (/sofi/i.test(message)) stadiumKeyword = "st_sofi";
  else if (/metlife/i.test(message)) stadiumKeyword = "st_metlife";
  else if (/akron|guadalajara/i.test(message)) stadiumKeyword = "st_akron";
  else if (/bmo|toronto/i.test(message)) stadiumKeyword = "st_bmo";
  else if (/levis|santa clara/i.test(message)) stadiumKeyword = "st_levis";
  else if (/gillette|foxborough/i.test(message)) stadiumKeyword = "st_gillette";
  else if (/nrg|houston/i.test(message)) stadiumKeyword = "st_nrg";
  else if (/att|arlington/i.test(message)) stadiumKeyword = "st_att";
  else if (/lincoln|philadelphia/i.test(message)) stadiumKeyword = "st_lincoln";
  else if (/bbva|monterrey/i.test(message)) stadiumKeyword = "st_bbva";
  else if (/mbs|mercedes|atlanta/i.test(message)) stadiumKeyword = "st_mbs";
  else if (/lumen|seattle/i.test(message)) stadiumKeyword = "st_lumen";
  else if (/hardrock|miami/i.test(message)) stadiumKeyword = "st_hardrock";
  else if (/arrowhead|kansas/i.test(message)) stadiumKeyword = "st_arrowhead";
  else if (/azteca|mexico/i.test(message)) stadiumKeyword = "st_azteca";
  else if (/vancouver|bc/i.test(message)) stadiumKeyword = "st_bcplace";

  const result = await safeDbQuery(async (db) => {
    let query = "SELECT DISTINCT f.id, f.stadium_id, f.type, f.description, f.lat, f.lng, s.name as stadium_name FROM facilities f JOIN stadiums s ON f.stadium_id = s.id WHERE f.type = ?";
    const params: (string | number | boolean | null)[] = [type];
    if (stadiumKeyword) {
      query += " AND f.stadium_id = ?";
      params.push(stadiumKeyword);
    }
    query += " LIMIT 20"; // Fetch slightly more to account for cross-stadium overlaps before slicing
    return dbAll(db, query, params);
  });

  // Deduplicate by combining stadium_id and description
  const uniqueResult = [];
  const seen = new Set();
  if (result) {
    for (const f of result) {
      const key = `${f.stadium_id}:${f.description.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueResult.push(f);
      }
    }
  }

  const finalResult = uniqueResult.slice(0, 3);

  if (!finalResult || finalResult.length === 0) {
    if (locale === "es") return `No pudimos encontrar instalaciones de tipo **${facilityName}** en este estadio.`;
    if (locale === "fr") return `Nous n'avons trouvé aucun service de type **${facilityName}** dans ce stade.`;
    return `We couldn't locate any **${facilityName}** facilities at the specified stadium.`;
  }

  let facilityLines = "";
  for (const f of finalResult) {
    facilityLines += `- **${f.description}** (${f.stadium_name})\n`;
  }

  if (locale === "es") {
    return `Aquí están las instalaciones de **${facilityName}** más cercanas:\n\n${facilityLines}\n🗺️ **Indicaciones**: Siga las señales físicas del pasillo o consulte el mapa digital en los paneles táctiles interactivos de las puertas.`;
  } else if (locale === "fr") {
    return `Voici les services de type **${facilityName}** les plus proches :\n\n${facilityLines}\n🗺️ **Directions** : Suivez la signalisation physique dans les couloirs ou consultez le plan numérique sur les bornes tactiles interactives.`;
  }
  return `Here are the nearest **${facilityName}** facilities:\n\n${facilityLines}\n🗺️ **Directions**: Please follow the physical concourse signs or consult the digital stadium map at interactive touchscreens near gates.`;
}

/**
 * Handles "rules" queries
 */
async function answerRules(message: string, locale: string): Promise<string> {
  let ruleTitle = "";
  let ruleText = "";

  if (/extra\s*time/i.test(message)) {
    ruleTitle = locale === "es" ? "Regla de Tiempo Extra" : locale === "fr" ? "Règle de la Prolongation" : "Extra Time Rule";
    ruleText = locale === "es"
      ? "Si un partido de eliminación directa termina empatado al final de los 90 minutos reglamentarios, se jugará un tiempo extra que consiste en dos periodos de 15 minutos cada uno. No se aplica la regla del gol de oro."
      : locale === "fr"
      ? "Si un match de phase à élimination directe se termine par une égalité à la fin du temps réglementaire (90 minutes), une prolongation de deux périodes de 15 minutes sera jouée. Le but d'or n'est pas appliqué."
      : "If a knockout match is tied at the end of 90 minutes of normal playing time, extra time consisting of two periods of 15 minutes each will be played. There is no golden goal; both halves of extra time are played in full.";
  } else if (/penalt/i.test(message)) {
    ruleTitle = locale === "es" ? "Regla de Penaltis" : locale === "fr" ? "Règle des Tirs au But" : "Penalty Shootout Rule";
    ruleText = locale === "es"
      ? "Si el marcador sigue empatado después del tiempo extra, se procederá a una tanda de penaltis. Consiste en 5 lanzamientos por equipo. Si persiste el empate, se aplicará la muerte súbita tiro a tiro."
      : locale === "fr"
      ? "Si les équipes sont toujours à égalité après la prolongation, une séance de tirs au but aura lieu. Elle commence par 5 tirs par équipe. Si l'égalité persiste, des tirs à mort subite seront effectués un par un."
      : "If the score remains tied after extra time, a penalty shootout will determine the winner. The shootout starts with 5 kicks per team. If still tied, sudden-death kicks are taken one-by-one until a winner emerges.";
  } else if (/var/i.test(message)) {
    ruleTitle = "VAR (Video Assistant Referee)";
    ruleText = locale === "es"
      ? "El Árbitro Asistente de Video (VAR) se utiliza únicamente para corregir errores claros y obvios en cuatro categorías que cambian el rumbo del partido: goles, penaltis, tarjetas rojas directas y confusión de identidad."
      : locale === "fr"
      ? "L'arbitre assistant vidéo (VAR) est utilisé uniquement pour corriger des erreurs manifestes dans quatre situations décisives : buts accordés ou refusés, décisions de penalty, cartons rouges directs et erreur sur l'identité d'un joueur."
      : "The Video Assistant Referee (VAR) is utilized only to correct clear and obvious errors in match-changing situations: goals, penalty decisions, direct red cards, and mistaken identity.";
  } else {
    ruleTitle = locale === "es" ? "Reglamento del Torneo" : locale === "fr" ? "Règlement du Tournoi" : "Knockout Stage Regulations";
    ruleText = locale === "es"
      ? "Para la fase de eliminación directa del Mundial 2026, los partidos deben tener un ganador. Si hay empate a los 90 minutos, se juegan 30 minutos de tiempo extra. Si persiste, se decide por penaltis. Las tarjetas amarillas acumuladas se eliminan después de los cuartos de final."
      : locale === "fr"
      ? "Pour la phase à élimination directe de la Coupe du Monde 2026, chaque match doit avoir un vainqueur. En cas d'égalité, une prolongation de 30 minutes est jouée, suivie de tirs au but si nécessaire. Les cartons jaunes accumulés sont annulés après les quarts de finale."
      : "For the FIFA World Cup 2026 knockout rounds, all matches must produce a winner. If tied at 90 minutes, 30 minutes of extra time is played, followed by a penalty shootout if necessary. Accumulated yellow cards are wiped clean after the Quarter-finals.";
  }

  return `### 📋 ${ruleTitle}\n\n${ruleText}`;
}

/**
 * Main execution interface for the Decision Engine.
 * If the query matches a pattern, executes SQLite query and returns plain language.
 */
export async function executeDecisionEngine(message: string, locale: string = "en"): Promise<DecisionEngineResponse | null> {
  const category = classify(message);
  if (!category) return null;

  console.log(`[DecisionEngine] Query matched pattern for "${category}"`);

  let answer = "";
  switch (category) {
    case "schedule":
      answer = await answerSchedule(message, locale);
      break;
    case "gate_density":
      answer = await answerGateDensity(message, locale);
      break;
    case "facility":
      answer = await answerFacility(message, locale);
      break;
    case "rules":
      answer = await answerRules(message, locale);
      break;
  }

  return {
    answer,
    confidence: "grounded",
    source_type: "decision_engine",
  };
}
