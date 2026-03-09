import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:3456";

type BlockType = "wake" | "supplements" | "meal" | "work" | "gym" | "pool" | "personal" | "wind" | "sleep" | "calendar";

interface Block {
  s: number; // start minutes from midnight
  e: number; // end minutes from midnight
  t: BlockType;
  title: string;
  d: string; // detail
}

const TYPE_META: Record<BlockType, { color: string; label: string }> = {
  wake:        { color: "#C4B882", label: "Morning" },
  supplements: { color: "#4A6741", label: "Supplements" },
  meal:        { color: "#C17B3A", label: "Meal" },
  work:        { color: "#4A6741", label: "Work" },
  gym:         { color: "#7B5EA7", label: "Gym" },
  pool:        { color: "#7B5EA7", label: "Pool League" },
  personal:    { color: "#4A7B8C", label: "Personal" },
  wind:        { color: "#4A7B8C", label: "Wind Down" },
  sleep:       { color: "#8C5A4A", label: "Sleep" },
  calendar:    { color: "#3B82F6", label: "Calendar" },
};

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

const SCHEDULE: Record<string, Block[]> = {
  Monday: [
    { s:480, e:495, t:"wake", title:"Wake Up + Morning Reset", d:"No phone scroll. Feet on floor, splash water, open blinds." },
    { s:495, e:525, t:"supplements", title:"Morning Supplements + Coffee", d:"D3 5000IU + Omega-3 2g + B-Complex + L-Theanine 200mg with coffee." },
    { s:525, e:570, t:"meal", title:"Breakfast (IF break at noon)", d:"Fasting until 12pm. Coffee + supplements are fine." },
    { s:570, e:720, t:"work", title:"Deep Work Block 1 -- DoCurious", d:"Hardest cognitive work first. No Slack or email until this block is done." },
    { s:720, e:750, t:"meal", title:"Lunch (IF window opens)", d:"Rotisserie chicken + rice + cucumber/tomato. ~50g protein." },
    { s:750, e:765, t:"personal", title:"15-Min Walk Outside", d:"No phone. AZ sun + movement = free dopamine + serotonin." },
    { s:765, e:930, t:"work", title:"Deep Work Block 2 -- DoCurious", d:"Product strategy, async comms, Mission Control updates." },
    { s:930, e:990, t:"work", title:"Admin + Email Block", d:"Slack, emails, lightweight tasks." },
    { s:990, e:1050, t:"personal", title:"Decompression Window", d:"Critical AuDHD reset before pool night. Low stimulation." },
    { s:1050, e:1080, t:"meal", title:"Early Dinner (Pre-Pool)", d:"Turkey wrap + side salad. Light, ~40g protein." },
    { s:1080, e:1140, t:"personal", title:"Pool Prep + Travel", d:"Equipment check, mental prep, travel to venue." },
    { s:1140, e:1320, t:"pool", title:"Pool League -- Monday", d:"Compete. Water between games. Enjoy this." },
    { s:1320, e:1350, t:"meal", title:"Post-Pool Recovery Snack", d:"Protein shake or cottage cheese. ~30g protein." },
    { s:1350, e:1410, t:"wind", title:"Wind Down", d:"Magnesium Glycinate 400mg + Zinc 25mg. Phone down by 11:30pm." },
    { s:1410, e:1440, t:"sleep", title:"Sleep", d:"Target 12:00am -- 8:00am." },
  ],
  Tuesday: [
    { s:480, e:495, t:"wake", title:"Wake Up + Morning Reset", d:"Second pool night. Set the day up so you arrive tonight calm." },
    { s:495, e:525, t:"supplements", title:"Morning Supplements + Coffee", d:"D3 5000IU + Omega-3 2g + B-Complex + L-Theanine 200mg." },
    { s:525, e:570, t:"meal", title:"Breakfast (IF break at noon)", d:"Fasting until 12pm. Coffee + supplements are fine." },
    { s:570, e:720, t:"work", title:"Deep Work Block 1 -- DoCurious", d:"Build sessions. Code, design, platform architecture." },
    { s:720, e:750, t:"meal", title:"Lunch", d:"Canned salmon/tuna + crackers + avocado + carrots. ~45g protein." },
    { s:750, e:765, t:"personal", title:"Sunlight Break", d:"Step outside. Light + movement resets the afternoon." },
    { s:765, e:930, t:"work", title:"Deep Work Block 2 -- DoCurious", d:"Product strategy, design system work, CPO evidence building." },
    { s:930, e:990, t:"work", title:"Admin + Comms Block", d:"Team async updates, Slack catch-up." },
    { s:990, e:1050, t:"personal", title:"Sensory Reset (Critical)", d:"Back-to-back pool nights = high demand. Quiet, dim, hydrate." },
    { s:1050, e:1080, t:"meal", title:"Early Dinner (Pre-Pool)", d:"Chicken thighs + sweet potato + broccoli. ~45g protein." },
    { s:1080, e:1140, t:"personal", title:"Pool Prep + Travel", d:"Mental prep + visualization. Arrive ready." },
    { s:1140, e:1320, t:"pool", title:"Pool League -- Tuesday", d:"Night 2. Play YOUR game. Trust your stroke." },
    { s:1320, e:1350, t:"meal", title:"Recovery Snack", d:"Cottage cheese + walnuts. ~25g slow-digesting protein." },
    { s:1350, e:1410, t:"wind", title:"Wind Down", d:"Magnesium 400mg + Zinc 25mg. No decisions tonight." },
    { s:1410, e:1440, t:"sleep", title:"Sleep", d:"Recovery from 2 late nights." },
  ],
  Wednesday: [
    { s:480, e:500, t:"wake", title:"Wake Up -- Gym Day", d:"Recovery morning post-pool. Gentle start." },
    { s:500, e:530, t:"supplements", title:"Morning Supplements + Coffee", d:"D3 5000IU + Omega-3 2g + B-Complex + L-Theanine 200mg." },
    { s:530, e:570, t:"meal", title:"Pre-Workout Breakfast", d:"2 eggs + 2 egg whites + oatmeal with protein powder. ~45g protein." },
    { s:570, e:630, t:"gym", title:"GYM -- Upper Body Push", d:"Bench 3x8 + OHP 3x10 + Lat Raises 3x15 + Tricep Pushdowns 3x12 + Cable Flys 3x15." },
    { s:630, e:660, t:"meal", title:"Post-Workout Protein", d:"Protein shake + banana. ~40g protein. Don't skip this." },
    { s:660, e:780, t:"work", title:"Deep Work Block 1 -- DoCurious", d:"Post-gym dopamine = best focus window of the week." },
    { s:780, e:810, t:"meal", title:"Lunch", d:"Turkey taco bowl: turkey + rice + beans + salsa + cheese. ~55g protein." },
    { s:810, e:990, t:"work", title:"Deep Work Block 2 -- DoCurious", d:"Meetings, product strategy, Mission Control." },
    { s:990, e:1020, t:"work", title:"Admin Block", d:"Clear inbox, prep for Thursday." },
    { s:1020, e:1080, t:"personal", title:"Personal Development", d:"Head of Product skill-building. PM reading, update WINS.md." },
    { s:1080, e:1110, t:"meal", title:"Dinner", d:"Salmon + quinoa + asparagus. ~50g protein." },
    { s:1110, e:1320, t:"personal", title:"Free Time / Creative Space", d:"No DoCurious. Personal projects, TV, recharge." },
    { s:1320, e:1380, t:"wind", title:"Wind Down", d:"Magnesium 400mg + Zinc 25mg. No screens after 11:30pm." },
    { s:1380, e:1440, t:"sleep", title:"Sleep", d:"First full recovery night of the week." },
  ],
  Thursday: [
    { s:480, e:500, t:"wake", title:"Wake Up", d:"Rest day. High-focus work day. Nervous system is recovered." },
    { s:500, e:530, t:"supplements", title:"Morning Supplements + Coffee", d:"D3 5000IU + Omega-3 2g + B-Complex + L-Theanine 200mg." },
    { s:530, e:570, t:"meal", title:"Breakfast (IF break at noon)", d:"Fasting until 12pm. Coffee + supplements are fine." },
    { s:570, e:750, t:"work", title:"Deep Work Block 1 -- DoCurious", d:"Prime exec function day. Tackle the hardest problem first." },
    { s:750, e:780, t:"meal", title:"Lunch", d:"Chicken Caesar wrap + fruit. ~45g protein." },
    { s:780, e:795, t:"personal", title:"15-Min Walk", d:"Active recovery. Move the body, clear the head." },
    { s:795, e:960, t:"work", title:"Deep Work Block 2 -- DoCurious", d:"Product leadership work. Update WINS.md. CPO skill gaps." },
    { s:960, e:1020, t:"work", title:"Admin + Planning Block", d:"What needs to ship Friday? Clear blockers." },
    { s:1020, e:1110, t:"personal", title:"Decompression + Personal Time", d:"Sensory reset. Walk, stretch, music. Recharge." },
    { s:1110, e:1140, t:"meal", title:"Dinner", d:"Shrimp stir-fry + rice noodles + veg. ~45g protein." },
    { s:1140, e:1320, t:"personal", title:"Free Evening", d:"TV, pool practice, anything restorative. Zero work." },
    { s:1320, e:1380, t:"wind", title:"Wind Down", d:"Magnesium 400mg + Zinc 25mg. Wind down ritual." },
    { s:1380, e:1440, t:"sleep", title:"Sleep", d:"Consistent timing. Rest is earned." },
  ],
  Friday: [
    { s:480, e:500, t:"wake", title:"Wake Up -- Friday Gym Day", d:"End-of-week energy. Gym + ship it." },
    { s:500, e:530, t:"supplements", title:"Morning Supplements + Coffee", d:"D3 5000IU + Omega-3 2g + B-Complex + L-Theanine 200mg." },
    { s:530, e:570, t:"meal", title:"Pre-Workout Breakfast", d:"Protein pancakes: powder + egg + banana + milk. ~40g protein." },
    { s:570, e:630, t:"gym", title:"GYM -- Lower Body", d:"Squats 3x8 + RDLs 3x10 + Leg Press 3x12 + Hip Thrusts 3x15 + Calves 3x15 + Plank 3x30s." },
    { s:630, e:660, t:"meal", title:"Post-Workout Protein", d:"Protein shake + rice cake with almond butter. ~40g protein." },
    { s:660, e:780, t:"work", title:"Deep Work -- Ship It Block", d:"Close out the week. Finish what needs to ship." },
    { s:780, e:810, t:"meal", title:"Lunch", d:"Big salad: chicken + eggs + feta + chickpeas. ~55g protein." },
    { s:810, e:960, t:"work", title:"Wrap-Up + WINS.md", d:"Finish tasks. Document progress. Update WINS.md." },
    { s:960, e:1020, t:"personal", title:"End of Work Week Ritual", d:"Close all tabs. Write 3 wins. You are OFF WORK." },
    { s:1020, e:1080, t:"personal", title:"Decompression", d:"Walk, music, sensory reset. Week is DONE." },
    { s:1080, e:1110, t:"meal", title:"Dinner -- Treat Meal", d:"Sushi or your favorite. ~55g protein. You earned it." },
    { s:1110, e:1440, t:"personal", title:"Friday Night -- Full Freedom", d:"Zero rules. Completely off the clock." },
  ],
  Saturday: [
    { s:480, e:540, t:"wake", title:"Slow Morning", d:"No rush. Intentionally restorative." },
    { s:540, e:570, t:"supplements", title:"Morning Supplements + Coffee", d:"D3 5000IU + Omega-3 2g + B-Complex + L-Theanine 200mg." },
    { s:570, e:615, t:"meal", title:"Breakfast", d:"Veggie scramble: 3 eggs + turkey sausage + peppers + spinach. ~45g protein." },
    { s:615, e:675, t:"gym", title:"GYM -- Upper Body Pull + Core", d:"Lat Pulldown 3x8 + Rows 3x10 + Face Pulls 3x15 + Curls 3x12 + Planks 3x40s + Dead Bugs 3x10." },
    { s:675, e:705, t:"meal", title:"Post-Workout Protein", d:"Protein shake + apple. ~35g protein." },
    { s:705, e:825, t:"personal", title:"Meal Prep Session", d:"Grill chicken, hard-boil eggs, cook grains. 90 min = zero food decisions Mon-Wed." },
    { s:825, e:855, t:"meal", title:"Lunch", d:"Test your meal prep. Simple, nourishing." },
    { s:855, e:1020, t:"personal", title:"Free Time", d:"Pool practice, errands, socializing -- whatever sounds good." },
    { s:1020, e:1050, t:"meal", title:"Dinner", d:"Turkey meatballs + zucchini noodles + marinara. ~50g protein." },
    { s:1050, e:1380, t:"personal", title:"Saturday Evening -- Full Freedom", d:"Full recharge. You do not need to be productive." },
    { s:1380, e:1440, t:"wind", title:"Wind Down", d:"Magnesium 400mg + Zinc 25mg. Don't go too late." },
  ],
  Sunday: [
    { s:480, e:570, t:"wake", title:"Slow Restorative Morning", d:"No gym. No hustle. Full nervous system recovery." },
    { s:570, e:600, t:"supplements", title:"Morning Supplements + Coffee", d:"D3 5000IU + Omega-3 2g + B-Complex + L-Theanine 200mg." },
    { s:600, e:645, t:"meal", title:"Brunch Breakfast", d:"Make something you enjoy. High protein, your choice." },
    { s:645, e:765, t:"personal", title:"Weekly Review + Planning", d:"Review WINS.md. Plan next week's top 3 priorities." },
    { s:765, e:855, t:"personal", title:"Meal Prep (Main Session)", d:"Stock fridge for Mon-Wed. Batch proteins, prepped lunches." },
    { s:855, e:885, t:"meal", title:"Lunch", d:"Meal prep tester. Assembled chicken bowl." },
    { s:885, e:975, t:"personal", title:"Gentle Walk", d:"Active recovery. AZ sunshine. No intensity." },
    { s:975, e:1095, t:"personal", title:"Free / Restorative Time", d:"Read, pool practice, nap. Whatever fills your tank." },
    { s:1095, e:1125, t:"meal", title:"Dinner", d:"Something satisfying and comforting." },
    { s:1125, e:1245, t:"personal", title:"Monday Prep", d:"Lay out gym clothes, pool gear. Review Monday schedule." },
    { s:1245, e:1380, t:"personal", title:"Evening Wind Down", d:"No work, no screens, low stimulation." },
    { s:1380, e:1440, t:"wind", title:"Wind Down + Sleep Prep", d:"Magnesium 400mg + Zinc 25mg. Aim for 8 hours." },
  ],
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function minutesSinceMidnight(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatTime(mins: number): string {
  const h = Math.floor(mins / 60) % 12 || 12;
  const m = (mins % 60).toString().padStart(2, "0");
  const ampm = mins >= 720 ? "pm" : "am";
  return `${h}:${m}${ampm}`;
}

function formatDuration(mins: number): string {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

export function Today() {
  const [now, setNow] = useState(minutesSinceMidnight());
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const interval = setInterval(() => setNow(minutesSinceMidnight()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Check calendar connection status
  useEffect(() => {
    fetch(`${API}/api/calendar/status`)
      .then((r) => r.json())
      .then((data) => setCalendarConnected(data.connected))
      .catch(() => {});
  }, [searchParams]);

  // Fetch calendar events
  useEffect(() => {
    if (!calendarConnected) return;
    fetch(`${API}/api/calendar/events`)
      .then((r) => r.json())
      .then((data) => {
        if (data.events) setCalendarEvents(data.events);
      })
      .catch(() => {});
  }, [calendarConnected]);

  const dayName = DAYS[new Date().getDay()];
  const scheduleBlocks = SCHEDULE[dayName] || [];

  // Convert calendar events to blocks and merge
  const calBlocks: Block[] = calendarEvents
    .filter((ev) => !ev.allDay)
    .map((ev) => {
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      return {
        s: start.getHours() * 60 + start.getMinutes(),
        e: end.getHours() * 60 + end.getMinutes(),
        t: "calendar" as BlockType,
        title: ev.title,
        d: ev.location ? `📍 ${ev.location}` : "Google Calendar event",
      };
    });

  const allDayEvents = calendarEvents.filter((ev) => ev.allDay);

  // Merge: calendar events appear alongside schedule blocks, sorted by start time
  const blocks = [...scheduleBlocks, ...calBlocks].sort((a, b) => a.s - b.s);

  // Find current block
  const currentIdx = blocks.findIndex((b) => now >= b.s && now < b.e);
  const nextIdx = currentIdx >= 0 ? currentIdx + 1 : blocks.findIndex((b) => b.s > now);

  // Day tags
  const hasGym = blocks.some((b) => b.t === "gym");
  const hasPool = blocks.some((b) => b.t === "pool");
  const tags: string[] = [];
  if (hasGym) tags.push("Gym Day");
  if (hasPool) tags.push("Pool Night");
  if (!hasGym && !hasPool) {
    const isWeekend = [0, 6].includes(new Date().getDay());
    tags.push(isWeekend ? "Rest + Recharge" : "Focus Day");
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-24">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-widest text-text-tertiary mb-1">
          {dayName}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-xl text-text-primary">
          Today's Plan
        </h1>
        <div className="flex gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-bg-secondary text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar connection */}
      {!calendarConnected && (
        <a
          href={`${API}/api/auth/google/connect`}
          className="press-target flex items-center gap-2 mb-5 px-4 py-3 bg-bg-surface rounded-[var(--radius-card)] text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          Connect Google Calendar
          <span className="ml-auto text-[10px] text-text-tertiary">read-only</span>
        </a>
      )}

      {/* All-day calendar events */}
      {allDayEvents.length > 0 && (
        <div className="mb-5 space-y-1">
          {allDayEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-2 px-3 py-2 bg-[#3B82F6]/10 rounded-lg text-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              <span className="text-text-primary">{ev.title}</span>
              <span className="text-[10px] text-text-tertiary ml-auto">all day</span>
            </div>
          ))}
        </div>
      )}

      {/* Current block highlight */}
      {currentIdx >= 0 && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest text-accent mb-2">
            Right now
          </p>
          <CurrentBlock block={blocks[currentIdx]} now={now} />
        </div>
      )}

      {/* Next up */}
      {nextIdx >= 0 && nextIdx < blocks.length && currentIdx !== nextIdx && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest text-text-tertiary mb-2">
            Up next -- {formatTime(blocks[nextIdx].s)}
          </p>
          <div
            className="bg-bg-surface rounded-[var(--radius-card)] p-4"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: TYPE_META[blocks[nextIdx].t].color }}
              />
              <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
                {TYPE_META[blocks[nextIdx].t].label}
              </span>
            </div>
            <p className="text-sm font-medium">{blocks[nextIdx].title}</p>
          </div>
        </div>
      )}

      {/* Full timeline */}
      <p className="text-[10px] uppercase tracking-widest text-text-tertiary mb-3">
        Full day
      </p>
      <div className="space-y-1">
        {blocks.map((block, idx) => {
          const isPast = now >= block.e;
          const isCurrent = idx === currentIdx;
          const isExpanded = expandedIdx === idx;
          const meta = TYPE_META[block.t];
          const duration = block.e - block.s;

          return (
            <button
              key={idx}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              className={`press-target w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150 ${
                isCurrent
                  ? "bg-bg-surface ring-1 ring-accent/30"
                  : isPast
                    ? "opacity-40"
                    : "hover:bg-bg-surface/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text-tertiary w-14 shrink-0 font-[family-name:var(--font-mono)]">
                  {formatTime(block.s)}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <span className={`text-sm flex-1 ${isCurrent ? "font-medium" : ""}`}>
                  {block.title}
                </span>
                <span className="text-[10px] text-text-tertiary font-[family-name:var(--font-mono)]">
                  {formatDuration(duration)}
                </span>
              </div>
              {isExpanded && (
                <div className="mt-2 ml-[74px] text-xs text-text-secondary leading-relaxed">
                  {block.d}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CurrentBlock({ block, now }: { block: Block; now: number }) {
  const meta = TYPE_META[block.t];
  const elapsed = now - block.s;
  const total = block.e - block.s;
  const remaining = block.e - now;
  const progress = Math.min(100, (elapsed / total) * 100);

  return (
    <div
      className="bg-bg-surface rounded-[var(--radius-card)] p-5 border-l-[6px]"
      style={{ borderLeftColor: meta.color, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="text-[10px] text-text-tertiary">
          {formatTime(block.s)} -- {formatTime(block.e)}
        </span>
      </div>
      <p className="text-base font-medium mb-2">{block.title}</p>
      <p className="text-xs text-text-secondary mb-3 leading-relaxed">{block.d}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, backgroundColor: meta.color }}
          />
        </div>
        <span className="text-[10px] text-text-tertiary font-[family-name:var(--font-mono)] shrink-0">
          {formatDuration(remaining)} left
        </span>
      </div>
    </div>
  );
}
