"use client"

import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";

export default function SalesmanDetailsForm() {
  const [isOpen,setIsOpen] = useState(false)
     const [salesmanCode, setSalesmanCode] = useState("");
     const [salesmanName, setSalesmanName] = useState("");
      const [sapId, setSapId] = useState("");
  const [salesmanType, setSalesmanType] = useState("");
  const [salesmanSubType, setSalesmanSubType] = useState("");
 
 
  const [salesmanWarehouse, setSalesmanWarehouse] = useState("");


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex items-end gap-2 max-w-[406px]">
                                                    <InputFields
                                                      label="Salesman Code"
                                                      value={salesmanCode}
                                                      onChange={(e) => setSalesmanCode(e.target.value)}
                                                    />
                                                  
                                                    <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]"
                                                      icon="mi:settings"
                                                      onClick={() => setIsOpen(true)}
                                                    />
                                                  
                                                    <SettingPopUp
                                                      isOpen={isOpen}
                                                      onClose={() => setIsOpen(false)}
                                                      title="Salesman Code"
                                                    />
                                                  </div>

      
      
      <InputFields
        label="Salesman Name"
        value={salesmanName}
        onChange={(e) => setSalesmanName(e.target.value)}
      />
      
   <InputFields
        label="SAP_ID "
        value={sapId}
        onChange={(e) => setSapId(e.target.value)}
      />
      <InputFields
        label="Salesman Type"
        value={salesmanType}
        onChange={(e) => setSalesmanType(e.target.value)}
        options={[
          { value: "mxecutive-GT", label: "Sales Executive-GT" },
          { value: "merchandiser", label: "Merchandiser" },
          { value: "Salesman", label: "Salesman" },
        ]}
      />
    <InputFields
        label=" Sub Type"
        value={salesmanSubType}
        onChange={(e) => setSalesmanSubType(e.target.value)}
        options={[
          { value: "executive", label: "Executive-MIT" },
          { value: "merchandiser", label: "Merchandiser-GT" },
          { value: "conf", label: "Sales Executive-Conf" },
          { value: "HORECA", label: "Sales Executive-HORECA" },
        ]}
      />


      <InputFields
        label="Salesman Warehouse "
        value={salesmanWarehouse}
        onChange={(e) => setSalesmanWarehouse(e.target.value)}
        options={[
          { value: "Assigned", label: "Assigned warehouse. " },
      
        ]}
      />

 

   
    </div>
  );
}
