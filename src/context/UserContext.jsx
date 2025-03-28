import { createContext, useContext, useEffect, useState } from "react";
import { getWeb3State } from "../utiles/getWeb3State";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitProvider } from "@reown/appkit/react";

// Create Context
const UserContext = createContext();

// Provider Component
export function UserProvider({ children }) {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isConnected) {
        const data = await getWeb3State(walletProvider);
        setUserData(data);
        console.log("User Data:", data);
      }
    };

    fetchUserData();
  }, [isConnected, walletProvider]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook to use the context
export function useUserContext() {
  return useContext(UserContext);
}
