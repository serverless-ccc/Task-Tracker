import { createContext, useEffect } from "react";
import apiClient from "../api/_setup";
import useUserStore from "../store/useUserStore";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  picture: string;
  // Add other relevant fields as necessary
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { profile, loading, error, setProfile, setLoading, setError } =
    useUserStore();

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("users/profile");
      setProfile(response.data as UserProfile);
    } catch (err) {
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchProfile();
    }
  }, []);

  return (
    <UserContext.Provider value={{ profile, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
