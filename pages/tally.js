// pages/tally.js
import { useEffect, useState } from "react";

export default function TallyWindow() {
  const [tally, setTally] = useState({
    burned: 0,
    budget: 0,
    balance: 0,
    remaining: 0,
    steps: [],
  });

  useEffect(() => {
    let channel;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("furnace-tally");
      channel.onmessage = (e) => setTally(e.data);
    } else {
      // fallback: poll localStorage
      const interval = setInterval(() => {
        const data = localStorage.getItem("furnace:tally");
        if (data) setTally(JSON.parse(data));
      }, 1000);
      return () => clearInterval(interval);
    }
    return () => channel?.close();
  }, []);

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        padding: "20px",
        width: "360px",         // 👈 keeps it compact
        margin: "0 auto",
      }}
    >
      <h2>🔥 Live Tally</h2>
      <p>
        <b>Burned:</b> ${tally.burned.toFixed(2)}
      </p>
      <p>
        <b>Remaining:</b> ${tally.remaining.toFixed(2)}
      </p>
      <p>
        <b>Budget:</b> ${tally.budget.toFixed(2)}
      </p>
      <p>
        <b>Balance:</b> ${tally.balance.toFixed(2)}
      </p>

      <h3>Recent steps</h3>
      {tally.steps.length === 0 ? (
        <p>No steps yet…</p>
      ) : (
        <ul>
          {tally.steps.slice(-5).map((s, i) => (
            <li key={i}>-${s.toFixed(2)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}