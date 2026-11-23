import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, getEmployerProfile } from "../services/authService";

export const useAuthGuard = () => {
  const { user, logoutUser } = useAuth();

  useEffect(() => {
    if (!user?.email) return;

    const checkUserStatus = async () => {
      try {
        if (user.role === "employer") await getEmployerProfile(user.email);
        else await getProfile(user.email);
      } catch (err) {
        logoutUser();
      }
    };

    checkUserStatus();
    const interval = setInterval(checkUserStatus, 10000);

    return () => clearInterval(interval);
  }, [user?.email, user?.role, logoutUser]);
};