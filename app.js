import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAMIIMACrsk6mNm3DQpziPHbQpwwTs2LX8",
  authDomain: "olednote.firebaseapp.com",
  projectId: "olednote",
  storageBucket: "olednote.firebasestorage.app",
  messagingSenderId: "797084747250",
  appId: "1:797084747250:web:ad8406c6abe4c699b8d76b"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ELEMENTS */
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginError = document.getElementById("loginError");

const friendUsername = document.getElementById("friendUsername");
const friendError = document.getElementById("friendError");
const requestsDiv = document.getElementById("requests");

/* AUTH */
loginBtn.onclick = async () => {
  loginError.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    loginError.textContent = e.code;
  }
};

registerBtn.onclick = async () => {
  loginError.textContent = "";
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    loginError.textContent = e.code;
  }
};

/* AUTH STATE */
onAuthStateChanged(auth, async user => {
  if (!user) {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
    return;
  }

  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { email: user.email });
  }

  loadRequests();
});

/* TABS */
btnChats.onclick = () => {
  tabChats.classList.add("active");
  tabFriends.classList.remove("active");
};
btnFriends.onclick = () => {
  tabFriends.classList.add("active");
  tabChats.classList.remove("active");
};

/* SEND FRIEND REQUEST */
sendRequestBtn.onclick = async () => {
  friendError.textContent = "";
  const q = query(
    collection(db, "users"),
    where("username", "==", friendUsername.value)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    friendError.textContent = "Kullanıcı bulunamadı";
    return;
  }
  await addDoc(collection(db, "friend_requests"), {
    from: auth.currentUser.uid,
    to: snap.docs[0].id
  });
};

/* LOAD REQUESTS */
function loadRequests() {
  const q = query(
    collection(db, "friend_requests"),
    where("to", "==", auth.currentUser.uid)
  );
  onSnapshot(q, snap => {
    requestsDiv.innerHTML = "";
    snap.forEach(d => {
      const div = document.createElement("div");
      div.className = "request";
      div.innerHTML = `
        <span>Arkadaş isteği</span>
        <button onclick="accept('${d.id}')">Kabul</button>
      `;
      requestsDiv.appendChild(div);
    });
  });
}

window.accept = async (id) => {
  await deleteDoc(doc(db, "friend_requests", id));
};