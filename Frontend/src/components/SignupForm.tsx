function SignupForm() {
  const handleSignup = () => {
    console.log("User signed up");
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-6">
        {"Welcome to <Whiteboard App>!"}
      </h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          {"Email"}
        </div>
        <div>
          {"Password"}
        </div>
        <div>
          {"Confirm Password"}
        </div>
        <div>
          {"AuthButton Sign Up"}
        </div>
      </form>
    </div>
  );
}

export default SignupForm;