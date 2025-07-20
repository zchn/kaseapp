// Cosmos SDK Bundle Entry Point
// This file exports all the necessary Cosmos SDK modules used by the application

const { StargateClient } = require('@cosmjs/stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { SigningStargateClient } = require('@cosmjs/stargate');

// Export all the modules that the app uses
module.exports = {
    StargateClient,
    DirectSecp256k1HdWallet,
    SigningStargateClient
}; 