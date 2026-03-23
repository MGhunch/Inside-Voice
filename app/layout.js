import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Inside Voice Admin',
  description: 'Contractor management platform',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
