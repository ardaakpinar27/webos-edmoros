rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 1. KULLANICILAR: Herkes okuyabilir (kayıt kontrolü için), sadece giriş yapan yazabilir.
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 2. DİĞER HER ŞEY: Sadece giriş yapanlar okur/yazar.
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
