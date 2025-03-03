import Image from "next/image";

interface TableSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; // Add this line to accept placeholder
}

const TableSearch: React.FC<TableSearchProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="w-full md:w-auto flex items-center  text-md rounded-full ring-[1.5px] ring-gray-300 px-5 ">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-[200px] p-2 bg-transparent outline-none "
      />
    </div>
  );
};

export default TableSearch;
