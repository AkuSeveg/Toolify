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

        btnProcess.disabled = true;
        btnProcess.textContent = 'EXTRACTING...';
        progressContainer.classList.remove('hidden');
        resultArea.classList.add('hidden');
        progressBar.style.width = '30%';

        try {
            let apiUrl = '';
            let finalDownloadLink = null;

            // 🔥 MESIN DETEKSI PLATFORM OTOMATIS 🔥
            
            // 1. Jika Link YOUTUBE
            if (urlStr.includes('youtu.be') || urlStr.includes('youtube.com')) {
                apiUrl = `https://widipe.com/download/ytdl?url=${encodeURIComponent(urlStr)}`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (data.result && data.result.mp4) finalDownloadLink = data.result.mp4;
            } 
            // 2. Jika Link TIKTOK
            else if (urlStr.includes('tiktok.com')) {
                apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(urlStr)}`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (data.video && data.video.noWatermark) finalDownloadLink = data.video.noWatermark;
            } 
            // 3. Jika Link INSTAGRAM
            else if (urlStr.includes('instagram.com')) {
                apiUrl = `https://widipe.com/download/igdl?url=${encodeURIComponent(urlStr)}`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                // Mengambil video pertama dari kumpulan slide/reels IG
                if (data.result && data.result.length > 0) finalDownloadLink = data.result[0].url;
                else if (data.result && data.result.url) finalDownloadLink = data.result.url;
            } 
            // 4. Jika Link FACEBOOK
            else if (urlStr.includes('facebook.com') || urlStr.includes('fb.watch')) {
                apiUrl = `https://widipe.com/download/fbdl?url=${encodeURIComponent(urlStr)}`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (data.result && data.result.Normal_video) finalDownloadLink = data.result.Normal_video;
                else if (data.result && data.result.HD) finalDownloadLink = data.result.HD;
            } 
            // Jika tidak dikenali
            else {
                throw new Error('Link tidak didukung. Harap masukkan link YT, TikTok, IG, atau FB yang valid.');
            }

            progressBar.style.width = '80%';

            // Tampilkan hasil jika sukses menangkap link
            if (finalDownloadLink) {
                setTimeout(() => {
                    progressBar.style.width = '100%';
                    progressContainer.classList.add('hidden');
                    resultArea.classList.remove('hidden');
                    resultLink.value = finalDownloadLink;
                }, 500);
            } else {
                throw new Error('Server API sedang sibuk atau video ini diprivate oleh pembuat aslinya.');
            }

        } catch (error) {
            progressBar.style.width = '0%';
            progressContainer.classList.add('hidden');
            alert(`API Error: ${error.message}`);
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
