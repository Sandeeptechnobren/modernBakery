import SearchBar from "./searchBar";
import CustomDropdown from "./customDropdown";
import { useState } from "react";

export default function FilterDropdown({ children }: { children ?: React.ReactNode }) {
    const [searchBarValue, setSearchBarValue] = useState("");

    return (
        <div className="absolute w-[320px] h-[320px] overflow-auto">
            <CustomDropdown>
                <div className="p-[10px] pb-[6px]">
                    <SearchBar value={searchBarValue} onChange={(e) => setSearchBarValue(e.target.value)} placeholder="Search here..." />
                </div>
                <div>
                    {children}
                </div>
            </CustomDropdown>
        </div>
    );
}
