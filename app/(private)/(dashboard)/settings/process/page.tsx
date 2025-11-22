"use client";

import React from "react";
import ReactFlow, { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

const nodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: (
        <div className="p-4 border rounded-xl bg-white shadow-sm w-56">
          <p className="font-semibold text-sm">Standard Ord-</p>
          <p className="font-semibold text-sm">Credit 30077651</p>

          <p className="text-green-600 font-medium mt-2">✔ Completed</p>
          <p className="text-xs text-gray-500 mt-1">
            Requested Delivery on 09.09.2025
          </p>
          <p className="text-xs text-gray-500">Completely Invoiced</p>
        </div>
      ),
    },
    type: "default",
  },
  {
    id: "2",
    position: { x: 300, y: 0 },
    data: {
      label: (
        <div className="p-4 border rounded-xl bg-white shadow-sm w-56">
          <p className="font-semibold text-sm">Delivery</p>
          <p className="font-semibold text-sm">800179398</p>

          <p className="text-green-600 font-medium mt-2">✔ Shipped</p>
          <p className="text-xs text-gray-500 mt-1">Shipped on 09.09.2025</p>
        </div>
      ),
    },
    type: "default",
  },
  {
    id: "3",
    position: { x: 600, y: 0 },
    data: {
      label: (
        <div className="p-4 border rounded-xl bg-white shadow-sm w-56">
          <p className="font-semibold text-sm">Tax Invoice</p>
          <p className="font-semibold text-sm">9000129232</p>

          <p className="text-green-600 font-medium mt-2">✔ Completed</p>
          <p className="text-xs text-gray-500 mt-1">Billed on 09.09.2025</p>
        </div>
      ),
    },
    type: "default",
  },
  {
    id: "4",
    position: { x: 900, y: 0 },
    data: {
      label: (
        <div className="p-4 border rounded-xl bg-white shadow-sm w-56">
          <p className="font-semibold text-sm">Journal Entry</p>
          <p className="font-semibold text-sm">9000129232</p>

          <p className="text-gray-400 font-medium mt-2">» Not Cleared</p>
          <p className="text-xs text-gray-500 mt-1">Posted on 09.09.2025</p>
        </div>
      ),
    },
    type: "default",
  },
];

const edges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true },
];

export default function ProcessFlowPage() {
  return (
    <div className="w-full h-[600px] bg-gray-50 p-10">
      <h1 className="text-xl font-semibold mb-6">Process Flow</h1>

      <div className="w-full h-full border rounded-xl overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} fitView />
      </div>
    </div>
  );
}