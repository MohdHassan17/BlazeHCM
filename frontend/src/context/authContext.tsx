import React, { useEffect, createContext, useState } from "react";
// import jwtDecode from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import env from "../lib/env";
import { useNavigate } from "react-router-dom";

type UserData = {
  employeeId: string;
  employeeName: string;
  permissions: Record<string, boolean>;
};

type AuthContextType = {
  user: UserData | null;
  isAuthenticated: boolean;
  employeeId?: string;
  employeeName? : string;
  permissions?: Record<string, boolean> ;
  handleLogin: (email: string, password: string) => Promise<void>;
  logout: () => void
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const employeeId = user?.employeeId ?? user?.employeeId;
  const employeeName = user?.employeeName ?? user?.employeeName;
  const permissions = user?.permissions;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userData = {
          employeeId: (decodedToken as any).employeeId,
          employeeName: (decodedToken as any).employeeName,
          permissions: (decodedToken as any).permissions,
        };
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Invalid token in storage", err);
        localStorage.removeItem("authToken");
      }
    }
  }, [isAuthenticated]);

  //* Login Function

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${env.API_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data.accessToken;
      //   console.log("Receivedtoken:", token);

      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("authToken", token);

      setIsAuthenticated(true);
      navigate('/home');
      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  //* Logout Function 
  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }


  const context: AuthContextType = {
    user,
    isAuthenticated,
    employeeId,
    employeeName,
    permissions,
    handleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContextProvider;
