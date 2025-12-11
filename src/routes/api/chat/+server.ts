import { json, type RequestHandler } from '@sveltejs/kit';
import { invokeFlow } from '$lib/bedrock/flow-service.js';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const userMessage = data.message;
	const executionId = data.executionId;
	const nodeName = data.nodeName || 'FlowInputNode';

	// Call Bedrock flow
	const flowResponse = await invokeFlow(userMessage, nodeName, executionId);

	return json(flowResponse);
};
