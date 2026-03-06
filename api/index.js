import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Inisialisasi koneksi Redis untuk Rate Limiting
// URL dan Token ini akan otomatis diambil dari Environment Variables Vercel
const redis = new Redis({
  url: process.env.https://fine-shepherd-64718.upstash.io,
  token: process.env.AfzOAAIncDJhYWM2YWUwY2IxMmU0YTQyYjc0NGIwZTBkMzUxMGFhMHAyNjQ3MTg,
});

// 2. Aturan: Maksimal 10 request per jam per IP address
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});

export default async function handler(req, res) {
    // 3. Konfigurasi CORS (Agar frontend kamu diizinkan mengakses API ini)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Tangani preflight request dari browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 4. Proteksi Rate Limit Anti-Bot
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    // Kirim info sisa limit ke header (standar API profesional)
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (!success) {
        return res.status(429).json({ 
            success: false,
            error: "Limit tercapai (Max 10/jam). Silakan coba lagi nanti."
        });
    }

    // 5. Logika Routing Utama
    if (req.method === 'POST') {
        const { action, videoUrl } = req.body;

        // --- FITUR VIDEO DOWNLOADER ---
        if (action === 'download' && videoUrl) {
            try {
                // Menggunakan public API dari Cobalt untuk mengekstrak video
                const apiResponse = await fetch("https://co.wuk.sh/api/json", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: videoUrl,
                        vQuality: "720",
                        isAudioOnly: false // Ubah jadi true jika ke depannya ingin fitur download MP3 saja
                    })
                });

                const apiData = await apiResponse.json();

                if (apiData.url) {
                    // Berhasil mendapatkan link download langsung
                    return res.status(200).json({ 
                        success: true, 
                        downloadLink: apiData.url 
                    });
                } else {
                    // Gagal (misal videonya di-private oleh pembuat aslinya)
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Video diproteksi, dihapus, atau link tidak didukung.' 
                    });
                }
            } catch (error) {
                console.error("Downloader API Error:", error);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Gagal menghubungi server penyedia video.' 
                });
            }
        }
    }

    // Jika pengguna mencoba mengakses rute yang tidak kita buat
    return res.status(404).json({ success: false, error: 'Endpoint tidak valid.' });
}