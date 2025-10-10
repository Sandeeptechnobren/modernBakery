"use client";

import { useEffect, useState } from "react";
import LoginPage from "./(public)/login/page";
import { isVerify } from "./services/allApi";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import { useSnackbar } from "./services/snackbarContext";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    useEffect(() => {
        async function verifyUser() {
            const res = await isVerify();
            if(res.error) {
                localStorage.removeItem("token");
                showSnackbar(res.data.message, "error");
                setIsLoading(false);
            }
            if(res.code === 200) router.push("/warehouse");
        }
        if (localStorage.getItem("token")) verifyUser();
        else setIsLoading(false);
    }, []);
    return isLoading ? <Loading /> : <LoginPage />;
}
