import type { ElicitationResponse } from "./extract-final-model-response";

//We currently have no component for handling a multiple choice
//user agent elicitation response - this throwaway function parses the actions into a string

export function parseUserAgentMultipleChoice(data: ElicitationResponse) {
  const labels = (data.actions ?? []).map(action => action.label);
  return `${data.content} ${labels.join(", ")}.`;
}