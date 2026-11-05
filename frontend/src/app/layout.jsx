import "./globals.css";
import { AuthProvider } from './_lib/AuthContext';
import { Inter, Poppins } from "next/font/google";
import "./globals.css"; 

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: 'JobMatch',
  description: 'Vagas, candidaturas e processo seletivo em um só lugar.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
         
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
