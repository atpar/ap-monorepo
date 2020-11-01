/* eslint-disable @typescript-eslint/no-var-requires */
const definitions = require("../definitions/dictionary.json");


module.exports = {
  getEnumIndexForEventType,
  getEnumIndexForAcronym,
};

function getEnumIndexForEventType(acronym) {
  return getEnumIndexForAcronym('EventType', acronym)
}

function getEnumIndexForAcronym (identifier = '', acronym = '') {
  if (definitions[identifier] == undefined) {
    throw new Error(
      `Could not derive enum index for acronym '${acronym}' for attribute '${identifier}'. Unknown attribute provided.`
    );
  }

  if (definitions[identifier].allowedValues == undefined) {
    throw new Error(
      `Could not derive enum index for acronym '${acronym}' for attribute '${identifier}'. Malformed Dictionary.`
    );
  }

  if (definitions[identifier].allowedValues[acronym] == undefined) {
    throw new Error(
      `Could not derive enum index for acronym '${acronym}' for attribute '${identifier}'. Unknown acronym provided.`
    );
  }

  return definitions[identifier].allowedValues[acronym];
}
