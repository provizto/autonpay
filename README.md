# AutonPay (Autonomous PayFi Rail & Meteora DBC Dynamic Liquidity Protocol)

[![Solana Mainnet](https://img.shields.io/badge/Solana-Mainnet%20Live-14F195?logo=solana&logoColor=white)](https://solana.com)
[![Meteora DBC](https://img.shields.io/badge/Meteora-DBC%20%26%20DAMM%20v2-FF4F99?logo=target&logoColor=white)](https://app.meteora.ag)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%20%7C%20Tailwind-61DAFB)](https://vitejs.dev)
[![Architecture](https://img.shields.io/badge/Protocol-100%25%20Non--Custodial%20PayFi-blueviolet)](https://solscan.io)

**AutonPay** adalah infrastruktur **Payment Finance (PayFi)** terdesentralisasi dan **100% Non-Custodial** di jaringan **Solana Mainnet**. Protokol ini dirancang untuk memfasilitasi perdagangan komputasi AI (*Machine-to-Machine / M2M*), lisensi API vendor, penerbitan lisensi on-chain instan, serta peluncuran token berbasis kurva dinamik menggunakan **Meteora Dynamic Bonding Curve (DBC) & DAMM v2**.

Berbeda dengan launchpad spekulatif konvensional, likuiditas token proyek di AutonPay diperkuat langsung oleh **arus kas komersial nyata**: 5% *protocol fee* dari setiap transaksi penjualan otomatis dialirkan sebagai *Protocol-Owned Liquidity* (POL) ke pool Meteora DAMM v2.

---

## ⚡ Ringkasan Eksekutif & Sinergi Protokol

Sistem pembayaran produk digital dan launchpad Web3 saat ini memiliki masalah mendasar:
* **SaaS Konvensional:** Memotong biaya 10–20% dengan masa penahanan dana berminggu-minggu serta ketiadaan dukungan transaksi agen AI mandiri.
* **Launchpad Spekulatif:** Likuiditas mengering pasca-peluncuran karena tidak ditopang utilitas atau pemasukan riil (*zero cash-flow*).

AutonPay menyelesaikan masalah tersebut melalui 5 pilar utama:

1. **Atomic Multi-Split Settlement (90 : 5 : 5)**: Seluruh pembayaran dieksekusi secara instan dan atomik di Solana Mainnet dalam satu bundle instruksi:
   * **90% Merchant / Vendor**: Diterima detik itu juga tanpa *escrow* (*zero lockup / direct settlement*).
   * **5% Protocol Treasury**: Cadangan likuiditas dan operasional protokol.
   * **5% Affiliate Partner**: Komisi rujukan on-chain instan bagi mitra komunitas.
2. **Meteora DBC Token Launchpad & DAMM v2 Flywheel**: Vendor terverifikasi dapat meluncurkan SPL token utilitas untuk produk komputasi/API mereka dengan parameter kurva Meteora DBC. Sebesar 5% protocol fee penjualan produk otomatis disalurkan untuk mempertebal likuiditas pool di Meteora DAMM v2 (*Compounding Liquidity*).
3. **Autonomous M2M (Machine-to-Machine) Procurement**: Agen AI otonom dapat memantau kuota kerjanya dan melakukan *checkout* lisensi API / GPU secara mandiri via *background daemon*.
4. **100% Non-Custodial & OFAC Compliant**: Tidak ada dana pengguna yang ditampung atau di-*escrow*. Protokol dilindungi *edge geofencing* untuk kepatuhan yurisdiksi global.
5. **Dual Cryptographic Ledger**: Lisensi diikat permanen ke Solana SPL Memo Program dan diindeks secara *real-time* ke Supabase PostgreSQL.

---

## 🏛️ Alur Arsitektur Transaksi (PayFi + Meteora DBC)

```text
       [ Pembeli Manusia ]   atau   [ Agen Otonom AI M2M ]
                               │
                               ▼
       ┌──────────────────────────────────────────────┐
       │      Katalog Produk Digital & Komputasi AI   │
       │    (Lisensi API, Model Weight, Compute SKU)  │
       └──────────────────────┬───────────────────────┘
                              │
                              │ Eksekusi Atomic 90/5/5 di Solana Mainnet
                              ▼
       ┌──────────────────────────────────────────────┐
       │             AutonPay PayFi Core              │
       │    - Native SystemProgram Multi-Transfer     │
       │    - Sub-Second Finality (Non-Custodial)     │
       └──────────────────────┬───────────────────────┘
                              │
       ┌──────────────────────┼───────────────────────┐
       │                      │                       │
       ▼ (90%)                ▼ (5%)                  ▼ (5%)
┌──────────────┐       ┌──────────────┐        ┌──────────────┐
│ Wallet       │       │ Protocol     │        │ Wallet       │
│ Vendor       │       │ Vault        │        │ Affiliate    │
└──────────────┘       └──────┬───────┘        └──────────────┘
                              │
                              │ Auto-Liquidity Pipeline
                              ▼
       ┌──────────────────────────────────────────────┐
       │       Meteora DBC & DAMM v2 Liquidity        │
       │  - Protocol-Owned Liquidity (POL) Injection  │
       │  - Continuous Price Floor & Deep Liquidity   │
       └──────────────────────────────────────────────┘
                              │
                              ▼
       ┌──────────────────────────────────────────────┐
       │       Penyerahan Lisensi On-Chain            │
       │  - SPL Memo Program Hash Verification        │
       │  - Real-Time Indexing di Supabase DB         │
       └──────────────────────────────────────────────┘
```

---

## 🔑 Fitur Utama

### 1. ☄️ Meteora DBC Token Launchpad (Mainnet Live)
* Memungkinkan merchant dan penyedia komputasi AI meluncurkan token SPL dengan konfigurasi *Dynamic Bonding Curve* (DBC) langsung dari tab **Vendor Portal**.
* Integrasi *auto-liquidity*: Fee penjualan produk 5% langsung memperkuat cadangan likuiditas di Meteora DAMM v2, menciptakan aset dengan *backing* omset komersial nyata.

### 2. 🛍️ Digital Vendor Marketplace & Gateway
* Katalog produk digital terkurasi khusus lisensi developer, compute power, dan aset digital.
* *One-click checkout* non-kustodian mendukung Phantom, Solflare, dan Backpack.
* Pencairan 90% instan langsung ke dompet penjual tanpa perantara.

### 3. 🤖 Modul Agen Otonom M2M (Agentic Commerce)
* Pemicu otonom mandiri (*background daemon*) yang mendeteksi habisnya kuota API agen dan membeli kuota baru secara otomatis di jaringan Solana Mainnet.
* Dilengkapi *telemetry log*, switch darurat (*Start/Stop*), dan pemantau gas balance.

### 4. 🤝 Program Afiliasi Otomatis (5%)
* Cukup lampirkan parameter URL `?ref=WALLET_ADDRESS`.
* Setiap transaksi otomatis membagi 5% fee secara on-chain detik itu juga ke wallet pereferensi.

### 5. 🛡️ Kepatuhan & Keamanan Non-Custodial
* *Role-gated merchant access* dengan alur kurasi onboarding terverifikasi.
* *Edge-level geofencing* untuk penyaringan yurisdiksi kepatuhan sanksi internasional (OFAC).

---

## 🛠️ Tech Stack

* **Blockchain Core**: Solana Mainnet (`@solana/web3.js`, SPL Token Program, SPL Memo Program)
* **Liquidity & Token Launchpad**: Meteora Dynamic Bonding Curve (DBC) & DAMM v2
* **Database & Indexer**: Supabase (PostgreSQL Realtime Database)
* **Frontend**: React 18, Vite, Tailwind CSS
* **Network & Security**: Vercel Edge Network (OFAC Geofencing)

---

## 🚀 Panduan Menjalankan Proyek (Local Development)

### Prasyarat
* Node.js v18+
* Solana Wallet Extension (Phantom, Solflare, Backpack)

### Langkah Instalasi

1. **Clone repositori:**
   ```bash
   git clone [https://github.com/provizto/autonpay.git](https://github.com/provizto/autonpay.git)
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

4. **Kompilasi build produksi:**
   ```bash
   npm run build
   ```

---

## 📝 Catatan Khusus Penjurian Hackathon (Superteam & Meteora Track)

* **Status Jaringan:** Sepenuhnya aktif dan beroperasi di **Solana Mainnet**.
* **Model Likuiditas:** Memenuhi track *Creative end-to-end launch flows* melalui *Compounding Liquidity DAMM v2 Pools* yang bersumber dari pembagian fee PayFi 90/5/5.
* **Akses Penjurian:** Jika repositori ini disetel ke *private*, tim penjuri dari Superteam / Meteora (GitHub ID: `dannxbt`) telah diberikan izin akses *Read*.

---

## 📄 Lisensi
Dirilis di bawah lisensi terbuka [MIT](LICENSE).