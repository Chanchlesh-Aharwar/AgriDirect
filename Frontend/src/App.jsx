import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import FarmerDashboard from "./Pages/FarmerDashboard";
import RestaurantDashboard from "./Pages/RestaurantDashboard";
import AddProduct from "./Pages/AddProduct";
import Bidding from "./Pages/Bidding";
import OrderHistory from "./Pages/OrderHistory";
import Profile from "./Pages/Profile";
import MyBids from "./Pages/MyBids";
import Payment from "./Pages/Payment";
import TransportTracking from "./Pages/TransportTracking";
import Weather from "./Pages/Weather";

function PrivateRoute({ children, allowedRole }) {
  const role = localStorage.getItem("role");
  const user = localStorage.getItem("user");

  if (!role || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "FARMER" ? "/farmer/dashboard" : "/restaurant/dashboard"} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/farmer/dashboard" element={
          <PrivateRoute allowedRole="FARMER">
            <FarmerDashboard />
          </PrivateRoute>
        } />
        <Route path="/farmer/add-product" element={
          <PrivateRoute allowedRole="FARMER">
            <AddProduct />
          </PrivateRoute>
        } />
        <Route path="/farmer/orders" element={
          <PrivateRoute allowedRole="FARMER">
            <OrderHistory />
          </PrivateRoute>
        } />

        <Route path="/restaurant/dashboard" element={
          <PrivateRoute allowedRole="RESTAURANT">
            <RestaurantDashboard />
          </PrivateRoute>
        } />
        <Route path="/restaurant/my-bids" element={
          <PrivateRoute allowedRole="RESTAURANT">
            <MyBids />
          </PrivateRoute>
        } />
        <Route path="/restaurant/orders" element={
          <PrivateRoute allowedRole="RESTAURANT">
            <OrderHistory />
          </PrivateRoute>
        } />

        <Route path="/bidding/:id" element={<Bidding />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payment/:transactionId" element={<Payment />} />
        <Route path="/track/:trackingId" element={<TransportTracking />} />
        <Route path="/weather" element={<Weather />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
