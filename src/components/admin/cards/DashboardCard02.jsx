import React, { useEffect, useState } from "react";
import moment from "moment";
import { motion } from "framer-motion";
import axios from "axios";

function DashboardCard02() {
  const [admin, setAdmin] = useState(null);
  const [greeting, setGreeting] = useState("Hello");
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/admin`);
        setAdmin(response.data.admin[0]);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = moment().hour();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="w-lg relative top-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <footer className="bg-gray rounded-lg bg-white p-4 sm:p-6 xl:p-8 dark:bg-gray-800 antialiased">
        <div className="inline-flex flex-col items-center justify-between">
          {/* Greeting Section */}
          <motion.div
            className="text-2xl text-indigo-600 font-bold"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 1,
              delay: 0.2,
              type: "spring",
              stiffness: 80,
            }}
          >
            {greeting}, {admin ? admin.name : "Loading..."}!
          </motion.div>

          {/* Date Section */}
          <motion.div
            className="text-sm text-black dark:text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              delay: 0.5,
              type: "spring",
              stiffness: 120,
            }}
          >
            {moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}
          </motion.div>
        </div>
      </footer>
    </motion.div>
  );
}

export default DashboardCard02;