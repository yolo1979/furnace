// components/FurnaceAsk.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const $$ = (n) => `$${Number(n || 0).toFixed(2)}`;

const OPENAI_PRICING = {
  "gpt-4o-mini": { in: 0.1500, out: 0.6000 },
  "gpt-4o":      { in: 5.0000,  out: 15.0000 },
  "gpt-3.5":     { in: 0.5000,  out: 1.5000 },
};

const PROVIDERS = [
  { id: "openai", name: "OpenAI (token-based)" },
  { id: "custom", name: "Other / Custom (manual)" },
];

export default function FurnaceAsk() {
  const [provider, setProvider] = useState("openai");
  const [balance, setBalance] = useState("25");
  const [budget, setBudget] = useState("5");

  const [model, setModel] = useState("gpt-4o-mini");
  const [promptTok, setPromptTok] = useState("2000");
  const [completionTok, setCompletionTok] = useState("1000");

  const [active, setActive] = useState(false);
  const [burned, setBurned] = useState(0);
  const [results, setResults] = useState([]);
  const [steps, setSteps] = useState([]);

  const [autoFromTokens, setAutoFromTokens] = useState(true);
  const [runPromptTok, setRunPromptTok] = useState("");
  const [runCompletionTok, setRunCompletionTok] = useState("");
  const [nextCost, setNextCost] = useState("0.10");

  const balanceNum = Number(balance) || 0;
  const budgetNum = Number(budget) || 0;
  const price = OPENAI_PRICING[model] || OPENAI_PRICING["gpt-4o-mini"];

  const estimatedTotal = useMemo(() => {
    if (provider !== "openai") return 0;
    const inTok = Number(promptTok) || 0;
    const outTok = Number(completionTok) || 0;
    return (inTok / 1000) * price.in + (outTok / 1000) * price.out;
  }, [provider, promptTok, completionTok, price]);

  const remaining = Math.max(0, budgetNum - burned);
  const pct = Math.min(100, Math.round((burned / Math.max(1e-9, budgetNum)) * 100));
  const over = burned >= budgetNum;

  // ------- Broadcast to popout + POST to API for menubar -------
  const channelRef = useRef(null);
  useEffect(() => {
    try { channelRef.current = new BroadcastChannel("furnace-tally"); }
    catch { channelRef.current = null; }
    return () => { try { channelRef.current?.close(); } catch {} };
  }, []);

  const publishTally = (extra = {}) => {
    const payload = {
      burned,
      remaining,
      budget: budgetNum,
      balance: balanceNum,
      results,
      steps,
      active,
      provider,
      model,
      ts: Date.now(),
      ...extra,
    };

    // pop-out window
    try { channelRef.current?.postMessage(payload); } catch {}
    try { localStorage.setItem("furnace:tally", JSON.stringify(payload)); } catch {}

    // NEW: send to API so the menubar app can read it
    try {
      fetch("/api/tally/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true, // best effort even when navigating away
      });
    } catch {}
  };

  useEffect(() => { publishTally(); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burned, remaining, budgetNum, balanceNum, results, steps, active, provider, model]
  );

  // ------- Actions -------
  function start() {
    setActive(true);
    setBurned(0);
    setResults([]);
    setSteps([]);
    publishTally({ started: true });
  }

  function addResult() {
    if (!active || over) return;

    let cost = 0;
    let info = "";

    if (provider === "openai" && autoFromTokens) {
      const inTok = Number(runPromptTok) || 0;
      const outTok = Number(runCompletionTok) || 0;
      cost = (inTok / 1000) * price.in + (outTok / 1000) * price.out;
      info = `${inTok} in / ${outTok} out`;
    } else {
      cost = Math.max(0, Number(nextCost) || 0);
      info = "manual";
    }
    if (cost <= 0) return;

    const entry = { i: results.length + 1, cost, info, ts: new Date().toLocaleTimeString() };
    setResults((r) => [entry, ...r]);
    setSteps((s) => [...s, cost]);
    setBurned((b) => b + cost);
  }

  function undo() {
    if (!active || results.length === 0) return;
    const last = results[0];
    setResults((r) => r.slice(1));
    setSteps((s) => s.slice(0, -1));
    setBurned((b) => Math.max(0, b - last.cost));
  }

  function finish() {
    if (!active) return;
    const newBal = Math.max(0, balanceNum - burned);
    setBalance(String(Number(newBal.toFixed(2))));
    setActive(false);
    publishTally({ finished: true });
  }

  function reset() {
    setProvider("openai");
    setBalance("25");
    setBudget("5");
    setModel("gpt-4o-mini");
    setPromptTok("2000");
    setCompletionTok("1000");
    setBurned(0);
    setResults([]);
    setSteps([]);
    setActive(false);
    setAutoFromTokens(true);
    setRunPromptTok("");
    setRunCompletionTok("");
    setNextCost("0.10");
    publishTally({ reset: true });
  }

  function fetchBalance() {
    if (provider === "openai") {
      alert("OpenAI live balance isn’t public. Use estimate; Furnace tracks each result live.");
      return;
    }
    alert("Custom provider: enter balance manually.");
  }

  function popOut() {
    window.open("/tally", "FurnaceTally", "width=360,height=560,menubar=no,toolbar=no,location=no,status=no");
  }

  // ------- UI -------
  return (
    <div className="container">
      <h1>🔥 Furnace Dashboard</h1>
      <p>See your balance, set a budget, and tally burn after each result.</p>

      <div className="stats">
        <div className="stat"><strong>Balance</strong><span>{$$(balanceNum)}</span></div>
        <div className="stat"><strong>Budget</strong><span>{$$(budgetNum)}</span></div>
        <div className="stat"><strong>Estimate</strong><span>{$$(provider === "openai" ? estimatedTotal : 0)}</span></div>
        <div className="stat"><strong>Burned</strong><span>{$$(burned)}</span></div>
      </div>

      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>Budget usage</div>
          <div className={`budget-status ${over ? "over" : "ok"}`}>{over ? "Over budget" : "Within budget"}</div>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${Math.max(4, pct)}%`, background: over ? "#ff3b30" : "#007aff" }} />
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
          <div>{pct}% of {$$(budgetNum)}</div>
          <div>{over ? `Over by ${$$(burned - budgetNum)}` : `Remaining ${$$(remaining)}`}</div>
        </div>
      </div>

      {!active && results.length === 0 && (
        <div className="card">
          <div className="form-row">
            <label>Provider</label>
            <select value={provider} onChange={(e)=>setProvider(e.target.value)}>
              {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label>Balance left</label>
            <div className="inline">
              <input type="number" step="0.01" value={balance} onChange={(e)=>setBalance(e.target.value)} />
              <button className="secondary" onClick={fetchBalance}>Fetch</button>
            </div>
          </div>

          <div className="form-row">
            <label>Budget for this ask</label>
            <input type="number" step="0.01" value={budget} onChange={(e)=>setBudget(e.target.value)} />
          </div>

          {provider === "openai" && (
            <>
              <div className="form-row">
                <label>Model</label>
                <select value={model} onChange={(e)=>setModel(e.target.value)}>
                  {Object.keys(OPENAI_PRICING).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Prompt tokens (estimate)</label>
                <input type="number" step="1" value={promptTok} onChange={(e)=>setPromptTok(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Completion tokens (estimate)</label>
                <input type="number" step="1" value={completionTok} onChange={(e)=>setCompletionTok(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Estimated total</label>
                <input type="text" value={$$(+estimatedTotal)} readOnly />
              </div>
            </>
          )}

          <div className="inline" style={{marginTop:8}}>
            <button className="primary" onClick={start}>Time to Burn</button>
            <button className="secondary" onClick={reset}>Reset</button>
            <button className="secondary" onClick={popOut}>Pop out Live Tally</button>
          </div>
        </div>
      )}

      {active && (
        <div className="card">
          <div className={`budget-status ${over ? "over" : "ok"}`} style={{marginBottom:12}}>
            {over ? `Budget hit — raise cap or finish (over by ${$$(burned - budgetNum)})`
                  : `Within budget • Remaining ${$$(remaining)} • Log each agent output`}
          </div>

          {provider === "openai" && (
            <div className="form-row">
              <label>Per result tokens</label>
              <div className="inline">
                <input type="number" step="1" placeholder="prompt" value={runPromptTok} onChange={(e)=>setRunPromptTok(e.target.value)} />
                <input type="number" step="1" placeholder="completion" value={runCompletionTok} onChange={(e)=>setRunCompletionTok(e.target.value)} />
                <label style={{fontSize:12, color:"#6e6e73"}}>
                  <input type="checkbox" checked={autoFromTokens} onChange={(e)=>setAutoFromTokens(e.target.checked)} style={{marginRight:6}}/>
                  auto-calc from tokens
                </label>
              </div>
            </div>
          )}

          {!autoFromTokens && (
            <div className="form-row">
              <label>Manual result cost</label>
              <input type="number" step="0.01" value={nextCost} onChange={(e)=>setNextCost(e.target.value)} />
            </div>
          )}

          <div className="inline">
            <button className="primary" onClick={addResult} disabled={over}>+ Burn step</button>
            <button className="secondary" onClick={undo}>Undo</button>
            <button className="secondary" onClick={finish}>Finish ask</button>
            <button className="secondary" onClick={popOut}>Pop out Live Tally</button>
          </div>
        </div>
      )}

      {!active && results.length > 0 && (
        <div className="card">
          <div className="form-row"><b>This ask used:</b> {$$(burned)}</div>
          <div className="form-row"><b>New balance:</b> {$$(balanceNum)}</div>
          <button className="secondary" onClick={reset}>Start new ask</button>
          <button className="secondary" onClick={popOut} style={{marginLeft:8}}>Pop out Live Tally</button>
        </div>
      )}

      <div className="liveCard">
        <div className="liveHeader">
          <span>🔥 Live Tally</span>
          <span className={over ? "pill over" : "pill ok"}>
            {over ? "Cap reached" : "Tracking"}
          </span>
        </div>
        <div className="liveRow"><b>Burned:</b> <span>{$$(burned)}</span></div>
        <div className="liveRow"><b>Remaining:</b> <span>{$$(remaining)}</span></div>
        <div className="liveRow"><b>Budget:</b> <span>{$$(budgetNum)}</span></div>
        <div className="liveRow"><b>Balance:</b> <span>{$$(balanceNum)}</span></div>

        <div className="liveLogTitle">Recent steps</div>
        <div className="liveLog">
          {results.length === 0 && <div className="muted">No steps yet…</div>}
          {results.map(r => (
            <div key={r.i} className="logItem">
              <div>#{r.i} • {r.ts}</div>
              <div className="muted">{r.info}</div>
              <div className="cost">{$$(r.cost)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}