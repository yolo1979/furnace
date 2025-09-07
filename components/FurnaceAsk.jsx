// components/FurnaceAsk.jsx
import { useState, useEffect } from "react";

/* ---------- helpers ---------- */
const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

// money input sanitizer: allow digits + one dot, trim leading zeros, cap at 2 decimals
function cleanMoneyInput(str) {
  let v = (str || "").replace(/[^\d.]/g, "");     // keep digits & dot
  v = v.replace(/^0+(?=\d)/, "");                 // strip leading zeros
  v = v.replace(/(\..*)\./g, "$1");               // only one dot
  const [i, d] = v.split(".");
  return d != null ? `${i}.${d.slice(0, 2)}` : i; // at most 2 decimals
}

export default function FurnaceAsk() {
  /* ---------- state ---------- */
  const [balance, setBalance] = useState(25);
  const [budget, setBudget] = useState(5);
  const [estimate, setEstimate] = useState(0);
  const [burned, setBurned] = useState(0);
  const [steps, setSteps] = useState([]);

  // separate string state for Budget input
  const [budgetStr, setBudgetStr] = useState(String(budget));
  useEffect(() => {
    setBudgetStr(String(budget));
  }, [budget]);

  /* ---------- actions ---------- */
  const addResult = (cost) => {
    const newBurned = burned + cost;
    setBurned(newBurned);
    setSteps((prev) => [...prev, cost]);
  };

  const reset = () => {
    setBurned(0);
    setSteps([]);
  };

  /* ---------- UI ---------- */
  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        padding: "20px",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h1>🔥 Furnace Dashboard</h1>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Balance
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Budget for this ask
          <input
            type="text"
            inputMode="decimal"
            value={budgetStr}
            onChange={(e) => {
              const cleaned = cleanMoneyInput(e.target.value);
              setBudgetStr(cleaned);
              setBudget(Number(cleaned || 0));
            }}
            onBlur={() => {
              const normalized = (Number(budgetStr || 0))
                .toFixed(2)
                .replace(/\.00$/, "");
              setBudgetStr(normalized);
              setBudget(Number(normalized));
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Estimate
          <input
            type="number"
            value={estimate}
            onChange={(e) => setEstimate(Number(e.target.value))}
          />
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <p><b>Burned:</b> {formatMoney(burned)}</p>
        <p><b>Remaining budget:</b> {formatMoney(budget - burned)}</p>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => addResult(0.25)}>+ Burn step ($0.25)</button>
        <button onClick={reset} style={{ marginLeft: "10px" }}>Reset</button>
      </div>

      <h3>Recent steps</h3>
      {steps.length === 0 ? (
        <p>No steps yet…</p>
      ) : (
        <ul>
          {steps.slice(-5).map((s, i) => (
            <li key={i}>-${s.toFixed(2)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
