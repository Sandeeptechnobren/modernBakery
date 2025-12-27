"use client";

import { useEffect, useState } from "react";
import LoginPage from "./(public)/login/page";
import { isVerify } from "./services/allApi";
import { useRouter } from "next/navigation";

import Loading from "./components/Loading";
import { useSnackbar } from "./services/snackbarContext";
import ThemeSwitcherBar from "./components/ThemeSwitcherBar";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    useEffect(() => {
        async function verifyUser() {
            const res = await isVerify();
            if (res.error) {
                showSnackbar(res.data.message, "error");
                setIsLoading(false);
            }
            if (res.code === 200) {
                localStorage.setItem("role", res?.data?.role?.id);
                localStorage.setItem("userId", res?.data?.id);
                localStorage.setItem("country", res?.data?.companies[0]?.selling_currency);
                router.push("/profile");
            }
        }
        if (localStorage.getItem("token")) verifyUser();
        else setIsLoading(false);
    }, []);
        return (
            <div className="min-h-screen w-full bg-primary/10 dark:bg-primary/20 transition-colors">
                <ThemeSwitcherBar />
                {isLoading ? <Loading /> : <LoginPage />}
            </div>
        );
}
