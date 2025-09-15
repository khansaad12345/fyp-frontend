import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons from react-icons

const AttendanceReport = ({ teacherId }) => {
    const [studentsWithAttendance, setStudentsWithAttendance] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]); // Courses filtered by selected class
    
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLowAttendance, setShowLowAttendance] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // Fetch sessions when component mounts
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/teacher/${teacherId}/sessions`)
            .then(res => setSessions(res.data.sessions))
            .catch(() => setSessions([]));
    }, [teacherId]);

    // Fetch courses and classes when session is selected
    useEffect(() => {
        if (selectedSession) {
            setIsLoading(true);
            axios.get(`${API_BASE_URL}/api/teacher/${teacherId}?session=${selectedSession}`)
                .then((res) => {
                    setCourses(res.data.courses);
                    const extractedClasses = res.data.courses.flatMap(course => course.classes.map(cls => cls.class));
                    setClasses(extractedClasses);
                })
                .catch(() => setCourses([]))
                .finally(() => setIsLoading(false));
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

    // Fetch attendance data only when all fields are selected
    const fetchData = async () => {
        if (!selectedClass || !selectedCourse || !selectedDate) {
            setError("Please select a class, course, and date to view attendance.");
            setStudentsWithAttendance([]);
            return;
        }

        setIsLoading(true);
        setError('');
        setStudentsWithAttendance([]);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/get-attendance`, {
                params: { classId: selectedClass, courseId: selectedCourse, date: selectedDate },
            });

            if (response.data.students.length === 0) {
                setError('No students found for the selected class, course, and date.');
            } else {
                setStudentsWithAttendance(response.data.students);
            }
        } catch (error) {
            console.log(error.response.data.message)
            setError(error.response.data.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch low attendance students only when class and course are selected
    const fetchLowAttendanceStudents = async () => {
        if (!selectedClass || !selectedCourse) {
            setError("Please select a class and course to view low attendance.");
            setStudentsWithAttendance([]);
            return;
        }

        setIsLoading(true);
        setError('');
        setStudentsWithAttendance([]);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/low-attendance`, {
                params: { classId: selectedClass, courseId: selectedCourse },
            });

            if (response.data.students.length === 0) {
                setError('No students found with low attendance for the selected class and course.');
            } else {
                setStudentsWithAttendance(response.data.students);
            }
        } catch (error) {
            setError(error.response.data.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Ensure all required fields are selected before fetching data
    useEffect(() => {
        if (showLowAttendance) {
            fetchLowAttendanceStudents();
        } else {
            fetchData();
        }
    }, [selectedClass, selectedCourse, selectedDate, showLowAttendance]);

    // Function to handle the export of attendance data
    const handleExportAttendance = async () => {
        if (!selectedClass || !selectedCourse) {
            setError('Please select a class and course before exporting.');
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/export-attendance`, {
                params: { classId: selectedClass, courseId: selectedCourse },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attendance.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error exporting attendance data:', error);
            setError('Failed to export attendance data. Please try again.');
        }
    };

    // Check if the button should be enabled
    const isButtonEnabled = selectedCourse && selectedClass;

    // Function to handle edit action
    const handleEdit = (studentId) => {
        console.log('Edit student:', studentId);
        // Add your edit logic here
    };

    // Function to handle delete action
    const handleDelete = (studentId) => {
        console.log('Delete student:', studentId);
        // Add your delete logic here
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 max-w-7xl mx-auto"
        >
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 text-center"
            >
                Attendance Report
            </motion.h2>

            {/* Class, Course, and Date Selection */}
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

            {/* View Full Report and Filter Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="flex justify-center gap-4 mb-8"
            >
                <motion.button
                    whileHover={{ scale: isButtonEnabled ? 1.05 : 1 }}
                    whileTap={{ scale: isButtonEnabled ? 0.95 : 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleExportAttendance}
                    disabled={!isButtonEnabled}
                    title={!isButtonEnabled ? "Please select course and class" : ""}
                    className={`px-6 py-2 rounded-lg text-white font-semibold ${
                        isButtonEnabled
                            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed'
                    } transition-all duration-200 relative`}
                >
                    View Full Report
                </motion.button>

                {/* Filter Button for Low Attendance */}
                <motion.button
                    whileHover={{ scale: isButtonEnabled ? 1.05 : 1 }}
                    whileTap={{ scale: isButtonEnabled ? 0.95 : 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowLowAttendance(!showLowAttendance)}
                    disabled={!isButtonEnabled}
                    title={!isButtonEnabled ? "Please select course and class" : ""}
                    className={`px-6 py-2 rounded-lg text-white font-semibold ${
                        isButtonEnabled
                            ? showLowAttendance
                                ? 'bg-red-500 hover:bg-red-600 cursor-pointer'
                                : 'bg-green-500 hover:bg-green-600 cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed'
                    } transition-all duration-200 relative`}
                >
                    {showLowAttendance ? 'Show Attendance' : 'Show Low Attendance'}
                </motion.button>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center items-center p-4"
                >
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </motion.div>
            )}

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

            {/* Attendance Report Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="overflow-x-auto max-h-[500px] overflow-y-auto border rounded-lg shadow-lg"
            >
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-900 shadow-md">
                        <tr>
                            <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">#</th>
                            <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">Student Name</th>
                            <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">Reg No</th>
                            <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">
                                {showLowAttendance ? 'Attendance Percentage' : 'Attendance'}
                            </th>
                            <th className="py-3 px-4 border-b text-left text-gray-800 dark:text-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <AnimatePresence>
                        <tbody>
                            {studentsWithAttendance.length > 0 ? (
                                studentsWithAttendance.map((student, index) => (
                                    <motion.tr
                                        key={student.studentId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">{index + 1}</td>
                                        <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">{student.name}</td>
                                        <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">{student.reg_No}</td>
                                        <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">
                                            {showLowAttendance ? (
                                                <div className="relative w-full bg-gray-200 rounded-full h-4">
                                                    <div
                                                        className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-500 ${
                                                            student.attendancePercentage < 50
                                                                ? 'bg-red-500'
                                                                : student.attendancePercentage < 75
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'
                                                        }`}
                                                        style={{ width: `${student.attendancePercentage}%` }}
                                                    ></div>
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800 ">
                                                        {student.attendancePercentage}%
                                                    </span>
                                                </div>
                                            ) : (
                                                student.attendance ? (
                                                    <span className={student.attendance.status === 'Present' ? 'text-green-600' : 'text-red-600'}>
                                                        {student.attendance.status}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">No record</span>
                                                )
                                            )}
                                        </td>
                                        <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleEdit(student.studentId)}
                                                    className="text-blue-500 hover:text-blue-700 transition-all duration-200"
                                                >
                                                    <FaEdit size={18} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(student.studentId)}
                                                    className="text-red-500 hover:text-red-700 transition-all duration-200"
                                                >
                                                    <FaTrash size={18} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                    <td colSpan="5" className="py-4 text-center text-gray-700 dark:text-gray-300">
                                        No attendance records found.
                                    </td>
                                </motion.tr>
                            )}
                        </tbody>
                    </AnimatePresence>
                </table>
            </motion.div>
        </motion.div>
    );
};

export default AttendanceReport;