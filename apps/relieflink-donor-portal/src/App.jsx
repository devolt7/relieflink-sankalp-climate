import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toasts } from "./components/NotificationUI";
import DonorPage from "./pages/DonorPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import MyPledgesPage from "./pages/MyPledgesPage";
import CampPortalPage from "./pages/CampPortalPage";
import ClimatePage from "./pages/ClimatePage";
import SatinBranchPage from "./pages/SatinBranchPage";
import ImpactPage from "./pages/ImpactPage";
import { DonorProvider } from "./context/DonorContext";
import { useLiveDashboardStats } from "./hooks/useLiveData";

export default function App() {
  // Drives the "live" timestamp in the nav; harmless if unused on a page.
  const { lastUpdated } = useLiveDashboardStats();

  return (
    <BrowserRouter>
      <DonorProvider>
        <Navbar lastUpdated={lastUpdated} />
        <Toasts />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/donor" element={<DonorPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-pledges" element={<MyPledgesPage />} />
          <Route path="/camp" element={<CampPortalPage />} />
          <Route path="/climate" element={<ClimatePage />} />
          <Route path="/satin" element={<SatinBranchPage />} />
          <Route path="/impact" element={<ImpactPage />} />
        </Routes>
      </DonorProvider>
    </BrowserRouter>
  );
}
