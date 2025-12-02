import { json, type RequestHandler } from '@sveltejs/kit';
import { invokeFlow } from '$lib/bedrock/flow-service.js';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const userMessage = data.message;

	// Call Bedrock flow
	const flowResponse = await invokeFlow(userMessage, 'FlowInputNode');

	return json(flowResponse);
};
