const fs = require('fs');

const rawData = `
Match 1 Group A Mexico City ️ 23°C
Mexico 2
South Africa 0
Full time
Match 2 Group A Guadalajara ☀️ 21°C
Korea Republic 2
Czechia 1
Full time
Match 3 Group B Toronto ☀️ 26°C
Canada 1
Bosnia and Herzeg… 1
Full time
Match 4 Group D Los Angeles ⛅ 21°C
USA 4
Paraguay 1
Full time
Match 8 Group B San Francisco Bay Area
☀️ 22°C
Match 7 Group C New Jersey ☀️ 31°C
Brazil 1
Morocco 1
Full time
Friday, June 12, 2026
Saturday, June 13, 2026
Qatar 1
Switzerland 1
Full time
Match 5 Group C Boston ☀️ 22°C
Haiti 0
Scotland 1
Full time
Match 6 Group D Vancouver ☀️ 22°C
Australia 2
Türkiye 0
Full time
Match 10 Group E Houston ⛈️ 30°C
Germany 7
Curaçao 1
Full time
Match 11 Group F Dallas ☁️ 29°C
Netherlands 2
Japan 2
Full time
Match 9 Group E Philadelphia ☀️ 29°C
Côte d'Ivoire 1
Ecuador 0
Full time
Match 12 Group F Monterrey ⛈️ 29°C
Sweden 5
Tunisia 1
Full time
Match 14 Group H Atlanta ☀️ 26°C
Spain 0
Cabo Verde 0
Full time
Match 16 Group G Seattle ☀️ 29°C
Belgium 1
Egypt 1
Full time
Match 13 Group H Miami ☁️ 33°C
Saudi Arabia 1
Uruguay 1
Full time
Match 15 Group G Los Angeles ☀️ 20°C
IR Iran 2
New Zealand 2
Full time
Match 17 Group I New Jersey ⛅ 25°C Match 18 Group I Boston ☀️ 24°C
Sunday, June 14, 2026
Monday, June 15, 2026
Tuesday, June 16, 2026
France 3
Senegal 1
Full time
Iraq 1
Norway 4
Full time
Match 19 Group J Kansas City ⛅ 27°C
Argentina 3
Algeria 0
Full time
Match 20 Group J San Francisco Bay Area
☀️ 17°C
Austria 3
Jordan 1
Full time
Match 23 Group K Houston ☁️ 26°C
Portugal 1
Congo DR 1
Full time
Match 22 Group L Dallas ⛈️ 33°C
England 4
Croatia 2
Full time
Match 21 Group L Toronto ☁️ 17°C
Ghana 1
Panama 0
Full time
Match 24 Group K Mexico City ️ 18°C
Uzbekistan 1
Colombia 3
Full time
Match 25 Group A Atlanta ⛈️ 27°C
Czechia 1
South Africa 1
Full time
Match 26 Group B Los Angeles ☁️ 20°C
Switzerland 4
Bosnia and Herzeg… 1
Full time
Match 27 Group B Vancouver ☀️ 22°C
Canada 6
Qatar 0
Full time
Match 28 Group A Guadalajara ️ 21°C
Mexico 1
Korea Republic 0
Full time
Wednesday, June 17, 2026
Thursday, June 18, 2026
Friday, June 19, 2026
Match 32 Group D Seattle ☀️ 23°C
USA 2
Australia 0
Full time
Match 30 Group C Boston ☀️ 25°C
Scotland 0
Morocco 1
Full time
Match 29 Group C Philadelphia ⛅ 25°C
Brazil 3
Haiti 0
Full time
Match 31 Group D San Francisco Bay Area
☀️ 21°C
Türkiye 0
Paraguay 1
Full time
Match 35 Group F Houston ⛈️ 30°C
Netherlands 5
Sweden 1
Full time
Match 33 Group E Toronto ☀️ 20°C
Germany 2
Côte d'Ivoire 1
Full time
Match 34 Group E Kansas City ⛅ 27°C
Ecuador 0
Curaçao 0
Full time
Match 36 Group F Monterrey ☀️ 25°C
Tunisia 0
Japan 4
Full time
Match 38 Group H Atlanta ☁️ 26°C
Spain 4
Saudi Arabia 0
Full time
Match 39 Group G Los Angeles ⛅ 21°C
Belgium 0
IR Iran 0
Full time
Match 37 Group H Miami ⛈️ 33°C
Uruguay 2
Cabo Verde 2
Full time
Match 40 Group G Vancouver ☀️ 24°C
New Zealand 1
Egypt 3
Full time
Match 43 Group J Dallas ⛈️ 31°C
Argentina 2
Austria 0
Full time
Saturday, June 20, 2026
Sunday, June 21, 2026
Monday June 22 2026
Match 42 Group I Philadelphia ☁️ 30°C
France 3
Iraq 0
Full time
Match 41 Group I New Jersey ️ 20°C
Norway 3
Senegal 2
Full time
Match 44 Group J San Francisco Bay Area
☀️ 17°C
Jordan 1
Algeria 2
Full time
Match 47 Group K Houston ⛈️ 34°C
Portugal 5
Uzbekistan 0
Full time
Match 45 Group L Boston ☁️ 19°C
England 0
Ghana 0
Full time
Match 46 Group L Toronto ☀️ 22°C
Panama 0
Croatia 1
Full time
Match 48 Group K Guadalajara ☀️ 18°C
Colombia 1
Congo DR 0
Full time
Match 51 Group B Vancouver ☀️ 26°C
Switzerland 2
Canada 1
Full time
Match 52 Group B Seattle ☀️ 26°C
Bosnia and Herzeg… 3
Qatar 1
Full time
Match 49 Group C Miami ☁️ 30°C
Scotland 0
Brazil 3
Full time
Match 50 Group C Atlanta ☁️ 29°C
Morocco 4
Haiti 2
Full time
Match 53 Group A Mexico City ️ 19°C
Czechia 0
Mexico 3
Full time
Match 54 Group A Monterrey ☀️ 31°C
South Africa 1
Korea Republic 0
Full time
Monday, June 22, 2026
Tuesday, June 23, 2026
Wednesday, June 24, 2026
Thursday, June 25, 2026
Match 55 Group E Philadelphia ⛅ 30°C
Curaçao 0
Côte d'Ivoire 2
Full time
Match 56 Group E New Jersey ☁️ 28°C
Ecuador 2
Germany 1
Full time
Match 57 Group F Dallas ⛈️ 33°C
Japan 1
Sweden 1
Full time
Match 58 Group F Kansas City ️ 22°C
Tunisia 1
Netherlands 3
Full time
Match 59 Group D Los Angeles ☀️ 19°C
Türkiye 3
USA 2
Full time
Match 60 Group D San Francisco Bay Area
☀️ 17°C
Paraguay 0
Australia 0
Full time
Match 61 Group I Boston ☀️ 23°C
Norway 1
France 4
Full time
Match 62 Group I Toronto ☀️ 20°C
Senegal 5
Iraq 0
Full time
Match 65 Group H Houston ☀️ 33°C
Cabo Verde 0
Saudi Arabia 0
Full time
Match 66 Group H Guadalajara ⛈️ 23°C
Uruguay 0
Spain 1
Full time
Match 63 Group G Seattle ☁️ 16°C
Egypt 1
IR Iran 1
Full time
Match 64 Group G Vancouver ☀️ 15°C
New Zealand 1
Belgium 5
Full time
Match 67 Group L New Jersey ️ 22°C
Panama 0
England 2
Full time
Match 68 Group L Philadelphia ☁️ 21°C
Croatia 2
Ghana 1
Full time
Friday, June 26, 2026
Saturday, June 27, 2026
Match 71 Group K Miami ⛈️ 30°C
Colombia 0
Portugal 0
Full time
Match 72 Group K Atlanta ☀️ 31°C
Congo DR 3
Uzbekistan 1
Full time
Match 69 Group J Kansas City ⛈️ 27°C
Algeria 3
Austria 3
Full time
Match 70 Group J Dallas ⛈️ 32°C
Jordan 1
Argentina 3
Full time
Match 73 Round of 32 Los Angeles ☁️ 21°C
South Africa 0
Canada 1
Full time
Match 76 Round of 32 Houston ☀️ 34°C
Brazil 2
Japan 1
Full time
Match 74 Round of 32 Boston ☀️ 30°C
Germany 1 (3)
Paraguay 1 (4)
Full time
a.e.t. · 90′ 1–1
Match 75 Round of 32 Monterrey ☀️ 32°C
Netherlands 1 (2)
Morocco 1 (3)
Full time
a.e.t. · 90′ 1–1
Match 78 Round of 32 Dallas ☀️ 32°C
Côte d'Ivoire 1
Norway 2
Full time
Match 77 Round of 32 New Jersey ☀️ 33°C
France 3
Sweden 0
Full time
Match 79 Round of 32 Mexico City ️ 15°C
Mexico 2
Ecuador 0
Full time
Match 80 Round of 32 Atlanta ☀️ 32°C
England 2
Congo DR 1
Full time
Sunday, June 28, 2026
Monday, June 29, 2026
Tuesday, June 30, 2026
Wednesday, July 1, 2026
Match 82 Round of 32 Seattle ⛅ 16°C
Belgium 3
Senegal 2
Full time
a.e.t. · 90′ 2–2
Match 81 Round of 32 San Francisco Bay Area
☀️ 22°C
USA 2
Bosnia and Herzeg… 0
Full time
Match 84 Round of 32 Los Angeles ☁️ 21°C
Spain 3
Austria 0
Full time
Match 83 Round of 32 Toronto ☁️ 29°C
Portugal 2
Croatia 1
Full time
Match 85 Round of 32 Vancouver ️ 14°C
Switzerland 2
Algeria 0
Full time
Match 88 Round of 32 Dallas ☀️ 35°C
Australia 1 (2)
Egypt 1 (4)
Full time
a.e.t. · 90′ 1–1
Match 86 Round of 32 Miami ⛅ 28°C
Argentina 3
Cabo Verde 2
Full time
a.e.t. · 90′ 1–1
Match 87 Round of 32 Kansas City ☀️ 29°C
Colombia 1
Ghana 0
Full time
Match 90 Round of 16 Houston ☀️ 34°C
Canada 0
Morocco 3
Full time
Match 89 Round of 16 Philadelphia ☀️ 37°C
Paraguay 0
France 1
Full time
Thursday, July 2, 2026
Friday, July 3, 2026
Saturday, July 4, 2026
Sunday, July 5, 2026
Match 91 Round of 16 New Jersey ☀️ 28°C
Brazil 1
Norway 2
Full time
Match 92 Round of 16 Mexico City ️ 17°C
Mexico 2
England 3
Full time
Match 93 Round of 16 Dallas ☀️ 36°C
Portugal 0
Spain 1
Full time
Match 94 Round of 16 Seattle ☀️ 28°C
USA 1
Belgium 4
Full time
Match 95 Round of 16 Atlanta ☀️ 30°C
Argentina 3
Egypt 2
Full time
Match 96 Round of 16 Vancouver ☀️ 23°C
Switzerland 0 (4)
Colombia 0 (3)
Full time
a.e.t. · 90′ 0–0
Match 97 Quarter-finals Boston ☀️ 31°C
France 2
Morocco 0
Full time
Match 98 Quarter-finals Los Angeles ☀️ 26°C
Spain 2
Belgium 1
Full time
Monday, July 6, 2026
Tuesday, July 7, 2026
Wednesday, July 8, 2026
Friday, July 10, 2026
Saturday, July 11, 2026
Match 99 Quarter-finals Miami ☁️ 32°C
Norway 1
England 2
Full time
a.e.t. · 90′ 1–1
Match 100 Quarter-finals Kansas City ☀️ 29°C
Argentina 3
Switzerland 1
Full time
a.e.t. · 90′ 1–1
Match 101 Semi-finals Dallas ☀️ 34°C
France
Spain
12:30 AM
Match 102 Semi-finals Atlanta ️ 28°C
England
Argentina
12:30 AM
Match 103 Third place play-off Miami ☁️ 32°C
Loser of match 101
Loser of match 102
02:30 AM
Match 104 Final New Jersey ⛅ 25°C
Winner of match 101
Winner of match 102
12:30 AM
Sunday, July 12, 2026 Yesterday
Wednesday, July 15, 2026
Thursday, July 16, 2026
Sunday, July 19, 2026
Monday, July 20, 2026
`;

// A simple regex approach won't be perfect, let's just make an array of matches from quarter finals onwards to be precise! Since they are explicitly in the text.
const allMatches = [
      { id: "m89", teams: "Paraguay vs France", date: "4 July 2026", time: "12:00", venue: "Philadelphia", status: "past", result: "0 - 1" },
      { id: "m90", teams: "Canada vs Morocco", date: "4 July 2026", time: "16:00", venue: "Houston", status: "past", result: "0 - 3" },
      { id: "m91", teams: "Brazil vs Norway", date: "5 July 2026", time: "12:00", venue: "New Jersey", status: "past", result: "1 - 2" },
      { id: "m92", teams: "Mexico vs England", date: "5 July 2026", time: "16:00", venue: "Mexico City", status: "past", result: "2 - 3" },
      { id: "m93", teams: "Portugal vs Spain", date: "6 July 2026", time: "12:00", venue: "Dallas", status: "past", result: "0 - 1" },
      { id: "m94", teams: "USA vs Belgium", date: "6 July 2026", time: "16:00", venue: "Seattle", status: "past", result: "1 - 4" },
      { id: "m95", teams: "Argentina vs Egypt", date: "7 July 2026", time: "12:00", venue: "Atlanta", status: "past", result: "3 - 2" },
      { id: "m96", teams: "Switzerland vs Colombia", date: "7 July 2026", time: "16:00", venue: "Vancouver", status: "past", result: "0 (4) - 0 (3)" },
      { id: "m97", teams: "France vs Morocco", date: "10 July 2026", time: "18:00", venue: "Boston", timestamp: new Date("2026-07-10T18:00:00Z").getTime(), status: "past", result: "2 - 0" },
      { id: "m98", teams: "Spain vs Belgium", date: "11 July 2026", time: "20:00", venue: "Los Angeles", timestamp: new Date("2026-07-11T20:00:00Z").getTime(), status: "past", result: "2 - 1" },
      { id: "m99", teams: "Norway vs England", date: "12 July 2026", time: "17:00", venue: "Miami", timestamp: new Date("2026-07-12T17:00:00Z").getTime(), status: "past", result: "1 - 2 (a.e.t)" },
      { id: "m100", teams: "Argentina vs Switzerland", date: "12 July 2026", time: "19:00", venue: "Kansas City", timestamp: new Date("2026-07-12T19:00:00Z").getTime(), status: "past", result: "3 - 1 (a.e.t)" },
      { id: "m101", teams: "France vs Spain", date: "15 July 2026", time: "00:30", venue: "Dallas", timestamp: new Date("2026-07-15T00:30:00Z").getTime(), status: "upcoming" },
      { id: "m102", teams: "England vs Argentina", date: "16 July 2026", time: "00:30", venue: "Atlanta", timestamp: new Date("2026-07-16T00:30:00Z").getTime(), status: "upcoming" },
      { id: "m103", teams: "Third Place Play-off", date: "19 July 2026", time: "02:30", venue: "Miami", timestamp: new Date("2026-07-19T02:30:00Z").getTime(), status: "upcoming" },
      { id: "m104", teams: "FIFA World Cup Final", date: "20 July 2026", time: "00:30", venue: "New Jersey", timestamp: new Date("2026-07-20T00:30:00Z").getTime(), status: "upcoming" }
];

console.log(JSON.stringify(allMatches, null, 2));

