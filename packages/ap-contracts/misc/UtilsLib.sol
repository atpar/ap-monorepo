pragma solidity ^0.4.24;

library UtilsLib {
    
  function concatBytes(bytes memory a, bytes memory b) public pure returns (bytes memory c) {
      uint alen = a.length;
      // Store the length of BOTH arrays
      uint totallen = alen + b.length;
      // Count the loops required for array a (sets of 32 bytes)
      uint loopsa = (a.length + 31) / 32;
      // Count the loops required for array b (sets of 32 bytes)
      uint loopsb = (b.length + 31) / 32;
      assembly {
          let m := mload(0x40)
          // Load the length of both arrays to the head of the new bytes array
          mstore(m, totallen)
          // Add the contents of a to the array
          for {  let i := 0 } lt(i, loopsa) { i := add(1, i) } { mstore(add(m, mul(32, add(1, i))), mload(add(a, mul(32, add(1, i))))) }
          // Add the contents of b to the array
          for {  let i := 0 } lt(i, loopsb) { i := add(1, i) } { mstore(add(m, add(mul(32, add(1, i)), alen)), mload(add(b, mul(32, add(1, i))))) }
          mstore(0x40, add(m, add(32, totallen)))
          c := m
      }
  }
}