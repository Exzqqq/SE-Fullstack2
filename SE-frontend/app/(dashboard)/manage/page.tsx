"use client";

import { useEffect, useState } from "react";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "../../config";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.css";
import Pagination from "@/app/components/Pagination";

const BillRecord = () => {
  const [bills, setBills] = useState<any[]>([]); // Store the bills data
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering bills
  const [page, setPage] = useState(1); // Current page for pagination
  const [totalPage, setTotalPage] = useState(1); // Total pages for pagination
  const [totalRows, setTotalRows] = useState(0); // Total rows for pagination
  const router = useRouter();

  // Function to fetch data
  const fetchData = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/bill/history`, {
        params: {
          page, // Pass the current page number
          searchQuery, // Pass the search query for filtering
        },
      });

      setBills(res.data.bills); // Set the bills data
      setTotalRows(res.data.totalRows); // Set total rows for pagination
      setTotalPage(res.data.totalPage); // Set total pages for pagination
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  // Fetch data when page or search query changes
  useEffect(() => {
    fetchData();
  }, [page, searchQuery]);

  // Define table columns
  const columns = [
    {
      header: "เลขที่บิล",
      accessor: "billId",
      className: "text-center w-1/5 text-lg",
    },
    {
      header: "วันที่",
      accessor: "date",
      className: "text-center w-1/5 text-lg",
    },
    {
      header: "จำนวนรายการ",
      accessor: "itemCount",
      className: "text-center hidden md:table-cell w-1/5 text-lg",
    },
    {
      header: "ยอดรวม",
      accessor: "totalAmount",
      className: "text-center hidden md:table-cell w-1/5 text-lg",
    },
    {
      header: "จัดการ",
      accessor: "actions",
      className: "text-center w-1/5 text-lg",
    },
  ];

  // Render rows in the table
  const renderRow = (bills: any) => (
    <tr key={bills.billId} className="hover:bg-gray-50">
      <td className="px-6 py-4 text-center">{bills.bill_id}</td>
      <td className="px-6 py-4 text-center">
        {dayjs(bills.created_at).format("DD/MM/YYYY")}
      </td>
      <td className="px-6 py-4 text-center hidden md:table-cell">
        {bills.item_count || 0} รายการ
      </td>
      <td className="px-6 py-4 text-center hidden md:table-cell">
        {/* Check if totalAmount is valid and format it properly */}฿
        {Number(bills.total_amount) && !isNaN(Number(bills.total_amount))
          ? Number(bills.total_amount).toLocaleString()
          : "0.00"}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center gap-2">
          <a
            className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaPink hover:bg-lamahover text-white"
            href={`/manage/print?bill_id=${bills.bill_id}`}
            target="_blank"
            title="พิมพ์บิล"
          >
            <i className="fas fa-print"></i>
          </a>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 shadow-md mt-1">
      {/* Search Section */}
      <div className="mb-4">
        <h2 className="text-3xl font-semibold text-gray-800 ml-1">รายการบิล</h2>
      </div>
      <div className="flex justify-end w-full -mt-4">
        <TableSearch
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาวันที่ตามบิล"
        />
      </div>

      {/* Bills Table */}
      <Table columns={columns} data={bills} renderRow={renderRow} />

      {/* Show message when no data */}
      {bills.length === 0 && (
        <div className="text-center py-8 text-gray-500">ไม่พบข้อมูลบิล</div>
      )}

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPage}
          onPageChange={(newPage) =>
            setPage(Math.max(1, Math.min(newPage, totalPage)))
          }
          totalRows={totalRows}
        />
      </div>
    </div>
  );
};

export default BillRecord;
