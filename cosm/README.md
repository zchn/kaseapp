# 🌌 Cosmos Hub Account Manager

A frontend-only JavaScript application that creates Cosmos Hub accounts, monitors ATOM token transfers, and automatically stakes received tokens. This application runs entirely in the browser without requiring any backend infrastructure.

## ✨ Features

- **Account Creation**: Generate new Cosmos Hub accounts with secure mnemonic phrases
- **Balance Monitoring**: Real-time monitoring of ATOM token balances
- **Auto-Staking**: Automatically stake received ATOM tokens when they meet a configurable threshold
- **Transaction History**: Track incoming and outgoing transactions
- **Manual Staking**: Manually stake ATOM tokens to validators
- **Persistent Storage**: Save account information locally for easy access
- **Modern UI**: Beautiful, responsive interface with real-time status updates

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for loading Cosmos SDK libraries and connecting to Cosmos Hub)

### Running the Application

1. **Clone or download the project files**
2. **Start a local server** (required for proper functionality):
   ```bash
   # Using Python (if available)
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using npm scripts
   npm run serve
   ```

3. **Open your browser** and navigate to `http://localhost:8000`

## 📋 How It Works

### 1. Account Creation
- Click "Create New Account" to generate a new Cosmos Hub account
- The application generates a secure 24-word mnemonic phrase
- Your account address is displayed for receiving ATOM tokens
- **Important**: Save your mnemonic phrase securely - you'll need it to access your account

### 2. Balance Monitoring
- The application connects to the Cosmos Hub network via RPC
- Real-time balance updates every 30 seconds when monitoring is active
- Transaction history shows incoming and outgoing transfers

### 3. Auto-Staking
- Enable auto-staking to automatically stake received ATOM tokens
- Set a minimum threshold for auto-staking (default: 0.1 ATOM)
- When someone transfers ATOM to your account and the amount meets the threshold, it's automatically staked

### 4. Manual Staking
- Enter a validator address and stake amount
- Click "Stake ATOM" to manually stake tokens
- Default validator: `cosmosvaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj`

## 🔧 Configuration

### Network Settings
The application connects to the official Cosmos Hub network:
- **RPC Endpoint**: `https://rpc.cosmos.network:26657`
- **Chain ID**: `cosmoshub-4`
- **Gas Price**: `0.025uatom`
- **Gas Limit**: `200000`

### Auto-Staking Settings
- **Enabled/Disabled**: Toggle auto-staking on/off
- **Threshold**: Minimum ATOM amount to trigger auto-staking
- **Validator**: Default validator address (can be changed)

## 🛡️ Security Considerations

### Important Warnings
- **Mnemonic Security**: Your mnemonic phrase is the key to your account. Keep it secure and private
- **Local Storage**: Account information is stored in your browser's localStorage
- **Network Connection**: The application requires internet access to connect to Cosmos Hub
- **Browser Security**: Ensure you're using a secure, up-to-date browser

### Best Practices
1. **Backup your mnemonic**: Write it down and store it securely offline
2. **Use a dedicated browser**: Consider using a separate browser profile for crypto applications
3. **Regular backups**: Export your account information regularly
4. **Test with small amounts**: Start with small ATOM transfers to test functionality

## 📁 Project Structure

```
cosm/
├── index.html          # Main application HTML
├── styles.css          # CSS styles and responsive design
├── app.js             # Main JavaScript application
├── package.json       # Project configuration
└── README.md          # This documentation
```

## 🔌 Technical Details

### Dependencies
The application uses the following external libraries (loaded via CDN):
- `@cosmjs/cosmjs`: Core Cosmos SDK functionality
- `@cosmjs/crypto`: Cryptographic operations
- `@cosmjs/proto-signing`: Transaction signing
- `@cosmjs/stargate`: Stargate client for Cosmos Hub

### Browser Compatibility
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Local Storage
The application stores the following data locally:
- Account address
- Mnemonic phrase (encrypted in production)
- Account name
- Auto-staking preferences

## 🚨 Limitations

### Current Implementation
This is a demonstration application with the following limitations:

1. **Simulated Staking**: The staking functionality is simulated for demonstration purposes
2. **No Real Transactions**: Actual blockchain transactions are not broadcast
3. **Limited Validator Info**: Basic validator address validation
4. **Demo Mode**: Balance monitoring works with real data, but staking is simulated

### Production Considerations
For production use, consider:
- Implementing proper transaction signing and broadcasting
- Adding comprehensive error handling
- Implementing proper security measures
- Adding validator information and selection
- Implementing proper gas estimation
- Adding transaction confirmation tracking

## 🐛 Troubleshooting

### Common Issues

**"Cosmos SDK Libraries Not Loaded"**
- Check your internet connection
- Refresh the page
- Try a different browser

**"Connection Failed"**
- Verify internet connectivity
- Check if the Cosmos Hub RPC endpoint is accessible
- Try refreshing the page

**"Failed to Create Account"**
- Ensure you're using a modern browser
- Check browser console for detailed error messages
- Try clearing browser cache and cookies

**"Balance Not Updating"**
- Verify the account address is correct
- Check if the account has received any ATOM tokens
- Ensure auto-staking is enabled for monitoring

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding comprehensive error handling
- Implementing proper security measures
- Adding unit tests
- Improving the UI/UX
- Adding more validator options

## 📄 License

MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

This application is for educational and demonstration purposes. For production use with real funds, ensure you understand the risks and implement proper security measures. The authors are not responsible for any loss of funds or other damages.

---

**Built with ❤️ for the Cosmos ecosystem**
