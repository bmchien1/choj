import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useState } from "react";
import { useRegister } from "@/hooks/useUserQueries";

const Register = () => {
  const registerMutation = useRegister();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const { email, password, confirmPassword } = values;
    if (password !== confirmPassword) {
      form.setFields([
        { name: "confirmPassword", errors: [t("Passwords do not match!")] },
      ]);
      return;
    }

    try {
      setIsLoading(true);
      registerMutation.mutate(
        { email, password },
        {
          onSuccess: () => {
            toast.success("Registration successful, logging in...");
          },
          onError: () => {
            toast.error("Failed to Register");
          },
        }
      );
      toast.success(t("Registration successful!"));
      navigate("/login");
    } catch (error) {
      const errorMessage =
        (error as AxiosError<{ message: string }>)?.response?.data?.message ||
        t("Registration failed!");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        width: "100vw",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: "3rem",
          background: "#fff",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
          borderRadius: "10px",
          padding: "40px",
          width: "450px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#e0e0e0",
              margin: "0 auto 20px auto",
            }}
          />
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              marginTop: "0",
              color: "#333",
            }}
          >
            {t("Welcome")}
          </div>
          <p
            style={{
              color: "#666",
              fontSize: "16px",
              fontWeight: 400,
              margin: "5px 0 0 0",
            }}
          >
            {t("Register new account")}
          </p>
        </div>
        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={handleRegister}
        >
          <Form.Item
            style={{ marginBottom: "20px" }}
            label={
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#333" }}>
                <span style={{ color: "red" }}>* </span>{t("Email")}
              </span>
            }
            name="email"
            rules={[{ required: true, message: t("Please input your email!") }]}
          >
            <Input
              placeholder={t("Email")}
              style={{
                padding: "10px 15px",
                borderRadius: "5px",
                boxShadow: "none",
                color: "#333",
                fontSize: "15px",
                fontWeight: 400,
                border: "1px solid #ddd",
                height: "45px",
              }}
            />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: "20px" }}
            label={
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#333" }}>
                <span style={{ color: "red" }}>* </span>{t("Password")}
              </span>
            }
            name="password"
            rules={[
              { required: true, message: t("Please input your password!") },
            ]}
          >
            <Input.Password
              placeholder={t("Password")}
              style={{
                padding: "10px 15px",
                borderRadius: "5px",
                boxShadow: "none",
                color: "#323232",
                fontSize: "15px",
                fontWeight: 400,
                border: "1px solid #ddd",
                height: "45px",
              }}
            />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: "20px" }}
            label={
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#333" }}>
                <span style={{ color: "red" }}>* </span>{t("Confirm Password")}
              </span>
            }
            name="confirmPassword"
            rules={[
              { required: true, message: t("Please input your password!") },
            ]}
          >
            <Input.Password
              placeholder={t("Confirm password")}
              style={{
                padding: "10px 15px",
                borderRadius: "5px",
                boxShadow: "none",
                color: "#323232",
                fontSize: "15px",
                fontWeight: 400,
                border: "1px solid #ddd",
                height: "45px",
              }}
            />
          </Form.Item>
        </Form>

        <Button
          type="primary"
          onClick={form.submit}
          style={{
            width: "100%",
            fontSize: "18px",
            height: "50px",
            borderRadius: "5px",
            background: "#000",
            border: "none",
            color: "#fff",
            fontWeight: "bold",
            marginTop: "0",
          }}
          size="large"
          loading={isLoading}
        >
          {t("Register")}
        </Button>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span style={{ fontSize: "15px", color: "#666" }}>
            {t("Already have an account?")}
          </span>
          <Link
            to={"/login"}
            style={{ color: "#ff6a00", fontSize: "15px", fontWeight: 600 }}
          >
            {t(" Login")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Register;
