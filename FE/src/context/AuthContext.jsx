import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [internalUser, setInternalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedInternalUser = localStorage.getItem("internalUser");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedInternalUser) setInternalUser(JSON.parse(savedInternalUser));

    setLoading(false);
  }, []);

  const loginUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  const loginInternal = (data) => {
    localStorage.setItem("internalUser", JSON.stringify(data));
    setInternalUser(data);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
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
        loginUser,
        loginInternal,
        logoutUser,
        logoutInternal,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);