pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

contract StatefulContractProxyFactoryTestContract {
		
	struct Foo {
		bytes32 a;
		uint b;
	}

	Foo bar;

	constructor(Foo memory _bar) public {
		bar = _bar;
	}

	function getBar() public view returns (bytes32, uint) {
		return(bar.a, bar.b);
	}
}