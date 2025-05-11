import './styles/globals.css';
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import AuthProvider from './context/AuthProvider';
import { getServerSession } from 'next-auth/next';
import { options } from './api/auth/[...nextauth]/options';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Trash Nav',
  description: 'Optimizing garbage collection routes using user-generated data',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the user session
  const session = await getServerSession(options);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* Pass the user to the Navbar */}
          <Navbar user={session?.user} />
          <main className="flex justify-center items-start p-10 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
