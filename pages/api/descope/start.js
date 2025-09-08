// pages/api/descope/start.js
export default async function handler(req, res) {
  const url = process.env.DESCOPE_FLOW_URL;
  if (!url) {
    return res
      .status(500)
      .json({ error: "DESCOPE_FLOW_URL missing in environment" });
  }
  // Optional: forward a return URL so Descope comes back to your app after auth
  const returnTo = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
  const redirect = url.includes("?")
    ? `${url}&returnUrl=${encodeURIComponent(returnTo)}`
    : `${url}?returnUrl=${encodeURIComponent(returnTo)}`;

  res.writeHead(302, { Location: redirect });
  res.end();
}// pages/descope/callback.js
export default function Connected() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", padding: 24 }}>
      <h2>Slack connected ✅</h2>
      <p>You can close this tab and return to Furnace.</p>
    </div>
  );
}