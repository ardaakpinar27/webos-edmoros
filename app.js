/* 🔥 FIREBASE INIT BURADA */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* CONFIG (SENİN VERDİĞİN) */
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

/* UI */
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const error = document.getElementById("error");

const authScreen = document.getElementById("authScreen");
const appRoot = document.getElementById("appRoot");

/* LOGIN */
loginBtn.addEventListener("click", async () => {
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
});

/* REGISTER */
registerBtn.addEventListener("click", async () => {
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
});

/* AUTH STATE */
onAuthStateChanged(auth, (user) => {
  if (user) {
    authScreen.classList.add("hidden");
    appRoot.classList.remove("hidden");
  } else {
    authScreen.classList.remove("hidden");
    appRoot.classList.add("hidden");
  }
});