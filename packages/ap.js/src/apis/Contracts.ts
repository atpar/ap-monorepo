import Web3 from 'web3';

import IAssetActorArtifact from '@atpar/ap-contracts/artifacts/IAssetActor.min.json';
import IAssetRegistryArtifact from '@atpar/ap-contracts/artifacts/IAssetRegistry.min.json';
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
// import ANNEncoderArtifact from '@atpar/ap-contracts/artifacts/ANNEncoder.min.json';
// import CECEncoderArtifact from '@atpar/ap-contracts/artifacts/CECEncoder.min.json';
// import CEGEncoderArtifact from '@atpar/ap-contracts/artifacts/CEGEncoder.min.json';
// import PAMEncoderArtifact from '@atpar/ap-contracts/artifacts/PAMEncoder.min.json';
// import ScheduleEncoderArtifact from '@atpar/ap-contracts/artifacts/ScheduleEncoder.min.json';
// import StateEncoderArtifact from '@atpar/ap-contracts/artifacts/StateEncoder.min.json';
import SignedMathArtifact from '@atpar/ap-contracts/artifacts/SignedMath.min.json';
import CustodianArtifact from '@atpar/ap-contracts/artifacts/Custodian.min.json';
import MarketObjectRegistryArtifact from '@atpar/ap-contracts/artifacts/MarketObjectRegistry.min.json';
import FDTFactoryArtifact from '@atpar/ap-contracts/artifacts/FDTFactory.min.json';
import ERC20Artifact from '@atpar/ap-contracts/artifacts/ERC20.min.json';
import ERC1404Artifact from '@atpar/ap-contracts/artifacts/ERC1404.min.json';
import VanillaFDTArtifact from '@atpar/ap-contracts/artifacts/VanillaFDT.min.json';

import { IAssetActor } from '@atpar/ap-contracts/ts-bindings/IAssetActor';
import { IAssetRegistry } from '@atpar/ap-contracts/ts-bindings/IAssetRegistry';
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
// import { ANNEncoder } from '@atpar/ap-contracts/ts-bindings/ANNEncoder';
// import { CECEncoder } from '@atpar/ap-contracts/ts-bindings/CECEncoder';
// import { CEGEncoder } from '@atpar/ap-contracts/ts-bindings/CEGEncoder';
// import { PAMEncoder } from '@atpar/ap-contracts/ts-bindings/PAMEncoder';
// import { ScheduleEncoder } from '@atpar/ap-contracts/ts-bindings/ScheduleEncoder';
// import { StateEncoder } from '@atpar/ap-contracts/ts-bindings/StateEncoder';
import { SignedMath } from '@atpar/ap-contracts/ts-bindings/SignedMath';
import { Custodian } from '@atpar/ap-contracts/ts-bindings/Custodian';
import { MarketObjectRegistry } from '@atpar/ap-contracts/ts-bindings/MarketObjectRegistry';
import { FDTFactory } from '@atpar/ap-contracts/ts-bindings/FDTFactory';
import { ERC20 } from '@atpar/ap-contracts/ts-bindings/ERC20';
import { ERC1404 } from '@atpar/ap-contracts/ts-bindings/ERC1404';
import { VanillaFDT } from '@atpar/ap-contracts/ts-bindings/VanillaFDT';

import { AddressBook, isAddressBook } from '../types';


export class Contracts {

  private _assetActor: IAssetActor;
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

  // public annEncoder: ANNEncoder;
  // public cecEncoder: CECEncoder;
  // public cegEncoder: CEGEncoder;
  // public pamEncoder: PAMEncoder;
  // public scheduleEncoder: ScheduleEncoder;
  // public stateEncoder: StateEncoder;
  public signedMath: SignedMath;

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
    this._assetActor = new web3.eth.Contract(IAssetActorArtifact.abi, undefined, { data: IAssetActorArtifact.bytecode }) as IAssetActor;
    // @ts-ignore
    this._assetRegistry = new web3.eth.Contract(IAssetRegistryArtifact.abi, undefined, { data: IAssetRegistryArtifact.bytecode }) as IAssetRegistry;
    // @ts-ignore
    this.annEngine = new web3.eth.Contract(ANNEngineArtifact.abi, addressBook.ANNEngine, { data: ANNEngineArtifact.bytecode }) as ANNEngine;
    // @ts-ignore
    this.pamEngine = new web3.eth.Contract(PAMEngineArtifact.abi, addressBook.PAMEngine, { data: PAMEngineArtifact.bytecode }) as PAMEngine;
    // @ts-ignore
    this.cegEngine = new web3.eth.Contract(CEGEngineArtifact.abi, addressBook.CEGEngine, { data: CEGEngineArtifact.bytecode }) as CEGEngine;
    // @ts-ignore
    this.cecEngine = new web3.eth.Contract(CECEngineArtifact.abi, addressBook.CECEngine, { data: CECEngineArtifact.bytecode }) as CECEngine;
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
    // // @ts-ignore
    // this.annEncoder = new web3.eth.Contract(ANNEncoderArtifact.abi, addressBook.ANNEncoder, { data: ANNEncoderArtifact.bytecode }) as ANNEncoder;
    // // @ts-ignore
    // this.cecEncoder = new web3.eth.Contract(CECEncoderArtifact.abi, addressBook.CECEncoder, { data: CECEncoderArtifact.bytecode }) as CECEncoder;
    // // @ts-ignore
    // this.cegEncoder = new web3.eth.Contract(CEGEncoderArtifact.abi, addressBook.CEGEncoder, { data: CEGEncoderArtifact.bytecode }) as CEGEncoder;
    // // @ts-ignore
    // this.pamEncoder = new web3.eth.Contract(PAMEncoderArtifact.abi, addressBook.PAMEncoder, { data: PAMEncoderArtifact.bytecode }) as PAMEncoder;
    // // @ts-ignore
    // this.scheduleEncoder = new web3.eth.Contract(ScheduleEncoderArtifact.abi, addressBook.ScheduleEncoder, { data: ScheduleEncoderArtifact.bytecode }) as ScheduleEncoder;
    // // @ts-ignore
    // this.stateEncoder = new web3.eth.Contract(StateEncoderArtifact.abi, addressBook.StateEncoder, { data: StateEncoderArtifact.bytecode }) as StateEncoder;
    // @ts-ignore
    this.custodian = new web3.eth.Contract(CustodianArtifact.abi, addressBook.Custodian, { data: CustodianArtifact.bytecode }) as Custodian;
    // @ts-ignore
    this.marketObjectRegistry = new web3.eth.Contract(MarketObjectRegistryArtifact.abi, addressBook.MarketObjectRegistry, { data: MarketObjectRegistryArtifact.bytecode }) as MarketObjectRegistry,
    // @ts-ignore
    this.fdtFactory = new web3.eth.Contract(FDTFactoryArtifact.abi, addressBook.FDTFactory, { data: FDTFactoryArtifact.bytecode }) as FDTFactory;
    // @ts-ignore
    this.signedMath = new web3.eth.Contract(SignedMathArtifact.abi, addressBook.SignedMath, { data: SignedMathArtifact.bytecode }) as SignedMath;
    // @ts-ignore
    this._erc20 = new web3.eth.Contract(ERC20Artifact.abi, undefined, { data: ERC20Artifact.bytecode }) as ERC20;
    // @ts-ignore
    this._erc1404 = new web3.eth.Contract(ERC1404Artifact.abi, undefined, { data: ERC1404Artifact.bytecode }) as ERC1404;
    // @ts-ignore
    this._erc2222 = new web3.eth.Contract(VanillaFDTArtifact.abi, undefined, { data: VanillaFDTArtifact.bytecode }) as VanillaFDT;
  }

  /**
   * Instantiates ACTUS engine contract by with a provided address or contract type  and returns the instance.
   * @param {string} contractType a supported contract type
   * @param {string} address address of the contract type specific engine
   * @returns {ANNEngine | CECEngine | CEGEngine | PAMEngine} Instance of contract type specific engine
   */
  public engine (contractType: string | number, address?: string): ANNEngine | CECEngine | CEGEngine | PAMEngine {
    if (contractType === '0') {
      const pamEngine = this.pamEngine.clone();
      if (address) { pamEngine.options.address = address; }
      return pamEngine;
    } else if (contractType === '1') {
      const annEngine = this.annEngine.clone();
      if (address) { annEngine.options.address = address; }
      return annEngine;
    } else if (contractType === '16') {
      const cegEngine = this.cegEngine.clone();
      if (address) { cegEngine.options.address = address; }
      return cegEngine;
    } else if (contractType === '17') {
      const cecEngine = this.cecEngine.clone();
      if (address) { cecEngine.options.address = address; }
      return cecEngine;
    } else {
      throw new Error('Could not return instance of Engine. Unsupported contract type provided.');
    }
  }

  /**
   * Instantiates asset registry contract by with a provided address or contract type  and returns the instance.
   * @param {string} address address of the contract type specific registry
   * @param {string} contractType a supported contract type
   * @returns {ANNRegistry | CECRegistry | CEGRegistry | PAMRegistry} Instance of asset registry contract
   */
  public assetRegistry (contractType: string | number | null, address?: string): IAssetRegistry | ANNRegistry | CECRegistry | CEGRegistry | PAMRegistry {
    if (contractType === null && address == undefined) {
      throw new Error('Could not return instance of AssetRegistry. At least one parameter is required.');
    }

    if (contractType === null && address) {
      const assetRegistry = this._assetRegistry.clone();
      assetRegistry.options.address = address;
      return assetRegistry;
    }

    if (contractType === '0') {
      const pamRegistry = this.pamRegistry.clone();
      if (address) { pamRegistry.options.address = address; }
      return pamRegistry;
    } else if (contractType === '1') {
      const annRegistry = this.annRegistry.clone();
      if (address) { annRegistry.options.address = address; }
      return annRegistry;
    } else if (contractType === '16') {
      const cegRegistry = this.cegRegistry.clone();
      if (address) { cegRegistry.options.address = address; }
      return cegRegistry;
    } else if (contractType === '17') {
      const cecRegistry = this.cecRegistry.clone();
      if (address) { cecRegistry.options.address = address; }
      return cecRegistry;
    } else {
      throw new Error('Could not return instance of AssetRegistry. Unsupported contract type provided.');
    }
  }

  /**
   * Instantiates asset actor contract by with a provided address or contract type  and returns the instance.
   * @param {string} address address of the contract type specific asset actor
   * @param {string} contractType a supported contract type
   * @returns {ANNActor | CECActor | CEGActor | PAMActor} Instance of asset actor contract
   */
  public assetActor (contractType: string | number | null, address?: string): IAssetActor | ANNActor | CECActor | CEGActor | PAMActor {
    if (contractType === null && address == undefined) {
      throw new Error('Could not return instance of AssetActor. At least one parameter is required.');
    }

    if (contractType === null && address) {
      const assetActor = this._assetActor.clone();
      assetActor.options.address = address;
      return assetActor;
    }

    if (contractType === '0') {
      const pamActor = this.pamActor.clone();
      if (address) { pamActor.options.address = address; }
      return pamActor;
    } else if (contractType === '1') {
      const annActor = this.annActor.clone();
      if (address) { annActor.options.address = address; }
      return annActor;
    } else if (contractType === '16') {
      const cegActor = this.cegActor.clone();
      if (address) { cegActor.options.address = address; }
      return cegActor;
    } else if (contractType === '17') {
      const cecActor = this.cecActor.clone();
      if (address) { cecActor.options.address = address; }
      return cecActor;
    } else {
      throw new Error('Could not instance of AssetActor. Unsupported contract type provided.');
    }
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
