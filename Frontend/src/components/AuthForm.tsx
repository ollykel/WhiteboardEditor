import { useState } from "react";
import { useNavigate } from 'react-router';

import AuthInput from "./AuthInput";

interface AuthFormProps {
  initialAction: "login" | "signup";
}

function AuthForm({ initialAction }: AuthFormProps) {
  const [action, setAction] = useState(initialAction);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault;
    if (action === "login") {
      console.log("User logged in with ", {email, password});
    }
    else {
      console.log("User signed upwith ", {email, password});
    }
  }

  const handleToggle = () => {
    if (action === "login") {
      setAction("signup");
      navigate("/signup");
    }
    else {
      setAction("login");
      navigate("/login");
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
          className="w-full font-medium py-2 my-2 rounded-lg bg-gray-100 hover:bg-gray-200 hover:cursor-pointer shadow-md"
        >
          {action === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>

      <div className="flex justify-center mt-4 pt-6 border-t-1 border-gray-400">
        <div className="p-2">
          {action === "login" ? "New to Whiteboard?" : "Already have an account?"}
        </div>
        <button 
          onClick={handleToggle}
          className=" font-medium rounded-lg px-4 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer shadow-md"
        >
          {action === "login" ? "Create a New Account!" : "Log In"}
        </button>
      </div>
    </div>
  );
}

export default AuthForm;