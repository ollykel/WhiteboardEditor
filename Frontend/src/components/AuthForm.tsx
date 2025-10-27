// -- std imports

import {
  useState,
  useContext,
} from "react";

import {
  useNavigate,
  useLocation,
} from 'react-router-dom';


// -- third-party imports

import {
  ToastContainer,
  Bounce,
  toast,
} from 'react-toastify';

// -- local imports
import AuthContext from '@/context/AuthContext';
import AuthInput from "@/components/AuthInput";
import { useUser } from "@/hooks/useUser";
import api from '@/api/axios';

import {
  type AxiosResponse,
  type AxiosError,
} from 'axios';

import {
  APP_NAME,
} from '@/app.config';

import {
  type AuthLoginSuccessResponse,
} from '@/types/APIProtocol';

interface AuthFormProps {
  initialAction: "login" | "signup";
}

const AuthForm = ({
  initialAction,
}: AuthFormProps): React.JSX.Element => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const action = initialAction;
  const redirectUrl = searchParams.has('redirect') ?
    decodeURIComponent(searchParams.get('redirect') || '')
    : '/dashboard';
  const authContext = useContext(AuthContext);

  if (! authContext) {
    throw new Error('AuthContext not provided');
  }

  const {
    setAuthToken,
  } = authContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = action === "login" ? "/auth/login" : "/users";

    // TODO: Make this dynamic to handle either email or username
    const authSource = "email";

    const payload = 
      action === "login"
      ? { authSource, email, password }
      : { email, username, password };

    try {
      const res : AxiosResponse<AuthLoginSuccessResponse> = await api.post(endpoint, payload);

      if (res.status >= 400) {
        console.log('Login failed with status', res.status);

        // -- display error to user
        toast.error('Authentication Failed. Try again.', {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      } else {
        const {
          user,
          token,
        } = res.data;

        setAuthToken(token);
        setUser(user);
        navigate(redirectUrl);
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError;

      if ((axiosErr?.response?.status) && (axiosErr.response.status >= 400) && (axiosErr.response.status < 500)) {
        const status = axiosErr.response.status;

        console.log('Authentication request failed with status', status);

        // -- display error to user
        toast.error('Authentication Failed. Try again.', {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      } else {
        console.error('Error handling authentication:', err);

        // -- display error to user
        toast.error('Error handling login.', {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      }
    }
  }

  const handleToggle = () => {
    navigate(action === "login" ? "/signup" : "/login");
  }

  return (
    <>
      {/** Main component content **/}
      <div className="flex flex-col w-75 sm:w-95 md:w-120">
        <h1 className="text-2xl font-bold text-center mb-6">
          {action === "login" ? "Welcome Back!" : `Welcome to ${APP_NAME}!`}
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
          <div className="p-2 text-center">
            {action === "login" ? `New to ${APP_NAME}?` : "Already have an account?"}
          </div>
          <button 
            onClick={handleToggle}
            className=" font-medium rounded-lg px-4 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer shadow-md"
          >
            {action === "login" ? "Create a New Account!" : "Log In"}
          </button>
        </div>
      </div>

      {/** Misc. overlays and modals **/}
      <>
        {/** Toast allows us to display styled popup alerts **/}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
      </>
    </>
  );
};// -- end AuthForm

export default AuthForm;
