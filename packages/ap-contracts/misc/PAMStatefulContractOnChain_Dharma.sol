pragma solidity ^0.4.24;

import "./AFPCore/AFPDefinitions.sol";

import "./external/dharma/TermsContract.sol";
import "./external/dharma/ContractRegistry.sol";

contract PAMStatefulContractOnChain_Dharma is TermsContract {

  struct SimpleInterestParams {
    address principalTokenAddress;
    uint principalAmount;
    uint termStartUnixTimestamp;
    uint termEndUnixTimestamp;
    AmortizationUnitType amortizationUnitType;
    uint termLengthInAmortizationUnits;

    // Given that Solidity does not support floating points, we encode
    // interest rates as percentages scaled up by a factor of 10,000
    // As such, interest rates can, at a maximum, have 4 decimal places
    // of precision.
    uint interestRate;
  }

  mapping (bytes32 => uint) public valueRepaid;

  ContractRegistry public contractRegistry;


  modifier onlyDebtKernel() {
    require(msg.sender == address(contractRegistry.debtKernel()));
    _;
  }

  /// When called, the registerTermStart function registers the fact that
  ///    the debt agreement has begun.  Given that the SimpleInterestTermsContract
  ///    doesn't rely on taking any sorts of actions when the loan term begins,
  ///    we simply validate DebtKernel is the transaction sender, and return
  ///    `true` if the debt agreement is associated with this terms contract.
  /// @param  agreementId bytes32. The agreement id (issuance hash) of the debt agreement to which this pertains.
  /// @param  debtor address. The debtor in this particular issuance.
  /// @return _success bool. Acknowledgment of whether
  function registerTermStart(
    bytes32 agreementId,
    address debtor
  )
    public
    onlyDebtKernel
    returns (bool _success)
  {
    address termsContract;
    bytes32 termsContractParameters;

    (termsContract, termsContractParameters) = contractRegistry.debtRegistry().getTerms(agreementId);

    uint principalTokenIndex;
    uint principalAmount;
    uint interestRate;
    uint amortizationUnitType;
    uint termLengthInAmortizationUnits;

    (principalTokenIndex, principalAmount, interestRate, amortizationUnitType, termLengthInAmortizationUnits) =
      unpackParametersFromBytes(termsContractParameters);

    address principalTokenAddress = 
      contractRegistry.tokenRegistry().getTokenAddressByIndex(principalTokenIndex);

    // Returns true (i.e. valid) if the specified principal token is valid,
    // the specified amortization unit type is valid, and the terms contract
    // associated with the agreement is this one.  We need not check
    // if any of the other simple interest parameters are valid, because
    // it is impossible to encode invalid values for them.
    if (principalTokenAddress != address(0) &&
      amortizationUnitType < NUM_AMORTIZATION_UNIT_TYPES &&
      termsContract == address(this)) {
      LogSimpleInterestTermStart(
          agreementId,
          principalTokenAddress,
          principalAmount,
          interestRate,
          amortizationUnitType,
          termLengthInAmortizationUnits
      );

      return true;
    }

    return false;
  }

  /// When called, the registerRepayment function records the debtor's
  ///  repayment, as well as any auxiliary metadata needed by the contract
  ///  to determine ex post facto the value repaid (e.g. current USD
  ///  exchange rate)
  /// @param  agreementId bytes32. The agreement id (issuance hash) of the debt agreement to which this pertains.
  /// @param  payer address. The address of the payer.
  /// @param  beneficiary address. The address of the payment's beneficiary.
  /// @param  unitsOfRepayment uint. The units-of-value repaid in the transaction.
  /// @param  tokenAddress address. The address of the token with which the repayment transaction was executed.
  function registerRepayment(
    bytes32 agreementId,
    address payer,
    address beneficiary,
    uint256 unitsOfRepayment,
    address tokenAddress
  )
    public
    onlyRouter
    returns (bool _success)
  {
    SimpleInterestParams memory params = unpackParamsForAgreementID(agreementId);

    if (tokenAddress == params.principalTokenAddress) {
      valueRepaid[agreementId] = valueRepaid[agreementId].add(unitsOfRepayment);

      LogRegisterRepayment(
        agreementId,
        payer,
        beneficiary,
        unitsOfRepayment,
        tokenAddress
      );

      return true;
    }

    return false;
  }

  /// Returns the cumulative units-of-value expected to be repaid given a block's timestamp.
  ///  Note this is not a constant function -- this value can vary on basis of any number of
  ///  conditions (e.g. interest rates can be renegotiated if repayments are delinquent).
  /// @param  agreementId bytes32. The agreement id (issuance hash) of the debt agreement to which this pertains.
  /// @param  timestamp uint. The timestamp for which repayment expectation is being queried.
  /// @return uint256 The cumulative units-of-value expected to be repaid given a block's timestamp.
  function getExpectedRepaymentValue(
    bytes32 agreementId,
    uint256 timestamp
  )
    public
    view
    onlyMappedToThisContract(agreementId)
    returns (uint _expectedRepaymentValue)
  {
  }

  /// Returns the cumulative units-of-value repaid to date.
  /// @param agreementId bytes32. The agreement id (issuance hash) of the debt agreement to which this pertains.
  /// @return uint256 The cumulative units-of-value repaid by the specified block timestamp.
  function getValueRepaidToDate(bytes32 agreementId)
    public
    view
    returns (uint _valueRepaid)
  {
  }
  
  function getTermEndTimestamp(
    bytes32 _agreementId
  ) 
    public 
    view 
    returns(uint)
  {
  }


  function unpackParametersFromBytes(bytes32 parameters)
    public
    pure
    returns (
      uint _principalTokenIndex,
      uint _principalAmount,
      uint _interestRate,
      uint _amortizationUnitType,
      uint _termLengthInAmortizationUnits
    )
  {   
  }

  function unpackParamsForAgreementID(
    bytes32 agreementId
  )
    internal
    returns (SimpleInterestParams params)
  {
  }

}
