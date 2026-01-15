import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Firebase Bilgilerin
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

// ELEMENTLER
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

// KAYIT / GİRİŞ / ÇIKIŞ
document.getElementById("btnRegister").onclick = () => {
    const e = document.getElementById("email").value, p = document.getElementById("password").value;
    if(!e || !p) return alert("Bilgileri girin");
    createUserWithEmailAndPassword(auth, e, p).catch(err => alert("Kayıt Hatası: " + err.message));
};

document.getElementById("btnLogin").onclick = () => {
    const e = document.getElementById("email").value, p = document.getElementById("password").value;
    if(!e || !p) return alert("Bilgileri girin");
    signInWithEmailAndPassword(auth, e, p).catch(err => alert("Giriş Hatası: " + err.message));
};

document.getElementById("btnLogout").onclick = () => signOut(auth);

// --- NOT İŞLEMLERİ ---
document.getElementById("openModal").onclick = () => {
    currentEditingId = null; 
    titleIn.value = ""; 
    textIn.value = ""; 
    modal.style.display = "block";
};

document.getElementById("cancelNote").onclick = () => modal.style.display = "none";

document.getElementById("saveNote").onclick = async () => {
    const t = titleIn.value.trim();
    const txt = textIn.value.trim();

    if (!t && !txt) {
        modal.style.display = "none";
        return;
    }

    try {
        if (currentEditingId) {
            await updateDoc(doc(db, "notes", currentEditingId), { title: t, text: txt });
        } else {
            // Notu userId ile ilişkilendirerek kaydet
            await addDoc(notesCol, { 
                title: t, 
                text: txt, 
                userId: currentUser.uid, 
                timestamp: new Date() 
            });
        }
    } catch (err) {
        console.error("Kayıt Hatası:", err);
    } finally {
        modal.style.display = "none";
        currentEditingId = null;
    }
};

// NOTLARI LİSTELE
function loadNotes() {
    if (!currentUser) return;

    // ÖNEMLİ: Endeks hatasını önlemek için orderBy'ı şimdilik kaldırdık
    const q = query(notesCol, where("userId", "==", currentUser.uid));

    onSnapshot(q, (snap) => {
        container.innerHTML = "";
        
        if (snap.empty) {
            console.log("Henüz notunuz yok.");
        }

        snap.forEach(d => {
            const data = d.data();
            const card = document.createElement("div");
            card.className = "note-card";
            card.innerHTML = `<h3>${data.title || '...'}</h3><p>${data.text || ''}</p>`;
            
            // Düzenlemek için tıkla
            card.onclick = () => {
                currentEditingId = d.id;
                titleIn.value = data.title;
                textIn.value = data.text;
                modal.style.display = "block";
            };

            // Uzun basınca silme (800ms)
            let timer;
            card.onmousedown = card.ontouchstart = () => {
                timer = setTimeout(() => {
                    if(confirm("Bu not silinsin mi?")) deleteDoc(doc(db, "notes", d.id));
                }, 800);
            };
            card.onmouseup = card.ontouchend = () => clearTimeout(timer);

            container.appendChild(card);
        });
    }, (error) => {
        alert("Firestore Hatası: " + error.message);
    });
}
