"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import Table, { configType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Logo from "@/app/components/logo";
import { salesmanLoadByUuid } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface CustomerItem {
  id: number;
  uuid: string;
  osa_code: string;
  salesman_type: { id: number; code: string; name: string };
  warehouse: { id: number; code: string; name: string };
  route: { id: number; code: string; name: string };
  salesman: { id: number; code: string; name: string };
  project_type: { id: number; code: string; name: string };
  details: Array<{
    id: number;
    uuid: string;
    osa_code: string;
    item: { id: number; code: string; name: string };
    uom_name: string;
    qty: number;
    price: string;
    status: number;
  }>;
}

const backBtnUrl = "/salesmanLoad";

export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";

  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  const title = `Load ${customer?.osa_code || "-"}`;

  // ✅ PDF Download
  const handleDownload = async () => {
    try {
      const element = document.getElementById("print-area");
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${customer?.osa_code || "Salesman_Load"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  // ✅ Print Function
  const handlePrint = () => window.print();

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await salesmanLoadByUuid(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Load Details",
            "error"
          );
          return;
        }
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch Salesman Load Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, setLoading, showSnackbar]);

  // ✅ Table config
  const columns: configType["columns"] = [
    { key: "item", label: "Item" },
    { key: "uom", label: "UOM" },
    { key: "qty", label: "Quantity" },
    { key: "price", label: "Price" },
  ];

  // ✅ Prepare table data
  const tableData =
    customer?.details?.map((detail) => ({
      item: detail.item
        ? `${detail.item.code} - ${detail.item.name}`
        : "-",
      uom: detail.uom_name || "-",
      qty: detail.qty?.toString() ?? "-",
      price: detail.price ?? "-",
    })) || [];

  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon
            icon="lucide:arrow-left"
            width={24}
            className="text-gray-700 hover:text-primary transition"
          />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </div>

      {/* ---------- Main Card ---------- */}
      <ContainerCard>
        {/* Add print-area wrapper */}
        <div id="print-area">
          {/* Top Section */}
          <div className="flex justify-between flex-wrap gap-6 items-start">
            <Logo type="full" />
            <div className="text-right">
              <h2 className="text-4xl font-bold text-gray-400 uppercase mb-2">
                Load
              </h2>
              <p className="text-primary text-sm tracking-[5px]">
                {customer?.osa_code || "-"}
              </p>
            </div>
          </div>

          <hr className="border-gray-200 my-5" />

          {/* ---------- Info & Table Section ---------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* ---------- Left Side (Details) ---------- */}
            <div className="flex flex-col ">
              <KeyValueData
                data={[
                  {
                    key: "Warehouse",
                    value:
                      customer?.warehouse?.code && customer?.warehouse?.name
                        ? `${customer.warehouse.code} - ${customer.warehouse.name}`
                        : "-",
                  },
                  {
                    key: "Route",
                    value: customer?.route
                      ? `${customer.route.code} - ${customer.route.name}`
                      : "-",
                  },
                  {
                    key: "Salesman Type",
                    value: customer?.salesman_type?.name || "-",
                  },
                  {
                    key: "Project Type",
                    value: customer?.project_type?.name || "-",
                  },
                  {
                    key: "Salesman",
                    value: customer?.salesman
                      ? `${customer.salesman.code} - ${customer.salesman.name}`
                      : "-",
                  },
                ]}
              />

              {/* Image Section */}
              {/* <div className="flex justify-start items-center">
                <Image
                  src="/logo.png"
                  alt="Salesman Signature"
                  width={250}
                  height={250}
                  className="rounded-lg object-contain"
                />
              </div> */}
            </div>

            {/* ---------- Right Side (Table) ---------- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Load Items
              </h3>
              <Table data={tableData} config={{ columns }} />
            </div>
          </div>
        </div>

        {/* ---------- Footer Buttons ---------- */}
        <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
          <SidebarBtn
            leadingIcon="lucide:download"
            leadingIconSize={20}
            label="Download"
            onClick={handleDownload}
          />
          <SidebarBtn
            isActive
            leadingIcon="lucide:printer"
            leadingIconSize={20}
            label="Print Now"
            onClick={handlePrint}
          />
        </div>
      </ContainerCard>
    </>
  );
}
