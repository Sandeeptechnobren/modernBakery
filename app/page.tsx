"use client";

import { useEffect, useState } from "react";
import LoginPage from "./(public)/login/page";
import { isVerify } from "./services/allApi";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
    useEffect(() => {
        isVerify().then((res) => {
            if (res.code === 200) router.push("/dashboard");
            else setIsLoading(false);
        }).catch(err => setIsLoading(false));
    }, []);
    return isLoading ? <Loading /> : <LoginPage />;
}
