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
        width: "100%",
        height: "100%",
        background: "#fff",
        border: "1px solid #e5e5ea",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* draggable header */}
      <div
        style={{
          WebkitAppRegion: "drag",
          cursor: "move",
          userSelect: "none",
          height: 28,
          padding: "4px 10px",
          background: "#f9f9f9",
          borderBottom: "1px solid #e5e5ea",
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        🔥 Furnace — Live Tally
      </div>

      {/* main content (no-drag so buttons, lists work) */}
      <div style={{ WebkitAppRegion: "no-drag", padding: 16 }}>
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

        <h3 style={{ marginTop: 16, fontSize: 14 }}>Recent steps</h3>
        {tally.steps.length === 0 ? (
          <p>No steps yet…</p>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {tally.steps.slice(-5).map((s, i) => (
              <li key={i}>-${s.toFixed(2)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}