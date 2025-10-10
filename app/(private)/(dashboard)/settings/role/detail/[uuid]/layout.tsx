"use client";

import ContainerCard from "@/app/components/containerCard";
import SummaryCard from "@/app/components/summaryCard";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import Table from "./table";

export default function CustomerDetails() {
  const router = useRouter();

  return (
    <div className="w-full px-4 py-4 sm:px-6 md:px-8 lg:px-10 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-4">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.back()}
            className="cursor-pointer"
          />
          <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#181D27]">
            User Role Assignment
          </h1>
        </div>
      </div>

      {/* Summary Card */}
      <ContainerCard className="w-full mb-6 bg-[#E9EAEB]">
        <SummaryCard
          icon="gridicons:user"
          iconCircleTw="bg-[#535862] text-white w-[60px] h-[60px] p-[15px]"
          iconWidth={30}
          title="ORG Admin"
          description="Supervisor"
        />
      </ContainerCard>

      {/* Table Section */}
      <div className="w-full overflow-x-auto">
        <Table />
      </div>
    </div>
  );
}


