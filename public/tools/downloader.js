document.addEventListener('DOMContentLoaded', () => {
    const btnProcess = document.getElementById('action-btn');
    const urlInput = document.getElementById('url-input');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const resultArea = document.getElementById('result-area');
    const resultLink = document.getElementById('result-link');
    const copyBtn = document.getElementById('copy-btn');

    if (!btnProcess) return;

    btnProcess.addEventListener('click', async () => {
        const urlStr = urlInput.value.trim();
        
        if (!urlStr) {
            alert('Harap masukkan link video!');
            return;
        }

        // Tampilan saat loading
        btnProcess.disabled = true;
        btnProcess.textContent = 'EXTRACTING...';
        progressContainer.classList.remove('hidden');
        resultArea.classList.add('hidden');
        progressBar.style.width = '30%';

        try {
            // 🔥 JALUR BYPASS: Tembak API All-in-One Danxy langsung dari HP! 🔥
            // Format URL: https://danxyofficial-api.vercel.app/api/download/aiodl?url=...
            const apiUrl = `https://danxyofficial-api.vercel.app/api/download/aiodl?url=${encodeURIComponent(urlStr)}`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            progressBar.style.width = '70%';

            let finalDownloadLink = null;

            // 🤖 DETEKSI CERDAS: Karena kita belum tahu pasti bentuk JSON AIO-nya,
            // kode ini akan mencari letak link videonya secara otomatis!
            if (data.result && data.result.url) {
                finalDownloadLink = data.result.url; // Format standar
            } else if (data.url) {
                finalDownloadLink = data.url; // Format ringkas
            } else if (data.result && data.result.video) {
                finalDownloadLink = data.result.video; // Format Tiktok
            } else if (data.data && data.data.url) {
                finalDownloadLink = data.data.url; // Format alternatif
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
                // Kalau gagal, tangkap pesan error aslinya dari Danxy
                const errMsg = data.message || data.mess || 'Gagal diekstrak oleh API Danxy.';
                throw new Error(errMsg);
            }

        } catch (error) {
            progressBar.style.width = '0%';
            progressContainer.classList.add('hidden');
            alert(`API Error: ${error.message}\n(Mungkin API sedang gangguan atau link diproteksi)`);
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
