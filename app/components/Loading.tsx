"use client";

import Logo from "./logo";

export default function Loading({ isFullPage = true }: { isFullPage?: boolean }) {
    return <div className={`w-full min-h-full ${isFullPage ? "h-screen" : "h-full"} bg-white z-50 flex justify-center items-center relative`}>
        <div className="animate-spin rounded-full h-50 w-50 border-t-2 border-b-2 border-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        </div>
        <Logo type="half" width={50} twClass="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>;
}