import React, { useState } from 'react';
import Sidebar from "../../components/admin/layout/Sidebar";
import Header from '../../components/admin/layout/Header';
// import FilterButton from '../components/DropdownFilter';
// import Datepicker from '../components/Datepicker';
import DashboardCard02 from '../../components/admin/cards/DashboardCard02';
// import Path from '../routes/Path'; // Ensure correct path to the component
import Footer from './Footer';
import CCLass from './CClass';
import ViewClass from './ViewClass';
import CCourse from './CCourse';
import ViewCourse from './ViewCourse';
import CStudent from './CStudent';
import ViewStudent from './ViewStudent';

import CTeacher from './CTeacher';
import ViewTeacher from './ViewTeacher';
import Logout from './Logout';
import Overview from '../../components/admin/cards/OverView';
import CEnrollment from './CEnrollment';
import ViewEnroll from './ViewEnroll';
import PageNotFound from './PageNotFound';
import { Route, Routes } from 'react-router-dom';
import EStudent from './EStudent';
import ETeacher from './ETeacher';
import UpdateClass from './EClass';
import UCourse from './ECourse';
import UEnrollment from './UEnrollment';
import AttendanceReport from './AttendanceReport';


function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Dashboard actions */}
            {/* <div className="sm:flex sm:justify-between sm:items-center mb-8"> */}
              {/* Left: Title */}
              {/* <div className="mb-4 sm:mb-0">
                <DashboardCard02 />
              </div> */}

              {/* Right: Actions */}
              {/* <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <FilterButton align="right" />
                <Datepicker align="right" />
                <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                  <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">Add View</span>
                </button>
              </div> */}
            {/* </div> */}

            {/* Render Routes */}
            {/* <Path /> */}
            <Routes>
              <Route path="create-class" element={<CCLass />} />
              <Route path="edit-class/:id" element={<UpdateClass />} />
              <Route path="view-class" element={<ViewClass />} />
              <Route path="create-course" element={<CCourse />} />
              <Route path="edit-course/:id" element={<UCourse />} />
              <Route path="view-course" element={<ViewCourse />} />
              <Route path="view-student" element={<ViewStudent />} />
              <Route path="edit-student/:id" element={<EStudent />} />
              <Route path="create-student" element={<CStudent />} />
              <Route path="create-Teacher" element={<CTeacher />} />
              <Route path="edit-teacher/:id" element={<ETeacher />} />
              <Route path="view-Teacher" element={<ViewTeacher />} />
              <Route path="logout" element={<Logout />} />
              {/* <Route path="dashboard" element={<Overview />} /> */}
              <Route
                    path="/"
                    element={
                        
                            <Overview />
                        
                    }
                />
              <Route path="create-enrollment" element={<CEnrollment />} />
              <Route path="edit-enrollment/:id" element={<UEnrollment />} />
              <Route path="view-enroll" element={<ViewEnroll />} />
              <Route path="attendance-report" element={<AttendanceReport />} />

              {/* Add more routes as needed */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          
            <div className='mt-4'>
            <Footer />
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
