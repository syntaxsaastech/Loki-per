import { useState } from "react";
import {
  searchWorkouts,
  calculateCaloriesBurned,
  getWorkoutCategories,
} from "../data/workouts";

export default function Workout() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [weight, setWeight] = useState(80);
  const [duration, setDuration] = useState(30);

  const categories = ["All", ...getWorkoutCategories()];
  const results = search ? searchWorkouts(search) : [];
  const filtered = results.filter(
    (w) => category === "All" || w.category === category
  );

  return (
    <div className="page">
      <h1>💪 Workouts</h1>
      <p className="page-sub">232 exercises with calorie estimates.</p>

      <input
        placeholder="Search exercises (pushup, squat, running)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div className="form-row">
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Duration (min)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>

      {filtered.map((w) => {
        const cals = calculateCaloriesBurned(w, weight, duration);
        return (
          <div key={w.id} className="workout-card">
            <div className="wc-name">{w.name}</div>
            <div className="wc-meta">
              {w.category} · {w.muscle} · {w.equipment}
            </div>
            <div className="wc-cals">🔥 {cals} kcal / {duration}min</div>
          </div>
        );
      })}
    </div>
  );
}