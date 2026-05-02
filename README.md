# POS Keripik Pisang

Sistem Point of Sale (POS) untuk penjualan Keripik Pisang dengan fitur lengkap untuk Admin dan Kasir.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI & Lucide React Icons
- **State Management**: Zustand
- **Font**: Inter (Google Fonts)
- **Charts**: Recharts

## Fitur

### Role ADMIN (Akses Penuh)

- **Dashboard**: Ringkasan total penjualan, grafik tren harian, indikator stok menipis
- **Inventory**: CRUD produk keripik (Nama, Rasa, Berat, Harga Beli, Harga Jual, Stok)
- **User Management**: Kelola akun Kasir
- **Laporan**: Riwayat transaksi semua user dan perhitungan laba rugi

### Role KASIR (Akses Operasional)

- **Halaman Transaksi**: Grid produk dengan filter kategori, sidebar keranjang belanja
- **Checkout**: Kalkulasi otomatis, input nominal bayar, hitung kembalian
- **Riwayat**: Daftar transaksi kasir pada hari ini

## Desain UI/UX

- **Palet Warna**: Tema "Banana Premium" (Kuning Pisang #FDE047)
- **Responsivitas**: Sidebar collapsible, optimal untuk Tablet dan Desktop
- **Elemen UI**: Card dengan shadow-sm, button rounded-xl, input clean

## Instalasi

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Demo Login

| Role  | Username    |
|-------|-------------|
| Admin | admin       |
| Kasir | sarah_kasir |
| Kasir | budi_kasir  |

## Struktur Folder

```
├── app/                    # Next.js App Router
│   ├── admin/              # Admin pages
│   │   ├── inventory/      # CRUD Inventory
│   │   ├── users/          # User Management
│   │   └── laporan/       # Laporan
│   ├── cashier/            # Kasir pages
│   │   └── riwayat/       # Transaction History
│   └── login/             # Login Page
├── components/
│   ├── layout/            # Layout components
│   │   ├���─ sidebar.tsx    # Sidebar with navigation
│   │   └── main-layout.tsx
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── data.ts            # Mock data
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── store/
    ├── auth.ts           # Auth Zustand store
    └── cart.ts           # Cart Zustand store
```

## Lisensi

MIT