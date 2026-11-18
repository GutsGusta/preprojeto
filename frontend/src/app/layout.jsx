import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import { AuthProvider } from "./_lib/AuthContext";
import Cabecalho from "./_components/Cabecalho";

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
  title: "JobMatch",
  description: "Vagas, candidaturas e processo seletivo em um só lugar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <AuthProvider>
          <Cabecalho />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
