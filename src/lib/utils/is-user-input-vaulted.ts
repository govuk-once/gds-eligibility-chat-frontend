import type { Message } from '$lib/types';

export function isUserInputVaulted(message: Message | undefined): boolean {
	return message?.source === 'benefit_agent' && message.reply_type !== 'free_text';
}
