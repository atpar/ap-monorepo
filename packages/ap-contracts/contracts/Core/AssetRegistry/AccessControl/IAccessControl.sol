pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;


abstract contract IAccessControl {

    function grantAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external
        virtual;

    function revokeAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external
        virtual;

    function hasAccess(bytes32 assetId, bytes4 methodSignature, address account)
        public
        virtual
        returns (bool);

    function hasRootAccess(bytes32 assetId, address account)
        public
        virtual
        returns (bool);
}
