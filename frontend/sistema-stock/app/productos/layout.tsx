export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row">
    {/* Sidebar */}
    <aside className="w-[70%] md:w-1/5"/>
   
  

    {/* Contenido principal */}
    <main className="w-[98%] h-[100%] mx-auto">
      {children}
    </main>
  </div>
  );
}
