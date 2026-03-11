// ==========================================
// SUTRADARA UI TOOLIFY - Coded by Yoanz
// ==========================================

// Fungsi untuk membuka Tool yang dipilih
function openTool(toolId) {
    // 1. Sembunyikan Grid Menu & About
    document.getElementById('tools').classList.add('hidden');
    document.getElementById('about').classList.add('hidden');
    
    // 2. Tampilkan Layar Interface Tool
    document.getElementById('tool-interface').classList.remove('hidden');

    // Tangkap semua elemen area
    const linkArea = document.getElementById('link-input-area');
    const dropZone = document.getElementById('drop-zone');
    const formatArea = document.getElementById('format-selection-area');
    const btnProcess = document.getElementById('action-btn');
    const resultArea = document.getElementById('result-area');
    const progressContainer = document.getElementById('progress-container');

    // 3. Reset (Sembunyikan semua area dulu)
    linkArea.classList.add('hidden');
    dropZone.classList.add('hidden');
    formatArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    progressContainer.classList.add('hidden');

    // 4. Munculkan area yang sesuai dengan tool yang diklik
    if (toolId === 'downloader') {
        // Mode AIO Downloader: Butuh kotak Link
        linkArea.classList.remove('hidden');
        btnProcess.textContent = 'DOWNLOAD VIDEO';
    } 
    else if (toolId === 'converter') {
        // Mode Converter: Butuh area Upload & Pilihan Format
        dropZone.classList.remove('hidden');
        formatArea.classList.remove('hidden');
        btnProcess.textContent = 'CONVERT FILE';
        document.getElementById('tool-title').innerText = 'File Converter';
    } 
    else if (toolId === 'imageLink') {
        // Mode Image to Link: Butuh area Upload saja
        dropZone.classList.remove('hidden');
        btnProcess.textContent = 'UPLOAD IMAGE';
        document.getElementById('tool-title').innerText = 'Image to Link';
    } 
    else if (toolId === 'videoLink') {
        // Mode Video to Link: Butuh area Upload saja
        dropZone.classList.remove('hidden');
        btnProcess.textContent = 'UPLOAD VIDEO';
        document.getElementById('tool-title').innerText = 'Video to Link';
    }
}

// Fungsi untuk tombol "Kembali" (Arrow Left)
function closeTool() {
    // 1. Sembunyikan Layar Interface Tool
    document.getElementById('tool-interface').classList.add('hidden');
    
    // 2. Tampilkan kembali Grid Menu & About
    document.getElementById('tools').classList.remove('hidden');
    document.getElementById('about').classList.remove('hidden');
    
    // 3. Bersihkan sisa-sisa inputan user biar rapi
    document.getElementById('url-input').value = '';
    document.getElementById('result-link').value = '';
    
    // Reset progress bar kalau masih nyangkut
    const progressBar = document.getElementById('progress-bar');
    if(progressBar) progressBar.style.width = '0%';
}

// Interaksi Tema (Karena kita fokus Neumorphism Dark Mode Premium, tombol bulan kita kasih alert elegan)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        alert('Tampilan Dark Mode Neumorphism adalah tema bawaan (default) Toolify untuk estetika tertinggi! 🕶️✨');
    });
}
