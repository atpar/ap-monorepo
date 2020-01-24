import Web3 from 'web3';

import { AP, Template, APTypes, Utils } from '../src';
import { getDefaultTerms } from './utils';


describe('Template', (): void => {

  let web3: Web3;
  let account: string;
  let ap: AP;
  let extendedTemplateTerms: APTypes.ExtendedTemplateTerms;
  let registeredTemplateId: string;


  beforeAll(async (): Promise<void> => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    account = (await web3.eth.getAccounts())[0];
    extendedTemplateTerms = Utils.conversion.deriveExtendedTemplateTermsFromTerms(await getDefaultTerms());

    ap = await AP.init(web3, account);
  });

  it('should register a new template', async (): Promise<void> => {
    const template = await Template.create(ap, extendedTemplateTerms);
    const storedTemplateTerms = await template.getTemplateTerms();
    registeredTemplateId = template.templateId;

    expect(template instanceof Template).toBe(true);
    expect(
      ap.utils.conversion.web3ResponseToTemplateTerms(storedTemplateTerms)
    ).toEqual(ap.utils.conversion.deriveTemplateTermsFromExtendedTemplateTerms(extendedTemplateTerms));
  });

  it('should load a registered template by templateId', async (): Promise<void> => {
    const template = await Template.load(ap, registeredTemplateId);
    const storedTemplateTerms = await template.getTemplateTerms();

    expect(template instanceof Template).toBe(true);
    expect(
      ap.utils.conversion.web3ResponseToTemplateTerms(storedTemplateTerms)
    ).toEqual(ap.utils.conversion.deriveTemplateTermsFromExtendedTemplateTerms(extendedTemplateTerms));
  });

  it('should load a registered template by terms', async (): Promise<void> => {
    const template = await Template.loadFromExtendedTemplateTerms(ap, extendedTemplateTerms);
    const storedTemplateTerms = await template.getTemplateTerms();

    expect(template instanceof Template).toBe(true);
    expect(
      ap.utils.conversion.web3ResponseToTemplateTerms(storedTemplateTerms)
    ).toEqual(ap.utils.conversion.deriveTemplateTermsFromExtendedTemplateTerms(extendedTemplateTerms));
  });
});
