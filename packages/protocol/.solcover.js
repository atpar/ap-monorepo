module.exports = {
  skipFiles: [
    'external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol',
    'ACTUS/test/ANN/TestANNPOF.sol',
    'ACTUS/test/ANN/TestANNSTF.sol',
    'ACTUS/test/CEC/TestCECPOF.sol',
    'ACTUS/test/CEC/TestCECSTF.sol',
    'ACTUS/test/CEG/TestCEGPOF.sol',
    'ACTUS/test/CEG/TestCEGSTF.sol',
    'ACTUS/test/CERTF/TestCERTFPOF.sol',
    'ACTUS/test/CERTF/TestCERTFSTF.sol',
    'ACTUS/test/PAM/TestPAMPOF.sol',
    'ACTUS/test/PAM/TestPAMSTF.sol',
    'ACTUS/test/STK/TestSTKPOF.sol',
    'ACTUS/test/STK/TestSTKSTF.sol',
    'ACTUS/test/TestCore.sol',
    'ACTUS/test/TestSignedMath.sol',
    'SettlementToken.sol',
    'NoSettlementToken.sol',
    'ERC20Token.sol',
    'Extensions/FDT/VanillaFDT/VanillaFDT.sol',
    'Extensions/FDT/SimpleRestrictedFDT/SimpleRestrictedFDT.sol',
    'Extensions/FDT/CMTA20FDT/CMTA20FDT.sol',
    'Extensions/FDT/InitializeableFDT.sol',
    'Extensions/FDT/FundsDistributionToken.sol',
    'Extensions/ICT/ICT.sol',
    'Extensions/ICT/InitializeableICT.sol',
    'Extensions/ICT/DepositAllocator.sol',
    'Extensions/ICT/DepositAllocatorStorage.sol',
    'Extensions/ICT/CheckpointedToken/CheckpointedToken.sol',
    'Extensions/ICT/CheckpointedToken/CheckpointedTokenStorage.sol',
    'Extensions/ICT/Checkpoint/Checkpoint.sol',
    'Extensions/ICT/Checkpoint/CheckpointStorage.sol',
    'Extensions/proxy/ProxyFactory.sol',
  ],
  providerOptions: {
    "default_balance_ether": 5000
  },
  mocha: {
    timeout: 90000,
    grep: "@skip-on-coverage",  // Find everything with this tag
    invert: true                // Run the grep's inverse set.
  },
  measureStatementCoverage: false
};
