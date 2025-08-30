import HeaderButton from './HeaderButton';
import { useLocation, useNavigate } from 'react-router';
import { useUser } from '../hooks/useUser';

import { X } from 'lucide-react';

import { useModal } from '@/hooks/useModal';
import ShareWhiteboardForm from '@/components/ShareWhiteboardForm';
import type { ShareWhiteboardFormData } from '@/components/ShareWhiteboardForm';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const isLoggedIn = !!user;

  const handleLogOut = () => {
    setUser(null);
    navigate("/login");
  }

  const {
    Modal: ShareModal,
    openModal: openShareModal,
    closeModal: closeShareModal
  } = useModal('10em', '20em', true);
  
  return (
    <div className="fixed z-50 top-1 left-0 right-0 max-h-15 shadow-md rounded-lg mx-20 m-1 p-3 bg-stone-50"> 
      <div className="relative flex items-center justify-center">
        <div className="absolute left-2">
          <HeaderButton 
            to={isLoggedIn ? "/dashboard" : "/login"}
            title="Home"
          />
        </div>

        <h1 className="text-2xl font-bold">{title}</h1>
        
        <div className="absolute right-2">
          <div>
            {isLoggedIn ? (
              <div>
                <HeaderButton 
                  to="/account"
                  title="Account Settings"
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
            {location.pathname.startsWith("/whiteboard/") && (
              <div>
                <HeaderButton 
                  onClick={() => {
                    console.log("Share clicked");

                    openShareModal();
                  }}
                  title="Share"
                /> 

                <ShareModal>
                  <div className="flex flex-col">
                    <button
                      onClick={closeShareModal}
                      className="flex flex-row justify-end hover:cursor-pointer"
                    >
                      <X />
                    </button>

                    <h2 className="text-md font-bold text-center">Share Whiteboard</h2>

                    <ShareWhiteboardForm
                      shareLink="https://example.link/asfasdfasdf"
                      onSubmit={(data: ShareWhiteboardFormData) => {
                        console.log('Share request:', data);
                        closeShareModal();
                      }}
                    />
                  </div>
                </ShareModal>
              </div>
            )} {/* TODO: Implement sharing function */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
