import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard, {user?.fullName || user?.primaryEmailAddress?.emailAddress}!</p>
      
      <div style={{ marginTop: 20 }}>
        <h2>Quick Actions</h2>
        <ul>
          <li>View API Keys</li>
          <li>Manage Permissions</li>
          <li>View Usage Statistics</li>
        </ul>
      </div>

      <hr />
      <nav>
        <Link to="/">Go to Home</Link> | 
        <Link to="/profile">Go to Profile</Link>
      </nav>
    </div>
  );
}
