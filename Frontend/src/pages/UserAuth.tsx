import Header from "@/components/Header";

interface UserAuthProps {
  action: string;
}

function UserAuth({ action }: UserAuthProps) {
  let title = action === "log in" ? "Log In" : "Create an Account";

  return (
    <Header title={title}/>
  );
}

export default UserAuth;