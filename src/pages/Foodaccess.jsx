import { useState } from "react";
import { searchFoods, getCategories } from "../data/nutritionData";
import FoodScanner from "../components/FoodScanner";
import { useFood } from "../hooks/useFood";

const MEAL_TIMES = ["Morning", "Afternoon", "Evening", "Night", "Snack"];

export default function Foodaccess() {
  const {
    todayMeals,
    yesterdayMeals,
    todayTotals,
    yesterdayTotals,
    loading,
    error,
    saveMeal,
    deleteMeal,
  } = useFood();

  // Meal state
  const [mealName, setMealName] = useState("");
  const [mealTime, setMealTime] = useState("Morning");
  const [items, setItems] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100);

  const categories = ["All", ...getCategories()];
  const results =
    searchQuery.trim().length > 0
      ? searchFoods(searchQuery).filter(
          (f) => selectedCategory === "All" || f.category === selectedCategory
        )
      : [];

  // ---------- ADD ITEM (MANUAL) ----------
  const addItemToMeal = () => {
    if (!selectedFood) return;
    const factor = grams / 100;
    const item = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      grams,
      calories: +(selectedFood.calories * factor).toFixed(1),
      protein: +(selectedFood.protein * factor).toFixed(1),
      carbs: +(selectedFood.carbs * factor).toFixed(1),
      fat: +(selectedFood.fat * factor).toFixed(1),
      sodium: +(selectedFood.sodium * factor).toFixed(1),
      potassium: +(selectedFood.potassium * factor).toFixed(1),
      cholesterol: +(selectedFood.cholesterol * factor).toFixed(1),
      fiber: +((selectedFood.fiber || 0) * factor).toFixed(1),
      sugar: +((selectedFood.sugar || 0) * factor).toFixed(1),
    };
    setItems((prev) => [...prev, item]);
    setSelectedFood(null);
    setSearchQuery("");
    setGrams(100);
  };

  // ---------- ADD ITEM (AI CAMERA) ----------
  const handleAIFood = (aiData) => {
    const item = {
      foodId: "ai-detected",
      name: aiData.name,
      grams: aiData.estimated_grams || 100,
      calories: aiData.calories,
      protein: aiData.protein,
      carbs: aiData.carbs,
      fat: aiData.fat,
      sodium: 0,
      potassium: 0,
      cholesterol: 0,
      fiber: 0,
      sugar: 0,
    };
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totals = items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein: acc.protein + i.protein,
      carbs: acc.carbs + i.carbs,
      fat: acc.fat + i.fat,
      sodium: acc.sodium + i.sodium,
      potassium: acc.potassium + i.potassium,
      cholesterol: acc.cholesterol + i.cholesterol,
      fiber: acc.fiber + i.fiber,
      sugar: acc.sugar + i.sugar,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sodium: 0,
      potassium: 0,
      cholesterol: 0,
      fiber: 0,
      sugar: 0,
    }
  );

  // ---------- SAVE MEAL (Auto-fills name if empty) ----------
  const handleSaveToFirebase = async () => {
    try {
      // If user didn't type a name, auto-generate one based on the time
      const finalName = mealName.trim() || `${mealTime} Meal`;
      
      await saveMeal(finalName, mealTime, items, totals);
      setMealName("");
      setItems([]);
      alert("✅ Meal saved to Firebase!");
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    }
  };

  return (
    <div className="page">
      <h1>🍱 Food Tracker</h1>
      <p className="page-sub">
        Add ingredients via AI Camera or Manual Search, track full nutrition, save to the cloud.
      </p>

      {error && <div className="error-box">{error}</div>}

      {/* ============ MEAL NAME + TIME ============ */}
      <div className="meal-name-row">
        <input
          type="text"
          placeholder="Meal name (optional, e.g., Chicken Biryani)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
        />
        <select
          value={mealTime}
          onChange={(e) => setMealTime(e.target.value)}
          className="meal-time-select"
        >
          {MEAL_TIMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* ============ AI CAMERA ============ */}
      <FoodScanner onFoodDetected={handleAIFood} />

      {/* ============ MANUAL SEARCH ============ */}
      <h3 style={{ marginTop: 20, color: "#00e5ff" }}>🔍 Or Search Manually</h3>
      <div className="food-search-box">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search food (e.g., rice, chicken, oil)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="food-search-input"
        />
      </div>

      {results.length > 0 && (
        <div className="search-results-inline">
          {results.slice(0, 20).map((f) => (
            <div
              key={f.id}
              className={`search-result-item ${
                selectedFood?.id === f.id ? "active" : ""
              }`}
              onClick={() => setSelectedFood(f)}
            >
              <div className="sr-name">{f.name}</div>
              <div className="sr-meta">
                {f.calories} kcal · {f.protein}g protein /100g
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ SELECTED FOOD ============ */}
      {selectedFood && (
        <div className="selected-food-box">
          <div className="sf-name">{selectedFood.name}</div>
          <div className="sf-per100">
            Per 100g: {selectedFood.calories} kcal · P {selectedFood.protein}g ·
            C {selectedFood.carbs}g · F {selectedFood.fat}g
          </div>
          <div className="sf-controls">
            <label>Quantity (grams):</label>
            <input
              type="number"
              min="1"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value) || 0)}
            />
            <button className="btn-add" onClick={addItemToMeal}>
              ＋ Add to Meal
            </button>
          </div>
        </div>
      )}

      {/* ============ MEAL ITEMS + TOTALS ============ */}
      {items.length > 0 && (
        <div className="meal-items">
          <h3>Ingredients ({items.length})</h3>
          {items.map((it, i) => (
            <div key={i} className="meal-item">
              <div className="mi-name">
                {it.name} — <b>{it.grams}g</b>
              </div>
              <div className="mi-nutrition">
                🔥 {it.calories} kcal · P {it.protein}g · C {it.carbs}g · F{" "}
                {it.fat}g
              </div>
              <button className="mi-del" onClick={() => removeItem(i)}>
                🗑️
              </button>
            </div>
          ))}

          <div className="meal-totals">
            <h3>Total Nutrition</h3>
            <div className="totals-grid">
              <div className="total-card">
                <div className="total-num">{totals.calories.toFixed(0)}</div>
                <div className="total-label">Calories</div>
              </div>
              <div className="total-card">
                <div className="total-num">{totals.protein.toFixed(1)}g</div>
                <div className="total-label">Protein</div>
              </div>
              <div className="total-card">
                <div className="total-num">{totals.carbs.toFixed(1)}g</div>
                <div className="total-label">Carbs</div>
              </div>
              <div className="total-card">
                <div className="total-num">{totals.fat.toFixed(1)}g</div>
                <div className="total-label">Fat</div>
              </div>
            </div>
            
            <button className="btn-primary" onClick={handleSaveToFirebase}>
              💾 Save Meal to Firebase
            </button>
          </div>
        </div>
      )}

      {/* ============ BIG TODAY & YESTERDAY CARDS ============ */}
      <div style={{ display: "flex", gap: "20px", marginTop: "30px", flexWrap: "wrap" }}>
        
        {/* TODAY CARD */}
        <div style={{ flex: 1, minWidth: "250px", background: "rgba(0, 229, 255, 0.1)", border: "2px solid #00e5ff", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ margin: "0 0 10px 0", color: "#00e5ff" }}>Today</h2>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "white" }}>
            {todayTotals.calories.toFixed(0)} <span style={{ fontSize: "16px", color: "#ccc" }}>kcal</span>
          </div>
          <div style={{ display: "flex", gap: "15px", marginTop: "10px", fontSize: "13px", color: "#ccc" }}>
            <span>P: {todayTotals.protein.toFixed(1)}g</span>
            <span>C: {todayTotals.carbs.toFixed(1)}g</span>
            <span>F: {todayTotals.fat.toFixed(1)}g</span>
          </div>
        </div>

        {/* YESTERDAY CARD */}
        <div style={{ flex: 1, minWidth: "250px", background: "rgba(100, 100, 100, 0.1)", border: "2px solid #555", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ margin: "0 0 10px 0", color: "#aaa" }}>Yesterday</h2>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ccc" }}>
            {yesterdayTotals.calories.toFixed(0)} <span style={{ fontSize: "16px", color: "#888" }}>kcal</span>
          </div>
          <div style={{ display: "flex", gap: "15px", marginTop: "10px", fontSize: "13px", color: "#888" }}>
            <span>P: {yesterdayTotals.protein.toFixed(1)}g</span>
            <span>C: {yesterdayTotals.carbs.toFixed(1)}g</span>
            <span>F: {yesterdayTotals.fat.toFixed(1)}g</span>
          </div>
        </div>

      </div>

      {/* ============ SAVED MEALS LIST ============ */}
      <div className="saved-meals" style={{ marginTop: "30px" }}>
        <h3>Today's Meals ({todayMeals.length})</h3>
        {loading && <p className="routine-empty">Loading…</p>}
        {!loading && todayMeals.length === 0 && (
          <div className="routine-empty">🌱 No meals saved yet.</div>
        )}
        
        {todayMeals.map((m) => (
          <div key={m.id} className="saved-meal-card">
            <div className="sm-header">
              <div className="sm-name">
                {m.name} <span className="sm-time">({m.time})</span>
              </div>
              <button className="sm-del" onClick={() => deleteMeal(m.id)}>
                🗑️
              </button>
            </div>
            <div className="sm-totals">
              🔥 {m.totals?.calories} kcal · P {m.totals?.protein}g · C {m.totals?.carbs}g · F {m.totals?.fat}g
            </div>
            <div className="sm-items">
              {m.items.map((it, i) => (
                <span key={i} className="sm-chip">
                  {it.name} ({it.grams}g)
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}