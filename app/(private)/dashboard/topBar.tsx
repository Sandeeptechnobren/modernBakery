import { Icon } from "@iconify-icon/react";
import SearchBar from "../../components/searchBar";
import IconButton from "../../components/iconButton";
import ImageButton from "../../components/imageButton";
import HorizontalSidebar from "./horizontalSidebar";
import Logo from "../../components/logo";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";

export default function TopBar({
    horizontalSidebar,
    toggleSidebar,
}: {
    horizontalSidebar: boolean;
    toggleSidebar: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const [searchBarValue, setSearchBarValue] = useState("");

    return (
        <div
            className={`fixed peer-hover:pl-[250px] w-full flex flex-col items-center ${!horizontalSidebar ? "pl-[80px]" : "pl-[0px]"
                }`}
        >
            {/* Top Bar start */}
            <div className="w-full h-[60px] flex">
                {/* Logo on horizontal sidebar */}
                {horizontalSidebar && (
                    <div className="w-[230px] px-[16px] py-[14px] bg-white border-b border-[#E9EAEB]">
                        <Logo width={128} height={35} />
                    </div>
                )}

                {/* Top bar main content */}
                <div className="w-full h-full px-[16px] py-[14px] flex justify-between items-center gap-1 sm:gap-0 bg-white border-b border-[#E9EAEB]">
                    <div className="flex items-center gap-[20px]">
                        {!horizontalSidebar && (
                            <Icon icon="heroicons-outline:menu-alt-1" width={24} />
                        )}
                        <div className="w-full sm:w-[320px]">
                            <SearchBar
                                value={searchBarValue}
                                onChange={(e) => setSearchBarValue(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-[10px]">
                        <IconButton icon="humbleicons:maximize" 
                        onClick={() => {
                                toggleSidebar();
                            }}
                        />
                        <IconButton
                            icon="lucide:bell"
                            notification={true}
                        />
                        <IconButton
                            icon="mi:settings"
                            onClick={() => {
                                router.push("/dashboard/settings");
                            }}
                        />

                        {/* Profile Dropdown */}
                        <DismissibleDropdown
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            button={
                                <ImageButton
                                    width={32}
                                    height={32}
                                    alt="Profile Picture"
                                    src="/dummyuser.jpg"
                                />
                            }
                            dropdown={
                                <div className="absolute right-0 mt-2 w-44 bg-white border shadow-lg z-50">
                                    <ul className="py-2">
                                        <li
                                            onClick={() => {
                                                setIsOpen(false); 
                                                router.push("/dashboard/settings/changePassword");
                                            }}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            Change Password
                                        </li>
                                        <li
                                            onClick={() => console.log("Logout")}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            Logout
                                        </li>
                                    </ul>
                                </div>
                            }
                        />

                    </div>
                </div>
            </div>

            {horizontalSidebar && <HorizontalSidebar />}
        </div>
    );
}
