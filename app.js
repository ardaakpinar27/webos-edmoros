import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc, collection, addDoc, 
  query, where, getDocs, onSnapshot, deleteDoc 
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* DOM ELEMENTS */
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

// Login/Register Forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authError = document.getElementById("authError");

// Navigation
const tabChats = document.getElementById("tabChats");
const tabFriends = document.getElementById("tabFriends");
const navChats = document.getElementById("navChats");
const navFriends = document.getElementById("navFriends");

/* --- AUTH EVENTS --- */

// Giriş ve Kayıt Formları Arası Geçiş
document.getElementById("btnSwitchToRegister").onclick = () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  authError.textContent = "";
};

document.getElementById("btnSwitchToLogin").onclick = () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  authError.textContent = "";
};

// GİRİŞ YAP
document.getElementById("btnLoginAction").onclick = async () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;
  authError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    authError.textContent = "Hata: " + e.message;
  }
};

// KAYIT OL (USERNAME ALMA MANTIĞI BURADA)
document.getElementById("btnRegisterAction").onclick = async () => {
  const username = document.getElementById("regUsername").value.trim().toLowerCase();
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPassword").value;
  authError.textContent = "";

  if(!username || username.length < 3) {
    authError.textContent = "Geçerli bir kullanıcı adı girin.";
    return;
  }

  try {
    // 1. Önce kullanıcı adı alınmış mı kontrol et
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      throw new Error("Bu kullanıcı adı zaten kullanılıyor.");
    }

    // 2. Firebase Auth ile kullanıcı oluştur
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;

    // 3. Firestore'a kullanıcı bilgilerini (username ile) kaydet
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      username: username,
      uid: user.uid,
      createdAt: new Date()
    });

  } catch (e) {
    authError.textContent = e.message.replace("Firebase: ", "");
  }
};

// ÇIKIŞ YAP (Giriş Çıkış Düzeltmesi)
document.getElementById("btnLogout").onclick = () => {
  signOut(auth);
};

/* --- STATE LISTENER --- */
onAuthStateChanged(auth, user => {
  if (user) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    loadRequests(); // İstekleri dinle
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
    // Formları sıfırla
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  }
});

/* --- TABS --- */
navChats.onclick = () => {
  setActiveTab(navChats, tabChats);
};
navFriends.onclick = () => {
  setActiveTab(navFriends, tabFriends);
};

function setActiveTab(navBtn, tabContent) {
  // Reset all
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  // Set active
  navBtn.classList.add("active");
  tabContent.classList.add("active");
}

/* --- FRIEND LOGIC --- */

// Arkadaş İsteği Gönder
document.getElementById("btnAddFriend").onclick = async () => {
  const targetUsername = document.getElementById("friendUsernameInput").value.trim().toLowerCase();
  const errorEl = document.getElementById("friendError");
  errorEl.textContent = "";

  if(!targetUsername) return;
  if(targetUsername === getCurrentUserUsername()) { // (Basit bir kontrol eklenebilir)
     errorEl.textContent = "Kendini ekleyemezsin.";
     return;
  }

  try {
    const q = query(collection(db, "users"), where("username", "==", targetUsername));
    const snap = await getDocs(q);

    if (snap.empty) {
      errorEl.textContent = "Kullanıcı bulunamadı.";
      return;
    }

    const targetUser = snap.docs[0];
    
    // İstek gönder
    await addDoc(collection(db, "friend_requests"), {
      from: auth.currentUser.uid,
      fromUsername: "Bilinmiyor", // İdealde kendi username'imizi de çekeriz
      to: targetUser.id,
      status: "pending"
    });
    
    document.getElementById("friendUsernameInput").value = "";
    alert("İstek gönderildi!");

  } catch (e) {
    errorEl.textContent = "Hata oluştu.";
    console.error(e);
  }
};

// Gelen İstekleri Dinle
function loadRequests() {
  const q = query(
    collection(db, "friend_requests"),
    where("to", "==", auth.currentUser.uid)
  );

  onSnapshot(q, snap => {
    const list = document.getElementById("requestsList");
    list.innerHTML = "";
    
    if(snap.empty) {
      list.innerHTML = "<p style='padding:0 16px; font-size:13px; color:#888;'>Yeni istek yok.</p>";
    }

    snap.forEach(d => {
      const data = d.data();
      const div = document.createElement("div");
      div.className = "request-card";
      // Gönderen kişinin adını bulmak için basit bir gösterim
      div.innerHTML = `
        <span>Bir arkadaş isteği</span>
        <button class="btn btn-primary" id="accept-${d.id}">Kabul Et</button>
      `;
      list.appendChild(div);

      document.getElementById(`accept-${d.id}`).onclick = async () => {
        // Burada "friends" koleksiyonuna ekleme mantığı kurulmalı
        // Şimdilik sadece isteği siliyoruz:
        await deleteDoc(doc(db, "friend_requests", d.id));
        alert("Kabul edildi (Henüz sohbet ekranına bağlanmadı)");
      };
    });
  });
}

// Helper (Kullanıcının kendi username'ini almak için eklenebilir)
async function getCurrentUserUsername() {
  // Bu fonksiyon geliştirilebilir
  return ""; 
}
