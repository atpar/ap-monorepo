module.exports = {
  skipFiles: [
    'external/Dependencies.sol',
    'token/SettlementToken.sol',
    'token/FDT/VanillaFDT.sol',
    'token/FDT/SimpleRestrictedFDT.sol',
    'token/FDT/FundsDistributionToken.sol',
    'token/FDT/IFundsDistributionToken.sol',
    'token/FDT/SafeMathInt.sol',
    'token/FDT/SafeMathUint.sol',
  ],
  providerOptions: {
    "default_balance_ether": 5000
  },
  mocha: {
    timeout: 60000,
    grep: "@skip-on-coverage",  // Find everything with this tag
    invert: true                // Run the grep's inverse set.
  }
};
