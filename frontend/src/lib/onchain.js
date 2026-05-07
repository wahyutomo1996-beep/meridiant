import { ethers } from 'ethers';

// ERC-20 ABI (only functions needed by this app)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_API_KEY || 'c37Ej1w5Cm_C2YY158blZ';

export const CHAIN_CONFIG = {
  Ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum',
    rpcUrls: [`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`],
    fallbackRpc: 'https://ethereum-rpc.publicnode.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://etherscan.io'],
  },
  Base: {
    chainId: '0x2105',
    chainName: 'Base',
    rpcUrls: [`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`],
    fallbackRpc: 'https://mainnet.base.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://basescan.org'],
  },
  Arbitrum: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    rpcUrls: [`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`],
    fallbackRpc: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  Optimism: {
    chainId: '0xa',
    chainName: 'OP Mainnet',
    rpcUrls: [`https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`],
    fallbackRpc: 'https://mainnet.optimism.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  BSC: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    rpcUrls: [`https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`],
    fallbackRpc: 'https://bsc-dataseed.binance.org/',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    blockExplorerUrls: ['https://bscscan.com'],
  },
  Polygon: {
    chainId: '0x89',
    chainName: 'Polygon',
    rpcUrls: [`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`],
    fallbackRpc: 'https://polygon-rpc.com/',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorerUrls: ['https://polygonscan.com'],
  },
};

// Token contracts by chain. Native assets are handled by isNativeToken/sendNativeTransfer.
const TOKEN_CONTRACTS = {
  Ethereum: {
    IDRT: '0x998ffe1e43facffb941dc337dd0468d52ba5b48a',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  },
  Base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71B54bdA02913',
  },
  Arbitrum: {
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  Optimism: {
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
  BSC: {
    IDRT: '0x66207e39bb77e6b99aab56795c7c340c08520d83',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  Polygon: {
    IDRT: '0x554cd6bdD03214b10AafA3e0D4D42De0C5D2937b',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
};

// Platform deposit address
const PLATFORM_ADDRESS = '0xdf32c54583b4d83939b93aa2ca23487d4eb853da';

const NATIVE_TOKEN_BY_CHAIN = Object.fromEntries(
  Object.entries(CHAIN_CONFIG).map(([chain, config]) => [chain, config.nativeCurrency.symbol])
);

export function isNativeToken(chain, tokenCode) {
  return NATIVE_TOKEN_BY_CHAIN[chain] === tokenCode;
}

function getChainConfig(chain) {
  const chainConfig = CHAIN_CONFIG[chain];
  if (!chainConfig) throw new Error(`Chain ${chain} not supported`);
  return chainConfig;
}

function normalizeAmount(amount) {
  return String(amount).replace(/,/g, '').trim();
}

function getInjectedProvider(chain) {
  if (!window.ethereum) throw new Error(`${chain} wallet provider not detected`);
  return window.ethereum;
}

// Switch MetaMask/EVM wallet to the correct chain
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

  const config = CHAIN_CONFIG[chain];
  if (!config) return null;

  try {
    const provider = new ethers.JsonRpcProvider(config.rpcUrls[0]);
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
    ]);
    return ethers.formatUnits(balance, decimals);
  } catch (e) {
    // Try fallback RPC
    try {
      const provider = new ethers.JsonRpcProvider(config.fallbackRpc);
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
      ]);
      return ethers.formatUnits(balance, decimals);
    } catch {
      console.error('Balance fetch error:', e);
      return null;
    }
  }
}

// Send ERC-20 token transfer via EVM wallet
export async function sendERC20Transfer(chain, tokenCode, amount, toAddress) {
  const contractAddress = TOKEN_CONTRACTS[chain]?.[tokenCode];
  if (!contractAddress) throw new Error(`Token ${tokenCode} not supported on ${chain}`);

  const chainConfig = getChainConfig(chain);
  const provider = new ethers.BrowserProvider(getInjectedProvider(chain));
  await switchChain(provider, chainConfig.chainId);

  const signer = await provider.getSigner();
  const fromAddress = await signer.getAddress();
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
  const decimals = await contract.decimals();
  const amountWei = ethers.parseUnits(normalizeAmount(amount), decimals);
  const tx = await contract.transfer(toAddress || PLATFORM_ADDRESS, amountWei);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    chain,
    fromAddress,
    toAddress: toAddress || PLATFORM_ADDRESS,
    token: tokenCode,
    amount: normalizeAmount(amount),
    blockExplorer: `${chainConfig.blockExplorerUrls[0]}/tx/${receipt.hash}`,
  };
}

// Send native EVM token transfer (ETH, BNB, MATIC)
export async function sendNativeTransfer(chain, amount, toAddress) {
  const chainConfig = getChainConfig(chain);
  const provider = new ethers.BrowserProvider(getInjectedProvider(chain));
  await switchChain(provider, chainConfig.chainId);

  const signer = await provider.getSigner();
  const fromAddress = await signer.getAddress();
  const tx = await signer.sendTransaction({
    to: toAddress || PLATFORM_ADDRESS,
    value: ethers.parseEther(normalizeAmount(amount)),
  });
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    chain,
    fromAddress,
    toAddress: toAddress || PLATFORM_ADDRESS,
    token: chainConfig.nativeCurrency.symbol,
    amount: normalizeAmount(amount),
    blockExplorer: `${chainConfig.blockExplorerUrls[0]}/tx/${receipt.hash}`,
  };
}

// Solana SPL token transfer via Phantom
export async function sendSolanaTransfer(tokenCode, amount, toAddress) {
  if (!window.phantom?.solana) throw new Error('Phantom wallet not detected');

  // Dynamic import for Solana
  const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');

  const connection = new Connection(`https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, 'confirmed');
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
        lamports: Math.floor(parseFloat(normalizeAmount(amount)) * LAMPORTS_PER_SOL),
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
      amount: normalizeAmount(amount),
      blockExplorer: `https://solscan.io/tx/${signature}`,
    };
  }

  throw new Error(`SPL token ${tokenCode} transfer not yet supported. Use SOL for Solana transfers.`);
}

// Determine if a token/chain combo supports direct wallet transfer
export function isOnChainSupported(chain, tokenCode) {
  if (chain === 'Solana') return tokenCode === 'SOL';
  if (chain === 'TON') return false;
  return Boolean(CHAIN_CONFIG[chain] && (isNativeToken(chain, tokenCode) || TOKEN_CONTRACTS[chain]?.[tokenCode]));
}

// Get block explorer URL for a transaction
export function getExplorerUrl(chain, txHash) {
  const explorers = {
    BSC: 'https://bscscan.com/tx/',
    Polygon: 'https://polygonscan.com/tx/',
    Solana: 'https://solscan.io/tx/',
    Ethereum: 'https://etherscan.io/tx/',
    Arbitrum: 'https://arbiscan.io/tx/',
    Base: 'https://basescan.org/tx/',
    Optimism: 'https://optimistic.etherscan.io/tx/',
    Avalanche: 'https://snowtrace.io/tx/',
    TON: 'https://tonscan.org/tx/',
  };
  return (explorers[chain] || '') + txHash;
}
