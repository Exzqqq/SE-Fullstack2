"use client";


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "2868",
    income: 4000,
    expense: 2400,
  },
  {
    name: "2569",
    income: 3000,
    expense: 1398,
  },
  {
    name: "2570",
    income: 2000,
    expense: 9800,
  },
  {
    name: "2571",
    income: 2780,
    expense: 3908,
  },
  {
    name: "2572",
    income: 1890,
    expense: 4800,
  },
  {
    name: "2573",
    income: 2390,
    expense: 3800,
  },
  {
    name: "2574",
    income: 3490,
    expense: 4300,
  },
  {
    name: "2575",
    income: 3490,
    expense: 4300,
  },
  {
    name: "2576",
    income: 3490,
    expense: 4300,
  },
  {
    name: "2577",
    income: 3490,
    expense: 4300,
  },
  {
    name: "2578",
    income: 3490,
    expense: 4300,
  },
  {
    name: "2579",
    income: 3490,
    expense: 4300,
  },
];

const FinanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-lg">รายรับ-ราบจ่ายแต่ละปี</h1>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={20}
          />
          <Tooltip />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#C3EBFA"
            strokeWidth={5}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#fec9d5"
            strokeWidth={5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
