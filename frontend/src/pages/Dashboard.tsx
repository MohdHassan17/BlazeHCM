import React from "react";
import Layout from "../layout/Layout";
import {
  ArrowUpRightIcon,
  ChartColumnIncreasing,
  ClockArrowUp,
  Plane,
} from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import AttendanceChart from "../components/dashboard/AttendanceChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "../components/ui/select";
import Heading from "../ui/Heading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import ActionButton from "../ui/ActionButton";

function Dashboard() {
  return (
    <>
      <title>Dashboard • Tesseract</title>
      <Layout>
        <ScrollArea>
          <div className="">
            {/* Inset Header */}
            <h1 className="mt-1 text-xl font-bold tracking-tight lg:text-2xl text-(--text-heading)  ">
              Welcome, Hassan!{" "}
            </h1>
            <div className="flex w-full flex-col gap-4 mt-4">
              {/* --ATTENDANCE CHART-- */}
              <div className="w-full border shadow-md p-2 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between">
                  {/* Chart Heading */}
                  <Heading
                    text="Attendance Summary"
                    icon={<ChartColumnIncreasing size={20} />}
                  />

                  {/* Month Select Dropdown */}
                  <SelectMonthDropdown />
                </div>
                <AttendanceChart />
              </div>

              {/*  --MISSING ENTRY AND REQUESTS MENUS--  */}
              <div className="w-full flex flex-col lg:flex-row gap-4  ">
                <div className=" flex-1 h-[300px] rounded-lg shadow-md border p-2 flex flex-col gap-2 ">
                  <Heading
                    text="Discrepant Entries"
                    icon={<ChartColumnIncreasing size={20} />}
                  />

                  <ScrollArea>
                    <Tabs
                      className="overflow-y-scroll h-full relative"
                      defaultValue="missing"
                    >
                      <TabsList className="sticky top-0 z-10">
                        <TabsTrigger
                          value="missing"
                          className="  border-1 rounded-lg"
                        >
                          {" "}
                          Missing
                        </TabsTrigger>
                        <TabsTrigger value="absent">Absent</TabsTrigger>
                      </TabsList>
                      <TabsContent value="missing">
                        <MissingEntriesMenu />
                      </TabsContent>
                      <TabsContent value="absent">
                        <AbsentsMenu />
                      </TabsContent>
                    </Tabs>
                  </ScrollArea>
                </div>
                <div className="flex-1"></div>
                <div className="flex-1"></div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Layout>
    </>
  );
}

function SelectMonthDropdown() {
  return (
    <>
      <Select>
        <SelectTrigger className="w-[200px] rounded-lg text-sm shadow-none ">
          <SelectValue placeholder="Current Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="font-normal text-(--color-digital-blue-600)">
              Months
            </SelectLabel>
            <SelectItem value="01">January 2025</SelectItem>
            <SelectItem value="02">February 2025</SelectItem>
            <SelectItem value="03">March 2025</SelectItem>
            <SelectItem value="04">April 2025</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}

function MissingEntriesMenu() {
  const missingAttendance = [
    { date: "01 January 2026", checkIn: "09:05 AM" },
    { date: "02 January 2026", checkIn: "09:12 AM" },
    { date: "03 January 2026", checkIn: "08:58 AM" },
    { date: "05 January 2026", checkIn: "09:20 AM" },
    { date: "06 January 2026", checkIn: "09:10 AM" },
    { date: "07 January 2026", checkIn: "09:00 AM" },
    { date: "08 January 2026", checkIn: "09:18 AM" },
    { date: "09 January 2026", checkIn: "08:55 AM" },
    { date: "12 January 2026", checkIn: "09:08 AM" },
    { date: "13 January 2026", checkIn: "09:15 AM" },
  ];

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-(--color-digital-blue-600)">
              {" "}
              Date
            </TableHead>
            <TableHead className="text-(--color-digital-blue-600)">
              {" "}
              Check-In
            </TableHead>
            <TableHead className="text-(--color-digital-blue-600)">
              {" "}
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-hidden">
          {missingAttendance.map((entry) => (
            <TableRow key={entry.date}>
              <TableCell>{entry.date}</TableCell>
              <TableCell>{entry.checkIn}</TableCell>
              <TableCell>
                {" "}
                <ActionButton
                  icon={ClockArrowUp}
                  toolTipText="Apply Attendance"
                  variant="secondary"
                  onClick={() => console.log("hello")}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
function AbsentsMenu() {
  const absentEntries = [
    { date: "01 January 2026" },
    { date: "02 January 2026" },
    { date: "03 January 2026" },
    { date: "05 January 2026" },
    { date: "06 January 2026" },
    { date: "07 January 2026" },
    { date: "08 January 2026" },
    { date: "09 January 2026" },
    { date: "12 January 2026" },
    { date: "13 January 2026" },
  ];

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-(--color-digital-blue-600)">
              {" "}
              Date
            </TableHead>
            <TableHead className="text-(--color-digital-blue-600)">
              {" "}
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-hidden">
          {absentEntries.map((entry) => (
            <TableRow key={entry.date}>
              <TableCell>{entry.date}</TableCell>
              <TableCell className="flex gap-2">
                {" "}
                <ActionButton
                  icon={Plane}
                  toolTipText="Apply Leave"
                  variant="default"
                  onClick={() => console.log("hello")}
                />
                <ActionButton
                  icon={ClockArrowUp}
                  toolTipText="Apply Attendance"
                  variant="secondary"
                  onClick={() => console.log("hello")}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
export default Dashboard;
