"use client";

import { useState } from 'react';

export default function AdsXmlPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState('COPY URL VAST');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setGeneratedUrl('');
    setCopyStatus('COPY URL VAST');

    const title = e.target.title.value;
    const description = e.target.description.value;
    const click_link = e.target.click_link.value;
    const videoFile = e.target.video_file.files[0];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      // 1. Upload Video
      const fileName = `${Date.now()}-${videoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/ads_videos/${fileName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': videoFile.type,
        },
        body: videoFile
      });

      if (!uploadRes.ok) {
        const errDetail = await uploadRes.json();
        throw new Error(errDetail.message || 'Gagal upload video ke Storage Supabase. Pastikan kebijakan Storage/SQL sudah dijalankan.');
      }

      // 2. Dapatkan URL
      const videoPublicUrl = `${supabaseUrl}/storage/v1/object/public/ads_videos/${fileName}`;

      // 3. Simpan ke Database
      const dbData = { title, description, click_link, video_url: videoPublicUrl };
      const dbRes = await fetch(`${supabaseUrl}/rest/v1/vast_ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dbData)
      });

      const result = await dbRes.json();
      if (dbRes.ok) {
        // Karena ID-nya sekarang UUID acak, linknya bakal otomatis panjang dan acak
        const fullUrl = `${window.location.origin}/vast?id=${result[0].id}`;
        setGeneratedUrl(fullUrl);
        e.target.reset();
      } else {
        throw new Error(result.message || 'Gagal menyimpan ke tabel vast_ads');
      }

    } catch (error) {
      setErrorMsg('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopyStatus('BERHASIL DI-COPY!');
    setTimeout(() => setCopyStatus('COPY URL VAST'), 3000); // Balik ke teks awal setelah 3 detik
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI, sans-serif', background: '#f4f4f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '30px', border: '1px solid #ddd', borderRadius: '0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>Vidly88 Ad Manager</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Judul Iklan</label>
            <input type="text" name="title" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Deskripsi Singkat</label>
            <textarea name="description" rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none' }}></textarea>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Link Tujuan (ClickThrough)</label>
            <input type="url" name="click_link" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none' }} placeholder="https://google.com" />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Upload File Video (.mp4)</label>
            <input type="file" name="video_file" accept="video/mp4" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none', background: '#fafafa' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '12px', background: '#e63b19', color: '#fff', border: 'none', borderRadius: '0', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {loading ? 'UPLOADING...' : 'UPLOAD & BUAT XML'}
          </button>
        </form>

        {errorMsg && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderLeft: '4px solid #e63b19', color: '#111', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        {generatedUrl && (
          <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', border: '1px dashed #ccc' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>Berhasil! Ini URL VAST Anda:</p>
            <input type="text" readOnly value={generatedUrl} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', marginBottom: '10px', background: '#fff', color: '#555' }} />
            <button onClick={handleCopy} style={{ width: '100%', padding: '10px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              {copyStatus}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
