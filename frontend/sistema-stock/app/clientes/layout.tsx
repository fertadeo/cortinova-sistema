export default function ClientesLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="w-9/12 h-full text-center justify-center">
          {children}
        </div>
      </section>
    );
  }
  