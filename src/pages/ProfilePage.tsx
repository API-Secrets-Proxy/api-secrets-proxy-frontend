import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Profile</h1>
      <div>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {user?.fullName || "Not provided"}</p>
        <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress || "Not provided"}</p>
        <p><strong>User ID:</strong> {user?.id || "Not available"}</p>
        <p><strong>Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Account Settings</h2>
        <p>Manage your account settings and preferences here.</p>
      </div>

      <hr />
      <nav>
        <Link to="/">Go to Home</Link>
      </nav>
    </div>
  );
}
