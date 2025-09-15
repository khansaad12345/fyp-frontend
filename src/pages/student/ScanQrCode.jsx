import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType,Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ScanQRCode = ({ studentId }) => {
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const qrScannerRef = useRef(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleScan = async (scannedText) => {
    console.log("Scanned Text:", scannedText);
    setQrData(scannedText);
    setScanning(false);
    setIsScanning(true);

    try {
      const qrObject = JSON.parse(scannedText);
      console.log("Parsed QR Object:", qrObject);
      const { token } = qrObject;

      if (!token) {
        toast.error("Invalid QR Code: Missing token");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/take-attendance`, {
        token,
        studentId,
      });

      toast.success(response.data.message);
    } catch (error) {
      console.error("Error parsing QR code:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid QR Code: Unable to parse data";
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner Error:", error);
    setCameraError(true);
  
    if (error.message.includes("NotFoundException")) {
      toast.error("No QR code detected. Please ensure the QR code is clear and try again.");
    } else if (error.message.includes("Permission denied")) {
      toast.error("Camera access denied. Please allow camera access to scan QR codes.");
    } else {
      toast.error("QR scanner error. Try again.");
    }
  
    setIsScanning(false);
  };

  const startScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        toast.error("No cameras found. Please upload an image.");
        return;
      }

      const backCamera = devices.find((device) => device.label.toLowerCase().includes("back"));
      const frontCamera = devices.find((device) => device.label.toLowerCase().includes("front"));

      const cameraId = backCamera?.id || frontCamera?.id || devices[0].id;

      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false
      );

      qrScannerRef.current = qrScanner;
      qrScanner.render(handleScan, handleError, cameraId);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Failed to access camera. Please upload an image.");
    }
  };

  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const html5QrCode = new Html5Qrcode("qr-reader");
  //   html5QrCode
  //     .scanFile(file, true)
  //     .then((scannedText) => {
  //       handleScan(scannedText);
  //     })
  //     .catch((error) => {
  //       console.error("Error scanning file:", error);
  //       toast.error("Failed to scan the image. Please try again.");
  //     });
  // };

  useEffect(() => {
    if (scanning) {
      startScanner();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear();
      }
    };
  }, [scanning, cameraError]);

  return (
    <>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-all"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Scan QR Code for Attendance
        </motion.h2>

        {scanning ? (
          <motion.div
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div id="qr-reader" className="w-full h-auto max-w-full"></div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setScanning(true)}
            className="px-6 py-3 bg-green-500 dark:bg-green-700 text-white rounded-lg shadow-md transition-all hover:bg-green-600 dark:hover:bg-green-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Start Scanning"}
          </motion.button>
        )}

        {/* <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-4 px-6 py-3 bg-blue-500 dark:bg-blue-700 text-white rounded-lg shadow-md transition-all hover:bg-blue-600 dark:hover:bg-blue-800"
          disabled={isScanning}
        /> */}

        {qrData && (
          <motion.div
            className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-700 dark:text-white break-words">
              <span className="font-bold">QR Code Scanned:</span> {qrData}
            </p>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default ScanQRCode;