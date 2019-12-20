// pragma solidity ^0.5.2;


// contract Store {

//     mapping (uint256 => bytes32) internal store;


//     function setBytes32(uint256 key, bytes32 value) internal {
//         if (value == bytes32(0)) return;
//         store[key] = value;
//     }

//     function setAddress(uint256 key, address value) internal {
//         if (value == address(0)) return;
//         store[key] = bytes32(uint256(value) << 96);
//     }

//     function setUint256(uint256 key, uint256 value) internal {
//         if (value == uint256(0)) return;
//         store[key] = bytes32(value);
//     }

//     function setInt256(uint256 key, int256 value) internal {
//         if (value == int256(0)) return;
//         store[key] = bytes32(value);
//     }

//     function getBytes32(uint256 key) internal returns (bytes32) {
//         return store[key];
//     }

//     function getAddress(uint256 key) internal returns (bytes32) {
//         return address(uint160(uint256(store[key])));
//     }

//     function getUint256(uint256 key) internal returns (uint256) {
//         return uint256(store[key]);
//     }

//     function getInt256(uint256 key) internal returns (int256) {
//         return int256(store[key]);
//     }
// }