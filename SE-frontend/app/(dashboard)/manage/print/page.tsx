"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { config } from "../../../config";
import { useSearchParams } from "next/navigation";
import axios from "axios";

interface Treatment {
  stock_id: string | null; // can be null for services
  drug_name: string;
  quantity: number;
  unit_price: number | null; // can be null for services
  subtotal: number;
  service?: string | null; // Optional service name
  custom_price?: number | null; // Optional custom price for services
}

interface SellData {
  bill_id: string;
  total_amount: number;
  created_at: string;
  treatments: Treatment[];
}

export default function PrintPage() {
  const searchParams = useSearchParams();
  const bill_id = searchParams.get("bill_id");
  const [sell, setSell] = useState<SellData | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [discountedAmount, setDiscountedAmount] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/sell/info/${bill_id}`);
      setSell(res.data);
      setTotalAmount(res.data.total_amount);
      setDiscountedAmount(res.data.discount);
      printDocument();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const printDocument = () => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-hidden, header, footer, nav, .next-app-header, .next-app-footer { display: none !important; }
        a[href]:after { content: none !important; }
        @page { margin: 0; }
        body { margin: 0; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-hidden, header, footer, nav, .next-app-header { display: none !important; }
        a[href]:after { content: none !important; }
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; padding: 0; }
        body * { visibility: hidden; }
        #print-content, #print-content * { visibility: visible; }
        #print-content { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
        header, footer, nav, .print-hidden { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="bg-white p-8 rounded-md flex-1 m-4 shadow-md mt-1">
      {sell && (
        <div id="print-content" className="p-8">
          <div className="flex items-center mb-4 w-full">
            <img
              src="/logo.png"
              alt="Clinic Logo"
              style={{ height: "100px", width: "auto" }}
            />
            <h1 className="text-center flex-1 text-3xl">ใบเสร็จรับเงิน</h1>
          </div>

          <div className="flex justify-between items-center">
            <div>
              ที่อยู่ (Address) : มงคงคีรี คลินิกการแพทย์ไทยประยุกต์ 12 ซอย 7
              ถนนสิโรรส ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200
            </div>
            <div>
              วันที่ (Date): {dayjs(sell.created_at).format("DD/MM/YYYY")}
            </div>
          </div>
          <div className="mt-2">
            เบอร์โทร (Tel) : 0821529499 หรือ 0935937259
          </div>
          <div className="flex justify-between items-center mt-2 hidden sm:flex">
            <div>
              รับเงินจาก (Received from) :
              ________________________________________
            </div>
          </div>
          <div className="mt-2 hidden sm:block">
            ที่อยู่ (Address): ___________________________________________
            เบอร์โทร (Tel) : __________________________
          </div>

          <table className="w-full border-collapse mt-4 border border-black">
            <thead>
              <tr className="text-black bg-gray-200 text-lg">
                <th className="py-1 px-4 border border-black ">รหัส</th>
                <th className="py-1 px-4 border border-black">รายการ</th>
                <th className="py-1 px-4 border border-black text-right">
                  จำนวน
                </th>
                <th className="py-1 px-4 border border-black text-right">
                  ราคาต่อหน่วย
                </th>
                <th className="py-1 px-4 border border-black text-right">
                  ราคารวม
                </th>
              </tr>
            </thead>
            <tbody>
              {sell.treatments.map((item, index) => (
                <tr key={`${item.stock_id}-${index}`}>
                  <td className="py-1 px-4 border border-black text-center">
                    {item.stock_id}
                  </td>
                  <td className="py-1 px-4 border border-black">
                    {item.drug_name}
                  </td>
                  <td className="py-1 px-4 border border-black text-right">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="py-1 px-4 border border-black text-right">
                    {item.unit_price ? item.unit_price.toLocaleString() : "-"}
                  </td>
                  <td className="py-1 px-4 border border-black text-right">
                    {item.subtotal ? item.subtotal.toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  className="py-1 px-4 border border-black text-center bg-gray-200"
                  colSpan={4}
                >
                  ส่วนลด
                </td>
                <td className="py-1 px-4 border border-black text-right ">
                  {discountedAmount.toLocaleString()} %
                </td>
              </tr>
              <tr>
                <td
                  className="py-1 px-4 border border-black text-center bg-gray-200"
                  colSpan={4}
                >
                  รวมเป็นเงิน
                </td>
                <td className="py-1 px-4 border border-black text-right">
                  {totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-4 hidden sm:block">
            <div>หมอ (Doctor) : __________________________</div>
            <div className="mt-2">
              ผู้ชำระเงิน (Payer) : ____________________________ ผู้รับเงิน
              (Cashier) : _________________________
            </div>
            <div className="mt-2">
              วันที่ (Date) : _______________________ เวลา (Time) :
              _______________________
            </div>
          </div>
          <div className="flex justify-end mt-4 print-hidden">
            <button
              className=" bg-lamaPink hover:bg-lamahover text-white px-4 py-2.5 rounded-md flex items-center gap-2 transition-colors text-xl"
              onClick={printDocument}
            >
              <i className="fa-solid fa-print text-center"></i>พิมพ์บิล
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
