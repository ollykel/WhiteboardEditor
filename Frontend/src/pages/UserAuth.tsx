import {
  APP_NAME,
} from '@/app.config';

import HeaderUnauthed from "@/components/HeaderUnauthed";
import AuthForm from "@/components/AuthForm";
import Page from '@/components/Page';

interface UserAuthProps {
  action: "login" | "signup";
}

function UserAuth({ action }: UserAuthProps) {
  const title = action === "login" ? "Log In" : "Create an Account";
  const pageTitle = `${title} | ${APP_NAME}`;

  return (
    <Page
      title={pageTitle}
    >
      <HeaderUnauthed
        title={title}
      />

      <div className="flex justify-center items-center min-h-screen">
        <div className="rounded-lg shadow-md bg-stone-50 p-10">
          <AuthForm initialAction={action}/>
        </div>
      </div>
    </Page>
  );
}

export default UserAuth;
