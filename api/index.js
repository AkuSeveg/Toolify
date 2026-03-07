import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Inisialisasi koneksi Redis untuk Rate Limiting
const redis = new Redis({
  url: "https://fine-shepherd-64718.upstash.io",
  token: "AfzOAAIncDJhYWM2YWUwY2IxMmU0YTQyYjc0NGIwZTBkMzUxMGFhMHAyNjQ3MTg",
});

// 2. Aturan: Maksimal 10 request per jam per IP address
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});

export default async function handler(req, res) {
    // 3. Konfigurasi CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 4. Proteksi Rate Limit Anti-Bot
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

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
                // MENGGUNAKAN API COBALT V7 TERBARU (Tanpa /api/json)
                const apiResponse = await fetch("https://api.cobalt.tools/", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: videoUrl
                    })
                });

                const apiData = await apiResponse.json();

                if (apiData.url) {
                    // Berhasil!
                    return res.status(200).json({ 
                        success: true, 
                        downloadLink: apiData.url 
                    });
                } else {
                    // Jika gagal, tangkap dan kirim ALASAN ASLI dari Cobalt ke layarmu!
                    const errorMessage = apiData.text || apiData.error || 'Ditolak oleh Server Cobalt.';
                    return res.status(400).json({ 
                        success: false, 
                        error: `COBALT ERROR: ${errorMessage}` 
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

    return res.status(404).json({ success: false, error: 'Endpoint tidak valid.' });
                          }
