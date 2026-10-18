/**
 * Health API integrations.
 * For Google Fit / Fitbit OAuth, you need a backend to exchange tokens.
 * This module handles:
 *   - CSV upload parsing (works standalone)
 *   - OAuth URL builders (delegates token exchange to backend)
 */

// ---------- CSV PARSER (manual import) ----------
export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = values[i]));
    return row;
  });
}

// ---------- GOOGLE FIT ----------
// Requires: Google Cloud Project + OAuth Client ID
// Docs: https://developers.google.com/fit/rest
export function getGoogleFitAuthUrl(clientId, redirectUri) {
  const scope = [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// ---------- FITBIT ----------
export function getFitbitAuthUrl(clientId, redirectUri) {
  const scope = "activity heartrate sleep weight";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
  });
  return `https://www.fitbit.com/oauth2/authorize?${params}`;
}

// ---------- SAMSUNG HEALTH (Android-only, requires native app) ----------
// Not available from web — placeholder.
export function getSamsungHealthNote() {
  return "Samsung Health requires a native Android app. Use CSV export from the app instead.";
}