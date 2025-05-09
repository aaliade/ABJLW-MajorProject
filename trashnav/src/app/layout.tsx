
import './styles/globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/Navbar'
import AuthProvider from './context/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Trash Nav',
  description: 'Optimizing garbage collection routes using user-generated data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <Navbar />
          <main className="flex justify-center items-start p-10 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
