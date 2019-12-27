import Web3 from 'web3';

import { AP, Template, APTypes } from '../src';
import { getDefaultTerms } from './utils';


describe('Template', (): void => {

  let web3: Web3;
  let account: string;
  let ap: AP;
  let terms: APTypes.Terms;
  let registeredTemplateId: string;


  beforeAll(async (): Promise<void> => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    account = (await web3.eth.getAccounts())[0];
    terms = await getDefaultTerms();

    ap = await AP.init(web3, account);
  });

  it('should register a new template', async (): Promise<void> => {
    const template = await Template.create(ap, terms);
    const storedTemplateTerms = await template.getTemplateTerms();
    registeredTemplateId = template.templateId;

    expect(template instanceof Template).toBe(true);
    expect(
      ap.utils.convert.web3ResponseToTemplateTerms(storedTemplateTerms)
    ).toEqual(ap.utils.convert.deriveTemplateTerms(terms));
  });

  it('should load a registered template by templateId', async (): Promise<void> => {
    const template = await Template.load(ap, registeredTemplateId);
    const storedTemplateTerms = await template.getTemplateTerms();

    expect(template instanceof Template).toBe(true);
    expect(
      ap.utils.convert.web3ResponseToTemplateTerms(storedTemplateTerms)
    ).toEqual(ap.utils.convert.deriveTemplateTerms(terms));
  });

  it('should load a registered template by terms', async (): Promise<void> => {
    const template = await Template.loadFromTerms(ap, terms);
    const storedTemplateTerms = await template.getTemplateTerms();

    expect(template instanceof Template).toBe(true);
    expect(
      ap.utils.convert.web3ResponseToTemplateTerms(storedTemplateTerms)
    ).toEqual(ap.utils.convert.deriveTemplateTerms(terms));
  });
});
