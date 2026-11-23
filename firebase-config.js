// ====== ตั้งค่า Firebase ======
// คัดลอกค่าจาก Firebase Console → ⚙️ Project settings → Your apps → SDK setup and configuration (Config)
// มาวางแทนค่าด้านล่าง ถ้ายังเป็น YOUR_... แอปจะเก็บข้อมูลไว้ในเครื่องอย่างเดียว
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
