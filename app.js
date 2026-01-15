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
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* FIREBASE CONFIG — SENİN VERDİĞİN */
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

/* SCREENS */
const loginScreen = document.getElementById("loginScreen");
const usernameScreen = document.getElementById("usernameScreen");
const appScreen = document.getElementById("appScreen");

/* INPUTS */
const email = document.getElementById("email");
const password = document.getElementById("password");
const usernameInput = document.getElementById("usernameInput");

/* ERRORS */
const loginError = document.getElementById("loginError");
const usernameError = document.getElementById("usernameError");

/* BUTTONS */
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const saveUsernameBtn = document.getElementById("saveUsernameBtn");

/* UI HELPER */
function show(screen) {
  loginScreen.classList.add("hidden");
  usernameScreen.classList.add("hidden");
  appScreen.classList.add("hidden");
  screen.classList.remove("hidden");
}

/* AUTH STATE — TEK OTORİTE */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    show(loginScreen);
    return;
  }

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { email: user.email });
    show(usernameScreen);
    return;
  }

  if (!snap.data().username) {
    show(usernameScreen);
    return;
  }

  show(appScreen);
});

/* LOGIN */
loginBtn.onclick = async () => {
  loginError.textContent = "";
  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );
  } catch (e) {
    loginError.textContent = e.code;
  }
};

/* REGISTER */
registerBtn.onclick = async () => {
  loginError.textContent = "";
  try {
    await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    );
  } catch (e) {
    loginError.textContent = e.code;
  }
};

/* SAVE USERNAME */
saveUsernameBtn.onclick = async () => {
  usernameError.textContent = "";
  const username = usernameInput.value.trim().toLowerCase();

  if (username.length < 3) {
    usernameError.textContent = "En az 3 karakter";
    return;
  }

  await updateDoc(
    doc(db, "users", auth.currentUser.uid),
    { username }
  );

  // 🔥 Manuel geçiş (auth state değişmez)
  show(appScreen);
};