import { createModal, getDefaultConfig } from "@rabby-wallet/rabbykit";
import {
  createConfig,
  disconnect,
  getAccount,
  http,
  watchAccount,
} from "@wagmi/core";
import { hardhat, sepolia } from "@wagmi/core/chains";

// The browser extension connection does not require a WalletConnect project ID.
// Enable mobile WalletConnect only when a real project ID is configured.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

export const config = createConfig(
  getDefaultConfig({
    appName: "DESTAT",
    projectId,
    chains: [hardhat, sepolia],
    transports: {
      [hardhat.id]: http("http://127.0.0.1:8545"),
      [sepolia.id]: http(),
    },
    ssr: true,
  }),
);

export const rabbykit = createModal({
  wagmi: config,
  showWalletConnect: Boolean(projectId),
  theme: "light",
});

export const currentAccount = () => getAccount(config);
export const subscribeAccount = (onChange: () => void) =>
  watchAccount(config, { onChange });
export const disconnectWallet = () => disconnect(config);
