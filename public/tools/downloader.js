document.addEventListener('DOMContentLoaded', () => {
    // 1. Tangkap semua elemen UI Neumorphism lu
    const btnProcess = document.getElementById('action-btn');
    const urlInput = document.getElementById('url-input');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const resultArea = document.getElementById('result-area');
    const resultLink = document.getElementById('result-link');
    const copyBtn = document.getElementById('copy-btn');

    // Jaga-jaga biar nggak error kalau tombolnya belum ke-load
    if (!btnProcess || !urlInput) return;

    // 2. Aksi brutal saat tombol Process diklik
    btnProcess.addEventListener('click', async () => {
        const urlStr = urlInput.value.trim();
        
        if (!urlStr) {
            alert('Bos Yoanz, link videonya diisi dulu dong!');
            return;
        }

        // Mode Loading Aktif (UI Tenggelam)
        btnProcess.disabled = true;
        btnProcess.textContent = 'MENEMBUS KEAMANAN TARGET...';
        progressContainer.classList.remove('hidden');
        resultArea.classList.add('hidden');
        progressBar.style.width = '30%';

        try {
            // 🔥 Nembak Mesin Vercel Native Lu 🔥
            // Perhatikan alamatnya cuma /api, nggak pakai /aio lagi!
            const apiUrl = `/api?url=${encodeURIComponent(urlStr)}`;
            
            const response = await fetch(apiUrl);
            progressBar.style.width = '60%';
            
            // Kalau Vercel-nya ngambek (misal 500 Server Error)
            if (!response.ok) {
                // Kita coba tangkap pesan error dari backend kalau ada
                let errorMsg = `Server Vercel Error (Status: ${response.status})`;
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = errData.error;
                } catch(e) {}
                
                throw new Error(errorMsg);
            }

            // Parsing hasil tangkapan JSON dari mesin AIO
            const data = await response.json();
            progressBar.style.width = '80%';

            // Cek kalau JSON bilang statusnya false / gagal nembus target
            if (data.status === false || data.error) {
                throw new Error(data.error || "Gagal nge-scrape data dari target.");
            }

            // 🤖 MESIN PENCARI LINK DOWNLOAD (MP4) 🤖
            let finalDownloadLink = null;
            // Ambil array/object link dari struktur JSON lu
            const links = data.result?.downloadUrls;

            // Kita sortir datanya, ngambil link kualitas paling atas
            if (links && Array.isArray(links) && links.length > 0) {
                finalDownloadLink = links[0].url || links[0]; 
            } else if (links && typeof links === 'object') {
                const firstKey = Object.keys(links)[0];
                if (firstKey) {
                    finalDownloadLink = links[firstKey].url || links[firstKey];
                }
            }

            // Kalau mesin sukses tapi linknya disembunyikan
            if (!finalDownloadLink) {
                console.log("Data AIO Mentah:", data);
                throw new Error("Video ketemu, tapi link MP4-nya kosong atau sengaja disembunyikan server target.");
            }

            progressBar.style.width = '100%';

            // Tampilkan Hasilnya ke layar dengan mulus
            setTimeout(() => {
                progressContainer.classList.add('hidden');
                resultArea.classList.remove('hidden');
                resultLink.value = finalDownloadLink;
            }, 500);

        } catch (error) {
            progressBar.style.width = '0%';
            progressContainer.classList.add('hidden');
            // Menampilkan alert error langsung ke layar lu
            alert(`⚠️ Waduh Error Bos: ${error.message}`);
        } finally {
            // Kembalikan tombol ke wujud Neumorphism semula
            btnProcess.disabled = false;
            btnProcess.textContent = 'DOWNLOAD VIDEO';
        }
    });

    // 3. Fitur Tombol Copy Estetik
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            resultLink.select();
            document.execCommand('copy');
            alert('Sip! Link MP4 berhasil disalin. Gas buka tab baru di browser buat download!');
        });
    }
});
