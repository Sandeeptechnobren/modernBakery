"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "../../components/customButton";
import RememberCheckbox from "../../components/rememberCheckbox";
import PoweredByTag from "../../components/poweredByTag";
import CustomPasswordInput from "../../components/customPasswordInput";
import CustomTextInput from "../../components/CustomTextInput";
import Logo from "../../components/logo";
import CardForLoginPage from "../../components/cardForLoginPage";
import { login } from "@/app/services/allApi";

const LoginSchema = Yup.object().shape({
    userId: Yup.string().required("User ID is required"),
    password: Yup.string()
        .min(6, "Password too short")
        .required("Password is required"),
});

const LoginPage = () => {
    const router = useRouter();

    return (
        <div className="w-[100%] min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="hidden flex-col justify-center ml-[24px] my-[24px] lg:flex">
                    <CardForLoginPage />
                </div>

                <div className="relative flex flex-col justify-center items-center min-h-screen lg:h-full">
                    <Formik
                        initialValues={{ userId: "", password: "" }}
                        validationSchema={LoginSchema}
                        onSubmit={async (values, { setErrors }) => {

                            const res = await login({
                                email: values.userId,
                                password: values.password,
                            });
                            
                            if(res.error) return setErrors({ userId: res.data.message });
                            else {
                                localStorage.setItem("token", res.data.access_token);
                                localStorage.setItem("role", res?.data?.user?.role?.id);
                                localStorage.setItem("country", res?.data?.user?.companies[0]?.selling_currency);

                                router.push("/vehicle");
                            }
                        }}
                    >
                        {({ isSubmitting, values, handleChange }) => (
                            <Form className="flex flex-col gap-[32px] w-[360px]">
                                <Logo twClass="m-auto" />
                                <div className="text-center">
                                    <h1 className="text-3xl font-semibold text-gray-900 mb-[12px]">
                                        Welcome back
                                    </h1>
                                    <p className="text-gray-600 text-[16px]">
                                        Please log in with your details to
                                        continue.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-[24px] m-[20px] lg:m-0">
                                    <div className="flex flex-col gap-[20px]">
                                        {/* User ID */}
                                        <div>
                                            <CustomTextInput
                                                label="User ID"
                                                value={values.userId}
                                                onChange={handleChange(
                                                    "userId"
                                                )}
                                                placeholder="User ID"
                                            />
                                            <ErrorMessage
                                                name="userId"
                                                component="p"
                                                className="text-red-500 text-sm"
                                            />
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <CustomPasswordInput
                                                label="Password"
                                                value={values.password}
                                                onChange={handleChange(
                                                    "password"
                                                )}
                                            />
                                            <ErrorMessage
                                                name="password"
                                                component="p"
                                                className="text-red-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <RememberCheckbox />
                                        <span className="text-[#EA0A2A] font-semibold text-sm cursor-pointer">
                                            Forgot password?
                                        </span>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Signing in..."
                                            : "Sign in"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>

                    <PoweredByTag />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;