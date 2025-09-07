// pages/api/test-slack.js
export default async function handler(req, res) {
  try {
    const token = process.env.SLACK_BOT_TOKEN;
    const defaultChannel = process.env.SLACK_DEFAULT_CHANNEL || "furnace-alerts";

    if (!token) return res.status(500).json({ success: false, error: "Missing SLACK_BOT_TOKEN" });

    // 1) find channel ID by name
    const list = await fetch("https://slack.com/api/conversations.list?types=public_channel,private_channel", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());

    if (!list.ok) throw new Error(list.error || "failed_list");

    const channel = (list.channels || []).find(
      c => c.name === defaultChannel.replace(/^#/, "")
    );
    if (!channel) {
      return res.status(400).json({ success: false, error: "channel_not_found", tried: defaultChannel });
    }

    // 2) join (safe to call even if already a member)
    await fetch("https://slack.com/api/conversations.join", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ channel: channel.id })
    });

    // 3) post message
    const post = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        channel: channel.id,
        text: "🔥 Furnace test: your bot can join & post here."
      })
    }).then(r => r.json());

    if (!post.ok) throw new Error(post.error || "failed_post");

    res.status(200).json({ success: true, channel: channel.name, ts: post.ts });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e.message || e) });
  }
}