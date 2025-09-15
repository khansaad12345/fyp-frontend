import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Transition from '../../../utils/Transition';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
function DropdownNotifications({ align, studentId }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Track unread notifications
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // Fetch notifications when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications/${studentId}`);
        setNotifications(response.data.notifications);
        // Calculate unread notifications
        const unread = response.data.notifications.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [studentId]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send the student ID to the server to identify the connection
      ws.send(JSON.stringify({ studentId }));
    };

    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
      setUnreadCount((prevCount) => prevCount + 1); // Increment unread count
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup function to close the WebSocket connection
    return () => {
      ws.close();
    };
  }, [studentId]);

  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/notifications/mark-as-read/${notificationId}`);
      setNotifications((prevNotifications) =>
        prevNotifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prevCount) => prevCount - 1); // Decrement unread count
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close dropdown on pressing the Esc key
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ${dropdownOpen && 'bg-gray-200 dark:bg-gray-800'}`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Notifications</span>
        <svg
          className="fill-current text-gray-500/80 dark:text-gray-400/80"
          width={16}
          height={16}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 0a7 7 0 0 0-7 7c0 1.202.308 2.33.84 3.316l-.789 2.368a1 1 0 0 0 1.265 1.265l2.595-.865a1 1 0 0 0-.632-1.898l-.698.233.3-.9a1 1 0 0 0-.104-.85A4.97 4.97 0 0 1 2 7a5 5 0 0 1 5-5 4.99 4.99 0 0 1 4.093 2.135 1 1 0 1 0 1.638-1.148A6.99 6.99 0 0 0 7 0Z" />
          <path d="M11 6a5 5 0 0 0 0 10c.807 0 1.567-.194 2.24-.533l1.444.482a1 1 0 0 0 1.265-1.265l-.482-1.444A4.962 4.962 0 0 0 16 11a5 5 0 0 0-5-5Zm-3 5a3 3 0 0 1 6 0c0 .588-.171 1.134-.466 1.6a1 1 0 0 0-.115.82 1 1 0 0 0-.82.114A2.973 2.973 0 0 1 11 14a3 3 0 0 1-3-3Z" />
        </svg>
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-gray-100 dark:border-gray-900 rounded-full"></div>
        )}
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full -mr-48 sm:mr-0 min-w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-4">
            Notifications
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-2 text-sm text-gray-700 dark:text-gray-400">No notifications found.</li>
            ) : (
              notifications.map((notification, index) => (
                <li key={index} className="px-4 py-2 border-b border-gray-200 dark:border-gray-700/60 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!notification.read && (
  <button
    onClick={() => markNotificationAsRead(notification._id)}
    className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 relative group"
    title="Mark as Read" // Tooltip text
  >
    <CheckCircleIcon className="w-5 h-5" /> {/* Checkmark icon */}
    {/* <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 dark:bg-white dark:text-gray-700 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
      Mark as Read
    </span> */}
  </button>
)}
                </li>
              ))
            )}
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownNotifications;