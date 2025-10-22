import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import App from "./App/App.tsx";

export default function AuthRouter() {
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