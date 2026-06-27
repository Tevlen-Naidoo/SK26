import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { CITY_THEME } from '../data/cities.js';
import type { City } from '../types.js';

type RGB = [number, number, number];

interface Petal {
  x: number;
  y: number;
  size: number;
  rot: number;
  vrot: number;
  vy: number;
  sway: number;
  phase: number;
  alpha: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRGB = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

const PAPER_LIGHT: RGB = [247, 243, 236];
const PAPER_DARK: RGB = [18, 17, 22];

/**
 * Background surface: a soft vertical gradient tinted by the current city (smooth, no
 * ridges) with drifting petals on top. Tint + base colour adapt to light/dark scheme.
 */
@customElement('sk-canvas-bg')
export class SkCanvasBg extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  @property() city: City | 'none' = 'seoul';
  @query('canvas') private canvas!: HTMLCanvasElement;

  private ctx!: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private petals: Petal[] = [];
  private curPetal: RGB = [248, 200, 216];
  private tgtPetal: RGB = [248, 200, 216];
  private curAccent: RGB = [0, 71, 160];
  private tgtAccent: RGB = [0, 71, 160];

  private get reduced(): boolean {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  private get dark(): boolean {
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private onResize = () => this.resize();
  private onVisibility = () => {
    if (document.hidden) this.stop();
    else if (!this.reduced) this.start();
  };

  override firstUpdated(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.applyTheme(this.city, true);
    this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    if (this.reduced) this.draw();
    else this.start();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has('city')) this.applyTheme(this.city);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stop();
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private applyTheme(city: City | 'none', immediate = false): void {
    const theme = city === 'none' ? CITY_THEME.seoul : CITY_THEME[city];
    this.tgtPetal = [...theme.petal];
    this.tgtAccent = [...theme.ridge];
    if (immediate) {
      this.curPetal = [...this.tgtPetal];
      this.curAccent = [...this.tgtAccent];
    }
  }

  private resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seed();
    if (this.reduced) this.draw();
  }

  private seed(): void {
    const count = Math.max(16, Math.min(34, Math.round((this.w * this.h) / 52000)));
    this.petals = Array.from({ length: count }, () => this.makePetal(true));
  }

  private makePetal(spread: boolean): Petal {
    return {
      x: Math.random() * this.w,
      y: spread ? Math.random() * this.h : -12,
      size: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.02,
      vy: 0.22 + Math.random() * 0.5,
      sway: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.16 + Math.random() * 0.3,
    };
  }

  private start(): void {
    if (this.raf) return;
    const loop = () => {
      this.step();
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private step(): void {
    this.curPetal = lerpRGB(this.curPetal, this.tgtPetal, 0.02);
    this.curAccent = lerpRGB(this.curAccent, this.tgtAccent, 0.02);
    for (const p of this.petals) {
      p.y += p.vy;
      p.phase += 0.01;
      p.x += Math.sin(p.phase) * p.sway * 0.4;
      p.rot += p.vrot;
      if (p.y > this.h + 14) Object.assign(p, this.makePetal(false));
      if (p.x < -14) p.x = this.w + 14;
      if (p.x > this.w + 14) p.x = -14;
    }
  }

  private draw(): void {
    const { ctx, w, h } = this;
    if (!ctx) return;
    const dark = this.dark;
    const base = dark ? PAPER_DARK : PAPER_LIGHT;
    const acc = this.curAccent;
    const mix = (k: number) =>
      `rgb(${Math.round(lerp(base[0], acc[0], k))}, ${Math.round(
        lerp(base[1], acc[1], k),
      )}, ${Math.round(lerp(base[2], acc[2], k))})`;

    // smooth tinted gradient (stronger toward the bottom)
    const grad = ctx.createLinearGradient(0, 0, w * 0.25, h);
    grad.addColorStop(0, mix(dark ? 0.06 : 0.03));
    grad.addColorStop(0.55, mix(dark ? 0.2 : 0.1));
    grad.addColorStop(1, mix(dark ? 0.42 : 0.2));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // petals
    const [pr, pg, pb] = this.curPetal.map(Math.round);
    for (const p of this.petals) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${p.alpha})`;
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, -s / 2);
      ctx.quadraticCurveTo(s / 2, 0, 0, s / 2);
      ctx.quadraticCurveTo(-s / 2, 0, 0, -s / 2);
      ctx.fill();
      ctx.restore();
    }
  }

  override render() {
    return html`<canvas aria-hidden="true"></canvas>`;
  }
}
