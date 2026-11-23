# 🗄️ วิธีต่อฐานข้อมูล Cloudflare D1 (สำหรับมือใหม่ ทำตามทีละข้อ)

ใช้เวลาประมาณ 15 นาที ทำผ่านหน้าเว็บ Cloudflare ทั้งหมด ไม่ต้องลงโปรแกรม

**ภาพรวม — มี 3 ชิ้น**
```
มือถือ (แอป บน GitHub Pages)  ⇄  Worker (ตัวกลาง + เช็ครหัสบ้าน)  ⇄  D1 (ฐานข้อมูล)
```
- **D1** เก็บข้อมูล
- **Worker** เป็นประตู — ใครไม่มี “รหัสบ้าน” เข้าไม่ได้
- **แอป** เปิดผ่าน GitHub Pages ใส่รหัสบ้านครั้งแรกครั้งเดียว

> เมนูของ Cloudflare อาจเปลี่ยนชื่อเล็กน้อยตามเวลา ถ้าหาไม่เจอให้มองหาคำที่ใกล้เคียง

## ⚡ ทางลัด (แนะนำ) — ไม่ต้องใช้ GitHub Pages
ใช้ไฟล์ **`cloudflare/worker-full.js`** แทน `worker.js` → Worker จะเปิดทั้ง **หน้าแอป** และ **ฐานข้อมูล** ในลิงก์เดียว
1. ทำขั้นที่ 1 (ตาราง), ขั้นที่ 3 (Binding `DB`), ขั้นที่ 4 (Secret `HOUSE_KEY`) ตามด้านล่าง
2. ใน Worker → **Edit code** → ลบโค้ดเดิมทั้งหมด → เปิด https://raw.githubusercontent.com/lermintech3/Kra-Pap/main/cloudflare/worker-full.js → เลือกทั้งหมด คัดลอก → วาง → **Deploy**
3. เปิด URL ของ Worker (`https://kra-pap-api.xxxx.workers.dev`) → จะเห็นหน้าใส่ **รหัสบ้าน** → เข้าใช้งานได้เลย 🎉
4. ข้ามขั้นที่ 5–7 ได้ทั้งหมด (ไม่ต้องแก้ `api-config.js` ไม่ต้องเปิด GitHub Pages)

> แนะนำทำบนคอมพิวเตอร์ เพราะไฟล์ยาว คัดลอกบนมือถือลำบาก

---

## ขั้นที่ 1 — สร้างตารางใน D1
1. เข้า https://dash.cloudflare.com → เมนูซ้าย **Storage & Databases → D1**
2. กดชื่อฐานข้อมูลที่สร้างไว้ (เช่น `kra-pap`) → แท็บ **Console**
3. วางคำสั่งนี้ แล้วกด **Execute**

```sql
CREATE TABLE IF NOT EXISTS docs (col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (col, id));
```
4. แล้ววางอีกบรรทัด → **Execute**
```sql
CREATE INDEX IF NOT EXISTS idx_docs_updated ON docs (updated);
```
5. ไปแท็บ **Tables** ควรเห็นตาราง `docs` ✅

## ขั้นที่ 2 — สร้าง Worker (ตัวกลาง)
1. เมนูซ้าย **Compute (Workers) → Workers & Pages** → **Create** → **Create Worker** (แบบ Hello World)
2. ตั้งชื่อ `kra-pap-api` → **Deploy**
3. กด **Edit code** → ลบโค้ดเดิมทั้งหมด → วางโค้ดจากไฟล์ **`cloudflare/worker.js`** ในเรโป → กด **Deploy**

## ขั้นที่ 3 — ผูก Worker กับ D1
1. ในหน้า Worker `kra-pap-api` → แท็บ **Settings** → หัวข้อ **Bindings** → **Add binding**
2. เลือก **D1 database**
3. **Variable name: `DB`** (ตัวพิมพ์ใหญ่ ต้องตรงเป๊ะ) → Database: เลือก `kra-pap` → **Add binding / Deploy**

## ขั้นที่ 4 — ตั้ง “รหัสบ้าน”
1. แท็บ **Settings** → **Variables and Secrets** → **Add**
2. Type: **Secret** · Name: **`HOUSE_KEY`** · Value: รหัสที่คุณกับแฟนจะใช้ เช่น `BossMew-2026-ออมเงิน` (ยิ่งยาวยิ่งปลอดภัย)
3. กด **Deploy**
4. (ไม่บังคับ แต่แนะนำ) เพิ่มอีกตัว Type: **Text** · Name: `ALLOW_ORIGIN` · Value: `https://lermintech3.github.io` → Deploy

> ⚠️ ห้ามใส่รหัสบ้านในไฟล์บน GitHub — ใส่ใน Cloudflare ที่เดียว แล้วพิมพ์ในแอปตอนเข้าใช้

## ขั้นที่ 5 — ทดสอบ Worker
1. หน้า Worker จะมี URL เช่น `https://kra-pap-api.ชื่อคุณ.workers.dev` → **คัดลอกไว้**
2. เปิด URL นั้นในเบราว์เซอร์ → ควรเห็น `{"ok":true,"app":"kra-pap-api"}` ✅
3. เปิด `URL/api/all` → ควรเห็น `{"error":"unauthorized"}` ✅ (แปลว่าประตูล็อกอยู่ ดีแล้ว)

## ขั้นที่ 6 — บอกแอปว่า Worker อยู่ที่ไหน
1. GitHub → เรโป **Kra-Pap** → เปิดไฟล์ **`api-config.js`** → กด ✏️
2. ใส่ URL จากขั้นที่ 5:
```js
window.D1_API_URL = "https://kra-pap-api.ชื่อคุณ.workers.dev";
```
3. กด **Commit changes**

## ขั้นที่ 7 — เปิดเว็บด้วย GitHub Pages
1. ให้แน่ใจว่า **merge Pull Request แล้ว**
2. เรโป → **Settings → Pages** → Source: **Deploy from a branch** → **main** / **(root)** → **Save**
3. รอ 1–2 นาที เปิด 👉 **https://lermintech3.github.io/Kra-Pap/**
4. ใส่ **รหัสบ้าน** → เข้าใช้งาน 🎉 (แฟนใช้รหัสเดียวกัน)

## ขั้นที่ 8 — ติดตั้งเป็นแอปบนมือถือ
- **iPhone (Safari):** ปุ่มแชร์ ⬆️ → **เพิ่มไปยังหน้าจอโฮม**
- **Android (Chrome):** เมนู ⋮ → **เพิ่มลงในหน้าจอหลัก**

## ย้ายข้อมูลจากเวอร์ชันใน Claude (ถ้ามี)
เวอร์ชัน Claude → ⚙️ ตั้งค่า → **คัดลอกข้อมูลทั้งหมด** → เวอร์ชัน D1 → ⚙️ ตั้งค่า → วางในกล่อง **นำเข้าข้อมูล**

---

## ❓ แก้ปัญหาที่พบบ่อย
| อาการ | วิธีแก้ |
|---|---|
| D1 Console ขึ้น `SQLITE_ERROR` | วางทีละบรรทัดตามขั้นที่ 1 และวางเฉพาะคำสั่ง SQL (ไม่ใช่โค้ด Firebase) |
| เปิด Worker ขึ้น `missing D1 binding "DB"` | ยังไม่ได้ทำขั้นที่ 3 หรือ Variable name ไม่ใช่ `DB` |
| เปิด Worker ขึ้น `missing secret "HOUSE_KEY"` | ยังไม่ได้ทำขั้นที่ 4 หรือยังไม่กด Deploy |
| แอปขึ้น “รหัสบ้านไม่ถูกต้อง” | พิมพ์ให้ตรงกับ HOUSE_KEY (ตัวพิมพ์เล็ก/ใหญ่มีผล) |
| แอปขึ้น “ต่อเซิร์ฟเวอร์ไม่ได้” | เช็ก URL ใน `api-config.js` และ `ALLOW_ORIGIN` ต้องเป็น `https://lermintech3.github.io` (ไม่มี / ท้าย) |
| ไม่มีหน้าใส่รหัส ขึ้น “เก็บในเครื่องนี้” | `api-config.js` ยังว่างอยู่ (ขั้นที่ 6) |

**ค่าใช้จ่าย:** แพ็กเกจฟรีของ Cloudflare Workers และ D1 เพียงพอสำหรับใช้งานในบ้าน

**อยากเปลี่ยนรหัสบ้าน:** แก้ `HOUSE_KEY` ใน Cloudflare → Deploy → ในแอปกด ⚙️ → ออกจากระบบ → ใส่รหัสใหม่
