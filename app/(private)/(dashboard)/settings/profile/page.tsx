"use client";

import { useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useFormik } from "formik";
import TabBtn from "@/app/components/tabBtn";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("edit"); // edit | settings

  // Form
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      dob: "",
      position: "",
      email: "",
      country: "",
      phone: "",
      street: "",
      city: "",
      zip: "",
    },
    onSubmit: (values) => {
      console.log("Form Submitted", values);
    },
  });

  const { values, setFieldValue } = formik;

  return (
    <>
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">My Profile</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* LEFT PROFILE CARD */}
        <ContainerCard className="lg:w-[450px] space-y-6 p-6 h-fit">
          <div className="flex flex-col items-center">
            <img
              src="/logo.png"
              className="w-28 h-28 rounded-full object-cover border"
            />

            <h2 className="text-lg font-semibold mt-3">Administrator</h2>
            <span className="text-gray-500 text-sm">Operation Manager</span>
          </div>

          <hr className="border border-gray-300" />

          {/* Personal Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Personal Info</h3>

            <div className="grid grid-cols-[150px_20px_1fr] gap-y-2 text-sm">

              <span className="text-gray-600">User Name</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">Admin</span>

              <span className="text-gray-600">Full Name</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">Administrator Admin</span>

              <span className="text-gray-600">Date of Birth</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">02 Jan 1990</span>

              <span className="text-gray-600">Position</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">Operation Manager</span>

            </div>

          </div>

          <hr className="border border-gray-300" />

          {/* Contact Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Contact Info</h3>

            <div className="grid grid-cols-[150px_20px_1fr] gap-y-2 text-sm">

              <span className="text-gray-600">Email</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">shashwat.com</span>

              <span className="text-gray-600">Phone Number</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">88949 nahi bataoga</span>

              <span className="text-gray-600">Street</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium"> P.O Box 38148</span>

              <span className="text-gray-600">City</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">Dubai</span>

              <span className="text-gray-600">Zip code</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">57382</span>

              <span className="text-gray-600">Country</span>
              <span className="text-gray-600">:</span>
              <span className="font-medium">Dubai</span>

            </div>
            {/* <div className="flex justify-between text-sm">
              <span>Email</span>
              <span>: administrator@email.com</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Phone Number</span>
              <span>: +971 50 123 4567</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Street</span>
              <span>: P.O Box 38148</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>City</span>
              <span>: Dubai</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Zip code</span>
              <span>: 38148</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Country</span>
              <span>: Emirates</span>
            </div> */}
          </div>
        </ContainerCard>

        {/* <ContainerCard className="w-full  p-6 space-y-8">
          
 <div className="flex gap-4 border-b pb-2">
            <button
              onClick={() => setActiveTab("edit")}
              className={`pb-1 font-medium ${
                activeTab === "edit"
                  ? "text-red-600 border-b-2 border-red-500"
                  : "text-gray-500"
              }`}
            >
              Edit Information
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-1 font-medium ${
                activeTab === "settings"
                  ? "text-red-600 border-b-2 border-red-500"
                  : "text-gray-500"
              }`}
            >
              System Settings
            </button>
          </div>

        </ContainerCard> */}

        {/* RIGHT SIDE CONTENT */}
        <div className="w-full p-6 space-y-8">
          {/* TAB BUTTONS */}

          <ContainerCard className="flex !p-1">
            <div>
              <TabBtn
                label={"Edit Information"}
                isActive={activeTab === "edit"}
                onClick={() => setActiveTab("edit")}
              />
            </div>
            <div>
              <TabBtn
                label={"System Settings"}
                isActive={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
              />
            </div>
          </ContainerCard>

          {/* EDIT INFO TAB */}
          {activeTab === "edit" && (
            <ContainerCard>
              <form onSubmit={formik.handleSubmit} className="space-y-8">
                {/* Upload */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <Icon icon="lucide:image" width={30} />
                  </div>

                  <div>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md">
                      Upload Profile
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload square JPG or PNG under 1 MB
                    </p>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="font-semibold mb-3">Personal Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputFields
                      required
                      label="First Name"
                      value={values.firstName}
                      onChange={(e) =>
                        setFieldValue("firstName", e.target.value)
                      }
                    />

                    <InputFields
                      required
                      label="Last Name"
                      value={values.lastName}
                      onChange={(e) =>
                        setFieldValue("lastName", e.target.value)
                      }
                    />

                    <InputFields
                      required
                      label="Date of Birth"
                      value={values.dob}
                      onChange={(e) => setFieldValue("dob", e.target.value)}
                    />

                    <InputFields
                      required
                      label="Position"
                      value={values.position}
                      onChange={(e) =>
                        setFieldValue("position", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold mb-3">Contact Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputFields
                      required
                      label="Email"
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                    />

                    <InputFields
                      required
                      label="Phone Number"
                      value={values.phone}
                      onChange={(e) => setFieldValue("phone", e.target.value)}
                    />

                    <InputFields
                      required
                      label="Street"
                      value={values.street}
                      onChange={(e) => setFieldValue("street", e.target.value)}
                    />

                    <InputFields
                      required
                      label="City"
                      value={values.city}
                      onChange={(e) => setFieldValue("city", e.target.value)}
                    />

                    <InputFields
                      required
                      label="Zip Code"
                      value={values.zip}
                      onChange={(e) => setFieldValue("zip", e.target.value)}
                    />

                    <InputFields
                      required
                      label="Country"
                      value={values.country}
                      onChange={(e) => setFieldValue("country", e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-3 rounded-md"
                >
                  Save Changes
                </button>
              </form>
            </ContainerCard>
          )}
          {/* <ContainerCard> */}
          {/* SYSTEM SETTINGS TAB */}
          {activeTab === "settings" && (
            <ContainerCard>
              <div className="space-y-4">
                {/* LANGUAGE */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl  boder-gray-300">
                  <Icon
                    icon="lucide:globe"
                    width={28}
                    className="text-gray-500 mr-4"
                  />
                  <div>
                    <h4 className="font-medium">Language</h4>
                    <p className="text-sm text-gray-500">
                      Switch between light or dark mode
                    </p>
                  </div>
                  <div className="ml-auto">
                    <button className="border px-3 py-2 rounded-md flex items-center gap-1">
                      System Default <Icon icon="lucide:chevron-down" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl boder-gray-300">
                  <Icon
                    icon="lucide:globe"
                    width={28}
                    className="text-gray-500 mr-4"
                  />
                  <div>
                    <h4 className="font-medium">Reset Password</h4>
                    <p className="text-sm text-gray-500">
                      Update or change your account password
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Icon icon="lucide:chevron-right" />
                  </div>
                </div>

                {/* THEME */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl boder-gray-300">
                  <Icon
                    icon="lucide:globe"
                    width={28}
                    className="text-gray-500 mr-4"
                  />
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-gray-500">
                      Switch between light or dark mode
                    </p>
                  </div>
                  <div className="ml-auto">
                    <button className="border px-3 py-2 rounded-md flex items-center gap-1">
                      System Default <Icon icon="lucide:chevron-down" />
                    </button>
                  </div>
                </div>

                {/* PRIVACY SETTINGS */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl  boder-gray-300">
                  <Icon
                    icon="lucide:globe"
                    width={28}
                    className="text-gray-500 mr-4"
                  />
                  <div>
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-gray-500">
                      Manage permissions and data preferences
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Icon icon="lucide:chevron-right" />
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl  boder-gray-300">
                  <Icon
                    icon="lucide:globe"
                    width={28}
                    className="text-gray-500 mr-4"
                  />
                  <div>
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-gray-500">
                      Manage permissions and data preferences
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Icon icon="lucide:chevron-right" />
                  </div>
                </div>

                {/* DOWNLOAD MANUAL */}
                {/* flex justify-between items-center p-4 bg-gray-50 rounded-xl  shadow-sm */}
                <div className="p-[16px] w-full h-auto rounded-lg border border border-gray-200">
                  <h4 className="font-medium flex items-center gap-2">
                    <Icon icon="lucide:download" /> Download User Manual
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get the complete guide for using the system
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 bg-white">
                    <div className="p-3 w-full h-[154px] rounded-lg border bg-white border-gray-200">
                      <div className="w-full `gap-[10px]` ">
                        <div className="w-[40px] h-[40px] p-[10px] rounded-lg border bg-[#FAFAFA] border-gray-200 flex items-center justify-center">
                          <Icon
                            icon="lucide:file-text"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Order Management</p>

                        </div>
                      </div>
                      <button className="mt-[20px] bg-white px-3 py-1 rounded-xl border border-gray-300">
                        Download
                      </button>
                    </div>
                    <div className="p-3 w-full h-[154px] rounded-lg border bg-white border-gray-200">
                      <div className="w-full `gap-[10px]` ">
                        <div className="w-[40px] h-[40px] p-[10px] rounded-lg border bg-[#FAFAFA] border-gray-200 flex items-center justify-center">
                          <Icon
                            icon="lucide:file-text"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Order Management</p>

                        </div>
                      </div>
                      <button className="mt-[20px] bg-white px-3 py-1 rounded-xl border border-gray-300">
                        Download
                      </button>
                    </div>
                    <div className="p-3 w-full h-[154px] rounded-lg border bg-white border-gray-200">
                      <div className="w-full `gap-[10px]` ">
                        <div className="w-[40px] h-[40px] p-[10px] rounded-lg border bg-[#FAFAFA] border-gray-200 flex items-center justify-center">
                          <Icon
                            icon="lucide:file-text"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Order Management</p>

                        </div>
                      </div>
                      <button className="mt-[20px] bg-white px-3 py-1 rounded-xl border border-gray-300">
                        Download
                      </button>
                    </div>
                    <div className="p-3 w-full h-[154px] rounded-lg border bg-white border-gray-200">
                      <div className="w-full `gap-[10px]` ">
                        <div className="w-[40px] h-[40px] p-[10px] rounded-lg border bg-[#FAFAFA] border-gray-200 flex items-center justify-center">
                          <Icon
                            icon="lucide:file-text"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Order Management</p>

                        </div>
                      </div>
                      <button className="mt-[20px] bg-white px-3 py-1 rounded-xl border border-gray-300">
                        Download
                      </button>
                    </div>
                    <div className="p-3 w-full h-[154px] rounded-lg border bg-white border-gray-200">
                      <div className="w-full `gap-[10px]` ">
                        <div className="w-[40px] h-[40px] p-[10px] rounded-lg border bg-[#FAFAFA] border-gray-200 flex items-center justify-center">
                          <Icon
                            icon="lucide:file-text"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Order Management</p>

                        </div>
                      </div>
                      <button className="mt-[20px] bg-white px-3 py-1 rounded-xl border border-gray-300">
                        Download
                      </button>
                    </div>
                    <div className="p-3 w-full h-[154px] rounded-lg border bg-white border-gray-200">
                      <div className="w-full `gap-[10px]` ">
                        <div className="w-[40px] h-[40px] p-[10px] rounded-lg border bg-[#FAFAFA] border-gray-200 flex items-center justify-center">
                          <Icon
                            icon="lucide:file-text"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Order Management</p>

                        </div>
                      </div>
                      <button className="mt-[20px] bg-white px-3 py-1 rounded-xl border border-gray-300">
                        Download
                      </button>
                    </div>


                  </div>
                </div>
              </div>
            </ContainerCard>
          )}
          {/* </ContainerCard> */}
        </div>
      </div>
    </>
  );
}
