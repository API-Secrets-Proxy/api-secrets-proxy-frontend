import { SignedIn, SignedOut, RedirectToSignIn, useAuth, useUser } from "@clerk/clerk-react";
import App from "./App/App.tsx";
import { use, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthRouter() {
  const { getToken } = useAuth();

  const createUser = async () => {
    try {
      const token = await getToken({ template: "default" });

      await fetch(`${API_URL}/me`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include" // optional if using cookies
      });
    } catch (err) {
    }
  };

  const { isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (!isLoaded) return;
    useEffect(() => {
      if (isSignedIn) {
        createUser();
      }
    }, [isSignedIn]);
  }, [isLoaded]);

  return (
    <div>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <App/>
      </SignedIn>
    </div>
  );
}