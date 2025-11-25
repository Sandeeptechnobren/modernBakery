"use client";
import React, { Children, useMemo, useState } from "react";
import TabBtn from "../../../components/tabBtn";
import { initialLinkData, LinkDataType } from "../../data/settingLinks";
import ContainerCard from "@/app/components/containerCard";

export default function SettingsDevPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const groups = initialLinkData || [];

  const tabs: LinkDataType[] = useMemo(() => {
    const acc: LinkDataType[] = [];
    groups.forEach((group) => {
      (group.data || []).forEach((item) => {
        acc.push(item);
        if (item.children && item.children.length) {
          acc.push(...item.children);
        }
      });
    });
    return acc;
  }, [groups]);

  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-semibold">Settings (Dev)</h1>
      </div>

      <ContainerCard className="flex gap-3 overflow-x-auto scrollbar-none !p-1 mb-6">
        {tabs.map((t, idx) => (
          <div key={t.label + idx} className="px-2">
            <TabBtn
              label={t.label}
              isActive={idx === activeIdx}
              onClick={() => setActiveIdx(idx)}
            />
          </div>
        ))}
      </ContainerCard>

      {children}
    </>
  );
}
