import showdown from 'showdown';
import DOMPurify from 'dompurify';

const converter = new showdown.Converter();

export async function markdownToHtml(markdown: string): Promise<string> {
	const unsafeHtml = converter.makeHtml(markdown);
	// We need to check if we are in the browser before using DOMPurify

	if (typeof window !== 'undefined') {
		return DOMPurify.sanitize(unsafeHtml);
	}
	// Server
	const sanitizeHtml = (await import('sanitize-html')).default;
	return sanitizeHtml(unsafeHtml);
}
