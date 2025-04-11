import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import Navbar from "../navbar";
// import Footer from "../footer";
import { Toaster } from "sonner";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <Navbar />
          <main className="flex-1 mx-6 my-4 overflow-y-auto">
            <Outlet />
            <Toaster />
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
