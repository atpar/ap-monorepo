import Web3 from 'web3';

import IEngineArtifact from '@atpar/ap-contracts/artifacts/IEngine.min.json';
import AssetActorArtifact from '@atpar/ap-contracts/artifacts/AssetActor.min.json';
import AssetIssuerArtifact from '@atpar/ap-contracts/artifacts/AssetIssuer.min.json';
import AssetRegistryArtifact from '@atpar/ap-contracts/artifacts/AssetRegistry.min.json';
import CustodianArtifact from '@atpar/ap-contracts/artifacts/Custodian.min.json';
import MarketObjectRegistryArtifact from '@atpar/ap-contracts/artifacts/MarketObjectRegistry.min.json';
import TemplateRegistryArtifact from '@atpar/ap-contracts/artifacts/TemplateRegistry.min.json';
import SignedMathArtifact from '@atpar/ap-contracts/artifacts/SignedMath.min.json';
import TokenizationFactoryArtifact from '@atpar/ap-contracts/artifacts/TokenizationFactory.min.json';
import FDT_ERC20ExtensionArtifact from '@atpar/ap-contracts/artifacts/FDT_ERC20Extension.min.json';
import ERC20Artifact from '@atpar/ap-contracts/artifacts/ERC20.min.json';

import { IEngine } from '@atpar/ap-contracts/ts-bindings/IEngine';
import { ANNEngine } from '@atpar/ap-contracts/ts-bindings/ANNEngine';
import { PAMEngine } from '@atpar/ap-contracts/ts-bindings/PAMEngine';
import { CEGEngine } from '@atpar/ap-contracts/ts-bindings/CEGEngine';
import { CECEngine } from '@atpar/ap-contracts/ts-bindings/CECEngine';
import { AssetActor } from '@atpar/ap-contracts/ts-bindings/AssetActor';
import { AssetRegistry } from '@atpar/ap-contracts/ts-bindings/AssetRegistry';
import { AssetIssuer } from '@atpar/ap-contracts/ts-bindings/AssetIssuer';
import { Custodian } from '@atpar/ap-contracts/ts-bindings/Custodian';
import { MarketObjectRegistry } from '@atpar/ap-contracts/ts-bindings/MarketObjectRegistry';
import { TemplateRegistry } from '@atpar/ap-contracts/ts-bindings/TemplateRegistry';
import { SignedMath } from '@atpar/ap-contracts/ts-bindings/SignedMath';
import { TokenizationFactory } from '@atpar/ap-contracts/ts-bindings/TokenizationFactory';
import { FDT_ERC20Extension } from '@atpar/ap-contracts/ts-bindings/FDT_ERC20Extension';
import { ERC20 } from '@atpar/ap-contracts/ts-bindings/ERC20';

import { AddressBook } from '../types';


export class Contracts {

  private _engine: IEngine;
  private _distributor: FDT_ERC20Extension;
  private _erc20: ERC20;

  public annEngine: ANNEngine;
  public pamEngine: PAMEngine;
  public cegEngine: CEGEngine;
  public cecEngine: CECEngine;

  public assetActor: AssetActor;
  public assetIssuer: AssetIssuer;
  public assetRegistry: AssetRegistry;
  public custodian: Custodian;
  public marketObjectRegistry: MarketObjectRegistry;
  public templateRegistry: TemplateRegistry;
  public signedMath: SignedMath;
  public tokenizationFactory: TokenizationFactory;


  /**
   * Initializes all AP contracts and returns a new instance of the ContractsAPI class.
   * @param {AddressBook} addressBook object containing addresses for ap-contacts
   * @returns {Promise<Contracts>} Promise yielding the Contracts instance
   */
  public constructor (web3: Web3, addressBook: AddressBook) {
    // if (!isAddressBook(addressBook)) { throw new Error('INITIALIZATION_ERROR: Malformed AddressBook.') }

    // @ts-ignore
    this._engine = new web3.eth.Contract(IEngineArtifact.abi) as IEngine;
    // @ts-ignore
    this.annEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.ANNEngine) as ANNEngine;
    // @ts-ignore
    this.pamEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.PAMEngine) as PAMEngine;
    // @ts-ignore
    this.cegEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.CEGEngine) as CEGEngine;
    // @ts-ignore
    this.cecEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.CECEngine) as CECEngine;
    // @ts-ignore
    this.assetActor = new web3.eth.Contract(AssetActorArtifact.abi, addressBook.AssetActor) as AssetActor;
    // @ts-ignore
    this.assetIssuer = new web3.eth.Contract(AssetIssuerArtifact.abi, addressBook.AssetIssuer) as AssetIssuer;
    // @ts-ignore
    this.assetRegistry = new web3.eth.Contract(AssetRegistryArtifact.abi, addressBook.AssetRegistry) as AssetRegistry;
    // @ts-ignore
    this.custodian = new web3.eth.Contract(CustodianArtifact.abi, addressBook.Custodian) as Custodian;
    // @ts-ignore
    this.marketObjectRegistry = new web3.eth.Contract(MarketObjectRegistryArtifact.abi, addressBook.MarketObjectRegistry) as MarketObjectRegistry,
    // @ts-ignore
    this.templateRegistry = new web3.eth.Contract(TemplateRegistryArtifact.abi, addressBook.TemplateRegistry) as TemplateRegistry;
    // @ts-ignore
    this.signedMath = new web3.eth.Contract(SignedMathArtifact.abi, addressBook.SignedMath) as SignedMath;
    // @ts-ignore
    this.tokenizationFactory = new web3.eth.Contract(TokenizationFactoryArtifact.abi, addressBook.TokenizationFactory) as TokenizationFactory;
    // @ts-ignore
    this._distributor = new web3.eth.Contract(FDT_ERC20ExtensionArtifact.abi) as FDT_ERC20Extension;
    // @ts-ignore
    this._erc20 = new web3.eth.Contract(ERC20Artifact.abi) as ERC20;
  }

  /**
   * Instantiates ACTUS engine contract by with a provided address and returns the instance.
   * @param {string} address address of the engine 
   * @returns {IEngine} Instance of IEngine
   */
  public engine (address: string): IEngine {
    const engine = this._engine.clone();
    engine.options.address = address;

    return engine;
  }

  /**
   * Instantiates distributor contract (FDT) by with a provided address and returns the instance.
   * @param {string} address address of the distributor (FDT) 
   * @returns {FDT_ERC20Extension} Instance of FDT_ERC20Extension
   */
  public distributor(address: string): FDT_ERC20Extension {
    const distributor = this._distributor.clone();
    distributor.options.address = address;

    return distributor;
  }

  public erc20(address: string): ERC20 {
    const erc20 = this._erc20.clone();
    erc20.options.address = address;

    return erc20;
  }
}
