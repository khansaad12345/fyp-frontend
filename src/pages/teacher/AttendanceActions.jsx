import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import WelcomeC from "../../components/teacher/cards/WelcomeC";

export default function AttendanceActions() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/attendance`);
      };

      const HandleGenerate = () => {
        navigate(`/generate-code`);
      };

  return (
    <>
    <WelcomeC />
    <div className="flex flex-col items-center justify-start space-y-6 p-6">
      <motion.h1
        className="text-3xl font-bold text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Select Method to Take Attendance
      </motion.h1>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Take Attendance Manually */}
        <motion.button
            onClick={()=> handleClick()}
          className="px-6 py-3 text-lg font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Take Attendance Manually
        </motion.button>

        {/* Generate QR Code */}
        <motion.button
          onClick={()=>HandleGenerate()}
          className="px-6 py-3 text-lg font-medium text-white bg-green-600 dark:bg-green-500 rounded-lg shadow-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Generate QR Code
        </motion.button>
      </div>
    </div>
    </>
  );
}
