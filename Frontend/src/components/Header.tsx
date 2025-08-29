import HeaderButton from './HeaderButton';
import { useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { useUser } from '../AuthContext';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setUser } = useUser();

  const handleLogOut = () => {
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  }
  
  return (
    <div className="fixed z-50 top-1 left-0 right-0 max-h-15 shadow-md rounded-lg mx-20 m-1 p-3 bg-stone-50"> 
      <div className="relative flex items-center justify-center">
        <div className="absolute left-2">
          <HeaderButton 
            to= {isLoggedIn ? "/dashboard" : "/login"}
            title="Home"
          />
        </div>

        <h1 className="text-2xl font-bold">{title}</h1>
        
        <div className="absolute right-2">
          {location.pathname === "/dashboard" && (
            <div>
              {isLoggedIn ? (
                <div>
                  <HeaderButton 
                    to="/settings"
                    title="Settings"
                  />
                  <HeaderButton 
                    onClick={handleLogOut}
                    title="Log Out"
                  />
                </div>
              ) : (
                <div>
                  <HeaderButton 
                    to="/login"
                    title="Log In"
                  />
                  <HeaderButton 
                    to="/signup"
                    title="Sign Up"
                  />
                </div>
              )}
            </div>
          )}
          {location.pathname.startsWith("/whiteboard/") && (
            <HeaderButton 
              onClick={() => console.log("Share clicked")}
              title="Share"
            /> 
          )} {/* TODO: Implement sharing function */}
        </div>
      </div>
    </div>
  );
}

export default Header;