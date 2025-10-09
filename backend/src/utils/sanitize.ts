// backend/src/utils/sanitize.ts

import * as sanitizeHtml from 'sanitize-html';
import { StepStateDto } from 'src/campaign/dto/campaign-step-state.dto';
import { decode } from 'he';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // return sanitizeHtml(html, htmlPolicy);
  return html;
}

export function sanitizePlainText(s: string): string {
  return sanitizeHtml(s ?? '', {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function sanitizeStepStateForStorage(input: StepStateDto): StepStateDto {
  if (!input?.commonTemplate) return input;
  return {
    ...input,
    commonTemplate: {
      ...input.commonTemplate,
      preheader: sanitizePlainText(input.commonTemplate.preheader), // <-- new
      html: input.commonTemplate.html,
    },
  };
}

export interface ExtractedHtml {
  subject: string;
  preheader: string;
  html: string;
}

export function extractUploadedHtml(uploadedHtml: string): ExtractedHtml {
  let raw = (uploadedHtml ?? '').trim();

  // Detect Cocoa wrapper (escaped HTML inside <p> wrappers)
  const looksEscaped =
    raw.includes('&lt;!DOCTYPE') || raw.includes('Cocoa HTML Writer');

  if (looksEscaped) {
    // Strip wrappers
    raw = raw.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
    raw = raw.replace(/<span[^>]*>.*?<\/span>/g, ' '); // remove Apple-converted-space

    // 🔑 Decode entities into real HTML
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    raw = decode(raw);
  }

  // 1. Extract Subject
  const subjectMatch = raw.match(/<!--\s*subject:\s*([\s\S]*?)\s*-->/i);
  const subject = subjectMatch?.[1].trim() ?? '';

  // 2. Extract Preheader (prefer <div.preheader>)
  const preheaderDiv = raw.match(
    /<div[^>]*class=["']preheader["'][^>]*>(.*?)<\/div>/i,
  );
  const preheaderComment = raw.match(/<!--\s*preheader:\s*([\s\S]*?)\s*-->/i);
  const preheader =
    preheaderDiv?.[1].trim() ?? preheaderComment?.[1].trim() ?? '';

  // 3. Remove subject/preheader comments so they don’t show up
  const cleaned = raw
    .replace(/<!--\s*subject:[\s\S]*?-->\s*/i, '')
    .replace(/<!--\s*preheader:[\s\S]*?-->\s*/i, '')
    .trim();

  return {
    subject,
    preheader,
    html: sanitizeEmailHtml(cleaned),
  };
}
