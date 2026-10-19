import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

type WalletModule = typeof import("~/lib/rabbykit.client");

export default function WalletConnect() {
  const [wallet, setWallet] = useState<WalletModule>();
  const [address, setAddress] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    import("~/lib/rabbykit.client")
      .then((module) => {
        if (!active) return;
        setWallet(module);
        const updateAccount = () => setAddress(module.currentAccount().address);
        updateAccount();
        unsubscribe = module.subscribeAccount(updateAccount);
      })
      .catch(() => {
        if (active)
          setError("지갑 연결 화면을 불러오지 못했습니다. 새로고침해 주세요.");
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <div className="justify-self-end">
      <Button
        disabled={!wallet}
        className="rounded-md"
        title={address ? `${address} · Disconnect` : "Connect wallet"}
        onClick={() => {
          if (!wallet) return;
          setError("");
          if (address) {
            void wallet
              .disconnectWallet()
              .catch(() =>
                setError("연결 해제에 실패했습니다. 다시 시도해 주세요."),
              );
          } else {
            const { rabbykit } = wallet;
            rabbykit.open();
          }
        }}
      >
        {address
          ? `${address.slice(0, 6)}…${address.slice(-4)} · Disconnect`
          : "Connect"}
      </Button>
      {error && (
        <p
          role="alert"
          className="absolute right-4 top-full z-50 max-w-80 rounded-md border bg-white p-3 text-sm shadow-sm"
        >
          {error}
        </p>
      )}
    </div>
  );
}
