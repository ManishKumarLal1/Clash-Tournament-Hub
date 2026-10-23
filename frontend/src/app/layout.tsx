import { satoshi, clashDisplay, jetbrainsMono } from '@/lib/fonts';
import { SmoothScrollProvider } from '@/components/animations/smooth-scroll-provider';
import { NavBar } from '@/components/layout/nav-bar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${satoshi.variable} ${clashDisplay.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[#0A0A0F] text-[#F5F5F7]">
        <SmoothScrollProvider>
          <NavBar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}