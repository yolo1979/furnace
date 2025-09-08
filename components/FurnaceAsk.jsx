// components/FurnaceAsk.jsx
import { useEffect, useState } from "react";

/* ---------- helpers ---------- */
const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

// sanitize money input: digits + one dot, trim zeros, max 2 decimals
function cleanMoneyInput(str) {
  let v = String(str ?? "").replace(/[^\d.]/g, "");   // keep digits & dot
  v = v.replace(/^0+(?=\d)/, "");                     // trim leading zeros
  v = v.replace(/(\..*)\./g, "$1");                   // only one dot
  const [i, d] = v.split(".");
  return d != null ? `${i}.${d.slice(0, 2)}` : i;
}

export default function FurnaceAsk() {
  const [balance, setBalance] = useState(100);
  const [budget, setBudget] = useState(20);
  const [budgetStr, setBudgetStr] = useState("20.00"); // text input
  const [burned, setBurned] = useState(0);
  const [steps, setSteps] = useState([]);
  const [isBurning, setIsBurning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // keep string in sync if budget changes elsewhere
  useEffect(() => {
    setBudgetStr(Number(budget).toFixed(2));
  }, [budget]);

  const handleBudgetChange = (e) => {
    const cleaned = cleanMoneyInput(e.target.value);
    setBudgetStr(cleaned);
    const num = parseFloat(cleaned);
    if (!Number.isNaN(num)) setBudget(num);
  };

  const startAutoBurn = () => {
    if (isBurning) return;
    setIsBurning(true);
    const id = setInterval(() => {
      setBurned((prev) => {
        const next = prev + 0.25;
        if (next >= budget) {
          clearInterval(id);
          setIsBurning(false);
          return budget;
        }
        return next;
      });
      setSteps((prev) => [...prev, 0.25]);
    }, 1000);
    setIntervalId(id);
  };

  const stopAutoBurn = () => {
    if (intervalId) clearInterval(intervalId);
    setIsBurning(false);
  };

  const resetAll = () => {
    if (intervalId) clearInterval(intervalId);
    setBurned(0);
    setSteps([]);
    setIsBurning(false);
  };

  return (
    <div className="container">
      <h1>🔥 Furnace</h1>

      <section className="card">
        <h2>Setup</h2>
        <div className="form-row">
          <label>Balance</label>
          <input
            type="number"
            value={balance}
            step="0.01"
            onChange={(e) => setBalance(parseFloat(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label>Budget</label>
          <input
            type="text"
            inputMode="decimal"
            value={budgetStr}
            onChange={handleBudgetChange}
            onBlur={() =>
              setBudgetStr((prev) => {
                const n = parseFloat(prev);
                return Number.isFinite(n) ? n.toFixed(2) : "0.00";
              })
            }
          />
        </div>
      </section>

      <section className="card">
        <h2>Status</h2>
        <p><b>Budget:</b> {formatMoney(budget)}</p>
        <p><b>Burned:</b> {formatMoney(burned)}</p>
        <p><b>Remaining:</b> {formatMoney(budget - burned)}</p>
        <progress value={burned} max={budget}></progress>
      </section>

      <section className="card">
        <h2>Controls</h2>
        <div className="row">
          <button onClick={isBurning ? stopAutoBurn : startAutoBurn}>
            {isBurning ? "Stop" : "Time to Burn (auto)"}
          </button>
          <button onClick={resetAll} className="ghost">
            Reset
          </button>
          <a
            className="ghost"
            href="/tally"
            target="_blank"
            rel="noreferrer"
          >
            Pop out Live Tally
          </a>
        </div>
      </section>

      <section className="card">
        <h2>Recent Steps</h2>
        {steps.length === 0 ? (
          <p>No steps yet…</p>
        ) : (
          <ul>
            {steps.slice(-5).map((s, i) => (
              <li key={i}>-${s.toFixed(2)}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}