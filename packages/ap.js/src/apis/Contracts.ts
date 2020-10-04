import Web3 from 'web3';

import BaseActorArtifact from '@atpar/ap-contracts/build/contracts/BaseActor.json';
import BaseRegistryArtifact from '@atpar/ap-contracts/build/contracts/BaseRegistry.json';
import ANNEngineArtifact from '@atpar/ap-contracts/build/contracts/ANNEngine.json';
import CECEngineArtifact from '@atpar/ap-contracts/build/contracts/CECEngine.json';
import CEGEngineArtifact from '@atpar/ap-contracts/build/contracts/CEGEngine.json';
import CERTFEngineArtifact from '@atpar/ap-contracts/build/contracts/CERTFEngine.json';
import PAMEngineArtifact from '@atpar/ap-contracts/build/contracts/PAMEngine.json';
import ANNActorArtifact from '@atpar/ap-contracts/build/contracts/ANNActor.json';
import CECActorArtifact from '@atpar/ap-contracts/build/contracts/CECActor.json';
import CEGActorArtifact from '@atpar/ap-contracts/build/contracts/CEGActor.json';
import CERTFActorArtifact from '@atpar/ap-contracts/build/contracts/CERTFActor.json';
import PAMActorArtifact from '@atpar/ap-contracts/build/contracts/PAMActor.json';
import ANNRegistryArtifact from '@atpar/ap-contracts/build/contracts/ANNRegistry.json';
import CECRegistryArtifact from '@atpar/ap-contracts/build/contracts/CECRegistry.json';
import CEGRegistryArtifact from '@atpar/ap-contracts/build/contracts/CEGRegistry.json';
import CERTFRegistryArtifact from '@atpar/ap-contracts/build/contracts/CERTFRegistry.json';
import PAMRegistryArtifact from '@atpar/ap-contracts/build/contracts/PAMRegistry.json';
import CustodianArtifact from '@atpar/ap-contracts/build/contracts/Custodian.json';
import DataRegistryArtifact from '@atpar/ap-contracts/build/contracts/DataRegistry.json';
import DvPSettlementArtifact from '@atpar/ap-contracts/build/contracts/DvPSettlement.json';
import FDTFactoryArtifact from '@atpar/ap-contracts/build/contracts/FDTFactory.json';
import ERC20Artifact from '@atpar/ap-contracts/build/contracts/ERC20.json';
import ERC1404Artifact from '@atpar/ap-contracts/build/contracts/ERC1404.json';
import VanillaFDTArtifact from '@atpar/ap-contracts/build/contracts/VanillaFDT.json';

import { BaseActor } from '@atpar/ap-contracts/ts-bindings/BaseActor';
import { BaseRegistry } from '@atpar/ap-contracts/ts-bindings/BaseRegistry';
import { ANNEngine } from '@atpar/ap-contracts/ts-bindings/ANNEngine';
import { CECEngine } from '@atpar/ap-contracts/ts-bindings/CECEngine';
import { CEGEngine } from '@atpar/ap-contracts/ts-bindings/CEGEngine';
import { CERTFEngine } from '@atpar/ap-contracts/ts-bindings/CERTFEngine';
import { PAMEngine } from '@atpar/ap-contracts/ts-bindings/PAMEngine';
import { ANNActor } from '@atpar/ap-contracts/ts-bindings/ANNActor';
import { CEGActor } from '@atpar/ap-contracts/ts-bindings/CEGActor';
import { CECActor } from '@atpar/ap-contracts/ts-bindings/CECActor';
import { CERTFActor } from '@atpar/ap-contracts/ts-bindings/CERTFActor';
import { PAMActor } from '@atpar/ap-contracts/ts-bindings/PAMActor';
import { ANNRegistry } from '@atpar/ap-contracts/ts-bindings/ANNRegistry';
import { CECRegistry } from '@atpar/ap-contracts/ts-bindings/CECRegistry';
import { CEGRegistry } from '@atpar/ap-contracts/ts-bindings/CEGRegistry';
import { CERTFRegistry } from '@atpar/ap-contracts/ts-bindings/CERTFRegistry';
import { PAMRegistry } from '@atpar/ap-contracts/ts-bindings/PAMRegistry';
import { Custodian } from '@atpar/ap-contracts/ts-bindings/Custodian';
import { DataRegistry } from '@atpar/ap-contracts/ts-bindings/DataRegistry';
import { DvPSettlement } from '@atpar/ap-contracts/ts-bindings/DvPSettlement';
import { FDTFactory } from '@atpar/ap-contracts/ts-bindings/FDTFactory';
import { ERC20 } from '@atpar/ap-contracts/ts-bindings/ERC20';
import { ERC1404 } from '@atpar/ap-contracts/ts-bindings/ERC1404';
import { VanillaFDT } from '@atpar/ap-contracts/ts-bindings/VanillaFDT';

import { AddressBook, isAddressBook, UEngine } from '../types';


export class Contracts {

  private _assetActor: BaseActor;
  private _assetRegistry: BaseRegistry;

  private _erc20: ERC20;
  private _erc1404: ERC1404;
  private _erc2222: VanillaFDT;

  public annEngine: ANNEngine;
  public cecEngine: CECEngine;
  public cegEngine: CEGEngine;
  public certfEngine: CERTFEngine;
  public pamEngine: PAMEngine;

  public annActor: ANNActor;
  public cecActor: CECActor;
  public cegActor: CEGActor;
  public certfActor: CERTFActor;
  public pamActor: PAMActor;
  
  public annRegistry: ANNRegistry;
  public cecRegistry: CECRegistry;
  public cegRegistry: CEGRegistry;
  public certfRegistry: CERTFRegistry;
  public pamRegistry: PAMRegistry;

  public custodian: Custodian;
  public dataRegistry: DataRegistry;
  public dvpSettlement: DvPSettlement;
  public fdtFactory: FDTFactory;


  /**
   * Initializes all AP contracts and returns a new instance of the ContractsAPI class.
   * @param {AddressBook} addressBook object containing addresses for ap-contacts
   * @returns {Promise<Contracts>} Promise yielding the Contracts instance
   */
  public constructor (web3: Web3, addressBook: AddressBook) {
    if (!isAddressBook(addressBook)) { throw new Error('Malformed AddressBook.'); }

    // @ts-ignore
    this._assetActor = new web3.eth.Contract(BaseActorArtifact.abi, undefined, { data: BaseActorArtifact.bytecode }) as BaseActor;
    // @ts-ignore
    this._assetRegistry = new web3.eth.Contract(BaseRegistryArtifact.abi, undefined, { data: BaseRegistryArtifact.bytecode }) as BaseRegistry;
    // @ts-ignore
    this.annEngine = new web3.eth.Contract(ANNEngineArtifact.abi, addressBook.ANNEngine, { data: ANNEngineArtifact.bytecode }) as ANNEngine;
    // @ts-ignore
    this.cecEngine = new web3.eth.Contract(CECEngineArtifact.abi, addressBook.CECEngine, { data: CECEngineArtifact.bytecode }) as CECEngine;
    // @ts-ignore
    this.cegEngine = new web3.eth.Contract(CEGEngineArtifact.abi, addressBook.CEGEngine, { data: CEGEngineArtifact.bytecode }) as CEGEngine;
    // @ts-ignore
    this.certfEngine = new web3.eth.Contract(CERTFEngineArtifact.abi, addressBook.CERTFEngine, { data: CERTFEngineArtifact.bytecode }) as CERTFEngine;
    // @ts-ignore
    this.pamEngine = new web3.eth.Contract(PAMEngineArtifact.abi, addressBook.PAMEngine, { data: PAMEngineArtifact.bytecode }) as PAMEngine;
    // @ts-ignore
    this.annActor = new web3.eth.Contract(ANNActorArtifact.abi, addressBook.ANNActor, { data: ANNActorArtifact.bytecode }) as ANNActor;
    // @ts-ignore
    this.cecActor = new web3.eth.Contract(CECActorArtifact.abi, addressBook.CECActor, { data: CECActorArtifact.bytecode }) as CECActor;
    // @ts-ignore
    this.cegActor = new web3.eth.Contract(CEGActorArtifact.abi, addressBook.CEGActor, { data: CEGActorArtifact.bytecode }) as CEGActor;
    // @ts-ignore
    this.certfActor = new web3.eth.Contract(CERTFActorArtifact.abi, addressBook.CERTFActor, { data: CERTFActorArtifact.bytecode }) as CERTFActor;
    // @ts-ignore
    this.pamActor = new web3.eth.Contract(PAMActorArtifact.abi, addressBook.PAMActor, { data: PAMActorArtifact.bytecode }) as PAMActor;
    // @ts-ignore
    this.annRegistry = new web3.eth.Contract(ANNRegistryArtifact.abi, addressBook.ANNRegistry, { data: ANNRegistryArtifact.bytecode }) as ANNRegistry;
    // @ts-ignore
    this.cecRegistry = new web3.eth.Contract(CECRegistryArtifact.abi, addressBook.CECRegistry, { data: CECRegistryArtifact.bytecode }) as CECRegistry;
    // @ts-ignore
    this.cegRegistry = new web3.eth.Contract(CEGRegistryArtifact.abi, addressBook.CEGRegistry, { data: CEGRegistryArtifact.bytecode }) as CEGRegistry;
    // @ts-ignore
    this.certfRegistry = new web3.eth.Contract(CERTFRegistryArtifact.abi, addressBook.CERTFRegistry, { data: CERTFRegistryArtifact.bytecode }) as CERTFRegistry;
    // @ts-ignore
    this.pamRegistry = new web3.eth.Contract(PAMRegistryArtifact.abi, addressBook.PAMRegistry, { data: PAMRegistryArtifact.bytecode }) as PAMRegistry;
    // @ts-ignore
    this.custodian = new web3.eth.Contract(CustodianArtifact.abi, addressBook.Custodian, { data: CustodianArtifact.bytecode }) as Custodian;
    // @ts-ignore
    this.dataRegistry = new web3.eth.Contract(DataRegistryArtifact.abi, addressBook.DataRegistry, { data: DataRegistryArtifact.bytecode }) as DataRegistry,
    // @ts-ignore
    this.dvpSettlement = new web3.eth.Contract(DvPSettlementArtifact.abi, addressBook.DvPSettlement, { data: DvPSettlementArtifact.bytecode }) as DvPSettlement;
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
   * @param {string} contractType a supported contract type
   * @param {string} address address of the contract type specific engine
   * @returns {UEngine} Instance of contract type specific engine
   */
  public engine (contractType: string | number, address?: string): UEngine {
    if (String(contractType) === '0') {
      const pamEngine = this.pamEngine.clone();
      if (address) { pamEngine.options.address = address; }
      return pamEngine;
    } else if (String(contractType) === '1') {
      const annEngine = this.annEngine.clone();
      if (address) { annEngine.options.address = address; }
      return annEngine;
    } else if (String(contractType) === '16') {
      const cegEngine = this.cegEngine.clone();
      if (address) { cegEngine.options.address = address; }
      return cegEngine;
    } else if (String(contractType) === '17') {
      const cecEngine = this.cecEngine.clone();
      if (address) { cecEngine.options.address = address; }
      return cecEngine;
    } else if (String(contractType) === '18') {
      const certfEngine = this.certfEngine.clone();
      if (address) { certfEngine.options.address = address; }
      return certfEngine;
    } else {
      throw new Error('Could not return instance of Engine. Unsupported contract type provided.');
    }
  }

  /**
   * Instantiates asset registry contract by with a provided address or contract type  and returns the instance.
   * @param {string} address address of the contract type specific registry
   * @param {string} contractType a supported contract type
   * @returns {BaseRegistry | ANNRegistry | CECRegistry | CEGRegistry | CERTFRegistry | PAMRegistry} Instance of asset registry contract
   */
  public assetRegistry (
    contractType: string | number | null,
    address?: string
  ): BaseRegistry | ANNRegistry | CECRegistry | CEGRegistry | CERTFRegistry | PAMRegistry {
    if (contractType === null && address == undefined) {
      throw new Error('Could not return instance of AssetRegistry. At least one parameter is required.');
    }

    if (contractType === null && address) {
      const assetRegistry = this._assetRegistry.clone();
      assetRegistry.options.address = address;
      return assetRegistry;
    }

    if (String(contractType) === '0') {
      const pamRegistry = this.pamRegistry.clone();
      if (address) { pamRegistry.options.address = address; }
      return pamRegistry;
    } else if (String(contractType) === '1') {
      const annRegistry = this.annRegistry.clone();
      if (address) { annRegistry.options.address = address; }
      return annRegistry;
    } else if (String(contractType) === '16') {
      const cegRegistry = this.cegRegistry.clone();
      if (address) { cegRegistry.options.address = address; }
      return cegRegistry;
    } else if (String(contractType) === '17') {
      const cecRegistry = this.cecRegistry.clone();
      if (address) { cecRegistry.options.address = address; }
      return cecRegistry;
    } else if (String(contractType) === '18') {
      const certfRegistry = this.certfRegistry.clone();
      if (address) { certfRegistry.options.address = address; }
      return certfRegistry;
    } else {
      throw new Error('Could not return instance of AssetRegistry. Unsupported contract type provided.');
    }
  }

  /**
   * Instantiates asset actor contract by with a provided address or contract type  and returns the instance.
   * @param {string} address address of the contract type specific asset actor
   * @param {string} contractType a supported contract type
   * @returns {BaseActor | ANNActor | CECActor | CEGActor | CERTFActor | PAMActor} Instance of asset actor contract
   */
  public assetActor (
    contractType: string | number | null,
    address?: string
  ): BaseActor | ANNActor | CECActor | CEGActor | CERTFActor | PAMActor {
    if (contractType === null && address == undefined) {
      throw new Error('Could not return instance of AssetActor. At least one parameter is required.');
    }

    if (contractType === null && address) {
      const assetActor = this._assetActor.clone();
      assetActor.options.address = address;
      return assetActor;
    }

    if (String(contractType) === '0') {
      const pamActor = this.pamActor.clone();
      if (address) { pamActor.options.address = address; }
      return pamActor;
    } else if (String(contractType) === '1') {
      const annActor = this.annActor.clone();
      if (address) { annActor.options.address = address; }
      return annActor;
    } else if (String(contractType) === '16') {
      const cegActor = this.cegActor.clone();
      if (address) { cegActor.options.address = address; }
      return cegActor;
    } else if (String(contractType) === '17') {
      const cecActor = this.cecActor.clone();
      if (address) { cecActor.options.address = address; }
      return cecActor;
    } else if (String(contractType) === '18') {
      const certfActor = this.certfActor.clone();
      if (address) { certfActor.options.address = address; }
      return certfActor;
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
