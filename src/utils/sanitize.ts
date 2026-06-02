import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string =>
    DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

export const sanitizeHtmlNoImages = (html: string): string =>
    DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['img'],
    });