const express = require('express');
const cheerio = require('cheerio');
const CryptoJS = require('crypto-js');

const app = express();

const RcDL = {
  AmbilToken: async function () {
    const req = await fetch("https://allinonedownloader.com/");
    if (!req.ok) return null;

    const res = await req.text();
    const $ = cheerio.load(res);
    const token = $("#token").val();
    const url = $("#scc").val();
    const cookie = req.headers.get('set-cookie');

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
    if (!conf) return { error: "Gagal mendapatkan token dari web.", result: {} };

    const { token, url: path, cookie } = conf;
    const hash = RcDL.generateHash(url, token);

    const data = new URLSearchParams();
    data.append('url', url);
    data.append('token', token);
    data.append('urlhash', hash);

    const req = await fetch(`https://allinonedownloader.com${path}`, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": `crs_RCDL_AIO=blah; ${cookie}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: data
    });

    if (!req.ok) return { error: "Terjadi kesalahan saat melakukan request", result: {} };

    let json;
    try {
      json = await req.json();
    } catch (e) {
      return { error: e.message, result: {} };
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

// 🔥 PERHATIKAN ALAMATNYA: Menjadi /api/aio agar dikenali Vercel 🔥
app.get('/api/aio', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      creator: "Yoanz (Toolify)",
      status: false,
      error: "Parameter 'url' wajib diisi."
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
});

// 🔥 ATURAN VERCEL: Export module, jangan pakai app.listen() 🔥
module.exports = app;
