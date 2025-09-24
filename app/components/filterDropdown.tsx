import SearchBar from "./searchBar";
import CustomDropdown from "./customDropdown";
import { useState } from "react";

export default function FilterDropdown({ children }: { children ?: React.ReactNode }) {
    const [searchBarValue, setSearchBarValue] = useState("");

    return (
        <div className="min-w-[200px] w-fit min-h-[300px] h-fit fixed -translate-x-[200px] translate-y-[10px] z-50 overflow-auto">
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
