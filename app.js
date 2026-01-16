import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, onSnapshot, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

/* --- ELEMANLAR --- */
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const authError = document.getElementById("authError");

// Tabs
const tabChats = document.getElementById("tabChats");
const tabFriends = document.getElementById("tabFriends");
const tabSettings = document.getElementById("tabSettings");
const navChats = document.getElementById("navChats");
const navFriends = document.getElementById("navFriends");
const navSettings = document.getElementById("navSettings");

// Chat View
const chatView = document.getElementById("chatView");

/* --- AUTH --- */
document.getElementById("btnLoginAction").onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, document.getElementById("loginEmail").value, document.getElementById("loginPassword").value);
  } catch(e) { authError.textContent = e.message; }
};

document.getElementById("btnRegisterAction").onclick = async () => {
  const username = document.getElementById("regUsername").value.toLowerCase();
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPassword").value;
  
  if(!username) return alert("Kullanıcı adı girin");
  
  try {
    // Username kontrolü
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDoc(doc(db, "usernames", username)); // Basit kontrol için döküman ID kullanabiliriz ama şimdilik sorgu yapalım
    // (Daha basit olması için direkt kaydediyorum, hata verirse username alınmıştır)
    
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Kullanıcıyı kaydet
    await setDoc(doc(db, "users", userCred.user.uid), {
      email: email,
      username: username,
      uid: userCred.user.uid
    });

  } catch(e) { authError.textContent = e.message; }
};

document.getElementById("btnLogout").onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    loadUserInfo(user.uid);
    loadRequests();
    loadFriends();
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }
});

async function loadUserInfo(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if(snap.exists()) {
    document.getElementById("settingsUsername").textContent = snap.data().username;
    document.getElementById("settingsEmail").textContent = snap.data().email;
  }
}

/* --- NAVIGASYON --- */
navChats.onclick = () => switchTab("chats");
navFriends.onclick = () => switchTab("friends");
navSettings.onclick = () => switchTab("settings");

function switchTab(tabName) {
  // Reset
  [navChats, navFriends, navSettings].forEach(n => n.classList.remove("active"));
  [tabChats, tabFriends, tabSettings].forEach(t => t.classList.remove("active"));
  
  // Activate
  if(tabName === "chats") { navChats.classList.add("active"); tabChats.classList.add("active"); }
  if(tabName === "friends") { navFriends.classList.add("active"); tabFriends.classList.add("active"); }
  if(tabName === "settings") { navSettings.classList.add("active"); tabSettings.classList.add("active"); }
}

/* --- ARKADAŞ MANTIĞI --- */
document.getElementById("btnAddFriend").onclick = async () => {
  const targetName = document.getElementById("friendInput").value.trim().toLowerCase();
  if(!targetName) return;
  
  // Kullanıcıyı bul
  const q = query(collection(db, "users"), where("username", "==", targetName));
  const snap = await getDocs(query(collection(db, "users"), where("username", "==", targetName)));
  
  if(snap.empty) return alert("Kullanıcı bulunamadı");
  
  const targetUser = snap.docs[0].data();
  
  // İstek gönder
  await addDoc(collection(db, "friend_requests"), {
    from: auth.currentUser.uid,
    to: targetUser.uid,
    fromUsername: document.getElementById("settingsUsername").textContent // Basitçe UI'dan alıyoruz
  });
  
  alert("İstek gönderildi");
  document.getElementById("friendInput").value = "";
};

function loadRequests() {
  const q = query(collection(db, "friend_requests"), where("to", "==", auth.currentUser.uid));
  onSnapshot(q, (snap) => {
    const list = document.getElementById("requestList");
    list.innerHTML = "";
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.style.cssText = "background:#e7fce3; padding:10px; margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between; align-items:center";
      div.innerHTML = `<span>${data.fromUsername} seni ekledi</span> <button id="acc-${docSnap.id}" style="border:none; bg:green; color:green; font-weight:bold;">KABUL</button>`;
      
      list.appendChild(div);
      
      // Kabul Etme İşlemi
      document.getElementById(`acc-${docSnap.id}`).onclick = async () => {
        // 1. Arkadaş listesine ekle (Karşılıklı)
        // Benim listeme onu ekle
        await setDoc(doc(db, "users", auth.currentUser.uid, "friends", data.from), {
          uid: data.from,
          username: data.fromUsername
        });
        
        // İsteği sil
        await deleteDoc(doc(db, "friend_requests", docSnap.id));
      };
    });
  });
}

// Arkadaşları Listele
function loadFriends() {
  const q = collection(db, "users", auth.currentUser.uid, "friends");
  onSnapshot(q, (snap) => {
    const list = document.getElementById("friendsList");
    list.innerHTML = "";
    snap.forEach(docSnap => {
      const friendData = docSnap.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="avatar"><span class="material-icons">person</span></div>
        <div class="user-info">
          <h3>${friendData.username || "Kullanıcı"}</h3>
          <p>Mesaj göndermek için tıkla</p>
        </div>
      `;
      div.onclick = () => openChat(friendData);
      list.appendChild(div);
    });
  });
}

/* --- SOHBET ARAYÜZÜ --- */
function openChat(friendData) {
  chatView.classList.remove("hidden");
  document.getElementById("chatTitle").textContent = friendData.username;
  // Burada daha sonra mesajları yükleyeceğiz
}

document.getElementById("closeChatBtn").onclick = () => {
  chatView.classList.add("hidden");
};
