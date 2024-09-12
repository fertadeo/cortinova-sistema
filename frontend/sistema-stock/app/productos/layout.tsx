export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-end justify-center py-8 md:py-10" >
      <div className="flex justify-end text-center w-96 " style={{maxWidth:'85%', width:'90%'}} >
        {children}
      </div>
    </section>
  );
}
