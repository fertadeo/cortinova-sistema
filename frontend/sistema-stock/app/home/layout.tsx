import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "../providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      className={clsx("bg-background font-sans antialiased", fontSans.variable)}
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        {/* Estructura flexbox para el layout principal */}
        <div className="flex h-screen ">
          {/* Sidebar */}
          <aside className="hidden h-full lg:flex lg:w-64">
            {/* Aquí iría el contenido de la barra lateral */}
            <nav className="mt-10 text-white">
            
            </nav>
          </aside>

          {/* Contenido principal */}
          <div className="flex flex-col flex-1">
            <header className="p-4 text-white">
          
            </header>
            <main className="container flex-grow p-4 mx-auto max-w-7xl">
              {children}
            </main>
          </div>
        </div>
      </Providers>
    </section>
  );
}
