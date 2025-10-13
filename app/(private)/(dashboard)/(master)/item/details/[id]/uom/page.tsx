"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { itemById } from "@/app/services/allApi";

interface UOM {
  id: number;
  name: string;
  price: string;
  uom_type: string;
  upc: string | null;
  is_stock_keeping_unit: boolean;
  enable_for: string;
}

export default function Uom() {
  const params = useParams();
  const id = Array.isArray(params.id)
    ? params.id[0] || ""
    : (params.id as string) || "";

  const [uomList, setUomList] = useState<UOM[]>([]);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await itemById(id);

        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch UOM data", "error");
          return;
        }

        const uoms = res.data?.uom || [];
        if (uoms.length === 0) {
          showSnackbar("No UOM data found", "info");
        }

        // ✅ Set all UOMs
        setUomList(uoms);
      } catch (err) {
        showSnackbar("Unable to fetch UOM details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, setLoading, showSnackbar]);

  return (
    <ContainerCard className="w-full p-5">
      <h2 className="text-lg font-semibold mb-4">Unit of Measurement (UOM)</h2>

      {uomList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uomList.map((uom) => (
            <ContainerCard
              key={uom.id}
              className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                {uom.uom_type || "UOM"}
              </h3>

              <div className="space-y-1 text-gray-700 text-sm">
                <p>
                  <strong>Name:</strong> {uom.name || "-"}
                </p>
                <p>
                  <strong>Price:</strong> ₹{uom.price || "0.00"}
                </p>
                <p>
                  <strong>UPC:</strong> {uom.upc || "N/A"}
                </p>
                <p>
                  <strong>Enable For:</strong> {uom.enable_for || "-"}
                </p>
                <p>
                  <strong>Is Stock Keeping Unit:</strong>{" "}
                  {uom.is_stock_keeping_unit ? "Yes" : "No"}
                </p>
              </div>
            </ContainerCard>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No UOM data available.</p>
      )}
    </ContainerCard>
  );
}