import { useState } from "react";
import { parseCSV } from "../utils/healthApis";

export function useHealthSync() {
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState({
    steps: null,
    heartRate: null,
    sleep: null,
    caloriesBurned: null,
  });

  // CSV upload — works everywhere
  const importCSV = async (file) => {
    setSyncing(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const parsed = {
        steps: rows.reduce((s, r) => s + Number(r.steps || 0), 0),
        heartRate: rows.map((r) => Number(r.heartrate || r.bpm || 0)).filter(Boolean),
        sleep: rows.reduce((s, r) => s + Number(r.sleep || r.sleep_hours || 0), 0),
        caloriesBurned: rows.reduce((s, r) => s + Number(r.calories || r.calories_burned || 0), 0),
        rows,
      };
      setData(parsed);
      return parsed;
    } finally {
      setSyncing(false);
    }
  };

  const syncGoogleFit = (clientId) => {
    const redirect = window.location.origin + "/health";
    window.location.href = `/api/health/google/auth?clientId=${clientId}&redirect=${encodeURIComponent(redirect)}`;
  };

  const syncFitbit = (clientId) => {
    const redirect = window.location.origin + "/health";
    window.location.href = `/api/health/fitbit/auth?clientId=${clientId}&redirect=${encodeURIComponent(redirect)}`;
  };

  return { syncing, data, importCSV, syncGoogleFit, syncFitbit };
}