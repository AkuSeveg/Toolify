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
            // 🔥 ALAMAT SUDAH DIPERBAIKI: Menghapus "/api" yang nyasar 🔥
            const apiUrl = `https://danxyofficial-api.vercel.app/download/aiodl?url=${encodeURIComponent(urlStr)}`;
            
            const response = await fetch(apiUrl);
            
            // Cek jika server mengembalikan halaman HTML/Error bukan JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") === -1) {
                throw new Error("Server API tidak merespons dengan format JSON. (Mungkin sedang offline/maintenance)");
            }

            const data = await response.json();
            progressBar.style.width = '70%';

            let finalDownloadLink = null;

            // Deteksi format balasan
            if (data.result && data.result.url) {
                finalDownloadLink = data.result.url;
            } else if (data.url) {
                finalDownloadLink = data.url;
            } else if (data.result && data.result.video) {
                finalDownloadLink = data.result.video;
            } else if (data.data && data.data.url) {
                finalDownloadLink = data.data.url;
            }

            progressBar.style.width = '100%';

            if (finalDownloadLink) {
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                    resultArea.classList.remove('hidden');
                    resultLink.value = finalDownloadLink;
                }, 500);
            } else {
                const errMsg = data.message || data.mess || 'Gagal menemukan link download dari API.';
                throw new Error(errMsg);
            }

        } catch (error) {
            progressBar.style.width = '0%';
            progressContainer.classList.add('hidden');
            alert(`API Error: ${error.message}`);
        } finally {
            btnProcess.disabled = false;
            btnProcess.textContent = 'PROCESS';
        }
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            resultLink.select();
            document.execCommand('copy');
            alert('Link berhasil disalin ke clipboard!');
        });
    }
});
