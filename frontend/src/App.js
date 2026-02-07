import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter } from "react-router-dom";
import Background from "@/components/meridiant/Background";
import Navbar from "@/components/meridiant/Navbar";
import TransferForm from "@/components/meridiant/TransferForm";
import {
  WalletConnectModal,
  SignInModal,
  SignUpModal,
  CheckoutModal,
  ProcessingModal,
  CompleteModal,
} from "@/components/meridiant/Modals";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [transactionData, setTransactionData] = useState(null);

  const handleSignIn = (email) => {
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    setUser({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
    });
    setIsLoggedIn(true);
    setActiveModal(null);
  };

  const handleSignUp = (name, email) => {
    setUser({ name, email });
    setIsLoggedIn(true);
    setActiveModal(null);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsLoggedIn(false);
    setConnectedWallet(null);
    setWalletAddress("");
    setWalletConnected(false);
  };

  const handleConnectWallet = (wallet) => {
    const addr =
      "0x" +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    setConnectedWallet(wallet);
    setWalletAddress(addr);
    setWalletConnected(true);
    setActiveModal(null);
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    setWalletAddress("");
    setWalletConnected(false);
  };

  const handleTransfer = (data) => {
    if (!isLoggedIn) {
      setActiveModal("signin");
      return;
    }
    if (!walletConnected) {
      setActiveModal("wallet");
      return;
    }
    if (!data.from.amount || parseFloat(data.from.amount) <= 0) {
      return;
    }
    setTransactionData(data);
    setActiveModal("checkout");
  };

  const handleConfirmTransaction = () => {
    setActiveModal("processing");
    setTimeout(() => {
      setActiveModal("complete");
    }, 3000);
  };

  const handleTransactionComplete = () => {
    setActiveModal(null);
    setTransactionData(null);
  };

  return (
    <div className="App dark">
      <BrowserRouter>
        <Background />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar
            isLoggedIn={isLoggedIn}
            user={user}
            walletConnected={walletConnected}
            connectedWallet={connectedWallet}
            walletAddress={walletAddress}
            onConnectWallet={() => setActiveModal("wallet")}
            onDisconnectWallet={handleDisconnectWallet}
            onSignIn={() => setActiveModal("signin")}
            onSignUp={() => setActiveModal("signup")}
            onSignOut={handleSignOut}
          />

          <main className="flex-1 flex items-center justify-center px-4 pb-20">
            <TransferForm
              isLoggedIn={isLoggedIn}
              walletConnected={walletConnected}
              onTransfer={handleTransfer}
            />
          </main>

          <footer className="px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4 text-gray-500 text-xs border-t border-gray-800/30">
            <div className="flex items-center gap-4">
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Blog</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">FAQ</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Support</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-gray-700">|</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms and Information</span>
            </div>
            <span>&copy; 2025 Meridiant. All rights reserved.</span>
          </footer>
        </div>

        <WalletConnectModal
          open={activeModal === "wallet"}
          onClose={() => setActiveModal(null)}
          onConnect={handleConnectWallet}
        />
        <SignInModal
          open={activeModal === "signin"}
          onClose={() => setActiveModal(null)}
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setActiveModal("signup")}
        />
        <SignUpModal
          open={activeModal === "signup"}
          onClose={() => setActiveModal(null)}
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setActiveModal("signin")}
        />
        <CheckoutModal
          open={activeModal === "checkout"}
          onClose={() => setActiveModal(null)}
          data={transactionData}
          onConfirm={handleConfirmTransaction}
        />
        <ProcessingModal open={activeModal === "processing"} />
        <CompleteModal
          open={activeModal === "complete"}
          onClose={handleTransactionComplete}
          data={transactionData}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
