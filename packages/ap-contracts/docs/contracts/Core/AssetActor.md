[AssetActor]: #AssetActor
[AssetActor-onlyRegisteredIssuer--]: #AssetActor-onlyRegisteredIssuer--
[AssetActor-assetRegistry-contract-IAssetRegistry]: #AssetActor-assetRegistry-contract-IAssetRegistry
[AssetActor-productRegistry-contract-IProductRegistry]: #AssetActor-productRegistry-contract-IProductRegistry
[AssetActor-marketObjectRegistry-contract-IMarketObjectRegistry]: #AssetActor-marketObjectRegistry-contract-IMarketObjectRegistry
[AssetActor-issuers-mapping-address----bool-]: #AssetActor-issuers-mapping-address----bool-
[AssetActor-constructor-contract-IAssetRegistry-contract-IProductRegistry-contract-IMarketObjectRegistry-]: #AssetActor-constructor-contract-IAssetRegistry-contract-IProductRegistry-contract-IMarketObjectRegistry-
[AssetActor-registerIssuer-address-]: #AssetActor-registerIssuer-address-
[AssetActor-progress-bytes32-]: #AssetActor-progress-bytes32-
[AssetActor-initialize-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-]: #AssetActor-initialize-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-
[AssetActor-settlePayoffForEvent-bytes32-bytes32-int256-struct-ACTUSTypes-LifecycleTerms-]: #AssetActor-settlePayoffForEvent-bytes32-bytes32-int256-struct-ACTUSTypes-LifecycleTerms-
[AssetActor-updateScheduleIndex-bytes32-enum-ACTUSTypes-EventType-]: #AssetActor-updateScheduleIndex-bytes32-enum-ACTUSTypes-EventType-
[AssetActor-getExternalDataForSTF-bytes32-struct-ACTUSTypes-LifecycleTerms-]: #AssetActor-getExternalDataForSTF-bytes32-struct-ACTUSTypes-LifecycleTerms-
[AssetActor-getExternalDataForPOF-bytes32-struct-ACTUSTypes-LifecycleTerms-]: #AssetActor-getExternalDataForPOF-bytes32-struct-ACTUSTypes-LifecycleTerms-
[AssetActor-ProgressedAsset-bytes32-enum-ACTUSTypes-EventType-uint256-]: #AssetActor-ProgressedAsset-bytes32-enum-ACTUSTypes-EventType-uint256-
[AssetActor-Status-bytes32-bytes32-]: #AssetActor-Status-bytes32-bytes32-
[AssetRegistry]: AssetRegistry/AssetRegistry.md#AssetRegistry
[AssetRegistry-constructor-contract-IProductRegistry-]: AssetRegistry/AssetRegistry.md#AssetRegistry-constructor-contract-IProductRegistry-
[AssetRegistry-registerAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-struct-ACTUSTypes-State-address-address-]: AssetRegistry/AssetRegistry.md#AssetRegistry-registerAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-struct-ACTUSTypes-State-address-address-
[AssetRegistry-RegisteredAsset-bytes32-]: AssetRegistry/AssetRegistry.md#AssetRegistry-RegisteredAsset-bytes32-
[AssetRegistryStorage]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage
[AssetRegistryStorage-assets-mapping-bytes32----struct-AssetRegistryStorage-Asset-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-assets-mapping-bytes32----struct-AssetRegistryStorage-Asset-
[AssetRegistryStorage-productRegistry-contract-IProductRegistry]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-productRegistry-contract-IProductRegistry
[AssetRegistryStorage-constructor-contract-IProductRegistry-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-constructor-contract-IProductRegistry-
[AssetRegistryStorage-setAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-struct-ACTUSTypes-State-address-address-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-setAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-struct-ACTUSTypes-State-address-address-
[AssetRegistryStorage-encodeAndSetTerms-bytes32-struct-SharedTypes-CustomTerms-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-encodeAndSetTerms-bytes32-struct-SharedTypes-CustomTerms-
[AssetRegistryStorage-encodeAndSetState-bytes32-struct-ACTUSTypes-State-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-encodeAndSetState-bytes32-struct-ACTUSTypes-State-
[AssetRegistryStorage-encodeAndSetFinalizedState-bytes32-struct-ACTUSTypes-State-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-encodeAndSetFinalizedState-bytes32-struct-ACTUSTypes-State-
[AssetRegistryStorage-decodeAndGetTerms-bytes32-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-decodeAndGetTerms-bytes32-
[AssetRegistryStorage-decodeAndGetAnchorDate-bytes32-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-decodeAndGetAnchorDate-bytes32-
[AssetRegistryStorage-decodeAndGetState-bytes32-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-decodeAndGetState-bytes32-
[AssetRegistryStorage-decodeAndGetFinalizedState-bytes32-]: AssetRegistry/AssetRegistryStorage.md#AssetRegistryStorage-decodeAndGetFinalizedState-bytes32-
[Economics]: AssetRegistry/Economics.md#Economics
[Economics-onlyDesignatedActor-bytes32-]: AssetRegistry/Economics.md#Economics-onlyDesignatedActor-bytes32-
[Economics-getTerms-bytes32-]: AssetRegistry/Economics.md#Economics-getTerms-bytes32-
[Economics-getState-bytes32-]: AssetRegistry/Economics.md#Economics-getState-bytes32-
[Economics-getFinalizedState-bytes32-]: AssetRegistry/Economics.md#Economics-getFinalizedState-bytes32-
[Economics-getAnchorDate-bytes32-]: AssetRegistry/Economics.md#Economics-getAnchorDate-bytes32-
[Economics-getEngineAddress-bytes32-]: AssetRegistry/Economics.md#Economics-getEngineAddress-bytes32-
[Economics-getActorAddress-bytes32-]: AssetRegistry/Economics.md#Economics-getActorAddress-bytes32-
[Economics-getProductId-bytes32-]: AssetRegistry/Economics.md#Economics-getProductId-bytes32-
[Economics-getNextEvent-bytes32-]: AssetRegistry/Economics.md#Economics-getNextEvent-bytes32-
[Economics-getScheduleIndex-bytes32-uint8-]: AssetRegistry/Economics.md#Economics-getScheduleIndex-bytes32-uint8-
[Economics-incrementScheduleIndex-bytes32-uint8-]: AssetRegistry/Economics.md#Economics-incrementScheduleIndex-bytes32-uint8-
[Economics-setState-bytes32-struct-ACTUSTypes-State-]: AssetRegistry/Economics.md#Economics-setState-bytes32-struct-ACTUSTypes-State-
[Economics-setFinalizedState-bytes32-struct-ACTUSTypes-State-]: AssetRegistry/Economics.md#Economics-setFinalizedState-bytes32-struct-ACTUSTypes-State-
[Economics-IncrementedScheduleIndex-bytes32-uint8-uint256-]: AssetRegistry/Economics.md#Economics-IncrementedScheduleIndex-bytes32-uint8-uint256-
[Economics-UpdatedState-bytes32-uint256-]: AssetRegistry/Economics.md#Economics-UpdatedState-bytes32-uint256-
[Economics-UpdatedFinalizedState-bytes32-uint256-]: AssetRegistry/Economics.md#Economics-UpdatedFinalizedState-bytes32-uint256-
[IAssetRegistry]: AssetRegistry/IAssetRegistry.md#IAssetRegistry
[IAssetRegistry-setCreatorBeneficiary-bytes32-address-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-setCreatorBeneficiary-bytes32-address-
[IAssetRegistry-setCounterpartyBeneficiary-bytes32-address-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-setCounterpartyBeneficiary-bytes32-address-
[IAssetRegistry-setBeneficiaryForCashflowId-bytes32-int8-address-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-setBeneficiaryForCashflowId-bytes32-int8-address-
[IAssetRegistry-getOwnership-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getOwnership-bytes32-
[IAssetRegistry-getCashflowBeneficiary-bytes32-int8-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getCashflowBeneficiary-bytes32-int8-
[IAssetRegistry-getTerms-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getTerms-bytes32-
[IAssetRegistry-getState-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getState-bytes32-
[IAssetRegistry-getFinalizedState-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getFinalizedState-bytes32-
[IAssetRegistry-getAnchorDate-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getAnchorDate-bytes32-
[IAssetRegistry-getEngineAddress-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getEngineAddress-bytes32-
[IAssetRegistry-getActorAddress-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getActorAddress-bytes32-
[IAssetRegistry-getProductId-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getProductId-bytes32-
[IAssetRegistry-getNextEvent-bytes32-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getNextEvent-bytes32-
[IAssetRegistry-getScheduleIndex-bytes32-uint8-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-getScheduleIndex-bytes32-uint8-
[IAssetRegistry-incrementScheduleIndex-bytes32-uint8-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-incrementScheduleIndex-bytes32-uint8-
[IAssetRegistry-setState-bytes32-struct-ACTUSTypes-State-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-setState-bytes32-struct-ACTUSTypes-State-
[IAssetRegistry-setFinalizedState-bytes32-struct-ACTUSTypes-State-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-setFinalizedState-bytes32-struct-ACTUSTypes-State-
[IAssetRegistry-registerAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-struct-ACTUSTypes-State-address-address-]: AssetRegistry/IAssetRegistry.md#IAssetRegistry-registerAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-struct-ACTUSTypes-State-address-address-
[Ownership]: AssetRegistry/Ownership.md#Ownership
[Ownership-setCreatorBeneficiary-bytes32-address-]: AssetRegistry/Ownership.md#Ownership-setCreatorBeneficiary-bytes32-address-
[Ownership-setCounterpartyBeneficiary-bytes32-address-]: AssetRegistry/Ownership.md#Ownership-setCounterpartyBeneficiary-bytes32-address-
[Ownership-setBeneficiaryForCashflowId-bytes32-int8-address-]: AssetRegistry/Ownership.md#Ownership-setBeneficiaryForCashflowId-bytes32-int8-address-
[Ownership-getOwnership-bytes32-]: AssetRegistry/Ownership.md#Ownership-getOwnership-bytes32-
[Ownership-getCashflowBeneficiary-bytes32-int8-]: AssetRegistry/Ownership.md#Ownership-getCashflowBeneficiary-bytes32-int8-
[Ownership-UpdatedBeneficiary-bytes32-address-address-]: AssetRegistry/Ownership.md#Ownership-UpdatedBeneficiary-bytes32-address-address-
[Ownership-UpdatedCashflowBeneficiary-bytes32-int8-address-address-]: AssetRegistry/Ownership.md#Ownership-UpdatedCashflowBeneficiary-bytes32-int8-address-address-
[IAssetActor]: IAssetActor.md#IAssetActor
[IAssetActor-progress-bytes32-]: IAssetActor.md#IAssetActor-progress-bytes32-
[IAssetActor-initialize-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-]: IAssetActor.md#IAssetActor-initialize-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-
[IMarketObjectRegistry]: MarketObjectRegistry/IMarketObjectRegistry.md#IMarketObjectRegistry
[IMarketObjectRegistry-setMarketObjectProvider-bytes32-address-]: MarketObjectRegistry/IMarketObjectRegistry.md#IMarketObjectRegistry-setMarketObjectProvider-bytes32-address-
[IMarketObjectRegistry-publishDataPointOfMarketObject-bytes32-uint256-int256-]: MarketObjectRegistry/IMarketObjectRegistry.md#IMarketObjectRegistry-publishDataPointOfMarketObject-bytes32-uint256-int256-
[IMarketObjectRegistry-getDataPointOfMarketObject-bytes32-uint256-]: MarketObjectRegistry/IMarketObjectRegistry.md#IMarketObjectRegistry-getDataPointOfMarketObject-bytes32-uint256-
[IMarketObjectRegistry-getMarketObjectLastUpdatedTimestamp-bytes32-]: MarketObjectRegistry/IMarketObjectRegistry.md#IMarketObjectRegistry-getMarketObjectLastUpdatedTimestamp-bytes32-
[MarketObjectRegistry]: MarketObjectRegistry/MarketObjectRegistry.md#MarketObjectRegistry
[MarketObjectRegistry-setMarketObjectProvider-bytes32-address-]: MarketObjectRegistry/MarketObjectRegistry.md#MarketObjectRegistry-setMarketObjectProvider-bytes32-address-
[MarketObjectRegistry-publishDataPointOfMarketObject-bytes32-uint256-int256-]: MarketObjectRegistry/MarketObjectRegistry.md#MarketObjectRegistry-publishDataPointOfMarketObject-bytes32-uint256-int256-
[MarketObjectRegistry-getDataPointOfMarketObject-bytes32-uint256-]: MarketObjectRegistry/MarketObjectRegistry.md#MarketObjectRegistry-getDataPointOfMarketObject-bytes32-uint256-
[MarketObjectRegistry-getMarketObjectLastUpdatedTimestamp-bytes32-]: MarketObjectRegistry/MarketObjectRegistry.md#MarketObjectRegistry-getMarketObjectLastUpdatedTimestamp-bytes32-
[MarketObjectRegistry-UpdatedMarketObjectProvider-bytes32-address-]: MarketObjectRegistry/MarketObjectRegistry.md#MarketObjectRegistry-UpdatedMarketObjectProvider-bytes32-address-
[MarketObjectRegistry-PublishedDataPoint-bytes32-int256-]: MarketObjectRegistry/MarketObjectRegistry.md#MarketObjectRegistry-PublishedDataPoint-bytes32-int256-
[MarketObjectRegistryStorage]: MarketObjectRegistry/MarketObjectRegistryStorage.md#MarketObjectRegistryStorage
[MarketObjectRegistryStorage-dataPoints-mapping-bytes32----mapping-uint256----struct-MarketObjectRegistryStorage-DataPoint--]: MarketObjectRegistry/MarketObjectRegistryStorage.md#MarketObjectRegistryStorage-dataPoints-mapping-bytes32----mapping-uint256----struct-MarketObjectRegistryStorage-DataPoint--
[MarketObjectRegistryStorage-marketObjectLastUpdatedAt-mapping-bytes32----uint256-]: MarketObjectRegistry/MarketObjectRegistryStorage.md#MarketObjectRegistryStorage-marketObjectLastUpdatedAt-mapping-bytes32----uint256-
[MarketObjectRegistryStorage-marketObjectProviders-mapping-bytes32----address-]: MarketObjectRegistry/MarketObjectRegistryStorage.md#MarketObjectRegistryStorage-marketObjectProviders-mapping-bytes32----address-
[IProductRegistry]: ProductRegistry/IProductRegistry.md#IProductRegistry
[IProductRegistry-getProductTerms-bytes32-]: ProductRegistry/IProductRegistry.md#IProductRegistry-getProductTerms-bytes32-
[IProductRegistry-getEventAtIndex-bytes32-uint8-uint256-]: ProductRegistry/IProductRegistry.md#IProductRegistry-getEventAtIndex-bytes32-uint8-uint256-
[IProductRegistry-getScheduleLength-bytes32-uint8-]: ProductRegistry/IProductRegistry.md#IProductRegistry-getScheduleLength-bytes32-uint8-
[IProductRegistry-registerProduct-struct-SharedTypes-ProductTerms-struct-SharedTypes-ProductSchedules-]: ProductRegistry/IProductRegistry.md#IProductRegistry-registerProduct-struct-SharedTypes-ProductTerms-struct-SharedTypes-ProductSchedules-
[ProductRegistry]: ProductRegistry/ProductRegistry.md#ProductRegistry
[ProductRegistry-getProductTerms-bytes32-]: ProductRegistry/ProductRegistry.md#ProductRegistry-getProductTerms-bytes32-
[ProductRegistry-getEventAtIndex-bytes32-uint8-uint256-]: ProductRegistry/ProductRegistry.md#ProductRegistry-getEventAtIndex-bytes32-uint8-uint256-
[ProductRegistry-getScheduleLength-bytes32-uint8-]: ProductRegistry/ProductRegistry.md#ProductRegistry-getScheduleLength-bytes32-uint8-
[ProductRegistry-getSchedule-bytes32-uint8-]: ProductRegistry/ProductRegistry.md#ProductRegistry-getSchedule-bytes32-uint8-
[ProductRegistry-registerProduct-struct-SharedTypes-ProductTerms-struct-SharedTypes-ProductSchedules-]: ProductRegistry/ProductRegistry.md#ProductRegistry-registerProduct-struct-SharedTypes-ProductTerms-struct-SharedTypes-ProductSchedules-
[ProductRegistry-RegisteredProduct-bytes32-]: ProductRegistry/ProductRegistry.md#ProductRegistry-RegisteredProduct-bytes32-
[ProductRegistryStorage]: ProductRegistry/ProductRegistryStorage.md#ProductRegistryStorage
[ProductRegistryStorage-products-mapping-bytes32----struct-ProductRegistryStorage-Product-]: ProductRegistry/ProductRegistryStorage.md#ProductRegistryStorage-products-mapping-bytes32----struct-ProductRegistryStorage-Product-
[ProductRegistryStorage-setProduct-bytes32-struct-SharedTypes-ProductTerms-struct-SharedTypes-ProductSchedules-]: ProductRegistry/ProductRegistryStorage.md#ProductRegistryStorage-setProduct-bytes32-struct-SharedTypes-ProductTerms-struct-SharedTypes-ProductSchedules-
[ProductRegistryStorage-encodeAndSetTerms-bytes32-struct-SharedTypes-ProductTerms-]: ProductRegistry/ProductRegistryStorage.md#ProductRegistryStorage-encodeAndSetTerms-bytes32-struct-SharedTypes-ProductTerms-
[ProductRegistryStorage-encodeAndSetSchedules-bytes32-struct-SharedTypes-ProductSchedules-]: ProductRegistry/ProductRegistryStorage.md#ProductRegistryStorage-encodeAndSetSchedules-bytes32-struct-SharedTypes-ProductSchedules-
[ProductRegistryStorage-decodeAndGetTerms-bytes32-]: ProductRegistry/ProductRegistryStorage.md#ProductRegistryStorage-decodeAndGetTerms-bytes32-
[SharedTypes]: SharedTypes.md#SharedTypes
[SharedTypes-NON_CYCLIC_INDEX-uint8]: SharedTypes.md#SharedTypes-NON_CYCLIC_INDEX-uint8
[SharedTypes-encodeCollateralAsObject-address-uint256-]: SharedTypes.md#SharedTypes-encodeCollateralAsObject-address-uint256-
[SharedTypes-decodeCollateralObject-bytes32-]: SharedTypes.md#SharedTypes-decodeCollateralObject-bytes32-
[SharedTypes-deriveLifecycleTerms-struct-SharedTypes-ProductTerms-struct-SharedTypes-CustomTerms-]: SharedTypes.md#SharedTypes-deriveLifecycleTerms-struct-SharedTypes-ProductTerms-struct-SharedTypes-CustomTerms-
[SharedTypes-isUnscheduledEventType-enum-ACTUSTypes-EventType-]: SharedTypes.md#SharedTypes-isUnscheduledEventType-enum-ACTUSTypes-EventType-
[SharedTypes-isCyclicEventType-enum-ACTUSTypes-EventType-]: SharedTypes.md#SharedTypes-isCyclicEventType-enum-ACTUSTypes-EventType-
[SharedTypes-deriveScheduleIndexFromEventType-enum-ACTUSTypes-EventType-]: SharedTypes.md#SharedTypes-deriveScheduleIndexFromEventType-enum-ACTUSTypes-EventType-
[AssetIssuer]: ../Issuance/AssetIssuer.md#AssetIssuer
[AssetIssuer-custodian-contract-ICustodian]: ../Issuance/AssetIssuer.md#AssetIssuer-custodian-contract-ICustodian
[AssetIssuer-productRegistry-contract-IProductRegistry]: ../Issuance/AssetIssuer.md#AssetIssuer-productRegistry-contract-IProductRegistry
[AssetIssuer-assetRegistry-contract-IAssetRegistry]: ../Issuance/AssetIssuer.md#AssetIssuer-assetRegistry-contract-IAssetRegistry
[AssetIssuer-constructor-contract-ICustodian-contract-IProductRegistry-contract-IAssetRegistry-]: ../Issuance/AssetIssuer.md#AssetIssuer-constructor-contract-ICustodian-contract-IProductRegistry-contract-IAssetRegistry-
[AssetIssuer-issueFromOrder-struct-VerifyOrder-Order-]: ../Issuance/AssetIssuer.md#AssetIssuer-issueFromOrder-struct-VerifyOrder-Order-
[AssetIssuer-finalizeOrder-struct-VerifyOrder-Order-]: ../Issuance/AssetIssuer.md#AssetIssuer-finalizeOrder-struct-VerifyOrder-Order-
[AssetIssuer-finalizeEnhancementOrder-struct-VerifyOrder-EnhancementOrder-struct-VerifyOrder-Order-]: ../Issuance/AssetIssuer.md#AssetIssuer-finalizeEnhancementOrder-struct-VerifyOrder-EnhancementOrder-struct-VerifyOrder-Order-
[AssetIssuer-issueAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-address-]: ../Issuance/AssetIssuer.md#AssetIssuer-issueAsset-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-address-
[AssetIssuer-ExecutedOrder-bytes32-bytes32-]: ../Issuance/AssetIssuer.md#AssetIssuer-ExecutedOrder-bytes32-bytes32-
[AssetIssuer-IssuedAsset-bytes32-address-address-]: ../Issuance/AssetIssuer.md#AssetIssuer-IssuedAsset-bytes32-address-address-
[Custodian]: ../Issuance/Custodian.md#Custodian
[Custodian-assetActor-address]: ../Issuance/Custodian.md#Custodian-assetActor-address
[Custodian-assetRegistry-contract-IAssetRegistry]: ../Issuance/Custodian.md#Custodian-assetRegistry-contract-IAssetRegistry
[Custodian-collateral-mapping-bytes32----bool-]: ../Issuance/Custodian.md#Custodian-collateral-mapping-bytes32----bool-
[Custodian-constructor-address-contract-IAssetRegistry-]: ../Issuance/Custodian.md#Custodian-constructor-address-contract-IAssetRegistry-
[Custodian-lockCollateral-bytes32-struct-ACTUSTypes-LifecycleTerms-struct-SharedTypes-AssetOwnership-]: ../Issuance/Custodian.md#Custodian-lockCollateral-bytes32-struct-ACTUSTypes-LifecycleTerms-struct-SharedTypes-AssetOwnership-
[Custodian-returnCollateral-bytes32-]: ../Issuance/Custodian.md#Custodian-returnCollateral-bytes32-
[Custodian-LockedCollateral-bytes32-address-uint256-]: ../Issuance/Custodian.md#Custodian-LockedCollateral-bytes32-address-uint256-
[Custodian-ReturnedCollateral-bytes32-address-uint256-]: ../Issuance/Custodian.md#Custodian-ReturnedCollateral-bytes32-address-uint256-
[IAssetIssuer]: ../Issuance/IAssetIssuer.md#IAssetIssuer
[IAssetIssuer-issueFromOrder-struct-VerifyOrder-Order-]: ../Issuance/IAssetIssuer.md#IAssetIssuer-issueFromOrder-struct-VerifyOrder-Order-
[ICustodian]: ../Issuance/ICustodian.md#ICustodian
[ICustodian-lockCollateral-bytes32-struct-ACTUSTypes-LifecycleTerms-struct-SharedTypes-AssetOwnership-]: ../Issuance/ICustodian.md#ICustodian-lockCollateral-bytes32-struct-ACTUSTypes-LifecycleTerms-struct-SharedTypes-AssetOwnership-
[ICustodian-returnCollateral-bytes32-]: ../Issuance/ICustodian.md#ICustodian-returnCollateral-bytes32-
[VerifyOrder]: ../Issuance/VerifyOrder.md#VerifyOrder
[VerifyOrder-EIP712DOMAIN_TYPEHASH-bytes32]: ../Issuance/VerifyOrder.md#VerifyOrder-EIP712DOMAIN_TYPEHASH-bytes32
[VerifyOrder-DRAFT_ENHANCEMENT_ORDER_TYPEHASH-bytes32]: ../Issuance/VerifyOrder.md#VerifyOrder-DRAFT_ENHANCEMENT_ORDER_TYPEHASH-bytes32
[VerifyOrder-ENHANCEMENT_ORDER_TYPEHASH-bytes32]: ../Issuance/VerifyOrder.md#VerifyOrder-ENHANCEMENT_ORDER_TYPEHASH-bytes32
[VerifyOrder-ORDER_TYPEHASH-bytes32]: ../Issuance/VerifyOrder.md#VerifyOrder-ORDER_TYPEHASH-bytes32
[VerifyOrder-DOMAIN_SEPARATOR-bytes32]: ../Issuance/VerifyOrder.md#VerifyOrder-DOMAIN_SEPARATOR-bytes32
[VerifyOrder-hashEIP712Domain-struct-VerifyOrder-EIP712Domain-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashEIP712Domain-struct-VerifyOrder-EIP712Domain-
[VerifyOrder-hashCustomTerms-struct-SharedTypes-CustomTerms-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashCustomTerms-struct-SharedTypes-CustomTerms-
[VerifyOrder-hashSchedules-struct-SharedTypes-ProductSchedules-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashSchedules-struct-SharedTypes-ProductSchedules-
[VerifyOrder-hashOwnership-struct-SharedTypes-AssetOwnership-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashOwnership-struct-SharedTypes-AssetOwnership-
[VerifyOrder-hashDraftEnhancementOrder-struct-VerifyOrder-EnhancementOrder-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashDraftEnhancementOrder-struct-VerifyOrder-EnhancementOrder-
[VerifyOrder-hashUnfilledEnhancementOrder-struct-VerifyOrder-EnhancementOrder-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashUnfilledEnhancementOrder-struct-VerifyOrder-EnhancementOrder-
[VerifyOrder-hashFilledEnhancementOrder-struct-VerifyOrder-EnhancementOrder-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashFilledEnhancementOrder-struct-VerifyOrder-EnhancementOrder-
[VerifyOrder-hashUnfilledOrder-struct-VerifyOrder-Order-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashUnfilledOrder-struct-VerifyOrder-Order-
[VerifyOrder-hashFilledOrder-struct-VerifyOrder-Order-]: ../Issuance/VerifyOrder.md#VerifyOrder-hashFilledOrder-struct-VerifyOrder-Order-
[VerifyOrder-assertOrderSignatures-struct-VerifyOrder-Order-]: ../Issuance/VerifyOrder.md#VerifyOrder-assertOrderSignatures-struct-VerifyOrder-Order-
[Migrations]: ../Migrations.md#Migrations
[Migrations-restricted--]: ../Migrations.md#Migrations-restricted--
[Migrations-owner-address]: ../Migrations.md#Migrations-owner-address
[Migrations-last_completed_migration-uint256]: ../Migrations.md#Migrations-last_completed_migration-uint256
[Migrations-setCompleted-uint256-]: ../Migrations.md#Migrations-setCompleted-uint256-
[Migrations-upgrade-address-]: ../Migrations.md#Migrations-upgrade-address-
[TokenizationFactory]: ../Tokenization/TokenizationFactory.md#TokenizationFactory
[TokenizationFactory-assetRegistry-contract-IAssetRegistry]: ../Tokenization/TokenizationFactory.md#TokenizationFactory-assetRegistry-contract-IAssetRegistry
[TokenizationFactory-constructor-contract-IAssetRegistry-]: ../Tokenization/TokenizationFactory.md#TokenizationFactory-constructor-contract-IAssetRegistry-
[TokenizationFactory-createERC20Distributor-string-string-uint256-contract-IERC20-]: ../Tokenization/TokenizationFactory.md#TokenizationFactory-createERC20Distributor-string-string-uint256-contract-IERC20-
[TokenizationFactory-DeployedDistributor-address-address-]: ../Tokenization/TokenizationFactory.md#TokenizationFactory-DeployedDistributor-address-address-
[Dependencies]: ../external/Dependencies.md#Dependencies
## <span id="AssetActor"></span> `AssetActor`

As the centerpiece of the ACTUS Protocol it is responsible for managing the
lifecycle of assets registered through the AssetRegistry. It acts as the executive of AP
by initializing the state of the state and by processing the assets schedule as specified
in the ProductRegistry. It derives the next state and the current outstanding payoff of
the asset by submitting the last finalized state to the corresponding ACTUS Engine.
The AssetActor stores the next state in the AssetRegistry, depending on if it is able
to settle the current outstanding payoff on behalf of the obligor.



- [`onlyRegisteredIssuer()`][AssetActor-onlyRegisteredIssuer--]
- [`onlyOwner()`][Ownable-onlyOwner--]
- [`constructor(contract IAssetRegistry _assetRegistry, contract IProductRegistry _productRegistry, contract IMarketObjectRegistry _marketObjectRegistry)`][AssetActor-constructor-contract-IAssetRegistry-contract-IProductRegistry-contract-IMarketObjectRegistry-]
- [`registerIssuer(address issuer)`][AssetActor-registerIssuer-address-]
- [`progress(bytes32 assetId)`][AssetActor-progress-bytes32-]
- [`initialize(bytes32 assetId, struct SharedTypes.AssetOwnership ownership, bytes32 productId, struct SharedTypes.CustomTerms customTerms, address engineAddress)`][AssetActor-initialize-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-]
- [`settlePayoffForEvent(bytes32 assetId, bytes32 _event, int256 payoff, struct ACTUSTypes.LifecycleTerms terms)`][AssetActor-settlePayoffForEvent-bytes32-bytes32-int256-struct-ACTUSTypes-LifecycleTerms-]
- [`updateScheduleIndex(bytes32 assetId, enum ACTUSTypes.EventType eventType)`][AssetActor-updateScheduleIndex-bytes32-enum-ACTUSTypes-EventType-]
- [`getExternalDataForSTF(bytes32 _event, struct ACTUSTypes.LifecycleTerms terms)`][AssetActor-getExternalDataForSTF-bytes32-struct-ACTUSTypes-LifecycleTerms-]
- [`getExternalDataForPOF(bytes32 _event, struct ACTUSTypes.LifecycleTerms terms)`][AssetActor-getExternalDataForPOF-bytes32-struct-ACTUSTypes-LifecycleTerms-]
- [`owner()`][Ownable-owner--]
- [`isOwner()`][Ownable-isOwner--]
- [`renounceOwnership()`][Ownable-renounceOwnership--]
- [`transferOwnership(address newOwner)`][Ownable-transferOwnership-address-]
- [`_transferOwnership(address newOwner)`][Ownable-_transferOwnership-address-]
- [`_msgSender()`][Context-_msgSender--]
- [`_msgData()`][Context-_msgData--]
- [`encodeEvent(enum ACTUSTypes.EventType eventType, uint256 scheduleTime)`][Utils-encodeEvent-enum-ACTUSTypes-EventType-uint256-]
- [`decodeEvent(bytes32 _event)`][Utils-decodeEvent-bytes32-]
- [`computeEventTimeForEvent(bytes32 _event, struct ACTUSTypes.LifecycleTerms terms)`][Utils-computeEventTimeForEvent-bytes32-struct-ACTUSTypes-LifecycleTerms-]
- [`getEpochOffset(enum ACTUSTypes.EventType eventType)`][Utils-getEpochOffset-enum-ACTUSTypes-EventType-]
- [`getTimestampPlusPeriod(struct ACTUSTypes.IP period, uint256 timestamp)`][Utils-getTimestampPlusPeriod-struct-ACTUSTypes-IP-uint256-]
- [`isInPeriod(uint256 timestamp, uint256 startTimestamp, uint256 endTimestamp)`][Utils-isInPeriod-uint256-uint256-uint256-]
- [`encodeCollateralAsObject(address collateralToken, uint256 collateralAmount)`][SharedTypes-encodeCollateralAsObject-address-uint256-]
- [`decodeCollateralObject(bytes32 object)`][SharedTypes-decodeCollateralObject-bytes32-]
- [`deriveLifecycleTerms(struct SharedTypes.ProductTerms productTerms, struct SharedTypes.CustomTerms customTerms)`][SharedTypes-deriveLifecycleTerms-struct-SharedTypes-ProductTerms-struct-SharedTypes-CustomTerms-]
- [`isUnscheduledEventType(enum ACTUSTypes.EventType eventType)`][SharedTypes-isUnscheduledEventType-enum-ACTUSTypes-EventType-]
- [`isCyclicEventType(enum ACTUSTypes.EventType eventType)`][SharedTypes-isCyclicEventType-enum-ACTUSTypes-EventType-]
- [`deriveScheduleIndexFromEventType(enum ACTUSTypes.EventType eventType)`][SharedTypes-deriveScheduleIndexFromEventType-enum-ACTUSTypes-EventType-]
- [`shiftCalcTime(uint256 timestamp, enum ACTUSTypes.BusinessDayConvention convention, enum ACTUSTypes.Calendar calendar)`][BusinessDayConvention-shiftCalcTime-uint256-enum-ACTUSTypes-BusinessDayConvention-enum-ACTUSTypes-Calendar-]
- [`shiftEventTime(uint256 timestamp, enum ACTUSTypes.BusinessDayConvention convention, enum ACTUSTypes.Calendar calendar)`][BusinessDayConvention-shiftEventTime-uint256-enum-ACTUSTypes-BusinessDayConvention-enum-ACTUSTypes-Calendar-]
- [`getClosestBusinessDaySameDayOrFollowing(uint256 timestamp, enum ACTUSTypes.Calendar calendar)`][BusinessDayConvention-getClosestBusinessDaySameDayOrFollowing-uint256-enum-ACTUSTypes-Calendar-]
- [`getClosestBusinessDaySameDayOrPreceeding(uint256 timestamp, enum ACTUSTypes.Calendar calendar)`][BusinessDayConvention-getClosestBusinessDaySameDayOrPreceeding-uint256-enum-ACTUSTypes-Calendar-]
- [`ProgressedAsset(bytes32 assetId, enum ACTUSTypes.EventType eventType, uint256 scheduleTime)`][AssetActor-ProgressedAsset-bytes32-enum-ACTUSTypes-EventType-uint256-]
- [`Status(bytes32 assetId, bytes32 statusMessage)`][AssetActor-Status-bytes32-bytes32-]
- [`OwnershipTransferred(address previousOwner, address newOwner)`][Ownable-OwnershipTransferred-address-address-]

### <span id="AssetActor-onlyRegisteredIssuer--"></span> `onlyRegisteredIssuer()`





### <span id="AssetActor-constructor-contract-IAssetRegistry-contract-IProductRegistry-contract-IMarketObjectRegistry-"></span> `constructor(contract IAssetRegistry _assetRegistry, contract IProductRegistry _productRegistry, contract IMarketObjectRegistry _marketObjectRegistry)` (public)





### <span id="AssetActor-registerIssuer-address-"></span> `registerIssuer(address issuer)` (external)

Whitelists the address of an issuer contract for initializing an asset.


Can only be called by the owner of the contract.


### <span id="AssetActor-progress-bytes32-"></span> `progress(bytes32 assetId)` (public)

Proceeds with the next state of the asset based on the terms, the last state,
market object data and the settlement status of current obligation (payoff).


Emits ProgressedAsset if the state of the asset was updated.


### <span id="AssetActor-initialize-bytes32-struct-SharedTypes-AssetOwnership-bytes32-struct-SharedTypes-CustomTerms-address-"></span> `initialize(bytes32 assetId, struct SharedTypes.AssetOwnership ownership, bytes32 productId, struct SharedTypes.CustomTerms customTerms, address engineAddress) → bool` (public)

Derives the initial state of the asset from the provided custom terms and
stores the initial state, the custom terms together with the ownership of the asset
in the AssetRegistry.


Can only be called by a whitelisted issuer.


### <span id="AssetActor-settlePayoffForEvent-bytes32-bytes32-int256-struct-ACTUSTypes-LifecycleTerms-"></span> `settlePayoffForEvent(bytes32 assetId, bytes32 _event, int256 payoff, struct ACTUSTypes.LifecycleTerms terms) → bool` (internal)

Routes a payment to the designated beneficiary of the event obligation.


Checks if an owner of the specified cashflowId is set, if not it sends
funds to the default beneficiary.


### <span id="AssetActor-updateScheduleIndex-bytes32-enum-ACTUSTypes-EventType-"></span> `updateScheduleIndex(bytes32 assetId, enum ACTUSTypes.EventType eventType)` (internal)

Updates the schedule index of the asset for a given event type.



### <span id="AssetActor-getExternalDataForSTF-bytes32-struct-ACTUSTypes-LifecycleTerms-"></span> `getExternalDataForSTF(bytes32 _event, struct ACTUSTypes.LifecycleTerms terms) → bytes32` (internal)

Retrieves external data (such as market object data, block time, underlying asset state)
used for evaluating the STF for a given event.



### <span id="AssetActor-getExternalDataForPOF-bytes32-struct-ACTUSTypes-LifecycleTerms-"></span> `getExternalDataForPOF(bytes32 _event, struct ACTUSTypes.LifecycleTerms terms) → bytes32` (internal)

Retrieves external data (such as market object data)
used for evaluating the POF for a given event.



### <span id="AssetActor-ProgressedAsset-bytes32-enum-ACTUSTypes-EventType-uint256-"></span> `ProgressedAsset(bytes32 assetId, enum ACTUSTypes.EventType eventType, uint256 scheduleTime)`





### <span id="AssetActor-Status-bytes32-bytes32-"></span> `Status(bytes32 assetId, bytes32 statusMessage)`





