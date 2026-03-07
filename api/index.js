import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Inisialisasi koneksi Redis untuk Rate Limiting
const redis = new Redis({
  url: "https://fine-shepherd-64718.upstash.io",
  token: "AfzOAAIncDJhYWM2YWUwY2IxMmU0YTQyYjc0NGIwZTBkMzUxMGFhMHAyNjQ3MTg",
});

// 2. Aturan: Maksimal 10 request per jam per IP
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

    // 4. Proteksi Rate Limit
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (!success) {
        return res.status(429).json({ success: false, error: "Limit penggunaan harian tercapai. Silakan coba lagi nanti." });
    }

    // 5. Logika Routing
    if (req.method === 'POST') {
        const { action, videoUrl } = req.body;

        if (action === 'download' && videoUrl) {
            
            // 🔥 DAFTAR SERVER PRIVATE (SMART SWITCHER) 🔥
            // Kode akan otomatis mencoba dari atas ke bawah sampai berhasil!
            const SERVERS = [
                "https://cobalt.ziy.sh/",
                "https://cobalt.q0.o.q0.pm/",
                "https://cobalt.acyl.ing/",
                "https://api.cobalt.tools/" // Server utama taruh paling bawah sebagai cadangan terakhir
            ];

            let finalDownloadLink = null;

            // Memburu link dari server-server di atas
            for (let server of SERVERS) {
                try {
                    const apiResponse = await fetch(server, {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ url: videoUrl })
                    });

                    const apiData = await apiResponse.json();

                    if (apiData.url) {
                        finalDownloadLink = apiData.url;
                        break; // BERHASIL! Dapatkan link dan langsung keluar dari pencarian
                    }
                } catch (e) {
                    // Kalau server ini gagal/diblokir, diam saja dan lompat ke server berikutnya
                    continue; 
                }
            }

            // Hasil Akhir
            if (finalDownloadLink) {
                return res.status(200).json({ 
                    success: true, 
                    downloadLink: finalDownloadLink 
                });
            } else {
                return res.status(400).json({ 
                    success: false, 
                    error: "Semua server penyedia sedang sibuk atau link tidak valid/diproteksi." 
                });
            }
        }
    }

    return res.status(404).json({ success: false, error: 'Endpoint tidak valid.' });
          }
