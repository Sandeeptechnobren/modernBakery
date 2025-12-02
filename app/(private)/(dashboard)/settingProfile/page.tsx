"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Mail, Lock, Globe, Clock } from "lucide-react";
import TabBtn from "@/app/components/tabBtn";

const ContainerCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        {children}
    </div>
);

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("Account");
    const [formData, setFormData] = useState({
        username: "Admin",
        firstName: "John",
        lastName: "Doe",
        email: "administrator@email.com",
        password: "••••••••••",
        country: "United Arab Emirates dirham",
        timezone: "GMT/UTC (UTC+04:00)"
    });

    const tabs = ["Account", "Security & Privacy", "Notifications", "Profile", "Billing"];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Settings</h1>
                </div>

                {/* Tabs */}
                <ContainerCard className="flex overflow-x-auto !p-1 mb-6">
                    {tabs.map((tab) => (
                        <TabBtn key={tab} label={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
                        // <button
                        //     key={tab}
                        //     onClick={() => setActiveTab(tab)}
                        //     className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab
                        //         ? "text-red-500"
                        //         : "text-gray-600 hover:text-gray-900"
                        //         }`}
                        // >
                        //     {tab}
                        //     {activeTab === tab && (
                        //         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                        //     )}
                        // </button>
                    ))}
                </ContainerCard>

                {/* Content */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 lg:p-8">
                    {activeTab === "Account" && (
                        <>
                            {/* Account Section */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">Account</h2>
                                <p className="text-sm text-gray-500 mb-6">Change your basic account and language settings.</p>

                                {/* Profile Picture */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">
                                        <Upload className="w-4 h-4" />
                                        Upload
                                    </button>
                                    <p className="text-sm text-gray-500">Upload square JPG or PNG image under 1 MB</p>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <div className="w-full sm:flex-1 flex items-center gap-3 px-4 py-2.5 border border-red-200 rounded-lg">
                                            <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <span className="text-gray-700 text-sm truncate">{formData.email}</span>
                                        </div>
                                        <button className="text-sm font-medium text-red-500 hover:text-red-600 whitespace-nowrap px-4 py-2 bg-red-50 rounded-lg">
                                            Change Email
                                        </button>
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <div className="w-full sm:flex-1 flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
                                            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-gray-700">{formData.password}</span>
                                        </div>
                                        <button className="text-sm font-medium text-red-500 hover:text-red-600 whitespace-nowrap px-4 py-2 rounded-lg">
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Region Section */}
                            <div className="mb-8 pt-8 border-t border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Region</h2>

                                {/* Country or region */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg px-4 sm:px-5 mb-4">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Country or region</p>
                                            <p className="text-xs text-gray-500">Set your location for regional preferences</p>
                                        </div>
                                    </div>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option>United Arab Emirates dirham</option>
                                        <option>United States dollar</option>
                                        <option>Euro</option>
                                        <option>British pound</option>
                                    </select>
                                </div>

                                {/* Time Zone */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg px-4 sm:px-5">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Time Zone</p>
                                            <p className="text-xs text-gray-500">Set your local time zone</p>
                                        </div>
                                    </div>
                                    <select
                                        value={formData.timezone}
                                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option>GMT/UTC (UTC+04:00)</option>
                                        <option>EST (UTC-05:00)</option>
                                        <option>PST (UTC-08:00)</option>
                                        <option>IST (UTC+05:30)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Deactivate Account */}
                            <div className="pt-8 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Deactivate my account</h2>
                                        <p className="text-sm text-gray-500">Permanently delete the account and remove access.</p>
                                    </div>
                                    <button className="px-6 py-2 text-sm font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                                        Deactivate Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "Security & Privacy" && (
                        <div className="py-12 text-center">
                            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security & Privacy Settings</h3>
                            <p className="text-gray-500">Manage your security preferences and privacy settings here.</p>
                        </div>
                    )}

                    {activeTab === "Notifications" && (
                        <div>
                            <div className="mb-8">
                                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Notifications</h1>
                                <p className="text-gray-600">Customize your notification settings</p>
                            </div>

                            <div className="space-y-6">
                                {/* Row 1 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase secret key
                                        </label>
                                        <input
                                            type="text"
                                            name="secretKey"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase public vapid key (key pair)
                                        </label>
                                        <input
                                            type="text"
                                            name="publicKey"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase API Key
                                        </label>
                                        <input
                                            type="text"
                                            name="apiKey"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase AUTH Domain
                                        </label>
                                        <input
                                            type="text"
                                            name="authDomain"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase Project ID
                                        </label>
                                        <input
                                            type="text"
                                            name="projectId"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase Storage Bucket
                                        </label>
                                        <input
                                            type="text"
                                            name="storageBucket"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Row 4 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase Message Sender ID
                                        </label>
                                        <input
                                            type="text"
                                            name="messageSenderId"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase App ID
                                        </label>
                                        <input
                                            type="text"
                                            name="appId"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Row 5 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Firebase Measurement ID
                                        </label>
                                        <input
                                            type="text"
                                            name="measurementId"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                                <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                                    Reset
                                </button>
                                <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "Profile" && (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">👤</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Information</h3>
                            <p className="text-gray-500">Manage your public profile and personal information.</p>
                        </div>
                    )}

                    {activeTab === "Billing" && (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💳</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing & Subscription</h3>
                            <p className="text-gray-500">Manage your payment methods and subscription plans.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}