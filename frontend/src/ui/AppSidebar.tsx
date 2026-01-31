import React from "react";
import { useLocation } from "react-router-dom";

//*Image Imports
import Firebase from "../assets/logo/logo.png";

//* Component Imports
import {
  LayoutDashboard,
  Calendar,
  Plug,
  Shield,
  Building,
  FileSpreadsheet,
  BarChart2,
  FileBarChart,
  PhoneCall,
  UserCheck,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Target,
  Percent,
  Receipt,
  CreditCard,
  PieChart,
  Plane,
  ClipboardList,
  Clock,
  CalendarCheck,
  FileText,
  UserPlus,
  Users,
  BarChart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../components/ui/sidebar";
import { ScrollArea } from "../components/ui/scroll-area";

interface AppSidebarLinks {
  title: string;
  url: string;
  icon?: any;
  links?: AppSidebarLinks[];
}

function AppSidebar({url} : {url:string}) {
  const items: AppSidebarLinks[] = [
    {
      title: "Dashboard",
      url: "home",
      links: [
        {
          title: "Overview",
          url: "home",
          icon: LayoutDashboard,
        },
        {
          title: "Analytics",
          url: "dashboard/analytics",
          icon: BarChart,
        },
      ],
    },
    {
      title: "Employee Management",
      url: "employees",
      links: [
        {
          title: "Employee Directory",
          url: "employees/list",
          icon: Users,
        },
        {
          title: "Add Employee",
          url: "employees/add",
          icon: UserPlus,
        },
        {
          title: "Documents",
          url: "employees/documents",
          icon: FileText,
        },
      ],
    },
    {
      title: "Attendance & Time",
      url: "attendance",
      links: [
        {
          title: "Attendance",
          url: "attendance/records",
          icon: CalendarCheck,
        },
        {
          title: "Shifts",
          url: "attendance/shifts",
          icon: Clock,
        },
        {
          title: "Timesheets",
          url: "attendance/timesheets",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Leave Management",
      url: "leaves",
      links: [
        {
          title: "Leave Requests",
          url: "leaves/requests",
          icon: Plane,
        },
        {
          title: "Leave Balance",
          url: "leaves/balance",
          icon: PieChart,
        },
        {
          title: "Holiday Calendar",
          url: "leaves/holidays",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Payroll",
      url: "payroll",
      links: [
        {
          title: "Payroll Processing",
          url: "payroll/process",
          icon: CreditCard,
        },
        {
          title: "Payslips",
          url: "payroll/payslips",
          icon: Receipt,
        },
        {
          title: "Tax & Deductions",
          url: "payroll/taxes",
          icon: Percent,
        },
      ],
    },
    {
      title: "Performance",
      url: "performance",
      links: [
        {
          title: "Goals & OKRs",
          url: "performance/goals",
          icon: Target,
        },
        {
          title: "Appraisals",
          url: "performance/appraisals",
          icon: TrendingUp,
        },
        {
          title: "Feedback",
          url: "performance/feedback",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "Recruitment",
      url: "recruitment",
      links: [
        {
          title: "Job Openings",
          url: "recruitment/jobs",
          icon: Briefcase,
        },
        {
          title: "Candidates",
          url: "recruitment/candidates",
          icon: UserCheck,
        },
        {
          title: "Interviews",
          url: "recruitment/interviews",
          icon: PhoneCall,
        },
      ],
    },
    {
      title: "Reports",
      url: "reports",
      links: [
        {
          title: "HR Reports",
          url: "reports/hr",
          icon: FileBarChart,
        },
        {
          title: "Attendance Reports",
          url: "reports/attendance",
          icon: BarChart2,
        },
        {
          title: "Payroll Reports",
          url: "reports/payroll",
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      title: "Settings",
      url: "settings",
      links: [
        {
          title: "Organization",
          url: "settings/organization",
          icon: Building,
        },
        {
          title: "Roles & Permissions",
          url: "settings/roles",
          icon: Shield,
        },
        {
          title: "Integrations",
          url: "settings/integrations",
          icon: Plug,
        },
      ],
    },
  ];



  return (
    <>
      <Sidebar className="border-none" collapsible="icon">
        <SidebarHeader className="">
          <div className=" h-(--header-height)  rounded-(--radius) flex p-1 group-data-[collapsible=icon]:p-0  items-center  gap-2  ">
            <div className="">
              <img src={Firebase} alt="Firebase" className="w-[30px] " />
            </div>

            <div  className=" group-data-[collapsible=icon]:hidden transition-all duration-300 ease-in-out">
              <span className="font-semibold text-base text-(--sidebar-ring)  ">
                BlazeHCM
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea>
            {items.map((item, index) => (
              <SidebarGroup key={index}>
                <SidebarGroupLabel className="text-(--color-brick-ember-100) ">{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.links?.map((item) => (
                      <SidebarMenuItem key={item.title} >
                        <SidebarMenuButton
                          asChild
                       
                          className={` ${
                            url === item.url
                              ? "bg-[var(--color-brick-ember-600)] text-white"
                              : "text-[var(--sidebar-ring)]"
                          } hover:bg-(--color-brick-ember-100) hover:text-(--color-ink-black-950) `}
                        >
                          <a href={`/${item.url}`}>
                            <item.icon />
                            <span className="text-sm">{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
    </>
  );
}

const SideBar = React.memo(AppSidebar)

export default SideBar;
