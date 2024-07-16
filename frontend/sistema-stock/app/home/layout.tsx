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
        className={clsx(
          " bg-background font-sans antialiased",
          fontSans.variable,
        )}
        style={{backgroundColor:'#F5F5F5'}}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-48">
            <main className="container mx-auto max-w-7xl flex-grow">
              {children}
            </main>
            
          </div>
        </Providers>
      </section>

  );
}
