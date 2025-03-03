"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { config } from "@/app/config";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";

interface SellDetail {
  payDate: string;
  product: { name: string };
  price: number;
}

// Extract the search params into a separate component
function PrintContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [sell, setSell] = useState<SellDetail | null>(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/sell/info/${id}`);
      setSell(res.data);
      printDocument();
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  const printDocument = () => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-content, #print-content * {
          visibility: visible;
        }
        #print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 80mm;
        }
        .content-header {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div>
      <div className="content-header flex justify-between">
        <div>Print Receipt</div>
        <button className="btn btn-primary" onClick={printDocument}>
          <i className="fa-solid fa-print mr-3"></i>Print
        </button>
      </div>

      <div id="print-content">
        <div className="text-2xl font-bold text-center">Receipt</div>
        {sell && (
          <>
            <div>Date: {dayjs(sell.payDate).format("DD/MM/YYYY")}</div>
            <div>Item: {sell.product.name}</div>
            <div>Price: {sell.price.toLocaleString()}</div>
          </>
        )}
      </div>
    </div>
  );
}

// Wrap the component inside Suspense
export default function PrintPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintContent />
    </Suspense>
  );
}