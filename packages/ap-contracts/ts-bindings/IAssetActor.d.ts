/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import BN from "bn.js";
import { Contract, ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import { ContractEvent, Callback, TransactionObject, BlockType } from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export class IAssetActor extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): IAssetActor;
  methods: {
    decodeCollateralObject(
      object: string | number[]
    ): TransactionObject<{
      0: string;
      1: BN;
    }>;

    encodeCollateralAsObject(
      collateralToken: string,
      collateralAmount: number | string
    ): TransactionObject<string>;

    PRECISION(): TransactionObject<BN>;

    progress(assetId: string | number[]): TransactionObject<void>;

    initialize(
      assetId: string | number[],
      ownership: {
        creatorObligor: string;
        creatorBeneficiary: string;
        counterpartyObligor: string;
        counterpartyBeneficiary: string;
      },
      productId: string | number[],
      customTerms: {
        anchorDate: number | string;
        notionalPrincipal: number | string;
        nominalInterestRate: number | string;
        premiumDiscountAtIED: number | string;
        rateSpread: number | string;
        lifeCap: number | string;
        lifeFloor: number | string;
        coverageOfCreditEnhancement: number | string;
        contractReference_1: {
          object: string | number[];
          contractReferenceType: number | string;
          contractReferenceRole: number | string;
        };
        contractReference_2: {
          object: string | number[];
          contractReferenceType: number | string;
          contractReferenceRole: number | string;
        };
      },
      engine: string
    ): TransactionObject<boolean>;
  };
  events: {
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}
