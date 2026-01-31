import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger ,
} from "../components/ui/sidebar";
import TopNav from "../ui/TopNav";
import BreadcrumbComponent from "../ui/Breadcrumb";
import SideBar from "../ui/AppSidebar";

interface LayoutProps {
  children: ReactNode;
}
function Layout({ children }: LayoutProps) {

  // URL Logic
  const location = useLocation();
  const locationItems = location.pathname.split("/");
  const url = locationItems[1];

  // BreadCrumb
  const breadCrumbLinks : string[] = locationItems.filter(i => i).map(i => {
    return i.charAt(0).toUpperCase() + i.slice(1)
  })

  return (
    <>
      <div className="w-full">
        <SidebarProvider>
          <SideBar url={url} />
          <SidebarInset className="min-h-screen p-2">
            <div className="min-h-screen  rounded-lg bg-white shadow-md border">
              <TopNav Trigger={SidebarTrigger} />
              <div className="min-h-screen p-(--content-padding)  bg-(--secondary-background) rounded-md ">
                {/* BreadCrumb Wrapper */}
            <div className="">
              <BreadcrumbComponent links={breadCrumbLinks}/> 
            </div>
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </>
  );
}

export default Layout;
