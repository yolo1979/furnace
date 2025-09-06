import React, { useState } from "react";

const $$ = (n) => `$${Number(n || 0).toFixed(2)}`;

const PROVIDERS = [
  { id: "replit",  name: "Replit (manual balance)" },
  { id: "openai",  name: "OpenAI (estimate only)" },
  { id: "custom",  name: "Other / Custom" },
];

export default function FurnaceAsk() {
  // Provider selection
  const [provider, setProvider] = useState("replit");

  // Pre-run inputs
  const [balance, setBalance]   = useState(25.0); // e.g., $25 Core plan
  const [budget, setBudget]     = useState(5.0);  // cap for THIS ask
  const [estimate, setEstimate] = useState(3.5);  // optional estimate

  // Runtime
  const [active, setActive]   = useState(false);
  const [burned, setBurned]   = useState(0);
  const [results, setResults] = useState([]);     // [{i, cost}]
  const [nextCost, setNextCost] = useState(0.5);

  const remaining = Math.max(0, budget - burned);
  const pct = Math.min(100, Math.round((burned / Math.max(1e-9, budget)) * 100));
  const over = burned > budget;

  // Actions
  function start() {
    setBurned(0);
    setResults([]);
    setActive(true);
  }
  function addResult() {
    if (!active) return;
    const c = Math.max(0, Number(nextCost) || 0);
    if (!c) return;
    setResults((r) => [...r, { i: r.length + 1, cost: c }]);
    setBurned((b) => b + c);
  }
  function undo() {
    if (!active || results.length === 0) return;
    const last = results[results.length - 1];
    setResults((r) => r.slice(0, -1));
    setBurned((b) => Math.max(0, b - last.cost));
  }
  function finish() {
    if (!active) return;
    setBalance((bal) => Math.max(0, bal - burned));
    setActive(false);
  }
  function reset() {
    setProvider("replit");
    setBalance(25); setBudget(5); setEstimate(3.5);
    setBurned(0); setResults([]); setActive(false); setNextCost(0.5);
  }

  // “Fetch balance” stub (honest about today’s limits; ready for adapter later)
  async function fetchBalance() {
    if (provider === "replit") {
      alert("Replit doesn’t expose a public balance API. Enter the number you see in Account Usage for now.");
      return;
    }
    if (provider === "openai") {
      alert("OpenAI public APIs don’t return live balance reliably. Furnace can still estimate/tally per-ask.");
      return;
    }
    alert("Custom provider: enter balance manually.");
  }

  return (
    <div className="dash">
      {/* Header */}
      <div className="hdr">
        <div className="brand">
          <span className="flame">🔥</span>
          <div>
            <div className="title">Furnace</div>
            <div className="subtitle">Balance • Budget • Tally</div>
          </div>
        </div>
        <div className="badge">MVP</div>
      </div>

      {/* Top stats */}
      <div className="grid">
        <div className="card stat">
          <div className="k">Balance</div>
          <div className="v">{$$(balance)}</div>
        </div>
        <div className="card stat">
          <div className="k">Budget (ask)</div>
          <div className="v">{$$(budget)}</div>
        </div>
        <div className="card stat">
          <div className="k">Estimate</div>
          <div className="v">{$$(estimate)}</div>
        </div>
        <div className={`card stat ${over ? "hot" : ""}`}>
          <div className="k">Burned</div>
          <div className="v">{$$(burned)}</div>
        </div>
      </div>

      {/* Budget progress */}
      <div className="card">
        <div className="row between">
          <span>Budget usage</span>
          <span className={`pill ${over ? "pill-hot" : "pill-ok"}`}>
            {over ? "Over budget" : "Within budget"}
          </span>
        </div>
        <div className="bar"><div className={`fill ${over ? "fill-hot" : ""}`} style={{ width: `${pct}%` }} /></div>
        <div className="row between meta">
          <span>{pct}% of {$$(budget)}</span>
          <span>{over ? `Over by ${$$(burned - budget)}` : `Remaining ${$$(remaining)}`}</span>
        </div>
      </div>

      {/* Configure BEFORE run */}
      {!active && results.length === 0 && (
        <div className="card">
          <div className="row">
            <label>Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="select">
              {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="row">
            <label>Balance left</label>
            <div className="inline">
              <input type="number" step="0.01" value={balance} onChange={(e)=>setBalance(Number(e.target.value||0))}/>
              <button className="ghost" onClick={fetchBalance}>Fetch</button>
            </div>
          </div>

          <div className="row">
            <label>Budget for this ask</label>
            <input type="number" step="0.01" value={budget} onChange={(e)=>setBudget(Number(e.target.value||0))}/>
          </div>

          <div className="row">
            <label>Estimated total (optional)</label>
            <input type="number" step="0.01" value={estimate} onChange={(e)=>setEstimate(Number(e.target.value||0))}/>
          </div>

          <div className="actions">
            <button className="cta" onClick={start}>Ready to burn</button>
            <button className="ghost" onClick={reset}>Reset</button>
          </div>
        </div>
      )}

      {/* RUNNING */}
      {active && (
        <div className="card">
          <div className={`note ${over ? "note-hot" : "note-ok"}`}>
            {over ? `⚠️ Over budget by ${$$(burned - budget)}`
                  : `Within budget • Remaining ${$$(remaining)} • Add result after each agent output`}
          </div>

          <div className="row">
            <label>Add result cost</label>
            <div className="inline">
              <input type="number" step="0.01" value={nextCost} onChange={(e)=>setNextCost(Number(e.target.value||0))}/>
              <button onClick={addResult}>+ Add result</button>
              <button className="ghost" onClick={undo}>Undo</button>
            </div>
          </div>

          <div className="tally">
            <div><b>Results:</b> {results.length}</div>
            <div><b>Burned:</b> {$$(burned)}</div>
          </div>

          <div className="actions">
            <button className="cta" onClick={finish}>Finish ask</button>
          </div>
        </div>
      )}

      {/* AFTER RUN */}
      {!active && results.length > 0 && (
        <div className="card">
          <div className="row"><b>This ask used:</b>&nbsp; {$$(burned)}</div>
          <div className="row"><b>New balance:</b>&nbsp; {$$(balance)}</div>
          <div className="actions">
            <button className="ghost" onClick={reset}>Start new ask</button>
          </div>
        </div>
      )}
    </div>
  );
}