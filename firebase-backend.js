import { initializeApp } from "https://gstatic.com";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://gstatic.com";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs
} from "https://gstatic.com";

// ============================================================
// PASTE YOUR FREE FIREBASE PROJECT CONFIG KEYS BELOW:
// ============================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_://firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_://appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let auth = null;
let db = null;
let currentUser = null;
let currentUsername = "PLAYER";

// Initialize Firebase once you replace YOUR_API_KEY with your real Firebase config
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Listen for Login / Logout state changes
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    const statusEl = document.getElementById('player-status');
    const loggedOutView = document.getElementById('auth-logged-out');
    const loggedInView = document.getElementById('auth-logged-in');

    if (user) {
      loggedOutView.classList.add('hidden');
      loggedInView.classList.remove('hidden');

      // Load player's saved cloud progress from Firestore
      const userRef = doc(db, "players", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        currentUsername = data.username || user.email.split('@');

        // Merge local progress with cloud save (keeps whichever is higher)
        window.playerData.bestScore = Math.max(window.playerData.bestScore, data.bestScore || 0);
        window.playerData.coins = Math.max(window.playerData.coins, data.coins || 0);
        window.playerData.unlockedSkins = Array.from(
          new Set([...window.playerData.unlockedSkins, ...(data.unlockedSkins || [])])
        );
        window.playerData.equippedSkin = data.equippedSkin || window.playerData.equippedSkin;
        window.updateCoinsUI();
      } else {
        currentUsername = user.email.split('@');
      }

      statusEl.textContent = `LOGGED IN AS: ${currentUsername.toUpperCase()}`;
      document.getElementById('logged-in-email').textContent = `SIGNED IN: ${currentUsername.toUpperCase()} (${user.email})`;

      // Sync merged progress right back to cloud
      window.syncCloudProgress(window.playerData);
    } else {
      loggedOutView.classList.remove('hidden');
      loggedInView.classList.add('hidden');
      statusEl.textContent = "PLAYING AS GUEST (LOCAL SAVE)";
    }
  });
}

// Save progress, coins, skins & high score to Firestore
window.syncCloudProgress = async function (playerData) {
  if (!db || !currentUser) return;
  try {
    await setDoc(doc(db, "players", currentUser.uid), {
      username: currentUsername,
      bestScore: playerData.bestScore,
      coins: playerData.coins,
      unlockedSkins: playerData.unlockedSkins,
      equippedSkin: playerData.equippedSkin,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error("Cloud sync error:", err);
  }
};

// Fetch Full School Leaderboard (Everyone gets a ranked spot!)
window.loadGlobalLeaderboard = async function () {
  const listEl = document.getElementById('leaderboard-list');
  listEl.style.listStyle = "none";
  listEl.style.marginLeft = "0";

  if (!db) {
    listEl.innerHTML = `
      <li style="background:#bbf7d0; padding:6px 8px; border-bottom:2px dashed #cbd5e1;">
        #1 👑 YOU (LOCAL) - ${window.playerData.bestScore} PTS
      </li>
      <li style="padding:6px 8px; color:#64748b;">
        ADD FIREBASE KEYS IN firebase-backend.js TO COMPETE WITH YOUR SCHOOL!
      </li>
    `;
    return;
  }

  listEl.innerHTML = "<li>LOADING ALL PLAYERS...</li>";
  try {
    // Query every player ordered from highest score to lowest score
    const q = query(collection(db, "players"), orderBy("bestScore", "desc"));
    const snapshot = await getDocs(q);
    listEl.innerHTML = "";

    let rank = 1;
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const isMe = currentUser && docSnap.id === currentUser.uid;
      const li = document.createElement('li');
      li.style.padding = "6px 8px";
      li.style.borderBottom = "2px dashed #cbd5e1";

      // Highlight the current player's row so they can track their rank
      if (isMe) {
        li.style.background = "#bbf7d0";
        li.style.fontWeight = "bold";
      }

      const medal = rank === 1 ? "👑 " : rank === 2 ? "🥈 " : rank === 3 ? "🥉 " : "";
      li.textContent = `#${rank} ${medal}${(d.username || "PLAYER").toUpperCase()} - ${d.bestScore || 0}`;
      listEl.appendChild(li);
      rank++;
    });

    if (listEl.innerHTML === "") {
      listEl.innerHTML = "<li>NO SCORES YET. BE #1!</li>";
    }
  } catch (err) {
    console.error("Leaderboard error:", err);
    listEl.innerHTML = "<li>ERROR LOADING SCORES</li>";
  }
};

// Sign Up Button
document.getElementById('signup-submit-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('auth-error');
  if (!auth) {
    errEl.textContent = "PASTE YOUR FIREBASE CONFIG IN firebase-backend.js FIRST!";
    return;
  }

  const rawUsername = document.getElementById('username-input').value.trim();
  const username = rawUsername ? rawUsername.slice(0, 14) : "PLAYER";
  const email = document.getElementById('email-input').value.trim();
  const pass = document.getElementById('password-input').value;

  if (!email || !pass) {
    errEl.textContent = "ENTER AN EMAIL AND PASSWORD!";
    return;
  }

  try {
    errEl.textContent = "CREATING ACCOUNT...";
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    currentUsername = username;

    await setDoc(doc(db, "players", cred.user.uid), {
      username: currentUsername,
      bestScore: window.playerData.bestScore,
      coins: window.playerData.coins,
      unlockedSkins: window.playerData.unlockedSkins,
      equippedSkin: window.playerData.equippedSkin,
      updatedAt: Date.now()
    });

    errEl.textContent = "";
    document.getElementById('account-modal').classList.add('hidden');
  } catch (e) {
    errEl.textContent = e.message.replace("Firebase: ", "").toUpperCase();
  }
});

// Log In Button
document.getElementById('login-submit-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('auth-error');
  if (!auth) {
    errEl.textContent = "PASTE YOUR FIREBASE CONFIG IN firebase-backend.js FIRST!";
    return;
  }

  const email = document.getElementById('email-input').value.trim();
  const pass = document.getElementById('password-input').value;

  if (!email || !pass) {
    errEl.textContent = "ENTER YOUR EMAIL AND PASSWORD!";
    return;
  }

  try {
    errEl.textContent = "LOGGING IN...";
    await signInWithEmailAndPassword(auth, email, pass);
    errEl.textContent = "";
    document.getElementById('account-modal').classList.add('hidden');
  } catch (e) {
    errEl.textContent = e.message.replace("Firebase: ", "").toUpperCase();
  }
});

// Log Out Button
document.getElementById('logout-btn').addEventListener('click', async () => {
  if (auth) {
    await signOut(auth);
  }
});
