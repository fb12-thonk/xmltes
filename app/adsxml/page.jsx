'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdsXmlAdmin() {
  // State Login & UI
  const [isLogged, setIsLogged] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState(false);

  // State Data VAST
  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(0);
  const itemsPerPage = 5; // Batas tabel per halaman

  // State Form Input
  const [formData, setFormData] = useState({ title: '', description: '', video_url: '', click_link: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Animasi Tombol Copy
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    // Cek session biar gak login terus pas refresh
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
    const from = pageNum * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data } = await supabase
      .from('vast_ads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) setAds(data);
  };

  const handleNext = () => { setPage(page + 1); fetchAds(page + 1); };
  const handlePrev = () => { if (page > 0) { setPage(page - 1); fetchAds(page - 1); } };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await supabase.from('vast_ads').insert([formData]).select();
    setIsSubmitting(false);
    
    if (!error && data) {
      setFormData({ title: '', description: '', video_url: '', click_link: '' });
      setPage(0); // Reset ke halaman 1
      fetchAds(0);
    }
  };

  const handleCopy = (id) => {
    const url = `${window.location.origin}/vast?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Balik ke ikon copy setelah 2 detik (tanpa alert)
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await supabase.from('vast_ads').delete().eq('id', id);
    setAds(ads.filter(ad => ad.id !== id)); // Hapus dari UI langsung (tanpa alert)
    setDeletingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('vidly_admin');
    setIsLogged(false);
  };

  return (
    <>
      {/* Load Bootstrap 3 & Google Material Icons */}
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

      {/* CUSTOM CSS: Tajam (No Border Radius), Minimalis, dan Efek Blur */}
      <style dangerouslySetInnerHTML={{__html: `
        body { background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        
        /* PAKSA SEMUA SUDUT TAJAM! */
        * { border-radius: 0 !important; }
        
        /* Efek Blur untuk Background pas Popup Login muncul */
        .blur-background { filter: blur(8px); pointer-events: none; user-select: none; }
        
        /* Desain Popup Login */
        .login-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 9999; background: rgba(0,0,0,0.6); }
        .login-box { background: #fff; padding: 30px; width: 350px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border-top: 4px solid #e63b19; }
        
        /* Kustomisasi Panel & Form */
        .panel { border: none; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .panel-heading { background-color: #111 !important; color: #fff !important; border: none; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
        .form-control:focus { border-color: #e63b19; box-shadow: none; }
        .btn-custom { background-color: #e63b19; color: white; border: none; transition: 0.2s; }
        .btn-custom:hover { background-color: #cc3316; color: white; }
        
        /* Desain Tabel */
        .table > thead > tr > th { border-bottom: 2px solid #111; text-transform: uppercase; font-size: 12px; color: #555; }
        .table > tbody > tr > td { vertical-align: middle; font-size: 13px; }
        .video-url-col { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        /* Tombol Aksi Tabel */
        .btn-action { padding: 4px 8px; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; margin-right: 4px; }
        .btn-action .material-icons { font-size: 16px; }
      `}} />

      {/* POPUP LOGIN */}
      {!isLogged && (
        <div className="login-overlay">
          <div className="login-box">
            <h4 className="text-center" style={{ marginBottom: '20px', fontWeight: 'bold' }}>VIDLY88 ADMIN</h4>
            {loginError && <p className="text-danger text-center" style={{ fontSize: '12px' }}>Email/Password salah!</p>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input type="email" className="form-control" placeholder="Email Vercel" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="password" className="form-control" placeholder="Password Vercel" value={loginPw} onChange={e => setLoginPw(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-custom btn-block">LOGIN</button>
            </form>
          </div>
        </div>
      )}

      {/* CONTAINER UTAMA (Kena blur kalau belum login) */}
      <div className={`container ${!isLogged ? 'blur-background' : ''}`} style={{ marginTop: '30px', marginBottom: '50px' }}>
        
        {/* Header */}
        <div className="row" style={{ marginBottom: '20px' }}>
          <div className="col-xs-6">
            <h3 style={{ margin: 0, fontWeight: 'bold' }}><span className="material-icons" style={{ verticalAlign: 'bottom', color: '#e63b19' }}>smart_display</span> VAST GENERATOR</h3>
          </div>
          <div className="col-xs-6 text-right">
            <button className="btn btn-default btn-sm" onClick={handleLogout}><span className="material-icons" style={{ fontSize: '14px', verticalAlign: 'text-top' }}>logout</span> Keluar</button>
          </div>
        </div>

        <div className="row">
          
          {/* KOLOM KIRI: FORM BIKIN XML */}
          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">Buat XML Baru</div>
              <div className="panel-body">
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label>Judul Iklan</label>
                    <input type="text" className="form-control input-sm" placeholder="Contoh: Iklan Slot" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Deskripsi (Opsional)</label>
                    <input type="text" className="form-control input-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>URL Video (.mp4)</label>
                    <input type="url" className="form-control input-sm" placeholder="Link dari Storage" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Link Offer (Tujuan Klik)</label>
                    <input type="url" className="form-control input-sm" placeholder="Link Afiliasi lu" value={formData.click_link} onChange={e => setFormData({...formData, click_link: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-custom btn-block" disabled={isSubmitting}>
                    {isSubmitting ? 'MENYIMPAN...' : 'GENERATE VAST'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: TABEL DAFTAR XML */}
          <div className="col-md-8">
            <div className="panel panel-default">
              <div className="panel-heading">Daftar VAST URL</div>
              
              {/* Table Responsive untuk geser kiri-kanan di HP */}
              <div className="table-responsive">
                <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Video File</th>
                      <th className="text-right" style={{ width: '120px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-muted" style={{ padding: '20px' }}>Belum ada data iklan.</td></tr>
                    ) : (
                      ads.map((ad) => (
                        <tr key={ad.id}>
                          <td><strong>{ad.title}</strong></td>
                          <td className="video-url-col text-muted" title={ad.video_url}>{ad.video_url}</td>
                          <td className="text-right">
                            
                            {/* Tombol Copy: Berubah ikon jadi check tanpa alert */}
                            <button className={`btn btn-sm btn-action ${copiedId === ad.id ? 'btn-success' : 'btn-default'}`} onClick={() => handleCopy(ad.id)} title="Copy VAST URL">
                              <span className="material-icons">{copiedId === ad.id ? 'check' : 'content_copy'}</span>
                            </button>
                            
                            {/* Tombol Delete: Animasi loading tanpa alert */}
                            <button className="btn btn-danger btn-sm btn-action" onClick={() => handleDelete(ad.id)} disabled={deletingId === ad.id} title="Hapus">
                              <span className="material-icons">{deletingId === ad.id ? 'hourglass_empty' : 'delete'}</span>
                            </button>

                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Next / Prev */}
              <div className="panel-footer" style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
