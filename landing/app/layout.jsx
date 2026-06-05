import './globals.css';
import { Footer, Header } from './components/SiteChrome.jsx';
import { buildPageMetadata, siteConfig } from './lib/site.js';

export const metadata = {
  ...buildPageMetadata({
    title: 'Attendo | Attendance, HR and Payroll Management Software',
    description: siteConfig.description
  }),
  icons: {
    icon: siteConfig.icon,
    apple: siteConfig.icon
  },
  metadataBase: new URL(siteConfig.url)
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
