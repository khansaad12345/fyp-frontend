import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AttendanceReport = ({ studentId }) => {
    const [studentsWithAttendance, setStudentsWithAttendance] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);

    const [selectedSession, setSelectedSession] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLowAttendance, setShowLowAttendance] = useState(false); // New state for filter
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    // Fetch sessions when component mounts
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/course-years/${studentId}`)
            .then((res => {
                
                setSessions(res.data.years)})
            )
            .catch(() => setSessions([]));
    }, [studentId]);

    //Fetch courses and classes when session is selected
    useEffect(() => {
        if (selectedSession) {
            setIsLoading(true);
            axios.get(`${API_BASE_URL}/api/students/${studentId}?year=${selectedSession}`)
    .then((res) => {
        console.log("API Response:", res.data);

        // Extracting unique courses from all enrollments
        const extractedCourses = res.data.courses.flatMap(enrollment => enrollment.course || []);
        
        // Extracting unique class details
        const extractedClasses = res.data.courses.map(enrollment => enrollment.class || {});

        setCourses(extractedCourses);   // Update course state
        setClasses(extractedClasses);   // Update class state
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
        setCourses([]); 
        setClasses([]);
    })
    .finally(() => setIsLoading(false));


        }
    }, [selectedSession, studentId]);

    // Fetch attendance data only when all fields are selected
const fetchData = async () => {
    if (!selectedClass || !selectedCourse || !selectedDate) {
        setError("Please select a class, course, and date to view attendance.");
        setStudentsWithAttendance([]); // Clear previous data
        return;
    }

    setIsLoading(true);
    setError('');
    setStudentsWithAttendance([]); // Clear previous data

    try {
        const response = await axios.get(`${API_BASE_URL}/api/student-attendance`, {
            params: {studentId, classId: selectedClass, courseId: selectedCourse, date: selectedDate },
        });
        console.log(response.data.student)
        if (response.data.student.length === 0) {
            setError('No students found for the selected class, course, and date.');
        } else {
            setStudentsWithAttendance(response.data.student);
        }
    } catch (error) {
        setError('Failed to fetch data. Please try again.');
    } finally {
        setIsLoading(false);
    }
};

// Fetch low attendance students only when class and course are selected
// const fetchLowAttendanceStudents = async () => {
//     if (!selectedClass || !selectedCourse) {
//         setError("Please select a class and course to view low attendance.");
//         setStudentsWithAttendance([]); // Clear previous data
//         return;
//     }

//     setIsLoading(true);
//     setError('');
//     setStudentsWithAttendance([]); // Clear previous data

//     try {
//         const response = await axios.get('${API_BASE_URL}/api/low-attendance', {
//             params: { classId: selectedClass, courseId: selectedCourse },
//         });

//         if (response.data.students.length === 0) {
//             setError('No students found with low attendance for the selected class and course.');
//         } else {
//             setStudentsWithAttendance(response.data.students);
//         }
//     } catch (error) {
//         setError('Failed to fetch data. Please try again.');
//     } finally {
//         setIsLoading(false);
//     }
// };

// Ensure all required fields are selected before fetching data
useEffect(() => {
        fetchData();
}, [selectedClass, selectedCourse, selectedDate, showLowAttendance]);
    // Function to handle the export of attendance data
    const handleExportAttendance = async () => {
        if (!selectedClass || !selectedCourse) {
            setError('Please select a class and course before exporting.');
            return;
        }

        try {
            const response = await axios.get('${API_BASE_URL}/api/export-student-attendance', {
                params: { studentId , classId: selectedClass, courseId: selectedCourse },
                responseType: 'blob', // Important for handling binary data
            });

            // Create a link element to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'attendance.xlsx');
            document.body.appendChild(link);
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error exporting attendance data:', error);
            setError('Failed to export attendance data. Please try again.');
        }
    };

    // Check if the button should be enabled
    const isButtonEnabled = selectedCourse && selectedClass;

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
                        {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.courseCode}-{course.courseName}
                            </option>
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
                {/* <motion.button
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
                </motion.button> */}
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
                    Attendance
                </th>
            </tr>
        </thead>
        <AnimatePresence>
            <tbody>
                {studentsWithAttendance.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <td colSpan="4" className="py-4 text-center text-gray-700 dark:text-gray-300">
                            No attendance records found.
                        </td>
                    </motion.tr>
                ): (
                    
                        <motion.tr
                            
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: 1 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">1</td>
                            <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">{studentsWithAttendance.name}</td>
                            <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300">{studentsWithAttendance.reg_No}</td>
                            <td className="py-3 px-4 border-b text-gray-700 dark:text-gray-300"> 
                                    {studentsWithAttendance.attendance ? (
                                        <span className={studentsWithAttendance.attendance.status === 'Present' ? 'text-green-600' : 'text-red-600'}>
                                            {studentsWithAttendance.attendance.status}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">No record</span>
                                    )
                                }
                            </td>
                        </motion.tr>
                    )
                 }
            </tbody>
        </AnimatePresence>
    </table>
</motion.div>
        </motion.div>
    );
};

export default AttendanceReport;