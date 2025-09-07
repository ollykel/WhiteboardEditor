import HeaderUnauthed from "@/components/HeaderUnauthed";
import AuthForm from "@/components/AuthForm";

interface UserAuthProps {
  action: "login" | "signup";
}

function UserAuth({ action }: UserAuthProps) {
  const title = action === "login" ? "Log In" : "Create an Account";

  return (
    <div>
      <HeaderUnauthed
        title={title}
      />

      <div className="flex justify-center items-center min-h-screen">
        <div className="rounded-lg shadow-md bg-stone-50 p-10">
          <AuthForm initialAction={action}/>
        </div>
      </div>
    </div>
  );
}

export default UserAuth;
