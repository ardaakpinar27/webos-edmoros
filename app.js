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

// --- AUTH YÖNETİMİ ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("authContainer").style.display = "none";
        document.getElementById("appContainer").style.display = "block";
        loadNotes();
    } else {
        currentUser = null;
        document.getElementById("authContainer").style.display = "flex";
        document.getElementById("appContainer").style.display = "none";
    }
});

document.getElementById("btnRegister").onclick = () => {
    const e = document.getElementById("email").value;
    const p = document.getElementById("password").value;
    createUserWithEmailAndPassword(auth, e, p).catch(err => alert("Kayıt Hatası: " + err.message));
};

document.getElementById("btnLogin").onclick = () => {
    const e = document.getElementById("email").value;
    const p = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, e, p).catch(err => alert("Giriş Hatası: " + err.message));
};

document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- NOT YÖNETİMİ ---
const modal = document.getElementById("noteModal");
const titleInput = document.getElementById("noteTitle");
const textInput = document.getElementById("noteText");

document.getElementById("openModal").onclick = () => {
    currentEditingId = null; titleInput.value = ""; textInput.value = ""; modal.style.display = "block";
};

document.getElementById("cancelNote").onclick = () => modal.style.display = "none";

document.getElementById("saveNote").onclick = async () => {
    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    if (!title && !text) { modal.style.display = "none"; return; }

    try {
        if (currentEditingId) {
            await updateDoc(doc(db, "notes", currentEditingId), { title, text });
        } else {
            await addDoc(notesCol, { title, text, userId: currentUser.uid, timestamp: new Date() });
        }
    } finally {
        modal.style.display = "none"; // BİTTİ DERSEN BURASI KESİN ÇALIŞIR
    }
};

function loadNotes() {
    const q = query(notesCol, where("userId", "==", currentUser.uid), orderBy("timestamp", "desc"));
    onSnapshot(q, (snap) => {
        const container = document.getElementById("notesContainer");
        container.innerHTML = "";
        snap.forEach(d => {
            const data = d.data();
            const card = document.createElement("div");
            card.className = "note-card";
            card.innerHTML = `<h3>${data.title || 'Başlıksız'}</h3><p>${data.text || ''}</p>`;
            
            card.onclick = () => {
                currentEditingId = d.id;
                titleInput.value = data.title;
                textInput.value = data.text;
                modal.style.display = "block";
            };
            
            // Uzun basınca silme
            let timer;
            card.onmousedown = card.ontouchstart = () => {
                timer = setTimeout(() => {
                    if(confirm("Not silinsin mi?")) deleteDoc(doc(db, "notes", d.id));
                }, 800);
            };
            card.onmouseup = card.ontouchend = () => clearTimeout(timer);

            container.appendChild(card);
        });
    });
}
