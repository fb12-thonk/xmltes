'use client';

import { useState, useEffect } from 'react';

export default function AdsXmlAdmin() {
  // State Login
  const [isLogged, setIsLogged] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState(false);

  // State Data & Pagination
  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  // State Form Input
  const [formData, setFormData] = useState({ title: '', description: '', click_link: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Aksi Tabel
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // State Preview Video (Pop-up Modal)
  const [previewAd, setPreviewAd] = useState(null);

  // Kredensial Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const getHeaders = () => ({
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  });

  useEffect(() => {
    if (localStorage.getItem('vidly_admin') === 'true') {
      setIsLogged(true);
      fetchAds(0);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth-admin', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail, password: loginPw })
    });
    
    if (res.ok) {
      localStorage.setItem('vidly_admin', 'true');
      setIsLogged(true);
      fetchAds(0);
    } else {
      setLoginError(true);
    }
  };

  const fetchAds = async (pageNum) => {
    const offset = pageNum * itemsPerPage;
    const url = `${supabaseUrl}/rest/v1/vast_ads?select=*&order=created_at.desc&limit=${itemsPerPage}&offset=${offset}`;
    
    const res = await fetch(url, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setAds(data);
    }
  };

  const handleNext = () => { setPage(page + 1); fetchAds(page + 1); };
  const handlePrev = () => { if (page > 0) { setPage(page - 1); fetchAds(page - 1); } };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!videoFile) return;
    setIsSubmitting(true);
    
    try {
      const fileName = `${Date.now()}-${videoFile.name.replace(/\s+/g, '_')}`;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/ads_videos/${fileName}`;
      
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': videoFile.type, 'X-Upsert': 'false' },
        body: videoFile
      });

      if (!uploadRes.ok) throw new Error('Gagal upload.');

      const videoPublicUrl = `${supabaseUrl}/storage/v1/object/public/ads_videos/${fileName}`;

      const dbBody = { ...formData, video_url: videoPublicUrl };
      const dbRes = await fetch(`${supabaseUrl}/rest/v1/vast_ads`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(dbBody)
      });

      if (dbRes.ok) {
        setFormData({ title: '', description: '', click_link: '' });
        setVideoFile(null); 
        e.target.reset();
        setPage(0);
        fetchAds(0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (id) => {
    const url = `${window.location.origin}/vast?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await fetch(`${supabaseUrl}/rest/v1/vast_ads?id=eq.${id}`, { method: 'DELETE', headers: getHeaders() });
    setAds(ads.filter(ad => ad.id !== id));
    setDeletingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('vidly_admin');
    setIsLogged(false);
  };

  return (
    <>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{__html: `
        body { background-color: #f4f6f9; font-family: 'Segoe UI', sans-serif; }
        * { border-radius: 0 !important; } 
        
        .blur-background { filter: blur(8px); pointer-events: none; }
        .overlay-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 9999; background: rgba(0,0,0,0.6); }
        .modal-box { background: #fff; padding: 25px; width: 90%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border-top: 4px solid #e63b19; }
        
        .panel { border: none; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .panel-heading { background-color: #111 !important; color: #fff !important; font-weight: bold; text-transform: uppercase; padding: 12px 15px; }
        
        .form-control { height: 35px; font-size: 13px; }
        .form-control:focus { border-color: #e63b19; box-shadow: none; }
        .btn-custom { background-color: #e63b19; color: white; border: none; font-weight: bold; text-transform: uppercase; transition: 0.2s; }
        .btn-custom:hover { background-color: #cc3316; color: white; }
        
        .table > thead > tr > th { border-bottom: 2px solid #111; text-transform: uppercase; font-size: 12px; color: #555; padding: 10px; text-align: center; }
        .table > tbody > tr > td { vertical-align: middle; font-size: 13px; padding: 8px 10px; text-align: center; }
        
        .title-col { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; color: #111; text-align: left; }
        
        .btn-action { padding: 4px 10px; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; margin: 0 2px; }
        .btn-action .material-icons { font-size: 16px; margin-right: 3px; }
        .btn-preview { color: #e63b19; background-color: #f9f9f9; border: 1px solid #ddd; }
        .btn-preview:hover { background-color: #eee; }
      `}} />

      {/* POPUP LOGIN */}
      {!isLogged && (
        <div className="overlay-modal">
          <div className="modal-box" style={{ maxWidth: '350px' }}>
            <h4 className="text-center" style={{ marginBottom: '20px', fontWeight: 'bold' }}>VIDLY88 ADMIN</h4>
            {loginError && <p className="text-danger text-center" style={{ fontSize: '12px' }}>Email/Password salah!</p>}
            <form onSubmit={handleLogin}>
              <div className="form-group"><input type="email" className="form-control" placeholder="Email Vercel" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required /></div>
              <div className="form-group"><input type="password" className="form-control" placeholder="Password Vercel" value={loginPw} onChange={e => setLoginPw(e.target.value)} required /></div>
              <button type="submit" className="btn btn-custom btn-block">LOGIN</button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP PREVIEW VIDEO */}
      {previewAd && (
        <div className="overlay-modal">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontWeight: 'bold' }}>Pratinjau Video</h4>
              <button onClick={() => setPreviewAd(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            
            <video src={previewAd.video_url} controls autoPlay style={{ width: '100%', backgroundColor: '#000', maxHeight: '300px' }}></video>
            
            <div style={{ marginTop: '15px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>Judul: {previewAd.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>Video siap diputar.</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTAINER UTAMA (Blur kalau belum login ATAU pas preview kebuka) */}
      <div className={`container ${(!isLogged || previewAd) ? 'blur-background' : ''}`} style={{ marginTop: '30px', marginBottom: '50px' }}>
        <div className="row" style={{ marginBottom: '20px' }}>
          <div className="col-xs-7">
            <h3 style={{ margin: 0, fontWeight: 'bold', color: '#111' }}><span className="material-icons" style={{ verticalAlign: 'bottom', color: '#e63b19', marginRight: '5px' }}>smart_display</span> VAST GENERATOR</h3>
          </div>
          <div className="col-xs-5 text-right">
            <button className="btn btn-default btn-sm" onClick={handleLogout}><span className="material-icons" style={{ fontSize: '14px', verticalAlign: 'text-top' }}>logout</span> Keluar</button>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">Buat XML Baru</div>
              <div className="panel-body">
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: '#555' }}>Judul Iklan</label>
                    <input type="text" className="form-control" placeholder="Contoh: Promo Slot Gacor" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: '#555' }}>Deskripsi (Opsional)</label>
                    <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: '#555' }}>Browse File Video (.mp4)</label>
                    <input type="file" className="form-control" accept="video/mp4" style={{ padding: '5px' }} onChange={e => setVideoFile(e.target.files[0])} required />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: '#555' }}>Link Offer (Tujuan Klik)</label>
                    <input type="url" className="form-control" placeholder="https://link-afiliasi.com" value={formData.click_link} onChange={e => setFormData({...formData, click_link: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-custom btn-block" disabled={isSubmitting}>
                    {isSubmitting ? 'MENGUPLOAD...' : 'GENERATE VAST XML'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="panel panel-default">
              <div className="panel-heading">Daftar VAST URL</div>
              <div className="table-responsive">
                <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Title</th>
                      <th>Preview</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-muted" style={{ padding: '30px' }}>Belum ada iklan.</td></tr>
                    ) : (
                      ads.map((ad) => (
                        <tr key={ad.id}>
                          <td><div className="title-col" title={ad.title}>{ad.title}</div></td>
                          
                          {/* TOMBOL PREVIEW BARU */}
                          <td>
                            <button className="btn btn-sm btn-preview btn-action" onClick={() => setPreviewAd(ad)}>
                              <span className="material-icons">visibility</span> Preview
                            </button>
                          </td>
                          
                          <td>
                            <button className={`btn btn-sm btn-action ${copiedId === ad.id ? 'btn-success' : 'btn-default'}`} onClick={() => handleCopy(ad.id)} title="Copy URL">
                              <span className="material-icons">{copiedId === ad.id ? 'check' : 'content_copy'}</span> {copiedId === ad.id ? 'Copied' : 'Copy'}
                            </button>
                            <button className="btn btn-danger btn-sm btn-action" onClick={() => handleDelete(ad.id)} disabled={deletingId === ad.id} title="Hapus">
                              <span className="material-icons">{deletingId === ad.id ? 'hourglass_empty' : 'delete'}</span> Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="panel-footer" style={{ background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-muted" style={{ fontSize: '12px' }}>Halaman {page + 1}</span>
                <div>
                  <button className="btn btn-default btn-sm" onClick={handlePrev} disabled={page === 0} style={{ marginRight: '5px' }}>&laquo; Prev</button>
                  <button className="btn btn-default btn-sm" onClick={handleNext} disabled={ads.length < itemsPerPage}>Next &raquo;</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
