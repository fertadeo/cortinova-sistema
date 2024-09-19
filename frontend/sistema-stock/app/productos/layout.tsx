export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container flex-grow mx-auto max-w-7xl">
              {children}
    </main>
  );
}
