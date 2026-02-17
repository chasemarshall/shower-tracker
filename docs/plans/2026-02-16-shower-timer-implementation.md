# Shower Timer Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first web app that lets 3-4 household members coordinate shower usage in real time, with live status and time slot claiming.

**Architecture:** Single-page app (HTML/CSS/JS, no framework) backed by Firebase Realtime Database for instant sync. Users pick their name from a preset list (no auth). Hosted on Vercel.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Firebase Realtime Database, Vercel

---

### Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`
- Create: `js/firebase-config.js`
- Create: `.gitignore`
- Create: `vercel.json`

**Step 1: Create `.gitignore`**

```
node_modules/
.env
.vercel
```

**Step 2: Create `vercel.json`**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Step 3: Create `index.html` with basic structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shower Timer</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app">
    <!-- User selector (shown when no user selected) -->
    <div id="user-select-screen" class="screen">
      <h1>Shower Timer</h1>
      <p>Who are you?</p>
      <div id="user-buttons"></div>
    </div>

    <!-- Main screen (shown after user selected) -->
    <div id="main-screen" class="screen hidden">
      <!-- User identity badge -->
      <header>
        <span id="current-user-badge"></span>
        <button id="switch-user-btn" class="text-btn">Switch</button>
      </header>

      <!-- Status banner -->
      <div id="status-banner" class="status-free">
        <div id="status-text">SHOWER FREE</div>
        <div id="status-timer" class="hidden"></div>
      </div>

      <!-- Start/Done button -->
      <div id="action-area">
        <button id="shower-btn" class="big-btn">Start Shower</button>
      </div>

      <!-- Time slots -->
      <div id="slots-section">
        <h2>Today's Slots</h2>
        <div id="slots-list"></div>
        <button id="claim-slot-btn" class="secondary-btn">Claim a Slot</button>
      </div>

      <!-- Claim slot modal -->
      <div id="claim-modal" class="modal hidden">
        <div class="modal-content">
          <h3>Claim a Time Slot</h3>
          <label for="slot-time">Start Time</label>
          <input type="time" id="slot-time">
          <label for="slot-duration">Duration</label>
          <select id="slot-duration">
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15" selected>15 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
          </select>
          <div class="modal-actions">
            <button id="cancel-claim-btn" class="text-btn">Cancel</button>
            <button id="confirm-claim-btn" class="primary-btn">Claim</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js"></script>
  <script src="js/firebase-config.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

**Step 4: Create `js/firebase-config.js` placeholder**

```javascript
// Replace these with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
```

**Step 5: Create empty `css/style.css` and `js/app.js`**

Empty files to be filled in subsequent tasks.

**Step 6: Commit**

```bash
git add .gitignore vercel.json index.html js/firebase-config.js js/app.js css/style.css
git commit -m "feat: scaffold project with HTML structure and Firebase config placeholder"
```

---

### Task 2: Mobile-First CSS

**Files:**
- Create: `css/style.css`

**Step 1: Write all styles**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --green: #22c55e;
  --green-bg: #dcfce7;
  --red: #ef4444;
  --red-bg: #fee2e2;
  --gray: #6b7280;
  --light-gray: #f3f4f6;
  --dark: #111827;
  --white: #ffffff;
  --radius: 12px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--light-gray);
  color: var(--dark);
  min-height: 100dvh;
}

.screen {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
}

.hidden {
  display: none !important;
}

/* User select screen */
#user-select-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: 16px;
}

#user-select-screen h1 {
  font-size: 28px;
  font-weight: 700;
}

#user-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 280px;
}

#user-buttons button {
  padding: 16px;
  font-size: 18px;
  border: 2px solid var(--dark);
  border-radius: var(--radius);
  background: var(--white);
  cursor: pointer;
  font-weight: 600;
}

#user-buttons button:active {
  background: var(--dark);
  color: var(--white);
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 16px;
}

#current-user-badge {
  font-weight: 700;
  font-size: 16px;
}

.text-btn {
  background: none;
  border: none;
  color: var(--gray);
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

/* Status banner */
#status-banner {
  border-radius: var(--radius);
  padding: 32px 20px;
  text-align: center;
  margin-bottom: 24px;
  transition: background 0.3s, color 0.3s;
}

#status-banner.status-free {
  background: var(--green-bg);
  color: var(--green);
}

#status-banner.status-occupied {
  background: var(--red-bg);
  color: var(--red);
}

#status-text {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 1px;
}

#status-timer {
  font-size: 40px;
  font-weight: 700;
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
}

/* Action area */
#action-area {
  margin-bottom: 32px;
}

.big-btn {
  width: 100%;
  padding: 20px;
  font-size: 20px;
  font-weight: 700;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  background: var(--green);
  color: var(--white);
}

.big-btn.stop-btn {
  background: var(--red);
}

.big-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Slots section */
#slots-section h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

#slots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.slot-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--white);
  padding: 12px 16px;
  border-radius: var(--radius);
  font-size: 15px;
}

.slot-card .slot-user {
  font-weight: 600;
}

.slot-card .slot-time {
  color: var(--gray);
}

.slot-card .slot-delete {
  background: none;
  border: none;
  color: var(--red);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}

.secondary-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: 2px dashed var(--gray);
  border-radius: var(--radius);
  background: none;
  color: var(--gray);
  cursor: pointer;
}

.no-slots {
  text-align: center;
  color: var(--gray);
  padding: 16px;
  font-size: 14px;
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.modal-content {
  background: var(--white);
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  border-radius: var(--radius) var(--radius) 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-content h3 {
  font-size: 20px;
}

.modal-content label {
  font-size: 14px;
  color: var(--gray);
  font-weight: 600;
}

.modal-content input,
.modal-content select {
  padding: 12px;
  font-size: 16px;
  border: 2px solid var(--light-gray);
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.primary-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: var(--green);
  color: var(--white);
  cursor: pointer;
}
```

**Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: add mobile-first CSS with status, slots, and modal styles"
```

---

### Task 3: All JavaScript Logic

**Files:**
- Modify: `js/app.js`

**Step 1: Implement all app logic using safe DOM methods (no innerHTML)**

All DOM content must use `textContent` and `createElement` — never `innerHTML` — to prevent XSS.

```javascript
// ===== User Management =====
const USERS = ['Chase', 'Mom', 'Dad', 'Sibling'];

function getCurrentUser() {
  return localStorage.getItem('showerTimerUser');
}

function setCurrentUser(name) {
  localStorage.setItem('showerTimerUser', name);
}

function clearCurrentUser() {
  localStorage.removeItem('showerTimerUser');
}

function renderUserSelect() {
  const container = document.getElementById('user-buttons');
  container.replaceChildren(); // safe clear
  USERS.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.addEventListener('click', () => {
      setCurrentUser(name);
      showMainScreen();
    });
    container.appendChild(btn);
  });
}

function showUserSelect() {
  document.getElementById('user-select-screen').classList.remove('hidden');
  document.getElementById('main-screen').classList.add('hidden');
  renderUserSelect();
}

function showMainScreen() {
  const user = getCurrentUser();
  if (!user) return showUserSelect();
  document.getElementById('user-select-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  document.getElementById('current-user-badge').textContent = user;
  initFirebaseListeners();
}

// Switch user
document.getElementById('switch-user-btn').addEventListener('click', () => {
  clearCurrentUser();
  stopFirebaseListeners();
  showUserSelect();
});

// ===== Firebase Listeners =====
let statusRef, slotsRef, statusListener, slotsListener, timerInterval;

function initFirebaseListeners() {
  statusRef = db.ref('status');
  slotsRef = db.ref('slots');

  statusListener = statusRef.on('value', snapshot => {
    renderStatus(snapshot.val());
  });

  slotsListener = slotsRef.on('value', snapshot => {
    renderSlots(snapshot.val());
  });
}

function stopFirebaseListeners() {
  if (statusRef && statusListener) statusRef.off('value', statusListener);
  if (slotsRef && slotsListener) slotsRef.off('value', slotsListener);
  if (timerInterval) clearInterval(timerInterval);
}

// ===== Status Rendering =====
function renderStatus(status) {
  const banner = document.getElementById('status-banner');
  const text = document.getElementById('status-text');
  const timer = document.getElementById('status-timer');
  const btn = document.getElementById('shower-btn');
  const user = getCurrentUser();

  if (timerInterval) clearInterval(timerInterval);

  if (status && status.currentUser) {
    banner.className = 'status-occupied';
    text.textContent = 'OCCUPIED \u2014 ' + status.currentUser + ' is showering';
    timer.classList.remove('hidden');

    const startedAt = status.startedAt;
    function updateTimer() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      timer.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
      if (elapsed >= 1800 && status.currentUser === user) {
        stopShower();
      }
    }
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);

    if (status.currentUser === user) {
      btn.textContent = 'Done';
      btn.className = 'big-btn stop-btn';
      btn.disabled = false;
    } else {
      btn.textContent = status.currentUser + ' is showering...';
      btn.className = 'big-btn stop-btn';
      btn.disabled = true;
    }
  } else {
    banner.className = 'status-free';
    text.textContent = 'SHOWER FREE';
    timer.classList.add('hidden');
    timer.textContent = '';
    btn.textContent = 'Start Shower';
    btn.className = 'big-btn';
    btn.disabled = false;
  }
}

// ===== Shower Start/Stop =====
function startShower() {
  const user = getCurrentUser();
  db.ref('status').set({
    currentUser: user,
    startedAt: Date.now()
  });
}

function stopShower() {
  db.ref('status').set({
    currentUser: null,
    startedAt: null
  });
}

document.getElementById('shower-btn').addEventListener('click', () => {
  const btn = document.getElementById('shower-btn');
  if (btn.disabled) return;

  if (btn.textContent === 'Done') {
    stopShower();
  } else {
    // Check if someone has a slot starting within 5 minutes
    const now = new Date();
    if (currentSlots) {
      Object.values(currentSlots).forEach(slot => {
        if (slot.date === getToday()) {
          const parts = slot.startTime.split(':');
          const slotStart = new Date();
          slotStart.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
          const diffMin = (slotStart - now) / 60000;
          if (diffMin > 0 && diffMin <= 5) {
            alert('Heads up: ' + slot.user + ' has a slot at ' + slot.startTime + '. Starting anyway.');
          }
        }
      });
    }
    startShower();
  }
});

// ===== Slots Rendering =====
let currentSlots = null;

function getToday() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatTimeRange(startTime, durationMinutes) {
  const parts = startTime.split(':');
  const start = new Date();
  start.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const fmt = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return fmt(start) + ' \u2013 ' + fmt(end);
}

function renderSlots(slots) {
  currentSlots = slots;
  const list = document.getElementById('slots-list');
  list.replaceChildren(); // safe clear
  const today = getToday();
  const user = getCurrentUser();
  const now = new Date();

  if (!slots) {
    const empty = document.createElement('div');
    empty.className = 'no-slots';
    empty.textContent = 'No slots claimed for today';
    list.appendChild(empty);
    return;
  }

  const todaySlots = Object.entries(slots)
    .filter(function(entry) {
      return entry[1].date === today;
    })
    .filter(function(entry) {
      const s = entry[1];
      const parts = s.startTime.split(':');
      const endTime = new Date();
      endTime.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10) + s.durationMinutes, 0, 0);
      return endTime > now;
    })
    .sort(function(a, b) {
      return a[1].startTime.localeCompare(b[1].startTime);
    });

  if (todaySlots.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-slots';
    empty.textContent = 'No slots claimed for today';
    list.appendChild(empty);
    return;
  }

  todaySlots.forEach(function(entry) {
    const id = entry[0];
    const slot = entry[1];
    const card = document.createElement('div');
    card.className = 'slot-card';

    const info = document.createElement('div');
    const userName = document.createElement('span');
    userName.className = 'slot-user';
    userName.textContent = slot.user;
    const timeSpan = document.createElement('span');
    timeSpan.className = 'slot-time';
    timeSpan.textContent = ' ' + formatTimeRange(slot.startTime, slot.durationMinutes);
    info.appendChild(userName);
    info.appendChild(timeSpan);
    card.appendChild(info);

    if (slot.user === user) {
      const delBtn = document.createElement('button');
      delBtn.className = 'slot-delete';
      delBtn.textContent = '\u2715';
      delBtn.addEventListener('click', function() {
        db.ref('slots/' + id).remove();
      });
      card.appendChild(delBtn);
    }
    list.appendChild(card);
  });
}

// ===== Claim Slot Modal =====
document.getElementById('claim-slot-btn').addEventListener('click', () => {
  const now = new Date();
  const min = Math.ceil(now.getMinutes() / 15) * 15;
  now.setMinutes(min, 0, 0);
  if (min >= 60) now.setHours(now.getHours() + 1, 0, 0, 0);
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  document.getElementById('slot-time').value = timeStr;
  document.getElementById('claim-modal').classList.remove('hidden');
});

document.getElementById('cancel-claim-btn').addEventListener('click', () => {
  document.getElementById('claim-modal').classList.add('hidden');
});

document.getElementById('confirm-claim-btn').addEventListener('click', () => {
  const time = document.getElementById('slot-time').value;
  const duration = parseInt(document.getElementById('slot-duration').value, 10);
  const user = getCurrentUser();
  const today = getToday();

  if (!time) {
    alert('Please select a start time');
    return;
  }

  // Check for overlap
  if (currentSlots) {
    const newParts = time.split(':');
    const newStart = parseInt(newParts[0], 10) * 60 + parseInt(newParts[1], 10);
    const newEnd = newStart + duration;

    const overlap = Object.values(currentSlots).some(function(slot) {
      if (slot.date !== today) return false;
      const sParts = slot.startTime.split(':');
      const sStart = parseInt(sParts[0], 10) * 60 + parseInt(sParts[1], 10);
      const sEnd = sStart + slot.durationMinutes;
      return newStart < sEnd && newEnd > sStart;
    });

    if (overlap) {
      alert('This time overlaps with an existing slot. Pick a different time.');
      return;
    }
  }

  db.ref('slots').push({
    user: user,
    date: today,
    startTime: time,
    durationMinutes: duration
  });

  document.getElementById('claim-modal').classList.add('hidden');
});

// Close modal on backdrop click
document.getElementById('claim-modal').addEventListener('click', function(e) {
  if (e.target.id === 'claim-modal') {
    document.getElementById('claim-modal').classList.add('hidden');
  }
});

// ===== Init =====
if (getCurrentUser()) {
  showMainScreen();
} else {
  showUserSelect();
}
```

**Step 2: Open in browser and verify all features work**

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: implement user selection, status display, shower toggle, and slot claiming"
```

---

### Task 4: Firebase Setup

**This is a manual step — the user needs to create a Firebase project.**

**Step 1: Create Firebase project**

1. Go to https://console.firebase.google.com
2. Create new project "shower-timer" (or similar)
3. Go to Realtime Database > Create Database
4. Start in **test mode** (open rules for now)
5. Go to Project Settings > Your Apps > Add Web App
6. Copy the config object

**Step 2: Update `js/firebase-config.js` with real values**

Replace the placeholder config with the real Firebase config.

**Step 3: Set database rules**

In Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

(This is fine for a household-only app on a private URL.)

**Step 4: Seed initial data**

In Firebase Console > Realtime Database, manually add:

```json
{
  "status": {
    "currentUser": null,
    "startedAt": null
  }
}
```

**Step 5: Test in browser**

Open `index.html`, select user, tap "Start Shower", verify status updates. Open in a second tab to verify real-time sync.

**Step 6: Commit**

```bash
git add js/firebase-config.js
git commit -m "feat: configure Firebase with project credentials"
```

---

### Task 5: Deploy to Vercel

**Step 1: Install Vercel CLI (if not already installed)**

```bash
npm i -g vercel
```

**Step 2: Deploy**

```bash
vercel --prod
```

Follow the prompts to link the project.

**Step 3: Test on phone**

Open the Vercel URL on your phone. Test all features:
- Pick a user
- Start/stop shower
- Claim a slot
- Open on a second phone to verify real-time sync

**Step 4: Commit any Vercel config changes**

```bash
git add -A
git commit -m "chore: add Vercel deployment config"
```

---

### Task 6: Polish and Edge Cases

**Files:**
- Modify: `js/app.js`
- Modify: `index.html`

**Step 1: Add auto-cleanup of old slots**

Add to `initFirebaseListeners()` after setting up listeners:

```javascript
// Clean up yesterday's slots on load
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
db.ref('slots').orderByChild('date').endAt(yesterdayStr).once('value', function(snap) {
  snap.forEach(function(child) { child.ref.remove(); });
});
```

**Step 2: Add PWA meta tags to `index.html` `<head>`**

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#22c55e">
```

**Step 3: Test everything end to end**

- Start shower, verify timer runs
- Wait or simulate 30 min auto-release
- Claim overlapping slot, verify rejection
- Claim valid slot, verify it appears
- Delete own slot
- Switch users
- Open on two phones simultaneously

**Step 4: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add slot cleanup, PWA meta tags, and edge case handling"
```

---

## Summary

| Task | What | Estimated Effort |
|------|------|-----------------|
| 1 | Project scaffolding (HTML, CSS/JS files, config) | Quick |
| 2 | Mobile-first CSS | Quick |
| 3 | All JS logic (user select, status, shower toggle, slots) | Main work |
| 4 | Firebase setup (manual — console + config) | Manual |
| 5 | Deploy to Vercel | Quick |
| 6 | Polish (slot cleanup, PWA tags, testing) | Quick |
