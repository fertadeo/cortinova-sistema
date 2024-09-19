export default function ClientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col h-screen md:flex-row">
      {/* Sidebar */}
      <aside className="w-full h-full bg-gray-100 md:w-1/6">
        {/* Contenido del sidebar */}
        {/* Por ejemplo, puedes añadir enlaces o información adicional aquí */}
      </aside>

      {/* Contenido Principal */}
      <main className="container flex-grow mx-auto max-w-7xl">
              {children}
            </main>
    </section>
  );
}
