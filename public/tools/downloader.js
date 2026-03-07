document.addEventListener('DOMContentLoaded', () => {
    // 1. Menangkap semua elemen dari HTML
    const btnProcess = document.getElementById('action-btn');
    const urlInput = document.getElementById('url-input');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const resultArea = document.getElementById('result-area');
    const resultLink = document.getElementById('result-link');
    const copyBtn = document.getElementById('copy-btn');

    // Mencegah error jika tombol tidak ditemukan di halaman
    if (!btnProcess) return;

    // 2. Event ketika tombol Process diklik
    btnProcess.addEventListener('click', async () => {
        const urlStr = urlInput.value.trim();
        
        // Peringatan jika link kosong
        if (!urlStr) {
            alert('Harap masukkan link video YouTube!');
            return;
        }

        // Ubah tampilan menjadi mode Loading
        btnProcess.disabled = true;
        btnProcess.textContent = 'EXTRACTING...';
        progressContainer.classList.remove('hidden');
        resultArea.classList.add('hidden');
        progressBar.style.width = '30%';

        try {
            // 🔥 MESIN PEMOTONG KTP YOUTUBE 🔥
            // Mengambil 11 digit ID video dari link yang panjang
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = urlStr.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;

            if (!videoId) {
                throw new Error("Link YouTube tidak valid. Harap masukkan link yang benar.");
            }

            progressBar.style.width = '50%';

            // 🔥 KUNCI RAPIDAPI MILIKMU (FULL & ASLI) 🔥
            const RAPIDAPI_KEY = "72c9e6943emshb88e6069d09605fp1945b0jsn784f000ba98e";
            const RAPIDAPI_HOST = "youtube-video-fast-downloader-24-7.p.rapidapi.com"; 

            // Tembak server RapidAPI VIP dengan ID Video milikmu
            const apiUrl = `https://${RAPIDAPI_HOST}/get-videos-info/${videoId}?response_mode=default`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': RAPIDAPI_HOST
                }
            });

            // Cek jika server RapidAPI menolak atau error
            if (!response.ok) {
                throw new Error(`Gagal terhubung ke API (Status: ${response.status})`);
            }

            const data = await response.json();
            progressBar.style.width = '80%';

            // 🤖 JURUS PENCARI LINK MP4 OTOMATIS 🤖
            let finalDownloadLink = null;
            
            // Kita bongkar paksa isi JSON-nya dan cari link yang asalnya dari server YouTube
            JSON.stringify(data, (key, value) => {
                if (typeof value === 'string' && (value.includes('googlevideo.com/videoplayback') || value.includes('.mp4'))) {
                    if (!finalDownloadLink) finalDownloadLink = value; // Ambil link pertama yang ketemu
                }
                return value;
            });

            progressBar.style.width = '100%';

            // Tampilkan hasil akhirnya ke layar
            if (finalDownloadLink) {
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                    resultArea.classList.remove('hidden');
                    resultLink.value = finalDownloadLink;
                }, 500);
            } else {
                console.log("Data mentah dari API:", data);
                throw new Error('Video berhasil ditemukan di server, tapi link download MP4-nya diproteksi.');
            }

        } catch (error) {
            // Jika terjadi error, kembalikan tampilan dan beri alert
            progressBar.style.width = '0%';
            progressContainer.classList.add('hidden');
            alert(`API Error: ${error.message}`);
        } finally {
            // Normalkan kembali tombol Process
            btnProcess.disabled = false;
            btnProcess.textContent = 'PROCESS';
        }
    });

    // 3. Fitur Tombol Copy Link
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            resultLink.select();
            document.execCommand('copy');
            alert('Link MP4 berhasil disalin ke clipboard! Buka tab browser baru lalu Paste linknya untuk mendownload.');
        });
    }
});
