"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useFormik } from "formik";
import TabBtn from "@/app/components/tabBtn";
import { isVerify, updateAuthUser, countryList, roleList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("edit"); // edit | settings

  // Form
  const formik = useFormik({
    // roleOptions: roleList(),
    initialValues: {
      firstName: "",
      lastName: "",
      dob: "",
      role: "",
      email: "",
      country_id: "",
      contact_number: "",
      street: "",
      city: "",
      zip: "",
    },
    onSubmit: async (values) => {
      await handleProfileUpdate(values);
    },
  });

  const { values, setFieldValue } = formik;
  const [showSidebar, setShowSidebar] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const { showSnackbar } = useSnackbar();

  const handleProfileUpdate = async (values: typeof formik.initialValues) => {
    if (!profile?.uuid) {
      showSnackbar("User ID not found", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: String(values.firstName || ""),
        dob: String(values.dob || ""),
        role: String(values.role || ""),
        email: String(values.email || ""),
        contact_number: String(values.contact_number || ""),
        street: String(values.street || ""),
        city: String(values.city || ""),
        zip: String(values.zip || ""),
        country_id: values.country_id ? Number(values.country_id) : null,
      };

      const res = await updateAuthUser(profile.uuid, payload);

      if (res && res.code === 200) {
        showSnackbar("Profile updated successfully", "success");
        // Refresh profile data
        const updatedProfile = await isVerify();
        if (updatedProfile && updatedProfile.code === 200 && updatedProfile.data) {
          setProfile(updatedProfile.data);
        }
      } else if (res && res.data && res.data.message) {
        showSnackbar(String(res.data.message), "error");
      } else {
        showSnackbar("Failed to update profile", "error");
      }
    } catch (err: any) {
      showSnackbar(String(err?.message ?? "Unable to update profile"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch role list
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await roleList();
        if (res && res.data) {
          const roles = Array.isArray(res.data) ? res.data : [];
          const options = roles.map((role: any) => ({
            label: role.name || "",
            value: String(role.id || ""),
          }));
          setRoleOptions(options);
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };

    fetchRoles();
  }, []);

  // Fetch country list
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await countryList();
        if (res && res.data) {
          const countries = Array.isArray(res.data) ? res.data : [];
          const options = countries.map((country: any) => ({
            label: country.country_name || country.name || "",
            value: String(country.id || ""),
          }));
          setCountryOptions(options);
        }
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await isVerify();
        if (res && res.code === 200 && res.data) {
          setProfile(res.data);
          // populate all form fields
          setFieldValue("firstName", res.data?.name ?? "");
          setFieldValue("email", res.data?.email ?? "");
          setFieldValue("dob", res.data?.dob ?? "");
          setFieldValue("role", res.data?.role.id ? String(res.data.role.id) : "");
          setFieldValue("country_id", res.data?.country_id.id ? String(res.data.country_id.id) : "");
          setFieldValue("contact_number", res.data?.contact_number ?? "");
          setFieldValue("street", res.data?.street ?? "");
          setFieldValue("city", res.data?.city ?? "");
          setFieldValue("zip", res.data?.zip ?? "");
        } else if (res && res.data && res.data.message) {
          showSnackbar(String(res.data.message), "error");
        }
      } catch (err: any) {
        showSnackbar(String(err?.message ?? "Unable to fetch profile"), "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* <Link href="/dashboard">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link> */}
        <h1 className="text-xl font-semibold">My Profile</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* LEFT PROFILE CARD */}
        <ContainerCard className="w-full lg:w-[450px] space-y-6 p-6 h-fit">
          <div className="flex flex-col items-center">
            <img
              src={profile?.profile_picture ?? "/noprofile.svg"}
              alt={profile?.name ?? "profile"}
              className="w-28 h-28 rounded-full object-cover"
            />

            {profile?.name ? (
              <h2 className="text-lg font-semibold mt-3">{profile.name}</h2>
            ) : null}
            {profile?.role?.name ? (
              <span className="text-gray-500 text-sm">{profile.role.name}</span>
            ) : null}
          </div>

          <hr className="border border-gray-300" />

          {/* Personal Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Personal Info</h3>

            <div className="grid grid-cols-[120px_10px_1fr] md:grid-cols-[150px_20px_1fr] gap-y-2 text-sm">
              {profile?.username ? (
                <>
                  <span className="text-gray-600">User Name</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.username}</span>
                </>
              ) : null}

              {profile?.name ? (
                <>
                  <span className="text-gray-600">Full Name</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.name}</span>
                </>
              ) : null}

              {profile?.dob ? (
                <>
                  <span className="text-gray-600">Date of Birth</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.dob}</span>
                </>
              ) : null}

              {profile?.position ? (
                <>
                  <span className="text-gray-600">Position</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.position}</span>
                </>
              ) : null}

            </div>

          </div>

          <hr className="border border-gray-300" />

          {/* Contact Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Contact Info</h3>

            <div className="grid grid-cols-[120px_10px_1fr] md:grid-cols-[150px_20px_1fr] gap-y-2 text-sm">
              {profile?.email ? (
                <>
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.email}</span>
                </>
              ) : null}

              {profile?.contact_number ? (
                <>
                  <span className="text-gray-600">Phone Number</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.contact_number}</span>
                </>
              ) : null}

              {profile?.street ? (
                <>
                  <span className="text-gray-600">Street</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.street}</span>
                </>
              ) : null}

              {profile?.city ? (
                <>
                  <span className="text-gray-600">City</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.city}</span>
                </>
              ) : null}

              {profile?.zip ? (
                <>
                  <span className="text-gray-600">Zip code</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile.zip}</span>
                </>
              ) : null}

              {(profile?.companies && profile.companies.length > 0 && profile.companies[0].company_name) || profile?.country ? (
                <>
                  <span className="text-gray-600">Country</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium">{profile?.companies?.[0]?.company_name ?? profile.country}</span>
                </>
              ) : null}

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

        {/* RIGHT SIDE CONTENT */}
        <div className="w-full space-y-8">
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
                      <Icon icon="lucide:upload" width={20} />  Upload Profile
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
                      label=" Name"
                      value={values.firstName}
                      onChange={(e) =>
                        setFieldValue("firstName", e.target.value)
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
                      value={values.role}
                      options={roleOptions}
                      onChange={(e) =>
                        setFieldValue("role", e.target.value)
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
                      value={values.contact_number}
                      onChange={(e) => setFieldValue("contact_number", e.target.value)}
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
                      value={values.country_id}
                      options={countryOptions}
                      onChange={(e) => setFieldValue("country_id", e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 text-white px-6 py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Icon icon="lucide:loader-2" width={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
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
                <div className="flex items-center p-4 bg-gray-50 rounded-xl  border-1 border-gray-200">
                  <Icon
                    icon="lucide:languages"
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
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border-1 border-gray-200">
                  <Icon
                    icon="lucide:lock"
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
                    <Icon
                      onClick={() => setShowSidebar(true)}
                      icon="lucide:chevron-right" />
                  </div>
                </div>

                {/* THEME */}
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border-1 border-gray-200">
                  <Icon
                    icon="lucide:palette"
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
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border-1 border-gray-200">
                  <Icon
                    icon="lucide:user-lock"
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
                    <Icon
                      onClick={() => setShowSidebar(true)}

                      icon="lucide:chevron-right" />
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl  border-1 border-gray-200">
                  <Icon
                    icon="lucide:shield-user"
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
                    <Icon
                      onClick={() => setShowSidebar(true)}

                      icon="lucide:chevron-right" />
                  </div>
                </div>

                {/* DOWNLOAD MANUAL */}
                {/* flex justify-between items-center p-4 bg-gray-50 rounded-xl  shadow-sm */}
                <div className="p-[16px] w-full h-auto rounded-lg border border-gray-200">
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
                            icon="lucide:package"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Stock Management</p>

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
                            icon="lucide:waypoints"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Route Management</p>

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
                            icon="lucide:receipt"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Expense Management</p>

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
                          <p className="font-medium">Merchandiser</p>

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
                            icon="lucide:proportions"
                            width={20}
                          />
                        </div>

                        <div className="mt-[10px] flex">
                          <p className="font-medium">Report</p>

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

          {showSidebar && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 " onClick={() => setShowSidebar(false)} />

              {/* Sidebar - 1/3 screen */}
              <div className="fixed top-0 right-0 h-full w-1/3 bg-white z-50 shadow-lg transform transition-transform duration-300 translate-x-0">

                {/* KEEPING YOUR UI EXACTLY THE SAME 👇 */}

                <div className="flex items-center justify-between p-5 border-b">
                  <h2 className="text-lg font-semibold">Reset Password</h2>
                  <button onClick={() => setShowSidebar(false)}>
                    <Icon icon="lucide:x" width={22} />
                  </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  <InputFields required label="Old Password"
                    // value={values.oldPassword}
                    onChange={e => setFieldValue("oldPassword", e.target.value)}
                  />
                  <InputFields required label="New Password"
                    // value={values.newPassword}
                    onChange={e => setFieldValue("newPassword", e.target.value)}
                  />
                  <InputFields required label="Confirm Password"
                    // value={values.confirmPassword}
                    onChange={e => setFieldValue("confirmPassword", e.target.value)}
                  />

                  <button type="submit" className="bg-red-600 text-white w-full py-3 rounded-lg">
                    Update Password
                  </button>
                </form>

                {/* NOTHING CHANGED IN YOUR UI ✅ */}
              </div>
            </>
          )}

          {/* </ContainerCard> */}
        </div>
      </div>
    </>
  );
}
