import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import PeriodTrackerCalendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import ProductShop from "./pages/ProductShop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Blog from "./pages/Blog";
import './i18n';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="period-tracker" element={<PeriodTrackerCalendar />} />
          <Route path="shop" element={<ProductShop />} />
          <Route path="blog" element={<Blog />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
