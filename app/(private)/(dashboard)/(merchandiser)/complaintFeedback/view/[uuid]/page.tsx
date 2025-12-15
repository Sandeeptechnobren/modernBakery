"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { complaintFeedbackByUUID } from "@/app/services/merchandiserApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type FormValues = {
  complaint_code: string;
  complaint_title: string;
  merchendiser: { name: string } ;
  item: {item_name: string};
  type: string;
  description: string;
  status?: number;
};

const title = "Complaint Feedback Details";
const backBtnUrl = "/merchandiser/complaintFeedback";

export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : (params.uuid as string);

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [feedback, setFeedback] = useState<FormValues | null>(null);

  useEffect(() => {
    if (!uuid) return;

    const fetchFeedbackDetails = async () => {
      setLoading(true);
      const res = await complaintFeedbackByUUID(uuid);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data?.message || "Unable to fetch Complaint Feedback Details",
          "error"
        );
        return;
      }

      console.log("Complaint feedback API response:", res.data); // 🔍 check structure
      setFeedback(res.data.data); // ✅ API already returns `data: res.data`
    };

    fetchFeedbackDetails();
  }, [uuid, setLoading, showSnackbar]);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      <div className="flex flex-wrap gap-x-[20px]">
        <ContainerCard className="w-full lg:w-[350px]">
          <KeyValueData
            data={[
              { key: "Complaint Code", value: feedback?.complaint_code },
              { key: "Title", value: feedback?.complaint_title },
              { key: "Merchandiser", value: feedback?.merchendiser?.name },
              { key: "Item", value: feedback?.item?.item_name },
              { key: "Description", value: feedback?.description },
              { key: "Type", value: feedback?.type },
              // Uncomment if your API provides a status:
              // { key: "Status", component: <StatusBtn isActive={!!feedback?.status} /> },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
