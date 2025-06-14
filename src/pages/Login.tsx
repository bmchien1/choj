import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isEmail } from "@/utils";
import { useLogin } from "@/hooks/useUserQueries";
import { useEffect } from "react";
import { JWT_LOCAL_STORAGE_KEY } from "@/constants/data.ts";

const Login = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLogin();

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

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (response) => {
          console.log("Login response:", response);
          if (!response.user?.role) {
            console.error("Missing role in user response:", response.user);
            toast.error("Invalid user data received");
            return;
          }
          localStorage.setItem(JWT_LOCAL_STORAGE_KEY, response.jwt);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("userInfo", JSON.stringify(response.user));
          console.log("Stored userInfo:", response.user);
          console.log("Stored accessToken with key:", JWT_LOCAL_STORAGE_KEY);
          toast.success("Login successfully!");
        },
        onError: (error: any) => {
          console.error("Login mutation error:", error);
          toast.error(error?.message || t("Login failed!"));
        },
      }
    );
  };

  useEffect(() => {
    if (loginMutation.isSuccess) {
      console.log("Mutation successful, navigating to / after delay");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100); // Small delay to ensure localStorage is updated
    }
  }, [loginMutation.isSuccess, navigate]);

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
        // fontSize: "20px", // Removed explicit font size for main
      }}
    >
      <div
        style={{
          marginBottom: "3rem",
          background: "#fff",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
          borderRadius: "10px",
          padding: "40px",
          width: "450px", // Adjusted width
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
              fontSize: "30px", // Specific font size
              fontWeight: 700, // Specific font weight
              marginTop: "0",
              color: "#333",
            }}
          >
            {t("Welcome")}
          </div>
          <p
            style={{
              color: "#666", // Specific color
              fontSize: "16px", // Specific font size
              fontWeight: 400,
              margin: "5px 0 0 0",
            }}
          >
            {t("Login with your account to continue!")}
          </p>
        </div>
        <Form form={form} name="login" layout="vertical" onFinish={handleLogin}>
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
                borderRadius: "5px", // Less aggressive border radius
                boxShadow: "none", // Removed box shadow
                color: "#333",
                fontSize: "15px",
                fontWeight: 400,
                border: "1px solid #ddd", // Simplified border
                height: "45px", // Specific height
              }}
            />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: "10px" }}
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
          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link to={"/forgot-password"} style={{ fontSize: "14px", color: "#ff6a00" }}>
              Forgot password?
            </Link>
          </div>
        </Form>
        <Button
          type="primary"
          onClick={form.submit}
          style={{
            width: "100%",
            fontSize: "18px", // Larger font size
            height: "50px", // Slightly larger height
            borderRadius: "5px", // Consistent border radius
            background: "#000",
            border: "none",
            color: "#fff",
            fontWeight: "bold", // Bold text
          }}
          size="large"
          loading={loginMutation.isPending}
        >
          {t("Login")}
        </Button>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span style={{ fontSize: "15px", color: "#666" }}>
            {t("Don't have an account?")}
          </span>
          <Link
            to={"/register"}
            style={{ color: "#ff6a00", fontSize: "15px", fontWeight: 600 }}
          >
            {t(" Register")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
