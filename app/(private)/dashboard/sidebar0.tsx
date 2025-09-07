"use client";

import Logo from "../../components/logo";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { LinkDataType, SidebarDataType } from "../data/dashboardLinks";

export default function Sidebar({ data, onClickHandler }: { data: SidebarDataType[], onClickHandler: (href: string) => void }) {
    return (
        <div className="group peer">
            <div className="w-[80px] group-hover:w-[250px] h-[100vh] fixed ease-in-out duration-300 bg-white">
                <div className="w-full h-[60px] px-[16px] py-[12px] border-r-[1px] border-b-[1px] border-[#E9EAEB]">
                    <div className="w-[24px] group-hover:w-full h-full m-auto">
                        <Logo
                            width={128}
                            height={35}
                            twClass="object-cover h-full object-[0%_center]"
                        />
                    </div>
                </div>
                <div className="w-full h-[900px] py-5 px-4 border-[1px] border-[#E9EAEB] border-t-0">
                    {/* siderbar main menu */}
                    <div className="mb-5 w-full h-full">
                        {
                            data.map((group: SidebarDataType) => (
                                <div key={group.name} className="group-hover:mb-[20px]">
                                    <div className="text-[#717680] text-[14px] mb-3 hidden group-hover:block">
                                        {group.name}
                                    </div>
                                    <ul className="w-full flex flex-col gap-[6px]">
                                        {
                                            group.data.map((link: LinkDataType) => (
                                                <SidebarBtn
                                                    key={link.href}
                                                    isActive={link.isActive}
                                                    href={link.href}
                                                    label={link.label}
                                                    labelTw="hidden group-hover:block"
                                                    leadingIcon={link.leadingIcon}
                                                    trailingIcon={link.trailingIcon}
                                                    trailingIconTw="hidden group-hover:block"
                                                    onClick={() => onClickHandler(link.href)}
                                                />
                                            ))
                                        }
                                    </ul>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
