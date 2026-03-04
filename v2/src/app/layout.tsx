import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'CryptoMarket — Anonymes Crypto-Shopping',
  description: 'Verschlüsselt. Anonym. Sicher. Bezahle mit Bitcoin, Monero & mehr.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen antialiased" style={{ background: '#060714', color: '#c8d5e8' }}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f1228',
              color: '#c8d5e8',
              border: '1px solid #1c2040',
              borderRadius: '8px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00d4ff', secondary: '#020712' } },
            error: { iconTheme: { primary: '#f43f8a', secondary: '#020712' } },
          }}
        />
      </body>
    </html>
  )
}
