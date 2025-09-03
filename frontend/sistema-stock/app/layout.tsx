import ConditionalLayout from '../components/conditionalLayout';
import { Providers } from './providers';
import { AvatarProvider } from '@/contexts/AvatarContext';
import NotificationProvider from '@/components/NotificationProvider';

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {  
    return (
      <html lang="es" suppressHydrationWarning>
        <head>
         
        </head>
        <body>
          <Providers
            themeProps={{
              attribute: "class",
              defaultTheme: "light",
              enableSystem: true,
              disableTransitionOnChange: false,
            }}
          >
            <AvatarProvider>
              <NotificationProvider>
                <ConditionalLayout>
                  <main>{children}</main>
                </ConditionalLayout>
              </NotificationProvider>
            </AvatarProvider>
          </Providers>
        </body>
      </html>
    )
  }