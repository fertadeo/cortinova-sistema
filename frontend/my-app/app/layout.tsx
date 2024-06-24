/* eslint-disable prettier/prettier */
export default function BlogLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html>
        <body>
        <section className="flex flex-col items-center justify-center">
        <div className="inline-block max-w-lg text-center justify-center">
          {children}
        </div>
      </section>
        </body>
      </html>
  
    );
  }