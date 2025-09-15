import React, { useState } from 'react'
import {  Route, Routes } from 'react-router-dom'
import PageNotFound from '../admin/PageNotFound'
import TakeAttendance from './TakeAttendance'
import Sidebar from "../../components/teacher/layout/Sidebar";
import Header from '../../components/student/layout/Header'
import Overview from '../../components/teacher/cards/OverView'
import Footer from '../admin/Footer'
import Logout from './Logout'
import TeacherCourses from './TeacherCourses'
import AttendanceReport from './AttendanceReport'
import GenerateQRCode from './QrCodeGenerator'
import AttendanceActions from './AttendanceActions'



const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user")); // Get stored user info
  const teacherId = user && user.role === "teacher" ? user._id : null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
     <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
           
            {/* <Path /> */}
            <Routes>
              
              <Route
                    path="/"
                    element={
                        
                            <Overview />
                        
                    }
                />
      <Route path="take-attendance" element={<AttendanceActions />} />
      <Route path="attendance" element={<TakeAttendance teacherId={teacherId}/>} />
      <Route path="generate-code" element={<GenerateQRCode teacherId={teacherId}/>} />
      <Route path="view-attendance" element={<AttendanceReport teacherId={teacherId}/>} />
      <Route path="view-courses" element={<TeacherCourses teacherId = {teacherId} />} />
      <Route path="logout" element={<Logout />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          
            <div className='mt-4'>
            <Footer />
            </div>
            
          </div>
        </main>
      </div>
    </div>
    </>
    
  )
}

export default TeacherDashboard
