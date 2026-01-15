import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyAMIIMACrsk6mNm3DQpziPHbQpwwTs2LX8",
  authDomain: "olednote.firebaseapp.com",
  projectId: "olednote",
  storageBucket: "olednote.firebasestorage.app",
  messagingSenderId: "797084747250",
  appId: "1:797084747250:web:ad8406c6abe4c699b8d76b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* SCREENS */
const scrLogin = document.getElementById("screen-login");
const scrUsername = document.getElementById("screen-username");
const scrApp = document.getElementById("screen-app");

/* LOGIN */
btnLogin.onclick = async () => {
  await signInWithEmailAndPassword(
    auth,
    loginEmail.value,
    loginPass.value
  );
};

btnRegister.onclick = async () => {
  await createUserWithEmailAndPassword(
    auth,
    loginEmail.value,
    loginPass.value
  );
};

/* AUTH FLOW */
onAuthStateChanged(auth, async user => {
  scrLogin.classList.add("hidden");
  scrUsername.classList.add("hidden");
  scrApp.classList.add("hidden");

  if (!user) {
    scrLogin.classList.remove("hidden");
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { email: user.email });
    scrUsername.classList.remove("hidden");
    return;
  }

  if (!snap.data().username) {
    scrUsername.classList.remove("hidden");
    return;
  }

  scrApp.classList.remove("hidden");
  loadRequests();
});

/* USERNAME */
btnSaveUsername.onclick = async () => {
  await updateDoc(
    doc(db, "users", auth.currentUser.uid),
    { username: usernameInput.value }
  );
};

/* FRIEND REQUEST */
btnSendRequest.onclick = async () => {
  const q = query(
    collection(db, "users"),
    where("username", "==", friendUsername.value)
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

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
    requests.innerHTML = "";
    snap.forEach(d => {
      const div = document.createElement("div");
      div.innerHTML = `
        <span>Arkadaş isteği</span>
        <button onclick="accept('${d.id}')">Kabul</button>
      `;
      requests.appendChild(div);
    });
  });
}

window.accept = async (id) => {
  await deleteDoc(doc(db, "friend_requests", id));
};