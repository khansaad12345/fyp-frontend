import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const GenerateQRCode = ({ teacherId }) => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]); // Courses filtered by selected class
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/teacher/${teacherId}/sessions`)
      .then((res) => setSessions(res.data.sessions))
      .catch(() => setSessions([]));
  }, [teacherId]);

  useEffect(() => {
    if (selectedSession) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/api/teacher/${teacherId}?session=${selectedSession}`)
        .then((res) => {
          setCourses(res.data.courses);
          setClasses(res.data.courses.flatMap(course => course.classes.map(cls => cls.class)));
        })
        .catch(() => setCourses([]))
        .finally(() => setLoading(false));
    }
  }, [selectedSession, teacherId]);

   // Filter courses based on the selected class
    useEffect(() => {
      if (selectedClass) {
          const filtered = courses.filter(course => 
              course.classes.some(cls => cls.class._id === selectedClass)
          );
          setFilteredCourses(filtered); // Set filtered courses
      } else {
          setFilteredCourses(courses); // If no class is selected, show all courses
      }
  }, [selectedClass, courses]);

  const handleGenerateQRCode = async () => {
    if (!selectedCourse || !selectedClass || !date) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-code`, {
        courseId: selectedCourse,
        classId: selectedClass,
        teacherId,
        date,
      });

      setQrCodeUrl(response.data.qrCodeUrl);
      setExpiresAt(new Date(response.data.expiresAt).toLocaleTimeString());
     
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR Code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Generate QR Code for Attendance
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {[{
          label: "Year", id: "session", value: selectedSession, options: sessions, setValue: setSelectedSession
        }, {
          label: "Class", id: "class", value: selectedClass, options: classes, setValue: setSelectedClass, format: cls => `${cls.className} - ${cls.classCode} - ${cls.shift} - ${cls.section}`
        },{
          label: "Course", id: "course", value: selectedCourse, options: filteredCourses, setValue: setSelectedCourse, format: course => `${course.courseCode} - ${course.courseName}`
        }].map(({ label, id, value, options, setValue, format }, index) => (
          <motion.div 
            key={id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {label}
            </label>
            <select
              id={id}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Select {label}</option>
              {options.map((opt, idx) => (
                <option key={idx} value={opt._id || opt}>
                  {format ? format(opt) : opt}
                </option>
              ))}
            </select>
          </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <label htmlFor="date" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200"
          />
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={handleGenerateQRCode}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-blue-500 dark:bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-blue-800"
        whileHover={{ scale: 1.05 }}
      >
        {loading ? "Generating..." : "Generate QR Code"}
      </motion.button>

      {qrCodeUrl && (
        <motion.div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Expires at: {expiresAt}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GenerateQRCode;
