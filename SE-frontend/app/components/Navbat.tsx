"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [pageName, setPageName] = useState("");

    useEffect(() => {
      const pageNames: Record<string, string> = {
        "/dashboard": "แดชบอร์ด",
        "/manage": "บันทึกใบเสร็จ",
        "/expense":"บันทึกรายจ่าย",
        "/billing": "ใบเสร็จ",
      };

      setPageName(pageNames[pathname] || "หน้าแรก");
    }, [pathname]);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-md m-4 mt-5 shadow-md">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <h1 className="text-4xl  whitespace-nowrap">{pageName}</h1>
      </div>
      {/* RIGHT SECTION */}
      {/* <div className="flex items-center gap-3 ">
        <div className="flex flex-col text-right">
          <span className="text-xs font-medium leading-3">John Doe</span>
          <span className="text-[10px] text-gray-500">Admin</span>
        </div>
        <Image
          src="/user.png"
          alt="Profile"
          width={36}
          height={36}
          className="rounded-full"
        />
      </div> */}
    </div>
  );
};

export default Navbar;
