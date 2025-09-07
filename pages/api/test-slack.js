// pages/api/test-slack.js
export default async function handler(req, res) {
  try {
    const token = process.env.SLACK_BOT_TOKEN;
    const channel = process.env.SLACK_DEFAULT_CHANNEL || "#general";

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel,
        text: "🔥 Slack test message from Furnace!",
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || "Slack API error");
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}