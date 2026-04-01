'use client';

import { useState, useEffect } from 'react';

export default function AdsXmlAdmin() {
  const [isLogged, setIsLogged] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [ads, setAds] = useState([]);
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({ title: '', description: '', click_link: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);

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
        headers: { ...getHeaders(), 'Content-Type': videoFile.type },
        body: videoFile
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const videoPublicUrl = `${supabaseUrl}/storage/v1/object/public/ads_videos/${fileName}`;
      const dbRes = await fetch(`${supabaseUrl}/rest/v1/vast_ads`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...formData, video_url: videoPublicUrl })
      });
      if (dbRes.ok) {
        setFormData({ title: '', description: '', click_link: '' });
        setVideoFile(null);
        e.target.reset();
        setPage(0);
        fetchAds(0);
      }
    } catch (error) { console.error(error); }
    finally { setIsSubmitting(false); }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/vast?id=${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (ad) => {
    setDeletingId(ad.id);
    try {
      // 1. Ambil nama file dari URL untuk hapus di Storage
      const fileName = ad.video_url.split('/').pop();
      await fetch(`${supabaseUrl}/storage/v1/object/ads_videos/${fileName}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      // 2. Hapus dari Database
      await fetch(`${supabaseUrl}/rest/v1/vast_ads?id=eq.${ad.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      setAds(ads.filter(item => item.id !== ad.id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const handleLogout = () => { localStorage.removeItem('vidly_admin'); setIsLogged(false); };

  return (
    <>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `
        body { background-color: #f8f9fa; font-family: 'Segoe UI', sans-serif; }
        * { border-radius: 0 !important; }
        .blur-bg { filter: blur(10px); pointer-events: none; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 10000; background: rgba(0,0,0,0.7); }
        .m-box { background: #fff; padding: 30px; width: 90%; max-width: 450px; box-shadow: 0 15px 40px rgba(0,0,0,0.4); border-top: 5px solid #e63b19; }
        .panel { border: 1px solid #ddd; box-shadow: none; margin-bottom: 20px; }
        .panel-heading { background: #111 !important; color: #fff !important; font-weight: bold; text-transform: uppercase; padding: 15px; border: none; }
        .btn-custom { background: #e63b19; color: #fff; font-weight: bold; text-transform: uppercase; border: none; padding: 10px; transition: 0.3s; }
        .btn-custom:hover { background: #b32a10; color: #fff; }
        .table > thead > tr > th { background: #f1f1f1; border-bottom: 2px solid #111; font-size: 11px; color: #333; }
        .t-title { font-weight: bold; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; text-align: left; }
        .btn-action { margin-left: 5px; padding: 5px 10px; font-size: 12px; }
      `}} />

      {!isLogged && (
        <div className="modal-overlay">
          <div className="m-box">
            <h3 className="text-center" style={{marginTop: 0, fontWeight: '900'}}>ADMIN LOGIN</h3>
            <form onSubmit={handleLogin} style={{marginTop: '20px'}}>
              <input type="email" className="form-control" style={{marginBottom: '10px'}} placeholder="Email" onChange={e => setLoginEmail(e.target.value)} required />
              <input type="password" className="form-control" style={{marginBottom: '20px'}} placeholder="Password" onChange={e => setLoginPw(e.target.value)} required />
              <button className="btn btn-custom btn-block">Masuk</button>
            </form>
          </div>
        </div>
      )}

      {previewAd && (
        <div className="modal-overlay">
          <div className="m-box" style={{maxWidth: '600px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
              <h4 style={{margin: 0, fontWeight: 'bold'}}>Preview Video</h4>
              <button onClick={() => setPreviewAd(null)} style={{background:'none', border:'none', fontSize:'20px'}}>&times;</button>
            </div>
            <video src={previewAd.video_url} controls autoPlay style={{width:'100%', background:'#000'}} />
          </div>
        </div>
      )}

      <div className={`container ${(!isLogged || previewAd) ? 'blur-bg' : ''}`} style={{marginTop: '40px'}}>
        <div className="row" style={{marginBottom: '30px'}}>
          <div className="col-xs-8"><h2 style={{margin: 0, fontWeight: '900', letterSpacing: '-1px'}}>VIDLY88 <span style={{color: '#e63b19'}}>ADS</span></h2></div>
          <div className="col-xs-4 text-right"><button className="btn btn-link" style={{color: '#666'}} onClick={handleLogout}>Logout</button></div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="panel">
              <div className="panel-heading">Upload Ads</div>
              <div className="panel-body">
                <form onSubmit={handleCreate}>
                  <div className="form-group"><label>Judul</label><input type="text" className="form-control" onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                  <div className="form-group"><label>Video File</label><input type="file" className="form-control" accept="video/mp4" onChange={e => setVideoFile(e.target.files[0])} required /></div>
                  <div className="form-group"><label>Link Offer</label><input type="url" className="form-control" placeholder="https://..." onChange={e => setFormData({...formData, click_link: e.target.value})} required /></div>
                  <button className="btn btn-custom btn-block" disabled={isSubmitting}>{isSubmitting ? 'Uploading...' : 'Generate Vast'}</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="panel">
              <div className="panel-heading">VAST List</div>
              <div className="table-responsive">
                <table className="table table-hover" style={{marginBottom: 0}}>
                  <thead>
                    <tr>
                      <th style={{textAlign: 'left'}}>Ad Title</th>
                      <th className="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map(ad => (
                      <tr key={ad.id}>
                        <td><span className="t-title">{ad.title}</span></td>
                        <td className="text-center">
                          <button className="btn btn-default btn-action" onClick={() => setPreviewAd(ad)}><span className="material-icons" style={{fontSize: '16px', verticalAlign: 'middle'}}>visibility</span></button>
                          <button className={`btn btn-action ${copiedId === ad.id ? 'btn-success' : 'btn-default'}`} onClick={() => handleCopy(ad.id)}>
                            <span className="material-icons" style={{fontSize: '16px', verticalAlign: 'middle'}}>{copiedId === ad.id ? 'check' : 'content_copy'}</span>
                          </button>
                          <button className="btn btn-danger btn-action" onClick={() => handleDelete(ad)} disabled={deletingId === ad.id}>
                            <span className="material-icons" style={{fontSize: '16px', verticalAlign: 'middle'}}>delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel-footer" style={{background: '#fff', display: 'flex', justifyContent: 'space-between'}}>
                <button className="btn btn-xs btn-default" onClick={handlePrev} disabled={page === 0}>Prev</button>
                <span style={{fontSize: '11px', color: '#999'}}>Page {page + 1}</span>
                <button className="btn btn-xs btn-default" onClick={handleNext} disabled={ads.length < itemsPerPage}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
