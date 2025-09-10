import { useState, useEffect } from "react";
import { getUser } from "../api/apiAuth";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await getUser();
        setUser(data.data || null);
        setError(null);
      } catch (err) {
        setUser(null);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  
  const isLoaded = !loading && !error;
  
  return (
    <AuthContext.Provider value={{ user, loading, error, setUser, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};
