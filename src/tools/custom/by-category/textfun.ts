/** AUTO-SPLIT iz legacy/renderers.ts — kategorija textfun (8 orodij). Migriraj vsak render v ToolComponent. */
function renderLeetspeakConverter(container) {
      const L = currentLang === 'sl';
      
      const basicMap = {
        'a': '4', 'b': '8', 'e': '3', 'g': '6', 'i': '1', 'l': '1', 'o': '0', 's': '5', 't': '7', 'z': '2',
        'A': '4', 'B': '8', 'E': '3', 'G': '6', 'I': '1', 'L': '1', 'O': '0', 'S': '5', 'T': '7', 'Z': '2'
      };
      
      const advancedMap = {
        ...basicMap,
        'c': '(', 'd': '|)', 'f': '|=', 'h': '|-|', 'k': '|<', 'm': '|\\/|', 'n': '|\\|', 'p': '|2', 'q': '9', 'r': '|2', 'u': '|_|', 'v': '\\/', 'w': '\\/\\/', 'x': '><', 'y': '`/', 
        'C': '(', 'D': '|)', 'F': '|=', 'H': '|-|', 'K': '|<', 'M': '|\\/|', 'N': '|\\|', 'P': '|2', 'Q': '9', 'R': '|2', 'U': '|_|', 'V': '\\/', 'W': '\\/\\/', 'X': '><', 'Y': '`/'
      };
      
      const extremeMap = {
        ...advancedMap,
        'a': '@', 'b': '|3', 'c': '<', 'd': '[)', 'e': '&', 'f': 'ph', 'g': '9', 'h': '#', 'i': '!', 'j': '_|', 'k': '|<', 'l': '|_', 'm': '/\\/\\', 'n': '/\\/', 'p': '|*', 'q': '0_', 'r': '|?', 's': '$', 't': '7', 'u': '(_)', 'v': '\\/', 'w': '\\/\\/', 'x': '%', 'y': '¥', 'z': '2'
      };

      const decodeMap = {
        '4': 'a', '8': 'b', '3': 'e', '6': 'g', '1': 'i', '0': 'o', '5': 's', '7': 't', '2': 'z',
        '@': 'a', '(': 'c', '|)': 'd', '&': 'e', '|=': 'f', '|-|': 'h', '|<': 'k', '|\\/|': 'm', '|\\|': 'n',
        '|2': 'p', '9': 'q', '|_|': 'u', '\\/': 'v', '\\/\\/': 'w', '><': 'x', '`/': 'y',
        '$': 's', '#': 'h', '!': 'i', '%': 'x', '¥': 'y', 'ph': 'f'
      };

      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način:' : 'Mode:'}
        <select id="leet-mode">
          <option value="encode-basic">${L ? 'Enkripcija (osnovna)' : 'Encode (basic)'}</option>
          <option value="encode-advanced">${L ? 'Enkripcija (napredna)' : 'Encode (advanced)'}</option>
          <option value="encode-extreme">${L ? 'Enkripcija (ekstremna)' : 'Encode (extreme)'}</option>
          <option value="decode">${L ? 'Dekripcija (leetspeak → besedilo)' : 'Decode (leet → text)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="leet-preserve" checked> ${L ? 'Ohranji velikost črk' : 'Preserve case'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="leet-input">${getI('ui_input')}</label>
        <textarea id="leet-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}" style="min-height:160px;">${L ? 'Besedomat je najboljše orodje za besedila!' : 'Besedomat is the best text tool!'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="leet-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="leet-output">${getI('ui_output')}</label>
        <textarea id="leet-output" readonly placeholder="${L ? 'Rezultat...' : 'Result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="leet-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
    <div style="margin-top:12px; padding:12px; background:var(--card); border:1px solid var(--border); border-radius:12px; font-size:12px; color:var(--text-dim);">
      <strong>${L ? 'Osnovna preslikava:' : 'Basic map:'}</strong> A=4, B=8, E=3, G=6, I=1, L=1, O=0, S=5, T=7, Z=2<br>
      <strong>${L ? 'Napredna:' : 'Advanced:'}</strong> C=(, D=|), F=|=', H=|-|, K=|<, M=/\\/\\, N=/\\/, P=|2, Q=9, R=|2, U=|_|, V=\\/, W=\\/\\/, X=><, Y=\`/<br>
      <strong>${L ? 'Ekstremna:' : 'Extreme:'}</strong> A=@, B=|3, C=<, D=[), E=&, F=ph, G=9, H=#, I=!, J=_|, L=|_, M=/\\/\\, P=|*, Q=0_, R=|?, S=$, U=(_), X=%
    </div>
  `;

      const input = container.querySelector("#leet-input");
      const output = container.querySelector("#leet-output");
      const modeSel = container.querySelector("#leet-mode");
      const preserveCheck = container.querySelector("#leet-preserve");

      function leetEncode(text, map, preserveCase) {
        return text.split('').map(ch => {
          const lower = ch.toLowerCase();
          if (map[lower] !== undefined) {
            const replacement = map[lower];
            if (!preserveCase) return replacement;
            return ch === ch.toUpperCase() ? replacement.toUpperCase() : replacement;
          }
          return ch;
        }).join('');
      }

      function leetDecode(text) {
        // Best effort decoding - replace known patterns
        let result = text;
        // Sort keys by length descending to match longer patterns first
        const sortedKeys = Object.keys(decodeMap).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
          const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          result = result.replace(regex, () => decodeMap[key]);
        }
        return result;
      }

      function update() {
        const mode = modeSel.value;
        const preserve = preserveCheck.checked;
        
        if (mode === 'decode') {
          output.value = leetDecode(input.value);
        } else {
          let map = basicMap;
          if (mode === 'encode-advanced') map = advancedMap;
          else if (mode === 'encode-extreme') map = extremeMap;
          output.value = leetEncode(input.value, map, preserve);
        }
      }

      [input, modeSel, preserveCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#leet-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#leet-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#leet-copy"));
      });
      update();
    }

function renderAsciiArt(container) {
      const L = currentLang === 'sl';
      const FONT_ORDER = ["standard", "slant", "shadow", "banner", "big", "small"];

      function deriveFonts() {
        const base = ASCII_FONTS;
        const map = (fn) => {
          const out = {};
          for (const k in base) out[k] = fn(base[k]);
          return out;
        };
        const slant = (g) => g.map((r, i) => " ".repeat(4 - i) + r);
        const shadow = (g) => {
          const w = Math.max(...g.map(r => r.length));
          const grid = g.map(r => r.padEnd(w, ' ').split(''));
          const out = grid.map(r => r.slice());
          for (let y = 0; y < grid.length; y++)
            for (let x = 0; x < w; x++)
              if (grid[y][x] === '#') {
                if (x + 1 < w) out[y][x + 1] = '#';
                if (y + 1 < grid.length) out[y + 1][x] = '#';
                if (y + 1 < grid.length && x + 1 < w) out[y + 1][x + 1] = '#';
              }
          return out.map(r => r.join(''));
        };
        const banner = (g) => g.map(r => r.split('').map(c => c === '#' ? '##' : '  ').join(''));
        const big = (g) => {
          const w = Math.max(...g.map(r => r.length));
          const rows = g.map(r => r.padEnd(w, ' '));
          const idx = [0, 1, 2, 2, 3, 4, 4];
          return idx.map(i => rows[i].split('').map(c => c === '#' ? '##' : '  ').join(''));
        };
        const small = (g) => [g[0], g[2], g[4]];
        return {
          standard: base,
          slant: map(slant),
          shadow: map(shadow),
          banner: map(banner),
          big: map(big),
          small: map(small)
        };
      }

      function renderLine(line, font, fill, maxW) {
        const H = (font['A'] || font[' ']).length;
        let rows = Array.from({ length: H }, () => '');
        let curW = 0;
        for (const ch of line) {
          const key = font[ch.toUpperCase()] ? ch.toUpperCase() : (font[ch] ? ch : ' ');
          const raw = font[key] || font[' '];
          const gw = Math.max(...raw.map(r => r.length));
          const glyph = raw.map(r => {
            const s = r.padEnd(gw, ' ');
            return s.split('').map(c => c === '#' ? fill : ' ').join('');
          });
          if (curW + gw + 1 > maxW && curW > 0) {
            rows.push('\n');
            rows = Array.from({ length: H }, () => '');
            curW = 0;
          }
          for (let i = 0; i < H; i++) rows[i] += (rows[i] ? ' ' : '') + glyph[i];
          curW += gw + 1;
        }
        return rows.join('\n');
      }

      container.innerHTML = `
        <div class="settings-bar" style="margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <label>${L ? 'Font:' : 'Font:'}
            <select id="aa-font">
              <option value="standard">${L ? 'Standard' : 'Standard'}</option>
              <option value="slant">${L ? 'Slant (nagnjen)' : 'Slant'}</option>
              <option value="shadow">${L ? 'Shadow (senca)' : 'Shadow'}</option>
              <option value="banner">${L ? 'Banner (širok)' : 'Banner'}</option>
              <option value="big">${L ? 'Big (velik)' : 'Big'}</option>
              <option value="small">${L ? 'Small (majhen)' : 'Small'}</option>
            </select>
          </label>
          <label>${L ? 'Znak za izpuno:' : 'Fill character:'}
            <input id="aa-fill" type="text" maxlength="1" value="#" style="width:42px; text-align:center;">
          </label>
          <label>${L ? 'Širina:' : 'Width:'}
            <input id="aa-width" type="number" min="10" max="300" value="80" style="width:70px;">
          </label>
          <label>${L ? 'Poravnava:' : 'Alignment:'}
            <select id="aa-align">
              <option value="left">${L ? 'Levo' : 'Left'}</option>
              <option value="center">${L ? 'Sredina' : 'Center'}</option>
              <option value="right">${L ? 'Desno' : 'Right'}</option>
            </select>
          </label>
        </div>
        <div class="tool-workspace-2col">
          <div class="tool-panel">
            <label for="aa-input">${getI('ui_input')}</label>
            <textarea id="aa-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}" style="min-height:160px; font-family:monospace;">${L ? 'BESAEDOMAT' : 'BESAEDOMAT'}</textarea>
            <div class="panel-actions">
              <button class="btn-sm" id="aa-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
            </div>
          </div>
          <div class="tool-panel">
            <label for="aa-output">${getI('ui_output')}</label>
            <pre id="aa-output" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:160px; overflow:auto; white-space:pre; font-family:monospace; font-size:13px; line-height:1.1; margin:0;"></pre>
            <div class="panel-actions">
              <button class="btn-sm primary" id="aa-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
              <button class="btn-sm" id="aa-dl" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${getI('ui_download')}</span></button>
            </div>
          </div>
        </div>
      `;

      const input = container.querySelector("#aa-input");
      const output = container.querySelector("#aa-output");
      const fontSel = container.querySelector("#aa-font");
      const fillIn = container.querySelector("#aa-fill");
      const widthIn = container.querySelector("#aa-width");
      const alignSel = container.querySelector("#aa-align");

      function update() {
        const fonts = deriveFonts();
        const font = fonts[fontSel.value] || fonts.standard;
        const fill = (fillIn.value || '#').charAt(0);
        const maxW = Math.max(10, parseInt(widthIn.value) || 80);
        const align = alignSel.value;
        const text = input.value || '';
        const blocks = text.split('\n').map(ln => ln === '' ? '' : renderLine(ln, font, fill, maxW));
        let art = blocks.join('\n');
        if (align !== 'left' && art) {
          const lines = art.split('\n');
          const maxLen = Math.max(...lines.map(l => l.length));
          art = lines.map(l => {
            if (align === 'center') {
              const pad = Math.floor((maxLen - l.length) / 2);
              return ' '.repeat(Math.max(0, pad)) + l;
            } else {
              return ' '.repeat(Math.max(0, maxLen - l.length)) + l;
            }
          }).join('\n');
        }
        output.textContent = art || (L ? '— (vnesite besedilo)' : '— (enter text)');
      }

      [input, fontSel, fillIn, widthIn, alignSel].forEach(el => el.addEventListener("input", update));
      container.querySelector("#aa-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#aa-copy").addEventListener("click", () => copyText(output.textContent, container.querySelector("#aa-copy")));
      container.querySelector("#aa-dl").addEventListener("click", () => {
        const blob = new Blob([output.textContent], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art.txt';
        a.click();
        URL.revokeObjectURL(a.href);
      });
      update();
    }

function renderAcrosticGenerator(container) {
      const L = currentLang === 'sl';
      container.innerHTML = `
        <div class="settings-bar" style="margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <label>${L ? 'Ciljna beseda:' : 'Target word:'}
            <input id="ac-word" type="text" value="${L ? 'SONCE' : 'SUN'}" style="width:200px; text-transform:uppercase; letter-spacing:2px;">
          </label>
          <label><input type="checkbox" id="ac-vert" checked> ${L ? 'Navpično (vsaka črka = nova vrstica)' : 'Vertical (each letter = new line)'}</label>
        </div>
        <div class="tool-workspace-2col">
          <div class="tool-panel">
            <label>${L ? 'Besede za vsako črko (klikni predlog):' : 'Words per letter (click suggestion):'}</label>
            <div id="ac-rows" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
            <div class="panel-actions">
              <button class="btn-sm" id="ac-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
            </div>
          </div>
          <div class="tool-panel">
            <label for="ac-output">${getI('ui_output')}</label>
            <pre id="ac-output" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:160px; overflow:auto; white-space:pre-wrap; font-family:monospace; font-size:14px; line-height:1.6; margin:0;"></pre>
            <div class="panel-actions">
              <button class="btn-sm primary" id="ac-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
              <button class="btn-sm" id="ac-dl" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${getI('ui_download')}</span></button>
            </div>
          </div>
        </div>
      `;

      const wordInput = container.querySelector("#ac-word");
      const vertCheck = container.querySelector("#ac-vert");
      const rowsEl = container.querySelector("#ac-rows");
      const output = container.querySelector("#ac-output");
      let words = [];

      function buildRows() {
        const letters = (wordInput.value || '').toUpperCase().split('');
        words = words.slice(0, letters.length);
        while (words.length < letters.length) words.push('');
        const rowsHtml = letters.map((ch, i) => {
          const val = words[i] || '';
          const dict = (ACROSTIC_DICT[currentLang] && ACROSTIC_DICT[currentLang][ch]) || [];
          const chips = dict.map(d => `<button class="ac-chip" data-i="${i}" data-w="${d}" style="border:1px solid var(--border); background:var(--bg); color:var(--text); border-radius:20px; padding:3px 10px; font-size:12px; cursor:pointer; margin:2px;">${d}</button>`).join('');
          return `<div class="ac-row" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:var(--accent); color:#fff; font-weight:bold; flex:none;">${ch}</span>
            <input class="ac-word" data-i="${i}" value="${escapeHtml(val)}" placeholder="${L ? 'beseda...' : 'word...'}" style="flex:1; min-width:120px;">
            <div style="display:flex; flex-wrap:wrap; gap:2px; width:100%; margin-left:36px;">${chips}</div>
          </div>`;
        }).join('');
        rowsEl.innerHTML = rowsHtml || (L ? 'Vnesite ciljno besedo zgoraj.' : 'Enter a target word above.');

        rowsEl.querySelectorAll('.ac-chip').forEach(b => b.addEventListener('click', () => {
          const i = +b.dataset.i;
          words[i] = b.dataset.w;
          const inp = rowsEl.querySelector('.ac-word[data-i="' + i + '"]');
          if (inp) inp.value = b.dataset.w;
          update();
        }));
        rowsEl.querySelectorAll('.ac-word').forEach(inp => inp.addEventListener('input', () => {
          words[+inp.dataset.i] = inp.value;
          update();
        }));
      }

      function update() {
        const vert = vertCheck.checked;
        const letters = (wordInput.value || '').toUpperCase().split('');
        const lines = letters.map((ch, i) => {
          const w = (words[i] || '').trim();
          return vert ? (ch + ' - ' + (w || (L ? '(manjka)' : '(missing)'))) : w;
        });
        let out;
        if (vert) {
          out = lines.join('\n');
        } else {
          out = lines.filter(x => x.trim()).join(' ');
        }
        output.textContent = out || (L ? '(vnesite besedo in besede za vsako črko)' : '(enter word and words for each letter)');
      }

      wordInput.addEventListener("input", () => { buildRows(); update(); });
      vertCheck.addEventListener("change", update);
      container.querySelector("#ac-clear").addEventListener("click", () => {
        wordInput.value = '';
        words = [];
        buildRows();
        update();
        wordInput.focus();
      });
      container.querySelector("#ac-copy").addEventListener("click", () => copyText(output.textContent, container.querySelector("#ac-copy")));
      container.querySelector("#ac-dl").addEventListener("click", () => {
        const blob = new Blob([output.textContent], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'acrostic.txt';
        a.click();
        URL.revokeObjectURL(a.href);
      });
      buildRows();
      update();
    }

function renderFakeChatGenerator(container) {
      const L = currentLang === 'sl';

      const CHAT = {
        whatsapp: {
          light: { bg: '#ece5dd', header: '#075e54', htext: '#ffffff', left: '#ffffff', right: '#dcf8c6', tL: '#000000', tR: '#000000', time: '#829192', name: '#075e54', tick: '#53bdeb' },
          dark:  { bg: '#0b141a', header: '#202c33', htext: '#e9edef', left: '#202c33', right: '#005c4b', tL: '#e9edef', tR: '#e9edef', time: '#8696a0', name: '#53bdeb', tick: '#53bdeb' }
        },
        messenger: {
          light: { bg: '#ffffff', header: '#0084ff', htext: '#ffffff', left: '#e4e6eb', right: '#0084ff', tL: '#050505', tR: '#ffffff', time: '#65676b', name: '#0084ff', tick: '#0084ff' },
          dark:  { bg: '#18191a', header: '#0084ff', htext: '#ffffff', left: '#3e4042', right: '#0084ff', tL: '#e4e6eb', tR: '#ffffff', time: '#b0b3b8', name: '#0084ff', tick: '#0084ff' }
        },
        imessage: {
          light: { bg: '#ffffff', header: '#f6f6f6', htext: '#000000', left: '#e9e9eb', right: '#0b93f6', tL: '#000000', tR: '#ffffff', time: '#8e8e93', name: '#8e8e93', tick: '#0b93f6' },
          dark:  { bg: '#000000', header: '#1c1c1e', htext: '#ffffff', left: '#3a3a3c', right: '#0b93f6', tL: '#ffffff', tR: '#ffffff', time: '#98989f', name: '#98989f', tick: '#0b93f6' }
        },
        android: {
          dark:  { bg: '#121212', header: '#1e1e1e', htext: '#ffffff', left: '#2a2a2a', right: '#2962ff', tL: '#ffffff', tR: '#ffffff', time: '#9e9e9e', name: '#2962ff', tick: '#2962ff' }
        }
      };

      let messages = [
        { side: 'left', text: L ? 'Hej! Kako si?' : 'Hey! How are you?', time: '10:24', status: 'read', name: L ? 'Ana' : 'Anna' },
        { side: 'right', text: L ? 'Super, hvala! Pa ti?' : 'Great, thanks! You?', time: '10:25', status: 'read', name: '' },
        { side: 'left', text: L ? 'Tudi jaz 🙂' : 'Me too 🙂', time: '10:25', status: 'read', name: '' }
      ];

      container.innerHTML = `
        <div class="settings-bar" style="margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <label>${L ? 'Aplikacija:' : 'App:'}
            <select id="fc-theme">
              <option value="whatsapp">WhatsApp</option>
              <option value="messenger">Messenger</option>
              <option value="imessage">iMessage</option>
              <option value="android">Android SMS</option>
            </select>
          </label>
          <label><input type="checkbox" id="fc-dark" checked> ${L ? 'Temna tema' : 'Dark mode'}</label>
          <label>${L ? 'Naslov pogovora:' : 'Chat title:'}
            <input id="fc-title" type="text" value="${L ? 'Ana' : 'Anna'}" style="width:160px;">
          </label>
        </div>
        <div class="tool-workspace-2col">
          <div class="tool-panel">
            <label>${L ? 'Sporočila:' : 'Messages:'}</label>
            <div id="fc-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
            <div class="panel-actions">
              <button class="btn-sm primary" id="fc-add" style="display:inline-flex; align-items:center; gap:5px;">+ ${L ? 'Dodaj sporočilo' : 'Add message'}</button>
              <button class="btn-sm" id="fc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
            </div>
          </div>
          <div class="tool-panel">
            <label>${L ? 'Predogled:' : 'Preview:'}</label>
            <div style="flex:1; min-height:200px; display:flex; align-items:center; justify-content:center; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:10px; overflow:auto;">
              <canvas id="fc-canvas" style="width:360px; max-width:100%; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,.25);"></canvas>
            </div>
            <div class="panel-actions">
              <button class="btn-sm primary" id="fc-dl" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${getI('ui_download')} PNG</span></button>
            </div>
          </div>
        </div>
      `;

      const themeSel = container.querySelector("#fc-theme");
      const darkChk = container.querySelector("#fc-dark");
      const titleIn = container.querySelector("#fc-title");
      const listEl = container.querySelector("#fc-list");
      const canvas = container.querySelector("#fc-canvas");
      const ctx = canvas.getContext('2d');

      function getTheme() {
        const t = CHAT[themeSel.value];
        if (themeSel.value === 'android') return t.dark;
        return darkChk.checked ? t.dark : t.light;
      }

      function buildList() {
        const rows = messages.map((m, i) => `
          <div class="fc-row" style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; border:1px solid var(--border); border-radius:8px; padding:6px;">
            <select class="fc-side" data-i="${i}" style="flex:none;">
              <option value="left"${m.side === 'left' ? ' selected' : ''}>${L ? 'Prejeto' : 'In'}</option>
              <option value="right"${m.side === 'right' ? ' selected' : ''}>${L ? 'Poslano' : 'Out'}</option>
            </select>
            <input class="fc-text" data-i="${i}" value="${escapeHtml(m.text)}" placeholder="${L ? 'sporočilo...' : 'message...'}" style="flex:1; min-width:140px;">
            <input class="fc-time" data-i="${i}" value="${escapeHtml(m.time)}" style="width:58px;">
            <select class="fc-status" data-i="${i}" style="flex:none;">
              <option value="none"${m.status === 'none' ? ' selected' : ''}>–</option>
              <option value="sent"${m.status === 'sent' ? ' selected' : ''}>✓</option>
              <option value="delivered"${m.status === 'delivered' ? ' selected' : ''}>✓✓</option>
              <option value="read"${m.status === 'read' ? ' selected' : ''}>✓✓*</option>
            </select>
            <button class="fc-del" data-i="${i}" title="delete" style="flex:none; border:none; background:transparent; color:var(--danger,#e5484d); cursor:pointer; font-size:16px;">✕</button>
          </div>`).join('');
        listEl.innerHTML = rows || (L ? 'Ni sporočil.' : 'No messages.');

        listEl.querySelectorAll('.fc-side').forEach(el => el.addEventListener('change', () => { messages[+el.dataset.i].side = el.value; render(); }));
        listEl.querySelectorAll('.fc-text').forEach(el => el.addEventListener('input', () => { messages[+el.dataset.i].text = el.value; render(); }));
        listEl.querySelectorAll('.fc-time').forEach(el => el.addEventListener('input', () => { messages[+el.dataset.i].time = el.value; render(); }));
        listEl.querySelectorAll('.fc-status').forEach(el => el.addEventListener('change', () => { messages[+el.dataset.i].status = el.value; render(); }));
        listEl.querySelectorAll('.fc-del').forEach(el => el.addEventListener('click', () => {
          messages.splice(+el.dataset.i, 1);
          buildList();
          render();
        }));
      }

      function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
      }

      function draw() {
        const th = getTheme();
        const scale = 2;
        const W = 360;
        const padX = 10, padY = 8, lineH = 19, headerH = 56, gap = 10, nameH = 16;
        const maxBubble = W - 2 * padX;
        const cssFont = '15px -apple-system, Segoe UI, Roboto, sans-serif';

        ctx.font = cssFont;
        let y = headerH + 12;
        const layouts = [];
        for (const m of messages) {
          const isRight = m.side === 'right';
          const maxW = maxBubble - 2 * padX;
          const words = String(m.text).split(/\s+/).filter(Boolean);
          const lines = [];
          let cur = '';
          for (const w of words) {
            const test = cur ? cur + ' ' + w : w;
            if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
            else cur = test;
          }
          if (cur) lines.push(cur);
          if (lines.length === 0) lines.push('');
          const textW = Math.max(...lines.map(l => ctx.measureText(l).width), ctx.measureText(m.time).width + (isRight && m.status !== 'none' ? 22 : 0));
          const bw = Math.min(maxBubble, Math.ceil(textW) + 2 * padX);
          const bh = lines.length * lineH + 2 * padY + 4;
          const showName = !isRight && m.name;
          layouts.push({ m, isRight, lines, bw, bh, showName, x: isRight ? W - padX - bw : padX, y: y + (showName ? nameH : 0) });
          y += bh + (showName ? nameH : 0) + gap;
        }
        const H = Math.max(headerH + 24, y + 8);

        canvas.width = W * scale;
        canvas.height = H * scale;
        canvas.style.height = H + 'px';
        ctx.setTransform(scale, scale, 0, 0);
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = th.bg;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = th.header;
        ctx.fillRect(0, 0, W, headerH);
        const title = titleIn.value || (L ? 'Pogovor' : 'Chat');
        const initial = title.trim().charAt(0).toUpperCase() || '#';
        ctx.fillStyle = th.header === '#f6f6f6' ? '#34c759' : th.header;
        ctx.beginPath();
        ctx.arc(28, headerH / 2, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 28, headerH / 2 + 1);
        ctx.textAlign = 'left';
        ctx.fillStyle = th.htext;
        ctx.font = 'bold 15px -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.fillText(title, 56, headerH / 2 - 6);
        ctx.font = '11px -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.fillStyle = th.htext;
        ctx.globalAlpha = 0.7;
        ctx.fillText('online', 56, headerH / 2 + 10);
        ctx.globalAlpha = 1;

        for (const it of layouts) {
          const { m, isRight, lines, bw, bh, showName, x, y } = it;
          if (showName) {
            ctx.fillStyle = th.name;
            ctx.font = '12px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText(m.name, x, y - 4);
          }
          ctx.fillStyle = isRight ? th.right : th.left;
          roundRect(ctx, x, y, bw, bh, 14);
          ctx.fill();
          ctx.fillStyle = isRight ? th.tR : th.tL;
          ctx.font = cssFont;
          ctx.textBaseline = 'top';
          lines.forEach((ln, i) => ctx.fillText(ln, x + padX, y + padY + i * lineH));

          const timeY = y + bh - 4;
          ctx.font = '11px -apple-system, Segoe UI, Roboto, sans-serif';
          ctx.fillStyle = th.time;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          let timeX = x + bw - padX;
          if (isRight && m.status !== 'none') {
            ctx.fillStyle = m.status === 'read' ? th.tick : th.time;
            const ticks = m.status === 'sent' ? '✓' : '✓✓';
            ctx.fillText(ticks, timeX, timeY);
            timeX -= ctx.measureText(ticks).width + 4;
          }
          ctx.fillStyle = th.time;
          ctx.fillText(m.time, timeX, timeY);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
      }

      function render() { draw(); }

      themeSel.addEventListener('change', render);
      darkChk.addEventListener('change', render);
      titleIn.addEventListener('input', render);
      container.querySelector('#fc-add').addEventListener('click', () => {
        messages.push({ side: 'left', text: L ? 'Novo sporočilo' : 'New message', time: '12:00', status: 'read', name: '' });
        buildList();
        render();
      });
      container.querySelector('#fc-clear').addEventListener('click', () => {
        messages = [];
        buildList();
        render();
      });
      container.querySelector('#fc-dl').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'fake-chat.png';
        a.click();
      });

      buildList();
      render();
    }

function renderLeetspeakConverter(container) {
      const L = currentLang === 'sl';
      
      const basicMap = {
        'a': '4', 'b': '8', 'e': '3', 'g': '6', 'i': '1', 'l': '1', 'o': '0', 's': '5', 't': '7', 'z': '2',
        'A': '4', 'B': '8', 'E': '3', 'G': '6', 'I': '1', 'L': '1', 'O': '0', 'S': '5', 'T': '7', 'Z': '2'
      };
      
      const advancedMap = {
        ...basicMap,
        'c': '(', 'd': '|)', 'f': '|=', 'h': '|-|', 'k': '|<', 'm': '|\\/|', 'n': '|\\|', 'p': '|2', 'q': '9', 'r': '|2', 'u': '|_|', 'v': '\\/', 'w': '\\/\\/', 'x': '><', 'y': '`/', 
        'C': '(', 'D': '|)', 'F': '|=', 'H': '|-|', 'K': '|<', 'M': '|\\/|', 'N': '|\\|', 'P': '|2', 'Q': '9', 'R': '|2', 'U': '|_|', 'V': '\\/', 'W': '\\/\\/', 'X': '><', 'Y': '`/'
      };
      
      const extremeMap = {
        ...advancedMap,
        'a': '@', 'b': '|3', 'c': '<', 'd': '[)', 'e': '&', 'f': 'ph', 'g': '9', 'h': '#', 'i': '!', 'j': '_|', 'k': '|<', 'l': '|_', 'm': '/\\/\\', 'n': '/\\/', 'p': '|*', 'q': '0_', 'r': '|?', 's': '$', 't': '7', 'u': '(_)', 'v': '\\/', 'w': '\\/\\/', 'x': '%', 'y': '¥', 'z': '2'
      };

      const decodeMap = {
        '4': 'a', '8': 'b', '3': 'e', '6': 'g', '1': 'i', '0': 'o', '5': 's', '7': 't', '2': 'z',
        '@': 'a', '(': 'c', '|)': 'd', '&': 'e', '|=': 'f', '|-|': 'h', '|<': 'k', '|\\/|': 'm', '|\\|': 'n',
        '|2': 'p', '9': 'q', '|_|': 'u', '\\/': 'v', '\\/\\/': 'w', '><': 'x', '`/': 'y',
        '$': 's', '#': 'h', '!': 'i', '%': 'x', '¥': 'y', 'ph': 'f'
      };

      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način:' : 'Mode:'}
        <select id="leet-mode">
          <option value="encode-basic">${L ? 'Enkripcija (osnovna)' : 'Encode (basic)'}</option>
          <option value="encode-advanced">${L ? 'Enkripcija (napredna)' : 'Encode (advanced)'}</option>
          <option value="encode-extreme">${L ? 'Enkripcija (ekstremna)' : 'Encode (extreme)'}</option>
          <option value="decode">${L ? 'Dekripcija (leetspeak → besedilo)' : 'Decode (leet → text)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="leet-preserve" checked> ${L ? 'Ohranji velikost črk' : 'Preserve case'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="leet-input">${getI('ui_input')}</label>
        <textarea id="leet-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}" style="min-height:160px;">${L ? 'Besedomat je najboljše orodje za besedila!' : 'Besedomat is the best text tool!'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="leet-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="leet-output">${getI('ui_output')}</label>
        <textarea id="leet-output" readonly placeholder="${L ? 'Rezultat...' : 'Result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="leet-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
    <div style="margin-top:12px; padding:12px; background:var(--card); border:1px solid var(--border); border-radius:12px; font-size:12px; color:var(--text-dim);">
      <strong>${L ? 'Osnovna preslikava:' : 'Basic map:'}</strong> A=4, B=8, E=3, G=6, I=1, L=1, O=0, S=5, T=7, Z=2<br>
      <strong>${L ? 'Napredna:' : 'Advanced:'}</strong> C=(, D=|), F=|=', H=|-|, K=|<, M=/\\/\\, N=/\\/, P=|2, Q=9, R=|2, U=|_|, V=\\/, W=\\/\\/, X=><, Y=\`/<br>
      <strong>${L ? 'Ekstremna:' : 'Extreme:'}</strong> A=@, B=|3, C=<, D=[), E=&, F=ph, G=9, H=#, I=!, J=_|, L=|_, M=/\\/\\, P=|*, Q=0_, R=|?, S=$, U=(_), X=%
    </div>
  `;

      const input = container.querySelector("#leet-input");
      const output = container.querySelector("#leet-output");
      const modeSel = container.querySelector("#leet-mode");
      const preserveCheck = container.querySelector("#leet-preserve");

      function leetEncode(text, map, preserveCase) {
        return text.split('').map(ch => {
          const lower = ch.toLowerCase();
          if (map[lower] !== undefined) {
            const replacement = map[lower];
            if (!preserveCase) return replacement;
            return ch === ch.toUpperCase() ? replacement.toUpperCase() : replacement;
          }
          return ch;
        }).join('');
      }

      function leetDecode(text) {
        // Best effort decoding - replace known patterns
        let result = text;
        // Sort keys by length descending to match longer patterns first
        const sortedKeys = Object.keys(decodeMap).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
          const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          result = result.replace(regex, () => decodeMap[key]);
        }
        return result;
      }

      function update() {
        const mode = modeSel.value;
        const preserve = preserveCheck.checked;
        
        if (mode === 'decode') {
          output.value = leetDecode(input.value);
        } else {
          let map = basicMap;
          if (mode === 'encode-advanced') map = advancedMap;
          else if (mode === 'encode-extreme') map = extremeMap;
          output.value = leetEncode(input.value, map, preserve);
        }
      }

      [input, modeSel, preserveCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#leet-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#leet-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#leet-copy"));
      });
      update();
    }

function renderAsciiArt(container) {
      const L = currentLang === 'sl';
      const FONT_ORDER = ["standard", "slant", "shadow", "banner", "big", "small"];

      function deriveFonts() {
        const base = ASCII_FONTS;
        const map = (fn) => {
          const out = {};
          for (const k in base) out[k] = fn(base[k]);
          return out;
        };
        const slant = (g) => g.map((r, i) => " ".repeat(4 - i) + r);
        const shadow = (g) => {
          const w = Math.max(...g.map(r => r.length));
          const grid = g.map(r => r.padEnd(w, ' ').split(''));
          const out = grid.map(r => r.slice());
          for (let y = 0; y < grid.length; y++)
            for (let x = 0; x < w; x++)
              if (grid[y][x] === '#') {
                if (x + 1 < w) out[y][x + 1] = '#';
                if (y + 1 < grid.length) out[y + 1][x] = '#';
                if (y + 1 < grid.length && x + 1 < w) out[y + 1][x + 1] = '#';
              }
          return out.map(r => r.join(''));
        };
        const banner = (g) => g.map(r => r.split('').map(c => c === '#' ? '##' : '  ').join(''));
        const big = (g) => {
          const w = Math.max(...g.map(r => r.length));
          const rows = g.map(r => r.padEnd(w, ' '));
          const idx = [0, 1, 2, 2, 3, 4, 4];
          return idx.map(i => rows[i].split('').map(c => c === '#' ? '##' : '  ').join(''));
        };
        const small = (g) => [g[0], g[2], g[4]];
        return {
          standard: base,
          slant: map(slant),
          shadow: map(shadow),
          banner: map(banner),
          big: map(big),
          small: map(small)
        };
      }

      function renderLine(line, font, fill, maxW) {
        const H = (font['A'] || font[' ']).length;
        let rows = Array.from({ length: H }, () => '');
        let curW = 0;
        for (const ch of line) {
          const key = font[ch.toUpperCase()] ? ch.toUpperCase() : (font[ch] ? ch : ' ');
          const raw = font[key] || font[' '];
          const gw = Math.max(...raw.map(r => r.length));
          const glyph = raw.map(r => {
            const s = r.padEnd(gw, ' ');
            return s.split('').map(c => c === '#' ? fill : ' ').join('');
          });
          if (curW + gw + 1 > maxW && curW > 0) {
            rows.push('\n');
            rows = Array.from({ length: H }, () => '');
            curW = 0;
          }
          for (let i = 0; i < H; i++) rows[i] += (rows[i] ? ' ' : '') + glyph[i];
          curW += gw + 1;
        }
        return rows.join('\n');
      }

      container.innerHTML = `
        <div class="settings-bar" style="margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <label>${L ? 'Font:' : 'Font:'}
            <select id="aa-font">
              <option value="standard">${L ? 'Standard' : 'Standard'}</option>
              <option value="slant">${L ? 'Slant (nagnjen)' : 'Slant'}</option>
              <option value="shadow">${L ? 'Shadow (senca)' : 'Shadow'}</option>
              <option value="banner">${L ? 'Banner (širok)' : 'Banner'}</option>
              <option value="big">${L ? 'Big (velik)' : 'Big'}</option>
              <option value="small">${L ? 'Small (majhen)' : 'Small'}</option>
            </select>
          </label>
          <label>${L ? 'Znak za izpuno:' : 'Fill character:'}
            <input id="aa-fill" type="text" maxlength="1" value="#" style="width:42px; text-align:center;">
          </label>
          <label>${L ? 'Širina:' : 'Width:'}
            <input id="aa-width" type="number" min="10" max="300" value="80" style="width:70px;">
          </label>
          <label>${L ? 'Poravnava:' : 'Alignment:'}
            <select id="aa-align">
              <option value="left">${L ? 'Levo' : 'Left'}</option>
              <option value="center">${L ? 'Sredina' : 'Center'}</option>
              <option value="right">${L ? 'Desno' : 'Right'}</option>
            </select>
          </label>
        </div>
        <div class="tool-workspace-2col">
          <div class="tool-panel">
            <label for="aa-input">${getI('ui_input')}</label>
            <textarea id="aa-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}" style="min-height:160px; font-family:monospace;">${L ? 'BESAEDOMAT' : 'BESAEDOMAT'}</textarea>
            <div class="panel-actions">
              <button class="btn-sm" id="aa-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
            </div>
          </div>
          <div class="tool-panel">
            <label for="aa-output">${getI('ui_output')}</label>
            <pre id="aa-output" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:160px; overflow:auto; white-space:pre; font-family:monospace; font-size:13px; line-height:1.1; margin:0;"></pre>
            <div class="panel-actions">
              <button class="btn-sm primary" id="aa-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
              <button class="btn-sm" id="aa-dl" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${getI('ui_download')}</span></button>
            </div>
          </div>
        </div>
      `;

      const input = container.querySelector("#aa-input");
      const output = container.querySelector("#aa-output");
      const fontSel = container.querySelector("#aa-font");
      const fillIn = container.querySelector("#aa-fill");
      const widthIn = container.querySelector("#aa-width");
      const alignSel = container.querySelector("#aa-align");

      function update() {
        const fonts = deriveFonts();
        const font = fonts[fontSel.value] || fonts.standard;
        const fill = (fillIn.value || '#').charAt(0);
        const maxW = Math.max(10, parseInt(widthIn.value) || 80);
        const align = alignSel.value;
        const text = input.value || '';
        const blocks = text.split('\n').map(ln => ln === '' ? '' : renderLine(ln, font, fill, maxW));
        let art = blocks.join('\n');
        if (align !== 'left' && art) {
          const lines = art.split('\n');
          const maxLen = Math.max(...lines.map(l => l.length));
          art = lines.map(l => {
            if (align === 'center') {
              const pad = Math.floor((maxLen - l.length) / 2);
              return ' '.repeat(Math.max(0, pad)) + l;
            } else {
              return ' '.repeat(Math.max(0, maxLen - l.length)) + l;
            }
          }).join('\n');
        }
        output.textContent = art || (L ? '— (vnesite besedilo)' : '— (enter text)');
      }

      [input, fontSel, fillIn, widthIn, alignSel].forEach(el => el.addEventListener("input", update));
      container.querySelector("#aa-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#aa-copy").addEventListener("click", () => copyText(output.textContent, container.querySelector("#aa-copy")));
      container.querySelector("#aa-dl").addEventListener("click", () => {
        const blob = new Blob([output.textContent], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art.txt';
        a.click();
        URL.revokeObjectURL(a.href);
      });
      update();
    }

    /* ============ ACROSTIC WORD DICTIONARY ============ */
    const ACROSTIC_DICT = {
      sl: {
        "A": ["Ambrozija", "Angel", "Avto", "Apnenec", "Alica"],
        "B": ["Beseda", "Breza", "Biser", "Bratec", "Branik"],
        "C": ["Cvet", "Cesta", "Cesar", "Cokl", "Crta"],
        "Č": ["Človek", "Čas", "Čebela", "Čar", "Česa"],
        "D": ["Drevo", "Danes", "Dež", "Dom", "Dlan"],
        "E": ["Eho", "Evropa", "Element", "Eden", "Enaka"],
        "F": ["Frizura", "Fantom", "Faza", "Fil", "Fojba"],
        "G": ["Glasba", "Gora", "Grad", "Grom", "Grič"],
        "H": ["Hiša", "Hrib", "Hrast", "Hči", "Hram"],
        "I": ["Ideja", "Igra", "Ivo", "Izhod", "Istra"],
        "J": ["Jabolko", "Jezero", "Jutro", "Jesen", "Jaz"],
        "K": ["Kamen", "Kava", "Kralj", "Krog", "Kraj"],
        "L": ["Ljubezen", "Luna", "List", "Log", "Luč"],
        "M": ["Morje", "Mesec", "Maj", "Mrak", "Mir"],
        "N": ["Nebo", "Noč", "Noga", "Njen", "Nov"],
        "O": ["Ogenj", "Oblaček", "Orhideja", "Okno", "Otok"],
        "P": ["Pesem", "Planina", "Ples", "Pot", "Pero"],
        "R": ["Reka", "Rdeča", "Raj", "Roža", "Rez"],
        "S": ["Sonce", "Sneg", "Srce", "Svoboda", "Streha"],
        "Š": ["Šuma", "Šola", "Škrlat", "Šopek", "Šest"],
        "T": ["Tree", "Tiha", "Tok", "Top", "Tisoč"],
        "U": ["Ura", "Ulica", "Upanje", "Učenec", "Udarec"],
        "V": ["Voda", "Vetr", "Vrt", "Visoka", "Vris"],
        "Z": ["Zvezda", "Zlato", "Zima", "Zdaj", "Zrak"],
        "Ž": ["Življenje", "Ženska", "Žaba", "Žica", "Žarek"]
      },
      en: {
        "A": ["Apple", "Angel", "Amber", "Ant", "Ark"],
        "B": ["Blue", "Bird", "Brave", "Book", "Bright"],
        "C": ["Cloud", "Cat", "Calm", "Castle", "Clear"],
        "D": ["Dream", "Day", "Diamond", "Door", "Dawn"],
        "E": ["Echo", "Earth", "Eagle", "Easy", "Epic"],
        "F": ["Fire", "Flower", "Free", "Forest", "Frost"],
        "G": ["Gold", "Green", "Grace", "Glow", "Giant"],
        "H": ["Heart", "Hope", "Home", "Hand", "Hero"],
        "I": ["Ice", "Iron", "Island", "Idea", "Ink"],
        "J": ["Joy", "Jade", "Jump", "June", "Jewel"],
        "K": ["King", "Key", "Kind", "Kite", "Koala"],
        "L": ["Love", "Light", "Leaf", "Lion", "Lunar"],
        "M": ["Moon", "Mountain", "Music", "Mind", "Mist"],
        "N": ["Night", "Nova", "Star", "Nest", "Noble"],
        "O": ["Ocean", "Orange", "Open", "Orbit", "Onyx"],
        "P": ["Peace", "Power", "Pine", "Path", "Pearl"],
        "Q": ["Queen", "Quiet", "Quest", "Quill", "Quartz"],
        "R": ["River", "Rose", "Red", "Rain", "Rune"],
        "S": ["Sun", "Star", "Sea", "Soul", "Sky"],
        "T": ["Tree", "Time", "True", "Tide", "Thorn"],
        "U": ["Unity", "Unique", "Umber", "Urge", "Ultra"],
        "V": ["Wind", "Wave", "Vine", "Vale", "Vivid"],
        "W": ["Wind", "Wise", "Warm", "Wood", "Wind"],
        "X": ["Xenon", "Xylem", "Xray", "Xenial", "Xyst"],
        "Y": ["Yarn", "Yield", "Year", "Yonder", "Yew"],
        "Z": ["Zephyr", "Zebra", "Zone", "Zen", "Zest"]
      }
    };

    // ============ HEAVY WORKER (offload large computations) ============
    let heavyWorker = null;
    function getHeavyWorker() {
      if (heavyWorker) return Promise.resolve(heavyWorker);
      if (typeof Worker === 'undefined') return Promise.resolve(null);
      const code = `
        const PURE = {
          frequencyCounts(text, opts) {
            const mode = (opts && opts.mode) || 'words';
            const ignoreCase = !!(opts && opts.ignoreCase);
            const ignorePunct = !!(opts && opts.ignorePunct);
            const minLen = (opts && opts.minLen) || 1;
            let t = text || '';
            if (ignoreCase) t = t.toLowerCase();
            if (ignorePunct) t = t.replace(/[\\p{P}\\p{S}]/gu, ' ');
            let items = [];
            if (mode === 'words') items = t.match(/\\b\\w+\\b/gu) || [];
            else if (mode === 'chars') items = t.replace(/\\s/g, '').split('');
            else if (mode === 'lines') items = t.split('\\n');
            else if (mode === 'ngrams') {
              const n = (opts && opts.n) || 2;
              const clean = t.replace(/\\s+/g, ' ');
              for (let i = 0; i <= clean.length - n; i++) items.push(clean.slice(i, i + n));
            }
            const map = new Map();
            for (const it of items) if (it.length >= minLen) map.set(it, (map.get(it) || 0) + 1);
            const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
            const total = items.length;
            const unique = map.size;
            return { total, unique, items: sorted.map(([v, c]) => ({ value: v, count: c })) };
          },
          parseMarkdown(md) {
            if (!md) return '';
            const escape = (value) => String(value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
            const safeUrl = (value) => {
              const url = String(value).trim();
              return /^(?:https?:|mailto:)/i.test(url) || /^\/(?!\/)/.test(url) || /^\.\.?\//.test(url) || /^#/.test(url)
                ? url
                : '#';
            };
            let t = escape(md);
            t = t.replace(/^###\\s+(.+)$/gm, '<h3>$1</h3>');
            t = t.replace(/^##\\s+(.+)$/gm, '<h2>$1</h2>');
            t = t.replace(/^#\\s+(.+)$/gm, '<h1>$1</h1>');
            t = t.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
            t = t.replace(/__(.+?)__/g, '<strong>$1</strong>');
            t = t.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
            t = t.replace(/_(.+?)_/g, '<em>$1</em>');
            t = t.replace(/~~(.+?)~~/g, '<del>$1</del>');
            t = t.replace(/\`(.+?)\`/g, '<code>$1</code>');
            t = t.replace(/^>\\s+(.+)$/gm, '<blockquote>$1</blockquote>');
            t = t.replace(/^\\s*[-*]\\s+(.+)$/gm, '<li>$1</li>');
            t = t.replace(/(<li>.*<\\/li>)/gms, '<ul>$1</ul>');
            t = t.replace(/\\[([^\\]]+?)\\]\\(([^)\\s]+?)\\)/g, (_, label, url) => `<a href="${escape(safeUrl(url))}">${label}</a>`);
            t = t.replace(/\n\n/g, '</p><p>');
            t = '<p>' + t + '</p>';
            t = t.replace(/<p>\\s*<\\/p>/g, '');
            return t;
          },
          diffLines(a, b) {
            const A = (a || '').split('\\n');
            const B = (b || '').split('\\n');
            const n = A.length, m = B.length;
            const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
            for (let i = n - 1; i >= 0; i--) {
              for (let j = m - 1; j >= 0; j--) {
                dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
              }
            }
            const out = [];
            let i = 0, j = 0;
            while (i < n && j < m) {
              if (A[i] === B[j]) { out.push({ t: ' ', v: A[i] }); i++; j++; }
              else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: '-', v: A[i] }); i++; }
              else { out.push({ t: '+', v: B[j] }); j++; }
            }
            while (i < n) { out.push({ t: '-', v: A[i] }); i++; }
            while (j < m) { out.push({ t: '+', v: B[j] }); j++; }
            return out;
          }
        };
        self.onmessage = (e) => {
          const { type, data, id } = e.data;
          try {
            let result;
            if (type === 'frequency') result = PURE.frequencyCounts(data.text, data.opts);
            else if (type === 'markdown') result = PURE.parseMarkdown(data);
            else if (type === 'diff') result = PURE.diffLines(data.a, data.b);
            else throw new Error('Unknown type: ' + type);
            self.postMessage({ id, result });
          } catch (err) {
            self.postMessage({ id, error: err.message });
          }
        };
      `;
      const blob = new Blob([code], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      heavyWorker = new Worker(url);
      heavyWorker.onmessage = (e) => {
        const { id, result, error } = e.data;
        const pending = getHeavyWorker.pending;
        if (pending && pending[id]) {
          if (error) pending[id].reject(new Error(error));
          else pending[id].resolve(result);
          delete pending[id];
        }
      };
      heavyWorker.onerror = (e) => {
        console.error('Heavy worker error:', e);
        const pending = getHeavyWorker.pending;
        for (const id in pending) { pending[id].reject(new Error('Worker error')); delete pending[id]; }
      };
      getHeavyWorker.pending = {};
      return Promise.resolve(heavyWorker);
    }

    function runHeavy(type, data) {
      return getHeavyWorker().then(worker => {
        if (!worker) return Promise.reject(new Error('Worker unavailable'));
        return new Promise((resolve, reject) => {
          const id = Math.random().toString(36).slice(2);
          getHeavyWorker.pending[id] = { resolve, reject };
          worker.postMessage({ type, data, id });
        });
      });
    }

    /* ============ ACROSTIC GENERATOR ============ */

function renderAcrosticGenerator(container) {
      const L = currentLang === 'sl';
      container.innerHTML = `
        <div class="settings-bar" style="margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <label>${L ? 'Ciljna beseda:' : 'Target word:'}
            <input id="ac-word" type="text" value="${L ? 'SONCE' : 'SUN'}" style="width:200px; text-transform:uppercase; letter-spacing:2px;">
          </label>
          <label><input type="checkbox" id="ac-vert" checked> ${L ? 'Navpično (vsaka črka = nova vrstica)' : 'Vertical (each letter = new line)'}</label>
        </div>
        <div class="tool-workspace-2col">
          <div class="tool-panel">
            <label>${L ? 'Besede za vsako črko (klikni predlog):' : 'Words per letter (click suggestion):'}</label>
            <div id="ac-rows" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
            <div class="panel-actions">
              <button class="btn-sm" id="ac-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
            </div>
          </div>
          <div class="tool-panel">
            <label for="ac-output">${getI('ui_output')}</label>
            <pre id="ac-output" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:160px; overflow:auto; white-space:pre-wrap; font-family:monospace; font-size:14px; line-height:1.6; margin:0;"></pre>
            <div class="panel-actions">
              <button class="btn-sm primary" id="ac-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
              <button class="btn-sm" id="ac-dl" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${getI('ui_download')}</span></button>
            </div>
          </div>
        </div>
      `;

      const wordInput = container.querySelector("#ac-word");
      const vertCheck = container.querySelector("#ac-vert");
      const rowsEl = container.querySelector("#ac-rows");
      const output = container.querySelector("#ac-output");
      let words = [];

      function buildRows() {
        const letters = (wordInput.value || '').toUpperCase().split('');
        words = words.slice(0, letters.length);
        while (words.length < letters.length) words.push('');
        const rowsHtml = letters.map((ch, i) => {
          const val = words[i] || '';
          const dict = (ACROSTIC_DICT[currentLang] && ACROSTIC_DICT[currentLang][ch]) || [];
          const chips = dict.map(d => `<button class="ac-chip" data-i="${i}" data-w="${d}" style="border:1px solid var(--border); background:var(--bg); color:var(--text); border-radius:20px; padding:3px 10px; font-size:12px; cursor:pointer; margin:2px;">${d}</button>`).join('');
          return `<div class="ac-row" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background:var(--accent); color:#fff; font-weight:bold; flex:none;">${ch}</span>
            <input class="ac-word" data-i="${i}" value="${escapeHtml(val)}" placeholder="${L ? 'beseda...' : 'word...'}" style="flex:1; min-width:120px;">
            <div style="display:flex; flex-wrap:wrap; gap:2px; width:100%; margin-left:36px;">${chips}</div>
          </div>`;
        }).join('');
        rowsEl.innerHTML = rowsHtml || (L ? 'Vnesite ciljno besedo zgoraj.' : 'Enter a target word above.');

        rowsEl.querySelectorAll('.ac-chip').forEach(b => b.addEventListener('click', () => {
          const i = +b.dataset.i;
          words[i] = b.dataset.w;
          const inp = rowsEl.querySelector('.ac-word[data-i="' + i + '"]');
          if (inp) inp.value = b.dataset.w;
          update();
        }));
        rowsEl.querySelectorAll('.ac-word').forEach(inp => inp.addEventListener('input', () => {
          words[+inp.dataset.i] = inp.value;
          update();
        }));
      }

      function update() {
        const vert = vertCheck.checked;
        const letters = (wordInput.value || '').toUpperCase().split('');
        const lines = letters.map((ch, i) => {
          const w = (words[i] || '').trim();
          return vert ? (ch + ' - ' + (w || (L ? '(manjka)' : '(missing)'))) : w;
        });
        let out;
        if (vert) {
          out = lines.join('\n');
        } else {
          out = lines.filter(x => x.trim()).join(' ');
        }
        output.textContent = out || (L ? '(vnesite besedo in besede za vsako črko)' : '(enter word and words for each letter)');
      }

      wordInput.addEventListener("input", () => { buildRows(); update(); });
      vertCheck.addEventListener("change", update);
      container.querySelector("#ac-clear").addEventListener("click", () => {
        wordInput.value = '';
        words = [];
        buildRows();
        update();
        wordInput.focus();
      });
      container.querySelector("#ac-copy").addEventListener("click", () => copyText(output.textContent, container.querySelector("#ac-copy")));
      container.querySelector("#ac-dl").addEventListener("click", () => {
        const blob = new Blob([output.textContent], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'acrostic.txt';
        a.click();
        URL.revokeObjectURL(a.href);
      });
      buildRows();
      update();
    }

    /* ============ FAKE CHAT / SMS GENERATOR ============ */

function renderFakeChatGenerator(container) {
      const L = currentLang === 'sl';

      const CHAT = {
        whatsapp: {
          light: { bg: '#ece5dd', header: '#075e54', htext: '#ffffff', left: '#ffffff', right: '#dcf8c6', tL: '#000000', tR: '#000000', time: '#829192', name: '#075e54', tick: '#53bdeb' },
          dark:  { bg: '#0b141a', header: '#202c33', htext: '#e9edef', left: '#202c33', right: '#005c4b', tL: '#e9edef', tR: '#e9edef', time: '#8696a0', name: '#53bdeb', tick: '#53bdeb' }
        },
        messenger: {
          light: { bg: '#ffffff', header: '#0084ff', htext: '#ffffff', left: '#e4e6eb', right: '#0084ff', tL: '#050505', tR: '#ffffff', time: '#65676b', name: '#0084ff', tick: '#0084ff' },
          dark:  { bg: '#18191a', header: '#0084ff', htext: '#ffffff', left: '#3e4042', right: '#0084ff', tL: '#e4e6eb', tR: '#ffffff', time: '#b0b3b8', name: '#0084ff', tick: '#0084ff' }
        },
        imessage: {
          light: { bg: '#ffffff', header: '#f6f6f6', htext: '#000000', left: '#e9e9eb', right: '#0b93f6', tL: '#000000', tR: '#ffffff', time: '#8e8e93', name: '#8e8e93', tick: '#0b93f6' },
          dark:  { bg: '#000000', header: '#1c1c1e', htext: '#ffffff', left: '#3a3a3c', right: '#0b93f6', tL: '#ffffff', tR: '#ffffff', time: '#98989f', name: '#98989f', tick: '#0b93f6' }
        },
        android: {
          dark:  { bg: '#121212', header: '#1e1e1e', htext: '#ffffff', left: '#2a2a2a', right: '#2962ff', tL: '#ffffff', tR: '#ffffff', time: '#9e9e9e', name: '#2962ff', tick: '#2962ff' }
        }
      };

      let messages = [
        { side: 'left', text: L ? 'Hej! Kako si?' : 'Hey! How are you?', time: '10:24', status: 'read', name: L ? 'Ana' : 'Anna' },
        { side: 'right', text: L ? 'Super, hvala! Pa ti?' : 'Great, thanks! You?', time: '10:25', status: 'read', name: '' },
        { side: 'left', text: L ? 'Tudi jaz 🙂' : 'Me too 🙂', time: '10:25', status: 'read', name: '' }
      ];

      container.innerHTML = `
        <div class="settings-bar" style="margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <label>${L ? 'Aplikacija:' : 'App:'}
            <select id="fc-theme">
              <option value="whatsapp">WhatsApp</option>
              <option value="messenger">Messenger</option>
              <option value="imessage">iMessage</option>
              <option value="android">Android SMS</option>
            </select>
          </label>
          <label><input type="checkbox" id="fc-dark" checked> ${L ? 'Temna tema' : 'Dark mode'}</label>
          <label>${L ? 'Naslov pogovora:' : 'Chat title:'}
            <input id="fc-title" type="text" value="${L ? 'Ana' : 'Anna'}" style="width:160px;">
          </label>
        </div>
        <div class="tool-workspace-2col">
          <div class="tool-panel">
            <label>${L ? 'Sporočila:' : 'Messages:'}</label>
            <div id="fc-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
            <div class="panel-actions">
              <button class="btn-sm primary" id="fc-add" style="display:inline-flex; align-items:center; gap:5px;">+ ${L ? 'Dodaj sporočilo' : 'Add message'}</button>
              <button class="btn-sm" id="fc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
            </div>
          </div>
          <div class="tool-panel">
            <label>${L ? 'Predogled:' : 'Preview:'}</label>
            <div style="flex:1; min-height:200px; display:flex; align-items:center; justify-content:center; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:10px; overflow:auto;">
              <canvas id="fc-canvas" style="width:360px; max-width:100%; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,.25);"></canvas>
            </div>
            <div class="panel-actions">
              <button class="btn-sm primary" id="fc-dl" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${getI('ui_download')} PNG</span></button>
            </div>
          </div>
        </div>
      `;

      const themeSel = container.querySelector("#fc-theme");
      const darkChk = container.querySelector("#fc-dark");
      const titleIn = container.querySelector("#fc-title");
      const listEl = container.querySelector("#fc-list");
      const canvas = container.querySelector("#fc-canvas");
      const ctx = canvas.getContext('2d');

      function getTheme() {
        const t = CHAT[themeSel.value];
        if (themeSel.value === 'android') return t.dark;
        return darkChk.checked ? t.dark : t.light;
      }

      function buildList() {
        const rows = messages.map((m, i) => `
          <div class="fc-row" style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; border:1px solid var(--border); border-radius:8px; padding:6px;">
            <select class="fc-side" data-i="${i}" style="flex:none;">
              <option value="left"${m.side === 'left' ? ' selected' : ''}>${L ? 'Prejeto' : 'In'}</option>
              <option value="right"${m.side === 'right' ? ' selected' : ''}>${L ? 'Poslano' : 'Out'}</option>
            </select>
            <input class="fc-text" data-i="${i}" value="${escapeHtml(m.text)}" placeholder="${L ? 'sporočilo...' : 'message...'}" style="flex:1; min-width:140px;">
            <input class="fc-time" data-i="${i}" value="${escapeHtml(m.time)}" style="width:58px;">
            <select class="fc-status" data-i="${i}" style="flex:none;">
              <option value="none"${m.status === 'none' ? ' selected' : ''}>–</option>
              <option value="sent"${m.status === 'sent' ? ' selected' : ''}>✓</option>
              <option value="delivered"${m.status === 'delivered' ? ' selected' : ''}>✓✓</option>
              <option value="read"${m.status === 'read' ? ' selected' : ''}>✓✓*</option>
            </select>
            <button class="fc-del" data-i="${i}" title="delete" style="flex:none; border:none; background:transparent; color:var(--danger,#e5484d); cursor:pointer; font-size:16px;">✕</button>
          </div>`).join('');
        listEl.innerHTML = rows || (L ? 'Ni sporočil.' : 'No messages.');

        listEl.querySelectorAll('.fc-side').forEach(el => el.addEventListener('change', () => { messages[+el.dataset.i].side = el.value; render(); }));
        listEl.querySelectorAll('.fc-text').forEach(el => el.addEventListener('input', () => { messages[+el.dataset.i].text = el.value; render(); }));
        listEl.querySelectorAll('.fc-time').forEach(el => el.addEventListener('input', () => { messages[+el.dataset.i].time = el.value; render(); }));
        listEl.querySelectorAll('.fc-status').forEach(el => el.addEventListener('change', () => { messages[+el.dataset.i].status = el.value; render(); }));
        listEl.querySelectorAll('.fc-del').forEach(el => el.addEventListener('click', () => {
          messages.splice(+el.dataset.i, 1);
          buildList();
          render();
        }));
      }

      function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
      }

      function draw() {
        const th = getTheme();
        const scale = 2;
        const W = 360;
        const padX = 10, padY = 8, lineH = 19, headerH = 56, gap = 10, nameH = 16;
        const maxBubble = W - 2 * padX;
        const cssFont = '15px -apple-system, Segoe UI, Roboto, sans-serif';

        ctx.font = cssFont;
        let y = headerH + 12;
        const layouts = [];
        for (const m of messages) {
          const isRight = m.side === 'right';
          const maxW = maxBubble - 2 * padX;
          const words = String(m.text).split(/\s+/).filter(Boolean);
          const lines = [];
          let cur = '';
          for (const w of words) {
            const test = cur ? cur + ' ' + w : w;
            if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
            else cur = test;
          }
          if (cur) lines.push(cur);
          if (lines.length === 0) lines.push('');
          const textW = Math.max(...lines.map(l => ctx.measureText(l).width), ctx.measureText(m.time).width + (isRight && m.status !== 'none' ? 22 : 0));
          const bw = Math.min(maxBubble, Math.ceil(textW) + 2 * padX);
          const bh = lines.length * lineH + 2 * padY + 4;
          const showName = !isRight && m.name;
          layouts.push({ m, isRight, lines, bw, bh, showName, x: isRight ? W - padX - bw : padX, y: y + (showName ? nameH : 0) });
          y += bh + (showName ? nameH : 0) + gap;
        }
        const H = Math.max(headerH + 24, y + 8);

        canvas.width = W * scale;
        canvas.height = H * scale;
        canvas.style.height = H + 'px';
        ctx.setTransform(scale, scale, 0, 0);
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = th.bg;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = th.header;
        ctx.fillRect(0, 0, W, headerH);
        const title = titleIn.value || (L ? 'Pogovor' : 'Chat');
        const initial = title.trim().charAt(0).toUpperCase() || '#';
        ctx.fillStyle = th.header === '#f6f6f6' ? '#34c759' : th.header;
        ctx.beginPath();
        ctx.arc(28, headerH / 2, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 28, headerH / 2 + 1);
        ctx.textAlign = 'left';
        ctx.fillStyle = th.htext;
        ctx.font = 'bold 15px -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.fillText(title, 56, headerH / 2 - 6);
        ctx.font = '11px -apple-system, Segoe UI, Roboto, sans-serif';
        ctx.fillStyle = th.htext;
        ctx.globalAlpha = 0.7;
        ctx.fillText('online', 56, headerH / 2 + 10);
        ctx.globalAlpha = 1;

        for (const it of layouts) {
          const { m, isRight, lines, bw, bh, showName, x, y } = it;
          if (showName) {
            ctx.fillStyle = th.name;
            ctx.font = '12px -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText(m.name, x, y - 4);
          }
          ctx.fillStyle = isRight ? th.right : th.left;
          roundRect(ctx, x, y, bw, bh, 14);
          ctx.fill();
          ctx.fillStyle = isRight ? th.tR : th.tL;
          ctx.font = cssFont;
          ctx.textBaseline = 'top';
          lines.forEach((ln, i) => ctx.fillText(ln, x + padX, y + padY + i * lineH));

          const timeY = y + bh - 4;
          ctx.font = '11px -apple-system, Segoe UI, Roboto, sans-serif';
          ctx.fillStyle = th.time;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          let timeX = x + bw - padX;
          if (isRight && m.status !== 'none') {
            ctx.fillStyle = m.status === 'read' ? th.tick : th.time;
            const ticks = m.status === 'sent' ? '✓' : '✓✓';
            ctx.fillText(ticks, timeX, timeY);
            timeX -= ctx.measureText(ticks).width + 4;
          }
          ctx.fillStyle = th.time;
          ctx.fillText(m.time, timeX, timeY);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
      }

      function render() { draw(); }

      themeSel.addEventListener('change', render);
      darkChk.addEventListener('change', render);
      titleIn.addEventListener('input', render);
      container.querySelector('#fc-add').addEventListener('click', () => {
        messages.push({ side: 'left', text: L ? 'Novo sporočilo' : 'New message', time: '12:00', status: 'read', name: '' });
        buildList();
        render();
      });
      container.querySelector('#fc-clear').addEventListener('click', () => {
        messages = [];
        buildList();
        render();
      });
      container.querySelector('#fc-dl').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'fake-chat.png';
        a.click();
      });

      buildList();
      render();
    }

    init();
  }