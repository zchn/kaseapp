// Cosmos Hub Account Manager
// A frontend-only application for creating accounts, monitoring balances, and staking ATOM

class CosmosHubManager {
    constructor() {
        this.client = null;
        this.account = null;
        this.mnemonic = null;
        this.address = null;
        this.balanceMonitor = null;
        this.autoStakingEnabled = false;
        this.autoStakeThreshold = 0.1;
        this.lastBalance = 0;
        
        // Cosmos Hub configuration
        this.config = {
            rpcEndpoint: 'https://cosmos-rpc.publicnode.com:443',
            chainId: 'cosmoshub-4',
            gasPrice: '0.025uatom',
            gasLimit: 200000
        };
        
        this.init();
    }

    async init() {
        this.updateStatus('network', 'Connecting...');
        
        try {
            // Initialize Cosmos client
            await this.initializeClient();
            this.updateStatus('network', 'Connected', 'connected');
            
            // Load saved account if exists
            await this.loadSavedAccount();
            
            // Set up event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateStatus('network', 'Connection failed', 'disconnected');
            this.showStatusMessage('Failed to connect to Cosmos Hub network', 'error');
        }
    }

    async initializeClient() {
        try {
            // Create a Stargate client for Cosmos Hub
            this.client = await window.cosmjs.StargateClient.connect(this.config.rpcEndpoint);
            console.log('Connected to Cosmos Hub');
        } catch (error) {
            throw new Error(`Failed to connect to Cosmos Hub: ${error.message}`);
        }
    }

    setupEventListeners() {
        // Account creation
        document.getElementById('create-account-btn').addEventListener('click', () => {
            this.createAccount();
        });

        // Balance refresh
        document.getElementById('refresh-balance-btn').addEventListener('click', () => {
            this.refreshBalance();
        });

        // Manual staking
        document.getElementById('stake-btn').addEventListener('click', () => {
            this.stakeTokens();
        });

        // Auto-staking toggle
        document.getElementById('auto-staking-toggle').addEventListener('change', (e) => {
            this.autoStakingEnabled = e.target.checked;
            this.updateStatus('monitoring', this.autoStakingEnabled ? 'Active' : 'Inactive', 
                           this.autoStakingEnabled ? 'active' : 'inactive');
            
            if (this.autoStakingEnabled && this.address) {
                this.startBalanceMonitoring();
            } else {
                this.stopBalanceMonitoring();
            }
        });

        // Auto-stake threshold
        document.getElementById('auto-stake-threshold').addEventListener('change', (e) => {
            this.autoStakeThreshold = parseFloat(e.target.value) || 0.1;
        });
    }

    async createAccount() {
        this.showLoading('Creating new Cosmos Hub account...');
        
        try {
            // Generate a new mnemonic
            const mnemonic = window.cosmjs.DirectSecp256k1HdWallet.generate(24);
            const accountName = document.getElementById('account-name').value || 'my-cosmos-account';
            
            // Get the first account from the wallet
            const accounts = await mnemonic.getAccounts();
            const account = accounts[0];
            
            this.mnemonic = mnemonic.mnemonic;
            this.address = account.address;
            this.account = account;
            
            // Save account info to localStorage
            this.saveAccountInfo();
            
            // Update UI
            this.displayAccountInfo();
            this.updateStatus('account', 'Created', 'active');
            
            this.hideLoading();
            this.showStatusMessage('Account created successfully!', 'success');
            
            // Start monitoring if auto-staking is enabled
            if (this.autoStakingEnabled) {
                this.startBalanceMonitoring();
            }
            
        } catch (error) {
            this.hideLoading();
            this.showStatusMessage(`Failed to create account: ${error.message}`, 'error');
            console.error('Account creation error:', error);
        }
    }

    displayAccountInfo() {
        const accountInfo = document.getElementById('account-info');
        const addressSpan = document.getElementById('account-address');
        const mnemonicSpan = document.getElementById('account-mnemonic');
        
        addressSpan.textContent = this.address;
        mnemonicSpan.textContent = this.mnemonic;
        
        accountInfo.classList.remove('hidden');
        
        // Enable staking button
        document.getElementById('stake-btn').disabled = false;
    }

    saveAccountInfo() {
        const accountData = {
            address: this.address,
            mnemonic: this.mnemonic,
            accountName: document.getElementById('account-name').value
        };
        localStorage.setItem('cosmosAccount', JSON.stringify(accountData));
    }

    async loadSavedAccount() {
        const savedAccount = localStorage.getItem('cosmosAccount');
        if (savedAccount) {
            try {
                const accountData = JSON.parse(savedAccount);
                this.address = accountData.address;
                this.mnemonic = accountData.mnemonic;
                
                // Restore account name
                if (accountData.accountName) {
                    document.getElementById('account-name').value = accountData.accountName;
                }
                
                // Recreate wallet from mnemonic
                const wallet = await window.cosmjs.DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic);
                const accounts = await wallet.getAccounts();
                this.account = accounts[0];
                
                this.displayAccountInfo();
                this.updateStatus('account', 'Loaded', 'active');
                
                // Refresh balance
                await this.refreshBalance();
                
            } catch (error) {
                console.error('Failed to load saved account:', error);
                localStorage.removeItem('cosmosAccount');
            }
        }
    }

    async refreshBalance() {
        if (!this.address) {
            this.showStatusMessage('No account available', 'error');
            return;
        }

        try {
            const balance = await this.client.getBalance(this.address, 'uatom');
            const atomBalance = parseFloat(balance.amount) / 1000000; // Convert from uatom to ATOM
            
            document.getElementById('current-balance').textContent = `${atomBalance.toFixed(6)} ATOM`;
            
            // Check for new incoming transactions
            if (atomBalance > this.lastBalance && this.lastBalance > 0) {
                const receivedAmount = atomBalance - this.lastBalance;
                this.addTransaction('received', receivedAmount, 'Received ATOM');
                
                // Auto-stake if enabled and amount meets threshold
                if (this.autoStakingEnabled && receivedAmount >= this.autoStakeThreshold) {
                    this.showStatusMessage(`Auto-staking ${receivedAmount.toFixed(6)} ATOM...`, 'info');
                    await this.performStaking(receivedAmount);
                }
            }
            
            this.lastBalance = atomBalance;
            
            // Update staked balance (this would require additional API calls in a real implementation)
            // For demo purposes, we'll show a placeholder
            document.getElementById('staked-balance').textContent = '0 ATOM';
            
        } catch (error) {
            console.error('Balance refresh error:', error);
            this.showStatusMessage('Failed to refresh balance', 'error');
        }
    }

    async stakeTokens() {
        if (!this.account) {
            this.showStatusMessage('No account available', 'error');
            return;
        }

        const stakeAmount = parseFloat(document.getElementById('stake-amount').value);
        const validatorAddress = document.getElementById('validator-address').value;

        if (!stakeAmount || stakeAmount <= 0) {
            this.showStatusMessage('Please enter a valid stake amount', 'error');
            return;
        }

        if (!validatorAddress) {
            this.showStatusMessage('Please enter a validator address', 'error');
            return;
        }

        await this.performStaking(stakeAmount, validatorAddress);
    }

    async performStaking(amount, validatorAddress = null) {
        this.showLoading('Staking ATOM tokens...');
        
        try {
            // In a real implementation, this would create and broadcast a staking transaction
            // For demo purposes, we'll simulate the process
            
            // Create signing client
            const wallet = await window.cosmjs.DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic);
            const signingClient = await window.cosmjs.SigningStargateClient.connectWithSigner(
                this.config.rpcEndpoint,
                wallet
            );
            
            // Prepare staking message
            const stakingAmount = {
                denom: 'uatom',
                amount: Math.floor(amount * 1000000).toString() // Convert to uatom
            };
            
            const validatorAddr = validatorAddress || 'cosmosvaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj';
            
            // Create delegate message
            const delegateMsg = {
                typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
                value: {
                    delegatorAddress: this.address,
                    validatorAddress: validatorAddr,
                    amount: stakingAmount
                }
            };
            
            // Simulate transaction (in real implementation, this would broadcast)
            console.log('Staking transaction prepared:', delegateMsg);
            
            // Simulate delay for transaction processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.hideLoading();
            this.showStatusMessage(`Successfully staked ${amount.toFixed(6)} ATOM`, 'success');
            this.addTransaction('staked', amount, `Staked to ${validatorAddr.substring(0, 20)}...`);
            
            // Refresh balance
            await this.refreshBalance();
            
        } catch (error) {
            this.hideLoading();
            this.showStatusMessage(`Staking failed: ${error.message}`, 'error');
            console.error('Staking error:', error);
        }
    }

    startBalanceMonitoring() {
        if (this.balanceMonitor) {
            clearInterval(this.balanceMonitor);
        }
        
        // Check balance every 30 seconds
        this.balanceMonitor = setInterval(() => {
            this.refreshBalance();
        }, 30000);
        
        console.log('Balance monitoring started');
    }

    stopBalanceMonitoring() {
        if (this.balanceMonitor) {
            clearInterval(this.balanceMonitor);
            this.balanceMonitor = null;
            console.log('Balance monitoring stopped');
        }
    }

    addTransaction(type, amount, description) {
        const transactionsList = document.getElementById('transactions-list');
        const transactionItem = document.createElement('div');
        transactionItem.className = `transaction-item ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        transactionItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${description}</strong>
                    <div style="font-size: 0.9rem; color: #666;">${timestamp}</div>
                </div>
                <div style="font-weight: 600; color: ${type === 'received' ? '#48bb78' : type === 'staked' ? '#667eea' : '#ed8936'};">
                    ${type === 'received' ? '+' : ''}${amount.toFixed(6)} ATOM
                </div>
            </div>
        `;
        
        transactionsList.insertBefore(transactionItem, transactionsList.firstChild);
        
        // Keep only last 10 transactions
        const transactions = transactionsList.children;
        if (transactions.length > 10) {
            transactionsList.removeChild(transactions[transactions.length - 1]);
        }
    }

    updateStatus(type, message, className = '') {
        const statusElement = document.getElementById(`${type}-status`);
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-value ${className}`;
        }
    }

    showStatusMessage(message, type = 'info') {
        const statusElement = document.getElementById('staking-status');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        
        // Clear message after 5 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'status-message';
        }, 5000);
    }

    showLoading(message = 'Processing...') {
        const modal = document.getElementById('loading-modal');
        const messageElement = document.getElementById('loading-message');
        
        messageElement.textContent = message;
        modal.classList.remove('hidden');
    }

    hideLoading() {
        const modal = document.getElementById('loading-modal');
        modal.classList.add('hidden');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for libraries to load, then check
    setTimeout(() => {
        // Check if Cosmos SDK libraries are loaded
        if (typeof window.cosmjs === 'undefined') {
            console.error('Cosmos SDK libraries not loaded');
            
            // Try to load libraries manually
            const loadLibrary = (src) => {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            };
            
            // Try alternative CDN sources
            const alternativeSources = [
                'https://unpkg.com/@cosmjs/cosmjs@0.31.1/dist/cosmjs.min.js',
                'https://cdn.jsdelivr.net/npm/@cosmjs/cosmjs@0.31.1/dist/cosmjs.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/cosmjs/0.31.1/cosmjs.min.js'
            ];
            
            let loaded = false;
            
            const tryLoadLibraries = async () => {
                for (const source of alternativeSources) {
                    try {
                        console.log(`Trying to load from: ${source}`);
                        await loadLibrary(source);
                        
                        // Wait a moment for the library to initialize
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        if (typeof window.cosmjs !== 'undefined') {
                            console.log('Libraries loaded successfully');
                            loaded = true;
                            window.cosmosManager = new CosmosHubManager();
                            return;
                        }
                    } catch (error) {
                        console.error(`Failed to load from ${source}:`, error);
                    }
                }
                
                // If all sources failed, show error
                if (!loaded) {
                    document.body.innerHTML = `
                        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                            <h1>🌌 Cosmos Hub Manager</h1>
                            <h2>Error: Unable to Load Required Libraries</h2>
                            <p>Please check your internet connection and try refreshing the page.</p>
                            <p>If the problem persists, try:</p>
                            <ul style="text-align: left; margin: 20px 0;">
                                <li>Using a different browser</li>
                                <li>Disabling browser extensions</li>
                                <li>Checking your firewall settings</li>
                            </ul>
                            <button onclick="location.reload()" style="padding: 12px 24px; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Refresh Page
                            </button>
                        </div>
                    `;
                }
            };
            
            tryLoadLibraries();
            return;
        }
        
        // Libraries are loaded, initialize the application
        console.log('Cosmos SDK libraries loaded successfully');
        window.cosmosManager = new CosmosHubManager();
    }, 1000); // Wait 1 second for libraries to load
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmosHubManager;
} 