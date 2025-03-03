// "use client";
// import axios from "axios";
// import { useState, useEffect } from "react";
// import { config } from "../.././app/config";
// import Swal from "sweetalert2";

// const UserCard = () => {
//   const [totalIncome, setTotalIncome] = useState(0);
//   const [totalRepair, setTotalRepair] = useState(0);
//   const [totalSale, setTotalSale] = useState(0);
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

//   useEffect(() => {
//     fetchData();
//   }, [currentYear]);

//   const fetchData = async () => {
//     try {
//       const res = await axios.get(
//         `${config.apiUrl}/sell/dashboard/${currentYear}`
//       );
//       setTotalIncome(res.data.totalIncome || 0);
//       setTotalRepair(res.data.totalRepair || 0);
//       setTotalSale(res.data.totalSale || 0);
//     } catch (error: any) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.message || "Something went wrong.",
//       });
//     }
//   };

//   const cardData = [
//     { title: "ยอดขายทั้งหมด", value: `${totalIncome.toLocaleString()} บาท` },
//     {
//       title: "ค่าใช้จ่ายทั้งหมด",
//       value: `${totalRepair.toLocaleString()} บาท`,
//     },
//     {
//       title: "กำไรสุทธิ",
//       value: `${(totalIncome - totalRepair).toLocaleString()} บาท`,
//     },
//     {
//       title: "ยอดขายสุทธิเดือนนี้",
//       value: `${totalSale.toLocaleString()} บาท`,
//     },
//   ];

//   return (
//     <div className="flex gap-4 justify-between flex-wrap">
//       {cardData.map((card, index) => (
//         <div
//           key={index}
//           className="rounded-2xl odd:bg-lamaPink even:bg-white p-4 flex-1 shadow-md flex-grow"
//         >
//           <h2 className="capitalize text-md text-black">{card.title}</h2>
//           <span className="text-[15px] bg-gray-50 px-2 py-1 rounded-full text-black">
//             {card.value}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default UserCard;
