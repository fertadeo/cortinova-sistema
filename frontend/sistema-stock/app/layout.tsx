import ConditionalLayout from '../components/conditionalLayout';
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