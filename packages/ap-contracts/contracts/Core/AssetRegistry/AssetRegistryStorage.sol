pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "../ProductRegistry/IProductRegistry.sol";
import "../SharedTypes.sol";


contract AssetRegistryStorage is Definitions, SharedTypes {

	struct Asset {
		bytes32 assetId;
		AssetOwnership ownership;
		mapping (int8 => address payable) cashflowBeneficiaries;
		bytes32 productId;
		mapping(uint8 => uint256) nextProtoEventIndex;
		mapping (uint8 => bytes32) packedState;
		uint256 eventId;
    address engine;
		address actor;
	}

	mapping (bytes32 => Asset) assets;

	IProductRegistry public productRegistry;


	constructor(IProductRegistry _productRegistry) public {
		productRegistry = _productRegistry;
	}

	function setAsset(
		bytes32 _assetId,
		AssetOwnership memory _ownership,
		bytes32 _productId,
		State memory state,
    address _engine,
		address _actor
	)
		internal
	{
		assets[_assetId] = Asset({
			assetId: _assetId,
			ownership: _ownership,
			productId: _productId,
			eventId: 0,
      engine: _engine,
			actor: _actor
		});

		encodeAndSetState(_assetId, state);
		encodeAndSetFinalizedState(_assetId, state);
	}

	function encodeAndSetState(bytes32 assetId, State memory state) internal {
		if (state.lastEventTime != uint256(0)) assets[assetId].packedState[101] = bytes32(state.lastEventTime);
		if (state.nonPerformingDate != uint256(0)) assets[assetId].packedState[102] = bytes32(state.nonPerformingDate);

		if (state.notionalPrincipal != int256(0)) assets[assetId].packedState[103] = bytes32(state.notionalPrincipal);
		if (state.accruedInterest != int256(0)) assets[assetId].packedState[104] = bytes32(state.accruedInterest);
		if (state.feeAccrued != int256(0)) assets[assetId].packedState[105] = bytes32(state.feeAccrued);
		if (state.nominalInterestRate != int256(0)) assets[assetId].packedState[106] = bytes32(state.nominalInterestRate);
		if (state.interestScalingMultiplier != int256(0)) assets[assetId].packedState[107] = bytes32(state.interestScalingMultiplier);
		if (state.notionalScalingMultiplier != int256(0)) assets[assetId].packedState[108] = bytes32(state.notionalScalingMultiplier);
		if (state.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedState[109] = bytes32(state.nextPrincipalRedemptionPayment);

		bytes32 enums =
			bytes32(uint256(uint8(state.contractPerformance))) << 248;

		if (enums != bytes32(0)) assets[assetId].packedState[110] = enums;
	}

	function encodeAndSetFinalizedState(bytes32 assetId, State memory state) internal {
		if (state.lastEventTime != uint256(0)) assets[assetId].packedState[151] = bytes32(state.lastEventTime);
		if (state.nonPerformingDate != uint256(0)) assets[assetId].packedState[152] = bytes32(state.nonPerformingDate);

		if (state.notionalPrincipal != int256(0)) assets[assetId].packedState[153] = bytes32(state.notionalPrincipal);
		if (state.accruedInterest != int256(0)) assets[assetId].packedState[154] = bytes32(state.accruedInterest);
		if (state.feeAccrued != int256(0)) assets[assetId].packedState[155] = bytes32(state.feeAccrued);
		if (state.nominalInterestRate != int256(0)) assets[assetId].packedState[156] = bytes32(state.nominalInterestRate);
		if (state.interestScalingMultiplier != int256(0)) assets[assetId].packedState[157] = bytes32(state.interestScalingMultiplier);
		if (state.notionalScalingMultiplier != int256(0)) assets[assetId].packedState[158] = bytes32(state.notionalScalingMultiplier);
		if (state.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedState[159] = bytes32(state.nextPrincipalRedemptionPayment);

		bytes32 enums =
			bytes32(uint256(uint8(state.contractPerformance))) << 248;

		if (enums != bytes32(0)) assets[assetId].packedState[160] = enums;
	}

	function decodeAndGetState(bytes32 assetId) internal view returns (State memory) {
		return State(
			uint256(assets[assetId].packedState[101]),
			uint256(assets[assetId].packedState[102]),
			ContractPerformance(uint8(uint256(assets[assetId].packedState[110] >> 248))),
			int256(assets[assetId].packedState[103]),
			int256(assets[assetId].packedState[104]),
			int256(assets[assetId].packedState[105]),
			int256(assets[assetId].packedState[106]),
			int256(assets[assetId].packedState[107]),
			int256(assets[assetId].packedState[108]),
			int256(assets[assetId].packedState[109])
		);
	}

	function decodeAndGetFinalizedState(bytes32 assetId) internal view returns (State memory) {
		return State(
			uint256(assets[assetId].packedState[151]),
			uint256(assets[assetId].packedState[152]),
			ContractPerformance(uint8(uint256(assets[assetId].packedState[160] >> 248))),
			int256(assets[assetId].packedState[153]),
			int256(assets[assetId].packedState[154]),
			int256(assets[assetId].packedState[155]),
			int256(assets[assetId].packedState[156]),
			int256(assets[assetId].packedState[157]),
			int256(assets[assetId].packedState[158]),
			int256(assets[assetId].packedState[159])
		);
	}
}
