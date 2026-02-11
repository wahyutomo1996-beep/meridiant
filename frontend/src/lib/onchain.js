import { ethers } from 'ethers';

// ERC-20 ABI (only transfer function needed)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

// Token contracts by chain
const TOKEN_CONTRACTS = {
  'BSC': {
    'IDRT': '0x66207e39bb77e6b99aab56795c7c340c08520d83',
    'USDT': '0x55d398326f99059fF775485246999027B3197955',
    'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  'Polygon': {
    'IDRT': '0x554cd6bdD03214b10AafA3e0D4D42De0C5D2937b',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    'USDC': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
};

// Chain RPC configs
const CHAIN_CONFIG = {
  'BSC': {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockExplorerUrls: ['https://bscscan.com'],
  },
  'Polygon': {
    chainId: '0x89',
    chainName: 'Polygon',
    rpcUrls: ['https://polygon-rpc.com/'],
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorerUrls: ['https://polygonscan.com'],
  },
};

// Platform deposit address (for receiving transfers)
const PLATFORM_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// Switch MetaMask to the correct chain
async function switchChain(provider, chainId) {
  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId }]);
  } catch (switchError) {
    if (switchError.code === 4902) {
      const config = Object.values(CHAIN_CONFIG).find(c => c.chainId === chainId);
      if (config) {
        await provider.send('wallet_addEthereumChain', [config]);
      }
    } else {
      throw switchError;
    }
  }
}

// Get ERC-20 token balance
export async function getTokenBalance(chain, tokenCode, walletAddress) {
  const contractAddress = TOKEN_CONTRACTS[chain]?.[tokenCode];
  if (!contractAddress) return null;

  const rpcUrl = CHAIN_CONFIG[chain]?.rpcUrls[0];
  if (!rpcUrl) return null;

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
    ]);
    return ethers.formatUnits(balance, decimals);
  } catch (e) {
    console.error('Balance fetch error:', e);
    return null;
  }
}

// Send ERC-20 token transfer via MetaMask
export async function sendERC20Transfer(chain, tokenCode, amount, toAddress) {
  if (!window.ethereum) throw new Error('MetaMask not detected');

  const contractAddress = TOKEN_CONTRACTS[chain]?.[tokenCode];
  if (!contractAddress) throw new Error(`Token ${tokenCode} not supported on ${chain}`);

  const chainConfig = CHAIN_CONFIG[chain];
  if (!chainConfig) throw new Error(`Chain ${chain} not supported`);

  // Connect to MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Switch to correct chain
  await switchChain(provider, chainConfig.chainId);

  const signer = await provider.getSigner();
  const fromAddress = await signer.getAddress();

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
  const decimals = await contract.decimals();
  const amountWei = ethers.parseUnits(String(amount), decimals);

  // Execute transfer
  const tx = await contract.transfer(toAddress || PLATFORM_ADDRESS, amountWei);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    chain,
    fromAddress,
    toAddress: toAddress || PLATFORM_ADDRESS,
    token: tokenCode,
    amount: String(amount),
    blockExplorer: `${chainConfig.blockExplorerUrls[0]}/tx/${receipt.hash}`,
  };
}

// Send native token (BNB, MATIC) transfer
export async function sendNativeTransfer(chain, amount, toAddress) {
  if (!window.ethereum) throw new Error('MetaMask not detected');

  const chainConfig = CHAIN_CONFIG[chain];
  if (!chainConfig) throw new Error(`Chain ${chain} not supported`);

  const provider = new ethers.BrowserProvider(window.ethereum);
  await switchChain(provider, chainConfig.chainId);

  const signer = await provider.getSigner();
  const fromAddress = await signer.getAddress();

  const tx = await signer.sendTransaction({
    to: toAddress || PLATFORM_ADDRESS,
    value: ethers.parseEther(String(amount)),
  });
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    chain,
    fromAddress,
    toAddress: toAddress || PLATFORM_ADDRESS,
    token: chainConfig.nativeCurrency.symbol,
    amount: String(amount),
    blockExplorer: `${chainConfig.blockExplorerUrls[0]}/tx/${receipt.hash}`,
  };
}

// Solana SPL token transfer via Phantom
export async function sendSolanaTransfer(tokenCode, amount, toAddress) {
  if (!window.phantom?.solana) throw new Error('Phantom wallet not detected');

  // Dynamic import for Solana
  const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');

  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  const phantom = window.phantom.solana;

  // Connect if not connected
  if (!phantom.isConnected) {
    await phantom.connect();
  }

  const fromPubkey = phantom.publicKey;

  if (tokenCode === 'SOL') {
    // Native SOL transfer
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: new PublicKey(toAddress || '11111111111111111111111111111111'),
        lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL),
      })
    );
    tx.feePayer = fromPubkey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const signed = await phantom.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    return {
      txHash: signature,
      chain: 'Solana',
      fromAddress: fromPubkey.toString(),
      toAddress: toAddress || '11111111111111111111111111111111',
      token: 'SOL',
      amount: String(amount),
      blockExplorer: `https://solscan.io/tx/${signature}`,
    };
  }

  throw new Error(`SPL token ${tokenCode} transfer not yet supported. Use SOL for Solana transfers.`);
}

// Determine if a token/chain combo supports on-chain transfer
export function isOnChainSupported(chain, tokenCode) {
  if (chain === 'BSC' || chain === 'Polygon') {
    return !!TOKEN_CONTRACTS[chain]?.[tokenCode] || chain === 'BSC' && tokenCode === 'BNB' || chain === 'Polygon' && tokenCode === 'MATIC';
  }
  if (chain === 'Solana') {
    return tokenCode === 'SOL';
  }
  return false;
}

// Get block explorer URL for a transaction
export function getExplorerUrl(chain, txHash) {
  const explorers = {
    'BSC': 'https://bscscan.com/tx/',
    'Polygon': 'https://polygonscan.com/tx/',
    'Solana': 'https://solscan.io/tx/',
    'Ethereum': 'https://etherscan.io/tx/',
    'Arbitrum': 'https://arbiscan.io/tx/',
    'Base': 'https://basescan.org/tx/',
    'Optimism': 'https://optimistic.etherscan.io/tx/',
    'Avalanche': 'https://snowtrace.io/tx/',
  };
  return (explorers[chain] || '') + txHash;
}
