import Web3 from 'web3';

import BaseActorArtifact from '../../build/contracts/contracts/Core/Base/AssetActor/BaseActor.sol/BaseActor.json';
import BaseRegistryArtifact from '../../build/contracts/contracts/Core/Base/AssetRegistry/BaseRegistry.sol/BaseRegistry.json';
import ANNEngineArtifact from '../../build/contracts/contracts/ACTUS/Engines/ANN/ANNEngine.sol/ANNEngine.json';
import CECEngineArtifact from '../../build/contracts/contracts/ACTUS/Engines/CEC/CECEngine.sol/CECEngine.json';
import CEGEngineArtifact from '../../build/contracts/contracts/ACTUS/Engines/CEG/CEGEngine.sol/CEGEngine.json';
import CERTFEngineArtifact from '../../build/contracts/contracts/ACTUS/Engines/CERTF/CERTFEngine.sol/CERTFEngine.json';
import PAMEngineArtifact from '../../build/contracts/contracts/ACTUS/Engines/PAM/PAMEngine.sol/PAMEngine.json';
import STKEngineArtifact from '../../build/contracts/contracts/ACTUS/Engines/STK/STKEngine.sol/STKEngine.json';
import ANNActorArtifact from '../../build/contracts/contracts/Core/ANN/ANNActor.sol/ANNActor.json';
import CECActorArtifact from '../../build/contracts/contracts/Core/CEC/CECActor.sol/CECActor.json';
import CEGActorArtifact from '../../build/contracts/contracts/Core/CEG/CEGActor.sol/CEGActor.json';
import CERTFActorArtifact from '../../build/contracts/contracts/Core/CERTF/CERTFActor.sol/CERTFActor.json';
import PAMActorArtifact from '../../build/contracts/contracts/Core/PAM/PAMActor.sol/PAMActor.json';
import STKActorArtifact from '../../build/contracts/contracts/Core/STK/STKActor.sol/STKActor.json';
import ANNRegistryArtifact from '../../build/contracts/contracts/Core/ANN/ANNRegistry.sol/ANNRegistry.json';
import CECRegistryArtifact from '../../build/contracts/contracts/Core/CEC/CECRegistry.sol/CECRegistry.json';
import CEGRegistryArtifact from '../../build/contracts/contracts/Core/CEG/CEGRegistry.sol/CEGRegistry.json';
import CERTFRegistryArtifact from '../../build/contracts/contracts/Core/CERTF/CERTFRegistry.sol/CERTFRegistry.json';
import PAMRegistryArtifact from '../../build/contracts/contracts/Core/PAM/PAMRegistry.sol/PAMRegistry.json';
import STKRegistryArtifact from '../../build/contracts/contracts/Core/STK/STKRegistry.sol/STKRegistry.json';
import CustodianArtifact from '../../build/contracts/contracts/Core/Base/Custodian/Custodian.sol/Custodian.json';
import DataRegistryArtifact from '../../build/contracts/contracts/Core/Base/DataRegistry/DataRegistry.sol/DataRegistry.json';
import DvPSettlementArtifact from '../../build/contracts/contracts/Extensions/DvPSettlement.sol/DvPSettlement.json';
import ERC20Artifact from '../../build/contracts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import ERC1404Artifact from '../../build/contracts/contracts/Extensions/FDT/SimpleRestrictedFDT/SimpleRestrictedFDT.sol/ERC1404.json';
import VanillaFDTArtifact from '../../build/contracts/contracts/Extensions/FDT/VanillaFDT/VanillaFDT.sol/VanillaFDT.json';
import DataRegistryProxyArtifact from '../../build/contracts/contracts/OracleProxy/DataRegistryProxy.sol/DataRegistryProxy.json';
import OracleRegistryArtifact from '../../build/contracts/contracts/OracleProxy/OracleRegistry.sol/OracleRegistry.json';

import { BaseActor } from '../types/contracts/BaseActor';
import { BaseRegistry } from '../types/contracts/BaseRegistry';
import { ANNEngine } from '../types/contracts/ANNEngine';
import { CECEngine } from '../types/contracts/CECEngine';
import { CEGEngine } from '../types/contracts/CEGEngine';
import { CERTFEngine } from '../types/contracts/CERTFEngine';
import { PAMEngine } from '../types/contracts/PAMEngine';
import { STKEngine } from '../types/contracts/STKEngine';
import { ANNActor } from '../types/contracts/ANNActor';
import { CEGActor } from '../types/contracts/CEGActor';
import { CECActor } from '../types/contracts/CECActor';
import { CERTFActor } from '../types/contracts/CERTFActor';
import { PAMActor } from '../types/contracts/PAMActor';
import { STKActor } from '../types/contracts/STKActor';
import { ANNRegistry } from '../types/contracts/ANNRegistry';
import { CECRegistry } from '../types/contracts/CECRegistry';
import { CEGRegistry } from '../types/contracts/CEGRegistry';
import { CERTFRegistry } from '../types/contracts/CERTFRegistry';
import { PAMRegistry } from '../types/contracts/PAMRegistry';
import { STKRegistry } from '../types/contracts/STKRegistry';
import { Custodian } from '../types/contracts/Custodian';
import { DataRegistry } from '../types/contracts/DataRegistry';
import { DvPSettlement } from '../types/contracts/DvPSettlement';
import { ERC20 } from '../types/contracts/ERC20';
import { ERC1404 } from '../types/contracts/ERC1404';
import { VanillaFDT } from '../types/contracts/VanillaFDT';
import { OracleRegistry } from '../types/contracts/OracleRegistry';
import { DataRegistryProxy } from '../types/contracts/DataRegistryProxy';

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
  public stkEngine: STKEngine;

  public annActor: ANNActor;
  public cecActor: CECActor;
  public cegActor: CEGActor;
  public certfActor: CERTFActor;
  public pamActor: PAMActor;
  public stkActor: STKActor;

  public annRegistry: ANNRegistry;
  public cecRegistry: CECRegistry;
  public cegRegistry: CEGRegistry;
  public certfRegistry: CERTFRegistry;
  public pamRegistry: PAMRegistry;
  public stkRegistry: STKRegistry;

  public custodian: Custodian;
  public dataRegistry: DataRegistry;
  public dvpSettlement: DvPSettlement;

  public oracleRegistry: OracleRegistry;
  public dataRegistryProxy: DataRegistryProxy;

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
    this.stkEngine = new web3.eth.Contract(STKEngineArtifact.abi, addressBook.STKEngine, { data: STKEngineArtifact.bytecode }) as STKEngine;
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
    this.stkActor = new web3.eth.Contract(STKActorArtifact.abi, addressBook.STKActor, { data: STKActorArtifact.bytecode }) as STKActor;
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
    this.stkRegistry = new web3.eth.Contract(STKRegistryArtifact.abi, addressBook.STKRegistry, { data: STKRegistryArtifact.bytecode }) as STKRegistry;
    // @ts-ignore
    this.custodian = new web3.eth.Contract(CustodianArtifact.abi, addressBook.Custodian, { data: CustodianArtifact.bytecode }) as Custodian;
    // @ts-ignore
    this.dataRegistry = new web3.eth.Contract(DataRegistryArtifact.abi, addressBook.DataRegistry, { data: DataRegistryArtifact.bytecode }) as DataRegistry,
    // @ts-ignore
    this.dvpSettlement = new web3.eth.Contract(DvPSettlementArtifact.abi, addressBook.DvPSettlement, { data: DvPSettlementArtifact.bytecode }) as DvPSettlement;
    // @ts-ignore
    this._erc20 = new web3.eth.Contract(ERC20Artifact.abi, undefined, { data: ERC20Artifact.bytecode }) as ERC20;
    // @ts-ignore
    this._erc1404 = new web3.eth.Contract(ERC1404Artifact.abi, undefined, { data: ERC1404Artifact.bytecode }) as ERC1404;
    // @ts-ignore
    this._erc2222 = new web3.eth.Contract(VanillaFDTArtifact.abi, undefined, { data: VanillaFDTArtifact.bytecode }) as VanillaFDT;
    // @ts-ignore
    this.oracleRegistry = new web3.eth.Contract(OracleRegistryArtifact.abi, addressBook.OracleRegistry, { data: OracleRegistryArtifact.bytecode }) as DataRegistry,
    // @ts-ignore
    this.dataRegistryProxy = new web3.eth.Contract(DataRegistryProxyArtifact.abi, addressBook.DataRegistryProxy, { data: DataRegistryProxyArtifact.bytecode }) as DataRegistry
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
    } else if (String(contractType) === '8') {
      const stkEngine = this.stkEngine.clone();
      if (address) { stkEngine.options.address = address; }
      return stkEngine;
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
   * @returns {BaseRegistry | ANNRegistry | CECRegistry | CEGRegistry | CERTFRegistry | PAMRegistry | STKRegistry} Instance of asset registry contract
   */
  public assetRegistry (
    contractType: string | number | null,
    address?: string
  ): BaseRegistry | ANNRegistry | CECRegistry | CEGRegistry | CERTFRegistry | PAMRegistry | STKRegistry {
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
    } else if (String(contractType) === '8') {
      const stkRegistry = this.stkRegistry.clone();
      if (address) { stkRegistry.options.address = address; }
      return stkRegistry;
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
   * @returns {BaseActor | ANNActor | CECActor | CEGActor | CERTFActor | PAMActor | STKActor} Instance of asset actor contract
   */
  public assetActor (
    contractType: string | number | null,
    address?: string
  ): BaseActor | ANNActor | CECActor | CEGActor | CERTFActor | PAMActor | STKActor {
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
    } else if (String(contractType) === '8') {
      const stkActor = this.stkActor.clone();
      if (address) { stkActor.options.address = address; }
      return stkActor;
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
