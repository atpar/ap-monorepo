import Web3 from 'web3';

import IEngineArtifact from '@atpar/ap-contracts/artifacts/IEngine.min.json';
import ANNEngineArtifact from '@atpar/ap-contracts/artifacts/ANNEngine.min.json';
import CEGEngineArtifact from '@atpar/ap-contracts/artifacts/CEGEngine.min.json';
import CECEngineArtifact from '@atpar/ap-contracts/artifacts/CECEngine.min.json';
import PAMEngineArtifact from '@atpar/ap-contracts/artifacts/PAMEngine.min.json';
import AssetActorArtifact from '@atpar/ap-contracts/artifacts/AssetActor.min.json';
import AssetIssuerArtifact from '@atpar/ap-contracts/artifacts/AssetIssuer.min.json';
import AssetRegistryArtifact from '@atpar/ap-contracts/artifacts/AssetRegistry.min.json';
import CustodianArtifact from '@atpar/ap-contracts/artifacts/Custodian.min.json';
import MarketObjectRegistryArtifact from '@atpar/ap-contracts/artifacts/MarketObjectRegistry.min.json';
import SignedMathArtifact from '@atpar/ap-contracts/artifacts/SignedMath.min.json';
import TemplateRegistryArtifact from '@atpar/ap-contracts/artifacts/TemplateRegistry.min.json';
import TokenizationFactoryArtifact from '@atpar/ap-contracts/artifacts/TokenizationFactory.min.json';
import VanillaFDTArtifact from '@atpar/ap-contracts/artifacts/VanillaFDT.min.json';
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
import { SignedMath } from '@atpar/ap-contracts/ts-bindings/SignedMath';
import { TemplateRegistry } from '@atpar/ap-contracts/ts-bindings/TemplateRegistry';
import { TokenizationFactory } from '@atpar/ap-contracts/ts-bindings/TokenizationFactory';
import { VanillaFDT } from '@atpar/ap-contracts/ts-bindings/VanillaFDT';
import { ERC20 } from '@atpar/ap-contracts/ts-bindings/ERC20';

import { AddressBook, isAddressBook } from '../types';


export class Contracts {

  private _engine: IEngine;
  private _distributor: VanillaFDT;
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
    if (!isAddressBook(addressBook)) { throw new Error('Malformed AddressBook.'); }

    // @ts-ignore
    this._engine = new web3.eth.Contract(IEngineArtifact.abi, undefined, { data: IEngineArtifact.bytecode }) as IEngine;
    // @ts-ignore
    this.annEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.ANNEngine, { data: ANNEngineArtifact.bytecode }) as ANNEngine;
    // @ts-ignore
    this.pamEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.PAMEngine, { data: PAMEngineArtifact.bytecode }) as PAMEngine;
    // @ts-ignore
    this.cegEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.CEGEngine, { data: CEGEngineArtifact.bytecode }) as CEGEngine;
    // @ts-ignore
    this.cecEngine = new web3.eth.Contract(IEngineArtifact.abi, addressBook.CECEngine, { data: CECEngineArtifact.bytecode }) as CECEngine;
    // @ts-ignore
    this.assetActor = new web3.eth.Contract(AssetActorArtifact.abi, addressBook.AssetActor, { data: AssetActorArtifact.bytecode }) as AssetActor;
    // @ts-ignore
    this.assetIssuer = new web3.eth.Contract(AssetIssuerArtifact.abi, addressBook.AssetIssuer, { data: AssetIssuerArtifact.bytecode }) as AssetIssuer;
    // @ts-ignore
    this.assetRegistry = new web3.eth.Contract(AssetRegistryArtifact.abi, addressBook.AssetRegistry, { data: AssetRegistryArtifact.bytecode }) as AssetRegistry;
    // @ts-ignore
    this.custodian = new web3.eth.Contract(CustodianArtifact.abi, addressBook.Custodian, { data: CustodianArtifact.bytecode }) as Custodian;
    // @ts-ignore
    this.marketObjectRegistry = new web3.eth.Contract(MarketObjectRegistryArtifact.abi, addressBook.MarketObjectRegistry, { data: MarketObjectRegistryArtifact.bytecode }) as MarketObjectRegistry,
    // @ts-ignore
    this.templateRegistry = new web3.eth.Contract(TemplateRegistryArtifact.abi, addressBook.TemplateRegistry, { data: TemplateRegistryArtifact.bytecode }) as TemplateRegistry;
    // @ts-ignore
    this.signedMath = new web3.eth.Contract(SignedMathArtifact.abi, addressBook.SignedMath, { data: SignedMathArtifact.bytecode }) as SignedMath;
    // @ts-ignore
    this.tokenizationFactory = new web3.eth.Contract(TokenizationFactoryArtifact.abi, addressBook.TokenizationFactory, { data: TokenizationFactoryArtifact.bytecode }) as TokenizationFactory;
    // @ts-ignore
    this._distributor = new web3.eth.Contract(VanillaFDTArtifact.abi, undefined, { data: VanillaFDTArtifact.bytecode }) as VanillaFDT;
    // @ts-ignore
    this._erc20 = new web3.eth.Contract(ERC20Artifact.abi, undefined, { data: ERC20Artifact.bytecode }) as ERC20;
  }

  /**
   * Instantiates ACTUS engine contract by with a provided address or contract type  and returns the instance.
   * @param {string} addressOrContractType address of the engine or a supported contract type
   * @returns {IEngine} Instance of IEngine
   */
  public engine (addressOrContractType: string | number): IEngine {
    const engine = this._engine.clone();
    let address = String(addressOrContractType);

    if (!String(addressOrContractType).startsWith('0x')) {
      const contractType = String(addressOrContractType);
      if (contractType === '0') {
        address = this.pamEngine.options.address;
      } else if (contractType === '1') {
        address = this.annEngine.options.address;
      } else if (contractType === '16') {
        address = this.cegEngine.options.address;
      } else if (contractType === '17') {
        address = this.cecEngine.options.address;
      } else {
        throw new Error('Could return Engine contract instance. Unsupported contract type provided.');
      }
    }
    
    engine.options.address = address;
    return engine;
  }

  /**
   * Instantiates distributor contract (FDT) by with a provided address and returns the instance.
   * @param {string} address address of the distributor (FDT) 
   * @returns {VanillaFDT} Instance of VanillaFDT
   */
  public distributor(address: string): VanillaFDT {
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
