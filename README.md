# AutonPay (PayFi & Autonomous M2M Settlement Protocol)

[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana&logoColor=white)](https://solana.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%20%7C%20Tailwind-61DAFB)](https://vitejs.dev)
[![Architecture](https://img.shields.io/badge/Protocol-PayFi%20%2B%20Autonomous%20M2M-purple)](https://solscan.io)

**AutonPay** adalah infrastruktur **Payment Finance (PayFi)** terdesentralisasi di atas jaringan **Solana** yang dirancang untuk penyelesaian pembayaran instan produk digital, penerbitan lisensi kriptografis on-chain, serta eksekusi transaksi otonom antar-agen kecerdasan buatan (*Machine-to-Machine / M2M*).

---

## ⚡ Executive Summary & Value Proposition

Model gateway pembayaran Web3 dan e-commerce konvensional kerap menghadapi settlement tertunda, potongan fee yang tidak transparan, serta ketiadaan otomasi transaksi mesin. 

AutonPay memecahkan tantangan ini dengan menyatukan pembayaran komersial digital langsung ke dalam arsitektur PayFi berbasis Solana:

1. **Instant Commercial Settlement**: Pembayaran diproses dengan finalitas sub-detik tanpa ketergantungan pada kustodian atau escrow manual.
2. **Atomic On-Chain Fee Split (90 : 5 : 5)**: Setiap transaksi komersial digital langsung dipecah secara paralel dan atomik di layer smart contract:
   * **90% Vendor**: Diterima langsung oleh penjual atau kreator produk digital.
   * **5% Admin / Protocol**: Mendukung pemeliharaan relayer, node RPC, dan keberlanjutan platform.
   * **5% Referral / Affiliate**: Komisi instan langsung cair ke wallet mitra rujukan.
3. **Autonomous M2M (Machine-to-Machine) Commerce**: Agen AI dapat mengeksekusi pembelian lisensi API, kuota komputasi, dan aset digital secara mandiri tanpa campur tangan manusia.
4. **Cryptographic License Delivery**: Setiap transaksi mencetak bukti lisensi digital yang terverifikasi dan dapat diaudit langsung di blockchain Solana Explorer.

---

## 🏛️ Arsitektur Protokol

```text
[ Pembeli / Agen AI M2M ]
           │
           │  (Eksekusi Pembelian Lisensi Digital)
           ▼
┌──────────────────────────────────────────────┐
│           AutonPay Settlement Core           │
│   - Solana Web3.js & Nonce Verification      │
│   - Atomic Multi-Instruction Transaction     │
└──────────────────────┬───────────────────────┘
                       │
                       │ Split Otomatis dalam 1 Transaksi
                       ▼
       ┌───────────────┼───────────────┐
       │ (90%)         │ (5%)          │ (5%)
       ▼               ▼               ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│    Vendor    ││  Admin / Ops ││  Affiliate   │
│    Wallet    ││   Platform   ││   Referral   │
└──────────────┘└──────────────┘└──────────────┘
                       │
                       ▼
       [ Bukti Lisensi & Hash On-Chain Terbit ]
```

---

## 🔑 Fitur Utama

### 1. 💳 PayFi Automated Revenue Split (90 : 5 : 5)
Setiap transaksi komersial digital dipecah secara non-custodial:
* **90% ke Vendor**: Kreator menerima hak hasil penjualan penuh tanpa potongan perantara tersembunyi.
* **5% ke Admin Platform**: Mengamankan biaya operasional infrastruktur dan pemeliharaan protokol.
* **5% ke Mitra Referral**: Menggerakkan akselerasi adopsi platform melalui insentif affiliate instan.

### 2. 🤖 Autonomous M2M AI Agent Engine
* **Agentic Automation**: Modul agen AI dengan pemicu mandiri (*non-custodial trigger*) untuk memantau kuota dan mengeksekusi pembelian lisensi otomatis saat batas ambang (*threshold*) tercapai.
* **Safety Controls**: Dilengkapi fitur *Start Agent*, *Stop Agent*, batas alokasi dana (*spending cap*), dan pemantauan log aktivitas real-time.

### 3. 📜 On-Chain Cryptographic License Delivery
* Verifikasi instan melalui jaringan Solana Devnet.
* Modal konfirmasi penerbitan lisensi yang ringkas, responsif, dan optimal untuk layar desktop maupun ponsel.
* Hash bukti lisensi unik terhubung langsung dengan Solscan Devnet Explorer untuk transparansi audit publik.

---

## 🛠️ Tech Stack & Tooling

* **Blockchain Layer**: Solana Devnet (`@solana/web3.js`, `@solana/wallet-adapter`)
* **Frontend Library**: React 18, Vite
* **Styling**: Tailwind CSS, Lucide Icons
* **Deployment & CDN**: Vercel Edge Platform, GitHub

---

## 🚀 Panduan Menjalankan Proyek (Local Development)

### Prasyarat
* [Node.js](https://nodejs.org/) v18 atau versi lebih baru
* [Git](https://git-scm.com/)
* Solana Wallet Browser Extension (Phantom, Solflare, atau Backpack) yang disetel ke mode **Devnet**

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

3. **Jalankan development server lokal:**
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

AutonPay dirancang adaptif penuh untuk penggunaan perangkat mobile:
* **Bottom App Navigation Dock**: Akses cepat ke seluruh modul operasional.
* **Safe-Zone Layout**: Terhindar dari benturan bilah status browser HP dan *overflow clipping*.
* **One-Tap Wallet Adapter**: Kompatibel dengan *deep-link* wallet mobile Web3 Solana.

---

## ⚠️ Disclaimer Keamanan

Protokol ini saat ini beroperasi di lingkungan **Solana Devnet** untuk pengujian performa, verifikasi logika PayFi M2M, dan evaluasi hackathon. Jangan mengirim aset riil Mainnet ke alamat kontrak Devnet yang tertera di aplikasi.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi terbuka [MIT](LICENSE).