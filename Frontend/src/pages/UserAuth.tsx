import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";

interface UserAuthProps {
  action: string;
}

function UserAuth({ action }: UserAuthProps) {
  let title = "";
  
  switch (action) {
    case "login":
      title = "Log In";
      break;
    case "signup":
      title = "Create an Account";
      break;
    default:
      title = "Unknown Page";
      break;
  }

  return (
    <div>
      <Header title={title}/>
      <div className="flex justify-center items-center min-h-screen">
        <div className="rounded-lg shadow-md bg-stone-50 p-10">
          {action === "login" ? (
            <LoginForm />
          ) : (
            <SignupForm />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserAuth;