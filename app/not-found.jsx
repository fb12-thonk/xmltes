export default function NotFound() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif', background: '#111', color: '#fff' }}>
      <h1 style={{ fontSize: '72px', margin: '0 0 10px 0', color: '#e63b19' }}>404</h1>
      <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Page Not Found</h2>
      <p style={{ color: '#aaa', marginTop: '20px' }}>The page you are looking for does not exist or has been moved.</p>
      <a href="/" style={{ marginTop: '30px', padding: '10px 20px', background: '#fff', color: '#111', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase' }}>Return Home</a>
    </div>
  );
}
