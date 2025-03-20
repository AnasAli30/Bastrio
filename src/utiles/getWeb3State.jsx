import { BrowserProvider } from "ethers";
import axios from "axios";
import { toast } from "react-toastify";


export const getWeb3State = async (walletProvider) => {
  try {
  
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const selectedAccount = signer.address;

    const message = `Welcome to Abstrio!

Click to sign in and accept the Terms of Service and Privacy Policy.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address: ${selectedAccount}`;

    let token = localStorage.getItem("token");

    if (!token) {
      try {
        const signature = await signer.signMessage(message);
        const authRes = await axios.post(
          `http://localhost:3000/api/authentication?accountAddress=${selectedAccount}`,
          { signature }
        );

        if (authRes.status === 200) {
          token = authRes.data.token;
          localStorage.setItem("token", token);

          const registerRes = await axios.post(
            `http://localhost:3000/api/register?accountAddress=${selectedAccount}`,
            { token }
          );

          if (registerRes.status === 200) {
            toast.success(registerRes.data.message);
            toast.success(authRes.data.message);
          }
        } else {
          toast.success(authRes.data.message);
          return;
        }
      } catch (error) {
        toast.error("Error occurred during authentication.");
        console.error(error);
        return false;
      }
    } else {
      try {
        await axios.get(
          `http://localhost:3000/api/user?accountAddress=${selectedAccount}`
        );
      } catch (error) {
        if (error.response?.status === 404) {
          await axios.post(
            `http://localhost:3000/api/register?accountAddress=${selectedAccount}`,
            { token }
          );
        }
      }
    }

    return { signer, selectedAccount };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve Web3 state");
  }
};
