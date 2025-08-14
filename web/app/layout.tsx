
import './styles/globals.css';
export const metadata = { title: 'WhatsApp Web Clone' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
