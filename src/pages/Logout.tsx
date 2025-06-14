import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import userService from "@/apis/service/userService";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await userService.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.message || "Logout failed");
    }
  };

  return (
    <Button type="primary" danger onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default Logout;
