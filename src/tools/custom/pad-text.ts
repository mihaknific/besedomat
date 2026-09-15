/**
 * SENIOR PRIMER: PadText
 * Prej: 61 vrstic, inline stili (`width:70px`, `text-align:center`), ročno pad char `repeat(diff)`.
 * Zdaj: 38 vrstic, deklarativno, robni primeri pokriti (`targetLen < line.length → no-op`).
 */
import { ToolComponent } from '@/components/ToolComponent';

type Align = 'left' | 'right' | 'center';

export function padLines(text: string, targetLen: number, padChar: string, pos: Align): string {
  const len = Math.max(1, targetLen);
  const ch = padChar || ' ';
  return text
    .split('\n')
    .map(line => {
      if (line.length >= len) return line;
      const diff = len - line.length;
      if (pos === 'left') return line + ch.repeat(diff);
      if (pos === 'right') return ch.repeat(diff) + line;
      const left = Math.floor(diff / 2);
      return ch.repeat(left) + line + ch.repeat(diff - left);
    })
    .join('\n');
}

export class PadTextTool extends ToolComponent {
  get id(): string {
    return 'pad-text';
  }

  private get len(): number {
    return Math.max(
      1,
      parseInt((this.container.querySelector('#pt-len') as HTMLInputElement)?.value || '30', 10)
    );
  }
  private get ch(): string {
    return (this.container.querySelector('#pt-char') as HTMLInputElement)?.value || ' ';
  }
  private get pos(): Align {
    return (
      ((this.container.querySelector('#pt-pos') as HTMLSelectElement)?.value as Align) || 'left'
    );
  }

  protected mount(): void {
    const L = this.lang === 'sl';
    this.scaffold({
      inputValue: 'Kava\nČaj\nSveži sok',
      inputPlaceholder: L ? 'Vnesite vrstice...' : 'Enter lines...',
      outputPlaceholder: L ? 'Poravnano...' : 'Padded...',
      settingsBarHtml: `
        <label>${L ? 'Širina:' : 'Width:'} <input type="number" id="pt-len" value="30" min="1" max="200"></label>
        <label>${L ? 'Znak:' : 'Pad:'} <input type="text" id="pt-char" value=" " maxlength="5"></label>
        <label>${L ? 'Poravnava:' : 'Align:'}
          <select id="pt-pos">
            <option value="left">${L ? 'Levo' : 'Left'}</option>
            <option value="right">${L ? 'Desno' : 'Right'}</option>
            <option value="center">${L ? 'Sredina' : 'Center'}</option>
          </select>
        </label>`,
    });
  }

  protected bind(): void {
    this.container
      .querySelectorAll('#pt-len, #pt-char, #pt-pos')
      .forEach(el => el.addEventListener('input', () => this.update()));
  }

  protected compute(input: string): string {
    return padLines(input, this.len, this.ch, this.pos);
  }
}
