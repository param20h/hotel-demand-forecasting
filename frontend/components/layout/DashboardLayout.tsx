
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">

      <Sidebar />

      <div className="min-h-screen lg:pl-[250px]">
        <Header />

        <main className="mx-auto w-full max-w-[1600px] p-5 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
