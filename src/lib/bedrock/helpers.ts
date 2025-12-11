import type { FlowInput, FlowTraceEvent } from '@aws-sdk/client-bedrock-agent-runtime';
import { logger } from '../utils/logger.js';

export function getInputsObject(nodeName: string, message: string): FlowInput {
	const baseInput = {
		nodeName,
		content: { document: message }
	};

	//FlowInputNode requires nodeOutputName to be set
	if (nodeName === 'FlowInputNode') {
		return {
			...baseInput,
			nodeOutputName: 'document'
		};
	}

	//Agent node requires nodeInputName to be set
	return {
		...baseInput,
		nodeInputName: 'agentInputText'
	};
}

export function checkAgentRationaleTracePart(
	flowTraceEvent: FlowTraceEvent,
	executionId: string | undefined
) {
	const rationaleTracePart =
		flowTraceEvent.trace?.nodeDependencyTrace?.traceElements?.agentTraces?.filter(
			(tracePart) => tracePart.trace?.orchestrationTrace?.rationale
		);
	if (rationaleTracePart) {
		logger.debug(
			{
				executionId,
				rationaleTracePart
			},
			'Bedrock flow trace event: agent rationale trace part'
		);
	}
}
