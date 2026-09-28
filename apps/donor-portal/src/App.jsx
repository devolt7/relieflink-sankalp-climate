import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DonorPage from "./pages/DonorPage";
import DashboardPage from "./pages/DashboardPage";
import ClimatePage from "./pages/ClimatePage";
import SatinBranchPage from "./pages/SatinBranchPage";
import ImpactPage from "./pages/ImpactPage";
import { useLiveDashboardStats } from "./hooks/useLiveData";

export default function App() {
  // Drives the "live" timestamp in the nav; harmless if unused on a page.
  const { lastUpdated } = useLiveDashboardStats();

  return (
    <BrowserRouter>
      <Navbar lastUpdated={lastUpdated} />
      <Routes>
        <Route path="/" element={<DonorPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/climate" element={<ClimatePage />} />
        <Route path="/satin" element={<SatinBranchPage />} />
        <Route path="/impact" element={<ImpactPage />} />
      </Routes>
    </BrowserRouter>
  );
}
