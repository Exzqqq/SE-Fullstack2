"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Modal from "@/app/components/modal";
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "../../config";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import Pagination from "@/app/components/Pagination";
import "@fortawesome/fontawesome-free/css/all.min.css";

const ExpensePage = () => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [name, setName] = useState("");
  const [totalprice, setTotalprice] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQty] = useState("");
  const [id, setId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expense, setExpense] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    fetchData();
  }, [page, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
    
      const res = await axios.get(
        `${config.apiUrl}/api/expense/${page}/${searchQuery}`
      );

      if (res.data.success && Array.isArray(res.data.expenses)) {
        setExpense(res.data.expenses);
        setTotalRows(res.data.totalRows);
        setTotalPage(res.data.totalPages);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }; 

  const handleOpenModal = () => setIsShowModal(true);
  const handleCloseModal = () => {
    setIsShowModal(false);
    handleClear();
  };

  const handleClear = () => {
    setTotalprice("");
    setPrice("");
    setName("");
    setId("");
    setQty("");
  };

  useEffect(() => {
    const priceNumber = parseFloat(price);
    const quantityNumber = parseFloat(quantity);

    if (!isNaN(priceNumber) && !isNaN(quantityNumber)) {
      setTotalprice((priceNumber * quantityNumber).toFixed(2)); 
    } else {
      setTotalprice(""); 
    }
  }, [price, quantity]);

  const handleSave = async () => {
    try {
      if (!name || !totalprice || !price || !quantity) {
        throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
      }

      const payload = {
        name: name.trim(),
        price: Number(price),
        totalprice: Number(totalprice),
        quantity: Number(quantity),
        datetime: dayjs().format("YYYY-MM-DD"),
      };

      // Ensure the API endpoint starts with `/api`
      const response = id
        ? await axios.put(`${config.apiUrl}/api/expense/update/${id}`, payload)
        : await axios.post(`${config.apiUrl}/api/expense/create`, payload);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลเรียบร้อย",
          text: response.data.message,
          timer: 2000,
        });

        handleCloseModal();
        fetchData();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "คุณต้องการลบข้อมูลนี้ใช่หรือไม่?",
        text: "การดำเนินการนี้ไม่สามารถย้อนกลับได้",
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบข้อมูล",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        // Ensure API call is using `/api`
        await axios.delete(`${config.apiUrl}/api/expense/remove/${id}`);

        Swal.fire({
          icon: "success",
          title: "ลบข้อมูลเรียบร้อย",
          timer: 1500,
        });

        fetchData(); // Refresh data after deletion
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: err.message,
      });
    }
  };

  const handleEdit = (id: string) => {
    const expenseItem = expense.find((item: any) => item.id === id);
    if (expenseItem) {
      setId(expenseItem.id);
      setPrice(expenseItem.price?.toString() || "0"); 
      setTotalprice(expenseItem.totalprice?.toString() || "0"); 
      setQty(expenseItem.quantity?.toString() || "0"); 
      setName(expenseItem.name || ""); 
      handleOpenModal();
    }
  };

  const columns = [
    {
      header: "เลขที่",
      accessor: "orderid",
      className: "text-lg",
    },
    {
      header: "รายการ",
      accessor: "name",
      className: "hidden md:table-cell text-lg ",
    },
    {
      header: "จำนวน",
      accessor: "quantity",
      className: "hidden md:table-cell text-lg ",
    },
    {
      header: "ราคาต่อหน่วย",
      accessor: "price",
      className: "hidden md:table-cell text-lg ",
    },
    {
      header: "ราคารวม",
      accessor: "totalprice",
      className: "hidden md:table-cell text-lg ",
    },
    {
      header: "วันที่",
      accessor: "datetime",
      className: "hidden md:table-cell text-lg ",
    },
    { header: "จัดการ", accessor: "actions", className: "text-center text-lg" },
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 shadow-md mt-1">
      <div className="flex justify-between items-center mb-4 ml-1">
        <h2 className="text-3xl font-semibold text-gray-800">
          รายการค่าใช้จ่าย
        </h2>
      </div>

      <div className="flex justify-between items-center  gap-x-4 ml-1">
        <button
          className="bg-lamaPink hover:bg-lamahover text-white px-4 py-2.5 rounded-md flex items-center gap-2 transition-colors"
          onClick={() => {
            handleClear();
            handleOpenModal();
          }}
        >
          <i className="fas fa-plus"></i>
          <span className="hidden sm:inline text-xl">เพิ่มรายการ</span>
        </button>
        <TableSearch
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาวันที่ตามบิล"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">กำลังโหลดข้อมูล...</div>
      ) : (
        <Table
          columns={columns}
          data={expense}
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-center">{item.orderid}</td>
              <td className="px-6 py-4 hidden text-center md:table-cell">
                {item.name}
              </td>
              <td className="px-6 py-4 text-center hidden md:table-cell">
                {item.quantity}
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-center">
                {item.price ? item.price.toLocaleString() : "0.00"} บาท
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-center">
                {item.totalprice.toLocaleString()} บาท
              </td>
              <td className="px-6 py-4 text-center hidden md:table-cell">
                {dayjs(item.datetime).format("DD/MM/YYYY")}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  className="bg-lamaPink hover:bg-lamahover text-white p-2 rounded-full mr-2 h-10 w-10"
                  onClick={() => handleEdit(item.id)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="bg-red-600 hover:bg-lamared text-white p-2 rounded-full h-10 w-10"
                  onClick={() => handleDelete(item.id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          )}
        />
      )}

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

      <Modal
        isOpen={isShowModal}
        title={id ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
        onClose={handleCloseModal}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-lg ml-1 text-gray-700 mb-1">
              รายการ
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ชื่อรายการ"
            />
          </div>
          <div>
            <label className="block text-lg ml-1 font-medium text-gray-700 mb-1">
              ราคาต่อหน่วย
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ราคาต่อหน่วย"
              min="0"
            />
          </div>
          <div>
            <label className="block text-lg ml-1 text-gray-700 mb-1">
              จำนวน
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="จำนวน"
              min="1"
            />
          </div>

          <div>
            <label className="block text-lg ml-1 text-gray-700 mb-1">
              ราคารวม
            </label>
            <input
              type="number"
              value={totalprice}
              onChange={(e) => setTotalprice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ราคารวม"
              min="0"
              disabled
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-4 py-2 text-lg  bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={handleCloseModal}
            >
              ยกเลิก
            </button>
            <button
              className="px-4 py-2 text-white text-lg  rounded-md bg-lamaPink hover:bg-lamahover"
              onClick={handleSave}
            >
              บันทึก
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensePage;
