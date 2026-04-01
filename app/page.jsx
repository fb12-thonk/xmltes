export default function HomePage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif', background: '#f4f4f9', color: '#111' }}>
      {/* SVG Icon */}
      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#e63b19" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" style={{ marginBottom: '20px' }}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <h1 style={{ letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 10px 0' }}>Coming Soon</h1>
      <p style={{ color: '#555' }}>Vidly88 Ad Network is under construction.</p>
    </div>
  );
}
