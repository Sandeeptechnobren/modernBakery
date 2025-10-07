// import { useState, useEffect } from "react";
// import ContainerCard from "@/app/components/containerCard";
// import CustomCheckbox from "@/app/components/customCheckbox";
// import InputFields from "@/app/components/inputFields";

// type KeyComboType = {
//   Location: string[];
//   Customer: string[];
//   Item: string[];
// };

// type KeyOption = { label: string; isSelected: boolean };
// type KeyGroup = { type: string; options: KeyOption[] };

// const initialKeys: KeyGroup[] = [
//   {
//     type: "Location",
//     options: [
//       { label: "Country", isSelected: false },
//       { label: "Region", isSelected: false },
//       { label: "Area", isSelected: false },
//       { label: "Route", isSelected: false },
//     ],
//   },
//   {
//     type: "Customer",
//     options: [
//       { label: "Sales Organisation", isSelected: false },
//       { label: "Channel", isSelected: false },
//       { label: "Sub Channel", isSelected: false },
//       { label: "Parent Customer", isSelected: false },
//       { label: "Customer Category", isSelected: false },
//       { label: "Customer", isSelected: false },
//     ],
//   },
//   {
//     type: "Item",
//     options: [
//       { label: "Major Category", isSelected: false },
//       { label: "Item Group", isSelected: false },
//       { label: "Item", isSelected: false },
//     ],
//   },
// ];

// export default function SelectKeyCombination({ setKeyCombo }: { setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>> }) {
//   const [keysArray, setKeysArray] = useState<KeyGroup[]>(initialKeys);

//   // Sync selected keys to parent state (keyCombo)
//   useEffect(() => {
//     const selected: { Location: string[]; Customer: string[]; Item: string[] } = { Location: [], Customer: [], Item: [] };
//     keysArray.forEach((group) => {
//       if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
//         selected[group.type] = group.options.filter((o) => o.isSelected).map((o) => o.label);
//       }
//     });
//     setKeyCombo(selected);
//   }, [keysArray, setKeyCombo]);

//   function onKeySelect(index: number, optionIndex: number) {
//     setKeysArray((prev) => {
//       const newKeys = prev.map((group, i) => {
//         if (i !== index) return group;
//         return {
//           ...group,
//           options: group.options.map((opt, j) =>
//             j === optionIndex ? { ...opt, isSelected: !opt.isSelected } : opt
//           ),
//         };
//       });
//       return newKeys;
//     });
//   }

//   return (
//     <ContainerCard className="h-fit mt-[20px] flex flex-col gap-2 p-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none text-[#181D27]">
//       <div className="font-semibold text-[20px] mb-4">Key Combination</div>
//       <div className="mb-4">
//         <InputFields
//           label="Select Key"
//           type="select"
//           options={[
//             { label: "Country / Channel / Majority", value: "0" },
//             { label: "Country / Channel / Item Group", value: "1" },
//             { label: "Country / Region / Channel / Major Category", value: "2" },
//           ]}
//           value=""
//           onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {}}
//           width="w-full"
//         />
//       </div>
//       <div className="grid grid-cols-3 gap-6">
//         {keysArray.map((group, index) => (
//           <div
//             key={index}
//             className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col shadow-sm"
//           >
//             <div className="font-semibold text-[18px] mb-4 text-[#181D27]">{group.type}</div>
//             <div className="flex flex-col gap-4">
//               {group.options.map((option, optionIndex) => (
//                 <CustomCheckbox
//                   key={optionIndex}
//                   id={option.label + index}
//                   label={option.label}
//                   checked={option.isSelected}
//                   onChange={() => onKeySelect(index, optionIndex)}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//       <ContainerCard className="mt-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none p-4 flex items-center gap-2">
//         <span className="font-semibold text-[#181D27] text-[16px]">Key</span>
//         <div className="flex flex-wrap items-center gap-2">
//           {/* Location */}
//           {(() => {
//             const loc = keysArray.find(g => g.type === "Location")?.options.filter(o => o.isSelected).map(o => o.label) || [];
//             return loc.length > 0 ? loc.map((k, i) => (
//               <span key={"loc-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
//             )) : null;
//           })()}
//           {/* Customer */}
//           {(() => {
//             const cust = keysArray.find(g => g.type === "Customer")?.options.filter(o => o.isSelected).map(o => o.label) || [];
//             return cust.length > 0 ? [
//               <span key="slash-cust" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
//               ...cust.map((k, i) => (
//                 <span key={"cust-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
//               ))
//             ] : null;
//           })()}
//           {/* Item */}
//           {(() => {
//             const item = keysArray.find(g => g.type === "Item")?.options.filter(o => o.isSelected).map(o => o.label) || [];
//             return item.length > 0 ? [
//               <span key="slash-item" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
//               ...item.map((k, i) => (
//                 <span key={"item-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
//               ))
//             ] : null;
//           })()}
//         </div>
//       </ContainerCard>
//     </ContainerCard>
//   );
// }

import { useState, useEffect } from "react";
import ContainerCard from "@/app/components/containerCard";
import CustomCheckbox from "@/app/components/customCheckbox";
import InputFields from "@/app/components/inputFields";

type KeyComboType = {
  Location: string[];
  Customer: string[];
  Item: string[];
};

type KeyOption = { label: string; isSelected: boolean };
type KeyGroup = { type: string; options: KeyOption[] };

const initialKeys: KeyGroup[] = [
  {
    type: "Location",
    options: [
      { label: "Company", isSelected: false },
      { label: "Region", isSelected: false },
      { label: "Warehouse", isSelected: false },
      { label: "Area", isSelected: false },
      { label: "Route", isSelected: false },
    ],
  },
  {
    type: "Customer",
    options: [
      { label: "Customer Type", isSelected: false },
      { label: "Channel", isSelected: false },
      { label: "Customer Category", isSelected: false },
      { label: "Customer", isSelected: false },
    ],
  },
  {
    type: "Item",
    options: [
      { label: "Item Category", isSelected: false },
      { label: "Item", isSelected: false },
    ],
  },
];

export default function SelectKeyCombination({ setKeyCombo }: { setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>> }) {
  const [keysArray, setKeysArray] = useState<KeyGroup[]>(initialKeys);
  const [selectedKey, setSelectedKey] = useState<string>("");

  // Sync selected keys to parent state (keyCombo)
  useEffect(() => {
    const selected: { Location: string[]; Customer: string[]; Item: string[] } = { Location: [], Customer: [], Item: [] };
    keysArray.forEach((group) => {
      if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
        selected[group.type] = group.options.filter((o) => o.isSelected).map((o) => o.label);
      }
    });
    setKeyCombo(selected);
  }, [keysArray, setKeyCombo]);

  function onKeySelect(index: number, optionIndex: number) {
    console.log("Toggled:", index, optionIndex);
    setKeysArray((prev) => {
      const newKeys = prev.map((group, i) => {
        if (i !== index) return group;
        return {
          ...group,
          options: group.options.map((opt, j) =>
            j === optionIndex ? { ...opt, isSelected: !opt.isSelected } : opt
          ),
        };
      });
      console.log("Updated keysArray:", newKeys);
      return newKeys;
    });
  }

  // Handle changes to the select dropdown
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setSelectedKey(e.target.value);
  };

  return (
    <ContainerCard className="h-fit mt-[20px] flex flex-col gap-2 p-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none text-[#181D27]">
      <div className="font-semibold text-[20px] mb-4">Key Combination</div>
      
      {/* Dropdown for Select Key */}
      <div className="mb-4">
        <InputFields
          label="Select Key"
          type="select"
          options={[
            { label: "Country / Channel / Majority", value: "0" },
            { label: "Country / Channel / Item Group", value: "1" },
            { label: "Country / Region / Channel / Major Category", value: "2" },
          ]}
          value={selectedKey}
          onChange={handleSelectChange}
          width="w-full"
        />
      </div>
      
      {/* Render Location, Customer, and Item Key Checkboxes */}
      <div className="grid grid-cols-3 gap-6">
        {keysArray.map((group, index) => (
          <div
            key={index}
            className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col shadow-sm"
          >
            <div className="font-semibold text-[18px] mb-4 text-[#181D27]">{group.type}</div>
            <div className="flex flex-col gap-4">
              {group.options.map((option, optionIndex) => (
                <CustomCheckbox
                  key={optionIndex}
                  id={option.label + index}
                  label={option.label}
                  checked={option.isSelected}
                  onChange={() => onKeySelect(index, optionIndex)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Display the selected keys */}
      <ContainerCard className="mt-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none p-4 flex items-center gap-2">
        <span className="font-semibold text-[#181D27] text-[16px]">Key</span>
        <div className="flex flex-wrap items-center gap-2">
          {/* Location */}
          {(() => {
            const loc = keysArray.find(g => g.type === "Location")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return loc.length > 0 ? loc.map((k, i) => (
              <span key={"loc-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
            )) : null;
          })()}
          
          {/* Customer */}
          {(() => {
            const cust = keysArray.find(g => g.type === "Customer")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return cust.length > 0 ? [
              <span key="slash-cust" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...cust.map((k, i) => (
                <span key={"cust-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
          
          {/* Item */}
          {(() => {
            const item = keysArray.find(g => g.type === "Item")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return item.length > 0 ? [
              <span key="slash-item" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...item.map((k, i) => (
                <span key={"item-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
        </div>
      </ContainerCard>
    </ContainerCard>
  );
}
