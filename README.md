# Toolify ⚡

Toolify adalah platform **web tools** modern dengan antarmuka minimalis monokrom (Hitam & Putih) yang dirancang untuk mempercepat produktivitas digital. Dibangun dengan fokus pada kecepatan, keamanan, dan desain yang responsif.

## ✨ Fitur Utama

- **🎬 Video Downloader**: Unduh video (MP4/MP3) dari berbagai platform sosial media secara instan.
- **🔄 File Converter**: Konversi format file dengan mudah (contoh: MP4 ke MP3, PDF ke JPG, PNG ke JPG) tanpa mengurangi kualitas.
- **🖼️ Image to Link**: Unggah gambar (hingga 2GB) dan dapatkan tautan publik yang bisa dibagikan (*Powered by Cloudinary Chunked Upload*).
- **🎥 Video to Link**: Unggah video ke *cloud* dan dapatkan tautan langsung untuk dibagikan.

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Tanpa Framework, performa maksimal).
- **Backend**: Node.js (Vercel Serverless Functions).
- **Penyimpanan**: Cloudinary (Direct Browser Upload).
- **Keamanan**: Upstash Redis (Rate Limiting Anti-Bot).
- **Ikon**: Feather Icons.

## 📂 Struktur Folder

\`\`\`text
TOOLIFY/
│
├── public/
│   ├── index.html           # Struktur UI Utama
│   ├── style.css            # Gaya Desain Monokrom
│   ├── script.js            # Logika Interaksi UI
│   ├── assets/              # Berisi gambar (Banner, Profil, Logo)
│   │
│   └── tools/
│       ├── convert.js       # Logika Konverter Format
│       ├── downloader.js    # Logika Pengunduh Video
│       └── uploaderManager.js # Logika Cloudinary Chunked Upload
│
├── api/
│   └── index.js             # Vercel Serverless Backend & Rate Limit
│
├── package.json             # Dependensi Backend (Upstash Redis)
├── vercel.json              # Konfigurasi Routing Vercel
└── README.md                # Dokumentasi Proyek
\`\`\`

---
**Dikembangkan dan dibuat oleh Yoanz** | © 2026