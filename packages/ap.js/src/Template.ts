import {
  Terms,
  TemplateTerms,
  NON_CYLIC_SCHEDULE_ID,
  IP_SCHEDULE_ID,
  SC_SCHEDULE_ID,
  PR_SCHEDULE_ID,
  RR_SCHEDULE_ID,
  PY_SCHEDULE_ID
} from './types';

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
      const events = [];
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(this.templateId, NON_CYLIC_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(this.templateId, IP_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(this.templateId, PR_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(this.templateId, SC_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(this.templateId, RR_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(this.templateId, PY_SCHEDULE_ID).call()));
      schedule.push(...events);
    } catch (error) {
      const nonCyclicScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        this.templateId, NON_CYLIC_SCHEDULE_ID
      ).call()
      const ipScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        this.templateId, IP_SCHEDULE_ID
      ).call();
      const prScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        this.templateId, PR_SCHEDULE_ID
      ).call();
      const scScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        this.templateId,
        SC_SCHEDULE_ID
      ).call();
      const rrScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        this.templateId, RR_SCHEDULE_ID
      ).call();
      const pyScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        this.templateId, PY_SCHEDULE_ID
      ).call();
    
      for (let i = 0; i < Number(nonCyclicScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(this.templateId, NON_CYLIC_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(ipScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(this.templateId, IP_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(prScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(this.templateId, PR_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(scScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(this.templateId, SC_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(rrScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(this.templateId, RR_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(pyScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(this.templateId, PY_SCHEDULE_ID, i).call());
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
    terms: Terms
  ): Promise<Template> {
    const templateTerms = ap.utils.convert.deriveTemplateTerms(terms);
    const generatingTerms = ap.utils.convert.deriveGeneratingTerms(terms);
    const templateSchedules = {
      nonCyclicSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate).call(),
      cyclicIPSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 8).call(),
      cyclicPRSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 15).call(),
      cyclicSCSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 19).call(),
      cyclicRRSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 18).call(),
      cyclicFPSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 4).call(),
      cyclicPYSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 11).call(),
    };
    const templateId = ap.utils.erc712.deriveTemplateId(templateTerms, templateSchedules);

    await ap.contracts.templateRegistry.methods.registerTemplate(
      templateTerms,
      templateSchedules
    ).send({ from: ap.signer.account, gas: 2000000 });

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
   * @param {Terms} terms ACTUS terms object
   * @returns {Promise<Template>} Promise yielding an instance of Template
   */
  public static async loadFromTerms (
    ap: AP,
    terms: Terms
  ): Promise<Template> {
    const templateTerms = ap.utils.convert.deriveTemplateTerms(terms);
    const generatingTerms = ap.utils.convert.deriveGeneratingTerms(terms);
    const templateSchedules = {
      nonCyclicSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate).call(),
      cyclicIPSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8).call(),
      cyclicPRSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15).call(),
      cyclicSCSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19).call(),
      cyclicRRSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18).call(),
      cyclicFPSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4).call(),
      cyclicPYSchedule: await ap.contracts.engine(String(terms.contractType)).methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11).call(),
    };
    const templateId = ap.utils.erc712.deriveTemplateId(templateTerms, templateSchedules);
    const registeredTemplateEvents = await ap.contracts.templateRegistry.getPastEvents('RegisteredTemplate', { filter: { templateId }});

    if (registeredTemplateEvents.length === 0) {
      throw new Error('INITIALIZATION_ERROR: No template found for provided terms.'); 
    }

    return new Template(ap, templateId);
  }
}
