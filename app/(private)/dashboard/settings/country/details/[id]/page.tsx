"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { countryById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface CountryItem {
  country_code: string;
  country_name: string;
  currency: string;
  status: number;
}

const TITLE = "Country Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [countryDetails, setCountryDetails] = useState<CountryItem | null>(
    null
  );

  useEffect(() => {
    const fetchCountryDetails = async () => {
      setLoading(true);
      const res = await countryById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch country Details",
          "error"
        );
        return;
      }
      setCountryDetails(res.data);
    };
    fetchCountryDetails();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/country/">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{TITLE}</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-[20px]">
        {/* Right details card */}
        <ContainerCard className="w-full">
          <KeyValueData
            data={[
              {
                value: countryDetails?.country_code ?? "-",
                key: "Code",
              },
              {
                value: countryDetails?.country_name ?? "-",
                key: "Name",
              },
              {
                value: countryDetails?.currency ?? "-",
                key: "Currency",
              },
              {
                value: countryDetails?.status === 1 ? "Active" : "Inactive",
                key: "Status",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
