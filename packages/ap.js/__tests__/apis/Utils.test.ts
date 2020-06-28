import Web3 from 'web3';

// @ts-ignore
import Deployments from '@atpar/ap-contracts/deployments.json';

import { Utils, Contracts } from '../../src/apis';

import DEFAULT_TERMS from '../Default-Terms.json';
import { Terms, isPAMTerms, isANNTerms, isCERTFTerms, isCECTerms, isCEGTerms } from '../../src/types';


describe('Utils', (): void => {

  let web3: Web3;
  let contracts: Contracts;


  beforeAll(async (): Promise<void> => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    // @ts-ignore
    const addressBook = Deployments[await web3.eth.net.getId()];
    contracts = new Contracts(web3, addressBook);
  });

  describe('Schedule', (): void => {


    it('should return schedule for PAM terms', async (): Promise<void> => {
      const terms: Terms = DEFAULT_TERMS;
      const pamTerms = Utils.conversion.extractPAMTerms(terms);
      const schedule = await Utils.schedule.computeScheduleFromTerms(contracts.engine(pamTerms.contractType), pamTerms);

      expect(schedule.length).toBeGreaterThan(0);
    });

  });
  
  describe('Conversion', (): void => {
    it('should convert date ISO to Unix', async (): Promise<void> => {
      const isoString = '2020-06-06T23:05:30'; //1591484730
      const unixDate = Utils.conversion.isoToUnix(isoString);
      expect(unixDate).toBe('1591484730');
    });

    it('should convert date Unix to ISO', async (): Promise<void> => {
      const unixString = '1591484730'; // 2020-06-06T23:05:30
      const unixNumber = 1591484730; // 2020-06-06T23:05:30
      const isoDateFromString = Utils.conversion.unixToISO(unixString);
      const isoDateFromNumber = Utils.conversion.unixToISO(unixNumber);
      expect(isoDateFromString).toBe('2020-06-06T23:05:30.000Z');
      expect(isoDateFromNumber).toBe('2020-06-06T23:05:30.000Z');
    });

    it('should convert date Unix to ISO', async (): Promise<void> => {
      const unixString = '1591484730'; // 2020-06-06T23:05:30
      const unixNumber = 1591484730; // 2020-06-06T23:05:30
      const isoDateFromString = Utils.conversion.unixToISO(unixString);
      const isoDateFromNumber = Utils.conversion.unixToISO(unixNumber);
      expect(isoDateFromString).toBe('2020-06-06T23:05:30.000Z');
      expect(isoDateFromNumber).toBe('2020-06-06T23:05:30.000Z');
    });

    it('should convert full terms to ANNTerms', async (): Promise<void> => {
      const terms: Terms = DEFAULT_TERMS;
      const annTerms = Utils.conversion.extractANNTerms(terms);
      expect(isANNTerms(annTerms))
    });

    it('should convert full terms to CECTerms', async (): Promise<void> => {
      const terms: Terms = DEFAULT_TERMS;
      const cecTerms = Utils.conversion.extractCECTerms(terms);
      expect(isCECTerms(cecTerms))
    });

    it('should convert full terms to CEGTerms', async (): Promise<void> => {
      const terms: Terms = DEFAULT_TERMS;
      const cegTerms = Utils.conversion.extractCEGTerms(terms);
      expect(isCEGTerms(cegTerms))
    });

    it('should convert full terms to CERTFTerms', async (): Promise<void> => {
      const terms: Terms = DEFAULT_TERMS;
      const certfTerms = Utils.conversion.extractCERTFTerms(terms);
      expect(isCERTFTerms(certfTerms))
    });

    it('should convert full terms to PAMTerms', async (): Promise<void> => {
      const terms: Terms = DEFAULT_TERMS;
      const pamTerms = Utils.conversion.extractPAMTerms(terms);
      expect(isPAMTerms(pamTerms))
    });
  });


});
