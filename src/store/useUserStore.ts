import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile } from "../context/useUserContext";

type State = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  token: string | null;
};

type Actions = {
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setToken: (token: string | null) => void;
};

const useUserStore = create<State & Actions>()(
  persist(
    (set) => ({
      profile: null,
      loading: true,
      error: null,
      token: null,

      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setToken: (token) => set({ token }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
