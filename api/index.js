const cheerio = require('cheerio');
const CryptoJS = require('crypto-js');

// 🛡️ JUBAH PENYAMARAN (Mencegah Error3 dari server target) 🛡️
const headersAjaib = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7",
  "Origin": "https://allinonedownloader.com",
  "Referer": "https://allinonedownloader.com/",
  "Sec-Ch-Ua": `"Not-A.Brand";v="99", "Chromium";v="124"`,
  "Sec-Ch-Ua-Mobile": "?1",
  "Sec-Ch-Ua-Platform": `"Android"`,
  "Dnt": "1"
};

const RcDL = {
  AmbilToken: async function () {
    // Kita pakaikan jubah penyamaran saat ngambil Token
    const req = await fetch("https://allinonedownloader.com/", {
        headers: headersAjaib
    });
    if (!req.ok) return null;

    const res = await req.text();
    const $ = cheerio.load(res);
    const token = $("#token").val();
    const url = $("#scc").val();
    
    // Vercel kadang menggabung cookie pakai koma, kita ambil yang aman aja
    let cookie = req.headers.get('set-cookie') || "";
    if (cookie) cookie = cookie.split(',')[0]; 

    return { token, url, cookie };
  },

  generateHash: function (url, token) {
    const key = CryptoJS.enc.Hex.parse(token);
    const iv = CryptoJS.enc.Hex.parse('afc4e290725a3bf0ac4d3ff826c43c10');
    const encrypted = CryptoJS.AES.encrypt(url, key, {
      iv,
      padding: CryptoJS.pad.ZeroPadding
    });
    return encrypted.toString();
  },

  download: async function (url) {
    const conf = await RcDL.AmbilToken();
    if (!conf) return { error: "Gagal menyusup: Token tidak ditemukan.", result: {} };

    const { token, url: path, cookie } = conf;
    const hash = RcDL.generateHash(url, token);

    const data = new URLSearchParams();
    data.append('url', url);
    data.append('token', token);
    data.append('urlhash', hash);

    // Kita tembak data videonya dengan jubah lengkap + cookie
    const req = await fetch(`https://allinonedownloader.com${path}`, {
      method: "POST",
      headers: {
        ...headersAjaib,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": `crs_RCDL_AIO=blah; ${cookie}`,
        "X-Requested-With": "XMLHttpRequest"
      },
      body: data
    });

    if (!req.ok) return { error: "Terjadi kesalahan koneksi saat memancing data.", result: {} };

    // Kita tangkap sebagai teks dulu biar gak error JSON
    const textRes = await req.text();
    
    // Cek kalau server target masih memblokir (mengeluarkan error3)
    if (textRes === "error3" || textRes.includes("error")) {
        return { error: "Sistem keamanan target memblokir (Muncul error3). Token/Cookie mungkin kadaluarsa.", result: {} };
    }

    let json;
    try {
      json = JSON.parse(textRes);
    } catch (e) {
      return { error: "Data yang didapat bukan JSON: " + textRes.substring(0, 50), result: {} };
    }

    return {
      input_url: url,
      source: json.source,
      result: {
        title: json.title,
        thumbnail: json.thumbnail,
        downloadUrls: json.links
      },
      error: null
    };
  }
};

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      creator: "Yoanz",
      status: false,
      error: "Masukkan parameter URL bos!"
    });
  }

  try {
    const data = await RcDL.download(url);

    if (data.error) {
      return res.status(500).json({ creator: "Yoanz", status: false, error: data.error });
    }

    return res.status(200).json({ creator: "Yoanz", status: true, ...data });

  } catch (err) {
    return res.status(500).json({ creator: "Yoanz", status: false, error: err.message });
  }
};
