import type { Event } from '@google/adk';
import type { Action } from '$lib/types';

export type ElicitationResponse = {
	content: string;
	actions?: Action[];
};

export function extractFinalModelResponse(resData: Event[]): ElicitationResponse {
	if (!Array.isArray(resData)) return { content: '' };

	for (let i = resData.length - 1; i >= 0; i--) {
		const event = resData[i];

		if (event.content?.role === 'model' && Array.isArray(event.content.parts)) {
			const visibleText = event.content.parts
				.filter((part) => part.text && !part.thought && !part.functionCall)
				.map((part) => part.text)
				.join('');

			if (visibleText.trim()) {
				// Try to find json in markdown code block
				const mdJsonMatch = visibleText.match(/```(json)?\s*([\s\S]+?)\s*```/);
				let jsonText = visibleText;
				if (mdJsonMatch && mdJsonMatch[2]) {
					jsonText = mdJsonMatch[2];
				}

				try {
					const parsed = JSON.parse(jsonText);
					// Check if it's the object structure we expect
					if (typeof parsed === 'object' && parsed !== null && 'content' in parsed) {
						return {
							content: parsed.content,
							actions: parsed.actions || []
						};
					}
				} catch {
					// Not a JSON object, so it's just plain text content - not ideal, fix later
				}
				// If it's not JSON or doesn't match the structure, treat the whole thing as content.
				return { content: visibleText };
			}
		}
	}

	return { content: '' };
}