import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/Constant";
import { useDispatch } from "react-redux"
import {addUser} from '../utils/userSlice'

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const validateMobileNumber = (number) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(number);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!mobileNumber) {
        throw new Error("Mobile number is required");
      }

      if (!validateMobileNumber(mobileNumber)) {
        throw new Error("Please enter a valid 10-digit mobile number");
      }

      const response = await axios.post(
        `${BASE_URL}/login`,
        { mobileNumber },
        { withCredentials: true }
      );
        dispatch(addUser(response?.data))

      toast.success(response.data.message || "Login successful");
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-11/12 mx-auto min-h-screen flex flex-col justify-center md:flex-row">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Left - Image */}
      <div className="md:w-1/2 w-full flex items-center justify-center h-64 md:h-auto">
        <img
          src="https://testsigma.com/blog/wp-content/uploads/37c08d79-0e87-45ce-b1ed-c9bde83c16e7.png"
          alt="Login Visual"
          className="w-[90%] h-fit object-cover"
        />
      </div>

      {/* Right - Login Form */}
      <div className="md:w-1/2 w-full flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8"
        >
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="mobileNumber" className="block text-gray-700 font-medium mb-1">
                Mobile Number*
              </label>
              <input
                type="tel"
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl shadow hover:bg-indigo-700 transition-all"
              type="submit"
              disabled={loading}
            >
              Login
            </motion.button>
          </form>

          <button
            onClick={() => navigate("/signup")}
            className="mt-4 text-center text-blue-600 cursor-pointer hover:text-blue-700 transition-all duration-200"
          >
            Don't have an account? Sign Up
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            &copy; {new Date().getFullYear()} Your App Name. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;