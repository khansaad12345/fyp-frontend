import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LowAttendance = ({ teacherId }) => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [filterLowAttendance, setFilterLowAttendance] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${API_BASE_URL}/api/teacher/${teacherId}/sessions`)
      .then((res) => {
        setSessions(res.data.sessions);
        setIsLoading(false);
      })
      .catch(() => {
        setSessions([]);
        setIsLoading(false);
      });
  }, [teacherId]);

  useEffect(() => {
    if (selectedSession) {
      setIsLoading(true);
      axios
        .get(`${API_BASE_URL}/api/teacher/${teacherId}?session=${selectedSession}`)
        .then((res) => {
          setCourses(res.data.courses);
          const extractedClasses = res.data.courses.flatMap(course => course.classes.map(cls => cls.class));
          setClasses(extractedClasses);
          setIsLoading(false);
        })
        .catch(() => {
          setCourses([]);
          setClasses([]);
          setIsLoading(false);
        });
    }
  }, [selectedSession, teacherId]);

  useEffect(() => {
    if (selectedCourse && selectedClass) {
      setIsLoading(true);
      axios
        .get(`${API_BASE_URL}/api/enrolled-student?courseId=${selectedCourse}&classId=${selectedClass}`)
        .then((res) => {
          setStudents(res.data.students);
          setIsLoading(false);
        })
        .catch(() => {
          setStudents([]);
          setIsLoading(false);
        });

      // Fetch low-attendance students
      axios
        .get(`${API_BASE_URL}/api/low-attendance`,{
            params: { classId: selectedClass, courseId: selectedCourse }
        })
        .then((res) => {
          setLowAttendanceStudents(res.data.students);
        })
        .catch(() => {
          setLowAttendanceStudents([]);
        });
    } else {
      setStudents([]);
      setLowAttendanceStudents([]);
    }
  }, [selectedCourse, selectedClass]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 max-w-7xl mx-auto">
      <ToastContainer theme="dark" />
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 text-center">Attendance Report</h2>

        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {/* Session Dropdown */}
          <div>
            <label className="block text-sm font-bold mb-2">Session</label>
            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">Select Session</option>
              {sessions.map((session, index) => (
                <option key={index} value={session}>{session}</option>
              ))}
            </select>
          </div>

          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-bold mb-2">Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.courseCode} - {course.courseName}</option>
              ))}
            </select>
          </div>

          {/* Class Dropdown */}
          <div>
            <label className="block text-sm font-bold mb-2">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.className} - {cls.section}</option>
              ))}
            </select>
          </div>

          {/* Low Attendance Filter */}
          <div className="flex items-center mt-6">
            <input type="checkbox" id="low-attendance" checked={filterLowAttendance} onChange={() => setFilterLowAttendance(!filterLowAttendance)} className="mr-2" />
            <label htmlFor="low-attendance" className="text-sm">Show Students with Low Attendance</label>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b">#</th>
                <th className="py-3 px-4 border-b">Student Name</th>
                <th className="py-3 px-4 border-b">Reg No</th>
                <th className="py-3 px-4 border-b">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center">Loading...</td>
                </tr>
              ) : (
                (filterLowAttendance ? lowAttendanceStudents : students).map((student, index) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 border-b">{index + 1}</td>
                    <td className="py-3 px-4 border-b">{student.name}</td>
                    <td className="py-3 px-4 border-b">{student.reg_No}</td>
                    <td className="py-3 px-4 border-b text-center">{student.attendancePercentage || "N/A"}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LowAttendance;