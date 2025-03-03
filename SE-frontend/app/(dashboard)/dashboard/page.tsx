"use client";

import axios from "axios";
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
import { config } from "../../config";
import Swal from "sweetalert2";

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalSales, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [listYears, setListYears] = useState<any[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [totalSalesAllYears, setTotalSalesAllYears] = useState(0);
  const [totalExpensesAllYears, setTotalExpensesAllYears] = useState(0);
  const [netProfitAllYears, setNetProfitAllYears] = useState(0);
  const [topSell, setTopSell] = useState<any[]>([]);

  useEffect(() => {
    const prevYear = new Date().getFullYear() - 5;
    const years = Array.from({ length: 6 }, (_, index) => prevYear + index);
    setListYears(years);

    fetchData();
  }, [currentYear]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${config.apiUrl}/api/bill/dashboard/${currentYear}`
      );
      setTotalIncome(res.data.totalSales || 0);
      setTotalExpense(res.data.totalExpenses || 0);
      setNetProfit(res.data.netProfit || 0);
      setTotalSalesAllYears(res.data.totalSalesAllYears || 0);
      setTotalExpensesAllYears(res.data.totalExpensesAllYears || 0);
      setNetProfitAllYears(res.data.netProfitAllYears || 0);

      const fetchedMonthlyData = res.data.monthlyData || [];
      setMonthlyData(fetchedMonthlyData);

      const top = await axios.get(`${config.apiUrl}/api/stocks/top-selling`);
      setTopSell(top.data);

      // If there is no data, clear the chart
      if (fetchedMonthlyData.length === 0) {
        setData([]);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  useEffect(() => {
    if (monthlyData.length > 0) {
      renderChart();
    }
  }, [monthlyData]);

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

    const chartData = months.map((month, index) => {
      const monthData =
        monthlyData.find((data) => parseInt(data.month) === index + 1) || {};
      return {
        name: month,
        ยอดขาย: parseFloat(monthData.income || "0"),
        ค่าใช้จ่าย: parseFloat(monthData.expense || "0"),
        key: `month-${month}-${index}`,
      };
    });

    setData(chartData);
  };

  const cardData = [
    {
      title: "ยอดขายทั้งหมด",
      value: `${totalSalesAllYears.toLocaleString()} บาท`,
    },
    {
      title: "ค่าใช้จ่ายทั้งหมด",
      value: `${totalExpensesAllYears.toLocaleString()} บาท`,
    },
    {
      title: "กำไรสุทธิทั้งหมด",
      value: `${netProfitAllYears.toLocaleString()} บาท`,
    },
    { title: "ยอดขายรายปี", value: `${totalSales.toLocaleString()} บาท` },
    {
      title: "ค่าใช้จ่ายรายปี",
      value: `${totalExpenses.toLocaleString()} บาท`,
    },
    {
      title: "กำไรสุทธิรายปี",
      value: `${netProfit.toLocaleString()} บาท`,
    },
  ];

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      <div className="w-full flex flex-col gap-8 -mt-3">
        <div className="w-full  flex flex-row justify-between gap-4">
          <div className="w-full lg:w-[70%] flex flex-col">
            {/* USECARD */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white p-4 flex-1 shadow-md flex-grow min-h-[155px] "
                >
                  <h2 className="text-3xl text-black mb-8 mt-2">
                    {card.title}
                  </h2>
                  <span
                    className={"text-lg p-4 rounded-xl text-black bg-gray-100"}
                  >
                    {card.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP SELL */}
          <div className="w-[30%] bg-white p-4 rounded-lg shadow-md hidden md:block ">
            <h2 className="text-3xl mb-3 text-center">
              อันดับสินค้าขายดี (Top 5)
            </h2>
            <div>
              {topSell.length > 0 ? (
                <table className="w-full table-auto text-center">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 font-semibold">ลำดับ</th>
                      <th className="py-2 px-4 font-semibold">ชื่อสินค้า</th>
                      <th className="py-2 px-4 font-semibold">จำนวนที่ขาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSell.map((stock, index) => {
                      // Array of pinkish colors
                      const colors = [
                        "bg-pink-600",
                        "bg-pink-500",
                        "bg-pink-400",
                        "bg-pink-300",
                        "bg-pink-200",
                      ];

                      return (
                        <tr
                          key={index}
                          className={`border-b ${
                            index % 2 === 0 ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          <td className="py-2 px-4 flex justify-center items-center">
                            <span
                              className={`w-6 h-6 rounded-full ${
                                colors[index % colors.length]
                              } text-white flex justify-center items-center`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-2 px-4">{stock.drug_name}</td>
                          <td className="py-2 px-4">
                            {stock.total_quantity_sold}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="mt-2">ไม่มีข้อมูลสินค้าขายดีในขณะนี้</p>
              )}
            </div>
          </div>
        </div>

        {/*CHART*/}
        <div className="flex gap-4 flex-col lg:flex-row -mt-3">
          <div className="w-full h-[500px]">
            <div className="bg-white rounded-lg p-4 h-full shadow-md overflow-hidden">
              <h2 className="text-3xl mb-4">รายรับ-รายจ่ายแต่ละเดือน</h2>
              <div className="flex items-center justify-between">
                <div></div> {/* เว้นพื้นที่ด้านซ้ายว่างไว้ */}
                <div className="flex items-center">
                  <div className="text-xl mr-2 ">เลือกปี</div>

                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    className="form-control mr-4 text-xl bg-gray-100 p-1 rounded-md"
                    style={{ width: "100px" }}
                  >
                    {listYears.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      fetchData();
                    }}
                  >
                    <i className="fa-solid fa-magnifying-glass mr-2"></i>
                  </button>
                </div>
              </div>

              {data.length === 0 ? (
                <div className="text-center text-lg mt-4">
                  ไม่มีข้อมูลสำหรับปีนี้
                </div>
              ) : (
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={500} height={300} data={data} barSize={20}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#ddd"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tick={{ fill: "#d1d5db" }}
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        tick={{ fill: "#d1d5db" }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "10px",
                          borderColor: "lightgray",
                        }}
                      />
                      <Legend
                        align="center"
                        verticalAlign="top"
                        wrapperStyle={{
                          paddingTop: "20px",
                          paddingBottom: "40px",
                        }}
                      />
                      <Bar
                        dataKey="ยอดขาย"
                        fill="#ffc8dd"
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                      />
                      <Bar
                        dataKey="ค่าใช้จ่าย"
                        fill="#bee2ff"
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
