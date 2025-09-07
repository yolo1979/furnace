// pages/api/slack/post.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_DEFAULT_CHANNEL; // e.g. "furnace-alerts"

  if (!token || !channel) {
    return res.status(500).json({ error: "Slack env vars missing" });
  }

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, text }),
    }).then((r) => r.json());

    if (!resp.ok) {
      return res
        .status(400)
        .json({ ok: false, error: resp.error || "slack_error" });
    }
    res.status(200).json({ ok: true, ts: resp.ts });
  } catch (e) {
    res.status(500).json({ ok: false, error: "network_error" });
  }
}