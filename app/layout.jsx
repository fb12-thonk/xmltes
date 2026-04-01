export const metadata = {
  title: 'Vidly88 Ad Manager',
  description: 'Sistem manajemen iklan VAST XML Vidly88',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f4f4f9' }}>
        {children}
      </body>
    </html>
  );
}
