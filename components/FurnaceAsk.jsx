// components/FurnaceAsk.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- helpers ---------- */
const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

// simple OpenAI price table (per 1K tokens) for demo
const OPENAI_PRICES = {
  "gpt-4o-mini":  { prompt: 0.0005, completion: 0.0015 },
  "gpt-4o":       { prompt: 0.005,  completion: 0.015  },
  "gpt-4.1-mini": { prompt: 0.003,  completion: 0.006  },
};

const PROVIDERS = [
  { id: "openai", label: "OpenAI (token-based)" },
  { id: "replit", label: "Replit (manual balance)" },
];

/* ---------- auto-burn knobs ---------- */
const STEP_COST = 0.25;        // dollars per tick
const STEP_MS   = 1000;        // 1s per tick
const WARN_AT   = 0.80;        // 80% budget warning

export default function FurnaceAsk() {
  // top summary
  const [balance, setBalance] = useState(25);
  const [budget,  setBudget]  = useState(5);
  const [estimate, setEstimate] = useState(0.9);
  const [burned, setBurned] = useState(0);

  // form
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [promptTokens, setPromptTokens] = useState(2000);
  const [completionTokens, setCompletionTokens] = useState(1000);

  // UI / popout sync
  const bcRef = useRef(null);
  const [tracking, setTracking] = useState(false);

  // auto-burn state
  const [isBurning, setIsBurning] = useState(false);
  const burnTimer = useRef(null);
  const [warned, setWarned] = useState(false);

  // derived
  const remaining = useMemo(
    () => Math.max(budget - burned, 0),
    [budget, burned]
  );
  const within = useMemo(() => burned <= budget, [burned, budget]);

  /* ---------- BroadcastChannel for live tally ---------- */
  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel("furnace-tally");
      return () => bcRef.current?.close();
    } catch {
      bcRef.current = null;
    }
  }, []);

  const pushTally = (extraSteps = []) => {
    const payload = { burned, budget, balance, remaining, results: extraSteps, ts: Date.now() };
    try { localStorage.setItem("furnace:tally", JSON.stringify(payload)); } catch {}
    try { bcRef.current?.postMessage(payload); } catch {}
  };

  /* ---------- Slack helper ---------- */
  async function postToSlack(text) {
    try {
      await fetch("/api/slack/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch (e) {
      console.warn("Slack post failed:", e);
    }
  }

  /* ---------- Add a single burn step ---------- */
  async function addResult(cost, info = "Agent step") {
    const step = {
      i: Date.now(),
      ts: new Date().toLocaleTimeString(),
      cost: Number(cost || 0),
      info,
    };
    setBurned((prev) => {
      const next = Number((prev + step.cost).toFixed(2));
      // sync displays
      pushTally([step]);
      // Slack
      const msg =
        `🔥 Burn update\n` +
        `• Step: ${step.info}\n` +
        `• Cost: ${formatMoney(step.cost)}\n` +
        `• Burned: ${formatMoney(next)} / Budget: ${formatMoney(budget)}\n` +
        `• Remaining: ${formatMoney(Math.max(budget - next, 0))}`;
      postToSlack(msg);
      return next;
    });
  }

  /* ---------- Auto-burn loop ---------- */
  const startAutoBurn = () => {
    if (isBurning) return;
    setIsBurning(true);
    setTracking(true);
    // initialize warning state based on current progress
    setWarned(budget > 0 ? burned / budget >= WARN_AT : false);
    pushTally();

    burnTimer.current = setInterval(() => {
      // compute where we’ll be after next tick
      const next = Number((burned + STEP_COST).toFixed(2));

      // warning (once) at WARN_AT %
      if (!warned && budget > 0 && next >= budget * WARN_AT) {
        postToSlack(
          `⚠️ Approaching budget: ${Math.round(WARN_AT*100)}% reached.\n` +
          `• Burned: ${formatMoney(burned)}\n` +
          `• Budget: ${formatMoney(budget)}\n` +
          `• Remaining: ${formatMoney(Math.max(budget - burned, 0))}`
        );
        setWarned(true);
      }

      // if next step would go over the budget, do a final partial step and stop
      if (next >= budget && budget > 0) {
        const finalCost = Math.max(budget - burned, 0); // partial to hit cap exactly
        if (finalCost > 0) addResult(finalCost, "Final step (cap)");
        postToSlack("⛔ Budget cap reached. Auto-burn stopped.");
        stopAutoBurn();
        return;
      }

      // normal tick
      addResult(STEP_COST, "Auto burn");
    }, STEP_MS);
  };

  const stopAutoBurn = () => {
    if (burnTimer.current) {
      clearInterval(burnTimer.current);
      burnTimer.current = null;
    }
    setIsBurning(false);
    setTracking(false);
  };

  /* ---------- Manual reset ---------- */
  const resetAll = () => {
    stopAutoBurn();
    setWarned(false);
    setBurned(0);
    pushTally([]);
  };

  /* ---------- Estimate calculation (OpenAI) ---------- */
  useEffect(() => {
    if (provider !== "openai") return;
    const price = OPENAI_PRICES[model] || OPENAI_PRICES["gpt-4o-mini"];
    const dollars =
      ((promptTokens / 1000) * price.prompt || 0) +
      ((completionTokens / 1000) * price.completion || 0);
    setEstimate(Number(dollars.toFixed(2)));
  }, [provider, model, promptTokens, completionTokens]);

  const fetchBalance = async () => {
    // Stubbed for demo: keep value as-is
    setBalance((b) => b);
  };

  /* ---------- persist latest snapshot (used by popout/widget) ---------- */
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/tally/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ burned, budget, balance, remaining }),
        });
      } catch {}
    })();
  }, [burned, budget, balance, remaining]);

  return (
    <div className="wrap">
      <header className="hero">
        <h1>🔥 Furnace Dashboard</h1>
        <p>See your balance, set a budget, and tally burn after each result.</p>
      </header>

      <div className="cards">
        <Stat title="Balance" value={formatMoney(balance)} />
        <Stat title="Budget" value={formatMoney(budget)} />
        <Stat title="Estimate" value={formatMoney(estimate)} />
        <Stat title="Burned" value={formatMoney(burned)} />
      </div>

      <BudgetBar burned={burned} budget={budget} within={within} />

      <section className="panel">
        <h3>Provider</h3>

        <div className="grid">
          <label>
            Provider
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>

          <label>
            Balance left
            <div className="row">
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value || 0))}
              />
              <button onClick={fetchBalance}>Fetch</button>
            </div>
          </label>

          <label>
            Budget for this ask
            <input
              type="number"
              step="0.01"
              value={budget}
              min={0}
              onChange={(e) => setBudget(Number(e.target.value || 0))}
            />
          </label>

          {provider === "openai" && (
            <>
              <label className="span2">
                Model
                <select value={model} onChange={(e) => setModel(e.target.value)}>
                  {Object.keys(OPENAI_PRICES).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>

              <label>
                Prompt tokens (estimate)
                <input
                  type="number"
                  value={promptTokens}
                  min={0}
                  onChange={(e) => setPromptTokens(Number(e.target.value || 0))}
                />
              </label>

              <label>
                Completion tokens (estimate)
                <input
                  type="number"
                  value={completionTokens}
                  min={0}
                  onChange={(e) => setCompletionTokens(Number(e.target.value || 0))}
                />
              </label>

              <label className="span2">
                Estimated total
                <input type="text" value={formatMoney(estimate)} readOnly />
              </label>
            </>
          )}
        </div>

        <div className="row">
          <button onClick={isBurning ? stopAutoBurn : startAutoBurn}>
            {isBurning ? "Stop" : "Time to Burn (auto)"}
          </button>
          <button onClick={resetAll} className="ghost">Reset</button>
          <a
            className="ghost"
            href="/tally"
            target="_blank"
            rel="noreferrer"
            title="Open the pop-out tally window"
          >
            Pop out Live Tally
          </a>
        </div>
      </section>

      {/* docked live tally */}
      <DockedTally />

      <style jsx>{`
        .wrap { max-width: 980px; margin: 0 auto; padding: 32px 20px; }
        .hero h1 { margin: 0 0 6px; }
        .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0 8px; }
        .panel { background: #fff; border: 1px solid #e5e5ea; border-radius: 14px; padding: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid .span2 { grid-column: span 2; }
        label { display: grid; gap: 6px; font-size: 14px; color: #1d1d1f; }
        input, select { height: 34px; border: 1px solid #dadada; border-radius: 8px; padding: 0 10px; font-size: 14px; background: #fff; }
        .row { display: flex; gap: 8px; align-items: center; }
        button { height: 34px; padding: 0 12px; background: #007aff; color: white; border: 0; border-radius: 8px; font-weight: 600; }
        .ghost { background: #f2f2f7; color: #1d1d1f; }
      `}</style>
    </div>
  );
}

/* ---------- small UI pieces ---------- */
function Stat({ title, value }) {
  return (
    <div className="stat">
      <div className="t">{title}</div>
      <div className="v">{value}</div>
      <style jsx>{`
        .stat { background: #fff; border: 1px solid #e5e5ea; border-radius: 12px; padding: 12px; text-align: center; }
        .t { font-size: 12px; color: #6e6e73; }
        .v { font-weight: 700; margin-top: 4px; }
      `}</style>
    </div>
  );
}

function BudgetBar({ burned, budget, within }) {
  const pct = Math.min(100, (burned / Math.max(budget, 0.0001)) * 100);
  return (
    <div className="bar">
      <div className="fill" style={{ width: `${pct}%`, background: within ? "#34c759" : "#ff3b30" }} />
      <div className="info">
        <span>{`0% of ${formatMoney(budget)}`}</span>
        <span>{`Remaining ${formatMoney(Math.max(budget - burned, 0))}`}</span>
      </div>
      <style jsx>{`
        .bar { position: relative; height: 10px; background: #f2f2f7; border: 1px solid #e5e5ea; border-radius: 999px; margin: 12px 0 18px; overflow: hidden; }
        .fill { height: 100%; transition: width .35s ease; }
        .info { display: flex; justify-content: space-between; font-size: 12px; color: #6e6e73; margin-top: 6px; }
      `}</style>
    </div>
  );
}

function DockedTally() {
  const [tally, setTally] = useState({ burned: 0, budget: 0, balance: 0, remaining: 0, results: [] });

  useEffect(() => {
    let chan;
    try {
      chan = new BroadcastChannel("furnace-tally");
      chan.onmessage = (ev) => setTally(ev.data);
    } catch {}
    const pull = () => {
      try {
        const raw = localStorage.getItem("furnace:tally");
        if (raw) setTally(JSON.parse(raw));
      } catch {}
    };
    pull();
    const intv = setInterval(pull, 1200);
    return () => { chan?.close(); clearInterval(intv); };
  }, []);

  return (
    <div className="dock">
      <div className="head">
        <span>🔥 Live Tally</span>
        <span className="chip">Tracking</span>
      </div>
      <div className="rows">
        <Row k="Burned"    v={formatMoney(tally.burned)} />
        <Row k="Remaining" v={formatMoney(tally.remaining)} />
        <Row k="Budget"    v={formatMoney(tally.budget)} />
        <Row k="Balance"   v={formatMoney(tally.balance)} />
      </div>
      <div className="sub">Recent steps</div>
      <div className="log">
        {(tally.results || []).slice(-5).map((r) => (
          <div key={r.i} className="item">
            <span>#{r.i} • {r.ts} — {r.info}</span>
            <b>{formatMoney(r.cost)}</b>
          </div>
        ))}
        {(tally.results || []).length === 0 && <div className="muted">No steps yet…</div>}
      </div>
      <style jsx>{`
        .dock { position: fixed; right: 20px; bottom: 20px; width: 260px; background: #fff; border: 1px solid #e5e5ea; border-radius: 14px; padding: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.12); }
        .head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
        .chip { font-size: 11px; background: #e6f7ed; color: #30d158; border-radius: 999px; padding: 2px 8px; }
        .rows { font-size: 14px; margin: 8px 0 10px; }
        .sub { font-size: 12px; color: #6e6e73; margin-bottom: 6px; }
        .log { max-height: 180px; overflow: auto; border: 1px solid #f0f0f0; border-radius: 10px; padding: 6px; }
        .item { display: grid; grid-template-columns: 1fr auto; gap: 6px; padding: 6px 0; border-bottom: 1px solid #f7f7f7; }
        .item:last-child { border-bottom: 0; }
        .muted { color: #6e6e73; font-size: 12px; text-align: center; padding: 8px 0; }
      `}</style>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="row">
      <span>{k}:</span>
      <b>{v}</b>
      <style jsx>{`.row { display: flex; justify-content: space-between; padding: 2px 0; }`}</style>
    </div>
  );
}