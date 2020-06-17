import Web3 from 'web3';

import IAssetRegistryArtifact from '@atpar/ap-contracts/artifacts/IAssetRegistry.min.json';
import IEngineArtifact from '@atpar/ap-contracts/artifacts/IEngine.min.json';
import ANNEngineArtifact from '@atpar/ap-contracts/artifacts/ANNEngine.min.json';
import CECEngineArtifact from '@atpar/ap-contracts/artifacts/CECEngine.min.json';
import CEGEngineArtifact from '@atpar/ap-contracts/artifacts/CEGEngine.min.json';
import PAMEngineArtifact from '@atpar/ap-contracts/artifacts/PAMEngine.min.json';
import ANNActorArtifact from '@atpar/ap-contracts/artifacts/ANNActor.min.json';
import CEGActorArtifact from '@atpar/ap-contracts/artifacts/CEGActor.min.json';
import CECActorArtifact from '@atpar/ap-contracts/artifacts/CECActor.min.json';
import PAMActorArtifact from '@atpar/ap-contracts/artifacts/PAMActor.min.json';
import ANNRegistryArtifact from '@atpar/ap-contracts/artifacts/ANNRegistry.min.json';
import CECRegistryArtifact from '@atpar/ap-contracts/artifacts/CECRegistry.min.json';
import CEGRegistryArtifact from '@atpar/ap-contracts/artifacts/CEGRegistry.min.json';
import PAMRegistryArtifact from '@atpar/ap-contracts/artifacts/PAMRegistry.min.json';
import CustodianArtifact from '@atpar/ap-contracts/artifacts/Custodian.min.json';
import MarketObjectRegistryArtifact from '@atpar/ap-contracts/artifacts/MarketObjectRegistry.min.json';
import FDTFactoryArtifact from '@atpar/ap-contracts/artifacts/FDTFactory.min.json';
import ERC20Artifact from '@atpar/ap-contracts/artifacts/ERC20.min.json';
import ERC1404Artifact from '@atpar/ap-contracts/artifacts/ERC1404.min.json';
import VanillaFDTArtifact from '@atpar/ap-contracts/artifacts/VanillaFDT.min.json';

import { IAssetRegistry } from '@atpar/ap-contracts/ts-bindings/IAssetRegistry';
import { IEngine } from '@atpar/ap-contracts/ts-bindings/IEngine';
import { ANNEngine } from '@atpar/ap-contracts/ts-bindings/ANNEngine';
import { CECEngine } from '@atpar/ap-contracts/ts-bindings/CECEngine';
import { CEGEngine } from '@atpar/ap-contracts/ts-bindings/CEGEngine';
import { PAMEngine } from '@atpar/ap-contracts/ts-bindings/PAMEngine';
import { ANNActor } from '@atpar/ap-contracts/ts-bindings/ANNActor';
import { CEGActor } from '@atpar/ap-contracts/ts-bindings/CEGActor';
import { CECActor } from '@atpar/ap-contracts/ts-bindings/CECActor';
import { PAMActor } from '@atpar/ap-contracts/ts-bindings/PAMActor';
import { ANNRegistry } from '@atpar/ap-contracts/ts-bindings/ANNRegistry';
import { CECRegistry } from '@atpar/ap-contracts/ts-bindings/CECRegistry';
import { CEGRegistry } from '@atpar/ap-contracts/ts-bindings/CEGRegistry';
import { PAMRegistry } from '@atpar/ap-contracts/ts-bindings/PAMRegistry';
import { Custodian } from '@atpar/ap-contracts/ts-bindings/Custodian';
import { MarketObjectRegistry } from '@atpar/ap-contracts/ts-bindings/MarketObjectRegistry';
import { FDTFactory } from '@atpar/ap-contracts/ts-bindings/FDTFactory';
import { ERC20 } from '@atpar/ap-contracts/ts-bindings/ERC20';
import { ERC1404 } from '@atpar/ap-contracts/ts-bindings/ERC1404';
import { VanillaFDT } from '@atpar/ap-contracts/ts-bindings/VanillaFDT';

import { AddressBook, isAddressBook } from '../types';


export class Contracts {

  private _engine: IEngine;
  private _assetRegistry: IAssetRegistry;
  private _erc20: ERC20;
  private _erc1404: ERC1404;
  private _erc2222: VanillaFDT;

  public annEngine: ANNEngine;
  public pamEngine: PAMEngine;
  public cegEngine: CEGEngine;
  public cecEngine: CECEngine;

  public annActor: ANNActor;
  public cecActor: CECActor;
  public cegActor: CEGActor;
  public pamActor: PAMActor;
  
  public annRegistry: ANNRegistry;
  public cecRegistry: CECRegistry;
  public cegRegistry: CEGRegistry;
  public pamRegistry: PAMRegistry;

  public custodian: Custodian;
  public marketObjectRegistry: MarketObjectRegistry;
  public fdtFactory: FDTFactory;


  /**
   * Initializes all AP contracts and returns a new instance of the ContractsAPI class.
   * @param {AddressBook} addressBook object containing addresses for ap-contacts
   * @returns {Promise<Contracts>} Promise yielding the Contracts instance
   */
  public constructor (web3: Web3, addressBook: AddressBook) {
    if (!isAddressBook(addressBook)) { throw new Error('Malformed AddressBook.'); }

    // @ts-ignore
    this._assetRegistry = new web3.eth.Contract(IAssetRegistry.abi, undefined, { data: IAssetRegistryArtifact.bytecode }) as IAssetRegistry;
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
    this.annActor = new web3.eth.Contract(ANNActorArtifact.abi, addressBook.ANNActor, { data: ANNActorArtifact.bytecode }) as ANNActor;
    // @ts-ignore
    this.cecActor = new web3.eth.Contract(CECActorArtifact.abi, addressBook.CECActor, { data: CECActorArtifact.bytecode }) as CECActor;
    // @ts-ignore
    this.cegActor = new web3.eth.Contract(CEGActorArtifact.abi, addressBook.CEGActor, { data: CEGActorArtifact.bytecode }) as CEGActor;
    // @ts-ignore
    this.pamActor = new web3.eth.Contract(PAMActorArtifact.abi, addressBook.PAMActor, { data: PAMActorArtifact.bytecode }) as PAMActor;
    // @ts-ignore
    this.annRegistry = new web3.eth.Contract(ANNRegistryArtifact.abi, addressBook.ANNRegistry, { data: ANNRegistryArtifact.bytecode }) as ANNRegistry;
    // @ts-ignore
    this.cecRegistry = new web3.eth.Contract(CECRegistryArtifact.abi, addressBook.CECRegistry, { data: CECRegistryArtifact.bytecode }) as CECRegistry;
    // @ts-ignore
    this.cegRegistry = new web3.eth.Contract(CEGRegistryArtifact.abi, addressBook.CEGRegistry, { data: CEGRegistryArtifact.bytecode }) as CEGRegistry;
    // @ts-ignore
    this.pamRegistry = new web3.eth.Contract(PAMRegistryArtifact.abi, addressBook.PAMRegistry, { data: PAMRegistryArtifact.bytecode }) as PAMRegistry;
    // @ts-ignore
    this.custodian = new web3.eth.Contract(CustodianArtifact.abi, addressBook.Custodian, { data: CustodianArtifact.bytecode }) as Custodian;
    // @ts-ignore
    this.marketObjectRegistry = new web3.eth.Contract(MarketObjectRegistryArtifact.abi, addressBook.MarketObjectRegistry, { data: MarketObjectRegistryArtifact.bytecode }) as MarketObjectRegistry,
    // @ts-ignore
    this.fdtFactory = new web3.eth.Contract(FDTFactoryArtifact.abi, addressBook.FDTFactory, { data: FDTFactoryArtifact.bytecode }) as FDTFactory;
    // @ts-ignore
    this._erc20 = new web3.eth.Contract(ERC20Artifact.abi, undefined, { data: ERC20Artifact.bytecode }) as ERC20;
    // @ts-ignore
    this._erc1404 = new web3.eth.Contract(ERC1404Artifact.abi, undefined, { data: ERC1404Artifact.bytecode }) as ERC1404;
    // @ts-ignore
    this._erc2222 = new web3.eth.Contract(VanillaFDTArtifact.abi, undefined, { data: VanillaFDTArtifact.bytecode }) as VanillaFDT;
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
   * Instantiates the asset registry contract by with a provided address or contract type  and returns the instance.
   * @param {string} addressOrContractType address of the asset registry or a supported contract type
   * @returns {IAssetRegistry} Instance of IAssetRegistry
   */
  public assetRegistry (addressOrContractType: string | number): IAssetRegistry  {
    const assetRegistry = this._assetRegistry.clone();
    let address = String(addressOrContractType);

    if (!String(addressOrContractType).startsWith('0x')) {
      const contractType = String(addressOrContractType);
      if (contractType === '0') {
        address = this.annRegistry.options.address;
      } else if (contractType === '17') {
        address = this.cecRegistry.options.address;
      } else if (contractType === '16') {
        address = this.cegRegistry.options.address;
      } else if (contractType === '1') {
        address = this.pamRegistry.options.address;
      } else {
        throw new Error('Could return AssetRegistry contract instance. Unsupported contract type provided.');
      }
    }
    
    assetRegistry.options.address = address;
    return assetRegistry;
  }

  /**
   * Instantiates an ERC20 token contract with the provided address
   * and returns it as a web3 contract instance.
   * @param {string} address  address of the deployed token contract
   * @returns {ERC20} Instance of ERC20
   */
  public erc20(address: string): ERC20 {
    const erc20 = this._erc20.clone();
    erc20.options.address = address;

    return erc20;
  }

  /**
   * Instantiates an ERC1404 token contract with the provided address
   * and returns it as a web3 contract instance.
   * @param {string} address  address of the deployed token contract
   * @returns {ERC1404} Instance of ERC1404
   */
  public erc1404(address: string): ERC1404 {
    const erc1404 = this._erc1404.clone();
    erc1404.options.address = address;

    return erc1404;
  }

  /**
   * Instantiates an ERC2222 token contract (VanillaFDT) with the provided address
   * and returns it as a web3 contract instance.
   * @param {string} address address of the deployed token contract
   * @returns {ERC2222} Instance of VanillaFDT (ERC2222)
   */
  public erc2222(address: string): VanillaFDT {
    const erc2222 = this._erc2222.clone();
    erc2222.options.address = address;

    return erc2222;
  }
}
