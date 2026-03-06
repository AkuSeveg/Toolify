function processConversion(file, targetFormat) {
    if (!file) {
        alert('Pilih file terlebih dahulu!');
        return;
    }

    // Tampilkan UI Progress
    uiElements.progressContainer.classList.remove('hidden');
    uiElements.progressBar.style.width = '0%';
    uiElements.actionBtn.disabled = true;
    uiElements.actionBtn.innerText = 'Converting...';

    const chunkSize = 50 * 1024 * 1024; // 50MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    
    const uniqueUploadId = "toolify_conv_" + Math.random().toString(36).substring(2, 15);
    // Kita gunakan resource_type "auto" agar bisa menerima gambar, video, atau PDF
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    function uploadAndConvertChunk() {
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

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const chunkProgress = (event.loaded / event.total) * (100 / totalChunks);
                const totalProgress = Math.round((currentChunk * (100 / totalChunks)) + chunkProgress);
                uiElements.progressBar.style.width = totalProgress + '%';
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                currentChunk++;
                if (currentChunk < totalChunks) {
                    uploadAndConvertChunk(); 
                } else {
                    // Upload Selesai - Waktunya Cloudinary Magic!
                    const response = JSON.parse(xhr.responseText);
                    const originalUrl = response.secure_url;
                    
                    // Pisahkan URL berdasarkan titik (.)
                    const urlParts = originalUrl.split('.');
                    // Ganti ekstensi asli dengan target format (misal: mp4 diganti jadi mp3)
                    urlParts[urlParts.length - 1] = targetFormat;
                    // Gabungkan kembali menjadi URL yang sudah dikonversi
                    const convertedUrl = urlParts.join('.');

                    setTimeout(() => {
                        uiElements.progressContainer.classList.add('hidden');
                        uiElements.resultArea.classList.remove('hidden');
                        
                        document.getElementById('result-link').value = convertedUrl; 
                        
                        uiElements.actionBtn.disabled = false;
                        uiElements.actionBtn.innerText = 'Process File';
                    }, 500);
                }
            } else {
                alert('Konversi gagal. Status: ' + xhr.status);
                resetUI();
            }
        };

        xhr.send(formData);
    }

    uploadAndConvertChunk();
}