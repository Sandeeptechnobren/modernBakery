
// "use client";


// import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
// import ContainerCard from "@/app/components/containerCard";
// import { useSnackbar } from "@/app/services/snackbarContext";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useState, useRef ,useContext} from "react";

// import Link from "next/link";
// import { Icon } from "@iconify-icon/react";
// import Loading from "@/app/components/Loading";
// import CustomCheckbox from "@/app/components/customCheckbox";
// import InputDropdown from "@/app/components/inputDropdown";
// import InputFields from "@/app/components/inputFields";


// export default function AddPricing() {
//   const steps: StepperStep[] = [
//     { id: 1, label: "Key Combination" },
//     { id: 2, label: "Key Value" },
//     { id: 3, label: "Pricing" },
//   ];

//   const {
//     currentStep,
//     nextStep,
//     prevStep,
//     markStepCompleted,
//     isStepCompleted,
//     isLastStep
//   } = useStepperForm(steps.length);
//   const { showSnackbar } = useSnackbar();
//   const params = useParams();
//   const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
//   const isEditMode = id !== undefined && id !== "add";

//   const [loading, setLoading] = useState(false);


//   // --- Stepper Navigation and Submission Logic ---
//   const [stepCompleted, setStepCompleted] = useState([false, false, false]);
//   const [currentStepState, setCurrentStepState] = useState(1); // 1-based

//   // Functions must be inside the component to access state
//   const validateStep = (step: number) => {
//     if (step === 1) {
//       // Require at least one key selected in each section
//       return (
//         keyCombo.Location.length > 0 &&
//         keyCombo.Customer.length > 0 &&
//         keyCombo.Item.length > 0
//       );
//     }
//     if (step === 2) {
//       // If a key is selected, its value must be selected
//       if (keyCombo.Location.includes("Route") && !keyValue.Route) return false;
//       if (keyCombo.Customer.includes("Sales Organisation") && !keyValue.SalesOrganisation) return false;
//       if (keyCombo.Customer.includes("Sub Channel") && !keyValue.SubChannel) return false;
//       if (keyCombo.Item.includes("Item Group") && !keyValue.ItemGroup) return false;
//       return true;
//     }
//     if (step === 3) {
//       // Minimal: require itemName, startDate, endDate
//       return promotion.itemName && promotion.startDate && promotion.endDate;
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (!validateStep(currentStepState)) {
//       showSnackbar("Please fill in all required fields before proceeding.", "warning");
//       return;
//     }
//     setStepCompleted((prev) => {
//       const arr = [...prev];
//       arr[currentStepState - 1] = true;
//       return arr;
//     });
//     if (currentStepState < 3) {
//       setCurrentStepState(currentStepState + 1);
//     }
//   };

//   const handleSubmit = () => {
//     if (!validateStep(3)) {
//       showSnackbar("Please fill in all required fields before submitting.", "error");
//       return;
//     }
//     showSnackbar("Promotion submitted! (implement API call)", "success");
//   };





//   // --- Promotion Stepper: Custom Steps as per Figma ---
//   // Step 1: Key Combination
//   type KeyComboType = {
//     Location: string[];
//     Customer: string[];
//     Item: string[];
//   };
//   const [keyCombo, setKeyCombo] = useState<KeyComboType>({
//     Location: [],
//     Customer: [],
//     Item: [],
//   });
//   // Step 2: Key Value
//   const [keyValue, setKeyValue] = useState({
//     Route: "",
//     SalesOrganisation: "",
//     SubChannel: "",
//     ItemGroup: "",
//   });
//   // Step 3: Promotion
//   const [promotion, setPromotion] = useState({
//     itemName: "",
//     startDate: "",
//     endDate: "",
//     orderType: "All",
//     offerType: "All",
//     type: "Slab",
//     discountType: "Fixed",
//     discountApplyOn: "Quantity",
//     bundle: false,
//     orderItems: [
//       { itemName: "", quantity: "", toQuantity: "", uom: "CTN", price: "" },
//     ],
//     offerItems: [
//       { itemName: "", uom: "BAG", quantity: "" },
//     ],
//   });

//   const keyOptions = {
//     Location: ["Country", "Region", "Area", "Route"],
//     Customer: ["Sales Organisation", "Channel", "Sub Channel", "Parent Customer", "Customer Category", "Customer"],
//     Item: ["Major Category", "Item Group", "Item"],
//   };

// // --- Step 1: Key Combination types and initialKeys (must be above all usage) ---
// type KeyOption = { label: string; isSelected: boolean };
// type KeyGroup = { type: string; options: KeyOption[] };
// const initialKeys: KeyGroup[] = [
//   {
//     type: "Location",
//     options: [
//       { label: "Company", isSelected: false },
//       { label: "Region", isSelected: false },
//       { label: "Warehouse", isSelected: false },
//       { label: "Area", isSelected: false },
//       { label: "Route", isSelected: false },
//     ],
//   },
//   {
//     type: "Customer",
//     options: [
//       { label: "Customer Type", isSelected: false },
//       { label: "Channel", isSelected: false },
//       { label: "Customer Category", isSelected: false },
//       { label: "Customer", isSelected: false },
//     ],
//   },
//   {
//     type: "Item",
//     options: [
//       { label: "Item Category", isSelected: false },
//       { label: "Item", isSelected: false },
//     ],
//   },
// ];

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         // Step 1: Key Combination (custom component)
//         return <SelectKeyCombination setKeyCombo={setKeyCombo} />;


// // --- Step 1: Key Combination component (fixed, self-contained, no external context needed) ---

// function SelectKeyCombination({ setKeyCombo }: { setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>> }) {
//   const [keysArray, setKeyArray] = useState<KeyGroup[]>(initialKeys);
//   const [keyCombination, setKeyCombination] = useState("");
//   const [selectedKey, setSelectedKey] = useState<string>("");

//   // Dropdown options for Select Key
//   const dropdownOptions = [
//     { label: "Country / Channel / Majority", value: "0" },
//     { label: "Country / Channel / Item Group", value: "1" },
//     { label: "Country / Region / Channel / Major Category", value: "2" },
//   ];

//   // Sync selected keys to parent state (keyCombo)
//   useEffect(() => {
//     const selected: { Location: string[]; Customer: string[]; Item: string[] } = { Location: [], Customer: [], Item: [] };
//     keysArray.forEach((group) => {
//       if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
//         selected[group.type] = group.options.filter((o) => o.isSelected).map((o) => o.label);
//       }
//     });
//     setKeyCombo(selected);
//     setKeyCombination(
//       [selected.Location, selected.Customer, selected.Item].flat().filter(Boolean).join(" / ")
//     );
//   }, [keysArray, setKeyCombo]);

//   function onKeySelect(index: number, optionIndex: number) {
//     setKeyArray((prev) => {
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
//           options={dropdownOptions}
//           value={selectedKey}
//           onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setSelectedKey(e.target.value)}
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
//       case 2:
//         // Step 2: Key Value (customCheckboxes in card containers)
//         return (
//           <ContainerCard>
//             <h2 className="text-lg font-semibold mb-6">Key Value</h2>
//             <div className="flex gap-8">
//               {/* Location */}
//               <div className="flex-1">
//                 {keyCombo.Location.includes("Route") && (
//                   <ContainerCard className="mb-4 p-4">
//                     <div className="font-medium mb-2">Route</div>
//                     <div className="flex flex-col gap-2">
//                       {["Route 1", "Route 2"].map((route) => (
//                         <CustomCheckbox
//                           key={route}
//                           id={`route-checkbox-${route.replace(/\s+/g, "-").toLowerCase()}`}
//                           label={route}
//                           checked={keyValue.Route === route}
//                           onChange={() => setKeyValue(s => ({ ...s, Route: s.Route === route ? "" : route }))}
//                         />
//                       ))}
//                     </div>
//                   </ContainerCard>
//                 )}
//               </div>
//               {/* Customer */}
//               <div className="flex-1">
//                 {keyCombo.Customer.includes("Sales Organisation") && (
//                   <ContainerCard className="mb-4 p-4">
//                     <div className="font-medium mb-2">Sales Organisation</div>
//                     <div className="flex flex-col gap-2">
//                       {["Org 1", "Org 2"].map((org) => (
//                         <CustomCheckbox
//                           key={org}
//                           id={`sales-org-checkbox-${org.replace(/\s+/g, "-").toLowerCase()}`}
//                           label={org}
//                           checked={keyValue.SalesOrganisation === org}
//                           onChange={() => setKeyValue(s => ({ ...s, SalesOrganisation: s.SalesOrganisation === org ? "" : org }))}
//                         />
//                       ))}
//                     </div>
//                   </ContainerCard>
//                 )}
//                 {keyCombo.Customer.includes("Sub Channel") && (
//                   <ContainerCard className="mb-4 p-4">
//                     <div className="font-medium mb-2">Sub Channel</div>
//                     <div className="flex flex-col gap-2">
//                       {["Sub 1", "Sub 2"].map((sub) => (
//                         <CustomCheckbox
//                           key={sub}
//                           id={`sub-channel-checkbox-${sub.replace(/\s+/g, "-").toLowerCase()}`}
//                           label={sub}
//                           checked={keyValue.SubChannel === sub}
//                           onChange={() => setKeyValue(s => ({ ...s, SubChannel: s.SubChannel === sub ? "" : sub }))}
//                         />
//                       ))}
//                     </div>
//                   </ContainerCard>
//                 )}
//               </div>
//               {/* Item */}
//               <div className="flex-1">
//                 {keyCombo.Item.includes("Item Group") && (
//                   <ContainerCard className="mb-4 p-4">
//                     <div className="font-medium mb-2">Item Group</div>
//                     <div className="flex flex-col gap-2">
//                       {["Group 1", "Group 2"].map((group) => (
//                         <CustomCheckbox
//                           key={group}
//                           id={`item-group-checkbox-${group.replace(/\s+/g, "-").toLowerCase()}`}
//                           label={group}
//                           checked={keyValue.ItemGroup === group}
//                           onChange={() => setKeyValue(s => ({ ...s, ItemGroup: s.ItemGroup === group ? "" : group }))}
//                         />
//                       ))}
//                     </div>
//                   </ContainerCard>
//                 )}
//               </div>
//             </div>
//           </ContainerCard>
//         );
//       case 3:
//         // Step 3: Promotion
//         return (
//           <ContainerCard>
//             <h2 className="text-lg font-semibold mb-6">Promotion</h2>
//             <div className="flex gap-6 mb-6">
//               <div className="flex-1">
//                 <label>Item Name</label>
//                 <input type="text" placeholder="Enter Code" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.itemName} onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))} />
//               </div>
//               <div className="flex-1">
//                 <label>Start Date</label>
//                 <input type="date" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.startDate} onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))} />
//               </div>
//               <div className="flex-1">
//                 <label>End Date</label>
//                 <input type="date" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.endDate} onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))} />
//               </div>
//             </div>
//             <div className="flex gap-6 mb-6">
//               <div className="flex-1">
//                 <label>Order Type</label>
//                 <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.orderType} onChange={e => setPromotion(s => ({ ...s, orderType: e.target.value }))}>
//                   <option value="All">All</option>
//                   <option value="Type 1">Type 1</option>
//                 </select>
//               </div>
//               <div className="flex-1">
//                 <label>Offer Type</label>
//                 <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.offerType} onChange={e => setPromotion(s => ({ ...s, offerType: e.target.value }))}>
//                   <option value="All">All</option>
//                   <option value="Offer 1">Offer 1</option>
//                 </select>
//               </div>
//               <div className="flex-1">
//                 <label>Type</label>
//                 <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.type} onChange={e => setPromotion(s => ({ ...s, type: e.target.value }))}>
//                   <option value="Slab">Slab</option>
//                   <option value="Type 2">Type 2</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex gap-6 mb-6">
//               <div className="flex-1">
//                 <label>Discount Type</label>
//                 <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.discountType} onChange={e => setPromotion(s => ({ ...s, discountType: e.target.value }))}>
//                   <option value="Fixed">Fixed</option>
//                   <option value="Percent">Percent</option>
//                 </select>
//               </div>
//               <div className="flex-1">
//                 <label>Discount Apply on</label>
//                 <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.discountApplyOn} onChange={e => setPromotion(s => ({ ...s, discountApplyOn: e.target.value }))}>
//                   <option value="Quantity">Quantity</option>
//                   <option value="Value">Value</option>
//                 </select>
//               </div>
//             </div>
//             <div className="mb-4">
//               <label className="flex items-center gap-2">
//                 <input type="checkbox" checked={promotion.bundle} onChange={e => setPromotion(s => ({ ...s, bundle: e.target.checked }))} />
//                 Do you want bundle combination?
//               </label>
//             </div>
//             {/* Order Items Table */}
//             <div className="mb-6 border border-gray-200 rounded">
//               <div className="bg-gray-100 px-4 py-2 font-semibold">Order Item</div>
//               <div className="flex gap-2 px-4 py-2 font-medium">
//                 <div className="flex-2">Item Name</div>
//                 <div className="flex-1">Quantity</div>
//                 <div className="flex-1">To Quantity</div>
//                 <div className="flex-1">UOM</div>
//                 <div className="flex-1">Price</div>
//                 <div className="w-10">Action</div>
//               </div>
//               {promotion.orderItems.map((item, idx) => (
//                 <div key={idx} className="flex gap-2 px-4 py-2 items-center border-t border-gray-100">
//                   <div className="flex-2">
//                     <select className="w-full px-2 py-1 rounded border border-gray-200" value={item.itemName} onChange={e => setPromotion(s => {
//                       const arr = [...s.orderItems]; arr[idx].itemName = e.target.value; return { ...s, orderItems: arr };
//                     })}>
//                       <option value="">Select Item</option>
//                       <option value="Masafi White Facial Tissue">Masafi White Facial Tissue</option>
//                     </select>
//                   </div>
//                   <div className="flex-1">
//                     <input type="number" className="w-full px-2 py-1 rounded border border-gray-200" value={item.quantity} onChange={e => setPromotion(s => {
//                       const arr = [...s.orderItems]; arr[idx].quantity = e.target.value; return { ...s, orderItems: arr };
//                     })} placeholder="e.g. 10" />
//                   </div>
//                   <div className="flex-1">
//                     <input type="number" className="w-full px-2 py-1 rounded border border-gray-200" value={item.toQuantity} onChange={e => setPromotion(s => {
//                       const arr = [...s.orderItems]; arr[idx].toQuantity = e.target.value; return { ...s, orderItems: arr };
//                     })} placeholder="e.g. 10" />
//                   </div>
//                   <div className="flex-1">
//                     <select className="w-full px-2 py-1 rounded border border-gray-200" value={item.uom} onChange={e => setPromotion(s => {
//                       const arr = [...s.orderItems]; arr[idx].uom = e.target.value; return { ...s, orderItems: arr };
//                     })}>
//                       <option value="CTN">CTN</option>
//                       <option value="BAG">BAG</option>
//                     </select>
//                   </div>
//                   <div className="flex-1">
//                     <input type="number" className="w-full px-2 py-1 rounded border border-gray-200" value={item.price} onChange={e => setPromotion(s => {
//                       const arr = [...s.orderItems]; arr[idx].price = e.target.value; return { ...s, orderItems: arr };
//                     })} placeholder="e.g. 500.00" />
//                   </div>
//                   <div className="w-10">
//                     <button type="button" className="text-red-500 text-xl" onClick={() => setPromotion(s => ({ ...s, orderItems: s.orderItems.filter((_, i) => i !== idx) }))}>×</button>
//                   </div>
//                 </div>
//               ))}
//               <div className="px-4 py-2">
//                 <button type="button" className="bg-red-600 text-white rounded px-4 py-1" onClick={() => setPromotion(s => ({ ...s, orderItems: [...s.orderItems, { itemName: "", quantity: "", toQuantity: "", uom: "CTN", price: "" }] }))}>+</button>
//               </div>
//             </div>
//             {/* Offer Items Table */}
//             <div className="mb-6 border border-gray-200 rounded">
//               <div className="bg-gray-100 px-4 py-2 font-semibold">Offer Item</div>
//               <div className="flex gap-2 px-4 py-2 font-medium">
//                 <div className="flex-2">Item Name</div>
//                 <div className="flex-1">UOM</div>
//                 <div className="flex-1">Quantity</div>
//                 <div className="w-10">Action</div>
//               </div>
//               {promotion.offerItems.map((item, idx) => (
//                 <div key={idx} className="flex gap-2 px-4 py-2 items-center border-t border-gray-100">
//                   <div className="flex-2">
//                     <select className="w-full px-2 py-1 rounded border border-gray-200" value={item.itemName} onChange={e => setPromotion(s => {
//                       const arr = [...s.offerItems]; arr[idx].itemName = e.target.value; return { ...s, offerItems: arr };
//                     })}>
//                       <option value="">Select Item</option>
//                       <option value="NMFT128 - Masafi White Facial Tissue 130 Pl">NMFT128 - Masafi White Facial Tissue 130 Pl</option>
//                     </select>
//                   </div>
//                   <div className="flex-1">
//                     <select className="w-full px-2 py-1 rounded border border-gray-200" value={item.uom} onChange={e => setPromotion(s => {
//                       const arr = [...s.offerItems]; arr[idx].uom = e.target.value; return { ...s, offerItems: arr };
//                     })}>
//                       <option value="BAG">BAG</option>
//                       <option value="CTN">CTN</option>
//                     </select>
//                   </div>
//                   <div className="flex-1">
//                     <input type="number" className="w-full px-2 py-1 rounded border border-gray-200" value={item.quantity} onChange={e => setPromotion(s => {
//                       const arr = [...s.offerItems]; arr[idx].quantity = e.target.value; return { ...s, offerItems: arr };
//                     })} placeholder="e.g. 10" />
//                   </div>
//                   <div className="w-10">
//                     <button type="button" className="text-red-500 text-xl" onClick={() => setPromotion(s => ({ ...s, offerItems: s.offerItems.filter((_, i) => i !== idx) }))}>×</button>
//                   </div>
//                 </div>
//               ))}
//               <div className="px-4 py-2">
//                 <button type="button" className="bg-red-600 text-white rounded px-4 py-1" onClick={() => setPromotion(s => ({ ...s, offerItems: [...s.offerItems, { itemName: "", uom: "BAG", quantity: "" }] }))}>+</button>
//               </div>
//             </div>
//           </ContainerCard>
//         );
//       default:
//         return null;
//     }
//   };

//   if (isEditMode && loading) {
//     return (
//       <div className="w-full h-full flex items-center justify-center">
//         <Loading/>
//       </div>
//     );
//   }

//   return (
//     <>
//         <div className="flex items-center gap-2">
//           <Link href="/dashboard/master/pricing">
//             <Icon icon="lucide:arrow-left" width={24} />
//           </Link>
//           <h1 className="text-xl font-semibold text-gray-900">
//             {isEditMode ? "Edit Pricing" : "Add Pricing"}
//           </h1>
//         </div>
//       <div className="flex justify-between items-center mb-6">
//       <StepperForm
//         steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
//         currentStep={currentStep}
//         onStepClick={() => {}}
//         onBack={prevStep}
//         onNext={handleNext}
//         onSubmit={handleSubmit}
//         showSubmitButton={isLastStep}
//         showNextButton={!isLastStep}
//         nextButtonText="Save & Next"
//         submitButtonText={isEditMode ? "Update" : "Submit"}
//       >
//         {renderStepContent()}
//       </StepperForm>
//     </div>
//     </>
//   );
// }

"use client";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import Loading from "@/app/components/Loading";
import CustomCheckbox from "@/app/components/customCheckbox";
import InputDropdown from "@/app/components/inputDropdown";
import InputFields from "@/app/components/inputFields";
import SelectKeyCombination from "./selectKeyCombination";

export default function AddPricing() {
  const steps: StepperStep[] = [
    { id: 1, label: "Key Combination" },
    { id: 2, label: "Key Value" },
    { id: 3, label: "Pricing" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep
  } = useStepperForm(steps.length);
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isEditMode = id !== undefined && id !== "add";

  const [loading, setLoading] = useState(false);

  // Stepper Navigation and Submission Logic
  const [stepCompleted, setStepCompleted] = useState([false, false, false]);
  const [currentStepState, setCurrentStepState] = useState(1); // 1-based

  // Functions must be inside the component to access state
  const validateStep = (step: number) => {
    if (step === 1) {
      // Require at least one key selected in each section
      return (
        keyCombo.Location.length > 0 &&
        keyCombo.Customer.length > 0 &&
        keyCombo.Item.length > 0
      );
    }
    if (step === 2) {
      // If a key is selected, its value must be selected
      if (keyCombo.Location.includes("Route") && !keyValue.Route) return false;
      if (keyCombo.Customer.includes("Sales Organisation") && !keyValue.SalesOrganisation) return false;
      if (keyCombo.Customer.includes("Sub Channel") && !keyValue.SubChannel) return false;
      if (keyCombo.Item.includes("Item Group") && !keyValue.ItemGroup) return false;
      return true;
    }
    if (step === 3) {
      // Minimal: require itemName, startDate, endDate
      return promotion.itemName && promotion.startDate && promotion.endDate;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStepState)) {
      showSnackbar("Please fill in all required fields before proceeding.", "warning");
      return;
    }
    setStepCompleted((prev) => {
      const arr = [...prev];
      arr[currentStepState - 1] = true;
      return arr;
    });
    if (currentStepState < 3) {
      setCurrentStepState(currentStepState + 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(3)) {
      showSnackbar("Please fill in all required fields before submitting.", "error");
      return;
    }
    showSnackbar("Promotion submitted! (implement API call)", "success");
  };

  // Step 1: Key Combination
  type KeyComboType = {
    Location: string[];
    Customer: string[];
    Item: string[];
  };

  const [keyCombo, setKeyCombo] = useState<KeyComboType>({
    Location: [],
    Customer: [],
    Item: [],
  });
  
  const [keyValue, setKeyValue] = useState({
    Route: "",
    SalesOrganisation: "",
    SubChannel: "",
    ItemGroup: "",
  });

  // Step 3: Promotion
  const [promotion, setPromotion] = useState({
    itemName: "",
    startDate: "",
    endDate: "",
    orderType: "All",
    offerType: "All",
    type: "Slab",
    discountType: "Fixed",
    discountApplyOn: "Quantity",
    bundle: false,
    orderItems: [
      { itemName: "", quantity: "", toQuantity: "", uom: "CTN", price: "" },
    ],
    offerItems: [
      { itemName: "", uom: "BAG", quantity: "" },
    ],
  });

  const keyOptions = {
    Location: ["Country", "Region", "Area", "Route"],
    Customer: ["Sales Organisation", "Channel", "Sub Channel", "Parent Customer", "Customer Category", "Customer"],
    Item: ["Major Category", "Item Group", "Item"],
  };

    const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Step 1: Key Combination (custom component)
        return <SelectKeyCombination setKeyCombo={setKeyCombo} />;
 
      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Key Value</h2>
            <div className="flex gap-8">
              {/* Location */}
              <div className="flex-1">
                {keyCombo.Location.includes("Route") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Route</div>
                    <div className="flex flex-col gap-2">
                      {["Route 1", "Route 2"].map((route) => (
                        <CustomCheckbox
                          key={route}
                          id={`route-checkbox-${route.replace(/\s+/g, "-").toLowerCase()}`}
                          label={route}
                          checked={keyValue.Route === route}
                          onChange={() => setKeyValue(s => ({ ...s, Route: s.Route === route ? "" : route }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
              </div>
              {/* Customer */}
              <div className="flex-1">
                {keyCombo.Customer.includes("Sales Organisation") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Sales Organisation</div>
                    <div className="flex flex-col gap-2">
                      {["Org 1", "Org 2"].map((org) => (
                        <CustomCheckbox
                          key={org}
                          id={`sales-org-checkbox-${org.replace(/\s+/g, "-").toLowerCase()}`}
                          label={org}
                          checked={keyValue.SalesOrganisation === org}
                          onChange={() => setKeyValue(s => ({ ...s, SalesOrganisation: s.SalesOrganisation === org ? "" : org }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
                {keyCombo.Customer.includes("Sub Channel") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Sub Channel</div>
                    <div className="flex flex-col gap-2">
                      {["Sub 1", "Sub 2"].map((sub) => (
                        <CustomCheckbox
                          key={sub}
                          id={`sub-channel-checkbox-${sub.replace(/\s+/g, "-").toLowerCase()}`}
                          label={sub}
                          checked={keyValue.SubChannel === sub}
                          onChange={() => setKeyValue(s => ({ ...s, SubChannel: s.SubChannel === sub ? "" : sub }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
              </div>
              {/* Item */}
              <div className="flex-1">
                {keyCombo.Item.includes("Item Group") && (
                  <ContainerCard className="mb-4 p-4">
                    <div className="font-medium mb-2">Item Group</div>
                    <div className="flex flex-col gap-2">
                      {["Group 1", "Group 2"].map((group) => (
                        <CustomCheckbox
                          key={group}
                          id={`item-group-checkbox-${group.replace(/\s+/g, "-").toLowerCase()}`}
                          label={group}
                          checked={keyValue.ItemGroup === group}
                          onChange={() => setKeyValue(s => ({ ...s, ItemGroup: s.ItemGroup === group ? "" : group }))}
                        />
                      ))}
                    </div>
                  </ContainerCard>
                )}
              </div>
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Promotion</h2>
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label>Item Name</label>
                <input type="text" placeholder="Enter Code" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.itemName} onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label>Start Date</label>
                <input type="date" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.startDate} onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label>End Date</label>
                <input type="date" className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.endDate} onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label>Order Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.orderType} onChange={e => setPromotion(s => ({ ...s, orderType: e.target.value }))}>
                  <option value="All">All</option>
                  <option value="Type 1">Type 1</option>
                </select>
              </div>
              <div className="flex-1">
                <label>Offer Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.offerType} onChange={e => setPromotion(s => ({ ...s, offerType: e.target.value }))}>
                  <option value="All">All</option>
                  <option value="Offer 1">Offer 1</option>
                </select>
              </div>
              <div className="flex-1">
                <label>Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.type} onChange={e => setPromotion(s => ({ ...s, type: e.target.value }))}>
                  <option value="Slab">Slab</option>
                  <option value="Type 2">Type 2</option>
                </select>
              </div>
            </div>
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label>Discount Type</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.discountType} onChange={e => setPromotion(s => ({ ...s, discountType: e.target.value }))}>
                  <option value="Fixed">Fixed</option>
                  <option value="Percent">Percent</option>
                </select>
              </div>
              <div className="flex-1">
                <label>Discount Apply on</label>
                <select className="w-full px-2 py-2 rounded border border-gray-200" value={promotion.discountApplyOn} onChange={e => setPromotion(s => ({ ...s, discountApplyOn: e.target.value }))}>
                  <option value="Quantity">Quantity</option>
                  <option value="Value">Value</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={promotion.bundle} onChange={e => setPromotion(s => ({ ...s, bundle: e.target.checked }))} />
                Do you want bundle combination?
              </label>
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link href="/dashboard/master/pricing">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit Pricing" : "Add Pricing"}
        </h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <StepperForm
          steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
          currentStep={currentStep}
          onBack={prevStep}
          onNext={handleNext}
          onSubmit={handleSubmit}
          showSubmitButton={isLastStep}
          showNextButton={!isLastStep}
          nextButtonText="Save & Next"
          submitButtonText={isEditMode ? "Update" : "Submit"}
        >
          {renderStepContent()}
        </StepperForm>
      </div>
    </div>
  );
}
