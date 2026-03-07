const CLOUD_NAME = 'dsgww7mqb'; 
const UPLOAD_PRESET = 'ml_default'; 

function uploadFileRealtime(file) {
    if (!file) {
        alert('Pilih file terlebih dahulu!');
        return;
    }

    // Validasi Ketat: Maksimal 2GB
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > MAX_SIZE) {
        alert('Ukuran file terlalu besar! Maksimal 2GB.');
        resetUI();
        return;
    }

    // Tampilkan UI Progress
    uiElements.progressContainer.classList.remove('hidden');
    uiElements.progressBar.style.width = '0%';
    uiElements.actionBtn.disabled = true;
    uiElements.actionBtn.innerText = 'Uploading...';

    // Setup Chunked Upload
    const chunkSize = 50 * 1024 * 1024; // Pecah 50MB per request
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    
    const uniqueUploadId = "toolify_" + Math.random().toString(36).substring(2, 15);
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    function uploadNextChunk() {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('cloud_name', CLOUD_NAME);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        
        xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
        xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${file.size}`);

        xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                const chunkProgress = (event.loaded / event.total) * (100 / totalChunks);
                const totalProgress = Math.round((currentChunk * (100 / totalChunks)) + chunkProgress);
                uiElements.progressBar.style.width = totalProgress + '%';
            }
        };

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                currentChunk++;
                if (currentChunk < totalChunks) {
                    uploadNextChunk(); 
                } else {
                    // Upload Selesai
                    const response = JSON.parse(xhr.responseText);
                    setTimeout(() => {
                        uiElements.progressContainer.classList.add('hidden');
                        uiElements.resultArea.classList.remove('hidden');
                        document.getElementById('result-link').value = response.secure_url; 
                        
                        // Kembalikan tombol ke state awal
                        uiElements.actionBtn.disabled = false;
                        uiElements.actionBtn.innerText = 'Process File';
                    }, 500);
                }
            } else {
                alert('Gagal mengupload file ke server. Status: ' + xhr.status);
                resetUI();
            }
        };

        xhr.onerror = () => {
            alert('Terjadi kesalahan jaringan saat mengupload.');
            resetUI();
        };

        xhr.send(formData);
    }

    // Eksekusi upload
    uploadNextChunk();
}