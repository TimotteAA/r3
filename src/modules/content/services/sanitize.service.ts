import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import merge from 'deepmerge';

@Injectable()
export class SanitizeService {
    private config: sanitizeHtml.IOptions = {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'img'],
        allowedAttributes: {
            a: ['href'],
        },
        allowedIframeHostnames: ['www.youtube.com'],
    };

    sanitize(body: string, options?: sanitizeHtml.IOptions) {
        return sanitizeHtml(body, merge(this.config, options ?? {}, { arrayMerge: (_d, _s, _o) => _s }));
    }
}
