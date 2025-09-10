import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { BriefcaseBusiness, Heart, PenBox, LogOut, User2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "../api/apiAuth";

const Header = () => {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      navigate("/auth/signin");
    } catch {
      // If logout fails, still clear user and redirect
      setUser(null);
      navigate("/auth/signin");
    }
  };

  return (
    <>
      <nav className="flex py-4 justify-between items-center">
        <Link to="/">
          <h1 className="text-3xl md:text-4xl cursor-pointer italic text-white">Worklyn</h1>
        </Link>
        <div className="flex gap-8 items-center">
          {!user && !loading && (
            <Button variant="outline" onClick={() => navigate("/auth/signin")}>
              Login
            </Button>
          )}
          {user && (
            <>
              {user.role === "recruiter" && (
                <Link to="/post-job">
                  <Button variant="destructive" className="rounded-full">
                    <PenBox size={20} className="mr-2" />
                    Post a Job
                  </Button>
                </Link>
              )}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="rounded-full px-2 py-2 flex items-center gap-2 text-white"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="User menu"
                >
                  <User2 size={24} />
                  <span className="hidden md:inline text-sm font-medium">
                    {user.name || user.email}
                  </span>
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-20">
                    <Link
                      to="/my-jobs"
                      className="flex items-center gap-2 px-4 py-2 text-gray-100 hover:bg-gray-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      <BriefcaseBusiness size={16} />
                      {user.role === "candidate" ? "My Applications" : "My Jobs"}
                    </Link>
                    <Link
                      to="/saved-jobs"
                      className="flex items-center gap-2 px-4 py-2 text-gray-100 hover:bg-gray-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Heart size={16} />
                      Saved Jobs
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-400 hover:bg-gray-800"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
