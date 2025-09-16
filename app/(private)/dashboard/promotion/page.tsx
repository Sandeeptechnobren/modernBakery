"use client";

import Link from "next/link";

export default function Promotion() {
    return <div>
        <Link href="/dashboard/promotion/add" className="hover:text-red-500">Add Promotion</Link>
    </div>;
}