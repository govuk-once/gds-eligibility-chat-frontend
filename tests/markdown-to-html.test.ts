import { describe, it, expect, vi } from 'vitest';
import { markdownToHtml } from '../src/lib/utils/markdown-to-html';

describe('markdownToHtml', () => {
	it('should convert markdown to HTML and sanitize using DOMPurify on the client-side', async () => {
		vi.stubGlobal('window', {});

		const markdown = '# Hello, World!\n\n<script>alert("xss")</script>Plain text.';
		// DOMPurify removes script tags, but keeps 'id' attributes from showdown headers.
		// There's also an extra newline observed in this specific case.
		const expectedHtml = '<h1 id="helloworld">Hello, World!</h1>\n\n<p>Plain text.</p>';

		const result = await markdownToHtml(markdown);
		expect(result).toBe(expectedHtml);

		vi.unstubAllGlobals();
	});

	it('should convert markdown to HTML and sanitize using sanitize-html on the server-side', async () => {
		vi.stubGlobal('window', undefined);

		const markdown = '# Hello, Server!\n\n<img src="x" onerror="alert(\'xss\')">Normal text.';
		// sanitize-html, by default, removes script tags, onerror attributes, img tags, and 'id' attributes from showdown headers
		const expectedHtml = '<h1>Hello, Server!</h1>\n<p>Normal text.</p>';

		const result = await markdownToHtml(markdown);
		expect(result).toBe(expectedHtml);

		vi.unstubAllGlobals();
	});

	it('should convert simple markdown correctly', async () => {
		// Test without specific environment mocking, assuming default JSDOM which has window, thus DOMPurify will be used.
		// DOMPurify will keep the default 'id' attributes from showdown headers.
		const markdown = '## A subtitle\n\n- Item 1\n- Item 2';
		const expectedHtml =
			'<h2 id="asubtitle">A subtitle</h2>\n<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>';
		const result = await markdownToHtml(markdown);
		expect(result).toBe(expectedHtml);
	});
});
