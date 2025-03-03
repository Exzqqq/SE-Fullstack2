"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Table from "@/app/components/Table";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface SellItem {
  id: number;
  product: {
    code: string;
    name: string;
  };
  qty: number;
  price: number;
}

const exampleSells: SellItem[] = [
  { id: 1, product: { code: "P001", name: "Product A" }, qty: 1, price: 100 },
  { id: 2, product: { code: "P002", name: "Product B" }, qty: 1, price: 200 },
  { id: 3, product: { code: "P003", name: "Product C" }, qty: 1, price: 300 },
];

const Page = () => {
  const [code, setCode] = useState("");
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(0);
  const [sells, setSells] = useState<SellItem[]>(exampleSells);
  const [discount, setDiscount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    calculateTotal();
  }, [sells, discount]);

  const calculateTotal = () => {
    const total = sells.reduce((sum, item) => sum + item.price * item.qty, 0);
    setTotalAmount(total);
    setFinalAmount(total - (total * discount) / 100);
  };

  const handleSave = () => {
    if (!code || price <= 0 || qty <= 0) {
      Swal.fire({
        icon: "error",
        title: "ข้อมูลไม่ถูกต้อง",
        text: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
      return;
    }

    const newSell: SellItem = {
      id: sells.length + 1,
      product: { code, name: `Product ${code}` },
      qty,
      price,
    };
    setSells([...sells, newSell]);
    setCode("");
    setPrice(0);
    setQty(0);
  };

  const handleDelete = (id: number) => {
    setSells(sells.filter((item) => item.id !== id));
  };

  const columns = [
    { header: "Code", accessor: "product.code", className: "text-center" },
    {
      header: "ชื่อสินค้า",
      accessor: "product.name",
      className: "text-center",
    },
    { header: "จำนวน", accessor: "qty", className: "text-center" },
    { header: "ราคา/หน่วย", accessor: "price", className: "text-center" },
    { header: "ลบข้อมูล", accessor: "actions", className: "text-center" },
  ];

  const renderRow = (item: SellItem, index: number) => (
    <tr key={index} className="text-center hover:bg-gray-50">
      <td className="px-6 py-4">{item.product.code}</td>
      <td className="px-6 py-4">{item.product.name}</td>
      <td className="px-6 py-4">{item.qty}</td>
      <td className="px-6 py-4">{item.price.toLocaleString()}</td>
      <td className="px-6 py-4">
        <button
          className="w-8 h-8 text-white bg-red-500 hover:bg-red-300 rounded-full"
          onClick={() => handleDelete(item.id)}
        >
          <i className="fa-solid fa-trash-alt"></i>
        </button>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 shadow-md mt-1">
      <div className="flex gap-2 items-end">
        <input
          className="p-2 border w-full"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
        />
        <input
          className="p-2 border w-full"
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          placeholder="จำนวน"
        />
        <input
          className="p-2 border w-full"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="ราคา"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSave}
        >
          บันทึก
        </button>
      </div>

      <Table columns={columns} data={sells} renderRow={renderRow} />

      <div className="flex justify-between mt-4">
        <div>ยอดรวมทั้งหมด:</div>
        <div>{totalAmount.toLocaleString()}</div>
      </div>

      <div className="flex justify-between mt-2">
        <div>ส่วนลด (%):</div>
        <input
          className="p-2 border w-20 text-center"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
        />
      </div>

      <div className="flex justify-between mt-2">
        <div>ยอดสุทธิ:</div>
        <div>{finalAmount.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default Page;
