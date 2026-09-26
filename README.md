# AutonPay (PayFi & Autonomous M2M Settlement Protocol)

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![Frontend](https://img.shields.io/badge/Vite%20%7C%20React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev)
[![Styling](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**AutonPay** adalah infrastruktur **Payment Finance (PayFi)** terdesentralisasi generasi berikutnya yang menjembatani transaksi komersial digital, penyelesaian pembayaran instan, dan eksekusi otonom antar-agen kecerdasan buatan (*Machine-to-Machine / M2M*) di atas jaringan berkecepatan tinggi **Solana**.

---

## ⚡ Executive Summary & Value Proposition

Model *payment gateway* Web3 konvensional umumnya pasif: dana hanya berpindah tangan tanpa menghasilkan nilai tambah produktif. AutonPay merevolusi alur tersebut dengan menyatukan pembayaran komersial digital langsung dengan mesin **Real Yield Distribution**:

1. **PayFi Instant Settlement**: Pembelian lisensi dan produk komputasi digital dengan konfirmasi kriptografis on-chain berkecepatan sub-detik.
2. **Autonomous M2M AI Agent**: Agen mandiri yang dapat mengeksekusi siklus *auto-purchase* layanan, API, dan komputasi tanpa campur tangan manusia.
3. **Automated 4-Pool Real Yield**: Setiap *fee* protokol langsung dipecah secara atomik dan transparan ke 4 pool ekosistem:
   * **40% Yield Optimizer Vault**: Memperdalam likuiditas dan imbal hasil vault protokol.
   * **30% $ZQI Real Yield Pool**: Didistribusikan kepada staker token tata kelola.
   * **15% Affiliate Treasury**: Insentif instan untuk referral dan pertumbuhan komunitas.
   * **15% Protocol Operations**: Pemeliharaan infrastruktur relayer dan node RPC.
4. **MEV-Resistant Atomic Swap**: Integrasi likuiditas instan untuk konversi aset dasar (SOL / USDC / $ZQI) dengan perlindungan *slippage*.

---

## 🏛️ System Architecture

```text
               ┌──────────────────────────────────────────────┐
               │         Client / Autonomous M2M Agent        │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │           AutonPay Runtime Gateway           │
               │   - Nonce Validation & Circuit Breaker       │
               │   - Cryptographic Proof Verification         │
               └──────────────────────┬───────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌──────────────────────────┐              ┌──────────────────────────┐
   │    Atomic Token Swap     │              │   PayFi Digital License  │
   │      (USDC ↔ ZQI)        │              │    Issuance & Delivery   │
   └─────────────┬────────────┘              └─────────────┬────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
               ┌──────────────────────────────────────────────┐
               │          On-Chain Fee Split Engine           │
               └──────────────────────┬───────────────────────┘
                                      │
          ┌───────────────┬───────────┴───────────┬───────────────┐
          ▼               ▼                       ▼               ▼
     ┌─────────┐     ┌─────────┐             ┌─────────┐     ┌─────────┐
     │ 40%     │     │ 30%     │             │ 15%     │     │ 15%     │
     │ Vault   │     │ Staking │             │ Affil.  │     │ Ops     │
     └─────────┘     └─────────┘             └─────────┘     └─────────┘
```

---

## 🧩 Modul & Fitur Utama

### 1. 🤖 Autonomous M2M Agent Controller
* Dilengkapi *telemetry dashboard* real-time dengan status indikator aktif.
* Kontrol eksekusi *one-click* (`Start Agent` / `Stop Agent`) untuk mengotomasi alur pembelian kuota komputasi.
* *Emergency circuit breaker* bawaan untuk menjaga keamanan saldo pengguna saat anomali transaksi terdeteksi.

### 2. 💱 MEV-Protected Swap Engine
* Antarmuka pertukaran token instan antara SOL, USDC, dan $ZQI.
* Perhitungan otomatis *price impact* dan *slippage tolerance*.
* *Log visual* distribusi fee real-time langsung di bawah form swap.

### 3. 🔐 $ZQI Staking & Time-Weighted Multiplier
* Kunci aset $ZQI untuk mendapatkan hak bagi hasil dari 30% fee protokol.
* *Dynamic multiplier slider* berbasis durasi penguncian untuk memaksimalkan bobot perolehan *Real Yield* USDC.
* Mekanisme *Emergency Early Unlock* transparan dengan kalkulasi penalti on-chain.

### 4. 📜 On-Chain Cryptographic Proof
* Setiap lisensi produk yang berhasil diterbitkan menyertakan *signature identifier* unik.
* Terhubung langsung dengan Solana Explorer / Solscan Devnet untuk audit publik tanpa perantara.

---

## 🛠️ Tech Stack

* **Blockchain**: Solana (Devnet)
* **Frontend Library**: React 18, Vite
* **Web3 Integration**: `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`
* **Styling**: Tailwind CSS & Lucide Icons
* **Deployment & CDN**: Vercel Edge Platform

---

## 🚀 Panduan Menjalankan Proyek (Local Setup)

### Prasyarat
* [Node.js](https://nodejs.org/) versi 18 ke atas
* [Git](https://git-scm.com/)
* Solana Wallet Browser Extension (Phantom, Solflare, atau Backpack) yang disetel ke **Devnet**

### Langkah Instalasi

1. **Clone repositori:**
   ```bash
   git clone https://github.com/provizto/autonpay.git
   cd autonpay
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan local development server:**
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:5173`.

4. **Kompilasi build produksi:**
   ```bash
   npm run build
   ```

---

## 📱 Mobile-First Native Experience

AutonPay dirancang secara adaptif (*responsive design*) dengan integrasi penuh untuk peramban ponsel:
* **Bottom App Navigation Dock**: Memudahkan akses 5 tab inti (Swap, Lock, Vault, Affiliate, PayFi).
* **Safe-Zone Layout**: Terhindar dari benturan bilah status browser mobile dan *overflow clipping*.
* **One-Tap Wallet Adapter**: Kompatibel dengan *deep-link* wallet mobile Solana.

---

## ⚠️ Disclaimer Keamanan

Protokol ini saat ini berjalan di lingkungan **Solana Devnet** untuk tujuan pengujian performa, verifikasi logika PayFi, dan demonstrasi hackathon. Jangan mengirim token atau aset riil Mainnet ke alamat kontrak Devnet yang tertera di aplikasi.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi terbuka [MIT](LICENSE).