import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import ResetPassword from './pages/ResetPassword';
import VerifySignupOtp from './pages/VerifySignupOtp';

import Dashboard from './pages/Dashboard';
import PostDetails from './pages/PostDetails';
import CreatePost from './pages/CreatePost';
import MyPosts from './pages/MyPosts';
import Drafts from './pages/Drafts';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
// import { requestNotificationPermission, onforegroundMessage } from './firebase/firebaseMessaging';
const NotFound = () => <div className="text-center mt-20 text-2xl">404 - Page Not Found</div>;

function App() {

  //-----------------------------------------------------------------------
  ///working on the notification

  // useEffect(() => {
  //   const getToken = async () => {
  //     try {
  //       const token = await requestNotificationPermission();
  //       if (token) {
  //         const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  //         await fetch(`${apiUrl}/auth/save-fcm-token`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ token }),
  //         });
  //       }
  //     } catch (error) {
  //       console.log("Error getting token:", error);
  //     }
  //   };
  //   getToken();
  // }, []);

  //-----------------------------------------------------------------------
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<Explore />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-signup-otp" element={<VerifySignupOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/drafts" element={<Drafts />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/posts/:id" element={<PostDetails />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
