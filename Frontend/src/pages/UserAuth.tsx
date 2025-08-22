import Header from "@/components/Header";

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
    <Header title={title}/>
  );
}

export default UserAuth;