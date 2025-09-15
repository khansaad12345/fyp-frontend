import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
const TakeAttendance = ({ teacherId }) => {
  // State variables for API data
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]); // Courses filtered by selected class
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State variables for selections
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Attendance status: { studentId: 'Present' | 'Absent' }
  const [attendance, setAttendance] = useState({});
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Fetch sessions, courses, and classes when component mounts
  useEffect(() => {
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/api/teacher/${teacherId}/sessions`)
      .then(res => {
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
      axios.get(`${API_BASE_URL}/api/teacher/${teacherId}?session=${selectedSession}`)
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

  // Fetch students whenever course and class selections change
  useEffect(() => {
    if (selectedCourse && selectedClass) {
      setIsLoading(true);
      axios.get(`${API_BASE_URL}/api/enrolled-student?courseId=${selectedCourse}&classId=${selectedClass}`)
        .then(res => {
          setStudents(res.data.students);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching students:', err);
          setIsLoading(false);
        });
    } else {
      setStudents([]);
    }
  }, [selectedCourse, selectedClass]);

  // Update attendance status for a student
  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!selectedCourse || !selectedClass || !selectedDate || Object.keys(attendance).length === 0) {
      setError('Please fill all required fields and mark attendance for at least one student.');
      return;
    }

    // Format attendance records
    const formattedAttendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize status
    }));

    const payload = {
      courseId: selectedCourse,
      classId: selectedClass,
      teacherId,
      date: selectedDate,
      attendance: formattedAttendanceRecords,
    };

    axios.post(`${API_BASE_URL}/api/submit-attendance`, payload)
      .then(res => {
        toast.success(res.data.message)
        console.log('Attendance submitted successfully', res.data.message);
        setError(''); // Clear any previous errors
        // Optionally, reset the form or display a success message here.
      })
      .catch(err => {
        console.error('Error submitting attendance:', err);
        setError(err.response?.data?.message || 'Failed to submit attendance. Please try again.');
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-7xl mx-auto"
    >
      <ToastContainer theme="dark" />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 transition-all duration-300"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 text-center"
        >
          Take Attendance
        </motion.h2>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
          >
            {error}
          </motion.div>
        )}

        {/* Dropdowns and Date Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Session Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label
              htmlFor="session"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Year
            </label>
            <select
              id="session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200"
            >
              <option value="">Select Year</option>
              {sessions.map((session, index) => (
                <option key={index} value={session}>{session}</option>
              ))}
            </select>
          </motion.div>

               {/* Class Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <label
              htmlFor="class"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Class
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}-{cls.classCode}-{cls.shift}-{cls.section}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Course Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label
              htmlFor="course"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Course
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200"
            >
              <option value="">Select Course</option>
              {filteredCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode}-{course.courseName}
                </option>
              ))}
            </select>
          </motion.div>


          {/* Date Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <label
              htmlFor="date"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200"
              required
            />
          </motion.div>
        </div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="overflow-x-auto"
        >
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">#</th>
                <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">Student Name</th>
                <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">Reg No</th>
                <th className="py-3 px-4 border-b text-center text-gray-800 dark:text-gray-200">Attendance</th>
              </tr>
            </thead>
            <AnimatePresence>
              <tbody>
              {isLoading ? (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <td colSpan="4" className="py-4 text-center text-gray-700 dark:text-gray-300">
      Loading...
    </td>
  </motion.tr>
) : selectedCourse && selectedClass && students.length === 0 ? (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <td colSpan="4" className="py-4 text-center text-gray-700 dark:text-gray-300">
      No students found in this course and class.
    </td>
  </motion.tr>
) : students.length > 0 ? (
  students.map((student, index) => (
    <motion.tr
      key={student._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">
        {index + 1}
      </td>
      <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">
        {student.name}
      </td>
      <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">
        {student.reg_No}
      </td>
      <td className="py-3 px-4 border-b text-center">
        <div className="flex items-center justify-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`attendance-${student._id}`}
              value="Present"
              checked={attendance[student._id] === 'Present'}
              onChange={() => handleAttendanceChange(student._id, 'Present')}
              className="form-radio text-green-600 transition-all duration-200"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Present
            </span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`attendance-${student._id}`}
              value="Absent"
              checked={attendance[student._id] === 'Absent'}
              onChange={() => handleAttendanceChange(student._id, 'Absent')}
              className="form-radio text-red-600 transition-all duration-200"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Absent
            </span>
          </label>
        </div>
      </td>
    </motion.tr>
  ))
) : (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <td colSpan="4" className="py-4 text-center text-gray-700 dark:text-gray-300">
      No students found. Please select a course and class.
    </td>
  </motion.tr>
)}
              </tbody>
            </AnimatePresence>
          </table>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 flex justify-end"
        >
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300"
          >
            Submit Attendance
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default TakeAttendance;