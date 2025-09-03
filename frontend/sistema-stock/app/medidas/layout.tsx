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
    >
      <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
        <div className="flex h-screen bg-gray-50 dark:bg-dark-bg">
          {/* Sidebar */}
          <aside className="hidden h-full lg:flex lg:w-[18%] bg-gray-50 dark:bg-dark-bg" />
         

          {/* Contenido principal */}
          <div className="flex flex-col flex-1 w-[100%]">
            <header className="text-white " />
          
      
            <main className="container flex-grow mx-auto ">
              {children}
            </main>
          </div>
        </div>
      </Providers>
    </section>
  );
}
