import { createContext, useContext, useEffect, useState } from "react";
import {
  updateUser as updateUserService,
  updateEmployer as updateEmployerService
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [internalUser, setInternalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedInternalUser = localStorage.getItem("internalUser");

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedInternalUser) setInternalUser(JSON.parse(savedInternalUser));
      
    } catch (err) {
      console.error("Auth load error", err);
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const loginUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const updateUser = async (data) => {
    const updatedUser = await updateUserService(data);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  /* EMPLOYER */

  const loginEmployer = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const updateEmployer = async (data) => {
    const updatedEmployer = await updateEmployerService(data);
    localStorage.setItem("user", JSON.stringify(updatedEmployer));
    setUser(updatedEmployer);
    return updatedEmployer;
  };

  const logoutEmployer = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  /* INTERNAL (ADMIN/MOD) */

  const loginInternal = (data) => {
    localStorage.setItem("internalUser", JSON.stringify(data));
    setInternalUser(data);
  };

  const logoutInternal = () => {
    localStorage.removeItem("internalUser");
    setInternalUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        internalUser,
        loading,

        loginUser,
        updateUser,
        logoutUser,

        loginEmployer,
        updateEmployer,
        logoutEmployer,

        loginInternal,
        logoutInternal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);