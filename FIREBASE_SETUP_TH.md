# 🔥 วิธีต่อฐานข้อมูล Firebase (สำหรับมือใหม่ ทำตามทีละข้อ)

ใช้เวลาประมาณ 15–20 นาที ไม่ต้องลงโปรแกรมอะไรในเครื่อง ทำผ่านเว็บเบราว์เซอร์ล้วน ๆ

**ภาพรวม**
- **Firebase** (ของ Google) = ฐานข้อมูล + ระบบล็อกอินด้วย Google → ทั้งคู่เห็นข้อมูลเดียวกันแบบเรียลไทม์
- **GitHub Pages** = ที่วางหน้าเว็บแอปให้เปิดได้จากมือถือ (ฟรี)

> เมนูใน Firebase Console อาจเปลี่ยนชื่อเล็กน้อยตามเวลา ถ้าหาไม่เจอให้มองหาคำที่ใกล้เคียง

---

## ขั้นที่ 1 — สร้างโปรเจกต์ Firebase
1. เข้า https://console.firebase.google.com แล้วล็อกอินด้วยบัญชี Google
2. กด **Create a project** (หรือ Add project)
3. ตั้งชื่อ เช่น `kra-pap` → กด Continue
4. หน้า Google Analytics → **ปิด** (ไม่จำเป็น) → กด **Create project** → รอสักครู่ → Continue

## ขั้นที่ 2 — สร้าง Web App แล้วเอา “ค่าตั้งค่า” มาใส่
1. ในหน้าโปรเจกต์ กดไอคอน **`</>`** (Web)
2. ตั้งชื่อแอป เช่น `kra-pap-web` (ไม่ต้องติ๊ก Firebase Hosting) → กด **Register app**
3. จะเห็นโค้ดที่มี `const firebaseConfig = { apiKey: "...", ... }` → **คัดลอกค่าในวงเล็บปีกกา**
4. ไปที่ GitHub → เรโป **Kra-Pap** → เปิดไฟล์ `firebase-config.js` → กดไอคอน ✏️ (Edit)
5. แทนที่ค่า `YOUR_...` ทั้ง 6 บรรทัดด้วยค่าที่คัดลอกมา → กด **Commit changes**

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza....",
  authDomain: "kra-pap-xxxx.firebaseapp.com",
  projectId: "kra-pap-xxxx",
  storageBucket: "kra-pap-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcd..."
};
```
> ค่าพวกนี้ใส่ในเรโปสาธารณะได้ ไม่ใช่รหัสลับ — ความปลอดภัยมาจาก “Rules” ในขั้นที่ 4

## ขั้นที่ 3 — เปิดล็อกอินด้วย Google
1. เมนูซ้าย **Build → Authentication** → กด **Get started**
2. แท็บ **Sign-in method** → เลือก **Google** → เปิดสวิตช์ **Enable**
3. เลือก Support email (อีเมลคุณ) → **Save**
4. แท็บ **Settings → Authorized domains** → กด **Add domain** → ใส่ `lermintech3.github.io` → Add

## ขั้นที่ 4 — สร้างฐานข้อมูล Firestore + ตั้งสิทธิ์ให้แค่เราสองคน
1. เมนูซ้าย **Build → Firestore Database** → **Create database**
2. Location: เลือก **asia-southeast1 (Singapore)** (ใกล้ไทยที่สุด เปลี่ยนทีหลังไม่ได้)
3. เลือก **Start in production mode** → **Create**
4. ไปแท็บ **Rules** → ลบของเดิมทั้งหมด → วางเนื้อหาจากไฟล์ `firestore.rules` ในเรโป
5. **แก้อีเมล 2 บรรทัด** เป็นอีเมล Google ของคุณกับแฟน (ตัวพิมพ์เล็ก) → กด **Publish**

```
request.auth.token.email in [
  'boss@gmail.com',
  'mew@gmail.com'
];
```
> คนที่อีเมลไม่อยู่ในรายการนี้ จะอ่าน/เขียนข้อมูลไม่ได้เลย แม้จะเปิดเว็บได้

## ขั้นที่ 5 — เปิดเว็บด้วย GitHub Pages
1. ใน GitHub เรโป Kra-Pap ให้แน่ใจว่า **merge Pull Request แล้ว** (ไฟล์อยู่ใน main)
2. ไปที่ **Settings → Pages**
3. Source: **Deploy from a branch** → Branch: **main** / **(root)** → **Save**
4. รอ 1–2 นาที แล้วเปิด 👉 **https://lermintech3.github.io/Kra-Pao/**
5. กด **เข้าสู่ระบบด้วย Google** → เลือกบัญชีที่อยู่ใน Rules → ใช้งานได้เลย 🎉

## ขั้นที่ 6 — ติดตั้งเป็นแอปบนมือถือ
- **iPhone (Safari):** เปิดลิงก์ → ปุ่มแชร์ ⬆️ → **เพิ่มไปยังหน้าจอโฮม**
- **Android (Chrome):** เปิดลิงก์ → เมนู ⋮ → **เพิ่มลงในหน้าจอหลัก / ติดตั้งแอป**

## ย้ายข้อมูลจากเวอร์ชันใน Claude (ถ้ามี)
1. เปิดแอปเวอร์ชัน Claude → ⚙️ ตั้งค่า → **คัดลอกข้อมูลทั้งหมด (JSON)**
2. เปิดเวอร์ชัน Firebase → ⚙️ ตั้งค่า → วางในกล่อง **นำเข้าข้อมูล** → กดนำเข้า

---

## ❓ แก้ปัญหาที่พบบ่อย
| อาการ | วิธีแก้ |
|---|---|
| กดล็อกอินแล้วขึ้น `auth/unauthorized-domain` | ยังไม่ได้เพิ่ม `lermintech3.github.io` ในขั้นที่ 3 ข้อ 4 |
| ล็อกอินได้ แต่มุมบนขึ้น “ไม่มีสิทธิ์” | อีเมลไม่ตรงกับใน Rules (ขั้นที่ 4) — เช็กสะกด/ตัวพิมพ์เล็ก แล้วกด Publish |
| ไม่มีหน้าล็อกอิน ขึ้น “เก็บในเครื่องนี้” | `firebase-config.js` ยังเป็น `YOUR_...` หรือวางค่าผิด (ขั้นที่ 2) |
| เปิดลิงก์ Pages แล้ว 404 | รออีก 2–3 นาที หรือเช็กว่าเลือก branch `main` แล้ว |
| iPhone กดล็อกอินแล้วเด้งกลับ | ลองเปิดใน Safari ตรง ๆ (ไม่ใช่ในแอป LINE/Facebook) แล้วล็อกอินใหม่ |

**ค่าใช้จ่าย:** แพ็กเกจฟรี (Spark) ของ Firebase เพียงพอสำหรับการใช้งานในบ้าน ไม่ต้องผูกบัตร
