import { useEffect } from "react";
import { getUsers } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export const useAuthGuard = () => {
  const { user, logoutUser } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkUserStatus = () => {
      const users = getUsers();
      const currentUser = users.find(u => u.email === user.email);

      if (!currentUser || currentUser.blocked) {
        logoutUser();
      }
    };

    checkUserStatus();
    const interval = setInterval(checkUserStatus, 2000);

    return () => clearInterval(interval);
  }, [user, logoutUser]);
};