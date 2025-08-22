import { useState } from "react";

import AuthInput from "./AuthInput";

interface AuthFormProps {
  initialAction: "login" | "signup";
}

function AuthForm({ initialAction }: AuthFormProps) {
  const [action, setAction] = useState(initialAction);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault;
    if (action === "login") {
      console.log("User logged in with ", {email, password});
    }
    else {
      console.log("User signed upwith ", {email, password});
    }
  }

  return (
    <div className="flex flex-col min-w-60 w-95">
      <h1 className="text-2xl font-bold text-center mb-6">
        {action === "login" ? "Welcome Back!" : "Welcome to <Whiteboard App>!"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          name="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <AuthInput
          name="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
        />
        {action === "signup" && (
          <AuthInput
            name="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
          />
        )}
        <button
          type="submit"
          className="w-full font-medium py-2 mt-4 rounded-lg hover:bg-gray-200"
        >
          {action === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;