import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const notesCol = collection(db, "notes");

let currentUser = null;
let currentEditingId = null;

// --- ELEMENTLER ---
const authContainer = document.getElementById("authContainer");
const appContainer = document.getElementById("appContainer");
const modal = document.getElementById("noteModal");
const titleIn = document.getElementById("noteTitle");
const textIn = document.getElementById("noteText");
const container = document.getElementById("notesContainer");

// --- OTURUM YÖNETİMİ ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        loadNotes();
    } else {
        currentUser = null;
        authContainer.style.display = "flex";
        appContainer.style.display = "none";
        container.innerHTML = "";
    }
});

document.getElementById("btnRegister").onclick = () => {
    const e = document.getElementById("email").value, p = document.getElementById("password").value;
    if(!e || !p) return alert("E-posta ve şifre girin");
    createUserWithEmailAndPassword(auth, e, p).catch(err => alert("Kayıt Hatası: " + err.message));
};

document.getElementById("btnLogin").onclick = () => {
    const e = document.getElementById("email").value, p = document.getElementById("password").value;
    if(!e || !p) return alert("E-posta ve şifre girin");
    signInWithEmailAndPassword(auth, e, p).catch(err => alert("Giriş Hatası: " + err.message));
};

document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- NOT İŞLEMLERİ ---
document.getElementById("openModal").onclick = () => {
    currentEditingId = null; titleIn.value = ""; textIn.value = ""; modal.style.display = "block";
};

document.getElementById("cancelNote").onclick = () => modal.style.display = "none";

document.getElementById("saveNote").onclick = async () => {
    const t = titleIn.value.trim(), txt = textIn.value.trim();
    if (!t && !txt) { modal.style.display = "none"; return; }

    try {
        if (currentEditingId) {
            await updateDoc(doc(db, "notes", currentEditingId), { title: t, text: txt });
        } else {
            await addDoc(notesCol, { 
                title: t, 
                text: txt, 
                userId: currentUser.uid, 
                timestamp: new Date() 
            });
        }
    } catch (err) {
        console.error("Kaydetme Hatası:", err);
    } finally {
        modal.style.display = "none";
        currentEditingId = null;
    }
};

function loadNotes() {
    if (!currentUser) return;

    // Sorgu: Sadece kullanıcıya ait notlar ve tarihe göre sıralı
    const q = query(
        notesCol, 
        where("userId", "==", currentUser.uid), 
        orderBy("timestamp", "desc")
    );

    onSnapshot(q, (snap) => {
        container.innerHTML = "";
        snap.forEach(d => {
            const data = d.data();
            const card = document.createElement("div");
            card.className = "note-card";
            card.innerHTML = `<h3>${data.title || '...'}</h3><p>${data.text || ''}</p>`;
            
            card.onclick = () => {
                currentEditingId = d.id;
                titleIn.value = data.title;
                textIn.value = data.text;
                modal.style.display = "block";
            };

            // Uzun basınca silme
            let timer;
            card.onmousedown = card.ontouchstart = () => {
                timer = setTimeout(() => { if(confirm("Silinsin mi?")) deleteDoc(doc(db, "notes", d.id)); }, 800);
            };
            card.onmouseup = card.ontouchend = () => clearTimeout(timer);

            container.appendChild(card);
        });
    }, (error) => {
        console.error("Firestore Dinleme Hatası:", error);
        // Eğer endeks hatası verirse konsolda link çıkacaktır.
    });
}
