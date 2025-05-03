import { SidebarTrigger } from "./ui/sidebar";
import { Bell, User, Menu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../redux/auth/authSlice";

const Navbar = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { nom, prenom } = useAppSelector((state) => state.auth);

  const refreshtoken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // logique de déconnexion

    dispatch(
      logout({
        refreshToken: refreshtoken || "",
      })
    );

    navigate("/");
  };

  return (
    <header className="sticky top-4 z-10 bg-white border border-gray-200 rounded-lg shadow-xs mx-6 my-4 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center flex-1 justify-center lg:justify-start gap-6">
        <div className="flex items-center ">
          <SidebarTrigger className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors">
            <Menu size={20} aria-label="Toggle sidebar" />
          </SidebarTrigger>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="relative" ref={profileMenuRef}>
          <button
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            aria-expanded={isProfileMenuOpen}
            aria-label="User menu"
          >
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
              <User size={20} />
            </div>
            <span className="hidden md:block">{nom + ` ` + prenom}</span>
            <ChevronDown
              size={20}
              className={`text-gray-500 transition-transform ${
                isProfileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-md py-1 z-20 border border-gray-200 animate-in fade-in slide-in-from-top-1">
              <a
                href="/profil"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Profil
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Paramètres
              </a>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="block px-4 py-2 text-sm bg-red-500 w-full"
              >
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
