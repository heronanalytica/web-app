// backend/src/utils/sanitize.ts

import * as sanitizeHtml from 'sanitize-html';
import { StepStateDto } from 'src/campaign/dto/campaign-step-state.dto';

const htmlPolicy: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'doctype',
    'html',
    'body',
    'head',
    'meta',
    'title',
    'img',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'br',
    'strong',
    'em',
    'span',
    'div',
    'button',
  ]),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt'],
    '*': ['style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'cid', 'data'],
  allowedStyles: {
    '*': {
      color: [/^.+$/],
      'background-color': [/^.+$/],
      'font-size': [/^.+$/],
      'font-weight': [/^.+$/],
      'text-align': [/^left|right|center|justify$/],
      'line-height': [/^.+$/],
      padding: [/^.+$/],
      margin: [/^.+$/],
      border: [/^.+$/],
      'border-radius': [/^.+$/],
      // Optional: allow background-image with safe URL schemes
      'background-image': [/^url\((?!['"]?javascript:).*\)$/i],
    },
  },
  disallowedTagsMode: 'discard',
};

// Reusable single-field helper
export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, htmlPolicy);
}

export function sanitizeStepStateForStorage(input: StepStateDto): StepStateDto {
  if (!input?.commonTemplate?.html) return input;
  return {
    ...input,
    commonTemplate: {
      ...input.commonTemplate,
      html: sanitizeEmailHtml(input.commonTemplate.html),
    },
  };
}
