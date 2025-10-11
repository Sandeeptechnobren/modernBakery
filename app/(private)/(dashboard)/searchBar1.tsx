import { Icon } from "@iconify-icon/react";

export default function SearchBar1() {
    return (
        <div className="relative text-[#7985A4] text-[14px] group/search">
            <div className="absolute flex items-center h-[30px] pl-[10px] py-[7px]">
                <Icon icon="uil:search" width={15} className="" />
            </div>
            <input
                type="text"
                placeholder="Search"
                className="border-[1px] border-transparent group-hover/search:border-[#7985A4] group-hover/search:text-[#ffffff] rounded-[8px] w-full h-[30px] px-[12px] py-[7px] pl-[30px] outline-none focus:border-blue-500 focus:shadow-[0px_0px_2px_0px] focus:shadow-blue-500 transition-all duration-200"
            />
        </div>
    );
}
