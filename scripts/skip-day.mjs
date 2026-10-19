// Prints which standard day (Monday, Wednesday, Friday or Saturday) is skipped in the week of the given date.
// The pick is random-looking but fixed for each week, so every run that week agrees.
// Usage: node scripts/skip-day.mjs [YYYY-MM-DD]   (defaults to today in Europe/London)
const DAYS = ["Monday", "Wednesday", "Friday", "Saturday"];
const arg = process.argv[2] || new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const d = new Date(arg + "T12:00:00Z");
const monday = new Date(d); monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
const key = monday.toISOString().slice(0, 10);
let h = 2166136261; for (const c of "powr-skip:" + key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
const skip = DAYS[h % 4];
const today = d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
console.log(JSON.stringify({ week: key, skip, today, skipToday: today === skip }));
