import { Icon } from "@iconify-icon/react";
import SearchBar from "../../components/searchBar";
import IconButton from "../../components/iconButton";
import ImageButton from "../../components/imageButton";
import HorizontalSidebar from "../(dashboard)/horizontalSidebar";
import Logo from "../../components/logo";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import NotificationPopover from "@/app/components/notificationPopover";
import { logout } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { initialLinkData } from "../data/dashboardLinks";
import ResetPasswordSidebar from "@/app/components/ResetPasswordSidebar";

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
    const { showSnackbar } = useSnackbar();
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const [showResetPasswordSidebar, setShowResetPasswordSidebar] = useState(false);
    const [resetPasswordValues, setResetPasswordValues] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleResetPasswordField = (field: string, value: any) => {
        setResetPasswordValues(prev => ({ ...prev, [field]: value }));
    };

    const handleResetPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Implement password update logic here (API call etc.)
        setShowResetPasswordSidebar(false);
        setResetPasswordValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
    };
    const [searchBarValue, setSearchBarValue] = useState("");

    const paddingIfOpen = isOpen ? "pl-[250px]" : "pl-[80px]";
    const paddingLeft = horizontalSidebar ? "pl-[0px]" : paddingIfOpen;

    async function logoutHandler() {
        if (isLoggingOut) return; // Prevent multiple clicks
        setIsLoggingOut(true);
        try {
            const res = await logout();
            if (res.error) showSnackbar(res.data.message, "error");
            localStorage.removeItem("token");
            setIsOpenDropdown(false);
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            setIsLoggingOut(false);
        }
    }

    // Fullscreen toggle
    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
                showSnackbar?.("Entered fullscreen", "success");
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
                showSnackbar?.("Exited fullscreen", "success");
            }
        } catch (err) {
            console.warn("Fullscreen toggle failed:", err);
            showSnackbar?.("Unable to change fullscreen", "error");
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    return (
        <div
            className={`absolute w-full flex flex-col items-center ${paddingLeft} peer-hover:pl-[250px]`}
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
                                className="cursor-pointer"
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
                            icon={isFullscreen ? "mdi:fullscreen-exit" : "humbleicons:maximize"}
                            onClick={() => toggleFullscreen()}
                        />
                        <NotificationPopover
                            count={3}
                            items={[
                                { title: "New order created" },
                                { title: "Payment received" },
                                { title: "Delivery assigned" },
                            ]}
                            buttonClassName="bg-[#F5F5F5] text-black"
                        />
                        <IconButton
                            icon="mi:settings"
                            onClick={() => {
                                router.push("/settings");
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
                                <div className="absolute w-[250px] top-[40px] right-0 z-60">
                                    <CustomDropdown
                                        data={[
                                            ...(process.env.NODE_ENV === "development" ? [{
                                                icon: "lucide:settings",
                                                label: "settings (dev)",
                                                onClick: () => {
                                                    setIsOpenDropdown(false);
                                                    router.push(
                                                        "/settingsdev"
                                                    );
                                                },
                                            }] : []),
                                            {
                                                icon: "mdi:account-multiple",
                                                label: "Profile",
                                                onClick: () => {
                                                    setIsOpenDropdown(false);
                                                    router.push(
                                                        "/profile"
                                                    );
                                                },
                                            },
                                            {
                                                icon: "mynaui:lock",
                                                label: "Change Password",
                                                onClick: () => {
                                                    setIsOpenDropdown(false);
                                                    setShowResetPasswordSidebar(true);
                                                },
                                            },
                                            {
                                                icon: "mynaui:lock",
                                                label: "Settings Profile",
                                                onClick: () => {
                                                    setIsOpenDropdown(false);
                                                    router.push(
                                                        "/settingProfile"
                                                    );
                                                },
                                            },
                                            {
                                                icon: "tabler:logout",
                                                label: isLoggingOut ? "Logging out..." : "Logout",
                                                onClick: logoutHandler
                                            }
                                        ]}
                                    />
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {horizontalSidebar && (
                <HorizontalSidebar
                    data={initialLinkData}
                    onClickHandler={(href) => router.push(href)}
                />
            )}
        {/* Reset Password Sidebar */}
        <ResetPasswordSidebar
            show={showResetPasswordSidebar}
            onClose={() => setShowResetPasswordSidebar(false)}
            setFieldValue={handleResetPasswordField}
            values={resetPasswordValues}
        />
        </div>
    );
}
