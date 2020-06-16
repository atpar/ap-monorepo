pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "@atpar/actus-solidity/contracts/Core/Utils.sol";
import "@atpar/actus-solidity/contracts/Engines/CEC/ICECEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "../Base/Custodian/ICustodian.sol";
import "./ICECRegistry.sol";


/**
 * @title CECActor
 * @notice TODO
 */
contract CECActor is BaseActor {


    constructor(IAssetRegistry assetRegistry, IMarketObjectRegistry marketObjectRegistry)
        public
        BaseActor(assetRegistry, marketObjectRegistry)
    {}

    /**
     * @notice Derives initial state of the asset terms and stores together with
     * terms, schedule, ownership, engine, admin of the asset in the contract types specific AssetRegistry.
     * @dev Can only be called by a whitelisted issuer.
     * @param terms asset specific terms
     * @param schedule schedule of the asset
     * @param engine address of the ACTUS engine used for the spec. ContractType
     * @param admin address of the admin of the asset (optional)
     */
    function initialize(
        CECTerms calldata terms,
        bytes32[] calldata schedule,
        address engine,
        address admin,
        address custodian
    )
        external
        onlyRegisteredIssuer
    {
        require(
            engine != address(0) && IEngine(engine).contractType() == ContractType.CEC,
            "ANNActor.initialize: CONTRACT_TYPE_OF_ENGINE_UNSUPPORTED"
        );

        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(terms, block.timestamp));
        AssetOwnership memory ownership;

        // check if first contract reference in terms references an underlying asset
        if (terms.contractReference_1.role == ContractReferenceRole.COVE) {
            require(
                terms.contractReference_1.object != bytes32(0),
                "CECActor.initialize: INVALID_CONTRACT_REFERENCE_1_OBJECT"
            );
        }

        // check if second contract reference in terms contains a reference to collateral
        if (terms.contractReference_2.role == ContractReferenceRole.COVI) {
            require(
                terms.contractReference_2.object != bytes32(0),
                "CECActor.initialize: INVALID_CONTRACT_REFERENCE_2_OBJECT"
            );

            // derive assetId
            // solium-disable-next-line
            assetId = keccak256(abi.encode(terms, address(custodian), block.timestamp));

            // derive underlying assetId
            bytes32 underlyingAssetId = terms.contractReference_1.object;
            // get contract role and ownership of referenced underlying asset
            ContractRole underlyingContractRole = ContractRole(assetRegistry.getEnumValueForTermsAttribute(underlyingAssetId, "contractRole"));
            AssetOwnership memory underlyingAssetOwnership = assetRegistry.getOwnership(underlyingAssetId);

            // set ownership of draft according to contract role of underlying
            if (terms.contractRole == ContractRole.BUY && underlyingContractRole == ContractRole.RPA) {
                ownership = AssetOwnership(
                    underlyingAssetOwnership.creatorObligor,
                    underlyingAssetOwnership.creatorBeneficiary,
                    address(custodian),
                    underlyingAssetOwnership.counterpartyBeneficiary
                );
            } else if (terms.contractRole == ContractRole.SEL && underlyingContractRole == ContractRole.RPL) {
                ownership = AssetOwnership(
                    address(custodian),
                    underlyingAssetOwnership.creatorBeneficiary,
                    underlyingAssetOwnership.counterpartyObligor,
                    underlyingAssetOwnership.counterpartyBeneficiary
                );
            } else {
                // only BUY, RPA and SEL, RPL allowed for CEC
                revert("CECActor.initialize: INVALID_CONTRACT_ROLES");
            }

            // execute contractual conditions
            // try transferring collateral to the custodian
            ICustodian(custodian).lockCollateral(assetId, terms, ownership);
        }

        // compute the initial state of the asset
        State memory initialState = ICECEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        ICECRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            initialState,
            schedule,
            ownership,
            engine,
            address(this),
            admin
        );

        emit InitializedAsset(assetId, ContractType.CEC, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computeStateAndPayoffForEvent(bytes32 assetId, State memory state, bytes32 _event)
        internal
        view
        override
        returns (State memory, int256)
    {
        address engine = assetRegistry.getEngine(assetId);
        CECTerms memory terms = ICECRegistry(address(assetRegistry)).getTerms(assetId);

        int256 payoff = ICECEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(assetId, _event)
        );
        state = ICECEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(assetId, _event)
        );

        return (state, payoff);
    }
}