import "./index.css";
import { Button, Form, Input, Image } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isEmail } from "@/utils";
import { JWT_LOCAL_STORAGE_KEY } from "@/constants/data.ts";
import userService from "@/apis/service/userService";
import { AxiosError } from "axios";

const Login = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLogin = async (values: { email: string; password: string }) => {
        const { email, password } = values;
        if (!isEmail(email)) {
            form.setFields([
                {
                    name: "email",
                    errors: [t("The input is not valid E-mail!")],
                },
            ]);
            return;
        }

        try {
            const response = await userService.login(email, password);
            localStorage.setItem(JWT_LOCAL_STORAGE_KEY, response.token);
            toast.success(t("Login successfully!"));
            navigate("/");
        } catch (error) {
            const errorMessage =
                (error as AxiosError<{ message: string }>)?.response?.data
                    ?.message || t("Login failed!");
            toast.error(errorMessage);
        }
    };

    return (
        <main className="auth-page">
            <div className="container my-5">
                <div className="auth-card">
                    <div className="auth-card-header text-center">
                        <div className="flex justify-center mb-4">
                            <Image
                                width={150}
                                src={"/logo.jpg"}
                                preview={false}
                                className="rounded-full"
                            />
                        </div>
                        <h4>{t("Đăng nhập")}</h4>
                        <p>{t("Login with your account to continue!")}</p>
                    </div>
                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        onFinish={handleLogin}
                    >
                        <Form.Item
                            label={<span className="text-base font-medium">{t("Email")}</span>}
                            name="email"
                            rules={[{ required: true, message: t("Please input your email!") }]}
                        >
                            <Input placeholder={t("Email")} className="auth-form-input" />
                        </Form.Item>
                        <Form.Item
                            label={<span className="text-base font-medium">{t("Password")}</span>}
                            name="password"
                            rules={[{ required: true, message: t("Please input your password!") }]}
                        >
                            <Input.Password
                                placeholder={t("Password")}
                                className="auth-form-input"
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            onClick={form.submit}
                            className="auth-btn w-100"
                            size="large"
                        >
                            {t("Đăng nhập")}
                        </Button>
                        <div className="text-center mt-3">
                            <Link to={"/forgot-password"} className="text-sm">
                                {t("Quên mật khẩu")}
                            </Link>
                            <span> | </span>
                            <Link to={"/register"} className="text-sm">
                                {t("Đăng ký")}
                            </Link>
                        </div>
                        <div className="d-flex justify-content-center mt-4">
                            <Button
                                className="mx-1 btn-outline-secondary"
                                icon={<i className="bi bi-google"></i>}
                            />
                            <Button
                                className="mx-1 btn-outline-secondary"
                                icon={<i className="bi bi-facebook"></i>}
                                href="https://www.facebook.com/violympicvietnam"
                            />
                        </div>
                    </Form>
                </div>
            </div>
        </main>
    );
};

export default Login;
