import { css } from 'lit';

/** Shared resets + helpers imported by every component (shadow DOM scoped). */
export const sharedStyles = css`
  :host {
    box-sizing: border-box;
    font-family: var(--font-body);
    color: var(--ink);
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-display);
    line-height: 1.2;
    margin: 0;
  }
  p {
    margin: 0;
  }
  a {
    color: var(--city-accent);
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }
  a:hover {
    text-decoration-thickness: 2px;
  }
  ul,
  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  small {
    font-size: var(--step--1);
    color: var(--ink-soft);
  }
  i {
    font-style: normal;
    font-variant-emoji: emoji;
  }
  button {
    font: inherit;
    cursor: pointer;
  }
  :focus-visible {
    outline: 3px solid var(--city-accent);
    outline-offset: 2px;
    border-radius: 4px;
  }
  [lang='ko'] {
    font-family: var(--font-display);
  }
  .ko {
    color: var(--gold);
    letter-spacing: 0.04em;
  }
`;
