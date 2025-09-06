import React, { useMemo, useState } from "react";

const $$ = (n) => `$${Number(n || 0).toFixed(4)}`; // 4 dp for token costs

/** Minimal OpenAI pricing table (USD per 1K tokens).
 *  Adjust values/models if needed for your demo.
 */
const OPENAI_PRICING = {
  "gpt-4o-mini": { in: 0.1500, out: 0.6000 },
  "gpt-4o":      { in: 5.0000, out: 15.0000 },
  "gpt-3.5":     { in: 0.5000, out: 1.5000 },
};

const PROVIDERS = [
  { id: "openai", name: "OpenAI (token-based)" },
  { id: "custom", name: "Other / Custom (manual)" },
];

export default function FurnaceAsk() {
  // Provider & balances
  const [provider, setProvider] = useState("openai");
  const [balance, setBalance]   = useState(25.0);
  const [budget, setBudget]     = useState(5.0);

  // ---- OpenAI estimator inputs (BEFORE you start) ----
  const [model, setModel] = useState("gpt-4o-mini");
  const [promptTok, setPromptTok] = useState(2000);       // input tokens estimate
  const [completionTok, setCompletionTok] = useState(1000); // output tokens estimate

  // ---- Runtime tally ----
  const [active, setActive]     = useState(false);
  const [burned, setBurned]     = useState(0);
  const [results, setResults]   = useState([]); // [{i,cost,info}]
  const [nextCost, setNextCost] = useState(0.10);

  // Optional: auto-calc each result cost from tokens during run
  const [autoFromTokens, setAutoFromTokens] = useState(true);
  const [runPromptTok, setRunPromptTok] = useState(0);
  const [runCompletionTok, setRunCompletionTok] = useState(0);

  // ---- Derivations ----
  const price = OPENAI_PRICING[model] || OPENAI_PRICING["gpt-4o-mini"];
  const estimatedTotal = useMemo(() => {
    if (provider !== "openai") return 0;
    const costIn  = (Number(promptTok)     / 1000) * price.in;
    const costOut = (Number(completionTok) / 1000) * price.out;
    return costIn + costOut;
  }, [provider, promptTok, completionTok, price]);

  const remaining = Math.max(0, budget - burned);
  const pct = Math.min(100, Math.round((burned / Math.max(1e-9, budget)) * 100));
  const over = burned > budget;

  // ---- Actions ----
  function start() {
    setActive(true);
    setBurned(0);
    setResults([]);
  }

  function addResult() {
    if (!active) return;

    let cost = 0;
    let info = "";

    if (provider === "openai" && autoFromTokens) {
      const iCost  = (Number(runPromptTok)     / 1000) * price.in;
      const oCost  = (Number(runCompletionTok) / 1000) * price.out;
      cost = iCost + oCost;
      info = `${runPromptTok} in / ${runCompletionTok} out tokens`;
    } else {
      cost = Math.max(0, Number(nextCost) || 0);
      info = "manual";
    }

    if (cost <= 0) return;

    setResults((r) => [...r, { i: r.length + 1, cost, info }]);
    setBurned((b) => b + cost);

    // reset per-result token inputs for convenience
    setRunPromptTok(0);
    setRunCompletionTok(0);
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
    setProvider("openai");
    setBalance(25); setBudget(5);
    setModel("gpt-4o-mini"); setPromptTok(2000); setCompletionTok(1000);
    setBurned(0); setResults([]); setActive(false); setNextCost(0.10);
    setAutoFromTokens(true); setRunPromptTok(0); setRunCompletionTok(0);
  }

  async function fetchBalance() {
    // No stable public balance endpoint for OpenAI; show honest note.
    if (provider === "openai") {
      alert("OpenAI: live balance isn’t exposed via public API. Furnace estimates costs from tokens & published prices.");
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

      {/* Stats */}
      <div className="grid">
        <div className="card stat"><div className="k">Balance</div><div className="v">{$$(balance)}</div></div>
        <div className="card stat"><div className="k">Budget (ask)</div><div className="v">{$$(budget)}</div></div>
        <div className="card stat"><div className="k">Estimate</div><div className="v">{$$(provider === "openai" ? estimatedTotal : 0)}</div></div>
        <div className={`card stat ${over ? "hot" : ""}`}><div className="k">Burned</div><div className="v">{$$(burned)}</div></div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="row between">
          <span>Budget usage</span>
          <span className={`pill ${over ? "pill-hot" : "pill-ok"}`}>{over ? "Over budget" : "Within budget"}</span>
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

          {provider === "openai" && (
            <>
              <div className="row">
                <label>Model</label>
                <select value={model} onChange={(e)=>setModel(e.target.value)} className="select">
                  {Object.keys(OPENAI_PRICING).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="row">
                <label>Prompt tokens (estimate)</label>
                <input type="number" step="1" value={promptTok} onChange={(e)=>setPromptTok(Number(e.target.value||0))}/>
              </div>
              <div className="row">
                <label>Completion tokens (estimate)</label>
                <input type="number" step="1" value={completionTok} onChange={(e)=>setCompletionTok(Number(e.target.value||0))}/>
              </div>
              <div className="row">
                <label>Estimated total</label>
                <input type="number" step="0.0001" value={estimatedTotal} readOnly />
              </div>
            </>
          )}

          {provider === "custom" && (
            <div className="note note-ok">
              Custom provider: use manual balance + manual per-result costs for now.
            </div>
          )}

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
                  : `Within budget • Remaining ${$$(remaining)} • Tally after each agent output`}
          </div>

          {provider === "openai" && (
            <div className="row">
              <label>Per result tokens</label>
              <div className="inline">
                <input
                  type="number" step="1" placeholder="prompt"
                  value={runPromptTok} onChange={(e)=>setRunPromptTok(Number(e.target.value||0))}
                  title="Prompt tokens for this result"
                />
                <input
                  type="number" step="1" placeholder="completion"
                  value={runCompletionTok} onChange={(e)=>setRunCompletionTok(Number(e.target.value||0))}
                  title="Completion tokens for this result"
                />
                <label style={{ width: "auto", color: "#9aa3b2", fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={autoFromTokens}
                    onChange={(e)=>setAutoFromTokens(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  auto-calc from tokens
                </label>
              </div>
            </div>
          )}

          {!autoFromTokens && (
            <div className="row">
              <label>Manual result cost</label>
              <div className="inline">
                <input type="number" step="0.0001" value={nextCost} onChange={(e)=>setNextCost(Number(e.target.value||0))}/>
              </div>
            </div>
          )}

          <div className="actions" style={{ marginTop: 6 }}>
            <button onClick={addResult}>+ Add result</button>
            <button className="ghost" onClick={undo}>Undo</button>
            <button className="cta" onClick={finish}>Finish ask</button>
          </div>

          <div className="tally">
            <div><b>Results:</b> {results.length}</div>
            <div><b>Burned:</b> {$$(burned)}</div>
            {provider === "openai" && <div><b>Model:</b> {model}</div>}
          </div>

          {results.length > 0 && (
            <div className="note" style={{ border: "1px solid #2a2f44" }}>
              <b>Last:</b> {results[results.length-1].info} — {$$((results[results.length-1].cost))}
            </div>
          )}
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