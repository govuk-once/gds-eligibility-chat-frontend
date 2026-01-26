import type { Event } from '@google/adk';
import type { Action } from '$lib/types';

export type ElicitationResponse = {
	content: string;
	source?: 'user_agent' | 'benefit_agent';
	reply_type?: 'yes_no' | 'choice_multiple' | 'choice_single' | 'free_text' | 'none';
	actions?: Action[];
};

export function extractFinalModelResponse(resData: Event[]): ElicitationResponse {
	if (!Array.isArray(resData)) return { content: 'There has been an error. Please try again.' };

	// Loop backwards to get the most recent emit_elicitation_response
	for (let i = resData.length - 1; i >= 0; i--) {
		const event = resData[i];
		if (!event?.content?.parts) continue;

		for (const part of event.content.parts) {
			const funcResp = part.functionResponse;
			if (
				funcResp &&
				funcResp.name === 'emit_elicitation_response' &&
				funcResp.response &&
				typeof funcResp.response === 'object'
			) {
				const r = funcResp.response as {
					content?: string;
					source?: string;
					reply_type?: string;
					actions?: any[];
				};

				// Narrow source to allowed union
				const source: 'user_agent' | 'benefit_agent' =
					r.source === 'benefit_agent' ? 'benefit_agent' : 'user_agent';

				// Narrow reply_type to allowed union
				const reply_type: ElicitationResponse['reply_type'] =
					r.reply_type === 'yes_no' ||
					r.reply_type === 'choice_multiple' ||
					r.reply_type === 'choice_single' ||
					r.reply_type === 'free_text' ||
					r.reply_type === 'none'
						? r.reply_type
						: 'none';

				// Ensure actions are well-formed
				const actions: Action[] = Array.isArray(r.actions)
					? r.actions
							.filter((a) => a && typeof a.label === 'string' && typeof a.payload === 'string')
							.map((a) => ({ label: a.label, payload: a.payload }))
					: [];

				return {
					content: r.content ?? '',
					source,
					reply_type,
					actions
				};
			}
		}
	}

	return { content: 'There has been an error. Please try again.' };
}
