// components/FurnaceAsk.jsx
import { useEffect, useState } from "react";

/* ---------- helpers ---------- */
const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function FurnaceAsk() {
  // state
  const [balance, setBalance] = useState(25);
  const [budgetStr, setBudgetStr] = useState("10.00");
  const [budget, setBudget] = useState(10);
  const [burned, setBurned] = useState(0);
  const [steps, setSteps] = useState([]);
  const [isBurning, setIsBurning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const remaining = budget - burned;

  /* ---------- broadcast tally ---------- */
  const broadcastTally = (nextBurned, nextSteps) => {
    const tally = {
      burned: nextBurned,
      budget,
      balance,
      remaining: budget - nextBurned,
      steps: nextSteps,
    };
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("furnace-tally");
      channel.postMessage(tally);
      channel.close();
    }
    localStorage.setItem("furnace:tally", JSON.stringify(tally));
  };

  /* ---------- burn functions ---------- */
  const addResult = (cost, info = "step") => {
    const nextBurned = burned + cost;
    const nextSteps = [...steps, cost];
    setBurned(nextBurned);
    setSteps(nextSteps);
    broadcastTally(nextBurned, nextSteps);

    // stop when budget reached
    if (nextBurned >= budget) {
      stopAutoBurn();
    }
  };

  const startAutoBurn = () => {
    if (isBurning) return;
    setIsBurning(true);
    const id = setInterval(() => {
      addResult(0.25, "auto burn");
    }, 1000);
    setIntervalId(id);
  };

  const stopAutoBurn = () => {
    if (intervalId) clearInterval(intervalId);
    setIsBurning(false);
    setIntervalId(null);
  };

  const resetAll = () => {
    stopAutoBurn();
    setBurned(0);
    setSteps([]);
    broadcastTally(0, []);
  };

  /* ---------- input handlers ---------- */
  const handleBudgetChange = (e) => {
    const v = e.target.value.replace(/[^\d.]/g, "");
    setBudgetStr(v);
    const num = parseFloat(v);
    if (!isNaN(num)) setBudget(num);
  };

  /* ---------- render ---------- */
  return (
    <div className="container">
      <h1>🔥 Furnace</h1>
      <p>Real-time AI spend tracker</p>

      <div className="stats">
        <div className="stat">
          <span className="label">Balance</span>
          <span>{formatMoney(balance)}</span>
        </div>
        <div className="stat">
          <span className="label">Budget</span>
          <span>{formatMoney(budget)}</span>
        </div>
        <div className="stat">
          <span className="label">Burned</span>
          <span>{formatMoney(burned)}</span>
        </div>
        <div className="stat">
          <span className="label">Remaining</span>
          <span>{formatMoney(remaining)}</span>
        </div>
      </div>

      <section>
        <label>
          Set Budget:
          <input
            type="text"
            value={budgetStr}
            onChange={handleBudgetChange}
            onBlur={() => setBudgetStr(budget.toFixed(2))}
          />
        </label>
      </section>

      <section>
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
            title="Open the pop-out tally window"
          >
            Pop out Live Tally
          </a>
          <button
            className="ghost"
            onClick={() => (window.location.href = "/api/descope/start")}
          >
            Connect Slack (via Descope)
          </button>
        </div>
      </section>

      {/* docked live tally */}
      <DockedTally burned={burned} remaining={remaining} steps={steps} />
    </div>
  );
}

/* ---------- Docked tally panel ---------- */
function DockedTally({ burned, remaining, steps }) {
  return (
    <div className="card">
      <h3>Live Tally</h3>
      <p>Burned: {formatMoney(burned)}</p>
      <p>Remaining: {formatMoney(remaining)}</p>
      <h4>Recent steps:</h4>
      {steps.length === 0 ? (
        <p>No steps yet…</p>
      ) : (
        <ul>
          {steps.slice(-5).map((s, i) => (
            <li key={i}>-{formatMoney(s)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}