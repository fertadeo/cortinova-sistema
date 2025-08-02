import ConditionalLayout from '../components/conditionalLayout';
import TourGuide from '@/components/TourGuide';

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="es">
        <head>
          <link 
            rel="stylesheet" 
            href="https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css"
          />
        </head>
        <body>
        <ConditionalLayout>
          <main>{children}</main>
        </ConditionalLayout>
        {/* <TourGuide /> */}
        </body>
      </html>
    )
  }