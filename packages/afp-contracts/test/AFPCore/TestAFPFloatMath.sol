pragma solidity ^0.5.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

import "../../contracts/AFPCore/AFPFloatMath.sol";

contract TestAFPFloatMath {

  using AFPFloatMath for int;

  AFPFloatMath instance;

  int256 constant INT256_MIN = int256((uint256(1) << 255));
	int256 constant INT256_MAX = int256(~((uint256(1) << 255)));

  uint256 constant PRECISION = 18;
  uint256 constant MULTIPLICATOR = 10 ** PRECISION;  

  constructor() public {
    instance = AFPFloatMath(DeployedAddresses.AFPFloatMath());
  }

  function testFloatMult_NO_OVERFLOW() public {
    Assert.equal(
      int256(5 * int256(MULTIPLICATOR)).floatMult(1 * int256(MULTIPLICATOR)), 
      5 * int256(MULTIPLICATOR), 
      "FloatMult with Identity should be equal to the multiplicand"
    );
    
    Assert.equal(
      INT256_MAX.floatMult(1), 
      (INT256_MAX / int256(MULTIPLICATOR)), 
      "FloatMult with 1 should be equal to the multiplicand"
    );
    
    Assert.equal(
      int256(1 * int256(uint256(10 ** 58))).floatMult( 1 * int256(MULTIPLICATOR)), 
      1 * int256(uint256(10 ** 58)), 
      "FloatMult identity with 10 ** 58 should be equal to the multiplicand"
    );

    Assert.equal(
      int256(5 * int256(MULTIPLICATOR)).floatMult(-1 * int256(MULTIPLICATOR)), 
      -5 * int256(MULTIPLICATOR), 
      "FloatMult with negative Identity should be equal to the negative multiplicand"
    );
    
    Assert.equal(
      INT256_MIN.floatMult(1), 
      (INT256_MIN / int256(MULTIPLICATOR)), 
      "FloatMult with 1 should be equal to the multiplicand devided by MULTIPLICATOR"
    );
    
    Assert.equal(
      int256(-1 * int256(uint256(10 ** 58))).floatMult(1 * int256(MULTIPLICATOR)), 
      -1 * int256(uint256(10 ** 58)), 
      "FloatMult identity with -10 ** 58 should be equal to the multiplicand"
    );
  }

  function testFloatMult_SHOULD_OVERFLOW() public {
    (bool result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), INT256_MAX, 10)); // ~ 0.0...01
    Assert.isFalse(result, "FloatMult 10 to INT256_MAX should overflow and fail");

    (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), 1 * int256(uint256(10 ** 59)), 1 * int256(MULTIPLICATOR)));
    Assert.isFalse(result, "FloatMult identity with 10 ** 59 should overflow and fail");

    (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), INT256_MIN, 10)); // ~ 0.0...01
    Assert.isFalse(result, "FloatMult 10 to INT256_MIN should underflow and fail");

    (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), -1 * int256(uint256(10 ** 59)), 1 * int256(MULTIPLICATOR)));
    Assert.isFalse(result, "FloatMult identity with -10 ** 59 should underflow and fail");
  }

  function testFloatMult_GRANULARITY() public {
    Assert.equal(
      int256(1 * int256(MULTIPLICATOR)).floatMult(1), 
      1, 
      "FloatMult MULTIPLICATOR with 1 should be equal to 1"
    );

    (bool result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), 1 * int256(MULTIPLICATOR - 10), 1)); // ~ 0.0...01
    Assert.isFalse(result, "FloatMult MULTIPLICATOR - 1 with 1 should fail");
  }
}
