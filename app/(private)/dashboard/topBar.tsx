import { Icon } from "@iconify-icon/react";
import SearchBar from "../../components/searchBar";
import IconButton from "../../components/iconButton";
import ImageButton from "../../components/imageButton";
import HorizontalSidebar from "./horizontalSidebar";
import Logo from "../../components/logo";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopBar({
    horizontalSidebar,
    toggleSidebar,
}: {
    horizontalSidebar: boolean;
    toggleSidebar: () => void;
}) {

    const router = useRouter();
    const [searchBarValue, setSearchBarValue] = useState("");

    return (
        <div
            className={`fixed peer-hover:pl-[250px] w-full flex flex-col items-center ${
                !horizontalSidebar ? "pl-[80px]" : "pl-[0px]"
            }`}
        >
            {/* Top Bar start from here */}
            <div className="w-full h-[60px] flex">

                {/* logo on horizontal sidebar */}
                {horizontalSidebar && (
                    <div className="w-[230px] px-[16px] py-[14px] bg-white border-b-[1px] border-[#E9EAEB]">
                        <Logo width={128} height={35} />
                    </div>
                )}

                {/* top bar main content */}
                <div className="w-full h-full px-[16px] py-[14px] flex justify-between items-center gap-1 sm:gap-0 bg-white border-b-[1px] border-[#E9EAEB]">
                    <div className="flex items-center gap-[20px]">
                        {!horizontalSidebar && (
                            <Icon
                                icon="heroicons-outline:menu-alt-1"
                                width={24}
                            />
                        )}
                        <div className="w-full sm:w-[320px]">
                            <SearchBar value={searchBarValue} onChange={(e) => setSearchBarValue(e.target.value)} />

                        </div>
                    </div>
                    <div className="flex items-center gap-[10px]">
                        <IconButton icon="humbleicons:maximize" />
                        <IconButton icon="lucide:bell" notification={true} />
                        <IconButton
                            icon="mi:settings"
                            onClick={() => {
                                router.push("/dashboard/settings");
                            }}
                        />
                        <ImageButton
                            width={32}
                            height={32}
                            alt="Profile Picture"
                            src="/dummyuser.jpg"
                            onClick={() => {
                                toggleSidebar();
                            }}
                        />
                    </div>
                </div>
            </div>

            {horizontalSidebar && <HorizontalSidebar />}
        </div>
    );
}
