import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRows,
  onPageChange,
}) => {
  return (
    <div className="mt-3 ml-1">
      {/* Display total rows and pages */}
      <div className="text-lg">รายการทั้งหมด {totalRows} รายการ</div>
      <div className="text-lg">
        หน้า {currentPage} จาก {totalPages}
      </div>
      {/* Pagination buttons */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {/* First Page Button */}
        <button
          className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <i className="fa-solid fa-caret-left mr-1"></i>
          <span className="hidden sm:inline text-lg">หน้าแรก</span>
        </button>

        {/* Previous Page Button */}
        <button
          className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="fa-solid fa-caret-left"></i>
        </button>

        {/* Numbered Page Buttons */}
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-2 rounded-md border ${
              i + 1 === currentPage
                ? "bg-lamahover text-white   hover:bg-lamaPink transition"
                : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        {/* Next Page Button */}
        <button
          className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="fa-solid fa-caret-right"></i>
        </button>

        {/* Last Page Button */}
        <button
          className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline text-lg">หน้าท้าย</span>
          <i className="fa-solid fa-caret-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination; 