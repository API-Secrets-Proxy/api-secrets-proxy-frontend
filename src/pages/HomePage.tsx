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
        credentials: "include" // optional if using cookies
      });

      const text = await res.text();
      setApiResponse(text);
    } catch (err) {
      setApiResponse("Error: " + (err as Error).message);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Clerk + React + Vapor Demo</h1>
      <div>
        <p>Welcome, {user?.fullName || user?.primaryEmailAddress?.emailAddress}!</p>
        <SignOutButton />
        <hr />

        {/* Call with signup template if this is the first session */}
        <button onClick={() => getUser()}>Get User</button>

        <pre>{apiResponse}</pre>
        
        <hr />
        <nav>
          <Link to="/dashboard">Go to Dashboard</Link> | 
          <Link to="/profile">Go to Profile</Link>
        </nav>
      </div>
    </div>
  );
}
