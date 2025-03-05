"use client";
import { useEffect, useState, Suspense } from "react";
import dayjs from "dayjs";
import { config } from "../../../config";
import { useSearchParams } from "next/navigation";
import axios from "axios";

interface Treatment {
  stock_id: string | null;
  drug_name: string;
  quantity: number;
  unit_price: number | null;
  subtotal: number;
  service?: string | null;
  custom_price?: number | null;
}

interface SellData {
  treatments: Treatment[];
}

function PrintContent() {
  const searchParams = useSearchParams();
  const bill_id = searchParams.get("bill_id");
  const [sell, setSell] = useState<SellData | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [discountedAmount, setDiscountedAmount] = useState<number>(0);

  useEffect(() => {
    if (bill_id) fetchData();
  }, [bill_id]);

  const fetchData = async (): Promise<void> => {
    try {
      const res = await axios.get(`${config.apiUrl}/sell/info/${bill_id}`);
      setSell(res.data);
      setTotalAmount(res.data.total_amount);
      setDiscountedAmount(res.data.discount);
    } catch (error) {
      console.error("Error fetching sell data:", error);
    }
  };

  const printPage = () => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-hidden, header, footer, nav { display: none !important; }
        a[href]:after { content: none !important; }
        @page { margin: 0; }
        body { margin: 0; }
        #print-content, #print-content * { visibility: visible; }
        #print-content { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
      }
    `;
    document.head.appendChild(style);
    window.print();
  };

  return (
    <div id="print-content" className="p-6">
      <div className="border border-black p-6">
        <div className="text-center font-bold text-2xl">ใบเสร็จรับเงิน (Receipt)</div>
        <div className="flex justify-between items-center">
          <div>ที่อยู่ (Address) : มงคงคีรี คลินิกการแพทย์ไทยประยุกต์</div>
          <div>วันที่ (Date): {dayjs(sell.created_at).format("DD/MM/YYYY")}</div>
        </div>
        <table className="w-full border-collapse mt-4 border border-black">
          <thead>
            <tr className="text-black bg-gray-200 text-lg">
              <th className="py-1 px-4 border border-black ">รหัส</th>
              <th className="py-1 px-4 border border-black">รายการ</th>
              <th className="py-1 px-4 border border-black text-right">จำนวน</th>
              <th className="py-1 px-4 border border-black text-right">ราคาต่อหน่วย</th>
              <th className="py-1 px-4 border border-black text-right">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            {sell?.treatments.map((item, index) => (
              <tr key={index}>
                <td className="py-1 px-4 border border-black">{item.stock_id}</td>
                <td className="py-1 px-4 border border-black">{item.drug_name}</td>
                <td className="py-1 px-4 border border-black text-right">{item.quantity}</td>
                <td className="py-1 px-4 border border-black text-right">{item.unit_price}</td>
                <td className="py-1 px-4 border border-black text-right">{item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4 print-hidden">
          <button
            className="bg-lamaPink hover:bg-lamahover text-white px-4 py-2.5 rounded-md flex items-center gap-2 transition-colors text-xl"
            onClick={printPage}
          >
            พิมพ์ใบเสร็จ (Print Receipt)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintContent />
    </Suspense>
  );
}