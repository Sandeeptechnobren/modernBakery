import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LinkDataType, miscLinks, SidebarDataType } from "../data/dashboardLinks";
import Link from "next/link";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { logout } from "@/app/services/allApi";
import SidebarBtn1 from "@/app/components/iconButton1";

export default function Sidebar({
    data,
    onClickHandler,
}: Readonly<{
    data: SidebarDataType[];
    onClickHandler: (href: string) => void;
}>) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [currentPageForSecondSidebar, setCurrentPageForSecondSidebar] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const [secondSidebarChildren, setSecondSidebarChildren] = useState([] as LinkDataType[]);
    const [activeHref, setActiveHref] = useState<string>("");
    useEffect(() => {
        // keep local activeHref in sync with router pathname
        setActiveHref(pathname ?? window.location.pathname);
    }, [pathname]);

    const isParentActive = (children: LinkDataType[] | undefined): boolean => {
    if (!children) return false;
    return Boolean(children.some((child) => child.href === activeHref));
    };


    return (
        <div className="flex">
            {/* first side bar */}
            <div className="w-[40px] h-screen bg-[#121D33] text-white flex flex-col justify-between items-center">
                {/* upper part */}
                <div className="w-full flex flex-col items-center gap-[10px]">
                    {/* logo */}
                    <div className="flex items-center justify-center w-full h-[40px]">
                        <Image
                            src="/logoWhite.png"
                            className="p-[10px] cursor-pointer"
                            width={152}
                            height={222}
                            alt="logo"
                            onClick={() => router.push("/")}
                        />
                    </div>

                    {/* circle */}
                    <div className="hidden items-center justify-center w-full">
                        <div className="w-[28px] h-[28px] flex items-center justify-center px-[6px] bg-[#223458] hover:bg-blue-500 text-white p-[5px] rounded-full">
                            <Icon icon="lucide:plus" width={16} height={16} />
                        </div>
                    </div>

                    {/* icons */}

                    <div className="flex flex-col items-center gap-[8px] w-full">
                    {data.map((group, groupIndex) =>
                        group.data.map((link, index) => {
                            const isActive = isParentActive(link.children);
                            return (
                                <Link
                                    className="w-full relative cursor-pointer group"
                                    key={`${groupIndex}-${index}`}
                                    href={link.href}
                                    onClick={() => {
                                        onClickHandler(link.href);
                                        setActiveHref(link.href);
                                        if (link.children && link.children.length > 0) {
                                            setIsOpen(true);
                                            setCurrentPageForSecondSidebar(link.href);
                                            setSecondSidebarChildren(link.children);
                                        } else {
                                            setIsOpen(false);
                                            setCurrentPageForSecondSidebar("");
                                        }
                                    }}
                                >
                                    <div
                                        className={`w-full h-[40px] p-[6px] flex justify-center items-center relative rounded-l-[8px] ${
                                            isActive ? "bg-[#223458]" : ""
                                        }`}
                                    >
                                        <Icon
                                            icon={link.leadingIcon}
                                            width={20}
                                            className={`z-10 ${link.iconColor || "text-white"}`}
                                        />
                                        <div className={`z-10 ${isActive ? "block" : "hidden"}`}>
                                            <div className="absolute -top-[8px] right-0 w-[8px] h-[8px] bg-[#223458]">
                                                <div className="w-full h-full bg-[#121D33] rounded-br-[8px]"></div>
                                            </div>
                                            <div className="absolute -bottom-[8px] right-0 w-[8px] h-[8px] bg-[#223458]">
                                                <div className="w-full h-full bg-[#121D33] rounded-tr-[8px]"></div>
                                            </div>
                                        </div>
                                        <div
                                            className={`${!isActive ? "group-hover:flex" : ""} hidden absolute z-20 top-0 left-[100%] whitespace-nowrap w-fit px-[10px] py-[8px] items-center justify-center bg-gray-900 text-[12px] rounded-[8px]`}
                                        >
                                            {link.label}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                    </div>
                </div>

                {/* lower part */}
                <div className="flex flex-col items-center gap-[8px] w-full mb-[16px]">
                    {miscLinks.map((link, index) =>
                        link.type === "icon" ? (
                            <Link
                                href={link.href}
                                key={index}
                                className="relative group flex items-center hover:bg-[#223458] w-[32px] h-[32px] rounded-[8px]"
                            >
                                <Icon
                                    icon={link.icon || "lucide:circle"}
                                    width={20}
                                    className="w-full"
                                    alt={link.label}
                                />
                                <div
                                    className={`hidden group-hover:flex absolute z-20 top-0 left-[100%] whitespace-nowrap w-fit px-[10px] py-[8px] items-center justify-center bg-gray-900 text-[12px] rounded-[8px]`}
                                >
                                    {link.label}
                                </div>
                            </Link>
                        ) : (
                            <DismissibleDropdown
                                key={index}
                                isOpen={showDropdown}
                                setIsOpen={setShowDropdown}
                                button={
                                    <Link
                                        href={link.href}
                                        className="flex items-center w-[32px] h-[32px] rounded-full overflow-hidden"
                                    >
                                        <Image
                                            src={link.src || "/dummyuser.jpg"}
                                            alt="Logo"
                                            width={20}
                                            height={20}
                                            className="w-full object-cover"
                                        />
                                    </Link>
                                }
                                dropdown={
                                    <div className="absolute w-[200px] bottom-0 left-[40px] z-30">
                                        <CustomDropdown
                                            data={[
                                                {
                                                    icon: "mynaui:lock",
                                                    label: "Change Password",
                                                    onClick: () => {
                                                        setIsOpen(false);
                                                        router.push(
                                                            "/settings/changePassword"
                                                        );
                                                    },
                                                },
                                                {
                                                    icon: "tabler:logout",
                                                    label: "Logout",
                                                    onClick: () => {
                                                        logout().then((res) => {
                                                            if (
                                                                res?.code ===
                                                                    200 ||
                                                                res?.code ===
                                                                    401
                                                            ) {
                                                                router.push(
                                                                    "/"
                                                                );
                                                            }
                                                        });
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                }
                            />
                        )
                    )}
                </div>
            </div>

            {/* second sidebar */}
            <div
                className={`relative ${
                    isOpen ? "w-[200px]" : "w-[13px] hover:w-[15px]"
                } h-screen bg-[#223458] group transition-all ease-in-out duration-300`}
            >
                {/* second sidebar toggle button */}
                {currentPageForSecondSidebar !== "" && (
                    <>
                        <span
                            className="hidden group-hover:flex absolute bottom-[50px] -right-3 p-1 bg-white rounded-full w-[20px] h-[20px] items-center justify-center"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <Icon
                                icon={
                                    isOpen
                                        ? "lucide:chevron-left"
                                        : "lucide:chevron-right"
                                }
                                width={20}
                            />
                        </span>
                    </>
                )}

                {/* inner content */}
                <div>
                    
                </div>
                <div className="w-full h-full flex flex-col p-[8px] gap-[10px]">
                    { secondSidebarChildren && isOpen && secondSidebarChildren.map((link, index) =>{
                        return <div key={index}>
                            <SidebarBtn1
                                isActive={activeHref === link.href}
                                href={link.href}
                                label={link.label}
                                labelTw={`text-[#C2CBDE]`}
                                className=""
                                onClick={() => { setIsOpen(false); setActiveHref(link.href) }}
                                leadingIcon={link.leadingIcon}
                                leadingIconSize={20}
                            />
                        </div>
                    })
                    }
                </div>
            </div>
        </div>
    );
}
