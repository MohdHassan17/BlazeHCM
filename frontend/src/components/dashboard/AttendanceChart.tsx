import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  type ChartConfig,
} from "../ui/chart";

function AttendanceChart() {
  const chartData = [
    { date: "2026-01-01", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-02", status: "Late", totalHours: 6.5, shortHours: 1.5 },
    { date: "2026-01-03", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-04", status: "Absent", totalHours: 0, shortHours: 8 },
    { date: "2026-01-05", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-06", status: "Late", totalHours: 7, shortHours: 1 },
    { date: "2026-01-07", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-08", status: "Present", totalHours: 9, shortHours: 0 },
    { date: "2026-01-09", status: "Absent", totalHours: 0, shortHours: 8 },
    { date: "2026-01-10", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-11", status: "Late", totalHours: 6, shortHours: 2 },
    { date: "2026-01-12", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-13", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-14", status: "Late", totalHours: 7.5, shortHours: 0.5 },
    { date: "2026-01-15", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-16", status: "Absent", totalHours: 0, shortHours: 8 },
    { date: "2026-01-17", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-18", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-19", status: "Late", totalHours: 6.8, shortHours: 1.2 },
    { date: "2026-01-20", status: "HalfDay", totalHours: 8, shortHours: 0 },
    { date: "2026-01-21", status: "Absent", totalHours: 0, shortHours: 8 },
    { date: "2026-01-22", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-23", status: "Late", totalHours: 7, shortHours: 1 },
    { date: "2026-01-24", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-25", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-26", status: "Absent", totalHours: 0, shortHours: 8 },
    { date: "2026-01-27", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-28", status: "Late", totalHours: 6.5, shortHours: 1.5 },
    { date: "2026-01-29", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-30", status: "Present", totalHours: 8, shortHours: 0 },
    { date: "2026-01-31", status: "Present", totalHours: 8, shortHours: 0 },
  ];

  const MAXIMUM_HOURS = 9;
  const configuredAttendance = chartData.map((day) => {
    const date = new Date(day.date);
    const formattedDate = `${date.getDate()}/${date.toLocaleString("en-US", {
      month: "short",
    })}`;
    return {
      ...day,
      displayHours:
        day.status === "Absent" || day.status === "Late"
          ? MAXIMUM_HOURS
          : day.status === "Half-Day"
          ? MAXIMUM_HOURS / 2
          : day.totalHours,
      date: formattedDate,
    };
  });

  const hoursArray: number[] = [];

  configuredAttendance.forEach((item) => {
    hoursArray.push(item.totalHours);
  });

  const maxHours = Math.max(...hoursArray) + 1;

  const chartConfig = {
    totalHours: { label: "Total Hours" },
    shortHours: { label: "Short Hours" },
  } satisfies ChartConfig;

  const STATUS_COLORS: Record<string,string> = {
    Present: "#03045e",
    Late: "#fb8500",
    Absent: "#dd2d4a",
    // Leave: "#C4E538",
    HalfDay: "#007f5f"
  };

  return (
    <ChartContainer config={chartConfig} className="h-75 w-full mt-4 ">
      
      <BarChart  data={configuredAttendance}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={7}
          interval={0} // show every tick
          height={60} // reserve vertical space for rotated labels
          tick={{ angle: -45, textAnchor: "end", fontSize: 10 }}
        />

        <YAxis domain={[0, maxHours]} tickLine={false} axisLine={false} />

        <Bar dataKey="displayHours" radius={4} >
    {configuredAttendance.map((entry, index) => {


    return (
      <Cell
        key={`cell-${index}`}
        fill={STATUS_COLORS[entry.status]}        // 0 → background
        // stroke={borderColor} // 1 → border
        strokeWidth={1.5}
      />
    );
  })}
        </Bar>
        <Tooltip
        cursor={false}
          content={({ payload, label }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;

            return (
              <div className="rounded-lg border bg-white p-3 shadow text-sm text(--text-heading)">
                <div className="font-medium">Day {label}</div>
                <div>
                  Status: <strong>{d.status}</strong>
                </div>
                <div>Worked: {d.totalHours} hrs</div>
                <div>Short: {d.shortHours} hrs</div>
              </div>
            );
          }}
        />
      </BarChart>
    </ChartContainer>
  );
}

export default AttendanceChart;
