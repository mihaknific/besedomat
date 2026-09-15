/**
 * SENIOR PRIMER MIGRACIJE
 * Prej:  ~52 vrstic `function renderReverseAdvanced(container)` v `index.html:10014`,
 *        inline `style="margin-bottom:14px;"`, ročno `querySelector` + `addEventListener`,
 *        duplikat copy/clear logike.
 * Zdaj:  34 vrstic razreda, deduje scaffold, tipizirano, testabilno, brez duplikata.
 *        Logika je čista funkcija `reverse()` — testabilna brez DOM.
 */
import { ToolComponent } from '@/components/ToolComponent';

type Mode = 'chars' | 'words' | 'lines' | 'words_in_lines';

export function reverse(text: string, mode: Mode): string {
  if (mode === 'chars') return [...text].reverse().join('');
  if (mode === 'words') return text.split(/(\s+)/).reverse().join('');
  if (mode === 'lines') return text.split('\n').reverse().join('\n');
  return text
    .split('\n')
    .map(l => l.split(' ').reverse().join(' '))
    .join('\n'); // words_in_lines
}

export class ReverseAdvancedTool extends ToolComponent {
  get id(): string {
    return 'reverse-advanced';
  }

  private get mode(): Mode {
    return (
      ((this.container.querySelector('#ra-mode') as HTMLSelectElement)?.value as Mode) || 'chars'
    );
  }

  protected mount(): void {
    const L = this.lang === 'sl';
    this.scaffold({
      inputValue: L
        ? 'Besedomat je odlično orodje.\nHitro deluje v brskalniku.'
        : 'Besedomat is great.\nFast in browser.',
      inputPlaceholder: L ? 'Vnesite besedilo...' : 'Enter text...',
      outputPlaceholder: L ? 'Obrnjeno besedilo...' : 'Reversed text...',
      settingsBarHtml: `
        <label>${L ? 'Način obračanja:' : 'Reverse mode:'}
          <select id="ra-mode">
            <option value="chars">${L ? 'Obrni znake' : 'Reverse characters'}</option>
            <option value="words">${L ? 'Obrni vrstni red besed' : 'Reverse words'}</option>
            <option value="lines">${L ? 'Obrni vrstice' : 'Reverse lines'}</option>
            <option value="words_in_lines">${L ? 'Obrni besede v vrstici' : 'Reverse words per line'}</option>
          </select>
        </label>`,
    });
  }

  protected bind(): void {
    this.container.querySelector('#ra-mode')?.addEventListener('input', () => this.update());
  }

  protected compute(input: string): string {
    return reverse(input, this.mode);
  }
}
