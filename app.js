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

/* SCREENS */
const authScreen = document.getElementById("authScreen");
const usernameScreen = document.getElementById("usernameScreen");
const appRoot = document.getElementById("appRoot");

/* AUTH */
const emailInput = document.getElementById("authEmail");
const passInput = document.getElementById("authPass");
const pass2Input = document.getElementById("authPass2");
const authError = document.getElementById("authError");

/* USERNAME */
const usernameInput = document.getElementById("usernameInput");
const usernameError = document.getElementById("usernameError");

/* FRIEND */
const openAddFriend = document.getElementById("openAddFriend");
const modal = document.getElementById("addFriendModal");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById("searchUsername");
const sendRequestBtn = document.getElementById("sendRequestBtn");
const friendError = document.getElementById("friendError");

/* NAV */
document.querySelectorAll(".tab").forEach(tab=>{
  tab.onclick=()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    document.getElementById(tab.dataset.view).classList.add("active");
  };
});

/* AUTH STATE */
onAuthStateChanged(window.auth, async user=>{
  if(!user){ authScreen.classList.remove("hidden"); return; }

  const ref = doc(window.db,"users",user.uid);
  const snap = await getDoc(ref);

  if(!snap.exists()){
    await setDoc(ref,{email:user.email});
    usernameScreen.classList.remove("hidden");
    return;
  }

  if(!snap.data().username){
    usernameScreen.classList.remove("hidden");
  }else{
    appRoot.classList.remove("hidden");
  }
});

/* LOGIN */
loginBtn.onclick=async()=>{
  try{
    await signInWithEmailAndPassword(auth,emailInput.value,passInput.value);
  }catch(e){ authError.textContent=e.code; }
};

/* REGISTER */
registerBtn.onclick=async()=>{
  if(pass2Input.classList.contains("hidden")){
    pass2Input.classList.remove("hidden"); return;
  }
  if(passInput.value!==pass2Input.value){
    authError.textContent="Şifreler uyuşmuyor"; return;
  }
  const cred=await createUserWithEmailAndPassword(auth,emailInput.value,passInput.value);
  await setDoc(doc(db,"users",cred.user.uid),{email:cred.user.email});
  usernameScreen.classList.remove("hidden");
};

/* SAVE USERNAME */
saveUsernameBtn.onclick=async()=>{
  await updateDoc(doc(db,"users",auth.currentUser.uid),{
    username:usernameInput.value.toLowerCase()
  });
  usernameScreen.classList.add("hidden");
  appRoot.classList.remove("hidden");
};

/* FRIEND MODAL */
openAddFriend.onclick=()=>modal.classList.remove("hidden");
closeModal.onclick=()=>modal.classList.add("hidden");

/* SEND REQUEST */
sendRequestBtn.onclick=async()=>{
  const q=query(collection(db,"users"),where("username","==",searchInput.value));
  const s=await getDocs(q);
  if(s.empty){friendError.textContent="Bulunamadı";return;}
  await addDoc(collection(db,"friend_requests"),{
    fromUid:auth.currentUser.uid,
    toUid:s.docs[0].id,
    status:"pending",
    createdAt:serverTimestamp()
  });
  modal.classList.add("hidden");
};