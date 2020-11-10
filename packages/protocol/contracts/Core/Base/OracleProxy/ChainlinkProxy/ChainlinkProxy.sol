// // "SPDX-License-Identifier: Apache-2.0"
// pragma solidity ^0.7.0;

// import "../IOracleProxy.sol";
// import "./AggregatorV2V3Interface.sol";


// contract ChainlinkProxy is IOracleProxy {

//     mapping (address => bool) public aggregators;

//     function addAggregatorAddress(address _a) public {
//         aggregators[_a] = true;
//     }

//     function getLatestPrice(address aggregator) public view returns (int256) {
//         if (aggregators[aggregator]) {
//             return AggregatorV2V3Interface(aggregator).latestAnswer();
//         }
//     }


//     function getDataPoint(bytes memory _ref) override public view returns (int256, bool) {
//         return (getLatestPrice(bytesToAddress(_ref)), true);
//     }

//     function getDataPointAtTime(bytes memory _ref, uint256 timestamp) override public view returns (int256) {
//         revert("Timestamped prices not supported");
//     }


//     function bytesToAddress(bytes memory b) private pure returns (address addr) {
//         assembly {
//             addr := mload(add(b,20))
//         } 
//     }
// }