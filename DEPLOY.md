# Deploy MacroTracker to Vercel

The app is configured to build and run on Vercel. Once deployed, you get a **public URL** (e.g. `https://macro-tracker-xxx.vercel.app`) that works on **any network** (Wi‑Fi, cellular, other devices).

## Deploy

1. **Push the project to GitHub** (if you haven’t already).

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in (GitHub).
   - Click **Add New… → Project** and import your repo.
   - Vercel will use `vercel.json`: build command `npm run build`, output `dist`. No extra settings needed.
   - **Photo Scan (production):** In the project, go to **Settings → Environment Variables**. Add `ANTHROPIC_API_KEY` with your [Anthropic API key](https://console.anthropic.com/). Redeploy so the serverless proxy can use it.
   - Click **Deploy**.

3. **Use the URL**
   - After the build finishes, Vercel gives you a URL like `https://your-project.vercel.app`. Open it on your iPhone (or any device/browser). It’s public, so it works from any network.

## Install on iPhone (Add to Home Screen)

1. Open the **deployed URL** in Safari (e.g. `https://your-project.vercel.app`).
2. Tap the **Share** button (square with arrow).
3. Tap **Add to Home Screen**.
4. Name it (e.g. “MacroTracker”) and tap **Add**.

The app will open in **standalone** mode (full screen, no browser bar) and use the app icon from the PWA manifest.

## Optional: custom domain

In the Vercel project: **Settings → Domains** to add your own domain.
