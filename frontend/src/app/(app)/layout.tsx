export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* You can add shared UI here later, like a sidebar or a different nav */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}