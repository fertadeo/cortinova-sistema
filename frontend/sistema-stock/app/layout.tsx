import ConditionalLayout from '../components/conditionalLayout';
import { lightLayout } from '@nextui-org/react';
export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="es">
        <body>
        <ConditionalLayout>
          <main>{children}</main>
        </ConditionalLayout>
      
          
        </body>
      </html>
    )
  }