"use client";
import ContainerCard from "@/app/components/containerCard";
import React from "react";


interface CardProps {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, extra }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-700">{title}</h3>
        {extra && <div>{extra}</div>}
      </div>
      <div className="flex justify-center">{children}</div>
    </div>
  );
};

export default function Dashboard() {
  const pieData1 = {
    labels: ["Yes", "No", "Maybe"],
    datasets: [
      {
        data: [50, 25, 25],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  const pieData2 = {
    labels: ["Brand A", "Brand B", "Brand C"],
    datasets: [
      {
        data: [75, 25, 0],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ["Rock Boom", "Riham Cola", "Sky View"],
    datasets: [
      {
        label: "Quantity",
        data: [2, 3, 1],
        backgroundColor: ["#3b82f6", "#f472b6", "#fbbf24"],
      },
    ],
  };

  const pieOptions = {
    maintainAspectRatio: false,
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Responses">4</Card>
        <Card title="Total Salesman">1</Card>
        {/* <Card title="Analyze up-to-date results in Excel" extra={<button className="text-purple-600">Download</button>} /> */}
      </div>

      {/* Survey Question Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="1. Do you like the taste of Riham Cola?">
          <div style={{ width: "200px", height: "200px" }}>
      
          </div>
        </Card>

        <Card title="2. Feedback of salesman?">
          <div className="text-center">3 Responses Submitted</div>
          <ul className="list-disc ml-5 mt-2 text-gray-600">
            <li>good</li>
            <li>flu</li>
            <li>fdgdfghjfgfghhffvwwwvvv</li>
          </ul>
        </Card>

        <Card title="3. Getting promotions regularly?">
          <div style={{ width: "200px", height: "200px" }}>
           
          </div>
        </Card>

        <Card title="4. What products do you like the most?">
          <div style={{ width: "300px", height: "200px" }}>
         
          </div>
        </Card>

        <Card title="5. Suggestions for Riham?">
          <div>4 Responses Submitted</div>
          <ul className="list-disc ml-5 mt-2 text-gray-600">
            <li>Increase rockboom qty</li>
            <li>Riham products are very tasty</li>
            <li>ABC</li>
            <li>Demo</li>
          </ul>
        </Card>

        <Card title="6. Which brand do you like?">
          <div style={{ width: "200px", height: "200px" }}>
            
          </div>
        </Card>
      </div>
    </div>
  );
}