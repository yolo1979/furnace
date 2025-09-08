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

📺 [Watch the 5-minute demo on Loom 
➡️ [Furnace Demo on Loom](https://www.loom.com/share/674cc347d0fd4813a63155fdf4792a9a)

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