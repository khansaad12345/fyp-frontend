import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/dashboard`, {
          headers: {
              Authorization: `Bearer ${token}`
          }
      }); // Verify user authentication
        if (response.data.data.user) {
          setIsAuthenticated(true);
          localStorage.setItem("userRole", response.data.data.user.role); // Store role in localStorage
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;