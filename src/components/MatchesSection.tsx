import React, { useState } from "react";
import { Calendar, CheckCircle } from "lucide-react";

interface Match {
  id: string;
  teams: string;
  date: string;
  time: string;
  venue: string;
  result?: string;
  status: "upcoming" | "past";
}

interface MatchesSectionProps {
  selectedStadium: string;
  stadiums: any[];
}

export function MatchesSection({ selectedStadium, stadiums }: MatchesSectionProps) {
  const getCityName = (stadiumId: string) => {
    switch (stadiumId) {
      case "st_sofi": return "Los Angeles";
      case "st_metlife": return "New Jersey";
      case "st_mercedes":
      case "st_mbs": return "Atlanta";
      case "st_azteca": return "Mexico City";
      case "st_bcplace": return "Vancouver";
      case "st_att": return "Dallas";
      case "st_hardrock": return "Miami";
      case "st_gillette": return "Boston";
      case "st_lincoln": return "Philadelphia";
      case "st_nrg": return "Houston";
      case "st_bbva": return "Monterrey";
      case "st_arrowhead": return "Kansas City";
      case "st_lumen": return "Seattle";
      case "st_levis": return "San Francisco Bay Area";
      case "st_akron": return "Guadalajara";
      case "st_bmo": return "Toronto";
      default: return "";
    }
  };

  const selectedCity = getCityName(selectedStadium);

  const allMatches: Match[] = [
    // --- LOS ANGELES (st_sofi) ---
    { id: "m4", teams: "USA vs Paraguay", date: "13 June 2026", time: "21:00", venue: "Los Angeles", status: "past", result: "4 - 1" },
    { id: "m15", teams: "IR Iran vs New Zealand", date: "16 June 2026", time: "20:00", venue: "Los Angeles", status: "past", result: "2 - 2" },
    { id: "m26", teams: "Switzerland vs Bosnia and Herzeg…", date: "18 June 2026", time: "20:00", venue: "Los Angeles", status: "past", result: "4 - 1" },
    { id: "m39", teams: "Belgium vs IR Iran", date: "21 June 2026", time: "21:00", venue: "Los Angeles", status: "past", result: "0 - 0" },
    { id: "m59", teams: "Türkiye vs USA", date: "26 June 2026", time: "19:00", venue: "Los Angeles", status: "past", result: "3 - 2" },
    { id: "m73", teams: "South Africa vs Canada", date: "28 June 2026", time: "21:00", venue: "Los Angeles", status: "past", result: "0 - 1" },
    { id: "m84", teams: "Spain vs Austria", date: "2 July 2026", time: "21:00", venue: "Los Angeles", status: "past", result: "3 - 0" },
    { id: "m98", teams: "Spain vs Belgium", date: "11 July 2026", time: "20:00", venue: "Los Angeles", status: "past", result: "2 - 1" },

    // --- NEW JERSEY (st_metlife) ---
    { id: "m7", teams: "Brazil vs Morocco", date: "13 June 2026", time: "31:00", venue: "New Jersey", status: "past", result: "1 - 1" },
    { id: "m17", teams: "France vs Senegal", date: "16 June 2026", time: "20:00", venue: "New Jersey", status: "past", result: "3 - 1" },
    { id: "m41", teams: "Norway vs Senegal", date: "22 June 2026", time: "20:00", venue: "New Jersey", status: "past", result: "3 - 2" },
    { id: "m56", teams: "Ecuador vs Germany", date: "25 June 2026", time: "28:00", venue: "New Jersey", status: "past", result: "2 - 1" },
    { id: "m67", teams: "Panama vs England", date: "27 June 2026", time: "22:00", venue: "New Jersey", status: "past", result: "0 - 2" },
    { id: "m77", teams: "France vs Sweden", date: "30 June 2026", time: "33:00", venue: "New Jersey", status: "past", result: "3 - 0" },
    { id: "m91", teams: "Brazil vs Norway", date: "5 July 2026", time: "12:00", venue: "New Jersey", status: "past", result: "1 - 2" },
    { id: "m104", teams: "Winner of Match 101 vs Winner of Match 102", date: "20 July 2026", time: "00:30", venue: "New Jersey", status: "upcoming" },

    // --- ATLANTA (st_mercedes / st_mbs) ---
    { id: "m14", teams: "Spain vs Cabo Verde", date: "15 June 2026", time: "26:00", venue: "Atlanta", status: "past", result: "0 - 0" },
    { id: "m25", teams: "Czechia vs South Africa", date: "17 June 2026", time: "27:00", venue: "Atlanta", status: "past", result: "1 - 1" },
    { id: "m38", teams: "Spain vs Saudi Arabia", date: "20 June 2026", time: "26:00", venue: "Atlanta", status: "past", result: "4 - 0" },
    { id: "m50", teams: "Morocco vs Haiti", date: "24 June 2026", time: "29:00", venue: "Atlanta", status: "past", result: "4 - 2" },
    { id: "m72", teams: "Congo DR vs Uzbekistan", date: "27 June 2026", time: "31:00", venue: "Atlanta", status: "past", result: "3 - 1" },
    { id: "m80", teams: "England vs Congo DR", date: "1 July 2026", time: "32:00", venue: "Atlanta", status: "past", result: "2 - 1" },
    { id: "m95", teams: "Argentina vs Egypt", date: "7 July 2026", time: "12:00", venue: "Atlanta", status: "past", result: "3 - 2" },
    { id: "m102", teams: "England vs Argentina", date: "16 July 2026", time: "00:30", venue: "Atlanta", status: "upcoming" },

    // --- MEXICO CITY (st_azteca) ---
    { id: "m1", teams: "Mexico vs South Africa", date: "12 June 2026", time: "23:00", venue: "Mexico City", status: "past", result: "2 - 0" },
    { id: "m24", teams: "Uzbekistan vs Colombia", date: "17 June 2026", time: "18:00", venue: "Mexico City", status: "past", result: "1 - 3" },
    { id: "m53", teams: "Czechia vs Mexico", date: "25 June 2026", time: "19:00", venue: "Mexico City", status: "past", result: "0 - 3" },
    { id: "m79", teams: "Mexico vs Ecuador", date: "30 June 2026", time: "15:00", venue: "Mexico City", status: "past", result: "2 - 0" },
    { id: "m92", teams: "Mexico vs England", date: "5 July 2026", time: "16:00", venue: "Mexico City", status: "past", result: "2 - 3" },

    // --- VANCOUVER (st_bcplace) ---
    { id: "m6", teams: "Australia vs Türkiye", date: "14 June 2026", time: "22:00", venue: "Vancouver", status: "past", result: "2 - 0" },
    { id: "m27", teams: "Canada vs Qatar", date: "18 June 2026", time: "22:00", venue: "Vancouver", status: "past", result: "6 - 0" },
    { id: "m40", teams: "New Zealand vs Egypt", date: "21 June 2026", time: "24:00", venue: "Vancouver", status: "past", result: "1 - 3" },
    { id: "m51", teams: "Switzerland vs Canada", date: "24 June 2026", time: "26:00", venue: "Vancouver", status: "past", result: "2 - 1" },
    { id: "m64", teams: "New Zealand vs Belgium", date: "27 June 2026", time: "15:00", venue: "Vancouver", status: "past", result: "1 - 5" },
    { id: "m85", teams: "Switzerland vs Algeria", date: "2 July 2026", time: "14:00", venue: "Vancouver", status: "past", result: "2 - 0" },
    { id: "m96", teams: "Switzerland vs Colombia", date: "7 July 2026", time: "16:00", venue: "Vancouver", status: "past", result: "0 (4) - 0 (3)" },

    // --- DALLAS (st_att) ---
    { id: "m11", teams: "Netherlands vs Japan", date: "15 June 2026", time: "29:00", venue: "Dallas", status: "past", result: "2 - 2" },
    { id: "m22", teams: "England vs Croatia", date: "17 June 2026", time: "33:00", venue: "Dallas", status: "past", result: "4 - 2" },
    { id: "m43", teams: "Argentina vs Austria", date: "21 June 2026", time: "31:00", venue: "Dallas", status: "past", result: "2 - 0" },
    { id: "m57", teams: "Japan vs Sweden", date: "25 June 2026", time: "33:00", venue: "Dallas", status: "past", result: "1 - 1" },
    { id: "m70", teams: "Jordan vs Argentina", date: "28 June 2026", time: "32:00", venue: "Dallas", status: "past", result: "1 - 3" },
    { id: "m78", teams: "Côte d'Ivoire vs Norway", date: "30 June 2026", time: "32:00", venue: "Dallas", status: "past", result: "1 - 2" },
    { id: "m88", teams: "Australia vs Egypt", date: "2 July 2026", time: "35:00", venue: "Dallas", status: "past", result: "1 (2) - 1 (4)" },
    { id: "m93", teams: "Portugal vs Spain", date: "6 July 2026", time: "16:00", venue: "Dallas", status: "past", result: "0 - 1" },
    { id: "m101", teams: "France vs Spain", date: "15 July 2026", time: "00:30", venue: "Dallas", status: "upcoming" },

    // --- MIAMI (st_hardrock) ---
    { id: "m13", teams: "Saudi Arabia vs Uruguay", date: "16 June 2026", time: "33:00", venue: "Miami", status: "past", result: "1 - 1" },
    { id: "m37", teams: "Uruguay vs Cabo Verde", date: "21 June 2026", time: "33:00", venue: "Miami", status: "past", result: "2 - 2" },
    { id: "m49", teams: "Scotland vs Brazil", date: "24 June 2026", time: "30:00", venue: "Miami", status: "past", result: "0 - 3" },
    { id: "m71", teams: "Colombia vs Portugal", date: "27 June 2026", time: "30:00", venue: "Miami", status: "past", result: "0 - 0" },
    { id: "m86", teams: "Argentina vs Cabo Verde", date: "3 July 2026", time: "28:00", venue: "Miami", status: "past", result: "3 - 2 (a.e.t)" },
    { id: "m99", teams: "Norway vs England", date: "12 July 2026", time: "17:00", venue: "Miami", status: "past", result: "1 - 2 (a.e.t)" },
    { id: "m103", teams: "Loser of Match 101 vs Loser of Match 102", date: "19 July 2026", time: "02:30", venue: "Miami", status: "upcoming" },

    // --- BOSTON (st_gillette) ---
    { id: "m5", teams: "Haiti vs Scotland", date: "14 June 2026", time: "22:00", venue: "Boston", status: "past", result: "0 - 1" },
    { id: "m18", teams: "Iraq vs Norway", date: "16 June 2026", time: "24:00", venue: "Boston", status: "past", result: "1 - 4" },
    { id: "m30", teams: "Scotland vs Morocco", date: "20 June 2026", time: "25:00", venue: "Boston", status: "past", result: "0 - 1" },
    { id: "m45", teams: "England vs Ghana", date: "22 June 2026", time: "19:00", venue: "Boston", status: "past", result: "0 - 0" },
    { id: "m61", teams: "Norway vs France", date: "26 June 2026", time: "23:00", venue: "Boston", status: "past", result: "1 - 4" },
    { id: "m74", teams: "Germany vs Paraguay", date: "29 June 2026", time: "30:00", venue: "Boston", status: "past", result: "1 (3) - 1 (4)" },
    { id: "m97", teams: "France vs Morocco", date: "10 July 2026", time: "18:00", venue: "Boston", status: "past", result: "2 - 0" },

    // --- PHILADELPHIA (st_lincoln) ---
    { id: "m9", teams: "Côte d'Ivoire vs Ecuador", date: "15 June 2026", time: "29:00", venue: "Philadelphia", status: "past", result: "1 - 0" },
    { id: "m29", teams: "Brazil vs Haiti", date: "20 June 2026", time: "25:00", venue: "Philadelphia", status: "past", result: "3 - 0" },
    { id: "m42", teams: "France vs Iraq", date: "22 June 2026", time: "30:00", venue: "Philadelphia", status: "past", result: "3 - 0" },
    { id: "m55", teams: "Curaçao vs Côte d'Ivoire", date: "25 June 2026", time: "30:00", venue: "Philadelphia", status: "past", result: "0 - 2" },
    { id: "m68", teams: "Croatia vs Ghana", date: "27 June 2026", time: "21:00", venue: "Philadelphia", status: "past", result: "2 - 1" },
    { id: "m89", teams: "Paraguay vs France", date: "5 July 2026", time: "37:00", venue: "Philadelphia", status: "past", result: "0 - 1" },

    // --- HOUSTON (st_nrg) ---
    { id: "m10", teams: "Germany vs Curaçao", date: "15 June 2026", time: "30:00", venue: "Houston", status: "past", result: "7 - 1" },
    { id: "m23", teams: "Portugal vs Congo DR", date: "17 June 2026", time: "26:00", venue: "Houston", status: "past", result: "1 - 1" },
    { id: "m35", teams: "Netherlands vs Sweden", date: "20 June 2026", time: "30:00", venue: "Houston", status: "past", result: "5 - 1" },
    { id: "m47", teams: "Portugal vs Uzbekistan", date: "22 June 2026", time: "34:00", venue: "Houston", status: "past", result: "5 - 0" },
    { id: "m65", teams: "Cabo Verde vs Saudi Arabia", date: "26 June 2026", time: "33:00", venue: "Houston", status: "past", result: "0 - 0" },
    { id: "m76", teams: "Brazil vs Japan", date: "28 June 2026", time: "34:00", venue: "Houston", status: "past", result: "2 - 1" },
    { id: "m90", teams: "Canada vs Morocco", date: "4 July 2026", time: "34:00", venue: "Houston", status: "past", result: "0 - 3" },

    // --- MONTERREY (st_bbva) ---
    { id: "m12", teams: "Sweden vs Tunisia", date: "15 June 2026", time: "29:00", venue: "Monterrey", status: "past", result: "5 - 1" },
    { id: "m36", teams: "Tunisia vs Japan", date: "20 June 2026", time: "25:00", venue: "Monterrey", status: "past", result: "0 - 4" },
    { id: "m54", teams: "South Africa vs Korea Republic", date: "25 June 2026", time: "31:00", venue: "Monterrey", status: "past", result: "1 - 0" },
    { id: "m75", teams: "Netherlands vs Morocco", date: "29 June 2026", time: "32:00", venue: "Monterrey", status: "past", result: "1 (2) - 1 (3)" },

    // --- KANSAS CITY (st_arrowhead) ---
    { id: "m19", teams: "Argentina vs Algeria", date: "17 June 2026", time: "27:00", venue: "Kansas City", status: "past", result: "3 - 0" },
    { id: "m34", teams: "Ecuador vs Curaçao", date: "20 June 2026", time: "27:00", venue: "Kansas City", status: "past", result: "0 - 0" },
    { id: "m58", teams: "Tunisia vs Netherlands", date: "25 June 2026", time: "22:00", venue: "Kansas City", status: "past", result: "1 - 3" },
    { id: "m69", teams: "Algeria vs Austria", date: "28 June 2026", time: "27:00", venue: "Kansas City", status: "past", result: "3 - 3" },
    { id: "m87", teams: "Colombia vs Ghana", date: "3 July 2026", time: "29:00", venue: "Kansas City", status: "past", result: "1 - 0" },
    { id: "m100", teams: "Argentina vs Switzerland", date: "12 July 2026", time: "19:00", venue: "Kansas City", status: "past", result: "3 - 1 (a.e.t)" },

    // --- SEATTLE (st_lumen) ---
    { id: "m16", teams: "Belgium vs Egypt", date: "16 June 2026", time: "29:00", venue: "Seattle", status: "past", result: "1 - 1" },
    { id: "m32", teams: "USA vs Australia", date: "20 June 2026", time: "23:00", venue: "Seattle", status: "past", result: "2 - 0" },
    { id: "m52", teams: "Bosnia and Herzeg… vs Qatar", date: "24 June 2026", time: "26:00", venue: "Seattle", status: "past", result: "3 - 1" },
    { id: "m63", teams: "Egypt vs IR Iran", date: "27 June 2026", time: "16:00", venue: "Seattle", status: "past", result: "1 - 1" },
    { id: "m82", teams: "Belgium vs Senegal", date: "1 July 2026", time: "16:00", venue: "Seattle", status: "past", result: "3 - 2 (a.e.t)" },
    { id: "m94", teams: "USA vs Belgium", date: "7 July 2026", time: "28:00", venue: "Seattle", status: "past", result: "1 - 4" },

    // --- SAN FRANCISCO BAY AREA (st_levis) ---
    { id: "m20", teams: "Austria vs Jordan", date: "17 June 2026", time: "17:00", venue: "San Francisco Bay Area", status: "past", result: "3 - 1" },
    { id: "m31", teams: "Türkiye vs Paraguay", date: "20 June 2026", time: "21:00", venue: "San Francisco Bay Area", status: "past", result: "0 - 1" },
    { id: "m44", teams: "Jordan vs Algeria", date: "22 June 2026", time: "17:00", venue: "San Francisco Bay Area", status: "past", result: "1 - 2" },
    { id: "m60", teams: "Paraguay vs Australia", date: "26 June 2026", time: "17:00", venue: "San Francisco Bay Area", status: "past", result: "0 - 0" },
    { id: "m81", teams: "USA vs Bosnia and Herzeg…", date: "1 July 2026", time: "22:00", venue: "San Francisco Bay Area", status: "past", result: "2 - 0" },

    // --- GUADALAJARA (st_akron) ---
    { id: "m2", teams: "Korea Republic vs Czechia", date: "12 June 2026", time: "21:00", venue: "Guadalajara", status: "past", result: "2 - 1" },
    { id: "m28", teams: "Mexico vs Korea Republic", date: "19 June 2026", time: "21:00", venue: "Guadalajara", status: "past", result: "1 - 0" },
    { id: "m48", teams: "Colombia vs Congo DR", date: "23 June 2026", time: "18:00", venue: "Guadalajara", status: "past", result: "1 - 0" },
    { id: "m66", teams: "Uruguay vs Spain", date: "26 June 2026", time: "23:00", venue: "Guadalajara", status: "past", result: "0 - 1" },

    // --- TORONTO (st_bmo) ---
    { id: "m3", teams: "Canada vs Bosnia and Herzeg…", date: "13 June 2026", time: "26:00", venue: "Toronto", status: "past", result: "1 - 1" },
    { id: "m21", teams: "Ghana vs Panama", date: "17 June 2026", time: "17:00", venue: "Toronto", status: "past", result: "1 - 0" },
    { id: "m33", teams: "Germany vs Côte d'Ivoire", date: "20 June 2026", time: "20:00", venue: "Toronto", status: "past", result: "2 - 1" },
    { id: "m46", teams: "Panama vs Croatia", date: "22 June 2026", time: "22:00", venue: "Toronto", status: "past", result: "0 - 1" },
    { id: "m62", teams: "Senegal vs Iraq", date: "26 June 2026", time: "20:00", venue: "Toronto", status: "past", result: "5 - 0" },
    { id: "m83", teams: "Portugal vs Croatia", date: "2 July 2026", time: "29:00", venue: "Toronto", status: "past", result: "2 - 1" }
  ];

  // If a specific stadium is selected, only show its matches. Otherwise, show all.
  const filteredMatches = selectedCity ? allMatches.filter(m => m.venue.includes(selectedCity)) : allMatches;

  const upcoming = filteredMatches.filter(m => m.status === "upcoming");
  const past = filteredMatches.filter(m => m.status === "past").reverse(); // Show most recent past matches first

  const getTeamFlags = (teams: string) => {
    const teamList = teams.split(" vs ");
    const flags: Record<string, string> = {
      "USA": "🇺🇸", "Spain": "🇪🇸", "Mexico": "🇲🇽", "Germany": "🇩🇪", "Canada": "🇨🇦", "France": "🇫🇷",
      "Argentina": "🇦🇷", "Croatia": "🇭🇷", "Brazil": "🇧🇷", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Italy": "🇮🇹", "Japan": "🇯🇵",
      "Morocco": "🇲🇦", "Portugal": "🇵🇹", "Netherlands": "🇳🇱", "Senegal": "🇸🇳", "Korea Republic": "🇰🇷", "Uruguay": "🇺🇾",
      "Norway": "🇳🇴", "Belgium": "🇧🇪", "Egypt": "🇪🇬", "Switzerland": "🇨🇭", "Colombia": "🇨🇴", "Czechia": "🇨🇿",
      "South Africa": "🇿🇦", "Bosnia and Herzegovina": "🇧🇦", "Third Place Play-off": "🥉", "FIFA World Cup Final": "🏆",
      "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Haiti": "🇭🇹", "Australia": "🇦🇺", "Türkiye": "🇹🇷", "Curaçao": "🇨🇼", "Côte d'Ivoire": "🇨🇮",
      "Ecuador": "🇪🇨", "Tunisia": "🇹🇳", "Cabo Verde": "🇨🇻", "Algeria": "🇩🇿", "Sweden": "🇸🇪", "Paraguay": "🇵🇾"
    };
    return `${flags[teamList[0]] || "🏳️"} vs ${flags[teamList[1]] || "🏳️"}`;
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col h-[400px]">
          <h3 className="font-bold text-xs tracking-wider uppercase text-emerald-400 flex items-center gap-2 mb-4 shrink-0">
            <Calendar className="w-4 h-4" /> Upcoming Matches (Real-Time)
          </h3>
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {upcoming.map(match => (
              <div key={match.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/60 hover:border-emerald-500/30 transition-all flex justify-between items-center gap-2 group">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-black text-white text-sm flex items-center gap-2 truncate">
                    <span className="text-lg shrink-0">{getTeamFlags(match.teams)}</span>
                    <span className="truncate">{match.teams}</span>
                  </p>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider truncate">{match.date} • {match.time}</p>
                  <p className="text-zinc-500 text-[10px] font-medium truncate">{match.venue}</p>
                </div>
                <div className="bg-emerald-400/10 px-2 py-1 rounded text-[9px] font-mono text-emerald-400 font-bold border border-emerald-400/20 uppercase shrink-0">
                  Upcoming
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="p-4 text-center text-zinc-500 font-mono text-xs">No upcoming matches at this venue.</div>
            )}
          </div>
        </div>

        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col h-[400px]">
          <h3 className="font-bold text-xs tracking-wider uppercase text-zinc-400 flex items-center gap-2 mb-4 shrink-0">
            <CheckCircle className="w-4 h-4" /> Past Results (Official Scoreline)
          </h3>
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {past.map(match => (
              <div key={match.id} className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/40 grayscale hover:grayscale-0 transition-all flex justify-between items-center gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-black text-white text-sm flex items-center gap-2 truncate">
                    <span className="text-lg opacity-60 shrink-0">{getTeamFlags(match.teams)}</span>
                    <span className="truncate">{match.teams}</span>
                  </p>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider truncate">{match.date} • Result: <span className="text-[#22c55e] font-black">{match.result}</span></p>
                  <p className="text-zinc-500 text-[10px] font-medium truncate">{match.venue}</p>
                </div>
                <div className="bg-zinc-800 px-2 py-1 rounded text-[9px] font-mono text-zinc-400 font-bold border border-zinc-700 uppercase shrink-0">
                  Completed
                </div>
              </div>
            ))}
            {past.length === 0 && (
              <div className="p-4 text-center text-zinc-500 font-mono text-xs">No past matches at this venue.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
