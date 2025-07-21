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
            // Initialize InterchainJS client for Cosmos Hub
            // We'll create the signer when we have an account
            console.log('InterchainJS client initialized');
        } catch (error) {
            throw new Error(`Failed to initialize InterchainJS client: ${error.message}`);
        }
    }

    setupEventListeners() {
        // Account creation
        document.getElementById('create-account-btn').addEventListener('click', () => {
            this.createAccount();
        });

        // Account import
        document.getElementById('import-account-btn').addEventListener('click', () => {
            this.importAccount();
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
            // Generate a new mnemonic using InterchainJS
            const mnemonic = window.interchainjs.Bip39.encode(window.interchainjs.Random.getBytes(16)).toString();
            const accountName = document.getElementById('account-name').value || 'my-cosmos-account';
            
            // Derive authentication objects using InterchainJS
            const [auth] = window.interchainjs.Secp256k1Auth.fromMnemonic(mnemonic, [
                window.interchainjs.HDPath.cosmos(0, 0, 0).toString(),
            ]);
            
            // Create cosmos account to get the address
            const account = new window.interchainjs.CosmosAccount('cosmos', auth);
            const address = account.getAddress();
            
            this.mnemonic = mnemonic;
            this.address = address;
            this.auth = auth;
            
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

    async importAccount() {
        this.showLoading('Importing Cosmos Hub account...');
        
        try {
            const mnemonicInput = document.getElementById('import-mnemonic').value.trim();
            const accountName = document.getElementById('import-account-name').value || 'imported-account';
            
            if (!mnemonicInput) {
                throw new Error('Please enter a mnemonic phrase');
            }
            
            // Validate mnemonic format (should be 12, 15, 18, 21, or 24 words)
            const words = mnemonicInput.split(/\s+/).filter(word => word.length > 0);
            if (![12, 15, 18, 21, 24].includes(words.length)) {
                throw new Error('Mnemonic phrase must be 12, 15, 18, 21, or 24 words');
            }
            
            // Derive authentication objects using InterchainJS
            const [auth] = window.interchainjs.Secp256k1Auth.fromMnemonic(mnemonicInput, [
                window.interchainjs.HDPath.cosmos(0, 0, 0).toString(),
            ]);
            
            // Create cosmos account to get the address
            const account = new window.interchainjs.CosmosAccount('cosmos', auth);
            const address = account.getAddress();
            
            this.mnemonic = mnemonicInput;
            this.address = address;
            this.auth = auth;
            
            // Update account name for imported account
            document.getElementById('account-name').value = accountName;
            
            // Save account info to localStorage
            this.saveAccountInfo();
            
            // Update UI
            this.displayAccountInfo();
            this.updateStatus('account', 'Imported', 'active');
            
            this.hideLoading();
            this.showStatusMessage('Account imported successfully!', 'success');
            
            // Clear import form
            document.getElementById('import-mnemonic').value = '';
            document.getElementById('import-account-name').value = '';
            
            // Start monitoring if auto-staking is enabled
            if (this.autoStakingEnabled) {
                this.startBalanceMonitoring();
            }
            
        } catch (error) {
            this.hideLoading();
            this.showStatusMessage(`Failed to import account: ${error.message}`, 'error');
            console.error('Account import error:', error);
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
            accountName: document.getElementById('account-name').value,
            isImported: this.mnemonic && this.mnemonic.split(/\s+/).length >= 12
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
                
                // Recreate auth from mnemonic using InterchainJS
                const [auth] = window.interchainjs.Secp256k1Auth.fromMnemonic(this.mnemonic, [
                    window.interchainjs.HDPath.cosmos(0, 0, 0).toString(),
                ]);
                this.auth = auth;
                
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
            // Create a DirectSigner for balance queries using InterchainJS
            const encoders = window.interchainjs.toEncoders();
            const signer = new window.interchainjs.DirectSigner(
                this.auth, 
                encoders, 
                this.config.rpcEndpoint, 
                { prefix: 'cosmos' }
            );
            
            // Get balance using the signer's query client and bank query function
            const balanceResponse = await window.interchainjs.getBalance(signer.queryClient.txRpc, {
                address: this.address,
                denom: 'uatom'
            });
            
            const atomBalance = parseFloat(balanceResponse.balance?.amount || '0') / 1000000; // Convert from uatom to ATOM
            
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
            // Create DirectSigner for staking transaction using InterchainJS
            const encoders = window.interchainjs.toEncoders();
            const signer = new window.interchainjs.DirectSigner(
                this.auth, 
                encoders, 
                this.config.rpcEndpoint, 
                { prefix: 'cosmos' }
            );
            
            // Prepare staking message
            const stakingAmount = {
                denom: 'uatom',
                amount: Math.floor(amount * 1000000).toString() // Convert to uatom
            };
            
            const validatorAddr = validatorAddress || 'cosmosvaloper1clpqr4nrk4khgkxj78fcwwh6dl3uw4epsluffn';
            
            // Create delegate message
            const delegateMsg = {
                typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
                value: {
                    delegatorAddress: this.address,
                    validatorAddress: validatorAddr,
                    amount: stakingAmount
                }
            };
            
            // Set fee and memo
            const fee = {
                amount: [{ denom: 'uatom', amount: '5000' }],
                gas: '200000',
            };
            
            // Sign and broadcast the transaction
            const result = await signer.signAndBroadcast([delegateMsg], {
                fee,
                memo: 'staking transaction'
            });
            
            console.log('Staking transaction hash:', result.hash);
            
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
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h1>🌌 Cosmos Hub Manager</h1>
                    <h2>Error: Unable to Load Required Libraries</h2>
                    <p>The bundled Cosmos SDK libraries could not be loaded.</p>
                    <p>Please check that the dist/cosmos-bundle.js file exists and try refreshing the page.</p>
                    <button onclick="location.reload()" style="padding: 12px 24px; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
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