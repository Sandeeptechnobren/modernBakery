// "use client";

// import { Icon } from "@iconify-icon/react";
// import Link from "next/link";
// import { useState } from "react";
// import InputFields from "@/app/components/inputFields";
// import SidebarBtn from "@/app/components/dashboardSidebarBtn";

// import { createOutletChannel, OutletChannelPayload } from "@/app/services/allApi";

// export default function AddUser() {
   
//     const [outlet_channe, setOutlet_channel] = useState("");
//     const [status, setStatus] = useState(0);
//     const [message, setMessage] = useState<string | null>(null);

//     const handleSubmit = async () => {
//       const payload: OutletChannelPayload = {outlet_channel, status };

//         try {
//             const res = await createOutletChannel(payload);
//             setMessage("Outlet Channel created successfully ✅");
//             console.log(res);
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 throw new Error(error.message);
//             }
//             throw new Error("Unknown error");
//         }
//     };

//     return (
//         <>
//             {/* Header */}
//             <div className="w-full h-full overflow-x-hidden p-4">
//                 <div className="flex justify-between items-center mb-6">
//                     <div className="flex items-center gap-4">
//                         <Link href="/dashboard/settings/user">
//                             <Icon icon="lucide:arrow-left" width={24} />
//                         </Link>
//                         <h1 className="text-xl font-semibold text-gray-900">Add New User</h1>
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
//                     <div className="bg-white rounded-2xl shadow divide-y divide-gray-200">
//                         <div className="p-6">
//                             <h2 className="text-lg font-medium text-gray-800 mb-4">
//                                 Additional Information
//                             </h2>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div>
//                                     <InputFields
//                                         label="Out Channel"
//                                         value={outlet_channel}
//                                         onChange={(e) => setOutlet_channel(e.target.value)}
//                                     />
//                                 </div>
                             
//                                 <div>
//                                     <InputFields
//                                         label="Status"
//                                         value={String(status)} // 👈 always a string
//                                         onChange={(e) => setStatus(Number(e.target.value))} // convert when setting
//                                         options={[
//                                             { value: "1", label: "Active" },   // 👈 string values
//                                             { value: "0", label: "Inactive" },
//                                         ]}
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex justify-end gap-4 mt-6 pr-0">
                       
//                         <SidebarBtn
//                             label="Submit"

//                             leadingIcon="mdi:check"
//                             onClick={handleSubmit}
//                         />
//                     </div>

//                     {/* Message */}
//                     {message && (
//                         <div className="p-4 text-sm text-center text-green-700">
//                             {message}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// }


import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page