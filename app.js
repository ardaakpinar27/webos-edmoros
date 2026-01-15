import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= ELEMENTS ================= */
const authScreen = document.getElementById("authScreen");
const usernameScreen = document.getElementById("usernameScreen");
const appRoot = document.getElementById("appRoot");

const emailInput = document.getElementById("authEmail");
const passInput = document.getElementById("authPass");
const pass2Input = document.getElementById("authPass2");
const authError = document.getElementById("authError");

const usernameInput = document.getElementById("usernameInput");
const usernameError = document.getElementById("usernameError");
const saveUsernameBtn = document.getElementById("saveUsernameBtn");

/* ================= UI HELPERS ================= */
function hideAll() {
  authScreen.classList.add("hidden");
  usernameScreen.classList.add("hidden");
  appRoot.classList.add("hidden");
}

/* ================= AUTH STATE (TEK KAYNAK) ================= */
onAuthStateChanged(window.auth, async (user) => {
  hideAll();

  if (!user) {
    authScreen.classList.remove("hidden");
    return;
  }

  const ref = doc(window.db, "users", user.uid);
  const snap = await getDoc(ref);

  // Kullanıcı dokümanı YOKSA → oluştur
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      createdAt: serverTimestamp()
    });
    usernameScreen.classList.remove("hidden");
    return;
  }

  // Username yoksa
  if (!snap.data().username) {
    usernameScreen.classList.remove("hidden");
    return;
  }

  // Her şey tamam
  appRoot.classList.remove("hidden");
});

/* ================= LOGIN ================= */
loginBtn.onclick = async () => {
  authError.textContent = "";
  try {
    await signInWithEmailAndPassword(
      window.auth,
      emailInput.value.trim(),
      passInput.value
    );
    // UI burada ASLA elle değişmez
  } catch (e) {
    authError.textContent = e.code;
  }
};

/* ================= REGISTER ================= */
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

  try {
    await createUserWithEmailAndPassword(
      window.auth,
      emailInput.value.trim(),
      passInput.value
    );
    // UI burada ASLA elle değişmez
  } catch (e) {
    authError.textContent = e.code;
  }
};

/* ================= SAVE USERNAME ================= */
saveUsernameBtn.onclick = async () => {
  usernameError.textContent = "";
  const username = usernameInput.value.trim().toLowerCase();

  if (username.length < 3) {
    usernameError.textContent = "En az 3 karakter";
    return;
  }

  try {
    await updateDoc(
      doc(window.db, "users", window.auth.currentUser.uid),
      { username }
    );
    // UI yine onAuthStateChanged tarafından yönetilecek
  } catch (e) {
    usernameError.textContent = "Kaydedilemedi";
  }
};