// InterchainJS Bundle Entry Point
// This file exports all the necessary InterchainJS modules used by the application

const { DirectSigner } = require('@interchainjs/cosmos/signers/direct');
const { AminoSigner } = require('@interchainjs/cosmos/signers/amino');
const { Secp256k1Auth } = require('@interchainjs/auth/secp256k1');
const { HDPath } = require('@interchainjs/types/hdpath');
const { CosmosAccount } = require('@interchainjs/cosmos/types/signer');
const { Bip39, Random } = require('@interchainjs/crypto');
const { toEncoders, toConverters } = require('@interchainjs/cosmos/utils');

// Export all the modules that the app uses
module.exports = {
    DirectSigner,
    AminoSigner,
    Secp256k1Auth,
    HDPath,
    CosmosAccount,
    Bip39,
    Random,
    toEncoders,
    toConverters
};

// Also make them available globally for the app to access
if (typeof window !== 'undefined') {
    window.interchainjs = {
        DirectSigner,
        AminoSigner,
        Secp256k1Auth,
        HDPath,
        CosmosAccount,
        Bip39,
        Random,
        toEncoders,
        toConverters
    };
} 