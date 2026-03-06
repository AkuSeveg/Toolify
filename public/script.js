const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    
    // Ganti ikon bulan menjadi matahari dan sebaliknya
    const icon = newTheme === 'dark' ? 'moon' : 'sun';
    themeToggle.innerHTML = `<i data-feather="${icon}"></i>`;
    feather.replace(); // Render ulang ikon dari Feather
});

// -- 2. UI STATE MANAGEMENT (Manajemen Tampilan) --
let currentActiveTool = '';

// Kumpulkan semua elemen HTML yang sering dipakai agar kode lebih rapi
const uiElements = {
    toolsGrid: document.getElementById('tools'),
    toolInterface: document.getElementById('tool-interface'),
    toolTitle: document.getElementById('tool-title'),
    dropZone: document.getElementById('drop-zone'),
    dropText: document.getElementById('drop-text'),
    linkInputArea: document.getElementById('link-input-area'),
    urlInput: document.getElementById('url-input'),
    formatSelectionArea: document.getElementById('format-selection-area'),
    targetFormat: document.getElementById('target-format'),
    progressContainer: document.getElementById('progress-container'),
    progressBar: document.getElementById('progress-bar'),
    resultArea: document.getElementById('result-area'),
    resultLink: document.getElementById('result-link'),
    fileInput: document.getElementById('file-input'),
    actionBtn: document.getElementById('action-btn')
};

// Fungsi membuka Tool
function openTool(toolType) {
    currentActiveTool = toolType;
    uiElements.toolsGrid.classList.add('hidden');
    uiElements.toolInterface.classList.remove('hidden');
    
    // Reset kondisi UI setiap kali membuka tool baru
    resetUI();
    uiElements.dropZone.classList.add('hidden');
    uiElements.linkInputArea.classList.add('hidden');
    uiElements.formatSelectionArea.classList.add('hidden');

    // Tampilkan elemen input sesuai Tool yang dipilih
    if (toolType === 'downloader') {
        uiElements.toolTitle.innerText = 'Video Downloader';
        uiElements.linkInputArea.classList.remove('hidden');
        uiElements.actionBtn.innerText = 'Download';
    } else {
        uiElements.dropZone.classList.remove('hidden');
        
        if (toolType === 'converter') {
            uiElements.toolTitle.innerText = 'File Converter';
            uiElements.formatSelectionArea.classList.remove('hidden'); // Munculkan Dropdown Format
            uiElements.actionBtn.innerText = 'Convert File';
        } else if (toolType === 'imageLink') {
            uiElements.toolTitle.innerText = 'Image to Link';
            uiElements.actionBtn.innerText = 'Upload Image';
        } else if (toolType === 'videoLink') {
            uiElements.toolTitle.innerText = 'Video to Link';
            uiElements.actionBtn.innerText = 'Upload Video';
        }
    }
}

// Fungsi menutup Tool dan kembali ke menu utama
function closeTool() {
    uiElements.toolInterface.classList.add('hidden');
    uiElements.toolsGrid.classList.remove('hidden');
    currentActiveTool = '';
}

// Fungsi membersihkan sisa inputan sebelumnya
function resetUI() {
    uiElements.progressContainer.classList.add('hidden');
    uiElements.resultArea.classList.add('hidden');
    uiElements.progressBar.style.width = '0%';
    uiElements.urlInput.value = '';
    uiElements.fileInput.value = '';
    uiElements.dropText.innerText = 'Drag & Drop file ke sini atau klik';
    uiElements.actionBtn.disabled = false;
}

// -- 3. INTERAKSI INPUT & EKSEKUSI --

// Buka jendela pemilihan file saat area drag & drop diklik
uiElements.dropZone.addEventListener('click', () => uiElements.fileInput.click());

// Ubah teks saat pengguna selesai memilih file
uiElements.fileInput.addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        uiElements.dropText.innerText = `Terpilih: ${e.target.files[0].name}`;
    }
});

// Tombol Copy Link ke Clipboard
document.getElementById('copy-btn').addEventListener('click', () => {
    uiElements.resultLink.select();
    document.execCommand('copy');
    alert('Link berhasil disalin ke clipboard!');
});

// Routing Tombol Action Utama (Jantung Eksekusi)
uiElements.actionBtn.addEventListener('click', () => {
    if (currentActiveTool === 'downloader') {
        const urlValue = uiElements.urlInput.value;
        // Panggil fungsi dari tools/downloader.js
        if (typeof handleDownloadRequest === 'function') handleDownloadRequest(urlValue);
    } 
    else if (currentActiveTool === 'converter') {
        const file = uiElements.fileInput.files[0];
        const format = uiElements.targetFormat.value;
        // Panggil fungsi dari tools/convert.js
        if (typeof processConversion === 'function') processConversion(file, format);
    } 
    else {
        const file = uiElements.fileInput.files[0];
        // Panggil fungsi dari tools/uploaderManager.js
        if (typeof uploadFileRealtime === 'function') uploadFileRealtime(file);
    }
});