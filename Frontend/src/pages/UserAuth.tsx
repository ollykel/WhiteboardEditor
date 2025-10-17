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
  let authActionLabel : string;

  switch (action) {
    case 'login':
      authActionLabel = 'Log in';
      break;
    case 'signup':
      authActionLabel = 'Create an Account';
      break;
    default:
      throw new Error(`unrecognized auth action: ${action}`);
  }// -- end switch (action)

  const pageTitle = `${authActionLabel} | ${APP_NAME}`;

  return (
    <Page
      title={pageTitle}
    >
      <HeaderUnauthed
        title={authActionLabel}
      />

      <div className="flex flex-col justify-center items-center min-h-screen">
        {/** Main branding section **/}
        <div
          id="branding"
          className="text-center mx-56 my-16"
        >
          <h1 className="text-8xl font-light my-8">
            {APP_NAME}
          </h1>

          <h2 className="text-4xl font-thin my-4">
            The better web whiteboard
          </h2>

          <p className="text-lg font-sans">
            Need a place to make quick and easy diagrams to share with your colleagues? Look no further — Boardly is here for you.
            Get started in minutes and share your designs with your peers with a simple email invite.
          </p>
        </div>

        {/** Auth portal **/}
        <div className="rounded-lg shadow-md bg-stone-50 p-10">
          <AuthForm initialAction={action}/>
        </div>
      </div>
    </Page>
  );
}

export default UserAuth;
