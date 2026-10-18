export const BADGES = [
  { id: "first_goal",   req: "goals>=1",      label: "🌱 First Goal",   desc: "Created your first goal" },
  { id: "five_goals",   req: "goals>=5",      label: "🎯 Goal Setter",  desc: "Created 5 goals" },
  { id: "first_done",   req: "done>=1",       label: "✅ Completed",    desc: "Completed a goal" },
  { id: "ten_done",     req: "done>=10",      label: "🏅 Achiever",     desc: "Completed 10 goals" },
  { id: "streak_3",     req: "streak>=3",     label: "🔥 3-Day Streak", desc: "3 days in a row" },
  { id: "streak_7",     req: "streak>=7",     label: "🔥 1 Week Streak","desc": "7 days in a row" },
  { id: "streak_30",    req: "streak>=30",    label: "🏆 1 Month",      desc: "30 days in a row" },
  { id: "perfect_day",  req: "progress==100", label: "⭐ Perfect Day",  desc: "100% on all goals" },
  { id: "water_master", req: "water>=8",      label: "💧 Water Master", desc: "Drank 8+ glasses" },
  { id: "step_hero",    req: "steps>=10000",  label: "👟 Step Hero",    desc: "10,000 steps in a day" },
  { id: "sleep_king",   req: "sleep>=8",      label: "😴 Sleep King",   desc: "Slept 8+ hours" },
  { id: "workout_warrior", req: "workout>=1", label: "💪 Workout Warrior", desc: "Logged a workout" },
];

export const GOAL_PRESETS = [
  { name: "Drink Water",     target: 8,     unit: "glasses", icon: "💧", color: "#06b6d4" },
  { name: "Walk",            target: 10000, unit: "steps",   icon: "👟", color: "#22c55e" },
  { name: "Sleep",           target: 8,     unit: "hours",   icon: "😴", color: "#a855f7" },
  { name: "Workout",         target: 30,    unit: "min",     icon: "🏋️", color: "#ef4444" },
  { name: "Read Books",      target: 30,    unit: "pages",   icon: "📚", color: "#3b82f6" },
  { name: "Save Money",      target: 100,   unit: "₹",       icon: "💰", color: "#eab308" },
  { name: "Meditate",        target: 10,    unit: "min",     icon: "🧘", color: "#14b8a6" },
  { name: "No Social Media", target: 2,     unit: "hours",   icon: "📵", color: "#f97316" },
  { name: "Study",           target: 120,   unit: "min",     icon: "📖", color: "#8b5cf6" },
  { name: "Custom",          target: 1,     unit: "count",   icon: "⭐", color: "#64748b" },
];