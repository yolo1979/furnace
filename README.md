# 🔥 Furnace

**Balance • Budget • Tally**  
*Track and control AI agent costs in real time — before your credits vanish.*

---

## 📖 Overview

AI agents are powerful, but invisible costs can burn through your credits faster than expected. **Furnace** gives you **real-time cost visibility**, letting you:

- ✅ Set a budget per ask  
- ✅ Estimate token costs before running  
- ✅ Track burns live with a tally (in-app + menu bar widget)  
- ✅ Send budget alerts to Slack via secure **Descope Outbound Apps** (no hardcoded tokens)

---

## 🚨 The Problem
Invisible AI spend — tokens, credits, and cycles vanish during agent runs with no visibility.  
Teams discover the damage only afterwards, when credits are already burned.

## 💡 The Solution
**Furnace is the fire alarm for runaway AI spend.**  
It shows balance, budget, and live burn rate in real time — with alerts before the fire gets out of control.  

And this isn’t just about OpenAI. Nearly every modern AI platform charges in **tokens, credits, or usage hours**. That’s why Furnace is designed to work universally.

---

Problem Statement & Objective

In today’s AI-driven world, almost every major platform — from OpenAI to Replit to Manus — uses token- or credit-based billing models. While these systems make AI more accessible, they share a critical weakness:
	•	Invisible Spending – users only discover what they’ve burned after the fact.
	•	Budget Shock – developers blow through credits unexpectedly, with no real-time awareness.
	•	Lack of Controls – there’s no universal tool to set budgets, track burn rate, or get alerts across providers.

This issue is not limited to advanced teams. From indie developers experimenting with prompts, to startups running agentic workflows, to students on free-tier credits — the lack of real-time spend visibility is a universal problem.

Objective:
Our project, 🔥 Furnace, tackles this problem by giving users live awareness and control of AI spend — before, during, and after running their agents. Furnace acts like a “burn meter” for AI usage, ensuring you can set a budget, see spend as it happens, and get alerts before you cross the line.

⸻

Methodology

We designed Furnace to work as a lightweight layer on top of existing AI providers. The methodology is simple:
	1.	Budget Setting – User sets an initial balance and budget cap.
	2.	Live Tally – Furnace tracks burned tokens/credits in real-time, showing a clear tally of what’s been spent and what remains.
	3.	Estimation Engine – For OpenAI, Furnace calculates expected costs using official per-token pricing. For providers without pricing APIs (e.g. Replit), users can log manual burn steps.
	4.	Alerts & Notifications – When spend approaches 80%, Furnace sends a Slack alert (via secure Descope integration). At 100%, it stops the burn automatically.
	5.	Cross-Platform Access – Users can view the tally:
	•	In the web dashboard (Next.js, Vercel)
	•	In a pop-out tally window
	•	In the Mac menu bar app (Electron menubar with 🔥 icon)

This ensures constant visibility — wherever the user works.

⸻

Scope of the Solution
	•	Universal Application – Works with any credit/token-based AI service (OpenAI, Replit, Manus, Anthropic, etc.).
	•	Secure by Design – Integrates Slack via Descope Outbound Apps, ensuring no hardcoded tokens and frictionless user auth.
	•	Scalable – Current prototype supports single-user budgets, but the same architecture can extend to team dashboards, shared credits, and multi-provider usage.
	•	Innovative Edge – Adds features no provider offers natively: live burn meter, auto-stop at budget, and multi-platform visibility.

⸻

Additional Details
	•	Tech Stack: Next.js (frontend), Vercel (hosting), Electron (menubar app), Slack API, Descope (secure auth).
	•	Innovation Highlights:
	•	Auto-Burn Mode – simulates ongoing agent runs until budget is exhausted.
	•	Cross-Runtime Tally Sync – syncs burn data between browser, menubar, and Slack.
	•	Slack Alerts – seamless notifications without manual token handling.
	•	Future Roadmap:
	•	Multi-provider adapters for Anthropic, Cohere, and beyond.
	•	Shared team budgets with role-based access.
	•	Browser extension for inline burn tracking during prompt testing.


## 🔑 Who Needs Furnace?
Furnace isn’t tied to one provider — it’s built for **any AI service that bills by credits, tokens, or usage**.  
Today, nearly every major platform already uses this model:

### **AI Model Providers**
- OpenAI – credits & token-based pricing (gpt-4, gpt-4o, gpt-4o-mini, etc.).  
- Anthropic (Claude) – token-based pricing.  
- Mistral – API usage billed per token.  
- Cohere – API credits/token usage.  

### **Developer Platforms**
- Replit – cycles (credits) consumed per agent run / AI request.  
- Manus – token-based plan for agent executions.  
- Hugging Face Inference – credit-based usage (per inference call).  

### **Creative / Generative Tools**
- MidJourney – “fast hours” credit system.  
- Runway ML – credits for video generation.  
- Stable Diffusion APIs (Replicate, Stability AI) – per-credit inference.  

🔥 **The point:** Whether you’re coding, prompting, or generating media, **credits are the new currency of AI** — and they disappear fast.  
Furnace makes sure you can *see, track, and cap the burn* before it’s too late.

---

## 🎥 Demo Video

📺 [Watch the 5-minute demo on Youtube
➡️ [Furnace Demo on Youtube] ( https://www.youtube.com/watch?v=4ig3cwXcSZk)

The demo shows:  
1. Setting a budget and burning step-by-step  
2. Live tally updating in the dashboard + widget  
3. Slack alerts firing when budget thresholds are hit  

---

## 🚀 Live App

🔗 [Deployed on Vercel](https://furnace-one.vercel.app)

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) — Frontend + API routes  
- [Vercel](https://vercel.com/) — Hosting & environment management  
- [Electron](https://www.electronjs.org/) — macOS menubar widget  
- [Slack API](https://api.slack.com/) — Real-time notifications  
- [Descope](https://www.descope.com/) — Secure outbound app integration  
- [BroadcastChannel + localStorage] — Cross-window live tally sync  

---

## 📂 Repo Structure
/components
FurnaceAsk.jsx      → main dashboard component
/pages
index.js            → homepage
tally.js            → live tally popout
/api
tally/save.js     → save tally snapshot
tally/latest.js   → return latest tally
slack/post.js     → send Slack alerts
/styles
globals.css         → clean Apple-style theme

---

## 🔮 Future Roadmap

Furnace is just the start. Here’s what’s next:

- **Multi-provider adapters** → direct API hooks for OpenAI, Anthropic, Replit, Hugging Face, and more.  
- **Automatic cost estimates** → detect model + token size automatically, no manual input needed.  
- **Team dashboards** → shared budget views with role-based access and per-user limits.  
- **Predictive alerts** → estimate *time-to-burn* based on live usage trends.  
- **Export & reports** → generate weekly/monthly usage reports for finance & ops teams.  
- **Cross-platform support** → Windows/Linux tray apps, mobile companion app for spend alerts.  

---

## 👥 Team

Built by **Padraig O’Brien** (solo).  
Part of the [Global MCP Hackathon](https://www.descope.com/sign-up-global-mcp-hackathon).

---

## 📜 License

MIT License — free to use, modify, and extend.  

---

🔥 *Furnace: the fire alarm for runaway AI spend.*