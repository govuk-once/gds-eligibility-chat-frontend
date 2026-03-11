import type { Message } from '$lib/types';
import { chatState } from './chat.svelte';

export const authState = $state({
	inSignInJourney: false,
	showSignInForm: false,
	signedIn: false
});

export function resetAuthState() {
	authState.inSignInJourney = false;
	authState.showSignInForm = false;
	authState.signedIn = false;
}

export const authJourney = {
	/**
	 * Intercepts response from agent to handle sign-in journey logic.
	 * Returns (potentially modified) content and reply type.
	 */
	interceptResponse(replyType: Message['reply_type'], content: string) {
		let contentToDisplay = content;
		let finalReplyType: Message['reply_type'] = replyType || 'free_text';

		if (finalReplyType === 'sign_in') {
			if (authState.inSignInJourney) {
				// Force show form and override agent content
				authState.showSignInForm = true;
				contentToDisplay = 'OK let me know your **username** and **password**.';
			} else {
				// First time seeing prompt
				authState.inSignInJourney = true;
			}
		} else {
			// Any other response exits the journey
			authState.inSignInJourney = false;
		}

		return { contentToDisplay, finalReplyType };
	},

	/**
	 * Handles transition from the "Yes" selection to showing the sign-in form.
	 */
	async handleSignInYes() {
		// Add user message to history
		chatState.messages = [
			...chatState.messages,
			{
				id: crypto.randomUUID(),
				role: 'user',
				text: 'Yes'
			}
		];

		chatState.loading = true;

		// Simulated 'thinking' delay for transition
		await new Promise((resolve) => setTimeout(resolve, 1000));

		chatState.messages = [
			...chatState.messages,
			{
				id: 'sign-in-transition',
				role: 'assistant',
				html: '<p>OK let me know your <b>username</b> and <b>password</b>.</p>',
				reply_type: 'sign_in',
				source: 'user_agent'
			}
		];

		chatState.loading = false;
		authState.showSignInForm = true;
		chatState.pendingActionPayload = undefined;
		chatState.input = '';
	},

	/**
	 * Finalizes sign-in journey after form submission.
	 * Returns message to be sent to the agent (the session ID).
	 */
	async completeSignIn() {
		// Remove transition assistant message by its stable ID
		chatState.messages = chatState.messages.filter((m) => m.id !== 'sign-in-transition');

		authState.signedIn = true;
		authState.inSignInJourney = false;
		authState.showSignInForm = false;

		// Reset related chat state
		chatState.activeActions = [];
		chatState.pendingActionPayload = undefined;
		chatState.input = '';

		// Requirement: message sent should be the session ID
		return chatState.sessionId || '';
	}
};
