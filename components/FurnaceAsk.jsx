// components/FurnaceAsk.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

const OPENAI_PRICES = {
  // example pricing (per 1K tokens)
  "gpt-4o-mini": { prompt: 0.0005, completion: 0.0015 },
  "gpt-4o": { prompt: 0.005, completion: 0.015 },
  "gpt-4.1-mini": { prompt: 0.003, completion: 0.006 },
};

const PROVIDERS = [
  { id: "openai", label: "OpenAI (token-based)" },
  { id: "replit", label: "Replit (manual balance)" },
];

export default function FurnaceAsk() {
  // top summary
  const [balance, setBalance] = useState(25);
  const [budget, setBudget] = useState(5);
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

  // derived
  const remaining = useMemo(() => Math.max(budget - burned, 0), [budget, burned]);
  const within = useMemo(() => burned <= budget, [burned, budget]);

  // connect BroadcastChannel for live tally (dashboard + popout + menubar widget)
  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel("furnace-tally");
      return () => bcRef.current?.close();
    } catch {
      bcRef.current = null;
    }
  }, []);

  // helper: push current tally to other windows + localStorage
  const pushTally = (extraSteps = []) => {
    const payload = {
      burned,
      budget,
      balance,
      remaining,
      results: extraSteps,
      ts: Date.now(),
    };
    try {
      localStorage.setItem("furnace:tally", JSON.stringify(payload));
    } catch {}
    try {
      bcRef.current?.postMessage(payload);
    } catch {}
  };

  // estimate calculator (for OpenAI)
  useEffect(() => {
    if (provider !== "openai") return;
    const price = OPENAI_PRICES[model] || OPENAI_PRICES["gpt-4o-mini"];
    const dollars =
      ((promptTokens / 1000) * price.prompt || 0) +
      ((completionTokens / 1000) * price.completion || 0);
    setEstimate(Number(dollars.toFixed(2)));
  }, [provider, model, promptTokens, completionTokens]);

  // fetch balance (stub for demo)
  const fetchBalance = async () => {
    // In a real connector, call your provider API here.
    // We’ll just retain the current value (so the button is “demo-safe”).
    setBalance((b) => b);
  };

  // -------- Slack integration helpers --------

  async function postToSlack(message) {
    try {
      await fetch("/api/slack/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
    } catch (e) {
      // Fail silently for demo; we don’t want UI to break if Slack is down.
      console.warn("Slack post failed:", e);
    }
  }

  // one “result” of an agent step gets tallied here
  async function addResult(cost, info = "Agent step") {
    const step = {
      i: Date.now(),
      ts: new Date().toLocaleTimeString(),
      cost: Number(cost || 0),
      info,
    };
    setBurned((prev) => {
      const next = Number((prev + step.cost).toFixed(2));
      // push to other windows
      pushTally([step]);

      // Slack alert for this step
      const msg =
        `🔥 Burn update\n` +
        `• Step: ${info}\n` +
        `• Cost: ${formatMoney(step.cost)}\n` +
        `• Burned: ${formatMoney(next)} / Budget: ${formatMoney(budget)}\n` +
        `• Remaining: ${formatMoney(Math.max(budget - next, 0))}`;
      postToSlack(msg);

      return next;
    });
  }

  // arm/run demo sequence
  const runDemo = async () => {
    setTracking(true);
    pushTally(); // initial snapshot

    // simulate 3 steps
    await wait(800);
    await addResult(0.25, "Search + plan");
    await wait(900);
    await addResult(0.4, "Draft + refine");
    await wait(800);
    await addResult(0.2, "Validate + summarize");

    setTracking(false);
  };

  const resetAll = () => {
    setBurned(0);
    pushTally([]);
  };

  // save latest snapshot (so API /popout/widget can read it)
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/tally/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            burned,
            budget,
            balance,
            remaining,
          }),
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
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
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
              value={budget}
              min={0}
              onChange={(e) => setBudget(Number(e.target.value || 0))}
            />
          </label>

          {provider === "openai" && (
            <>
              <label className="span2">
                Model
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {Object.keys(OPENAI_PRICES).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Prompt tokens (estimate)
                <input
                  type="number"
                  value={promptTokens}
                  min={0}
                  onChange={(e) =>
                    setPromptTokens(Number(e.target.value || 0))
                  }
                />
              </label>

              <label>
                Completion tokens (estimate)
                <input
                  type="number"
                  value={completionTokens}
                  min={0}
                  onChange={(e) =>
                    setCompletionTokens(Number(e.target.value || 0))
                  }
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
          <button onClick={runDemo} disabled={tracking}>
            {tracking ? "Burning…" : "Time to Burn"}
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
        </div>
      </section>

      {/* docked live tally (reads BroadcastChannel/localStorage) */}
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
        <Row k="Burned" v={formatMoney(tally.burned)} />
        <Row k="Remaining" v={formatMoney(tally.remaining)} />
        <Row k="Budget" v={formatMoney(tally.budget)} />
        <Row k="Balance" v={formatMoney(tally.balance)} />
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
      <style jsx>{`
        .row { display: flex; justify-content: space-between; padding: 2px 0; }
      `}</style>
    </div>
  );
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}