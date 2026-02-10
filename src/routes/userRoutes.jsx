import { Routes, Route } from "react-router-dom";

import Dashboard from "../Pages/user/Dashboard";
import PaymentSuccess from "../Pages/payment/PaymentSuccess";
import WebSocketInterview from "../Pages/user/WebSocketInterview";

export default function UserRoutes() {
  return (
    <Routes>
      {/* 8. User Portal Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/websocket-interview" element={<WebSocketInterview />} />
    </Routes>
  );
}
