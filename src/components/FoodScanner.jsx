import { useState, useRef } from "react";

export default function FoodScanner({ onFoodDetected }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async () => {
    if (!image) return;
    setLoading(true);
    setError("");

    try {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];

      const prompt = `Analyze this food image. Return ONLY a valid JSON object with the following structure, no markdown formatting, no extra text:
      {
        "name": "Name of the food",
        "calories": 000,
        "protein": 00,
        "carbs": 00,
        "fat": 00,
        "estimated_grams": 000
      }
      Estimate the values for the entire portion shown in the image.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/interactions?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gemini-3.8-flash", 
            input: [
              { type: "text", text: prompt },
              { type: "image", data: base64Data, mime_type: mimeType }
            ]
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }

      // 👇 FIX: Look for output_text first, then dig into the steps array
      let textResponse = data.output_text;

      if (!textResponse && data.steps && Array.isArray(data.steps)) {
        const modelOutput = data.steps.find(step => step.type === "model_output");
        if (modelOutput && modelOutput.content && Array.isArray(modelOutput.content)) {
          const textBlock = modelOutput.content.find(c => c.type === "text");
          if (textBlock) {
            textResponse = textBlock.text;
          }
        }
      }
      
      if (!textResponse) {
        console.error("Full API Response:", data);
        throw new Error("No text found in API response.");
      }

      // Clean up markdown backticks if the AI adds them
      textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsedResult = JSON.parse(textResponse);
      setResult(parsedResult);
      
      if (onFoodDetected) onFoodDetected(parsedResult);

    } catch (err) {
      console.error(err);
      setError(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "rgba(0,0,0,0.3)", padding: 20, borderRadius: 12, marginBottom: 20, border: "1px solid #00e5ff" }}>
      <h3 style={{ color: "#00e5ff", marginTop: 0 }}>📸 AI Food Camera</h3>
      <p style={{ fontSize: 12, color: "#ccc" }}>Take a photo or upload an image of your meal. Gemini will estimate the calories.</p>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleImageUpload} 
        ref={fileInputRef}
        style={{ display: "none" }} 
      />

      {!image ? (
        <button 
          onClick={() => fileInputRef.current.click()} 
          style={{ width: "100%", padding: 15, background: "#00e5ff", color: "#000", fontWeight: "bold", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          📷 Take Photo / Upload Image
        </button>
      ) : (
        <div>
          <img src={image} alt="Food" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
          
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={analyzeFood} 
              disabled={loading}
              style={{ flex: 1, padding: 12, background: "#22c55e", color: "white", fontWeight: "bold", border: "none", borderRadius: 8, cursor: loading ? "wait" : "pointer" }}
            >
              {loading ? "🧠 Analyzing..." : "✨ Analyze with AI"}
            </button>
            <button 
              onClick={() => setImage(null)} 
              style={{ padding: 12, background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
            >
              ✕ Retake
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 10 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 15, padding: 15, background: "rgba(0, 229, 255, 0.1)", borderRadius: 8, border: "1px solid #00e5ff" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "white" }}>{result.name}</h4>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#ccc" }}>
            <span>🔥 {result.calories} kcal</span>
            <span>P: {result.protein}g</span>
            <span>C: {result.carbs}g</span>
            <span>F: {result.fat}g</span>
          </div>
          <p style={{ fontSize: 11, color: "#00e5ff", marginTop: 8 }}>Estimated Weight: {result.estimated_grams}g</p>
        </div>
      )}
    </div>
  );
}