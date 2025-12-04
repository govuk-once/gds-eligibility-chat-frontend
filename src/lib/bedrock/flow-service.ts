import {
	InvokeFlowCommand,
	type InvokeFlowCommandInput,
	type FlowInput,
	type FlowCompletionReason,
	type FlowMultiTurnInputContent,
	type FlowOutputContent,
	type NodeType,
	type InvokeFlowCommandOutput
} from '@aws-sdk/client-bedrock-agent-runtime';
import { logger } from '../utils/logger.js';
import { bedrockClient } from './bedrock-client.js';
import { checkAgentRationaleTracePart, getInputsObject } from './helpers.js';
import { BEDROCK_FLOW_ID, BEDROCK_FLOW_ALIAS_ID } from '$env/static/private';

export type FlowResponseObject = {
	nodeName: string | undefined;
	nodeType: NodeType | undefined;
	content: FlowMultiTurnInputContent | FlowOutputContent | undefined;
	completionReason: FlowCompletionReason | undefined;
	executionId: string | undefined;
};

export const invokeFlow = async (
	message: string,
	nodeName: string,
	inputExecutionId?: string
): Promise<FlowResponseObject> => {
	const inputs: FlowInput[] = [getInputsObject(nodeName, message)];

	logger.info({ BEDROCK_FLOW_ID, BEDROCK_FLOW_ALIAS_ID }, 'Bedrock flow IDs');

	const commandInput: InvokeFlowCommandInput = {
		flowIdentifier: BEDROCK_FLOW_ID,
		flowAliasIdentifier: BEDROCK_FLOW_ALIAS_ID,
		inputs,
		enableTrace: true,
		executionId: inputExecutionId
	};

	logger.info({ inputExecutionId, inputs }, 'Invoking Bedrock flow');

	const command = new InvokeFlowCommand(commandInput);

	try {
		const response = await bedrockClient.send(command);

		if (!response.responseStream) {
			throw new Error('No responseStream returned from Bedrock flow');
		}

		return await handleFlowResponse(response);
	} catch (err) {
		logger.error(err);
		logger.error({ inputExecutionId }, 'Failure in Bedrock flow invocation');
		throw err;
	}
};

const handleFlowResponse = async (
	response: InvokeFlowCommandOutput
): Promise<FlowResponseObject> => {
	const { responseStream, executionId } = response;
	if (!responseStream) {
		throw new Error('Response stream is missing from Bedrock flow output');
	}

	let flowResponse: FlowResponseObject = {
		nodeName: undefined,
		content: undefined,
		completionReason: undefined,
		nodeType: undefined,
		executionId
	};

	logger.debug({ executionId }, 'Starting Bedrock flow response stream iteration');

	for await (const chunkEvent of responseStream) {
		const { flowOutputEvent, flowCompletionEvent, flowMultiTurnInputRequestEvent, flowTraceEvent } =
			chunkEvent;

		if (flowTraceEvent) {
			checkAgentRationaleTracePart(flowTraceEvent, executionId);
		} else if (flowOutputEvent) {
			logger.debug({ executionId, flowOutputEvent }, 'FlowOutputEvent');
			flowResponse = { ...flowResponse, ...flowOutputEvent };
		} else if (flowMultiTurnInputRequestEvent) {
			logger.debug(
				{ executionId, flowMultiTurnInputRequestEvent },
				'FlowMultiTurnInputRequestEvent'
			);
			flowResponse = { ...flowResponse, ...flowMultiTurnInputRequestEvent };
		} else if (flowCompletionEvent) {
			logger.debug({ executionId, flowCompletionEvent }, 'FlowCompletionEvent');
			flowResponse = { ...flowResponse, ...flowCompletionEvent };
		}
	}

	logger.debug({ executionId }, 'Completed Bedrock flow response stream iteration');
	logger.debug({ flowResponse }, 'FlowResponse object returned');
	return flowResponse;
};
