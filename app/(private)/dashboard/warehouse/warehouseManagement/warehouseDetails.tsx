"use client"

import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function WarehouseDetails() {
  const [warehouseType, setWarehouseType] = useState("");
  const [warehouseCode, setWarehouseCode] = useState("");
  const [agentId, setAgentId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [bussinessType, setBussinessType] = useState("");



  return (
   
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      <InputFields
        label="Warehouse Type"
        value={warehouseType}
        onChange={(e) => setWarehouseType(e.target.value)}
        options={[
          { value: "agent", label: "Agent" },
          { value: "hariss outlet", label: "Hariss Outlet" },
     
        ]}
      />

      <InputFields
        label="Warehouse Name"
        value={warehouseCode}
        onChange={(e) => setWarehouseCode(e.target.value)}
      />

      <InputFields
        label="Warehouse Code"
        value={warehouseCode}
        onChange={(e) => setWarehouseCode(e.target.value)}
      />
       <InputFields
        label="Agent ID"
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
      />

      <InputFields
        label="Warehouse Owner Name "
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
      />

      <InputFields
        label="Bussiness Type"
        value={bussinessType}
        onChange={(e) => setBussinessType(e.target.value)}
        options={[
          { value: "B2B ", label: "B2B " },

        ]}
      />

    

     
 
    </div>
    
  );
}