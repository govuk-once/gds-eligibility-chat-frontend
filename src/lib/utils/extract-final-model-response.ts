import type { Event } from '@google/adk'

export function extractFinalModelResponse(resData: Event[]): string {
	if (!Array.isArray(resData)) return '';

	for (let i = resData.length - 1; i >= 0; i--) {
		const event = resData[i];

		if (
			event.content?.role === 'model' &&
			Array.isArray(event.content.parts)
		) {
			const visibleText = event.content.parts
				.filter(
					part =>
						part.text &&
						!part.thought &&     
						!part.functionCall
				)
				.map(part => part.text)
				.join('');

			if (visibleText.trim()) {
				return visibleText;
			}
		}
	}

	return '';
}