"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { config } from "@/app/config";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function Page() {
  const [sellList, setSellList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/sell/history`);
      setSellList(res.data);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>ประวัติการขาย</div>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="text-left w-[120px]">วันที่</th>
            <th className="text-left">รายการ</th>
            <th className="text-right w-[120px]">ราคา</th>
            <th className="text-center w-[140px]">พิมพ์บิล</th>
          </tr>
        </thead>
        <tbody>
          {sellList.map((item: any, index: number) => (
            <tr key={index}>
              <td>{dayjs(item.payDate).format("DD/MM/YYYY")}</td>
              <td>{item.product.name}</td>
              <td className="text-right">{item.price.toLocaleString()}</td>
              <td className="text-center">
                <a
                  target="_blank"
                  className=" btn-primary"
                  href={`/backoffice/sell/print?id=${item.id}`}
                >
                  <i className="fa-solid fa-print mr-2"></i>
                  พิมพ์
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
