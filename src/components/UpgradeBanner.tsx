import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function UpgradeBanner() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRequestUsage, setCurrentRequestUsage] = useState<number | null>(null);
  const [requestLimit, setRequestLimit] = useState<number | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const token = await getToken({ template: "default" });

      const res = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        credentials: "include",
      });

      if (res.ok) {
        const userData = await res.json();
        setCurrentRequestUsage(userData.currentRequestUsage ?? null);
        setRequestLimit(userData.requestLimit ?? null);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUserData();
    // Refresh every 30 seconds to keep usage up to date
    const interval = setInterval(fetchUserData, 30000);
    return () => clearInterval(interval);
  }, [fetchUserData]);

  // Don't show banner on pricing page
  const isPricingPage = location.pathname === '/pricing';

  // Check if we should show the banner (less than 10% remaining)
  const shouldShowBanner = 
    !isPricingPage &&
    currentRequestUsage !== null &&
    requestLimit !== null &&
    requestLimit > 0 &&
    (currentRequestUsage / requestLimit) >= 0.9;

  if (!shouldShowBanner) {
    return null;
  }

  const remainingRequests = requestLimit - currentRequestUsage;
  const percentageRemaining = ((requestLimit - currentRequestUsage) / requestLimit) * 100;

  const handleUpgrade = () => {
    // Navigate to the pricing/subscription page
    navigate("/pricing");
  };

  return (
    <div className="upgrade-banner">
      <div className="upgrade-banner-content">
        <div className="upgrade-banner-icon">
          <span className="material-symbols-outlined">warning</span>
        </div>
        <div className="upgrade-banner-text">
          <strong>Low Request Limit</strong>
          <span>
            You have {remainingRequests} request{remainingRequests !== 1 ? 's' : ''} remaining ({percentageRemaining.toFixed(0)}% left). 
            Upgrade your plan to get more requests.
          </span>
        </div>
        <div className="upgrade-banner-actions">
          <button className="upgrade-banner-btn" onClick={handleUpgrade}>
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}

