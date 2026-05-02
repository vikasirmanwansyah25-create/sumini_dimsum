# TODO Perbaikan Error 404 & Runtime

## Masalah Root Cause
- `app/page.tsx` tidak ada → 404 saat akses `/`
- `.env` tidak ada → Prisma gagal connect ke SQLite → API error 500
- Import path inconsistent di API routes (relative vs alias)

## Plan Perbaikan

1. [ ] Buat `app/page.tsx` → redirect `/` ke `/login`
2. [ ] Buat `.env` → `DATABASE_URL="file:./prisma/dev.db"`
3. [ ] Hapus file `dev.db` (root) — artifact
4. [ ] Hapus folder `c/` — artifact kosong
5. [ ] Fix import `app/api/transaksi/route.ts` → `@/lib/prisma`
6. [ ] Fix import `app/api/transaksi/stats/route.ts` → `@/lib/prisma`
7. [ ] Generate Prisma Client & test run dev

