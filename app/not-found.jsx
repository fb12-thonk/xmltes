export default function NotFound() {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      margin: 0,
      textAlign: 'center',
      padding: '20px'
    }}>
      {/* Minimalist SVG Icon */}
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e63b19" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" style={{ marginBottom: '20px' }}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>

      <h1 style={{ 
        fontSize: '120px', 
        fontWeight: '900', 
        margin: '0', 
        lineHeight: '1', 
        letterSpacing: '-5px',
        color: '#e63b19'
      }}>404</h1>
      
      <h2 style={{ 
        fontSize: '18px', 
        textTransform: 'uppercase', 
        letterSpacing: '4px', 
        margin: '10px 0 20px 0',
        fontWeight: '400',
        color: '#888'
      }}>Page Not Found</h2>

      <p style={{ 
        maxWidth: '400px', 
        fontSize: '14px', 
        color: '#555', 
        lineHeight: '1.6',
        marginBottom: '40px'
      }}>
        The link you followed may be broken, or the page may have been removed. 
        Please check the URL or return to the homepage.
      </p>

      <a href="/" style={{
        padding: '12px 30px',
        backgroundColor: '#ffffff',
        color: '#000000',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        borderRadius: '0' // Tetap kotak tajam
      }}>
        Back to Home
      </a>
    </div>
  );
}
