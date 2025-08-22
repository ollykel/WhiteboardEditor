import { useState } from "react";

import AuthInput from "./AuthInput";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault;
    console.log("User logged in");
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-6">
        {"Welcome Back!"}
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">
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
        <button
          type="submit"
          className="w-full font-medium py-2 rounded-lg hover:bg-gray-200"
        >
          Log In
        </button>
      </form>
    </div>
  );
}

export default LoginForm;