# Brave Steps — OCD Exposure Tracker

A science-based exposure therapy (ERP) companion app designed for kids dealing with contamination OCD. Built with love for a brave 12-year-old. 🦁

**Important:** This app is a companion to professional therapy, not a replacement. It should be used alongside guidance from a licensed therapist experienced in ERP/CBT for OCD.

---

## What It Does

- **Fear Ladder** — Track exposure hierarchy steps, sorted by difficulty
- **Guided Exposure Sessions** — Timed sessions with pre/during/post anxiety ratings
- **Breathing Exercises** — Three evidence-based techniques (Box, 4-7-8, 5-5)
- **Progress Dashboard** — Visual proof that habituation is working
- **Learn Section** — Age-appropriate psychoeducation about OCD and the brain
- **Offline Support** — Works without internet once loaded (PWA)
- **Privacy First** — All data stored locally on the device, never sent anywhere

---

## Deploy to GitHub Pages (Free)

### Prerequisites
- A GitHub account (free at github.com)
- Node.js installed (download from nodejs.org — get the LTS version)
- Git installed (download from git-scm.com)

### Step-by-Step

**1. Create a GitHub repository**

Go to github.com → Click "+" → "New repository"
- Name it: `brave-steps`
- Make it **Public** (required for free GitHub Pages)
- Don't initialize with README (we already have one)
- Click "Create repository"

**2. Set up the project locally**

Open your terminal and navigate to this project folder:

```bash
cd brave-steps-app
```

**3. Update the homepage URL**

Open `package.json` and change the `homepage` field to match your GitHub username:

```json
"homepage": "https://YOUR-GITHUB-USERNAME.github.io/brave-steps"
```

For example, if your GitHub username is `trippEY`:
```json
"homepage": "https://trippEY.github.io/brave-steps"
```

**4. Install dependencies**

```bash
npm install
```

**5. Test locally (optional but recommended)**

```bash
npm start
```

This opens the app at http://localhost:3000 so you can verify everything works.

**6. Initialize git and push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit - Brave Steps ERP tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/brave-steps.git
git push -u origin main
```

**7. Deploy to GitHub Pages**

```bash
npm run deploy
```

This builds the production version and pushes it to a `gh-pages` branch.

**8. Enable GitHub Pages**

- Go to your repo on GitHub → Settings → Pages
- Under "Source", select `gh-pages` branch
- Click Save
- Wait 1-2 minutes

Your app is now live at: `https://YOUR-USERNAME.github.io/brave-steps`

---

## Share With Your Sister

Send her this message:

> "Here's a link to Brave Steps for [niece's name]: https://YOUR-USERNAME.github.io/brave-steps
>
> To install it on her phone/tablet like a real app:
> - **iPhone/iPad:** Open the link in Safari → tap the Share button (box with arrow) → tap "Add to Home Screen"
> - **Android:** Open the link in Chrome → tap the three dots menu → tap "Add to Home Screen"
>
> All her data stays on her device — nothing is sent to the internet. She can use it offline once it's loaded the first time."

---

## Customizing the Fear Ladder

The default exposures are generic examples. Her therapist should help build her personalized hierarchy. She can:

1. Delete the sample items (✕ button on each item)
2. Add her own using "+ Add Step"
3. Rate each one by fear level

The app will sort them into a proper ladder automatically.

---

## Making Updates

If you want to make changes later:

1. Edit the code in `src/BraveSteps.js`
2. Test with `npm start`
3. Deploy with `npm run deploy`

Changes go live in ~1 minute.

---

## Technical Notes

- **React 18** single-page application
- **localStorage** for data persistence (device-local, ~5MB limit)
- **PWA manifest** for home screen installation
- No backend, no accounts, no data collection
- Mobile-first responsive design (optimized for phones/tablets)

---

## Clinical Design Principles

This app was designed with these therapeutic principles in mind:

1. **No reassurance** — The app never tells the user "you're safe" or "nothing bad will happen." Reassurance-seeking is a compulsion, and providing reassurance reinforces the OCD cycle.

2. **Rewards courage, not outcomes** — Encouragement messages praise the act of facing fear, not the absence of anxiety.

3. **Teaches habituation** — The before/during/after anxiety tracking is designed to show the user, through their own data, that anxiety peaks and falls naturally.

4. **Externalizes OCD** — Language frames OCD as something separate from the person ("OCD is lying to you" vs "your fears are wrong").

5. **Complements therapy** — Designed to reinforce between-session exercises, not replace professional guidance.

---

Built with ❤️ by a caring uncle and Claude.
