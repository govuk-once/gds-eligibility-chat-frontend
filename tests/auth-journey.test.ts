import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authJourney, authState, resetAuthState } from '../src/lib/auth-journey.svelte';

vi.mock('../src/lib/chat.svelte', () => ({
	chatState: {
		messages: [],
		loading: false,
		sessionId: 'test-session-id',
		activeActions: [],
		pendingActionPayload: undefined,
		input: ''
	},
	postMessageAndHandleResponse: vi.fn()
}));

import { chatState } from '../src/lib/chat.svelte';

describe('authJourney', () => {
	beforeEach(() => {
		resetAuthState();
		chatState.messages = [];
		chatState.loading = false;
		chatState.sessionId = 'test-session-id';
		chatState.activeActions = [{ label: 'Action 1', payload: 'p1' }];
		chatState.pendingActionPayload = 'some-payload';
		chatState.input = 'some input';
	});

	describe('interceptResponse', () => {
		it('should start the journey when receiving sign_in for the first time', () => {
			const { contentToDisplay, finalReplyType } = authJourney.interceptResponse(
				'sign_in',
				'Initial prompt'
			);

			expect(authState.inSignInJourney).toBe(true);
			expect(authState.showSignInForm).toBe(false);
			expect(contentToDisplay).toBe('Initial prompt');
			expect(finalReplyType).toBe('sign_in');
		});

		it('should force show form and override content on re-prompt during journey', () => {
			// Pre-condition: already in journey
			authState.inSignInJourney = true;

			const { contentToDisplay, finalReplyType } = authJourney.interceptResponse(
				'sign_in',
				'Re-prompt content'
			);

			expect(authState.showSignInForm).toBe(true);
			expect(contentToDisplay).toBe('OK let me know your **username** and **password**.');
			expect(finalReplyType).toBe('sign_in');
		});

		it('should handle application_form and set title', () => {
			const { contentToDisplay, finalReplyType } = authJourney.interceptResponse(
				'application_form',
				'Test Application Title'
			);

			expect(authState.showApplicationFormOverlay).toBe(true);
			expect(authState.applicationFormTitle).toBe('Test Application Title');
			expect(authState.inSignInJourney).toBe(false);
			expect(contentToDisplay).toBe('Test Application Title');
			expect(finalReplyType).toBe('application_form');
		});

		it('should exit journey if response is not sign_in', () => {
			authState.inSignInJourney = true;

			authJourney.interceptResponse('free_text', 'Some other message');

			expect(authState.inSignInJourney).toBe(false);
		});
	});

	describe('handleSignInYes', () => {
		it('should add "Yes" message and transition to form after delay', async () => {
			vi.useFakeTimers();

			const promise = authJourney.handleSignInYes();

			// Should have added user message
			expect(chatState.messages).toHaveLength(1);
			expect(chatState.messages[0]).toMatchObject({ role: 'user', text: 'Yes' });
			expect(chatState.loading).toBe(true);

			// Fast-forward 1s
			await vi.runAllTimersAsync();
			await promise;

			expect(chatState.loading).toBe(false);
			expect(authState.showSignInForm).toBe(true);
			expect(chatState.messages).toHaveLength(2);
			expect(chatState.messages[1].id).toBe('sign-in-transition');
			expect(chatState.messages[1].reply_type).toBe('sign_in');
			expect(chatState.messages[1].source).toBe('user_agent');

			vi.useRealTimers();
		});
	});

	describe('resetAuthState', () => {
		it('should reset all authState values to default', () => {
			authState.inSignInJourney = true;
			authState.showSignInForm = true;
			authState.signedIn = true;
			authState.notepadClicked = true;
			authState.showApplicationFormOverlay = true;
			authState.applicationFormTitle = 'Some Title';

			resetAuthState();

			expect(authState.inSignInJourney).toBe(false);
			expect(authState.showSignInForm).toBe(false);
			expect(authState.signedIn).toBe(false);
			expect(authState.notepadClicked).toBe(false);
			expect(authState.showApplicationFormOverlay).toBe(false);
			expect(authState.applicationFormTitle).toBe('');
		});
	});

	describe('notepadClicked transitions', () => {
		it('should allow setting notepadClicked to true and then false', () => {
			expect(authState.notepadClicked).toBe(false);
			authState.notepadClicked = true;
			expect(authState.notepadClicked).toBe(true);
			authState.notepadClicked = false;
			expect(authState.notepadClicked).toBe(false);
		});
	});
});
