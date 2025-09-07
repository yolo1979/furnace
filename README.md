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
Invisible AI spend — tokens, credits, and cycles vanish during agent runs with no visibility…

## 💡 The Solution
Furnace is the fire alarm for runaway AI spend…

---

## 🔑 Who Needs Furnace?
Furnace isn’t tied to one platform — it’s designed for **any AI provider that charges by credits, tokens, or usage**.
Today, nearly every major service already uses this model:

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

🔥 **The point:** Whether you’re building apps, running agents, or generating media, **credits are the new currency of AI** — and they disappear fast.  
Furnace makes sure you can *see, track, and cap the burn* before it’s too late.

## 🎥 Demo Video

📺 [Watch the 5-minute demo on YouTube](https://youtube.com/your-demo-link-here)  

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
