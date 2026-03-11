document.addEventListener('DOMContentLoaded', () => {
    // 1. Tangkap semua elemen dari index.html
    const btnProcess = document.getElementById('action-btn');
    const urlInput = document.getElementById('url-input');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const resultArea = document.getElementById('result-area');
    const resultLink = document.getElementById('result-link');
    const copyBtn = document.getElementById('copy-btn');

    // Jaga-jaga kalau elemennya belum ke-load
    if (!btnProcess || !urlInput) return;

    // 2. Aksi saat tombol Process diklik
    btnProcess.addEventListener('click', async () => {
        const urlStr = urlInput.value.trim();
        
        if (!urlStr) {
            alert('Bos, link videonya diisi dulu dong!');
            return;
        }

        // Ubah tampilan ke mode loading
        btnProcess.disabled = true;
        btnProcess.textContent = 'MENGGALI DATA (AIO)...';
        progressContainer.classList.remove('hidden');
        resultArea.classList.add('hidden');
        progressBar.style.width = '30%';

        try {
            // 🔥 Nembak API AIO buatan Bos Yoanz di Vercel 🔥
            // Kita pakai endpoint /api/aio yang udah disetting tadi
            const apiUrl = `/api/aio?url=${encodeURIComponent(urlStr)}`;
            
            const response = await fetch(apiUrl);
            
            // Cek kalau Vercel-nya ngasih error 500 dll
            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}. Pastikan api/index.js sudah benar di Vercel.`);
            }

            const data = await response.json();
            progressBar.style.width = '70%';

            // Cek status dari JSON balasan AIO-mu
            if (data.status === false || data.error) {
                throw new Error(data.error || "Gagal nge-scrape data dari server.");
            }

            // 🤖 MESIN PENCARI LINK DOWNLOAD 🤖
            let finalDownloadLink = null;
            const links = data.result.downloadUrls;

            // Karena hasil scraping AIO itu bisa array atau object, kita deteksi:
            if (links && Array.isArray(links) && links.length > 0) {
                // Ambil link download urutan pertama (biasanya HD / No Watermark)
                finalDownloadLink = links[0].url || links[0]; 
            } else if (links && typeof links === 'object') {
                const firstKey = Object.keys(links)[0];
                finalDownloadLink = links[firstKey].url || links[firstKey];
            }

            progressBar.style.width = '100%';

            // Tampilkan hasilnya!
            if (finalDownloadLink) {
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                    resultArea.classList.remove('hidden');
                    resultLink.value = finalDownloadLink;
                }, 500);
            } else {
                console.log("Data AIO Mentah:", data);
                throw new Error('Video ketemu, tapi link MP4-nya gagal diekstrak sama mesin AIO.');
            }

        } catch (error) {
            progressBar.style.width = '0%';
            progressContainer.classList.add('hidden');
            alert(`Waduh Error: ${error.message}`);
        } finally {
            // Kembalikan tombol ke kondisi semula
            btnProcess.disabled = false;
            btnProcess.textContent = 'PROCESS';
        }
    });

    // 3. Aksi saat tombol Copy diklik
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            resultLink.select();
            document.execCommand('copy');
            alert('Sip! Link MP4 berhasil disalin. Buka tab baru di browser lu terus paste linknya buat download!');
        });
    }
});
