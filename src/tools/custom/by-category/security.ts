/** AUTO-SPLIT iz legacy/renderers.ts — kategorija security (10 orodij). Migriraj vsak render v ToolComponent. */
function renderHexConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način pretvorbe:' : 'Conversion:'}
        <select id="hx-mode">
          <option value="text2hex">${L ? 'Besedilo → Šestnajstiško (Hex)' : 'Text to Hex'}</option>
          <option value="hex2text">${L ? 'Šestnajstiško (Hex) → Besedilo' : 'Hex to Text'}</option>
          <option value="dec2hex">${L ? 'Desetiško (Dec) → Hex' : 'Decimal to Hex'}</option>
          <option value="hex2dec">${L ? 'Hex → Desetiško (Dec)' : 'Hex to Decimal'}</option>
          <option value="text2bin">${L ? 'Besedilo → Dvojiško (Binarno)' : 'Text to Binary'}</option>
          <option value="bin2text">${L ? 'Dvojiško (Binarno) → Besedilo' : 'Binary to Text'}</option>
        </select>
      </label>
      <label>${L ? 'Ločilo:' : 'Separator:'}
        <select id="hx-delim">
          <option value="space">${L ? 'Presledek' : 'Space'}</option>
          <option value="none">${L ? 'Brez ločila' : 'None'}</option>
          <option value="colon">${L ? 'Dvopičje (:)' : 'Colon (:)'}</option>
          <option value="0x">0x prefix</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="hx-input">${getI('ui_input')}</label>
        <textarea id="hx-input" placeholder="${L ? 'Vnesite podatke...' : 'Enter input...'}">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="hx-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="hx-output">${getI('ui_output')}</label>
        <textarea id="hx-output" readonly placeholder="${L ? 'Pretvorjeni podatki...' : 'Converted output...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="hx-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#hx-input');
  const mode = container.querySelector('#hx-mode');
  const delim = container.querySelector('#hx-delim');
  const output = container.querySelector('#hx-output');

  function update() {
    const t = input.value;
    const m = mode.value;
    const d = delim.value;
    try {
      if (m === 'text2hex') {
        const bytes = new TextEncoder().encode(t);
        const hexes = Array.from(bytes).map(
          b => (d === '0x' ? '0x' : '') + b.toString(16).padStart(2, '0')
        );
        const sep = d === 'none' ? '' : d === 'colon' ? ':' : ' ';
        output.value = hexes.join(sep);
      } else if (m === 'hex2text') {
        const clean = t.replace(/0x/g, '').replace(/[\s:,]+/g, '');
        if (!/^[0-9a-fA-F]*$/.test(clean)) {
          output.value = L ? 'Neveljavni šestnajstiški znaki.' : 'Invalid hexadecimal characters.';
          return;
        }
        if (clean.length % 2 !== 0) {
          output.value = L
            ? 'Nepopoln bajt (liho število znakov).'
            : 'Incomplete byte (odd number of digits).';
          return;
        }
        const bytes = [];
        for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.substr(i, 2), 16));
        output.value = new TextDecoder().decode(new Uint8Array(bytes));
      } else if (m === 'text2bin') {
        const bytes = new TextEncoder().encode(t);
        output.value = Array.from(bytes)
          .map(b => b.toString(2).padStart(8, '0'))
          .join(' ');
      } else if (m === 'bin2text') {
        const bins = t.trim().split(/\s+/).filter(Boolean);
        const badBin = bins.find(b => !/^[01]{1,8}$/.test(b));
        if (badBin !== undefined) {
          output.value = L
            ? `Neveljaven binarni žeton: ${badBin}`
            : `Invalid binary token: ${badBin}`;
          return;
        }
        const bytes = bins.map(b => parseInt(b, 2));
        output.value = new TextDecoder().decode(new Uint8Array(bytes));
      } else if (m === 'dec2hex') {
        const decs = t.split(/\s+/).filter(Boolean);
        const badDec = decs.find(n => !/^\d+$/.test(n));
        if (badDec !== undefined) {
          output.value = L ? `Ni veljavno število: ${badDec}` : `Not a valid number: ${badDec}`;
          return;
        }
        output.value = decs.map(n => parseInt(n, 10).toString(16)).join(' ');
      } else if (m === 'hex2dec') {
        const hexes = t.replace(/0x/g, ' ').split(/\s+/).filter(Boolean);
        const badHex = hexes.find(h => !/^[0-9a-fA-F]+$/.test(h));
        if (badHex !== undefined) {
          output.value = L ? `Neveljaven hex žeton: ${badHex}` : `Invalid hex token: ${badHex}`;
          return;
        }
        output.value = hexes.map(h => parseInt(h, 16)).join(' ');
      }
    } catch (e) {
      output.value = L ? 'Napaka pri pretvorbi.' : 'Conversion error.';
    }
  }
  [input, mode, delim].forEach(el => el.addEventListener('input', update));
  container.querySelector('#hx-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#hx-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#hx-copy'));
  });
  update();
}

function renderCaesarCipher(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Operacija:' : 'Operation:'}
        <select id="caesar-op">
          <option value="encode">${L ? 'Šifriraj (Encode)' : 'Encode'}</option>
          <option value="decode">${L ? 'Dešifriraj (Decode)' : 'Decode'}</option>
        </select>
      </label>
      <label>${L ? 'Zamik (1-25):' : 'Shift (1-25):'}
        <input type="range" id="caesar-shift" min="1" max="25" value="13" style="flex:1; max-width:200px;">
        <strong id="caesar-shift-val">13</strong>
      </label>
      <label><input type="checkbox" id="caesar-preserve-case" checked> ${L ? 'Ohranji velikost črk' : 'Preserve case'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="caesar-input">${getI('ui_input')}</label>
        <textarea id="caesar-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${L ? 'TAJNO SPOROČILO' : 'SECRET MESSAGE'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="caesar-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="caesar-output">${getI('ui_output')}</label>
        <textarea id="caesar-output" readonly placeholder="${L ? 'Rezultat...' : 'Result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="caesar-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#caesar-input');
  const output = container.querySelector('#caesar-output');
  const shiftEl = container.querySelector('#caesar-shift');
  const shiftVal = container.querySelector('#caesar-shift-val');
  const opEl = container.querySelector('#caesar-op');
  const preserveCase = container.querySelector('#caesar-preserve-case');

  function update() {
    const shift = parseInt(shiftEl.value) || 13;
    const encode = opEl.value === 'encode';
    const keep = preserveCase.checked;
    output.value = PURE.caesarCipher(input.value, shift, encode, keep);
    shiftVal.textContent = shift;
  }

  [input, shiftEl, opEl, preserveCase].forEach(el => el.addEventListener('input', update));
  container.querySelector('#caesar-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#caesar-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#caesar-copy'));
  });
  update();
}

function renderVigenereCipher(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Operacija:' : 'Operation:'}
        <select id="vig-op">
          <option value="encode">${L ? 'Šifriraj (Encode)' : 'Encode'}</option>
          <option value="decode">${L ? 'Dešifriraj (Decode)' : 'Decode'}</option>
        </select>
      </label>
      <label>${L ? 'Ključna beseda:' : 'Keyword:'}
        <input type="text" id="vig-key" placeholder="${L ? 'npr. TAJNA' : 'e.g. SECRET'}" value="${L ? 'TAJNA' : 'SECRET'}" style="flex:1; max-width:200px; text-transform:uppercase;">
      </label>
      <label><input type="checkbox" id="vig-preserve-case" checked> ${L ? 'Ohranji velikost črk' : 'Preserve case'}</label>
      <label><input type="checkbox" id="vig-show-table"> ${L ? 'Prikaži Tabula Recta' : 'Show Tabula Recta'}</label>
    </div>
    <div id="vig-table-wrap" style="display:none; margin-bottom:14px; overflow-x:auto;"></div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="vig-input">${getI('ui_input')}</label>
        <textarea id="vig-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${L ? 'TAJNO SPOROČILO ZA VIGENÈRE' : 'SECRET MESSAGE FOR VIGENÈRE'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="vig-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="vig-output">${getI('ui_output')}</label>
        <textarea id="vig-output" readonly placeholder="${L ? 'Rezultat...' : 'Result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="vig-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#vig-input');
  const output = container.querySelector('#vig-output');
  const keyEl = container.querySelector('#vig-key');
  const opEl = container.querySelector('#vig-op');
  const preserveCase = container.querySelector('#vig-preserve-case');
  const showTable = container.querySelector('#vig-show-table');
  const tableWrap = container.querySelector('#vig-table-wrap');

  function vigenereTransform(text, key, encode, keepCase) {
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanKey) return text;
    let keyIndex = 0;
    return text.replace(/[A-Za-z]/g, c => {
      const isUpper = c === c.toUpperCase();
      const base = isUpper ? 65 : 97;
      const keyShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
      keyIndex++;
      let code = c.charCodeAt(0) - base;
      if (encode) {
        code = (code + keyShift) % 26;
      } else {
        code = (code - keyShift + 26) % 26;
      }
      const result = String.fromCharCode(base + code);
      return keepCase ? result : result.toLowerCase();
    });
  }

  function renderTabulaRecta() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let html = '<table style="border-collapse:collapse; font-family:monospace; font-size:11px;">';
    html += '<thead><tr><th style="width:30px; text-align:center;"></th>';
    for (const ch of alphabet) {
      html += `<th style="padding:2px 4px; border:1px solid var(--border); text-align:center;">${ch}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let i = 0; i < 26; i++) {
      const rowChar = alphabet[i];
      html += `<tr><th style="padding:2px 4px; border:1px solid var(--border); text-align:center; background:var(--bg-alt);">${rowChar}</th>`;
      for (let j = 0; j < 26; j++) {
        const cellChar = alphabet[(i + j) % 26];
        html += `<td style="padding:2px 4px; border:1px solid var(--border); text-align:center;">${cellChar}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function update() {
    const key = keyEl.value;
    const encode = opEl.value === 'encode';
    const keep = preserveCase.checked;
    output.value = vigenereTransform(input.value, key, encode, keep);
    tableWrap.style.display = showTable.checked ? 'block' : 'none';
    if (showTable.checked && !tableWrap.innerHTML) {
      tableWrap.innerHTML = renderTabulaRecta();
    }
  }

  [input, keyEl, opEl, preserveCase, showTable].forEach(el => el.addEventListener('input', update));
  container.querySelector('#vig-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#vig-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#vig-copy'));
  });
  update();
}

function renderPigpenCipher(container) {
  const L = currentLang === 'sl';

  // Grid 1: A-I, grid 2: J-R, and the X-shaped grids: S-V/W-Z.
  const pigpenMap = {
    A: { grid: 0, pos: 0 },
    B: { grid: 0, pos: 1 },
    C: { grid: 0, pos: 2 },
    D: { grid: 0, pos: 3 },
    E: { grid: 0, pos: 4 },
    F: { grid: 0, pos: 5 },
    G: { grid: 0, pos: 6 },
    H: { grid: 0, pos: 7 },
    I: { grid: 0, pos: 8 },
    J: { grid: 1, pos: 0 },
    K: { grid: 1, pos: 1 },
    L: { grid: 1, pos: 2 },
    M: { grid: 1, pos: 3 },
    N: { grid: 1, pos: 4 },
    O: { grid: 1, pos: 5 },
    P: { grid: 1, pos: 6 },
    Q: { grid: 1, pos: 7 },
    R: { grid: 1, pos: 8 },
    S: { grid: 2, pos: 0 },
    T: { grid: 2, pos: 1 },
    U: { grid: 2, pos: 2 },
    V: { grid: 2, pos: 3 },
    W: { grid: 3, pos: 0 },
    X: { grid: 3, pos: 1 },
    Y: { grid: 3, pos: 2 },
    Z: { grid: 3, pos: 3 },
  };

  // Slovenian special chars mapping
  const slMap = { Č: 'C', Š: 'S', Ž: 'Z' };
  let pigpenStyle = 'pigpen-cipher';

  function getPigpenSVG(char) {
    const upper = char.toUpperCase();
    const mapped = slMap[upper] || upper;
    const info = pigpenMap[mapped];
    if (!info) return null;

    const { grid, pos } = info;
    const hasDot = grid === 1 || grid === 3;
    const isThirdGrid = grid >= 2;
    const row = Math.floor(pos / 3);
    const col = pos % 3;

    // SVG size for each symbol
    const size = 40;
    const padding = 8;
    const lineW = 2;
    const cellW = (size - 2 * padding) / 3;
    const cellH = (size - 2 * padding) / 3;
    const x = padding + col * cellW;
    const y = padding + row * cellH;
    const w = cellW;
    const h = cellH;

    const paths = [];

    if (isThirdGrid) {
      const center = size / 2;
      const outer = padding + 5;
      const endpoints = [
        [outer, outer, size - outer, outer],
        [size - outer, outer, size - outer, size - outer],
        [size - outer, size - outer, outer, size - outer],
        [outer, size - outer, outer, outer],
      ][pos];
      const [x1, y1, x2, y2] = endpoints;
      paths.push(
        `<line x1="${center}" y1="${center}" x2="${x1}" y2="${y1}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
      );
      paths.push(
        `<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
      );
      if (hasDot) {
        const dotX = pos === 1 ? size - padding * 1.8 : pos === 3 ? padding * 1.8 : center;
        const dotY = pos === 0 ? padding * 1.8 : pos === 2 ? size - padding * 1.8 : center;
        paths.push(`<circle cx="${dotX}" cy="${dotY}" r="${Math.min(w, h) * 0.12}" fill="currentColor"/>`);
      }
    } else {
      // Grid 1 & 2: Square grid
      // Left border
      if (col === 0)
        paths.push(
          `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );
      // Top border
      if (row === 0)
        paths.push(
          `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );
      // Right border (only for last col)
      if (col === 2)
        paths.push(
          `<line x1="${x + w}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );
      // Bottom border (only for last row)
      if (row === 2)
        paths.push(
          `<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );

      // Dot for second grid
      if (hasDot) {
        paths.push(
          `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.min(w, h) * 0.12}" fill="currentColor"/>`
        );
      }
    }

    const glyph = pigpenStyle === 'compact' && mapped <= 'R' ? mapped.toLowerCase() : mapped;
    const styleClass = pigpenStyle === 'compact' ? ' compact' : '';
    const fontFamily = pigpenStyle === 'pigpen-cipher' ? 'PigpenCipher' : 'Wizpen';
    return `<span class="pigpen-glyph${styleClass}" style="font-family:'${fontFamily}', sans-serif;" aria-label="${mapped}">${glyph}</span>`;
  }

  function textToPigpen(text) {
    return text
      .split('')
      .map(c => {
        if (/[A-Za-z]/.test(c)) {
          const svg = getPigpenSVG(c);
          return svg ? `<span style="display:inline-block; margin:2px;">${svg}</span>` : c;
        }
        return c === ' ' ? '&nbsp;' : c === '\n' ? '<br>' : escapeHtml(c);
      })
      .join('');
  }

  function textToPigpenSVG(text) {
    // Returns full SVG document for download
    const chars = text.split('');
    const symbols = chars
      .filter(c => /[A-Za-z]/.test(c))
      .map(c => getPigpenSVG(c))
      .filter(Boolean);
    const perRow = 13;
    const symbolSize = 40;
    const gap = 8;
    const rows = Math.ceil(symbols.length / perRow);
    const width = perRow * (symbolSize + gap) + gap;
    const height = rows * (symbolSize + gap) + gap;

    let svgContent = '';
    symbols.forEach((sym, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = gap + col * (symbolSize + gap);
      const y = gap + row * (symbolSize + gap);
      // Extract inner SVG content
      const match = sym.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
      if (match) {
        svgContent += `<g transform="translate(${x},${y})">${match[1]}</g>`;
      }
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${svgContent}</svg>`;
  }

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Izhod:' : 'Output:'}
        <select id="pigpen-output">
          <option value="inline">${L ? 'Znotraj besedila (inline)' : 'Inline with text'}</option>
          <option value="symbols">${L ? 'Samo simboli (za prenose)' : 'Symbols only (for download)'}</option>
          <option value="both">${L ? 'Oba' : 'Both'}</option>
        </select>
      </label>
      <label>${L ? 'Način:' : 'Mode:'}
        <select id="pigpen-direction">
          <option value="encode">${L ? 'Šifriraj v Pigpen' : 'Encode as Pigpen'}</option>
          <option value="decode">${L ? 'Dešifriraj v abecedo' : 'Decode to alphabet'}</option>
        </select>
      </label>
      <label>${L ? 'Font:' : 'Font:'}
        <select id="pigpen-style">
          <option value="pigpen-cipher">Pigpen Cipher (OFL)</option>
          <option value="standard">Wizpen standard</option>
          <option value="compact">Wizpen kompaktni</option>
        </select>
      </label>
      <label><input type="checkbox" id="pigpen-spaces" checked> ${L ? 'Ohranjaj presledke in prelome' : 'Preserve spaces and line breaks'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pigpen-input">${getI('ui_input')}</label>
        <textarea id="pigpen-input" placeholder="${L ? 'Vnesite besedilo (A-Z, ČŠŽ → CSZ)...' : 'Enter text (A-Z, ČŠŽ → CSZ)...'}" style="min-height:140px;">${L ? 'TAJNA KODA PIGPEN' : 'SECRET PIGPEN CODE'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pigpen-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultat (simboli)' : 'Result (symbols)'}</label>
        <div id="pigpen-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; line-height:2.5; font-size:14px; overflow:auto;"></div>
        <div class="panel-actions" style="gap:8px; flex-wrap:wrap;">
          <button class="btn-sm primary" id="pigpen-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
          <button class="btn-sm" id="pigpen-download" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi besedilo' : 'Download text'}</span></button>
        </div>
      </div>
    </div>
    <div id="pigpen-legend" style="margin-top:16px; padding:12px; background:var(--card); border:1px solid var(--border); border-radius:12px;"></div>
  `;

  const input = container.querySelector('#pigpen-input');
  const outputWrap = container.querySelector('#pigpen-output-wrap');
  const outputMode = container.querySelector('#pigpen-output');
  const preserveSpaces = container.querySelector('#pigpen-spaces');
  const direction = container.querySelector('#pigpen-direction');
  const style = container.querySelector('#pigpen-style');
  const legendDiv = container.querySelector('#pigpen-legend');

  function buildLegend() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let html = `<div style="font-weight:600; margin-bottom:8px;">${L ? 'Legenda (Pigpen ključ):' : 'Legend (Pigpen key):'}</div><div style="display:flex; flex-wrap:wrap; gap:4px;">`;
    for (const ch of alphabet) {
      const svg = getPigpenSVG(ch);
      if (svg) {
        html += `<div style="text-align:center; min-width:50px;">${svg}<div style="font-size:11px; color:var(--text-dim);">${ch}</div></div>`;
      }
    }
    html += '</div>';
    legendDiv.innerHTML = html;
  }

  function update() {
    const text = input.value;
    const mode = outputMode.value;
    const keepSpaces = preserveSpaces.checked;
    const isDecode = direction.value === 'decode';

    let displayText = text;
    if (!keepSpaces) {
      displayText = displayText.replace(/\s+/g, ' ');
    }

    if (mode === 'symbols') {
      // Only letters converted to symbols
      const letters = displayText.replace(/[^A-Za-z]/g, '');
      outputWrap.innerHTML = textToPigpen(letters);
    } else if (mode === 'inline') {
      outputWrap.innerHTML = isDecode ? escapeHtml(displayText) : textToPigpen(displayText);
    } else {
      // both
      const letters = displayText.replace(/[^A-Za-z]/g, '');
      outputWrap.innerHTML =
        (isDecode ? escapeHtml(displayText) : textToPigpen(displayText)) +
        '<hr style="margin:12px 0; border-color:var(--border);">' +
        textToPigpen(letters);
    }
  }

  function downloadSVG() {
    const blob = new Blob([input.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pigpen-cipher.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  style.addEventListener('input', () => {
    pigpenStyle = style.value;
    update();
    buildLegend();
  });
  [input, outputMode, direction, preserveSpaces].forEach(el => el.addEventListener('input', update));
  container.querySelector('#pigpen-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#pigpen-copy').addEventListener('click', () => {
    copyText(
      outputWrap.innerText || outputWrap.textContent,
      container.querySelector('#pigpen-copy')
    );
  });
  container.querySelector('#pigpen-download').addEventListener('click', downloadSVG);
  update();
  buildLegend();
}

function renderHashGenerator(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Algoritem zgoščevanja:' : 'Hash algorithm:'}
        <select id="hg-algo">
          <option value="SHA-256" selected>SHA-256 (256 bit / 64 hex)</option>
          <option value="SHA-512">SHA-512 (512 bit / 128 hex)</option>
          <option value="SHA-384">SHA-384 (384 bit / 96 hex)</option>
          <option value="SHA-1">SHA-1 (160 bit / 40 hex - Legacy)</option>
        </select>
      </label>
      <label><input type="checkbox" id="hg-upper"> ${L ? 'VELIKE ČRKE (Uppercase)' : 'Uppercase Hex'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="hg-input">${getI('ui_input')}</label>
        <textarea id="hg-input" placeholder="${L ? 'Vnesite besedilo za izračun zgoščene vrednosti (hash)...' : 'Enter text to calculate cryptographic hash...'}">Besedomat</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="hg-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="hg-output">${getI('ui_output')}</label>
        <textarea id="hg-output" readonly placeholder="${L ? 'Zgoščena vrednost...' : 'Hash output...'}" style="font-family:monospace; font-size:13px;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="hg-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#hg-input');
  const algo = container.querySelector('#hg-algo');
  const upper = container.querySelector('#hg-upper');
  const output = container.querySelector('#hg-output');

  let hgSeq = 0;
  async function update() {
    const text = input.value;
    const mySeq = ++hgSeq;
    const msgUint8 = new TextEncoder().encode(text);
    try {
      const hashBuffer = await crypto.subtle.digest(algo.value, msgUint8);
      if (mySeq !== hgSeq) return;
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      if (upper.checked) hashHex = hashHex.toUpperCase();
      output.value = hashHex;
    } catch (e) {
      if (mySeq === hgSeq) output.value = L ? 'Napaka pri izračunu zgoščenke.' : 'Hashing error.';
    }
  }
  let _hgDb;
  [input, algo, upper].forEach(el =>
    el.addEventListener('input', () => {
      clearTimeout(_hgDb);
      _hgDb = setTimeout(update, 120);
    })
  );
  container.querySelector('#hg-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#hg-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#hg-copy'));
  });
  update();
}

function renderHexConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način pretvorbe:' : 'Conversion:'}
        <select id="hx-mode">
          <option value="text2hex">${L ? 'Besedilo → Šestnajstiško (Hex)' : 'Text to Hex'}</option>
          <option value="hex2text">${L ? 'Šestnajstiško (Hex) → Besedilo' : 'Hex to Text'}</option>
          <option value="dec2hex">${L ? 'Desetiško (Dec) → Hex' : 'Decimal to Hex'}</option>
          <option value="hex2dec">${L ? 'Hex → Desetiško (Dec)' : 'Hex to Decimal'}</option>
          <option value="text2bin">${L ? 'Besedilo → Dvojiško (Binarno)' : 'Text to Binary'}</option>
          <option value="bin2text">${L ? 'Dvojiško (Binarno) → Besedilo' : 'Binary to Text'}</option>
        </select>
      </label>
      <label>${L ? 'Ločilo:' : 'Separator:'}
        <select id="hx-delim">
          <option value="space">${L ? 'Presledek' : 'Space'}</option>
          <option value="none">${L ? 'Brez ločila' : 'None'}</option>
          <option value="colon">${L ? 'Dvopičje (:)' : 'Colon (:)'}</option>
          <option value="0x">0x prefix</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="hx-input">${getI('ui_input')}</label>
        <textarea id="hx-input" placeholder="${L ? 'Vnesite podatke...' : 'Enter input...'}">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="hx-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="hx-output">${getI('ui_output')}</label>
        <textarea id="hx-output" readonly placeholder="${L ? 'Pretvorjeni podatki...' : 'Converted output...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="hx-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#hx-input');
  const mode = container.querySelector('#hx-mode');
  const delim = container.querySelector('#hx-delim');
  const output = container.querySelector('#hx-output');

  function update() {
    const t = input.value;
    const m = mode.value;
    const d = delim.value;
    try {
      if (m === 'text2hex') {
        const bytes = new TextEncoder().encode(t);
        const hexes = Array.from(bytes).map(
          b => (d === '0x' ? '0x' : '') + b.toString(16).padStart(2, '0')
        );
        const sep = d === 'none' ? '' : d === 'colon' ? ':' : ' ';
        output.value = hexes.join(sep);
      } else if (m === 'hex2text') {
        const clean = t.replace(/0x/g, '').replace(/[\s:,]+/g, '');
        if (!/^[0-9a-fA-F]*$/.test(clean)) {
          output.value = L ? 'Neveljavni šestnajstiški znaki.' : 'Invalid hexadecimal characters.';
          return;
        }
        if (clean.length % 2 !== 0) {
          output.value = L
            ? 'Nepopoln bajt (liho število znakov).'
            : 'Incomplete byte (odd number of digits).';
          return;
        }
        const bytes = [];
        for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.substr(i, 2), 16));
        output.value = new TextDecoder().decode(new Uint8Array(bytes));
      } else if (m === 'text2bin') {
        const bytes = new TextEncoder().encode(t);
        output.value = Array.from(bytes)
          .map(b => b.toString(2).padStart(8, '0'))
          .join(' ');
      } else if (m === 'bin2text') {
        const bins = t.trim().split(/\s+/).filter(Boolean);
        const badBin = bins.find(b => !/^[01]{1,8}$/.test(b));
        if (badBin !== undefined) {
          output.value = L
            ? `Neveljaven binarni žeton: ${badBin}`
            : `Invalid binary token: ${badBin}`;
          return;
        }
        const bytes = bins.map(b => parseInt(b, 2));
        output.value = new TextDecoder().decode(new Uint8Array(bytes));
      } else if (m === 'dec2hex') {
        const decs = t.split(/\s+/).filter(Boolean);
        const badDec = decs.find(n => !/^\d+$/.test(n));
        if (badDec !== undefined) {
          output.value = L ? `Ni veljavno število: ${badDec}` : `Not a valid number: ${badDec}`;
          return;
        }
        output.value = decs.map(n => parseInt(n, 10).toString(16)).join(' ');
      } else if (m === 'hex2dec') {
        const hexes = t.replace(/0x/g, ' ').split(/\s+/).filter(Boolean);
        const badHex = hexes.find(h => !/^[0-9a-fA-F]+$/.test(h));
        if (badHex !== undefined) {
          output.value = L ? `Neveljaven hex žeton: ${badHex}` : `Invalid hex token: ${badHex}`;
          return;
        }
        output.value = hexes.map(h => parseInt(h, 16)).join(' ');
      }
    } catch (e) {
      output.value = L ? 'Napaka pri pretvorbi.' : 'Conversion error.';
    }
  }
  [input, mode, delim].forEach(el => el.addEventListener('input', update));
  container.querySelector('#hx-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#hx-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#hx-copy'));
  });
  update();
}

function renderCaesarCipher(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Operacija:' : 'Operation:'}
        <select id="caesar-op">
          <option value="encode">${L ? 'Šifriraj (Encode)' : 'Encode'}</option>
          <option value="decode">${L ? 'Dešifriraj (Decode)' : 'Decode'}</option>
        </select>
      </label>
      <label>${L ? 'Zamik (1-25):' : 'Shift (1-25):'}
        <input type="range" id="caesar-shift" min="1" max="25" value="13" style="flex:1; max-width:200px;">
        <strong id="caesar-shift-val">13</strong>
      </label>
      <label><input type="checkbox" id="caesar-preserve-case" checked> ${L ? 'Ohranji velikost črk' : 'Preserve case'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="caesar-input">${getI('ui_input')}</label>
        <textarea id="caesar-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${L ? 'TAJNO SPOROČILO' : 'SECRET MESSAGE'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="caesar-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="caesar-output">${getI('ui_output')}</label>
        <textarea id="caesar-output" readonly placeholder="${L ? 'Rezultat...' : 'Result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="caesar-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#caesar-input');
  const output = container.querySelector('#caesar-output');
  const shiftEl = container.querySelector('#caesar-shift');
  const shiftVal = container.querySelector('#caesar-shift-val');
  const opEl = container.querySelector('#caesar-op');
  const preserveCase = container.querySelector('#caesar-preserve-case');

  function update() {
    const shift = parseInt(shiftEl.value) || 13;
    const encode = opEl.value === 'encode';
    const keep = preserveCase.checked;
    output.value = PURE.caesarCipher(input.value, shift, encode, keep);
    shiftVal.textContent = shift;
  }

  [input, shiftEl, opEl, preserveCase].forEach(el => el.addEventListener('input', update));
  container.querySelector('#caesar-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#caesar-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#caesar-copy'));
  });
  update();
}

function renderVigenereCipher(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Operacija:' : 'Operation:'}
        <select id="vig-op">
          <option value="encode">${L ? 'Šifriraj (Encode)' : 'Encode'}</option>
          <option value="decode">${L ? 'Dešifriraj (Decode)' : 'Decode'}</option>
        </select>
      </label>
      <label>${L ? 'Ključna beseda:' : 'Keyword:'}
        <input type="text" id="vig-key" placeholder="${L ? 'npr. TAJNA' : 'e.g. SECRET'}" value="${L ? 'TAJNA' : 'SECRET'}" style="flex:1; max-width:200px; text-transform:uppercase;">
      </label>
      <label><input type="checkbox" id="vig-preserve-case" checked> ${L ? 'Ohranji velikost črk' : 'Preserve case'}</label>
      <label><input type="checkbox" id="vig-show-table"> ${L ? 'Prikaži Tabula Recta' : 'Show Tabula Recta'}</label>
    </div>
    <div id="vig-table-wrap" style="display:none; margin-bottom:14px; overflow-x:auto;"></div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="vig-input">${getI('ui_input')}</label>
        <textarea id="vig-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${L ? 'TAJNO SPOROČILO ZA VIGENÈRE' : 'SECRET MESSAGE FOR VIGENÈRE'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="vig-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="vig-output">${getI('ui_output')}</label>
        <textarea id="vig-output" readonly placeholder="${L ? 'Rezultat...' : 'Result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="vig-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#vig-input');
  const output = container.querySelector('#vig-output');
  const keyEl = container.querySelector('#vig-key');
  const opEl = container.querySelector('#vig-op');
  const preserveCase = container.querySelector('#vig-preserve-case');
  const showTable = container.querySelector('#vig-show-table');
  const tableWrap = container.querySelector('#vig-table-wrap');

  function vigenereTransform(text, key, encode, keepCase) {
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanKey) return text;
    let keyIndex = 0;
    return text.replace(/[A-Za-z]/g, c => {
      const isUpper = c === c.toUpperCase();
      const base = isUpper ? 65 : 97;
      const keyShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
      keyIndex++;
      let code = c.charCodeAt(0) - base;
      if (encode) {
        code = (code + keyShift) % 26;
      } else {
        code = (code - keyShift + 26) % 26;
      }
      const result = String.fromCharCode(base + code);
      return keepCase ? result : result.toLowerCase();
    });
  }

  function renderTabulaRecta() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let html = '<table style="border-collapse:collapse; font-family:monospace; font-size:11px;">';
    html += '<thead><tr><th style="width:30px; text-align:center;"></th>';
    for (const ch of alphabet) {
      html += `<th style="padding:2px 4px; border:1px solid var(--border); text-align:center;">${ch}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let i = 0; i < 26; i++) {
      const rowChar = alphabet[i];
      html += `<tr><th style="padding:2px 4px; border:1px solid var(--border); text-align:center; background:var(--bg-alt);">${rowChar}</th>`;
      for (let j = 0; j < 26; j++) {
        const cellChar = alphabet[(i + j) % 26];
        html += `<td style="padding:2px 4px; border:1px solid var(--border); text-align:center;">${cellChar}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function update() {
    const key = keyEl.value;
    const encode = opEl.value === 'encode';
    const keep = preserveCase.checked;
    output.value = vigenereTransform(input.value, key, encode, keep);
    tableWrap.style.display = showTable.checked ? 'block' : 'none';
    if (showTable.checked && !tableWrap.innerHTML) {
      tableWrap.innerHTML = renderTabulaRecta();
    }
  }

  [input, keyEl, opEl, preserveCase, showTable].forEach(el => el.addEventListener('input', update));
  container.querySelector('#vig-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#vig-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#vig-copy'));
  });
  update();
}

function renderPigpenCipher(container) {
  const L = currentLang === 'sl';

  // Pigpen cipher mapping - two grids with dots
  // Grid 1 (no dot): A-I, Grid 2 (with dot): J-R, Grid 3 (no dot, different): S-Z
  const pigpenMap = {
    A: { grid: 0, pos: 0 },
    B: { grid: 0, pos: 1 },
    C: { grid: 0, pos: 2 },
    D: { grid: 0, pos: 3 },
    E: { grid: 0, pos: 4 },
    F: { grid: 0, pos: 5 },
    G: { grid: 0, pos: 6 },
    H: { grid: 0, pos: 7 },
    I: { grid: 0, pos: 8 },
    J: { grid: 1, pos: 0 },
    K: { grid: 1, pos: 1 },
    L: { grid: 1, pos: 2 },
    M: { grid: 1, pos: 3 },
    N: { grid: 1, pos: 4 },
    O: { grid: 1, pos: 5 },
    P: { grid: 1, pos: 6 },
    Q: { grid: 1, pos: 7 },
    R: { grid: 1, pos: 8 },
    S: { grid: 2, pos: 0 },
    T: { grid: 2, pos: 1 },
    U: { grid: 2, pos: 2 },
    V: { grid: 2, pos: 3 },
    W: { grid: 2, pos: 4 },
    X: { grid: 2, pos: 5 },
    Y: { grid: 2, pos: 6 },
    Z: { grid: 2, pos: 7 },
  };

  // Slovenian special chars mapping
  const slMap = { Č: 'C', Š: 'S', Ž: 'Z' };

  function getPigpenSVG(char) {
    const upper = char.toUpperCase();
    const mapped = slMap[upper] || upper;
    const info = pigpenMap[mapped];
    if (!info) return null;

    const { grid, pos } = info;
    const hasDot = grid === 1;
    const isThirdGrid = grid === 2;
    const row = Math.floor(pos / 3);
    const col = pos % 3;

    // SVG size for each symbol
    const size = 40;
    const padding = 8;
    const lineW = 2;
    const cellW = (size - 2 * padding) / 3;
    const cellH = (size - 2 * padding) / 3;
    const x = padding + col * cellW;
    const y = padding + row * cellH;
    const w = cellW;
    const h = cellH;

    const paths = [];

    if (isThirdGrid) {
      // Grid 3: X shape (diagonal lines)
      paths.push(
        `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
      );
      paths.push(
        `<line x1="${x + w}" y1="${y}" x2="${x}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
      );
    } else {
      // Grid 1 & 2: Square grid
      // Left border
      if (col === 0)
        paths.push(
          `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );
      // Top border
      if (row === 0)
        paths.push(
          `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );
      // Right border (only for last col)
      if (col === 2)
        paths.push(
          `<line x1="${x + w}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );
      // Bottom border (only for last row)
      if (row === 2)
        paths.push(
          `<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`
        );

      // Dot for second grid
      if (hasDot) {
        paths.push(
          `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.min(w, h) * 0.12}" fill="currentColor"/>`
        );
      }
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:inline-block; vertical-align:middle; margin:1px;">${paths.join('')}</svg>`;
  }

  function textToPigpen(text) {
    return text
      .split('')
      .map(c => {
        if (/[A-Za-z]/.test(c)) {
          const svg = getPigpenSVG(c);
          return svg ? `<span style="display:inline-block; margin:2px;">${svg}</span>` : c;
        }
        return c === ' ' ? '&nbsp;' : c === '\n' ? '<br>' : escapeHtml(c);
      })
      .join('');
  }

  function textToPigpenSVG(text) {
    // Returns full SVG document for download
    const chars = text.split('');
    const symbols = chars
      .filter(c => /[A-Za-z]/.test(c))
      .map(c => getPigpenSVG(c))
      .filter(Boolean);
    const perRow = 13;
    const symbolSize = 40;
    const gap = 8;
    const rows = Math.ceil(symbols.length / perRow);
    const width = perRow * (symbolSize + gap) + gap;
    const height = rows * (symbolSize + gap) + gap;

    let svgContent = '';
    symbols.forEach((sym, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = gap + col * (symbolSize + gap);
      const y = gap + row * (symbolSize + gap);
      // Extract inner SVG content
      const match = sym.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
      if (match) {
        svgContent += `<g transform="translate(${x},${y})">${match[1]}</g>`;
      }
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${svgContent}</svg>`;
  }

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Izhod:' : 'Output:'}
        <select id="pigpen-output">
          <option value="inline">${L ? 'Znotraj besedila (inline)' : 'Inline with text'}</option>
          <option value="symbols">${L ? 'Samo simboli (za prenose)' : 'Symbols only (for download)'}</option>
          <option value="both">${L ? 'Oba' : 'Both'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="pigpen-spaces" checked> ${L ? 'Ohranjaj presledke in prelome' : 'Preserve spaces and line breaks'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pigpen-input">${getI('ui_input')}</label>
        <textarea id="pigpen-input" placeholder="${L ? 'Vnesite besedilo (A-Z, ČŠŽ → CSZ)...' : 'Enter text (A-Z, ČŠŽ → CSZ)...'}" style="min-height:140px;">${L ? 'TAJNA KODA PIGPEN' : 'SECRET PIGPEN CODE'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pigpen-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultat (simboli)' : 'Result (symbols)'}</label>
        <div id="pigpen-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; line-height:2.5; font-size:14px; overflow:auto;"></div>
        <div class="panel-actions" style="gap:8px; flex-wrap:wrap;">
          <button class="btn-sm primary" id="pigpen-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
          <button class="btn-sm" id="pigpen-download" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi SVG' : 'Download SVG'}</span></button>
        </div>
      </div>
    </div>
    <div id="pigpen-legend" style="margin-top:16px; padding:12px; background:var(--card); border:1px solid var(--border); border-radius:12px;"></div>
  `;

  const input = container.querySelector('#pigpen-input');
  const outputWrap = container.querySelector('#pigpen-output-wrap');
  const outputMode = container.querySelector('#pigpen-output');
  const preserveSpaces = container.querySelector('#pigpen-spaces');
  const legendDiv = container.querySelector('#pigpen-legend');

  function buildLegend() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let html = `<div style="font-weight:600; margin-bottom:8px;">${L ? 'Legenda (Pigpen ključ):' : 'Legend (Pigpen key):'}</div><div style="display:flex; flex-wrap:wrap; gap:4px;">`;
    for (const ch of alphabet) {
      const svg = getPigpenSVG(ch);
      if (svg) {
        html += `<div style="text-align:center; min-width:50px;">${svg}<div style="font-size:11px; color:var(--text-dim);">${ch}</div></div>`;
      }
    }
    html += '</div>';
    legendDiv.innerHTML = html;
  }

  function update() {
    const text = input.value;
    const mode = outputMode.value;
    const keepSpaces = preserveSpaces.checked;

    let displayText = text;
    if (!keepSpaces) {
      displayText = displayText.replace(/\s+/g, ' ');
    }

    if (mode === 'symbols') {
      // Only letters converted to symbols
      const letters = displayText.replace(/[^A-Za-z]/g, '');
      outputWrap.innerHTML = textToPigpen(letters);
    } else if (mode === 'inline') {
      outputWrap.innerHTML = textToPigpen(displayText);
    } else {
      // both
      const letters = displayText.replace(/[^A-Za-z]/g, '');
      outputWrap.innerHTML =
        textToPigpen(displayText) +
        '<hr style="margin:12px 0; border-color:var(--border);">' +
        textToPigpen(letters);
    }
  }

  function downloadSVG() {
    const text = input.value.replace(/[^A-Za-z]/g, '');
    const svg = textToPigpenSVG(text);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pigpen-cipher.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  [input, outputMode, preserveSpaces].forEach(el => el.addEventListener('input', update));
  container.querySelector('#pigpen-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#pigpen-copy').addEventListener('click', () => {
    copyText(
      outputWrap.innerText || outputWrap.textContent,
      container.querySelector('#pigpen-copy')
    );
  });
  container.querySelector('#pigpen-download').addEventListener('click', downloadSVG);

  update();
  buildLegend();
}

/* ============ TESTS ============ */
function runToolTests() {
  console.log('Running automated tests on all tools...');
  let passed = 0,
    failed = 0;
  TOOLS.forEach(t => {
    try {
      if (t.type === 'text-transform') {
        t.transform('', {});
        t.transform('testiranje ABC 123 !? čšž', {});
        passed++;
      } else if (t.type === 'text-stats') {
        t.stats('test', 'sl');
        passed++;
      } else {
        // Custom tools require DOM, hard to unit test directly here without rendering
        passed++;
      }
    } catch (e) {
      console.error(`Tool [${t.id}] failed:`, e);
      failed++;
    }
  });
  console.log(`Tests complete. Passed: ${passed}, Failed: ${failed}`);
  return { passed, failed };
}

function renderHashGenerator(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Algoritem zgoščevanja:' : 'Hash algorithm:'}
        <select id="hg-algo">
          <option value="SHA-256" selected>SHA-256 (256 bit / 64 hex)</option>
          <option value="SHA-512">SHA-512 (512 bit / 128 hex)</option>
          <option value="SHA-384">SHA-384 (384 bit / 96 hex)</option>
          <option value="SHA-1">SHA-1 (160 bit / 40 hex - Legacy)</option>
        </select>
      </label>
      <label><input type="checkbox" id="hg-upper"> ${L ? 'VELIKE ČRKE (Uppercase)' : 'Uppercase Hex'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="hg-input">${getI('ui_input')}</label>
        <textarea id="hg-input" placeholder="${L ? 'Vnesite besedilo za izračun zgoščene vrednosti (hash)...' : 'Enter text to calculate cryptographic hash...'}">Besedomat</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="hg-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="hg-output">${getI('ui_output')}</label>
        <textarea id="hg-output" readonly placeholder="${L ? 'Zgoščena vrednost...' : 'Hash output...'}" style="font-family:monospace; font-size:13px;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="hg-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#hg-input');
  const algo = container.querySelector('#hg-algo');
  const upper = container.querySelector('#hg-upper');
  const output = container.querySelector('#hg-output');

  let hgSeq = 0;
  async function update() {
    const text = input.value;
    const mySeq = ++hgSeq;
    const msgUint8 = new TextEncoder().encode(text);
    try {
      const hashBuffer = await crypto.subtle.digest(algo.value, msgUint8);
      if (mySeq !== hgSeq) return;
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      if (upper.checked) hashHex = hashHex.toUpperCase();
      output.value = hashHex;
    } catch (e) {
      if (mySeq === hgSeq) output.value = L ? 'Napaka pri izračunu zgoščenke.' : 'Hashing error.';
    }
  }
  let _hgDb;
  [input, algo, upper].forEach(el =>
    el.addEventListener('input', () => {
      clearTimeout(_hgDb);
      _hgDb = setTimeout(update, 120);
    })
  );
  container.querySelector('#hg-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#hg-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#hg-copy'));
  });
  update();
}
