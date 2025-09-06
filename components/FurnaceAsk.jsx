import React, { useState } from "react";
const $$ = (n) => `$${n.toFixed(2)}`;

export default function FurnaceAsk() {
  const [balance, setBalance] = useState(25.0);
  const [budget, setBudget] = useState(5.0);
  const [estimate, setEstimate] = useState(3.5);

  const [active, setActive] = useState(false);
  const [burned, setBurned] = useState(0);
  const [results, setResults] = useState([]);
  const [nextCost, setNextCost] = useState(0.5);

  const remainingBudget = Math.max(0, budget - burned);
  const overBudget = burned > budget;

  function startAsk() {
    setBurned(0); setResults([]); setActive(true);
  }

  function addResult() {
    if (!active) return;
    const cost = Math.max(0, Number(nextCost) || 0);
    if (!cost) return;
    setResults((r) => [...r, cost]);
    setBurned((b) => b + cost);
  }

  function undoLast() {
    if (!active || results.length === 0) return;
    const last = results[results.length - 1];
    setResults((r) => r.slice(0, -1));
    setBurned((b) => b - last);
  }

  function finishAsk() {
    if (!active) return;
    setBalance((bal) => Math.max(0, bal - burned));
    setActive(false);
  }

  return (
    <div className="panel">
      <h2>Ask Session</h2>

      {!active && results.length === 0 && (
        <>
          <div className="row">
            <label>Balance left:</label>
            <input type="number" step="0.01" value={balance}
              onChange={(e) => setBalance(Number(e.target.value || 0))} />
          </div>
          <div className="row">
            <label>Budget for this ask:</label>
            <input type="number" step="0.01" value={budget}
              onChange={(e) => setBudget(Number(e.target.value || 0))} />
          </div>
          <div className="row">
            <label>Estimated cost:</label>
            <input type="number" step="0.01" value={estimate}
              onChange={(e) => setEstimate(Number(e.target.value || 0))} />
          </div>
          <button className="cta" onClick={startAsk}>Ready to burn</button>
        </>
      )}

      {active && (
        <>
          <div className="row"><b>Balance:</b> {$$(balance)}</div>
          <div className="row"><b>Budget:</b> {$$(budget)}</div>
          <div className="row"><b>Estimate:</b> {$$(estimate)}</div>

          <div className={`note ${overBudget ? "hot" : "ok"}`}>
            {overBudget ? `⚠️ Over budget by ${$$(burned - budget)}`
                        : `Within budget. Remaining: ${$$(remainingBudget)}`}
          </div>

          <div className="row">
            <label>Add result cost:</label>
            <input type="number" step="0.01" value={nextCost}
              onChange={(e) => setNextCost(Number(e.target.value || 0))} />
            <button onClick={addResult}>+ Add</button>
            <button onClick={undoLast}>Undo</button>
          </div>

          <div className="row"><b>Results:</b> {results.length}</div>
          <div className="row"><b>Burned total:</b> {$$(burned)}</div>

          <button className="cta" onClick={finishAsk}>Finish ask</button>
        </>
      )}

      {!active && results.length > 0 && (
        <>
          <div className="row"><b>This ask used:</b> {$$(burned)}</div>
          <div className="row"><b>New balance:</b> {$$(balance)}</div>
        </>
      )}
    </div>
  );
}