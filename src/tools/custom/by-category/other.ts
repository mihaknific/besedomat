/** AUTO-SPLIT iz legacy/renderers.ts — kategorija other (82 orodij). Migriraj vsak render v ToolComponent. */
function renderUnifiedCounter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col" style="grid-template-columns:1fr;">
      <div class="tool-panel" style="max-width:100%;">
        <label for="uc-input">${getI('ui_input')}</label>
        <textarea id="uc-input" placeholder="${L ? 'Vnesite ali prilepite besedilo za analizo...' : 'Type or paste text to analyze...'}" style="min-height:180px;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="uc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
    </div>
    <div class="stats-row" id="uc-stats" style="margin-top:16px;"></div>
    <div id="uc-detail" style="margin-top:12px; color:var(--text-dim); font-size:13px; line-height:1.7;"></div>
  `;
  const input = container.querySelector('#uc-input');
  const statsWrap = container.querySelector('#uc-stats');
  const detailWrap = container.querySelector('#uc-detail');

  function update() {
    const r = PURE.computeTextStats(input.value, currentLang);
    const metrics = [
      { lbl: L ? 'Vse besede' : 'All Words', val: r.totalWords },
      { lbl: L ? 'Samo besede' : 'Words Only', val: r.wordsOnly },
      { lbl: L ? 'Števila' : 'Numbers', val: r.numbers },
      { lbl: L ? 'Znaki (s presledki)' : 'Chars (with spaces)', val: r.charsAll },
      { lbl: L ? 'Znaki (brez presledkov)' : 'Chars (no spaces)', val: r.charsNoSpace },
      { lbl: L ? 'Presledki' : 'Spaces', val: r.spaces },
      { lbl: L ? 'Stavki' : 'Sentences', val: r.sentences },
      { lbl: L ? 'Odstavki' : 'Paragraphs', val: r.paragraphs },
      { lbl: L ? 'Vrstice' : 'Lines', val: r.lines },
      {
        lbl: L ? 'Čas branja' : 'Reading time',
        val: r.totalWords === 0 ? '-' : r.readMins + ' min',
      },
      {
        lbl: L ? 'Čas govora' : 'Speaking time',
        val: r.totalWords === 0 ? '-' : r.speakMins + ' min',
      },
    ];

    statsWrap.innerHTML = metrics
      .map(
        m => `
          <div class="stat-box"><div class="num">${m.val}</div><div class="lbl">${m.lbl}</div></div>
        `
      )
      .join('');

    if (r.totalWords > 0) {
      let details = `
            ${L ? 'Povprečna dolžina besede' : 'Avg word length'}: <strong>${r.avgWordLen}</strong> ${L ? 'znakov' : 'chars'}
            &nbsp;|&nbsp; ${L ? 'Edinstvene besede' : 'Unique words'}: <strong>${r.uniqueWords}</strong>
            &nbsp;|&nbsp; ${L ? 'Leksična gostota' : 'Lexical density'}: <strong>${r.lexDensity}%</strong>
          `;
      if (r.longestWord) {
        details += ` &nbsp;|&nbsp; ${L ? 'Najdaljša beseda' : 'Longest word'}: <strong>»${escapeHtml(r.longestWord)}«</strong> (${r.longestWord.length} ${L ? 'črk' : 'letters'})`;
      }
      if (r.mixedWords > 0) {
        details += ` &nbsp;|&nbsp; ${L ? 'Kombinirane besede (npr. MP3, COVID-19)' : 'Alphanumeric tokens'}: <strong>${r.mixedWords}</strong>`;
      }
      detailWrap.innerHTML = details;
    } else {
      detailWrap.innerHTML = '';
    }
  }

  let dt;
  input.addEventListener('input', () => {
    clearTimeout(dt);
    dt = setTimeout(update, 80);
  });
  container.querySelector('#uc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
}

function renderWordCloud(container) {
  const L = currentLang === 'sl';

  /* POGOSTE BESEDE (stop words) – razdeljene po besednih vrstah */
  const WC_STOP_GROUPS = {
    sl: {
      conj: [
        'in',
        'ter',
        'pa',
        'da',
        'ali',
        'ki',
        'ko',
        'če',
        'ker',
        'toda',
        'ampak',
        'vendar',
        'temveč',
        'saj',
        'kajti',
        'torej',
        'čeprav',
        'kadar',
        'kot',
      ],
      prep: [
        'za',
        'na',
        'v',
        'z',
        's',
        'pri',
        'po',
        'ob',
        'od',
        'do',
        'iz',
        'o',
        'k',
        'g',
        'med',
        'pred',
        'pod',
        'nad',
        'brez',
        'skozi',
        'proti',
      ],
      pron: [
        'ta',
        'to',
        'te',
        'ti',
        'tega',
        'temu',
        'tem',
        'tej',
        'teh',
        'temi',
        'tisti',
        'tisto',
        'tista',
        'vse',
        'vsi',
        'vsak',
        'vsaka',
        'vsako',
        'nekaj',
        'nekdo',
        'nihče',
        'nič',
        'kdo',
        'kaj',
        'jaz',
        'on',
        'ona',
        'ono',
        'midva',
        'vidva',
        'onadva',
        'mi',
        'vi',
        'oni',
        'one',
        'mene',
        'tebe',
        'njega',
        'nje',
        'naju',
        'vaju',
        'njih',
        'nas',
        'vas',
        'mu',
        'ji',
        'jima',
        'jim',
        'nam',
        'vam',
        'se',
      ],
      aux: [
        'je',
        'so',
        'bo',
        'bom',
        'boš',
        'bomo',
        'boste',
        'bodo',
        'bil',
        'bila',
        'bilo',
        'bili',
        'bile',
        'sem',
        'si',
        'smo',
        'ste',
        'ima',
        'imamo',
        'imate',
        'imajo',
        'imeti',
        'imel',
        'imela',
        'mora',
        'moramo',
        'morate',
        'morajo',
        'hoče',
        'želijo',
        'lahko',
      ],
      adv: [
        'tudi',
        'že',
        'še',
        'le',
        'kar',
        'zelo',
        'tako',
        'kako',
        'zakaj',
        'kje',
        'kdaj',
        'kam',
        'kod',
        'mnogo',
        'več',
        'manj',
      ],
    },
    en: {
      conj: [
        'the',
        'a',
        'an',
        'and',
        'or',
        'but',
        'nor',
        'so',
        'yet',
        'as',
        'until',
        'while',
        'than',
      ],
      prep: [
        'for',
        'at',
        'by',
        'from',
        'in',
        'into',
        'of',
        'off',
        'on',
        'onto',
        'out',
        'over',
        'to',
        'up',
        'with',
        'within',
        'without',
        'about',
        'against',
        'between',
        'through',
        'during',
        'before',
        'after',
        'above',
        'below',
      ],
      pron: [
        'i',
        'me',
        'my',
        'myself',
        'we',
        'us',
        'our',
        'ours',
        'ourselves',
        'you',
        'your',
        'yours',
        'yourself',
        'yourselves',
        'he',
        'him',
        'his',
        'himself',
        'she',
        'her',
        'hers',
        'herself',
        'it',
        'its',
        'itself',
        'they',
        'them',
        'their',
        'theirs',
        'themselves',
        'what',
        'which',
        'who',
        'whom',
        'this',
        'that',
        'these',
        'those',
        'all',
        'any',
        'both',
        'each',
        'few',
        'other',
        'some',
        'such',
        'own',
        'same',
      ],
      aux: [
        'is',
        'are',
        'am',
        'was',
        'were',
        'be',
        'been',
        'being',
        'have',
        'has',
        'had',
        'having',
        'do',
        'does',
        'did',
        'doing',
        'can',
        'could',
        'shall',
        'should',
        'will',
        'would',
        'may',
        'might',
        'must',
      ],
      adv: [
        'no',
        'not',
        'only',
        'too',
        'very',
        'just',
        'more',
        'most',
        'where',
        'when',
        'why',
        'how',
      ],
    },
  };

  const WC_GROUP_LABELS = {
    sl: {
      conj: 'Vezniki',
      prep: 'Predlogi',
      pron: 'Zaimki',
      aux: 'Pomožni & modalni glagoli',
      adv: 'Prislovi in delci',
    },
    en: {
      conj: 'Conjunctions & articles',
      prep: 'Prepositions',
      pron: 'Pronouns & determiners',
      aux: 'Auxiliary & modal verbs',
      adv: 'Adverbs & negations',
    },
  };

  const PALETTES = {
    indigo: [
      '#4f46e5',
      '#6366f1',
      '#818cf8',
      '#e11d48',
      '#f43f5e',
      '#fb7185',
      '#a855f7',
      '#c084fc',
    ],
    ocean: ['#0d9488', '#14b8a6', '#2dd4bf', '#0284c7', '#0ea5e9', '#38bdf8', '#2563eb', '#3b82f6'],
    sunset: [
      '#dc2626',
      '#ef4444',
      '#f87171',
      '#ea580c',
      '#f97316',
      '#fb923c',
      '#d97706',
      '#f59e0b',
    ],
    nature: [
      '#059669',
      '#10b981',
      '#34d399',
      '#65a30d',
      '#84cc16',
      '#a3e635',
      '#047857',
      '#15803d',
    ],
    rainbow: [
      '#e11d48',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#06b6d4',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
    ],
    mono: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
  };

  const sampleSl = `Besedomat je sodobno spletno orodje za obdelavo in analizo besedil. Z orodji lahko preštejete besede, analizirate frekvenco besed, pretvarjate velikost črk ter ustvarjate čudovite vizualizacije. Oblak besed samodejno prepozna ključne besede in pomembne pojme v vsakem besedilu. Analiza besedila in izločanje pogostih besed omogočata hiter pregled nad vsebino člankov, poročil in dokumentov. Besedomat deluje hitro, varno in neposredno v brskalniku brez pošiljanja podatkov na zunanje strežnike.`;
  const sampleEn = `Besedomat is a modern online text toolkit and language analysis suite. With these tools you can count words, analyze word frequency, transform text cases, and create beautiful word clouds. The word cloud generator automatically identifies keywords and key concepts in any text. Text analysis and stop word filtering provide an instant overview of articles, essays, and documents. Besedomat works fast, securely, and completely in your browser without sending data to servers.`;

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px; gap:8px 14px;">
      <div style="width:100%; display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--text-dimmer);">
        ${SVG_ICONS.mi_filter} ${L ? 'Nastavitve in filtri oblaka' : 'Cloud Settings & Filters'}
      </div>
      <div class="custom-dropdown-wrap" id="wc-filter-wrap">
        <button type="button" class="dropdown-btn" id="wc-filter-btn" aria-haspopup="true" aria-expanded="false" title="${L ? 'Pogoste besede so besede brez velike vsebinske teže (vezniki, predlogi, zaimki …), ki jih oblak lahko izloči.' : 'Common words are low-meaning words (conjunctions, prepositions, pronouns…) that the cloud can exclude.'}">
          <span>${L ? 'Pogoste besede:' : 'Common words:'}</span>
          <span id="wc-filter-count" style="background:rgba(99,102,241,0.12); color:var(--violet); border-radius:99px; padding:2px 9px; font-size:11px;"></span>
          <span class="arrow-icon">▼</span>
        </button>
        <div class="dropdown-menu" id="wc-filter-menu" style="left:0; right:auto; min-width:270px;"></div>
      </div>
      <label>${L ? 'Min. dolžina:' : 'Min length:'}
        <input type="number" id="wc-minlen" value="3" min="1" max="15" style="width:48px;">
      </label>
      <label>${L ? 'Min. ponovitev:' : 'Min freq:'}
        <input type="number" id="wc-minfreq" value="1" min="1" max="20" style="width:48px;">
      </label>
      <label>${L ? 'Max besed:' : 'Max words:'}
        <select id="wc-maxwords">
          <option value="30">30</option>
          <option value="50" selected>50</option>
          <option value="80">80</option>
          <option value="120">120</option>
        </select>
      </label>
      <label>${L ? 'Barve:' : 'Colors:'}
        <select id="wc-palette">
          <option value="indigo">Indigo & Crimson</option>
          <option value="ocean">Ocean Teal & Blue</option>
          <option value="sunset">Sunset Fire</option>
          <option value="nature">Emerald Nature</option>
          <option value="rainbow">Vibrant Rainbow</option>
          <option value="mono">Monochrome</option>
        </select>
      </label>
      <label>${L ? 'Postavitev:' : 'Orientation:'}
        <select id="wc-orientation">
          <option value="horiz" selected>${L ? 'Vodoravno' : 'Horizontal'}</option>
          <option value="mixed">${L ? 'Vodoravno & Navpično' : 'Horizontal & Vertical'}</option>
        </select>
      </label>
    </div>

    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="wc-input">${getI('ui_input')}</label>
        <textarea id="wc-input" rows="8" placeholder="${L ? 'Vnesite ali prilepite besedilo za ustvarjanje oblaka besed...' : 'Type or paste text to generate a word cloud...'}" style="min-height:220px;">${L ? sampleSl : sampleEn}</textarea>
        <div class="panel-actions">
          <button id="wc-sample" class="btn-sm" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_edit} <span>${L ? 'Primer' : 'Sample'}</span></button>
          <button id="wc-clear" class="btn-sm" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>

      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="margin:0;">${L ? 'Predogled oblaka besed' : 'Word Cloud Preview'}</label>
          <span id="wc-stats" style="font-size:12px; color:var(--text-dim);"></span>
        </div>
        <div style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:8px; display:flex; justify-content:center; align-items:center; min-height:220px; flex:1; position:relative; overflow:hidden;">
          <canvas id="wc-canvas" width="800" height="480" style="max-width:100%; height:auto; border-radius:8px; display:block;"></canvas>
        </div>
        <div class="panel-actions" style="gap:8px;">
          <button class="btn-sm primary" id="wc-download" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi PNG' : 'Download PNG'}</span></button>
          <button class="btn-sm" id="wc-copy-freq" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj frekvence' : 'Copy Frequencies'}</span></button>
          <button class="btn-sm" id="wc-reroll" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Premešaj' : 'Re-roll'}</span></button>
        </div>
      </div>
    </div>

    <!-- INTERACTIVE WORD FILTER HUB -->
    <div style="margin-top:20px; background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid var(--border);">
        <div>
          <strong style="font-size:15px;">${L ? 'Interaktivni filter besed' : 'Interactive Word Filter'}</strong>
          <div style="font-size:12px; color:var(--text-dim); margin-top:2px;">${L ? 'Kliknite na besedo, da jo vključite ali izključite iz oblaka v živo.' : 'Click any chip to toggle inclusion/exclusion from the cloud in real-time.'}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <input type="text" id="wc-chip-search" placeholder="${L ? 'Išči med žetoni...' : 'Filter chips...'}" style="padding:5px 10px; font-size:12px; border-radius:8px; width:150px;">
          <button id="wc-select-all" class="btn-sm" style="padding:4px 8px; font-size:12px;">${SVG_ICONS.mi_check} ${L ? 'Vklopi vse' : 'Select All'}</button>
          <button id="wc-deselect-all" class="btn-sm" style="padding:4px 8px; font-size:12px;">${SVG_ICONS.mi_x} ${L ? 'Izklopi vse' : 'Clear All'}</button>
          <button id="wc-top-20" class="btn-sm" style="padding:4px 8px; font-size:12px;">${SVG_ICONS.mi_star} Top 20</button>
        </div>
      </div>
      <div id="wc-chips" style="display:flex; flex-wrap:wrap; gap:6px; padding:2px;"></div>
    </div>
  `;

  const input = container.querySelector('#wc-input');
  const minLenInput = container.querySelector('#wc-minlen');
  const minFreqInput = container.querySelector('#wc-minfreq');
  const maxWordsSel = container.querySelector('#wc-maxwords');
  const paletteSel = container.querySelector('#wc-palette');
  const orientationSel = container.querySelector('#wc-orientation');
  const canvas = container.querySelector('#wc-canvas');
  const ctx = canvas.getContext('2d');
  const statsEl = container.querySelector('#wc-stats');
  const chipsWrap = container.querySelector('#wc-chips');
  const chipSearch = container.querySelector('#wc-chip-search');

  const excludedWords = new Set();
  let cachedWordCounts = [];
  let seedOffset = 0;

  const wcLangKey = L ? 'sl' : 'en';
  const wcGroupKeys = Object.keys(WC_STOP_GROUPS[wcLangKey]);
  const wcActiveGroups = new Set(wcGroupKeys);
  const wcFilterWrap = container.querySelector('#wc-filter-wrap');
  const wcFilterBtn = container.querySelector('#wc-filter-btn');
  const wcFilterMenu = container.querySelector('#wc-filter-menu');
  const wcFilterCount = container.querySelector('#wc-filter-count');

  function buildStopSet() {
    const src = WC_STOP_GROUPS[wcLangKey];
    const s = new Set();
    wcGroupKeys.forEach(k => {
      if (wcActiveGroups.has(k)) src[k].forEach(w => s.add(w));
    });
    return s;
  }

  function updateFilterCount() {
    const total = wcGroupKeys.length;
    wcFilterCount.textContent =
      wcActiveGroups.size === total
        ? L
          ? 'vse'
          : 'all'
        : wcActiveGroups.size === 0
          ? L
            ? 'brez'
            : 'none'
          : `${wcActiveGroups.size}/${total}`;
  }

  function renderFilterMenu() {
    const labels = WC_GROUP_LABELS[wcLangKey];
    const expl = L
      ? 'To so besede brez velike vsebinske teže. Izberite skupine, ki naj jih oblak prezre.'
      : 'These are low-meaning words. Choose which groups the cloud should ignore.';
    wcFilterMenu.innerHTML = `
          <div style="padding:10px 12px; font-size:11.5px; line-height:1.5; color:var(--text-dim); border-bottom:1px solid var(--border); margin-bottom:4px;">${expl}</div>
          ${wcGroupKeys
            .map(
              k => `
            <label class="dropdown-item" style="justify-content:flex-start; gap:9px; cursor:pointer;">
              <input type="checkbox" data-wcgroup="${k}" ${wcActiveGroups.has(k) ? 'checked' : ''} style="accent-color:var(--violet); cursor:pointer;">
              <span style="flex:1;">${labels[k]}</span>
              <span style="font-size:11px; opacity:.6;">${WC_STOP_GROUPS[wcLangKey][k].length}</span>
            </label>`
            )
            .join('')}
          <div style="display:flex; gap:6px; padding:8px 6px 4px; border-top:1px solid var(--border); margin-top:4px;">
            <button type="button" id="wc-f-all" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Vklopi vse' : 'Enable all'}</button>
            <button type="button" id="wc-f-none" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Izklopi vse' : 'Disable all'}</button>
          </div>`;

    wcFilterMenu.querySelectorAll('input[data-wcgroup]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) wcActiveGroups.add(cb.dataset.wcgroup);
        else wcActiveGroups.delete(cb.dataset.wcgroup);
        updateFilterCount();
        analyzeText();
      });
    });
    wcFilterMenu.querySelector('#wc-f-all').addEventListener('click', () => {
      wcGroupKeys.forEach(k => wcActiveGroups.add(k));
      refreshFilterUI();
      analyzeText();
    });
    wcFilterMenu.querySelector('#wc-f-none').addEventListener('click', () => {
      wcActiveGroups.clear();
      refreshFilterUI();
      analyzeText();
    });
  }

  function refreshFilterUI() {
    renderFilterMenu();
    updateFilterCount();
  }

  wcFilterBtn.addEventListener('click', ev => {
    ev.stopPropagation();
    wcFilterWrap.classList.toggle('open');
  });
  wcFilterMenu.addEventListener('click', ev => ev.stopPropagation());
  if (!window.__wcFilterOutsideCloseBound) {
    window.__wcFilterOutsideCloseBound = true;
    document.addEventListener('click', ev => {
      const w = document.getElementById('wc-filter-wrap');
      if (w && !w.contains(ev.target)) w.classList.remove('open');
    });
  }
  refreshFilterUI();

  function analyzeText() {
    const text = input.value || '';
    const rawTokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    const minLen = parseInt(minLenInput.value) || 1;
    const minFreq = parseInt(minFreqInput.value) || 1;
    const stopSet = buildStopSet();

    const counts = {};
    rawTokens.forEach(token => {
      if (token.length < minLen) return;
      if (stopSet.has(token)) return;
      counts[token] = (counts[token] || 0) + 1;
    });

    const list = Object.entries(counts)
      .filter(([word, count]) => count >= minFreq)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([word, count]) => ({ word, count }));

    cachedWordCounts = list;
    renderChips();
    drawCloud();
  }

  function renderChips() {
    const filterStr = (chipSearch.value || '').trim().toLowerCase();
    const maxDisplay = parseInt(maxWordsSel.value) || 50;

    let visibleItems = cachedWordCounts;
    if (filterStr) {
      visibleItems = visibleItems.filter(item => item.word.includes(filterStr));
    }

    if (!visibleItems.length) {
      chipsWrap.innerHTML = `<span style="font-size:12px; color:var(--text-dim); padding:8px;">${L ? 'Ni ujemajočih se besed.' : 'No matching words.'}</span>`;
      return;
    }

    chipsWrap.innerHTML = visibleItems
      .map((item, idx) => {
        const isExcluded = excludedWords.has(item.word);
        const isTop = idx < maxDisplay && !isExcluded;
        const bg = isExcluded
          ? 'background:rgba(0,0,0,0.06); color:var(--text-dimmer); text-decoration:line-through; border:1px dashed var(--border);'
          : isTop
            ? 'background:rgba(99,102,241,0.12); color:var(--violet); border:1px solid rgba(99,102,241,0.35); font-weight:600;'
            : 'background:var(--card); color:var(--text); border:1px solid var(--border);';

        return `
            <button class="wc-chip" data-word="${escapeHtml(item.word)}" style="cursor:pointer; border-radius:20px; padding:3px 10px; font-size:12px; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; ${bg}">
              <span>${escapeHtml(item.word)}</span>
              <span style="opacity:0.75; font-size:11px;">(${item.count})</span>
              <span>${isExcluded ? SVG_ICONS.mi_x : SVG_ICONS.mi_check}</span>
            </button>
          `;
      })
      .join('');

    chipsWrap.querySelectorAll('.wc-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.dataset.word;
        if (excludedWords.has(w)) {
          excludedWords.delete(w);
        } else {
          excludedWords.add(w);
        }
        renderChips();
        drawCloud();
      });
    });
  }

  function drawCloud() {
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bgRgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    const isDark =
      bgRgb && bgRgb.length >= 3
        ? 0.2126 * Number(bgRgb[0]) + 0.7152 * Number(bgRgb[1]) + 0.0722 * Number(bgRgb[2]) < 128
        : document.documentElement.getAttribute('data-theme')?.includes('dark');
    ctx.fillStyle = isDark ? '#141417' : '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Filter active words
    const maxWords = parseInt(maxWordsSel.value) || 50;
    const activeWords = cachedWordCounts
      .filter(item => !excludedWords.has(item.word))
      .slice(0, maxWords);

    statsEl.textContent = `${L ? 'Prikazanih' : 'Showing'} ${activeWords.length} / ${cachedWordCounts.length} ${L ? 'besed' : 'words'}`;

    if (!activeWords.length) {
      ctx.fillStyle = isDark ? '#71717a' : '#9ca3af';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        L ? 'Vnesite besedilo za prikaz oblaka besed' : 'Enter text to generate word cloud',
        W / 2,
        H / 2
      );
      return;
    }

    const maxCount = activeWords[0].count;
    const minCount = activeWords[activeWords.length - 1].count;
    const palette = PALETTES[paletteSel.value] || PALETTES.indigo;
    const isMixed = orientationSel.value === 'mixed';

    const boxes = [];
    const minFontSize = 14;
    const maxFontSize = Math.min(68, Math.max(32, Math.round(W / 12)));

    activeWords.forEach((item, idx) => {
      const ratio = (item.count - minCount) / (maxCount - minCount || 1);
      const fontSize = Math.round(minFontSize + Math.pow(ratio, 0.8) * (maxFontSize - minFontSize));
      const color = palette[idx % palette.length];
      const isVertical = isMixed && idx % 4 === 3;

      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      const metrics = ctx.measureText(item.word);
      const textW = isVertical ? fontSize + 4 : metrics.width + 10;
      const textH = isVertical ? metrics.width + 10 : fontSize + 4;

      let placed = false;
      let angle = (idx * 1.618 + seedOffset) * Math.PI * 2;
      let radius = 0;
      const maxRadius = Math.sqrt(W * W + H * H) / 2;

      for (let step = 0; step < 260; step++) {
        const x = W / 2 + radius * Math.cos(angle) - textW / 2;
        const y = H / 2 + radius * Math.sin(angle) - textH / 2;

        if (x >= 12 && x + textW <= W - 12 && y >= 12 && y + textH <= H - 12) {
          const overlap = boxes.some(
            b => !(x + textW < b.x || x > b.x + b.w || y + textH < b.y || y > b.y + b.h)
          );
          if (!overlap) {
            boxes.push({ x, y, w: textW, h: textH, word: item.word, fontSize, color, isVertical });
            placed = true;
            break;
          }
        }
        angle += 0.38;
        radius += 1.9;
        if (radius > maxRadius) break;
      }

      if (!placed && fontSize > 16) {
        const smallerFont = Math.round(fontSize * 0.7);
        ctx.font = `bold ${smallerFont}px system-ui, sans-serif`;
        const m2 = ctx.measureText(item.word);
        const w2 = isVertical ? smallerFont + 4 : m2.width + 8;
        const h2 = isVertical ? m2.width + 8 : smallerFont + 4;
        let a2 = Math.random() * Math.PI * 2;
        let r2 = 0;
        for (let s = 0; s < 180; s++) {
          const x = W / 2 + r2 * Math.cos(a2) - w2 / 2;
          const y = H / 2 + r2 * Math.sin(a2) - h2 / 2;
          if (x >= 10 && x + w2 <= W - 10 && y >= 10 && y + h2 <= H - 10) {
            const overlap = boxes.some(
              b => !(x + w2 < b.x || x > b.x + b.w || y + h2 < b.y || y > b.y + b.h)
            );
            if (!overlap) {
              boxes.push({
                x,
                y,
                w: w2,
                h: h2,
                word: item.word,
                fontSize: smallerFont,
                color,
                isVertical,
              });
              break;
            }
          }
          a2 += 0.45;
          r2 += 2.2;
        }
      }
    });

    boxes.forEach(box => {
      ctx.save();
      ctx.fillStyle = box.color;
      ctx.font = `bold ${box.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const centerX = box.x + box.w / 2;
      const centerY = box.y + box.h / 2;

      if (box.isVertical) {
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(box.word, 0, 0);
      } else {
        ctx.fillText(box.word, centerX, centerY);
      }
      ctx.restore();
    });
  }

  let _wcDebounce;
  input.addEventListener('input', () => {
    clearTimeout(_wcDebounce);
    _wcDebounce = setTimeout(analyzeText, 120);
  });

  [minLenInput, minFreqInput, maxWordsSel, paletteSel, orientationSel].forEach(el => {
    el.addEventListener('change', analyzeText);
  });

  chipSearch.addEventListener('input', renderChips);

  container.querySelector('#wc-sample').addEventListener('click', () => {
    input.value = L ? sampleSl : sampleEn;
    excludedWords.clear();
    analyzeText();
  });

  container.querySelector('#wc-clear').addEventListener('click', () => {
    input.value = '';
    excludedWords.clear();
    analyzeText();
    input.focus();
  });

  container.querySelector('#wc-reroll').addEventListener('click', () => {
    seedOffset += 0.237;
    drawCloud();
  });

  container.querySelector('#wc-select-all').addEventListener('click', () => {
    excludedWords.clear();
    renderChips();
    drawCloud();
  });

  container.querySelector('#wc-deselect-all').addEventListener('click', () => {
    cachedWordCounts.forEach(item => excludedWords.add(item.word));
    renderChips();
    drawCloud();
  });

  container.querySelector('#wc-top-20').addEventListener('click', () => {
    excludedWords.clear();
    cachedWordCounts.slice(20).forEach(item => excludedWords.add(item.word));
    renderChips();
    drawCloud();
  });

  container.querySelector('#wc-download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'besedomat-wordcloud.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  container.querySelector('#wc-copy-freq').addEventListener('click', () => {
    const lines = cachedWordCounts
      .filter(item => !excludedWords.has(item.word))
      .map(item => `${item.word}: ${item.count}`);
    copyText(lines.join('\n'), container.querySelector('#wc-copy-freq'));
  });

  analyzeText();
}

function renderCaseConverter(container) {
  const L = currentLang === 'sl';
  const modes = [
    { id: 'upper', label: 'UPPERCASE', example: 'VELIKE ČRKE' },
    { id: 'lower', label: 'lowercase', example: 'male črke' },
    { id: 'title', label: 'Title Case', example: 'Začetnice Besed' },
    { id: 'sentence', label: 'Sentence case', example: 'Začetnice stavkov.' },
    { id: 'inverse', label: 'iNvErSe', example: 'oBrNi ČrKe' },
    { id: 'sarcasm', label: 'SaRcAsM', example: 'sArKaStIčNo' },
    { id: 'camel', label: 'camelCase', example: 'začetniceBesed' },
    { id: 'pascal', label: 'PascalCase', example: 'ZačetniceBesed' },
    { id: 'snake', label: 'snake_case', example: 'začetnice_besed' },
    { id: 'kebab', label: 'kebab-case', example: 'začetnice-besed' },
  ];
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px; gap:8px 14px;">
      ${modes.map((m, i) => `<label style="cursor:pointer; white-space:nowrap; font-size:12.5px;"><input type="radio" name="cc-mode" value="${m.id}" ${i === 0 ? 'checked' : ''}> ${m.label}</label>`).join('')}
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="cc-input">${getI('ui_input')}</label>
        <textarea id="cc-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}" style="min-height:140px;">Besedomat je odlično orodje za urejanje besedil.</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="cc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="cc-output">${getI('ui_output')}</label>
        <textarea id="cc-output" readonly placeholder="${L ? 'Pretvorjeno besedilo...' : 'Converted text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="cc-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#cc-input');
  const output = container.querySelector('#cc-output');
  const radios = container.querySelectorAll('input[name="cc-mode"]');

  function update() {
    const checked = container.querySelector('input[name="cc-mode"]:checked');
    const mode = checked ? checked.value : 'upper';
    output.value = PURE.applyCase(input.value, mode);
  }
  input.addEventListener('input', update);
  radios.forEach(r => r.addEventListener('change', update));
  container.querySelector('#cc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#cc-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#cc-copy'));
  });
  update();
}

function renderEncoderDecoder(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Algoritem:' : 'Algorithm:'}
        <select id="ed-algo">
          <option value="base64">Base64</option>
          <option value="url">URL Encoding (encodeURIComponent)</option>
          <option value="hex">Hexadecimal</option>
          <option value="binary">Binary (ASCII 8-bit)</option>
          <option value="rot13">ROT13</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ed-input">${L ? 'Navadno besedilo (Plaintext)' : 'Plaintext'}</label>
        <textarea id="ed-input" placeholder="${L ? 'Vnesite besedilo za kodiranje...' : 'Enter plaintext to encode...'}">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ed-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
          <button class="btn-sm primary" id="ed-to-code" style="display:inline-flex; align-items:center; gap:5px;">${L ? 'Kodiraj →' : 'Encode →'}</button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ed-output">${L ? 'Zakodirano besedilo (Encoded)' : 'Encoded text'}</label>
        <textarea id="ed-output" placeholder="${L ? 'Vnesite zakodirano besedilo za dekodiranje...' : 'Enter encoded text to decode...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ed-to-plain" style="display:inline-flex; align-items:center; gap:5px;">${L ? '← Dekodiraj' : '← Decode'}</button>
          <button class="btn-sm primary" id="ed-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const algo = container.querySelector('#ed-algo');
  const input = container.querySelector('#ed-input');
  const output = container.querySelector('#ed-output');

  function encode() {
    const t = input.value;
    const a = algo.value;
    try {
      if (a === 'base64') output.value = PURE.utf8ToBase64(t);
      else if (a === 'url') output.value = encodeURIComponent(t);
      else if (a === 'hex')
        output.value = Array.from(new TextEncoder().encode(t))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
      else if (a === 'binary')
        output.value = Array.from(new TextEncoder().encode(t))
          .map(b => b.toString(2).padStart(8, '0'))
          .join(' ');
      else if (a === 'rot13')
        output.value = t.replace(/[a-zA-Z]/g, c =>
          String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= 'm' ? 13 : -13))
        );
    } catch (e) {
      output.value = L ? 'Napaka pri kodiranju.' : 'Encoding error.';
    }
  }

  function decode() {
    const t = output.value.trim();
    const a = algo.value;
    try {
      if (a === 'base64') input.value = PURE.base64ToUtf8(t);
      else if (a === 'url') input.value = decodeURIComponent(t);
      else if (a === 'hex') {
        const hexes = t.replace(/\s+/g, '');
        const bytes = [];
        for (let i = 0; i < hexes.length; i += 2) bytes.push(parseInt(hexes.substr(i, 2), 16));
        input.value = new TextDecoder().decode(new Uint8Array(bytes));
      } else if (a === 'binary') {
        const bins = t.split(/\s+/).filter(Boolean);
        const bytes = bins.map(b => parseInt(b, 2));
        input.value = new TextDecoder().decode(new Uint8Array(bytes));
      } else if (a === 'rot13') {
        input.value = t.replace(/[a-zA-Z]/g, c =>
          String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= 'm' ? 13 : -13))
        );
      }
    } catch (e) {
      input.value = L ? 'Napaka pri dekodiranju.' : 'Decoding error.';
    }
  }

  container.querySelector('#ed-to-code').addEventListener('click', encode);
  container.querySelector('#ed-to-plain').addEventListener('click', decode);
  algo.addEventListener('change', encode);
  input.addEventListener('input', encode);
  container.querySelector('#ed-clear').addEventListener('click', () => {
    input.value = '';
    output.value = '';
    input.focus();
  });
  container.querySelector('#ed-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ed-copy'));
  });
  encode();
}

function renderFindReplace(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px; gap:8px 14px;">
      <input type="text" id="fr-find" placeholder="${L ? 'Išči črko, znak ali niz...' : 'Search char, symbol or string...'}" style="flex:1; min-width:140px;">
      <button class="btn-sm" id="fr-swap" title="${L ? 'Zamenjaj polji' : 'Swap fields'}" style="padding:5px 10px; display:inline-flex; align-items:center; gap:4px;">${SVG_ICONS.mi_swap}</button>
      <input type="text" id="fr-replace" placeholder="${L ? 'Zamenjaj z...' : 'Replace with...'}" style="flex:1; min-width:140px;">
      <label><input type="checkbox" id="fr-ignorecase" checked> A=a</label>
      <label><input type="checkbox" id="fr-whole"> ${L ? 'Cele besede' : 'Whole words'}</label>
      <label><input type="checkbox" id="fr-regex"> RegEx</label>
      <div id="fr-stats" style="font-size:12px; font-weight:700; padding:4px 10px; border-radius:8px; background:rgba(99,102,241,0.12); color:var(--violet); white-space:nowrap;">0 ujemanj</div>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="fr-input">${getI('ui_input')}</label>
        <textarea id="fr-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">${L ? 'Besedomat 2026 je spletno orodje za urejanje besedil. Z orodjem lahko poiščete karkoli in hitro zamenjate dele besedila.' : 'Besedomat 2026 is an online text editing tool. With this tool you can search anything and quickly replace parts of text.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="fr-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
          <div class="segmented-control" style="padding:2px; gap:2px; font-size:12px;">
            <button class="seg-btn active" id="fr-tab-replaced" style="padding:4px 12px; font-size:12px;">📝 ${L ? 'Zamenjano' : 'Replaced'}</button>
            <button class="seg-btn" id="fr-tab-marked" style="padding:4px 12px; font-size:12px;">🔍 ${L ? 'Označena mesta' : 'Highlighted'}</button>
          </div>
        </div>
        <textarea id="fr-output" readonly placeholder="${L ? 'Rezultat zamenjave...' : 'Replaced result...'}"></textarea>
        <div id="fr-highlight-box" style="display:none; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; font-size:13.5px; line-height:1.7; white-space:pre-wrap; word-break:break-all; font-family:'Courier New', monospace; overflow-y:auto;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="fr-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#fr-input');
  const find = container.querySelector('#fr-find');
  const replace = container.querySelector('#fr-replace');
  const ignoreCase = container.querySelector('#fr-ignorecase');
  const wholeCheck = container.querySelector('#fr-whole');
  const regexCheck = container.querySelector('#fr-regex');
  const stats = container.querySelector('#fr-stats');
  const output = container.querySelector('#fr-output');
  const highlightBox = container.querySelector('#fr-highlight-box');
  const tabReplaced = container.querySelector('#fr-tab-replaced');
  const tabMarked = container.querySelector('#fr-tab-marked');

  let activeTab = 'replaced';

  function update() {
    const text = input.value;
    const query = find.value;
    const repl = replace.value;

    if (!query) {
      stats.textContent = L ? '0 ujemanj' : '0 matches';
      stats.style.background = 'rgba(100,116,139,0.12)';
      stats.style.color = 'var(--text-dim)';
      output.value = text;
      highlightBox.innerHTML = escapeHtml(text);
      return;
    }

    try {
      const res = PURE.findReplace(text, {
        query,
        repl,
        ignoreCase: ignoreCase.checked,
        wholeWord: wholeCheck.checked,
        regex: regexCheck.checked,
      });
      const count = res.count;

      if (count > 0) {
        stats.textContent = L
          ? `${count} ${count === 1 ? 'ujemanje' : count === 2 ? 'ujemanji' : count < 5 ? 'ujemanja' : 'ujemanj'}`
          : `${count} match${count === 1 ? '' : 'es'}`;
        stats.style.background = 'rgba(34,197,94,0.15)';
        stats.style.color = '#16a34a';
      } else {
        stats.textContent = L ? 'Ni ujemanj' : 'No matches';
        stats.style.background = 'rgba(239,68,68,0.12)';
        stats.style.color = '#dc2626';
      }

      output.value = res.replaced;

      const highlighted = escapeHtml(text).replace(
        res.regex,
        m =>
          `<mark style="background:rgba(234,179,8,0.4); color:inherit; border:1px solid rgba(234,179,8,0.7); border-radius:4px; padding:1px 3px; font-weight:700;">${m}</mark>`
      );
      highlightBox.innerHTML = highlighted;
    } catch (e) {
      stats.textContent = L ? 'Neveljaven RegEx' : 'Invalid RegEx';
      stats.style.background = 'rgba(239,68,68,0.12)';
      stats.style.color = '#dc2626';
      output.value = text;
      highlightBox.innerHTML = `<span style="color:#ef4444;">${L ? 'Napaka v regularnem izrazu.' : 'RegEx syntax error.'}</span>`;
    }
  }

  tabReplaced.addEventListener('click', () => {
    activeTab = 'replaced';
    tabReplaced.classList.add('active');
    tabMarked.classList.remove('active');
    output.style.display = 'block';
    highlightBox.style.display = 'none';
  });

  tabMarked.addEventListener('click', () => {
    activeTab = 'marked';
    tabMarked.classList.add('active');
    tabReplaced.classList.remove('active');
    output.style.display = 'none';
    highlightBox.style.display = 'block';
  });

  [input, find, replace, ignoreCase, wholeCheck, regexCheck].forEach(el =>
    el.addEventListener('input', update)
  );
  container.querySelector('#fr-swap').addEventListener('click', () => {
    const tmp = find.value;
    find.value = replace.value;
    replace.value = tmp;
    update();
  });
  container.querySelector('#fr-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#fr-copy').addEventListener('click', () => {
    const textToCopy = activeTab === 'replaced' ? output.value : input.value;
    copyText(textToCopy, container.querySelector('#fr-copy'));
  });
  update();
}

function renderFrequency(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Analiziraj:' : 'Analyze:'}
        <select id="fq-mode">
          <option value="words">${L ? 'Besede (Word Frequency)' : 'Words'}</option>
          <option value="chars">${L ? 'Znake in črke (Character Frequency)' : 'Characters'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="fq-case"> ${L ? 'Upoštevaj velike/male črke' : 'Case sensitive'}</label>
      <label><input type="checkbox" id="fq-ignore-punct" checked> ${L ? 'Ignoriraj ločila' : 'Ignore punctuation'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="fq-input">${getI('ui_input')}</label>
        <textarea id="fq-input" placeholder="${L ? 'Vnesite besedilo za frekvenčno analizo...' : 'Enter text to analyze frequency...'}">${L ? 'Besedomat je orodje za analizo besedil. Analiza besedila je hitra in enostavna z Besedomatom.' : 'Besedomat is a text toolkit. Text analysis is fast and easy with Besedomat.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="fq-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="margin:0;">${L ? 'Frekvenčna porazdelitev' : 'Frequency Distribution'}</label>
          <span id="fq-meta" style="font-size:12px; color:var(--text-dim);"></span>
        </div>
        <div id="fq-list" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; flex:1; max-height:360px; overflow-y:auto;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="fq-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj tabelo' : 'Copy Table'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#fq-input');
  const mode = container.querySelector('#fq-mode');
  const caseSens = container.querySelector('#fq-case');
  const ignPunct = container.querySelector('#fq-ignore-punct');
  const list = container.querySelector('#fq-list');
  const meta = container.querySelector('#fq-meta');
  let lastReport = '';
  let updatePromise = null;

  async function update() {
    const text = input.value;
    const opts = {
      mode: mode.value,
      caseSensitive: caseSens.checked,
      ignorePunct: ignPunct.checked,
    };
    let result;
    if (text.length > HEAVY_LIMIT) {
      showToolBusy(container, true);
      try {
        result = await runHeavy('frequency', { text, opts });
      } catch (e) {
        result = PURE.frequencyCounts(text, opts);
      }
      showToolBusy(container, false);
    } else {
      result = PURE.frequencyCounts(text, opts);
    }
    const { entries, total } = result;
    meta.textContent =
      entries.length +
      ' ' +
      (L ? 'unikatnih' : 'unique') +
      ' / ' +
      total +
      ' ' +
      (L ? 'skupaj' : 'total');

    if (entries.length === 0) {
      list.innerHTML = `<div style="color:var(--text-dim); text-align:center; padding:20px;">${L ? 'Vnesite besedilo za analizo.' : 'Enter text to analyze.'}</div>`;
      return;
    }

    const maxCount = entries[0][1];
    lastReport = entries
      .map(([k, v]) => `${k}: ${v} (${((v / total) * 100).toFixed(1)}%)`)
      .join('\n');

    list.innerHTML = entries
      .map(([k, v]) => {
        const pct = ((v / total) * 100).toFixed(1);
        const barPct = Math.round((v / maxCount) * 100);
        return `
            <div style="margin-bottom:8px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;">
                <strong>${escapeHtml(k)}</strong>
                <span>${v}x (${pct}%)</span>
              </div>
              <div style="background:var(--border); height:6px; border-radius:3px; overflow:hidden;">
                <div style="background:var(--violet); height:100%; width:${barPct}%;"></div>
              </div>
            </div>
          `;
      })
      .join('');
  }

  function debouncedUpdate() {
    clearTimeout(updatePromise);
    updatePromise = setTimeout(update, 100);
  }
  const safe = safeUpdate(debouncedUpdate, container);
  [input, mode, caseSens, ignPunct].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#fq-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  container.querySelector('#fq-copy').addEventListener('click', () => {
    copyText(lastReport, container.querySelector('#fq-copy'));
  });
  safe();
}

function renderCountOccurrences(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <input type="text" id="co-query" placeholder="${L ? 'Išči besedo ali niz...' : 'Search word or query...'}" style="flex:1; min-width:160px;">
      <label><input type="checkbox" id="co-case"> A=a</label>
      <label><input type="checkbox" id="co-whole"> ${L ? 'Cele besede' : 'Whole words'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="co-input">${getI('ui_input')}</label>
        <textarea id="co-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="co-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="co-output">${getI('ui_output')}</label>
        <textarea id="co-output" readonly placeholder="${L ? 'Število pojavitev...' : 'Match count...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="co-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#co-input');
  const query = container.querySelector('#co-query');
  const caseCheck = container.querySelector('#co-case');
  const wholeCheck = container.querySelector('#co-whole');
  const output = container.querySelector('#co-output');

  function update() {
    const needle = query.value;
    if (!needle) {
      output.value = '';
      return;
    }
    output.value = String(
      PURE.countOccurrences(input.value, needle, {
        ignoreCase: caseCheck.checked,
        wholeWord: wholeCheck.checked,
      })
    );
  }
  const safe = safeUpdate(update, container);
  [input, query, caseCheck, wholeCheck].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#co-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  safe();
  container.querySelector('#co-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#co-copy'));
  });
}

function renderAddPrefix(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <input type="text" id="ap-prefix" placeholder="${L ? 'Predpona (začetek)...' : 'Prefix (start)...'}" style="flex:1; min-width:140px;">
      <input type="text" id="ap-suffix" placeholder="${L ? 'Pripona (konec)...' : 'Suffix (end)...'}" style="flex:1; min-width:140px;">
      <label><input type="checkbox" id="ap-skip"> ${L ? 'Preskoči prazne vrstice' : 'Skip empty lines'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ap-input">${getI('ui_input')}</label>
        <textarea id="ap-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ap-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ap-output">${getI('ui_output')}</label>
        <textarea id="ap-output" readonly placeholder="${L ? 'Rezultat bo tukaj...' : 'Result will appear here...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ap-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ap-input');
  const prefixEl = container.querySelector('#ap-prefix');
  const suffixEl = container.querySelector('#ap-suffix');
  const skip = container.querySelector('#ap-skip');
  const output = container.querySelector('#ap-output');

  function update() {
    output.value = PURE.addPrefixLines(input.value, {
      prefix: prefixEl.value,
      suffix: suffixEl.value,
      skipEmpty: skip.checked,
    });
  }
  const safe = safeUpdate(update, container);
  [input, prefixEl, suffixEl, skip].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#ap-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  container.querySelector('#ap-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ap-copy'));
  });
}

function renderFilterLines(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <input type="text" id="fl-keyword" placeholder="${L ? 'Iskana beseda / niz...' : 'Keyword / pattern...'}" style="flex:1; min-width:160px;">
      <label><input type="checkbox" id="fl-whole"> ${L ? 'Cele besede' : 'Whole words'}</label>
      <label><input type="checkbox" id="fl-invert"> ${L ? 'Izloči (inverzni filter)' : 'Exclude (inverse)'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="fl-input">${getI('ui_input')}</label>
        <textarea id="fl-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="fl-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="fl-output">${getI('ui_output')}</label>
        <textarea id="fl-output" readonly placeholder="${L ? 'Filtrirane vrstice...' : 'Filtered lines...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="fl-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#fl-input');
  const keyword = container.querySelector('#fl-keyword');
  const whole = container.querySelector('#fl-whole');
  const invert = container.querySelector('#fl-invert');
  const output = container.querySelector('#fl-output');

  function update() {
    output.value = PURE.filterLines(input.value, {
      keyword: keyword.value,
      wholeWord: whole.checked,
      invert: invert.checked,
    });
  }
  const safe = safeUpdate(update, container);
  [input, keyword, whole, invert].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#fl-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  container.querySelector('#fl-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#fl-copy'));
  });
}

function renderLineNumbers(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label><input type="checkbox" id="ln-start-zero"> ${L ? 'Začni z 0' : 'Start from 0'}</label>
      <label><input type="checkbox" id="ln-pad"> ${L ? 'Polni z vodilnimi ničlami' : 'Pad with leading zeros'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ln-input">${getI('ui_input')}</label>
        <textarea id="ln-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ln-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ln-output">${getI('ui_output')}</label>
        <textarea id="ln-output" readonly placeholder="${L ? 'Oštevilčene vrstice...' : 'Numbered lines...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ln-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ln-input');
  const output = container.querySelector('#ln-output');
  const startZero = container.querySelector('#ln-start-zero');
  const pad = container.querySelector('#ln-pad');

  function update() {
    output.value = PURE.numberLines(input.value, {
      startZero: startZero.checked,
      pad: pad.checked,
    });
  }
  const safe = safeUpdate(update, container);
  [input, startZero, pad].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#ln-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  container.querySelector('#ln-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ln-copy'));
  });
}

function renderWrapText(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Širina (znakov):' : 'Width (chars):'}
        <input type="number" id="wt-width" value="80" min="10" max="200" style="width:75px;">
      </label>
      <label><input type="checkbox" id="wt-word" checked> ${L ? 'Prelomi med besedami' : 'Wrap at word boundaries'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="wt-input">${getI('ui_input')}</label>
        <textarea id="wt-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="wt-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="wt-output">${getI('ui_output')}</label>
        <textarea id="wt-output" readonly placeholder="${L ? 'Prelomljeno besedilo...' : 'Wrapped text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="wt-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#wt-input');
  const widthEl = container.querySelector('#wt-width');
  const wordCheck = container.querySelector('#wt-word');
  const output = container.querySelector('#wt-output');

  function update() {
    const width = Math.max(5, parseInt(widthEl.value) || 80);
    const atWord = wordCheck.checked;
    const lines = input.value.split('\n');
    const wrapped = [];

    lines.forEach(line => {
      if (line.length <= width) {
        wrapped.push(line);
        return;
      }
      if (!atWord) {
        for (let i = 0; i < line.length; i += width) {
          wrapped.push(line.substr(i, width));
        }
      } else {
        let cur = line;
        while (cur.length > width) {
          let idx = cur.lastIndexOf(' ', width);
          if (idx === -1) idx = width;
          wrapped.push(cur.substr(0, idx).trim());
          cur = cur.substr(idx).trim();
        }
        if (cur) wrapped.push(cur);
      }
    });
    output.value = wrapped.join('\n');
  }
  [input, widthEl, wordCheck].forEach(el => el.addEventListener('input', update));
  container.querySelector('#wt-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#wt-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#wt-copy'));
  });
}

function renderMarkdownStripper(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ms-input">${getI('ui_input')}</label>
        <textarea id="ms-input" placeholder="${L ? 'Vnesite besedilo v formatu Markdown...' : 'Paste Markdown content...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ms-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ms-output">${getI('ui_output')}</label>
        <textarea id="ms-output" readonly placeholder="${L ? 'Čisto besedilo brez Markdown oznak...' : 'Plain text without Markdown...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ms-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ms-input');
  const output = container.querySelector('#ms-output');

  function update() {
    let t = input.value;
    t = t.replace(/^#{1,6}\s+/gm, '');
    t = t.replace(/\*\*(.*?)\*\*/g, '$1');
    t = t.replace(/__(.*?)__/g, '$1');
    t = t.replace(/\*(.*?)\*/g, '$1');
    t = t.replace(/_(.*?)_/g, '$1');
    t = t.replace(/~~(.*?)~~/g, '$1');
    t = t.replace(/\`\`\`[\s\S]*?\`\`\`/g, '');
    t = t.replace(/\`(.+?)\`/g, '$1');
    t = t.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    t = t.replace(/^>\s+/gm, '');
    t = t.replace(/^[-*+]\s+/gm, '');
    t = t.replace(/^\d+\.\s+/gm, '');
    output.value = t.trim();
  }
  input.addEventListener('input', update);
  container.querySelector('#ms-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ms-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ms-copy'));
  });
}

function renderHtmlStripper(container) {
  const L = currentLang === 'sl';
  const isDe = currentLang === 'de';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label><input type="checkbox" id="hs-collapse" checked> ${L ? 'Združi odvečne presledke' : isDe ? 'Mehrfache Leerzeichen zusammenfassen' : 'Collapse multiple spaces'}</label>
      <label><input type="checkbox" id="hs-linebreaks" checked> ${L ? 'Ohrani prelome vrstic (&lt;br&gt;, odstavki)' : isDe ? 'Zeilenumbrüche beibehalten (&lt;br&gt;, Absätze)' : 'Preserve line breaks (&lt;br&gt;, paragraphs)'}</label>
      <label><input type="checkbox" id="hs-scripts" checked> ${L ? 'Odstrani &lt;script&gt; in &lt;style&gt;' : isDe ? '&lt;script&gt; &amp; &lt;style&gt; entfernen' : 'Remove &lt;script&gt; &amp; &lt;style&gt;'}</label>
      <label><input type="checkbox" id="hs-lists" checked> ${L ? 'Oblikuj sezname (•)' : isDe ? 'Listen formatieren (•)' : 'Format lists (•)'}</label>
      <label><input type="checkbox" id="hs-links"> ${L ? 'Prikaži URL povezav' : isDe ? 'Link-URLs anzeigen' : 'Include link URLs'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="hs-input">${getI('ui_input')}</label>
        <textarea id="hs-input" placeholder="${L ? 'Vnesite ali prilepite HTML kodo...' : isDe ? 'HTML-Code hier einfügen...' : 'Paste HTML content...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="hs-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="hs-output">${getI('ui_output')}</label>
        <textarea id="hs-output" readonly placeholder="${L ? 'Čisto besedilo brez HTML značk...' : isDe ? 'Reiner Text ohne HTML-Tags...' : 'Plain text without HTML tags...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="hs-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#hs-input');
  const output = container.querySelector('#hs-output');
  const chkCollapse = container.querySelector('#hs-collapse');
  const chkLinebreaks = container.querySelector('#hs-linebreaks');
  const chkScripts = container.querySelector('#hs-scripts');
  const chkLists = container.querySelector('#hs-lists');
  const chkLinks = container.querySelector('#hs-links');

  function update() {
    const raw = input.value;
    if (!raw) {
      output.value = '';
      return;
    }

    const collapseSpaces = chkCollapse ? chkCollapse.checked : true;
    const preserveLinebreaks = chkLinebreaks ? chkLinebreaks.checked : true;
    const removeScripts = chkScripts ? chkScripts.checked : true;
    const formatLists = chkLists ? chkLists.checked : true;
    const includeLinks = chkLinks ? chkLinks.checked : false;

    try {
      const doc = new DOMParser().parseFromString(raw, 'text/html');

      // 1. Remove non-content elements and their text entirely
      if (removeScripts) {
        doc.querySelectorAll('script, style, noscript, svg, template, iframe, object, embed, head').forEach(el => el.remove());
      }

      // 2. Format links if enabled
      if (includeLinks) {
        doc.querySelectorAll('a[href]').forEach(a => {
          const href = (a.getAttribute('href') || '').trim();
          const text = (a.textContent || '').trim();
          if (href && !href.startsWith('javascript:') && text && text !== href) {
            a.replaceWith(document.createTextNode(`${text} (${href})`));
          }
        });
      }

      // 3. Format lists with bullets or numbers
      if (formatLists && preserveLinebreaks) {
        doc.querySelectorAll('ul > li').forEach(li => {
          li.prepend(document.createTextNode('\n• '));
          li.append(document.createTextNode('\n'));
        });
        doc.querySelectorAll('ol > li').forEach((li, idx) => {
          li.prepend(document.createTextNode(`\n${idx + 1}. `));
          li.append(document.createTextNode('\n'));
        });
      }

      // 4. Handle breaks, rules, tables and block elements
      if (preserveLinebreaks) {
        doc.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\n')));
        doc.querySelectorAll('hr').forEach(hr => hr.replaceWith(document.createTextNode('\n\n')));

        // Tables: separate cells with tabs, rows with newlines
        doc.querySelectorAll('tr').forEach(tr => tr.append(document.createTextNode('\n')));
        doc.querySelectorAll('th, td').forEach(cell => cell.append(document.createTextNode('\t')));

        // Block elements: ensure newline separation so words and paragraphs never get glued together
        const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'article', 'section', 'header', 'footer', 'main', 'aside', 'details', 'summary'];
        blockTags.forEach(tag => {
          doc.querySelectorAll(tag).forEach(el => {
            el.prepend(document.createTextNode('\n'));
            el.append(document.createTextNode('\n'));
          });
        });
      } else {
        // Flat single-line mode: replace breaks and blocks with a space
        doc.querySelectorAll('br, hr').forEach(el => el.replaceWith(document.createTextNode(' ')));
        doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, tr, blockquote').forEach(el => {
          el.append(document.createTextNode(' '));
        });
      }

      let text = doc.body.textContent || '';

      // 5. Convert non-breaking spaces (\u00A0) to standard spaces
      text = text.replace(/\u00A0/g, ' ');

      // 6. Whitespace cleanup / collapsing
      if (collapseSpaces) {
        if (preserveLinebreaks) {
          text = text.split('\n')
            .map(line => line.replace(/[ \t\f\v]+/g, ' ').trim())
            .filter((line, i, arr) => line !== '' || (i > 0 && arr[i - 1] !== ''))
            .join('\n')
            .trim();
        } else {
          text = text.replace(/\s+/g, ' ').trim();
        }
      } else if (!preserveLinebreaks) {
        text = text.replace(/\r?\n+/g, ' ');
      }

      output.value = text;
    } catch (e) {
      let fallback = raw.replace(/<[^>]+>/g, '');
      if (collapseSpaces) fallback = fallback.replace(/\s+/g, ' ').trim();
      output.value = fallback;
    }
  }

  [input, chkCollapse, chkLinebreaks, chkScripts, chkLists, chkLinks].forEach(el => {
    if (el) {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    }
  });
  container.querySelector('#hs-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#hs-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#hs-copy'));
  });
}

function renderInvisibleChars(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="inv-input">${getI('ui_input')}</label>
        <textarea id="inv-input" placeholder="${L ? 'Vnesite ali prilepite besedilo...' : 'Paste text here...'}">Prva vrstica\tz enim tabom.\nDruga vrstica   s tremi presledki.\nTretja vrstica.\n\nPeta vrstica po prazni.</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="inv-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Vizualni prikaz nevidnih znakov' : 'Visible Representation'}</label>
        <div id="inv-preview" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; font-family:monospace; font-size:13.5px; line-height:1.6; white-space:pre-wrap; word-break:break-all;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="inv-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#inv-input');
  const preview = container.querySelector('#inv-preview');
  let plainRepresented = '';

  function update() {
    const text = input.value;
    plainRepresented = text.replace(/ /g, '·').replace(/\t/g, '→   ').replace(/\n/g, '↵\n');
    preview.innerHTML = escapeHtml(text)
      .replace(/ /g, '<span style="color:#3b82f6; font-weight:700;">·</span>')
      .replace(/\t/g, '<span style="color:#ef4444; font-weight:700;">→   </span>')
      .replace(/\n/g, '<span style="color:#10b981; font-weight:700;">↵</span>\n');
  }
  input.addEventListener('input', update);
  container.querySelector('#inv-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#inv-copy').addEventListener('click', () => {
    copyText(plainRepresented, container.querySelector('#inv-copy'));
  });
  update();
}

function renderDelimiterConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Iz:' : 'From:'}
        <select id="dc-from">
          <option value="newline">${L ? 'Nova vrstica (\n)' : 'New line (\n)'}</option>
          <option value="comma">${L ? 'Vejica (,)' : 'Comma (,)'}</option>
          <option value="semicolon">${L ? 'Podpičje (;)' : 'Semicolon (;)'}</option>
          <option value="tab">${L ? 'Tabulator' : 'Tab'}</option>
          <option value="space">${L ? 'Presledek' : 'Space'}</option>
        </select>
      </label>
      <label>${L ? 'V:' : 'To:'}
        <select id="dc-to">
          <option value="comma">${L ? 'Vejica (,)' : 'Comma (,)'}</option>
          <option value="semicolon">${L ? 'Podpičje (;)' : 'Semicolon (;)'}</option>
          <option value="newline">${L ? 'Nova vrstica (\n)' : 'New line (\n)'}</option>
          <option value="tab">${L ? 'Tabulator' : 'Tab'}</option>
          <option value="space">${L ? 'Presledek' : 'Space'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="dc-input">${getI('ui_input')}</label>
        <textarea id="dc-input" placeholder="${L ? 'Vnesite besedilo z ločili...' : 'Enter text with delimiters...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="dc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="dc-output">${getI('ui_output')}</label>
        <textarea id="dc-output" readonly placeholder="${L ? 'Pretvorjena ločila...' : 'Converted delimiters...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="dc-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#dc-input');
  const fromSel = container.querySelector('#dc-from');
  const toSel = container.querySelector('#dc-to');
  const output = container.querySelector('#dc-output');

  const delims = {
    newline: '\n',
    comma: ',',
    semicolon: ';',
    tab: '\t',
    space: ' ',
  };

  function update() {
    const f = delims[fromSel.value];
    const t = delims[toSel.value];
    if (f === '\n') {
      output.value = input.value.split(/\r?\n/).join(t);
    } else {
      output.value = input.value.split(f).join(t);
    }
  }
  [input, fromSel, toSel].forEach(el => el.addEventListener('input', update));
  container.querySelector('#dc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#dc-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#dc-copy'));
  });
}

function renderUuidGenerator(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div style="max-width:700px; margin:0 auto; width:100%;">
      <div class="settings-bar" style="margin-bottom:14px;">
        <label>${L ? 'Vrsta:' : 'Type:'}
          <select id="uuid-mode">
            <option value="uuid">UUID v4 (RFC 4122)</option>
            <option value="hex">Hex string</option>
          </select>
        </label>
        <label>${L ? 'Dolžina (za Hex):' : 'Length:'}
          <input type="number" id="uuid-len" min="8" max="64" value="32" style="width:70px;">
        </label>
      </div>
      <label>${getI('ui_output')}</label>
      <textarea id="uuid-output" readonly style="min-height:90px; text-align:center; font-size:16px; font-family:monospace; padding-top:24px;"></textarea>
      <div class="panel-actions" style="justify-content:center; gap:12px; margin-top:12px;">
        <button class="btn-sm primary" id="uuid-gen" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Generiraj' : 'Generate'}</span></button>
        <button class="btn-sm" id="uuid-copy" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
      </div>
    </div>
  `;
  const mode = container.querySelector('#uuid-mode');
  const lenInput = container.querySelector('#uuid-len');
  const output = container.querySelector('#uuid-output');

  function generate() {
    if (mode.value === 'uuid') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      output.value = [...bytes]
        .map(b => ('0' + b.toString(16)).slice(-2))
        .join('')
        .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
    } else {
      const n = Math.min(64, Math.max(8, Number(lenInput.value) || 32));
      const bytes = new Uint8Array(Math.ceil(n / 2));
      crypto.getRandomValues(bytes);
      output.value = Array.from(bytes)
        .map(b => ('0' + b.toString(16)).slice(-2))
        .join('')
        .slice(0, n);
    }
  }
  container.querySelector('#uuid-gen').addEventListener('click', generate);
  container.querySelector('#uuid-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#uuid-copy'));
  });
  generate();
}

function renderMorseBinary(container) {
  const L = currentLang === 'sl';
  const MORSE_MAP = {
    A: '.-',
    B: '-...',
    C: '-.-.',
    Č: '-.-..',
    D: '-..',
    E: '.',
    F: '..-.',
    G: '--.',
    H: '....',
    I: '..',
    J: '.---',
    K: '-.-',
    L: '.-..',
    M: '--',
    N: '-.',
    O: '---',
    P: '.--.',
    Q: '--.-',
    R: '.-.',
    S: '...',
    Š: '...-',
    T: '-',
    U: '..-',
    V: '...-',
    W: '.--',
    X: '-..-',
    Y: '-.--',
    Z: '--..',
    Ž: '--..-',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '0': '-----',
    ' ': '/',
    '.': '.-.-.-',
    ',': '--..--',
    '?': '..--..',
    '!': '-.-.--',
  };
  const REVERSE_MORSE = Object.entries(MORSE_MAP).reduce((acc, [k, v]) => {
    acc[v] = k;
    return acc;
  }, {});

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način:' : 'Mode:'}
        <select id="mb-mode">
          <option value="text2morse">${L ? 'Besedilo → Morsejeva koda' : 'Text to Morse'}</option>
          <option value="morse2text">${L ? 'Morsejeva koda → Besedilo' : 'Morse to Text'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="mb-input">${getI('ui_input')}</label>
        <textarea id="mb-input" placeholder="${L ? 'Vnesite besedilo ali morsejevo kodo...' : 'Enter text or morse code...'}">Pozdrav iz Slovenije</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="mb-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="mb-output">${getI('ui_output')}</label>
        <textarea id="mb-output" readonly placeholder="${L ? 'Rezultat...' : 'Result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="mb-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#mb-input');
  const mode = container.querySelector('#mb-mode');
  const output = container.querySelector('#mb-output');

  function update() {
    const val = input.value.trim();
    if (mode.value === 'text2morse') {
      output.value = [...val.toUpperCase()].map(c => MORSE_MAP[c] || c).join(' ');
    } else {
      output.value = val
        .split(/\s+/)
        .map(m => REVERSE_MORSE[m] || (m === '/' ? ' ' : m))
        .join('');
    }
  }
  [input, mode].forEach(el => el.addEventListener('input', update));
  container.querySelector('#mb-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#mb-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#mb-copy'));
  });
  update();
}

function renderTextToImage(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Barva besedila:' : 'Text color:'}
        <input type="text" id="ti-color" placeholder="#111827" value="#111827" style="width:85px;">
      </label>
      <label>${L ? 'Ozadje:' : 'Background:'}
        <input type="text" id="ti-bg" placeholder="#ffffff" value="#ffffff" style="width:85px;">
      </label>
      <label>${L ? 'Velikost pisave:' : 'Font size:'}
        <select id="ti-size">
          <option value="20">20 px</option>
          <option value="28" selected>28 px</option>
          <option value="36">36 px</option>
          <option value="48">48 px</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ti-input">${getI('ui_input')}</label>
        <textarea id="ti-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ti-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${getI('ui_output')}</label>
        <div style="text-align:center; padding:16px; background:var(--card); border:1px solid var(--border); border-radius:12px; flex:1; display:flex; align-items:center; justify-content:center; min-height:200px;">
          <canvas id="ti-canvas" width="600" height="240" style="max-width:100%; border-radius:8px; border:1px solid var(--border);"></canvas>
        </div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ti-download" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${getI('ui_download')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ti-input');
  const color = container.querySelector('#ti-color');
  const bg = container.querySelector('#ti-bg');
  const sizeSel = container.querySelector('#ti-size');
  const canvas = container.querySelector('#ti-canvas');
  const ctx = canvas.getContext('2d');

  function draw() {
    ctx.fillStyle = bg.value || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color.value || '#111827';
    const fSize = parseInt(sizeSel.value) || 28;
    ctx.font = `bold ${fSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = (input.value || '').split('\n');
    const lineHeight = fSize * 1.3;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, startY + i * lineHeight));
  }
  [input, color, bg, sizeSel].forEach(el => el.addEventListener('input', draw));
  container.querySelector('#ti-clear').addEventListener('click', () => {
    input.value = '';
    draw();
    input.focus();
  });
  container.querySelector('#ti-download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'besedomat-slika.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  draw();
}

function renderJsonStringify(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="js-input">${getI('ui_input')}</label>
        <textarea id="js-input" placeholder="${L ? 'Vnesite surovo besedilo za pretvorbo v JSON niz...' : 'Enter raw text to escape into JSON string...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="js-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="js-output">${getI('ui_output')}</label>
        <textarea id="js-output" readonly placeholder="${L ? 'JSON ubežani niz...' : 'JSON escaped string...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="js-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#js-input');
  const output = container.querySelector('#js-output');
  function update() {
    try {
      output.value = JSON.stringify(input.value);
    } catch (e) {
      output.value = 'Invalid string.';
    }
  }
  input.addEventListener('input', update);
  container.querySelector('#js-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#js-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#js-copy'));
  });
}

function renderPlatformCounter(container) {
  const L = currentLang === 'sl';

  const platforms = [
    { id: 'twitter', name: 'Twitter / X', limit: 280, icon: '🐦', color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', limit: 3000, icon: '💼', color: '#0A66C2' },
    { id: 'instagram', name: 'Instagram', limit: 2200, icon: '📷', color: '#E4405F' },
    { id: 'sms', name: 'SMS', limit: 160, icon: '📱', color: '#25D366' },
    { id: 'meta', name: 'Meta Description', limit: 160, icon: '🔍', color: '#1877F2' },
    { id: 'youtube', name: 'YouTube Title', limit: 100, icon: '▶️', color: '#FF0000' },
  ];

  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pc-input">${getI('ui_input')}</label>
        <textarea id="pc-input" placeholder="${L ? 'Vnesite besedilo za preverjanje dolžine...' : 'Enter text to check length...'}" style="min-height:180px;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultati po platformah' : 'Results by Platform'}</label>
        <div id="pc-results" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:200px; overflow:auto;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="pc-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj povzetek' : 'Copy Summary'}</span></button>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#pc-input');
  const resultsDiv = container.querySelector('#pc-results');

  function getCountStats(text) {
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r?\n/).length : 0;
    return { charsWithSpaces, charsNoSpaces, words, lines };
  }

  function getStatus(used, limit) {
    const pct = (used / limit) * 100;
    if (used > limit)
      return {
        class: 'over',
        label: L ? `PRESEŽENO (+${used - limit})` : `OVER (+${used - limit})`,
        pct: Math.min(pct, 200),
      };
    if (pct >= 90)
      return {
        class: 'warn',
        label: L ? `Preostane ${limit - used}` : `${limit - used} left`,
        pct,
      };
    return { class: 'ok', label: L ? `Preostane ${limit - used}` : `${limit - used} left`, pct };
  }

  function update() {
    const text = input.value;
    const stats = getCountStats(text);

    let html = `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
        `;

    platforms.forEach(p => {
      const status = getStatus(stats.charsWithSpaces, p.limit);
      const pct = Math.min(status.pct, 100);
      html += `
            <div style="border:1px solid var(--border); border-radius:10px; padding:12px; background:var(--bg-alt);">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span style="font-size:20px;">${p.icon}</span>
                <strong style="color:${p.color};">${p.name}</strong>
              </div>
              <div style="height:8px; background:var(--border); border-radius:4px; overflow:hidden; margin-bottom:6px;">
                <div style="width:${pct}%; height:100%; background:${status.class === 'over' ? '#ef4444' : status.class === 'warn' ? '#f59e0b' : '#22c55e'}; border-radius:4px; transition:width 0.3s;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px; font-family:monospace;">
                <span>${stats.charsWithSpaces} / ${p.limit} ${L ? 'znakov' : 'chars'}</span>
                <span class="${status.class}" style="color:${status.class === 'over' ? '#ef4444' : status.class === 'warn' ? '#f59e0b' : '#22c55e'}; font-weight:600;">${status.label}</span>
              </div>
            </div>
          `;
    });

    html += `
          </div>
          <hr style="margin:16px 0; border-color:var(--border);">
          <div style="font-size:13px; color:var(--text-dim);">
            <strong>${L ? 'Skupaj:' : 'Total:'}</strong> ${stats.charsWithSpaces} ${L ? 'znakov (s presledki)' : 'chars (with spaces)'}, ${stats.charsNoSpaces} ${L ? 'brez presledkov' : 'no spaces'}, ${stats.words} ${L ? 'besed' : 'words'}, ${stats.lines} ${L ? 'vrstic' : 'lines'}
          </div>
        `;

    resultsDiv.innerHTML = html;
  }

  input.addEventListener('input', update);
  container.querySelector('#pc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#pc-copy').addEventListener('click', () => {
    const text = input.value;
    const stats = getCountStats(text);
    let summary = `${L ? 'Povzetek dolžin' : 'Length Summary'}:\n`;
    platforms.forEach(p => {
      const status = getStatus(stats.charsWithSpaces, p.limit);
      summary += `${p.name}: ${stats.charsWithSpaces}/${p.limit} (${status.label})\n`;
    });
    summary += `\n${L ? 'Skupaj' : 'Total'}: ${stats.charsWithSpaces} ${L ? 'znakov' : 'chars'}, ${stats.words} ${L ? 'besed' : 'words'}`;
    copyText(summary, container.querySelector('#pc-copy'));
  });
  update();
}

function renderReadabilityAnalyzer(container) {
  const L = currentLang === 'sl';

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Jezik besedila:' : 'Text language:'}
        <select id="ra-lang">
          <option value="sl">${L ? 'Slovenščina' : 'Slovenian'}</option>
          <option value="en">${L ? 'Angleščina' : 'English'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="ra-highlight" checked> ${L ? 'Označi dolge stavke' : 'Highlight long sentences'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ra-input">${getI('ui_input')}</label>
        <textarea id="ra-input" placeholder="${L ? 'Vnesite besedilo za analizo berljivosti...' : 'Enter text for readability analysis...'}" style="min-height:220px;">${L ? 'Besedomat je sodobno orodje za analizo in urejanje besedil. Ponuja veliko funkcij, ki so enostavne za uporabo. Vse deluje lokalno v brskalniku, brez pošiljanja podatkov na strežnik. To pomeni, da so vaši podatki varni in zasebni.' : 'Besedomat is a modern tool for text analysis and editing. It offers many features that are easy to use. Everything runs locally in the browser, without sending data to a server. This means your data is safe and private.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ra-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultati analize' : 'Analysis Results'}</label>
        <div id="ra-results" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:220px; overflow:auto;"></div>
        <div id="ra-highlighted" style="display:none; margin-top:12px; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:150px; overflow:auto; font-size:13.5px; line-height:1.7;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ra-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj poročilo' : 'Copy Report'}</span></button>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#ra-input');
  const langSel = container.querySelector('#ra-lang');
  const highlightCheck = container.querySelector('#ra-highlight');
  const resultsDiv = container.querySelector('#ra-results');
  const highlightedDiv = container.querySelector('#ra-highlighted');

  function countSyllablesSL(word) {
    // Slovenian: count vowel groups
    return (word.match(/[aeiouAEIOUáéíóúàèìòùâêîôûäëïöü]/g) || []).length;
  }

  function countSyllablesEN(word) {
    // English: rough approximation
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    return (word.match(/[aeiouy]{1,2}/g) || []).length || 1;
  }

  function analyze() {
    const text = input.value.trim();
    const lang = langSel.value;
    const doHighlight = highlightCheck.checked;

    if (!text) {
      resultsDiv.innerHTML = `<div style="color:var(--text-dim); text-align:center; padding:40px;">${L ? 'Vnesite besedilo za analizo.' : 'Enter text to analyze.'}</div>`;
      highlightedDiv.style.display = 'none';
      return;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.match(/[a-zA-ZčšžČŠŽ]+/g) || [];
    const syllables = words.reduce(
      (sum, w) => sum + (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)),
      0
    );

    const numSentences = sentences.length || 1;
    const numWords = words.length || 1;
    const numSyllables = syllables || numWords;

    // Flesch Reading Ease
    let flesch;
    if (lang === 'sl') {
      flesch = 206.835 - 1.015 * (numWords / numSentences) - 84.6 * (numSyllables / numWords);
    } else {
      flesch = 206.835 - 1.015 * (numWords / numSentences) - 84.6 * (numSyllables / numWords);
    }
    flesch = Math.max(0, Math.min(100, flesch));

    // Flesch-Kincaid Grade Level
    const fkGrade = 0.39 * (numWords / numSentences) + 11.8 * (numSyllables / numWords) - 15.59;

    // Gunning Fog
    const complexWords = words.filter(
      w => (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)) >= 3
    ).length;
    const fog = 0.4 * (numWords / numSentences + 100 * (complexWords / numWords));

    // SMOG
    const smog = 1.043 * Math.sqrt(complexWords * (30 / numSentences)) + 3.1291;

    // Avg words per sentence
    const avgWordsPerSentence = (numWords / numSentences).toFixed(1);
    // Avg syllables per word
    const avgSyllablesPerWord = (numSyllables / numWords).toFixed(2);

    // Reading time
    const wpm = lang === 'sl' ? 200 : 238;
    const readMins = Math.max(1, Math.ceil(numWords / wpm));
    const speakMins = Math.max(1, Math.ceil(numWords / 150));

    // Difficulty label
    let difficulty = '';
    if (flesch >= 90) difficulty = L ? 'Zelo enostavno' : 'Very Easy';
    else if (flesch >= 80) difficulty = L ? 'Enostavno' : 'Easy';
    else if (flesch >= 70) difficulty = L ? 'Precej enostavno' : 'Fairly Easy';
    else if (flesch >= 60) difficulty = L ? 'Standardno' : 'Standard';
    else if (flesch >= 50) difficulty = L ? 'Precej težavno' : 'Fairly Difficult';
    else if (flesch >= 30) difficulty = L ? 'Težavno' : 'Difficult';
    else difficulty = L ? 'Zelo težavno' : 'Very Difficult';

    // Highlight long sentences
    let highlightedHtml = '';
    if (doHighlight) {
      const parts = text.split(/([.!?]+)/);
      highlightedHtml = parts
        .map(part => {
          const trimmed = part.trim();
          const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
          if (wordCount > 25) {
            return `<mark style="background:rgba(239,68,68,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
          } else if (wordCount >= 20) {
            return `<mark style="background:rgba(245,158,11,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
          }
          return escapeHtml(part);
        })
        .join('');
      highlightedDiv.style.display = 'block';
      highlightedDiv.innerHTML = `<strong>${L ? 'Označeni stavki:' : 'Highlighted sentences:'}</strong> (${L ? 'rdeče >25 besed, rumene 20-25 besed' : 'red >25 words, yellow 20-25 words'})<br><br>${highlightedHtml}`;
    } else {
      highlightedDiv.style.display = 'none';
    }

    let report = '';
    resultsDiv.innerHTML = `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
            <div class="stat-box" style="background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15)); border-color:var(--violet);">
              <div class="num" style="color:var(--violet);">${flesch.toFixed(1)}</div>
              <div class="lbl">${L ? 'Flesch Reading Ease' : 'Flesch Reading Ease'}</div>
            </div>
            <div class="stat-box" style="background:linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15)); border-color:#22c55e;">
              <div class="num" style="color:#22c55e;">${difficulty}</div>
              <div class="lbl">${L ? 'Stopnja zahtevnosti' : 'Difficulty Level'}</div>
            </div>
            <div class="stat-box">
              <div class="num">${fkGrade.toFixed(1)}</div>
              <div class="lbl">${L ? 'Flesch-Kincaid Grade' : 'Flesch-Kincaid Grade'}</div>
            </div>
            <div class="stat-box">
              <div class="num">${fog.toFixed(1)}</div>
              <div class="lbl">Gunning Fog Index</div>
            </div>
            <div class="stat-box">
              <div class="num">${smog.toFixed(1)}</div>
              <div class="lbl">SMOG Index</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px; font-size:13px; color:var(--text-dim);">
            <div><strong>${numWords}</strong> ${L ? 'besed' : 'words'}</div>
            <div><strong>${numSentences}</strong> ${L ? 'stavkov' : 'sentences'}</div>
            <div><strong>${numSyllables}</strong> ${L ? 'skladov' : 'syllables'}</div>
            <div><strong>${avgWordsPerSentence}</strong> ${L ? 'besed/stavek' : 'words/sent'}</div>
            <div><strong>${avgSyllablesPerWord}</strong> ${L ? 'skladov/besedo' : 'syll/word'}</div>
            <div><strong>${complexWords}</strong> ${L ? 'kompleksnih besed (≥3 skladi)' : 'complex words (≥3 syll)'}</div>
            <div><strong>${readMins} min</strong> ${L ? 'branje' : 'reading'}</div>
            <div><strong>${speakMins} min</strong> ${L ? 'govor' : 'speaking'}</div>
          </div>
          <div style="margin-top:16px; padding:12px; background:var(--bg-alt); border-radius:8px; font-size:12px; color:var(--text-dim);">
            ${L ? 'Opomba: Formule so prilagojene za slovenščino/angleščino. Rezultati so usmerjeni.' : 'Note: Formulas adapted for Slovenian/English. Results are approximate.'}
          </div>
        `;

    report = `${L ? 'Analiza berljivosti' : 'Readability Analysis'}\n${L ? 'Jezik' : 'Language'}: ${lang.toUpperCase()}\n\n${L ? 'Flesch Reading Ease' : 'Flesch Reading Ease'}: ${flesch.toFixed(1)} (${difficulty})\n${L ? 'Flesch-Kincaid Grade' : 'Flesch-Kincaid Grade'}: ${fkGrade.toFixed(1)}\nGunning Fog Index: ${fog.toFixed(1)}\nSMOG Index: ${smog.toFixed(1)}\n\n${L ? 'Besede' : 'Words'}: ${numWords}\n${L ? 'Stavki' : 'Sentences'}: ${numSentences}\n${L ? 'Sklandi' : 'Syllables'}: ${numSyllables}\n${L ? 'Povprečno besed na stavek' : 'Avg words/sentence'}: ${avgWordsPerSentence}\n${L ? 'Povprečno skladov na besedo' : 'Avg syllables/word'}: ${avgSyllablesPerWord}\n${L ? 'Kompleksne besede (≥3 skladi)' : 'Complex words (≥3 syll)'}: ${complexWords}\n\n${L ? 'Čas branja' : 'Reading time'}: ${readMins} min\n${L ? 'Čas govora' : 'Speaking time'}: ${speakMins} min`;

    container.querySelector('#ra-copy').onclick = () =>
      copyText(report, container.querySelector('#ra-copy'));
  }

  input.addEventListener('input', analyze);
  langSel.addEventListener('change', analyze);
  highlightCheck.addEventListener('change', analyze);
  container.querySelector('#ra-clear').addEventListener('click', () => {
    input.value = '';
    analyze();
    input.focus();
  });
  analyze();
}

function renderTextToEmoji(container) {
  const L = currentLang === 'sl';

  // Emoji dictionary for SL and EN
  const emojiDict = {
    sl: {
      ljubezen: '❤️',
      ljubav: '❤️',
      srce: '❤️',
      kava: '☕',
      kafe: '☕',
      espresso: '☕',
      sonce: '☀️',
      sončno: '☀️',
      zrak: '☀️',
      luna: '🌙',
      noč: '🌙',
      noč: '🌙',
      zvezda: '⭐',
      zvezdice: '✨',
      dež: '🌧️',
      deževje: '🌧️',
      kiša: '🌧️',
      sneg: '❄️',
      snežek: '❄️',
      zima: '❄️',
      drevo: '🌳',
      gozd: '🌲',
      narava: '🌿',
      cvet: '🌸',
      cvetje: '🌺',
      roža: '🌹',
      mačka: '🐱',
      mačke: '🐱',
      mačje: '🐱',
      pes: '🐶',
      psa: '🐶',
      kuža: '🐶',
      ptica: '🐦',
      ptice: '🐦',
      riba: '🐟',
      ribe: '🐟',
      konj: '🐴',
      konji: '🐴',
      krava: '🐄',
      ovca: '🐑',
      prašič: '🐷',
      hiša: '🏠',
      dom: '🏠',
      stanovanje: '🏠',
      avto: '🚗',
      avtomobil: '🚗',
      kolo: '🚲',
      vlak: '🚂',
      avtobus: '🚌',
      letalo: '✈️',
      ladja: '⛵',
      brod: '🚢',
      denar: '💰',
      evri: '💶',
      dolar: '💵',
      zlato: '💰',
      čas: '⏰',
      ura: '🕐',
      minuta: '⏱️',
      sekunda: '⏱️',
      dan: '📅',
      teden: '📅',
      mesec: '📅',
      leto: '📅',
      hrana: '🍔',
      jed: '🍽️',
      kosilo: '🍽️',
      večerja: '🍽️',
      pica: '🍕',
      sendvič: '🥪',
      slaščica: '🍰',
      torta: '🎂',
      jabolko: '🍎',
      banana: '🍌',
      jagoda: '🍓',
      grozdje: '🍇',
      pivo: '🍺',
      vino: '🍷',
      koktajl: '🍹',
      voda: '💧',
      veselje: '😊',
      sreča: '😄',
      nasmeh: '😊',
      smijeh: '😂',
      žalost: '😢',
      tužnost: '😢',
      solze: '😭',
      gnev: '😡',
      jeza: '😠',
      razjezen: '😡',
      strah: '😱',
      plašiti: '😨',
      strašen: '😱',
      presenečenje: '😲',
      šok: '😱',
      ljubosumje: '😒',
      zavist: '😒',
      spanje: '😴',
      spanje: '😴',
      zaspati: '😴',
      bolan: '🤒',
      bolečina: '🤕',
      zdravje: '🏥',
      bolnišnica: '🏥',
      zdravnik: '👨‍⚕️',
      lekar: '👩‍⚕️',
      šola: '🏫',
      učitelji: '👨‍🏫',
      učiteljica: '👩‍🏫',
      učenje: '📚',
      knjiga: '📖',
      knjige: '📚',
      branje: '📖',
      pisanje: '✍️',
      pisati: '✏️',
      pisalo: '✏️',
      glasba: '🎵',
      pesem: '🎵',
      pevaj: '🎤',
      koncert: '🎤',
      film: '🎬',
      kino: '🎬',
      serija: '📺',
      tv: '📺',
      igra: '🎮',
      gamer: '🎮',
      videoigra: '🎮',
      šport: '⚽',
      nogomet: '⚽',
      košarka: '🏀',
      tenis: '🎾',
      tekmovanje: '🏆',
      zmaga: '🏆',
      medalja: '🥇',
      poklon: '🎁',
      darilo: '🎁',
      'rojstni dan': '🎂',
      rojstni: '🎂',
      praznik: '🎉',
      slavje: '🎊',
      'novo leto': '🎆',
      ljubljena: '💑',
      ljubljeni: '💑',
      partner: '💑',
      poroka: '💍',
      družina: '👨‍👩‍👧‍👦',
      otroci: '👶',
      sin: '👦',
      hčerka: '👧',
      mama: '👩',
      tata: '👨',
      babica: '👵',
      dedek: '👴',
      prijatelj: '👯',
      prijateljica: '👯',
      znanec: '🤝',
      pogovor: '💬',
      klepet: '💬',
      spor: '🗣️',
      telefon: '📞',
      klic: '📞',
      sms: '📨',
      sporočilo: '💌',
      email: '📧',
      pošta: '📮',
      paket: '📦',
      delo: '💼',
      služba: '💼',
      kariera: '📈',
      posao: '💼',
      srečanje: '🤝',
      seja: '📅',
      termin: '📅',
      projekt: '📁',
      naloga: '📋',
      rok: '⏰',
      oddaja: '📤',
      računalnik: '💻',
      laptop: '💻',
      mobilni: '📱',
      telefon: '📱',
      internet: '🌐',
      splet: '🌐',
      wifi: '📶',
      signal: '📶',
      kljukica: '✅',
      prav: '✅',
      narobe: '❌',
      napaka: '❌',
      vprašanje: '❓',
      odgovor: '💡',
      ideja: '💡',
      misel: '💭',
      opomba: '📝',
      zapis: '📝',
      seznam: '📋',
      nadaljevanje: '➡️',
      levo: '⬅️',
      desno: '➡️',
      gor: '⬆️',
      dol: '⬇️',
      iskanje: '🔍',
      najti: '🔍',
      skrit: '🕵️',
      tajnik: '🤫',
      ključ: '🔑',
      zaklenjeno: '🔒',
      odklenjeno: '🔓',
      varnost: '🛡️',
      zaščita: '🛡️',
      policija: '👮',
      gasilec: '🚒',
      bolnica: '🏥',
      rešitev: '💡',
      problem: '❓',
      izziv: '🏔️',
      plan: '📋',
      cilj: '🎯',
      uspeh: '✅',
      neuspeh: '❌',
      prihodnje: '🔮',
      preteklost: '🕰️',
      sedaj: '⏰',
      jutro: '🌅',
      poldne: '☀️',
      večer: '🌆',
      ponoč: '🌙',
      ponedeljek: '📅',
      torek: '📅',
      sreda: '📅',
      četrtek: '📅',
      petek: '📅',
      sobota: '📅',
      nedelja: '📅',
      januar: '❄️',
      februar: '❄️',
      marec: '🌱',
      april: '🌧️',
      maj: '🌸',
      junij: '☀️',
      julij: '☀️',
      avgust: '🌞',
      september: '🍂',
      oktober: '🎃',
      november: '🍂',
      december: '🎄',
    },
    en: {
      love: '❤️',
      heart: '❤️',
      hearts: '💕',
      coffee: '☕',
      cafe: '☕',
      espresso: '☕',
      sun: '☀️',
      sunny: '☀️',
      sunshine: '☀️',
      moon: '🌙',
      night: '🌙',
      dark: '🌙',
      star: '⭐',
      stars: '✨',
      sparkle: '✨',
      rain: '🌧️',
      rainy: '🌧️',
      storm: '⛈️',
      snow: '❄️',
      snowflake: '❄️',
      winter: '❄️',
      tree: '🌳',
      forest: '🌲',
      nature: '🌿',
      flower: '🌸',
      flowers: '🌺',
      rose: '🌹',
      cat: '🐱',
      cats: '🐱',
      kitten: '🐱',
      dog: '🐶',
      dogs: '🐶',
      puppy: '🐶',
      bird: '🐦',
      birds: '🐦',
      fish: '🐟',
      fishes: '🐟',
      horse: '🐴',
      horses: '🐴',
      cow: '🐄',
      sheep: '🐑',
      pig: '🐷',
      house: '🏠',
      home: '🏠',
      building: '🏢',
      car: '🚗',
      automobile: '🚗',
      bike: '🚲',
      train: '🚂',
      bus: '🚌',
      plane: '✈️',
      ship: '⛵',
      boat: '🚢',
      money: '💰',
      euro: '💶',
      dollar: '💵',
      gold: '💰',
      time: '⏰',
      hour: '🕐',
      minute: '⏱️',
      second: '⏱️',
      day: '📅',
      week: '📅',
      month: '📅',
      year: '📅',
      food: '🍔',
      meal: '🍽️',
      lunch: '🍽️',
      dinner: '🍽️',
      pizza: '🍕',
      sandwich: '🥪',
      cake: '🍰',
      dessert: '🍰',
      apple: '🍎',
      banana: '🍌',
      strawberry: '🍓',
      grapes: '🍇',
      beer: '🍺',
      wine: '🍷',
      cocktail: '🍹',
      water: '💧',
      happy: '😊',
      joy: '😄',
      smile: '😊',
      laugh: '😂',
      sad: '😢',
      sadness: '😢',
      tears: '😭',
      cry: '😭',
      angry: '😡',
      anger: '😠',
      mad: '😡',
      furious: '😡',
      fear: '😱',
      scared: '😨',
      afraid: '😱',
      terrified: '😱',
      surprise: '😲',
      shock: '😱',
      amazed: '😲',
      jealous: '😒',
      envy: '😒',
      sleep: '😴',
      sleepy: '😴',
      tired: '😴',
      sick: '🤒',
      pain: '🤕',
      health: '🏥',
      ill: '🤒',
      hospital: '🏥',
      doctor: '👨‍⚕️',
      nurse: '👩‍⚕️',
      school: '🏫',
      teacher: '👨‍🏫',
      learning: '📚',
      study: '📖',
      book: '📖',
      books: '📚',
      reading: '📖',
      writing: '✍️',
      write: '✏️',
      pen: '✏️',
      pencil: '✏️',
      music: '🎵',
      song: '🎵',
      sing: '🎤',
      concert: '🎤',
      movie: '🎬',
      cinema: '🎬',
      series: '📺',
      tv: '📺',
      game: '🎮',
      gamer: '🎮',
      videogame: '🎮',
      sport: '⚽',
      football: '⚽',
      soccer: '⚽',
      basketball: '🏀',
      tennis: '🎾',
      competition: '🏆',
      win: '🏆',
      victory: '🏆',
      medal: '🥇',
      gift: '🎁',
      present: '🎁',
      birthday: '🎂',
      party: '🎉',
      holiday: '🎉',
      celebration: '🎊',
      'new year': '🎆',
      couple: '💑',
      partner: '💑',
      marriage: '💍',
      wedding: '💍',
      family: '👨‍👩‍👧‍👦',
      children: '👶',
      son: '👦',
      daughter: '👧',
      mom: '👩',
      mother: '👩',
      dad: '👨',
      father: '👨',
      grandma: '👵',
      grandpa: '👴',
      friend: '👯',
      friends: '👯',
      acquaintance: '🤝',
      talk: '💬',
      chat: '💬',
      argument: '🗣️',
      discussion: '💬',
      phone: '📞',
      call: '📞',
      sms: '📨',
      message: '💌',
      email: '📧',
      mail: '📮',
      package: '📦',
      work: '💼',
      job: '💼',
      career: '📈',
      office: '🏢',
      meeting: '🤝',
      appointment: '📅',
      schedule: '📅',
      project: '📁',
      task: '📋',
      deadline: '⏰',
      submit: '📤',
      computer: '💻',
      laptop: '💻',
      mobile: '📱',
      phone: '📱',
      internet: '🌐',
      web: '🌐',
      wifi: '📶',
      signal: '📶',
      check: '✅',
      yes: '✅',
      correct: '✅',
      wrong: '❌',
      error: '❌',
      question: '❓',
      answer: '💡',
      idea: '💡',
      thought: '💭',
      note: '📝',
      memo: '📝',
      list: '📋',
      next: '➡️',
      left: '⬅️',
      right: '➡️',
      up: '⬆️',
      down: '⬇️',
      search: '🔍',
      find: '🔍',
      hidden: '🕵️',
      secret: '🤫',
      key: '🔑',
      locked: '🔒',
      unlocked: '🔓',
      security: '🛡️',
      protection: '🛡️',
      police: '👮',
      firefighter: '🚒',
      hospital: '🏥',
      solution: '💡',
      problem: '❓',
      challenge: '🏔️',
      plan: '📋',
      goal: '🎯',
      success: '✅',
      failure: '❌',
      future: '🔮',
      past: '🕰️',
      now: '⏰',
      morning: '🌅',
      noon: '☀️',
      evening: '🌆',
      midnight: '🌙',
      monday: '📅',
      tuesday: '📅',
      wednesday: '📅',
      thursday: '📅',
      friday: '📅',
      saturday: '📅',
      sunday: '📅',
      january: '❄️',
      february: '❄️',
      march: '🌱',
      april: '🌧️',
      may: '🌸',
      june: '☀️',
      july: '☀️',
      august: '🌞',
      september: '🍂',
      october: '🎃',
      november: '🍂',
      december: '🎄',
    },
  };

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način izhoda:' : 'Output mode:'}
        <select id="te-mode">
          <option value="replace">${L ? 'Zamenjaj besede z emoji' : 'Replace words with emoji'}</option>
          <option value="append">${L ? 'Dodaj emoji za besedo' : 'Append emoji to word'}</option>
          <option value="above">${L ? 'Emoji nad besedo (ruby)' : 'Emoji above word (ruby)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="te-case" checked> ${L ? 'Neupoštevaj velikost črk' : 'Ignore case'}</label>
      <label><input type="checkbox" id="te-unknown" checked> ${L ? 'Ohranjaj neprepoznane besede' : 'Keep unknown words'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="te-input">${getI('ui_input')}</label>
        <textarea id="te-input" placeholder="${L ? 'Vnesite besedilo (npr. \"ljubezen kava sonce\")...' : 'Enter text (e.g. \"love coffee sun\")...'}" style="min-height:160px;">${L ? 'ljubezen kava sonce drevo cvet' : 'love coffee sun tree flower'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="te-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="te-output">${getI('ui_output')}</label>
        <div id="te-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:160px; overflow:auto; line-height:2; font-size:16px;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="te-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
    <div style="margin-top:12px; padding:12px; background:var(--card); border:1px solid var(--border); border-radius:12px; font-size:12px; color:var(--text-dim);">
      <strong>${L ? 'Primeri:' : 'Examples:'}</strong><br>
      ${L ? '"ljubezen kava sonce" → "❤️ ☕ ☀️"' : '"love coffee sun" → "❤️ ☕ ☀️"'}<br>
      ${L ? '"veselje hrana prijatelji" → "😊 🍔 👯"' : '"happy food friends" → "😊 🍔 👯"'}
    </div>
  `;

  const input = container.querySelector('#te-input');
  const outputWrap = container.querySelector('#te-output-wrap');
  const modeSel = container.querySelector('#te-mode');
  const caseCheck = container.querySelector('#te-case');
  const unknownCheck = container.querySelector('#te-unknown');

  function update() {
    const text = input.value;
    const mode = modeSel.value;
    const ignoreCase = caseCheck.checked;
    const keepUnknown = unknownCheck.checked;
    const dict = emojiDict[currentLang] || emojiDict.en;

    // Tokenize: split by word boundaries, keeping punctuation
    const tokens = text.split(/(\s+|[.,!?;:()[\]{}"'])/);

    let result = '';
    for (const token of tokens) {
      if (!token || /^[\s.,!?;:()[\]{}"']+$/.test(token)) {
        result += token;
        continue;
      }

      const cleanToken = token.replace(/^[.,!?;:()[\]{}"']+|[.,!?;:()[\]{}"']+$/g, '');
      const punctBefore = token.match(/^[.,!?;:()[\]{}"']+/)?.[0] || '';
      const punctAfter = token.match(/[.,!?;:()[\]{}"']+$/)?.[0] || '';
      const lookupKey = ignoreCase ? cleanToken.toLowerCase() : cleanToken;

      const emoji = dict[lookupKey];

      if (emoji) {
        if (mode === 'replace') {
          result += punctBefore + emoji + punctAfter;
        } else if (mode === 'append') {
          result += punctBefore + cleanToken + ' ' + emoji + punctAfter;
        } else if (mode === 'above') {
          result += punctBefore + `<ruby>${cleanToken}<rt>${emoji}</rt></ruby>` + punctAfter;
        }
      } else if (keepUnknown) {
        result += token;
      }
      // else: skip unknown words entirely
    }

    outputWrap.innerHTML =
      result ||
      (L
        ? '<span style="color:var(--text-dim);">Ni ujemanj. Poskusite druge besede.</span>'
        : '<span style="color:var(--text-dim);">No matches. Try other words.</span>');
  }

  [input, modeSel, caseCheck, unknownCheck].forEach(el => el.addEventListener('input', update));
  container.querySelector('#te-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#te-copy').addEventListener('click', () => {
    copyText(outputWrap.innerText || outputWrap.textContent, container.querySelector('#te-copy'));
  });
  update();
}

function renderTabsSpaces(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Smer:' : 'Direction:'}
        <select id="ts-dir">
          <option value="tab2sp">${L ? 'Tabulatorji → Presledki' : 'Tabs to Spaces'}</option>
          <option value="sp2tab">${L ? 'Presledki → Tabulatorji' : 'Spaces to Tabs'}</option>
        </select>
      </label>
      <label>${L ? 'Velikost taba:' : 'Tab size:'}
        <input type="number" id="ts-size" value="4" min="1" max="16" style="width:60px;">
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ts-input">${getI('ui_input')}</label>
        <textarea id="ts-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ts-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ts-output">${getI('ui_output')}</label>
        <textarea id="ts-output" readonly placeholder="${L ? 'Rezultat pretvorbe...' : 'Converted result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ts-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ts-input');
  const dir = container.querySelector('#ts-dir');
  const size = container.querySelector('#ts-size');
  const output = container.querySelector('#ts-output');

  function update() {
    const n = Math.max(1, parseInt(size.value) || 4);
    if (dir.value === 'tab2sp') {
      output.value = input.value.replace(/\t/g, ' '.repeat(n));
    } else {
      output.value = input.value.replace(new RegExp(' '.repeat(n), 'g'), '\t');
    }
  }
  [input, dir, size].forEach(el => el.addEventListener('input', update));
  container.querySelector('#ts-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ts-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ts-copy'));
  });
}

function renderSmartQuotes(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Slog narekovajev:' : 'Quote style:'}
        <select id="sq-style">
          <option value="sl">${L ? 'Slovenski („...“ in ‚...‘)' : 'Slovenian („...“ and ‚...‘)'}</option>
          <option value="en">${L ? 'Angleški (“...” in ‘...’)' : 'English (“...” and ‘...’)'}</option>
          <option value="guillemets">${L ? 'Francoski / Nemški («...» in ‹...›)' : 'Guillemets («...» and ‹...›)'}</option>
          <option value="straight">${L ? 'Ravni ("..." in \'...\')' : 'Straight ("..." and \'...\')'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="sq-input">${getI('ui_input')}</label>
        <textarea id="sq-input" placeholder="${L ? 'Vnesite besedilo z narekovaji...' : 'Enter text with quotes...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="sq-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="sq-output">${getI('ui_output')}</label>
        <textarea id="sq-output" readonly placeholder="${L ? 'Oblikovano besedilo...' : 'Formatted text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="sq-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#sq-input');
  const style = container.querySelector('#sq-style');
  const output = container.querySelector('#sq-output');

  function update() {
    let t = input.value;
    const s = style.value;
    if (s === 'straight') {
      t = t.replace(/[“”„«»]/g, '"').replace(/[‘’‚‹›]/g, "'");
    } else if (s === 'sl') {
      t = t.replace(/(^|[\s(\[{<])"/g, '$1„').replace(/"/g, '“');
      t = t.replace(/(^|[\s(\[{<])'/g, '$1‚').replace(/'/g, '‘');
    } else if (s === 'en') {
      t = t.replace(/(^|[\s(\[{<])"/g, '$1“').replace(/"/g, '”');
      t = t.replace(/(^|[\s(\[{<])'/g, '$1‘').replace(/'/g, '’');
    } else if (s === 'guillemets') {
      t = t.replace(/(^|[\s(\[{<])"/g, '$1«').replace(/"/g, '»');
      t = t.replace(/(^|[\s(\[{<])'/g, '$1‹').replace(/'/g, '›');
    }
    output.value = t;
  }
  [input, style].forEach(el => el.addEventListener('input', update));
  container.querySelector('#sq-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#sq-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#sq-copy'));
  });
}

function renderSplitJoin(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Razdeli po:' : 'Split by:'}
        <input type="text" id="sj-split" placeholder="\n" value="\n" style="width:70px;">
      </label>
      <label>${L ? 'Združi z:' : 'Join with:'}
        <input type="text" id="sj-join" placeholder=", " value=", " style="width:70px;">
      </label>
      <label><input type="checkbox" id="sj-trim" checked> ${L ? 'Obreži presledke (Trim)' : 'Trim elements'}</label>
      <label><input type="checkbox" id="sj-dropempty" checked> ${L ? 'Odstrani prazne' : 'Drop empty'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="sj-input">${getI('ui_input')}</label>
        <textarea id="sj-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="sj-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="sj-output">${getI('ui_output')}</label>
        <textarea id="sj-output" readonly placeholder="${L ? 'Združen rezultat...' : 'Joined result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="sj-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#sj-input');
  const splitEl = container.querySelector('#sj-split');
  const joinEl = container.querySelector('#sj-join');
  const trimCheck = container.querySelector('#sj-trim');
  const dropEmpty = container.querySelector('#sj-dropempty');
  const output = container.querySelector('#sj-output');

  function parseDelim(d) {
    return d.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
  }

  function update() {
    const sDelim = parseDelim(splitEl.value);
    const jDelim = parseDelim(joinEl.value);
    let items = input.value.split(sDelim);
    if (trimCheck.checked) items = items.map(x => x.trim());
    if (dropEmpty.checked) items = items.filter(x => x.length > 0);
    output.value = items.join(jDelim);
  }
  [input, splitEl, joinEl, trimCheck, dropEmpty].forEach(el =>
    el.addEventListener('input', update)
  );
  container.querySelector('#sj-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#sj-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#sj-copy'));
  });
}
// DEPRECATED: duplicat renderCompareText – vir resnice je index.html:8949 (renderCompareText). Pred vite migracijo sinhroniziraj ročno ali izbriši duplicat.

function renderCompareText(container) {
  const L = currentLang === 'sl';

  const sampleA = L
    ? `Pogodba o sodelovanju\n\n1. člen (Predmet)\nNaročnik in izvajalec se dogovorita za izdelavo spletne strani.\nIzvajalec se zavezuje, da bo projekt zaključil v roku 30 dni.\nCena storitve znaša 1.500 EUR brez DDV.\n\n2. člen (Plačilo)\nPlačilo se izvede v dveh obrokih po potrditvi faze.`
    : `Cooperation Agreement\n\nArticle 1 (Subject)\nThe client and provider agree on the development of a website.\nThe provider undertakes to complete the project within 30 days.\nThe total service price is 1,500 EUR excluding VAT.\n\nArticle 2 (Payment)\nPayment shall be made in two equal installments upon milestone confirmation.`;

  const sampleB = L
    ? `Pogodba o poslovnem sodelovanju\n\n1. člen (Predmet)\nNaročnik in izvajalec se dogovorita za celovito izdelavo spletne strani ter mobilne aplikacije.\nIzvajalec se zavezuje, da bo projekt zaključil v roku 45 dni.\nCena storitve znaša 2.200 EUR brez DDV.\n\n2. člen (Plačilo)\nPlačilo se izvede v treh obrokih po pregledu posamezne faze.\n\n3. člen (Garancija)\nGarancijska doba za odpravo napak je 12 mesecev.`
    : `Business Cooperation Agreement\n\nArticle 1 (Subject)\nThe client and provider agree on the comprehensive development of a website and mobile app.\nThe provider undertakes to complete the project within 45 days.\nThe total service price is 2,200 EUR excluding VAT.\n\nArticle 2 (Payment)\nPayment shall be made in three installments upon milestone review.\n\nArticle 3 (Warranty)\nThe warranty period for bug fixes is 12 months.`;

  container.innerHTML = `
    <!-- TOP CONTROLS & OPTIONS BAR -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--border);">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px;">
          ${L ? 'Nivo primerjave:' : 'Diff Level / Mode:'}
          <select id="cmp-algo" style="padding:5px 8px; font-size:13px; border-radius:8px;">
            <option value="line_word" selected>${L ? 'Vrstice + besede (VS Code slog / Koda)' : 'Lines + Words (VS Code style)'}</option>
            <option value="chars">${L ? 'Po posameznih črkah in znakih (Zatipki / Kode)' : 'Char-by-Char (Typos / Characters)'}</option>
            <option value="words">${L ? 'Zvezno po besedah (Lektorski slog / Članki)' : 'Word-by-Word (Prose / Articles)'}</option>
            <option value="lines_only">${L ? 'Samo cele vrstice (Hitri pregled)' : 'Lines Only'}</option>
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px;">
          ${L ? 'Prikaz:' : 'View Mode:'}
          <select id="cmp-view" style="padding:5px 8px; font-size:13px; border-radius:8px;">
            <option value="split" selected>${L ? 'Bočni prikaz (Side-by-Side)' : 'Side-by-Side (Split)'}</option>
            <option value="unified">${L ? 'Združeni prikaz (Unified Diff)' : 'Unified Diff'}</option>
            <option value="prose">${L ? 'Zvezno besedilo (Visual Prose)' : 'Visual Prose'}</option>
            <option value="merged">${L ? 'Končno besedilo B' : 'Clean Output B'}</option>
          </select>
        </label>
      </div>

      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-show-same" checked> ${L ? 'Pokaži nespremenjene' : 'Show unchanged'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-case"> ${L ? 'Ignoriraj velike/male' : 'Ignore case'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-ws"> ${L ? 'Ignoriraj presledke' : 'Ignore whitespace'}</label>
      </div>
    </div>

    <!-- 2-COLUMN INPUTS -->
    <div class="tool-workspace-2col" style="margin-bottom:16px;">
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-a" style="margin:0; font-weight:600; color:#ef4444;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original Text (A)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <label class="btn-sm" for="cmp-file-a" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi A' : 'Import A'}</label>
            <input type="file" id="cmp-file-a" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-sample" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_edit} ${L ? 'Primer' : 'Sample'}</button>
            <button id="cmp-clear-a" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-a" rows="6" placeholder="${L ? 'Prilepite ali vnesite prvotno besedilo (A)...' : 'Paste original text (A)...'}" style="min-height:140px; font-family:monospace; font-size:13px;">${sampleA}</textarea>
        <div id="cmp-meta-a" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>

      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-b" style="margin:0; font-weight:600; color:#22c55e;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified Text (B)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="cmp-swap" class="btn-sm" style="padding:2px 8px; font-size:11px;" title="Swap A and B">${SVG_ICONS.mi_swap} ${L ? 'Zamenjaj A ↔ B' : 'Swap A ↔ B'}</button>
            <label class="btn-sm" for="cmp-file-b" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi B' : 'Import B'}</label>
            <input type="file" id="cmp-file-b" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-clear-b" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-b" rows="6" placeholder="${L ? 'Prilepite ali vnesite spremenjeno besedilo (B)...' : 'Paste modified text (B)...'}" style="min-height:140px; font-family:monospace; font-size:13px;">${sampleB}</textarea>
        <div id="cmp-meta-b" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>
    </div>

    <!-- STATS & BADGES ROW -->
    <div id="cmp-stats-bar" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;"></div>

    <!-- VISUAL DIFF VIEWER DISPLAY -->
    <div id="cmp-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; min-height:260px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px; line-height:1.6;">
    </div>

    <!-- ACTION BUTTONS -->
    <div class="modal-actions" style="margin-top:14px; gap:8px; flex-wrap:wrap; justify-content:flex-start;">
      <button class="btn-sm primary" id="cmp-copy-unified">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj Unified Patch (.diff)' : 'Copy Unified Patch (.diff)'}</button>
      <button class="btn-sm" id="cmp-copy-b">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj končno besedilo B' : 'Copy Final Text B'}</button>
      <button class="btn-sm" id="cmp-copy-html">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj barvni HTML' : 'Copy Formatted HTML'}</button>
    </div>
  `;

  const inputA = container.querySelector('#cmp-input-a');
  const inputB = container.querySelector('#cmp-input-b');
  const fileA = container.querySelector('#cmp-file-a');
  const fileB = container.querySelector('#cmp-file-b');
  const algoSel = container.querySelector('#cmp-algo');
  const viewSel = container.querySelector('#cmp-view');
  const showSameCheck = container.querySelector('#cmp-show-same');
  const ignoreCaseCheck = container.querySelector('#cmp-ignore-case');
  const ignoreWsCheck = container.querySelector('#cmp-ignore-ws');
  const statsBar = container.querySelector('#cmp-stats-bar');
  const outputWrap = container.querySelector('#cmp-output-wrap');
  const metaA = container.querySelector('#cmp-meta-a');
  const metaB = container.querySelector('#cmp-meta-b');

  function lcs(a, b) {
    const m = a.length,
      n = b.length;
    if (m === 0 && n === 0) return [];
    if (m === 0) return b.map(val => ({ type: 'insert', val }));
    if (n === 0) return a.map(val => ({ type: 'delete', val }));

    // Memory cap for large inputs
    if (m * n > 4000000) {
      // Fast linear matching fallback
      const ops = [];
      let i = 0,
        j = 0;
      while (i < m || j < n) {
        if (i < m && j < n && a[i] === b[j]) {
          ops.push({ type: 'equal', val: a[i] });
          i++;
          j++;
        } else if (i < m && (j >= n || a[i] !== b[j])) {
          ops.push({ type: 'delete', val: a[i] });
          i++;
        } else if (j < n) {
          ops.push({ type: 'insert', val: b[j] });
          j++;
        }
      }
      return ops;
    }

    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const ops = [];
    let i = m,
      j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        ops.push({ type: 'equal', val: a[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.push({ type: 'insert', val: b[j - 1] });
        j--;
      } else {
        ops.push({ type: 'delete', val: a[i - 1] });
        i--;
      }
    }
    return ops.reverse();
  }

  function diffWordsPair(strA, strB, ignoreCase, ignoreWs) {
    const tokensA = strA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
    const tokensB = strB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);

    function norm(t) {
      let s = t;
      if (ignoreWs) s = s.replace(/\s+/g, ' ');
      if (ignoreCase) s = s.toLowerCase();
      return s;
    }

    const normA = tokensA.map(norm);
    const normB = tokensB.map(norm);
    const ops = lcs(normA, normB);

    let htmlA = '',
      htmlB = '';
    let ptrA = 0,
      ptrB = 0;

    ops.forEach(op => {
      if (op.type === 'equal') {
        const originalValA = tokensA[ptrA++] || '';
        const originalValB = tokensB[ptrB++] || '';
        htmlA += escapeHtml(originalValA);
        htmlB += escapeHtml(originalValB);
      } else if (op.type === 'delete') {
        const val = tokensA[ptrA++] || '';
        htmlA += `<mark style="background:rgba(239,68,68,0.35); color:#dc2626; border-radius:3px; padding:1px 2px; text-decoration:line-through;">${escapeHtml(val)}</mark>`;
      } else if (op.type === 'insert') {
        const val = tokensB[ptrB++] || '';
        htmlB += `<mark style="background:rgba(34,197,94,0.35); color:#16a34a; border-radius:3px; padding:1px 2px;">${escapeHtml(val)}</mark>`;
      }
    });

    return { htmlA, htmlB };
  }

  function diffCharsPair(strA, strB, ignoreCase) {
    const charsA = [...strA];
    const charsB = [...strB];
    const normA = ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA;
    const normB = ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB;
    const ops = lcs(normA, normB);

    let htmlA = '',
      htmlB = '';
    let ptrA = 0,
      ptrB = 0;

    ops.forEach(op => {
      if (op.type === 'equal') {
        htmlA += escapeHtml(charsA[ptrA++]);
        htmlB += escapeHtml(charsB[ptrB++]);
      } else if (op.type === 'delete') {
        htmlA += `<mark style="background:rgba(239,68,68,0.4); color:#dc2626; border-radius:2px; padding:0 1px; text-decoration:line-through;">${escapeHtml(charsA[ptrA++])}</mark>`;
      } else if (op.type === 'insert') {
        htmlB += `<mark style="background:rgba(34,197,94,0.4); color:#16a34a; border-radius:2px; padding:0 1px;">${escapeHtml(charsB[ptrB++])}</mark>`;
      }
    });

    return { htmlA, htmlB };
  }

  function update() {
    const rawA = inputA.value;
    const rawB = inputB.value;
    const algo = algoSel.value;
    const view = viewSel.value;
    const showSame = showSameCheck.checked;
    const ignoreCase = ignoreCaseCheck.checked;
    const ignoreWs = ignoreWsCheck.checked;

    // Meta counts
    const wordsCountA = (rawA.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
    const wordsCountB = (rawB.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
    const linesCountA = rawA ? rawA.split(/\r?\n/).length : 0;
    const linesCountB = rawB ? rawB.split(/\r?\n/).length : 0;

    metaA.textContent = `${linesCountA} ${L ? 'vrstic' : 'lines'} | ${wordsCountA} ${L ? 'besed' : 'words'} | ${rawA.length} ${L ? 'znakov' : 'chars'}`;
    metaB.textContent = `${linesCountB} ${L ? 'vrstic' : 'lines'} | ${wordsCountB} ${L ? 'besed' : 'words'} | ${rawB.length} ${L ? 'znakov' : 'chars'}`;

    if (!rawA && !rawB) {
      statsBar.innerHTML = `<span style="font-size:12px; color:var(--text-dim);">${L ? 'Vnesite besedilo A in B za primerjavo.' : 'Enter text A and B to compare.'}</span>`;
      outputWrap.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim);">${L ? 'Ni podatkov za primerjavo.' : 'No data to compare.'}</div>`;
      return;
    }

    const linesA = rawA.split(/\r?\n/);
    const linesB = rawB.split(/\r?\n/);

    function normLine(l) {
      let s = l;
      if (ignoreWs) s = s.replace(/\s+/g, ' ').trim();
      if (ignoreCase) s = s.toLowerCase();
      return s;
    }

    const normA = linesA.map(normLine);
    const normB = linesB.map(normLine);

    const lineOps = lcs(normA, normB);

    // Align line ops into row pairs
    const alignedRows = [];
    let curLineA = 1,
      curLineB = 1;
    let ptrA = 0,
      ptrB = 0;

    for (let idx = 0; idx < lineOps.length; idx++) {
      const op = lineOps[idx];
      if (op.type === 'equal') {
        alignedRows.push({
          type: 'equal',
          numA: curLineA++,
          numB: curLineB++,
          textA: linesA[ptrA++],
          textB: linesB[ptrB++],
        });
      } else if (op.type === 'delete') {
        // Check if next is insert (modification pair)
        if (idx + 1 < lineOps.length && lineOps[idx + 1].type === 'insert') {
          alignedRows.push({
            type: 'modify',
            numA: curLineA++,
            numB: curLineB++,
            textA: linesA[ptrA++],
            textB: linesB[ptrB++],
          });
          idx++; // Skip next insert as paired
        } else {
          alignedRows.push({
            type: 'delete',
            numA: curLineA++,
            numB: null,
            textA: linesA[ptrA++],
            textB: null,
          });
        }
      } else if (op.type === 'insert') {
        alignedRows.push({
          type: 'insert',
          numA: null,
          numB: curLineB++,
          textA: null,
          textB: linesB[ptrB++],
        });
      }
    }

    // Stats calculation
    let totalAdds = 0,
      totalDels = 0,
      totalMod = 0,
      totalEq = 0;
    alignedRows.forEach(r => {
      if (r.type === 'insert') totalAdds++;
      else if (r.type === 'delete') totalDels++;
      else if (r.type === 'modify') totalMod++;
      else totalEq++;
    });

    const totalItems = alignedRows.length || 1;
    const simPct = Math.max(0, Math.min(100, Math.round((totalEq / totalItems) * 100)));

    statsBar.innerHTML = `
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(34,197,94,0.15); color:#16a34a; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">+ ${totalAdds} ${L ? 'dodanih' : 'added'}</span>
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(239,68,68,0.15); color:#dc2626; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">- ${totalDels} ${L ? 'odstranjenih' : 'deleted'}</span>
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(245,158,11,0.15); color:#d97706; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">~ ${totalMod} ${L ? 'spremenjenih' : 'modified'}</span>
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(99,102,241,0.15); color:var(--violet); padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">${SVG_ICONS.mi_star} ${L ? 'Podobnost' : 'Similarity'}: ${simPct}%</span>
        `;

    if (view === 'merged') {
      outputWrap.innerHTML = `
            <div style="padding:16px;">
              <div style="font-weight:600; margin-bottom:8px; color:var(--text-dim);">${L ? 'Čisto končno besedilo (B):' : 'Clean Final Text (B):'}</div>
              <pre style="margin:0; white-space:pre-wrap; font-family:inherit; font-size:13px; line-height:1.6;">${escapeHtml(rawB)}</pre>
            </div>
          `;
      return;
    }

    if (view === 'prose') {
      let proseHtml = '';
      if (algo === 'chars') {
        const charsA = [...rawA];
        const charsB = [...rawB];
        const charOps = lcs(
          ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA,
          ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB
        );
        let pA = 0,
          pB = 0;
        charOps.forEach(op => {
          if (op.type === 'equal') {
            proseHtml += escapeHtml(charsA[pA++]);
            pB++;
          } else if (op.type === 'delete') {
            proseHtml += `<del style="background:rgba(239,68,68,0.25); color:#dc2626; padding:0 1px; border-radius:2px; text-decoration:line-through;">${escapeHtml(charsA[pA++])}</del>`;
          } else if (op.type === 'insert') {
            proseHtml += `<ins style="background:rgba(34,197,94,0.25); color:#16a34a; padding:0 1px; border-radius:2px; text-decoration:none; font-weight:600;">${escapeHtml(charsB[pB++])}</ins>`;
          }
        });
      } else {
        const wordsA = rawA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        const wordsB = rawB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        const wordOps = lcs(
          ignoreCase ? wordsA.map(w => w.toLowerCase()) : wordsA,
          ignoreCase ? wordsB.map(w => w.toLowerCase()) : wordsB
        );

        let pA = 0,
          pB = 0;
        wordOps.forEach(op => {
          if (op.type === 'equal') {
            proseHtml += escapeHtml(wordsA[pA++]);
            pB++;
          } else if (op.type === 'delete') {
            proseHtml += `<del style="background:rgba(239,68,68,0.25); color:#dc2626; padding:1px 3px; border-radius:3px; text-decoration:line-through;">${escapeHtml(wordsA[pA++])}</del>`;
          } else if (op.type === 'insert') {
            proseHtml += `<ins style="background:rgba(34,197,94,0.25); color:#16a34a; padding:1px 3px; border-radius:3px; text-decoration:none; font-weight:600;">${escapeHtml(wordsB[pB++])}</ins>`;
          }
        });
      }

      outputWrap.innerHTML = `
            <div style="padding:18px; line-height:1.8; white-space:pre-wrap;">
              ${proseHtml || `<span style="color:var(--text-dim);">${L ? 'Besedili sta identični.' : 'Texts are identical.'}</span>`}
            </div>
          `;
      return;
    }

    if (view === 'unified') {
      // Unified 1-column patch view
      let unifiedHtml = `
            <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; background:var(--card); font-size:12px; border-bottom:1px solid var(--border); font-weight:600; color:var(--text-dim); padding:6px 0;">
              <div style="text-align:center;">A</div>
              <div style="text-align:center;">B</div>
              <div style="text-align:center;">+/-</div>
              <div style="padding-left:8px;">${L ? 'Vsebina' : 'Content'}</div>
            </div>
            <div style="max-height:480px; overflow-y:auto;">
          `;

      alignedRows.forEach(r => {
        if (r.type === 'equal') {
          if (!showSame) return;
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numA}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numB}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;"> </div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:var(--text);">${escapeHtml(r.textA)}</div>
                </div>
              `;
        } else if (r.type === 'modify') {
          let diffPair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
          if (algo === 'chars') {
            diffPair = diffCharsPair(r.textA, r.textB, ignoreCase);
          } else if (algo !== 'lines_only') {
            diffPair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
          }
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
                  <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${diffPair.htmlA}</div>
                </div>
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div>
                  <div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${diffPair.htmlB}</div>
                </div>
              `;
        } else if (r.type === 'delete') {
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
                  <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${escapeHtml(r.textA)}</div>
                </div>
              `;
        } else if (r.type === 'insert') {
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div>
                  <div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${escapeHtml(r.textB)}</div>
                </div>
              `;
        }
      });

      unifiedHtml += `</div>`;
      outputWrap.innerHTML = unifiedHtml;
      return;
    }

    // Default: SIDE-BY-SIDE 2-COLUMN VIEW
    let splitHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid var(--border); background:var(--card); font-weight:600; font-size:12px; color:var(--text-dim);">
            <div style="padding:8px 12px; border-right:1px solid var(--border); display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original (A)'}</span>
              <span>${linesCountA} ${L ? 'vrstic' : 'lines'}</span>
            </div>
            <div style="padding:8px 12px; display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified (B)'}</span>
              <span>${linesCountB} ${L ? 'vrstic' : 'lines'}</span>
            </div>
          </div>
          <div id="cmp-side-scroll" style="display:grid; grid-template-columns:1fr 1fr; max-height:480px; overflow-y:auto; overflow-x:auto;">
            <div id="cmp-col-left" style="border-right:1px solid var(--border); min-width:0;">
        `;

    let leftRowsHtml = '';
    let rightRowsHtml = '';

    alignedRows.forEach(r => {
      if (r.type === 'equal') {
        if (!showSame) return;
        const textEsc = escapeHtml(r.textA);
        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numA}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numB}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div>
              </div>
            `;
      } else if (r.type === 'modify') {
        let diffPair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
        if (algo === 'chars') {
          diffPair = diffCharsPair(r.textA, r.textB, ignoreCase);
        } else if (algo !== 'lines_only') {
          diffPair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
        }

        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(239,68,68,0.11); border-bottom:1px solid rgba(239,68,68,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${diffPair.htmlA}</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(34,197,94,0.11); border-bottom:1px solid rgba(34,197,94,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${diffPair.htmlB}</div>
              </div>
            `;
      } else if (r.type === 'delete') {
        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(239,68,68,0.11); border-bottom:1px solid rgba(239,68,68,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${escapeHtml(r.textA)}</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(0,0,0,0.02); border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
                <div style="padding-left:8px; flex:1;">&nbsp;</div>
              </div>
            `;
      } else if (r.type === 'insert') {
        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(0,0,0,0.02); border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
                <div style="padding-left:8px; flex:1;">&nbsp;</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(34,197,94,0.11); border-bottom:1px solid rgba(34,197,94,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${escapeHtml(r.textB)}</div>
              </div>
            `;
      }
    });

    splitHtml +=
      leftRowsHtml +
      `</div><div id="cmp-col-right" style="min-width:0;">` +
      rightRowsHtml +
      `</div></div>`;
    outputWrap.innerHTML = splitHtml;
  }

  function readUpload(fileInput, targetTextarea) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      targetTextarea.value = reader.result || '';
      update();
    };
    reader.readAsText(file, 'UTF-8');
  }

  fileA.addEventListener('change', () => readUpload(fileA, inputA));
  fileB.addEventListener('change', () => readUpload(fileB, inputB));

  let _cmpDebounce;
  [inputA, inputB].forEach(el =>
    el.addEventListener('input', () => {
      clearTimeout(_cmpDebounce);
      _cmpDebounce = setTimeout(update, 100);
    })
  );

  [algoSel, viewSel, showSameCheck, ignoreCaseCheck, ignoreWsCheck].forEach(el => {
    el.addEventListener('change', update);
  });

  container.querySelector('#cmp-sample').addEventListener('click', () => {
    inputA.value = sampleA;
    inputB.value = sampleB;
    update();
  });

  container.querySelector('#cmp-swap').addEventListener('click', () => {
    const temp = inputA.value;
    inputA.value = inputB.value;
    inputB.value = temp;
    update();
  });

  container.querySelector('#cmp-clear-a').addEventListener('click', () => {
    inputA.value = '';
    update();
    inputA.focus();
  });

  container.querySelector('#cmp-clear-b').addEventListener('click', () => {
    inputB.value = '';
    update();
    inputB.focus();
  });

  container.querySelector('#cmp-copy-unified').addEventListener('click', () => {
    const textA = inputA.value;
    const textB = inputB.value;
    const linesA = textA.split(/\r?\n/);
    const linesB = textB.split(/\r?\n/);
    const ops = lcs(linesA, linesB);

    let patch = `--- text_a.txt\n+++ text_b.txt\n@@ -1,${linesA.length} +1,${linesB.length} @@\n`;
    ops.forEach(op => {
      if (op.type === 'equal') patch += ` ${op.val}\n`;
      else if (op.type === 'delete') patch += `-${op.val}\n`;
      else if (op.type === 'insert') patch += `+${op.val}\n`;
    });

    copyText(patch, container.querySelector('#cmp-copy-unified'));
  });

  container.querySelector('#cmp-copy-b').addEventListener('click', () => {
    copyText(inputB.value, container.querySelector('#cmp-copy-b'));
  });

  container.querySelector('#cmp-copy-html').addEventListener('click', () => {
    copyText(outputWrap.innerHTML, container.querySelector('#cmp-copy-html'));
  });

  update();
}

function renderCsvConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Smer pretvorbe:' : 'Conversion:'}
        <select id="csv-mode">
          <option value="csv2col">${L ? 'CSV → Poravnani stolpci' : 'CSV → Aligned Columns'}</option>
          <option value="col2csv">${L ? 'Stolpci → CSV' : 'Columns → CSV'}</option>
        </select>
      </label>
      <label>${L ? 'Ločilo CSV:' : 'Separator:'}
        <input type="text" id="csv-sep" value="," style="width:45px; text-align:center;">
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="csv-input">${getI('ui_input')}</label>
        <textarea id="csv-input" placeholder="${L ? 'Prilepite CSV podatke...' : 'Paste CSV data...'}">Mesto,Prebivalci,Regija\nLjubljana,293000,Osrednjeslovenska\nMaribor,112000,Podravska\nCelje,49000,Savinjska</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="csv-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="csv-output">${getI('ui_output')}</label>
        <textarea id="csv-output" readonly placeholder="${L ? 'Pretvorjeni podatki...' : 'Converted output...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="csv-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#csv-input'),
    output = container.querySelector('#csv-output');
  const mode = container.querySelector('#csv-mode'),
    sep = container.querySelector('#csv-sep');

  function update() {
    const s = sep.value || ',';
    if (mode.value === 'csv2col') {
      const rows = input.value.split('\n').map(r => r.split(s));
      const colWidths = [];
      rows.forEach(r =>
        r.forEach((c, i) => {
          colWidths[i] = Math.max(colWidths[i] || 0, c.trim().length);
        })
      );
      output.value = rows
        .map(r => r.map((c, i) => c.trim().padEnd(colWidths[i] || 0)).join('  '))
        .join('\n');
    } else {
      output.value = input.value
        .split('\n')
        .map(line =>
          line
            .trim()
            .split(/\s{2,}/)
            .join(s)
        )
        .join('\n');
    }
  }
  [input, mode, sep].forEach(el => el.addEventListener('input', update));
  container.querySelector('#csv-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#csv-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#csv-copy'));
  });
  update();
}

function renderTextToSpeech(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Glas (Sinteza):' : 'Voice:'}
        <select id="tts-voice" style="max-width:260px;"><option>Nalaganje glasov...</option></select>
      </label>
      <label>${L ? 'Hitrost:' : 'Rate:'}
        <input type="range" id="tts-rate" min="0.5" max="2" step="0.1" value="1" style="width:80px;">
      </label>
      <label>${L ? 'Višina (Pitch):' : 'Pitch:'}
        <input type="range" id="tts-pitch" min="0.5" max="1.5" step="0.1" value="1" style="width:80px;">
      </label>
    </div>
    <div class="tool-workspace-2col" style="grid-template-columns:1fr;">
      <div class="tool-panel">
        <label for="tts-input">${getI('ui_input')}</label>
        <textarea id="tts-input" rows="6" placeholder="${L ? 'Vnesite besedilo za branje na glas...' : 'Enter text to speak out loud...'}">${L ? 'Pozdravljeni v Besedomatu! Vašem zanesljivem orodju za delo z besedili.' : 'Welcome to Besedomat! Your reliable online text toolkit.'}</textarea>
        <div class="panel-actions" style="justify-content:space-between;">
          <button class="btn-sm" id="tts-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
          <div style="display:flex; gap:8px;">
            <button class="btn-sm primary" id="tts-play" style="display:inline-flex; align-items:center; gap:6px;">🔊 <span>${L ? 'Preberi na glas' : 'Play Speech'}</span></button>
            <button class="btn-sm" id="tts-stop" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_x} <span>${L ? 'Ustavi' : 'Stop'}</span></button>
          </div>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#tts-input');
  const voiceSel = container.querySelector('#tts-voice');
  const rate = container.querySelector('#tts-rate');
  const pitch = container.querySelector('#tts-pitch');
  let voices = [];

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;
    voiceSel.innerHTML = voices
      .map((v, i) => `<option value="${i}">${escapeHtml(v.name)} (${v.lang})</option>`)
      .join('');
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  container.querySelector('#tts-play').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      alert(L ? 'Vaš brskalnik ne podpira sinteze govora.' : 'Speech synthesis not supported.');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(input.value);
    if (voices[voiceSel.value]) utter.voice = voices[voiceSel.value];
    utter.rate = parseFloat(rate.value) || 1;
    utter.pitch = parseFloat(pitch.value) || 1;
    window.speechSynthesis.speak(utter);
  });

  container.querySelector('#tts-stop').addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  container.querySelector('#tts-clear').addEventListener('click', () => {
    input.value = '';
    input.focus();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });
}

function renderRandomString(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div style="max-width:700px; margin:0 auto; width:100%;">
      <div class="settings-bar" style="margin-bottom:14px; gap:12px;">
        <label>${L ? 'Dolžina:' : 'Length:'}
          <input type="number" id="rs-len" value="32" min="1" max="1000" style="width:70px;">
        </label>
        <label>${L ? 'Količina (vrstic):' : 'Quantity:'}
          <input type="number" id="rs-qty" value="1" min="1" max="100" style="width:60px;">
        </label>
        <label><input type="checkbox" id="rs-alpha" checked> A-Z, a-z</label>
        <label><input type="checkbox" id="rs-num" checked> 0-9</label>
        <label><input type="checkbox" id="rs-sym"> Simboli (!@#)</label>
      </div>
      <label>${getI('ui_output')}</label>
      <textarea id="rs-output" readonly style="min-height:120px; font-family:monospace; font-size:14px;"></textarea>
      <div class="panel-actions" style="justify-content:center; gap:12px; margin-top:12px;">
        <button class="btn-sm primary" id="rs-gen" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Ustvari niz' : 'Generate String'}</span></button>
        <button class="btn-sm" id="rs-copy" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
      </div>
    </div>
  `;
  const len = container.querySelector('#rs-len');
  const qty = container.querySelector('#rs-qty');
  const alpha = container.querySelector('#rs-alpha');
  const num = container.querySelector('#rs-num');
  const sym = container.querySelector('#rs-sym');
  const output = container.querySelector('#rs-output');

  function generate() {
    let chars = '';
    if (alpha.checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (num.checked) chars += '0123456789';
    if (sym.checked) chars += '!@#$%^&*()_+~' + String.fromCharCode(96) + '|}{\\[\\]:;?><,./-=';
    if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const n = Math.max(1, parseInt(len.value) || 32);
    const q = Math.max(1, parseInt(qty.value) || 1);
    const res = [];

    for (let row = 0; row < q; row++) {
      let str = '';
      const randArr = new Uint32Array(n);
      crypto.getRandomValues(randArr);
      for (let i = 0; i < n; i++) str += chars.charAt(randArr[i] % chars.length);
      res.push(str);
    }
    output.value = res.join('\n');
  }

  [len, qty, alpha, num, sym].forEach(el => el.addEventListener('input', generate));
  container.querySelector('#rs-gen').addEventListener('click', generate);
  container.querySelector('#rs-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#rs-copy'));
  });
  generate();
}

function renderDiff(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="df-a">${L ? 'Izvirno besedilo' : 'Original text'}</label>
        <textarea id="df-a" placeholder="${L ? 'Prvo besedilo...' : 'First text...'}" style="min-height:200px;"></textarea>
      </div>
      <div class="tool-panel">
        <label for="df-b">${L ? 'Novo besedilo' : 'New text'}</label>
        <textarea id="df-b" placeholder="${L ? 'Drugo besedilo...' : 'Second text...'}" style="min-height:200px;"></textarea>
      </div>
    </div>
    <div class="tool-panel" style="margin-top:14px;">
      <label>${L ? 'Razlika (Diff)' : 'Difference (Diff)'}</label>
      <div id="df-out" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; font-family:'Courier New',monospace; font-size:13px; line-height:1.6; white-space:pre-wrap; overflow-y:auto; max-height:360px;"></div>
      <div class="panel-actions">
        <button class="btn-sm primary" id="df-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
  const a = container.querySelector('#df-a');
  const b = container.querySelector('#df-b');
  const out = container.querySelector('#df-out');
  let updatePromise = null;

  async function update() {
    const textA = a.value,
      textB = b.value;
    let rows;
    if (textA.length + textB.length > HEAVY_LIMIT) {
      showToolBusy(container, true);
      try {
        rows = await runHeavy('diff', { a: textA, b: textB });
      } catch (e) {
        rows = PURE.diffLines(textA, textB);
      }
      showToolBusy(container, false);
    } else {
      rows = PURE.diffLines(textA, textB);
    }
    out.innerHTML = rows
      .map(r => {
        const color = r.t === '-' ? '#ef4444' : r.t === '+' ? '#22c55e' : 'var(--text-dim)';
        return `<div style="color:${color};">${r.t} ${escapeHtml(r.v) || ' '}</div>`;
      })
      .join('');
  }

  function debouncedUpdate() {
    clearTimeout(updatePromise);
    updatePromise = setTimeout(update, 100);
  }
  const safe = safeUpdate(debouncedUpdate, container);
  [a, b].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#df-copy').addEventListener('click', () => {
    copyText(out.textContent, container.querySelector('#df-copy'));
  });
  safe();
}

function renderColorConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-panel">
      <label for="cc-input">${L ? 'Vnesi barvo (HEX, RGB ali HSL)' : 'Enter color (HEX, RGB or HSL)'}</label>
      <input id="cc-input" type="text" placeholder="#ff0000 / 255,0,0 / hsl(0,100%,50%)" />
      <div class="panel-actions">
        <button class="btn-sm primary" id="cc-go">${L ? 'Pretvori' : 'Convert'}</button>
      </div>
    </div>
    <div class="tool-panel" style="margin-top:14px;">
      <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
        <div id="cc-swatch" style="width:60px; height:60px; border-radius:12px; border:1px solid var(--border);"></div>
        <div style="font-family:'Courier New',monospace; font-size:14px; line-height:1.8;">
          <div>HEX: <span id="cc-hex"></span></div>
          <div>RGB: <span id="cc-rgb"></span></div>
          <div>HSL: <span id="cc-hsl"></span></div>
        </div>
      </div>
      <div id="cc-err" class="err-banner" style="display:none;"></div>
    </div>
  `;
  const input = container.querySelector('#cc-input');
  const hexEl = container.querySelector('#cc-hex');
  const rgbEl = container.querySelector('#cc-rgb');
  const hslEl = container.querySelector('#cc-hsl');
  const swatch = container.querySelector('#cc-swatch');
  const errEl = container.querySelector('#cc-err');

  function update() {
    const info = PURE.colorInfo(input.value);
    if (!info) {
      errEl.style.display = 'block';
      errEl.textContent = L ? 'Neveljavna barva.' : 'Invalid color.';
      return;
    }
    errEl.style.display = 'none';
    hexEl.textContent = info.hex;
    rgbEl.textContent = `rgb(${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b})`;
    hslEl.textContent = `hsl(${info.hsl.h}, ${info.hsl.s}%, ${info.hsl.l}%)`;
    swatch.style.background = info.hex;
  }
  const safe = safeUpdate(update, container);
  input.addEventListener('input', safe);
  container.querySelector('#cc-go').addEventListener('click', safe);
  safe();
}

function renderChecksum(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-panel">
      <label for="cs-input">${L ? 'Besedilo' : 'Text'}</label>
      <textarea id="cs-input" placeholder="${L ? 'Vnesite ali prilepite besedilo...' : 'Type or paste text...'}" style="min-height:180px;"></textarea>
      <label for="cs-algo" style="margin-top:10px;">${L ? 'Algoritem' : 'Algorithm'}</label>
      <select id="cs-algo">
        <option value="sha256">SHA-256</option>
        <option value="sha1">SHA-1</option>
        <option value="sha512">SHA-512</option>
        <option value="crc32">CRC32</option>
      </select>
    </div>
    <div class="tool-panel" style="margin-top:14px;">
      <label for="cs-output">${L ? 'Zgoščevalna vrednost (hash)' : 'Checksum (hash)'}</label>
      <textarea id="cs-output" readonly style="font-family:'Courier New',monospace;"></textarea>
      <div class="panel-actions">
        <button class="btn-sm primary" id="cs-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
  const input = container.querySelector('#cs-input');
  const algoSel = container.querySelector('#cs-algo');
  const output = container.querySelector('#cs-output');

  function update() {
    const algo = algoSel.value;
    const text = input.value;
    if (algo === 'crc32') {
      output.value = PURE.crc32(text);
      return;
    }
    if (algo === 'sha256' && !crypto?.subtle?.digest) {
      output.value = PURE.sha256(text);
      return;
    }
    output.value = L ? 'Računam…' : 'Computing…';
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      crypto.subtle
        .digest(algo, new TextEncoder().encode(text))
        .then(h => {
          output.value = PURE.bufferToHex(h);
        })
        .catch(e => {
          output.value = '';
          showToolErrorBanner(container, e && e.message ? e.message : String(e));
        });
    } else {
      output.value = L
        ? 'SHA-1/512 zahtevajo varno okolje (https/localhost).'
        : 'SHA-1/512 require secure context (https/localhost).';
    }
  }
  const safe = safeUpdate(update, container);
  [input, algoSel].forEach(el => el.addEventListener('input', safe));
  container
    .querySelector('#cs-copy')
    .addEventListener('click', () => copyText(output.value, container.querySelector('#cs-copy')));
  safe();
}

function renderRegexTester(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <span style="font-weight:700; color:var(--text-dim); font-size:16px;">/</span>
      <input type="text" id="rx-pattern" placeholder="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" value="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" style="flex:1; min-width:200px; font-family:monospace;">
      <span style="font-weight:700; color:var(--text-dim); font-size:16px;">/</span>
      <input type="text" id="rx-flags" value="g" placeholder="flags" style="width:45px; font-family:monospace;">
      <label><input type="checkbox" id="rx-flag-g" checked> g (global)</label>
      <label><input type="checkbox" id="rx-flag-i"> i (ignoreCase)</label>
      <label><input type="checkbox" id="rx-flag-m"> m (multiline)</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="rx-input">${L ? 'Testno besedilo' : 'Test String'}</label>
        <textarea id="rx-input" placeholder="${L ? 'Vnesite besedilo za testiranje regularnega izraza...' : 'Enter test string...'}">Pozdravljeni! Pišite nam na info@besedomat.si ali podpora@podjetje.com za pomoč.</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="rx-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="margin:0;">${L ? 'Označeni zadetki' : 'Highlighted Matches'}</label>
          <span id="rx-count" style="font-size:12px; font-weight:600; color:var(--violet);"></span>
        </div>
        <div id="rx-highlight" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; line-height:1.6; white-space:pre-wrap; word-break:break-all; font-family:monospace; font-size:13.5px;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="rx-copy-matches" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj zadetke' : 'Copy Matches'}</span></button>
        </div>
      </div>
    </div>
  `;
  const patEl = container.querySelector('#rx-pattern');
  const flagsEl = container.querySelector('#rx-flags');
  const fg = container.querySelector('#rx-flag-g');
  const fi = container.querySelector('#rx-flag-i');
  const fm = container.querySelector('#rx-flag-m');
  const input = container.querySelector('#rx-input');
  const highlight = container.querySelector('#rx-highlight');
  const count = container.querySelector('#rx-count');
  let extractedMatches = [];

  function syncFlagsFromCheckboxes() {
    let f = '';
    if (fg.checked) f += 'g';
    if (fi.checked) f += 'i';
    if (fm.checked) f += 'm';
    flagsEl.value = f;
    update();
  }

  function update() {
    const p = patEl.value;
    const f = flagsEl.value;
    const text = input.value;
    extractedMatches = [];
    if (!p || !text) {
      highlight.textContent = text;
      count.textContent = '';
      return;
    }
    try {
      const regex = new RegExp(p, f.includes('g') ? f : f + 'g');
      let matchesCount = 0;
      const htmlText = escapeHtml(text).replace(regex, m => {
        matchesCount++;
        extractedMatches.push(m);
        return `<mark style="background:rgba(234,179,8,0.3); color:inherit; padding:1px 3px; border-radius:3px; border:1px solid rgba(234,179,8,0.5);">${m}</mark>`;
      });
      highlight.innerHTML = htmlText;
      count.textContent = matchesCount + ' ' + (L ? 'zadetkov' : 'matches');
    } catch (e) {
      highlight.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${escapeHtml(e.message)}</span>`;
      count.textContent = '';
    }
  }

  [patEl, flagsEl, input].forEach(el => el.addEventListener('input', update));
  [fg, fi, fm].forEach(el => el.addEventListener('change', syncFlagsFromCheckboxes));
  container.querySelector('#rx-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#rx-copy-matches').addEventListener('click', () => {
    copyText(extractedMatches.join('\n'), container.querySelector('#rx-copy-matches'));
  });
  update();
}

function renderCensorWords(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <input type="text" id="cw-words" placeholder="${L ? 'Besede za cenzuro (ločene z vejico)...' : 'Words to censor (comma separated)...'}" value="grdo,slabo,psovka,bad,ugly,curse" style="flex:1; min-width:200px;">
      <label>${L ? 'Znak:' : 'Mask:'}
        <select id="cw-mask">
          <option value="stars">${L ? 'Zvezdice (****)' : 'Asterisks (****)'}</option>
          <option value="single">${L ? 'Ena zvezdica (*)' : 'Single (*)'}</option>
          <option value="firstlast">${L ? 'Ohrani prvo/zadnjo (g***o)' : 'First/last letter'}</option>
          <option value="block">${L ? 'Črni blok (████)' : 'Black block (████)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="cw-whole" checked> ${L ? 'Cele besede' : 'Whole words'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="cw-input">${getI('ui_input')}</label>
        <textarea id="cw-input" placeholder="${L ? 'Vnesite besedilo za cenzuro...' : 'Enter text to censor...'}">${L ? 'To je slabo besedilo s psovko, ki vsebuje grdo vsebino.' : 'This is bad text with a curse word and ugly content.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="cw-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="cw-output">${getI('ui_output')}</label>
        <textarea id="cw-output" readonly placeholder="${L ? 'Cenzurirano besedilo...' : 'Censored text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="cw-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#cw-input');
  const words = container.querySelector('#cw-words');
  const mask = container.querySelector('#cw-mask');
  const whole = container.querySelector('#cw-whole');
  const output = container.querySelector('#cw-output');

  function maskWord(w) {
    const m = mask.value;
    if (m === 'single') return '*';
    if (m === 'block') return '█'.repeat(w.length);
    if (m === 'firstlast') {
      if (w.length <= 2) return '*'.repeat(w.length);
      return w[0] + '*'.repeat(w.length - 2) + w[w.length - 1];
    }
    return '*'.repeat(w.length);
  }

  function update() {
    const rawWords = words.value
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
    if (rawWords.length === 0) {
      output.value = input.value;
      return;
    }
    let text = input.value;
    rawWords.forEach(w => {
      const pat = whole.checked ? PURE.wholeWordPattern(w) : escapeRegExp(w);
      const regex = new RegExp(pat, 'giu');
      text = text.replace(regex, match => maskWord(match));
    });
    output.value = text;
  }
  [input, words, mask, whole].forEach(el => el.addEventListener('input', update));
  container.querySelector('#cw-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#cw-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#cw-copy'));
  });
  update();
}

/* =========================================================
       PHASE 2 RENDER FUNCTIONS (10 custom tools)
       ========================================================= */

function renderUnicodeInfo(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ui-input">${getI('ui_input')}</label>
        <textarea id="ui-input" rows="4" placeholder="${L ? 'Vnesite besedilo ali simbole...' : 'Enter characters...'}" style="min-height:100px;">Čšž € 🚀 ©</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ui-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Unicode Podatki o znakih' : 'Unicode Character Breakdown'}</label>
        <div id="ui-table" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:8px; flex:1; max-height:360px; overflow-y:auto;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ui-copy-tsv" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj tabelo' : 'Copy Table'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ui-input');
  const table = container.querySelector('#ui-table');
  let tsvData = '';

  function update() {
    const text = input.value;
    const chars = [...text];
    if (chars.length === 0) {
      table.innerHTML = '';
      tsvData = '';
      return;
    }
    const rows = chars.map((c, i) => {
      const cp = c.codePointAt(0);
      const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
      const htmlEnt = '&#' + cp + ';';
      return { idx: i + 1, char: c, cp, hex, htmlEnt };
    });

    tsvData = ['#\tZnak\tKoda\tHex\tHTML']
      .concat(rows.map(r => `${r.idx}\t${r.char}\t${r.cp}\t${r.hex}\t${r.htmlEnt}`))
      .join('\n');

    table.innerHTML = `
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead><tr style="border-bottom:1px solid var(--border); text-align:left;"><th style="padding:6px;">#</th><th style="padding:6px;">Znak</th><th style="padding:6px;">Koda</th><th style="padding:6px;">Hex</th><th style="padding:6px;">HTML</th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);"><td style="padding:4px 6px; color:var(--text-dim);">${r.idx}</td><td style="padding:4px 6px; font-size:16px; font-weight:700;">${escapeHtml(r.char)}</td><td style="padding:4px 6px; font-family:monospace;">${r.cp}</td><td style="padding:4px 6px; font-family:monospace; color:var(--violet);">${r.hex}</td><td style="padding:4px 6px; font-family:monospace; color:var(--teal);">${escapeHtml(r.htmlEnt)}</td></tr>`).join('')}
            </tbody>
          </table>
        `;
  }
  input.addEventListener('input', update);
  container.querySelector('#ui-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ui-copy-tsv').addEventListener('click', () => {
    if (!tsvData) return;
    copyText(tsvData, container.querySelector('#ui-copy-tsv'));
  });
  update();
}

function renderPalindromeCheck(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pc-input">${getI('ui_input')}</label>
        <textarea id="pc-input" placeholder="${L ? 'Vnesite besedilo za preverjanje palindroma...' : 'Enter text to test palindrome...'}">Perica reže raci rep</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultat analize' : 'Analysis Result'}</label>
        <div id="pc-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:20px; flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;"></div>
      </div>
    </div>
  `;
  const input = container.querySelector('#pc-input');
  const result = container.querySelector('#pc-result');

  function update() {
    const text = input.value.trim();
    if (!text) {
      result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo za preizkus.' : 'Enter text.'}</span>`;
      return;
    }
    const clean = text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const reversed = [...clean].reverse().join('');
    const isPal = clean.length > 0 && clean === reversed;

    result.innerHTML = isPal
      ? `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_check}</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a; margin-bottom:6px;">${L ? 'Je palindrom!' : 'It is a palindrome!'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Besedilo se bere enako naprej in nazaj.' : 'Reads exactly the same forwards and backwards.'}</div>
          <div style="margin-top:12px; font-family:monospace; background:rgba(34,197,94,0.1); padding:6px 12px; border-radius:6px; font-size:13px;">${escapeHtml(clean)}</div>
        `
      : `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_x}</div>
          <div style="font-size:18px; font-weight:800; color:#dc2626; margin-bottom:6px;">${L ? 'Ni palindrom.' : 'Not a palindrome.'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Naprej:' : 'Forward:'} <code>${escapeHtml(clean)}</code></div>
          <div style="font-size:13px; color:var(--text-dim); margin-top:2px;">${L ? 'Nazaj:' : 'Reverse:'} <code>${escapeHtml(reversed)}</code></div>
        `;
  }
  input.addEventListener('input', update);
  container.querySelector('#pc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
}

/* =========================================================
       PHASE 3+4 RENDER FUNCTIONS (10 custom tools)
       ========================================================= */

function renderZalgoText(container) {
  const L = currentLang === 'sl';
  const ZALGO_UP = [
    '\u030d',
    '\u030e',
    '\u0304',
    '\u0305',
    '\u033f',
    '\u0311',
    '\u0306',
    '\u0310',
    '\u0352',
    '\u0357',
    '\u0351',
    '\u0307',
    '\u0308',
    '\u030a',
    '\u0342',
    '\u0343',
    '\u0344',
    '\u034a',
    '\u034b',
    '\u034c',
    '\u0303',
    '\u0302',
    '\u030c',
    '\u0350',
    '\u0300',
    '\u0301',
    '\u030b',
    '\u030f',
    '\u0312',
    '\u0313',
    '\u0314',
    '\u033d',
    '\u0309',
    '\u0363',
    '\u0364',
    '\u0365',
    '\u0366',
    '\u0367',
    '\u0368',
    '\u0369',
    '\u036a',
    '\u036b',
    '\u036c',
    '\u036d',
    '\u036e',
    '\u036f',
    '\u033e',
    '\u035b',
    '\u0346',
    '\u031a',
  ];
  const ZALGO_MID = [
    '\u0315',
    '\u031b',
    '\u0340',
    '\u0341',
    '\u0358',
    '\u0321',
    '\u0322',
    '\u0327',
    '\u0328',
    '\u0334',
    '\u0335',
    '\u0336',
    '\u034f',
    '\u035c',
    '\u035d',
    '\u035e',
    '\u035f',
    '\u0360',
    '\u0362',
    '\u0338',
    '\u0337',
    '\u0361',
    '\u0345',
  ];
  const ZALGO_DOWN = [
    '\u0316',
    '\u0317',
    '\u0318',
    '\u0319',
    '\u031c',
    '\u031d',
    '\u031e',
    '\u031f',
    '\u0320',
    '\u0324',
    '\u0325',
    '\u0326',
    '\u0329',
    '\u032a',
    '\u032b',
    '\u032c',
    '\u032d',
    '\u032e',
    '\u032f',
    '\u0330',
    '\u0331',
    '\u0332',
    '\u0333',
    '\u0339',
    '\u033a',
    '\u033b',
    '\u033c',
    '\u0345',
    '\u0347',
    '\u0348',
    '\u0349',
    '\u034d',
    '\u034e',
    '\u0353',
    '\u0354',
    '\u0355',
    '\u0356',
    '\u0359',
    '\u035a',
    '\u0323',
  ];

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Stopnja kaosa:' : 'Chaos level:'}
        <select id="zg-level">
          <option value="1">${L ? 'Nizka (malo glitchev)' : 'Low'}</option>
          <option value="3" selected>${L ? 'Srednja' : 'Medium'}</option>
          <option value="6">${L ? 'Visoka (poln kaos)' : 'High (Full Chaos)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="zg-up" checked> ${L ? 'Zgoraj' : 'Up'}</label>
      <label><input type="checkbox" id="zg-mid" checked> ${L ? 'Sredina' : 'Middle'}</label>
      <label><input type="checkbox" id="zg-down" checked> ${L ? 'Spodaj' : 'Down'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="zg-input">${getI('ui_input')}</label>
        <textarea id="zg-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">Besedomat Zalgo Text</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="zg-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="zg-output">${getI('ui_output')}</label>
        <textarea id="zg-output" readonly placeholder="${L ? 'Glitched Zalgo rezultat...' : 'Zalgo result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="zg-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#zg-input');
  const level = container.querySelector('#zg-level');
  const up = container.querySelector('#zg-up');
  const mid = container.querySelector('#zg-mid');
  const down = container.querySelector('#zg-down');
  const output = container.querySelector('#zg-output');

  function update() {
    const mult = parseInt(level.value) || 3;
    let res = '';
    for (const char of input.value) {
      res += char;
      if (/\s/.test(char)) continue;
      if (up.checked)
        for (let i = 0; i < mult; i++) res += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
      if (mid.checked)
        for (let i = 0; i < Math.floor(mult / 2); i++)
          res += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
      if (down.checked)
        for (let i = 0; i < mult; i++)
          res += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
    }
    output.value = res;
  }
  [input, level, up, mid, down].forEach(el => el.addEventListener('input', update));
  container.querySelector('#zg-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#zg-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#zg-copy'));
  });
  update();
}

function renderFancyText(container) {
  const L = currentLang === 'sl';
  const styles = {
    bold: { upper: 0x1d400, lower: 0x1d41a, digits: 0x1d7ce, label: 'Bold (𝐁)' },
    italic: { upper: 0x1d434, lower: 0x1d44e, digits: null, label: 'Italic (𝐼)' },
    'bold-italic': { upper: 0x1d468, lower: 0x1d482, digits: null, label: 'Bold Italic (𝑩)' },
    script: { upper: 0x1d49c, lower: 0x1d4b6, digits: null, label: 'Script (𝒜)' },
    fraktur: { upper: 0x1d504, lower: 0x1d51e, digits: null, label: 'Fraktur (𝔄)' },
    monospace: { upper: 0x1d670, lower: 0x1d68a, digits: 0x1d7f6, label: 'Monospace (𝙼)' },
    'double-struck': {
      upper: 0x1d538,
      lower: 0x1d552,
      digits: 0x1d7d8,
      label: 'Double-struck (𝔸)',
    },
    'sans-serif': { upper: 0x1d5a0, lower: 0x1d5ba, digits: 0x1d7e2, label: 'Sans-serif (𝖠)' },
    'sans-bold': { upper: 0x1d5d4, lower: 0x1d5ee, digits: 0x1d7ec, label: 'Sans Bold (𝗔)' },
    underline: { special: 'underline', label: 'Underline (U̲)' },
    'double-underline': { special: 'double-underline', label: 'Double Underline (U̳)' },
  };
  /* Unicode za nekatere črke nima glifa v zaporedju → uporabi posebne kodne točke,
         sicer bi naivna preslikava dala nedodeljene znake (tofu). */
  const FANCY_EXCEPTIONS = {
    italic: { h: '\u210E' },
    script: {
      B: '\u212C',
      E: '\u2130',
      F: '\u2131',
      H: '\u210B',
      I: '\u2110',
      L: '\u2112',
      M: '\u2133',
      R: '\u211B',
      e: '\u212F',
      g: '\u210A',
      o: '\u2134',
    },
    fraktur: { C: '\u212D', H: '\u210C', I: '\u2111', R: '\u211C', Z: '\u2128' },
    'double-struck': {
      C: '\u2102',
      H: '\u210D',
      N: '\u2115',
      P: '\u2119',
      Q: '\u211A',
      R: '\u211D',
      Z: '\u2124',
    },
  };
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Slog pisave:' : 'Font style:'}
        <select id="ft-style" style="min-width:200px;">
          ${Object.entries(styles)
            .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
            .join('')}
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ft-input">${getI('ui_input')}</label>
        <textarea id="ft-input" placeholder="${L ? 'Vnesite besedilo za pretvorbo...' : 'Enter text to convert...'}" style="min-height:140px;">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ft-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ft-output">${getI('ui_output')}</label>
        <textarea id="ft-output" readonly placeholder="${L ? 'Pretvorjena pisava...' : 'Converted fancy text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ft-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ft-input'),
    output = container.querySelector('#ft-output');
  const style = container.querySelector('#ft-style');

  function convert(text, key) {
    const s = styles[key] || styles.bold;
    if (s.special === 'underline')
      return [...text].map(c => (c === '\n' ? c : c + '\u0332')).join('');
    if (s.special === 'double-underline')
      return [...text].map(c => (c === '\n' ? c : c + '\u0333')).join('');
    const exceptions = FANCY_EXCEPTIONS[key] || {};
    return [...text]
      .map(c => {
        if (exceptions[c]) return exceptions[c];
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90 && s.upper) return String.fromCodePoint(s.upper + (code - 65));
        if (code >= 97 && code <= 122 && s.lower)
          return String.fromCodePoint(s.lower + (code - 97));
        if (code >= 48 && code <= 57 && s.digits)
          return String.fromCodePoint(s.digits + (code - 48));
        return c;
      })
      .join('');
  }

  function update() {
    output.value = convert(input.value, style ? style.value || 'bold' : 'bold');
  }
  [input, style].forEach(el => el.addEventListener('input', update));
  container.querySelector('#ft-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ft-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ft-copy'));
  });
  update();
}

function renderTextRepeater(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Število ponovitev:' : 'Repeat count:'}
        <input type="number" id="tr-count" value="5" min="1" max="1000" style="width:70px;">
      </label>
      <label>${L ? 'Ločilo:' : 'Separator:'}
        <input type="text" id="tr-sep" value="\n" placeholder="\n" style="width:60px;">
      </label>
      <label><input type="checkbox" id="tr-num"> ${L ? 'Dodaj številčenje (1., 2...)' : 'Add numbering (1., 2...)'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="tr-input">${getI('ui_input')}</label>
        <textarea id="tr-input" placeholder="${L ? 'Vnesite besedilo za ponovitev...' : 'Enter text to repeat...'}">Ponovi to sporočilo!</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="tr-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="tr-output">${getI('ui_output')}</label>
        <textarea id="tr-output" readonly placeholder="${L ? 'Ponovljeno besedilo...' : 'Repeated text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="tr-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#tr-input');
  const countEl = container.querySelector('#tr-count');
  const sepEl = container.querySelector('#tr-sep');
  const numCheck = container.querySelector('#tr-num');
  const output = container.querySelector('#tr-output');

  function update() {
    const n = Math.min(1000, Math.max(1, parseInt(countEl.value) || 1));
    const sep = sepEl.value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    const text = input.value;
    const arr = [];
    for (let i = 1; i <= n; i++) {
      arr.push((numCheck.checked ? i + '. ' : '') + text);
    }
    output.value = arr.join(sep);
  }
  [input, countEl, sepEl, numCheck].forEach(el => el.addEventListener('input', update));
  container.querySelector('#tr-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#tr-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#tr-copy'));
  });
  update();
}

function renderHighlightPatterns(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label style="flex:1; min-width:240px;">${L ? 'Vzorci za označevanje (ločeni z vejico):' : 'Patterns to highlight (comma separated):'}
        <input type="text" id="hp-patterns" value="besedilo, orodje, 2026" style="flex:1;">
      </label>
      <label><input type="checkbox" id="hp-ci" checked> ${L ? 'Brez razlike (A=a)' : 'Case insensitive'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="hp-input">${getI('ui_input')}</label>
        <textarea id="hp-input" rows="6">${L ? 'Besedomat je sodobno orodje za urejanje in analizo besedil v letu 2026. Vsako orodje je prilagojeno za hitro delo.' : 'Besedomat is a modern text toolkit for text analysis and editing in 2026. Every tool is optimized for fast work.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="hp-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Označeni vzorci v besedilu' : 'Highlighted Patterns'}</label>
        <div id="hp-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; font-size:13.5px; line-height:1.8; white-space:pre-wrap; word-break:break-all;"></div>
      </div>
    </div>
  `;
  const input = container.querySelector('#hp-input'),
    patterns = container.querySelector('#hp-patterns');
  const ci = container.querySelector('#hp-ci'),
    result = container.querySelector('#hp-result');
  const colors = [
    'rgba(255,200,50,0.4)',
    'rgba(100,200,255,0.4)',
    'rgba(255,120,150,0.4)',
    'rgba(120,255,150,0.4)',
    'rgba(200,150,255,0.4)',
  ];

  function update() {
    const pats = patterns.value
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    if (!pats.length) {
      result.innerHTML = escapeHtml(input.value);
      return;
    }
    let html = escapeHtml(input.value);
    pats.forEach((pat, i) => {
      try {
        const re = new RegExp(escapeRegExp(pat), ci.checked ? 'gi' : 'g');
        const bg = colors[i % colors.length];
        html = html.replace(
          re,
          m =>
            `<mark style="background:${bg}; border-radius:4px; padding:2px 4px; font-weight:600;">${m}</mark>`
        );
      } catch (e) {}
    });
    result.innerHTML = html;
  }
  let _hpDb;
  [input, patterns, ci].forEach(el =>
    el.addEventListener('input', () => {
      clearTimeout(_hpDb);
      _hpDb = setTimeout(update, 80);
    })
  );
  container.querySelector('#hp-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
}

function renderTextEntropy(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="te-input">${getI('ui_input')}</label>
        <textarea id="te-input" placeholder="${L ? 'Vnesite besedilo za izračun Shannonove entropije...' : 'Enter text to calculate Shannon entropy...'}">Besedomat 2026 - Zanesljivo orodje za obdelavo besedila.</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="te-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Analiza Shannonove Entropije' : 'Shannon Entropy Analysis'}</label>
        <div id="te-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; overflow-y:auto;"></div>
      </div>
    </div>
  `;
  const input = container.querySelector('#te-input');
  const result = container.querySelector('#te-result');

  function update() {
    const text = input.value;
    if (!text) {
      result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo.' : 'Enter text.'}</span>`;
      return;
    }
    const len = text.length;
    const freqs = {};
    for (const c of text) freqs[c] = (freqs[c] || 0) + 1;

    let entropy = 0;
    for (const c in freqs) {
      const p = freqs[c] / len;
      entropy -= p * Math.log2(p);
    }

    const maxEntropy = Math.log2(Object.keys(freqs).length || 1);
    const metricPct = maxEntropy > 0 ? ((entropy / 8) * 100).toFixed(1) : 0;

    result.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div class="stat-box"><div class="num">${entropy.toFixed(3)}</div><div class="lbl">Shannon Entropija (bit/char)</div></div>
            <div class="stat-box"><div class="num">${len}</div><div class="lbl">${L ? 'Skupaj znakov' : 'Total Chars'}</div></div>
          </div>
          <div style="font-size:13px; margin-bottom:6px;"><strong>${L ? 'Ocena naključnosti / kompleksnosti:' : 'Randomness Score:'}</strong></div>
          <div style="background:var(--border); height:8px; border-radius:4px; overflow:hidden; margin-bottom:12px;">
            <div style="background:var(--teal); height:100%; width:${Math.min(100, metricPct)}%;"></div>
          </div>
          <div style="font-size:12px; color:var(--text-dim); line-height:1.5;">
            ${L ? 'Navadno besedilo ima entropijo med 3.5 in 5.0 bit/znak. Zgoščene ali šifrirane vrednosti imajo običajno entropijo nad 7.5 bit/znak.' : 'Normal prose has entropy between 3.5 and 5.0 bits/char. Encrypted or compressed data is typically > 7.5 bits/char.'}
          </div>
        `;
  }
  input.addEventListener('input', update);
  container.querySelector('#te-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
}

function renderLevenshtein(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label><input type="checkbox" id="lv-case"> ${L ? 'Upoštevaj velike/male črke' : 'Case sensitive'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="lv-a">${L ? 'Prvo besedilo (A)' : 'First text (A)'}</label>
        <textarea id="lv-a" rows="5" placeholder="Besedilo A...">Besedomat</textarea>
        <label for="lv-b" style="margin-top:10px;">${L ? 'Drugo besedilo (B)' : 'Second text (B)'}</label>
        <textarea id="lv-b" rows="5" placeholder="Besedilo B...">Besedomet</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="lv-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultat primerjave razdalje' : 'Distance Calculation'}</label>
        <div id="lv-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; display:flex; flex-direction:column; justify-content:center;"></div>
      </div>
    </div>
  `;
  const aEl = container.querySelector('#lv-a');
  const bEl = container.querySelector('#lv-b');
  const caseSens = container.querySelector('#lv-case');
  const result = container.querySelector('#lv-result');

  function levDist(s1, s2) {
    const a = [...s1],
      b = [...s2];
    const m = a.length,
      n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function update() {
    let s1 = aEl.value,
      s2 = bEl.value;
    if (!caseSens.checked) {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();
    }
    const dist = levDist(s1, s2);
    const maxLen = Math.max([...s1].length, [...s2].length);
    const simPct = maxLen === 0 ? 100 : Math.max(0, (1 - dist / maxLen) * 100).toFixed(1);

    result.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div class="stat-box"><div class="num">${dist}</div><div class="lbl">${L ? 'Levenshteinova razdalja' : 'Edit Distance'}</div></div>
            <div class="stat-box"><div class="num" style="color:var(--violet);">${simPct}%</div><div class="lbl">${L ? 'Stopnja podobnosti' : 'Similarity'}</div></div>
          </div>
          <div style="font-size:13px; color:var(--text-dim); text-align:center;">
            ${L ? `Za pretvorbo niza A v niz B je potrebnih natanko <strong>${dist}</strong> urejanj (vstavljanj, brisanj ali zamenjav znakov).` : `Exactly <strong>${dist}</strong> single-character edits required to transform A into B.`}
          </div>
        `;
  }
  [aEl, bEl, caseSens].forEach(el => el.addEventListener('input', update));
  container.querySelector('#lv-clear').addEventListener('click', () => {
    aEl.value = '';
    bEl.value = '';
    update();
    aEl.focus();
  });
  update();
}

function renderNumberToWords(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Jezik izpisa:' : 'Language:'}
        <select id="nw-lang">
          <option value="sl" ${L ? 'selected' : ''}>Slovenščina</option>
          <option value="en" ${!L ? 'selected' : ''}>English</option>
        </select>
      </label>
      <label>${L ? 'Oblika:' : 'Format:'}
        <select id="nw-fmt">
          <option value="words">${L ? 'Besedni zapis' : 'Words'}</option>
          <option value="currency">${L ? 'Valuta (EUR)' : 'Currency (EUR)'}</option>
          <option value="ordinal">${L ? 'Vrstilni števniki (1., 2...)' : 'Ordinal'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="nw-input">${getI('ui_input')}</label>
        <textarea id="nw-input" placeholder="${L ? 'Vnesite števila (eno na vrstico)...' : 'Enter numbers (one per line)...'}">1\n2\n3\n2026\n15.50</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="nw-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="nw-output">${getI('ui_output')}</label>
        <textarea id="nw-output" readonly placeholder="${L ? 'Besedni izpis števil...' : 'Spelled out words...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="nw-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#nw-input');
  const langSel = container.querySelector('#nw-lang');
  const fmtSel = container.querySelector('#nw-fmt');
  const output = container.querySelector('#nw-output');

  const slUnits = [
    '',
    'ena',
    'dva',
    'tri',
    'štiri',
    'pet',
    'šest',
    'sedem',
    'osem',
    'devet',
    'deset',
    'enajst',
    'dvanajst',
    'trinajst',
    'štirinajst',
    'petnajst',
    'šestnajst',
    'sedemnajst',
    'osemnajst',
    'devetnajst',
  ];
  const slTens = [
    '',
    'deset',
    'dvajset',
    'trideset',
    'štirideset',
    'petdeset',
    'šestdeset',
    'sedemdeset',
    'osemdeset',
    'devetdeset',
  ];
  const slHundreds = [
    '',
    'sto',
    'dvesto',
    'tristo',
    'štiristo',
    'petsto',
    'šeststo',
    'sedemsto',
    'osemsto',
    'devetsto',
  ];

  function slSmall(n) {
    if (n === 0) return 'nič';
    let res = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) res += slHundreds[h];
    if (rem === 0) return res;
    if (h > 0) res += ' ';
    if (rem < 20) {
      res += slUnits[rem];
    } else {
      const t = Math.floor(rem / 10);
      const u = rem % 10;
      if (u > 0) res += (u === 1 ? 'ena' : u === 2 ? 'dva' : slUnits[u]) + 'in' + slTens[t];
      else res += slTens[t];
    }
    return res;
  }

  function slNumber(num) {
    if (num === 0) return 'nič';
    let str = '';
    if (num < 0) {
      str += 'minus ';
      num = Math.abs(num);
    }
    const bil = Math.floor(num / 1000000000);
    const mio = Math.floor((num % 1000000000) / 1000000);
    const tisoce = Math.floor((num % 1000000) / 1000);
    const ostalo = num % 1000;

    if (bil > 0) {
      if (bil === 1) str += 'ena milijarda ';
      else if (bil === 2) str += 'dve milijardi ';
      else if (bil === 3 || bil === 4) str += slSmall(bil) + ' milijarde ';
      else str += slSmall(bil) + ' milijard ';
    }
    if (mio > 0) {
      if (mio === 1) str += 'en milijon ';
      else if (mio === 2) str += 'dva milijona ';
      else if (mio === 3 || mio === 4) str += slSmall(mio) + ' milijone ';
      else str += slSmall(mio) + ' milijonov ';
    }
    if (tisoce > 0) {
      if (tisoce === 1) str += 'tisoč ';
      else str += slSmall(tisoce) + ' tisoč ';
    }
    if (ostalo > 0 || (bil === 0 && mio === 0 && tisoce === 0)) {
      str += slSmall(ostalo);
    }
    return str.trim();
  }

  const enUnits = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  const enTens = [
    '',
    'ten',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  function enSmall(n) {
    if (n === 0) return 'zero';
    let res = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) res += enUnits[h] + ' hundred ';
    if (rem === 0) return res.trim();
    if (rem < 20) res += enUnits[rem];
    else {
      const t = Math.floor(rem / 10);
      const u = rem % 10;
      res += enTens[t] + (u > 0 ? '-' + enUnits[u] : '');
    }
    return res.trim();
  }

  function enNumber(num) {
    if (num === 0) return 'zero';
    let str = '';
    if (num < 0) {
      str += 'minus ';
      num = Math.abs(num);
    }
    const bil = Math.floor(num / 1000000000);
    const mio = Math.floor((num % 1000000000) / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const rem = num % 1000;
    if (bil > 0) str += enSmall(bil) + ' billion ';
    if (mio > 0) str += enSmall(mio) + ' million ';
    if (thousands > 0) str += enSmall(thousands) + ' thousand ';
    if (rem > 0 || (bil === 0 && mio === 0 && thousands === 0)) str += enSmall(rem);
    return str.trim();
  }

  const slOrdLastMap = {
    ena: 'prvi',
    dva: 'drugi',
    tri: 'tretji',
    štiri: 'četrti',
    pet: 'peti',
    šest: 'šesti',
    sedem: 'sedmi',
    osem: 'osmi',
    devet: 'deveti',
    deset: 'deseti',
    enajst: 'enajsti',
    dvanajst: 'dvanajsti',
    trinajst: 'trinajsti',
    štirinajst: 'štirinajsti',
    petnajst: 'petnajsti',
    šestnajst: 'šestnajsti',
    sedemnajst: 'sedemnajsti',
    osemnajst: 'osemnajsti',
    devetnajst: 'devetnajsti',
    dvajset: 'dvajseti',
    trideset: 'trideseti',
    štirideset: 'štirideseti',
    petdeset: 'petdeseti',
    šestdeset: 'šestdeseti',
    sedemdeset: 'sedemdeseti',
    osemdeset: 'osemdeseti',
    devetdeset: 'devetdeseti',
    sto: 'stoti',
    dvesto: 'dvestoti',
    tristo: 'tristoti',
    štiristo: 'štiristoti',
    petsto: 'petstoti',
    šesto: 'šeststoti',
    sedemsto: 'sedemstoti',
    osemsto: 'osemstoti',
    devetsto: 'devetstoti',
  };

  function toOrdinalSl(cardinalStr) {
    const s = cardinalStr.trim();
    if (s === 'nič') return 'ničti';
    const parts = s.split(/\s+/);
    const last = parts[parts.length - 1];
    const head = parts.slice(0, -1).join('');
    if (last === 'tisoč') {
      return head + 'tisoči';
    }
    if (['milijon', 'milijona', 'milijone', 'milijonov'].includes(last)) {
      if (/^(en|ena)$/.test(head)) return 'milijonti';
      return head + 'milijonti';
    }
    if (['milijarda', 'milijardi', 'milijarde', 'milijard'].includes(last)) {
      if (/^(en|ena)$/.test(head)) return 'milijardti';
      return head + 'milijardti';
    }
    let mapped = slOrdLastMap[last];
    if (!mapped && /set$/.test(last)) mapped = last + 'i';
    else if (!mapped && /sto$/.test(last)) mapped = last.slice(0, -2) + 'oti';
    return head + (mapped || last + '.');
  }

  function toOrdinalEn(cardinalStr) {
    if (cardinalStr.trim() === 'zero') return 'zeroth';
    const irregular = {
      one: 'first',
      two: 'second',
      three: 'third',
      five: 'fifth',
      eight: 'eighth',
      nine: 'ninth',
      twelve: 'twelfth',
    };
    const compoundIrregular = {
      '-one': '-first',
      '-two': '-second',
      '-three': '-third',
      '-five': '-fifth',
      '-eight': '-eighth',
      '-nine': '-ninth',
    };
    const words = cardinalStr.trim().split(/\s+/);
    let last = words[words.length - 1];
    if (irregular[last]) last = irregular[last];
    else {
      let done = false;
      for (const suf in compoundIrregular) {
        if (last.endsWith(suf)) {
          last = last.slice(0, -suf.length) + compoundIrregular[suf];
          done = true;
          break;
        }
      }
      if (!done) {
        if (/y$/.test(last)) last = last.slice(0, -1) + 'ieth';
        else if (/hundred$/.test(last)) last = last.replace(/hundred$/, 'hundredth');
        else if (/thousand$/.test(last)) last = last.replace(/thousand$/, 'thousandth');
        else if (/million$/.test(last)) last = last.replace(/million$/, 'millionth');
        else if (/billion$/.test(last)) last = last.replace(/billion$/, 'billionth');
        else if (/e$/.test(last)) last = last.slice(0, -1) + 'th';
        else last = last + 'th';
      }
    }
    words[words.length - 1] = last;
    return words.join(' ');
  }

  function update() {
    const isSl = langSel.value === 'sl';
    const fmtVal = fmtSel.value;
    const isCurr = fmtVal === 'currency';
    const isOrd = fmtVal === 'ordinal';
    output.value = input.value
      .split('\n')
      .map(line => {
        const trimmed = line.trim().replace(',', '.');
        if (!trimmed) return '';
        const num = parseFloat(trimmed);
        if (isNaN(num)) return L ? '(ni število)' : '(not a number)';
        const intPart = Math.floor(Math.abs(num));
        const decPart = Math.round((Math.abs(num) - intPart) * 100);

        if (isOrd && decPart === 0) {
          const sign = num < 0 ? 'minus ' : '';
          if (isSl) return sign + toOrdinalSl(slNumber(intPart));
          return sign + toOrdinalEn(enNumber(intPart));
        }

        if (isSl) {
          let res = slNumber(intPart);
          if (isCurr) {
            res += ' EUR' + (decPart > 0 ? ' in ' + decPart + '/100' : '');
          } else if (decPart > 0) {
            res += ' cela ' + slNumber(decPart);
          }
          return res;
        } else {
          let res = enNumber(intPart);
          if (isCurr) {
            res += ' dollars' + (decPart > 0 ? ' and ' + decPart + '/100 cents' : '');
          } else if (decPart > 0) {
            res += ' point ' + enNumber(decPart);
          }
          return res;
        }
      })
      .join('\n');
  }
  [input, langSel, fmtSel].forEach(el => el.addEventListener('input', update));
  container.querySelector('#nw-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#nw-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#nw-copy'));
  });
  update();
}

function renderBraille(container) {
  const L = currentLang === 'sl';
  const BRAILLE_MAP = {
    a: '⠁',
    b: '⠃',
    c: '⠉',
    č: '⠡',
    d: '⠙',
    e: '⠑',
    f: '⠋',
    g: '⠛',
    h: '⠓',
    i: '⠊',
    j: '⠚',
    k: '⠅',
    l: '⠇',
    m: '⠍',
    n: '⠝',
    o: '⠕',
    p: '⠏',
    q: '⠟',
    r: '⠗',
    s: '⠎',
    š: '⠱',
    t: '⠞',
    u: '⠥',
    v: '⠧',
    w: '⠺',
    x: '⠭',
    y: '⠽',
    z: '⠵',
    ž: '⠮',
    ' ': ' ',
    ',': '⠂',
    ';': '⠆',
    ':': '⠒',
    '.': '⠲',
    '!': '⠖',
    '?': '⠦',
    '1': '⠼⠁',
    '2': '⠼⠃',
    '3': '⠼⠉',
    '4': '⠼⠙',
    '5': '⠼⠑',
    '6': '⠼⠋',
    '7': '⠼⠛',
    '8': '⠼⠓',
    '9': '⠼⠊',
    '0': '⠼⠚',
  };

  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="br-input">${getI('ui_input')}</label>
        <textarea id="br-input" placeholder="${L ? 'Vnesite besedilo za pretvorbo v Braillovo pisavo...' : 'Enter text for Braille translation...'}">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="br-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="br-output">${getI('ui_output')}</label>
        <textarea id="br-output" readonly placeholder="${L ? 'Braillova pisava...' : 'Braille output...'}" style="font-size:20px; line-height:1.5;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="br-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#br-input');
  const output = container.querySelector('#br-output');

  function update() {
    const text = input.value.toLowerCase();
    output.value = [...text].map(c => BRAILLE_MAP[c] || c).join('');
  }
  input.addEventListener('input', update);
  container.querySelector('#br-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#br-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#br-copy'));
  });
  update();
}

function renderCodePoints(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Format izpisa:' : 'Format:'}
        <select id="cp-fmt">
          <option value="uplus">U+XXXX (U+010C U+0160)</option>
          <option value="hex">\\uXXXX (\\u010c\\u0161)</option>
          <option value="dec">Decimal (268 352)</option>
          <option value="html">&#xXXXX; (&#x10C;&#x160;)</option>
        </select>
      </label>
      <label>${L ? 'Ločilo:' : 'Separator:'}
        <select id="cp-sep">
          <option value="space">${L ? 'Presledek' : 'Space'}</option>
          <option value="comma">${L ? 'Vejica' : 'Comma'}</option>
          <option value="newline">${L ? 'Nova vrstica' : 'New line'}</option>
          <option value="none">${L ? 'Brez' : 'None'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="cp-input">${getI('ui_input')}</label>
        <textarea id="cp-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">ČŠŽ čšž ✨ 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="cp-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="cp-output">${getI('ui_output')}</label>
        <textarea id="cp-output" readonly placeholder="${L ? 'Kodne točke...' : 'Code points...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="cp-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#cp-input');
  const fmt = container.querySelector('#cp-fmt');
  const sep = container.querySelector('#cp-sep');
  const output = container.querySelector('#cp-output');

  function update() {
    const text = input.value;
    const f = fmt.value;
    const s =
      sep.value === 'space'
        ? ' '
        : sep.value === 'comma'
          ? ', '
          : sep.value === 'newline'
            ? '\n'
            : '';
    const chars = [...text];
    const res = chars.map(c => {
      const cp = c.codePointAt(0);
      if (f === 'uplus') return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
      if (f === 'hex') return '\\u' + cp.toString(16).padStart(4, '0');
      if (f === 'dec') return String(cp);
      if (f === 'html') return '&#x' + cp.toString(16).toUpperCase() + ';';
      return String(cp);
    });
    output.value = res.join(s);
  }
  [input, fmt, sep].forEach(el => el.addEventListener('input', update));
  container.querySelector('#cp-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#cp-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#cp-copy'));
  });
  update();
}

function renderDateTimeConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <button class="btn-sm" id="dt-now" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Trenutni čas (Zdaj)' : 'Current time (Now)'}</span></button>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="dt-input">${L ? 'Vnos datuma / Unix timestamp' : 'Date input or Unix timestamp'}</label>
        <textarea id="dt-input" rows="4" placeholder="2026-08-20T12:00:00Z ali 1787227200" style="min-height:100px;">${new Date().toISOString()}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="dt-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Pretvorjeni formati' : 'Converted Date Formats'}</label>
        <div id="dt-formats" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; flex:1; font-size:13px; line-height:1.8;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="dt-copy-iso" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj ISO 8601' : 'Copy ISO'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#dt-input');
  const formats = container.querySelector('#dt-formats');
  const nowBtn = container.querySelector('#dt-now');
  let isoString = '';

  function update() {
    const val = input.value.trim();
    if (!val) {
      formats.innerHTML = '';
      return;
    }
    let d;
    if (/^\d{10}$/.test(val)) d = new Date(parseInt(val) * 1000);
    else if (/^\d{13}$/.test(val)) d = new Date(parseInt(val));
    else d = new Date(val);

    if (isNaN(d.getTime())) {
      formats.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven datum ali čas.' : 'Invalid date format.'}</span>`;
      return;
    }

    isoString = d.toISOString();
    const unixSec = Math.floor(d.getTime() / 1000);
    const unixMs = d.getTime();
    const localSl = d.toLocaleString('sl-SI');
    const utc = d.toUTCString();

    formats.innerHTML = `
          <div><strong>ISO 8601:</strong> <code>${isoString}</code></div>
          <div><strong>Unix Timestamp (sekunde):</strong> <code>${unixSec}</code></div>
          <div><strong>Unix Timestamp (milisekunde):</strong> <code>${unixMs}</code></div>
          <div><strong>Lokalni čas (sl-SI):</strong> <code>${localSl}</code></div>
          <div><strong>UTC čas:</strong> <code>${utc}</code></div>
        `;
  }

  input.addEventListener('input', update);
  nowBtn.addEventListener('click', () => {
    input.value = new Date().toISOString();
    update();
  });
  container.querySelector('#dt-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#dt-copy-iso').addEventListener('click', () => {
    if (!isoString) return;
    copyText(isoString, container.querySelector('#dt-copy-iso'));
  });
  update();
}

function renderColorConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="cc-input">${L ? 'Vnos barve (HEX, RGB, HSL)' : 'Color Input (HEX, RGB, HSL)'}</label>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
          <input type="color" id="cc-picker" value="#6366f1" style="width:48px; height:40px; border-radius:8px; border:1px solid var(--border); cursor:pointer; padding:2px;">
          <input type="text" id="cc-input" value="#6366f1" placeholder="#6366f1, rgb(99, 102, 241)" style="flex:1;">
        </div>
        <div id="cc-preview" style="height:100px; border-radius:10px; border:1px solid var(--border); background:#6366f1; transition:background 0.2s;"></div>
        <div class="panel-actions">
          <button class="btn-sm" id="cc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Pretvorjene barvne vrednosti' : 'Converted Color Codes'}</label>
        <div id="cc-formats" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; font-size:13px; line-height:1.8;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="cc-copy-hex" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj HEX' : 'Copy HEX'}</span></button>
        </div>
      </div>
    </div>
  `;
  const picker = container.querySelector('#cc-picker');
  const input = container.querySelector('#cc-input');
  const preview = container.querySelector('#cc-preview');
  const formats = container.querySelector('#cc-formats');
  let currentHex = '#6366f1';

  function update() {
    let val = input.value.trim();
    if (!val) {
      formats.innerHTML = '';
      return;
    }
    if (
      !val.startsWith('#') &&
      !val.startsWith('rgb') &&
      !val.startsWith('hsl') &&
      /^[0-9a-fA-F]{6}$/.test(val)
    ) {
      val = '#' + val;
    }

    const d = document.createElement('div');
    d.style.color = val;
    document.body.appendChild(d);
    const cs = window.getComputedStyle(d).color;
    document.body.removeChild(d);

    const m = cs.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) {
      formats.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven barvni zapis.' : 'Invalid color format.'}</span>`;
      return;
    }

    const r = parseInt(m[1]),
      g = parseInt(m[2]),
      b = parseInt(m[3]);
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    currentHex = hex;
    preview.style.background = hex;
    if (/^#[0-9a-fA-F]{6}$/i.test(hex)) picker.value = hex;

    const rNorm = r / 255,
      gNorm = g / 255,
      bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm),
      min = Math.min(rNorm, gNorm, bNorm);
    let h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const delta = max - min;
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / delta + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / delta + 4;
          break;
      }
      h /= 6;
    }
    const hDeg = Math.round(h * 360),
      sPct = Math.round(s * 100),
      lPct = Math.round(l * 100);

    formats.innerHTML = `
          <div><strong>HEX:</strong> <code>${hex}</code></div>
          <div><strong>RGB:</strong> <code>rgb(${r}, ${g}, ${b})</code></div>
          <div><strong>HSL:</strong> <code>hsl(${hDeg}, ${sPct}%, ${lPct}%)</code></div>
          <div><strong>CSS Vrednost:</strong> <code>rgba(${r}, ${g}, ${b}, 1)</code></div>
        `;
  }

  input.addEventListener('input', update);
  picker.addEventListener('input', () => {
    input.value = picker.value;
    update();
  });
  container.querySelector('#cc-clear').addEventListener('click', () => {
    input.value = '';
    formats.innerHTML = '';
    input.focus();
  });
  container.querySelector('#cc-copy-hex').addEventListener('click', () => {
    copyText(currentHex, container.querySelector('#cc-copy-hex'));
  });
  update();
}

function renderTableConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Ciljni format:' : 'Target format:'}
        <select id="tc-format">
          <option value="markdown">Markdown Tabela (| col |)</option>
          <option value="html">&lt;table&gt; HTML</option>
          <option value="ascii">ASCII Box Tabela (+---+)</option>
          <option value="json">JSON Array of Objects</option>
        </select>
      </label>
      <label>${L ? 'Vhodno ločilo:' : 'Input delimiter:'}
        <select id="tc-delim">
          <option value="tab">${L ? 'Tabulator (Excel/Sheets kopiranje)' : 'Tab (Excel copy)'}</option>
          <option value="comma">${L ? 'Vejica (CSV)' : 'Comma (CSV)'}</option>
          <option value="semicolon">${L ? 'Podpičje (;)' : 'Semicolon (;)'}</option>
          <option value="pipe">${L ? 'Navpičnica (|)' : 'Pipe (|)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="tc-header" checked> ${L ? 'Prva vrstica je glava' : 'First row is header'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="tc-input">${getI('ui_input')}</label>
        <textarea id="tc-input" placeholder="${L ? 'Prilepite tabelarične podatke...' : 'Paste table data...'}">Mesto\tPrebivalci\tRegija\nLjubljana\t293000\tOsrednjeslovenska\nMaribor\t112000\tPodravska\nCelje\t49000\tSavinjska</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="tc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="tc-output">${getI('ui_output')}</label>
        <textarea id="tc-output" readonly placeholder="${L ? 'Pretvorjena tabela...' : 'Converted table...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="tc-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#tc-input');
  const fmtSel = container.querySelector('#tc-format');
  const delimSel = container.querySelector('#tc-delim');
  const hasHeader = container.querySelector('#tc-header');
  const output = container.querySelector('#tc-output');

  function update() {
    const raw = input.value.trim();
    if (!raw) {
      output.value = '';
      return;
    }
    const d =
      delimSel.value === 'tab'
        ? '\t'
        : delimSel.value === 'comma'
          ? ','
          : delimSel.value === 'semicolon'
            ? ';'
            : '|';
    const rows = raw.split('\n').map(r => r.split(d).map(c => c.trim()));
    if (rows.length === 0) return;

    const maxCols = Math.max(...rows.map(r => r.length));
    const normalized = rows.map(r => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    const f = fmtSel.value;
    if (f === 'markdown') {
      const mdCell = c => String(c).replace(/\|/g, '\\|');
      let res = '| ' + normalized[0].map(mdCell).join(' | ') + ' |\n';
      res += '| ' + normalized[0].map(() => '---').join(' | ') + ' |\n';
      for (let i = 1; i < normalized.length; i++) {
        res += '| ' + normalized[i].map(mdCell).join(' | ') + ' |\n';
      }
      output.value = res;
    } else if (f === 'html') {
      let res = '<table>\n';
      if (hasHeader.checked && normalized.length > 0) {
        res +=
          '  <thead>\n    <tr>' +
          normalized[0].map(c => `<th>${escapeHtml(c)}</th>`).join('') +
          '</tr>\n  </thead>\n  <tbody>\n';
        for (let i = 1; i < normalized.length; i++) {
          res +=
            '    <tr>' + normalized[i].map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>\n';
        }
        res += '  </tbody>\n</table>';
      } else {
        res += '  <tbody>\n';
        normalized.forEach(r => {
          res += '    <tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>\n';
        });
        res += '  </tbody>\n</table>';
      }
      output.value = res;
    } else if (f === 'json') {
      if (hasHeader.checked && normalized.length > 1) {
        const headers = normalized[0];
        const arr = normalized.slice(1).map(r => {
          const obj = {};
          headers.forEach((h, idx) => (obj[h || 'col_' + idx] = r[idx] || ''));
          return obj;
        });
        output.value = JSON.stringify(arr, null, 2);
      } else {
        output.value = JSON.stringify(normalized, null, 2);
      }
    } else if (f === 'ascii') {
      const colWidths = [];
      for (let c = 0; c < maxCols; c++) {
        colWidths[c] = Math.max(...normalized.map(r => (r[c] || '').length), 3);
      }
      const sep = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
      let res = sep + '\n';
      normalized.forEach((r, idx) => {
        res += '| ' + r.map((c, i) => (c || '').padEnd(colWidths[i])).join(' | ') + ' |\n';
        if (idx === 0 && hasHeader.checked) res += sep + '\n';
      });
      res += sep;
      output.value = res;
    }
  }
  [input, fmtSel, delimSel, hasHeader].forEach(el => el.addEventListener('input', update));
  container.querySelector('#tc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#tc-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#tc-copy'));
  });
  update();
}

function renderWordCloud(container) {
  const L = currentLang === 'sl';

  /* POGOSTE BESEDE (stop words) – razdeljene po besednih vrstah */
  const WC_STOP_GROUPS = {
    sl: {
      conj: [
        'in',
        'ter',
        'pa',
        'da',
        'ali',
        'ki',
        'ko',
        'če',
        'ker',
        'toda',
        'ampak',
        'vendar',
        'temveč',
        'saj',
        'kajti',
        'torej',
        'čeprav',
        'kadar',
        'kot',
      ],
      prep: [
        'za',
        'na',
        'v',
        'z',
        's',
        'pri',
        'po',
        'ob',
        'od',
        'do',
        'iz',
        'o',
        'k',
        'g',
        'med',
        'pred',
        'pod',
        'nad',
        'brez',
        'skozi',
        'proti',
      ],
      pron: [
        'ta',
        'to',
        'te',
        'ti',
        'tega',
        'temu',
        'tem',
        'tej',
        'teh',
        'temi',
        'tisti',
        'tisto',
        'tista',
        'vse',
        'vsi',
        'vsak',
        'vsaka',
        'vsako',
        'nekaj',
        'nekdo',
        'nihče',
        'nič',
        'kdo',
        'kaj',
        'jaz',
        'on',
        'ona',
        'ono',
        'midva',
        'vidva',
        'onadva',
        'mi',
        'vi',
        'oni',
        'one',
        'mene',
        'tebe',
        'njega',
        'nje',
        'naju',
        'vaju',
        'njih',
        'nas',
        'vas',
        'mu',
        'ji',
        'jima',
        'jim',
        'nam',
        'vam',
        'se',
      ],
      aux: [
        'je',
        'so',
        'bo',
        'bom',
        'boš',
        'bomo',
        'boste',
        'bodo',
        'bil',
        'bila',
        'bilo',
        'bili',
        'bile',
        'sem',
        'si',
        'smo',
        'ste',
        'ima',
        'imamo',
        'imate',
        'imajo',
        'imeti',
        'imel',
        'imela',
        'mora',
        'moramo',
        'morate',
        'morajo',
        'hoče',
        'želijo',
        'lahko',
      ],
      adv: [
        'tudi',
        'že',
        'še',
        'le',
        'kar',
        'zelo',
        'tako',
        'kako',
        'zakaj',
        'kje',
        'kdaj',
        'kam',
        'kod',
        'mnogo',
        'več',
        'manj',
      ],
    },
    en: {
      conj: [
        'the',
        'a',
        'an',
        'and',
        'or',
        'but',
        'nor',
        'so',
        'yet',
        'as',
        'until',
        'while',
        'than',
      ],
      prep: [
        'for',
        'at',
        'by',
        'from',
        'in',
        'into',
        'of',
        'off',
        'on',
        'onto',
        'out',
        'over',
        'to',
        'up',
        'with',
        'within',
        'without',
        'about',
        'against',
        'between',
        'through',
        'during',
        'before',
        'after',
        'above',
        'below',
      ],
      pron: [
        'i',
        'me',
        'my',
        'myself',
        'we',
        'us',
        'our',
        'ours',
        'ourselves',
        'you',
        'your',
        'yours',
        'yourself',
        'yourselves',
        'he',
        'him',
        'his',
        'himself',
        'she',
        'her',
        'hers',
        'herself',
        'it',
        'its',
        'itself',
        'they',
        'them',
        'their',
        'theirs',
        'themselves',
        'what',
        'which',
        'who',
        'whom',
        'this',
        'that',
        'these',
        'those',
        'all',
        'any',
        'both',
        'each',
        'few',
        'other',
        'some',
        'such',
        'own',
        'same',
      ],
      aux: [
        'is',
        'are',
        'am',
        'was',
        'were',
        'be',
        'been',
        'being',
        'have',
        'has',
        'had',
        'having',
        'do',
        'does',
        'did',
        'doing',
        'can',
        'could',
        'shall',
        'should',
        'will',
        'would',
        'may',
        'might',
        'must',
      ],
      adv: [
        'no',
        'not',
        'only',
        'too',
        'very',
        'just',
        'more',
        'most',
        'where',
        'when',
        'why',
        'how',
      ],
    },
  };

  const WC_GROUP_LABELS = {
    sl: {
      conj: 'Vezniki',
      prep: 'Predlogi',
      pron: 'Zaimki',
      aux: 'Pomožni & modalni glagoli',
      adv: 'Prislovi in delci',
    },
    en: {
      conj: 'Conjunctions & articles',
      prep: 'Prepositions',
      pron: 'Pronouns & determiners',
      aux: 'Auxiliary & modal verbs',
      adv: 'Adverbs & negations',
    },
  };

  const PALETTES = {
    indigo: [
      '#4f46e5',
      '#6366f1',
      '#818cf8',
      '#e11d48',
      '#f43f5e',
      '#fb7185',
      '#a855f7',
      '#c084fc',
    ],
    ocean: ['#0d9488', '#14b8a6', '#2dd4bf', '#0284c7', '#0ea5e9', '#38bdf8', '#2563eb', '#3b82f6'],
    sunset: [
      '#dc2626',
      '#ef4444',
      '#f87171',
      '#ea580c',
      '#f97316',
      '#fb923c',
      '#d97706',
      '#f59e0b',
    ],
    nature: [
      '#059669',
      '#10b981',
      '#34d399',
      '#65a30d',
      '#84cc16',
      '#a3e635',
      '#047857',
      '#15803d',
    ],
    rainbow: [
      '#e11d48',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#06b6d4',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
    ],
    mono: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
  };

  const sampleSl = `Besedomat je sodobno spletno orodje za obdelavo in analizo besedil. Z orodji lahko preštejete besede, analizirate frekvenco besed, pretvarjate velikost črk ter ustvarjate čudovite vizualizacije. Oblak besed samodejno prepozna ključne besede in pomembne pojme v vsakem besedilu. Analiza besedila in izločanje pogostih besed omogočata hiter pregled nad vsebino člankov, poročil in dokumentov. Besedomat deluje hitro, varno in neposredno v brskalniku brez pošiljanja podatkov na zunanje strežnike.`;
  const sampleEn = `Besedomat is a modern online text toolkit and language analysis suite. With these tools you can count words, analyze word frequency, transform text cases, and create beautiful word clouds. The word cloud generator automatically identifies keywords and key concepts in any text. Text analysis and stop word filtering provide an instant overview of articles, essays, and documents. Besedomat works fast, securely, and completely in your browser without sending data to servers.`;

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px; gap:8px 14px;">
      <div style="width:100%; display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--text-dimmer);">
        ${SVG_ICONS.mi_filter} ${L ? 'Nastavitve in filtri oblaka' : 'Cloud Settings & Filters'}
      </div>
      <div class="custom-dropdown-wrap" id="wc-filter-wrap">
        <button type="button" class="dropdown-btn" id="wc-filter-btn" aria-haspopup="true" aria-expanded="false" title="${L ? 'Pogoste besede so besede brez velike vsebinske teže (vezniki, predlogi, zaimki …), ki jih oblak lahko izloči.' : 'Common words are low-meaning words (conjunctions, prepositions, pronouns…) that the cloud can exclude.'}">
          <span>${L ? 'Pogoste besede:' : 'Common words:'}</span>
          <span id="wc-filter-count" style="background:rgba(99,102,241,0.12); color:var(--violet); border-radius:99px; padding:2px 9px; font-size:11px;"></span>
          <span class="arrow-icon">▼</span>
        </button>
        <div class="dropdown-menu" id="wc-filter-menu" style="left:0; right:auto; min-width:270px;"></div>
      </div>
      <label>${L ? 'Min. dolžina:' : 'Min length:'}
        <input type="number" id="wc-minlen" value="3" min="1" max="15" style="width:48px;">
      </label>
      <label>${L ? 'Min. ponovitev:' : 'Min freq:'}
        <input type="number" id="wc-minfreq" value="1" min="1" max="20" style="width:48px;">
      </label>
      <label>${L ? 'Max besed:' : 'Max words:'}
        <select id="wc-maxwords">
          <option value="30">30</option>
          <option value="50" selected>50</option>
          <option value="80">80</option>
          <option value="120">120</option>
        </select>
      </label>
      <label>${L ? 'Barve:' : 'Colors:'}
        <select id="wc-palette">
          <option value="indigo">Indigo & Crimson</option>
          <option value="ocean">Ocean Teal & Blue</option>
          <option value="sunset">Sunset Fire</option>
          <option value="nature">Emerald Nature</option>
          <option value="rainbow">Vibrant Rainbow</option>
          <option value="mono">Monochrome</option>
        </select>
      </label>
      <label>${L ? 'Postavitev:' : 'Orientation:'}
        <select id="wc-orientation">
          <option value="horiz" selected>${L ? 'Vodoravno' : 'Horizontal'}</option>
          <option value="mixed">${L ? 'Vodoravno & Navpično' : 'Horizontal & Vertical'}</option>
        </select>
      </label>
    </div>

    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="wc-input">${getI('ui_input')}</label>
        <textarea id="wc-input" rows="8" placeholder="${L ? 'Vnesite ali prilepite besedilo za ustvarjanje oblaka besed...' : 'Type or paste text to generate a word cloud...'}" style="min-height:220px;">${L ? sampleSl : sampleEn}</textarea>
        <div class="panel-actions">
          <button id="wc-sample" class="btn-sm" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_edit} <span>${L ? 'Primer' : 'Sample'}</span></button>
          <button id="wc-clear" class="btn-sm" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>

      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="margin:0;">${L ? 'Predogled oblaka besed' : 'Word Cloud Preview'}</label>
          <span id="wc-stats" style="font-size:12px; color:var(--text-dim);"></span>
        </div>
        <div style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:8px; display:flex; justify-content:center; align-items:center; min-height:220px; flex:1; position:relative; overflow:hidden;">
          <canvas id="wc-canvas" width="800" height="480" style="max-width:100%; height:auto; border-radius:8px; display:block;"></canvas>
        </div>
        <div class="panel-actions" style="gap:8px;">
          <button class="btn-sm primary" id="wc-download" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi PNG' : 'Download PNG'}</span></button>
          <button class="btn-sm" id="wc-copy-freq" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj frekvence' : 'Copy Frequencies'}</span></button>
          <button class="btn-sm" id="wc-reroll" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Premešaj' : 'Re-roll'}</span></button>
        </div>
      </div>
    </div>

    <!-- INTERACTIVE WORD FILTER HUB -->
    <div style="margin-top:20px; background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid var(--border);">
        <div>
          <strong style="font-size:15px;">${L ? 'Interaktivni filter besed' : 'Interactive Word Filter'}</strong>
          <div style="font-size:12px; color:var(--text-dim); margin-top:2px;">${L ? 'Kliknite na besedo, da jo vključite ali izključite iz oblaka v živo.' : 'Click any chip to toggle inclusion/exclusion from the cloud in real-time.'}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <input type="text" id="wc-chip-search" placeholder="${L ? 'Išči med žetoni...' : 'Filter chips...'}" style="padding:5px 10px; font-size:12px; border-radius:8px; width:150px;">
          <button id="wc-select-all" class="btn-sm" style="padding:4px 8px; font-size:12px;">${SVG_ICONS.mi_check} ${L ? 'Vklopi vse' : 'Select All'}</button>
          <button id="wc-deselect-all" class="btn-sm" style="padding:4px 8px; font-size:12px;">${SVG_ICONS.mi_x} ${L ? 'Izklopi vse' : 'Clear All'}</button>
          <button id="wc-top-20" class="btn-sm" style="padding:4px 8px; font-size:12px;">${SVG_ICONS.mi_star} Top 20</button>
        </div>
      </div>
      <div id="wc-chips" style="display:flex; flex-wrap:wrap; gap:6px; padding:2px;"></div>
    </div>
  `;

  const input = container.querySelector('#wc-input');
  const minLenInput = container.querySelector('#wc-minlen');
  const minFreqInput = container.querySelector('#wc-minfreq');
  const maxWordsSel = container.querySelector('#wc-maxwords');
  const paletteSel = container.querySelector('#wc-palette');
  const orientationSel = container.querySelector('#wc-orientation');
  const canvas = container.querySelector('#wc-canvas');
  const ctx = canvas.getContext('2d');
  const statsEl = container.querySelector('#wc-stats');
  const chipsWrap = container.querySelector('#wc-chips');
  const chipSearch = container.querySelector('#wc-chip-search');

  const excludedWords = new Set();
  let cachedWordCounts = [];
  let seedOffset = 0;

  const wcLangKey = L ? 'sl' : 'en';
  const wcGroupKeys = Object.keys(WC_STOP_GROUPS[wcLangKey]);
  const wcActiveGroups = new Set(wcGroupKeys);
  const wcFilterWrap = container.querySelector('#wc-filter-wrap');
  const wcFilterBtn = container.querySelector('#wc-filter-btn');
  const wcFilterMenu = container.querySelector('#wc-filter-menu');
  const wcFilterCount = container.querySelector('#wc-filter-count');

  function buildStopSet() {
    const src = WC_STOP_GROUPS[wcLangKey];
    const s = new Set();
    wcGroupKeys.forEach(k => {
      if (wcActiveGroups.has(k)) src[k].forEach(w => s.add(w));
    });
    return s;
  }

  function updateFilterCount() {
    const total = wcGroupKeys.length;
    wcFilterCount.textContent =
      wcActiveGroups.size === total
        ? L
          ? 'vse'
          : 'all'
        : wcActiveGroups.size === 0
          ? L
            ? 'brez'
            : 'none'
          : `${wcActiveGroups.size}/${total}`;
  }

  function renderFilterMenu() {
    const labels = WC_GROUP_LABELS[wcLangKey];
    const expl = L
      ? 'To so besede brez velike vsebinske teže. Izberite skupine, ki naj jih oblak prezre.'
      : 'These are low-meaning words. Choose which groups the cloud should ignore.';
    wcFilterMenu.innerHTML = `
          <div style="padding:10px 12px; font-size:11.5px; line-height:1.5; color:var(--text-dim); border-bottom:1px solid var(--border); margin-bottom:4px;">${expl}</div>
          ${wcGroupKeys
            .map(
              k => `
            <label class="dropdown-item" style="justify-content:flex-start; gap:9px; cursor:pointer;">
              <input type="checkbox" data-wcgroup="${k}" ${wcActiveGroups.has(k) ? 'checked' : ''} style="accent-color:var(--violet); cursor:pointer;">
              <span style="flex:1;">${labels[k]}</span>
              <span style="font-size:11px; opacity:.6;">${WC_STOP_GROUPS[wcLangKey][k].length}</span>
            </label>`
            )
            .join('')}
          <div style="display:flex; gap:6px; padding:8px 6px 4px; border-top:1px solid var(--border); margin-top:4px;">
            <button type="button" id="wc-f-all" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Vklopi vse' : 'Enable all'}</button>
            <button type="button" id="wc-f-none" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Izklopi vse' : 'Disable all'}</button>
          </div>`;

    wcFilterMenu.querySelectorAll('input[data-wcgroup]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) wcActiveGroups.add(cb.dataset.wcgroup);
        else wcActiveGroups.delete(cb.dataset.wcgroup);
        updateFilterCount();
        analyzeText();
      });
    });
    wcFilterMenu.querySelector('#wc-f-all').addEventListener('click', () => {
      wcGroupKeys.forEach(k => wcActiveGroups.add(k));
      refreshFilterUI();
      analyzeText();
    });
    wcFilterMenu.querySelector('#wc-f-none').addEventListener('click', () => {
      wcActiveGroups.clear();
      refreshFilterUI();
      analyzeText();
    });
  }

  function refreshFilterUI() {
    renderFilterMenu();
    updateFilterCount();
  }

  wcFilterBtn.addEventListener('click', ev => {
    ev.stopPropagation();
    wcFilterWrap.classList.toggle('open');
  });
  wcFilterMenu.addEventListener('click', ev => ev.stopPropagation());
  if (!window.__wcFilterOutsideCloseBound) {
    window.__wcFilterOutsideCloseBound = true;
    document.addEventListener('click', ev => {
      const w = document.getElementById('wc-filter-wrap');
      if (w && !w.contains(ev.target)) w.classList.remove('open');
    });
  }
  refreshFilterUI();

  function analyzeText() {
    const text = input.value || '';
    const rawTokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    const minLen = parseInt(minLenInput.value) || 1;
    const minFreq = parseInt(minFreqInput.value) || 1;
    const stopSet = buildStopSet();

    const counts = {};
    rawTokens.forEach(token => {
      if (token.length < minLen) return;
      if (stopSet.has(token)) return;
      counts[token] = (counts[token] || 0) + 1;
    });

    const list = Object.entries(counts)
      .filter(([word, count]) => count >= minFreq)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([word, count]) => ({ word, count }));

    cachedWordCounts = list;
    renderChips();
    drawCloud();
  }

  function renderChips() {
    const filterStr = (chipSearch.value || '').trim().toLowerCase();
    const maxDisplay = parseInt(maxWordsSel.value) || 50;

    let visibleItems = cachedWordCounts;
    if (filterStr) {
      visibleItems = visibleItems.filter(item => item.word.includes(filterStr));
    }

    if (!visibleItems.length) {
      chipsWrap.innerHTML = `<span style="font-size:12px; color:var(--text-dim); padding:8px;">${L ? 'Ni ujemajočih se besed.' : 'No matching words.'}</span>`;
      return;
    }

    chipsWrap.innerHTML = visibleItems
      .map((item, idx) => {
        const isExcluded = excludedWords.has(item.word);
        const isTop = idx < maxDisplay && !isExcluded;
        const bg = isExcluded
          ? 'background:rgba(0,0,0,0.06); color:var(--text-dimmer); text-decoration:line-through; border:1px dashed var(--border);'
          : isTop
            ? 'background:rgba(99,102,241,0.12); color:var(--violet); border:1px solid rgba(99,102,241,0.35); font-weight:600;'
            : 'background:var(--card); color:var(--text); border:1px solid var(--border);';

        return `
            <button class="wc-chip" data-word="${escapeHtml(item.word)}" style="cursor:pointer; border-radius:20px; padding:3px 10px; font-size:12px; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; ${bg}">
              <span>${escapeHtml(item.word)}</span>
              <span style="opacity:0.75; font-size:11px;">(${item.count})</span>
              <span>${isExcluded ? SVG_ICONS.mi_x : SVG_ICONS.mi_check}</span>
            </button>
          `;
      })
      .join('');

    chipsWrap.querySelectorAll('.wc-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.dataset.word;
        if (excludedWords.has(w)) {
          excludedWords.delete(w);
        } else {
          excludedWords.add(w);
        }
        renderChips();
        drawCloud();
      });
    });
  }

  function drawCloud() {
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bgRgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    const isDark =
      bgRgb && bgRgb.length >= 3
        ? 0.2126 * Number(bgRgb[0]) + 0.7152 * Number(bgRgb[1]) + 0.0722 * Number(bgRgb[2]) < 128
        : document.documentElement.getAttribute('data-theme')?.includes('dark');
    ctx.fillStyle = isDark ? '#141417' : '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Filter active words
    const maxWords = parseInt(maxWordsSel.value) || 50;
    const activeWords = cachedWordCounts
      .filter(item => !excludedWords.has(item.word))
      .slice(0, maxWords);

    statsEl.textContent = `${L ? 'Prikazanih' : 'Showing'} ${activeWords.length} / ${cachedWordCounts.length} ${L ? 'besed' : 'words'}`;

    if (!activeWords.length) {
      ctx.fillStyle = isDark ? '#71717a' : '#9ca3af';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        L ? 'Vnesite besedilo za prikaz oblaka besed' : 'Enter text to generate word cloud',
        W / 2,
        H / 2
      );
      return;
    }

    const maxCount = activeWords[0].count;
    const minCount = activeWords[activeWords.length - 1].count;
    const palette = PALETTES[paletteSel.value] || PALETTES.indigo;
    const isMixed = orientationSel.value === 'mixed';

    const boxes = [];
    const minFontSize = 14;
    const maxFontSize = Math.min(68, Math.max(32, Math.round(W / 12)));

    activeWords.forEach((item, idx) => {
      const ratio = (item.count - minCount) / (maxCount - minCount || 1);
      const fontSize = Math.round(minFontSize + Math.pow(ratio, 0.8) * (maxFontSize - minFontSize));
      const color = palette[idx % palette.length];
      const isVertical = isMixed && idx % 4 === 3;

      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      const metrics = ctx.measureText(item.word);
      const textW = isVertical ? fontSize + 4 : metrics.width + 10;
      const textH = isVertical ? metrics.width + 10 : fontSize + 4;

      let placed = false;
      let angle = (idx * 1.618 + seedOffset) * Math.PI * 2;
      let radius = 0;
      const maxRadius = Math.sqrt(W * W + H * H) / 2;

      for (let step = 0; step < 260; step++) {
        const x = W / 2 + radius * Math.cos(angle) - textW / 2;
        const y = H / 2 + radius * Math.sin(angle) - textH / 2;

        if (x >= 12 && x + textW <= W - 12 && y >= 12 && y + textH <= H - 12) {
          const overlap = boxes.some(
            b => !(x + textW < b.x || x > b.x + b.w || y + textH < b.y || y > b.y + b.h)
          );
          if (!overlap) {
            boxes.push({ x, y, w: textW, h: textH, word: item.word, fontSize, color, isVertical });
            placed = true;
            break;
          }
        }
        angle += 0.38;
        radius += 1.9;
        if (radius > maxRadius) break;
      }

      if (!placed && fontSize > 16) {
        const smallerFont = Math.round(fontSize * 0.7);
        ctx.font = `bold ${smallerFont}px system-ui, sans-serif`;
        const m2 = ctx.measureText(item.word);
        const w2 = isVertical ? smallerFont + 4 : m2.width + 8;
        const h2 = isVertical ? m2.width + 8 : smallerFont + 4;
        let a2 = Math.random() * Math.PI * 2;
        let r2 = 0;
        for (let s = 0; s < 180; s++) {
          const x = W / 2 + r2 * Math.cos(a2) - w2 / 2;
          const y = H / 2 + r2 * Math.sin(a2) - h2 / 2;
          if (x >= 10 && x + w2 <= W - 10 && y >= 10 && y + h2 <= H - 10) {
            const overlap = boxes.some(
              b => !(x + w2 < b.x || x > b.x + b.w || y + h2 < b.y || y > b.y + b.h)
            );
            if (!overlap) {
              boxes.push({
                x,
                y,
                w: w2,
                h: h2,
                word: item.word,
                fontSize: smallerFont,
                color,
                isVertical,
              });
              break;
            }
          }
          a2 += 0.45;
          r2 += 2.2;
        }
      }
    });

    boxes.forEach(box => {
      ctx.save();
      ctx.fillStyle = box.color;
      ctx.font = `bold ${box.fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const centerX = box.x + box.w / 2;
      const centerY = box.y + box.h / 2;

      if (box.isVertical) {
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(box.word, 0, 0);
      } else {
        ctx.fillText(box.word, centerX, centerY);
      }
      ctx.restore();
    });
  }

  let _wcDebounce;
  input.addEventListener('input', () => {
    clearTimeout(_wcDebounce);
    _wcDebounce = setTimeout(analyzeText, 120);
  });

  [minLenInput, minFreqInput, maxWordsSel, paletteSel, orientationSel].forEach(el => {
    el.addEventListener('change', analyzeText);
  });

  chipSearch.addEventListener('input', renderChips);

  container.querySelector('#wc-sample').addEventListener('click', () => {
    input.value = L ? sampleSl : sampleEn;
    excludedWords.clear();
    analyzeText();
  });

  container.querySelector('#wc-clear').addEventListener('click', () => {
    input.value = '';
    excludedWords.clear();
    analyzeText();
    input.focus();
  });

  container.querySelector('#wc-reroll').addEventListener('click', () => {
    seedOffset += 0.237;
    drawCloud();
  });

  container.querySelector('#wc-select-all').addEventListener('click', () => {
    excludedWords.clear();
    renderChips();
    drawCloud();
  });

  container.querySelector('#wc-deselect-all').addEventListener('click', () => {
    cachedWordCounts.forEach(item => excludedWords.add(item.word));
    renderChips();
    drawCloud();
  });

  container.querySelector('#wc-top-20').addEventListener('click', () => {
    excludedWords.clear();
    cachedWordCounts.slice(20).forEach(item => excludedWords.add(item.word));
    renderChips();
    drawCloud();
  });

  container.querySelector('#wc-download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'besedomat-wordcloud.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  container.querySelector('#wc-copy-freq').addEventListener('click', () => {
    const lines = cachedWordCounts
      .filter(item => !excludedWords.has(item.word))
      .map(item => `${item.word}: ${item.count}`);
    copyText(lines.join('\n'), container.querySelector('#wc-copy-freq'));
  });

  analyzeText();
}

/* ============ DRAG & DROP SUPPORT FOR ALL TEXTAREAS ============ */
function initDragAndDrop() {
  document.addEventListener('dragover', e => {
    if (e.target && e.target.tagName === 'TEXTAREA') {
      e.preventDefault();
      e.target.classList.add('textarea-drag-over');
    }
  });
  document.addEventListener('dragleave', e => {
    if (e.target && e.target.tagName === 'TEXTAREA') {
      e.target.classList.remove('textarea-drag-over');
    }
  });
  document.addEventListener('drop', e => {
    if (e.target && e.target.tagName === 'TEXTAREA') {
      e.preventDefault();
      e.target.classList.remove('textarea-drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = event => {
          e.target.value = event.target.result;
          e.target.dispatchEvent(new Event('input', { bubbles: true }));
          showToast(`${currentLang === 'sl' ? 'Naložena datoteka:' : 'Loaded file:'} ${file.name}`);
        };
        reader.onerror = () => {
          showToast(currentLang === 'sl' ? 'Napaka pri branju datoteke.' : 'Error reading file.');
        };
        reader.readAsText(file);
      }
    }
  });
}

/* ============ KEYBOARD NAVIGATION (ESC) ============ */
function initKeyboard() {
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' || e.code === 'Escape') {
      const isDrawerOpen =
        document.getElementById('drawer') &&
        document.getElementById('drawer').classList.contains('open');
      if (isDrawerOpen) {
        closeDrawer(true);
        return;
      }

      // If on a tool page, Esc goes back to all tools!
      // But never navigate away while the user is editing a field.
      const ae = document.activeElement;
      const editingField =
        ae && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT' || ae.tagName === 'SELECT');
      if (editingField) return;
      const backBtn = document.querySelector('#tool-page-body #tool-back-btn');
      if (views.tool && views.tool.classList.contains('active') && backBtn) {
        e.preventDefault();
        backBtn.click();
      }
    }
  });
}

/* ============ COMMAND PALETTE (Ctrl/Cmd+K) ============ */
function initCommandPalette() {
  const overlay = document.getElementById('cmd-palette-overlay');
  const input = document.getElementById('cmd-palette-input');
  const list = document.getElementById('cmd-palette-list');
  if (!overlay || !input || !list) return;

  let activeIndex = 0;
  let results = [];

  function catName(cat) {
    const c = CATEGORIES[cat];
    return c ? c[currentLang] || c['en'] : cat;
  }

  function render() {
    const q = input.value.trim();
    if (q) {
      results = TOOLS.map(t => ({ t, s: computeSearchScore(t, q, normalizeForSearch(q)) }))
        .filter(x => x.s.score > 0)
        .sort((a, b) => b.s.score - a.s.score)
        .map(x => x.t);
    } else {
      results = TOOLS.slice();
    }
    if (activeIndex >= results.length) activeIndex = 0;

    if (!results.length) {
      list.innerHTML = `<div class="cmd-empty">${currentLang === 'sl' ? 'Ni najdenih orodij.' : 'No tools found.'}</div>`;
      return;
    }
    list.innerHTML = results
      .map(
        (t, i) => `
          <div class="cmd-item ${i === activeIndex ? 'active' : ''}" data-idx="${i}" role="option" aria-selected="${i === activeIndex}">
            <span class="cmd-icon">${t.icon}</span>
            <span class="cmd-name">${escapeHtml(t.name[currentLang] || t.name['en'])}</span>
            <span class="cmd-cat">${escapeHtml(catName(t.category))}</span>
          </div>
        `
      )
      .join('');
  }

  function open() {
    overlay.classList.add('open');
    input.value = '';
    activeIndex = 0;
    input.placeholder =
      currentLang === 'sl'
        ? 'Išči orodje... (npr. base64, geslo, števec)'
        : 'Search tool... (e.g. base64, password, counter)';
    render();
    setTimeout(() => input.focus(), 10);
  }

  function close() {
    overlay.classList.remove('open');
  }

  function choose(idx) {
    const t = results[idx];
    if (!t) return;
    close();
    openTool(t.id);
  }

  input.addEventListener('input', () => {
    activeIndex = 0;
    render();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, results.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });

  list.addEventListener('click', e => {
    const item = e.target.closest('.cmd-item');
    if (item) choose(parseInt(item.dataset.idx, 10));
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (overlay.classList.contains('open')) close();
      else open();
    }
  });
}

/* ============ INIT ============ */
function init() {
  // Global error boundary: surface unexpected errors to the user via a
  // toast instead of silently breaking the whole app.
  window.addEventListener('error', e => {
    console.error('Besedomat napaka:', e.error || e.message);
    try {
      showToast((currentLang === 'sl' ? 'Napaka: ' : 'Error: ') + (e.message || 'unknown'));
      const body = document.getElementById('custom-body');
      if (body && document.activeElement && body.contains(document.activeElement)) {
        showToolErrorBanner(body, e.message || 'unknown');
      }
    } catch (_) {}
  });
  window.addEventListener('unhandledrejection', e => {
    console.error('Besedomat neobravnavan promise:', e.reason);
  });

  // Prepare tool data: tag expansion + long descriptions.
  // Runs here (not at top level) because TOOLS/CATEGORIES/LONGDESC_DE
  // are declared with const further below and would otherwise be in TDZ.
  try {
    TOOLS.forEach(expandTags);
  } catch (e) {
    console.error('expandTags napaka:', e);
  }
  TOOLS.forEach(t => {
    if (!t.longDesc) {
      const baseDesc = t.desc[currentLang] || t.desc.en;
      const name = t.name[currentLang] || t.name.en;
      const categoryName = CATEGORIES[t.category]
        ? CATEGORIES[t.category][currentLang]
        : t.category;
      t.longDesc = {
        sl: `${baseDesc} To orodje pripada kategoriji ${categoryName}. Deluje v celoti lokalno v brskalniku — vaša besedila nikoli ne zapustijo vaše naprave. Primer uporabe: prilepite besedilo, nastavite željene možnosti, in takoj vidite rezultat.`,
        en: `${baseDesc} This tool belongs to the ${categoryName} category. Runs entirely in your browser — your text never leaves your device. Usage: paste text, adjust options, and see results instantly.`,
      };
    }
  });
  TOOLS.forEach(t => {
    if (!t.longDesc) return;
    if (!t.longDesc.de) {
      const catDe = CATEGORIES[t.category]
        ? CATEGORIES[t.category].de || CATEGORIES[t.category].en || CATEGORIES[t.category].sl
        : t.category;
      t.longDesc.de =
        LONGDESC_DE[t.id] ||
        `Dieses Werkzeug gehört zur Kategorie ${catDe}. Es läuft vollständig lokal im Browser – Ihre Texte verlassen niemals Ihr Gerät. Anwendung: Text einfügen, Optionen einstellen, Ergebnis sofort sehen.`;
    }
  });
  normalizeToolCopy();
  updateToolCount();
  try {
    const results = runToolTests();
    if (results && results.failed > 0)
      console.warn('Besedomat: nekatera orodja so na testih failed. Podrobnosti v konzoli.');
  } catch (e) {
    console.warn('Besedomat: testi nisi uspeli zagnati.', e);
  }
  try {
    const savedTheme = localStorage.getItem('besedomat-theme') || 'light';
    setTheme(savedTheme);
  } catch (e) {
    setTheme('light');
  }
  let savedLang = 'sl';
  try {
    savedLang = localStorage.getItem('besedomat-lang') || 'sl';
  } catch (e) {}
  setLang(savedLang);
  initDragAndDrop();
  initKeyboard();
  initCommandPalette();
  handleRoute();
  registerServiceWorker();
}

/* ============ PWA: SERVICE WORKER ============ */
function registerServiceWorker() {
  try {
    if (!('serviceWorker' in navigator)) return;
    /* Deluje samo prek https ali localhost — pri file:// se mirno preskoči */
    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1'
    )
      return;
    navigator.serviceWorker.register('sw.js').catch(() => {});
  } catch (e) {}
}

/* ============ CIPHER TOOL RENDERERS ============ */

function renderPlatformCounter(container) {
  const L = currentLang === 'sl';

  const platforms = [
    { id: 'twitter', name: 'Twitter / X', limit: 280, icon: '🐦', color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', limit: 3000, icon: '💼', color: '#0A66C2' },
    { id: 'instagram', name: 'Instagram', limit: 2200, icon: '📷', color: '#E4405F' },
    { id: 'sms', name: 'SMS', limit: 160, icon: '📱', color: '#25D366' },
    { id: 'meta', name: 'Meta Description', limit: 160, icon: '🔍', color: '#1877F2' },
    { id: 'youtube', name: 'YouTube Title', limit: 100, icon: '▶️', color: '#FF0000' },
  ];

  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pc-input">${getI('ui_input')}</label>
        <textarea id="pc-input" placeholder="${L ? 'Vnesite besedilo za preverjanje dolžine...' : 'Enter text to check length...'}" style="min-height:180px;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultati po platformah' : 'Results by Platform'}</label>
        <div id="pc-results" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:200px; overflow:auto;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="pc-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj povzetek' : 'Copy Summary'}</span></button>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#pc-input');
  const resultsDiv = container.querySelector('#pc-results');

  function getCountStats(text) {
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r?\n/).length : 0;
    return { charsWithSpaces, charsNoSpaces, words, lines };
  }

  function getStatus(used, limit) {
    const pct = (used / limit) * 100;
    if (used > limit)
      return {
        class: 'over',
        label: L ? `PRESEŽENO (+${used - limit})` : `OVER (+${used - limit})`,
        pct: Math.min(pct, 200),
      };
    if (pct >= 90)
      return {
        class: 'warn',
        label: L ? `Preostane ${limit - used}` : `${limit - used} left`,
        pct,
      };
    return { class: 'ok', label: L ? `Preostane ${limit - used}` : `${limit - used} left`, pct };
  }

  function update() {
    const text = input.value;
    const stats = getCountStats(text);

    let html = `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
        `;

    platforms.forEach(p => {
      const status = getStatus(stats.charsWithSpaces, p.limit);
      const pct = Math.min(status.pct, 100);
      html += `
            <div style="border:1px solid var(--border); border-radius:10px; padding:12px; background:var(--bg-alt);">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span style="font-size:20px;">${p.icon}</span>
                <strong style="color:${p.color};">${p.name}</strong>
              </div>
              <div style="height:8px; background:var(--border); border-radius:4px; overflow:hidden; margin-bottom:6px;">
                <div style="width:${pct}%; height:100%; background:${status.class === 'over' ? '#ef4444' : status.class === 'warn' ? '#f59e0b' : '#22c55e'}; border-radius:4px; transition:width 0.3s;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:12px; font-family:monospace;">
                <span>${stats.charsWithSpaces} / ${p.limit} ${L ? 'znakov' : 'chars'}</span>
                <span class="${status.class}" style="color:${status.class === 'over' ? '#ef4444' : status.class === 'warn' ? '#f59e0b' : '#22c55e'}; font-weight:600;">${status.label}</span>
              </div>
            </div>
          `;
    });

    html += `
          </div>
          <hr style="margin:16px 0; border-color:var(--border);">
          <div style="font-size:13px; color:var(--text-dim);">
            <strong>${L ? 'Skupaj:' : 'Total:'}</strong> ${stats.charsWithSpaces} ${L ? 'znakov (s presledki)' : 'chars (with spaces)'}, ${stats.charsNoSpaces} ${L ? 'brez presledkov' : 'no spaces'}, ${stats.words} ${L ? 'besed' : 'words'}, ${stats.lines} ${L ? 'vrstic' : 'lines'}
          </div>
        `;

    resultsDiv.innerHTML = html;
  }

  input.addEventListener('input', update);
  container.querySelector('#pc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#pc-copy').addEventListener('click', () => {
    const text = input.value;
    const stats = getCountStats(text);
    let summary = `${L ? 'Povzetek dolžin' : 'Length Summary'}:\n`;
    platforms.forEach(p => {
      const status = getStatus(stats.charsWithSpaces, p.limit);
      summary += `${p.name}: ${stats.charsWithSpaces}/${p.limit} (${status.label})\n`;
    });
    summary += `\n${L ? 'Skupaj' : 'Total'}: ${stats.charsWithSpaces} ${L ? 'znakov' : 'chars'}, ${stats.words} ${L ? 'besed' : 'words'}`;
    copyText(summary, container.querySelector('#pc-copy'));
  });
  update();
}

function renderReadabilityAnalyzer(container) {
  const L = currentLang === 'sl';

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Jezik besedila:' : 'Text language:'}
        <select id="ra-lang">
          <option value="sl">${L ? 'Slovenščina' : 'Slovenian'}</option>
          <option value="en">${L ? 'Angleščina' : 'English'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="ra-highlight" checked> ${L ? 'Označi dolge stavke' : 'Highlight long sentences'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ra-input">${getI('ui_input')}</label>
        <textarea id="ra-input" placeholder="${L ? 'Vnesite besedilo za analizo berljivosti...' : 'Enter text for readability analysis...'}" style="min-height:220px;">${L ? 'Besedomat je sodobno orodje za analizo in urejanje besedil. Ponuja veliko funkcij, ki so enostavne za uporabo. Vse deluje lokalno v brskalniku, brez pošiljanja podatkov na strežnik. To pomeni, da so vaši podatki varni in zasebni.' : 'Besedomat is a modern tool for text analysis and editing. It offers many features that are easy to use. Everything runs locally in the browser, without sending data to a server. This means your data is safe and private.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ra-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultati analize' : 'Analysis Results'}</label>
        <div id="ra-results" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:220px; overflow:auto;"></div>
        <div id="ra-highlighted" style="display:none; margin-top:12px; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:150px; overflow:auto; font-size:13.5px; line-height:1.7;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ra-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj poročilo' : 'Copy Report'}</span></button>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#ra-input');
  const langSel = container.querySelector('#ra-lang');
  const highlightCheck = container.querySelector('#ra-highlight');
  const resultsDiv = container.querySelector('#ra-results');
  const highlightedDiv = container.querySelector('#ra-highlighted');

  function countSyllablesSL(word) {
    // Slovenian: count vowel groups
    return (word.match(/[aeiouAEIOUáéíóúàèìòùâêîôûäëïöü]/g) || []).length;
  }

  function countSyllablesEN(word) {
    // English: rough approximation
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    return (word.match(/[aeiouy]{1,2}/g) || []).length || 1;
  }

  function analyze() {
    const text = input.value.trim();
    const lang = langSel.value;
    const doHighlight = highlightCheck.checked;

    if (!text) {
      resultsDiv.innerHTML = `<div style="color:var(--text-dim); text-align:center; padding:40px;">${L ? 'Vnesite besedilo za analizo.' : 'Enter text to analyze.'}</div>`;
      highlightedDiv.style.display = 'none';
      return;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.match(/[a-zA-ZčšžČŠŽ]+/g) || [];
    const syllables = words.reduce(
      (sum, w) => sum + (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)),
      0
    );

    const numSentences = sentences.length || 1;
    const numWords = words.length || 1;
    const numSyllables = syllables || numWords;

    // Flesch Reading Ease
    let flesch;
    if (lang === 'sl') {
      flesch = 206.835 - 1.015 * (numWords / numSentences) - 84.6 * (numSyllables / numWords);
    } else {
      flesch = 206.835 - 1.015 * (numWords / numSentences) - 84.6 * (numSyllables / numWords);
    }
    flesch = Math.max(0, Math.min(100, flesch));

    // Flesch-Kincaid Grade Level
    const fkGrade = 0.39 * (numWords / numSentences) + 11.8 * (numSyllables / numWords) - 15.59;

    // Gunning Fog
    const complexWords = words.filter(
      w => (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)) >= 3
    ).length;
    const fog = 0.4 * (numWords / numSentences + 100 * (complexWords / numWords));

    // SMOG
    const smog = 1.043 * Math.sqrt(complexWords * (30 / numSentences)) + 3.1291;

    // Avg words per sentence
    const avgWordsPerSentence = (numWords / numSentences).toFixed(1);
    // Avg syllables per word
    const avgSyllablesPerWord = (numSyllables / numWords).toFixed(2);

    // Reading time
    const wpm = lang === 'sl' ? 200 : 238;
    const readMins = Math.max(1, Math.ceil(numWords / wpm));
    const speakMins = Math.max(1, Math.ceil(numWords / 150));

    // Difficulty label
    let difficulty = '';
    if (flesch >= 90) difficulty = L ? 'Zelo enostavno' : 'Very Easy';
    else if (flesch >= 80) difficulty = L ? 'Enostavno' : 'Easy';
    else if (flesch >= 70) difficulty = L ? 'Precej enostavno' : 'Fairly Easy';
    else if (flesch >= 60) difficulty = L ? 'Standardno' : 'Standard';
    else if (flesch >= 50) difficulty = L ? 'Precej težavno' : 'Fairly Difficult';
    else if (flesch >= 30) difficulty = L ? 'Težavno' : 'Difficult';
    else difficulty = L ? 'Zelo težavno' : 'Very Difficult';

    // Highlight long sentences
    let highlightedHtml = '';
    if (doHighlight) {
      const parts = text.split(/([.!?]+)/);
      highlightedHtml = parts
        .map(part => {
          const trimmed = part.trim();
          const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
          if (wordCount > 25) {
            return `<mark style="background:rgba(239,68,68,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
          } else if (wordCount >= 20) {
            return `<mark style="background:rgba(245,158,11,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
          }
          return escapeHtml(part);
        })
        .join('');
      highlightedDiv.style.display = 'block';
      highlightedDiv.innerHTML = `<strong>${L ? 'Označeni stavki:' : 'Highlighted sentences:'}</strong> (${L ? 'rdeče >25 besed, rumene 20-25 besed' : 'red >25 words, yellow 20-25 words'})<br><br>${highlightedHtml}`;
    } else {
      highlightedDiv.style.display = 'none';
    }

    let report = '';
    resultsDiv.innerHTML = `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
            <div class="stat-box" style="background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15)); border-color:var(--violet);">
              <div class="num" style="color:var(--violet);">${flesch.toFixed(1)}</div>
              <div class="lbl">${L ? 'Flesch Reading Ease' : 'Flesch Reading Ease'}</div>
            </div>
            <div class="stat-box" style="background:linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15)); border-color:#22c55e;">
              <div class="num" style="color:#22c55e;">${difficulty}</div>
              <div class="lbl">${L ? 'Stopnja zahtevnosti' : 'Difficulty Level'}</div>
            </div>
            <div class="stat-box">
              <div class="num">${fkGrade.toFixed(1)}</div>
              <div class="lbl">${L ? 'Flesch-Kincaid Grade' : 'Flesch-Kincaid Grade'}</div>
            </div>
            <div class="stat-box">
              <div class="num">${fog.toFixed(1)}</div>
              <div class="lbl">Gunning Fog Index</div>
            </div>
            <div class="stat-box">
              <div class="num">${smog.toFixed(1)}</div>
              <div class="lbl">SMOG Index</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px; font-size:13px; color:var(--text-dim);">
            <div><strong>${numWords}</strong> ${L ? 'besed' : 'words'}</div>
            <div><strong>${numSentences}</strong> ${L ? 'stavkov' : 'sentences'}</div>
            <div><strong>${numSyllables}</strong> ${L ? 'skladov' : 'syllables'}</div>
            <div><strong>${avgWordsPerSentence}</strong> ${L ? 'besed/stavek' : 'words/sent'}</div>
            <div><strong>${avgSyllablesPerWord}</strong> ${L ? 'skladov/besedo' : 'syll/word'}</div>
            <div><strong>${complexWords}</strong> ${L ? 'kompleksnih besed (≥3 skladi)' : 'complex words (≥3 syll)'}</div>
            <div><strong>${readMins} min</strong> ${L ? 'branje' : 'reading'}</div>
            <div><strong>${speakMins} min</strong> ${L ? 'govor' : 'speaking'}</div>
          </div>
          <div style="margin-top:16px; padding:12px; background:var(--bg-alt); border-radius:8px; font-size:12px; color:var(--text-dim);">
            ${L ? 'Opomba: Formule so prilagojene za slovenščino/angleščino. Rezultati so usmerjeni.' : 'Note: Formulas adapted for Slovenian/English. Results are approximate.'}
          </div>
        `;

    report = `${L ? 'Analiza berljivosti' : 'Readability Analysis'}\n${L ? 'Jezik' : 'Language'}: ${lang.toUpperCase()}\n\n${L ? 'Flesch Reading Ease' : 'Flesch Reading Ease'}: ${flesch.toFixed(1)} (${difficulty})\n${L ? 'Flesch-Kincaid Grade' : 'Flesch-Kincaid Grade'}: ${fkGrade.toFixed(1)}\nGunning Fog Index: ${fog.toFixed(1)}\nSMOG Index: ${smog.toFixed(1)}\n\n${L ? 'Besede' : 'Words'}: ${numWords}\n${L ? 'Stavki' : 'Sentences'}: ${numSentences}\n${L ? 'Sklandi' : 'Syllables'}: ${numSyllables}\n${L ? 'Povprečno besed na stavek' : 'Avg words/sentence'}: ${avgWordsPerSentence}\n${L ? 'Povprečno skladov na besedo' : 'Avg syllables/word'}: ${avgSyllablesPerWord}\n${L ? 'Kompleksne besede (≥3 skladi)' : 'Complex words (≥3 syll)'}: ${complexWords}\n\n${L ? 'Čas branja' : 'Reading time'}: ${readMins} min\n${L ? 'Čas govora' : 'Speaking time'}: ${speakMins} min`;

    container.querySelector('#ra-copy').onclick = () =>
      copyText(report, container.querySelector('#ra-copy'));
  }

  input.addEventListener('input', analyze);
  langSel.addEventListener('change', analyze);
  highlightCheck.addEventListener('change', analyze);
  container.querySelector('#ra-clear').addEventListener('click', () => {
    input.value = '';
    analyze();
    input.focus();
  });
  analyze();
}

function renderTextToEmoji(container) {
  const L = currentLang === 'sl';

  // Emoji dictionary for SL and EN
  const emojiDict = {
    sl: {
      ljubezen: '❤️',
      ljubav: '❤️',
      srce: '❤️',
      kava: '☕',
      kafe: '☕',
      espresso: '☕',
      sonce: '☀️',
      sončno: '☀️',
      zrak: '☀️',
      luna: '🌙',
      noč: '🌙',
      noč: '🌙',
      zvezda: '⭐',
      zvezdice: '✨',
      dež: '🌧️',
      deževje: '🌧️',
      kiša: '🌧️',
      sneg: '❄️',
      snežek: '❄️',
      zima: '❄️',
      drevo: '🌳',
      gozd: '🌲',
      narava: '🌿',
      cvet: '🌸',
      cvetje: '🌺',
      roža: '🌹',
      mačka: '🐱',
      mačke: '🐱',
      mačje: '🐱',
      pes: '🐶',
      psa: '🐶',
      kuža: '🐶',
      ptica: '🐦',
      ptice: '🐦',
      riba: '🐟',
      ribe: '🐟',
      konj: '🐴',
      konji: '🐴',
      krava: '🐄',
      ovca: '🐑',
      prašič: '🐷',
      hiša: '🏠',
      dom: '🏠',
      stanovanje: '🏠',
      avto: '🚗',
      avtomobil: '🚗',
      kolo: '🚲',
      vlak: '🚂',
      avtobus: '🚌',
      letalo: '✈️',
      ladja: '⛵',
      brod: '🚢',
      denar: '💰',
      evri: '💶',
      dolar: '💵',
      zlato: '💰',
      čas: '⏰',
      ura: '🕐',
      minuta: '⏱️',
      sekunda: '⏱️',
      dan: '📅',
      teden: '📅',
      mesec: '📅',
      leto: '📅',
      hrana: '🍔',
      jed: '🍽️',
      kosilo: '🍽️',
      večerja: '🍽️',
      pica: '🍕',
      sendvič: '🥪',
      slaščica: '🍰',
      torta: '🎂',
      jabolko: '🍎',
      banana: '🍌',
      jagoda: '🍓',
      grozdje: '🍇',
      pivo: '🍺',
      vino: '🍷',
      koktajl: '🍹',
      voda: '💧',
      veselje: '😊',
      sreča: '😄',
      nasmeh: '😊',
      smijeh: '😂',
      žalost: '😢',
      tužnost: '😢',
      solze: '😭',
      gnev: '😡',
      jeza: '😠',
      razjezen: '😡',
      strah: '😱',
      plašiti: '😨',
      strašen: '😱',
      presenečenje: '😲',
      šok: '😱',
      ljubosumje: '😒',
      zavist: '😒',
      spanje: '😴',
      spanje: '😴',
      zaspati: '😴',
      bolan: '🤒',
      bolečina: '🤕',
      zdravje: '🏥',
      bolnišnica: '🏥',
      zdravnik: '👨‍⚕️',
      lekar: '👩‍⚕️',
      šola: '🏫',
      učitelji: '👨‍🏫',
      učiteljica: '👩‍🏫',
      učenje: '📚',
      knjiga: '📖',
      knjige: '📚',
      branje: '📖',
      pisanje: '✍️',
      pisati: '✏️',
      pisalo: '✏️',
      glasba: '🎵',
      pesem: '🎵',
      pevaj: '🎤',
      koncert: '🎤',
      film: '🎬',
      kino: '🎬',
      serija: '📺',
      tv: '📺',
      igra: '🎮',
      gamer: '🎮',
      videoigra: '🎮',
      šport: '⚽',
      nogomet: '⚽',
      košarka: '🏀',
      tenis: '🎾',
      tekmovanje: '🏆',
      zmaga: '🏆',
      medalja: '🥇',
      poklon: '🎁',
      darilo: '🎁',
      'rojstni dan': '🎂',
      rojstni: '🎂',
      praznik: '🎉',
      slavje: '🎊',
      'novo leto': '🎆',
      ljubljena: '💑',
      ljubljeni: '💑',
      partner: '💑',
      poroka: '💍',
      družina: '👨‍👩‍👧‍👦',
      otroci: '👶',
      sin: '👦',
      hčerka: '👧',
      mama: '👩',
      tata: '👨',
      babica: '👵',
      dedek: '👴',
      prijatelj: '👯',
      prijateljica: '👯',
      znanec: '🤝',
      pogovor: '💬',
      klepet: '💬',
      spor: '🗣️',
      telefon: '📞',
      klic: '📞',
      sms: '📨',
      sporočilo: '💌',
      email: '📧',
      pošta: '📮',
      paket: '📦',
      delo: '💼',
      služba: '💼',
      kariera: '📈',
      posao: '💼',
      srečanje: '🤝',
      seja: '📅',
      termin: '📅',
      projekt: '📁',
      naloga: '📋',
      rok: '⏰',
      oddaja: '📤',
      računalnik: '💻',
      laptop: '💻',
      mobilni: '📱',
      telefon: '📱',
      internet: '🌐',
      splet: '🌐',
      wifi: '📶',
      signal: '📶',
      kljukica: '✅',
      prav: '✅',
      narobe: '❌',
      napaka: '❌',
      vprašanje: '❓',
      odgovor: '💡',
      ideja: '💡',
      misel: '💭',
      opomba: '📝',
      zapis: '📝',
      seznam: '📋',
      nadaljevanje: '➡️',
      levo: '⬅️',
      desno: '➡️',
      gor: '⬆️',
      dol: '⬇️',
      iskanje: '🔍',
      najti: '🔍',
      skrit: '🕵️',
      tajnik: '🤫',
      ključ: '🔑',
      zaklenjeno: '🔒',
      odklenjeno: '🔓',
      varnost: '🛡️',
      zaščita: '🛡️',
      policija: '👮',
      gasilec: '🚒',
      bolnica: '🏥',
      rešitev: '💡',
      problem: '❓',
      izziv: '🏔️',
      plan: '📋',
      cilj: '🎯',
      uspeh: '✅',
      neuspeh: '❌',
      prihodnje: '🔮',
      preteklost: '🕰️',
      sedaj: '⏰',
      jutro: '🌅',
      poldne: '☀️',
      večer: '🌆',
      ponoč: '🌙',
      ponedeljek: '📅',
      torek: '📅',
      sreda: '📅',
      četrtek: '📅',
      petek: '📅',
      sobota: '📅',
      nedelja: '📅',
      januar: '❄️',
      februar: '❄️',
      marec: '🌱',
      april: '🌧️',
      maj: '🌸',
      junij: '☀️',
      julij: '☀️',
      avgust: '🌞',
      september: '🍂',
      oktober: '🎃',
      november: '🍂',
      december: '🎄',
    },
    en: {
      love: '❤️',
      heart: '❤️',
      hearts: '💕',
      coffee: '☕',
      cafe: '☕',
      espresso: '☕',
      sun: '☀️',
      sunny: '☀️',
      sunshine: '☀️',
      moon: '🌙',
      night: '🌙',
      dark: '🌙',
      star: '⭐',
      stars: '✨',
      sparkle: '✨',
      rain: '🌧️',
      rainy: '🌧️',
      storm: '⛈️',
      snow: '❄️',
      snowflake: '❄️',
      winter: '❄️',
      tree: '🌳',
      forest: '🌲',
      nature: '🌿',
      flower: '🌸',
      flowers: '🌺',
      rose: '🌹',
      cat: '🐱',
      cats: '🐱',
      kitten: '🐱',
      dog: '🐶',
      dogs: '🐶',
      puppy: '🐶',
      bird: '🐦',
      birds: '🐦',
      fish: '🐟',
      fishes: '🐟',
      horse: '🐴',
      horses: '🐴',
      cow: '🐄',
      sheep: '🐑',
      pig: '🐷',
      house: '🏠',
      home: '🏠',
      building: '🏢',
      car: '🚗',
      automobile: '🚗',
      bike: '🚲',
      train: '🚂',
      bus: '🚌',
      plane: '✈️',
      ship: '⛵',
      boat: '🚢',
      money: '💰',
      euro: '💶',
      dollar: '💵',
      gold: '💰',
      time: '⏰',
      hour: '🕐',
      minute: '⏱️',
      second: '⏱️',
      day: '📅',
      week: '📅',
      month: '📅',
      year: '📅',
      food: '🍔',
      meal: '🍽️',
      lunch: '🍽️',
      dinner: '🍽️',
      pizza: '🍕',
      sandwich: '🥪',
      cake: '🍰',
      dessert: '🍰',
      apple: '🍎',
      banana: '🍌',
      strawberry: '🍓',
      grapes: '🍇',
      beer: '🍺',
      wine: '🍷',
      cocktail: '🍹',
      water: '💧',
      happy: '😊',
      joy: '😄',
      smile: '😊',
      laugh: '😂',
      sad: '😢',
      sadness: '😢',
      tears: '😭',
      cry: '😭',
      angry: '😡',
      anger: '😠',
      mad: '😡',
      furious: '😡',
      fear: '😱',
      scared: '😨',
      afraid: '😱',
      terrified: '😱',
      surprise: '😲',
      shock: '😱',
      amazed: '😲',
      jealous: '😒',
      envy: '😒',
      sleep: '😴',
      sleepy: '😴',
      tired: '😴',
      sick: '🤒',
      pain: '🤕',
      health: '🏥',
      ill: '🤒',
      hospital: '🏥',
      doctor: '👨‍⚕️',
      nurse: '👩‍⚕️',
      school: '🏫',
      teacher: '👨‍🏫',
      learning: '📚',
      study: '📖',
      book: '📖',
      books: '📚',
      reading: '📖',
      writing: '✍️',
      write: '✏️',
      pen: '✏️',
      pencil: '✏️',
      music: '🎵',
      song: '🎵',
      sing: '🎤',
      concert: '🎤',
      movie: '🎬',
      cinema: '🎬',
      series: '📺',
      tv: '📺',
      game: '🎮',
      gamer: '🎮',
      videogame: '🎮',
      sport: '⚽',
      football: '⚽',
      soccer: '⚽',
      basketball: '🏀',
      tennis: '🎾',
      competition: '🏆',
      win: '🏆',
      victory: '🏆',
      medal: '🥇',
      gift: '🎁',
      present: '🎁',
      birthday: '🎂',
      party: '🎉',
      holiday: '🎉',
      celebration: '🎊',
      'new year': '🎆',
      couple: '💑',
      partner: '💑',
      marriage: '💍',
      wedding: '💍',
      family: '👨‍👩‍👧‍👦',
      children: '👶',
      son: '👦',
      daughter: '👧',
      mom: '👩',
      mother: '👩',
      dad: '👨',
      father: '👨',
      grandma: '👵',
      grandpa: '👴',
      friend: '👯',
      friends: '👯',
      acquaintance: '🤝',
      talk: '💬',
      chat: '💬',
      argument: '🗣️',
      discussion: '💬',
      phone: '📞',
      call: '📞',
      sms: '📨',
      message: '💌',
      email: '📧',
      mail: '📮',
      package: '📦',
      work: '💼',
      job: '💼',
      career: '📈',
      office: '🏢',
      meeting: '🤝',
      appointment: '📅',
      schedule: '📅',
      project: '📁',
      task: '📋',
      deadline: '⏰',
      submit: '📤',
      computer: '💻',
      laptop: '💻',
      mobile: '📱',
      phone: '📱',
      internet: '🌐',
      web: '🌐',
      wifi: '📶',
      signal: '📶',
      check: '✅',
      yes: '✅',
      correct: '✅',
      wrong: '❌',
      error: '❌',
      question: '❓',
      answer: '💡',
      idea: '💡',
      thought: '💭',
      note: '📝',
      memo: '📝',
      list: '📋',
      next: '➡️',
      left: '⬅️',
      right: '➡️',
      up: '⬆️',
      down: '⬇️',
      search: '🔍',
      find: '🔍',
      hidden: '🕵️',
      secret: '🤫',
      key: '🔑',
      locked: '🔒',
      unlocked: '🔓',
      security: '🛡️',
      protection: '🛡️',
      police: '👮',
      firefighter: '🚒',
      hospital: '🏥',
      solution: '💡',
      problem: '❓',
      challenge: '🏔️',
      plan: '📋',
      goal: '🎯',
      success: '✅',
      failure: '❌',
      future: '🔮',
      past: '🕰️',
      now: '⏰',
      morning: '🌅',
      noon: '☀️',
      evening: '🌆',
      midnight: '🌙',
      monday: '📅',
      tuesday: '📅',
      wednesday: '📅',
      thursday: '📅',
      friday: '📅',
      saturday: '📅',
      sunday: '📅',
      january: '❄️',
      february: '❄️',
      march: '🌱',
      april: '🌧️',
      may: '🌸',
      june: '☀️',
      july: '☀️',
      august: '🌞',
      september: '🍂',
      october: '🎃',
      november: '🍂',
      december: '🎄',
    },
  };

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način izhoda:' : 'Output mode:'}
        <select id="te-mode">
          <option value="replace">${L ? 'Zamenjaj besede z emoji' : 'Replace words with emoji'}</option>
          <option value="append">${L ? 'Dodaj emoji za besedo' : 'Append emoji to word'}</option>
          <option value="above">${L ? 'Emoji nad besedo (ruby)' : 'Emoji above word (ruby)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="te-case" checked> ${L ? 'Neupoštevaj velikost črk' : 'Ignore case'}</label>
      <label><input type="checkbox" id="te-unknown" checked> ${L ? 'Ohranjaj neprepoznane besede' : 'Keep unknown words'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="te-input">${getI('ui_input')}</label>
        <textarea id="te-input" placeholder="${L ? 'Vnesite besedilo (npr. \"ljubezen kava sonce\")...' : 'Enter text (e.g. \"love coffee sun\")...'}" style="min-height:160px;">${L ? 'ljubezen kava sonce drevo cvet' : 'love coffee sun tree flower'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="te-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="te-output">${getI('ui_output')}</label>
        <div id="te-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:160px; overflow:auto; line-height:2; font-size:16px;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="te-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
    <div style="margin-top:12px; padding:12px; background:var(--card); border:1px solid var(--border); border-radius:12px; font-size:12px; color:var(--text-dim);">
      <strong>${L ? 'Primeri:' : 'Examples:'}</strong><br>
      ${L ? '"ljubezen kava sonce" → "❤️ ☕ ☀️"' : '"love coffee sun" → "❤️ ☕ ☀️"'}<br>
      ${L ? '"veselje hrana prijatelji" → "😊 🍔 👯"' : '"happy food friends" → "😊 🍔 👯"'}
    </div>
  `;

  const input = container.querySelector('#te-input');
  const outputWrap = container.querySelector('#te-output-wrap');
  const modeSel = container.querySelector('#te-mode');
  const caseCheck = container.querySelector('#te-case');
  const unknownCheck = container.querySelector('#te-unknown');

  function update() {
    const text = input.value;
    const mode = modeSel.value;
    const ignoreCase = caseCheck.checked;
    const keepUnknown = unknownCheck.checked;
    const dict = emojiDict[currentLang] || emojiDict.en;

    // Tokenize: split by word boundaries, keeping punctuation
    const tokens = text.split(/(\s+|[.,!?;:()[\]{}"'])/);

    let result = '';
    for (const token of tokens) {
      if (!token || /^[\s.,!?;:()[\]{}"']+$/.test(token)) {
        result += token;
        continue;
      }

      const cleanToken = token.replace(/^[.,!?;:()[\]{}"']+|[.,!?;:()[\]{}"']+$/g, '');
      const punctBefore = token.match(/^[.,!?;:()[\]{}"']+/)?.[0] || '';
      const punctAfter = token.match(/[.,!?;:()[\]{}"']+$/)?.[0] || '';
      const lookupKey = ignoreCase ? cleanToken.toLowerCase() : cleanToken;

      const emoji = dict[lookupKey];

      if (emoji) {
        if (mode === 'replace') {
          result += punctBefore + emoji + punctAfter;
        } else if (mode === 'append') {
          result += punctBefore + cleanToken + ' ' + emoji + punctAfter;
        } else if (mode === 'above') {
          result += punctBefore + `<ruby>${cleanToken}<rt>${emoji}</rt></ruby>` + punctAfter;
        }
      } else if (keepUnknown) {
        result += token;
      }
      // else: skip unknown words entirely
    }

    outputWrap.innerHTML =
      result ||
      (L
        ? '<span style="color:var(--text-dim);">Ni ujemanj. Poskusite druge besede.</span>'
        : '<span style="color:var(--text-dim);">No matches. Try other words.</span>');
  }

  [input, modeSel, caseCheck, unknownCheck].forEach(el => el.addEventListener('input', update));
  container.querySelector('#te-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#te-copy').addEventListener('click', () => {
    copyText(outputWrap.innerText || outputWrap.textContent, container.querySelector('#te-copy'));
  });
  update();
}

/* ============ ASCII ART FONTS (Standard 5x5 block) ============ */
const ASCII_FONTS = {
  A: [' ### ', '#   #', '#####', '#   #', '#   #'],
  B: ['#### ', '#   #', '#### ', '#   #', '#### '],
  C: [' ####', '#    ', '#    ', '#    ', ' ####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '###  ', '#    ', '#####'],
  F: ['#####', '#    ', '###  ', '#    ', '#    '],
  G: [' ####', '#    ', '#  ##', '#   #', ' ### '],
  H: ['#   #', '#   #', '#####', '#   #', '#   #'],
  I: [' ###', '  # ', '  # ', '  # ', ' ###'],
  J: ['  ###', '   # ', '   # ', '#  # ', ' ##  '],
  K: ['#   #', '#  # ', '###  ', '#  # ', '#   #'],
  L: ['#    ', '#    ', '#    ', '#    ', '#####'],
  M: ['#   #', '## ##', '# # #', '#   #', '#   #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  O: [' ### ', '#   #', '#   #', '#   #', ' ### '],
  P: ['#### ', '#   #', '#### ', '#    ', '#    '],
  Q: [' ### ', '#   #', '# # #', '#  # ', ' ## #'],
  R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
  S: [' ####', '#    ', ' ### ', '    #', '#### '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', ' ### '],
  V: ['#   #', '#   #', '#   #', ' # # ', '  #  '],
  W: ['#   #', '#   #', '# # #', '## ##', '#   #'],
  X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
  Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
  '0': [' ### ', '#   #', '# # #', '#  ##', ' ### '],
  '1': ['  #  ', ' ##  ', '  #  ', '  #  ', ' ### '],
  '2': ['###  ', '   # ', ' ##  ', '#    ', '#####'],
  '3': ['#### ', '   # ', ' ##  ', '   # ', '#### '],
  '4': ['#   #', '#   #', '#####', '    #', '    #'],
  '5': ['#####', '#    ', '#### ', '    #', '#### '],
  '6': [' ####', '#    ', '#### ', '#   #', ' ### '],
  '7': ['#####', '   # ', '  #  ', ' #   ', '#    '],
  '8': [' ### ', '#   #', ' ### ', '#   #', ' ### '],
  '9': [' ### ', '#   #', ' ####', '    #', ' ####'],
  ' ': ['     ', '     ', '     ', '     ', '     '],
  '.': ['     ', '     ', '     ', '     ', '  #  '],
  ',': ['     ', '     ', '     ', '  #  ', ' #   '],
  '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  '],
  '?': [' ### ', '#   #', '  ## ', '     ', '  #  '],
  ':': ['     ', '  #  ', '     ', '  #  ', '     '],
  ';': ['     ', '  #  ', '     ', '  #  ', ' #   '],
  '-': ['     ', '     ', ' ### ', '     ', '     '],
  _: ['     ', '     ', '     ', '     ', '#####'],
  '+': ['     ', '  #  ', ' ### ', '  #  ', '     '],
  '=': ['     ', ' ### ', '     ', ' ### ', '     '],
  '*': ['     ', '# #  ', ' # # ', '# #  ', '     '],
  '/': ['    #', '   # ', '  #  ', ' #   ', '#    '],
  '\\': ['#    ', ' #   ', '  #  ', '   # ', '    #'],
  '(': ['  ## ', ' #   ', ' #   ', ' #   ', '  ## '],
  ')': [' ##  ', '   # ', '   # ', '   # ', ' ##  '],
  '#': [' ### ', '# # #', ' ### ', '# # #', ' ### '],
  '@': [' ### ', '#   #', '# ###', '#    ', ' ### '],
  '&': [' #   ', '# #  ', ' # # ', '# #  ', ' # # '],
  "'": ['  #  ', '  #  ', '     ', '     ', '     '],
  '"': ['# #  ', '# #  ', '     ', '     ', '     '],
};

/* ============ ASCII ART GENERATOR (FIGlet-style) ============ */

function renderSplitJoin(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Razdeli po:' : 'Split by:'}
        <input type="text" id="sj-split" placeholder="\n" value="\n" style="width:70px;">
      </label>
      <label>${L ? 'Združi z:' : 'Join with:'}
        <input type="text" id="sj-join" placeholder=", " value=", " style="width:70px;">
      </label>
      <label><input type="checkbox" id="sj-trim" checked> ${L ? 'Obreži presledke (Trim)' : 'Trim elements'}</label>
      <label><input type="checkbox" id="sj-dropempty" checked> ${L ? 'Odstrani prazne' : 'Drop empty'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="sj-input">${getI('ui_input')}</label>
        <textarea id="sj-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="sj-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="sj-output">${getI('ui_output')}</label>
        <textarea id="sj-output" readonly placeholder="${L ? 'Združen rezultat...' : 'Joined result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="sj-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#sj-input');
  const splitEl = container.querySelector('#sj-split');
  const joinEl = container.querySelector('#sj-join');
  const trimCheck = container.querySelector('#sj-trim');
  const dropEmpty = container.querySelector('#sj-dropempty');
  const output = container.querySelector('#sj-output');

  function parseDelim(d) {
    return d.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
  }

  function update() {
    const sDelim = parseDelim(splitEl.value);
    const jDelim = parseDelim(joinEl.value);
    let items = input.value.split(sDelim);
    if (trimCheck.checked) items = items.map(x => x.trim());
    if (dropEmpty.checked) items = items.filter(x => x.length > 0);
    output.value = items.join(jDelim);
  }
  [input, splitEl, joinEl, trimCheck, dropEmpty].forEach(el =>
    el.addEventListener('input', update)
  );
  container.querySelector('#sj-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#sj-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#sj-copy'));
  });
}
// DEPRECATED: duplicat renderCompareText – vir resnice je index.html:8949 (renderCompareText). Pred vite migracijo sinhroniziraj ročno ali izbriši duplicat.

function renderCompareText(container) {
  const L = currentLang === 'sl';

  const sampleA = L
    ? `Pogodba o sodelovanju\n\n1. člen (Predmet)\nNaročnik in izvajalec se dogovorita za izdelavo spletne strani.\nIzvajalec se zavezuje, da bo projekt zaključil v roku 30 dni.\nCena storitve znaša 1.500 EUR brez DDV.\n\n2. člen (Plačilo)\nPlačilo se izvede v dveh obrokih po potrditvi faze.`
    : `Cooperation Agreement\n\nArticle 1 (Subject)\nThe client and provider agree on the development of a website.\nThe provider undertakes to complete the project within 30 days.\nThe total service price is 1,500 EUR excluding VAT.\n\nArticle 2 (Payment)\nPayment shall be made in two equal installments upon milestone confirmation.`;

  const sampleB = L
    ? `Pogodba o poslovnem sodelovanju\n\n1. člen (Predmet)\nNaročnik in izvajalec se dogovorita za celovito izdelavo spletne strani ter mobilne aplikacije.\nIzvajalec se zavezuje, da bo projekt zaključil v roku 45 dni.\nCena storitve znaša 2.200 EUR brez DDV.\n\n2. člen (Plačilo)\nPlačilo se izvede v treh obrokih po pregledu posamezne faze.\n\n3. člen (Garancija)\nGarancijska doba za odpravo napak je 12 mesecev.`
    : `Business Cooperation Agreement\n\nArticle 1 (Subject)\nThe client and provider agree on the comprehensive development of a website and mobile app.\nThe provider undertakes to complete the project within 45 days.\nThe total service price is 2,200 EUR excluding VAT.\n\nArticle 2 (Payment)\nPayment shall be made in three installments upon milestone review.\n\nArticle 3 (Warranty)\nThe warranty period for bug fixes is 12 months.`;

  container.innerHTML = `
    <!-- TOP CONTROLS & OPTIONS BAR -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--border);">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px;">
          ${L ? 'Nivo primerjave:' : 'Diff Level / Mode:'}
          <select id="cmp-algo" style="padding:5px 8px; font-size:13px; border-radius:8px;">
            <option value="line_word" selected>${L ? 'Vrstice + besede (VS Code slog / Koda)' : 'Lines + Words (VS Code style)'}</option>
            <option value="chars">${L ? 'Po posameznih črkah in znakih (Zatipki / Kode)' : 'Char-by-Char (Typos / Characters)'}</option>
            <option value="words">${L ? 'Zvezno po besedah (Lektorski slog / Članki)' : 'Word-by-Word (Prose / Articles)'}</option>
            <option value="lines_only">${L ? 'Samo cele vrstice (Hitri pregled)' : 'Lines Only'}</option>
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px;">
          ${L ? 'Prikaz:' : 'View Mode:'}
          <select id="cmp-view" style="padding:5px 8px; font-size:13px; border-radius:8px;">
            <option value="split" selected>${L ? 'Bočni prikaz (Side-by-Side)' : 'Side-by-Side (Split)'}</option>
            <option value="unified">${L ? 'Združeni prikaz (Unified Diff)' : 'Unified Diff'}</option>
            <option value="prose">${L ? 'Zvezno besedilo (Visual Prose)' : 'Visual Prose'}</option>
            <option value="merged">${L ? 'Končno besedilo B' : 'Clean Output B'}</option>
          </select>
        </label>
      </div>

      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-show-same" checked> ${L ? 'Pokaži nespremenjene' : 'Show unchanged'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-case"> ${L ? 'Ignoriraj velike/male' : 'Ignore case'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-ws"> ${L ? 'Ignoriraj presledke' : 'Ignore whitespace'}</label>
      </div>
    </div>

    <!-- 2-COLUMN INPUTS -->
    <div class="tool-workspace-2col" style="margin-bottom:16px;">
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-a" style="margin:0; font-weight:600; color:#ef4444;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original Text (A)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <label class="btn-sm" for="cmp-file-a" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi A' : 'Import A'}</label>
            <input type="file" id="cmp-file-a" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-sample" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_edit} ${L ? 'Primer' : 'Sample'}</button>
            <button id="cmp-clear-a" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-a" rows="6" placeholder="${L ? 'Prilepite ali vnesite prvotno besedilo (A)...' : 'Paste original text (A)...'}" style="min-height:140px; font-family:monospace; font-size:13px;">${sampleA}</textarea>
        <div id="cmp-meta-a" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>

      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-b" style="margin:0; font-weight:600; color:#22c55e;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified Text (B)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="cmp-swap" class="btn-sm" style="padding:2px 8px; font-size:11px;" title="Swap A and B">${SVG_ICONS.mi_swap} ${L ? 'Zamenjaj A ↔ B' : 'Swap A ↔ B'}</button>
            <label class="btn-sm" for="cmp-file-b" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi B' : 'Import B'}</label>
            <input type="file" id="cmp-file-b" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-clear-b" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-b" rows="6" placeholder="${L ? 'Prilepite ali vnesite spremenjeno besedilo (B)...' : 'Paste modified text (B)...'}" style="min-height:140px; font-family:monospace; font-size:13px;">${sampleB}</textarea>
        <div id="cmp-meta-b" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>
    </div>

    <!-- STATS & BADGES ROW -->
    <div id="cmp-stats-bar" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;"></div>

    <!-- VISUAL DIFF VIEWER DISPLAY -->
    <div id="cmp-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; min-height:260px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px; line-height:1.6;">
    </div>

    <!-- ACTION BUTTONS -->
    <div class="modal-actions" style="margin-top:14px; gap:8px; flex-wrap:wrap; justify-content:flex-start;">
      <button class="btn-sm primary" id="cmp-copy-unified">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj Unified Patch (.diff)' : 'Copy Unified Patch (.diff)'}</button>
      <button class="btn-sm" id="cmp-copy-b">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj končno besedilo B' : 'Copy Final Text B'}</button>
      <button class="btn-sm" id="cmp-copy-html">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj barvni HTML' : 'Copy Formatted HTML'}</button>
    </div>
  `;

  const inputA = container.querySelector('#cmp-input-a');
  const inputB = container.querySelector('#cmp-input-b');
  const fileA = container.querySelector('#cmp-file-a');
  const fileB = container.querySelector('#cmp-file-b');
  const algoSel = container.querySelector('#cmp-algo');
  const viewSel = container.querySelector('#cmp-view');
  const showSameCheck = container.querySelector('#cmp-show-same');
  const ignoreCaseCheck = container.querySelector('#cmp-ignore-case');
  const ignoreWsCheck = container.querySelector('#cmp-ignore-ws');
  const statsBar = container.querySelector('#cmp-stats-bar');
  const outputWrap = container.querySelector('#cmp-output-wrap');
  const metaA = container.querySelector('#cmp-meta-a');
  const metaB = container.querySelector('#cmp-meta-b');

  function lcs(a, b) {
    const m = a.length,
      n = b.length;
    if (m === 0 && n === 0) return [];
    if (m === 0) return b.map(val => ({ type: 'insert', val }));
    if (n === 0) return a.map(val => ({ type: 'delete', val }));

    // Memory cap for large inputs
    if (m * n > 4000000) {
      // Fast linear matching fallback
      const ops = [];
      let i = 0,
        j = 0;
      while (i < m || j < n) {
        if (i < m && j < n && a[i] === b[j]) {
          ops.push({ type: 'equal', val: a[i] });
          i++;
          j++;
        } else if (i < m && (j >= n || a[i] !== b[j])) {
          ops.push({ type: 'delete', val: a[i] });
          i++;
        } else if (j < n) {
          ops.push({ type: 'insert', val: b[j] });
          j++;
        }
      }
      return ops;
    }

    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const ops = [];
    let i = m,
      j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        ops.push({ type: 'equal', val: a[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.push({ type: 'insert', val: b[j - 1] });
        j--;
      } else {
        ops.push({ type: 'delete', val: a[i - 1] });
        i--;
      }
    }
    return ops.reverse();
  }

  function diffWordsPair(strA, strB, ignoreCase, ignoreWs) {
    const tokensA = strA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
    const tokensB = strB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);

    function norm(t) {
      let s = t;
      if (ignoreWs) s = s.replace(/\s+/g, ' ');
      if (ignoreCase) s = s.toLowerCase();
      return s;
    }

    const normA = tokensA.map(norm);
    const normB = tokensB.map(norm);
    const ops = lcs(normA, normB);

    let htmlA = '',
      htmlB = '';
    let ptrA = 0,
      ptrB = 0;

    ops.forEach(op => {
      if (op.type === 'equal') {
        const originalValA = tokensA[ptrA++] || '';
        const originalValB = tokensB[ptrB++] || '';
        htmlA += escapeHtml(originalValA);
        htmlB += escapeHtml(originalValB);
      } else if (op.type === 'delete') {
        const val = tokensA[ptrA++] || '';
        htmlA += `<mark style="background:rgba(239,68,68,0.35); color:#dc2626; border-radius:3px; padding:1px 2px; text-decoration:line-through;">${escapeHtml(val)}</mark>`;
      } else if (op.type === 'insert') {
        const val = tokensB[ptrB++] || '';
        htmlB += `<mark style="background:rgba(34,197,94,0.35); color:#16a34a; border-radius:3px; padding:1px 2px;">${escapeHtml(val)}</mark>`;
      }
    });

    return { htmlA, htmlB };
  }

  function diffCharsPair(strA, strB, ignoreCase) {
    const charsA = [...strA];
    const charsB = [...strB];
    const normA = ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA;
    const normB = ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB;
    const ops = lcs(normA, normB);

    let htmlA = '',
      htmlB = '';
    let ptrA = 0,
      ptrB = 0;

    ops.forEach(op => {
      if (op.type === 'equal') {
        htmlA += escapeHtml(charsA[ptrA++]);
        htmlB += escapeHtml(charsB[ptrB++]);
      } else if (op.type === 'delete') {
        htmlA += `<mark style="background:rgba(239,68,68,0.4); color:#dc2626; border-radius:2px; padding:0 1px; text-decoration:line-through;">${escapeHtml(charsA[ptrA++])}</mark>`;
      } else if (op.type === 'insert') {
        htmlB += `<mark style="background:rgba(34,197,94,0.4); color:#16a34a; border-radius:2px; padding:0 1px;">${escapeHtml(charsB[ptrB++])}</mark>`;
      }
    });

    return { htmlA, htmlB };
  }

  function update() {
    const rawA = inputA.value;
    const rawB = inputB.value;
    const algo = algoSel.value;
    const view = viewSel.value;
    const showSame = showSameCheck.checked;
    const ignoreCase = ignoreCaseCheck.checked;
    const ignoreWs = ignoreWsCheck.checked;

    // Meta counts
    const wordsCountA = (rawA.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
    const wordsCountB = (rawB.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
    const linesCountA = rawA ? rawA.split(/\r?\n/).length : 0;
    const linesCountB = rawB ? rawB.split(/\r?\n/).length : 0;

    metaA.textContent = `${linesCountA} ${L ? 'vrstic' : 'lines'} | ${wordsCountA} ${L ? 'besed' : 'words'} | ${rawA.length} ${L ? 'znakov' : 'chars'}`;
    metaB.textContent = `${linesCountB} ${L ? 'vrstic' : 'lines'} | ${wordsCountB} ${L ? 'besed' : 'words'} | ${rawB.length} ${L ? 'znakov' : 'chars'}`;

    if (!rawA && !rawB) {
      statsBar.innerHTML = `<span style="font-size:12px; color:var(--text-dim);">${L ? 'Vnesite besedilo A in B za primerjavo.' : 'Enter text A and B to compare.'}</span>`;
      outputWrap.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim);">${L ? 'Ni podatkov za primerjavo.' : 'No data to compare.'}</div>`;
      return;
    }

    const linesA = rawA.split(/\r?\n/);
    const linesB = rawB.split(/\r?\n/);

    function normLine(l) {
      let s = l;
      if (ignoreWs) s = s.replace(/\s+/g, ' ').trim();
      if (ignoreCase) s = s.toLowerCase();
      return s;
    }

    const normA = linesA.map(normLine);
    const normB = linesB.map(normLine);

    const lineOps = lcs(normA, normB);

    // Align line ops into row pairs
    const alignedRows = [];
    let curLineA = 1,
      curLineB = 1;
    let ptrA = 0,
      ptrB = 0;

    for (let idx = 0; idx < lineOps.length; idx++) {
      const op = lineOps[idx];
      if (op.type === 'equal') {
        alignedRows.push({
          type: 'equal',
          numA: curLineA++,
          numB: curLineB++,
          textA: linesA[ptrA++],
          textB: linesB[ptrB++],
        });
      } else if (op.type === 'delete') {
        // Check if next is insert (modification pair)
        if (idx + 1 < lineOps.length && lineOps[idx + 1].type === 'insert') {
          alignedRows.push({
            type: 'modify',
            numA: curLineA++,
            numB: curLineB++,
            textA: linesA[ptrA++],
            textB: linesB[ptrB++],
          });
          idx++; // Skip next insert as paired
        } else {
          alignedRows.push({
            type: 'delete',
            numA: curLineA++,
            numB: null,
            textA: linesA[ptrA++],
            textB: null,
          });
        }
      } else if (op.type === 'insert') {
        alignedRows.push({
          type: 'insert',
          numA: null,
          numB: curLineB++,
          textA: null,
          textB: linesB[ptrB++],
        });
      }
    }

    // Stats calculation
    let totalAdds = 0,
      totalDels = 0,
      totalMod = 0,
      totalEq = 0;
    alignedRows.forEach(r => {
      if (r.type === 'insert') totalAdds++;
      else if (r.type === 'delete') totalDels++;
      else if (r.type === 'modify') totalMod++;
      else totalEq++;
    });

    const totalItems = alignedRows.length || 1;
    const simPct = Math.max(0, Math.min(100, Math.round((totalEq / totalItems) * 100)));

    statsBar.innerHTML = `
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(34,197,94,0.15); color:#16a34a; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">+ ${totalAdds} ${L ? 'dodanih' : 'added'}</span>
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(239,68,68,0.15); color:#dc2626; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">- ${totalDels} ${L ? 'odstranjenih' : 'deleted'}</span>
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(245,158,11,0.15); color:#d97706; padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">~ ${totalMod} ${L ? 'spremenjenih' : 'modified'}</span>
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(99,102,241,0.15); color:var(--violet); padding:3px 10px; border-radius:20px; font-weight:600; font-size:12px;">${SVG_ICONS.mi_star} ${L ? 'Podobnost' : 'Similarity'}: ${simPct}%</span>
        `;

    if (view === 'merged') {
      outputWrap.innerHTML = `
            <div style="padding:16px;">
              <div style="font-weight:600; margin-bottom:8px; color:var(--text-dim);">${L ? 'Čisto končno besedilo (B):' : 'Clean Final Text (B):'}</div>
              <pre style="margin:0; white-space:pre-wrap; font-family:inherit; font-size:13px; line-height:1.6;">${escapeHtml(rawB)}</pre>
            </div>
          `;
      return;
    }

    if (view === 'prose') {
      let proseHtml = '';
      if (algo === 'chars') {
        const charsA = [...rawA];
        const charsB = [...rawB];
        const charOps = lcs(
          ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA,
          ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB
        );
        let pA = 0,
          pB = 0;
        charOps.forEach(op => {
          if (op.type === 'equal') {
            proseHtml += escapeHtml(charsA[pA++]);
            pB++;
          } else if (op.type === 'delete') {
            proseHtml += `<del style="background:rgba(239,68,68,0.25); color:#dc2626; padding:0 1px; border-radius:2px; text-decoration:line-through;">${escapeHtml(charsA[pA++])}</del>`;
          } else if (op.type === 'insert') {
            proseHtml += `<ins style="background:rgba(34,197,94,0.25); color:#16a34a; padding:0 1px; border-radius:2px; text-decoration:none; font-weight:600;">${escapeHtml(charsB[pB++])}</ins>`;
          }
        });
      } else {
        const wordsA = rawA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        const wordsB = rawB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        const wordOps = lcs(
          ignoreCase ? wordsA.map(w => w.toLowerCase()) : wordsA,
          ignoreCase ? wordsB.map(w => w.toLowerCase()) : wordsB
        );

        let pA = 0,
          pB = 0;
        wordOps.forEach(op => {
          if (op.type === 'equal') {
            proseHtml += escapeHtml(wordsA[pA++]);
            pB++;
          } else if (op.type === 'delete') {
            proseHtml += `<del style="background:rgba(239,68,68,0.25); color:#dc2626; padding:1px 3px; border-radius:3px; text-decoration:line-through;">${escapeHtml(wordsA[pA++])}</del>`;
          } else if (op.type === 'insert') {
            proseHtml += `<ins style="background:rgba(34,197,94,0.25); color:#16a34a; padding:1px 3px; border-radius:3px; text-decoration:none; font-weight:600;">${escapeHtml(wordsB[pB++])}</ins>`;
          }
        });
      }

      outputWrap.innerHTML = `
            <div style="padding:18px; line-height:1.8; white-space:pre-wrap;">
              ${proseHtml || `<span style="color:var(--text-dim);">${L ? 'Besedili sta identični.' : 'Texts are identical.'}</span>`}
            </div>
          `;
      return;
    }

    if (view === 'unified') {
      // Unified 1-column patch view
      let unifiedHtml = `
            <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; background:var(--card); font-size:12px; border-bottom:1px solid var(--border); font-weight:600; color:var(--text-dim); padding:6px 0;">
              <div style="text-align:center;">A</div>
              <div style="text-align:center;">B</div>
              <div style="text-align:center;">+/-</div>
              <div style="padding-left:8px;">${L ? 'Vsebina' : 'Content'}</div>
            </div>
            <div style="max-height:480px; overflow-y:auto;">
          `;

      alignedRows.forEach(r => {
        if (r.type === 'equal') {
          if (!showSame) return;
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numA}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numB}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;"> </div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:var(--text);">${escapeHtml(r.textA)}</div>
                </div>
              `;
        } else if (r.type === 'modify') {
          let diffPair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
          if (algo === 'chars') {
            diffPair = diffCharsPair(r.textA, r.textB, ignoreCase);
          } else if (algo !== 'lines_only') {
            diffPair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
          }
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
                  <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${diffPair.htmlA}</div>
                </div>
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div>
                  <div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${diffPair.htmlB}</div>
                </div>
              `;
        } else if (r.type === 'delete') {
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
                  <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div>
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${escapeHtml(r.textA)}</div>
                </div>
              `;
        } else if (r.type === 'insert') {
          unifiedHtml += `
                <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
                  <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div>
                  <div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div>
                  <div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
                  <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${escapeHtml(r.textB)}</div>
                </div>
              `;
        }
      });

      unifiedHtml += `</div>`;
      outputWrap.innerHTML = unifiedHtml;
      return;
    }

    // Default: SIDE-BY-SIDE 2-COLUMN VIEW
    let splitHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid var(--border); background:var(--card); font-weight:600; font-size:12px; color:var(--text-dim);">
            <div style="padding:8px 12px; border-right:1px solid var(--border); display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original (A)'}</span>
              <span>${linesCountA} ${L ? 'vrstic' : 'lines'}</span>
            </div>
            <div style="padding:8px 12px; display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified (B)'}</span>
              <span>${linesCountB} ${L ? 'vrstic' : 'lines'}</span>
            </div>
          </div>
          <div id="cmp-side-scroll" style="display:grid; grid-template-columns:1fr 1fr; max-height:480px; overflow-y:auto; overflow-x:auto;">
            <div id="cmp-col-left" style="border-right:1px solid var(--border); min-width:0;">
        `;

    let leftRowsHtml = '';
    let rightRowsHtml = '';

    alignedRows.forEach(r => {
      if (r.type === 'equal') {
        if (!showSame) return;
        const textEsc = escapeHtml(r.textA);
        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numA}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numB}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div>
              </div>
            `;
      } else if (r.type === 'modify') {
        let diffPair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
        if (algo === 'chars') {
          diffPair = diffCharsPair(r.textA, r.textB, ignoreCase);
        } else if (algo !== 'lines_only') {
          diffPair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
        }

        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(239,68,68,0.11); border-bottom:1px solid rgba(239,68,68,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${diffPair.htmlA}</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(34,197,94,0.11); border-bottom:1px solid rgba(34,197,94,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${diffPair.htmlB}</div>
              </div>
            `;
      } else if (r.type === 'delete') {
        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(239,68,68,0.11); border-bottom:1px solid rgba(239,68,68,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${escapeHtml(r.textA)}</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(0,0,0,0.02); border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
                <div style="padding-left:8px; flex:1;">&nbsp;</div>
              </div>
            `;
      } else if (r.type === 'insert') {
        leftRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(0,0,0,0.02); border-bottom:1px solid rgba(0,0,0,0.03);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
                <div style="padding-left:8px; flex:1;">&nbsp;</div>
              </div>
            `;
        rightRowsHtml += `
              <div style="display:flex; padding:2px 0; background:rgba(34,197,94,0.11); border-bottom:1px solid rgba(34,197,94,0.1);">
                <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
                <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${escapeHtml(r.textB)}</div>
              </div>
            `;
      }
    });

    splitHtml +=
      leftRowsHtml +
      `</div><div id="cmp-col-right" style="min-width:0;">` +
      rightRowsHtml +
      `</div></div>`;
    outputWrap.innerHTML = splitHtml;
  }

  function readUpload(fileInput, targetTextarea) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      targetTextarea.value = reader.result || '';
      update();
    };
    reader.readAsText(file, 'UTF-8');
  }

  fileA.addEventListener('change', () => readUpload(fileA, inputA));
  fileB.addEventListener('change', () => readUpload(fileB, inputB));

  let _cmpDebounce;
  [inputA, inputB].forEach(el =>
    el.addEventListener('input', () => {
      clearTimeout(_cmpDebounce);
      _cmpDebounce = setTimeout(update, 100);
    })
  );

  [algoSel, viewSel, showSameCheck, ignoreCaseCheck, ignoreWsCheck].forEach(el => {
    el.addEventListener('change', update);
  });

  container.querySelector('#cmp-sample').addEventListener('click', () => {
    inputA.value = sampleA;
    inputB.value = sampleB;
    update();
  });

  container.querySelector('#cmp-swap').addEventListener('click', () => {
    const temp = inputA.value;
    inputA.value = inputB.value;
    inputB.value = temp;
    update();
  });

  container.querySelector('#cmp-clear-a').addEventListener('click', () => {
    inputA.value = '';
    update();
    inputA.focus();
  });

  container.querySelector('#cmp-clear-b').addEventListener('click', () => {
    inputB.value = '';
    update();
    inputB.focus();
  });

  container.querySelector('#cmp-copy-unified').addEventListener('click', () => {
    const textA = inputA.value;
    const textB = inputB.value;
    const linesA = textA.split(/\r?\n/);
    const linesB = textB.split(/\r?\n/);
    const ops = lcs(linesA, linesB);

    let patch = `--- text_a.txt\n+++ text_b.txt\n@@ -1,${linesA.length} +1,${linesB.length} @@\n`;
    ops.forEach(op => {
      if (op.type === 'equal') patch += ` ${op.val}\n`;
      else if (op.type === 'delete') patch += `-${op.val}\n`;
      else if (op.type === 'insert') patch += `+${op.val}\n`;
    });

    copyText(patch, container.querySelector('#cmp-copy-unified'));
  });

  container.querySelector('#cmp-copy-b').addEventListener('click', () => {
    copyText(inputB.value, container.querySelector('#cmp-copy-b'));
  });

  container.querySelector('#cmp-copy-html').addEventListener('click', () => {
    copyText(outputWrap.innerHTML, container.querySelector('#cmp-copy-html'));
  });

  update();
}

function renderCsvConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Smer pretvorbe:' : 'Conversion:'}
        <select id="csv-mode">
          <option value="csv2col">${L ? 'CSV → Poravnani stolpci' : 'CSV → Aligned Columns'}</option>
          <option value="col2csv">${L ? 'Stolpci → CSV' : 'Columns → CSV'}</option>
        </select>
      </label>
      <label>${L ? 'Ločilo CSV:' : 'Separator:'}
        <input type="text" id="csv-sep" value="," style="width:45px; text-align:center;">
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="csv-input">${getI('ui_input')}</label>
        <textarea id="csv-input" placeholder="${L ? 'Prilepite CSV podatke...' : 'Paste CSV data...'}">Mesto,Prebivalci,Regija\nLjubljana,293000,Osrednjeslovenska\nMaribor,112000,Podravska\nCelje,49000,Savinjska</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="csv-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="csv-output">${getI('ui_output')}</label>
        <textarea id="csv-output" readonly placeholder="${L ? 'Pretvorjeni podatki...' : 'Converted output...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="csv-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#csv-input'),
    output = container.querySelector('#csv-output');
  const mode = container.querySelector('#csv-mode'),
    sep = container.querySelector('#csv-sep');

  function update() {
    const s = sep.value || ',';
    if (mode.value === 'csv2col') {
      const rows = input.value.split('\n').map(r => r.split(s));
      const colWidths = [];
      rows.forEach(r =>
        r.forEach((c, i) => {
          colWidths[i] = Math.max(colWidths[i] || 0, c.trim().length);
        })
      );
      output.value = rows
        .map(r => r.map((c, i) => c.trim().padEnd(colWidths[i] || 0)).join('  '))
        .join('\n');
    } else {
      output.value = input.value
        .split('\n')
        .map(line =>
          line
            .trim()
            .split(/\s{2,}/)
            .join(s)
        )
        .join('\n');
    }
  }
  [input, mode, sep].forEach(el => el.addEventListener('input', update));
  container.querySelector('#csv-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#csv-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#csv-copy'));
  });
  update();
}

function renderTextToSpeech(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Glas (Sinteza):' : 'Voice:'}
        <select id="tts-voice" style="max-width:260px;"><option>Nalaganje glasov...</option></select>
      </label>
      <label>${L ? 'Hitrost:' : 'Rate:'}
        <input type="range" id="tts-rate" min="0.5" max="2" step="0.1" value="1" style="width:80px;">
      </label>
      <label>${L ? 'Višina (Pitch):' : 'Pitch:'}
        <input type="range" id="tts-pitch" min="0.5" max="1.5" step="0.1" value="1" style="width:80px;">
      </label>
    </div>
    <div class="tool-workspace-2col" style="grid-template-columns:1fr;">
      <div class="tool-panel">
        <label for="tts-input">${getI('ui_input')}</label>
        <textarea id="tts-input" rows="6" placeholder="${L ? 'Vnesite besedilo za branje na glas...' : 'Enter text to speak out loud...'}">${L ? 'Pozdravljeni v Besedomatu! Vašem zanesljivem orodju za delo z besedili.' : 'Welcome to Besedomat! Your reliable online text toolkit.'}</textarea>
        <div class="panel-actions" style="justify-content:space-between;">
          <button class="btn-sm" id="tts-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
          <div style="display:flex; gap:8px;">
            <button class="btn-sm primary" id="tts-play" style="display:inline-flex; align-items:center; gap:6px;">🔊 <span>${L ? 'Preberi na glas' : 'Play Speech'}</span></button>
            <button class="btn-sm" id="tts-stop" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_x} <span>${L ? 'Ustavi' : 'Stop'}</span></button>
          </div>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#tts-input');
  const voiceSel = container.querySelector('#tts-voice');
  const rate = container.querySelector('#tts-rate');
  const pitch = container.querySelector('#tts-pitch');
  let voices = [];

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;
    voiceSel.innerHTML = voices
      .map((v, i) => `<option value="${i}">${escapeHtml(v.name)} (${v.lang})</option>`)
      .join('');
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  container.querySelector('#tts-play').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      alert(L ? 'Vaš brskalnik ne podpira sinteze govora.' : 'Speech synthesis not supported.');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(input.value);
    if (voices[voiceSel.value]) utter.voice = voices[voiceSel.value];
    utter.rate = parseFloat(rate.value) || 1;
    utter.pitch = parseFloat(pitch.value) || 1;
    window.speechSynthesis.speak(utter);
  });

  container.querySelector('#tts-stop').addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  container.querySelector('#tts-clear').addEventListener('click', () => {
    input.value = '';
    input.focus();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });
}

function renderRandomString(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div style="max-width:700px; margin:0 auto; width:100%;">
      <div class="settings-bar" style="margin-bottom:14px; gap:12px;">
        <label>${L ? 'Dolžina:' : 'Length:'}
          <input type="number" id="rs-len" value="32" min="1" max="1000" style="width:70px;">
        </label>
        <label>${L ? 'Količina (vrstic):' : 'Quantity:'}
          <input type="number" id="rs-qty" value="1" min="1" max="100" style="width:60px;">
        </label>
        <label><input type="checkbox" id="rs-alpha" checked> A-Z, a-z</label>
        <label><input type="checkbox" id="rs-num" checked> 0-9</label>
        <label><input type="checkbox" id="rs-sym"> Simboli (!@#)</label>
      </div>
      <label>${getI('ui_output')}</label>
      <textarea id="rs-output" readonly style="min-height:120px; font-family:monospace; font-size:14px;"></textarea>
      <div class="panel-actions" style="justify-content:center; gap:12px; margin-top:12px;">
        <button class="btn-sm primary" id="rs-gen" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Ustvari niz' : 'Generate String'}</span></button>
        <button class="btn-sm" id="rs-copy" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
      </div>
    </div>
  `;
  const len = container.querySelector('#rs-len');
  const qty = container.querySelector('#rs-qty');
  const alpha = container.querySelector('#rs-alpha');
  const num = container.querySelector('#rs-num');
  const sym = container.querySelector('#rs-sym');
  const output = container.querySelector('#rs-output');

  function generate() {
    let chars = '';
    if (alpha.checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (num.checked) chars += '0123456789';
    if (sym.checked) chars += '!@#$%^&*()_+~' + String.fromCharCode(96) + '|}{\\[\\]:;?><,./-=';
    if (!chars) chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const n = Math.max(1, parseInt(len.value) || 32);
    const q = Math.max(1, parseInt(qty.value) || 1);
    const res = [];

    for (let row = 0; row < q; row++) {
      let str = '';
      const randArr = new Uint32Array(n);
      crypto.getRandomValues(randArr);
      for (let i = 0; i < n; i++) str += chars.charAt(randArr[i] % chars.length);
      res.push(str);
    }
    output.value = res.join('\n');
  }

  [len, qty, alpha, num, sym].forEach(el => el.addEventListener('input', generate));
  container.querySelector('#rs-gen').addEventListener('click', generate);
  container.querySelector('#rs-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#rs-copy'));
  });
  generate();
}

function renderRegexTester(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <span style="font-weight:700; color:var(--text-dim); font-size:16px;">/</span>
      <input type="text" id="rx-pattern" placeholder="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" value="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" style="flex:1; min-width:200px; font-family:monospace;">
      <span style="font-weight:700; color:var(--text-dim); font-size:16px;">/</span>
      <input type="text" id="rx-flags" value="g" placeholder="flags" style="width:45px; font-family:monospace;">
      <label><input type="checkbox" id="rx-flag-g" checked> g (global)</label>
      <label><input type="checkbox" id="rx-flag-i"> i (ignoreCase)</label>
      <label><input type="checkbox" id="rx-flag-m"> m (multiline)</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="rx-input">${L ? 'Testno besedilo' : 'Test String'}</label>
        <textarea id="rx-input" placeholder="${L ? 'Vnesite besedilo za testiranje regularnega izraza...' : 'Enter test string...'}">Pozdravljeni! Pišite nam na info@besedomat.si ali podpora@podjetje.com za pomoč.</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="rx-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label style="margin:0;">${L ? 'Označeni zadetki' : 'Highlighted Matches'}</label>
          <span id="rx-count" style="font-size:12px; font-weight:600; color:var(--violet);"></span>
        </div>
        <div id="rx-highlight" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; line-height:1.6; white-space:pre-wrap; word-break:break-all; font-family:monospace; font-size:13.5px;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="rx-copy-matches" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj zadetke' : 'Copy Matches'}</span></button>
        </div>
      </div>
    </div>
  `;
  const patEl = container.querySelector('#rx-pattern');
  const flagsEl = container.querySelector('#rx-flags');
  const fg = container.querySelector('#rx-flag-g');
  const fi = container.querySelector('#rx-flag-i');
  const fm = container.querySelector('#rx-flag-m');
  const input = container.querySelector('#rx-input');
  const highlight = container.querySelector('#rx-highlight');
  const count = container.querySelector('#rx-count');
  let extractedMatches = [];

  function syncFlagsFromCheckboxes() {
    let f = '';
    if (fg.checked) f += 'g';
    if (fi.checked) f += 'i';
    if (fm.checked) f += 'm';
    flagsEl.value = f;
    update();
  }

  function update() {
    const p = patEl.value;
    const f = flagsEl.value;
    const text = input.value;
    extractedMatches = [];
    if (!p || !text) {
      highlight.textContent = text;
      count.textContent = '';
      return;
    }
    try {
      const regex = new RegExp(p, f.includes('g') ? f : f + 'g');
      let matchesCount = 0;
      const htmlText = escapeHtml(text).replace(regex, m => {
        matchesCount++;
        extractedMatches.push(m);
        return `<mark style="background:rgba(234,179,8,0.3); color:inherit; padding:1px 3px; border-radius:3px; border:1px solid rgba(234,179,8,0.5);">${m}</mark>`;
      });
      highlight.innerHTML = htmlText;
      count.textContent = matchesCount + ' ' + (L ? 'zadetkov' : 'matches');
    } catch (e) {
      highlight.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${escapeHtml(e.message)}</span>`;
      count.textContent = '';
    }
  }

  [patEl, flagsEl, input].forEach(el => el.addEventListener('input', update));
  [fg, fi, fm].forEach(el => el.addEventListener('change', syncFlagsFromCheckboxes));
  container.querySelector('#rx-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#rx-copy-matches').addEventListener('click', () => {
    copyText(extractedMatches.join('\n'), container.querySelector('#rx-copy-matches'));
  });
  update();
}

function renderCensorWords(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <input type="text" id="cw-words" placeholder="${L ? 'Besede za cenzuro (ločene z vejico)...' : 'Words to censor (comma separated)...'}" value="grdo,slabo,psovka,bad,ugly,curse" style="flex:1; min-width:200px;">
      <label>${L ? 'Znak:' : 'Mask:'}
        <select id="cw-mask">
          <option value="stars">${L ? 'Zvezdice (****)' : 'Asterisks (****)'}</option>
          <option value="single">${L ? 'Ena zvezdica (*)' : 'Single (*)'}</option>
          <option value="firstlast">${L ? 'Ohrani prvo/zadnjo (g***o)' : 'First/last letter'}</option>
          <option value="block">${L ? 'Črni blok (████)' : 'Black block (████)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="cw-whole" checked> ${L ? 'Cele besede' : 'Whole words'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="cw-input">${getI('ui_input')}</label>
        <textarea id="cw-input" placeholder="${L ? 'Vnesite besedilo za cenzuro...' : 'Enter text to censor...'}">${L ? 'To je slabo besedilo s psovko, ki vsebuje grdo vsebino.' : 'This is bad text with a curse word and ugly content.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="cw-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="cw-output">${getI('ui_output')}</label>
        <textarea id="cw-output" readonly placeholder="${L ? 'Cenzurirano besedilo...' : 'Censored text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="cw-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#cw-input');
  const words = container.querySelector('#cw-words');
  const mask = container.querySelector('#cw-mask');
  const whole = container.querySelector('#cw-whole');
  const output = container.querySelector('#cw-output');

  function maskWord(w) {
    const m = mask.value;
    if (m === 'single') return '*';
    if (m === 'block') return '█'.repeat(w.length);
    if (m === 'firstlast') {
      if (w.length <= 2) return '*'.repeat(w.length);
      return w[0] + '*'.repeat(w.length - 2) + w[w.length - 1];
    }
    return '*'.repeat(w.length);
  }

  function update() {
    const rawWords = words.value
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
    if (rawWords.length === 0) {
      output.value = input.value;
      return;
    }
    let text = input.value;
    rawWords.forEach(w => {
      const pat = whole.checked ? PURE.wholeWordPattern(w) : escapeRegExp(w);
      const regex = new RegExp(pat, 'giu');
      text = text.replace(regex, match => maskWord(match));
    });
    output.value = text;
  }
  [input, words, mask, whole].forEach(el => el.addEventListener('input', update));
  container.querySelector('#cw-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#cw-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#cw-copy'));
  });
  update();
}

function renderUnicodeInfo(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ui-input">${getI('ui_input')}</label>
        <textarea id="ui-input" rows="4" placeholder="${L ? 'Vnesite besedilo ali simbole...' : 'Enter characters...'}" style="min-height:100px;">Čšž € 🚀 ©</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ui-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Unicode Podatki o znakih' : 'Unicode Character Breakdown'}</label>
        <div id="ui-table" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:8px; flex:1; max-height:360px; overflow-y:auto;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ui-copy-tsv" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj tabelo' : 'Copy Table'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ui-input');
  const table = container.querySelector('#ui-table');
  let tsvData = '';

  function update() {
    const text = input.value;
    const chars = [...text];
    if (chars.length === 0) {
      table.innerHTML = '';
      tsvData = '';
      return;
    }
    const rows = chars.map((c, i) => {
      const cp = c.codePointAt(0);
      const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
      const htmlEnt = '&#' + cp + ';';
      return { idx: i + 1, char: c, cp, hex, htmlEnt };
    });

    tsvData = ['#\tZnak\tKoda\tHex\tHTML']
      .concat(rows.map(r => `${r.idx}\t${r.char}\t${r.cp}\t${r.hex}\t${r.htmlEnt}`))
      .join('\n');

    table.innerHTML = `
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead><tr style="border-bottom:1px solid var(--border); text-align:left;"><th style="padding:6px;">#</th><th style="padding:6px;">Znak</th><th style="padding:6px;">Koda</th><th style="padding:6px;">Hex</th><th style="padding:6px;">HTML</th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);"><td style="padding:4px 6px; color:var(--text-dim);">${r.idx}</td><td style="padding:4px 6px; font-size:16px; font-weight:700;">${escapeHtml(r.char)}</td><td style="padding:4px 6px; font-family:monospace;">${r.cp}</td><td style="padding:4px 6px; font-family:monospace; color:var(--violet);">${r.hex}</td><td style="padding:4px 6px; font-family:monospace; color:var(--teal);">${escapeHtml(r.htmlEnt)}</td></tr>`).join('')}
            </tbody>
          </table>
        `;
  }
  input.addEventListener('input', update);
  container.querySelector('#ui-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ui-copy-tsv').addEventListener('click', () => {
    if (!tsvData) return;
    copyText(tsvData, container.querySelector('#ui-copy-tsv'));
  });
  update();
}

function renderPalindromeCheck(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pc-input">${getI('ui_input')}</label>
        <textarea id="pc-input" placeholder="${L ? 'Vnesite besedilo za preverjanje palindroma...' : 'Enter text to test palindrome...'}">Perica reže raci rep</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultat analize' : 'Analysis Result'}</label>
        <div id="pc-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:20px; flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;"></div>
      </div>
    </div>
  `;
  const input = container.querySelector('#pc-input');
  const result = container.querySelector('#pc-result');

  function update() {
    const text = input.value.trim();
    if (!text) {
      result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo za preizkus.' : 'Enter text.'}</span>`;
      return;
    }
    const clean = text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    const reversed = [...clean].reverse().join('');
    const isPal = clean.length > 0 && clean === reversed;

    result.innerHTML = isPal
      ? `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_check}</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a; margin-bottom:6px;">${L ? 'Je palindrom!' : 'It is a palindrome!'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Besedilo se bere enako naprej in nazaj.' : 'Reads exactly the same forwards and backwards.'}</div>
          <div style="margin-top:12px; font-family:monospace; background:rgba(34,197,94,0.1); padding:6px 12px; border-radius:6px; font-size:13px;">${escapeHtml(clean)}</div>
        `
      : `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_x}</div>
          <div style="font-size:18px; font-weight:800; color:#dc2626; margin-bottom:6px;">${L ? 'Ni palindrom.' : 'Not a palindrome.'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Naprej:' : 'Forward:'} <code>${escapeHtml(clean)}</code></div>
          <div style="font-size:13px; color:var(--text-dim); margin-top:2px;">${L ? 'Nazaj:' : 'Reverse:'} <code>${escapeHtml(reversed)}</code></div>
        `;
  }
  input.addEventListener('input', update);
  container.querySelector('#pc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
}

function renderZalgoText(container) {
  const L = currentLang === 'sl';
  const ZALGO_UP = [
    '\u030d',
    '\u030e',
    '\u0304',
    '\u0305',
    '\u033f',
    '\u0311',
    '\u0306',
    '\u0310',
    '\u0352',
    '\u0357',
    '\u0351',
    '\u0307',
    '\u0308',
    '\u030a',
    '\u0342',
    '\u0343',
    '\u0344',
    '\u034a',
    '\u034b',
    '\u034c',
    '\u0303',
    '\u0302',
    '\u030c',
    '\u0350',
    '\u0300',
    '\u0301',
    '\u030b',
    '\u030f',
    '\u0312',
    '\u0313',
    '\u0314',
    '\u033d',
    '\u0309',
    '\u0363',
    '\u0364',
    '\u0365',
    '\u0366',
    '\u0367',
    '\u0368',
    '\u0369',
    '\u036a',
    '\u036b',
    '\u036c',
    '\u036d',
    '\u036e',
    '\u036f',
    '\u033e',
    '\u035b',
    '\u0346',
    '\u031a',
  ];
  const ZALGO_MID = [
    '\u0315',
    '\u031b',
    '\u0340',
    '\u0341',
    '\u0358',
    '\u0321',
    '\u0322',
    '\u0327',
    '\u0328',
    '\u0334',
    '\u0335',
    '\u0336',
    '\u034f',
    '\u035c',
    '\u035d',
    '\u035e',
    '\u035f',
    '\u0360',
    '\u0362',
    '\u0338',
    '\u0337',
    '\u0361',
    '\u0345',
  ];
  const ZALGO_DOWN = [
    '\u0316',
    '\u0317',
    '\u0318',
    '\u0319',
    '\u031c',
    '\u031d',
    '\u031e',
    '\u031f',
    '\u0320',
    '\u0324',
    '\u0325',
    '\u0326',
    '\u0329',
    '\u032a',
    '\u032b',
    '\u032c',
    '\u032d',
    '\u032e',
    '\u032f',
    '\u0330',
    '\u0331',
    '\u0332',
    '\u0333',
    '\u0339',
    '\u033a',
    '\u033b',
    '\u033c',
    '\u0345',
    '\u0347',
    '\u0348',
    '\u0349',
    '\u034d',
    '\u034e',
    '\u0353',
    '\u0354',
    '\u0355',
    '\u0356',
    '\u0359',
    '\u035a',
    '\u0323',
  ];

  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Stopnja kaosa:' : 'Chaos level:'}
        <select id="zg-level">
          <option value="1">${L ? 'Nizka (malo glitchev)' : 'Low'}</option>
          <option value="3" selected>${L ? 'Srednja' : 'Medium'}</option>
          <option value="6">${L ? 'Visoka (poln kaos)' : 'High (Full Chaos)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="zg-up" checked> ${L ? 'Zgoraj' : 'Up'}</label>
      <label><input type="checkbox" id="zg-mid" checked> ${L ? 'Sredina' : 'Middle'}</label>
      <label><input type="checkbox" id="zg-down" checked> ${L ? 'Spodaj' : 'Down'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="zg-input">${getI('ui_input')}</label>
        <textarea id="zg-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">Besedomat Zalgo Text</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="zg-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="zg-output">${getI('ui_output')}</label>
        <textarea id="zg-output" readonly placeholder="${L ? 'Glitched Zalgo rezultat...' : 'Zalgo result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="zg-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#zg-input');
  const level = container.querySelector('#zg-level');
  const up = container.querySelector('#zg-up');
  const mid = container.querySelector('#zg-mid');
  const down = container.querySelector('#zg-down');
  const output = container.querySelector('#zg-output');

  function update() {
    const mult = parseInt(level.value) || 3;
    let res = '';
    for (const char of input.value) {
      res += char;
      if (/\s/.test(char)) continue;
      if (up.checked)
        for (let i = 0; i < mult; i++) res += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
      if (mid.checked)
        for (let i = 0; i < Math.floor(mult / 2); i++)
          res += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
      if (down.checked)
        for (let i = 0; i < mult; i++)
          res += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
    }
    output.value = res;
  }
  [input, level, up, mid, down].forEach(el => el.addEventListener('input', update));
  container.querySelector('#zg-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#zg-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#zg-copy'));
  });
  update();
}

function renderFancyText(container) {
  const L = currentLang === 'sl';
  const styles = {
    bold: { upper: 0x1d400, lower: 0x1d41a, digits: 0x1d7ce, label: 'Bold (𝐁)' },
    italic: { upper: 0x1d434, lower: 0x1d44e, digits: null, label: 'Italic (𝐼)' },
    'bold-italic': { upper: 0x1d468, lower: 0x1d482, digits: null, label: 'Bold Italic (𝑩)' },
    script: { upper: 0x1d49c, lower: 0x1d4b6, digits: null, label: 'Script (𝒜)' },
    fraktur: { upper: 0x1d504, lower: 0x1d51e, digits: null, label: 'Fraktur (𝔄)' },
    monospace: { upper: 0x1d670, lower: 0x1d68a, digits: 0x1d7f6, label: 'Monospace (𝙼)' },
    'double-struck': {
      upper: 0x1d538,
      lower: 0x1d552,
      digits: 0x1d7d8,
      label: 'Double-struck (𝔸)',
    },
    'sans-serif': { upper: 0x1d5a0, lower: 0x1d5ba, digits: 0x1d7e2, label: 'Sans-serif (𝖠)' },
    'sans-bold': { upper: 0x1d5d4, lower: 0x1d5ee, digits: 0x1d7ec, label: 'Sans Bold (𝗔)' },
    underline: { special: 'underline', label: 'Underline (U̲)' },
    'double-underline': { special: 'double-underline', label: 'Double Underline (U̳)' },
  };
  /* Unicode za nekatere črke nima glifa v zaporedju → uporabi posebne kodne točke,
         sicer bi naivna preslikava dala nedodeljene znake (tofu). */
  const FANCY_EXCEPTIONS = {
    italic: { h: '\u210E' },
    script: {
      B: '\u212C',
      E: '\u2130',
      F: '\u2131',
      H: '\u210B',
      I: '\u2110',
      L: '\u2112',
      M: '\u2133',
      R: '\u211B',
      e: '\u212F',
      g: '\u210A',
      o: '\u2134',
    },
    fraktur: { C: '\u212D', H: '\u210C', I: '\u2111', R: '\u211C', Z: '\u2128' },
    'double-struck': {
      C: '\u2102',
      H: '\u210D',
      N: '\u2115',
      P: '\u2119',
      Q: '\u211A',
      R: '\u211D',
      Z: '\u2124',
    },
  };
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Slog pisave:' : 'Font style:'}
        <select id="ft-style" style="min-width:200px;">
          ${Object.entries(styles)
            .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
            .join('')}
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="ft-input">${getI('ui_input')}</label>
        <textarea id="ft-input" placeholder="${L ? 'Vnesite besedilo za pretvorbo...' : 'Enter text to convert...'}" style="min-height:140px;">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="ft-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="ft-output">${getI('ui_output')}</label>
        <textarea id="ft-output" readonly placeholder="${L ? 'Pretvorjena pisava...' : 'Converted fancy text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="ft-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#ft-input'),
    output = container.querySelector('#ft-output');
  const style = container.querySelector('#ft-style');

  function convert(text, key) {
    const s = styles[key] || styles.bold;
    if (s.special === 'underline')
      return [...text].map(c => (c === '\n' ? c : c + '\u0332')).join('');
    if (s.special === 'double-underline')
      return [...text].map(c => (c === '\n' ? c : c + '\u0333')).join('');
    const exceptions = FANCY_EXCEPTIONS[key] || {};
    return [...text]
      .map(c => {
        if (exceptions[c]) return exceptions[c];
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90 && s.upper) return String.fromCodePoint(s.upper + (code - 65));
        if (code >= 97 && code <= 122 && s.lower)
          return String.fromCodePoint(s.lower + (code - 97));
        if (code >= 48 && code <= 57 && s.digits)
          return String.fromCodePoint(s.digits + (code - 48));
        return c;
      })
      .join('');
  }

  function update() {
    output.value = convert(input.value, style ? style.value || 'bold' : 'bold');
  }
  [input, style].forEach(el => el.addEventListener('input', update));
  container.querySelector('#ft-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#ft-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#ft-copy'));
  });
  update();
}

function renderTextRepeater(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Število ponovitev:' : 'Repeat count:'}
        <input type="number" id="tr-count" value="5" min="1" max="1000" style="width:70px;">
      </label>
      <label>${L ? 'Ločilo:' : 'Separator:'}
        <input type="text" id="tr-sep" value="\n" placeholder="\n" style="width:60px;">
      </label>
      <label><input type="checkbox" id="tr-num"> ${L ? 'Dodaj številčenje (1., 2...)' : 'Add numbering (1., 2...)'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="tr-input">${getI('ui_input')}</label>
        <textarea id="tr-input" placeholder="${L ? 'Vnesite besedilo za ponovitev...' : 'Enter text to repeat...'}">Ponovi to sporočilo!</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="tr-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="tr-output">${getI('ui_output')}</label>
        <textarea id="tr-output" readonly placeholder="${L ? 'Ponovljeno besedilo...' : 'Repeated text...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="tr-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#tr-input');
  const countEl = container.querySelector('#tr-count');
  const sepEl = container.querySelector('#tr-sep');
  const numCheck = container.querySelector('#tr-num');
  const output = container.querySelector('#tr-output');

  function update() {
    const n = Math.min(1000, Math.max(1, parseInt(countEl.value) || 1));
    const sep = sepEl.value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    const text = input.value;
    const arr = [];
    for (let i = 1; i <= n; i++) {
      arr.push((numCheck.checked ? i + '. ' : '') + text);
    }
    output.value = arr.join(sep);
  }
  [input, countEl, sepEl, numCheck].forEach(el => el.addEventListener('input', update));
  container.querySelector('#tr-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#tr-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#tr-copy'));
  });
  update();
}

function renderHighlightPatterns(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label style="flex:1; min-width:240px;">${L ? 'Vzorci za označevanje (ločeni z vejico):' : 'Patterns to highlight (comma separated):'}
        <input type="text" id="hp-patterns" value="besedilo, orodje, 2026" style="flex:1;">
      </label>
      <label><input type="checkbox" id="hp-ci" checked> ${L ? 'Brez razlike (A=a)' : 'Case insensitive'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="hp-input">${getI('ui_input')}</label>
        <textarea id="hp-input" rows="6">${L ? 'Besedomat je sodobno orodje za urejanje in analizo besedil v letu 2026. Vsako orodje je prilagojeno za hitro delo.' : 'Besedomat is a modern text toolkit for text analysis and editing in 2026. Every tool is optimized for fast work.'}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="hp-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Označeni vzorci v besedilu' : 'Highlighted Patterns'}</label>
        <div id="hp-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; font-size:13.5px; line-height:1.8; white-space:pre-wrap; word-break:break-all;"></div>
      </div>
    </div>
  `;
  const input = container.querySelector('#hp-input'),
    patterns = container.querySelector('#hp-patterns');
  const ci = container.querySelector('#hp-ci'),
    result = container.querySelector('#hp-result');
  const colors = [
    'rgba(255,200,50,0.4)',
    'rgba(100,200,255,0.4)',
    'rgba(255,120,150,0.4)',
    'rgba(120,255,150,0.4)',
    'rgba(200,150,255,0.4)',
  ];

  function update() {
    const pats = patterns.value
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    if (!pats.length) {
      result.innerHTML = escapeHtml(input.value);
      return;
    }
    let html = escapeHtml(input.value);
    pats.forEach((pat, i) => {
      try {
        const re = new RegExp(escapeRegExp(pat), ci.checked ? 'gi' : 'g');
        const bg = colors[i % colors.length];
        html = html.replace(
          re,
          m =>
            `<mark style="background:${bg}; border-radius:4px; padding:2px 4px; font-weight:600;">${m}</mark>`
        );
      } catch (e) {}
    });
    result.innerHTML = html;
  }
  let _hpDb;
  [input, patterns, ci].forEach(el =>
    el.addEventListener('input', () => {
      clearTimeout(_hpDb);
      _hpDb = setTimeout(update, 80);
    })
  );
  container.querySelector('#hp-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
}

function renderTextEntropy(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="te-input">${getI('ui_input')}</label>
        <textarea id="te-input" placeholder="${L ? 'Vnesite besedilo za izračun Shannonove entropije...' : 'Enter text to calculate Shannon entropy...'}">Besedomat 2026 - Zanesljivo orodje za obdelavo besedila.</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="te-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Analiza Shannonove Entropije' : 'Shannon Entropy Analysis'}</label>
        <div id="te-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; overflow-y:auto;"></div>
      </div>
    </div>
  `;
  const input = container.querySelector('#te-input');
  const result = container.querySelector('#te-result');

  function update() {
    const text = input.value;
    if (!text) {
      result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo.' : 'Enter text.'}</span>`;
      return;
    }
    const len = text.length;
    const freqs = {};
    for (const c of text) freqs[c] = (freqs[c] || 0) + 1;

    let entropy = 0;
    for (const c in freqs) {
      const p = freqs[c] / len;
      entropy -= p * Math.log2(p);
    }

    const maxEntropy = Math.log2(Object.keys(freqs).length || 1);
    const metricPct = maxEntropy > 0 ? ((entropy / 8) * 100).toFixed(1) : 0;

    result.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div class="stat-box"><div class="num">${entropy.toFixed(3)}</div><div class="lbl">Shannon Entropija (bit/char)</div></div>
            <div class="stat-box"><div class="num">${len}</div><div class="lbl">${L ? 'Skupaj znakov' : 'Total Chars'}</div></div>
          </div>
          <div style="font-size:13px; margin-bottom:6px;"><strong>${L ? 'Ocena naključnosti / kompleksnosti:' : 'Randomness Score:'}</strong></div>
          <div style="background:var(--border); height:8px; border-radius:4px; overflow:hidden; margin-bottom:12px;">
            <div style="background:var(--teal); height:100%; width:${Math.min(100, metricPct)}%;"></div>
          </div>
          <div style="font-size:12px; color:var(--text-dim); line-height:1.5;">
            ${L ? 'Navadno besedilo ima entropijo med 3.5 in 5.0 bit/znak. Zgoščene ali šifrirane vrednosti imajo običajno entropijo nad 7.5 bit/znak.' : 'Normal prose has entropy between 3.5 and 5.0 bits/char. Encrypted or compressed data is typically > 7.5 bits/char.'}
          </div>
        `;
  }
  input.addEventListener('input', update);
  container.querySelector('#te-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
}

function renderLevenshtein(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label><input type="checkbox" id="lv-case"> ${L ? 'Upoštevaj velike/male črke' : 'Case sensitive'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="lv-a">${L ? 'Prvo besedilo (A)' : 'First text (A)'}</label>
        <textarea id="lv-a" rows="5" placeholder="Besedilo A...">Besedomat</textarea>
        <label for="lv-b" style="margin-top:10px;">${L ? 'Drugo besedilo (B)' : 'Second text (B)'}</label>
        <textarea id="lv-b" rows="5" placeholder="Besedilo B...">Besedomet</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="lv-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Rezultat primerjave razdalje' : 'Distance Calculation'}</label>
        <div id="lv-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; display:flex; flex-direction:column; justify-content:center;"></div>
      </div>
    </div>
  `;
  const aEl = container.querySelector('#lv-a');
  const bEl = container.querySelector('#lv-b');
  const caseSens = container.querySelector('#lv-case');
  const result = container.querySelector('#lv-result');

  function levDist(s1, s2) {
    const a = [...s1],
      b = [...s2];
    const m = a.length,
      n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function update() {
    let s1 = aEl.value,
      s2 = bEl.value;
    if (!caseSens.checked) {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();
    }
    const dist = levDist(s1, s2);
    const maxLen = Math.max([...s1].length, [...s2].length);
    const simPct = maxLen === 0 ? 100 : Math.max(0, (1 - dist / maxLen) * 100).toFixed(1);

    result.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div class="stat-box"><div class="num">${dist}</div><div class="lbl">${L ? 'Levenshteinova razdalja' : 'Edit Distance'}</div></div>
            <div class="stat-box"><div class="num" style="color:var(--violet);">${simPct}%</div><div class="lbl">${L ? 'Stopnja podobnosti' : 'Similarity'}</div></div>
          </div>
          <div style="font-size:13px; color:var(--text-dim); text-align:center;">
            ${L ? `Za pretvorbo niza A v niz B je potrebnih natanko <strong>${dist}</strong> urejanj (vstavljanj, brisanj ali zamenjav znakov).` : `Exactly <strong>${dist}</strong> single-character edits required to transform A into B.`}
          </div>
        `;
  }
  [aEl, bEl, caseSens].forEach(el => el.addEventListener('input', update));
  container.querySelector('#lv-clear').addEventListener('click', () => {
    aEl.value = '';
    bEl.value = '';
    update();
    aEl.focus();
  });
  update();
}

function renderNumberToWords(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Jezik izpisa:' : 'Language:'}
        <select id="nw-lang">
          <option value="sl" ${L ? 'selected' : ''}>Slovenščina</option>
          <option value="en" ${!L ? 'selected' : ''}>English</option>
        </select>
      </label>
      <label>${L ? 'Oblika:' : 'Format:'}
        <select id="nw-fmt">
          <option value="words">${L ? 'Besedni zapis' : 'Words'}</option>
          <option value="currency">${L ? 'Valuta (EUR)' : 'Currency (EUR)'}</option>
          <option value="ordinal">${L ? 'Vrstilni števniki (1., 2...)' : 'Ordinal'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="nw-input">${getI('ui_input')}</label>
        <textarea id="nw-input" placeholder="${L ? 'Vnesite števila (eno na vrstico)...' : 'Enter numbers (one per line)...'}">1\n2\n3\n2026\n15.50</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="nw-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="nw-output">${getI('ui_output')}</label>
        <textarea id="nw-output" readonly placeholder="${L ? 'Besedni izpis števil...' : 'Spelled out words...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="nw-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#nw-input');
  const langSel = container.querySelector('#nw-lang');
  const fmtSel = container.querySelector('#nw-fmt');
  const output = container.querySelector('#nw-output');

  const slUnits = [
    '',
    'ena',
    'dva',
    'tri',
    'štiri',
    'pet',
    'šest',
    'sedem',
    'osem',
    'devet',
    'deset',
    'enajst',
    'dvanajst',
    'trinajst',
    'štirinajst',
    'petnajst',
    'šestnajst',
    'sedemnajst',
    'osemnajst',
    'devetnajst',
  ];
  const slTens = [
    '',
    'deset',
    'dvajset',
    'trideset',
    'štirideset',
    'petdeset',
    'šestdeset',
    'sedemdeset',
    'osemdeset',
    'devetdeset',
  ];
  const slHundreds = [
    '',
    'sto',
    'dvesto',
    'tristo',
    'štiristo',
    'petsto',
    'šeststo',
    'sedemsto',
    'osemsto',
    'devetsto',
  ];

  function slSmall(n) {
    if (n === 0) return 'nič';
    let res = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) res += slHundreds[h];
    if (rem === 0) return res;
    if (h > 0) res += ' ';
    if (rem < 20) {
      res += slUnits[rem];
    } else {
      const t = Math.floor(rem / 10);
      const u = rem % 10;
      if (u > 0) res += (u === 1 ? 'ena' : u === 2 ? 'dva' : slUnits[u]) + 'in' + slTens[t];
      else res += slTens[t];
    }
    return res;
  }

  function slNumber(num) {
    if (num === 0) return 'nič';
    let str = '';
    if (num < 0) {
      str += 'minus ';
      num = Math.abs(num);
    }
    const bil = Math.floor(num / 1000000000);
    const mio = Math.floor((num % 1000000000) / 1000000);
    const tisoce = Math.floor((num % 1000000) / 1000);
    const ostalo = num % 1000;

    if (bil > 0) {
      if (bil === 1) str += 'ena milijarda ';
      else if (bil === 2) str += 'dve milijardi ';
      else if (bil === 3 || bil === 4) str += slSmall(bil) + ' milijarde ';
      else str += slSmall(bil) + ' milijard ';
    }
    if (mio > 0) {
      if (mio === 1) str += 'en milijon ';
      else if (mio === 2) str += 'dva milijona ';
      else if (mio === 3 || mio === 4) str += slSmall(mio) + ' milijone ';
      else str += slSmall(mio) + ' milijonov ';
    }
    if (tisoce > 0) {
      if (tisoce === 1) str += 'tisoč ';
      else str += slSmall(tisoce) + ' tisoč ';
    }
    if (ostalo > 0 || (bil === 0 && mio === 0 && tisoce === 0)) {
      str += slSmall(ostalo);
    }
    return str.trim();
  }

  const enUnits = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  const enTens = [
    '',
    'ten',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  function enSmall(n) {
    if (n === 0) return 'zero';
    let res = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) res += enUnits[h] + ' hundred ';
    if (rem === 0) return res.trim();
    if (rem < 20) res += enUnits[rem];
    else {
      const t = Math.floor(rem / 10);
      const u = rem % 10;
      res += enTens[t] + (u > 0 ? '-' + enUnits[u] : '');
    }
    return res.trim();
  }

  function enNumber(num) {
    if (num === 0) return 'zero';
    let str = '';
    if (num < 0) {
      str += 'minus ';
      num = Math.abs(num);
    }
    const bil = Math.floor(num / 1000000000);
    const mio = Math.floor((num % 1000000000) / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const rem = num % 1000;
    if (bil > 0) str += enSmall(bil) + ' billion ';
    if (mio > 0) str += enSmall(mio) + ' million ';
    if (thousands > 0) str += enSmall(thousands) + ' thousand ';
    if (rem > 0 || (bil === 0 && mio === 0 && thousands === 0)) str += enSmall(rem);
    return str.trim();
  }

  const slOrdLastMap = {
    ena: 'prvi',
    dva: 'drugi',
    tri: 'tretji',
    štiri: 'četrti',
    pet: 'peti',
    šest: 'šesti',
    sedem: 'sedmi',
    osem: 'osmi',
    devet: 'deveti',
    deset: 'deseti',
    enajst: 'enajsti',
    dvanajst: 'dvanajsti',
    trinajst: 'trinajsti',
    štirinajst: 'štirinajsti',
    petnajst: 'petnajsti',
    šestnajst: 'šestnajsti',
    sedemnajst: 'sedemnajsti',
    osemnajst: 'osemnajsti',
    devetnajst: 'devetnajsti',
    dvajset: 'dvajseti',
    trideset: 'trideseti',
    štirideset: 'štirideseti',
    petdeset: 'petdeseti',
    šestdeset: 'šestdeseti',
    sedemdeset: 'sedemdeseti',
    osemdeset: 'osemdeseti',
    devetdeset: 'devetdeseti',
    sto: 'stoti',
    dvesto: 'dvestoti',
    tristo: 'tristoti',
    štiristo: 'štiristoti',
    petsto: 'petstoti',
    šesto: 'šeststoti',
    sedemsto: 'sedemstoti',
    osemsto: 'osemstoti',
    devetsto: 'devetstoti',
  };

  function toOrdinalSl(cardinalStr) {
    const s = cardinalStr.trim();
    if (s === 'nič') return 'ničti';
    const parts = s.split(/\s+/);
    const last = parts[parts.length - 1];
    const head = parts.slice(0, -1).join('');
    if (last === 'tisoč') {
      return head + 'tisoči';
    }
    if (['milijon', 'milijona', 'milijone', 'milijonov'].includes(last)) {
      if (/^(en|ena)$/.test(head)) return 'milijonti';
      return head + 'milijonti';
    }
    if (['milijarda', 'milijardi', 'milijarde', 'milijard'].includes(last)) {
      if (/^(en|ena)$/.test(head)) return 'milijardti';
      return head + 'milijardti';
    }
    let mapped = slOrdLastMap[last];
    if (!mapped && /set$/.test(last)) mapped = last + 'i';
    else if (!mapped && /sto$/.test(last)) mapped = last.slice(0, -2) + 'oti';
    return head + (mapped || last + '.');
  }

  function toOrdinalEn(cardinalStr) {
    if (cardinalStr.trim() === 'zero') return 'zeroth';
    const irregular = {
      one: 'first',
      two: 'second',
      three: 'third',
      five: 'fifth',
      eight: 'eighth',
      nine: 'ninth',
      twelve: 'twelfth',
    };
    const compoundIrregular = {
      '-one': '-first',
      '-two': '-second',
      '-three': '-third',
      '-five': '-fifth',
      '-eight': '-eighth',
      '-nine': '-ninth',
    };
    const words = cardinalStr.trim().split(/\s+/);
    let last = words[words.length - 1];
    if (irregular[last]) last = irregular[last];
    else {
      let done = false;
      for (const suf in compoundIrregular) {
        if (last.endsWith(suf)) {
          last = last.slice(0, -suf.length) + compoundIrregular[suf];
          done = true;
          break;
        }
      }
      if (!done) {
        if (/y$/.test(last)) last = last.slice(0, -1) + 'ieth';
        else if (/hundred$/.test(last)) last = last.replace(/hundred$/, 'hundredth');
        else if (/thousand$/.test(last)) last = last.replace(/thousand$/, 'thousandth');
        else if (/million$/.test(last)) last = last.replace(/million$/, 'millionth');
        else if (/billion$/.test(last)) last = last.replace(/billion$/, 'billionth');
        else if (/e$/.test(last)) last = last.slice(0, -1) + 'th';
        else last = last + 'th';
      }
    }
    words[words.length - 1] = last;
    return words.join(' ');
  }

  function update() {
    const isSl = langSel.value === 'sl';
    const fmtVal = fmtSel.value;
    const isCurr = fmtVal === 'currency';
    const isOrd = fmtVal === 'ordinal';
    output.value = input.value
      .split('\n')
      .map(line => {
        const trimmed = line.trim().replace(',', '.');
        if (!trimmed) return '';
        const num = parseFloat(trimmed);
        if (isNaN(num)) return L ? '(ni število)' : '(not a number)';
        const intPart = Math.floor(Math.abs(num));
        const decPart = Math.round((Math.abs(num) - intPart) * 100);

        if (isOrd && decPart === 0) {
          const sign = num < 0 ? 'minus ' : '';
          if (isSl) return sign + toOrdinalSl(slNumber(intPart));
          return sign + toOrdinalEn(enNumber(intPart));
        }

        if (isSl) {
          let res = slNumber(intPart);
          if (isCurr) {
            res += ' EUR' + (decPart > 0 ? ' in ' + decPart + '/100' : '');
          } else if (decPart > 0) {
            res += ' cela ' + slNumber(decPart);
          }
          return res;
        } else {
          let res = enNumber(intPart);
          if (isCurr) {
            res += ' dollars' + (decPart > 0 ? ' and ' + decPart + '/100 cents' : '');
          } else if (decPart > 0) {
            res += ' point ' + enNumber(decPart);
          }
          return res;
        }
      })
      .join('\n');
  }
  [input, langSel, fmtSel].forEach(el => el.addEventListener('input', update));
  container.querySelector('#nw-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#nw-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#nw-copy'));
  });
  update();
}

function renderBraille(container) {
  const L = currentLang === 'sl';
  const BRAILLE_MAP = {
    a: '⠁',
    b: '⠃',
    c: '⠉',
    č: '⠡',
    d: '⠙',
    e: '⠑',
    f: '⠋',
    g: '⠛',
    h: '⠓',
    i: '⠊',
    j: '⠚',
    k: '⠅',
    l: '⠇',
    m: '⠍',
    n: '⠝',
    o: '⠕',
    p: '⠏',
    q: '⠟',
    r: '⠗',
    s: '⠎',
    š: '⠱',
    t: '⠞',
    u: '⠥',
    v: '⠧',
    w: '⠺',
    x: '⠭',
    y: '⠽',
    z: '⠵',
    ž: '⠮',
    ' ': ' ',
    ',': '⠂',
    ';': '⠆',
    ':': '⠒',
    '.': '⠲',
    '!': '⠖',
    '?': '⠦',
    '1': '⠼⠁',
    '2': '⠼⠃',
    '3': '⠼⠉',
    '4': '⠼⠙',
    '5': '⠼⠑',
    '6': '⠼⠋',
    '7': '⠼⠛',
    '8': '⠼⠓',
    '9': '⠼⠊',
    '0': '⠼⠚',
  };

  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="br-input">${getI('ui_input')}</label>
        <textarea id="br-input" placeholder="${L ? 'Vnesite besedilo za pretvorbo v Braillovo pisavo...' : 'Enter text for Braille translation...'}">Besedomat 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="br-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="br-output">${getI('ui_output')}</label>
        <textarea id="br-output" readonly placeholder="${L ? 'Braillova pisava...' : 'Braille output...'}" style="font-size:20px; line-height:1.5;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="br-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#br-input');
  const output = container.querySelector('#br-output');

  function update() {
    const text = input.value.toLowerCase();
    output.value = [...text].map(c => BRAILLE_MAP[c] || c).join('');
  }
  input.addEventListener('input', update);
  container.querySelector('#br-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#br-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#br-copy'));
  });
  update();
}

function renderJsonFormatter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Presledki zamika:' : 'Indentation:'}
        <select id="jf-indent">
          <option value="2">2 presledka</option>
          <option value="4">4 presledki</option>
          <option value="tab">Tabulator</option>
          <option value="0">${L ? 'Minificiraj (strnjeno)' : 'Minify (compact)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="jf-sort"> ${L ? 'Uredi ključe po abecedi' : 'Sort keys alphabetically'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="jf-input">${getI('ui_input')}</label>
        <textarea id="jf-input" placeholder="${L ? 'Prilepite JSON vsebino...' : 'Paste JSON here...'}">{
  "ime": "Besedomat",
  "leto": 2026,
  "funkcije": ["analiza", "oblikovanje", "varnost"],
  "aktiven": true
}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="jf-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label for="jf-output" style="margin:0;">${getI('ui_output')}</label>
          <span id="jf-status" style="font-size:12px; font-weight:600;"></span>
        </div>
        <textarea id="jf-output" readonly placeholder="${L ? 'Oblikovan JSON...' : 'Formatted JSON...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="jf-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#jf-input');
  const indentSel = container.querySelector('#jf-indent');
  const sortCheck = container.querySelector('#jf-sort');
  const output = container.querySelector('#jf-output');
  const status = container.querySelector('#jf-status');

  function update() {
    if (!input.value.trim()) {
      output.value = '';
      status.textContent = '';
      return;
    }
    try {
      output.value = PURE.formatJson(input.value, {
        indent: indentSel.value,
        sort: sortCheck.checked,
      });
      const sizeKb = (new Blob([output.value]).size / 1024).toFixed(2);
      status.innerHTML = `<span style="color:#22c55e;">${SVG_ICONS.mi_check} ${L ? `Veljaven JSON (${sizeKb} KB)` : `Valid JSON (${sizeKb} KB)`}</span>`;
    } catch (e) {
      output.value = '';
      status.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${escapeHtml(e.message)}</span>`;
    }
  }
  [input, indentSel, sortCheck].forEach(el => el.addEventListener('input', update));
  container.querySelector('#jf-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#jf-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#jf-copy'));
  });
  update();
}

function renderHtmlEntities(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Način:' : 'Mode:'}
        <select id="he-mode">
          <option value="encode">${L ? 'Kodiraj (znaki → entitete &amp;)' : 'Encode (chars to entities)'}</option>
          <option value="decode">${L ? 'Dekodiraj (entitete → znaki)' : 'Decode (entities to chars)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="he-all"> ${L ? 'Kodiraj tudi šumnike in nestandardne znake' : 'Encode non-ASCII characters'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="he-input">${getI('ui_input')}</label>
        <textarea id="he-input" placeholder="${L ? 'Vnesite besedilo ali HTML...' : 'Enter text or HTML...'}">&lt;div class="glava"&gt;Pozdravljeni! &copy; 2026 &bull; Čao &amp; živjo&lt;/div&gt;</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="he-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="he-output">${getI('ui_output')}</label>
        <textarea id="he-output" readonly placeholder="${L ? 'Rezultat entitet...' : 'Entities result...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="he-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#he-input');
  const mode = container.querySelector('#he-mode');
  const allCheck = container.querySelector('#he-all');
  const output = container.querySelector('#he-output');

  function update() {
    output.value = PURE.htmlEntities(input.value, {
      mode: mode.value,
      encodeAll: allCheck.checked,
    });
  }
  const safe = safeUpdate(update, container);
  [input, mode, allCheck].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#he-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  container.querySelector('#he-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#he-copy'));
  });
  update();
}

function renderMarkdownPreview(container) {
  const L = currentLang === 'sl';
  const sample = `# Besedomat Markdown\n\nSodobno spletno orodje za urejanje in analizo besedil.\n\n## Značilnosti\n\n- **Hitro** in lokalno v brskalniku\n- *Varno* brez pošiljanja na strežnike\n- Široka paleta več kot 80 orodij\n\n> Besede imajo moč. Oblikujte jih z lahkoto.\n\n\`\`\`javascript\nconsole.log("Pozdravljen svet!");\n\`\`\`\n\n| Orodje | Kategorija | Podpora |\n| --- | --- | --- |\n| Števec besed | Analiza | 100% |\n| Markdown | Oblikovanje | 100% |`;

  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="mp-input">${L ? 'Markdown koda' : 'Markdown Source'}</label>
        <textarea id="mp-input" placeholder="${L ? 'Vnesite Markdown besedilo...' : 'Enter Markdown text...'}" style="font-family:monospace;">${sample}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="mp-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'HTML Predogled v živo' : 'Live HTML Preview'}</label>
        <div id="mp-preview" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; overflow-y:auto; min-height:220px; line-height:1.6;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="mp-copy-html" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj HTML' : 'Copy HTML'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#mp-input');
  const preview = container.querySelector('#mp-preview');
  let updatePromise = null;

  async function update() {
    const text = input.value;
    let html;
    if (text.length > HEAVY_LIMIT) {
      showToolBusy(container, true);
      try {
        html = await runHeavy('markdown', text);
      } catch (e) {
        html = PURE.parseMarkdown(text);
      }
      showToolBusy(container, false);
    } else {
      html = PURE.parseMarkdown(text);
    }
    preview.innerHTML = html;
  }

  function debouncedUpdate() {
    clearTimeout(updatePromise);
    updatePromise = setTimeout(update, 100);
  }
  const safe = safeUpdate(debouncedUpdate, container);
  input.addEventListener('input', safe);
  container.querySelector('#mp-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  container.querySelector('#mp-copy-html').addEventListener('click', () => {
    copyText(preview.innerHTML, container.querySelector('#mp-copy-html'));
  });
  update();
}

function renderPatternExtractor(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Izvleci:' : 'Extract:'}
        <select id="pe-type">
          <option value="email">E-poštne naslove (Emails)</option>
          <option value="url">Spletne povezave (URLs / Links)</option>
          <option value="phone">${L ? 'Telefonske številke' : 'Phone numbers'}</option>
          <option value="hashtag">Hashtage (#oznake)</option>
          <option value="mention">Oznake uporabnikov (@mentions)</option>
          <option value="ip">IP naslove (IPv4)</option>
          <option value="number">${L ? 'Vse številke' : 'All numbers'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="pe-unique" checked> ${L ? 'Samo edinstvene (brez dvojnikov)' : 'Unique only'}</label>
      <label><input type="checkbox" id="pe-sort" checked> ${L ? 'Razvrsti po abecedi' : 'Sort alphabetically'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="pe-input">${getI('ui_input')}</label>
        <textarea id="pe-input" placeholder="${L ? 'Prilepite besedilo z e-naslovi, povezavami ali telefoni...' : 'Paste text containing emails, links, or numbers...'}">Pozdravljeni! Pišite nam na info@besedomat.si ali podpora@primer.com. Obiščite https://besedomat.si in https://google.com za več informacij. Pokličite nas na +386 1 234 5678 ali 040 123 456. Spremljajte #besedomat in #orodja na @besedomat!</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="pe-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <label for="pe-output" style="margin:0;">${getI('ui_output')}</label>
          <span id="pe-count" style="font-size:12px; color:var(--text-dim);"></span>
        </div>
        <textarea id="pe-output" readonly placeholder="${L ? 'Izvlečeni podatki...' : 'Extracted data...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="pe-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#pe-input');
  const typeSel = container.querySelector('#pe-type');
  const uniqueCheck = container.querySelector('#pe-unique');
  const sortCheck = container.querySelector('#pe-sort');
  const output = container.querySelector('#pe-output');
  const count = container.querySelector('#pe-count');

  const patterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    url: /https?:\/\/[^\s/$.?#].[^\s]*/gi,
    phone:
      /(?:\+|00)\d{1,3}[- .]?(?:\(\d{1,4}\)|\d{1,4})(?:[- .]?\d{2,4}){1,4}|\(0?\d{1,4}\)(?:[- .]?\d{2,4}){2,3}|0\d{1,3}(?:[- .]?\d{2,4}){2,3}/g,
    hashtag: /#[\p{L}\p{N}_]+/gu,
    mention: /@[\p{L}\p{N}_]+/gu,
    ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    number: /-?\d+(?:[.,]\d+)?/g,
  };

  function update() {
    output.value = PURE.extractPatterns(input.value, {
      mode: typeSel.value,
      unique: uniqueCheck.checked,
      sort: sortCheck.checked,
    });
    const matches = output.value ? output.value.split('\n') : [];
    count.textContent = matches.length + ' ' + (L ? 'zadetkov' : 'found');
  }
  const safe = safeUpdate(update, container);
  [input, typeSel, uniqueCheck, sortCheck].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#pe-clear').addEventListener('click', () => {
    input.value = '';
    safe();
    input.focus();
  });
  container.querySelector('#pe-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#pe-copy'));
  });
  update();
}

function renderDiff(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="df-a">${L ? 'Izvirno besedilo' : 'Original text'}</label>
        <textarea id="df-a" placeholder="${L ? 'Prvo besedilo...' : 'First text...'}" style="min-height:200px;"></textarea>
      </div>
      <div class="tool-panel">
        <label for="df-b">${L ? 'Novo besedilo' : 'New text'}</label>
        <textarea id="df-b" placeholder="${L ? 'Drugo besedilo...' : 'Second text...'}" style="min-height:200px;"></textarea>
      </div>
    </div>
    <div class="tool-panel" style="margin-top:14px;">
      <label>${L ? 'Razlika (Diff)' : 'Difference (Diff)'}</label>
      <div id="df-out" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; font-family:'Courier New',monospace; font-size:13px; line-height:1.6; white-space:pre-wrap; overflow-y:auto; max-height:360px;"></div>
      <div class="panel-actions">
        <button class="btn-sm primary" id="df-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
  const a = container.querySelector('#df-a');
  const b = container.querySelector('#df-b');
  const out = container.querySelector('#df-out');
  let updatePromise = null;

  async function update() {
    const textA = a.value,
      textB = b.value;
    let rows;
    if (textA.length + textB.length > HEAVY_LIMIT) {
      showToolBusy(container, true);
      try {
        rows = await runHeavy('diff', { a: textA, b: textB });
      } catch (e) {
        rows = PURE.diffLines(textA, textB);
      }
      showToolBusy(container, false);
    } else {
      rows = PURE.diffLines(textA, textB);
    }
    out.innerHTML = rows
      .map(r => {
        const color = r.t === '-' ? '#ef4444' : r.t === '+' ? '#22c55e' : 'var(--text-dim)';
        return `<div style="color:${color};">${r.t} ${escapeHtml(r.v) || ' '}</div>`;
      })
      .join('');
  }

  function debouncedUpdate() {
    clearTimeout(updatePromise);
    updatePromise = setTimeout(update, 100);
  }
  const safe = safeUpdate(debouncedUpdate, container);
  [a, b].forEach(el => el.addEventListener('input', safe));
  container.querySelector('#df-copy').addEventListener('click', () => {
    copyText(out.textContent, container.querySelector('#df-copy'));
  });
  safe();
}

function renderColorConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-panel">
      <label for="cc-input">${L ? 'Vnesi barvo (HEX, RGB ali HSL)' : 'Enter color (HEX, RGB or HSL)'}</label>
      <input id="cc-input" type="text" placeholder="#ff0000 / 255,0,0 / hsl(0,100%,50%)" />
      <div class="panel-actions">
        <button class="btn-sm primary" id="cc-go">${L ? 'Pretvori' : 'Convert'}</button>
      </div>
    </div>
    <div class="tool-panel" style="margin-top:14px;">
      <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
        <div id="cc-swatch" style="width:60px; height:60px; border-radius:12px; border:1px solid var(--border);"></div>
        <div style="font-family:'Courier New',monospace; font-size:14px; line-height:1.8;">
          <div>HEX: <span id="cc-hex"></span></div>
          <div>RGB: <span id="cc-rgb"></span></div>
          <div>HSL: <span id="cc-hsl"></span></div>
        </div>
      </div>
      <div id="cc-err" class="err-banner" style="display:none;"></div>
    </div>
  `;
  const input = container.querySelector('#cc-input');
  const hexEl = container.querySelector('#cc-hex');
  const rgbEl = container.querySelector('#cc-rgb');
  const hslEl = container.querySelector('#cc-hsl');
  const swatch = container.querySelector('#cc-swatch');
  const errEl = container.querySelector('#cc-err');

  function update() {
    const info = PURE.colorInfo(input.value);
    if (!info) {
      errEl.style.display = 'block';
      errEl.textContent = L ? 'Neveljavna barva.' : 'Invalid color.';
      return;
    }
    errEl.style.display = 'none';
    hexEl.textContent = info.hex;
    rgbEl.textContent = `rgb(${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b})`;
    hslEl.textContent = `hsl(${info.hsl.h}, ${info.hsl.s}%, ${info.hsl.l}%)`;
    swatch.style.background = info.hex;
  }
  const safe = safeUpdate(update, container);
  input.addEventListener('input', safe);
  container.querySelector('#cc-go').addEventListener('click', safe);
  safe();
}

function renderChecksum(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-panel">
      <label for="cs-input">${L ? 'Besedilo' : 'Text'}</label>
      <textarea id="cs-input" placeholder="${L ? 'Vnesite ali prilepite besedilo...' : 'Type or paste text...'}" style="min-height:180px;"></textarea>
      <label for="cs-algo" style="margin-top:10px;">${L ? 'Algoritem' : 'Algorithm'}</label>
      <select id="cs-algo">
        <option value="sha256">SHA-256</option>
        <option value="sha1">SHA-1</option>
        <option value="sha512">SHA-512</option>
        <option value="crc32">CRC32</option>
      </select>
    </div>
    <div class="tool-panel" style="margin-top:14px;">
      <label for="cs-output">${L ? 'Zgoščevalna vrednost (hash)' : 'Checksum (hash)'}</label>
      <textarea id="cs-output" readonly style="font-family:'Courier New',monospace;"></textarea>
      <div class="panel-actions">
        <button class="btn-sm primary" id="cs-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
  const input = container.querySelector('#cs-input');
  const algoSel = container.querySelector('#cs-algo');
  const output = container.querySelector('#cs-output');

  function update() {
    const algo = algoSel.value;
    const text = input.value;
    if (algo === 'crc32') {
      output.value = PURE.crc32(text);
      return;
    }
    if (algo === 'sha256' && !crypto?.subtle?.digest) {
      output.value = PURE.sha256(text);
      return;
    }
    output.value = L ? 'Računam…' : 'Computing…';
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      crypto.subtle
        .digest(algo, new TextEncoder().encode(text))
        .then(h => {
          output.value = PURE.bufferToHex(h);
        })
        .catch(e => {
          output.value = '';
          showToolErrorBanner(container, e && e.message ? e.message : String(e));
        });
    } else {
      output.value = L
        ? 'SHA-1/512 zahtevajo varno okolje (https/localhost).'
        : 'SHA-1/512 require secure context (https/localhost).';
    }
  }
  const safe = safeUpdate(update, container);
  [input, algoSel].forEach(el => el.addEventListener('input', safe));
  container
    .querySelector('#cs-copy')
    .addEventListener('click', () => copyText(output.value, container.querySelector('#cs-copy')));
  safe();
}

function renderUrlParser(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="up-input">${L ? 'URL Naslov' : 'URL String'}</label>
        <textarea id="up-input" rows="4" placeholder="https://example.com:8080/path/page.html?user=janez&theme=dark#section-1" style="min-height:100px;">https://besedomat.si:443/orodja/analiza?lang=sl&tab=stats#results</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="up-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Razčlenjene komponente URL' : 'Parsed URL Components'}</label>
        <div id="up-result" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; flex:1; overflow-y:auto; font-size:13px;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="up-copy-json" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj kot JSON' : 'Copy JSON'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#up-input');
  const result = container.querySelector('#up-result');
  let lastJson = '';

  function update() {
    let raw = input.value.trim();
    if (!raw) {
      result.innerHTML = '';
      return;
    }
    if (!/^https?:\/\//i.test(raw) && !raw.startsWith('/')) raw = 'https://' + raw;
    try {
      const u = new URL(raw, 'https://localhost');
      const params = Array.from(u.searchParams.entries());
      const obj = {
        href: u.href,
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port || '(default)',
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        params: Object.fromEntries(params),
      };
      lastJson = JSON.stringify(obj, null, 2);

      result.innerHTML = `
            <div style="display:grid; grid-template-columns:110px 1fr; gap:6px 10px; margin-bottom:12px;">
              <strong>Protokol:</strong> <code>${escapeHtml(u.protocol)}</code>
              <strong>Gostitelj:</strong> <code>${escapeHtml(u.host)}</code>
              <strong>Vrata (Port):</strong> <code>${escapeHtml(u.port || 'privzeto')}</code>
              <strong>Pot (Path):</strong> <code>${escapeHtml(u.pathname)}</code>
              <strong>Hash sidro:</strong> <code>${escapeHtml(u.hash || '(brez)')}</code>
            </div>
            ${
              params.length > 0
                ? `
              <strong style="display:block; margin-bottom:6px;">URL Parametri (${params.length}):</strong>
              <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <thead><tr style="border-bottom:1px solid var(--border); text-align:left;"><th style="padding:4px;">Ključ</th><th style="padding:4px;">Vrednost</th></tr></thead>
                <tbody>
                  ${params.map(([k, v]) => `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);"><td style="padding:4px; font-weight:600; color:var(--violet);">${escapeHtml(k)}</td><td style="padding:4px; font-family:monospace;">${escapeHtml(v)}</td></tr>`).join('')}
                </tbody>
              </table>
            `
                : `<div style="color:var(--text-dim); font-size:12px;">Ni URL parametrov (?query).</div>`
            }
          `;
    } catch (e) {
      result.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven URL format.' : 'Invalid URL.'}</span>`;
    }
  }
  input.addEventListener('input', update);
  container.querySelector('#up-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#up-copy-json').addEventListener('click', () => {
    if (!lastJson) return;
    copyText(lastJson, container.querySelector('#up-copy-json'));
  });
  update();
}

function renderJwtDecoder(container) {
  const L = currentLang === 'sl';
  const sampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmV6IE5vdmFrIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzk4NzU0ODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  container.innerHTML = `
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="jwt-input">${L ? 'Vnesite JWT Žeton (Token)' : 'JWT Token'}</label>
        <textarea id="jwt-input" rows="6" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="font-family:monospace; word-break:break-all;">${sampleJwt}</textarea>
        <div id="jwt-status" style="font-size:12px; margin-top:4px;"></div>
        <div class="panel-actions">
          <button class="btn-sm" id="jwt-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Dekodirani Header in Payload' : 'Decoded Header & Payload'}</label>
        <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
          <div>
            <div style="font-size:11px; font-weight:700; color:var(--text-dim); margin-bottom:4px;">HEADER (Algoritem & Tip)</div>
            <textarea id="jwt-header" readonly rows="3" style="font-family:monospace; font-size:12px; min-height:60px;"></textarea>
          </div>
          <div style="flex:1; display:flex; flex-direction:column;">
            <div style="font-size:11px; font-weight:700; color:var(--text-dim); margin-bottom:4px;">PAYLOAD (Podatki & Zahtevki)</div>
            <textarea id="jwt-payload" readonly style="font-family:monospace; font-size:12px; flex:1; min-height:120px;"></textarea>
          </div>
        </div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="jwt-copy-payload" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj Payload' : 'Copy Payload'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#jwt-input');
  const headEl = container.querySelector('#jwt-header');
  const payEl = container.querySelector('#jwt-payload');
  const status = container.querySelector('#jwt-status');

  function b64DecodeUnicode(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    while (output.length % 4) output += '=';
    return PURE.base64ToUtf8(output);
  }

  function update() {
    const token = input.value.trim();
    if (!token) {
      headEl.value = '';
      payEl.value = '';
      status.textContent = '';
      return;
    }
    const parts = token.split('.');
    if (parts.length < 2) {
      headEl.value = '';
      payEl.value = '';
      status.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven format JWT (manjkajo ločilne pike).' : 'Invalid JWT format (missing dots).'}</span>`;
      return;
    }
    try {
      const header = JSON.parse(b64DecodeUnicode(parts[0]));
      const payload = JSON.parse(b64DecodeUnicode(parts[1]));
      headEl.value = JSON.stringify(header, null, 2);
      payEl.value = JSON.stringify(payload, null, 2);

      let expInfo = '';
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const isExp = expDate < new Date();
        expInfo = isExp ? (L ? ' (potekel!)' : ' (expired!)') : L ? ' (veljaven)' : ' (valid)';
      }
      status.innerHTML = `<span style="color:#22c55e;">${SVG_ICONS.mi_check} ${L ? `Algoritem: ${escapeHtml(header.alg || 'N/A')}${expInfo}` : `Algorithm: ${escapeHtml(header.alg || 'N/A')}${expInfo}`}</span>`;
    } catch (e) {
      headEl.value = '';
      payEl.value = '';
      status.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Napaka pri dekodiranju Base64 / JSON.' : 'Error decoding JWT.'}</span>`;
    }
  }
  input.addEventListener('input', update);
  container.querySelector('#jwt-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#jwt-copy-payload').addEventListener('click', () => {
    copyText(payEl.value, container.querySelector('#jwt-copy-payload'));
  });
  update();
}

function renderCodePoints(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Format izpisa:' : 'Format:'}
        <select id="cp-fmt">
          <option value="uplus">U+XXXX (U+010C U+0160)</option>
          <option value="hex">\\uXXXX (\\u010c\\u0161)</option>
          <option value="dec">Decimal (268 352)</option>
          <option value="html">&#xXXXX; (&#x10C;&#x160;)</option>
        </select>
      </label>
      <label>${L ? 'Ločilo:' : 'Separator:'}
        <select id="cp-sep">
          <option value="space">${L ? 'Presledek' : 'Space'}</option>
          <option value="comma">${L ? 'Vejica' : 'Comma'}</option>
          <option value="newline">${L ? 'Nova vrstica' : 'New line'}</option>
          <option value="none">${L ? 'Brez' : 'None'}</option>
        </select>
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="cp-input">${getI('ui_input')}</label>
        <textarea id="cp-input" placeholder="${L ? 'Vnesite besedilo...' : 'Enter text...'}">ČŠŽ čšž ✨ 2026</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="cp-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="cp-output">${getI('ui_output')}</label>
        <textarea id="cp-output" readonly placeholder="${L ? 'Kodne točke...' : 'Code points...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="cp-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#cp-input');
  const fmt = container.querySelector('#cp-fmt');
  const sep = container.querySelector('#cp-sep');
  const output = container.querySelector('#cp-output');

  function update() {
    const text = input.value;
    const f = fmt.value;
    const s =
      sep.value === 'space'
        ? ' '
        : sep.value === 'comma'
          ? ', '
          : sep.value === 'newline'
            ? '\n'
            : '';
    const chars = [...text];
    const res = chars.map(c => {
      const cp = c.codePointAt(0);
      if (f === 'uplus') return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
      if (f === 'hex') return '\\u' + cp.toString(16).padStart(4, '0');
      if (f === 'dec') return String(cp);
      if (f === 'html') return '&#x' + cp.toString(16).toUpperCase() + ';';
      return String(cp);
    });
    output.value = res.join(s);
  }
  [input, fmt, sep].forEach(el => el.addEventListener('input', update));
  container.querySelector('#cp-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#cp-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#cp-copy'));
  });
  update();
}

function renderDateTimeConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <button class="btn-sm" id="dt-now" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Trenutni čas (Zdaj)' : 'Current time (Now)'}</span></button>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="dt-input">${L ? 'Vnos datuma / Unix timestamp' : 'Date input or Unix timestamp'}</label>
        <textarea id="dt-input" rows="4" placeholder="2026-08-20T12:00:00Z ali 1787227200" style="min-height:100px;">${new Date().toISOString()}</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="dt-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${L ? 'Pretvorjeni formati' : 'Converted Date Formats'}</label>
        <div id="dt-formats" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; flex:1; font-size:13px; line-height:1.8;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="dt-copy-iso" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj ISO 8601' : 'Copy ISO'}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#dt-input');
  const formats = container.querySelector('#dt-formats');
  const nowBtn = container.querySelector('#dt-now');
  let isoString = '';

  function update() {
    const val = input.value.trim();
    if (!val) {
      formats.innerHTML = '';
      return;
    }
    let d;
    if (/^\d{10}$/.test(val)) d = new Date(parseInt(val) * 1000);
    else if (/^\d{13}$/.test(val)) d = new Date(parseInt(val));
    else d = new Date(val);

    if (isNaN(d.getTime())) {
      formats.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven datum ali čas.' : 'Invalid date format.'}</span>`;
      return;
    }

    isoString = d.toISOString();
    const unixSec = Math.floor(d.getTime() / 1000);
    const unixMs = d.getTime();
    const localSl = d.toLocaleString('sl-SI');
    const utc = d.toUTCString();

    formats.innerHTML = `
          <div><strong>ISO 8601:</strong> <code>${isoString}</code></div>
          <div><strong>Unix Timestamp (sekunde):</strong> <code>${unixSec}</code></div>
          <div><strong>Unix Timestamp (milisekunde):</strong> <code>${unixMs}</code></div>
          <div><strong>Lokalni čas (sl-SI):</strong> <code>${localSl}</code></div>
          <div><strong>UTC čas:</strong> <code>${utc}</code></div>
        `;
  }

  input.addEventListener('input', update);
  nowBtn.addEventListener('click', () => {
    input.value = new Date().toISOString();
    update();
  });
  container.querySelector('#dt-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#dt-copy-iso').addEventListener('click', () => {
    if (!isoString) return;
    copyText(isoString, container.querySelector('#dt-copy-iso'));
  });
  update();
}

function renderTableConverter(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Ciljni format:' : 'Target format:'}
        <select id="tc-format">
          <option value="markdown">Markdown Tabela (| col |)</option>
          <option value="html">&lt;table&gt; HTML</option>
          <option value="ascii">ASCII Box Tabela (+---+)</option>
          <option value="json">JSON Array of Objects</option>
        </select>
      </label>
      <label>${L ? 'Vhodno ločilo:' : 'Input delimiter:'}
        <select id="tc-delim">
          <option value="tab">${L ? 'Tabulator (Excel/Sheets kopiranje)' : 'Tab (Excel copy)'}</option>
          <option value="comma">${L ? 'Vejica (CSV)' : 'Comma (CSV)'}</option>
          <option value="semicolon">${L ? 'Podpičje (;)' : 'Semicolon (;)'}</option>
          <option value="pipe">${L ? 'Navpičnica (|)' : 'Pipe (|)'}</option>
        </select>
      </label>
      <label><input type="checkbox" id="tc-header" checked> ${L ? 'Prva vrstica je glava' : 'First row is header'}</label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="tc-input">${getI('ui_input')}</label>
        <textarea id="tc-input" placeholder="${L ? 'Prilepite tabelarične podatke...' : 'Paste table data...'}">Mesto\tPrebivalci\tRegija\nLjubljana\t293000\tOsrednjeslovenska\nMaribor\t112000\tPodravska\nCelje\t49000\tSavinjska</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="tc-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label for="tc-output">${getI('ui_output')}</label>
        <textarea id="tc-output" readonly placeholder="${L ? 'Pretvorjena tabela...' : 'Converted table...'}"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="tc-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
  const input = container.querySelector('#tc-input');
  const fmtSel = container.querySelector('#tc-format');
  const delimSel = container.querySelector('#tc-delim');
  const hasHeader = container.querySelector('#tc-header');
  const output = container.querySelector('#tc-output');

  function update() {
    const raw = input.value.trim();
    if (!raw) {
      output.value = '';
      return;
    }
    const d =
      delimSel.value === 'tab'
        ? '\t'
        : delimSel.value === 'comma'
          ? ','
          : delimSel.value === 'semicolon'
            ? ';'
            : '|';
    const rows = raw.split('\n').map(r => r.split(d).map(c => c.trim()));
    if (rows.length === 0) return;

    const maxCols = Math.max(...rows.map(r => r.length));
    const normalized = rows.map(r => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    const f = fmtSel.value;
    if (f === 'markdown') {
      const mdCell = c => String(c).replace(/\|/g, '\\|');
      let res = '| ' + normalized[0].map(mdCell).join(' | ') + ' |\n';
      res += '| ' + normalized[0].map(() => '---').join(' | ') + ' |\n';
      for (let i = 1; i < normalized.length; i++) {
        res += '| ' + normalized[i].map(mdCell).join(' | ') + ' |\n';
      }
      output.value = res;
    } else if (f === 'html') {
      let res = '<table>\n';
      if (hasHeader.checked && normalized.length > 0) {
        res +=
          '  <thead>\n    <tr>' +
          normalized[0].map(c => `<th>${escapeHtml(c)}</th>`).join('') +
          '</tr>\n  </thead>\n  <tbody>\n';
        for (let i = 1; i < normalized.length; i++) {
          res +=
            '    <tr>' + normalized[i].map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>\n';
        }
        res += '  </tbody>\n</table>';
      } else {
        res += '  <tbody>\n';
        normalized.forEach(r => {
          res += '    <tr>' + r.map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>\n';
        });
        res += '  </tbody>\n</table>';
      }
      output.value = res;
    } else if (f === 'json') {
      if (hasHeader.checked && normalized.length > 1) {
        const headers = normalized[0];
        const arr = normalized.slice(1).map(r => {
          const obj = {};
          headers.forEach((h, idx) => (obj[h || 'col_' + idx] = r[idx] || ''));
          return obj;
        });
        output.value = JSON.stringify(arr, null, 2);
      } else {
        output.value = JSON.stringify(normalized, null, 2);
      }
    } else if (f === 'ascii') {
      const colWidths = [];
      for (let c = 0; c < maxCols; c++) {
        colWidths[c] = Math.max(...normalized.map(r => (r[c] || '').length), 3);
      }
      const sep = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
      let res = sep + '\n';
      normalized.forEach((r, idx) => {
        res += '| ' + r.map((c, i) => (c || '').padEnd(colWidths[i])).join(' | ') + ' |\n';
        if (idx === 0 && hasHeader.checked) res += sep + '\n';
      });
      res += sep;
      output.value = res;
    }
  }
  [input, fmtSel, delimSel, hasHeader].forEach(el => el.addEventListener('input', update));
  container.querySelector('#tc-clear').addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  container.querySelector('#tc-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#tc-copy'));
  });
  update();
}

function renderPlayfair(container) {
  const L = currentLang === 'sl';
  container.innerHTML = `
        <div class="tool-workspace-2col">
          <div class="tool-panel">
            <label>${L ? 'Ključna beseda' : 'Keyword'}</label>
            <input type="text" id="pf-key" value="${L ? 'TAJNA' : 'SECRET'}" style="margin-bottom:10px;">
            <label>${L ? 'Način' : 'Mode'}</label>
            <select id="pf-mode" style="margin-bottom:10px;">
              <option value="enc">${L ? 'Šifriraj' : 'Encrypt'}</option>
              <option value="dec">${L ? 'Odšifriraj' : 'Decrypt'}</option>
            </select>
            <label for="pf-input">${L ? 'Besedilo' : 'Text'}</label>
            <textarea id="pf-input" placeholder="${L ? 'Vnesite besedilo...' : 'Type text...'}"></textarea>
            <div class="panel-actions">
              <button class="btn-sm" id="pf-clear">${SVG_ICONS.mi_trash} <span>${L ? 'Počisti' : 'Clear'}</span></button>
            </div>
          </div>
          <div class="tool-panel">
            <label for="pf-output">${L ? 'Rezultat' : 'Result'}</label>
            <textarea id="pf-output" readonly placeholder="${L ? 'Rezultat bo prikazan tukaj...' : 'Result will appear here...'}"></textarea>
            <div class="panel-actions">
              <button class="btn-sm primary" id="pf-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
            </div>
          </div>
        </div>
      `;
  const keyEl = container.querySelector('#pf-key');
  const modeEl = container.querySelector('#pf-mode');
  const input = container.querySelector('#pf-input');
  const out = container.querySelector('#pf-output');

  const buildMatrix = key => {
    const clean = (key || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .replace(/J/g, 'I');
    const seen = [];
    for (const c of clean + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
      if (!seen.includes(c)) seen.push(c);
    }
    const m = [];
    for (let i = 0; i < 5; i++) m.push(seen.slice(i * 5, i * 5 + 5));
    const pos = {};
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) pos[m[r][c]] = [r, c];
    return { m, pos };
  };
  const process = (text, key, decrypt) => {
    const { m, pos } = buildMatrix(key);
    const clean = (text || '').toUpperCase().replace(/[^A-Z]/g, '');
    const pairs = [];
    for (let i = 0; i < clean.length; i += 2) {
      let a = clean[i],
        b = clean[i + 1] || 'X';
      if (a === b) {
        b = 'X';
        i--;
      }
      pairs.push([a, b]);
    }
    let res = '';
    for (const [a, b] of pairs) {
      const [ar, ac] = pos[a] || [0, 0],
        [br, bc] = pos[b] || [0, 0];
      let na, nb;
      if (ar === br) {
        na = [ar, (ac + 1) % 5];
        nb = [br, (bc + 1) % 5];
      } else if (ac === bc) {
        na = [(ar + 1) % 5, ac];
        nb = [(br + 1) % 5, bc];
      } else {
        na = [ar, bc];
        nb = [br, ac];
      }
      if (decrypt) {
        if (ar === br) {
          na = [ar, (ac + 4) % 5];
          nb = [br, (bc + 4) % 5];
        } else if (ac === bc) {
          na = [(ar + 4) % 5, ac];
          nb = [(br + 4) % 5, bc];
        } else {
          na = [ar, bc];
          nb = [br, ac];
        }
      }
      res += m[na[0]][na[1]] + m[nb[0]][nb[1]];
    }
    return res;
  };
  const update = () => {
    const text = input.value;
    if (!text.trim()) {
      out.value = '';
      announceResult(0);
      return;
    }
    out.value = process(text, keyEl.value, modeEl.value === 'dec');
    announceResult(out.value.length);
  };
  input.addEventListener('input', update);
  keyEl.addEventListener('input', update);
  modeEl.addEventListener('change', update);
  container.querySelector('#pf-clear').addEventListener('click', () => {
    input.value = '';
    out.value = '';
    input.focus();
  });
  container.querySelector('#pf-copy').addEventListener('click', () => {
    copyText(out.value, container.querySelector('#pf-copy'));
  });
  update();
  const pfFirst = container.querySelector('input, textarea, button, select');
  if (pfFirst) pfFirst.focus();
}
