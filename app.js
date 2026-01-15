import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ========== SCREENS ========== */
const authScreen = document.getElementById("authScreen");
const usernameScreen = document.getElementById("usernameScreen");
const appRoot = document.getElementById("appRoot");

/* ========== AUTH UI ========== */
const emailInput = document.getElementById("authEmail");
const passInput = document.getElementById("authPass");
const pass2Input = document.getElementById("authPass2");
const authError = document.getElementById("authError");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

/* ========== USERNAME UI ========== */
const usernameInput = document.getElementById("usernameInput");
const saveUsernameBtn = document.getElementById("saveUsernameBtn");
const usernameError = document.getElementById("usernameError");

/* ========== AUTH STATE FLOW ========== */
onAuthStateChanged(window.auth, async (user) => {
  authScreen.classList.add("hidden");
  usernameScreen.classList.add("hidden");
  appRoot.classList.add("hidden");

  if (!user) {
    authScreen.classList.remove("hidden");
    return;
  }

  const userRef = doc(window.db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists() || !snap.data().username) {
    usernameScreen.classList.remove("hidden");
  } else {
    appRoot.classList.remove("hidden");
  }
});

/* ========== LOGIN ========== */
loginBtn.onclick = async () => {
  authError.textContent = "";
  try{
    await signInWithEmailAndPassword(
      window.auth,
      emailInput.value,
      passInput.value
    );
  }catch(e){
    authError.textContent = e.message;
  }
};

/* ========== REGISTER ========== */
registerBtn.onclick = async () => {
  authError.textContent = "";

  if (pass2Input.classList.contains("hidden")) {
    pass2Input.classList.remove("hidden");
    return;
  }

  if (passInput.value !== pass2Input.value) {
    authError.textContent = "Şifreler uyuşmuyor";
    return;
  }

  try{
    await createUserWithEmailAndPassword(
      window.auth,
      emailInput.value,
      passInput.value
    );
  }catch(e){
    authError.textContent = e.message;
  }
};

/* ========== SAVE USERNAME ========== */
saveUsernameBtn.onclick = async () => {
  usernameError.textContent = "";

  const username = usernameInput.value.trim().toLowerCase();

  if (username.length < 3) {
    usernameError.textContent = "En az 3 karakter";
    return;
  }

  try{
    await setDoc(
      doc(window.db, "users", window.auth.currentUser.uid),
      { username },
      { merge:true }
    );
  }catch(e){
    usernameError.textContent = e.message;
  }
};