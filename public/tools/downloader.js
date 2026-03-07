document.addEventListener('DOMContentLoaded', () => {
    // Tangkap semua elemen tombol dan kotak di layar
    const btnProcess = document.getElementById('action-btn');
    const urlInput = document.getElementById('url-input');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const resultArea = document.getElementById('result-area');
    const resultLink = document.getElementById('result-link');
    const copyBtn = document.getElementById('copy-btn');

    // Pastikan tombol Process ada agar tidak error
    if (!btnProcess) return;

    btnProcess.addEventListener('click', async () => {
        const urlStr = urlInput.value.trim();
        
        if (!urlStr) {
            alert('Harap masukkan link video!');
            return;
        }

        // Ubah tampilan tombol saat memproses
        btnProcess.disabled = true;
        btnProcess.textContent = 'EXTRACTING...';
        progressContainer.classList.remove('hidden');
        resultArea.classList.add('hidden');
        progressBar.style.width = '30%';

        try {
            // 🔥 TRIK DEWA: Tembak API langsung dari HP (Bypass Vercel) 🔥
            // Menggunakan API publik Indonesia (Widipe) khusus YouTube
            // dan API Tiklydown untuk TikTok sebagai cadangan universal
            let apiUrl = '';
            
            if (urlStr.includes('youtu.be') || urlStr.includes('youtube.com')) {
                apiUrl = `https://widipe.com/download/ytdl?url=${encodeURIComponent(urlStr)}`;
            } else if (urlStr.includes('tiktok.com')) {
                apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(urlStr)}`;
            } else {
                // Jika selain YT/TikTok, tembak langsung ke Cobalt dari HP
                apiUrl = 'cobalt-bypass';
            }

            let finalDownloadLink = null;

            if (apiUrl === 'cobalt-bypass') {
                const response = await fetch("https://api.cobalt.tools/", {
                    method: "POST",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({ url: urlStr })
                });
                const data = await response.json();
                if (data.url) finalDownloadLink = data.url;
                else throw new Error("Gagal diekstrak oleh server.");
            } else {
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                // Cek balasan Widipe (YouTube)
                if (data.result && data.result.mp4) {
                    finalDownloadLink = data.result.mp4;
                } 
                // Cek balasan Tiklydown (TikTok)
                else if (data.video && data.video.noWatermark) {
                    finalDownloadLink = data.video.noWatermark;
                }
            }

            progressBar.style.width = '100%';

            // Tampilkan hasil jika sukses
            if (finalDownloadLink) {
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                    resultArea.classList.remove('hidden');
                    resultLink.value = finalDownloadLink;
                }, 500);
            } else {
                throw new Error('Link tidak didukung atau video diproteksi.');
            }

        } catch (error) {
            progressBar.style.width = '0%';
            progressContainer.classList.add('hidden');
            alert(`Kesalahan API: ${error.message}\nCoba link video lain.`);
        } finally {
            // Kembalikan tombol seperti semula
            btnProcess.disabled = false;
            btnProcess.textContent = 'PROCESS';
        }
    });

    // Fitur Copy Link
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            resultLink.select();
            document.execCommand('copy');
            alert('Link berhasil disalin ke clipboard!');
        });
    }
});
