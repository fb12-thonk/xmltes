"use client";

import { useState } from 'react';

export default function AdminAdsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Proses upload video ke Supabase...');

    const title = e.target.title.value;
    const description = e.target.description.value;
    const click_link = e.target.click_link.value;
    const videoFile = e.target.video_file.files[0];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setMessage('Error: Supabase URL atau Key belum disetting di Vercel.');
      setLoading(false);
      return;
    }

    try {
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

      if (!uploadRes.ok) throw new Error('Gagal upload video ke Storage Supabase');

      const videoPublicUrl = `${supabaseUrl}/storage/v1/object/public/ads_videos/${fileName}`;
      setMessage('Video berhasil diupload! Menyimpan data iklan ke database...');

      const dbData = {
        title: title,
        description: description,
        click_link: click_link,
        video_url: videoPublicUrl
      };

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
        setMessage(`Sukses! URL XML VAST lu:\n/vast?id=${result[0].id}`);
        e.target.reset();
      } else {
        throw new Error('Gagal menyimpan ke tabel vast_ads');
      }

    } catch (error) {
      console.error(error);
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '30px', border: '1px solid #ddd', borderRadius: '0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>Vidly88 Ad Manager</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Judul Iklan</label>
            <input type="text" name="title" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none' }} placeholder="Contoh: Promo Spesial" />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Deskripsi Singkat</label>
            <textarea name="description" rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none' }} placeholder="Deskripsi iklan..."></textarea>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Link Tujuan (ClickThrough)</label>
            <input type="url" name="click_link" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none' }} placeholder="https://landingpage-tujuan.com" />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Upload File Video (.mp4)</label>
            <input type="file" name="video_file" accept="video/mp4" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '0', outline: 'none', background: '#fafafa' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '12px', background: '#e63b19', color: '#fff', border: 'none', borderRadius: '0', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {loading ? 'Memproses...' : 'Upload & Buat XML'}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderLeft: '4px solid #e63b19', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
