"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

const AttendanceChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [listYears, setListYears] = useState<number[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const prevYear = new Date().getFullYear() - 5;
    const years = Array.from({ length: 6 }, (_, index) => prevYear + index);
    setListYears(years);

    renderChart();
  }, []);

  const renderChart = () => {
    const months = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const generatedData = months.map((month) => ({
      name: month,
      income: Math.floor(Math.random() * 10000),
      expense: Math.floor(Math.random() * 8000),
    }));

    setData(generatedData);
  };

  return (
    <div className="bg-white rounded-lg p-4 h-full shadow-md overflow-hidden">
      <h1 className="text-lg mb-4">รายรับ-รายจ่ายแต่ละเดือน</h1>
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center">
          <div className="text-lg mr-2">เลือกปี</div>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="form-control mr-4"
            style={{ width: "100px" }}
          >
            {listYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button onClick={renderChart}>
            <i className="fa-solid fa-magnifying-glass mr-2"></i>
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis dataKey="name" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
          <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }} />
          <Bar dataKey="income" fill="#fec9d5" legendType="circle" radius={[10, 10, 0, 0]} />
          <Bar dataKey="expense" fill="#C3EBFA" legendType="circle" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;