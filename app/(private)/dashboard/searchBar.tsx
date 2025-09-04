import { Icon } from "@iconify-icon/react";

export default function SearchBar() {
    return (
        <div className="relative text-[#717680] text-[14px]">
            <div className="absolute top-0 left-0 flex items-center h-full pl-[12px]">
                <Icon icon="iconamoon:search" width={20} />
            </div>
            <input
                type="text"
                placeholder="Search here..."
                className="border border-gray-300 rounded-md p-2 sm:w-full w-[320px] h-[36px] px-[12px] py-[8px] pl-[40px]"
            />
        </div>
    );
}
