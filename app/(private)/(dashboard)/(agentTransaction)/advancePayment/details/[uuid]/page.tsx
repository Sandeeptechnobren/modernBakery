"use client";

import { getPaymentById } from "@/app/services/allApi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "@/app/components/Loading";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import Logo from "@/app/components/logo";
import ContainerCard from "@/app/components/containerCard";
import ImagePreviewModal from "@/app/components/ImagePreviewModal";

interface PaymentData {
  osa_code: string;
  payment_type: string;
  companybank_id: string;
  cheque_no: string;
  cheque_date: string;
  agent_id: string;
  amount: string;
  recipt_no: string;
  recipt_date: string;
  recipt_image: string | null;
  status: string;
}

const PaymentDetails = () => {
  const params = useParams();
  const id = params.uuid;
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const API_BASE_URL = "https://api.coreexl.com/osa_productionV2/public";

  useEffect(() => {
    if (id && id !== "add") {
      setLoading(true);
      (async () => {
        try {
          const res = await getPaymentById(String(id));
          const responseData = res?.data;
          if (!responseData) return;

          const paymentTypeMap: { [key: number]: string } = {
            1: "cash",
            2: "cheque",
            3: "transfer",
          };

          let receiptImageUrl = null;
          if (responseData.recipt_image) {
            receiptImageUrl = responseData.recipt_image.startsWith("http")
              ? responseData.recipt_image
              : `${API_BASE_URL}/${responseData.recipt_image.replace(/^\//, "")}`;
          }

          const paymentData: PaymentData = {
            osa_code: responseData.osa_code || "",
            payment_type: paymentTypeMap[responseData.payment_type] || "",
            companybank_id: responseData.companybank_id?.toString() || "",
            cheque_no: responseData.cheque_no || "",
            cheque_date: responseData.cheque_date || "",
            agent_id: responseData.agent_id?.toString() || "",
            amount: responseData.amount?.toString() || "",
            recipt_no: responseData.recipt_no || "",
            recipt_date: responseData.recipt_date || "",
            recipt_image: receiptImageUrl,
            status: responseData.status === 1 ? "active" : "inactive",
          };

          setData(paymentData);
        } catch (error) {
          console.error("Failed to fetch payment details:", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  const formatDate = (date: string) =>
    date ? new Date(date).toLocaleDateString() : "N/A";
  const formatCurrency = (amount: string) =>
    amount ? `$${parseFloat(amount).toFixed(2)}` : "N/A";

  if (loading) return <Loading />;

  if (!data) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-red-500">Payment data not found</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/advancePayment" className="text-gray-600 hover:text-gray-900">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Payment Details
        </h1>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-start mb-10 px-5 pb-5 pt-10 flex-wrap gap-[20px] border-b border-gray-300">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  data.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {data.status}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              PAYMENT
            </span>
            <span className="text-primary text-end text-[14px] tracking-[10px]">
              {"#" + data.osa_code}
            </span>
            
          </div>
          
        </div>

        <div className="px-5">
          <Section title="Basic Information">
            <Grid>
              <Field label="OSA Code" value={data.osa_code ? `#${data.osa_code}` : "N/A"} />
              <Field label="Amount" value={formatCurrency(data.amount)} />
            </Grid>
          </Section>

          <Section title="Payment Information">
            <Grid>
              <Field label="Payment Type" value={data.payment_type || "N/A"} />
              <Field label="Bank ID" value={data.companybank_id || "N/A"} />
              <Field label="Agent ID" value={data.agent_id || "N/A"} />
            </Grid>
          </Section>

          {(data.payment_type === "cheque" || data.cheque_no) && (
            <Section title="Cheque Information">
              <Grid>
                <Field label="Cheque Number" value={data.cheque_no || "N/A"} />
                <Field label="Cheque Date" value={formatDate(data.cheque_date)} />
              </Grid>
            </Section>
          )}

          <Section title="Receipt Information">
            <Grid>
              <Field label="Receipt Number" value={data.recipt_no || "N/A"} />
              <Field
                label="Receipt Date"
                value={formatDate(data.recipt_date)}
              />
              <div className="flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                  aria-label="View receipt image"
                >
                  <span className="text-sm font-medium">View Image</span>
                  <Icon icon="mdi:eye" width={18} />
                </button>
              </div>
            </Grid>
          </Section>
        </div>
      </div>

      <ImagePreviewModal
        images={data?.recipt_image ? [data.recipt_image] : []}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

    </>
  );
};

export default PaymentDetails;

// Utility Components
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <ContainerCard>
    <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
      {title}
    </h2>
    {children}
  </ContainerCard>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <label className="block text-sm text-gray-500">{label}</label>
    <p className="mt-1 text-base font-medium text-gray-900">{value}</p>
  </div>
);

// Add modal outside helpers so it renders at top level of the component
