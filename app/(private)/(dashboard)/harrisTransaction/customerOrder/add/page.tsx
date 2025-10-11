"use client";
import { useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Logo from "@/app/components/logo";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function AddOrder() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { customerType } = useAllDropdownListData();

  // ---------- Form State ----------
  const [formData, setFormData] = useState({
    customerType: "",
    customerName: "",
    deliveryDate: "",
    priceList: "",
    comments: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ---------- Validation ----------
  const validationSchema = yup.object().shape({
    customerType: yup.string().required("Customer Type is required"),
    customerName: yup.string().required("Customer Name is required"),
    deliveryDate: yup.string().required("Delivery Date is required"),
    priceList: yup.string().required("Price List is required"),
    comments: yup.string().required("Comment is required"),
  });

  // ---------- Handle Change ----------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    try {
      setErrors({});
      await validationSchema.validate(formData, { abortEarly: false });
      setSubmitting(true);

      console.log("Submitted Data:", formData);
      showSnackbar("Form submitted successfully!", "success");

      // reset form after submit
      setFormData({
        customerType: "",
        customerName: "",
        deliveryDate: "",
        priceList: "",
        comments: "",
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        console.log(formErrors);
        setErrors(formErrors);
        showSnackbar("All fields are required", "error");
      } else {
        showSnackbar("Something went wrong", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const orderId = "#W1020933";
  const IdsChar = [...orderId];

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-row items-center gap-4">
          <Link href="/harrisTransaction/customerOrder">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Add Order</h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="bg-white rounded-xl shadow divide-y divide-gray-200 mb-6">
          <div className="p-5 flex flex-row justify-between items-start align-middle">
            <div>
              <Logo type="full" />
              <h1 className="text-xs py-2">
                Emma-Köhler-Allee 4c, Germering - 13907
              </h1>
            </div>
            <div className="flex flex-col justify-center align-middle items-center">
              <h1 className="text-3xl text-gray-500">ORDER</h1>
              <div className="flex flex-row">
                {IdsChar.map((char, index) => (
                  <h1 key={index} className="pl-1 text-xs font-mono">
                    {char}
                  </h1>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Customer Type"
                  name="customerType"
                  value={formData.customerType}
                  options={customerType.map(
                    (ct: {
                      id?: string | number;
                      value?: string | number;
                      name?: string;
                      label?: string;
                    }) => ({
                      value: String(ct.id ?? ct.value ?? ""), // ✅ ensures it's always a string
                      label: String(ct.name ?? ct.label ?? ""), // ✅ ensures it's always a string
                    })
                  )}
                  onChange={handleChange}
                />
                {errors.customerType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerType}
                  </p>
                )}
              </div>

              <div>
                <InputFields
                  required
                  label="Customer Name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <InputFields
                  required
                  type="date"
                  label="Delivery Date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                />
                {errors.deliveryDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.deliveryDate}
                  </p>
                )}
              </div>

              <div>
                <InputFields
                  required
                  label="Price List"
                  name="priceList"
                  value={formData.priceList}
                  onChange={handleChange}
                />
                {errors.priceList && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.priceList}
                  </p>
                )}
              </div>

              <div>
                <InputFields
                  required
                  label="Comment"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                />
                {errors.comments && (
                  <p className="text-red-500 text-sm mt-1">{errors.comments}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6 pr-0">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/(dashboard)/(master)/route")}
          >
            Cancel
          </button>
          <SidebarBtn
            label={submitting ? "Submitting..." : "Submit Order"}
            isActive={!submitting}
            leadingIcon="mdi:check"
            onClick={handleSubmit}
            disabled={submitting}
          />
        </div>
      </div>
    </>
  );
}
