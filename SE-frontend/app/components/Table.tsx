import React from "react";

const Table = ({
  columns,
  renderRow,
  data = [],
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any, index: number) => React.ReactNode;
  data?: any[];
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-sm">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-4 font-semibold ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <React.Fragment key={index}>
                {renderRow(item, index)}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
