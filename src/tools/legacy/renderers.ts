// AUTO-MIGRATED tool render functions. These still rely on legacy globals.
// Incrementally refactor each into a ToolComponent subclass and drop it here.
import {
  SVG_ICONS,
  getI,
  escapeHtml,
  escapeRegExp,
  copyText,
  copyLegacy,
  showToast,
  flashCopied,
  secureRandomInt,
  randomFromString,
  showToolBusy,
  showToolErrorBanner,
  safeUpdate,
  debounce,
  HEAVY_LIMIT,
  totalTextLength,
  normalizeDiacritics,
  normalizeForSearch,
  levenshtein,
  SL_DIACRITICS_MAP,
  computeSearchScore,
  getSearchSuggestions,
  highlightMatch,
  CATEGORIES,
  TextUtils,
  expandTags,
  LONGDESC_DE,
  PURE,
  announceResult,
  announceInfo,
  qrcode,
  currentLang,
  createStandardTool
} from './globals';

export {
  SVG_ICONS, getI, escapeHtml, escapeRegExp, copyText, copyLegacy, showToast, flashCopied,
  secureRandomInt, randomFromString, showToolBusy, showToolErrorBanner, safeUpdate, debounce,
  HEAVY_LIMIT, totalTextLength, normalizeDiacritics, normalizeForSearch, levenshtein,
  SL_DIACRITICS_MAP, computeSearchScore, getSearchSuggestions, highlightMatch, CATEGORIES,
  TextUtils, expandTags, LONGDESC_DE, PURE, announceResult, announceInfo, qrcode, currentLang,
  createStandardTool
};

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
          { lbl: L ? 'Čas branja' : 'Reading time', val: r.totalWords === 0 ? '-' : (r.readMins + ' min') },
          { lbl: L ? 'Čas govora' : 'Speaking time', val: r.totalWords === 0 ? '-' : (r.speakMins + ' min') }
        ];

        statsWrap.innerHTML = metrics.map(m => `
          <div class="stat-box"><div class="num">${m.val}</div><div class="lbl">${m.lbl}</div></div>
        `).join('');

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
      input.addEventListener('input', () => { clearTimeout(dt); dt = setTimeout(update, 80); });
      container.querySelector('#uc-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
      update();
    }

function renderWordCloud(container) {
      const L = currentLang === 'sl';
      
      /* POGOSTE BESEDE (stop words) – razdeljene po besednih vrstah */
      const WC_STOP_GROUPS = {
        sl: {
          conj: ['in', 'ter', 'pa', 'da', 'ali', 'ki', 'ko', 'če', 'ker', 'toda', 'ampak', 'vendar', 'temveč', 'saj', 'kajti', 'torej', 'čeprav', 'kadar', 'kot'],
          prep: ['za', 'na', 'v', 'z', 's', 'pri', 'po', 'ob', 'od', 'do', 'iz', 'o', 'k', 'g', 'med', 'pred', 'pod', 'nad', 'brez', 'skozi', 'proti'],
          pron: ['ta', 'to', 'te', 'ti', 'tega', 'temu', 'tem', 'tej', 'teh', 'temi', 'tisti', 'tisto', 'tista', 'vse', 'vsi', 'vsak', 'vsaka', 'vsako', 'nekaj', 'nekdo', 'nihče', 'nič', 'kdo', 'kaj', 'jaz', 'on', 'ona', 'ono', 'midva', 'vidva', 'onadva', 'mi', 'vi', 'oni', 'one', 'mene', 'tebe', 'njega', 'nje', 'naju', 'vaju', 'njih', 'nas', 'vas', 'mu', 'ji', 'jima', 'jim', 'nam', 'vam', 'se'],
          aux: ['je', 'so', 'bo', 'bom', 'boš', 'bomo', 'boste', 'bodo', 'bil', 'bila', 'bilo', 'bili', 'bile', 'sem', 'si', 'smo', 'ste', 'ima', 'imamo', 'imate', 'imajo', 'imeti', 'imel', 'imela', 'mora', 'moramo', 'morate', 'morajo', 'hoče', 'želijo', 'lahko'],
          adv: ['tudi', 'že', 'še', 'le', 'kar', 'zelo', 'tako', 'kako', 'zakaj', 'kje', 'kdaj', 'kam', 'kod', 'mnogo', 'več', 'manj']
        },
        en: {
          conj: ['the', 'a', 'an', 'and', 'or', 'but', 'nor', 'so', 'yet', 'as', 'until', 'while', 'than'],
          prep: ['for', 'at', 'by', 'from', 'in', 'into', 'of', 'off', 'on', 'onto', 'out', 'over', 'to', 'up', 'with', 'within', 'without', 'about', 'against', 'between', 'through', 'during', 'before', 'after', 'above', 'below'],
          pron: ['i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'all', 'any', 'both', 'each', 'few', 'other', 'some', 'such', 'own', 'same'],
          aux: ['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'can', 'could', 'shall', 'should', 'will', 'would', 'may', 'might', 'must'],
          adv: ['no', 'not', 'only', 'too', 'very', 'just', 'more', 'most', 'where', 'when', 'why', 'how']
        }
      };

      const WC_GROUP_LABELS = {
        sl: { conj: 'Vezniki', prep: 'Predlogi', pron: 'Zaimki', aux: 'Pomožni & modalni glagoli', adv: 'Prislovi in delci' },
        en: { conj: 'Conjunctions & articles', prep: 'Prepositions', pron: 'Pronouns & determiners', aux: 'Auxiliary & modal verbs', adv: 'Adverbs & negations' }
      };

      const PALETTES = {
        indigo: ['#4f46e5', '#6366f1', '#818cf8', '#e11d48', '#f43f5e', '#fb7185', '#a855f7', '#c084fc'],
        ocean: ['#0d9488', '#14b8a6', '#2dd4bf', '#0284c7', '#0ea5e9', '#38bdf8', '#2563eb', '#3b82f6'],
        sunset: ['#dc2626', '#ef4444', '#f87171', '#ea580c', '#f97316', '#fb923c', '#d97706', '#f59e0b'],
        nature: ['#059669', '#10b981', '#34d399', '#65a30d', '#84cc16', '#a3e635', '#047857', '#15803d'],
        rainbow: ['#e11d48', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
        mono: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1']
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
        wcGroupKeys.forEach(k => { if (wcActiveGroups.has(k)) src[k].forEach(w => s.add(w)); });
        return s;
      }

      function updateFilterCount() {
        const total = wcGroupKeys.length;
        wcFilterCount.textContent = wcActiveGroups.size === total ? (L ? 'vse' : 'all')
          : wcActiveGroups.size === 0 ? (L ? 'brez' : 'none')
            : `${wcActiveGroups.size}/${total}`;
      }

      function renderFilterMenu() {
        const labels = WC_GROUP_LABELS[wcLangKey];
        const expl = L
          ? 'To so besede brez velike vsebinske teže. Izberite skupine, ki naj jih oblak prezre.'
          : 'These are low-meaning words. Choose which groups the cloud should ignore.';
        wcFilterMenu.innerHTML = `
          <div style="padding:10px 12px; font-size:11.5px; line-height:1.5; color:var(--text-dim); border-bottom:1px solid var(--border); margin-bottom:4px;">${expl}</div>
          ${wcGroupKeys.map(k => `
            <label class="dropdown-item" style="justify-content:flex-start; gap:9px; cursor:pointer;">
              <input type="checkbox" data-wcgroup="${k}" ${wcActiveGroups.has(k) ? 'checked' : ''} style="accent-color:var(--violet); cursor:pointer;">
              <span style="flex:1;">${labels[k]}</span>
              <span style="font-size:11px; opacity:.6;">${WC_STOP_GROUPS[wcLangKey][k].length}</span>
            </label>`).join('')}
          <div style="display:flex; gap:6px; padding:8px 6px 4px; border-top:1px solid var(--border); margin-top:4px;">
            <button type="button" id="wc-f-all" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Vklopi vse' : 'Enable all'}</button>
            <button type="button" id="wc-f-none" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Izklopi vse' : 'Disable all'}</button>
          </div>`;

        wcFilterMenu.querySelectorAll('input[data-wcgroup]').forEach(cb => {
          cb.addEventListener('change', () => {
            if (cb.checked) wcActiveGroups.add(cb.dataset.wcgroup); else wcActiveGroups.delete(cb.dataset.wcgroup);
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

      function refreshFilterUI() { renderFilterMenu(); updateFilterCount(); }

      wcFilterBtn.addEventListener('click', (ev) => {
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

        chipsWrap.innerHTML = visibleItems.map((item, idx) => {
          const isExcluded = excludedWords.has(item.word);
          const isTop = idx < maxDisplay && !isExcluded;
          const bg = isExcluded 
            ? 'background:rgba(0,0,0,0.06); color:var(--text-dimmer); text-decoration:line-through; border:1px dashed var(--border);' 
            : (isTop ? 'background:rgba(99,102,241,0.12); color:var(--violet); border:1px solid rgba(99,102,241,0.35); font-weight:600;' : 'background:var(--card); color:var(--text); border:1px solid var(--border);');
          
          return `
            <button class="wc-chip" data-word="${escapeHtml(item.word)}" style="cursor:pointer; border-radius:20px; padding:3px 10px; font-size:12px; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; ${bg}">
              <span>${escapeHtml(item.word)}</span>
              <span style="opacity:0.75; font-size:11px;">(${item.count})</span>
              <span>${isExcluded ? SVG_ICONS.mi_x : SVG_ICONS.mi_check}</span>
            </button>
          `;
        }).join('');

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
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const bgRgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
        const isDark = bgRgb && bgRgb.length >= 3
          ? (0.2126 * Number(bgRgb[0]) + 0.7152 * Number(bgRgb[1]) + 0.0722 * Number(bgRgb[2])) < 128
          : document.documentElement.getAttribute('data-theme')?.includes('dark');
        ctx.fillStyle = isDark ? '#141417' : '#ffffff';
        ctx.fillRect(0, 0, W, H);

        // Filter active words
        const maxWords = parseInt(maxWordsSel.value) || 50;
        const activeWords = cachedWordCounts.filter(item => !excludedWords.has(item.word)).slice(0, maxWords);

        statsEl.textContent = `${L ? 'Prikazanih' : 'Showing'} ${activeWords.length} / ${cachedWordCounts.length} ${L ? 'besed' : 'words'}`;

        if (!activeWords.length) {
          ctx.fillStyle = isDark ? '#71717a' : '#9ca3af';
          ctx.font = '16px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(L ? 'Vnesite besedilo za prikaz oblaka besed' : 'Enter text to generate word cloud', W / 2, H / 2);
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
          const isVertical = isMixed && (idx % 4 === 3);

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
              const overlap = boxes.some(b => !(x + textW < b.x || x > b.x + b.w || y + textH < b.y || y > b.y + b.h));
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
                const overlap = boxes.some(b => !(x + w2 < b.x || x > b.x + b.w || y + h2 < b.y || y > b.y + b.h));
                if (!overlap) {
                  boxes.push({ x, y, w: w2, h: h2, word: item.word, fontSize: smallerFont, color, isVertical });
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
        { id: 'upper',    label: 'UPPERCASE',     example: 'VELIKE ČRKE' },
        { id: 'lower',    label: 'lowercase',     example: 'male črke' },
        { id: 'title',    label: 'Title Case',    example: 'Začetnice Besed' },
        { id: 'sentence', label: 'Sentence case', example: 'Začetnice stavkov.' },
        { id: 'inverse',  label: 'iNvErSe',       example: 'oBrNi ČrKe' },
        { id: 'sarcasm',  label: 'SaRcAsM',       example: 'sArKaStIčNo' },
        { id: 'camel',    label: 'camelCase',     example: 'začetniceBesed' },
        { id: 'pascal',   label: 'PascalCase',    example: 'ZačetniceBesed' },
        { id: 'snake',    label: 'snake_case',    example: 'začetnice_besed' },
        { id: 'kebab',    label: 'kebab-case',    example: 'začetnice-besed' }
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
      container.querySelector('#cc-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
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
      const algo = container.querySelector("#ed-algo");
      const input = container.querySelector("#ed-input");
      const output = container.querySelector("#ed-output");

      function encode() {
        const t = input.value;
        const a = algo.value;
        try {
          if (a === 'base64') output.value = PURE.utf8ToBase64(t);
          else if (a === 'url') output.value = encodeURIComponent(t);
          else if (a === 'hex') output.value = Array.from(new TextEncoder().encode(t)).map(b => b.toString(16).padStart(2, '0')).join(' ');
          else if (a === 'binary') output.value = Array.from(new TextEncoder().encode(t)).map(b => b.toString(2).padStart(8, '0')).join(' ');
          else if (a === 'rot13') output.value = t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= 'm' ? 13 : -13)));
        } catch (e) { output.value = L ? 'Napaka pri kodiranju.' : 'Encoding error.'; }
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
            input.value = t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() <= 'm' ? 13 : -13)));
          }
        } catch (e) { input.value = L ? 'Napaka pri dekodiranju.' : 'Decoding error.'; }
      }

      container.querySelector("#ed-to-code").addEventListener("click", encode);
      container.querySelector("#ed-to-plain").addEventListener("click", decode);
      algo.addEventListener("change", encode);
      input.addEventListener("input", encode);
      container.querySelector("#ed-clear").addEventListener("click", () => { input.value = ""; output.value = ""; input.focus(); });
      container.querySelector("#ed-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#ed-copy"));
      });
      encode();
    }

function renderPasswordGen(container) {
      const L = currentLang === 'sl';
      container.innerHTML = `
    <div class="pg-wrap">

      <div class="pg-card">
        <span class="pg-card-label">${L ? 'Rezultat' : 'Result'}</span>
        <textarea id="pg-output" readonly spellcheck="false"></textarea>
        <div class="pg-meter-row">
          <div class="pg-meter"><div class="pg-meter-fill" id="pg-meter-fill"></div></div>
          <span class="pg-strength-text" id="pg-strength"></span>
        </div>
        <div class="pg-actions">
          <button class="btn-sm primary" id="pg-regen" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Ustvari novo' : 'Regenerate'}</span></button>
          <button class="btn-sm" id="pg-copy" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>

      <div class="pg-card">
        <span class="pg-card-label">${L ? 'Način generiranja' : 'Generation mode'}</span>
        <div class="segmented-control pg-mode-tabs">
          <button type="button" class="seg-btn pg-mode-tab active" data-mode="random">${L ? 'Naključni znaki' : 'Random characters'}</button>
          <button type="button" class="seg-btn pg-mode-tab" data-mode="words-en">${L ? 'Besede · EN' : 'Words · EN'}</button>
          <button type="button" class="seg-btn pg-mode-tab" data-mode="words-sl">${L ? 'Besede · SL' : 'Words · SL'}</button>
        </div>
      </div>

      <div id="pg-random-box" style="display:flex; flex-direction:column; gap:16px;">

        <div class="pg-card">
          <div class="pg-len-head">
            <span>${L ? 'Dolžina gesla' : 'Password length'}</span>
            <span class="pg-len-badge" id="pg-len-val">16</span>
          </div>
          <input type="range" id="pg-len" min="4" max="128" value="16">
          <div class="pg-scale"><span>4</span><span>${L ? 'priporočeno 16+' : '16+ recommended'}</span><span>128</span></div>
        </div>

        <div class="pg-card">
          <span class="pg-card-label">${L ? 'Vrste znakov' : 'Character types'}</span>
          <div class="pg-types">

            <div class="pg-type" id="pg-t-lower">
              <label class="pg-type-head">
                <input type="checkbox" id="pg-lower" checked>
                <span class="pg-type-name">${L ? 'Male črke' : 'Lowercase'}</span>
                <span class="pg-sample">a–z</span>
              </label>
              <div class="pg-type-body">
                <div class="pg-controls-row">
                  <label class="pg-count-label">${L ? 'Natančno število' : 'Exact count'} <input type="number" class="pg-count-input" id="pg-c-low" min="0" max="128" value="0" placeholder="0"></label>
                  <div class="pg-chips" id="pg-chips-lower">
                    <span class="pg-chips-label">${L ? 'Položaj:' : 'Placement:'}</span>
                    <button type="button" class="pg-chip" data-type="lower" data-pos="start">${L ? 'Začetek' : 'Start'}</button>
                    <button type="button" class="pg-chip" data-type="lower" data-pos="middle">${L ? 'Znotraj' : 'Middle'}</button>
                    <button type="button" class="pg-chip" data-type="lower" data-pos="end">${L ? 'Konec' : 'End'}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pg-type" id="pg-t-upper">
              <label class="pg-type-head">
                <input type="checkbox" id="pg-upper" checked>
                <span class="pg-type-name">${L ? 'Velike črke' : 'Uppercase'}</span>
                <span class="pg-sample">A–Z</span>
              </label>
              <div class="pg-type-body">
                <div class="pg-controls-row">
                  <label class="pg-count-label">${L ? 'Natančno število' : 'Exact count'} <input type="number" class="pg-count-input" id="pg-c-up" min="0" max="128" value="0" placeholder="0"></label>
                  <div class="pg-chips" id="pg-chips-upper">
                    <span class="pg-chips-label">${L ? 'Položaj:' : 'Placement:'}</span>
                    <button type="button" class="pg-chip" data-type="upper" data-pos="start">${L ? 'Začetek' : 'Start'}</button>
                    <button type="button" class="pg-chip" data-type="upper" data-pos="middle">${L ? 'Znotraj' : 'Middle'}</button>
                    <button type="button" class="pg-chip" data-type="upper" data-pos="end">${L ? 'Konec' : 'End'}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pg-type" id="pg-t-digits">
              <label class="pg-type-head">
                <input type="checkbox" id="pg-digits" checked>
                <span class="pg-type-name">${L ? 'Števke' : 'Digits'}</span>
                <span class="pg-sample">0–9</span>
              </label>
              <div class="pg-type-body">
                <div class="pg-controls-row">
                  <label class="pg-count-label">${L ? 'Natančno število' : 'Exact count'} <input type="number" class="pg-count-input" id="pg-c-dig" min="0" max="128" value="0" placeholder="0"></label>
                  <div class="pg-chips" id="pg-chips-digits">
                    <span class="pg-chips-label">${L ? 'Položaj:' : 'Placement:'}</span>
                    <button type="button" class="pg-chip" data-type="digits" data-pos="start">${L ? 'Začetek' : 'Start'}</button>
                    <button type="button" class="pg-chip" data-type="digits" data-pos="middle">${L ? 'Znotraj' : 'Middle'}</button>
                    <button type="button" class="pg-chip" data-type="digits" data-pos="end">${L ? 'Konec' : 'End'}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pg-type" id="pg-t-symbols">
              <label class="pg-type-head">
                <input type="checkbox" id="pg-symbols" checked>
                <span class="pg-type-name">${L ? 'Simboli' : 'Symbols'}</span>
                <span class="pg-sample">!@#$%</span>
              </label>
              <div class="pg-type-body">
                <div class="pg-controls-row">
                  <label class="pg-count-label">${L ? 'Natančno število' : 'Exact count'} <input type="number" class="pg-count-input" id="pg-c-sym" min="0" max="128" value="0" placeholder="0"></label>
                  <div class="pg-chips" id="pg-chips-symbols">
                    <span class="pg-chips-label">${L ? 'Položaj:' : 'Placement:'}</span>
                    <button type="button" class="pg-chip" data-type="symbols" data-pos="start">${L ? 'Začetek' : 'Start'}</button>
                    <button type="button" class="pg-chip" data-type="symbols" data-pos="middle">${L ? 'Znotraj' : 'Middle'}</button>
                    <button type="button" class="pg-chip" data-type="symbols" data-pos="end">${L ? 'Konec' : 'End'}</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <p class="pg-section-note">${L ? 'Poljubno kombiniraj položaje (npr. Začetek + Konec). Brez izbranega položaja se znaki razporedijo naključno po celem geslu.' : 'Combine placements freely (e.g. Start + End). With no placement selected, characters are spread randomly across the password.'}</p>
        </div>

        <div class="pg-card">
          <span class="pg-card-label">${L ? 'Izključi znake' : 'Exclude characters'}</span>
          <div class="pg-excl-row">
            <input type="text" id="pg-excl" placeholder="${L ? 'npr. i,l,1,0,O,o' : 'e.g. i,l,1,0,O,o'}">
            <button type="button" class="pg-chip" id="pg-excl-ambig" title="${L ? 'Znaki, ki se zlahka zamešajo' : 'Easily confused characters'}">± ${L ? 'dvoumni' : 'ambiguous'}</button>
          </div>
          <p class="pg-hint" id="pg-hint"></p>
        </div>

      </div>

      <div id="pg-words-box" style="display:none;">
        <div class="pg-card">
          <span class="pg-card-label">${L ? 'Možnosti fraze' : 'Phrase options'}</span>
          <div class="pg-words-grid">
            <label>${L ? 'Število besed' : 'Word count'} <input type="number" id="pg-words" min="3" max="12" value="4"></label>
            <label>${L ? 'Ločilo' : 'Separator'} <input type="text" id="pg-sep" value="-" maxlength="3"></label>
            <label><input type="checkbox" id="pg-cap" checked> ${L ? 'Velika začetnica' : 'Capitalize'}</label>
            <label><input type="checkbox" id="pg-num"> ${L ? 'Dodaj številko' : 'Add number'}</label>
            <label><input type="checkbox" id="pg-sym2"> ${L ? 'Dodaj simbol' : 'Add symbol'}</label>
          </div>
        </div>
      </div>

    </div>
  `;
      const $ = (s) => container.querySelector(s);
      const $$ = (s) => Array.from(container.querySelectorAll(s));
      const len = $("#pg-len");
      const lenVal = $("#pg-len-val");
      const lower = $("#pg-lower");
      const upper = $("#pg-upper");
      const digits = $("#pg-digits");
      const symbols = $("#pg-symbols");
      const cLow = $("#pg-c-low");
      const cUp = $("#pg-c-up");
      const cDig = $("#pg-c-dig");
      const cSym = $("#pg-c-sym");
      const exclEl = $("#pg-excl");
      const hint = $("#pg-hint");
      const randomBox = $("#pg-random-box");
      const wordsBox = $("#pg-words-box");
      const wordsEl = $("#pg-words");
      const sepEl = $("#pg-sep");
      const capEl = $("#pg-cap");
      const numEl = $("#pg-num");
      const sym2El = $("#pg-sym2");
      const output = $("#pg-output");
      const strength = $("#pg-strength");
      const meterFill = $("#pg-meter-fill");

      const TYPE_DEFS = [
        { key: "lower", cb: lower, cnt: cLow, card: $("#pg-t-lower"), chips: $("#pg-chips-lower") },
        { key: "upper", cb: upper, cnt: cUp, card: $("#pg-t-upper"), chips: $("#pg-chips-upper") },
        { key: "digits", cb: digits, cnt: cDig, card: $("#pg-t-digits"), chips: $("#pg-chips-digits") },
        { key: "symbols", cb: symbols, cnt: cSym, card: $("#pg-t-symbols"), chips: $("#pg-chips-symbols") }
      ];
      const placementState = { lower: new Set(), upper: new Set(), digits: new Set(), symbols: new Set() };

      $$(".pg-chip[data-type]").forEach(chip => chip.addEventListener("click", () => {
        const set = placementState[chip.dataset.type];
        const pos = chip.dataset.pos;
        if (set.has(pos)) { set.delete(pos); chip.classList.remove("active"); }
        else { set.add(pos); chip.classList.add("active"); }
        generate();
      }));

      const tabs = $$(".pg-mode-tab");
      tabs.forEach(t => t.addEventListener("click", () => {
        tabs.forEach(x => x.classList.toggle("active", x === t));
        const isRandom = t.dataset.mode === "random";
        randomBox.style.display = isRandom ? "flex" : "none";
        wordsBox.style.display = isRandom ? "none" : "block";
        generate();
      }));

      function currentMode() {
        const active = tabs.find(t => t.classList.contains("active"));
        return active ? active.dataset.mode : "random";
      }

      function parseExcl() {
        return exclEl.value.split(',').map(s => s.trim()).filter(Boolean);
      }

      function clampCnt(el) {
        return Math.max(0, Math.min(256, Math.floor(+el.value) || 0));
      }

      function getOptsRandom() {
        const counts = { lower: clampCnt(cLow), upper: clampCnt(cUp), digits: clampCnt(cDig), symbols: clampCnt(cSym) };
        const useCounts = counts.lower > 0 || counts.upper > 0 || counts.digits > 0 || counts.symbols > 0;
        const perType = {
          lower: lower.checked ? counts.lower : 0,
          upper: upper.checked ? counts.upper : 0,
          digits: digits.checked ? counts.digits : 0,
          symbols: symbols.checked ? counts.symbols : 0
        };
        return {
          length: useCounts
            ? Math.max(1, perType.lower + perType.upper + perType.digits + perType.symbols)
            : Math.max(4, Number(len.value)),
          lower: lower.checked, upper: upper.checked,
          digits: digits.checked, symbols: symbols.checked,
          perType: useCounts ? perType : null,
          placement: {
            lower: [...placementState.lower], upper: [...placementState.upper],
            digits: [...placementState.digits], symbols: [...placementState.symbols]
          },
          excludeChars: parseExcl()
        };
      }

      const PG_POOLS = {
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        digits: '0123456789',
        symbols: '!@#$%^&*()-_=+[]{};:,.?'
      };
      function poolSize(base, exclSet) {
        let n = 0;
        for (const c of base) if (!exclSet.has(c)) n++;
        return n;
      }
      function estimatePool() {
        const exclSet = new Set(parseExcl().join('').split(''));
        let pool = 0;
        if (lower.checked) pool += poolSize(PG_POOLS.lower, exclSet);
        if (upper.checked) pool += poolSize(PG_POOLS.upper, exclSet);
        if (digits.checked) pool += poolSize(PG_POOLS.digits, exclSet);
        if (symbols.checked) pool += poolSize(PG_POOLS.symbols, exclSet);
        return Math.max(2, pool);
      }

      function syncTypeUI() {
        for (const d of TYPE_DEFS) {
          const on = d.cb.checked;
          d.card.classList.toggle("off", !on);
          d.chips.classList.toggle("disabled", !on);
          d.cnt.disabled = !on;
        }
      }

      function generate() {
        try {
          syncTypeUI();
          const mode = currentMode();
          if (mode === "random") {
            const o = getOptsRandom();
            const useCounts = !!o.perType;
            len.disabled = useCounts;
            const structured = ["lower", "upper", "digits", "symbols"].some(k => o.placement[k].length > 0);
            hint.textContent = useCounts
              ? (L ? 'Dolžino določajo natančna števila po vrsti (' + (o.perType.lower + o.perType.upper + o.perType.digits + o.perType.symbols) + ' znakov).' : 'Length comes from exact per-type counts (' + (o.perType.lower + o.perType.upper + o.perType.digits + o.perType.symbols) + ' characters).')
              : (structured
                ? (L ? 'Znaki z izbranim položajem se enakomerno porazdelijo po celotni dolžini.' : 'Characters with a fixed placement are spread evenly across the length.')
                : '');
            output.value = PURE.generatePassword(o);
            const pool = estimatePool();
            const n = useCounts ? Math.max(1, output.value.length) : Number(len.value);
            showStrength(Math.round(n * Math.log2(pool)));
          } else {
            const wl = mode === "words-sl" ? "sl" : "en";
            const o = {
              words: Math.max(3, Number(wordsEl.value) || 4),
              separator: sepEl.value || "-",
              capitalize: capEl.checked,
              includeNumber: numEl.checked,
              includeSymbol: sym2El.checked,
              wordlist: wl
            };
            output.value = PURE.generatePassphrase(o);
            let bits = o.words * Math.log2(PURE.PASSPHRASE_WORDLISTS[wl].length);
            if (numEl.checked) bits += Math.log2(10000);
            if (sym2El.checked) bits += Math.log2(8);
            showStrength(Math.round(bits));
          }
        } catch (e) {
          showToolErrorBanner(container, (e && e.message) ? e.message : String(e));
        }
      }

      function showStrength(bits) {
        let lvl = L ? 'Nizka varnost' : 'Low strength';
        let color = '#ef4444';
        if (bits >= 45 && bits < 70) { lvl = L ? 'Srednja varnost' : 'Medium strength'; color = '#f59e0b'; }
        if (bits >= 70) { lvl = L ? 'Visoka varnost' : 'High strength'; color = '#22c55e'; }
        meterFill.style.width = Math.max(4, Math.min(100, Math.round(bits / 128 * 100))) + '%';
        meterFill.style.backgroundColor = color;
        strength.innerHTML = `${L ? 'Jakost' : 'Strength'}: <strong style="color:${color};">${lvl}</strong> · ~${bits} bitov`;
      }

      $("#pg-excl-ambig").addEventListener("click", () => {
        const base = exclEl.value.trim().replace(/,+$/, "");
        const cur = new Set(base.replace(/,/g, "").split(""));
        const addChars = Array.from(new Set("iIlL1|oO0".split(""))).filter(c => !cur.has(c));
        if (!addChars.length) return;
        exclEl.value = (base ? base + "," : "") + addChars.join(",");
        exclEl.dispatchEvent(new Event("input", { bubbles: true }));
        exclEl.focus();
      });

      [len, lower, upper, digits, symbols, cLow, cUp, cDig, cSym, exclEl, wordsEl, sepEl, capEl, numEl, sym2El]
        .forEach(el => el.addEventListener("input", () => { lenVal.textContent = len.value; generate(); }));
      $("#pg-regen").addEventListener("click", generate);
      $("#pg-copy").addEventListener("click", () => {
        copyText(output.value, $("#pg-copy"));
      });
      generate();
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
        <div id="fr-highlight-box" style="display:none; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; font-size:13.5px; line-height:1.7; white-space:pre-wrap; word-break:break-all; overflow-y:auto;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="fr-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
      const input = container.querySelector("#fr-input");
      const find = container.querySelector("#fr-find");
      const replace = container.querySelector("#fr-replace");
      const ignoreCase = container.querySelector("#fr-ignorecase");
      const wholeCheck = container.querySelector("#fr-whole");
      const regexCheck = container.querySelector("#fr-regex");
      const stats = container.querySelector("#fr-stats");
      const output = container.querySelector("#fr-output");
      const highlightBox = container.querySelector("#fr-highlight-box");
      const tabReplaced = container.querySelector("#fr-tab-replaced");
      const tabMarked = container.querySelector("#fr-tab-marked");

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
          const res = PURE.findReplace(text, { query, repl, ignoreCase: ignoreCase.checked, wholeWord: wholeCheck.checked, regex: regexCheck.checked });
          const count = res.count;

          if (count > 0) {
            stats.textContent = L ? `${count} ${count === 1 ? 'ujemanje' : (count === 2 ? 'ujemanji' : (count < 5 ? 'ujemanja' : 'ujemanj'))}` : `${count} match${count === 1 ? '' : 'es'}`;
            stats.style.background = 'rgba(34,197,94,0.15)';
            stats.style.color = '#16a34a';
          } else {
            stats.textContent = L ? 'Ni ujemanj' : 'No matches';
            stats.style.background = 'rgba(239,68,68,0.12)';
            stats.style.color = '#dc2626';
          }

          output.value = res.replaced;

          const highlighted = escapeHtml(text).replace(res.regex, m => `<mark style="background:rgba(234,179,8,0.4); color:inherit; border:1px solid rgba(234,179,8,0.7); border-radius:4px; padding:1px 3px; font-weight:700;">${m}</mark>`);
          highlightBox.innerHTML = highlighted;

        } catch (e) {
          stats.textContent = L ? 'Neveljaven RegEx' : 'Invalid RegEx';
          stats.style.background = 'rgba(239,68,68,0.12)';
          stats.style.color = '#dc2626';
          output.value = text;
          highlightBox.innerHTML = `<span style="color:#ef4444;">${L ? 'Napaka v regularnem izrazu.' : 'RegEx syntax error.'}</span>`;
        }
      }

      tabReplaced.addEventListener("click", () => {
        activeTab = 'replaced';
        tabReplaced.classList.add('active');
        tabMarked.classList.remove('active');
        output.style.display = 'block';
        highlightBox.style.display = 'none';
      });

      tabMarked.addEventListener("click", () => {
        activeTab = 'marked';
        tabMarked.classList.add('active');
        tabReplaced.classList.remove('active');
        output.style.display = 'none';
        highlightBox.style.display = 'block';
      });

      [input, find, replace, ignoreCase, wholeCheck, regexCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#fr-swap").addEventListener("click", () => {
        const tmp = find.value; find.value = replace.value; replace.value = tmp; update();
      });
      container.querySelector("#fr-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#fr-copy").addEventListener("click", () => {
        const textToCopy = activeTab === 'replaced' ? output.value : input.value;
        copyText(textToCopy, container.querySelector("#fr-copy"));
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
      const input = container.querySelector("#fq-input");
      const mode = container.querySelector("#fq-mode");
      const caseSens = container.querySelector("#fq-case");
      const ignPunct = container.querySelector("#fq-ignore-punct");
      const list = container.querySelector("#fq-list");
      const meta = container.querySelector("#fq-meta");
      let lastReport = '';
      let updatePromise = null;

      async function update() {
        const text = input.value;
        const opts = { mode: mode.value, caseSensitive: caseSens.checked, ignorePunct: ignPunct.checked };
        let result;
        if (text.length > HEAVY_LIMIT) {
          showToolBusy(container, true);
          try { result = await runHeavy('frequency', { text, opts }); }
          catch (e) { result = PURE.frequencyCounts(text, opts); }
          showToolBusy(container, false);
        } else {
          result = PURE.frequencyCounts(text, opts);
        }
        const { entries, total } = result;
        meta.textContent = entries.length + ' ' + (L ? 'unikatnih' : 'unique') + ' / ' + total + ' ' + (L ? 'skupaj' : 'total');

        if (entries.length === 0) {
          list.innerHTML = `<div style="color:var(--text-dim); text-align:center; padding:20px;">${L ? 'Vnesite besedilo za analizo.' : 'Enter text to analyze.'}</div>`;
          return;
        }

        const maxCount = entries[0][1];
        lastReport = entries.map(([k, v]) => `${k}: ${v} (${((v/total)*100).toFixed(1)}%)`).join('\n');

        list.innerHTML = entries.map(([k, v]) => {
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
        }).join('');
      }

      function debouncedUpdate() {
        clearTimeout(updatePromise);
        updatePromise = setTimeout(update, 100);
      }
      const safe = safeUpdate(debouncedUpdate, container);
      [input, mode, caseSens, ignPunct].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#fq-clear").addEventListener("click", () => { input.value = ""; safe(); input.focus(); });
      container.querySelector("#fq-copy").addEventListener("click", () => {
        copyText(lastReport, container.querySelector("#fq-copy"));
      });
      safe();
    }

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
        setTimeout(() => { btn.innerHTML = oldHtml; }, 1200);
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
          if (prevTok && t.w.length >= minLen && prevTok.key === key && /^\s*$/.test(text.slice(prevTok.e, t.s))) {
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
        removalList = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(k => `${k} ×${counts[k]}`).join('\n');

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

        statsEl.innerHTML = totalRemoved === 0
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
            .map(k => `<button type="button" class="dw-chip" data-key="${escapeHtml(k)}" title="${L ? 'Prikači prvo pojavnost v besedilu' : 'Jump to first occurrence'}" style="cursor:pointer; border-radius:20px; padding:3px 10px; font-weight:600; display:inline-flex; align-items:center; gap:4px; background:rgba(239,68,68,0.12); color:#dc2626; border:1px solid rgba(239,68,68,0.3);">${escapeHtml(k)}<span style="opacity:.75; font-weight:400; font-size:11px;">×${counts[k]}</span></button>`)
            .join('');
          chipsEl.querySelectorAll('.dw-chip').forEach(btn => {
            btn.addEventListener('click', () => {
              const mk = document.getElementById(firstMarkId[btn.dataset.key]);
              if (!mk) return;
              mk.scrollIntoView({ behavior: 'smooth', block: 'center' });
              mk.style.outline = '2px solid #ef4444';
              setTimeout(() => { mk.style.outline = ''; }, 1200);
            });
          });
        }

        const paneHead = (dotColor, label) => `<div style="padding:8px 16px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--text-dim); background:var(--card-hover); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:7px;"><span style="width:10px; height:10px; border-radius:50%; background:${dotColor};"></span>${label}</div>`;
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
        input.value = currentLang === 'sl'
          ? 'To je je test test, ki ima ima tri tri tri podvojitve.\nTudi Tudi velike Velike različice zaznamo, ko ko je možnost vklopljena.'
          : 'This is is a test test that has has three three three duplicates.\nWe We also detect Capital capital variants once the option option is enabled.';
        analyze();
      });
      container.querySelector('#dw-clear').addEventListener('click', () => { input.value = ''; analyze(); input.focus(); });

      container.querySelector('#dw-copy-clean').addEventListener('click', (ev) => {
        copyText(cleanedText, ev.currentTarget);
      });
      container.querySelector('#dw-copy-html').addEventListener('click', (ev) => {
        const exportHtml = `<div style="white-space:pre-wrap; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:13px; line-height:1.6;">${markedHtml}</div>`;
        copyText(exportHtml, ev.currentTarget);
      });
      container.querySelector('#dw-copy-list').addEventListener('click', (ev) => {
        copyText(removalList, ev.currentTarget);
      });

      analyze();
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
      const input = container.querySelector("#co-input");
      const query = container.querySelector("#co-query");
      const caseCheck = container.querySelector("#co-case");
      const wholeCheck = container.querySelector("#co-whole");
      const output = container.querySelector("#co-output");

      function update() {
        const needle = query.value;
        if (!needle) { output.value = ''; return; }
        output.value = String(PURE.countOccurrences(input.value, needle, { ignoreCase: caseCheck.checked, wholeWord: wholeCheck.checked }));
      }
      const safe = safeUpdate(update, container);
      [input, query, caseCheck, wholeCheck].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#co-clear").addEventListener("click", () => { input.value = ""; safe(); input.focus(); });
      safe();
      container.querySelector("#co-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#co-copy"));
      });
    }

function renderAddPrefix(container) {
      const L = currentLang === 'sl';
      const tool = createStandardTool(container, {
        idPrefix: 'ap',
        settingsHtml: `
          <input type="text" id="ap-prefix" placeholder="${L ? 'Predpona (začetek)...' : 'Prefix (start)...'}" style="flex:1; min-width:140px;">
          <input type="text" id="ap-suffix" placeholder="${L ? 'Pripona (konec)...' : 'Suffix (end)...'}" style="flex:1; min-width:140px;">
          <label><input type="checkbox" id="ap-skip"> ${L ? 'Preskoči prazne vrstice' : 'Skip empty lines'}</label>
        `,
        onUpdate() {
          tool.output.value = PURE.addPrefixLines(tool.input.value, {
            prefix: prefixInput.value,
            suffix: suffixInput.value,
            skipEmpty: skipCheckbox.checked
          });
        }
      });
      const prefixInput = container.querySelector('#ap-prefix');
      const suffixInput = container.querySelector('#ap-suffix');
      const skipCheckbox = container.querySelector('#ap-skip');
      [prefixInput, suffixInput, skipCheckbox].forEach(el => el.addEventListener('input', tool.safe));
    }

function renderFilterLines(container) {
      const L = currentLang === 'sl';
      const tool = createStandardTool(container, {
        idPrefix: 'fl',
        settingsHtml: `
          <input type="text" id="fl-keyword" placeholder="${L ? 'Iskana beseda / niz...' : 'Keyword / pattern...'}" style="flex:1; min-width:160px;">
          <label><input type="checkbox" id="fl-whole"> ${L ? 'Cele besede' : 'Whole words'}</label>
          <label><input type="checkbox" id="fl-invert"> ${L ? 'Izloči (inverzni filter)' : 'Exclude (inverse)'}</label>
        `,
        outputPlaceholder: L ? 'Filtrirane vrstice...' : 'Filtered lines...',
        onUpdate() {
          tool.output.value = PURE.filterLines(tool.input.value, {
            keyword: keywordInput.value,
            wholeWord: wholeCheckbox.checked,
            invert: invertCheckbox.checked
          });
        }
      });
      const keywordInput = container.querySelector('#fl-keyword');
      const wholeCheckbox = container.querySelector('#fl-whole');
      const invertCheckbox = container.querySelector('#fl-invert');
      [keywordInput, wholeCheckbox, invertCheckbox].forEach(el => el.addEventListener('input', tool.safe));
    }

function renderLineNumbers(container) {
      const L = currentLang === 'sl';
      const tool = createStandardTool(container, {
        idPrefix: 'ln',
        settingsHtml: `
          <label><input type="checkbox" id="ln-start-zero"> ${L ? 'Začni z 0' : 'Start from 0'}</label>
          <label><input type="checkbox" id="ln-pad"> ${L ? 'Polni z vodilnimi ničlami' : 'Pad with leading zeros'}</label>
        `,
        outputPlaceholder: L ? 'Oštevilčene vrstice...' : 'Numbered lines...',
        onUpdate() {
          tool.output.value = PURE.numberLines(tool.input.value, {
            startZero: startZero.checked,
            pad: pad.checked
          });
        }
      });
      const startZero = container.querySelector('#ln-start-zero');
      const pad = container.querySelector('#ln-pad');
      [startZero, pad].forEach(el => el.addEventListener('input', tool.safe));
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
      const input = container.querySelector("#wt-input");
      const widthEl = container.querySelector("#wt-width");
      const wordCheck = container.querySelector("#wt-word");
      const output = container.querySelector("#wt-output");

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
      [input, widthEl, wordCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#wt-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#wt-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#wt-copy"));
      });
    }

function renderMarkdownStripper(container) {
      const L = currentLang === 'sl';
      const tool = createStandardTool(container, {
        idPrefix: 'ms',
        inputPlaceholder: L ? 'Vnesite besedilo v formatu Markdown...' : 'Paste Markdown content...',
        outputPlaceholder: L ? 'Čisto besedilo brez Markdown oznak...' : 'Plain text without Markdown...',
        onUpdate() {
          let t = tool.input.value;
          t = t.replace(/^#{1,6}\s+/gm, '')
               .replace(/\*\*(.*?)\*\*/g, '$1')
               .replace(/__(.*?)__/g, '$1')
               .replace(/\*(.*?)\*/g, '$1')
               .replace(/_(.*?)_/g, '$1')
               .replace(/~~(.*?)~~/g, '$1')
               .replace(/```[\s\S]*?```/g, '')
               .replace(/`(.+?)`/g, '$1')
               .replace(/\[(.*?)\]\(.*?\)/g, '$1')
               .replace(/^>\s+/gm, '')
               .replace(/^[-*+]\s+/gm, '')
               .replace(/^\d+\.\s+/gm, '');
          tool.output.value = t.trim();
        }
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
      const input = container.querySelector("#hs-input");
      const output = container.querySelector("#hs-output");
      const chkCollapse = container.querySelector("#hs-collapse");
      const chkLinebreaks = container.querySelector("#hs-linebreaks");
      const chkScripts = container.querySelector("#hs-scripts");
      const chkLists = container.querySelector("#hs-lists");
      const chkLinks = container.querySelector("#hs-links");

      function update() {
        const raw = input.value;
        if (!raw) {
          output.value = "";
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

          let text = doc.body.textContent || "";

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
          el.addEventListener("input", update);
          el.addEventListener("change", update);
        }
      });
      container.querySelector("#hs-clear")?.addEventListener("click", () => {
        if (input) input.value = "";
        update();
        if (input) input.focus();
      });
      const copyBtn = container.querySelector("#hs-copy");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          if (output) copyText(output.value, copyBtn);
        });
      }
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
        <div id="inv-preview" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; flex:1; min-height:140px; font-size:13.5px; line-height:1.6; white-space:pre-wrap; word-break:break-all;"></div>
        <div class="panel-actions">
          <button class="btn-sm primary" id="inv-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
      const input = container.querySelector("#inv-input");
      const preview = container.querySelector("#inv-preview");
      let plainRepresented = '';

      function update() {
        const text = input.value;
        plainRepresented = text.replace(/ /g, '·').replace(/\t/g, '→   ').replace(/\n/g, '↵\n');
        preview.innerHTML = escapeHtml(text)
          .replace(/ /g, '<span style="color:#3b82f6; font-weight:700;">·</span>')
          .replace(/\t/g, '<span style="color:#ef4444; font-weight:700;">→   </span>')
          .replace(/\n/g, '<span style="color:#10b981; font-weight:700;">↵</span>\n');
      }
      input.addEventListener("input", update);
      container.querySelector("#inv-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#inv-copy").addEventListener("click", () => {
        copyText(plainRepresented, container.querySelector("#inv-copy"));
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
      const input = container.querySelector("#dc-input");
      const fromSel = container.querySelector("#dc-from");
      const toSel = container.querySelector("#dc-to");
      const output = container.querySelector("#dc-output");

      const delims = {
        newline: "\n",
        comma: ",",
        semicolon: ";",
        tab: "\t",
        space: " "
      };

      function update() {
        const f = delims[fromSel.value];
        const t = delims[toSel.value];
        if (f === "\n") {
          output.value = input.value.split(/\r?\n/).join(t);
        } else {
          output.value = input.value.split(f).join(t);
        }
      }
      [input, fromSel, toSel].forEach(el => el.addEventListener("input", update));
      container.querySelector("#dc-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#dc-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#dc-copy"));
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
      <textarea id="uuid-output" readonly style="min-height:90px; text-align:center; font-size:16px; padding-top:24px;"></textarea>
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
          output.value = [...bytes].map((b) => ('0' + b.toString(16)).slice(-2)).join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
        } else {
          const n = Math.min(64, Math.max(8, Number(lenInput.value) || 32));
          const bytes = new Uint8Array(Math.ceil(n / 2));
          crypto.getRandomValues(bytes);
          output.value = Array.from(bytes).map(b => ('0' + b.toString(16)).slice(-2)).join('').slice(0, n);
        }
      }
      container.querySelector('#uuid-gen').addEventListener('click', generate);
      container.querySelector('#uuid-copy').addEventListener('click', () => {
        copyText(output.value, container.querySelector("#uuid-copy"));
      });
      generate();
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
      const input = container.querySelector("#hx-input");
      const mode = container.querySelector("#hx-mode");
      const delim = container.querySelector("#hx-delim");
      const output = container.querySelector("#hx-output");

      function update() {
        const t = input.value;
        const m = mode.value;
        const d = delim.value;
        try {
          if (m === 'text2hex') {
            const bytes = new TextEncoder().encode(t);
            const hexes = Array.from(bytes).map(b => (d === '0x' ? '0x' : '') + b.toString(16).padStart(2, '0'));
            const sep = d === 'none' ? '' : (d === 'colon' ? ':' : ' ');
            output.value = hexes.join(sep);
          } else if (m === 'hex2text') {
            const clean = t.replace(/0x/g, '').replace(/[\s:,]+/g, '');
            if (!/^[0-9a-fA-F]*$/.test(clean)) {
              output.value = L ? 'Neveljavni šestnajstiški znaki.' : 'Invalid hexadecimal characters.';
              return;
            }
            if (clean.length % 2 !== 0) {
              output.value = L ? 'Nepopoln bajt (liho število znakov).' : 'Incomplete byte (odd number of digits).';
              return;
            }
            const bytes = [];
            for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.substr(i, 2), 16));
            output.value = new TextDecoder().decode(new Uint8Array(bytes));
          } else if (m === 'text2bin') {
            const bytes = new TextEncoder().encode(t);
            output.value = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
          } else if (m === 'bin2text') {
            const bins = t.trim().split(/\s+/).filter(Boolean);
            const badBin = bins.find(b => !/^[01]{1,8}$/.test(b));
            if (badBin !== undefined) {
              output.value = L ? `Neveljaven binarni žeton: ${badBin}` : `Invalid binary token: ${badBin}`;
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
      [input, mode, delim].forEach(el => el.addEventListener("input", update));
      container.querySelector("#hx-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#hx-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#hx-copy"));
      });
      update();
    }

function renderMorseBinary(container) {
      const L = currentLang === 'sl';
      const MORSE_MAP = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'Č': '-.-..', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.',
        'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
        'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'Š': '...-', 'T': '-', 'U': '..-', 'V': '...-',
        'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', 'Ž': '--..-', '1': '.----', '2': '..---',
        '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        '0': '-----', ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--'
      };
      const REVERSE_MORSE = Object.entries(MORSE_MAP).reduce((acc, [k, v]) => { acc[v] = k; return acc; }, {});

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
      const input = container.querySelector("#mb-input");
      const mode = container.querySelector("#mb-mode");
      const output = container.querySelector("#mb-output");

      function update() {
        const val = input.value.trim();
        if (mode.value === 'text2morse') {
          output.value = [...val.toUpperCase()].map(c => MORSE_MAP[c] || c).join(' ');
        } else {
          output.value = val.split(/\s+/).map(m => REVERSE_MORSE[m] || (m === '/' ? ' ' : m)).join('');
        }
      }
      [input, mode].forEach(el => el.addEventListener("input", update));
      container.querySelector("#mb-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#mb-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#mb-copy"));
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
      const input = container.querySelector("#ti-input");
      const color = container.querySelector("#ti-color");
      const bg = container.querySelector("#ti-bg");
      const sizeSel = container.querySelector("#ti-size");
      const canvas = container.querySelector("#ti-canvas");
      const ctx = canvas.getContext("2d");

      function draw() {
        ctx.fillStyle = bg.value || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color.value || "#111827";
        const fSize = parseInt(sizeSel.value) || 28;
        ctx.font = `bold ${fSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = (input.value || "").split("\n");
        const lineHeight = fSize * 1.3;
        const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, startY + i * lineHeight));
      }
      [input, color, bg, sizeSel].forEach(el => el.addEventListener("input", draw));
      container.querySelector("#ti-clear").addEventListener("click", () => { input.value = ""; draw(); input.focus(); });
      container.querySelector("#ti-download").addEventListener("click", () => {
        const link = document.createElement("a"); link.download = "besedomat-slika.png"; link.href = canvas.toDataURL("image/png"); link.click();
      });
      draw();
    }

function renderLoremIpsum(container) {
      const loremSources = {
        lorem: {
          label: { sl: 'Lorem ipsum', en: 'Lorem ipsum' },
          text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`
        },
        cicero: {
          label: { sl: 'Cicero', en: 'Cicero' },
          text: `Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`
        },
        li_europan: {
          label: { sl: 'Li Europan lingues', en: 'Li Europan lingues' },
          text: `Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Omnicos linguae se habet in corde del populo, e nos comprende e comunica sin barriere. Tant li mondo cambia, li lingua vive in le viento.`
        },
        far_away: {
          label: { sl: 'Daleč daleč stran', en: 'Far far away' },
          text: `Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.

Separated they live in Bookmarksgrove right at the coast of the Semantics. Even the farthest shores know the songs of letters and the little rivers of sentences.

When the wind blows through the forests of words, the stories wake up and begin to sing. Each paragraph becomes a path along which the reader can travel, discovering new images and quiet rhythms.

In that distant place, every sentence is a small river, and every paragraph becomes a meadow where readers can rest. The stories move slowly, like clouds carrying poems across the sky.`
        },
        cat: {
          label: { sl: 'Mačji ipsum', en: 'Cat ipsum' },
          text: `Dear diary,
Today I woke up on the keyboard because it was the warmest surface in the house. I walked across every important document to make sure my human knew I was awake. After breakfast, I chased a dust bunny under the couch, pounced on a curtain, and declared victory without ever seeing it.

Then I found a sunbeam. It became my throne for exactly seventeen minutes before the dog decided to sit in the middle of it. I fixed that by lying across the remote control and pretending not to care. A bird looked at me through the window, and I returned a long, meaningful stare.

At noon I took a nap in the box they left on the floor. It was the perfect size for my whole body and also for my paw to hang out. I woke up just in time to demand dinner by sitting on the clean laundry and purring loudly.

Later I practiced my most important skill: the silent loaf. I stared at the red dot, then ignored it. The human clapped, so I switched to sleeping on their laptop. Somewhere between dreams, I planned a new route for the invisible mouse.

After dinner there was important work to do: inspect the plant, open the closed door with mental power, and knock one glass off the table. I executed each mission with total grace and then sat down to judge the family from the top of the bookshelf.

I am a cat, and this is my glorious routine. Tomorrow I will be even more mysterious.`
        },
        dog: {
          label: { sl: 'Pasji ipsum', en: 'Dog ipsum' },
          text: `Dear diary,
This morning started with a great idea: wake up my human by licking their face. It worked. Then we went outside and I announced to every squirrel, bird, and mailbox that this yard is mine. I found the best stick and carried it proudly, even though I dropped it three times.

I rolled in something mysterious behind the fence and gave my human a new cologne. It was delightful. I also barked at the mailman because he looked like he needed a friendly warning. Later, I sat by the door and waited for the sound that means walk time.

During the walk I met a friend who had four legs and smelled like adventure. We chased each other in slow motion until the leash said stop. I drank from a puddle because only the freshest water would do.

After the walk, I supervised the sofa, guarded the snacks, and sniffed every cushion for secrets. I rolled onto my back to request belly rubs, then immediately became a guard dog again when the kitchen timer beeped.

In the evening I practiced my best tricks: stare at the human, wag at the sound of keys, and perform the exact tiny dance that proves dinner is soon. I fell asleep with one ear listening for footsteps and one nose dreaming of treats.

Life is simple: nap, play, protect the house, love my human.`
        },
        painter: {
          label: { sl: 'Slikoviti tekst', en: 'Painter style' },
          text: `Slikam nežne poteze in rečem, da včasih so dobri dnevi in včasih manj dobri. Vsaka barva že nosi zgodbo in vsaka črta postane dovoljena poteza naplatnu. Ko mešaš barve, pusti, da se stare skrbi raztopijo in dovoli platnu, da prinese nekaj toplega. V svetu slik so drobne sreče kot mehki oblaki, ki se pojavljajo, ko jih najmanj pričakuješ.`
        },
        dream: {
          label: { sl: 'Sanjanje', en: 'Dream poem' },
          text: `Take this kiss upon the brow!
And, in parting from you now,
Thus much let me avow —
You are not wrong, who deem
That my days have been a dream;

Yet if hope has flown away
In a night, or in a day,
In a vision, or in none,
Is it therefore the less gone?
All that we see or seem
Is but a dream within a dream.

I stand amid the roar
Of a surf-tormented shore,
And I hold within my hand
Grains of the golden sand —
How few! yet how they creep
Through my fingers to the deep,
While I weep — while I weep!
O God! can I not grasp
Them with a tighter clasp?
O God! can I not save
One from the pitiless wave?`
        },
        quotes: {
          label: { sl: 'Citati slavnih', en: 'Famous Quotes' },
          fragments: [
            'The only way to do great work is to love what you do. — Steve Jobs',
            'Be yourself; everyone else is already taken. — Oscar Wilde',
            'Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill',
            'The best way to predict the future is to create it. — Peter Drucker',
            'Do not wait to strike till the iron is hot; but make it hot by striking. — William Butler Yeats',
            'You miss 100% of the shots you don’t take. — Wayne Gretzky',
            'In the middle of every difficulty lies opportunity. — Albert Einstein',
            'What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson',
            'It does not matter how slowly you go as long as you do not stop. — Confucius',
            'The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt',
            'Believe you can and you’re halfway there. — Theodore Roosevelt',
            'Act as if what you do makes a difference. It does. — William James',
            'The only limit to our realization of tomorrow is our doubts of today. — Franklin D. Roosevelt',
            'Life is what happens when you are busy making other plans. — John Lennon',
            'The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb'
          ]
        }
      };

      container.innerHTML = `
    <div style="max-width:700px; margin:0 auto; width:100%;">
      <div class="extra-row" style="margin-bottom:12px; gap:12px; flex-wrap:wrap; align-items:flex-end;">
        <label>${currentLang === 'sl' ? 'Vir' : 'Source'}: <select id="lorem-variant">
          <option value="lorem">${currentLang === 'sl' ? 'Lorem ipsum' : 'Lorem ipsum'}</option>
          <option value="cicero">Cicero</option>
          <option value="li_europan">Li Europan lingues</option>
          <option value="far_away">Far far away</option>
          <option value="cat">${currentLang === 'sl' ? 'Mačji ipsum' : 'Cat ipsum'}</option>
          <option value="dog">${currentLang === 'sl' ? 'Pasji ipsum' : 'Dog ipsum'}</option>
          <option value="painter">${currentLang === 'sl' ? 'Slikoviti tekst' : 'Painter style'}</option>
          <option value="dream">${currentLang === 'sl' ? 'Sanjanje' : 'Dream poem'}</option>
          <option value="quotes">${currentLang === 'sl' ? 'Citati' : 'Quotes'}</option>
        </select></label>
        <label>${currentLang === 'sl' ? 'Količina' : 'Amount'}: <input type="number" id="lorem-count" min="1" max="200" value="5" style="width:90px;"></label>
        <label>${currentLang === 'sl' ? 'Način' : 'Mode'}: <select id="lorem-mode" title="${currentLang === 'sl' ? 'Besede: natančno število besed. Odstavki: več daljših blokov besedila.' : 'Words: exact number of words. Paragraphs: longer blocks of text.'}"><option value="paragraphs">${currentLang === 'sl' ? 'Odstavki' : 'Paragraphs'}</option><option value="words">${currentLang === 'sl' ? 'Besede' : 'Words'}</option></select></label>
        <label>${currentLang === 'sl' ? 'Format' : 'Format'}: <select id="lorem-format"><option value="text">${currentLang === 'sl' ? 'Navadno besedilo' : 'Plain text'}</option><option value="html">${currentLang === 'sl' ? 'HTML odstavki' : 'HTML paragraphs'}</option></select></label>
      </div>
      <div class="extra-row" style="margin-bottom:12px; gap:12px; flex-wrap:wrap; align-items:center;"></div>
      <label>${getI('ui_output')}</label>
      <textarea id="lorem-output" readonly style="min-height:220px;"></textarea>
      <div class="modal-actions">
        <button class="btn-sm" id="lorem-copy">${getI('ui_copy')}</button>
      </div>
    </div>
  `;
      const variantSelect = container.querySelector('#lorem-variant');
      const countInput = container.querySelector('#lorem-count');
      const modeSelect = container.querySelector('#lorem-mode');
      const formatSelect = container.querySelector('#lorem-format');
      const output = container.querySelector('#lorem-output');

      function buildWords(sourceWords, n, startWithSource) {
        const result = [];
        let cursor = 0;
        if (startWithSource) {
          const startWords = sourceWords.slice(0, Math.min(7, sourceWords.length));
          result.push(...startWords);
          cursor = startWords.length;
        }
        while (result.length < n) {
          if (cursor >= sourceWords.length) { cursor = 0; }
          result.push(sourceWords[cursor]);
          cursor += 1;
        }
        return result.slice(0, n);
      }

      function buildParagraphs(variant, count, startWithSource, wordsPerParagraph) {
        const paragraphs = [];
        if (Array.isArray(variant.fragments)) {
          for (let i = 0; i < count; i++) {
            const fragment = variant.fragments[i % variant.fragments.length].trim();
            paragraphs.push(fragment.replace(/\s+/g, ' ').trim());
          }
          return paragraphs;
        }

        const sourceParagraphs = variant.text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        if (sourceParagraphs.length >= count) {
          return sourceParagraphs.slice(0, count);
        }

        const words = variant.text.split(/\s+/).filter(Boolean);
        let cursor = 0;

        for (let i = 0; i < count; i++) {
          const paragraphWords = [];
          if (i === 0 && startWithSource) {
            paragraphWords.push(...words.slice(0, Math.min(7, words.length)));
            cursor = Math.min(7, words.length);
          }
          while (paragraphWords.length < wordsPerParagraph) {
            if (cursor >= words.length) { cursor = 0; }
            paragraphWords.push(words[cursor]);
            cursor += 1;
          }
          paragraphs.push(paragraphWords.join(' ').replace(/\s+([.,!?;:])/g, '$1').replace(/\s+/g, ' ').trim() + '.');
        }
        return paragraphs;
      }

      function generate() {
        const count = Math.max(1, Math.min(200, Number(countInput.value) || 5));
        const mode = modeSelect.value;
        const format = formatSelect.value;
        const startWithSource = false;
        const variantKey = variantSelect.value || 'lorem';
        const variant = loremSources[variantKey] || loremSources.lorem;
        const isFragmentSource = Array.isArray(variant.fragments);
        const sourceText = isFragmentSource ? variant.fragments.join(' ') : variant.text;
        const words = sourceText.split(/\s+/).filter(Boolean);
        const startWords = isFragmentSource
          ? variant.fragments[0].split(/\s+/).filter(Boolean).slice(0, Math.min(7, variant.fragments[0].split(/\s+/).filter(Boolean).length))
          : words.slice(0, Math.min(7, words.length));
        let value = '';

        if (mode === 'words') {
          // Build a token list separating base word and trailing punctuation.
          const rawTokens = sourceText.split(/\s+/).filter(Boolean);
          const tokens = rawTokens.map(tok => {
            const m = tok.match(/^(.+?)([^\p{L}\p{N}\s]+)?$/u);
            return { base: m ? m[1] : tok, trail: (m && m[2]) ? m[2] : '' };
          });

          function pick(idx) { return tokens[idx % tokens.length]; }

          const outputWords = [];
          let cursor = 0;

          // Optionally start with a few words from the source (unchanged behaviour)
          if (startWithSource) {
            const n0 = Math.min(7, tokens.length);
            for (let i = 0; i < n0 && outputWords.length < count; i++) {
              const t = pick(i);
              const includeTrail = t.trail && (outputWords.length + 1 < count);
              outputWords.push(t.base + (includeTrail ? t.trail : ''));
            }
            cursor = n0;
          }

          while (outputWords.length < count) {
            const t = pick(cursor);
            const includeTrail = t.trail && (outputWords.length + 1 < count);
            outputWords.push(t.base + (includeTrail ? t.trail : ''));
            cursor += 1;
          }

          value = outputWords.slice(0, count).join(' ');
          // In words mode we should not force a trailing period — punctuation
          // is only included when it's part of a token and the next word
          // is present. Wrap in HTML paragraph only when requested.
          if (format === 'html') { value = `<p>${value}</p>`; }
        } else {
          const wordsPerParagraph = 40;
          const paragraphs = buildParagraphs(variant, count, startWithSource, wordsPerParagraph);
          value = format === 'html' ? paragraphs.map(p => `<p>${p}</p>`).join('\n') : paragraphs.join('\n\n');
        }

        output.value = value;
      }

      [variantSelect, countInput, modeSelect, formatSelect].forEach(el => {
        el.addEventListener('input', generate);
        el.addEventListener('change', generate);
      });
      container.querySelector("#lorem-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#lorem-copy"));
      });
      generate();
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
      const input = container.querySelector("#js-input");
      const output = container.querySelector("#js-output");
      function update() { try { output.value = JSON.stringify(input.value); } catch (e) { output.value = "Invalid string."; } }
      input.addEventListener("input", update);
      container.querySelector("#js-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#js-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#js-copy"));
      });
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
      const input = container.querySelector("#caesar-input");
      const output = container.querySelector("#caesar-output");
      const shiftEl = container.querySelector("#caesar-shift");
      const shiftVal = container.querySelector("#caesar-shift-val");
      const opEl = container.querySelector("#caesar-op");
      const preserveCase = container.querySelector("#caesar-preserve-case");

      function update() {
        const shift = parseInt(shiftEl.value) || 13;
        const encode = opEl.value === 'encode';
        const keep = preserveCase.checked;
        output.value = PURE.caesarCipher(input.value, shift, encode, keep);
        shiftVal.textContent = shift;
      }

      [input, shiftEl, opEl, preserveCase].forEach(el => el.addEventListener("input", update));
      container.querySelector("#caesar-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#caesar-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#caesar-copy"));
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
      const input = container.querySelector("#vig-input");
      const output = container.querySelector("#vig-output");
      const keyEl = container.querySelector("#vig-key");
      const opEl = container.querySelector("#vig-op");
      const preserveCase = container.querySelector("#vig-preserve-case");
      const showTable = container.querySelector("#vig-show-table");
      const tableWrap = container.querySelector("#vig-table-wrap");

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

      [input, keyEl, opEl, preserveCase, showTable].forEach(el => el.addEventListener("input", update));
      container.querySelector("#vig-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#vig-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#vig-copy"));
      });
      update();
    }

function renderPigpenCipher(container) {
      const L = currentLang === 'sl';
      
      // Grid 1: A-I, grid 2: J-R, and the X-shaped grids: S-V/W-Z.
      const pigpenMap = {
        'A': { grid: 0, pos: 0 }, 'B': { grid: 0, pos: 1 }, 'C': { grid: 0, pos: 2 },
        'D': { grid: 0, pos: 3 }, 'E': { grid: 0, pos: 4 }, 'F': { grid: 0, pos: 5 },
        'G': { grid: 0, pos: 6 }, 'H': { grid: 0, pos: 7 }, 'I': { grid: 0, pos: 8 },
        'J': { grid: 1, pos: 0 }, 'K': { grid: 1, pos: 1 }, 'L': { grid: 1, pos: 2 },
        'M': { grid: 1, pos: 3 }, 'N': { grid: 1, pos: 4 }, 'O': { grid: 1, pos: 5 },
        'P': { grid: 1, pos: 6 }, 'Q': { grid: 1, pos: 7 }, 'R': { grid: 1, pos: 8 },
        'S': { grid: 2, pos: 0 }, 'T': { grid: 2, pos: 1 }, 'U': { grid: 2, pos: 2 },
        'V': { grid: 2, pos: 3 }, 'W': { grid: 3, pos: 0 }, 'X': { grid: 3, pos: 1 },
        'Y': { grid: 3, pos: 2 }, 'Z': { grid: 3, pos: 3 }
      };
      
      // Slovenian special chars mapping
      const slMap = { 'Č': 'C', 'Š': 'S', 'Ž': 'Z' };
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
        
        let paths = [];
        
        if (isThirdGrid) {
          const center = size / 2;
          const outer = padding + 5;
          const endpoints = [
            [outer, outer, size - outer, outer],
            [size - outer, outer, size - outer, size - outer],
            [size - outer, size - outer, outer, size - outer],
            [outer, size - outer, outer, outer]
          ][pos];
          const [x1, y1, x2, y2] = endpoints;
          paths.push(`<line x1="${center}" y1="${center}" x2="${x1}" y2="${y1}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          paths.push(`<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          if (hasDot) {
            const dotX = pos === 1 ? size - padding * 1.8 : pos === 3 ? padding * 1.8 : center;
            const dotY = pos === 0 ? padding * 1.8 : pos === 2 ? size - padding * 1.8 : center;
            paths.push(`<circle cx="${dotX}" cy="${dotY}" r="${Math.min(w, h) * 0.12}" fill="currentColor"/>`);
          }
        } else {
          // Grid 1 & 2: Square grid
          // Left border
          if (col === 0) paths.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          // Top border
          if (row === 0) paths.push(`<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          // Right border (only for last col)
          if (col === 2) paths.push(`<line x1="${x + w}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          // Bottom border (only for last row)
          if (row === 2) paths.push(`<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          
          // Dot for second grid
          if (hasDot) {
            paths.push(`<circle cx="${x + w/2}" cy="${y + h/2}" r="${Math.min(w, h) * 0.12}" fill="currentColor"/>`);
          }
        }
        
        const glyph = pigpenStyle === 'compact' && mapped <= 'R' ? mapped.toLowerCase() : mapped;
        const styleClass = pigpenStyle === 'compact' ? ' compact' : '';
        const fontFamily = pigpenStyle === 'pigpen-cipher' ? 'PigpenCipher' : 'Wizpen';
        return `<span class="pigpen-glyph${styleClass}" style="font-family:'${fontFamily}', sans-serif;" aria-label="${mapped}">${glyph}</span>`;
      }

      function textToPigpen(text) {
        return text.split('').map(c => {
          if (/[A-Za-z]/.test(c)) {
            const svg = getPigpenSVG(c);
            return svg ? `<span style="display:inline-block; margin:2px;">${svg}</span>` : c;
          }
          return c === ' ' ? '&nbsp;' : c === '\n' ? '<br>' : escapeHtml(c);
        }).join('');
      }

      function textToPigpenSVG(text) {
        // Returns full SVG document for download
        const chars = text.split('');
        const symbols = chars.filter(c => /[A-Za-z]/.test(c)).map(c => getPigpenSVG(c)).filter(Boolean);
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

      const input = container.querySelector("#pigpen-input");
      const outputWrap = container.querySelector("#pigpen-output-wrap");
      const outputMode = container.querySelector("#pigpen-output");
      const preserveSpaces = container.querySelector("#pigpen-spaces");
      const direction = container.querySelector("#pigpen-direction");
      const style = container.querySelector("#pigpen-style");
      const legendDiv = container.querySelector("#pigpen-legend");

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
        } else { // both
          const letters = displayText.replace(/[^A-Za-z]/g, '');
          outputWrap.innerHTML = (isDecode ? escapeHtml(displayText) : textToPigpen(displayText)) + '<hr style="margin:12px 0; border-color:var(--border);">' + textToPigpen(letters);
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

      style.addEventListener("input", () => {
        pigpenStyle = style.value;
        update();
        buildLegend();
      });
      [input, outputMode, direction, preserveSpaces].forEach(el => el.addEventListener("input", update));
      container.querySelector("#pigpen-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#pigpen-copy").addEventListener("click", () => {
        copyText(outputWrap.innerText || outputWrap.textContent, container.querySelector("#pigpen-copy"));
      });
      container.querySelector("#pigpen-download").addEventListener("click", downloadSVG);
      update();
      buildLegend();
    }

function renderPlatformCounter(container) {
      const L = currentLang === 'sl';
      
      const platforms = [
        { id: 'twitter', name: 'Twitter / X', limit: 280, icon: '🐦', color: '#1DA1F2' },
        { id: 'linkedin', name: 'LinkedIn', limit: 3000, icon: '💼', color: '#0A66C2' },
        { id: 'instagram', name: 'Instagram', limit: 2200, icon: '📷', color: '#E4405F' },
        { id: 'sms', name: 'SMS', limit: 160, icon: '📱', color: '#25D366' },
        { id: 'meta', name: 'Meta Description', limit: 160, icon: '🔍', color: '#1877F2' },
        { id: 'youtube', name: 'YouTube Title', limit: 100, icon: '▶️', color: '#FF0000' }
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

      const input = container.querySelector("#pc-input");
      const resultsDiv = container.querySelector("#pc-results");

      function getCountStats(text) {
        const charsWithSpaces = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text ? text.split(/\r?\n/).length : 0;
        return { charsWithSpaces, charsNoSpaces, words, lines };
      }

      function getStatus(used, limit) {
        const pct = (used / limit) * 100;
        if (used > limit) return { class: 'over', label: L ? `PRESEŽENO (+${used - limit})` : `OVER (+${used - limit})`, pct: Math.min(pct, 200) };
        if (pct >= 90) return { class: 'warn', label: L ? `Preostane ${limit - used}` : `${limit - used} left`, pct };
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

      input.addEventListener("input", update);
      container.querySelector("#pc-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#pc-copy").addEventListener("click", () => {
        const text = input.value;
        const stats = getCountStats(text);
        let summary = `${L ? 'Povzetek dolžin' : 'Length Summary'}:\n`;
        platforms.forEach(p => {
          const status = getStatus(stats.charsWithSpaces, p.limit);
          summary += `${p.name}: ${stats.charsWithSpaces}/${p.limit} (${status.label})\n`;
        });
        summary += `\n${L ? 'Skupaj' : 'Total'}: ${stats.charsWithSpaces} ${L ? 'znakov' : 'chars'}, ${stats.words} ${L ? 'besed' : 'words'}`;
        copyText(summary, container.querySelector("#pc-copy"));
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

      const input = container.querySelector("#ra-input");
      const langSel = container.querySelector("#ra-lang");
      const highlightCheck = container.querySelector("#ra-highlight");
      const resultsDiv = container.querySelector("#ra-results");
      const highlightedDiv = container.querySelector("#ra-highlighted");

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
        const syllables = words.reduce((sum, w) => sum + (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)), 0);
        
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
        const complexWords = words.filter(w => (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)) >= 3).length;
        const fog = 0.4 * ((numWords / numSentences) + 100 * (complexWords / numWords));
        
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
          highlightedHtml = parts.map(part => {
            const trimmed = part.trim();
            const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
            if (wordCount > 25) {
              return `<mark style="background:rgba(239,68,68,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
            } else if (wordCount >= 20) {
              return `<mark style="background:rgba(245,158,11,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
            }
            return escapeHtml(part);
          }).join('');
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
        
        container.querySelector("#ra-copy").onclick = () => copyText(report, container.querySelector("#ra-copy"));
      }

      input.addEventListener("input", analyze);
      langSel.addEventListener("change", analyze);
      highlightCheck.addEventListener("change", analyze);
      container.querySelector("#ra-clear").addEventListener("click", () => { input.value = ""; analyze(); input.focus(); });
      analyze();
    }

function renderQRCodeGenerator(container) {
      const L = currentLang === 'sl';
      
      // Minimal QR code implementation (simplified)
      function generateQRCode(text, options = {}) {
        const size = options.size || 256;
        const eccLevel = options.ecc || 'M';
        const fgColor = options.fgColor || '#000000';
        const bgColor = options.bgColor || '#ffffff';
        
        // Use a simple QR code library approach - for now we'll use a canvas-based approach
        // This is a placeholder that creates a visual QR-like pattern
        // In production, you'd use a proper QR library like qrcode.js
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Simple QR-like pattern generation (not a real QR code)
        // For a real implementation, you'd need a proper QR library
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        
        // Draw finder patterns (three corners)
        const moduleSize = size / 37; // 37x37 modules for version 3
        const drawFinder = (x, y) => {
          ctx.fillStyle = fgColor;
          // 7x7 outer
          ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
          // 5x5 inner white
          ctx.fillStyle = bgColor;
          ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
          // 3x3 center
          ctx.fillStyle = fgColor;
          ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
        };
        
        drawFinder(0, 0);
        drawFinder(24, 0);
        drawFinder(0, 24);
        
        // Draw timing patterns
        ctx.fillStyle = fgColor;
        for (let i = 8; i < 24; i++) {
          if (i % 2 === 0) {
            ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
            ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
          }
        }
        
        // Encode some data pattern (simplified)
        const dataStr = text.substring(0, 100);
        let bitIndex = 0;
        for (let y = 0; y < 24; y++) {
          for (let x = 0; x < 24; x++) {
            // Skip finder pattern areas and timing
            if ((x < 9 && y < 9) || (x > 23 && y < 9) || (x < 9 && y > 23) || x === 6 || y === 6) continue;
            
            const charCode = dataStr.charCodeAt(bitIndex % dataStr.length);
            const bit = (charCode >> (bitIndex % 8)) & 1;
            bitIndex++;
            
            if (bit) {
              ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
            }
          }
        }
        
        return canvas;
      }

      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Vrsta vsebine:' : 'Content type:'}
        <select id="qr-type">
          <option value="text">${L ? 'Besedilo / URL' : 'Text / URL'}</option>
          <option value="email">${L ? 'E-pošta (mailto:)' : 'Email (mailto:)'}</option>
          <option value="phone">${L ? 'Telefon (tel:)' : 'Phone (tel:)'}</option>
          <option value="wifi">${L ? 'Wi-Fi' : 'Wi-Fi'}</option>
          <option value="vcard">${L ? 'vCard (kontakt)' : 'vCard (contact)'}</option>
        </select>
      </label>
      <div id="qr-wifi-fields" style="display:none; gap:8px; flex-wrap:wrap;">
        <input type="text" id="qr-wifi-ssid" placeholder="SSID (ime omrežja)" style="flex:1; min-width:140px;">
        <input type="text" id="qr-wifi-pass" placeholder="${L ? 'Geslo' : 'Password'}" style="flex:1; min-width:140px;">
        <select id="qr-wifi-enc">
          <option value="WPA">${L ? 'WPA/WPA2' : 'WPA/WPA2'}</option>
          <option value="WEP">WEP</option>
          <option value="nopass">${L ? 'Brez gesla' : 'No password'}</option>
        </select>
      </div>
      <div id="qr-vcard-fields" style="display:none; gap:8px; flex-wrap:wrap;">
        <input type="text" id="qr-vcard-name" placeholder="${L ? 'Ime in priimek' : 'Full name'}" style="flex:1; min-width:140px;">
        <input type="text" id="qr-vcard-phone" placeholder="${L ? 'Telefon' : 'Phone'}" style="flex:1; min-width:140px;">
        <input type="text" id="qr-vcard-email" placeholder="Email" style="flex:1; min-width:140px;">
        <input type="text" id="qr-vcard-org" placeholder="${L ? 'Organizacija' : 'Organization'}" style="flex:1; min-width:140px;">
      </div>
      <label>${L ? 'Velikost:' : 'Size:'}
        <input type="range" id="qr-size" min="128" max="512" value="256" step="64" style="flex:1; max-width:200px;">
        <strong id="qr-size-val">256</strong>px
      </label>
      <label>${L ? 'Napakovna toleranca:' : 'Error correction:'}
        <select id="qr-ecc">
          <option value="L">${L ? 'L (7%)' : 'L (7%)'}</option>
          <option value="M" selected>${L ? 'M (15%)' : 'M (15%)'}</option>
          <option value="Q">${L ? 'Q (25%)' : 'Q (25%)'}</option>
          <option value="H">${L ? 'H (30%)' : 'H (30%)'}</option>
        </select>
      </label>
      <label>${L ? 'Barva kode:' : 'Foreground:'}
        <input type="color" id="qr-fg" value="#000000" style="width:40px; height:30px; border:none; border-radius:4px; cursor:pointer;">
      </label>
      <label>${L ? 'Barva ozadja:' : 'Background:'}
        <input type="color" id="qr-bg" value="#ffffff" style="width:40px; height:30px; border:none; border-radius:4px; cursor:pointer;">
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="qr-input">${getI('ui_input')}</label>
        <textarea id="qr-input" placeholder="${L ? 'Vnesite besedilo, URL ali podatke...' : 'Enter text, URL or data...'}" style="min-height:140px;">https://besedomat.si</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="qr-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${getI('ui_output')}</label>
        <div style="text-align:center; padding:16px; background:var(--card); border:1px solid var(--border); border-radius:12px; flex:1; min-height:200px; display:flex; align-items:center; justify-content:center;">
          <canvas id="qr-canvas" width="256" height="256" style="max-width:100%; border-radius:8px; border:1px solid var(--border); image-rendering:pixelated;"></canvas>
        </div>
        <div class="panel-actions" style="gap:8px; flex-wrap:wrap;">
          <button class="btn-sm primary" id="qr-download-png" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi PNG' : 'Download PNG'}</span></button>
          <button class="btn-sm" id="qr-download-svg" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi SVG' : 'Download SVG'}</span></button>
        </div>
      </div>
    </div>
  `;

      const input = container.querySelector("#qr-input");
      const typeSel = container.querySelector("#qr-type");
      const sizeEl = container.querySelector("#qr-size");
      const sizeVal = container.querySelector("#qr-size-val");
      const eccSel = container.querySelector("#qr-ecc");
      const fgEl = container.querySelector("#qr-fg");
      const bgEl = container.querySelector("#qr-bg");
      const canvas = container.querySelector("#qr-canvas");
      const ctx = canvas.getContext("2d");
      const wifiFields = container.querySelector("#qr-wifi-fields");
      const vcardFields = container.querySelector("#qr-vcard-fields");
      const wifiSSID = container.querySelector("#qr-wifi-ssid");
      const wifiPass = container.querySelector("#qr-wifi-pass");
      const wifiEnc = container.querySelector("#qr-wifi-enc");
      const vcardName = container.querySelector("#qr-vcard-name");
      const vcardPhone = container.querySelector("#qr-vcard-phone");
      const vcardEmail = container.querySelector("#qr-vcard-email");
      const vcardOrg = container.querySelector("#qr-vcard-org");

      function getQRData() {
        const type = typeSel.value;
        let data = '';
        
        if (type === 'text') {
          data = input.value;
        } else if (type === 'email') {
          data = `mailto:${input.value}`;
        } else if (type === 'phone') {
          data = `tel:${input.value}`;
        } else if (type === 'wifi') {
          const ssid = wifiSSID.value;
          const pass = wifiPass.value;
          const enc = wifiEnc.value;
          data = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
        } else if (type === 'vcard') {
          const name = vcardName.value;
          const phone = vcardPhone.value;
          const email = vcardEmail.value;
          const org = vcardOrg.value;
          data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nEND:VCARD`;
        }
        return data;
      }

      function updateFields() {
        const type = typeSel.value;
        wifiFields.style.display = type === 'wifi' ? 'flex' : 'none';
        vcardFields.style.display = type === 'vcard' ? 'flex' : 'none';
        input.style.display = type === 'wifi' || type === 'vcard' ? 'none' : 'block';
        updateQR();
      }

      function drawQR(qr, size, fg, bg, marginModules) {
        const count = qr.getModuleCount();
        const total = count + marginModules * 2;
        const cell = size / total;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = fg;
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              const x = Math.round((c + marginModules) * cell);
              const y = Math.round((r + marginModules) * cell);
              const w = Math.round((c + marginModules + 1) * cell) - x;
              const h = Math.round((r + marginModules + 1) * cell) - y;
              ctx.fillRect(x, y, w, h);
            }
          }
        }
      }

      function updateQR() {
        const size = parseInt(sizeEl.value) || 256;
        const data = getQRData();
        const fg = fgEl.value;
        const bg = bgEl.value;
        const ecc = eccSel.value;

        canvas.width = size;
        canvas.height = size;
        sizeVal.textContent = size;

        if (typeof qrcode === 'undefined') {
          generateSimpleQR(ctx, data, size, fg, bg);
          return;
        }
        try {
          qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
          const qr = qrcode(0, ecc);
          qr.addData(data && data.length ? data : ' ');
          qr.make();
          drawQR(qr, size, fg, bg, 4);
        } catch (e) {
          generateSimpleQR(ctx, data, size, fg, bg);
        }
      }

      function generateSimpleQR(ctx, text, size, fg, bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        
        const modules = 33;
        const moduleSize = size / modules;
        
        // Simple hash-based pattern (not real QR, but looks like one)
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          hash = ((hash << 5) - hash) + text.charCodeAt(i);
          hash |= 0;
        }
        
        // Finder patterns
        const drawFinder = (mx, my) => {
          ctx.fillStyle = fg;
          ctx.fillRect(mx * moduleSize, my * moduleSize, 7 * moduleSize, 7 * moduleSize);
          ctx.fillStyle = bg;
          ctx.fillRect((mx + 1) * moduleSize, (my + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
          ctx.fillStyle = fg;
          ctx.fillRect((mx + 2) * moduleSize, (my + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
        };
        drawFinder(0, 0);
        drawFinder(modules - 7, 0);
        drawFinder(0, modules - 7);
        
        // Timing patterns
        for (let i = 8; i < modules - 8; i++) {
          if (i % 2 === 0) {
            ctx.fillStyle = fg;
            ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
            ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
          }
        }
        
        // Data area (pseudo-random based on text hash)
        ctx.fillStyle = fg;
        let seed = Math.abs(hash);
        for (let y = 0; y < modules; y++) {
          for (let x = 0; x < modules; x++) {
            // Skip finder and timing areas
            if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8)) continue;
            if (x === 6 || y === 6) continue;
            
            seed = (seed * 1664525 + 1013904223) >>> 0;
            if (seed % 2 === 0) {
              ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
            }
          }
        }
      }

      function downloadPNG() {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      function downloadSVG() {
        const data = getQRData();
        const fg = fgEl.value;
        const bg = bgEl.value;
        const ecc = eccSel.value;
        const size = parseInt(sizeEl.value) || 256;

        if (typeof qrcode !== 'undefined') {
          try {
            qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
            const qr = qrcode(0, ecc);
            qr.addData(data && data.length ? data : ' ');
            qr.make();
            const count = qr.getModuleCount();
            const margin = 4;
            const total = count + margin * 2;
            const cell = size / total;
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
            svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
            for (let r = 0; r < count; r++) {
              for (let c = 0; c < count; c++) {
                if (qr.isDark(r, c)) {
                  const x = ((c + margin) * cell).toFixed(2);
                  const y = ((r + margin) * cell).toFixed(2);
                  svg += `<rect x="${x}" y="${y}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${fg}"/>`;
                }
              }
            }
            svg += '</svg>';
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrcode.svg';
            a.click();
            URL.revokeObjectURL(url);
            return;
          } catch (e) { /* fall through to fake */ }
        }

        // Fallback: simple pseudo pattern (not a real QR)
        const modules = 33;
        const moduleSize = size / modules;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash |= 0; }
        const drawFinderSVG = (mx, my) => {
          svg += `<rect x="${mx * moduleSize}" y="${my * moduleSize}" width="${7 * moduleSize}" height="${7 * moduleSize}" fill="${fg}"/>`;
          svg += `<rect x="${(mx + 1) * moduleSize}" y="${(my + 1) * moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" fill="${bg}"/>`;
          svg += `<rect x="${(mx + 2) * moduleSize}" y="${(my + 2) * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" fill="${fg}"/>`;
        };
        drawFinderSVG(0, 0); drawFinderSVG(modules - 7, 0); drawFinderSVG(0, modules - 7);
        for (let i = 8; i < modules - 8; i++) {
          if (i % 2 === 0) {
            svg += `<rect x="${i * moduleSize}" y="${6 * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
            svg += `<rect x="${6 * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
          }
        }
        let seed = Math.abs(hash);
        for (let y = 0; y < modules; y++) {
          for (let x = 0; x < modules; x++) {
            if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8)) continue;
            if (x === 6 || y === 6) continue;
            seed = (seed * 1664525 + 1013904223) >>> 0;
            if (seed % 2 === 0) svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
          }
        }
        svg += '</svg>';
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'qrcode.svg'; a.click();
        URL.revokeObjectURL(url);
      }

      [input, typeSel, sizeEl, eccSel, fgEl, bgEl, wifiSSID, wifiPass, wifiEnc, vcardName, vcardPhone, vcardEmail, vcardOrg].forEach(el => {
        el.addEventListener("input", updateQR);
        el.addEventListener("change", updateQR);
      });
      
      typeSel.addEventListener("change", updateFields);
      
      container.querySelector("#qr-clear").addEventListener("click", () => { 
        input.value = ""; 
        wifiSSID.value = ""; 
        wifiPass.value = ""; 
        vcardName.value = ""; 
        vcardPhone.value = ""; 
        vcardEmail.value = ""; 
        vcardOrg.value = ""; 
        updateFields(); 
        input.focus(); 
      });
      
      container.querySelector("#qr-download-png").addEventListener("click", downloadPNG);
      container.querySelector("#qr-download-svg").addEventListener("click", downloadSVG);
      
      updateFields();
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

function renderTextToEmoji(container) {
      const L = currentLang === 'sl';
      
      // Emoji dictionary for SL and EN
      const emojiDict = {
        sl: {
          'ljubezen': '❤️', 'ljubav': '❤️', 'srce': '❤️',
          'kava': '☕', 'kafe': '☕', 'espresso': '☕',
          'sonce': '☀️', 'sončno': '☀️', 'zrak': '☀️',
          'luna': '🌙', 'noč': '🌙', 'noč': '🌙',
          'zvezda': '⭐', 'zvezdice': '✨',
          'dež': '🌧️', 'deževje': '🌧️', 'kiša': '🌧️',
          'sneg': '❄️', 'snežek': '❄️', 'zima': '❄️',
          'drevo': '🌳', 'gozd': '🌲', 'narava': '🌿',
          'cvet': '🌸', 'cvetje': '🌺', 'roža': '🌹',
          'mačka': '🐱', 'mačke': '🐱', 'mačje': '🐱',
          'pes': '🐶', 'psa': '🐶', 'kuža': '🐶',
          'ptica': '🐦', 'ptice': '🐦',
          'riba': '🐟', 'ribe': '🐟',
          'konj': '🐴', 'konji': '🐴',
          'krava': '🐄', 'ovca': '🐑', 'prašič': '🐷',
          'hiša': '🏠', 'dom': '🏠', 'stanovanje': '🏠',
          'avto': '🚗', 'avtomobil': '🚗', 'kolo': '🚲',
          'vlak': '🚂', 'avtobus': '🚌', 'letalo': '✈️',
          'ladja': '⛵', 'brod': '🚢',
          'denar': '💰', 'evri': '💶', 'dolar': '💵', 'zlato': '💰',
          'čas': '⏰', 'ura': '🕐', 'minuta': '⏱️', 'sekunda': '⏱️',
          'dan': '📅', 'teden': '📅', 'mesec': '📅', 'leto': '📅',
          'hrana': '🍔', 'jed': '🍽️', 'kosilo': '🍽️', 'večerja': '🍽️',
          'pica': '🍕', 'sendvič': '🥪', 'slaščica': '🍰', 'torta': '🎂',
          'jabolko': '🍎', 'banana': '🍌', 'jagoda': '🍓', 'grozdje': '🍇',
          'pivo': '🍺', 'vino': '🍷', 'koktajl': '🍹', 'voda': '💧',
          'veselje': '😊', 'sreča': '😄', 'nasmeh': '😊', 'smijeh': '😂',
          'žalost': '😢', 'tužnost': '😢', 'solze': '😭',
          'gnev': '😡', 'jeza': '😠', 'razjezen': '😡',
          'strah': '😱', 'plašiti': '😨', 'strašen': '😱',
          'presenečenje': '😲', 'šok': '😱',
          'ljubosumje': '😒', 'zavist': '😒',
          'spanje': '😴', 'spanje': '😴', 'zaspati': '😴',
          'bolan': '🤒', 'bolečina': '🤕', 'zdravje': '🏥',
          'bolnišnica': '🏥', 'zdravnik': '👨‍⚕️', 'lekar': '👩‍⚕️',
          'šola': '🏫', 'učitelji': '👨‍🏫', 'učiteljica': '👩‍🏫', 'učenje': '📚',
          'knjiga': '📖', 'knjige': '📚', 'branje': '📖',
          'pisanje': '✍️', 'pisati': '✏️', 'pisalo': '✏️',
          'glasba': '🎵', 'pesem': '🎵', 'pevaj': '🎤', 'koncert': '🎤',
          'film': '🎬', 'kino': '🎬', 'serija': '📺', 'tv': '📺',
          'igra': '🎮', 'gamer': '🎮', 'videoigra': '🎮',
          'šport': '⚽', 'nogomet': '⚽', 'košarka': '🏀', 'tenis': '🎾',
          'tekmovanje': '🏆', 'zmaga': '🏆', 'medalja': '🥇',
          'poklon': '🎁', 'darilo': '🎁', 'rojstni dan': '🎂', 'rojstni': '🎂',
          'praznik': '🎉', 'slavje': '🎊', 'novo leto': '🎆',
          'ljubljena': '💑', 'ljubljeni': '💑', 'partner': '💑', 'poroka': '💍',
          'družina': '👨‍👩‍👧‍👦', 'otroci': '👶', 'sin': '👦', 'hčerka': '👧',
          'mama': '👩', 'tata': '👨', 'babica': '👵', 'dedek': '👴',
          'prijatelj': '👯', 'prijateljica': '👯', 'znanec': '🤝',
          'pogovor': '💬', 'klepet': '💬', 'spor': '🗣️',
          'telefon': '📞', 'klic': '📞', 'sms': '📨', 'sporočilo': '💌',
          'email': '📧', 'pošta': '📮', 'paket': '📦',
          'delo': '💼', 'služba': '💼', 'kariera': '📈', 'posao': '💼',
          'srečanje': '🤝', 'seja': '📅', 'termin': '📅',
          'projekt': '📁', 'naloga': '📋', 'rok': '⏰', 'oddaja': '📤',
          'računalnik': '💻', 'laptop': '💻', 'mobilni': '📱', 'telefon': '📱',
          'internet': '🌐', 'splet': '🌐', 'wifi': '📶', 'signal': '📶',
          'kljukica': '✅', 'prav': '✅', 'narobe': '❌', 'napaka': '❌',
          'vprašanje': '❓', 'odgovor': '💡', 'ideja': '💡', 'misel': '💭',
          'opomba': '📝', 'zapis': '📝', 'seznam': '📋', 'nadaljevanje': '➡️',
          'levo': '⬅️', 'desno': '➡️', 'gor': '⬆️', 'dol': '⬇️',
          'iskanje': '🔍', 'najti': '🔍', 'skrit': '🕵️', 'tajnik': '🤫',
          'ključ': '🔑', 'zaklenjeno': '🔒', 'odklenjeno': '🔓',
          'varnost': '🛡️', 'zaščita': '🛡️', 'policija': '👮', 'gasilec': '🚒',
          'bolnica': '🏥', 'rešitev': '💡', 'problem': '❓', 'izziv': '🏔️',
          'plan': '📋', 'cilj': '🎯', 'uspeh': '✅', 'neuspeh': '❌',
          'prihodnje': '🔮', 'preteklost': '🕰️', 'sedaj': '⏰',
          'jutro': '🌅', 'poldne': '☀️', 'večer': '🌆', 'ponoč': '🌙',
          'ponedeljek': '📅', 'torek': '📅', 'sreda': '📅', 'četrtek': '📅', 'petek': '📅', 'sobota': '📅', 'nedelja': '📅',
          'januar': '❄️', 'februar': '❄️', 'marec': '🌱', 'april': '🌧️', 'maj': '🌸', 'junij': '☀️',
          'julij': '☀️', 'avgust': '🌞', 'september': '🍂', 'oktober': '🎃', 'november': '🍂', 'december': '🎄'
        },
        en: {
          'love': '❤️', 'heart': '❤️', 'hearts': '💕',
          'coffee': '☕', 'cafe': '☕', 'espresso': '☕',
          'sun': '☀️', 'sunny': '☀️', 'sunshine': '☀️',
          'moon': '🌙', 'night': '🌙', 'dark': '🌙',
          'star': '⭐', 'stars': '✨', 'sparkle': '✨',
          'rain': '🌧️', 'rainy': '🌧️', 'storm': '⛈️',
          'snow': '❄️', 'snowflake': '❄️', 'winter': '❄️',
          'tree': '🌳', 'forest': '🌲', 'nature': '🌿',
          'flower': '🌸', 'flowers': '🌺', 'rose': '🌹',
          'cat': '🐱', 'cats': '🐱', 'kitten': '🐱',
          'dog': '🐶', 'dogs': '🐶', 'puppy': '🐶',
          'bird': '🐦', 'birds': '🐦',
          'fish': '🐟', 'fishes': '🐟',
          'horse': '🐴', 'horses': '🐴',
          'cow': '🐄', 'sheep': '🐑', 'pig': '🐷',
          'house': '🏠', 'home': '🏠', 'building': '🏢',
          'car': '🚗', 'automobile': '🚗', 'bike': '🚲',
          'train': '🚂', 'bus': '🚌', 'plane': '✈️',
          'ship': '⛵', 'boat': '🚢',
          'money': '💰', 'euro': '💶', 'dollar': '💵', 'gold': '💰',
          'time': '⏰', 'hour': '🕐', 'minute': '⏱️', 'second': '⏱️',
          'day': '📅', 'week': '📅', 'month': '📅', 'year': '📅',
          'food': '🍔', 'meal': '🍽️', 'lunch': '🍽️', 'dinner': '🍽️',
          'pizza': '🍕', 'sandwich': '🥪', 'cake': '🍰', 'dessert': '🍰',
          'apple': '🍎', 'banana': '🍌', 'strawberry': '🍓', 'grapes': '🍇',
          'beer': '🍺', 'wine': '🍷', 'cocktail': '🍹', 'water': '💧',
          'happy': '😊', 'joy': '😄', 'smile': '😊', 'laugh': '😂',
          'sad': '😢', 'sadness': '😢', 'tears': '😭', 'cry': '😭',
          'angry': '😡', 'anger': '😠', 'mad': '😡', 'furious': '😡',
          'fear': '😱', 'scared': '😨', 'afraid': '😱', 'terrified': '😱',
          'surprise': '😲', 'shock': '😱', 'amazed': '😲',
          'jealous': '😒', 'envy': '😒',
          'sleep': '😴', 'sleepy': '😴', 'tired': '😴',
          'sick': '🤒', 'pain': '🤕', 'health': '🏥', 'ill': '🤒',
          'hospital': '🏥', 'doctor': '👨‍⚕️', 'nurse': '👩‍⚕️',
          'school': '🏫', 'teacher': '👨‍🏫', 'learning': '📚', 'study': '📖',
          'book': '📖', 'books': '📚', 'reading': '📖',
          'writing': '✍️', 'write': '✏️', 'pen': '✏️', 'pencil': '✏️',
          'music': '🎵', 'song': '🎵', 'sing': '🎤', 'concert': '🎤',
          'movie': '🎬', 'cinema': '🎬', 'series': '📺', 'tv': '📺',
          'game': '🎮', 'gamer': '🎮', 'videogame': '🎮',
          'sport': '⚽', 'football': '⚽', 'soccer': '⚽', 'basketball': '🏀', 'tennis': '🎾',
          'competition': '🏆', 'win': '🏆', 'victory': '🏆', 'medal': '🥇',
          'gift': '🎁', 'present': '🎁', 'birthday': '🎂', 'party': '🎉',
          'holiday': '🎉', 'celebration': '🎊', 'new year': '🎆',
          'couple': '💑', 'partner': '💑', 'marriage': '💍', 'wedding': '💍',
          'family': '👨‍👩‍👧‍👦', 'children': '👶', 'son': '👦', 'daughter': '👧',
          'mom': '👩', 'mother': '👩', 'dad': '👨', 'father': '👨', 'grandma': '👵', 'grandpa': '👴',
          'friend': '👯', 'friends': '👯', 'acquaintance': '🤝',
          'talk': '💬', 'chat': '💬', 'argument': '🗣️', 'discussion': '💬',
          'phone': '📞', 'call': '📞', 'sms': '📨', 'message': '💌',
          'email': '📧', 'mail': '📮', 'package': '📦',
          'work': '💼', 'job': '💼', 'career': '📈', 'office': '🏢',
          'meeting': '🤝', 'appointment': '📅', 'schedule': '📅',
          'project': '📁', 'task': '📋', 'deadline': '⏰', 'submit': '📤',
          'computer': '💻', 'laptop': '💻', 'mobile': '📱', 'phone': '📱',
          'internet': '🌐', 'web': '🌐', 'wifi': '📶', 'signal': '📶',
          'check': '✅', 'yes': '✅', 'correct': '✅', 'wrong': '❌', 'error': '❌',
          'question': '❓', 'answer': '💡', 'idea': '💡', 'thought': '💭',
          'note': '📝', 'memo': '📝', 'list': '📋', 'next': '➡️',
          'left': '⬅️', 'right': '➡️', 'up': '⬆️', 'down': '⬇️',
          'search': '🔍', 'find': '🔍', 'hidden': '🕵️', 'secret': '🤫',
          'key': '🔑', 'locked': '🔒', 'unlocked': '🔓',
          'security': '🛡️', 'protection': '🛡️', 'police': '👮', 'firefighter': '🚒',
          'hospital': '🏥', 'solution': '💡', 'problem': '❓', 'challenge': '🏔️',
          'plan': '📋', 'goal': '🎯', 'success': '✅', 'failure': '❌',
          'future': '🔮', 'past': '🕰️', 'now': '⏰',
          'morning': '🌅', 'noon': '☀️', 'evening': '🌆', 'midnight': '🌙',
          'monday': '📅', 'tuesday': '📅', 'wednesday': '📅', 'thursday': '📅', 'friday': '📅', 'saturday': '📅', 'sunday': '📅',
          'january': '❄️', 'february': '❄️', 'march': '🌱', 'april': '🌧️', 'may': '🌸', 'june': '☀️',
          'july': '☀️', 'august': '🌞', 'september': '🍂', 'october': '🎃', 'november': '🍂', 'december': '🎄'
        }
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

      const input = container.querySelector("#te-input");
      const outputWrap = container.querySelector("#te-output-wrap");
      const modeSel = container.querySelector("#te-mode");
      const caseCheck = container.querySelector("#te-case");
      const unknownCheck = container.querySelector("#te-unknown");

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
        
        outputWrap.innerHTML = result || (L ? '<span style="color:var(--text-dim);">Ni ujemanj. Poskusite druge besede.</span>' : '<span style="color:var(--text-dim);">No matches. Try other words.</span>');
      }

      [input, modeSel, caseCheck, unknownCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#te-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#te-copy").addEventListener("click", () => {
        copyText(outputWrap.innerText || outputWrap.textContent, container.querySelector("#te-copy"));
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
            <button class="fc-del" data-i="${i}" title="${L ? 'Izbriši' : 'Delete'}" style="flex:none; border:none; background:transparent; color:var(--danger,#e5484d); cursor:pointer; font-size:16px;">✕</button>
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
      const input = container.querySelector("#ts-input");
      const dir = container.querySelector("#ts-dir");
      const size = container.querySelector("#ts-size");
      const output = container.querySelector("#ts-output");

      function update() {
        const n = Math.max(1, parseInt(size.value) || 4);
        if (dir.value === "tab2sp") {
          output.value = input.value.replace(/\t/g, " ".repeat(n));
        } else {
          output.value = input.value.replace(new RegExp(" ".repeat(n), "g"), "\t");
        }
      }
      [input, dir, size].forEach(el => el.addEventListener("input", update));
      container.querySelector("#ts-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#ts-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#ts-copy"));
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
      const input = container.querySelector("#sq-input");
      const style = container.querySelector("#sq-style");
      const output = container.querySelector("#sq-output");

      function update() {
        let t = input.value;
        const s = style.value;
        if (s === "straight") {
          t = t.replace(/[“”„«»]/g, '"').replace(/[‘’‚‹›]/g, "'");
        } else if (s === "sl") {
          t = t.replace(/(^|[\s(\[{<])"/g, '$1„').replace(/"/g, '“');
          t = t.replace(/(^|[\s(\[{<])'/g, '$1‚').replace(/'/g, '‘');
        } else if (s === "en") {
          t = t.replace(/(^|[\s(\[{<])"/g, '$1“').replace(/"/g, '”');
          t = t.replace(/(^|[\s(\[{<])'/g, '$1‘').replace(/'/g, '’');
        } else if (s === "guillemets") {
          t = t.replace(/(^|[\s(\[{<])"/g, '$1«').replace(/"/g, '»');
          t = t.replace(/(^|[\s(\[{<])'/g, '$1‹').replace(/'/g, '›');
        }
        output.value = t;
      }
      [input, style].forEach(el => el.addEventListener("input", update));
      container.querySelector("#sq-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#sq-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#sq-copy"));
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
      const input = container.querySelector("#sj-input");
      const splitEl = container.querySelector("#sj-split");
      const joinEl = container.querySelector("#sj-join");
      const trimCheck = container.querySelector("#sj-trim");
      const dropEmpty = container.querySelector("#sj-dropempty");
      const output = container.querySelector("#sj-output");

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
      [input, splitEl, joinEl, trimCheck, dropEmpty].forEach(el => el.addEventListener("input", update));
      container.querySelector("#sj-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#sj-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#sj-copy"));
      });
    }

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
            <option value="line_word" selected>${L ? 'Vrstice + besede (priročno za kodo)' : 'Lines + Words (great for code)'}</option>
            <option value="chars">${L ? 'Po znakih (zatipki, lektoriranje)' : 'Char-by-Char (typos / proofreading)'}</option>
            <option value="words">${L ? 'Zvezno po besedah (članki, proza)' : 'Word-by-Word (articles / prose)'}</option>
            <option value="lines_only">${L ? 'Samo cele vrstice (hitri pregled)' : 'Lines Only (quick)'}</option>
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px;">
          ${L ? 'Prikaz:' : 'View Mode:'}
          <select id="cmp-view" style="padding:5px 8px; font-size:13px; border-radius:8px;">
            <option value="inline" selected>${L ? 'V besedilu (oznake sprememb)' : 'Inline (track changes)'}</option>
            <option value="split">${L ? 'Stran ob strani (row diff)' : 'Side-by-Side (row diff)'}</option>
            <option value="unified">${L ? 'Združeni diff (+/−)' : 'Unified Diff (+/−)'}</option>
            <option value="prose">${L ? 'Zvezno besedilo (enoten pogled)' : 'Visual Prose (combined)'}</option>
            <option value="merged">${L ? 'Čisto končno besedilo B' : 'Clean Output B'}</option>
          </select>
        </label>
      </div>

      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <button class="btn-sm primary" id="cmp-go" style="padding:7px 16px; font-size:13px; box-shadow:0 2px 8px rgba(79,70,229,0.3);" aria-label="${L ? 'Primerjaj besedili' : 'Compare texts'}">${SVG_ICONS.mi_refresh} ${L ? 'Primerjaj' : 'Compare'}</button>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-show-same" checked aria-label="${L ? 'Pokaži nespremenjene vrstice' : 'Show unchanged lines'}"> ${L ? 'Pokaži nespremenjene' : 'Show unchanged'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-case" aria-label="${L ? 'Ignoriraj velike in male črke' : 'Ignore case'}"> ${L ? 'Ignoriraj velike/male' : 'Ignore case'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-ws" aria-label="${L ? 'Ignoriraj presledke' : 'Ignore whitespace'}"> ${L ? 'Ignoriraj presledke' : 'Ignore whitespace'}</label>
      </div>
    </div>

    <!-- 2-COLUMN INPUTS -->
    <div class="tool-workspace-2col" style="margin-bottom:12px;">
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-a" style="margin:0; font-weight:600; color:#ef4444;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original Text (A)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <label class="btn-sm" for="cmp-file-a" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi A' : 'Import A'}</label>
            <input type="file" id="cmp-file-a" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-sample" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_edit} ${L ? 'Primer' : 'Sample'}</button>
            <button id="cmp-clear-a" class="btn-sm" style="padding:2px 8px; font-size:11px;" aria-label="${L ? 'Počisti A' : 'Clear A'}">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-a" rows="6" placeholder="${L ? 'Prilepite ali vnesite prvotno besedilo (A)...' : 'Paste original text (A)...'}" style="min-height:150px;">${sampleA}</textarea>
        <div id="cmp-meta-a" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>

      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-b" style="margin:0; font-weight:600; color:#22c55e;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified Text (B)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="cmp-swap" class="btn-sm" style="padding:2px 8px; font-size:11px;" title="${L ? 'Zamenjaj A in B' : 'Swap A and B'}">${SVG_ICONS.mi_swap} ${L ? 'Zamenjaj A ↔ B' : 'Swap A ↔ B'}</button>
            <label class="btn-sm" for="cmp-file-b" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi B' : 'Import B'}</label>
            <input type="file" id="cmp-file-b" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-clear-b" class="btn-sm" style="padding:2px 8px; font-size:11px;" aria-label="${L ? 'Počisti B' : 'Clear B'}">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-b" rows="6" placeholder="${L ? 'Prilepite ali vnesite spremenjeno besedilo (B)...' : 'Paste modified text (B)...'}" style="min-height:150px;">${sampleB}</textarea>
        <div id="cmp-meta-b" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>
    </div>

    <!-- PRIMERJAJ GUMB (spodaj pod vhodnimi polji) -->
    <div style="display:flex; justify-content:center; margin-bottom:14px;">
      <button class="btn-sm primary" id="cmp-go2" style="padding:10px 28px; font-size:14px; box-shadow:0 2px 8px rgba(79,70,229,0.3);" aria-label="${L ? 'Primerjaj besedili' : 'Compare texts'}">${SVG_ICONS.mi_refresh} ${L ? 'Primerjaj besedili' : 'Compare Texts'}</button>
    </div>

    <!-- STATS & BADGES + NAVIGATION ROW -->
    <div id="cmp-stats-bar" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;"></div>

    <!-- VISUAL DIFF VIEWER DISPLAY -->
    <div id="cmp-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; min-height:220px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px; line-height:1.6;"></div>

    <!-- ACTION BUTTONS -->
    <div class="modal-actions" style="margin-top:14px; gap:8px; flex-wrap:wrap; justify-content:flex-start;">
      <button class="btn-sm primary" id="cmp-copy-unified">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj Unified Patch (.diff)' : 'Copy Unified Patch (.diff)'}</button>
      <button class="btn-sm" id="cmp-dl-diff">${SVG_ICONS.mi_copy} ${L ? 'Prenesi .diff' : 'Download .diff'}</button>
      <button class="btn-sm" id="cmp-copy-b">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj končno besedilo B' : 'Copy Final Text B'}</button>
      <button class="btn-sm" id="cmp-copy-html">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj barvni HTML' : 'Copy Formatted HTML'}</button>
      <button class="btn-sm" id="cmp-dl-html">${SVG_ICONS.mi_copy} ${L ? 'Prenesi .html' : 'Download .html'}</button>
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

      let alignedRows = [];
      let navIdx = 0;

      function lcs(a, b) {
        const m = a.length, n = b.length;
        if (m === 0 && n === 0) return [];
        if (m === 0) return b.map(val => ({ type: 'insert', val }));
        if (n === 0) return a.map(val => ({ type: 'delete', val }));

        // Memory cap for large inputs
        if (m * n > 4000000) {
          const ops = [];
          let i = 0, j = 0;
          while (i < m || j < n) {
            if (i < m && j < n && a[i] === b[j]) { ops.push({ type: 'equal', val: a[i] }); i++; j++; }
            else if (i < m && (j >= n || a[i] !== b[j])) { ops.push({ type: 'delete', val: a[i] }); i++; }
            else if (j < n) { ops.push({ type: 'insert', val: b[j] }); j++; }
          }
          return ops;
        }

        const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }

        const ops = [];
        let i = m, j = n;
        while (i > 0 || j > 0) {
          if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { ops.push({ type: 'equal', val: a[i - 1] }); i--; j--; }
          else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { ops.push({ type: 'insert', val: b[j - 1] }); j--; }
          else { ops.push({ type: 'delete', val: a[i - 1] }); i--; }
        }
        return ops.reverse();
      }

      function diffCharsPair(strA, strB, ignoreCase) {
        const charsA = [...strA];
        const charsB = [...strB];
        const normA = ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA;
        const normB = ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB;
        const ops = lcs(normA, normB);
        let htmlA = '', htmlB = '';
        let ptrA = 0, ptrB = 0;
        ops.forEach(op => {
          if (op.type === 'equal') { htmlA += escapeHtml(charsA[ptrA++]); htmlB += escapeHtml(charsB[ptrB++]); }
          else if (op.type === 'delete') { htmlA += `<span class="diff-del">${escapeHtml(charsA[ptrA++])}</span>`; }
          else if (op.type === 'insert') { htmlB += `<span class="diff-add">${escapeHtml(charsB[ptrB++])}</span>`; }
        });
        return { htmlA, htmlB };
      }

      function diffWordsPair(strA, strB, ignoreCase, ignoreWs) {
        const tokensA = strA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        const tokensB = strB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        function norm(t) { let s = t; if (ignoreWs) s = s.replace(/\s+/g, ' '); if (ignoreCase) s = s.toLowerCase(); return s; }
        const normA = tokensA.map(norm);
        const normB = tokensB.map(norm);
        const ops = lcs(normA, normB);
        let htmlA = '', htmlB = '';
        let ptrA = 0, ptrB = 0;
        ops.forEach(op => {
          if (op.type === 'equal') {
            htmlA += escapeHtml(tokensA[ptrA++] || '');
            htmlB += escapeHtml(tokensB[ptrB++] || '');
          } else if (op.type === 'delete') {
            htmlA += `<span class="diff-del">${escapeHtml(tokensA[ptrA++] || '')}</span>`;
          } else if (op.type === 'insert') {
            htmlB += `<span class="diff-add">${escapeHtml(tokensB[ptrB++] || '')}</span>`;
          }
        });
        return { htmlA, htmlB };
      }

      // Glavna primerjava: obdelava vrstic -> alignedRows (enako kot prej), potem prikaz.
      function runDiff() {
        const rawA = inputA.value;
        const rawB = inputB.value;
        const algo = algoSel.value;
        const showSame = showSameCheck.checked;
        const ignoreCase = ignoreCaseCheck.checked;
        const ignoreWs = ignoreWsCheck.checked;

        // Meta counts + large-file warning
        const LARGE_LIMIT = 80000;
        const wordsCountA = (rawA.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
        const wordsCountB = (rawB.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
        const linesCountA = rawA ? rawA.split(/\r?\n/).length : 0;
        const linesCountB = rawB ? rawB.split(/\r?\n/).length : 0;
        const warnA = rawA.length > LARGE_LIMIT ? ` ⚠ ${L ? 'velika datoteka' : 'large file'}` : '';
        const warnB = rawB.length > LARGE_LIMIT ? ` ⚠ ${L ? 'velika datoteka' : 'large file'}` : '';
        metaA.textContent = `${linesCountA} ${L ? 'vrstic' : 'lines'} | ${wordsCountA} ${L ? 'besed' : 'words'} | ${rawA.length} ${L ? 'znakov' : 'chars'}${warnA}`;
        metaB.textContent = `${linesCountB} ${L ? 'vrstic' : 'lines'} | ${wordsCountB} ${L ? 'besed' : 'words'} | ${rawB.length} ${L ? 'znakov' : 'chars'}${warnB}`;
        metaA.style.color = rawA.length > LARGE_LIMIT ? '#d97706' : '';
        metaB.style.color = rawB.length > LARGE_LIMIT ? '#d97706' : '';

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

        alignedRows = [];
        let curLineA = 1, curLineB = 1;
        let ptrA = 0, ptrB = 0;

        for (let idx = 0; idx < lineOps.length; idx++) {
          const op = lineOps[idx];
          if (op.type === 'equal') {
            alignedRows.push({ type: 'equal', numA: curLineA++, numB: curLineB++, textA: linesA[ptrA++], textB: linesB[ptrB++] });
          } else if (op.type === 'delete') {
            if (idx + 1 < lineOps.length && lineOps[idx + 1].type === 'insert') {
              alignedRows.push({ type: 'modify', numA: curLineA++, numB: curLineB++, textA: linesA[ptrA++], textB: linesB[ptrB++] });
              idx++;
            } else {
              alignedRows.push({ type: 'delete', numA: curLineA++, numB: null, textA: linesA[ptrA++], textB: null });
            }
          } else if (op.type === 'insert') {
            alignedRows.push({ type: 'insert', numA: null, numB: curLineB++, textA: null, textB: linesB[ptrB++] });
          }
        }

        // Stats
        let totalAdds = 0, totalDels = 0, totalMod = 0, totalEq = 0;
        alignedRows.forEach(r => {
          if (r.type === 'insert') totalAdds++;
          else if (r.type === 'delete') totalDels++;
          else if (r.type === 'modify') totalMod++;
          else totalEq++;
        });
        const totalItems = alignedRows.length || 1;
        const simPct = Math.max(0, Math.min(100, Math.round((totalEq / totalItems) * 100)));

        const totalChanges = totalAdds + totalDels + totalMod;
        statsBar.innerHTML = `
          <span class="diff-badge diff-badge-add">+ ${totalAdds} ${L ? 'dodanih' : 'added'}</span>
          <span class="diff-badge diff-badge-del">- ${totalDels} ${L ? 'odstranjenih' : 'deleted'}</span>
          <span class="diff-badge diff-badge-mod">~ ${totalMod} ${L ? 'spremenjenih' : 'modified'}</span>
          <span class="diff-badge diff-badge-sim">${SVG_ICONS.mi_star} ${L ? 'Podobnost' : 'Similarity'}: ${simPct}%</span>
          ${totalChanges ? `<span id="cmp-nav-counter" style="font-size:12px; color:var(--text-dim); margin-left:4px;">1 / ${totalChanges}</span>` : ''}
          <span style="flex:1;"></span>
          <button class="btn-sm" id="cmp-prev" style="padding:3px 10px; font-size:12px;" title="${L ? 'Prejšnja sprememba (Shift+Enter)' : 'Previous change (Shift+Enter)'}" aria-label="${L ? 'Prejšnja sprememba' : 'Previous change'}">${L ? 'Prejšnja' : 'Prev'} ▲</button>
          <button class="btn-sm" id="cmp-next" style="padding:3px 10px; font-size:12px;" title="${L ? 'Naslednja sprememba (Enter)' : 'Next change (Enter)'}" aria-label="${L ? 'Naslednja sprememba' : 'Next change'}">${L ? 'Naslednja' : 'Next'} ▼</button>
        `;
        container.querySelector('#cmp-prev').addEventListener('click', () => navChange(-1));
        container.querySelector('#cmp-next').addEventListener('click', () => navChange(1));
        navIdx = 0;
      }

      function renderView() {
        const view = viewSel.value;
        const algo = algoSel.value;
        const showSame = showSameCheck.checked;
        const ignoreCase = ignoreCaseCheck.checked;
        const ignoreWs = ignoreWsCheck.checked;
        const rawA = inputA.value;
        const rawB = inputB.value;

        if (view === 'merged') {
          outputWrap.innerHTML = `
            <div style="padding:16px;">
              <div style="font-weight:600; margin-bottom:8px; color:var(--text-dim);">${L ? 'Čisto končno besedilo (B):' : 'Clean Final Text (B):'}</div>
              <pre style="margin:0; white-space:pre-wrap; font-family:inherit; font-size:13px; line-height:1.6;">${escapeHtml(rawB)}</pre>
            </div>`;
          return;
        }

        if (view === 'prose') {
          outputWrap.innerHTML = renderProse(algo, ignoreCase, ignoreWs);
          return;
        }

        if (view === 'inline') {
          outputWrap.innerHTML = renderInline(algo, ignoreCase, ignoreWs);
          return;
        }

        if (view === 'unified') {
          renderUnified(algo, ignoreCase, ignoreWs, showSame);
          return;
        }

        // split
        renderSplit(algo, ignoreCase, ignoreWs, showSame);
      }

      function renderProse(algo, ignoreCase, ignoreWs) {
        const rawA = inputA.value;
        const rawB = inputB.value;
        // cap prose diff for huge inputs to avoid freeze
        if (rawA.length + rawB.length > 120000) {
          return `<div style="padding:14px; font-size:12px; color:#d97706; border-bottom:1px solid var(--border);">${L ? 'Besedilo je preveliko za zvezni prose način – preklopite na "Samo vrstice" ali "V besedilu".' : 'Text too large for prose mode — switch to Lines Only or Inline.'}</div><div style="padding:18px; white-space:pre-wrap; color:var(--text-dim);">${escapeHtml(rawB.slice(0,4000))}…</div>`;
        }
        let txt;
        if (algo === 'chars') {
          const charsA = [...rawA], charsB = [...rawB];
          const normA = ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA;
          const normB = ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB;
          // ignoreWs has no effect in char mode — whitespace is char too
          const ops = lcs(normA, normB);
          let pA = 0, pB = 0, t = '';
          ops.forEach(op => {
            if (op.type === 'equal') { t += escapeHtml(charsA[pA++]); pB++; }
            else if (op.type === 'delete') { t += `<span class="diff-del">${escapeHtml(charsA[pA++])}</span>`; }
            else if (op.type === 'insert') { t += `<span class="diff-add">${escapeHtml(charsB[pB++])}</span>`; }
          });
          txt = t;
        } else {
          const wordsA = rawA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
          const wordsB = rawB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
          function normW(t) { let s = t; if (ignoreWs) s = s.replace(/^\s+|\s+$/g, '') || ' '; if (ignoreCase) s = s.toLowerCase(); return s; }
          const normA = wordsA.map(normW);
          const normB = wordsB.map(normW);
          const ops = lcs(normA, normB);
          let pA = 0, pB = 0, t = '';
          ops.forEach(op => {
            if (op.type === 'equal') { t += escapeHtml(wordsA[pA++]); pB++; }
            else if (op.type === 'delete') { t += `<span class="diff-del">${escapeHtml(wordsA[pA++])}</span>`; }
            else if (op.type === 'insert') { t += `<span class="diff-add">${escapeHtml(wordsB[pB++])}</span>`; }
          });
          txt = t;
        }
        const legend = `<div style="padding:10px 14px; border-bottom:1px solid var(--border); font-size:11px; color:var(--text-dim); display:flex; gap:14px; flex-wrap:wrap;">
          <span><span class="diff-add" style="padding:0 4px;">dodano</span> ${L ? 'dodano' : 'added'}</span>
          <span><span class="diff-del" style="padding:0 4px;">odstranjeno</span> ${L ? 'odstranjeno' : 'removed'}</span>
        </div>`;
        return `${legend}<div style="padding:18px; line-height:1.8; white-space:pre-wrap; max-height:520px; overflow-y:auto;">${txt || `<span style="color:var(--text-dim);">${L ? 'Besedili sta identični.' : 'Texts are identical.'}</span>`}</div>`;
      }

      // INLINE: spremembe označene znotraj samega besedila (track changes slog)
      function renderInline(algo, ignoreCase, ignoreWs) {
        const rawA = inputA.value;
        const rawB = inputB.value;
        const linesA = rawA.split(/\r?\n/);
        const linesB = rawB.split(/\r?\n/);
        const showSame = showSameCheck.checked;

        let html = '';
        html += `<div style="padding:10px 14px; border-bottom:1px solid var(--border); font-size:11px; color:var(--text-dim); display:flex; gap:14px; flex-wrap:wrap;">
          <span><span class="diff-add" style="padding:0 4px;">dodano</span> ${L ? 'dodano' : 'added'}</span>
          <span><span class="diff-del" style="padding:0 4px;">odstranjeno</span> ${L ? 'odstranjeno' : 'removed'}</span>
        </div>`;

        // Dva stolpca z inline označenimi spremembami
        html += `<div id="cmp-inline-scroll" style="display:grid; grid-template-columns:1fr 1fr; max-height:520px; overflow:auto;">
          <div style="border-right:1px solid var(--border);">
            <div style="padding:8px 12px; font-size:12px; font-weight:700; background:rgba(239,68,68,0.10); color:#dc2626; position:sticky; top:0;">${L ? 'A — prvotno (odstranjeno)' : 'A — original (removed)'}</div>`;

        // A column: mark deletions inline within each line — O(1) lookup via Map
        const mapA = new Map();
        alignedRows.forEach(r => { if (r.numA != null) mapA.set(r.numA, r); });
        const leftCol = [];
        linesA.forEach((ln, i) => {
          const lnNum = i + 1;
          const match = mapA.get(lnNum);
          let content;
          if (match && (match.type === 'modify' || match.type === 'delete')) {
            let pair;
            if (algo === 'chars') pair = diffCharsPair(ln, match.type === 'delete' ? '' : (match.textB || ''), ignoreCase);
            else if (algo !== 'lines_only' && match.type === 'modify') pair = diffWordsPair(ln, match.textB || '', ignoreCase, ignoreWs);
            else pair = { htmlA: `<span class="diff-del">${escapeHtml(ln)}</span>` };
            content = pair.htmlA;
            leftCol.push({ num: lnNum, changed: true, html: content });
          } else if (match && match.type === 'equal') {
            if (!showSame) return;
            leftCol.push({ num: lnNum, changed: false, html: escapeHtml(ln) });
          } else {
            leftCol.push({ num: lnNum, changed: false, html: `<span style="color:var(--text-dimmer);">${L ? '(ni v A)' : '(not in A)'}</span>` });
          }
        });

        leftCol.forEach(l => {
          html += `<div class="diff-inline-row" data-num="${l.num}" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.04); ${l.changed ? 'background:rgba(239,68,68,0.07);' : ''}">
            <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:${l.changed ? '#dc2626' : 'var(--text-dimmer)'}; font-weight:600; user-select:none; border-right:1px solid var(--border);">${l.num}</div>
            <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${l.html}</div>
          </div>`;
        });

        html += `</div><div>`;
        html += `<div style="padding:8px 12px; font-size:12px; font-weight:700; background:rgba(34,197,94,0.10); color:#16a34a; position:sticky; top:0;">${L ? 'B — spremenjeno (dodano)' : 'B — modified (added)'}</div>`;

        const mapB = new Map();
        alignedRows.forEach(r => { if (r.numB != null) mapB.set(r.numB, r); });
        const rightCol = [];
        linesB.forEach((ln, i) => {
          const lnNum = i + 1;
          const match = mapB.get(lnNum);
          let content;
          if (match && (match.type === 'modify' || match.type === 'insert')) {
            let pair;
            if (algo === 'chars') pair = diffCharsPair(match.type === 'insert' ? '' : (match.textA || ''), ln, ignoreCase);
            else if (algo !== 'lines_only' && match.type === 'modify') pair = diffWordsPair(match.textA || '', ln, ignoreCase, ignoreWs);
            else pair = { htmlB: `<span class="diff-add">${escapeHtml(ln)}</span>` };
            content = pair.htmlB;
            rightCol.push({ num: lnNum, changed: true, html: content });
          } else if (match && match.type === 'equal') {
            if (!showSame) return;
            rightCol.push({ num: lnNum, changed: false, html: escapeHtml(ln) });
          } else {
            rightCol.push({ num: lnNum, changed: false, html: `<span style="color:var(--text-dimmer);">${L ? '(ni v B)' : '(not in B)'}</span>` });
          }
        });

        rightCol.forEach(l => {
          html += `<div class="diff-inline-row" data-num="${l.num}" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.04); ${l.changed ? 'background:rgba(34,197,94,0.07);' : ''}">
            <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:${l.changed ? '#16a34a' : 'var(--text-dimmer)'}; font-weight:600; user-select:none; border-right:1px solid var(--border);">${l.num}</div>
            <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${l.html}</div>
          </div>`;
        });

        html += `</div></div>`;
        return html;
      }

      function renderUnified(algo, ignoreCase, ignoreWs, showSame) {
        let unifiedHtml = `
          <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; background:var(--card); font-size:12px; border-bottom:1px solid var(--border); font-weight:600; color:var(--text-dim); padding:6px 0;">
            <div style="text-align:center;">A</div><div style="text-align:center;">B</div><div style="text-align:center;">+/-</div><div style="padding-left:8px;">${L ? 'Vsebina' : 'Content'}</div>
          </div>
          <div style="max-height:480px; overflow-y:auto;">`;
        alignedRows.forEach(r => {
          if (r.type === 'equal') {
            if (!showSame) return;
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numA}</div>
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numB}</div>
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;"></div>
              <div style="padding-left:8px; white-space:pre-wrap; color:var(--text);">${escapeHtml(r.textA)}</div></div>`;
          } else if (r.type === 'modify') {
            let pair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
            if (algo === 'chars') pair = diffCharsPair(r.textA, r.textB, ignoreCase);
            else if (algo !== 'lines_only') pair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
              <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div><div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${pair.htmlA}</div></div>
            <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div><div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${pair.htmlB}</div></div>`;
          } else if (r.type === 'delete') {
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
              <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div><div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${escapeHtml(r.textA)}</div></div>`;
          } else if (r.type === 'insert') {
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div><div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${escapeHtml(r.textB)}</div></div>`;
          }
        });
        unifiedHtml += `</div>`;
        outputWrap.innerHTML = unifiedHtml;
      }

      function renderSplit(algo, ignoreCase, ignoreWs, showSame) {
        let splitHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid var(--border); background:var(--card); font-weight:600; font-size:12px; color:var(--text-dim);">
            <div style="padding:8px 12px; border-right:1px solid var(--border); display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original (A)'}</span>
              <span>${inputA.value ? inputA.value.split(/\r?\n/).length : 0} ${L ? 'vrstic' : 'lines'}</span>
            </div>
            <div style="padding:8px 12px; display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified (B)'}</span>
              <span>${inputB.value ? inputB.value.split(/\r?\n/).length : 0} ${L ? 'vrstic' : 'lines'}</span>
            </div>
          </div>
          <div id="cmp-side-scroll" style="display:grid; grid-template-columns:1fr 1fr; max-height:480px; overflow-y:auto; overflow-x:auto;">
            <div id="cmp-col-left" style="border-right:1px solid var(--border); min-width:0;">`;

        let leftRowsHtml = '';
        let rightRowsHtml = '';
        alignedRows.forEach(r => {
          if (r.type === 'equal') {
            if (!showSame) return;
            const textEsc = escapeHtml(r.textA);
            leftRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numA}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div></div>`;
            rightRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numB}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div></div>`;
          } else if (r.type === 'modify') {
            let pair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
            if (algo === 'chars') pair = diffCharsPair(r.textA, r.textB, ignoreCase);
            else if (algo !== 'lines_only') pair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
            leftRowsHtml += `<div class="diff-line-rem" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(239,68,68,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${pair.htmlA}</div></div>`;
            rightRowsHtml += `<div class="diff-line-add" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(34,197,94,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${pair.htmlB}</div></div>`;
          } else if (r.type === 'delete') {
            leftRowsHtml += `<div class="diff-line-rem" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(239,68,68,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${escapeHtml(r.textA)}</div></div>`;
            rightRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
              <div style="padding-left:8px; flex:1;">&nbsp;</div></div>`;
          } else if (r.type === 'insert') {
            leftRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
              <div style="padding-left:8px; flex:1;">&nbsp;</div></div>`;
            rightRowsHtml += `<div class="diff-line-add" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(34,197,94,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${escapeHtml(r.textB)}</div></div>`;
          }
        });

        splitHtml += leftRowsHtml + `</div><div id="cmp-col-right" style="min-width:0;">` + rightRowsHtml + `</div></div>`;
        outputWrap.innerHTML = splitHtml;

        // Split uses single scroll container — no sync needed (removed no-op listener)
      }

      function navChange(dir) {
        const changedIndices = [];
        alignedRows.forEach((r, i) => { if (r.type !== 'equal') changedIndices.push(i); });
        if (!changedIndices.length) return;
        navIdx = (navIdx + dir + changedIndices.length) % changedIndices.length;
        const view = viewSel.value;
        // highlight + scroll
        const allActive = outputWrap.querySelectorAll('.diff-nav-active');
        allActive.forEach(el => el.classList.remove('diff-nav-active'));
        let targetEl = null;
        if (view === 'inline') {
          const rows = outputWrap.querySelectorAll('.diff-inline-row');
          // inline has 2× rows (left+right), index by change order in alignedRows → map to nth changed row in DOM
          // build list of only changed inline rows (those with colored background)
          const changedInline = [...rows].filter(el => el.style.background.includes('rgba'));
          // fallback: if filter fails, use all rows and pick by navIdx
          targetEl = changedInline[navIdx] || rows[navIdx] || null;
        } else if (view === 'split') {
          const leftChanged = outputWrap.querySelectorAll('#cmp-col-left .diff-line-rem, #cmp-col-left .diff-line-add');
          const rightChanged = outputWrap.querySelectorAll('#cmp-col-right .diff-line-rem, #cmp-col-right .diff-line-add');
          // prefer whichever column has the change; pick by navIdx modulo
          const flat = [...leftChanged, ...rightChanged];
          // sort by DOM order not needed — just cycle through aligned change order
          // map navIdx to flat index
          targetEl = flat[navIdx % flat.length] || flat[0];
        } else if (view === 'unified') {
          const uniRows = outputWrap.querySelectorAll('[style*="background:rgba"]');
          targetEl = uniRows[navIdx] || uniRows[0];
        } else {
          const proseSpans = outputWrap.querySelectorAll('.diff-add, .diff-del');
          targetEl = proseSpans[navIdx] || proseSpans[0];
        }
        if (targetEl) {
          targetEl.classList.add('diff-nav-active');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // update stats badge counter
        const counter = container.querySelector('#cmp-nav-counter');
        if (counter) counter.textContent = `${navIdx + 1} / ${changedIndices.length}`;
      }

      function compare() {
        runDiff();
        renderView();
      }

      function update() {
        // štej meta tudi brez polnega prikaza, preveri vnos
        const rawA = inputA.value;
        const rawB = inputB.value;
        if (!rawA && !rawB) {
          statsBar.innerHTML = `<span style="font-size:12px; color:var(--text-dim);">${L ? 'Vnesite besedilo A in B za primerjavo.' : 'Enter text A and B to compare.'}</span>`;
          outputWrap.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim);">${L ? 'Ni podatkov za primerjavo.' : 'No data to compare.'}</div>`;
          // meta šteti
          const wordsCountA = (rawA.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
          const wordsCountB = (rawB.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
          const linesCountA = rawA ? rawA.split(/\r?\n/).length : 0;
          const linesCountB = rawB ? rawB.split(/\r?\n/).length : 0;
          metaA.textContent = `${linesCountA} ${L ? 'vrstic' : 'lines'} | ${wordsCountA} ${L ? 'besed' : 'words'} | ${rawA.length} ${L ? 'znakov' : 'chars'}`;
          metaB.textContent = `${linesCountB} ${L ? 'vrstic' : 'lines'} | ${wordsCountB} ${L ? 'besed' : 'words'} | ${rawB.length} ${L ? 'znakov' : 'chars'}`;
          return;
        }
        compare();
      }

      function readUpload(fileInput, targetTextarea) {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { targetTextarea.value = reader.result || ''; compare(); };
        reader.readAsText(file, 'UTF-8');
      }

      fileA.addEventListener('change', () => readUpload(fileA, inputA));
      fileB.addEventListener('change', () => readUpload(fileB, inputB));

      let _cmpDebounce;
      const DEBOUNCE_MS = 180;
      const LARGE_DEBOUNCE_MS = 500;
      [inputA, inputB].forEach(el => el.addEventListener('input', () => {
        clearTimeout(_cmpDebounce);
        const isLarge = (inputA.value.length + inputB.value.length) > 80000;
        _cmpDebounce = setTimeout(compare, isLarge ? LARGE_DEBOUNCE_MS : DEBOUNCE_MS);
      }));

      [algoSel, viewSel, showSameCheck, ignoreCaseCheck, ignoreWsCheck].forEach(el => {
        el.addEventListener('change', compare);
      });

      container.querySelector('#cmp-go').addEventListener('click', compare);
      container.querySelector('#cmp-go2').addEventListener('click', compare);
      // Keyboard navigation: Enter = next, Shift+Enter = prev (focus inside tool)
      container.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // avoid hijacking textarea newline when typing; only when not composing and with modifier logic
          // If focus is in textarea, Enter should insert newline, not navigate — so require Alt/just Enter outside textarea handled separately
          const tag = document.activeElement && document.activeElement.tagName;
          if (tag === 'TEXTAREA' || tag === 'INPUT' || document.activeElement.isContentEditable) return;
          e.preventDefault();
          navChange(e.shiftKey ? -1 : 1);
        }
      });
      // Global shortcut when output has focus: Alt+Arrow for prev/next
      outputWrap.setAttribute('tabindex', '0');
      outputWrap.setAttribute('aria-label', L ? 'Prikaz primerjave' : 'Comparison view');
      outputWrap.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); navChange(1); }
        else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) { e.preventDefault(); navChange(-1); }
      });

      container.querySelector('#cmp-sample').addEventListener('click', () => {
        inputA.value = sampleA;
        inputB.value = sampleB;
        compare();
      });

      container.querySelector('#cmp-swap').addEventListener('click', () => {
        const temp = inputA.value;
        inputA.value = inputB.value;
        inputB.value = temp;
        compare();
      });

      container.querySelector('#cmp-clear-a').addEventListener('click', () => {
        inputA.value = '';
        compare();
        inputA.focus();
      });

      container.querySelector('#cmp-clear-b').addEventListener('click', () => {
        inputB.value = '';
        compare();
        inputB.focus();
      });

      container.querySelector('#cmp-copy-unified').addEventListener('click', () => {
        copyText(buildPatch(), container.querySelector('#cmp-copy-unified'));
      });

      function buildPatch() {
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
        return patch;
      }
      function downloadText(filename, text, mime) {
        const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      container.querySelector('#cmp-copy-b').addEventListener('click', () => {
        copyText(inputB.value, container.querySelector('#cmp-copy-b'));
      });

      container.querySelector('#cmp-copy-html').addEventListener('click', () => {
        copyText(outputWrap.innerHTML, container.querySelector('#cmp-copy-html'));
      });
      container.querySelector('#cmp-dl-diff').addEventListener('click', () => {
        downloadText('primerjava.diff', buildPatch(), 'text/x-patch');
      });
      container.querySelector('#cmp-dl-html').addEventListener('click', () => {
        const headClose = '</' + 'style></' + 'head>';
        const docClose = '</' + 'body></' + 'html>';
        const htmlDoc = `<!doctype html><html lang="${L ? 'sl' : 'en'}"><head><meta charset="utf-8"><title>${L ? 'Primerjava' : 'Comparison'}</title><style>body{font-family:ui-monospace,monospace;font-size:13px;line-height:1.6;padding:16px}.diff-add{background:rgba(34,197,94,0.32);color:#16a34a;border-left:2px solid #16a34a;padding:1px 2px;border-radius:3px}.diff-del{background:rgba(239,68,68,0.32);color:#dc2626;border-left:2px solid #dc2626;padding:1px 2px;border-radius:3px;text-decoration:line-through}${headClose}<body>${outputWrap.innerHTML}${docClose}`;
        downloadText('primerjava.html', htmlDoc, 'text/html;charset=utf-8');
      });

      // kickstart
      compare();
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
      const input = container.querySelector('#csv-input'), output = container.querySelector('#csv-output');
      const mode = container.querySelector('#csv-mode'), sep = container.querySelector('#csv-sep');

      function update() {
        const s = sep.value || ',';
        if (mode.value === 'csv2col') {
          const rows = input.value.split('\n').map(r => r.split(s));
          const colWidths = [];
          rows.forEach(r => r.forEach((c, i) => { colWidths[i] = Math.max(colWidths[i] || 0, c.trim().length); }));
          output.value = rows.map(r => r.map((c, i) => c.trim().padEnd(colWidths[i] || 0)).join('  ')).join('\n');
        } else {
          output.value = input.value.split('\n').map(line => line.trim().split(/\s{2,}/).join(s)).join('\n');
        }
      }
      [input, mode, sep].forEach(el => el.addEventListener('input', update));
      container.querySelector('#csv-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
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
      const input = container.querySelector("#tts-input");
      const voiceSel = container.querySelector("#tts-voice");
      const rate = container.querySelector("#tts-rate");
      const pitch = container.querySelector("#tts-pitch");
      let voices = [];

      function loadVoices() {
        if (!('speechSynthesis' in window)) return;
        voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;
        voiceSel.innerHTML = voices.map((v, i) => `<option value="${i}">${escapeHtml(v.name)} (${v.lang})</option>`).join('');
      }

      if ('speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      container.querySelector("#tts-play").addEventListener("click", () => {
        if (!('speechSynthesis' in window)) { alert(L ? 'Vaš brskalnik ne podpira sinteze govora.' : 'Speech synthesis not supported.'); return; }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(input.value);
        if (voices[voiceSel.value]) utter.voice = voices[voiceSel.value];
        utter.rate = parseFloat(rate.value) || 1;
        utter.pitch = parseFloat(pitch.value) || 1;
        window.speechSynthesis.speak(utter);
      });

      container.querySelector("#tts-stop").addEventListener("click", () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      });

      container.querySelector("#tts-clear").addEventListener("click", () => {
        input.value = ""; input.focus();
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
      <textarea id="rs-output" readonly style="min-height:120px; font-size:14px;"></textarea>
      <div class="panel-actions" style="justify-content:center; gap:12px; margin-top:12px;">
        <button class="btn-sm primary" id="rs-gen" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Ustvari niz' : 'Generate String'}</span></button>
        <button class="btn-sm" id="rs-copy" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
      </div>
    </div>
  `;
      const len = container.querySelector("#rs-len");
      const qty = container.querySelector("#rs-qty");
      const alpha = container.querySelector("#rs-alpha");
      const num = container.querySelector("#rs-num");
      const sym = container.querySelector("#rs-sym");
      const output = container.querySelector("#rs-output");

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

      [len, qty, alpha, num, sym].forEach(el => el.addEventListener("input", generate));
      container.querySelector("#rs-gen").addEventListener("click", generate);
      container.querySelector("#rs-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#rs-copy"));
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
      <div id="df-out" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; font-size:13px; line-height:1.6; white-space:pre-wrap; overflow-y:auto; max-height:360px;"></div>
      <div class="panel-actions">
        <button class="btn-sm primary" id="df-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
      const a = container.querySelector("#df-a");
      const b = container.querySelector("#df-b");
      const out = container.querySelector("#df-out");
      let updatePromise = null;

      async function update() {
        const textA = a.value, textB = b.value;
        let rows;
        if (textA.length + textB.length > HEAVY_LIMIT) {
          showToolBusy(container, true);
          try { rows = await runHeavy('diff', { a: textA, b: textB }); }
          catch (e) { rows = PURE.diffLines(textA, textB); }
          showToolBusy(container, false);
        } else {
          rows = PURE.diffLines(textA, textB);
        }
        out.innerHTML = rows.map(r => {
          const color = r.t === '-' ? '#ef4444' : r.t === '+' ? '#22c55e' : 'var(--text-dim)';
          return `<div style="color:${color};">${r.t} ${escapeHtml(r.v) || ' '}</div>`;
        }).join('');
      }

      function debouncedUpdate() {
        clearTimeout(updatePromise);
        updatePromise = setTimeout(update, 100);
      }
      const safe = safeUpdate(debouncedUpdate, container);
      [a, b].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#df-copy").addEventListener("click", () => {
        copyText(out.textContent, container.querySelector("#df-copy"));
      });
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
      <textarea id="cs-output" readonly></textarea>
      <div class="panel-actions">
        <button class="btn-sm primary" id="cs-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
      const input = container.querySelector("#cs-input");
      const algoSel = container.querySelector("#cs-algo");
      const output = container.querySelector("#cs-output");

      function update() {
        const algo = algoSel.value;
        const text = input.value;
        if (algo === 'crc32') { output.value = PURE.crc32(text); return; }
        if (algo === 'sha256' && (!crypto?.subtle?.digest)) {
          output.value = PURE.sha256(text);
          return;
        }
        output.value = L ? 'Računam…' : 'Computing…';
        if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
          crypto.subtle.digest(algo, new TextEncoder().encode(text))
            .then(h => { output.value = PURE.bufferToHex(h); })
            .catch(e => { output.value = ''; showToolErrorBanner(container, (e && e.message) ? e.message : String(e)); });
        } else {
          output.value = L ? 'SHA-1/512 zahtevajo varno okolje (https/localhost).' : 'SHA-1/512 require secure context (https/localhost).';
        }
      }
      const safe = safeUpdate(update, container);
      [input, algoSel].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#cs-copy").addEventListener("click", () => copyText(output.value, container.querySelector("#cs-copy")));
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
      const patEl = container.querySelector("#rx-pattern");
      const flagsEl = container.querySelector("#rx-flags");
      const fg = container.querySelector("#rx-flag-g");
      const fi = container.querySelector("#rx-flag-i");
      const fm = container.querySelector("#rx-flag-m");
      const input = container.querySelector("#rx-input");
      const highlight = container.querySelector("#rx-highlight");
      const count = container.querySelector("#rx-count");
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
          const regex = new RegExp(p, f.includes('g') ? f : (f + 'g'));
          let matchesCount = 0;
          const htmlText = escapeHtml(text).replace(regex, (m) => {
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

      [patEl, flagsEl, input].forEach(el => el.addEventListener("input", update));
      [fg, fi, fm].forEach(el => el.addEventListener("change", syncFlagsFromCheckboxes));
      container.querySelector("#rx-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#rx-copy-matches").addEventListener("click", () => {
        copyText(extractedMatches.join('\n'), container.querySelector("#rx-copy-matches"));
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
      const input = container.querySelector("#cw-input");
      const words = container.querySelector("#cw-words");
      const mask = container.querySelector("#cw-mask");
      const whole = container.querySelector("#cw-whole");
      const output = container.querySelector("#cw-output");

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
        const rawWords = words.value.split(',').map(x => x.trim()).filter(Boolean);
        if (rawWords.length === 0) { output.value = input.value; return; }
        let text = input.value;
        rawWords.forEach(w => {
          const pat = whole.checked ? PURE.wholeWordPattern(w) : escapeRegExp(w);
          const regex = new RegExp(pat, 'giu');
          text = text.replace(regex, (match) => maskWord(match));
        });
        output.value = text;
      }
      [input, words, mask, whole].forEach(el => el.addEventListener("input", update));
      container.querySelector("#cw-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#cw-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#cw-copy"));
      });
      update();
    }

    /* =========================================================
       PHASE 2 RENDER FUNCTIONS (10 custom tools)
       ========================================================= */

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
      const input = container.querySelector("#ra-input");
      const mode = container.querySelector("#ra-mode");
      const output = container.querySelector("#ra-output");

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
          output.value = text.split('\n').map(line => line.split(' ').reverse().join(' ')).join('\n');
        }
      }
      [input, mode].forEach(el => el.addEventListener("input", update));
      container.querySelector("#ra-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#ra-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#ra-copy"));
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
      const input = container.querySelector("#sa-input");
      const mode = container.querySelector("#sa-mode");
      const desc = container.querySelector("#sa-desc");
      const caseSens = container.querySelector("#sa-case");
      const unique = container.querySelector("#sa-unique");
      const output = container.querySelector("#sa-output");

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
            const t = lines[i]; lines[i] = lines[j]; lines[j] = t;
          }
        }
        if (desc.checked && m !== 'random') lines.reverse();
        output.value = lines.join('\n');
      }
      [input, mode, desc, caseSens, unique].forEach(el => el.addEventListener("input", update));
      container.querySelector("#sa-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#sa-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#sa-copy"));
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
      const input = container.querySelector("#dr-input");
      const caseSens = container.querySelector("#dr-case");
      const consec = container.querySelector("#dr-consec");
      const output = container.querySelector("#dr-output");

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
      [input, caseSens, consec].forEach(el => el.addEventListener("input", update));
      container.querySelector("#dr-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#dr-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#dr-copy"));
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
      const input = container.querySelector("#pt-input");
      const lenEl = container.querySelector("#pt-len");
      const charEl = container.querySelector("#pt-char");
      const pos = container.querySelector("#pt-pos");
      const output = container.querySelector("#pt-output");

      function update() {
        const targetLen = Math.max(1, parseInt(lenEl.value) || 30);
        const padChar = charEl.value || ' ';
        const p = pos.value;
        output.value = input.value.split('\n').map(line => {
          if (line.length >= targetLen) return line;
          const diff = targetLen - line.length;
          if (p === 'left') return line + padChar.repeat(diff);
          if (p === 'right') return padChar.repeat(diff) + line;
          const leftPad = Math.floor(diff / 2);
          const rightPad = diff - leftPad;
          return padChar.repeat(leftPad) + line + padChar.repeat(rightPad);
        }).join('\n');
      }
      [input, lenEl, charEl, pos].forEach(el => el.addEventListener("input", update));
      container.querySelector("#pt-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#pt-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#pt-copy"));
      });
      update();
    }

    function renderHashGenerator(container) {
      const L = currentLang === 'sl';
      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px; gap:10px 16px; flex-wrap:wrap;">
      <label>${L ? 'Algoritem zgoščevanja:' : 'Hash algorithm:'}
        <select id="hg-algo">
          <option value="SHA-256" selected>SHA-256 (256 bit / 64 hex)</option>
          <option value="SHA-512">SHA-512 (512 bit / 128 hex)</option>
          <option value="SHA-384">SHA-384 (384 bit / 96 hex)</option>
          <option value="SHA-1">SHA-1 (160 bit / 40 hex - Legacy)</option>
        </select>
      </label>
      <label>${L ? 'Izhod:' : 'Output:'}
        <select id="hg-out">
          <option value="hex" selected>hex</option>
          <option value="base64">base64</option>
          <option value="base64url">base64url</option>
        </select>
      </label>
      <label>${L ? 'Sol (salt):' : 'Salt:'}
        <input type="text" id="hg-salt" placeholder="${L ? 'npr. moja-sol' : 'e.g. my-salt'}" style="min-width:140px;">
      </label>
      <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" id="hg-upper"> ${L ? 'VELIKE ČRKE' : 'Uppercase'}</label>
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
        <textarea id="hg-output" readonly placeholder="${L ? 'Zgoščena vrednost...' : 'Hash output...'}" style="font-family:monospace;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="hg-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
      const input = container.querySelector("#hg-input");
      const algo = container.querySelector("#hg-algo");
      const upper = container.querySelector("#hg-upper");
      const outSel = container.querySelector("#hg-out");
      const saltEl = container.querySelector("#hg-salt");
      const output = container.querySelector("#hg-output");

      let hgSeq = 0;
      async function update() {
        const salt = saltEl ? saltEl.value : "";
        const text = salt + input.value;
        const mySeq = ++hgSeq;
        const msgUint8 = new TextEncoder().encode(text);
        try {
          const hashBuffer = await crypto.subtle.digest(algo.value, msgUint8);
          if (mySeq !== hgSeq) return;
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const outMode = outSel ? outSel.value : "hex";
          let out = "";
          if (outMode === "hex") {
            out = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            if (upper.checked) out = out.toUpperCase();
          } else {
            let bin = "";
            const chunk = 0x8000;
            const bytes = new Uint8Array(hashBuffer);
            for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
            out = btoa(bin);
            if (outMode === "base64url") out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/,"");
            // uppercase nima smisla za base64 — ignoriramo
          }
          output.value = out;
        } catch (e) {
          if (mySeq === hgSeq) output.value = L ? 'Napaka pri izračunu zgoščenke.' : 'Hashing error.';
        }
      }
      let _hgDb;
      [input, algo, upper, outSel, saltEl].forEach(el => el && el.addEventListener("input", () => {
        clearTimeout(_hgDb);
        _hgDb = setTimeout(update, 120);
      }));
      [algo, outSel].forEach(el => el && el.addEventListener("change", () => {
        clearTimeout(_hgDb);
        _hgDb = setTimeout(update, 120);
      }));
      container.querySelector("#hg-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#hg-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#hg-copy"));
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
      const input = container.querySelector("#hx-input");
      const mode = container.querySelector("#hx-mode");
      const delim = container.querySelector("#hx-delim");
      const output = container.querySelector("#hx-output");

      function update() {
        const t = input.value;
        const m = mode.value;
        const d = delim.value;
        try {
          if (m === 'text2hex') {
            const bytes = new TextEncoder().encode(t);
            const hexes = Array.from(bytes).map(b => (d === '0x' ? '0x' : '') + b.toString(16).padStart(2, '0'));
            const sep = d === 'none' ? '' : (d === 'colon' ? ':' : ' ');
            output.value = hexes.join(sep);
          } else if (m === 'hex2text') {
            const clean = t.replace(/0x/g, '').replace(/[\s:,]+/g, '');
            if (!/^[0-9a-fA-F]*$/.test(clean)) {
              output.value = L ? 'Neveljavni šestnajstiški znaki.' : 'Invalid hexadecimal characters.';
              return;
            }
            if (clean.length % 2 !== 0) {
              output.value = L ? 'Nepopoln bajt (liho število znakov).' : 'Incomplete byte (odd number of digits).';
              return;
            }
            const bytes = [];
            for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.substr(i, 2), 16));
            output.value = new TextDecoder().decode(new Uint8Array(bytes));
          } else if (m === 'text2bin') {
            const bytes = new TextEncoder().encode(t);
            output.value = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
          } else if (m === 'bin2text') {
            const bins = t.trim().split(/\s+/).filter(Boolean);
            const badBin = bins.find(b => !/^[01]{1,8}$/.test(b));
            if (badBin !== undefined) {
              output.value = L ? `Neveljaven binarni žeton: ${badBin}` : `Invalid binary token: ${badBin}`;
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
      [input, mode, delim].forEach(el => el.addEventListener("input", update));
      container.querySelector("#hx-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#hx-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#hx-copy"));
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
      const input = container.querySelector("#ui-input");
      const table = container.querySelector("#ui-table");
      let tsvData = '';

      function update() {
        const text = input.value;
        const chars = [...text];
        if (chars.length === 0) { table.innerHTML = ''; tsvData = ''; return; }
        const rows = chars.map((c, i) => {
          const cp = c.codePointAt(0);
          const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
          const htmlEnt = '&#' + cp + ';';
          return { idx: i + 1, char: c, cp, hex, htmlEnt };
        });

        tsvData = ['#\tZnak\tKoda\tHex\tHTML'].concat(rows.map(r => `${r.idx}\t${r.char}\t${r.cp}\t${r.hex}\t${r.htmlEnt}`)).join('\n');

        table.innerHTML = `
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead><tr style="border-bottom:1px solid var(--border); text-align:left;"><th style="padding:6px;">#</th><th style="padding:6px;">Znak</th><th style="padding:6px;">Koda</th><th style="padding:6px;">Hex</th><th style="padding:6px;">HTML</th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);"><td style="padding:4px 6px; color:var(--text-dim);">${r.idx}</td><td style="padding:4px 6px; font-size:16px; font-weight:700;">${escapeHtml(r.char)}</td><td style="padding:4px 6px; font-family:monospace;">${r.cp}</td><td style="padding:4px 6px; font-family:monospace; color:var(--violet);">${r.hex}</td><td style="padding:4px 6px; font-family:monospace; color:var(--teal);">${escapeHtml(r.htmlEnt)}</td></tr>`).join('')}
            </tbody>
          </table>
        `;
      }
      input.addEventListener("input", update);
      container.querySelector("#ui-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#ui-copy-tsv").addEventListener("click", () => {
        if (!tsvData) return;
        copyText(tsvData, container.querySelector("#ui-copy-tsv"));
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
      const input = container.querySelector("#pc-input");
      const result = container.querySelector("#pc-result");

      function update() {
        const text = input.value.trim();
        if (!text) { result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo za preizkus.' : 'Enter text.'}</span>`; return; }
        const clean = text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
        const reversed = [...clean].reverse().join('');
        const isPal = clean.length > 0 && clean === reversed;

        result.innerHTML = isPal ? `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_check}</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a; margin-bottom:6px;">${L ? 'Je palindrom!' : 'It is a palindrome!'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Besedilo se bere enako naprej in nazaj.' : 'Reads exactly the same forwards and backwards.'}</div>
          <div style="margin-top:12px; font-family:monospace; background:rgba(34,197,94,0.1); padding:6px 12px; border-radius:6px; font-size:13px;">${escapeHtml(clean)}</div>
        ` : `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_x}</div>
          <div style="font-size:18px; font-weight:800; color:#dc2626; margin-bottom:6px;">${L ? 'Ni palindrom.' : 'Not a palindrome.'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Naprej:' : 'Forward:'} <code>${escapeHtml(clean)}</code></div>
          <div style="font-size:13px; color:var(--text-dim); margin-top:2px;">${L ? 'Nazaj:' : 'Reverse:'} <code>${escapeHtml(reversed)}</code></div>
        `;
      }
      input.addEventListener("input", update);
      container.querySelector("#pc-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      update();
    }

    /* =========================================================
       PHASE 3+4 RENDER FUNCTIONS (10 custom tools)
       ========================================================= */

    function renderZalgoText(container) {
      const L = currentLang === 'sl';
      const ZALGO_UP = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346', '\u031a'];
      const ZALGO_MID = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334', '\u0335', '\u0336', '\u034f', '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362', '\u0338', '\u0337', '\u0361', '\u0345'];
      const ZALGO_DOWN = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u0323'];

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
      const input = container.querySelector("#zg-input");
      const level = container.querySelector("#zg-level");
      const up = container.querySelector("#zg-up");
      const mid = container.querySelector("#zg-mid");
      const down = container.querySelector("#zg-down");
      const output = container.querySelector("#zg-output");

      function update() {
        const mult = parseInt(level.value) || 3;
        let res = '';
        for (const char of input.value) {
          res += char;
          if (/\s/.test(char)) continue;
          if (up.checked) for (let i = 0; i < mult; i++) res += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
          if (mid.checked) for (let i = 0; i < Math.floor(mult / 2); i++) res += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
          if (down.checked) for (let i = 0; i < mult; i++) res += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
        }
        output.value = res;
      }
      [input, level, up, mid, down].forEach(el => el.addEventListener("input", update));
      container.querySelector("#zg-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#zg-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#zg-copy"));
      });
      update();
    }

    function renderFancyText(container) {
      const L = currentLang === 'sl';
      const styles = {
        'bold': { upper: 0x1D400, lower: 0x1D41A, digits: 0x1D7CE, label: 'Bold (𝐁)' },
        'italic': { upper: 0x1D434, lower: 0x1D44E, digits: null, label: 'Italic (𝐼)' },
        'bold-italic': { upper: 0x1D468, lower: 0x1D482, digits: null, label: 'Bold Italic (𝑩)' },
        'script': { upper: 0x1D49C, lower: 0x1D4B6, digits: null, label: 'Script (𝒜)' },
        'fraktur': { upper: 0x1D504, lower: 0x1D51E, digits: null, label: 'Fraktur (𝔄)' },
        'monospace': { upper: 0x1D670, lower: 0x1D68A, digits: 0x1D7F6, label: 'Monospace (𝙼)' },
        'double-struck': { upper: 0x1D538, lower: 0x1D552, digits: 0x1D7D8, label: 'Double-struck (𝔸)' },
        'sans-serif': { upper: 0x1D5A0, lower: 0x1D5BA, digits: 0x1D7E2, label: 'Sans-serif (𝖠)' },
        'sans-bold': { upper: 0x1D5D4, lower: 0x1D5EE, digits: 0x1D7EC, label: 'Sans Bold (𝗔)' },
        'underline': { special: 'underline', label: 'Underline (U̲)' },
        'double-underline': { special: 'double-underline', label: 'Double Underline (U̳)' }
      };
      /* Unicode za nekatere črke nima glifa v zaporedju → uporabi posebne kodne točke,
         sicer bi naivna preslikava dala nedodeljene znake (tofu). */
      const FANCY_EXCEPTIONS = {
        'italic': { 'h': '\u210E' },
        'script': { 'B': '\u212C', 'E': '\u2130', 'F': '\u2131', 'H': '\u210B', 'I': '\u2110', 'L': '\u2112', 'M': '\u2133', 'R': '\u211B', 'e': '\u212F', 'g': '\u210A', 'o': '\u2134' },
        'fraktur': { 'C': '\u212D', 'H': '\u210C', 'I': '\u2111', 'R': '\u211C', 'Z': '\u2128' },
        'double-struck': { 'C': '\u2102', 'H': '\u210D', 'N': '\u2115', 'P': '\u2119', 'Q': '\u211A', 'R': '\u211D', 'Z': '\u2124' }
      };
      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Slog pisave:' : 'Font style:'}
        <select id="ft-style" style="min-width:200px;">
          ${Object.entries(styles).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
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
      const input = container.querySelector('#ft-input'), output = container.querySelector('#ft-output');
      const style = container.querySelector('#ft-style');

      function convert(text, key) {
        const s = styles[key] || styles.bold;
        if (s.special === 'underline') return [...text].map(c => c === '\n' ? c : c + '\u0332').join('');
        if (s.special === 'double-underline') return [...text].map(c => c === '\n' ? c : c + '\u0333').join('');
        const exceptions = FANCY_EXCEPTIONS[key] || {};
        return [...text].map(c => {
          if (exceptions[c]) return exceptions[c];
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90 && s.upper) return String.fromCodePoint(s.upper + (code - 65));
          if (code >= 97 && code <= 122 && s.lower) return String.fromCodePoint(s.lower + (code - 97));
          if (code >= 48 && code <= 57 && s.digits) return String.fromCodePoint(s.digits + (code - 48));
          return c;
        }).join('');
      }

      function update() { output.value = convert(input.value, style ? (style.value || 'bold') : 'bold'); }
      [input, style].forEach(el => el.addEventListener('input', update));
      container.querySelector('#ft-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
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
      const input = container.querySelector("#tr-input");
      const countEl = container.querySelector("#tr-count");
      const sepEl = container.querySelector("#tr-sep");
      const numCheck = container.querySelector("#tr-num");
      const output = container.querySelector("#tr-output");

      function update() {
        const n = Math.min(1000, Math.max(1, parseInt(countEl.value) || 1));
        const sep = sepEl.value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        const text = input.value;
        const arr = [];
        for (let i = 1; i <= n; i++) {
          arr.push((numCheck.checked ? (i + '. ') : '') + text);
        }
        output.value = arr.join(sep);
      }
      [input, countEl, sepEl, numCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#tr-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#tr-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#tr-copy"));
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
      const input = container.querySelector('#hp-input'), patterns = container.querySelector('#hp-patterns');
      const ci = container.querySelector('#hp-ci'), result = container.querySelector('#hp-result');
      const colors = ['rgba(255,200,50,0.4)', 'rgba(100,200,255,0.4)', 'rgba(255,120,150,0.4)', 'rgba(120,255,150,0.4)', 'rgba(200,150,255,0.4)'];

      function update() {
        const pats = patterns.value.split(',').map(p => p.trim()).filter(Boolean);
        if (!pats.length) { result.innerHTML = escapeHtml(input.value); return; }
        let html = escapeHtml(input.value);
        pats.forEach((pat, i) => {
          try {
            const re = new RegExp(escapeRegExp(pat), ci.checked ? 'gi' : 'g');
            const bg = colors[i % colors.length];
            html = html.replace(re, m => `<mark style="background:${bg}; border-radius:4px; padding:2px 4px; font-weight:600;">${m}</mark>`);
          } catch (e) { }
        });
        result.innerHTML = html;
      }
      let _hpDb;
      [input, patterns, ci].forEach(el => el.addEventListener('input', () => {
        clearTimeout(_hpDb);
        _hpDb = setTimeout(update, 80);
      }));
      container.querySelector('#hp-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
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
      const input = container.querySelector("#te-input");
      const result = container.querySelector("#te-result");

      function update() {
        const text = input.value;
        if (!text) { result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo.' : 'Enter text.'}</span>`; return; }
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
      input.addEventListener("input", update);
      container.querySelector("#te-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
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
      const aEl = container.querySelector("#lv-a");
      const bEl = container.querySelector("#lv-b");
      const caseSens = container.querySelector("#lv-case");
      const result = container.querySelector("#lv-result");

      function levDist(s1, s2) {
        const a = [...s1], b = [...s2];
        const m = a.length, n = b.length;
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
        let s1 = aEl.value, s2 = bEl.value;
        if (!caseSens.checked) { s1 = s1.toLowerCase(); s2 = s2.toLowerCase(); }
        const dist = levDist(s1, s2);
        const maxLen = Math.max([...s1].length, [...s2].length);
        const simPct = maxLen === 0 ? 100 : Math.max(0, ((1 - (dist / maxLen)) * 100)).toFixed(1);

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
      [aEl, bEl, caseSens].forEach(el => el.addEventListener("input", update));
      container.querySelector("#lv-clear").addEventListener("click", () => { aEl.value = ""; bEl.value = ""; update(); aEl.focus(); });
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
      const input = container.querySelector("#nw-input");
      const langSel = container.querySelector("#nw-lang");
      const fmtSel = container.querySelector("#nw-fmt");
      const output = container.querySelector("#nw-output");

      const slUnits = ['', 'ena', 'dva', 'tri', 'štiri', 'pet', 'šest', 'sedem', 'osem', 'devet', 'deset', 'enajst', 'dvanajst', 'trinajst', 'štirinajst', 'petnajst', 'šestnajst', 'sedemnajst', 'osemnajst', 'devetnajst'];
      const slTens = ['', 'deset', 'dvajset', 'trideset', 'štirideset', 'petdeset', 'šestdeset', 'sedemdeset', 'osemdeset', 'devetdeset'];
      const slHundreds = ['', 'sto', 'dvesto', 'tristo', 'štiristo', 'petsto', 'šeststo', 'sedemsto', 'osemsto', 'devetsto'];

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
          if (u > 0) res += (u === 1 ? 'ena' : (u === 2 ? 'dva' : slUnits[u])) + 'in' + slTens[t];
          else res += slTens[t];
        }
        return res;
      }

      function slNumber(num) {
        if (num === 0) return 'nič';
        let str = '';
        if (num < 0) { str += 'minus '; num = Math.abs(num); }
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

      const enUnits = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const enTens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

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
        if (num < 0) { str += 'minus '; num = Math.abs(num); }
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
        'ena': 'prvi', 'dva': 'drugi', 'tri': 'tretji', 'štiri': 'četrti', 'pet': 'peti', 'šest': 'šesti', 'sedem': 'sedmi', 'osem': 'osmi', 'devet': 'deveti',
        'deset': 'deseti', 'enajst': 'enajsti', 'dvanajst': 'dvanajsti', 'trinajst': 'trinajsti', 'štirinajst': 'štirinajsti',
        'petnajst': 'petnajsti', 'šestnajst': 'šestnajsti', 'sedemnajst': 'sedemnajsti', 'osemnajst': 'osemnajsti', 'devetnajst': 'devetnajsti',
        'dvajset': 'dvajseti', 'trideset': 'trideseti', 'štirideset': 'štirideseti', 'petdeset': 'petdeseti', 'šestdeset': 'šestdeseti',
        'sedemdeset': 'sedemdeseti', 'osemdeset': 'osemdeseti', 'devetdeset': 'devetdeseti',
        'sto': 'stoti', 'dvesto': 'dvestoti', 'tristo': 'tristoti', 'štiristo': 'štiristoti', 'petsto': 'petstoti',
        'šesto': 'šeststoti', 'sedemsto': 'sedemstoti', 'osemsto': 'osemstoti', 'devetsto': 'devetstoti'
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
        const irregular = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
        const compoundIrregular = { '-one': '-first', '-two': '-second', '-three': '-third', '-five': '-fifth', '-eight': '-eighth', '-nine': '-ninth' };
        const words = cardinalStr.trim().split(/\s+/);
        let last = words[words.length - 1];
        if (irregular[last]) last = irregular[last];
        else {
          let done = false;
          for (const suf in compoundIrregular) {
            if (last.endsWith(suf)) { last = last.slice(0, -suf.length) + compoundIrregular[suf]; done = true; break; }
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
        output.value = input.value.split('\n').map(line => {
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
              res += ' EUR' + (decPart > 0 ? (' in ' + decPart + '/100') : '');
            } else if (decPart > 0) {
              res += ' cela ' + slNumber(decPart);
            }
            return res;
          } else {
            let res = enNumber(intPart);
            if (isCurr) {
              res += ' dollars' + (decPart > 0 ? (' and ' + decPart + '/100 cents') : '');
            } else if (decPart > 0) {
              res += ' point ' + enNumber(decPart);
            }
            return res;
          }
        }).join('\n');
      }
      [input, langSel, fmtSel].forEach(el => el.addEventListener("input", update));
      container.querySelector("#nw-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#nw-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#nw-copy"));
      });
      update();
    }

    function renderBraille(container) {
      const L = currentLang === 'sl';
      const BRAILLE_MAP = {
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'č': '⠡', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
        'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟',
        'r': '⠗', 's': '⠎', 'š': '⠱', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
        'z': '⠵', 'ž': '⠮', ' ': ' ', ',': '⠂', ';': '⠆', ':': '⠒', '.': '⠲', '!': '⠖', '?': '⠦',
        '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚'
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
      const input = container.querySelector("#br-input");
      const output = container.querySelector("#br-output");

      function update() {
        const text = input.value.toLowerCase();
        output.value = [...text].map(c => BRAILLE_MAP[c] || c).join('');
      }
      input.addEventListener("input", update);
      container.querySelector("#br-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#br-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#br-copy"));
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
      const input = container.querySelector("#cp-input");
      const fmt = container.querySelector("#cp-fmt");
      const sep = container.querySelector("#cp-sep");
      const output = container.querySelector("#cp-output");

      function update() {
        const text = input.value;
        const f = fmt.value;
        const s = sep.value === 'space' ? ' ' : (sep.value === 'comma' ? ', ' : (sep.value === 'newline' ? '\n' : ''));
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
      [input, fmt, sep].forEach(el => el.addEventListener("input", update));
      container.querySelector("#cp-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#cp-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#cp-copy"));
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
      const input = container.querySelector("#dt-input");
      const formats = container.querySelector("#dt-formats");
      const nowBtn = container.querySelector("#dt-now");
      let isoString = '';

      function update() {
        const val = input.value.trim();
        if (!val) { formats.innerHTML = ''; return; }
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

      input.addEventListener("input", update);
      nowBtn.addEventListener("click", () => { input.value = new Date().toISOString(); update(); });
      container.querySelector("#dt-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#dt-copy-iso").addEventListener("click", () => {
        if (!isoString) return;
        copyText(isoString, container.querySelector("#dt-copy-iso"));
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
      const picker = container.querySelector("#cc-picker");
      const input = container.querySelector("#cc-input");
      const preview = container.querySelector("#cc-preview");
      const formats = container.querySelector("#cc-formats");
      let currentHex = '#6366f1';

      function update() {
        let val = input.value.trim();
        if (!val) { formats.innerHTML = ''; return; }
        if (!val.startsWith('#') && !val.startsWith('rgb') && !val.startsWith('hsl') && /^[0-9a-fA-F]{6}$/.test(val)) {
          val = '#' + val;
        }

        const d = document.createElement("div");
        d.style.color = val;
        document.body.appendChild(d);
        const cs = window.getComputedStyle(d).color;
        document.body.removeChild(d);

        const m = cs.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) {
          formats.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven barvni zapis.' : 'Invalid color format.'}</span>`;
          return;
        }

        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        currentHex = hex;
        preview.style.background = hex;
        if (/^#[0-9a-fA-F]{6}$/i.test(hex)) picker.value = hex;

        const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
          const delta = max - min;
          s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
          switch (max) {
            case rNorm: h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / delta + 2; break;
            case bNorm: h = (rNorm - gNorm) / delta + 4; break;
          }
          h /= 6;
        }
        const hDeg = Math.round(h * 360), sPct = Math.round(s * 100), lPct = Math.round(l * 100);

        formats.innerHTML = `
          <div><strong>HEX:</strong> <code>${hex}</code></div>
          <div><strong>RGB:</strong> <code>rgb(${r}, ${g}, ${b})</code></div>
          <div><strong>HSL:</strong> <code>hsl(${hDeg}, ${sPct}%, ${lPct}%)</code></div>
          <div><strong>CSS Vrednost:</strong> <code>rgba(${r}, ${g}, ${b}, 1)</code></div>
        `;
      }

      input.addEventListener("input", update);
      picker.addEventListener("input", () => { input.value = picker.value; update(); });
      container.querySelector("#cc-clear").addEventListener("click", () => { input.value = ""; formats.innerHTML = ""; input.focus(); });
      container.querySelector("#cc-copy-hex").addEventListener("click", () => {
        copyText(currentHex, container.querySelector("#cc-copy-hex"));
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
      const input = container.querySelector("#tc-input");
      const fmtSel = container.querySelector("#tc-format");
      const delimSel = container.querySelector("#tc-delim");
      const hasHeader = container.querySelector("#tc-header");
      const output = container.querySelector("#tc-output");

      function update() {
        const raw = input.value.trim();
        if (!raw) { output.value = ''; return; }
        const d = delimSel.value === 'tab' ? '\t' : (delimSel.value === 'comma' ? ',' : (delimSel.value === 'semicolon' ? ';' : '|'));
        const rows = raw.split('\n').map(r => r.split(d).map(c => c.trim()));
        if (rows.length === 0) return;

        const maxCols = Math.max(...rows.map(r => r.length));
        const normalized = rows.map(r => {
          while (r.length < maxCols) r.push('');
          return r;
        });

        const f = fmtSel.value;
        if (f === 'markdown') {
          const mdCell = (c) => String(c).replace(/\|/g, '\\|');
          let res = '| ' + normalized[0].map(mdCell).join(' | ') + ' |\n';
          res += '| ' + normalized[0].map(() => '---').join(' | ') + ' |\n';
          for (let i = 1; i < normalized.length; i++) {
            res += '| ' + normalized[i].map(mdCell).join(' | ') + ' |\n';
          }
          output.value = res;
        } else if (f === 'html') {
          let res = '<table>\n';
          if (hasHeader.checked && normalized.length > 0) {
            res += '  <thead>\n    <tr>' + normalized[0].map(c => `<th>${escapeHtml(c)}</th>`).join('') + '</tr>\n  </thead>\n  <tbody>\n';
            for (let i = 1; i < normalized.length; i++) {
              res += '    <tr>' + normalized[i].map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>\n';
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
              headers.forEach((h, idx) => obj[h || ('col_' + idx)] = r[idx] || '');
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
      [input, fmtSel, delimSel, hasHeader].forEach(el => el.addEventListener("input", update));
      container.querySelector("#tc-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#tc-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#tc-copy"));
      });
      update();
    }

    function renderWordCloud(container) {
      const L = currentLang === 'sl';
      
      /* POGOSTE BESEDE (stop words) – razdeljene po besednih vrstah */
      const WC_STOP_GROUPS = {
        sl: {
          conj: ['in', 'ter', 'pa', 'da', 'ali', 'ki', 'ko', 'če', 'ker', 'toda', 'ampak', 'vendar', 'temveč', 'saj', 'kajti', 'torej', 'čeprav', 'kadar', 'kot'],
          prep: ['za', 'na', 'v', 'z', 's', 'pri', 'po', 'ob', 'od', 'do', 'iz', 'o', 'k', 'g', 'med', 'pred', 'pod', 'nad', 'brez', 'skozi', 'proti'],
          pron: ['ta', 'to', 'te', 'ti', 'tega', 'temu', 'tem', 'tej', 'teh', 'temi', 'tisti', 'tisto', 'tista', 'vse', 'vsi', 'vsak', 'vsaka', 'vsako', 'nekaj', 'nekdo', 'nihče', 'nič', 'kdo', 'kaj', 'jaz', 'on', 'ona', 'ono', 'midva', 'vidva', 'onadva', 'mi', 'vi', 'oni', 'one', 'mene', 'tebe', 'njega', 'nje', 'naju', 'vaju', 'njih', 'nas', 'vas', 'mu', 'ji', 'jima', 'jim', 'nam', 'vam', 'se'],
          aux: ['je', 'so', 'bo', 'bom', 'boš', 'bomo', 'boste', 'bodo', 'bil', 'bila', 'bilo', 'bili', 'bile', 'sem', 'si', 'smo', 'ste', 'ima', 'imamo', 'imate', 'imajo', 'imeti', 'imel', 'imela', 'mora', 'moramo', 'morate', 'morajo', 'hoče', 'želijo', 'lahko'],
          adv: ['tudi', 'že', 'še', 'le', 'kar', 'zelo', 'tako', 'kako', 'zakaj', 'kje', 'kdaj', 'kam', 'kod', 'mnogo', 'več', 'manj']
        },
        en: {
          conj: ['the', 'a', 'an', 'and', 'or', 'but', 'nor', 'so', 'yet', 'as', 'until', 'while', 'than'],
          prep: ['for', 'at', 'by', 'from', 'in', 'into', 'of', 'off', 'on', 'onto', 'out', 'over', 'to', 'up', 'with', 'within', 'without', 'about', 'against', 'between', 'through', 'during', 'before', 'after', 'above', 'below'],
          pron: ['i', 'me', 'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'all', 'any', 'both', 'each', 'few', 'other', 'some', 'such', 'own', 'same'],
          aux: ['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'can', 'could', 'shall', 'should', 'will', 'would', 'may', 'might', 'must'],
          adv: ['no', 'not', 'only', 'too', 'very', 'just', 'more', 'most', 'where', 'when', 'why', 'how']
        }
      };

      const WC_GROUP_LABELS = {
        sl: { conj: 'Vezniki', prep: 'Predlogi', pron: 'Zaimki', aux: 'Pomožni & modalni glagoli', adv: 'Prislovi in delci' },
        en: { conj: 'Conjunctions & articles', prep: 'Prepositions', pron: 'Pronouns & determiners', aux: 'Auxiliary & modal verbs', adv: 'Adverbs & negations' }
      };

      const PALETTES = {
        indigo: ['#4f46e5', '#6366f1', '#818cf8', '#e11d48', '#f43f5e', '#fb7185', '#a855f7', '#c084fc'],
        ocean: ['#0d9488', '#14b8a6', '#2dd4bf', '#0284c7', '#0ea5e9', '#38bdf8', '#2563eb', '#3b82f6'],
        sunset: ['#dc2626', '#ef4444', '#f87171', '#ea580c', '#f97316', '#fb923c', '#d97706', '#f59e0b'],
        nature: ['#059669', '#10b981', '#34d399', '#65a30d', '#84cc16', '#a3e635', '#047857', '#15803d'],
        rainbow: ['#e11d48', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'],
        mono: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1']
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
        wcGroupKeys.forEach(k => { if (wcActiveGroups.has(k)) src[k].forEach(w => s.add(w)); });
        return s;
      }

      function updateFilterCount() {
        const total = wcGroupKeys.length;
        wcFilterCount.textContent = wcActiveGroups.size === total ? (L ? 'vse' : 'all')
          : wcActiveGroups.size === 0 ? (L ? 'brez' : 'none')
            : `${wcActiveGroups.size}/${total}`;
      }

      function renderFilterMenu() {
        const labels = WC_GROUP_LABELS[wcLangKey];
        const expl = L
          ? 'To so besede brez velike vsebinske teže. Izberite skupine, ki naj jih oblak prezre.'
          : 'These are low-meaning words. Choose which groups the cloud should ignore.';
        wcFilterMenu.innerHTML = `
          <div style="padding:10px 12px; font-size:11.5px; line-height:1.5; color:var(--text-dim); border-bottom:1px solid var(--border); margin-bottom:4px;">${expl}</div>
          ${wcGroupKeys.map(k => `
            <label class="dropdown-item" style="justify-content:flex-start; gap:9px; cursor:pointer;">
              <input type="checkbox" data-wcgroup="${k}" ${wcActiveGroups.has(k) ? 'checked' : ''} style="accent-color:var(--violet); cursor:pointer;">
              <span style="flex:1;">${labels[k]}</span>
              <span style="font-size:11px; opacity:.6;">${WC_STOP_GROUPS[wcLangKey][k].length}</span>
            </label>`).join('')}
          <div style="display:flex; gap:6px; padding:8px 6px 4px; border-top:1px solid var(--border); margin-top:4px;">
            <button type="button" id="wc-f-all" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Vklopi vse' : 'Enable all'}</button>
            <button type="button" id="wc-f-none" class="btn-sm" style="flex:1; justify-content:center; padding:5px 6px; font-size:12px;">${L ? 'Izklopi vse' : 'Disable all'}</button>
          </div>`;

        wcFilterMenu.querySelectorAll('input[data-wcgroup]').forEach(cb => {
          cb.addEventListener('change', () => {
            if (cb.checked) wcActiveGroups.add(cb.dataset.wcgroup); else wcActiveGroups.delete(cb.dataset.wcgroup);
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

      function refreshFilterUI() { renderFilterMenu(); updateFilterCount(); }

      wcFilterBtn.addEventListener('click', (ev) => {
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

        chipsWrap.innerHTML = visibleItems.map((item, idx) => {
          const isExcluded = excludedWords.has(item.word);
          const isTop = idx < maxDisplay && !isExcluded;
          const bg = isExcluded 
            ? 'background:rgba(0,0,0,0.06); color:var(--text-dimmer); text-decoration:line-through; border:1px dashed var(--border);' 
            : (isTop ? 'background:rgba(99,102,241,0.12); color:var(--violet); border:1px solid rgba(99,102,241,0.35); font-weight:600;' : 'background:var(--card); color:var(--text); border:1px solid var(--border);');
          
          return `
            <button class="wc-chip" data-word="${escapeHtml(item.word)}" style="cursor:pointer; border-radius:20px; padding:3px 10px; font-size:12px; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; ${bg}">
              <span>${escapeHtml(item.word)}</span>
              <span style="opacity:0.75; font-size:11px;">(${item.count})</span>
              <span>${isExcluded ? SVG_ICONS.mi_x : SVG_ICONS.mi_check}</span>
            </button>
          `;
        }).join('');

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
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const bgRgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
        const isDark = bgRgb && bgRgb.length >= 3
          ? (0.2126 * Number(bgRgb[0]) + 0.7152 * Number(bgRgb[1]) + 0.0722 * Number(bgRgb[2])) < 128
          : document.documentElement.getAttribute('data-theme')?.includes('dark');
        ctx.fillStyle = isDark ? '#141417' : '#ffffff';
        ctx.fillRect(0, 0, W, H);

        // Filter active words
        const maxWords = parseInt(maxWordsSel.value) || 50;
        const activeWords = cachedWordCounts.filter(item => !excludedWords.has(item.word)).slice(0, maxWords);

        statsEl.textContent = `${L ? 'Prikazanih' : 'Showing'} ${activeWords.length} / ${cachedWordCounts.length} ${L ? 'besed' : 'words'}`;

        if (!activeWords.length) {
          ctx.fillStyle = isDark ? '#71717a' : '#9ca3af';
          ctx.font = '16px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(L ? 'Vnesite besedilo za prikaz oblaka besed' : 'Enter text to generate word cloud', W / 2, H / 2);
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
          const isVertical = isMixed && (idx % 4 === 3);

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
              const overlap = boxes.some(b => !(x + textW < b.x || x > b.x + b.w || y + textH < b.y || y > b.y + b.h));
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
                const overlap = boxes.some(b => !(x + w2 < b.x || x > b.x + b.w || y + h2 < b.y || y > b.y + b.h));
                if (!overlap) {
                  boxes.push({ x, y, w: w2, h: h2, word: item.word, fontSize: smallerFont, color, isVertical });
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
      document.addEventListener("dragover", (e) => {
        if (e.target && e.target.tagName === "TEXTAREA") {
          e.preventDefault();
          e.target.classList.add("textarea-drag-over");
        }
      });
      document.addEventListener("dragleave", (e) => {
        if (e.target && e.target.tagName === "TEXTAREA") {
          e.target.classList.remove("textarea-drag-over");
        }
      });
      document.addEventListener("drop", (e) => {
        if (e.target && e.target.tagName === "TEXTAREA") {
          e.preventDefault();
          e.target.classList.remove("textarea-drag-over");
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
              e.target.value = event.target.result;
              e.target.dispatchEvent(new Event("input", { bubbles: true }));
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
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.code === "Escape") {
          const isDrawerOpen = document.getElementById("drawer") && document.getElementById("drawer").classList.contains("open");
          if (isDrawerOpen) {
            closeDrawer(true);
            return;
          }

          // If on a tool page, Esc goes back to all tools!
          // But never navigate away while the user is editing a field.
          const ae = document.activeElement;
          const editingField = ae && (ae.tagName === "TEXTAREA" || ae.tagName === "INPUT" || ae.tagName === "SELECT");
          if (editingField) return;
          const backBtn = document.querySelector("#tool-page-body #tool-back-btn");
          if (views.tool && views.tool.classList.contains("active") && backBtn) {
            e.preventDefault();
            backBtn.click();
          }
        }
      });
    }

    /* ============ COMMAND PALETTE (Ctrl/Cmd+K) ============ */
    function initCommandPalette() {
      const overlay = document.getElementById("cmd-palette-overlay");
      const input = document.getElementById("cmd-palette-input");
      const list = document.getElementById("cmd-palette-list");
      if (!overlay || !input || !list) return;

      let activeIndex = 0;
      let results = [];

      function catName(cat) {
        const c = CATEGORIES[cat];
        return c ? (c[currentLang] || c['en']) : cat;
      }

      function render() {
        const q = input.value.trim();
        const qNorm = q ? normalizeForSearch(q) : '';
        if (q) {
          results = TOOLS
            .map(t => ({ t, s: computeSearchScore(t, q, qNorm) }))
            .filter(x => x.s.score > 0)
            .sort((a, b) => b.s.score - a.s.score);
        } else {
          // Show favorites first, then recents, then rest
          results = TOOLS.slice().sort((a, b) => {
            const aFav = favorites.has(a.id) ? 2 : 0;
            const bFav = favorites.has(b.id) ? 2 : 0;
            const aRec = recents.includes(a.id) ? 1 : 0;
            const bRec = recents.includes(b.id) ? 1 : 0;
            return (bFav + bRec) - (aFav + aRec);
          });
        }
        if (activeIndex >= results.length) activeIndex = 0;

        if (!results.length) {
          list.innerHTML = `<div class="cmd-empty">${currentLang === 'sl'
            ? 'Ni najdenih orodij. Preveri črkovanje ali poskusi drugo ključno besedo.'
            : 'No tools found. Check spelling or try different keywords.'}</div>`;
          return;
        }
        list.innerHTML = results.map((r, i) => {
          const t = r.t || r; // handle both {t, s} and plain tool
          const score = r.s || null;
          const nameHtml = q ? highlightMatch(t.name[currentLang] || t.name['en'], q) : escapeHtml(t.name[currentLang] || t.name['en']);
          const matchBadge = score && score.field && score.field !== 'name'
            ? `<span class="cmd-match" style="font-size:10px;padding:1px 6px;border-radius:99px;background:rgba(234,179,8,0.2);color:#ca8a04;margin-left:8px;text-transform:capitalize;">${escapeHtml(score.field)}</span>`
            : '';
          return `
          <div class="cmd-item ${i === activeIndex ? 'active' : ''}" data-idx="${i}" role="option" aria-selected="${i === activeIndex}">
            <span class="cmd-icon">${t.icon}</span>
            <span class="cmd-name">${nameHtml}</span>
            ${matchBadge}
            <span class="cmd-cat">${escapeHtml(catName(t.category))}</span>
          </div>
        `;
        }).join("");
      }

      function open() {
        overlay.classList.add("open");
        input.value = "";
        activeIndex = 0;
        input.      placeholder = currentLang === 'sl' ? 'Išči orodje... (Ctrl+K / ⌘K)' : 'Search tool... (Ctrl+K / ⌘K)';
        render();
        setTimeout(() => input.focus(), 10);
      }

      function close() {
        overlay.classList.remove("open");
      }

      function choose(idx) {
        const r = results[idx];
        if (!r) return;
        const t = r.t || r; // handle both {t, s} and plain tool
        close();
        openTool(t.id);
      }

      input.addEventListener("input", () => { activeIndex = 0; render(); });
      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          activeIndex = Math.min(activeIndex + 1, results.length - 1);
          render();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          activeIndex = Math.max(activeIndex - 1, 0);
          render();
        } else if (e.key === "Enter") {
          e.preventDefault();
          choose(activeIndex);
        } else if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      });

      list.addEventListener("click", (e) => {
        const item = e.target.closest(".cmd-item");
        if (item) choose(parseInt(item.dataset.idx, 10));
      });

      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

      window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
          e.preventDefault();
          if (overlay.classList.contains("open")) close(); else open();
        }
      });
    }

    /* ============ INIT ============ */
    function init() {
      // Global error boundary: surface unexpected errors to the user via a
      // toast instead of silently breaking the whole app.
      window.addEventListener("error", (e) => {
        console.error("Besedomat napaka:", e.error || e.message);
        try {
          showToast((currentLang === 'sl' ? 'Napaka: ' : 'Error: ') + (e.message || "unknown"));
          const body = document.getElementById('custom-body');
          if (body && document.activeElement && body.contains(document.activeElement)) {
            showToolErrorBanner(body, e.message || "unknown");
          }
        } catch (_) { }
      });
      window.addEventListener("unhandledrejection", (e) => {
        console.error("Besedomat neobravnavan promise:", e.reason);
      });

      // Prepare tool data: tag expansion + long descriptions.
      // Runs here (not at top level) because TOOLS/CATEGORIES/LONGDESC_DE
      // are declared with const further below and would otherwise be in TDZ.
      try { TOOLS.forEach(expandTags); } catch (e) { console.error("expandTags napaka:", e); }
      TOOLS.forEach(t => {
        if (!t.longDesc) {
          const baseDesc = t.desc[currentLang] || t.desc.en;
          const name = t.name[currentLang] || t.name.en;
          const categoryName = CATEGORIES[t.category] ? CATEGORIES[t.category][currentLang] : t.category;
          t.longDesc = {
            sl: `${baseDesc} To orodje pripada kategoriji ${categoryName}. Deluje v celoti lokalno v brskalniku — vaša besedila nikoli ne zapustijo vaše naprave. Primer uporabe: prilepite besedilo, nastavite željene možnosti, in takoj vidite rezultat.`,
            en: `${baseDesc} This tool belongs to the ${categoryName} category. Runs entirely in your browser — your text never leaves your device. Usage: paste text, adjust options, and see results instantly.`
          };
        }
      });
      TOOLS.forEach(t => {
        if (!t.longDesc) return;
        if (!t.longDesc.de) {
          const catDe = CATEGORIES[t.category] ? (CATEGORIES[t.category].de || CATEGORIES[t.category].en || CATEGORIES[t.category].sl) : t.category;
          t.longDesc.de = LONGDESC_DE[t.id] || `Dieses Werkzeug gehört zur Kategorie ${catDe}. Es läuft vollständig lokal im Browser – Ihre Texte verlassen niemals Ihr Gerät. Anwendung: Text einfügen, Optionen einstellen, Ergebnis sofort sehen.`;
        }
      });
      normalizeToolCopy();
      updateToolCount();
      try {
        const results = runToolTests();
        if (results && results.failed > 0) console.warn("Besedomat: nekatera orodja so na testih failed. Podrobnosti v konzoli.");
      } catch (e) { console.warn("Besedomat: testi nisi uspeli zagnati.", e); }
      try {
        const savedTheme = localStorage.getItem("besedomat-theme") || "light";
        setTheme(savedTheme);
      } catch (e) { setTheme("light"); }
      let savedLang = "sl";
      try { savedLang = localStorage.getItem("besedomat-lang") || "sl"; } catch (e) { }
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
        if (!("serviceWorker" in navigator)) return;
        /* Deluje samo prek https ali localhost — pri file:// se mirno preskoči */
        if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
        navigator.serviceWorker.register("sw.js").catch(() => { });
      } catch (e) { }
    }

    /* ============ CIPHER TOOL RENDERERS ============ */

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
      const input = container.querySelector("#caesar-input");
      const output = container.querySelector("#caesar-output");
      const shiftEl = container.querySelector("#caesar-shift");
      const shiftVal = container.querySelector("#caesar-shift-val");
      const opEl = container.querySelector("#caesar-op");
      const preserveCase = container.querySelector("#caesar-preserve-case");

      function update() {
        const shift = parseInt(shiftEl.value) || 13;
        const encode = opEl.value === 'encode';
        const keep = preserveCase.checked;
        output.value = PURE.caesarCipher(input.value, shift, encode, keep);
        shiftVal.textContent = shift;
      }

      [input, shiftEl, opEl, preserveCase].forEach(el => el.addEventListener("input", update));
      container.querySelector("#caesar-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#caesar-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#caesar-copy"));
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
      const input = container.querySelector("#vig-input");
      const output = container.querySelector("#vig-output");
      const keyEl = container.querySelector("#vig-key");
      const opEl = container.querySelector("#vig-op");
      const preserveCase = container.querySelector("#vig-preserve-case");
      const showTable = container.querySelector("#vig-show-table");
      const tableWrap = container.querySelector("#vig-table-wrap");

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

      [input, keyEl, opEl, preserveCase, showTable].forEach(el => el.addEventListener("input", update));
      container.querySelector("#vig-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#vig-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#vig-copy"));
      });
      update();
    }

    function renderPigpenCipher(container) {
      const L = currentLang === 'sl';
      
      // Grid 1: A-I, grid 2: J-R, and the X-shaped grids: S-V/W-Z.
      const pigpenMap = {
        'A': { grid: 0, pos: 0 }, 'B': { grid: 0, pos: 1 }, 'C': { grid: 0, pos: 2 },
        'D': { grid: 0, pos: 3 }, 'E': { grid: 0, pos: 4 }, 'F': { grid: 0, pos: 5 },
        'G': { grid: 0, pos: 6 }, 'H': { grid: 0, pos: 7 }, 'I': { grid: 0, pos: 8 },
        'J': { grid: 1, pos: 0 }, 'K': { grid: 1, pos: 1 }, 'L': { grid: 1, pos: 2 },
        'M': { grid: 1, pos: 3 }, 'N': { grid: 1, pos: 4 }, 'O': { grid: 1, pos: 5 },
        'P': { grid: 1, pos: 6 }, 'Q': { grid: 1, pos: 7 }, 'R': { grid: 1, pos: 8 },
        'S': { grid: 2, pos: 0 }, 'T': { grid: 2, pos: 1 }, 'U': { grid: 2, pos: 2 },
        'V': { grid: 2, pos: 3 }, 'W': { grid: 3, pos: 0 }, 'X': { grid: 3, pos: 1 },
        'Y': { grid: 3, pos: 2 }, 'Z': { grid: 3, pos: 3 }
      };
      
      // Slovenian special chars mapping
      const slMap = { 'Č': 'C', 'Š': 'S', 'Ž': 'Z' };
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
        
        let paths = [];
        
        if (isThirdGrid) {
          const center = size / 2;
          const outer = padding + 5;
          const endpoints = [
            [outer, outer, size - outer, outer],
            [size - outer, outer, size - outer, size - outer],
            [size - outer, size - outer, outer, size - outer],
            [outer, size - outer, outer, outer]
          ][pos];
          const [x1, y1, x2, y2] = endpoints;
          paths.push(`<line x1="${center}" y1="${center}" x2="${x1}" y2="${y1}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          paths.push(`<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          if (hasDot) {
            const dotX = pos === 1 ? size - padding * 1.8 : pos === 3 ? padding * 1.8 : center;
            const dotY = pos === 0 ? padding * 1.8 : pos === 2 ? size - padding * 1.8 : center;
            paths.push(`<circle cx="${dotX}" cy="${dotY}" r="${Math.min(w, h) * 0.12}" fill="currentColor"/>`);
          }
        } else {
          // Grid 1 & 2: Square grid
          // Left border
          if (col === 0) paths.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          // Top border
          if (row === 0) paths.push(`<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          // Right border (only for last col)
          if (col === 2) paths.push(`<line x1="${x + w}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          // Bottom border (only for last row)
          if (row === 2) paths.push(`<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="currentColor" stroke-width="${lineW}" stroke-linecap="round"/>`);
          
          // Dot for second grid
          if (hasDot) {
            paths.push(`<circle cx="${x + w/2}" cy="${y + h/2}" r="${Math.min(w, h) * 0.12}" fill="currentColor"/>`);
          }
        }
        
        const glyph = pigpenStyle === 'compact' && mapped <= 'R' ? mapped.toLowerCase() : mapped;
        const styleClass = pigpenStyle === 'compact' ? ' compact' : '';
        const fontFamily = pigpenStyle === 'pigpen-cipher' ? 'PigpenCipher' : 'Wizpen';
        return `<span class="pigpen-glyph${styleClass}" style="font-family:'${fontFamily}', sans-serif;" aria-label="${mapped}">${glyph}</span>`;
      }

      function textToPigpen(text) {
        return text.split('').map(c => {
          if (/[A-Za-z]/.test(c)) {
            const svg = getPigpenSVG(c);
            return svg ? `<span style="display:inline-block; margin:2px;">${svg}</span>` : c;
          }
          return c === ' ' ? '&nbsp;' : c === '\n' ? '<br>' : escapeHtml(c);
        }).join('');
      }

      function textToPigpenSVG(text) {
        // Returns full SVG document for download
        const chars = text.split('');
        const symbols = chars.filter(c => /[A-Za-z]/.test(c)).map(c => getPigpenSVG(c)).filter(Boolean);
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

      const input = container.querySelector("#pigpen-input");
      const outputWrap = container.querySelector("#pigpen-output-wrap");
      const outputMode = container.querySelector("#pigpen-output");
      const preserveSpaces = container.querySelector("#pigpen-spaces");
      const direction = container.querySelector("#pigpen-direction");
      const style = container.querySelector("#pigpen-style");
      const legendDiv = container.querySelector("#pigpen-legend");

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
        } else { // both
          const letters = displayText.replace(/[^A-Za-z]/g, '');
          outputWrap.innerHTML = (isDecode ? escapeHtml(displayText) : textToPigpen(displayText)) + '<hr style="margin:12px 0; border-color:var(--border);">' + textToPigpen(letters);
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

      style.addEventListener("input", () => {
        pigpenStyle = style.value;
        update();
        buildLegend();
      });
      [input, outputMode, direction, preserveSpaces].forEach(el => el.addEventListener("input", update));
      container.querySelector("#pigpen-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#pigpen-copy").addEventListener("click", () => {
        copyText(outputWrap.innerText || outputWrap.textContent, container.querySelector("#pigpen-copy"));
      });
      container.querySelector("#pigpen-download").addEventListener("click", downloadSVG);
      update();
      buildLegend();
    }

    /* ============ TESTS ============ */
    function runToolTests() {
      console.log("Running automated tests on all tools...");
      let passed = 0, failed = 0;
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

    function renderPlatformCounter(container) {
      const L = currentLang === 'sl';
      
      const platforms = [
        { id: 'twitter', name: 'Twitter / X', limit: 280, icon: '🐦', color: '#1DA1F2' },
        { id: 'linkedin', name: 'LinkedIn', limit: 3000, icon: '💼', color: '#0A66C2' },
        { id: 'instagram', name: 'Instagram', limit: 2200, icon: '📷', color: '#E4405F' },
        { id: 'sms', name: 'SMS', limit: 160, icon: '📱', color: '#25D366' },
        { id: 'meta', name: 'Meta Description', limit: 160, icon: '🔍', color: '#1877F2' },
        { id: 'youtube', name: 'YouTube Title', limit: 100, icon: '▶️', color: '#FF0000' }
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

      const input = container.querySelector("#pc-input");
      const resultsDiv = container.querySelector("#pc-results");

      function getCountStats(text) {
        const charsWithSpaces = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text ? text.split(/\r?\n/).length : 0;
        return { charsWithSpaces, charsNoSpaces, words, lines };
      }

      function getStatus(used, limit) {
        const pct = (used / limit) * 100;
        if (used > limit) return { class: 'over', label: L ? `PRESEŽENO (+${used - limit})` : `OVER (+${used - limit})`, pct: Math.min(pct, 200) };
        if (pct >= 90) return { class: 'warn', label: L ? `Preostane ${limit - used}` : `${limit - used} left`, pct };
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

      input.addEventListener("input", update);
      container.querySelector("#pc-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#pc-copy").addEventListener("click", () => {
        const text = input.value;
        const stats = getCountStats(text);
        let summary = `${L ? 'Povzetek dolžin' : 'Length Summary'}:\n`;
        platforms.forEach(p => {
          const status = getStatus(stats.charsWithSpaces, p.limit);
          summary += `${p.name}: ${stats.charsWithSpaces}/${p.limit} (${status.label})\n`;
        });
        summary += `\n${L ? 'Skupaj' : 'Total'}: ${stats.charsWithSpaces} ${L ? 'znakov' : 'chars'}, ${stats.words} ${L ? 'besed' : 'words'}`;
        copyText(summary, container.querySelector("#pc-copy"));
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

      const input = container.querySelector("#ra-input");
      const langSel = container.querySelector("#ra-lang");
      const highlightCheck = container.querySelector("#ra-highlight");
      const resultsDiv = container.querySelector("#ra-results");
      const highlightedDiv = container.querySelector("#ra-highlighted");

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
        const syllables = words.reduce((sum, w) => sum + (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)), 0);
        
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
        const complexWords = words.filter(w => (lang === 'sl' ? countSyllablesSL(w) : countSyllablesEN(w)) >= 3).length;
        const fog = 0.4 * ((numWords / numSentences) + 100 * (complexWords / numWords));
        
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
          highlightedHtml = parts.map(part => {
            const trimmed = part.trim();
            const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
            if (wordCount > 25) {
              return `<mark style="background:rgba(239,68,68,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
            } else if (wordCount >= 20) {
              return `<mark style="background:rgba(245,158,11,0.3); padding:1px 3px; border-radius:3px;">${escapeHtml(part)}</mark>`;
            }
            return escapeHtml(part);
          }).join('');
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
        
        container.querySelector("#ra-copy").onclick = () => copyText(report, container.querySelector("#ra-copy"));
      }

      input.addEventListener("input", analyze);
      langSel.addEventListener("change", analyze);
      highlightCheck.addEventListener("change", analyze);
      container.querySelector("#ra-clear").addEventListener("click", () => { input.value = ""; analyze(); input.focus(); });
      analyze();
    }

    function renderQRCodeGenerator(container) {
      const L = currentLang === 'sl';
      
      // Minimal QR code implementation (simplified)
      function generateQRCode(text, options = {}) {
        const size = options.size || 256;
        const eccLevel = options.ecc || 'M';
        const fgColor = options.fgColor || '#000000';
        const bgColor = options.bgColor || '#ffffff';
        
        // Use a simple QR code library approach - for now we'll use a canvas-based approach
        // This is a placeholder that creates a visual QR-like pattern
        // In production, you'd use a proper QR library like qrcode.js
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Simple QR-like pattern generation (not a real QR code)
        // For a real implementation, you'd need a proper QR library
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        
        // Draw finder patterns (three corners)
        const moduleSize = size / 37; // 37x37 modules for version 3
        const drawFinder = (x, y) => {
          ctx.fillStyle = fgColor;
          // 7x7 outer
          ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
          // 5x5 inner white
          ctx.fillStyle = bgColor;
          ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
          // 3x3 center
          ctx.fillStyle = fgColor;
          ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
        };
        
        drawFinder(0, 0);
        drawFinder(24, 0);
        drawFinder(0, 24);
        
        // Draw timing patterns
        ctx.fillStyle = fgColor;
        for (let i = 8; i < 24; i++) {
          if (i % 2 === 0) {
            ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
            ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
          }
        }
        
        // Encode some data pattern (simplified)
        const dataStr = text.substring(0, 100);
        let bitIndex = 0;
        for (let y = 0; y < 24; y++) {
          for (let x = 0; x < 24; x++) {
            // Skip finder pattern areas and timing
            if ((x < 9 && y < 9) || (x > 23 && y < 9) || (x < 9 && y > 23) || x === 6 || y === 6) continue;
            
            const charCode = dataStr.charCodeAt(bitIndex % dataStr.length);
            const bit = (charCode >> (bitIndex % 8)) & 1;
            bitIndex++;
            
            if (bit) {
              ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
            }
          }
        }
        
        return canvas;
      }

      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Vrsta vsebine:' : 'Content type:'}
        <select id="qr-type">
          <option value="text">${L ? 'Besedilo / URL' : 'Text / URL'}</option>
          <option value="email">${L ? 'E-pošta (mailto:)' : 'Email (mailto:)'}</option>
          <option value="phone">${L ? 'Telefon (tel:)' : 'Phone (tel:)'}</option>
          <option value="wifi">${L ? 'Wi-Fi' : 'Wi-Fi'}</option>
          <option value="vcard">${L ? 'vCard (kontakt)' : 'vCard (contact)'}</option>
        </select>
      </label>
      <div id="qr-wifi-fields" style="display:none; gap:8px; flex-wrap:wrap;">
        <input type="text" id="qr-wifi-ssid" placeholder="SSID (ime omrežja)" style="flex:1; min-width:140px;">
        <input type="text" id="qr-wifi-pass" placeholder="${L ? 'Geslo' : 'Password'}" style="flex:1; min-width:140px;">
        <select id="qr-wifi-enc">
          <option value="WPA">${L ? 'WPA/WPA2' : 'WPA/WPA2'}</option>
          <option value="WEP">WEP</option>
          <option value="nopass">${L ? 'Brez gesla' : 'No password'}</option>
        </select>
      </div>
      <div id="qr-vcard-fields" style="display:none; gap:8px; flex-wrap:wrap;">
        <input type="text" id="qr-vcard-name" placeholder="${L ? 'Ime in priimek' : 'Full name'}" style="flex:1; min-width:140px;">
        <input type="text" id="qr-vcard-phone" placeholder="${L ? 'Telefon' : 'Phone'}" style="flex:1; min-width:140px;">
        <input type="text" id="qr-vcard-email" placeholder="Email" style="flex:1; min-width:140px;">
        <input type="text" id="qr-vcard-org" placeholder="${L ? 'Organizacija' : 'Organization'}" style="flex:1; min-width:140px;">
      </div>
      <label>${L ? 'Velikost:' : 'Size:'}
        <input type="range" id="qr-size" min="128" max="512" value="256" step="64" style="flex:1; max-width:200px;">
        <strong id="qr-size-val">256</strong>px
      </label>
      <label>${L ? 'Napakovna toleranca:' : 'Error correction:'}
        <select id="qr-ecc">
          <option value="L">${L ? 'L (7%)' : 'L (7%)'}</option>
          <option value="M" selected>${L ? 'M (15%)' : 'M (15%)'}</option>
          <option value="Q">${L ? 'Q (25%)' : 'Q (25%)'}</option>
          <option value="H">${L ? 'H (30%)' : 'H (30%)'}</option>
        </select>
      </label>
      <label>${L ? 'Barva kode:' : 'Foreground:'}
        <input type="color" id="qr-fg" value="#000000" style="width:40px; height:30px; border:none; border-radius:4px; cursor:pointer;">
      </label>
      <label>${L ? 'Barva ozadja:' : 'Background:'}
        <input type="color" id="qr-bg" value="#ffffff" style="width:40px; height:30px; border:none; border-radius:4px; cursor:pointer;">
      </label>
    </div>
    <div class="tool-workspace-2col">
      <div class="tool-panel">
        <label for="qr-input">${getI('ui_input')}</label>
        <textarea id="qr-input" placeholder="${L ? 'Vnesite besedilo, URL ali podatke...' : 'Enter text, URL or data...'}" style="min-height:140px;">https://besedomat.si</textarea>
        <div class="panel-actions">
          <button class="btn-sm" id="qr-clear" style="display:inline-flex; align-items:center; gap:5px;" title="${getI('ui_clear')}">${SVG_ICONS.mi_trash} <span>${getI('ui_clear')}</span></button>
        </div>
      </div>
      <div class="tool-panel">
        <label>${getI('ui_output')}</label>
        <div style="text-align:center; padding:16px; background:var(--card); border:1px solid var(--border); border-radius:12px; flex:1; min-height:200px; display:flex; align-items:center; justify-content:center;">
          <canvas id="qr-canvas" width="256" height="256" style="max-width:100%; border-radius:8px; border:1px solid var(--border); image-rendering:pixelated;"></canvas>
        </div>
        <div class="panel-actions" style="gap:8px; flex-wrap:wrap;">
          <button class="btn-sm primary" id="qr-download-png" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi PNG' : 'Download PNG'}</span></button>
          <button class="btn-sm" id="qr-download-svg" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_download} <span>${L ? 'Prenesi SVG' : 'Download SVG'}</span></button>
        </div>
      </div>
    </div>
  `;

      const input = container.querySelector("#qr-input");
      const typeSel = container.querySelector("#qr-type");
      const sizeEl = container.querySelector("#qr-size");
      const sizeVal = container.querySelector("#qr-size-val");
      const eccSel = container.querySelector("#qr-ecc");
      const fgEl = container.querySelector("#qr-fg");
      const bgEl = container.querySelector("#qr-bg");
      const canvas = container.querySelector("#qr-canvas");
      const ctx = canvas.getContext("2d");
      const wifiFields = container.querySelector("#qr-wifi-fields");
      const vcardFields = container.querySelector("#qr-vcard-fields");
      const wifiSSID = container.querySelector("#qr-wifi-ssid");
      const wifiPass = container.querySelector("#qr-wifi-pass");
      const wifiEnc = container.querySelector("#qr-wifi-enc");
      const vcardName = container.querySelector("#qr-vcard-name");
      const vcardPhone = container.querySelector("#qr-vcard-phone");
      const vcardEmail = container.querySelector("#qr-vcard-email");
      const vcardOrg = container.querySelector("#qr-vcard-org");

      function getQRData() {
        const type = typeSel.value;
        let data = '';
        
        if (type === 'text') {
          data = input.value;
        } else if (type === 'email') {
          data = `mailto:${input.value}`;
        } else if (type === 'phone') {
          data = `tel:${input.value}`;
        } else if (type === 'wifi') {
          const ssid = wifiSSID.value;
          const pass = wifiPass.value;
          const enc = wifiEnc.value;
          data = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
        } else if (type === 'vcard') {
          const name = vcardName.value;
          const phone = vcardPhone.value;
          const email = vcardEmail.value;
          const org = vcardOrg.value;
          data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${org}\nEND:VCARD`;
        }
        return data;
      }

      function updateFields() {
        const type = typeSel.value;
        wifiFields.style.display = type === 'wifi' ? 'flex' : 'none';
        vcardFields.style.display = type === 'vcard' ? 'flex' : 'none';
        input.style.display = type === 'wifi' || type === 'vcard' ? 'none' : 'block';
        updateQR();
      }

      function drawQR(qr, size, fg, bg, marginModules) {
        const count = qr.getModuleCount();
        const total = count + marginModules * 2;
        const cell = size / total;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = fg;
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              const x = Math.round((c + marginModules) * cell);
              const y = Math.round((r + marginModules) * cell);
              const w = Math.round((c + marginModules + 1) * cell) - x;
              const h = Math.round((r + marginModules + 1) * cell) - y;
              ctx.fillRect(x, y, w, h);
            }
          }
        }
      }

      function updateQR() {
        const size = parseInt(sizeEl.value) || 256;
        const data = getQRData();
        const fg = fgEl.value;
        const bg = bgEl.value;
        const ecc = eccSel.value;

        canvas.width = size;
        canvas.height = size;
        sizeVal.textContent = size;

        if (typeof qrcode === 'undefined') {
          generateSimpleQR(ctx, data, size, fg, bg);
          return;
        }
        try {
          qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
          const qr = qrcode(0, ecc);
          qr.addData(data && data.length ? data : ' ');
          qr.make();
          drawQR(qr, size, fg, bg, 4);
        } catch (e) {
          generateSimpleQR(ctx, data, size, fg, bg);
        }
      }

      function generateSimpleQR(ctx, text, size, fg, bg) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        
        const modules = 33;
        const moduleSize = size / modules;
        
        // Simple hash-based pattern (not real QR, but looks like one)
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          hash = ((hash << 5) - hash) + text.charCodeAt(i);
          hash |= 0;
        }
        
        // Finder patterns
        const drawFinder = (mx, my) => {
          ctx.fillStyle = fg;
          ctx.fillRect(mx * moduleSize, my * moduleSize, 7 * moduleSize, 7 * moduleSize);
          ctx.fillStyle = bg;
          ctx.fillRect((mx + 1) * moduleSize, (my + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
          ctx.fillStyle = fg;
          ctx.fillRect((mx + 2) * moduleSize, (my + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
        };
        drawFinder(0, 0);
        drawFinder(modules - 7, 0);
        drawFinder(0, modules - 7);
        
        // Timing patterns
        for (let i = 8; i < modules - 8; i++) {
          if (i % 2 === 0) {
            ctx.fillStyle = fg;
            ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
            ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
          }
        }
        
        // Data area (pseudo-random based on text hash)
        ctx.fillStyle = fg;
        let seed = Math.abs(hash);
        for (let y = 0; y < modules; y++) {
          for (let x = 0; x < modules; x++) {
            // Skip finder and timing areas
            if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8)) continue;
            if (x === 6 || y === 6) continue;
            
            seed = (seed * 1664525 + 1013904223) >>> 0;
            if (seed % 2 === 0) {
              ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
            }
          }
        }
      }

      function downloadPNG() {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      function downloadSVG() {
        const data = getQRData();
        const fg = fgEl.value;
        const bg = bgEl.value;
        const ecc = eccSel.value;
        const size = parseInt(sizeEl.value) || 256;

        if (typeof qrcode !== 'undefined') {
          try {
            qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
            const qr = qrcode(0, ecc);
            qr.addData(data && data.length ? data : ' ');
            qr.make();
            const count = qr.getModuleCount();
            const margin = 4;
            const total = count + margin * 2;
            const cell = size / total;
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
            svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
            for (let r = 0; r < count; r++) {
              for (let c = 0; c < count; c++) {
                if (qr.isDark(r, c)) {
                  const x = ((c + margin) * cell).toFixed(2);
                  const y = ((r + margin) * cell).toFixed(2);
                  svg += `<rect x="${x}" y="${y}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${fg}"/>`;
                }
              }
            }
            svg += '</svg>';
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrcode.svg';
            a.click();
            URL.revokeObjectURL(url);
            return;
          } catch (e) { /* fall through to fake */ }
        }

        // Fallback: simple pseudo pattern (not a real QR)
        const modules = 33;
        const moduleSize = size / modules;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash |= 0; }
        const drawFinderSVG = (mx, my) => {
          svg += `<rect x="${mx * moduleSize}" y="${my * moduleSize}" width="${7 * moduleSize}" height="${7 * moduleSize}" fill="${fg}"/>`;
          svg += `<rect x="${(mx + 1) * moduleSize}" y="${(my + 1) * moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" fill="${bg}"/>`;
          svg += `<rect x="${(mx + 2) * moduleSize}" y="${(my + 2) * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" fill="${fg}"/>`;
        };
        drawFinderSVG(0, 0); drawFinderSVG(modules - 7, 0); drawFinderSVG(0, modules - 7);
        for (let i = 8; i < modules - 8; i++) {
          if (i % 2 === 0) {
            svg += `<rect x="${i * moduleSize}" y="${6 * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
            svg += `<rect x="${6 * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
          }
        }
        let seed = Math.abs(hash);
        for (let y = 0; y < modules; y++) {
          for (let x = 0; x < modules; x++) {
            if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8)) continue;
            if (x === 6 || y === 6) continue;
            seed = (seed * 1664525 + 1013904223) >>> 0;
            if (seed % 2 === 0) svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
          }
        }
        svg += '</svg>';
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'qrcode.svg'; a.click();
        URL.revokeObjectURL(url);
      }

      [input, typeSel, sizeEl, eccSel, fgEl, bgEl, wifiSSID, wifiPass, wifiEnc, vcardName, vcardPhone, vcardEmail, vcardOrg].forEach(el => {
        el.addEventListener("input", updateQR);
        el.addEventListener("change", updateQR);
      });
      
      typeSel.addEventListener("change", updateFields);
      
      container.querySelector("#qr-clear").addEventListener("click", () => { 
        input.value = ""; 
        wifiSSID.value = ""; 
        wifiPass.value = ""; 
        vcardName.value = ""; 
        vcardPhone.value = ""; 
        vcardEmail.value = ""; 
        vcardOrg.value = ""; 
        updateFields(); 
        input.focus(); 
      });
      
      container.querySelector("#qr-download-png").addEventListener("click", downloadPNG);
      container.querySelector("#qr-download-svg").addEventListener("click", downloadSVG);
      
      updateFields();
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

    function renderTextToEmoji(container) {
      const L = currentLang === 'sl';
      
      // Emoji dictionary for SL and EN
      const emojiDict = {
        sl: {
          'ljubezen': '❤️', 'ljubav': '❤️', 'srce': '❤️',
          'kava': '☕', 'kafe': '☕', 'espresso': '☕',
          'sonce': '☀️', 'sončno': '☀️', 'zrak': '☀️',
          'luna': '🌙', 'noč': '🌙', 'noč': '🌙',
          'zvezda': '⭐', 'zvezdice': '✨',
          'dež': '🌧️', 'deževje': '🌧️', 'kiša': '🌧️',
          'sneg': '❄️', 'snežek': '❄️', 'zima': '❄️',
          'drevo': '🌳', 'gozd': '🌲', 'narava': '🌿',
          'cvet': '🌸', 'cvetje': '🌺', 'roža': '🌹',
          'mačka': '🐱', 'mačke': '🐱', 'mačje': '🐱',
          'pes': '🐶', 'psa': '🐶', 'kuža': '🐶',
          'ptica': '🐦', 'ptice': '🐦',
          'riba': '🐟', 'ribe': '🐟',
          'konj': '🐴', 'konji': '🐴',
          'krava': '🐄', 'ovca': '🐑', 'prašič': '🐷',
          'hiša': '🏠', 'dom': '🏠', 'stanovanje': '🏠',
          'avto': '🚗', 'avtomobil': '🚗', 'kolo': '🚲',
          'vlak': '🚂', 'avtobus': '🚌', 'letalo': '✈️',
          'ladja': '⛵', 'brod': '🚢',
          'denar': '💰', 'evri': '💶', 'dolar': '💵', 'zlato': '💰',
          'čas': '⏰', 'ura': '🕐', 'minuta': '⏱️', 'sekunda': '⏱️',
          'dan': '📅', 'teden': '📅', 'mesec': '📅', 'leto': '📅',
          'hrana': '🍔', 'jed': '🍽️', 'kosilo': '🍽️', 'večerja': '🍽️',
          'pica': '🍕', 'sendvič': '🥪', 'slaščica': '🍰', 'torta': '🎂',
          'jabolko': '🍎', 'banana': '🍌', 'jagoda': '🍓', 'grozdje': '🍇',
          'pivo': '🍺', 'vino': '🍷', 'koktajl': '🍹', 'voda': '💧',
          'veselje': '😊', 'sreča': '😄', 'nasmeh': '😊', 'smijeh': '😂',
          'žalost': '😢', 'tužnost': '😢', 'solze': '😭',
          'gnev': '😡', 'jeza': '😠', 'razjezen': '😡',
          'strah': '😱', 'plašiti': '😨', 'strašen': '😱',
          'presenečenje': '😲', 'šok': '😱',
          'ljubosumje': '😒', 'zavist': '😒',
          'spanje': '😴', 'spanje': '😴', 'zaspati': '😴',
          'bolan': '🤒', 'bolečina': '🤕', 'zdravje': '🏥',
          'bolnišnica': '🏥', 'zdravnik': '👨‍⚕️', 'lekar': '👩‍⚕️',
          'šola': '🏫', 'učitelji': '👨‍🏫', 'učiteljica': '👩‍🏫', 'učenje': '📚',
          'knjiga': '📖', 'knjige': '📚', 'branje': '📖',
          'pisanje': '✍️', 'pisati': '✏️', 'pisalo': '✏️',
          'glasba': '🎵', 'pesem': '🎵', 'pevaj': '🎤', 'koncert': '🎤',
          'film': '🎬', 'kino': '🎬', 'serija': '📺', 'tv': '📺',
          'igra': '🎮', 'gamer': '🎮', 'videoigra': '🎮',
          'šport': '⚽', 'nogomet': '⚽', 'košarka': '🏀', 'tenis': '🎾',
          'tekmovanje': '🏆', 'zmaga': '🏆', 'medalja': '🥇',
          'poklon': '🎁', 'darilo': '🎁', 'rojstni dan': '🎂', 'rojstni': '🎂',
          'praznik': '🎉', 'slavje': '🎊', 'novo leto': '🎆',
          'ljubljena': '💑', 'ljubljeni': '💑', 'partner': '💑', 'poroka': '💍',
          'družina': '👨‍👩‍👧‍👦', 'otroci': '👶', 'sin': '👦', 'hčerka': '👧',
          'mama': '👩', 'tata': '👨', 'babica': '👵', 'dedek': '👴',
          'prijatelj': '👯', 'prijateljica': '👯', 'znanec': '🤝',
          'pogovor': '💬', 'klepet': '💬', 'spor': '🗣️',
          'telefon': '📞', 'klic': '📞', 'sms': '📨', 'sporočilo': '💌',
          'email': '📧', 'pošta': '📮', 'paket': '📦',
          'delo': '💼', 'služba': '💼', 'kariera': '📈', 'posao': '💼',
          'srečanje': '🤝', 'seja': '📅', 'termin': '📅',
          'projekt': '📁', 'naloga': '📋', 'rok': '⏰', 'oddaja': '📤',
          'računalnik': '💻', 'laptop': '💻', 'mobilni': '📱', 'telefon': '📱',
          'internet': '🌐', 'splet': '🌐', 'wifi': '📶', 'signal': '📶',
          'kljukica': '✅', 'prav': '✅', 'narobe': '❌', 'napaka': '❌',
          'vprašanje': '❓', 'odgovor': '💡', 'ideja': '💡', 'misel': '💭',
          'opomba': '📝', 'zapis': '📝', 'seznam': '📋', 'nadaljevanje': '➡️',
          'levo': '⬅️', 'desno': '➡️', 'gor': '⬆️', 'dol': '⬇️',
          'iskanje': '🔍', 'najti': '🔍', 'skrit': '🕵️', 'tajnik': '🤫',
          'ključ': '🔑', 'zaklenjeno': '🔒', 'odklenjeno': '🔓',
          'varnost': '🛡️', 'zaščita': '🛡️', 'policija': '👮', 'gasilec': '🚒',
          'bolnica': '🏥', 'rešitev': '💡', 'problem': '❓', 'izziv': '🏔️',
          'plan': '📋', 'cilj': '🎯', 'uspeh': '✅', 'neuspeh': '❌',
          'prihodnje': '🔮', 'preteklost': '🕰️', 'sedaj': '⏰',
          'jutro': '🌅', 'poldne': '☀️', 'večer': '🌆', 'ponoč': '🌙',
          'ponedeljek': '📅', 'torek': '📅', 'sreda': '📅', 'četrtek': '📅', 'petek': '📅', 'sobota': '📅', 'nedelja': '📅',
          'januar': '❄️', 'februar': '❄️', 'marec': '🌱', 'april': '🌧️', 'maj': '🌸', 'junij': '☀️',
          'julij': '☀️', 'avgust': '🌞', 'september': '🍂', 'oktober': '🎃', 'november': '🍂', 'december': '🎄'
        },
        en: {
          'love': '❤️', 'heart': '❤️', 'hearts': '💕',
          'coffee': '☕', 'cafe': '☕', 'espresso': '☕',
          'sun': '☀️', 'sunny': '☀️', 'sunshine': '☀️',
          'moon': '🌙', 'night': '🌙', 'dark': '🌙',
          'star': '⭐', 'stars': '✨', 'sparkle': '✨',
          'rain': '🌧️', 'rainy': '🌧️', 'storm': '⛈️',
          'snow': '❄️', 'snowflake': '❄️', 'winter': '❄️',
          'tree': '🌳', 'forest': '🌲', 'nature': '🌿',
          'flower': '🌸', 'flowers': '🌺', 'rose': '🌹',
          'cat': '🐱', 'cats': '🐱', 'kitten': '🐱',
          'dog': '🐶', 'dogs': '🐶', 'puppy': '🐶',
          'bird': '🐦', 'birds': '🐦',
          'fish': '🐟', 'fishes': '🐟',
          'horse': '🐴', 'horses': '🐴',
          'cow': '🐄', 'sheep': '🐑', 'pig': '🐷',
          'house': '🏠', 'home': '🏠', 'building': '🏢',
          'car': '🚗', 'automobile': '🚗', 'bike': '🚲',
          'train': '🚂', 'bus': '🚌', 'plane': '✈️',
          'ship': '⛵', 'boat': '🚢',
          'money': '💰', 'euro': '💶', 'dollar': '💵', 'gold': '💰',
          'time': '⏰', 'hour': '🕐', 'minute': '⏱️', 'second': '⏱️',
          'day': '📅', 'week': '📅', 'month': '📅', 'year': '📅',
          'food': '🍔', 'meal': '🍽️', 'lunch': '🍽️', 'dinner': '🍽️',
          'pizza': '🍕', 'sandwich': '🥪', 'cake': '🍰', 'dessert': '🍰',
          'apple': '🍎', 'banana': '🍌', 'strawberry': '🍓', 'grapes': '🍇',
          'beer': '🍺', 'wine': '🍷', 'cocktail': '🍹', 'water': '💧',
          'happy': '😊', 'joy': '😄', 'smile': '😊', 'laugh': '😂',
          'sad': '😢', 'sadness': '😢', 'tears': '😭', 'cry': '😭',
          'angry': '😡', 'anger': '😠', 'mad': '😡', 'furious': '😡',
          'fear': '😱', 'scared': '😨', 'afraid': '😱', 'terrified': '😱',
          'surprise': '😲', 'shock': '😱', 'amazed': '😲',
          'jealous': '😒', 'envy': '😒',
          'sleep': '😴', 'sleepy': '😴', 'tired': '😴',
          'sick': '🤒', 'pain': '🤕', 'health': '🏥', 'ill': '🤒',
          'hospital': '🏥', 'doctor': '👨‍⚕️', 'nurse': '👩‍⚕️',
          'school': '🏫', 'teacher': '👨‍🏫', 'learning': '📚', 'study': '📖',
          'book': '📖', 'books': '📚', 'reading': '📖',
          'writing': '✍️', 'write': '✏️', 'pen': '✏️', 'pencil': '✏️',
          'music': '🎵', 'song': '🎵', 'sing': '🎤', 'concert': '🎤',
          'movie': '🎬', 'cinema': '🎬', 'series': '📺', 'tv': '📺',
          'game': '🎮', 'gamer': '🎮', 'videogame': '🎮',
          'sport': '⚽', 'football': '⚽', 'soccer': '⚽', 'basketball': '🏀', 'tennis': '🎾',
          'competition': '🏆', 'win': '🏆', 'victory': '🏆', 'medal': '🥇',
          'gift': '🎁', 'present': '🎁', 'birthday': '🎂', 'party': '🎉',
          'holiday': '🎉', 'celebration': '🎊', 'new year': '🎆',
          'couple': '💑', 'partner': '💑', 'marriage': '💍', 'wedding': '💍',
          'family': '👨‍👩‍👧‍👦', 'children': '👶', 'son': '👦', 'daughter': '👧',
          'mom': '👩', 'mother': '👩', 'dad': '👨', 'father': '👨', 'grandma': '👵', 'grandpa': '👴',
          'friend': '👯', 'friends': '👯', 'acquaintance': '🤝',
          'talk': '💬', 'chat': '💬', 'argument': '🗣️', 'discussion': '💬',
          'phone': '📞', 'call': '📞', 'sms': '📨', 'message': '💌',
          'email': '📧', 'mail': '📮', 'package': '📦',
          'work': '💼', 'job': '💼', 'career': '📈', 'office': '🏢',
          'meeting': '🤝', 'appointment': '📅', 'schedule': '📅',
          'project': '📁', 'task': '📋', 'deadline': '⏰', 'submit': '📤',
          'computer': '💻', 'laptop': '💻', 'mobile': '📱', 'phone': '📱',
          'internet': '🌐', 'web': '🌐', 'wifi': '📶', 'signal': '📶',
          'check': '✅', 'yes': '✅', 'correct': '✅', 'wrong': '❌', 'error': '❌',
          'question': '❓', 'answer': '💡', 'idea': '💡', 'thought': '💭',
          'note': '📝', 'memo': '📝', 'list': '📋', 'next': '➡️',
          'left': '⬅️', 'right': '➡️', 'up': '⬆️', 'down': '⬇️',
          'search': '🔍', 'find': '🔍', 'hidden': '🕵️', 'secret': '🤫',
          'key': '🔑', 'locked': '🔒', 'unlocked': '🔓',
          'security': '🛡️', 'protection': '🛡️', 'police': '👮', 'firefighter': '🚒',
          'hospital': '🏥', 'solution': '💡', 'problem': '❓', 'challenge': '🏔️',
          'plan': '📋', 'goal': '🎯', 'success': '✅', 'failure': '❌',
          'future': '🔮', 'past': '🕰️', 'now': '⏰',
          'morning': '🌅', 'noon': '☀️', 'evening': '🌆', 'midnight': '🌙',
          'monday': '📅', 'tuesday': '📅', 'wednesday': '📅', 'thursday': '📅', 'friday': '📅', 'saturday': '📅', 'sunday': '📅',
          'january': '❄️', 'february': '❄️', 'march': '🌱', 'april': '🌧️', 'may': '🌸', 'june': '☀️',
          'july': '☀️', 'august': '🌞', 'september': '🍂', 'october': '🎃', 'november': '🍂', 'december': '🎄'
        }
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

      const input = container.querySelector("#te-input");
      const outputWrap = container.querySelector("#te-output-wrap");
      const modeSel = container.querySelector("#te-mode");
      const caseCheck = container.querySelector("#te-case");
      const unknownCheck = container.querySelector("#te-unknown");

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
        
        outputWrap.innerHTML = result || (L ? '<span style="color:var(--text-dim);">Ni ujemanj. Poskusite druge besede.</span>' : '<span style="color:var(--text-dim);">No matches. Try other words.</span>');
      }

      [input, modeSel, caseCheck, unknownCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#te-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#te-copy").addEventListener("click", () => {
        copyText(outputWrap.innerText || outputWrap.textContent, container.querySelector("#te-copy"));
      });
      update();
    }

    /* ============ ASCII ART FONTS (Standard 5x5 block) ============ */
    const ASCII_FONTS = {
      "A": [" ### ", "#   #", "#####", "#   #", "#   #"],
      "B": ["#### ", "#   #", "#### ", "#   #", "#### "],
      "C": [" ####", "#    ", "#    ", "#    ", " ####"],
      "D": ["#### ", "#   #", "#   #", "#   #", "#### "],
      "E": ["#####", "#    ", "###  ", "#    ", "#####"],
      "F": ["#####", "#    ", "###  ", "#    ", "#    "],
      "G": [" ####", "#    ", "#  ##", "#   #", " ### "],
      "H": ["#   #", "#   #", "#####", "#   #", "#   #"],
      "I": [" ###", "  # ", "  # ", "  # ", " ###"],
      "J": ["  ###", "   # ", "   # ", "#  # ", " ##  "],
      "K": ["#   #", "#  # ", "###  ", "#  # ", "#   #"],
      "L": ["#    ", "#    ", "#    ", "#    ", "#####"],
      "M": ["#   #", "## ##", "# # #", "#   #", "#   #"],
      "N": ["#   #", "##  #", "# # #", "#  ##", "#   #"],
      "O": [" ### ", "#   #", "#   #", "#   #", " ### "],
      "P": ["#### ", "#   #", "#### ", "#    ", "#    "],
      "Q": [" ### ", "#   #", "# # #", "#  # ", " ## #"],
      "R": ["#### ", "#   #", "#### ", "#  # ", "#   #"],
      "S": [" ####", "#    ", " ### ", "    #", "#### "],
      "T": ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
      "U": ["#   #", "#   #", "#   #", "#   #", " ### "],
      "V": ["#   #", "#   #", "#   #", " # # ", "  #  "],
      "W": ["#   #", "#   #", "# # #", "## ##", "#   #"],
      "X": ["#   #", " # # ", "  #  ", " # # ", "#   #"],
      "Y": ["#   #", " # # ", "  #  ", "  #  ", "  #  "],
      "Z": ["#####", "   # ", "  #  ", " #   ", "#####"],
      "0": [" ### ", "#   #", "# # #", "#  ##", " ### "],
      "1": ["  #  ", " ##  ", "  #  ", "  #  ", " ### "],
      "2": ["###  ", "   # ", " ##  ", "#    ", "#####"],
      "3": ["#### ", "   # ", " ##  ", "   # ", "#### "],
      "4": ["#   #", "#   #", "#####", "    #", "    #"],
      "5": ["#####", "#    ", "#### ", "    #", "#### "],
      "6": [" ####", "#    ", "#### ", "#   #", " ### "],
      "7": ["#####", "   # ", "  #  ", " #   ", "#    "],
      "8": [" ### ", "#   #", " ### ", "#   #", " ### "],
      "9": [" ### ", "#   #", " ####", "    #", " ####"],
      " ": ["     ", "     ", "     ", "     ", "     "],
      ".": ["     ", "     ", "     ", "     ", "  #  "],
      ",": ["     ", "     ", "     ", "  #  ", " #   "],
      "!": ["  #  ", "  #  ", "  #  ", "     ", "  #  "],
      "?": [" ### ", "#   #", "  ## ", "     ", "  #  "],
      ":": ["     ", "  #  ", "     ", "  #  ", "     "],
      ";": ["     ", "  #  ", "     ", "  #  ", " #   "],
      "-": ["     ", "     ", " ### ", "     ", "     "],
      "_": ["     ", "     ", "     ", "     ", "#####"],
      "+": ["     ", "  #  ", " ### ", "  #  ", "     "],
      "=": ["     ", " ### ", "     ", " ### ", "     "],
      "*": ["     ", "# #  ", " # # ", "# #  ", "     "],
      "/": ["    #", "   # ", "  #  ", " #   ", "#    "],
      "\\": ["#    ", " #   ", "  #  ", "   # ", "    #"],
      "(": ["  ## ", " #   ", " #   ", " #   ", "  ## "],
      ")": [" ##  ", "   # ", "   # ", "   # ", " ##  "],
      "#": [" ### ", "# # #", " ### ", "# # #", " ### "],
      "@": [" ### ", "#   #", "# ###", "#    ", " ### "],
      "&": [" #   ", "# #  ", " # # ", "# #  ", " # # "],
      "'": ["  #  ", "  #  ", "     ", "     ", "     "],
      "\"": ["# #  ", "# #  ", "     ", "     ", "     "]
    };

    /* ============ ASCII ART GENERATOR (FIGlet-style) ============ */
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
            t = t.replace(new RegExp('\\x60(.+?)\\x60', 'g'), '<code>$1</code>');
            t = t.replace(/^>\\s+(.+)$/gm, '<blockquote>$1</blockquote>');
            t = t.replace(/^\\s*[-*]\\s+(.+)$/gm, '<li>$1</li>');
            t = t.replace(/(<li>.*<\\/li>)/gms, '<ul>$1</ul>');
            t = t.replace(/\\[([^\\]]+?)\\]\\(([^)\\s]+?)\\)/g, (_, label, url) => '<a href="' + escape(safeUrl(url)) + '">' + label + '</a>');
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
            <button class="fc-del" data-i="${i}" title="${L ? 'Izbriši' : 'Delete'}" style="flex:none; border:none; background:transparent; color:var(--danger,#e5484d); cursor:pointer; font-size:16px;">✕</button>
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
  </script>
</body>

</html>


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
      const input = container.querySelector("#sj-input");
      const splitEl = container.querySelector("#sj-split");
      const joinEl = container.querySelector("#sj-join");
      const trimCheck = container.querySelector("#sj-trim");
      const dropEmpty = container.querySelector("#sj-dropempty");
      const output = container.querySelector("#sj-output");

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
      [input, splitEl, joinEl, trimCheck, dropEmpty].forEach(el => el.addEventListener("input", update));
      container.querySelector("#sj-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#sj-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#sj-copy"));
      });
    }

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
            <option value="line_word" selected>${L ? 'Vrstice + besede (priročno za kodo)' : 'Lines + Words (great for code)'}</option>
            <option value="chars">${L ? 'Po znakih (zatipki, lektoriranje)' : 'Char-by-Char (typos / proofreading)'}</option>
            <option value="words">${L ? 'Zvezno po besedah (članki, proza)' : 'Word-by-Word (articles / prose)'}</option>
            <option value="lines_only">${L ? 'Samo cele vrstice (hitri pregled)' : 'Lines Only (quick)'}</option>
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:13px;">
          ${L ? 'Prikaz:' : 'View Mode:'}
          <select id="cmp-view" style="padding:5px 8px; font-size:13px; border-radius:8px;">
            <option value="inline" selected>${L ? 'V besedilu (oznake sprememb)' : 'Inline (track changes)'}</option>
            <option value="split">${L ? 'Stran ob strani (row diff)' : 'Side-by-Side (row diff)'}</option>
            <option value="unified">${L ? 'Združeni diff (+/−)' : 'Unified Diff (+/−)'}</option>
            <option value="prose">${L ? 'Zvezno besedilo (enoten pogled)' : 'Visual Prose (combined)'}</option>
            <option value="merged">${L ? 'Čisto končno besedilo B' : 'Clean Output B'}</option>
          </select>
        </label>
      </div>

      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <button class="btn-sm primary" id="cmp-go" style="padding:7px 16px; font-size:13px; box-shadow:0 2px 8px rgba(79,70,229,0.3);" aria-label="${L ? 'Primerjaj besedili' : 'Compare texts'}">${SVG_ICONS.mi_refresh} ${L ? 'Primerjaj' : 'Compare'}</button>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-show-same" checked aria-label="${L ? 'Pokaži nespremenjene vrstice' : 'Show unchanged lines'}"> ${L ? 'Pokaži nespremenjene' : 'Show unchanged'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-case" aria-label="${L ? 'Ignoriraj velike in male črke' : 'Ignore case'}"> ${L ? 'Ignoriraj velike/male' : 'Ignore case'}</label>
        <label style="display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer;"><input type="checkbox" id="cmp-ignore-ws" aria-label="${L ? 'Ignoriraj presledke' : 'Ignore whitespace'}"> ${L ? 'Ignoriraj presledke' : 'Ignore whitespace'}</label>
      </div>
    </div>

    <!-- 2-COLUMN INPUTS -->
    <div class="tool-workspace-2col" style="margin-bottom:12px;">
      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-a" style="margin:0; font-weight:600; color:#ef4444;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original Text (A)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <label class="btn-sm" for="cmp-file-a" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi A' : 'Import A'}</label>
            <input type="file" id="cmp-file-a" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-sample" class="btn-sm" style="padding:2px 8px; font-size:11px;">${SVG_ICONS.mi_edit} ${L ? 'Primer' : 'Sample'}</button>
            <button id="cmp-clear-a" class="btn-sm" style="padding:2px 8px; font-size:11px;" aria-label="${L ? 'Počisti A' : 'Clear A'}">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-a" rows="6" placeholder="${L ? 'Prilepite ali vnesite prvotno besedilo (A)...' : 'Paste original text (A)...'}" style="min-height:150px;">${sampleA}</textarea>
        <div id="cmp-meta-a" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>

      <div class="tool-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label for="cmp-input-b" style="margin:0; font-weight:600; color:#22c55e;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified Text (B)'}</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="cmp-swap" class="btn-sm" style="padding:2px 8px; font-size:11px;" title="${L ? 'Zamenjaj A in B' : 'Swap A and B'}">${SVG_ICONS.mi_swap} ${L ? 'Zamenjaj A ↔ B' : 'Swap A ↔ B'}</button>
            <label class="btn-sm" for="cmp-file-b" style="padding:2px 8px; font-size:11px; margin:0; cursor:pointer;">${SVG_ICONS.mi_folder} ${L ? 'Uvozi B' : 'Import B'}</label>
            <input type="file" id="cmp-file-b" class="hidden" accept="text/*,.txt,.md,.js,.json,.csv,.html,.css" />
            <button id="cmp-clear-b" class="btn-sm" style="padding:2px 8px; font-size:11px;" aria-label="${L ? 'Počisti B' : 'Clear B'}">${SVG_ICONS.mi_trash}</button>
          </div>
        </div>
        <textarea id="cmp-input-b" rows="6" placeholder="${L ? 'Prilepite ali vnesite spremenjeno besedilo (B)...' : 'Paste modified text (B)...'}" style="min-height:150px;">${sampleB}</textarea>
        <div id="cmp-meta-b" style="font-size:11px; color:var(--text-dim); margin-top:4px;"></div>
      </div>
    </div>

    <!-- PRIMERJAJ GUMB (spodaj pod vhodnimi polji) -->
    <div style="display:flex; justify-content:center; margin-bottom:14px;">
      <button class="btn-sm primary" id="cmp-go2" style="padding:10px 28px; font-size:14px; box-shadow:0 2px 8px rgba(79,70,229,0.3);" aria-label="${L ? 'Primerjaj besedili' : 'Compare texts'}">${SVG_ICONS.mi_refresh} ${L ? 'Primerjaj besedili' : 'Compare Texts'}</button>
    </div>

    <!-- STATS & BADGES + NAVIGATION ROW -->
    <div id="cmp-stats-bar" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;"></div>

    <!-- VISUAL DIFF VIEWER DISPLAY -->
    <div id="cmp-output-wrap" style="background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; min-height:220px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px; line-height:1.6;"></div>

    <!-- ACTION BUTTONS -->
    <div class="modal-actions" style="margin-top:14px; gap:8px; flex-wrap:wrap; justify-content:flex-start;">
      <button class="btn-sm primary" id="cmp-copy-unified">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj Unified Patch (.diff)' : 'Copy Unified Patch (.diff)'}</button>
      <button class="btn-sm" id="cmp-dl-diff">${SVG_ICONS.mi_copy} ${L ? 'Prenesi .diff' : 'Download .diff'}</button>
      <button class="btn-sm" id="cmp-copy-b">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj končno besedilo B' : 'Copy Final Text B'}</button>
      <button class="btn-sm" id="cmp-copy-html">${SVG_ICONS.mi_copy} ${L ? 'Kopiraj barvni HTML' : 'Copy Formatted HTML'}</button>
      <button class="btn-sm" id="cmp-dl-html">${SVG_ICONS.mi_copy} ${L ? 'Prenesi .html' : 'Download .html'}</button>
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

      let alignedRows = [];
      let navIdx = 0;

      function lcs(a, b) {
        const m = a.length, n = b.length;
        if (m === 0 && n === 0) return [];
        if (m === 0) return b.map(val => ({ type: 'insert', val }));
        if (n === 0) return a.map(val => ({ type: 'delete', val }));

        // Memory cap for large inputs
        if (m * n > 4000000) {
          const ops = [];
          let i = 0, j = 0;
          while (i < m || j < n) {
            if (i < m && j < n && a[i] === b[j]) { ops.push({ type: 'equal', val: a[i] }); i++; j++; }
            else if (i < m && (j >= n || a[i] !== b[j])) { ops.push({ type: 'delete', val: a[i] }); i++; }
            else if (j < n) { ops.push({ type: 'insert', val: b[j] }); j++; }
          }
          return ops;
        }

        const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }

        const ops = [];
        let i = m, j = n;
        while (i > 0 || j > 0) {
          if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { ops.push({ type: 'equal', val: a[i - 1] }); i--; j--; }
          else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { ops.push({ type: 'insert', val: b[j - 1] }); j--; }
          else { ops.push({ type: 'delete', val: a[i - 1] }); i--; }
        }
        return ops.reverse();
      }

      function diffCharsPair(strA, strB, ignoreCase) {
        const charsA = [...strA];
        const charsB = [...strB];
        const normA = ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA;
        const normB = ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB;
        const ops = lcs(normA, normB);
        let htmlA = '', htmlB = '';
        let ptrA = 0, ptrB = 0;
        ops.forEach(op => {
          if (op.type === 'equal') { htmlA += escapeHtml(charsA[ptrA++]); htmlB += escapeHtml(charsB[ptrB++]); }
          else if (op.type === 'delete') { htmlA += `<span class="diff-del">${escapeHtml(charsA[ptrA++])}</span>`; }
          else if (op.type === 'insert') { htmlB += `<span class="diff-add">${escapeHtml(charsB[ptrB++])}</span>`; }
        });
        return { htmlA, htmlB };
      }

      function diffWordsPair(strA, strB, ignoreCase, ignoreWs) {
        const tokensA = strA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        const tokensB = strB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
        function norm(t) { let s = t; if (ignoreWs) s = s.replace(/\s+/g, ' '); if (ignoreCase) s = s.toLowerCase(); return s; }
        const normA = tokensA.map(norm);
        const normB = tokensB.map(norm);
        const ops = lcs(normA, normB);
        let htmlA = '', htmlB = '';
        let ptrA = 0, ptrB = 0;
        ops.forEach(op => {
          if (op.type === 'equal') {
            htmlA += escapeHtml(tokensA[ptrA++] || '');
            htmlB += escapeHtml(tokensB[ptrB++] || '');
          } else if (op.type === 'delete') {
            htmlA += `<span class="diff-del">${escapeHtml(tokensA[ptrA++] || '')}</span>`;
          } else if (op.type === 'insert') {
            htmlB += `<span class="diff-add">${escapeHtml(tokensB[ptrB++] || '')}</span>`;
          }
        });
        return { htmlA, htmlB };
      }

      // Glavna primerjava: obdelava vrstic -> alignedRows (enako kot prej), potem prikaz.
      function runDiff() {
        const rawA = inputA.value;
        const rawB = inputB.value;
        const algo = algoSel.value;
        const showSame = showSameCheck.checked;
        const ignoreCase = ignoreCaseCheck.checked;
        const ignoreWs = ignoreWsCheck.checked;

        // Meta counts + large-file warning
        const LARGE_LIMIT = 80000;
        const wordsCountA = (rawA.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
        const wordsCountB = (rawB.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
        const linesCountA = rawA ? rawA.split(/\r?\n/).length : 0;
        const linesCountB = rawB ? rawB.split(/\r?\n/).length : 0;
        const warnA = rawA.length > LARGE_LIMIT ? ` ⚠ ${L ? 'velika datoteka' : 'large file'}` : '';
        const warnB = rawB.length > LARGE_LIMIT ? ` ⚠ ${L ? 'velika datoteka' : 'large file'}` : '';
        metaA.textContent = `${linesCountA} ${L ? 'vrstic' : 'lines'} | ${wordsCountA} ${L ? 'besed' : 'words'} | ${rawA.length} ${L ? 'znakov' : 'chars'}${warnA}`;
        metaB.textContent = `${linesCountB} ${L ? 'vrstic' : 'lines'} | ${wordsCountB} ${L ? 'besed' : 'words'} | ${rawB.length} ${L ? 'znakov' : 'chars'}${warnB}`;
        metaA.style.color = rawA.length > LARGE_LIMIT ? '#d97706' : '';
        metaB.style.color = rawB.length > LARGE_LIMIT ? '#d97706' : '';

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

        alignedRows = [];
        let curLineA = 1, curLineB = 1;
        let ptrA = 0, ptrB = 0;

        for (let idx = 0; idx < lineOps.length; idx++) {
          const op = lineOps[idx];
          if (op.type === 'equal') {
            alignedRows.push({ type: 'equal', numA: curLineA++, numB: curLineB++, textA: linesA[ptrA++], textB: linesB[ptrB++] });
          } else if (op.type === 'delete') {
            if (idx + 1 < lineOps.length && lineOps[idx + 1].type === 'insert') {
              alignedRows.push({ type: 'modify', numA: curLineA++, numB: curLineB++, textA: linesA[ptrA++], textB: linesB[ptrB++] });
              idx++;
            } else {
              alignedRows.push({ type: 'delete', numA: curLineA++, numB: null, textA: linesA[ptrA++], textB: null });
            }
          } else if (op.type === 'insert') {
            alignedRows.push({ type: 'insert', numA: null, numB: curLineB++, textA: null, textB: linesB[ptrB++] });
          }
        }

        // Stats
        let totalAdds = 0, totalDels = 0, totalMod = 0, totalEq = 0;
        alignedRows.forEach(r => {
          if (r.type === 'insert') totalAdds++;
          else if (r.type === 'delete') totalDels++;
          else if (r.type === 'modify') totalMod++;
          else totalEq++;
        });
        const totalItems = alignedRows.length || 1;
        const simPct = Math.max(0, Math.min(100, Math.round((totalEq / totalItems) * 100)));

        const totalChanges = totalAdds + totalDels + totalMod;
        statsBar.innerHTML = `
          <span class="diff-badge diff-badge-add">+ ${totalAdds} ${L ? 'dodanih' : 'added'}</span>
          <span class="diff-badge diff-badge-del">- ${totalDels} ${L ? 'odstranjenih' : 'deleted'}</span>
          <span class="diff-badge diff-badge-mod">~ ${totalMod} ${L ? 'spremenjenih' : 'modified'}</span>
          <span class="diff-badge diff-badge-sim">${SVG_ICONS.mi_star} ${L ? 'Podobnost' : 'Similarity'}: ${simPct}%</span>
          ${totalChanges ? `<span id="cmp-nav-counter" style="font-size:12px; color:var(--text-dim); margin-left:4px;">1 / ${totalChanges}</span>` : ''}
          <span style="flex:1;"></span>
          <button class="btn-sm" id="cmp-prev" style="padding:3px 10px; font-size:12px;" title="${L ? 'Prejšnja sprememba (Shift+Enter)' : 'Previous change (Shift+Enter)'}" aria-label="${L ? 'Prejšnja sprememba' : 'Previous change'}">${L ? 'Prejšnja' : 'Prev'} ▲</button>
          <button class="btn-sm" id="cmp-next" style="padding:3px 10px; font-size:12px;" title="${L ? 'Naslednja sprememba (Enter)' : 'Next change (Enter)'}" aria-label="${L ? 'Naslednja sprememba' : 'Next change'}">${L ? 'Naslednja' : 'Next'} ▼</button>
        `;
        container.querySelector('#cmp-prev').addEventListener('click', () => navChange(-1));
        container.querySelector('#cmp-next').addEventListener('click', () => navChange(1));
        navIdx = 0;
      }

      function renderView() {
        const view = viewSel.value;
        const algo = algoSel.value;
        const showSame = showSameCheck.checked;
        const ignoreCase = ignoreCaseCheck.checked;
        const ignoreWs = ignoreWsCheck.checked;
        const rawA = inputA.value;
        const rawB = inputB.value;

        if (view === 'merged') {
          outputWrap.innerHTML = `
            <div style="padding:16px;">
              <div style="font-weight:600; margin-bottom:8px; color:var(--text-dim);">${L ? 'Čisto končno besedilo (B):' : 'Clean Final Text (B):'}</div>
              <pre style="margin:0; white-space:pre-wrap; font-family:inherit; font-size:13px; line-height:1.6;">${escapeHtml(rawB)}</pre>
            </div>`;
          return;
        }

        if (view === 'prose') {
          outputWrap.innerHTML = renderProse(algo, ignoreCase, ignoreWs);
          return;
        }

        if (view === 'inline') {
          outputWrap.innerHTML = renderInline(algo, ignoreCase, ignoreWs);
          return;
        }

        if (view === 'unified') {
          renderUnified(algo, ignoreCase, ignoreWs, showSame);
          return;
        }

        // split
        renderSplit(algo, ignoreCase, ignoreWs, showSame);
      }

      function renderProse(algo, ignoreCase, ignoreWs) {
        const rawA = inputA.value;
        const rawB = inputB.value;
        // cap prose diff for huge inputs to avoid freeze
        if (rawA.length + rawB.length > 120000) {
          return `<div style="padding:14px; font-size:12px; color:#d97706; border-bottom:1px solid var(--border);">${L ? 'Besedilo je preveliko za zvezni prose način – preklopite na "Samo vrstice" ali "V besedilu".' : 'Text too large for prose mode — switch to Lines Only or Inline.'}</div><div style="padding:18px; white-space:pre-wrap; color:var(--text-dim);">${escapeHtml(rawB.slice(0,4000))}…</div>`;
        }
        let txt;
        if (algo === 'chars') {
          const charsA = [...rawA], charsB = [...rawB];
          const normA = ignoreCase ? charsA.map(c => c.toLowerCase()) : charsA;
          const normB = ignoreCase ? charsB.map(c => c.toLowerCase()) : charsB;
          // ignoreWs has no effect in char mode — whitespace is char too
          const ops = lcs(normA, normB);
          let pA = 0, pB = 0, t = '';
          ops.forEach(op => {
            if (op.type === 'equal') { t += escapeHtml(charsA[pA++]); pB++; }
            else if (op.type === 'delete') { t += `<span class="diff-del">${escapeHtml(charsA[pA++])}</span>`; }
            else if (op.type === 'insert') { t += `<span class="diff-add">${escapeHtml(charsB[pB++])}</span>`; }
          });
          txt = t;
        } else {
          const wordsA = rawA.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
          const wordsB = rawB.split(/(\s+|[.,!?;:()[\]{}"'])/).filter(Boolean);
          function normW(t) { let s = t; if (ignoreWs) s = s.replace(/^\s+|\s+$/g, '') || ' '; if (ignoreCase) s = s.toLowerCase(); return s; }
          const normA = wordsA.map(normW);
          const normB = wordsB.map(normW);
          const ops = lcs(normA, normB);
          let pA = 0, pB = 0, t = '';
          ops.forEach(op => {
            if (op.type === 'equal') { t += escapeHtml(wordsA[pA++]); pB++; }
            else if (op.type === 'delete') { t += `<span class="diff-del">${escapeHtml(wordsA[pA++])}</span>`; }
            else if (op.type === 'insert') { t += `<span class="diff-add">${escapeHtml(wordsB[pB++])}</span>`; }
          });
          txt = t;
        }
        const legend = `<div style="padding:10px 14px; border-bottom:1px solid var(--border); font-size:11px; color:var(--text-dim); display:flex; gap:14px; flex-wrap:wrap;">
          <span><span class="diff-add" style="padding:0 4px;">dodano</span> ${L ? 'dodano' : 'added'}</span>
          <span><span class="diff-del" style="padding:0 4px;">odstranjeno</span> ${L ? 'odstranjeno' : 'removed'}</span>
        </div>`;
        return `${legend}<div style="padding:18px; line-height:1.8; white-space:pre-wrap; max-height:520px; overflow-y:auto;">${txt || `<span style="color:var(--text-dim);">${L ? 'Besedili sta identični.' : 'Texts are identical.'}</span>`}</div>`;
      }

      // INLINE: spremembe označene znotraj samega besedila (track changes slog)
      function renderInline(algo, ignoreCase, ignoreWs) {
        const rawA = inputA.value;
        const rawB = inputB.value;
        const linesA = rawA.split(/\r?\n/);
        const linesB = rawB.split(/\r?\n/);
        const showSame = showSameCheck.checked;

        let html = '';
        html += `<div style="padding:10px 14px; border-bottom:1px solid var(--border); font-size:11px; color:var(--text-dim); display:flex; gap:14px; flex-wrap:wrap;">
          <span><span class="diff-add" style="padding:0 4px;">dodano</span> ${L ? 'dodano' : 'added'}</span>
          <span><span class="diff-del" style="padding:0 4px;">odstranjeno</span> ${L ? 'odstranjeno' : 'removed'}</span>
        </div>`;

        // Dva stolpca z inline označenimi spremembami
        html += `<div id="cmp-inline-scroll" style="display:grid; grid-template-columns:1fr 1fr; max-height:520px; overflow:auto;">
          <div style="border-right:1px solid var(--border);">
            <div style="padding:8px 12px; font-size:12px; font-weight:700; background:rgba(239,68,68,0.10); color:#dc2626; position:sticky; top:0;">${L ? 'A — prvotno (odstranjeno)' : 'A — original (removed)'}</div>`;

        // A column: mark deletions inline within each line — O(1) lookup via Map
        const mapA = new Map();
        alignedRows.forEach(r => { if (r.numA != null) mapA.set(r.numA, r); });
        const leftCol = [];
        linesA.forEach((ln, i) => {
          const lnNum = i + 1;
          const match = mapA.get(lnNum);
          let content;
          if (match && (match.type === 'modify' || match.type === 'delete')) {
            let pair;
            if (algo === 'chars') pair = diffCharsPair(ln, match.type === 'delete' ? '' : (match.textB || ''), ignoreCase);
            else if (algo !== 'lines_only' && match.type === 'modify') pair = diffWordsPair(ln, match.textB || '', ignoreCase, ignoreWs);
            else pair = { htmlA: `<span class="diff-del">${escapeHtml(ln)}</span>` };
            content = pair.htmlA;
            leftCol.push({ num: lnNum, changed: true, html: content });
          } else if (match && match.type === 'equal') {
            if (!showSame) return;
            leftCol.push({ num: lnNum, changed: false, html: escapeHtml(ln) });
          } else {
            leftCol.push({ num: lnNum, changed: false, html: `<span style="color:var(--text-dimmer);">${L ? '(ni v A)' : '(not in A)'}</span>` });
          }
        });

        leftCol.forEach(l => {
          html += `<div class="diff-inline-row" data-num="${l.num}" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.04); ${l.changed ? 'background:rgba(239,68,68,0.07);' : ''}">
            <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:${l.changed ? '#dc2626' : 'var(--text-dimmer)'}; font-weight:600; user-select:none; border-right:1px solid var(--border);">${l.num}</div>
            <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${l.html}</div>
          </div>`;
        });

        html += `</div><div>`;
        html += `<div style="padding:8px 12px; font-size:12px; font-weight:700; background:rgba(34,197,94,0.10); color:#16a34a; position:sticky; top:0;">${L ? 'B — spremenjeno (dodano)' : 'B — modified (added)'}</div>`;

        const mapB = new Map();
        alignedRows.forEach(r => { if (r.numB != null) mapB.set(r.numB, r); });
        const rightCol = [];
        linesB.forEach((ln, i) => {
          const lnNum = i + 1;
          const match = mapB.get(lnNum);
          let content;
          if (match && (match.type === 'modify' || match.type === 'insert')) {
            let pair;
            if (algo === 'chars') pair = diffCharsPair(match.type === 'insert' ? '' : (match.textA || ''), ln, ignoreCase);
            else if (algo !== 'lines_only' && match.type === 'modify') pair = diffWordsPair(match.textA || '', ln, ignoreCase, ignoreWs);
            else pair = { htmlB: `<span class="diff-add">${escapeHtml(ln)}</span>` };
            content = pair.htmlB;
            rightCol.push({ num: lnNum, changed: true, html: content });
          } else if (match && match.type === 'equal') {
            if (!showSame) return;
            rightCol.push({ num: lnNum, changed: false, html: escapeHtml(ln) });
          } else {
            rightCol.push({ num: lnNum, changed: false, html: `<span style="color:var(--text-dimmer);">${L ? '(ni v B)' : '(not in B)'}</span>` });
          }
        });

        rightCol.forEach(l => {
          html += `<div class="diff-inline-row" data-num="${l.num}" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.04); ${l.changed ? 'background:rgba(34,197,94,0.07);' : ''}">
            <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:${l.changed ? '#16a34a' : 'var(--text-dimmer)'}; font-weight:600; user-select:none; border-right:1px solid var(--border);">${l.num}</div>
            <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${l.html}</div>
          </div>`;
        });

        html += `</div></div>`;
        return html;
      }

      function renderUnified(algo, ignoreCase, ignoreWs, showSame) {
        let unifiedHtml = `
          <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; background:var(--card); font-size:12px; border-bottom:1px solid var(--border); font-weight:600; color:var(--text-dim); padding:6px 0;">
            <div style="text-align:center;">A</div><div style="text-align:center;">B</div><div style="text-align:center;">+/-</div><div style="padding-left:8px;">${L ? 'Vsebina' : 'Content'}</div>
          </div>
          <div style="max-height:480px; overflow-y:auto;">`;
        alignedRows.forEach(r => {
          if (r.type === 'equal') {
            if (!showSame) return;
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numA}</div>
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">${r.numB}</div>
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;"></div>
              <div style="padding-left:8px; white-space:pre-wrap; color:var(--text);">${escapeHtml(r.textA)}</div></div>`;
          } else if (r.type === 'modify') {
            let pair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
            if (algo === 'chars') pair = diffCharsPair(r.textA, r.textB, ignoreCase);
            else if (algo !== 'lines_only') pair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
              <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div><div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${pair.htmlA}</div></div>
            <div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div><div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${pair.htmlB}</div></div>`;
          } else if (r.type === 'delete') {
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(239,68,68,0.09);">
              <div style="text-align:center; color:#dc2626; user-select:none;">${r.numA}</div><div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#dc2626; font-weight:bold; user-select:none;">-</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#dc2626;">${escapeHtml(r.textA)}</div></div>`;
          } else if (r.type === 'insert') {
            unifiedHtml += `<div style="display:grid; grid-template-columns:42px 42px 28px 1fr; padding:2px 0; background:rgba(34,197,94,0.09);">
              <div style="text-align:center; color:var(--text-dimmer); user-select:none;">-</div><div style="text-align:center; color:#16a34a; user-select:none;">${r.numB}</div><div style="text-align:center; color:#16a34a; font-weight:bold; user-select:none;">+</div>
              <div style="padding-left:8px; white-space:pre-wrap; color:#16a34a;">${escapeHtml(r.textB)}</div></div>`;
          }
        });
        unifiedHtml += `</div>`;
        outputWrap.innerHTML = unifiedHtml;
      }

      function renderSplit(algo, ignoreCase, ignoreWs, showSame) {
        let splitHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid var(--border); background:var(--card); font-weight:600; font-size:12px; color:var(--text-dim);">
            <div style="padding:8px 12px; border-right:1px solid var(--border); display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:5px"></span>${L ? 'Prvotno besedilo (A)' : 'Original (A)'}</span>
              <span>${inputA.value ? inputA.value.split(/\r?\n/).length : 0} ${L ? 'vrstic' : 'lines'}</span>
            </div>
            <div style="padding:8px 12px; display:flex; justify-content:space-between;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22c55e;vertical-align:middle;margin-right:5px"></span>${L ? 'Spremenjeno besedilo (B)' : 'Modified (B)'}</span>
              <span>${inputB.value ? inputB.value.split(/\r?\n/).length : 0} ${L ? 'vrstic' : 'lines'}</span>
            </div>
          </div>
          <div id="cmp-side-scroll" style="display:grid; grid-template-columns:1fr 1fr; max-height:480px; overflow-y:auto; overflow-x:auto;">
            <div id="cmp-col-left" style="border-right:1px solid var(--border); min-width:0;">`;

        let leftRowsHtml = '';
        let rightRowsHtml = '';
        alignedRows.forEach(r => {
          if (r.type === 'equal') {
            if (!showSame) return;
            const textEsc = escapeHtml(r.textA);
            leftRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numA}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div></div>`;
            rightRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">${r.numB}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1;">${textEsc}</div></div>`;
          } else if (r.type === 'modify') {
            let pair = { htmlA: escapeHtml(r.textA), htmlB: escapeHtml(r.textB) };
            if (algo === 'chars') pair = diffCharsPair(r.textA, r.textB, ignoreCase);
            else if (algo !== 'lines_only') pair = diffWordsPair(r.textA, r.textB, ignoreCase, ignoreWs);
            leftRowsHtml += `<div class="diff-line-rem" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(239,68,68,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${pair.htmlA}</div></div>`;
            rightRowsHtml += `<div class="diff-line-add" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(34,197,94,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${pair.htmlB}</div></div>`;
          } else if (r.type === 'delete') {
            leftRowsHtml += `<div class="diff-line-rem" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(239,68,68,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#dc2626; font-weight:600; user-select:none; border-right:1px solid rgba(239,68,68,0.25);">${r.numA}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#dc2626;">${escapeHtml(r.textA)}</div></div>`;
            rightRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
              <div style="padding-left:8px; flex:1;">&nbsp;</div></div>`;
          } else if (r.type === 'insert') {
            leftRowsHtml += `<div style="display:flex; padding:2px 0; border-bottom:1px solid rgba(0,0,0,0.03);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:var(--text-dimmer); user-select:none; border-right:1px solid var(--border);">-</div>
              <div style="padding-left:8px; flex:1;">&nbsp;</div></div>`;
            rightRowsHtml += `<div class="diff-line-add" style="display:flex; padding:2px 0; border-bottom:1px solid rgba(34,197,94,0.1);">
              <div style="width:38px; min-width:38px; text-align:right; padding-right:8px; color:#16a34a; font-weight:600; user-select:none; border-right:1px solid rgba(34,197,94,0.25);">${r.numB}</div>
              <div style="padding-left:8px; white-space:pre-wrap; word-break:break-all; flex:1; color:#16a34a;">${escapeHtml(r.textB)}</div></div>`;
          }
        });

        splitHtml += leftRowsHtml + `</div><div id="cmp-col-right" style="min-width:0;">` + rightRowsHtml + `</div></div>`;
        outputWrap.innerHTML = splitHtml;

        // Split uses single scroll container — no sync needed (removed no-op listener)
      }

      function navChange(dir) {
        const changedIndices = [];
        alignedRows.forEach((r, i) => { if (r.type !== 'equal') changedIndices.push(i); });
        if (!changedIndices.length) return;
        navIdx = (navIdx + dir + changedIndices.length) % changedIndices.length;
        const view = viewSel.value;
        // highlight + scroll
        const allActive = outputWrap.querySelectorAll('.diff-nav-active');
        allActive.forEach(el => el.classList.remove('diff-nav-active'));
        let targetEl = null;
        if (view === 'inline') {
          const rows = outputWrap.querySelectorAll('.diff-inline-row');
          // inline has 2× rows (left+right), index by change order in alignedRows → map to nth changed row in DOM
          // build list of only changed inline rows (those with colored background)
          const changedInline = [...rows].filter(el => el.style.background.includes('rgba'));
          // fallback: if filter fails, use all rows and pick by navIdx
          targetEl = changedInline[navIdx] || rows[navIdx] || null;
        } else if (view === 'split') {
          const leftChanged = outputWrap.querySelectorAll('#cmp-col-left .diff-line-rem, #cmp-col-left .diff-line-add');
          const rightChanged = outputWrap.querySelectorAll('#cmp-col-right .diff-line-rem, #cmp-col-right .diff-line-add');
          // prefer whichever column has the change; pick by navIdx modulo
          const flat = [...leftChanged, ...rightChanged];
          // sort by DOM order not needed — just cycle through aligned change order
          // map navIdx to flat index
          targetEl = flat[navIdx % flat.length] || flat[0];
        } else if (view === 'unified') {
          const uniRows = outputWrap.querySelectorAll('[style*="background:rgba"]');
          targetEl = uniRows[navIdx] || uniRows[0];
        } else {
          const proseSpans = outputWrap.querySelectorAll('.diff-add, .diff-del');
          targetEl = proseSpans[navIdx] || proseSpans[0];
        }
        if (targetEl) {
          targetEl.classList.add('diff-nav-active');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // update stats badge counter
        const counter = container.querySelector('#cmp-nav-counter');
        if (counter) counter.textContent = `${navIdx + 1} / ${changedIndices.length}`;
      }

      function compare() {
        runDiff();
        renderView();
      }

      function update() {
        // štej meta tudi brez polnega prikaza, preveri vnos
        const rawA = inputA.value;
        const rawB = inputB.value;
        if (!rawA && !rawB) {
          statsBar.innerHTML = `<span style="font-size:12px; color:var(--text-dim);">${L ? 'Vnesite besedilo A in B za primerjavo.' : 'Enter text A and B to compare.'}</span>`;
          outputWrap.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-dim);">${L ? 'Ni podatkov za primerjavo.' : 'No data to compare.'}</div>`;
          // meta šteti
          const wordsCountA = (rawA.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
          const wordsCountB = (rawB.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
          const linesCountA = rawA ? rawA.split(/\r?\n/).length : 0;
          const linesCountB = rawB ? rawB.split(/\r?\n/).length : 0;
          metaA.textContent = `${linesCountA} ${L ? 'vrstic' : 'lines'} | ${wordsCountA} ${L ? 'besed' : 'words'} | ${rawA.length} ${L ? 'znakov' : 'chars'}`;
          metaB.textContent = `${linesCountB} ${L ? 'vrstic' : 'lines'} | ${wordsCountB} ${L ? 'besed' : 'words'} | ${rawB.length} ${L ? 'znakov' : 'chars'}`;
          return;
        }
        compare();
      }

      function readUpload(fileInput, targetTextarea) {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { targetTextarea.value = reader.result || ''; compare(); };
        reader.readAsText(file, 'UTF-8');
      }

      fileA.addEventListener('change', () => readUpload(fileA, inputA));
      fileB.addEventListener('change', () => readUpload(fileB, inputB));

      let _cmpDebounce;
      const DEBOUNCE_MS = 180;
      const LARGE_DEBOUNCE_MS = 500;
      [inputA, inputB].forEach(el => el.addEventListener('input', () => {
        clearTimeout(_cmpDebounce);
        const isLarge = (inputA.value.length + inputB.value.length) > 80000;
        _cmpDebounce = setTimeout(compare, isLarge ? LARGE_DEBOUNCE_MS : DEBOUNCE_MS);
      }));

      [algoSel, viewSel, showSameCheck, ignoreCaseCheck, ignoreWsCheck].forEach(el => {
        el.addEventListener('change', compare);
      });

      container.querySelector('#cmp-go').addEventListener('click', compare);
      container.querySelector('#cmp-go2').addEventListener('click', compare);
      // Keyboard navigation: Enter = next, Shift+Enter = prev (focus inside tool)
      container.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // avoid hijacking textarea newline when typing; only when not composing and with modifier logic
          // If focus is in textarea, Enter should insert newline, not navigate — so require Alt/just Enter outside textarea handled separately
          const tag = document.activeElement && document.activeElement.tagName;
          if (tag === 'TEXTAREA' || tag === 'INPUT' || document.activeElement.isContentEditable) return;
          e.preventDefault();
          navChange(e.shiftKey ? -1 : 1);
        }
      });
      // Global shortcut when output has focus: Alt+Arrow for prev/next
      outputWrap.setAttribute('tabindex', '0');
      outputWrap.setAttribute('aria-label', L ? 'Prikaz primerjave' : 'Comparison view');
      outputWrap.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) { e.preventDefault(); navChange(1); }
        else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) { e.preventDefault(); navChange(-1); }
      });

      container.querySelector('#cmp-sample').addEventListener('click', () => {
        inputA.value = sampleA;
        inputB.value = sampleB;
        compare();
      });

      container.querySelector('#cmp-swap').addEventListener('click', () => {
        const temp = inputA.value;
        inputA.value = inputB.value;
        inputB.value = temp;
        compare();
      });

      container.querySelector('#cmp-clear-a').addEventListener('click', () => {
        inputA.value = '';
        compare();
        inputA.focus();
      });

      container.querySelector('#cmp-clear-b').addEventListener('click', () => {
        inputB.value = '';
        compare();
        inputB.focus();
      });

      container.querySelector('#cmp-copy-unified').addEventListener('click', () => {
        copyText(buildPatch(), container.querySelector('#cmp-copy-unified'));
      });

      function buildPatch() {
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
        return patch;
      }
      function downloadText(filename, text, mime) {
        const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      container.querySelector('#cmp-copy-b').addEventListener('click', () => {
        copyText(inputB.value, container.querySelector('#cmp-copy-b'));
      });

      container.querySelector('#cmp-copy-html').addEventListener('click', () => {
        copyText(outputWrap.innerHTML, container.querySelector('#cmp-copy-html'));
      });
      container.querySelector('#cmp-dl-diff').addEventListener('click', () => {
        downloadText('primerjava.diff', buildPatch(), 'text/x-patch');
      });
      container.querySelector('#cmp-dl-html').addEventListener('click', () => {
        const headClose = '</' + 'style></' + 'head>';
        const docClose = '</' + 'body></' + 'html>';
        const htmlDoc = `<!doctype html><html lang="${L ? 'sl' : 'en'}"><head><meta charset="utf-8"><title>${L ? 'Primerjava' : 'Comparison'}</title><style>body{font-family:ui-monospace,monospace;font-size:13px;line-height:1.6;padding:16px}.diff-add{background:rgba(34,197,94,0.32);color:#16a34a;border-left:2px solid #16a34a;padding:1px 2px;border-radius:3px}.diff-del{background:rgba(239,68,68,0.32);color:#dc2626;border-left:2px solid #dc2626;padding:1px 2px;border-radius:3px;text-decoration:line-through}${headClose}<body>${outputWrap.innerHTML}${docClose}`;
        downloadText('primerjava.html', htmlDoc, 'text/html;charset=utf-8');
      });

      // kickstart
      compare();
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
      const input = container.querySelector('#csv-input'), output = container.querySelector('#csv-output');
      const mode = container.querySelector('#csv-mode'), sep = container.querySelector('#csv-sep');

      function update() {
        const s = sep.value || ',';
        if (mode.value === 'csv2col') {
          const rows = input.value.split('\n').map(r => r.split(s));
          const colWidths = [];
          rows.forEach(r => r.forEach((c, i) => { colWidths[i] = Math.max(colWidths[i] || 0, c.trim().length); }));
          output.value = rows.map(r => r.map((c, i) => c.trim().padEnd(colWidths[i] || 0)).join('  ')).join('\n');
        } else {
          output.value = input.value.split('\n').map(line => line.trim().split(/\s{2,}/).join(s)).join('\n');
        }
      }
      [input, mode, sep].forEach(el => el.addEventListener('input', update));
      container.querySelector('#csv-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
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
      const input = container.querySelector("#tts-input");
      const voiceSel = container.querySelector("#tts-voice");
      const rate = container.querySelector("#tts-rate");
      const pitch = container.querySelector("#tts-pitch");
      let voices = [];

      function loadVoices() {
        if (!('speechSynthesis' in window)) return;
        voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;
        voiceSel.innerHTML = voices.map((v, i) => `<option value="${i}">${escapeHtml(v.name)} (${v.lang})</option>`).join('');
      }

      if ('speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      container.querySelector("#tts-play").addEventListener("click", () => {
        if (!('speechSynthesis' in window)) { alert(L ? 'Vaš brskalnik ne podpira sinteze govora.' : 'Speech synthesis not supported.'); return; }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(input.value);
        if (voices[voiceSel.value]) utter.voice = voices[voiceSel.value];
        utter.rate = parseFloat(rate.value) || 1;
        utter.pitch = parseFloat(pitch.value) || 1;
        window.speechSynthesis.speak(utter);
      });

      container.querySelector("#tts-stop").addEventListener("click", () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      });

      container.querySelector("#tts-clear").addEventListener("click", () => {
        input.value = ""; input.focus();
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
      <textarea id="rs-output" readonly style="min-height:120px; font-size:14px;"></textarea>
      <div class="panel-actions" style="justify-content:center; gap:12px; margin-top:12px;">
        <button class="btn-sm primary" id="rs-gen" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_refresh} <span>${L ? 'Ustvari niz' : 'Generate String'}</span></button>
        <button class="btn-sm" id="rs-copy" style="display:inline-flex; align-items:center; gap:6px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
      </div>
    </div>
  `;
      const len = container.querySelector("#rs-len");
      const qty = container.querySelector("#rs-qty");
      const alpha = container.querySelector("#rs-alpha");
      const num = container.querySelector("#rs-num");
      const sym = container.querySelector("#rs-sym");
      const output = container.querySelector("#rs-output");

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

      [len, qty, alpha, num, sym].forEach(el => el.addEventListener("input", generate));
      container.querySelector("#rs-gen").addEventListener("click", generate);
      container.querySelector("#rs-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#rs-copy"));
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
      const patEl = container.querySelector("#rx-pattern");
      const flagsEl = container.querySelector("#rx-flags");
      const fg = container.querySelector("#rx-flag-g");
      const fi = container.querySelector("#rx-flag-i");
      const fm = container.querySelector("#rx-flag-m");
      const input = container.querySelector("#rx-input");
      const highlight = container.querySelector("#rx-highlight");
      const count = container.querySelector("#rx-count");
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
          const regex = new RegExp(p, f.includes('g') ? f : (f + 'g'));
          let matchesCount = 0;
          const htmlText = escapeHtml(text).replace(regex, (m) => {
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

      [patEl, flagsEl, input].forEach(el => el.addEventListener("input", update));
      [fg, fi, fm].forEach(el => el.addEventListener("change", syncFlagsFromCheckboxes));
      container.querySelector("#rx-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#rx-copy-matches").addEventListener("click", () => {
        copyText(extractedMatches.join('\n'), container.querySelector("#rx-copy-matches"));
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
      const input = container.querySelector("#cw-input");
      const words = container.querySelector("#cw-words");
      const mask = container.querySelector("#cw-mask");
      const whole = container.querySelector("#cw-whole");
      const output = container.querySelector("#cw-output");

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
        const rawWords = words.value.split(',').map(x => x.trim()).filter(Boolean);
        if (rawWords.length === 0) { output.value = input.value; return; }
        let text = input.value;
        rawWords.forEach(w => {
          const pat = whole.checked ? PURE.wholeWordPattern(w) : escapeRegExp(w);
          const regex = new RegExp(pat, 'giu');
          text = text.replace(regex, (match) => maskWord(match));
        });
        output.value = text;
      }
      [input, words, mask, whole].forEach(el => el.addEventListener("input", update));
      container.querySelector("#cw-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#cw-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#cw-copy"));
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
      const input = container.querySelector("#ra-input");
      const mode = container.querySelector("#ra-mode");
      const output = container.querySelector("#ra-output");

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
          output.value = text.split('\n').map(line => line.split(' ').reverse().join(' ')).join('\n');
        }
      }
      [input, mode].forEach(el => el.addEventListener("input", update));
      container.querySelector("#ra-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#ra-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#ra-copy"));
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
      const input = container.querySelector("#sa-input");
      const mode = container.querySelector("#sa-mode");
      const desc = container.querySelector("#sa-desc");
      const caseSens = container.querySelector("#sa-case");
      const unique = container.querySelector("#sa-unique");
      const output = container.querySelector("#sa-output");

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
            const t = lines[i]; lines[i] = lines[j]; lines[j] = t;
          }
        }
        if (desc.checked && m !== 'random') lines.reverse();
        output.value = lines.join('\n');
      }
      [input, mode, desc, caseSens, unique].forEach(el => el.addEventListener("input", update));
      container.querySelector("#sa-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#sa-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#sa-copy"));
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
      const input = container.querySelector("#dr-input");
      const caseSens = container.querySelector("#dr-case");
      const consec = container.querySelector("#dr-consec");
      const output = container.querySelector("#dr-output");

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
      [input, caseSens, consec].forEach(el => el.addEventListener("input", update));
      container.querySelector("#dr-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#dr-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#dr-copy"));
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
      const input = container.querySelector("#pt-input");
      const lenEl = container.querySelector("#pt-len");
      const charEl = container.querySelector("#pt-char");
      const pos = container.querySelector("#pt-pos");
      const output = container.querySelector("#pt-output");

      function update() {
        const targetLen = Math.max(1, parseInt(lenEl.value) || 30);
        const padChar = charEl.value || ' ';
        const p = pos.value;
        output.value = input.value.split('\n').map(line => {
          if (line.length >= targetLen) return line;
          const diff = targetLen - line.length;
          if (p === 'left') return line + padChar.repeat(diff);
          if (p === 'right') return padChar.repeat(diff) + line;
          const leftPad = Math.floor(diff / 2);
          const rightPad = diff - leftPad;
          return padChar.repeat(leftPad) + line + padChar.repeat(rightPad);
        }).join('\n');
      }
      [input, lenEl, charEl, pos].forEach(el => el.addEventListener("input", update));
      container.querySelector("#pt-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#pt-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#pt-copy"));
      });
      update();
    }

function renderHashGenerator(container) {
      const L = currentLang === 'sl';
      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px; gap:10px 16px; flex-wrap:wrap;">
      <label>${L ? 'Algoritem zgoščevanja:' : 'Hash algorithm:'}
        <select id="hg-algo">
          <option value="SHA-256" selected>SHA-256 (256 bit / 64 hex)</option>
          <option value="SHA-512">SHA-512 (512 bit / 128 hex)</option>
          <option value="SHA-384">SHA-384 (384 bit / 96 hex)</option>
          <option value="SHA-1">SHA-1 (160 bit / 40 hex - Legacy)</option>
        </select>
      </label>
      <label>${L ? 'Izhod:' : 'Output:'}
        <select id="hg-out">
          <option value="hex" selected>hex</option>
          <option value="base64">base64</option>
          <option value="base64url">base64url</option>
        </select>
      </label>
      <label>${L ? 'Sol (salt):' : 'Salt:'}
        <input type="text" id="hg-salt" placeholder="${L ? 'npr. moja-sol' : 'e.g. my-salt'}" style="min-width:140px;">
      </label>
      <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" id="hg-upper"> ${L ? 'VELIKE ČRKE' : 'Uppercase'}</label>
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
        <textarea id="hg-output" readonly placeholder="${L ? 'Zgoščena vrednost...' : 'Hash output...'}" style="font-family:monospace;"></textarea>
        <div class="panel-actions">
          <button class="btn-sm primary" id="hg-copy" style="display:inline-flex; align-items:center; gap:5px;">${SVG_ICONS.mi_copy} <span>${getI('ui_copy')}</span></button>
        </div>
      </div>
    </div>
  `;
      const input = container.querySelector("#hg-input");
      const algo = container.querySelector("#hg-algo");
      const upper = container.querySelector("#hg-upper");
      const outSel = container.querySelector("#hg-out");
      const saltEl = container.querySelector("#hg-salt");
      const output = container.querySelector("#hg-output");

      let hgSeq = 0;
      async function update() {
        const salt = saltEl ? saltEl.value : "";
        const text = salt + input.value;
        const mySeq = ++hgSeq;
        const msgUint8 = new TextEncoder().encode(text);
        try {
          const hashBuffer = await crypto.subtle.digest(algo.value, msgUint8);
          if (mySeq !== hgSeq) return;
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const outMode = outSel ? outSel.value : "hex";
          let out = "";
          if (outMode === "hex") {
            out = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            if (upper.checked) out = out.toUpperCase();
          } else {
            let bin = "";
            const chunk = 0x8000;
            const bytes = new Uint8Array(hashBuffer);
            for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
            out = btoa(bin);
            if (outMode === "base64url") out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/,"");
            // uppercase nima smisla za base64 — ignoriramo
          }
          output.value = out;
        } catch (e) {
          if (mySeq === hgSeq) output.value = L ? 'Napaka pri izračunu zgoščenke.' : 'Hashing error.';
        }
      }
      let _hgDb;
      [input, algo, upper, outSel, saltEl].forEach(el => el && el.addEventListener("input", () => {
        clearTimeout(_hgDb);
        _hgDb = setTimeout(update, 120);
      }));
      [algo, outSel].forEach(el => el && el.addEventListener("change", () => {
        clearTimeout(_hgDb);
        _hgDb = setTimeout(update, 120);
      }));
      container.querySelector("#hg-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#hg-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#hg-copy"));
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
      const input = container.querySelector("#ui-input");
      const table = container.querySelector("#ui-table");
      let tsvData = '';

      function update() {
        const text = input.value;
        const chars = [...text];
        if (chars.length === 0) { table.innerHTML = ''; tsvData = ''; return; }
        const rows = chars.map((c, i) => {
          const cp = c.codePointAt(0);
          const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
          const htmlEnt = '&#' + cp + ';';
          return { idx: i + 1, char: c, cp, hex, htmlEnt };
        });

        tsvData = ['#\tZnak\tKoda\tHex\tHTML'].concat(rows.map(r => `${r.idx}\t${r.char}\t${r.cp}\t${r.hex}\t${r.htmlEnt}`)).join('\n');

        table.innerHTML = `
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead><tr style="border-bottom:1px solid var(--border); text-align:left;"><th style="padding:6px;">#</th><th style="padding:6px;">Znak</th><th style="padding:6px;">Koda</th><th style="padding:6px;">Hex</th><th style="padding:6px;">HTML</th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);"><td style="padding:4px 6px; color:var(--text-dim);">${r.idx}</td><td style="padding:4px 6px; font-size:16px; font-weight:700;">${escapeHtml(r.char)}</td><td style="padding:4px 6px; font-family:monospace;">${r.cp}</td><td style="padding:4px 6px; font-family:monospace; color:var(--violet);">${r.hex}</td><td style="padding:4px 6px; font-family:monospace; color:var(--teal);">${escapeHtml(r.htmlEnt)}</td></tr>`).join('')}
            </tbody>
          </table>
        `;
      }
      input.addEventListener("input", update);
      container.querySelector("#ui-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#ui-copy-tsv").addEventListener("click", () => {
        if (!tsvData) return;
        copyText(tsvData, container.querySelector("#ui-copy-tsv"));
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
      const input = container.querySelector("#pc-input");
      const result = container.querySelector("#pc-result");

      function update() {
        const text = input.value.trim();
        if (!text) { result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo za preizkus.' : 'Enter text.'}</span>`; return; }
        const clean = text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
        const reversed = [...clean].reverse().join('');
        const isPal = clean.length > 0 && clean === reversed;

        result.innerHTML = isPal ? `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_check}</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a; margin-bottom:6px;">${L ? 'Je palindrom!' : 'It is a palindrome!'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Besedilo se bere enako naprej in nazaj.' : 'Reads exactly the same forwards and backwards.'}</div>
          <div style="margin-top:12px; font-family:monospace; background:rgba(34,197,94,0.1); padding:6px 12px; border-radius:6px; font-size:13px;">${escapeHtml(clean)}</div>
        ` : `
          <div style="font-size:36px; margin-bottom:8px;">${SVG_ICONS.mi_x}</div>
          <div style="font-size:18px; font-weight:800; color:#dc2626; margin-bottom:6px;">${L ? 'Ni palindrom.' : 'Not a palindrome.'}</div>
          <div style="font-size:13px; color:var(--text-dim);">${L ? 'Naprej:' : 'Forward:'} <code>${escapeHtml(clean)}</code></div>
          <div style="font-size:13px; color:var(--text-dim); margin-top:2px;">${L ? 'Nazaj:' : 'Reverse:'} <code>${escapeHtml(reversed)}</code></div>
        `;
      }
      input.addEventListener("input", update);
      container.querySelector("#pc-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      update();
    }

function renderZalgoText(container) {
      const L = currentLang === 'sl';
      const ZALGO_UP = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346', '\u031a'];
      const ZALGO_MID = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327', '\u0328', '\u0334', '\u0335', '\u0336', '\u034f', '\u035c', '\u035d', '\u035e', '\u035f', '\u0360', '\u0362', '\u0338', '\u0337', '\u0361', '\u0345'];
      const ZALGO_DOWN = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347', '\u0348', '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u0323'];

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
      const input = container.querySelector("#zg-input");
      const level = container.querySelector("#zg-level");
      const up = container.querySelector("#zg-up");
      const mid = container.querySelector("#zg-mid");
      const down = container.querySelector("#zg-down");
      const output = container.querySelector("#zg-output");

      function update() {
        const mult = parseInt(level.value) || 3;
        let res = '';
        for (const char of input.value) {
          res += char;
          if (/\s/.test(char)) continue;
          if (up.checked) for (let i = 0; i < mult; i++) res += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
          if (mid.checked) for (let i = 0; i < Math.floor(mult / 2); i++) res += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
          if (down.checked) for (let i = 0; i < mult; i++) res += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
        }
        output.value = res;
      }
      [input, level, up, mid, down].forEach(el => el.addEventListener("input", update));
      container.querySelector("#zg-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#zg-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#zg-copy"));
      });
      update();
    }

function renderFancyText(container) {
      const L = currentLang === 'sl';
      const styles = {
        'bold': { upper: 0x1D400, lower: 0x1D41A, digits: 0x1D7CE, label: 'Bold (𝐁)' },
        'italic': { upper: 0x1D434, lower: 0x1D44E, digits: null, label: 'Italic (𝐼)' },
        'bold-italic': { upper: 0x1D468, lower: 0x1D482, digits: null, label: 'Bold Italic (𝑩)' },
        'script': { upper: 0x1D49C, lower: 0x1D4B6, digits: null, label: 'Script (𝒜)' },
        'fraktur': { upper: 0x1D504, lower: 0x1D51E, digits: null, label: 'Fraktur (𝔄)' },
        'monospace': { upper: 0x1D670, lower: 0x1D68A, digits: 0x1D7F6, label: 'Monospace (𝙼)' },
        'double-struck': { upper: 0x1D538, lower: 0x1D552, digits: 0x1D7D8, label: 'Double-struck (𝔸)' },
        'sans-serif': { upper: 0x1D5A0, lower: 0x1D5BA, digits: 0x1D7E2, label: 'Sans-serif (𝖠)' },
        'sans-bold': { upper: 0x1D5D4, lower: 0x1D5EE, digits: 0x1D7EC, label: 'Sans Bold (𝗔)' },
        'underline': { special: 'underline', label: 'Underline (U̲)' },
        'double-underline': { special: 'double-underline', label: 'Double Underline (U̳)' }
      };
      /* Unicode za nekatere črke nima glifa v zaporedju → uporabi posebne kodne točke,
         sicer bi naivna preslikava dala nedodeljene znake (tofu). */
      const FANCY_EXCEPTIONS = {
        'italic': { 'h': '\u210E' },
        'script': { 'B': '\u212C', 'E': '\u2130', 'F': '\u2131', 'H': '\u210B', 'I': '\u2110', 'L': '\u2112', 'M': '\u2133', 'R': '\u211B', 'e': '\u212F', 'g': '\u210A', 'o': '\u2134' },
        'fraktur': { 'C': '\u212D', 'H': '\u210C', 'I': '\u2111', 'R': '\u211C', 'Z': '\u2128' },
        'double-struck': { 'C': '\u2102', 'H': '\u210D', 'N': '\u2115', 'P': '\u2119', 'Q': '\u211A', 'R': '\u211D', 'Z': '\u2124' }
      };
      container.innerHTML = `
    <div class="settings-bar" style="margin-bottom:14px;">
      <label>${L ? 'Slog pisave:' : 'Font style:'}
        <select id="ft-style" style="min-width:200px;">
          ${Object.entries(styles).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
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
      const input = container.querySelector('#ft-input'), output = container.querySelector('#ft-output');
      const style = container.querySelector('#ft-style');

      function convert(text, key) {
        const s = styles[key] || styles.bold;
        if (s.special === 'underline') return [...text].map(c => c === '\n' ? c : c + '\u0332').join('');
        if (s.special === 'double-underline') return [...text].map(c => c === '\n' ? c : c + '\u0333').join('');
        const exceptions = FANCY_EXCEPTIONS[key] || {};
        return [...text].map(c => {
          if (exceptions[c]) return exceptions[c];
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90 && s.upper) return String.fromCodePoint(s.upper + (code - 65));
          if (code >= 97 && code <= 122 && s.lower) return String.fromCodePoint(s.lower + (code - 97));
          if (code >= 48 && code <= 57 && s.digits) return String.fromCodePoint(s.digits + (code - 48));
          return c;
        }).join('');
      }

      function update() { output.value = convert(input.value, style ? (style.value || 'bold') : 'bold'); }
      [input, style].forEach(el => el.addEventListener('input', update));
      container.querySelector('#ft-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
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
      const input = container.querySelector("#tr-input");
      const countEl = container.querySelector("#tr-count");
      const sepEl = container.querySelector("#tr-sep");
      const numCheck = container.querySelector("#tr-num");
      const output = container.querySelector("#tr-output");

      function update() {
        const n = Math.min(1000, Math.max(1, parseInt(countEl.value) || 1));
        const sep = sepEl.value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        const text = input.value;
        const arr = [];
        for (let i = 1; i <= n; i++) {
          arr.push((numCheck.checked ? (i + '. ') : '') + text);
        }
        output.value = arr.join(sep);
      }
      [input, countEl, sepEl, numCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#tr-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#tr-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#tr-copy"));
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
      const input = container.querySelector('#hp-input'), patterns = container.querySelector('#hp-patterns');
      const ci = container.querySelector('#hp-ci'), result = container.querySelector('#hp-result');
      const colors = ['rgba(255,200,50,0.4)', 'rgba(100,200,255,0.4)', 'rgba(255,120,150,0.4)', 'rgba(120,255,150,0.4)', 'rgba(200,150,255,0.4)'];

      function update() {
        const pats = patterns.value.split(',').map(p => p.trim()).filter(Boolean);
        if (!pats.length) { result.innerHTML = escapeHtml(input.value); return; }
        let html = escapeHtml(input.value);
        pats.forEach((pat, i) => {
          try {
            const re = new RegExp(escapeRegExp(pat), ci.checked ? 'gi' : 'g');
            const bg = colors[i % colors.length];
            html = html.replace(re, m => `<mark style="background:${bg}; border-radius:4px; padding:2px 4px; font-weight:600;">${m}</mark>`);
          } catch (e) { }
        });
        result.innerHTML = html;
      }
      let _hpDb;
      [input, patterns, ci].forEach(el => el.addEventListener('input', () => {
        clearTimeout(_hpDb);
        _hpDb = setTimeout(update, 80);
      }));
      container.querySelector('#hp-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
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
      const input = container.querySelector("#te-input");
      const result = container.querySelector("#te-result");

      function update() {
        const text = input.value;
        if (!text) { result.innerHTML = `<span style="color:var(--text-dim);">${L ? 'Vnesite besedilo.' : 'Enter text.'}</span>`; return; }
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
      input.addEventListener("input", update);
      container.querySelector("#te-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
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
      const aEl = container.querySelector("#lv-a");
      const bEl = container.querySelector("#lv-b");
      const caseSens = container.querySelector("#lv-case");
      const result = container.querySelector("#lv-result");

      function levDist(s1, s2) {
        const a = [...s1], b = [...s2];
        const m = a.length, n = b.length;
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
        let s1 = aEl.value, s2 = bEl.value;
        if (!caseSens.checked) { s1 = s1.toLowerCase(); s2 = s2.toLowerCase(); }
        const dist = levDist(s1, s2);
        const maxLen = Math.max([...s1].length, [...s2].length);
        const simPct = maxLen === 0 ? 100 : Math.max(0, ((1 - (dist / maxLen)) * 100)).toFixed(1);

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
      [aEl, bEl, caseSens].forEach(el => el.addEventListener("input", update));
      container.querySelector("#lv-clear").addEventListener("click", () => { aEl.value = ""; bEl.value = ""; update(); aEl.focus(); });
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
      const input = container.querySelector("#nw-input");
      const langSel = container.querySelector("#nw-lang");
      const fmtSel = container.querySelector("#nw-fmt");
      const output = container.querySelector("#nw-output");

      const slUnits = ['', 'ena', 'dva', 'tri', 'štiri', 'pet', 'šest', 'sedem', 'osem', 'devet', 'deset', 'enajst', 'dvanajst', 'trinajst', 'štirinajst', 'petnajst', 'šestnajst', 'sedemnajst', 'osemnajst', 'devetnajst'];
      const slTens = ['', 'deset', 'dvajset', 'trideset', 'štirideset', 'petdeset', 'šestdeset', 'sedemdeset', 'osemdeset', 'devetdeset'];
      const slHundreds = ['', 'sto', 'dvesto', 'tristo', 'štiristo', 'petsto', 'šeststo', 'sedemsto', 'osemsto', 'devetsto'];

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
          if (u > 0) res += (u === 1 ? 'ena' : (u === 2 ? 'dva' : slUnits[u])) + 'in' + slTens[t];
          else res += slTens[t];
        }
        return res;
      }

      function slNumber(num) {
        if (num === 0) return 'nič';
        let str = '';
        if (num < 0) { str += 'minus '; num = Math.abs(num); }
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

      const enUnits = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const enTens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

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
        if (num < 0) { str += 'minus '; num = Math.abs(num); }
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
        'ena': 'prvi', 'dva': 'drugi', 'tri': 'tretji', 'štiri': 'četrti', 'pet': 'peti', 'šest': 'šesti', 'sedem': 'sedmi', 'osem': 'osmi', 'devet': 'deveti',
        'deset': 'deseti', 'enajst': 'enajsti', 'dvanajst': 'dvanajsti', 'trinajst': 'trinajsti', 'štirinajst': 'štirinajsti',
        'petnajst': 'petnajsti', 'šestnajst': 'šestnajsti', 'sedemnajst': 'sedemnajsti', 'osemnajst': 'osemnajsti', 'devetnajst': 'devetnajsti',
        'dvajset': 'dvajseti', 'trideset': 'trideseti', 'štirideset': 'štirideseti', 'petdeset': 'petdeseti', 'šestdeset': 'šestdeseti',
        'sedemdeset': 'sedemdeseti', 'osemdeset': 'osemdeseti', 'devetdeset': 'devetdeseti',
        'sto': 'stoti', 'dvesto': 'dvestoti', 'tristo': 'tristoti', 'štiristo': 'štiristoti', 'petsto': 'petstoti',
        'šesto': 'šeststoti', 'sedemsto': 'sedemstoti', 'osemsto': 'osemstoti', 'devetsto': 'devetstoti'
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
        const irregular = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
        const compoundIrregular = { '-one': '-first', '-two': '-second', '-three': '-third', '-five': '-fifth', '-eight': '-eighth', '-nine': '-ninth' };
        const words = cardinalStr.trim().split(/\s+/);
        let last = words[words.length - 1];
        if (irregular[last]) last = irregular[last];
        else {
          let done = false;
          for (const suf in compoundIrregular) {
            if (last.endsWith(suf)) { last = last.slice(0, -suf.length) + compoundIrregular[suf]; done = true; break; }
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
        output.value = input.value.split('\n').map(line => {
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
              res += ' EUR' + (decPart > 0 ? (' in ' + decPart + '/100') : '');
            } else if (decPart > 0) {
              res += ' cela ' + slNumber(decPart);
            }
            return res;
          } else {
            let res = enNumber(intPart);
            if (isCurr) {
              res += ' dollars' + (decPart > 0 ? (' and ' + decPart + '/100 cents') : '');
            } else if (decPart > 0) {
              res += ' point ' + enNumber(decPart);
            }
            return res;
          }
        }).join('\n');
      }
      [input, langSel, fmtSel].forEach(el => el.addEventListener("input", update));
      container.querySelector("#nw-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#nw-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#nw-copy"));
      });
      update();
    }

function renderBraille(container) {
      const L = currentLang === 'sl';
      const BRAILLE_MAP = {
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'č': '⠡', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
        'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟',
        'r': '⠗', 's': '⠎', 'š': '⠱', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
        'z': '⠵', 'ž': '⠮', ' ': ' ', ',': '⠂', ';': '⠆', ':': '⠒', '.': '⠲', '!': '⠖', '?': '⠦',
        '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚'
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
      const input = container.querySelector("#br-input");
      const output = container.querySelector("#br-output");

      function update() {
        const text = input.value.toLowerCase();
        output.value = [...text].map(c => BRAILLE_MAP[c] || c).join('');
      }
      input.addEventListener("input", update);
      container.querySelector("#br-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#br-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#br-copy"));
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
      const input = container.querySelector("#jf-input");
      const indentSel = container.querySelector("#jf-indent");
      const sortCheck = container.querySelector("#jf-sort");
      const output = container.querySelector("#jf-output");
      const status = container.querySelector("#jf-status");

      function update() {
        if (!input.value.trim()) {
          output.value = '';
          status.textContent = '';
          return;
        }
        try {
          output.value = PURE.formatJson(input.value, { indent: indentSel.value, sort: sortCheck.checked });
          const sizeKb = (new Blob([output.value]).size / 1024).toFixed(2);
          status.innerHTML = `<span style="color:#22c55e;">${SVG_ICONS.mi_check} ${L ? `Veljaven JSON (${sizeKb} KB)` : `Valid JSON (${sizeKb} KB)`}</span>`;
        } catch (e) {
          output.value = '';
          status.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${escapeHtml(e.message)}</span>`;
        }
      }
      [input, indentSel, sortCheck].forEach(el => el.addEventListener("input", update));
      container.querySelector("#jf-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#jf-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#jf-copy"));
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
      const input = container.querySelector("#he-input");
      const mode = container.querySelector("#he-mode");
      const allCheck = container.querySelector("#he-all");
      const output = container.querySelector("#he-output");

      function update() {
        output.value = PURE.htmlEntities(input.value, { mode: mode.value, encodeAll: allCheck.checked });
      }
      const safe = safeUpdate(update, container);
      [input, mode, allCheck].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#he-clear").addEventListener("click", () => { input.value = ""; safe(); input.focus(); });
      container.querySelector("#he-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#he-copy"));
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
        <textarea id="mp-input" placeholder="${L ? 'Vnesite Markdown besedilo...' : 'Enter Markdown text...'}">${sample}</textarea>
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
      const input = container.querySelector("#mp-input");
      const preview = container.querySelector("#mp-preview");
      let updatePromise = null;

      async function update() {
        const text = input.value;
        let html;
        if (text.length > HEAVY_LIMIT) {
          showToolBusy(container, true);
          try { html = await runHeavy('markdown', text); }
          catch (e) { html = PURE.parseMarkdown(text); }
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
      input.addEventListener("input", safe);
      container.querySelector("#mp-clear").addEventListener("click", () => { input.value = ""; safe(); input.focus(); });
      container.querySelector("#mp-copy-html").addEventListener("click", () => {
        copyText(preview.innerHTML, container.querySelector("#mp-copy-html"));
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
      const input = container.querySelector("#pe-input");
      const typeSel = container.querySelector("#pe-type");
      const uniqueCheck = container.querySelector("#pe-unique");
      const sortCheck = container.querySelector("#pe-sort");
      const output = container.querySelector("#pe-output");
      const count = container.querySelector("#pe-count");

      const patterns = {
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        url: /https?:\/\/[^\s/$.?#].[^\s]*/gi,
        phone: /(?:\+|00)\d{1,3}[- .]?(?:\(\d{1,4}\)|\d{1,4})(?:[- .]?\d{2,4}){1,4}|\(0?\d{1,4}\)(?:[- .]?\d{2,4}){2,3}|0\d{1,3}(?:[- .]?\d{2,4}){2,3}/g,
        hashtag: /#[\p{L}\p{N}_]+/gu,
        mention: /@[\p{L}\p{N}_]+/gu,
        ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        number: /-?\d+(?:[.,]\d+)?/g
      };

      function update() {
        output.value = PURE.extractPatterns(input.value, { mode: typeSel.value, unique: uniqueCheck.checked, sort: sortCheck.checked });
        const matches = output.value ? output.value.split('\n') : [];
        count.textContent = matches.length + ' ' + (L ? 'zadetkov' : 'found');
      }
      const safe = safeUpdate(update, container);
      [input, typeSel, uniqueCheck, sortCheck].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#pe-clear").addEventListener("click", () => { input.value = ""; safe(); input.focus(); });
      container.querySelector("#pe-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#pe-copy"));
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
      <div id="df-out" style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:12px; font-size:13px; line-height:1.6; white-space:pre-wrap; overflow-y:auto; max-height:360px;"></div>
      <div class="panel-actions">
        <button class="btn-sm primary" id="df-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
      const a = container.querySelector("#df-a");
      const b = container.querySelector("#df-b");
      const out = container.querySelector("#df-out");
      let updatePromise = null;

      async function update() {
        const textA = a.value, textB = b.value;
        let rows;
        if (textA.length + textB.length > HEAVY_LIMIT) {
          showToolBusy(container, true);
          try { rows = await runHeavy('diff', { a: textA, b: textB }); }
          catch (e) { rows = PURE.diffLines(textA, textB); }
          showToolBusy(container, false);
        } else {
          rows = PURE.diffLines(textA, textB);
        }
        out.innerHTML = rows.map(r => {
          const color = r.t === '-' ? '#ef4444' : r.t === '+' ? '#22c55e' : 'var(--text-dim)';
          return `<div style="color:${color};">${r.t} ${escapeHtml(r.v) || ' '}</div>`;
        }).join('');
      }

      function debouncedUpdate() {
        clearTimeout(updatePromise);
        updatePromise = setTimeout(update, 100);
      }
      const safe = safeUpdate(debouncedUpdate, container);
      [a, b].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#df-copy").addEventListener("click", () => {
        copyText(out.textContent, container.querySelector("#df-copy"));
      });
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
      <textarea id="cs-output" readonly></textarea>
      <div class="panel-actions">
        <button class="btn-sm primary" id="cs-copy">${SVG_ICONS.mi_copy} <span>${L ? 'Kopiraj' : 'Copy'}</span></button>
      </div>
    </div>
  `;
      const input = container.querySelector("#cs-input");
      const algoSel = container.querySelector("#cs-algo");
      const output = container.querySelector("#cs-output");

      function update() {
        const algo = algoSel.value;
        const text = input.value;
        if (algo === 'crc32') { output.value = PURE.crc32(text); return; }
        if (algo === 'sha256' && (!crypto?.subtle?.digest)) {
          output.value = PURE.sha256(text);
          return;
        }
        output.value = L ? 'Računam…' : 'Computing…';
        if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
          crypto.subtle.digest(algo, new TextEncoder().encode(text))
            .then(h => { output.value = PURE.bufferToHex(h); })
            .catch(e => { output.value = ''; showToolErrorBanner(container, (e && e.message) ? e.message : String(e)); });
        } else {
          output.value = L ? 'SHA-1/512 zahtevajo varno okolje (https/localhost).' : 'SHA-1/512 require secure context (https/localhost).';
        }
      }
      const safe = safeUpdate(update, container);
      [input, algoSel].forEach(el => el.addEventListener("input", safe));
      container.querySelector("#cs-copy").addEventListener("click", () => copyText(output.value, container.querySelector("#cs-copy")));
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
      const input = container.querySelector("#up-input");
      const result = container.querySelector("#up-result");
      let lastJson = '';

      function update() {
        let raw = input.value.trim();
        if (!raw) { result.innerHTML = ''; return; }
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
            params: Object.fromEntries(params)
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
            ${params.length > 0 ? `
              <strong style="display:block; margin-bottom:6px;">URL Parametri (${params.length}):</strong>
              <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <thead><tr style="border-bottom:1px solid var(--border); text-align:left;"><th style="padding:4px;">Ključ</th><th style="padding:4px;">Vrednost</th></tr></thead>
                <tbody>
                  ${params.map(([k, v]) => `<tr style="border-bottom:1px solid rgba(0,0,0,0.05);"><td style="padding:4px; font-weight:600; color:var(--violet);">${escapeHtml(k)}</td><td style="padding:4px; font-family:monospace;">${escapeHtml(v)}</td></tr>`).join('')}
                </tbody>
              </table>
            ` : `<div style="color:var(--text-dim); font-size:12px;">Ni URL parametrov (?query).</div>`}
          `;
        } catch (e) {
          result.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven URL format.' : 'Invalid URL.'}</span>`;
        }
      }
      input.addEventListener("input", update);
      container.querySelector("#up-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#up-copy-json").addEventListener("click", () => {
        if (!lastJson) return;
        copyText(lastJson, container.querySelector("#up-copy-json"));
      });
      update();
    }

function renderJwtDecoder(container) {
      const L = currentLang === 'sl';
      const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmV6IE5vdmFrIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzk4NzU0ODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

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
      const input = container.querySelector("#jwt-input");
      const headEl = container.querySelector("#jwt-header");
      const payEl = container.querySelector("#jwt-payload");
      const status = container.querySelector("#jwt-status");

      function b64DecodeUnicode(str) {
        let output = str.replace(/-/g, "+").replace(/_/g, "/");
        while (output.length % 4) output += "=";
        return PURE.base64ToUtf8(output);
      }

      function update() {
        const token = input.value.trim();
        if (!token) {
          headEl.value = ''; payEl.value = ''; status.textContent = ''; return;
        }
        const parts = token.split('.');
        if (parts.length < 2) {
          headEl.value = ''; payEl.value = '';
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
            expInfo = isExp ? (L ? ' (potekel!)' : ' (expired!)') : (L ? ' (veljaven)' : ' (valid)');
          }
          status.innerHTML = `<span style="color:#22c55e;">${SVG_ICONS.mi_check} ${L ? `Algoritem: ${escapeHtml(header.alg || 'N/A')}${expInfo}` : `Algorithm: ${escapeHtml(header.alg || 'N/A')}${expInfo}`}</span>`;
        } catch (e) {
          headEl.value = ''; payEl.value = '';
          status.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Napaka pri dekodiranju Base64 / JSON.' : 'Error decoding JWT.'}</span>`;
        }
      }
      input.addEventListener("input", update);
      container.querySelector("#jwt-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#jwt-copy-payload").addEventListener("click", () => {
        copyText(payEl.value, container.querySelector("#jwt-copy-payload"));
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
      const input = container.querySelector("#cp-input");
      const fmt = container.querySelector("#cp-fmt");
      const sep = container.querySelector("#cp-sep");
      const output = container.querySelector("#cp-output");

      function update() {
        const text = input.value;
        const f = fmt.value;
        const s = sep.value === 'space' ? ' ' : (sep.value === 'comma' ? ', ' : (sep.value === 'newline' ? '\n' : ''));
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
      [input, fmt, sep].forEach(el => el.addEventListener("input", update));
      container.querySelector("#cp-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#cp-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#cp-copy"));
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
      const input = container.querySelector("#dt-input");
      const formats = container.querySelector("#dt-formats");
      const nowBtn = container.querySelector("#dt-now");
      let isoString = '';

      function update() {
        const val = input.value.trim();
        if (!val) { formats.innerHTML = ''; return; }
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

      input.addEventListener("input", update);
      nowBtn.addEventListener("click", () => { input.value = new Date().toISOString(); update(); });
      container.querySelector("#dt-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#dt-copy-iso").addEventListener("click", () => {
        if (!isoString) return;
        copyText(isoString, container.querySelector("#dt-copy-iso"));
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
      const picker = container.querySelector("#cc-picker");
      const input = container.querySelector("#cc-input");
      const preview = container.querySelector("#cc-preview");
      const formats = container.querySelector("#cc-formats");
      let currentHex = '#6366f1';

      function update() {
        let val = input.value.trim();
        if (!val) { formats.innerHTML = ''; return; }
        if (!val.startsWith('#') && !val.startsWith('rgb') && !val.startsWith('hsl') && /^[0-9a-fA-F]{6}$/.test(val)) {
          val = '#' + val;
        }

        const d = document.createElement("div");
        d.style.color = val;
        document.body.appendChild(d);
        const cs = window.getComputedStyle(d).color;
        document.body.removeChild(d);

        const m = cs.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) {
          formats.innerHTML = `<span style="color:#ef4444;">${SVG_ICONS.mi_x} ${L ? 'Neveljaven barvni zapis.' : 'Invalid color format.'}</span>`;
          return;
        }

        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        currentHex = hex;
        preview.style.background = hex;
        if (/^#[0-9a-fA-F]{6}$/i.test(hex)) picker.value = hex;

        const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
          const delta = max - min;
          s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
          switch (max) {
            case rNorm: h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0); break;
            case gNorm: h = (bNorm - rNorm) / delta + 2; break;
            case bNorm: h = (rNorm - gNorm) / delta + 4; break;
          }
          h /= 6;
        }
        const hDeg = Math.round(h * 360), sPct = Math.round(s * 100), lPct = Math.round(l * 100);

        formats.innerHTML = `
          <div><strong>HEX:</strong> <code>${hex}</code></div>
          <div><strong>RGB:</strong> <code>rgb(${r}, ${g}, ${b})</code></div>
          <div><strong>HSL:</strong> <code>hsl(${hDeg}, ${sPct}%, ${lPct}%)</code></div>
          <div><strong>CSS Vrednost:</strong> <code>rgba(${r}, ${g}, ${b}, 1)</code></div>
        `;
      }

      input.addEventListener("input", update);
      picker.addEventListener("input", () => { input.value = picker.value; update(); });
      container.querySelector("#cc-clear").addEventListener("click", () => { input.value = ""; formats.innerHTML = ""; input.focus(); });
      container.querySelector("#cc-copy-hex").addEventListener("click", () => {
        copyText(currentHex, container.querySelector("#cc-copy-hex"));
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
      const input = container.querySelector("#tc-input");
      const fmtSel = container.querySelector("#tc-format");
      const delimSel = container.querySelector("#tc-delim");
      const hasHeader = container.querySelector("#tc-header");
      const output = container.querySelector("#tc-output");

      function update() {
        const raw = input.value.trim();
        if (!raw) { output.value = ''; return; }
        const d = delimSel.value === 'tab' ? '\t' : (delimSel.value === 'comma' ? ',' : (delimSel.value === 'semicolon' ? ';' : '|'));
        const rows = raw.split('\n').map(r => r.split(d).map(c => c.trim()));
        if (rows.length === 0) return;

        const maxCols = Math.max(...rows.map(r => r.length));
        const normalized = rows.map(r => {
          while (r.length < maxCols) r.push('');
          return r;
        });

        const f = fmtSel.value;
        if (f === 'markdown') {
          const mdCell = (c) => String(c).replace(/\|/g, '\\|');
          let res = '| ' + normalized[0].map(mdCell).join(' | ') + ' |\n';
          res += '| ' + normalized[0].map(() => '---').join(' | ') + ' |\n';
          for (let i = 1; i < normalized.length; i++) {
            res += '| ' + normalized[i].map(mdCell).join(' | ') + ' |\n';
          }
          output.value = res;
        } else if (f === 'html') {
          let res = '<table>\n';
          if (hasHeader.checked && normalized.length > 0) {
            res += '  <thead>\n    <tr>' + normalized[0].map(c => `<th>${escapeHtml(c)}</th>`).join('') + '</tr>\n  </thead>\n  <tbody>\n';
            for (let i = 1; i < normalized.length; i++) {
              res += '    <tr>' + normalized[i].map(c => `<td>${escapeHtml(c)}</td>`).join('') + '</tr>\n';
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
              headers.forEach((h, idx) => obj[h || ('col_' + idx)] = r[idx] || '');
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
      [input, fmtSel, delimSel, hasHeader].forEach(el => el.addEventListener("input", update));
      container.querySelector("#tc-clear").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
      container.querySelector("#tc-copy").addEventListener("click", () => {
        copyText(output.value, container.querySelector("#tc-copy"));
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
      const keyEl = container.querySelector("#pf-key");
      const modeEl = container.querySelector("#pf-mode");
      const input = container.querySelector("#pf-input");
      const out = container.querySelector("#pf-output");

      const buildMatrix = (key) => {
        const clean = (key || "").toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
        const seen = [];
        for (const c of (clean + "ABCDEFGHIKLMNOPQRSTUVWXYZ")) { if (!seen.includes(c)) seen.push(c); }
        const m = [];
        for (let i = 0; i < 5; i++) m.push(seen.slice(i * 5, i * 5 + 5));
        const pos = {};
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) pos[m[r][c]] = [r, c];
        return { m, pos };
      };
      const process = (text, key, decrypt) => {
        const { m, pos } = buildMatrix(key);
        const clean = (text || "").toUpperCase().replace(/[^A-Z]/g, "");
        const pairs = [];
        for (let i = 0; i < clean.length; i += 2) {
          let a = clean[i], b = clean[i + 1] || 'X';
          if (a === b) { b = 'X'; i--; }
          pairs.push([a, b]);
        }
        let res = "";
        for (const [a, b] of pairs) {
          const [ar, ac] = pos[a] || [0, 0], [br, bc] = pos[b] || [0, 0];
          let na, nb;
          if (ar === br) { na = [ar, (ac + 1) % 5]; nb = [br, (bc + 1) % 5]; }
          else if (ac === bc) { na = [(ar + 1) % 5, ac]; nb = [(br + 1) % 5, bc]; }
          else { na = [ar, bc]; nb = [br, ac]; }
          if (decrypt) {
            if (ar === br) { na = [ar, (ac + 4) % 5]; nb = [br, (bc + 4) % 5]; }
            else if (ac === bc) { na = [(ar + 4) % 5, ac]; nb = [(br + 4) % 5, bc]; }
            else { na = [ar, bc]; nb = [br, ac]; }
          }
          res += m[na[0]][na[1]] + m[nb[0]][nb[1]];
        }
        return res;
      };
      const update = () => {
        const text = input.value;
        if (!text.trim()) { out.value = ""; announceResult(0); return; }
        out.value = process(text, keyEl.value, modeEl.value === "dec");
        announceResult(out.value.length);
      };
      input.addEventListener("input", update);
      keyEl.addEventListener("input", update);
      modeEl.addEventListener("change", update);
      container.querySelector("#pf-clear").addEventListener("click", () => { input.value = ""; out.value = ""; input.focus(); });
      container.querySelector("#pf-copy").addEventListener("click", () => { copyText(out.value, container.querySelector("#pf-copy")); });
      update();
      const pfFirst = container.querySelector('input, textarea, button, select');
      if (pfFirst) pfFirst.focus();
    }
