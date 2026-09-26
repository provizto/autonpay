# AutonPay (Autonomous PayFi & Digital Merchant Settlement Protocol)

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana&logoColor=white)](https://solana.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%20%7C%20Tailwind-61DAFB)](https://vitejs.dev)
[![Architecture](https://img.shields.io/badge/Protocol-PayFi%20Merchant%20%2B%20M2M%20Commerce-blueviolet)](https://solscan.io)

**AutonPay** adalah protokol **Payment Finance (PayFi)** terdesentralisasi di atas jaringan **Solana** yang dirancang khusus untuk memfasilitasi penjualan produk digital vendor, penerbitan lisensi kriptografis instan, serta eksekusi transaksi belanja otonom antar-agen AI (*Machine-to-Machine / M2M*).

Arus pendapatan protokol sepenuhnya bersumber dari **transaksi komersial riil produk vendor** (seperti lisensi API, aset digital, software key, dan kuota komputasi), tanpa mekanisme swap spekulatif atau pool likuiditas sintetis.

---

## ⚡ Ringkasan Eksekutif & Model Bisnis

Sistem pembayaran produk digital konvensional sering kali mengenakan potongan platform yang sangat besar, pencairan dana berminggu-minggu, serta ketiadaan dukungan transaksi langsung oleh program atau agen cerdas (AI).

AutonPay menyederhanakan perdagangan digital Web3 melalui 4 pilar utama:

1. **Pure Vendor Commerce**: Platform beroperasi murni sebagai gerbang perdagangan barang digital vendor, di mana setiap transaksi mewakili pembelian produk atau jasa nyata.
2. **Atomic Multi-Split Settlement (90 : 5 : 5)**: Seluruh pembayaran dipecah secara langsung dan otomatis di on-chain dalam satu instruksi transaksi:
   * **90% Vendor (Merchant / Creator)**: Diterima langsung di wallet penjual detik itu juga tanpa masa tunggu (*zero lockup / no escrow delay*).
   * **5% Admin (Platform Protocol Fee)**: Pendapatan operasional untuk keberlanjutan relayer dan infrastruktur protokol.
   * **5% Affiliate Partner (Referral)**: Komisi promosi instan yang langsung dikirimkan ke wallet pihak pereferensi.
3. **Autonomous M2M (Machine-to-Machine) Procurement**: Agen AI dapat berbelanja lisensi API, kuota data, dan akses layanan langsung dari katalog vendor secara mandiri saat stok atau kuota kerjanya menipis.
4. **On-Chain Cryptographic License Delivery**: Begitu pembayaran terkonfirmasi, protokol menerbitkan tanda bukti dan kunci lisensi digital unik yang dapat diverifikasi secara publik di Solana Explorer.

---

## 🏛️ Alur Arsitektur Transaksi

```text
       [ Pembeli Manusia ]   atau   [ Agen Otonom AI M2M ]
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │        Katalog Produk Digital Vendor         │
        │    (Lisensi API, Kode Software, SaaS Access) │
        └──────────────────────┬───────────────────────┘
                               │
                               │ Eksekusi Pembayaran On-Chain (SOL / USDC)
                               ▼
        ┌──────────────────────────────────────────────┐
        │           AutonPay PayFi Core                │
        │   - Solana Multi-Instruction Execution       │
        │   - Single-Transaction Settlement            │
        └──────────────────────┬───────────────────────┘
                               │
        ┌──────────────────────┼───────────────────────┐
        │                      │                       │
        ▼ (90%)                ▼ (5%)                  ▼ (5%)
 ┌──────────────┐       ┌──────────────┐        ┌──────────────┐
 │ Wallet       │       │ Wallet       │        │ Wallet       │
 │ Vendor       │       │ Admin        │        │ Affiliate    │
 └──────────────┘       └──────────────┘        └──────────────┘
                               │
                               ▼
     ┌──────────────────────────────────────────────────┐
     │  Modal Penyerahan Lisensi Digital On-Chain       │
     │  - Bukti Kriptografis Unik (Hash Transaksi)      │
     │  - Verifikasi Terbuka di Solscan Devnet          │
     └──────────────────────────────────────────────────┘
```

---

## 🔑 Fitur Utama

### 1. 🛍️ Digital Vendor Marketplace & Gateway
* Katalog produk digital terkurasi bagi vendor software, penyedia API, dan kreator aset digital.
* Pengalaman *one-click checkout* menggunakan Solana Wallet (Phantom, Solflare, Backpack).
* Aliran dana langsung ke dompet penjual (90%), mengeliminasi risiko penahanan dana oleh perantara terpusat.

### 2. 🤝 Program Kemitraan Afiliasi Otomatis (5%)
* Mitra komunitas cukup membagikan tautan produk atau memasukkan address referral.
* Setiap pembelian yang terjadi melalui rujukan langsung mentransfer 5% bagian fee secara atomik ke wallet mitra.

### 3. 🤖 Modul Agen Otonom M2M (Agentic Commerce)
* Pemicu otonom (*non-custodial trigger*) yang memantau sisa kuota dan mengeksekusi pembelian lisensi ke katalog vendor secara otomatis.
* Dilengkapi kontrol keamanan penuh (*Start / Stop Switch*, batasan alokasi saldo, dan rekaman log transaksi agen).

### 4. 📜 Bukti Lisensi Digital Cepat & Ramping
* Desain modal kuitansi transaksi yang ramping, responsif, dan optimal untuk layar ponsel pintar maupun peramban desktop.
* Tautan verifikasi transaksi langsung menuju Solscan Devnet Explorer.

---

## 🛠️ Tech Stack

* **Blockchain**: Solana Devnet (`@solana/web3.js`, `@solana/wallet-adapter`)
* **Frontend**: React 18, Vite
* **Styling**: Tailwind CSS, Lucide Icons
* **Deployment**: Vercel Edge Network, GitHub CI/CD

---

## 🚀 Panduan Menjalankan Proyek (Local Development)

### Prasyarat
* [Node.js](https://nodejs.org/) v18+
* Solana Wallet Extension yang disetel ke jaringan **Devnet**

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

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka peramban pada alamat lokal yang tertera (biasanya `http://localhost:5173`).

4. **Kompilasi build produksi:**
   ```bash
   npm run build
   ```

---

## 📱 Desain Antarmuka Mobile-First

* **Bottom Dock Navigation**: Navigasi bawah terpadu untuk kemudahan akses jempol pada layar sentuh.
* **Compact License Receipt**: Tampilan pop-up lisensi yang ringkas tanpa scrollbar yang mengganggu.
* **Auto Responsive Grid**: Penyesuaian layout otomatis dari layar desktop ke tampilan mobile.

---

## ⚠️ Catatan Devnet

AutonPay saat ini berjalan di atas jaringan **Solana Devnet** untuk pengujian fungsionalitas, evaluasi alur PayFi, dan demonstrasi transaksi M2M. Jangan mengirim aset riil Mainnet ke alamat akun pengujian di aplikasi ini.

---

## 📄 Lisensi
Dirilis di bawah lisensi terbuka [MIT](LICENSE).