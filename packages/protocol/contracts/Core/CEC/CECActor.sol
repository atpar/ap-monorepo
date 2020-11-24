// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/CEC/ICECEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "../Base/Custodian/ICustodian.sol";
import "./ICECRegistry.sol";


/**
 * @title CECActor
 * @notice TODO
 */
contract CECActor is BaseActor {

    using SignedMath for int;


    constructor(IAssetRegistry assetRegistry, IOracleProxy defaultOracleProxy) BaseActor(assetRegistry, defaultOracleProxy) {}

    /**
     * @notice Derives initial state of the asset terms and stores together with
     * terms, schedule, ownership, engine, admin of the asset in the contract types specific AssetRegistry.
     * @param terms asset specific terms
     * @param schedule schedule of the asset
     * @param engine address of the ACTUS engine used for the spec. ContractType
     * @param admin address of the admin of the asset (optional)
     * @param extension address of the extension (optional)
     * @param custodian address of the custodian of the collateral
     * @param underlyingRegistry address of the asset registry where the underlying asset is stored
     */
    function initialize(
        CECTerms calldata terms,
        bytes32[] calldata schedule,
        address engine,
        address admin,
        address extension,
        address custodian,
        address underlyingRegistry
    )
        external
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
            AssetOwnership memory underlyingAssetOwnership = IAssetRegistry(underlyingRegistry).getOwnership(underlyingAssetId);

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
    

        // register the asset in the AssetRegistry
        ICECRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            // compute the initial state of the asset
            ICECEngine(engine).computeInitialState(terms),
            schedule,
            ownership,
            engine,
            address(this),
            admin,
            extension
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
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        int256 payoff = ICECEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            )
        );
        state = ICECEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            )
        );

        return (state, payoff);
    }

    /**
     * @notice Retrieves external data (such as market object data, block time, underlying asset state)
     * used for evaluating the STF for a given event.
     */
    function getExternalDataForSTF(
        bytes32 assetId,
        EventType eventType,
        uint256 /* timestamp */
    )
        internal
        view
        override
        returns (bytes memory)
    {
        if (eventType == EventType.EXE) {
            // get the remaining notionalPrincipal from the underlying
            ContractReference memory contractReference_1 = assetRegistry.getContractReferenceValueForTermsAttribute(
                assetId,
                "contractReference_1"
            );
            if (contractReference_1.role == ContractReferenceRole.COVE) {
                bytes32 underlyingAssetId = contractReference_1.object;
                address underlyingRegistry = address(uint160(uint256(contractReference_1.object2)));
                require(
                    IAssetRegistry(underlyingRegistry).isRegistered(underlyingAssetId) == true,
                    "BaseActor.getExternalDataForSTF: ASSET_DOES_NOT_EXIST"
                );
                return abi.encode(
                    IAssetRegistry(underlyingRegistry).getIntValueForStateAttribute(underlyingAssetId, "notionalPrincipal")
                );
            }
        }

        return new bytes(0);
    }
}