import SessionAuthProvider from '@/context/SessionAuthProvider';
import ConditionalLayout from '../components/conditionalLayout';

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>
        <ConditionalLayout>
          <SessionAuthProvider>
          <main>{children}</main>
          </SessionAuthProvider>
        </ConditionalLayout>
          
        </body>
      </html>
    )
  }