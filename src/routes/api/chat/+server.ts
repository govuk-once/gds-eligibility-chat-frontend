import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const userMessage = data.message;

	// sanity check: echo the message
	const reply = `You said: ${userMessage}`;

	return new Response(JSON.stringify({ reply }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
