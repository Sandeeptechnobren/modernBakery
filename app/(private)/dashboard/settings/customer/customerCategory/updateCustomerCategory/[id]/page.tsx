"use client";

import { useSearchParams } from "next/navigation";

export default function UpdateCustomerCategoryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // URL param

  return <div>Update Customer Category {id}</div>;
}
