// components/LayoutNoSidebar.tsx

const LayoutNoSidebar = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <main className="w-full max-w-lg p-6 ">
          {children}
        </main>
      </div>
    );
  };
  
  export default LayoutNoSidebar;
  