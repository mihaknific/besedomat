/** AUTO-SPLIT iz legacy/renderers.ts — kategorija editing (9 orodij). Migriraj vsak render v ToolComponent. */
function renderDuplicateWords(container) {
  const L = currentLang === 'sl';

  const sampleDw = L
    ? 'To je je test test, ki ima ima tri tri tri podvojitve.\nTudi Tudi velike Velike različice zaznamo, ko ko je možnost vklopljena.'
    : 'This is is a test test that has has three three three duplicates.\nWe We also detect Capital capital variants once the option option is enabled.';

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:16px; gap:8px 14px;">
      <label>${L ? 'Prikaz:' : 'View:'}
        <select id="dw-view">
          <option value="split" selected>${L ? 'Bočni prikaz (izvirnik | popravljeno)' : 'Side-by-Side (Original | Cleaned)'}</option>
          <option value="highlight">${L ? 'Označeno izvirno besedilo' : 'Highlighted Original'}</option>
          <option value="clean">${L ? 'Samo popravljeno besedilo' : 'Cleaned Text Only'}</option>
        </select>
      </label>
      <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="dw-nocase" checked> ${L ? 'Ignoriraj velike/male črke' : 'Ignore case'}</label>
      <label>${L ? 'Min. dolžina besede:' : 'Min word length:'}
        <input type="number" id="dw-minlen" value="1" min="1" max="20" style="width:48px;">
      </label>
    </div>

    <div class="tool-workspace-2col" style="margin-bottom:16px;">
      <div class="tool-panel">
        <label for="dw-input">${getI('ui_input')}</label>
        <textarea id="dw-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${sampleDw}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="dw-sample" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_edit} <span>${L ? 'Primer' : 'Sample'}</span></button>
          <button class="btn-sm" id="dw-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
        <div id="dw-meta" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Odstranjene podvojene besede' : 'Removed Duplicate Words'}</label>
        <div id="dw-chips" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px 16px; flex:1; min-height:140px; font-size:13px; display:flex; flex-wrap:wrap; gap:6px; align-content:flex-start;"></div>
      </div>
    </div>

    <div id="dw-stats" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;"></div>

    <div id="dw-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; font-size:13.5px; line-height:1.7; min-height:220px;"></div>

    <div class="panel-actions" style="margin-top:12px; gap:8px; flex-wrap:wrap;">
      <button class="btn-sm primary" id="dw-copy-clean" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj popravljeno besedilo' : 'Copy Cleaned Text'}</span></button>
      <button class="btn-sm" id="dw-copy-html" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj barvni HTML' : 'Copy Colored HTML'}</span></button>
      <button class="btn-sm" id="dw-copy-list" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj seznam odstranjenih' : 'Copy Removal List'}</span></button>
    </div>
  `;
  const input = container.querySelector('#dw-input');
  const viewSel = container.querySelector('#dw-view');
  const noCaseCheck = container.querySelector('#dw-nocase');
  const minLenInput = container.querySelector('#dw-minlen');
  const metaEl = container.querySelector('#dw-meta');
  const chipsEl = container.querySelector('#dw-chips');
  const statsEl = container.querySelector('#dw-stats');
  const outputWrap = container.querySelector('#dw-output-wrap');

  let cleanedText = '';
  let markedHtml = '';
  let removalList = '';

  function flashBtn(btn) {
    const oldHtml = btn.innerHTML;
    btn.innerHTML = `${SVG_ICONS.mi_check} <span>${getI('ui_copied')}</span>`;
    setTimeout(() => {
      btn.innerHTML = oldHtml;
    }, 1200);
  }

  function analyze() {
    const text = input.value;
    const ignoreCase = noCaseCheck.checked;
    const minLen = parseInt(minLenInput.value) || 1;

    const tokens = [];
    const re = /[\p{L}\p{N}]+/gu;
    let m;
    while ((m = re.exec(text)) !== null) {
      tokens.push({ w: m[0], s: m.index, e: m.index + m[0].length });
    }

    const removed = new Array(tokens.length).fill(false);
    const counts = {};
    let prevTok = null;

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const key = ignoreCase ? t.w.toLowerCase() : t.w;
      if (
        prevTok &&
        t.w.length >= minLen &&
        prevTok.key === key &&
        /^\s*$/.test(text.slice(prevTok.e, t.s))
      ) {
        removed[i] = true;
        counts[key] = (counts[key] || 0) + 1;
      }
      prevTok = { key, e: t.e };
    }

    let runsCount = 0;
    for (let i = 0; i < removed.length; i++) {
      if (removed[i] && !(i > 0 && removed[i - 1])) runsCount++;
    }

    let html = '';
    let clean = '';
    let hPos = 0;
    let cPos = 0;
    let markN = 0;
    const firstMarkId = {};

    tokens.forEach((t, i) => {
      html += escapeHtml(text.slice(hPos, t.s));
      if (removed[i]) {
        const key = ignoreCase ? t.w.toLowerCase() : t.w;
        const id = 'dw-mark-' + markN++;
        if (!(key in firstMarkId)) firstMarkId[key] = id;
        html += `<mark id="${id}" data-dwkey="${escapeHtml(key)}" style="background:rgba(239,68,68,0.35); color:#dc2626; border-radius:3px; padding:1px 3px; text-decoration:line-through;" title="${L ? 'Podvojena beseda – odstranjena' : 'Duplicate word – removed'}">${escapeHtml(t.w)}</mark>`;
        hPos = t.e;
      } else {
        html += escapeHtml(t.w);
        clean += text.slice(cPos, t.e);
        cPos = t.e;
        hPos = t.e;
      }
    });
    html += escapeHtml(text.slice(hPos));
    clean += text.slice(cPos);

    markedHtml = html;
    cleanedText = clean;
    removalList = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .map(k => `${k} ×${counts[k]}`)
      .join('\n');

    const totalRemoved = Object.values(counts).reduce((a, n) => a + n, 0);
    const uniqueCount = Object.keys(counts).length;
    const wordsAfter = tokens.length - totalRemoved;

    metaEl.textContent = text
      ? `${tokens.length} ${L ? 'besed' : 'words'} | ${text.length} ${L ? 'znakov' : 'chars'} → ${wordsAfter} ${L ? 'po čiščenju' : 'after cleaning'}`
      : '';

    if (!text.trim()) {
      statsEl.innerHTML = `<span style="font-size:12px; color:var(--text-dim);">${L ? 'Vnesite besedilo za analizo.' : 'Enter text to analyze.'}</span>`;
      chipsEl.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">${L ? 'Ni podatkov.' : 'No data.'}</span>`;
      outputWrap.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim);">${L ? 'Ni besedila za prikaz.' : 'No text to display.'}</div>`;
      return;
    }

    statsEl.innerHTML =
      totalRemoved === 0
        ? `<span style="display:inline-flex; align-items:center; gap:4px; background:rgba(34,197,94,0.15); color:#16a34a; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">${SVG_ICONS.mi_check} ${L ? 'Ni podvojenih besed' : 'No duplicate words'}</span>`
        : `<span style="display:inline-flex; align-items:center; gap:4px; background:rgba(239,68,68,0.15); color:#dc2626; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">− ${totalRemoved} ${L ? 'odstranjenih besed' : 'words removed'}</span>
             <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(245,158,11,0.15); color:#d97706; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">${runsCount} ${L ? 'mest z duplikati' : 'duplicate spots'}</span>
             <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(99,102,241,0.15); color:var(--violet); padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">${uniqueCount} ${L ? 'unikatnih besed' : 'unique words'}</span>
             <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(34,197,94,0.15); color:#16a34a; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">${tokens.length} → ${wordsAfter} ${L ? 'besed' : 'words'}</span>`;

    if (totalRemoved === 0) {
      chipsEl.innerHTML = `<span style="color:var(--text-dim); font-size:12.5px;">${L ? 'Ni podvojenih besed – besedilo je čisto.' : 'No duplicates found – text is clean.'}</span>`;
    } else {
      chipsEl.innerHTML = Object.keys(counts)
        .sort((a, b) => counts[b] - counts[a])
        .map(
          k =>
            `<button type="button" class="dw-chip" data-key="${escapeHtml(k)}" title="${L ? 'Prikači prvo pojavnost v besedilu' : 'Jump to first occurrence'}" style="cursor:pointer; border-radius:20px; padding:3px 10px; font-weight:600; display:inline-flex; align-items:center; gap:4px; background:rgba(239,68,68,0.12); color:#dc2626; border:1px solid rgba(239,68,68,0.3);">${escapeHtml(k)}<span style="opacity:.75; font-weight:400; font-size:11px;">×${counts[k]}</span></button>`
        )
        .join('');
      chipsEl.querySelectorAll('.dw-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const mk = document.getElementById(firstMarkId[btn.dataset.key]);
          if (!mk) return;
          mk.scrollIntoView({ behavior: 'smooth', block: 'center' });
          mk.style.outline = '2px solid #ef4444';
          setTimeout(() => {
            mk.style.outline = '';
          }, 1200);
        });
      });
    }

    const paneHead = (dotColor, label) =>
      `<div style="padding:8px 16px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--text-dim); background:var(--card-hover); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:7px;"><span style="width:10px; height:10px; border-radius:50%; background:${dotColor};"></span>${label}</div>`;
    const view = viewSel.value;

    if (view === 'clean') {
      outputWrap.innerHTML = `<div style="padding:14px 16px; white-space:pre-wrap; max-height:420px; overflow-y:auto;">${escapeHtml(clean)}</div>`;
    } else if (view === 'highlight') {
      outputWrap.innerHTML = `<div style="padding:14px 16px; white-space:pre-wrap; max-height:420px; overflow-y:auto;">${html}</div>`;
    } else {
      outputWrap.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));">
              <div style="border-right:1px solid var(--border);">
                ${paneHead('#ef4444', L ? 'Izvirnik (označeno)' : 'Original (marked)')}
                <div style="padding:14px 16px; white-space:pre-wrap; max-height:340px; overflow-y:auto;">${html}</div>
              </div>
              <div>
                ${paneHead('#22c55e', L ? 'Popravljeno' : 'Cleaned')}
                <div style="padding:14px 16px; white-space:pre-wrap; max-height:340px; overflow-y:auto;">${escapeHtml(clean)}</div>
              </div>
            </div>`;
    }
  }

  [input, viewSel, noCaseCheck, minLenInput].forEach(el => {
    el.addEventListener('input', analyze);
    el.addEventListener('change', analyze);
  });
  container.querySelector('#dw-sample').addEventListener('click', () => {
    input.value =
      currentLang === 'sl'
        ? 'To je je test test, ki ima ima tri tri tri podvojitve.\nTudi Tudi velike Velike različice zaznamo, ko ko je možnost vklopljena.'
        : 'This is is a test test that has has three three three duplicates.\nWe We also detect Capital capital variants once the option option is enabled.';
    analyze();
  });
  container.querySelector('#dw-clear').addEventListener('click', () => {
    input.value = '';
    analyze();
    input.focus();
  });

  container.querySelector('#dw-copy-clean').addEventListener('click', ev => {
    copyText(cleanedText, ev.currentTarget);
  });
  container.querySelector('#dw-copy-html').addEventListener('click', ev => {
    const exportHtml = `<div style="white-space:pre-wrap; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:13px; line-height:1.6;">${markedHtml}</div>`;
    copyText(exportHtml, ev.currentTarget);
  });
  container.querySelector('#dw-copy-list').addEventListener('click', ev => {
    copyText(removalList, ev.currentTarget);
  });

  analyze();
}

function renderReverseAdvanced(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način obračanja:' : 'Reverse mode:'}
        <select id="ra-mode">
          <option value="chars">${L ? 'Obrni celoten niz (znake)' : 'Reverse characters'}</option>
          <option value="words">${L ? 'Obrni vrstni red besed' : 'Reverse word order'}</option>
          <option value="lines">${L ? 'Obrni vrstni red vrstic' : 'Reverse line order'}</option>
          <option value="words_in_lines">${L ? 'Obrni besede v vsaki vrstici' : 'Reverse words in each line'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ra-input">${getI('ui_input')}</label>
        <textarea id="ra-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${L ? 'Besedomat je odlično orodje za urejanje besedil.\nHitro in varno deluje v brskalniku.' : 'Besedomat is a great tool for text manipulation.\nIt works fast and securely in your browser.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ra-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ra-output">${getI('ui_output')}</label>
        <textarea id="ra-output" readonly placeholder="${L ? 'Obrnjeno besedilo...' : 'Reversed text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ra-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ra-input');
  const mode = container.querySelector('#ra-mode');
  const output = container.querySelector('#ra-output');

  function update() {
    const text = input.value;
    const m = mode.value;
    if (m === 'chars') {
      output.value = [...text].reverse().join('');
    } else if (m === 'words') {
      output.value = text.split(/(\s+)/).reverse().join('');
    } else if (m === 'lines') {
      output.value = text.split('\n').reverse().join('\n');
    } else if (m === 'words_in_lines') {
      output.value = text
        .split('\n')
        .map(line => line.split(' ').reverse().join(' '))
        .join('\n');
    }
  }
  [input, mode].forEach(el => el.addEventListener('input', update));
  container.querySelector('#ra-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ra-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ra-copy'));
  });
  update();
}

function renderSortAdvanced(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Kriterij:' : 'Sort by:'}
        <select id="sa-mode">
          <option value="alpha">${L ? 'Po abecedi (A → Ž)' : 'Alphabetical (A → Z)'}</option>
          <option value="length">${L ? 'Po dolžini vrstice' : 'By line length'}</option>
          <option value="numeric">${L ? 'Po številkah' : 'Natural numeric'}</option>
          <option value="random">${L ? 'Naključno premešaj' : 'Random shuffle'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="sa-desc"> ${L ? 'Padajoče (Obratno)' : 'Descending'}</label>
      <label><input type="checkbox" id="sa-case"> ${L ? 'Upoštevaj velike/male črke' : 'Case sensitive'}</label>
      <label><input type="checkbox" id="sa-unique"> ${L ? 'Odstrani dvojnike' : 'Remove duplicates'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="sa-input">${getI('ui_input')}</label>
        <textarea id="sa-input" placeholder="${L ? 'Vnesite vrstice za razvrščanje...' : 'Enter lines to sort...'}">Ljubljana\nMaribor\nCelje\nKranj\nKoper\nNovo mesto\nVelenje\nNova Gorica\nKamnik\nKrško</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="sa-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="sa-output">${getI('ui_output')}</label>
        <textarea id="sa-output" readonly placeholder="${L ? 'Razvrščene vrstice...' : 'Sorted lines...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="sa-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#sa-input');
  const mode = container.querySelector('#sa-mode');
  const desc = container.querySelector('#sa-desc');
  const caseSens = container.querySelector('#sa-case');
  const unique = container.querySelector('#sa-unique');
  const output = container.querySelector('#sa-output');

  function update() {
    let lines = input.value.split('\n');
    if (unique.checked) lines = Array.from(new Set(lines));
    const m = mode.value;

    if (m === 'alpha') {
      lines.sort((a, b) => {
        const valA = caseSens.checked ? a : a.toLowerCase();
        const valB = caseSens.checked ? b : b.toLowerCase();
        return valA.localeCompare(valB, currentLang === 'sl' ? 'sl' : 'en');
      });
    } else if (m === 'length') {
      lines.sort((a, b) => a.length - b.length);
    } else if (m === 'numeric') {
      lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    } else if (m === 'random') {
      for (let i = lines.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        const t = lines[i];
        lines[i] = lines[j];
        lines[j] = t;
      }
    }
    if (desc.checked && m !== 'random') lines.reverse();
    output.value = lines.join('\n');
  }
  [input, mode, desc, caseSens, unique].forEach(el => el.addEventListener('input', update));
  container.querySelector('#sa-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#sa-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#sa-copy'));
  });
  update();
}

function renderDuplicateRemoverWords(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label><input type="checkbox" id="dr-case"> ${L ? 'Upoštevaj velike/male črke' : 'Case sensitive'}</label>
      <label><input type="checkbox" id="dr-punct"> ${L ? 'Ignoriraj ločila pri primerjavi' : 'Ignore punctuation'}</label>
      <label><input type="checkbox" id="dr-consec" checked> ${L ? 'Samo zaporedne ponovitve' : 'Consecutive duplicates only'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="dr-input">${getI('ui_input')}</label>
        <textarea id="dr-input" placeholder="${L ? 'Vnesite besedilo s podvojenimi besedami...' : 'Enter text with duplicate words...'}">${L ? 'To je je zelo zelo dober dober primer primer besedila.' : 'This is is a very very good good example example text.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="dr-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="dr-output">${getI('ui_output')}</label>
        <textarea id="dr-output" readonly placeholder="${L ? 'Besedilo brez podvojenih besed...' : 'Clean text without duplicates...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="dr-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#dr-input');
  const caseSens = container.querySelector('#dr-case');
  const consec = container.querySelector('#dr-consec');
  const output = container.querySelector('#dr-output');

  function update() {
    const text = input.value;
    const tokens = text.split(/(\s+)/);
    const result = [];
    const seen = new Set();
    let lastWord = '';

    tokens.forEach(tok => {
      if (/^\s+$/.test(tok)) {
        result.push(tok);
        return;
      }
      const cmp = caseSens.checked ? tok : tok.toLowerCase();
      if (consec.checked) {
        if (cmp !== lastWord) {
          result.push(tok);
          lastWord = cmp;
        }
      } else {
        if (!seen.has(cmp)) {
          seen.add(cmp);
          result.push(tok);
        }
      }
    });
    output.value = result.join('');
  }
  [input, caseSens, consec].forEach(el => el.addEventListener('input', update));
  container.querySelector('#dr-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#dr-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#dr-copy'));
  });
  update();
}

function renderPadText(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Širina (znakov):' : 'Width:'}
        <input type="number" id="pt-len" value="30" min="1" max="200" style="width:70px;">
      </label>
      <label>${L ? 'Znak za polnjenje:' : 'Pad char:'}
        <input type="text" id="pt-char" value=" " maxlength="5" style="width:50px; text-align:center;">
      </label>
      <label>${L ? 'Poravnava:' : 'Align:'}
        <select id="pt-pos">
          <option value="left">${L ? 'Levo (dodaj na desno)' : 'Left'}</option>
          <option value="right">${L ? 'Desno (dodaj na levo)' : 'Right'}</option>
          <option value="center">${L ? 'Sredinsko' : 'Center'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pt-input">${getI('ui_input')}</label>
        <textarea id="pt-input" placeholder="${L ? 'Vnesite vrstice...' : 'Enter lines...'}">Kava\nČaj\nSveži sok\nVoda z ledom</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pt-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="pt-output">${getI('ui_output')}</label>
        <textarea id="pt-output" readonly placeholder="${L ? 'Poravnano besedilo...' : 'Padded text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="pt-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#pt-input');
  const lenEl = container.querySelector('#pt-len');
  const charEl = container.querySelector('#pt-char');
  const pos = container.querySelector('#pt-pos');
  const output = container.querySelector('#pt-output');

  function update() {
    const targetLen = Math.max(1, parseInt(lenEl.value) || 30);
    const padChar = charEl.value || ' ';
    const p = pos.value;
    output.value = input.value
      .split('\n')
      .map(line => {
        if (line.length >= targetLen) return line;
        const diff = targetLen - line.length;
        if (p === 'left') return line + padChar.repeat(diff);
        if (p === 'right') return padChar.repeat(diff) + line;
        const leftPad = Math.floor(diff / 2);
        const rightPad = diff - leftPad;
        return padChar.repeat(leftPad) + line + padChar.repeat(rightPad);
      })
      .join('\n');
  }
  [input, lenEl, charEl, pos].forEach(el => el.addEventListener('input', update));
  container.querySelector('#pt-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#pt-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#pt-copy'));
  });
  update();
}

function renderReverseAdvanced(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način obračanja:' : 'Reverse mode:'}
        <select id="ra-mode">
          <option value="chars">${L ? 'Obrni celoten niz (znake)' : 'Reverse characters'}</option>
          <option value="words">${L ? 'Obrni vrstni red besed' : 'Reverse word order'}</option>
          <option value="lines">${L ? 'Obrni vrstni red vrstic' : 'Reverse line order'}</option>
          <option value="words_in_lines">${L ? 'Obrni besede v vsaki vrstici' : 'Reverse words in each line'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ra-input">${getI('ui_input')}</label>
        <textarea id="ra-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${L ? 'Besedomat je odlično orodje za urejanje besedil.\nHitro in varno deluje v brskalniku.' : 'Besedomat is a great tool for text manipulation.\nIt works fast and securely in your browser.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ra-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ra-output">${getI('ui_output')}</label>
        <textarea id="ra-output" readonly placeholder="${L ? 'Obrnjeno besedilo...' : 'Reversed text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ra-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ra-input');
  const mode = container.querySelector('#ra-mode');
  const output = container.querySelector('#ra-output');

  function update() {
    const text = input.value;
    const m = mode.value;
    if (m === 'chars') {
      output.value = [...text].reverse().join('');
    } else if (m === 'words') {
      output.value = text.split(/(\s+)/).reverse().join('');
    } else if (m === 'lines') {
      output.value = text.split('\n').reverse().join('\n');
    } else if (m === 'words_in_lines') {
      output.value = text
        .split('\n')
        .map(line => line.split(' ').reverse().join(' '))
        .join('\n');
    }
  }
  [input, mode].forEach(el => el.addEventListener('input', update));
  container.querySelector('#ra-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ra-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ra-copy'));
  });
  update();
}

function renderSortAdvanced(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Kriterij:' : 'Sort by:'}
        <select id="sa-mode">
          <option value="alpha">${L ? 'Po abecedi (A → Ž)' : 'Alphabetical (A → Z)'}</option>
          <option value="length">${L ? 'Po dolžini vrstice' : 'By line length'}</option>
          <option value="numeric">${L ? 'Po številkah' : 'Natural numeric'}</option>
          <option value="random">${L ? 'Naključno premešaj' : 'Random shuffle'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="sa-desc"> ${L ? 'Padajoče (Obratno)' : 'Descending'}</label>
      <label><input type="checkbox" id="sa-case"> ${L ? 'Upoštevaj velike/male črke' : 'Case sensitive'}</label>
      <label><input type="checkbox" id="sa-unique"> ${L ? 'Odstrani dvojnike' : 'Remove duplicates'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="sa-input">${getI('ui_input')}</label>
        <textarea id="sa-input" placeholder="${L ? 'Vnesite vrstice za razvrščanje...' : 'Enter lines to sort...'}">Ljubljana\nMaribor\nCelje\nKranj\nKoper\nNovo mesto\nVelenje\nNova Gorica\nKamnik\nKrško</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="sa-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="sa-output">${getI('ui_output')}</label>
        <textarea id="sa-output" readonly placeholder="${L ? 'Razvrščene vrstice...' : 'Sorted lines...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="sa-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#sa-input');
  const mode = container.querySelector('#sa-mode');
  const desc = container.querySelector('#sa-desc');
  const caseSens = container.querySelector('#sa-case');
  const unique = container.querySelector('#sa-unique');
  const output = container.querySelector('#sa-output');

  function update() {
    let lines = input.value.split('\n');
    if (unique.checked) lines = Array.from(new Set(lines));
    const m = mode.value;

    if (m === 'alpha') {
      lines.sort((a, b) => {
        const valA = caseSens.checked ? a : a.toLowerCase();
        const valB = caseSens.checked ? b : b.toLowerCase();
        return valA.localeCompare(valB, currentLang === 'sl' ? 'sl' : 'en');
      });
    } else if (m === 'length') {
      lines.sort((a, b) => a.length - b.length);
    } else if (m === 'numeric') {
      lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    } else if (m === 'random') {
      for (let i = lines.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        const t = lines[i];
        lines[i] = lines[j];
        lines[j] = t;
      }
    }
    if (desc.checked && m !== 'random') lines.reverse();
    output.value = lines.join('\n');
  }
  [input, mode, desc, caseSens, unique].forEach(el => el.addEventListener('input', update));
  container.querySelector('#sa-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#sa-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#sa-copy'));
  });
  update();
}

function renderDuplicateRemoverWords(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label><input type="checkbox" id="dr-case"> ${L ? 'Upoštevaj velike/male črke' : 'Case sensitive'}</label>
      <label><input type="checkbox" id="dr-punct"> ${L ? 'Ignoriraj ločila pri primerjavi' : 'Ignore punctuation'}</label>
      <label><input type="checkbox" id="dr-consec" checked> ${L ? 'Samo zaporedne ponovitve' : 'Consecutive duplicates only'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="dr-input">${getI('ui_input')}</label>
        <textarea id="dr-input" placeholder="${L ? 'Vnesite besedilo s podvojenimi besedami...' : 'Enter text with duplicate words...'}">${L ? 'To je je zelo zelo dober dober primer primer besedila.' : 'This is is a very very good good example example text.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="dr-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="dr-output">${getI('ui_output')}</label>
        <textarea id="dr-output" readonly placeholder="${L ? 'Besedilo brez podvojenih besed...' : 'Clean text without duplicates...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="dr-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#dr-input');
  const caseSens = container.querySelector('#dr-case');
  const consec = container.querySelector('#dr-consec');
  const output = container.querySelector('#dr-output');

  function update() {
    const text = input.value;
    const tokens = text.split(/(\s+)/);
    const result = [];
    const seen = new Set();
    let lastWord = '';

    tokens.forEach(tok => {
      if (/^\s+$/.test(tok)) {
        result.push(tok);
        return;
      }
      const cmp = caseSens.checked ? tok : tok.toLowerCase();
      if (consec.checked) {
        if (cmp !== lastWord) {
          result.push(tok);
          lastWord = cmp;
        }
      } else {
        if (!seen.has(cmp)) {
          seen.add(cmp);
          result.push(tok);
        }
      }
    });
    output.value = result.join('');
  }
  [input, caseSens, consec].forEach(el => el.addEventListener('input', update));
  container.querySelector('#dr-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#dr-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#dr-copy'));
  });
  update();
}

function renderPadText(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Širina (znakov):' : 'Width:'}
        <input type="number" id="pt-len" value="30" min="1" max="200" style="width:70px;">
      </label>
      <label>${L ? 'Znak za polnjenje:' : 'Pad char:'}
        <input type="text" id="pt-char" value=" " maxlength="5" style="width:50px; text-align:center;">
      </label>
      <label>${L ? 'Poravnava:' : 'Align:'}
        <select id="pt-pos">
          <option value="left">${L ? 'Levo (dodaj na desno)' : 'Left'}</option>
          <option value="right">${L ? 'Desno (dodaj na levo)' : 'Right'}</option>
          <option value="center">${L ? 'Sredinsko' : 'Center'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pt-input">${getI('ui_input')}</label>
        <textarea id="pt-input" placeholder="${L ? 'Vnesite vrstice...' : 'Enter lines...'}">Kava\nČaj\nSveži sok\nVoda z ledom</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pt-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="pt-output">${getI('ui_output')}</label>
        <textarea id="pt-output" readonly placeholder="${L ? 'Poravnano besedilo...' : 'Padded text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="pt-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#pt-input');
  const lenEl = container.querySelector('#pt-len');
  const charEl = container.querySelector('#pt-char');
  const pos = container.querySelector('#pt-pos');
  const output = container.querySelector('#pt-output');

  function update() {
    const targetLen = Math.max(1, parseInt(lenEl.value) || 30);
    const padChar = charEl.value || ' ';
    const p = pos.value;
    output.value = input.value
      .split('\n')
      .map(line => {
        if (line.length >= targetLen) return line;
        const diff = targetLen - line.length;
        if (p === 'left') return line + padChar.repeat(diff);
        if (p === 'right') return padChar.repeat(diff) + line;
        const leftPad = Math.floor(diff / 2);
        const rightPad = diff - leftPad;
        return padChar.repeat(leftPad) + line + padChar.repeat(rightPad);
      })
      .join('\n');
  }
  [input, lenEl, charEl, pos].forEach(el => el.addEventListener('input', update));
  container.querySelector('#pt-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#pt-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#pt-copy'));
  });
  update();
}
