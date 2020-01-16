pragma solidity ^0.5.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

import "../../contracts/Core/SignedMath.sol";


contract TestSignedMath {

    using SignedMath for int256;

    SignedMath instance;

    int256 constant INT256_MIN = int256((uint256(1) << 255));
    int256 constant INT256_MAX = int256(~((uint256(1) << 255)));

    uint256 constant PRECISION = 18;
    uint256 constant MULTIPLICATOR = 10 ** PRECISION;


    constructor() public {
        instance = SignedMath(DeployedAddresses.SignedMath());
    }

    function testFloatMult_NO_OVERFLOW() public {
        Assert.equal(
            int256(5 * int256(MULTIPLICATOR)).floatMult(1 * int256(MULTIPLICATOR)),
            5 * int256(MULTIPLICATOR),
            "FloatMult multiplicand times Identity should be equal to the multiplicand"
        );

        Assert.equal(
            INT256_MAX.floatMult(1),
            (INT256_MAX / int256(MULTIPLICATOR)),
            "FloatMult INT256_MAX times 1 should be equal to INT256_MAX divided by MULTIPLICATOR"
        );

        Assert.equal(
            int256(1 * int256(uint256(10 ** 58))).floatMult(1 * int256(MULTIPLICATOR)),
            1 * int256(uint256(10 ** 58)),
            "FloatMult 10 ** 58 times Identity should be equal to the 10 ** 58"
        );

        Assert.equal(
            int256(5 * int256(MULTIPLICATOR)).floatMult(-1 * int256(MULTIPLICATOR)),
            -5 * int256(MULTIPLICATOR),
            "FloatMult multiplicand times negative Identity should be equal to the negative multiplicand"
        );

        Assert.equal(
            INT256_MIN.floatMult(1),
            (INT256_MIN / int256(MULTIPLICATOR)),
            "FloatMult INT256_MIN times 1 should be equal to INT256_MIN divided by MULTIPLICATOR"
        );

        Assert.equal(
            int256(-1 * int256(uint256(10 ** 58))).floatMult(1 * int256(MULTIPLICATOR)),
            -1 * int256(uint256(10 ** 58)),
            "FloatMult -10 ** 58 times Identity should equal -10 ** 58"
        );
    }

    function testFloatMult_SHOULD_OVERFLOW() public {
        (bool result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), INT256_MAX, 10)); // ~ 0.0...01
        Assert.isFalse(result, "FloatMult NT256_MAX times 10 should overflow and fail"); // INT256_MAX is mulitplied with 10 before getting divided (normalized) with MULTIPLIER

        (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), 1 * int256(uint256(10 ** 59)), 1 * int256(MULTIPLICATOR)));
        Assert.isFalse(result, "FloatMult 10 ** 59 times Identity should overflow and fail");

        (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), INT256_MIN, 10)); // ~ 0.0...01
        Assert.isFalse(result, "FloatMult INT256_MIN times 10 should underflow and fail");

        (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), -1 * int256(uint256(10 ** 59)), 1 * int256(MULTIPLICATOR)));
        Assert.isFalse(result, "FloatMult -10 ** 59 times Identity should underflow and fail");
    }

    function testFloatMult_GRANULARITY() public {
        Assert.equal(
            int256(1 * int256(MULTIPLICATOR)).floatMult(1), 
            1, 
            "FloatMult Identity times 1 should be equal to 1"
        );

        (bool result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatMult(int256,int256)")), 1 * int256(MULTIPLICATOR - 10), 1)); // ~ 0.0...01
        Assert.isFalse(result, "FloatMult (Identity - 10) times 1 should fail");
    }

    function testFloatDiv_NO_OVERFLOW() public {
        Assert.equal(
            int256(5 * int256(MULTIPLICATOR)).floatDiv(1 * int256(MULTIPLICATOR)), 
            5 * int256(MULTIPLICATOR), 
            "FloatDiv dividend divided by Identity should be equal to the dividend"
        );
        
        Assert.equal(
            int256(1 * int256(uint256(10 ** 58))).floatDiv(1 * int256(MULTIPLICATOR)), 
            1 * int256(uint256(10 ** 58)), 
            "FloatDiv 10 ** 58 by Identity should equal 10 ** 58"
        );

        Assert.equal(
            int256(5 * int256(MULTIPLICATOR)).floatDiv(-1 * int256(MULTIPLICATOR)), 
            -5 * int256(MULTIPLICATOR), 
            "FloatDiv dividend by negative Identity should be equal to the negative dividend"
        );
        
        Assert.equal(
            int256(-1 * int256(uint256(10 ** 58))).floatDiv(1 * int256(MULTIPLICATOR)), 
            -1 * int256(uint256(10 ** 58)), 
            "FloatDiv -10 ** 58 divided by Identity should equal -10 ** 58"
        );
    }

    function testFloatDiv_SHOULD_OVERFLOW() public {
        (bool result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatDiv(int256,int256)")), INT256_MAX, 1)); // ~ 0.0...01
        Assert.isFalse(result, "FloatDiv INT256_MAX by 1 should overflow and fail"); 

        (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatDiv(int256,int256)")), 1 * int256(uint256(10 ** 59)), 1 * int256(MULTIPLICATOR)));
        Assert.isFalse(result, "FloatDiv 10 ** 59 by Identity should overflow and fail");

        (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatDiv(int256,int256)")), INT256_MIN, 1)); // ~ 0.0...01
        Assert.isFalse(result, "FloatDiv INT256_MIN by 1 should underflow and fail");

        (result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatDiv(int256,int256)")), -1 * int256(uint256(10 ** 59)), 1 * int256(MULTIPLICATOR)));
        Assert.isFalse(result, "FloatDiv -10 ** 59 by Identify should underflow and fail");
    }

    function testFloatDiv_GRANULARITY() public {
        Assert.equal(
            int256(1).floatDiv(1 * int256(MULTIPLICATOR)), 
            1, 
            "FloatDiv 1 by Identity should be equal to 1"
        );

        (bool result, ) = address(instance).call(abi.encodeWithSelector(bytes4(keccak256("floatDiv(int256,int256)")), 1, 1 * int256(MULTIPLICATOR + 10))); // ~ 0.0...01
        Assert.isFalse(result, "FloatDiv 1 by (Identity - 10) should fail");
    }

    function testSignedMin() public {
        Assert.equal(
            int256(1).min(int256(2)),
            1,
            "min of 1 and 2 should be 1"
        );

        Assert.equal(
            int256(1).min(int256(0)),
            0,
            "min of 1 and 0 should be 0"
        );

        Assert.equal(
            int256(1).min(int256(-1)),
            -1,
            "min of 1 and -1 should be -1"
        );
    }

    function testSignedMax() public {
        Assert.equal(
            int256(1).max(int256(2)),
            2,
            "max of 1 and 2 should be 2"
        );

        Assert.equal(
            int256(1).max(int256(0)),
            1,
            "max of 1 and 0 should be 1"
        );

        Assert.equal(
            int256(1).max(int256(-1)),
            1,
            "max of 1 and -1 should be 1"
        );
    }
}
