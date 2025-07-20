# Cosmos Hub Account Manager

A frontend-only JavaScript application for creating Cosmos Hub accounts, monitoring ATOM transfers, and staking tokens.

## Features

- **Account Creation**: Generate new Cosmos Hub accounts with mnemonic phrases
- **Balance Monitoring**: Real-time ATOM balance tracking
- **Staking**: Manual and automatic staking to validators
- **Transaction History**: Track recent transactions
- **Auto-Staking**: Automatically stake received ATOM above a threshold

## Local Development

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the Cosmos SDK bundle:
```bash
npm run build
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8000`

### Build Commands

- `npm run build` - Build production bundle
- `npm run build:dev` - Build development bundle
- `npm run watch` - Build and watch for changes

### Dependency Management

This project uses locally bundled Cosmos SDK dependencies instead of CDN links. The dependencies are:

- `@cosmjs/stargate` - Stargate client for Cosmos SDK 0.40+
- `@cosmjs/crypto` - Cryptography utilities
- `@cosmjs/proto-signing` - Protobuf-based signing utilities

The dependencies are bundled into `dist/cosmos-bundle.js` using webpack.

## Usage

1. **Create Account**: Enter an account name and click "Create New Account"
2. **Save Mnemonic**: Securely store your mnemonic phrase
3. **Monitor Balance**: Check your ATOM balance and transaction history
4. **Configure Staking**: Set validator address and stake amount
5. **Enable Auto-Staking**: Toggle automatic staking of received ATOM

## Network Configuration

The application connects to the Cosmos Hub mainnet by default:
- RPC Endpoint: `https://cosmos-rpc.publicnode.com:443`
- Chain ID: `cosmoshub-4`

## Security Notes

- **Mnemonic Storage**: Mnemonics are stored in localStorage for convenience but should be backed up securely
- **Network Security**: The application connects to public RPC endpoints
- **Transaction Signing**: Currently simulates transactions; real implementation would require proper signing

## License

MIT License - see LICENSE file for details.
