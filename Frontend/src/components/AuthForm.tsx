import { useState } from "react";
import { useNavigate } from 'react-router';
import axios from "axios";

import AuthInput from "./AuthInput";
import { useUser } from "../AuthContext";

interface AuthFormProps {
  initialAction: "login" | "signup";
}

function AuthForm({ initialAction }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { setUser } = useUser();
  const action = initialAction;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { setUser } = useUser();

    const endpoint = 
      action === "login" 
      ? "http://localhost:8080/api/v1/auth/login" 
      : "http://localhost:8080/api/v1/users";

    // TODO: Make this dynamic to handle either email or username
    const authSource = "email";

    const payload = 
      action === "login"
      ? { authSource, email, password }
      : { email, username, password };

    try {
      const res = await axios.post(endpoint, payload);
      const { token } = await res.data;
      console.log(token);
      localStorage.setItem("token", token);

      // TODO: Make consistent with axios (separate API file?)
      const meRes = await fetch("http://localhost:8080/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(meRes);

      if (!meRes.ok) {
        console.error("Failed to fetch user info");
        return;
      }

      const user = await meRes.json();

      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  const handleToggle = () => {
    if (action === "login") {
      navigate("/signup");
    }
    else {
      navigate("/login");
    }
  }

  return (
    <div className="flex flex-col min-w-60 w-120">
      <h1 className="text-2xl font-bold text-center mb-6">
        {action === "login" ? "Welcome Back!" : "Welcome to <Whiteboard App>!"}
      </h1>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          name="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        {action === "signup" && (
          <AuthInput 
            name="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
          />
        )}
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

      {/* Toggle Login/Signup */}
      <div className="flex justify-center mt-4 pt-6 border-t-1 border-gray-400">
        <div className="p-2">
          {action === "login" ? "New to <Whiteboard App>?" : "Already have an account?"}
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
