# CV Generator

Website CV Generator dengan fitur login Google SSO, verifikasi admin, pilih template, dan generate PDF.

## Tech Stack

- **Frontend**: SvelteKit 5 + TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **Auth & Database**: Supabase (Google OAuth)
- **PDF**: jsPDF

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan SQL di `supabase/schema.sql` pada SQL Editor di Supabase Dashboard
3. Aktifkan Google OAuth:
   - Di Supabase Dashboard → Authentication → Providers → Google
   - Masukkan Google Client ID dan Secret dari [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Set Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`

### 3. Konfigurasi Environment

Copy `.env.example` ke `.env` dan isi:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 4. Jalankan development server

```bash
npm run dev
```

## Fitur

### User Flow
1. **Login** — User login menggunakan Google SSO
2. **Verifikasi** — Hanya user yang sudah diverifikasi admin yang bisa menggunakan fitur
3. **Isi Data CV** — User mengisi data: informasi pribadi, pendidikan, pengalaman kerja, keahlian, bahasa, sertifikasi
4. **Pilih Template** — Pilih dari 5 template (Modern, Classic, Creative, Minimal, Executive)
5. **Generate PDF** — Download CV dalam format PDF

### Admin Dashboard (`/admin`)
- Login dengan username/password dari environment variable
- Lihat semua user yang terdaftar
- Verify/unverify user

### Template CV
1. **Modern** — Desain bersih dengan header biru
2. **Classic** — Layout tradisional profesional dengan font serif
3. **Creative** — Dua kolom dengan sidebar ungu
4. **Minimal** — Fokus konten, aksen hijau
5. **Executive** — Elegan untuk profesional senior, aksen emas

## Struktur Project

```
src/
├── app.css                    # Tailwind + DaisyUI
├── app.d.ts                   # Type declarations
├── app.html                   # HTML template
├── hooks.server.ts            # Server hooks (Supabase auth)
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── types.ts               # TypeScript types
│   ├── components/
│   │   ├── CVForm.svelte      # Form input CV
│   │   ├── TemplateSelector.svelte  # Template picker
│   │   └── PDFGenerator.svelte      # PDF generation UI
│   └── pdf/
│       └── generator.ts       # PDF generation logic (5 templates)
└── routes/
    ├── +layout.server.ts      # Root layout loader
    ├── +layout.svelte         # Root layout
    ├── +page.server.ts        # Landing page guard
    ├── +page.svelte           # Landing/login page
    ├── auth/
    │   ├── callback/+server.ts  # OAuth callback
    │   └── logout/+server.ts    # Logout handler
    ├── dashboard/
    │   ├── +page.server.ts    # Dashboard guard
    │   └── +page.svelte       # User dashboard
    ├── cv/
    │   └── create/
    │       ├── +page.server.ts  # CV create guard
    │       └── +page.svelte     # CV creation wizard
    └── admin/
        ├── +page.server.ts    # Admin auth + actions
        └── +page.svelte       # Admin dashboard
```
