import { Icon } from "@iconify-icon/react";
import SearchBar from "../../components/searchBar";
import IconButton from "../../components/iconButton";
import ImageButton from "../../components/imageButton";
import HorizontalSidebar from "./horizontalSidebar";
import Logo from "../../components/logo";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import { logout } from "@/app/services/allApi";

export default function TopBar({
    horizontalSidebar,
    toggleSidebar,
    isOpen,
    toggleOpen
}: {
    horizontalSidebar: boolean;
    toggleSidebar: () => void;
    isOpen: boolean;
    toggleOpen: () => void;
}) {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const router = useRouter();
    const [searchBarValue, setSearchBarValue] = useState("");

    const paddingIfOpen = isOpen ? "pl-[250px]" : "pl-[80px]";
    const paddingLeft = horizontalSidebar ? "pl-[0px]" : paddingIfOpen;

    return (
        <div
            className={`fixed w-full flex flex-col items-center ${paddingLeft} peer-hover:pl-[250px]`}
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
                            <Icon
                                icon="heroicons-outline:menu-alt-1"
                                width={24}
                                onClick={toggleOpen}
                            />
                        )}
                        <div className="w-full hidden sm:w-[320px] sm:block">
                            <SearchBar
                                value={searchBarValue}
                                onChange={(e) =>
                                    setSearchBarValue(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-[10px]">
                        <IconButton
                            icon="humbleicons:maximize"
                            onClick={() => {
                                toggleSidebar();
                            }}
                        />
                        <IconButton icon="lucide:bell" notification={true} />
                        <IconButton
                            icon="mi:settings"
                            onClick={() => {
                                router.push("/dashboard/settings");
                            }}
                        />

                        {/* Profile Dropdown */}
                        <DismissibleDropdown
                            isOpen={isOpenDropdown}
                            setIsOpen={setIsOpenDropdown}
                            button={
                                <ImageButton
                                    width={32}
                                    height={32}
                                    alt="Profile Picture"
                                    src="/dummyuser.jpg"
                                />
                            }
                            dropdown={
                                <div className="absolute w-[200px] top-[40px] right-0 z-30">
                                    <CustomDropdown
                                        data={[
                                            {
                                                icon: "mynaui:lock",
                                                label: "Change Password",
                                                onClick: () => {
                                                    setIsOpenDropdown(false);
                                                    router.push(
                                                        "/dashboard/settings/changePassword"
                                                    );
                                                },
                                            },
                                            {
                                                icon: "tabler:logout",
                                                label: "Logout",
                                                onClick: () => {
                                                    logout().then((res) => {
                                                        if(res?.code === 200 || res?.code === 401) {
                                                            router.push("/");
                                                        }
                                                    })
                                                }
                                            }
                                        ]}
                                    />
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
