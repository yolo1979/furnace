// pages/api/descope/start.js
export default function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_DESCOPE_FLOW_URL; // Your hosted Descope flow link

  if (!url) {
    return res
      .status(500)
      .json({ error: "NEXT_PUBLIC_DESCOPE_FLOW_URL not set in environment" });
  }

  // After auth, Descope will send the user back here:
  const returnTo = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/descope/connected`;

  const redirect = url.includes("?")
    ? `${url}&returnUrl=${encodeURIComponent(returnTo)}`
    : `${url}?returnUrl=${encodeURIComponent(returnTo)}`;

  res.writeHead(302, { Location: redirect });
  res.end();
}