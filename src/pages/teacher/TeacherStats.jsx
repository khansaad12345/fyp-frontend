import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  ResponsiveContainer
} from "recharts";

const TeacherStats = ({ teacherId }) => {
  const [data, setData] = useState({
    classes: null,
    courses: null,
  });
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/teacher/${teacherId}/stats`);
        setData({
          classes: response.data.totalClasses,
          courses: response.data.totalCourses,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [teacherId]);

  if (!data) return <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>;

  const chartData = [
    { name: "Classes", value: data.classes },
    { name: "Courses", value: data.courses },
  ];

  const colors = ["#4F46E5", "#10B981"]; // Purple & Green for better contrast

  return (
    <div className="p-4 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          
    {/* Bar Chart */}
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5 w-full min-w-[300px]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Bar Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="name"
            stroke="#666"
            interval={0}
            tick={{ fontSize: 12, angle: -45, dy: 10 }} // Rotate labels
          />
          <YAxis stroke="#666" />
          <Tooltip />
          <Legend />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Pie Chart */}
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5 w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pie Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`pie-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Line Chart */}
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5 w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Line Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
dataKey="name"
stroke="#666"
interval={0}
tick={{
  fontSize: 12,
  angle: -25,
  textAnchor: "end",
  wordWrap: "break-word",
}}
/>

          <YAxis stroke="#666" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke={colors[1]} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Area Chart */}
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5 w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Area Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient key={`grad-${index}`} id={`colorValue${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[index]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
dataKey="name"
stroke="#666"
interval={0}
tick={{
  fontSize: 12,
  angle: -25,
  textAnchor: "end",
  wordWrap: "break-word",
}}
/>

          <YAxis stroke="#666" />
          <Tooltip />
          <Legend />
          {chartData.map((entry, index) => (
            <Area 
              key={`area-${index}`} 
              type="monotone" 
              dataKey="value" 
              stroke={colors[index]} 
              fillOpacity={1} 
              fill={`url(#colorValue${index})`} 
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>

  </div>
  );
};

export default TeacherStats;
