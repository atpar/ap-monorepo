import { TemplateTerms, ExtendedTemplateTerms, isExtendedTemplateTerms } from './types';

import { AP } from './index';


export class Template {

  private ap: AP;
  public templateId: string;

  private constructor(ap: AP, templateId: string) {
    this.ap = ap;
    this.templateId = templateId;
  }

  public async getTemplateTerms(): Promise<TemplateTerms> {
    return this.ap.contracts.templateRegistry.methods.getTemplateTerms(this.templateId).call();
  }

  public async getTemplateSchedule(): Promise<string[]> {
    const schedule = [];

    // try to use convenience method first
    try {
      schedule.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(this.templateId).call()));
    } catch (error) {
      const scheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(this.templateId).call()
      for (let i = 0; i < Number(scheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(this.templateId, i).call());
      }
    }

    return this.ap.utils.schedule.sortEvents(this.ap.utils.schedule.removeNullEvents(schedule));
  }

  /**
   * Creates and registers a new Template from a provided Terms object and returns a new Template instance
   * @param {AP} ap AP instance
   * @param {Terms} terms ACTUS terms object
   * @returns {Promise<Template>} Promise yielding an instance of Template
   */
  public static async create (
    ap: AP,
    extendedTemplateTerms: ExtendedTemplateTerms
  ): Promise<Template> {
    if (!isExtendedTemplateTerms(extendedTemplateTerms)) {
      throw new Error('Malformed extendedTemplateTerms provided.');
    }

    const engine = ap.contracts.engine(extendedTemplateTerms.contractType);
    const templateTerms = ap.utils.conversion.deriveTemplateTermsFromExtendedTemplateTerms(extendedTemplateTerms);
    const templateSchedule = await ap.utils.schedule.computeTemplateScheduleFromExtendedTemplateTerms(engine, extendedTemplateTerms);

    const tx = await ap.contracts.templateRegistry.methods.registerTemplate(
      templateTerms,
      templateSchedule
    ).send({ from: ap.signer.account, gas: 2000000 });

    const templateId = tx.events.RegisteredTemplate.returnValues.templateId;

    return new Template(ap, templateId);
  }

  /**
   * Loads an already registered template and returns a new Template instance from a provided TemplateId.
   * @param {AP} ap AP instance
   * @param {string} templateId id of the template to instantiate
   * @returns {Promise<Template>} Promise yielding an instance of Template
   */
  public static async load (
    ap: AP,
    templateId: string
  ): Promise<Template> {
    return new Template(ap, templateId);
  }

  /**
   * Loads an already registered template and returns a new Template instance from a provided Terms object.
   * @param {AP} ap AP instance
   * @param {ExtendedTemplateTerms} extendedTemplateTerms extended template terms object
   * @returns {Promise<Template>} Promise yielding an instance of Template
   */
  public static async loadFromExtendedTemplateTerms (
    ap: AP,
    extendedTemplateTerms: ExtendedTemplateTerms
  ): Promise<Template> {
    if (!isExtendedTemplateTerms(extendedTemplateTerms)) {
      throw new Error('Malformed extendedTemplateTerms provided.');
    }

    const engine = ap.contracts.engine(extendedTemplateTerms.contractType);
    const templateTerms = ap.utils.conversion.deriveTemplateTermsFromExtendedTemplateTerms(extendedTemplateTerms);
    const templateSchedule = await ap.utils.schedule.computeTemplateScheduleFromExtendedTemplateTerms(engine, extendedTemplateTerms);

    const templateId = ap.utils.erc712.deriveTemplateId(templateTerms, templateSchedule);
    const registeredTemplateEvents = await ap.contracts.templateRegistry.getPastEvents('RegisteredTemplate', { filter: { templateId }});

    if (registeredTemplateEvents.length === 0) {
      throw new Error('No template found for provided terms.'); 
    }

    return new Template(ap, templateId);
  }
}
