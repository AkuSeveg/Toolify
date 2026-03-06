async function handleDownloadRequest(urlStr) {
    if (!urlStr || !urlStr.startsWith('http')) {
        alert('Mohon masukkan URL video yang valid!');
        return;
    }

    uiElements.progressContainer.classList.remove('hidden');
    uiElements.progressBar.style.width = '40%'; // Indikator mulai request
    uiElements.actionBtn.disabled = true;
    uiElements.actionBtn.innerText = 'Extracting...';

    try {
        // Kirim request ke backend Vercel kita
        const response = await fetch('/api/index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'download',
                videoUrl: urlStr 
            })
        });

        const data = await response.json();
        
        uiElements.progressBar.style.width = '100%';

        if (data.success && data.downloadLink) {
            setTimeout(() => {
                uiElements.progressContainer.classList.add('hidden');
                uiElements.resultArea.classList.remove('hidden');
                document.getElementById('result-link').value = data.downloadLink;
                
                // Opsional: Langsung buka link di tab baru untuk download
                window.open(data.downloadLink, '_blank');
                
                uiElements.actionBtn.disabled = false;
                uiElements.actionBtn.innerText = 'Download Now';
            }, 500);
        } else {
            alert('Gagal mengambil video: ' + (data.error || 'Link tidak didukung.'));
            resetUI();
        }
    } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan jaringan.');
        resetUI();
    }
}