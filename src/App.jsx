import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import ToastContainer from "./utils/ToastContainer";
import AuthCallback from "./Authentication/AuthCallback";

import Login from "./Authentication/SignIn";
import Signup from "./Authentication/SignUp";
import ForgotPassword from "./Authentication/ForgotPassword";
import ResetPassword from "./Authentication/ResetPassword";
import VerifyEmail from "./Authentication/VerifyEmail";

import Layout from "./Components/Layout";

// pages
import Home from "./Pages/user/Home";
import Interview from "./Pages/user/Interview";
import Resume from "./Pages/user/Resume";
import Support from "./Pages/user/Support";
import Profile from "./Pages/user/Profile";
import Download from "./Pages/user/Download";
import InterviewCredits from "./Pages/user/InterviewCredits";
import PaymentSuccess from "./Pages/payment/PaymentSuccess";
import MockInterview from "./Pages/user/MockInterview";
import LiveInterview from "./Pages/user/LiveInterview";

function App() {
  console.log("BUILD:", import.meta.env.VITE_BUILD_ID);

  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/download" element={<Download />} />
            <Route path="/buy-credits" element={<InterviewCredits />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/mock" element={<MockInterview />} />
            <Route path="/live-interview" element={<LiveInterview />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;