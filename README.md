# Enterprise Business Management ERP (Universal Business Solutions)

A responsive, multi-device ERP and Point of Sale (POS) system built for modern retail, wholesale trading, electronics/CCTV security, restaurants/cafes, supermarkets, and service workshops.

---

## ✨ Features & Capabilities

- **📱 Fits Any Device (Mobile, Tablet, Desktop)**:
  - Responsive top navigation with quick brand switcher, live drawer cash, theme switcher, and camera scanner.
  - **Mobile Touch Bottom Bar**: Quick one-thumb jumps between Dashboard, POS Terminal, Inventory, Clients, Company Switcher, and All 19 Modules.
  - Smooth drawer navigation with module search filter so finding any feature on phones or tablets is instantaneous.
  - **All 19 Modules Enabled**: No hidden or disabled options; full explore mode with clear status badges.

- **🏢 100% Changeable Company Branding & Business Presets**:
  - Rebrand with **1-click ready presets**:
    1. **Rabiul & Big Brother - Mobiles & CCTV Solutions** (Mobiles, CCTV, smart security, Oman bills)
    2. **RST Electronics & Smart Tech Hub** (Laptops, mobile accessories, micro-soldering, tech retail)
    3. **Big Bro Global Trading & Distribution** (Wholesale and retail commerce, import distribution)
    4. **Rabiul Resturent & Cafe House** (Dining, takeaway, kitchen order ticketing, counter POS)
    5. **City Mart Supermarket & Department Store** (Rapid grocery barcode scanning, multi-cashier checkout)
    6. **Apex Auto Care & Service Workshop** (Vehicle job cards, spare parts inventory, mechanic services)
    7. **Custom Enterprise Profile** (Enter any company name, logo badge, CR/VAT numbers, tax rate, and address)
  - Changes instantly update across all invoices, thermal receipts, top navbar, live terminal, and reports.

- **🛒 High-Speed Point of Sale (POS)**:
  - Universal live camera barcode & IMEI scanner (Android, iOS Safari, Windows, macOS, Linux).
  - Multi-payment support: Cash, Card, Bank Muscat / Dhofar Transfer, Customer Credit.
  - Automatic change calculation, discounts, and real-time stock deduction.

- **🧾 Multi-Format Tax Invoices & Thermal Receipts**:
  - Official Tax Invoices with verified QR code, Arabic and English bilingual headings.
  - 3 formats: Full A4 Tax Invoice, 80mm Medium Thermal POS, 58mm Mini Pocket Slip.
  - 1-click WhatsApp customer share button with formatted itemized receipt.

- **💰 Treasury, Multi-Bank Ledger & Cashbook**:
  - Live cash-in-hand drawer tracking with physical float drop to bank.
  - Multi-bank accounts (Bank Muscat, Bank Dhofar, National Bank of Oman, etc.).
  - Daily expense logging, inter-bank transfers, and reconciliation.

- **🤖 Built-in AI Financial & Operational Analyst**:
  - Powered by Google Gemini (`gemini-3.8-flash`).
  - Cash flow forecasts, VAT compliance audits, inventory reorder recommendations, and anomaly detection.

- **☁️ Firebase Cloud Sync & Offline-First Resilience**:
  - Local database cache ensures uninterrupted transactions even during internet dropouts.
  - Real-time cloud sync with Firebase Firestore.

---

## 🚀 Deployment Guide (Vercel & GitHub)

### Deploy to Vercel

1. Push this repository to **GitHub**.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Set Build Command: `npm run build`
6. Set Output Directory: `dist`
7. Click **Deploy**. Vercel will build and serve your app globally via CDN with SPA URL rewrites enabled by `vercel.json`.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (Full-stack Express + Vite)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express, tsx.
- **AI Engine**: `@google/genai` (Gemini 3.8 Flash).
- **Database**: Firebase Firestore (`firebase/app`, `firebase/firestore`, `firebase/auth`).
- **Build & Bundler**: Vite 8.
