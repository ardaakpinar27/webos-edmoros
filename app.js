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
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 FIREBASE INIT */
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

/* 🔹 ELEMENTLER */
const authScreen = document.getElementById("authScreen");
const appRoot = document.getElementById("appRoot");
const error = document.getElementById("error");

/* Username ekranı yoksa eklemen GEREKİYOR */
let usernameScreen = document.getElementById("usernameScreen");

/* LOGIN UI */
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

/* UI helper */
function hideAll() {
  authScreen?.classList.add("hidden");
  usernameScreen?.classList.add("hidden");
  appRoot?.classList.add("hidden");
}

/* 🔥 TEK OTORİTE */
onAuthStateChanged(auth, async (user) => {
  hideAll();

  if (!user) {
    authScreen.classList.remove("hidden");
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  // Kullanıcı dokümanı yoksa oluştur
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      createdAt: Date.now()
    });
    if (usernameScreen) {
      usernameScreen.classList.remove("hidden");
    }
    return;
  }

  // Username yoksa
  if (!snap.data().username) {
    if (usernameScreen) {
      usernameScreen.classList.remove("hidden");
    }
    return;
  }

  // 🔥 HER ŞEY TAMAM
  appRoot.classList.remove("hidden");
});

/* LOGIN */
loginBtn.onclick = async () => {
  error.textContent = "";
  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );
  } catch (e) {
    error.textContent = e.code;
  }
};

/* REGISTER */
registerBtn.onclick = async () => {
  error.textContent = "";
  try {
    await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );
  } catch (e) {
    error.textContent = e.code;
  }
};