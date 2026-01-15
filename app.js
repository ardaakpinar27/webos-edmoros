import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,getDoc,setDoc,updateDoc,
  collection,addDoc,query,where,onSnapshot,deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ELEMENTS */
const auth = authScreen;
const usernameScreen = document.getElementById("usernameScreen");
const app = document.getElementById("app");

/* AUTH */
loginBtn.onclick = async()=>{
  try{
    await signInWithEmailAndPassword(auth, email.value, password.value);
  }catch(e){ authError.textContent=e.code; }
};

registerBtn.onclick = async()=>{
  try{
    await createUserWithEmailAndPassword(auth, email.value, password.value);
  }catch(e){ authError.textContent=e.code; }
};

/* AUTH STATE – TEK OTORİTE */
onAuthStateChanged(window.auth, async user=>{
  auth.classList.add("hidden");
  usernameScreen.classList.add("hidden");
  app.classList.add("hidden");

  if(!user){ auth.classList.remove("hidden"); return; }

  const ref=doc(db,"users",user.uid);
  const snap=await getDoc(ref);

  if(!snap.exists()){
    await setDoc(ref,{email:user.email});
    usernameScreen.classList.remove("hidden");
    return;
  }

  if(!snap.data().username){
    usernameScreen.classList.remove("hidden");
  }else{
    app.classList.remove("hidden");
    loadRequests();
  }
});

/* SAVE USERNAME */
saveUsername.onclick = async()=>{
  await updateDoc(doc(db,"users",auth.currentUser.uid),{
    username:usernameInput.value.toLowerCase()
  });
};

/* FRIEND REQUESTS */
sendRequest.onclick = async()=>{
  const q=query(collection(db,"users"),where("username","==",searchUser.value));
  const s=await getDocs(q);
  if(s.empty){friendError.textContent="Yok";return;}
  await addDoc(collection(db,"friend_requests"),{
    from:auth.currentUser.uid,to:s.docs[0].id
  });
};

/* LOAD REQUESTS */
function loadRequests(){
  const q=query(collection(db,"friend_requests"),where("to","==",auth.currentUser.uid));
  onSnapshot(q,snap=>{
    requests.innerHTML="";
    snap.forEach(d=>{
      const div=document.createElement("div");
      div.className="request";
      div.innerHTML=`<span>Yeni İstek</span>
      <button onclick="accept('${d.id}')">Kabul</button>`;
      requests.appendChild(div);
    });
  });
}

window.accept=async(id)=>{
  await deleteDoc(doc(db,"friend_requests",id));
};

/* NAV */
document.querySelectorAll(".tab").forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    document.getElementById(t.dataset.view).classList.add("active");
  }
});