// pages/api/tally/save.js
// In-memory store (OK for demo/hackathon; replace with Redis later if needed)
let latest = {
  burned: 0,
  remaining: 0,
  budget: 0,
  balance: 0,
  results: [],
  steps: [],
  ts: Date.now(),
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  // Next.js parses JSON automatically when Content-Type is application/json
  const body = req.body || {};
  latest = {
    burned: Number(body.burned) || 0,
    remaining: Number(body.remaining) || 0,
    budget: Number(body.budget) || 0,
    balance: Number(body.balance) || 0,
    results: Array.isArray(body.results) ? body.results : [],
    steps: Array.isArray(body.steps) ? body.steps : [],
    ts: Date.now(),
  };

  res.status(200).json({ ok: true });
}

// helper so /latest can read it
export const _latestTally = () => latest;