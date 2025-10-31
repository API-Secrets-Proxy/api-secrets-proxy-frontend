import { SignOutButton, useAuth, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function HomePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [apiResponse, setApiResponse] = useState("");

  const getUser = async () => {
    try {
      const token = await getToken({ template: "default" });

      const res = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", 
      });

      const text = await res.text();
      setApiResponse(text || "(no response body)");
    } catch (err) {
      setApiResponse("Error: " + (err as Error).message);
    }
  };

  return (
    <div className="layout-shell">
      {/* Title */}
      <h1 className="hero-title">ProxLock Dashboard</h1>

      {/* Subtext */}
      <p className="hero-subtext">
        Welcome
        {user?.fullName
          ? `, ${user.fullName}`
          : user?.primaryEmailAddress?.emailAddress
            ? `, ${user.primaryEmailAddress.emailAddress}`
            : ""}
        .
        <br />
        You’re signed in. You can test auth, inspect your session, and jump to secure areas of the app.
      </p>

      {/* Actions */}
      <div className="actions-row">
        {/* Sign out from Clerk */}
        <SignOutButton>
          <button className="btn-solid">Sign out</button>
        </SignOutButton>

        {/* Call backend */}
        <button className="btn-solid" onClick={getUser}>
          Get User
        </button>
      </div>

      {/* API response box */}
      <div className="response-box">{apiResponse || "Click “Get User” to fetch /me from the backend."}</div>

      {/* Nav links */}
      <div className="link-row">
        <Link to="/dashboard">Dashboard</Link>|<Link to="/profile">Profile</Link>
      </div>

      {/* Footer */}
      <div className="page-footer">© {new Date().getFullYear()} ProxLock. All rights reserved.</div>
    </div>
  );
}
