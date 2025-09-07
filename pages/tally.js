// pages/tally.js
import { useEffect, useState } from "react";

export default function TallyWindow() {
  const [tally, setTally] = useState({
    burned: 0,
    budget: 0,
    balance: 0,
    remaining: 0,
    results: [],
  });

  useEffect(() => {
    // 1) Try BroadcastChannel (works within same runtime)
    let chan;
    try {
      chan = new BroadcastChannel("furnace-tally");
      chan.onmessage = (e) => setTally(e.data);
    } catch {}

    // 2) Fallback: poll server-side snapshot so Electron stays in sync
    let timer = setInterval(async () => {
      try {
        const res = await fetch("/api/tally/latest");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.burned === "number") setTally(data);
        }
      } catch {}
    }, 1500);

    return () => {
      chan?.close?.();
      clearInterval(timer);
    };
  }, []);

  return (
  <div
    style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      width: 360,
      background: "#f5f5f7",
      color: "#1d1d1f",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 12px 30px rgba(0,0,0,.15)"
    }}
  >
    {/* 👇 draggable header */}
    <div
      style={{
        WebkitAppRegion: "drag",
        cursor: "move",
        userSelect: "none",
        height: 28,
        padding: "4px 10px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e5ea",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 600,
        fontSize: 13
      }}
    >
      <span>🔥 Furnace — Live Tally</span>
    </div>

    {/* 👇 interactive area must be NO-DRAG */}
    <div style={{ WebkitAppRegion: "no-drag", padding: 14 }}>
      <h3 style={{ margin: "4px 0 10px" }}>Summary</h3>

      <div style={{
        background: "#fff",
        border: "1px solid #e5e5ea",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        fontSize: 14,
        lineHeight: 1.6
      }}>
        <div>Burned: <b>${(tally.burned||0).toFixed(2)}</b></div>
        <div>Remaining: <b>${(tally.remaining||0).toFixed(2)}</b></div>
        <div>Budget: <b>${(tally.budget||0).toFixed(2)}</b></div>
        <div>Balance: <b>${(tally.balance||0).toFixed(2)}</b></div>
      </div>

      <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 12 }}>Recent steps</div>
      <div style={{
        background:"#fff",
        border:"1px solid #e5e5ea",
        borderRadius:12,
        padding:8,
        boxShadow:"0 1px 3px rgba(0,0,0,.06)",
        maxHeight:260, overflow:"auto"
      }}>
        {(tally.results||[]).slice(-8).map((r) => (
          <div key={r.i} style={{
            display:"grid", gridTemplateColumns:"1fr auto", gap:4,
            padding:"6px 0", borderBottom:"1px solid #f0f0f0"
          }}>
            <div>#{r.i} • {r.ts}<div style={{color:"#6e6e73", fontSize:12}}>{r.info}</div></div>
            <div style={{fontWeight:600}}>${(r.cost||0).toFixed(2)}</div>
          </div>
        ))}
        {(tally.results||[]).length === 0 && (
          <div style={{color:"#6e6e73", fontSize:12}}>No steps yet…</div>
        )}
      </div>
    </div>
  </div>
);

