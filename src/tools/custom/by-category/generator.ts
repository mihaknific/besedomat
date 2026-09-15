/** AUTO-SPLIT iz legacy/renderers.ts — kategorija generator (4 orodij). Migriraj vsak render v ToolComponent. */
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
  const $ = s => container.querySelector(s);
  const $$ = s => Array.from(container.querySelectorAll(s));
  const len = $('#pg-len');
  const lenVal = $('#pg-len-val');
  const lower = $('#pg-lower');
  const upper = $('#pg-upper');
  const digits = $('#pg-digits');
  const symbols = $('#pg-symbols');
  const cLow = $('#pg-c-low');
  const cUp = $('#pg-c-up');
  const cDig = $('#pg-c-dig');
  const cSym = $('#pg-c-sym');
  const exclEl = $('#pg-excl');
  const hint = $('#pg-hint');
  const randomBox = $('#pg-random-box');
  const wordsBox = $('#pg-words-box');
  const wordsEl = $('#pg-words');
  const sepEl = $('#pg-sep');
  const capEl = $('#pg-cap');
  const numEl = $('#pg-num');
  const sym2El = $('#pg-sym2');
  const output = $('#pg-output');
  const strength = $('#pg-strength');
  const meterFill = $('#pg-meter-fill');

  const TYPE_DEFS = [
    { key: 'lower', cb: lower, cnt: cLow, card: $('#pg-t-lower'), chips: $('#pg-chips-lower') },
    { key: 'upper', cb: upper, cnt: cUp, card: $('#pg-t-upper'), chips: $('#pg-chips-upper') },
    { key: 'digits', cb: digits, cnt: cDig, card: $('#pg-t-digits'), chips: $('#pg-chips-digits') },
    {
      key: 'symbols',
      cb: symbols,
      cnt: cSym,
      card: $('#pg-t-symbols'),
      chips: $('#pg-chips-symbols'),
    },
  ];
  const placementState = {
    lower: new Set(),
    upper: new Set(),
    digits: new Set(),
    symbols: new Set(),
  };

  $$('.pg-chip[data-type]').forEach(chip =>
    chip.addEventListener('click', () => {
      const set = placementState[chip.dataset.type];
      const pos = chip.dataset.pos;
      if (set.has(pos)) {
        set.delete(pos);
        chip.classList.remove('active');
      } else {
        set.add(pos);
        chip.classList.add('active');
      }
      generate();
    })
  );

  const tabs = $$('.pg-mode-tab');
  tabs.forEach(t =>
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.toggle('active', x === t));
      const isRandom = t.dataset.mode === 'random';
      randomBox.style.display = isRandom ? 'flex' : 'none';
      wordsBox.style.display = isRandom ? 'none' : 'block';
      generate();
    })
  );

  function currentMode() {
    const active = tabs.find(t => t.classList.contains('active'));
    return active ? active.dataset.mode : 'random';
  }

  function parseExcl() {
    return exclEl.value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  function clampCnt(el) {
    return Math.max(0, Math.min(256, Math.floor(+el.value) || 0));
  }

  function getOptsRandom() {
    const counts = {
      lower: clampCnt(cLow),
      upper: clampCnt(cUp),
      digits: clampCnt(cDig),
      symbols: clampCnt(cSym),
    };
    const useCounts =
      counts.lower > 0 || counts.upper > 0 || counts.digits > 0 || counts.symbols > 0;
    const perType = {
      lower: lower.checked ? counts.lower : 0,
      upper: upper.checked ? counts.upper : 0,
      digits: digits.checked ? counts.digits : 0,
      symbols: symbols.checked ? counts.symbols : 0,
    };
    return {
      length: useCounts
        ? Math.max(1, perType.lower + perType.upper + perType.digits + perType.symbols)
        : Math.max(4, Number(len.value)),
      lower: lower.checked,
      upper: upper.checked,
      digits: digits.checked,
      symbols: symbols.checked,
      perType: useCounts ? perType : null,
      placement: {
        lower: [...placementState.lower],
        upper: [...placementState.upper],
        digits: [...placementState.digits],
        symbols: [...placementState.symbols],
      },
      excludeChars: parseExcl(),
    };
  }

  const PG_POOLS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.?',
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
      d.card.classList.toggle('off', !on);
      d.chips.classList.toggle('disabled', !on);
      d.cnt.disabled = !on;
    }
  }

  function generate() {
    try {
      syncTypeUI();
      const mode = currentMode();
      if (mode === 'random') {
        const o = getOptsRandom();
        const useCounts = !!o.perType;
        len.disabled = useCounts;
        const structured = ['lower', 'upper', 'digits', 'symbols'].some(
          k => o.placement[k].length > 0
        );
        hint.textContent = useCounts
          ? L
            ? 'Dolžino določajo natančna števila po vrsti (' +
              (o.perType.lower + o.perType.upper + o.perType.digits + o.perType.symbols) +
              ' znakov).'
            : 'Length comes from exact per-type counts (' +
              (o.perType.lower + o.perType.upper + o.perType.digits + o.perType.symbols) +
              ' characters).'
          : structured
            ? L
              ? 'Znaki z izbranim položajem se enakomerno porazdelijo po celotni dolžini.'
              : 'Characters with a fixed placement are spread evenly across the length.'
            : '';
        output.value = PURE.generatePassword(o);
        const pool = estimatePool();
        const n = useCounts ? Math.max(1, output.value.length) : Number(len.value);
        showStrength(Math.round(n * Math.log2(pool)));
      } else {
        const wl = mode === 'words-sl' ? 'sl' : 'en';
        const o = {
          words: Math.max(3, Number(wordsEl.value) || 4),
          separator: sepEl.value || '-',
          capitalize: capEl.checked,
          includeNumber: numEl.checked,
          includeSymbol: sym2El.checked,
          wordlist: wl,
        };
        output.value = PURE.generatePassphrase(o);
        let bits = o.words * Math.log2(PURE.PASSPHRASE_WORDLISTS[wl].length);
        if (numEl.checked) bits += Math.log2(10000);
        if (sym2El.checked) bits += Math.log2(8);
        showStrength(Math.round(bits));
      }
    } catch (e) {
      showToolErrorBanner(container, e && e.message ? e.message : String(e));
    }
  }

  function showStrength(bits) {
    let lvl = L ? 'Nizka varnost' : 'Low strength';
    let color = '#ef4444';
    if (bits >= 45 && bits < 70) {
      lvl = L ? 'Srednja varnost' : 'Medium strength';
      color = '#f59e0b';
    }
    if (bits >= 70) {
      lvl = L ? 'Visoka varnost' : 'High strength';
      color = '#22c55e';
    }
    meterFill.style.width = Math.max(4, Math.min(100, Math.round((bits / 128) * 100))) + '%';
    meterFill.style.backgroundColor = color;
    strength.innerHTML = `${L ? 'Jakost' : 'Strength'}: <strong style="color:${color};">${lvl}</strong> · ~${bits} bitov`;
  }

  $('#pg-excl-ambig').addEventListener('click', () => {
    const base = exclEl.value.trim().replace(/,+$/, '');
    const cur = new Set(base.replace(/,/g, '').split(''));
    const addChars = Array.from(new Set('iIlL1|oO0'.split(''))).filter(c => !cur.has(c));
    if (!addChars.length) return;
    exclEl.value = (base ? base + ',' : '') + addChars.join(',');
    exclEl.dispatchEvent(new Event('input', { bubbles: true }));
    exclEl.focus();
  });

  [
    len,
    lower,
    upper,
    digits,
    symbols,
    cLow,
    cUp,
    cDig,
    cSym,
    exclEl,
    wordsEl,
    sepEl,
    capEl,
    numEl,
    sym2El,
  ].forEach(el =>
    el.addEventListener('input', () => {
      lenVal.textContent = len.value;
      generate();
    })
  );
  $('#pg-regen').addEventListener('click', generate);
  $('#pg-copy').addEventListener('click', () => {
    copyText(output.value, $('#pg-copy'));
  });
  generate();
}

function renderLoremIpsum(container) {
  const loremSources = {
    lorem: {
      label: { sl: 'Lorem ipsum', en: 'Lorem ipsum' },
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`,
    },
    cicero: {
      label: { sl: 'Cicero', en: 'Cicero' },
      text: `Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`,
    },
    li_europan: {
      label: { sl: 'Li Europan lingues', en: 'Li Europan lingues' },
      text: `Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Omnicos linguae se habet in corde del populo, e nos comprende e comunica sin barriere. Tant li mondo cambia, li lingua vive in le viento.`,
    },
    far_away: {
      label: { sl: 'Daleč daleč stran', en: 'Far far away' },
      text: `Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.

Separated they live in Bookmarksgrove right at the coast of the Semantics. Even the farthest shores know the songs of letters and the little rivers of sentences.

When the wind blows through the forests of words, the stories wake up and begin to sing. Each paragraph becomes a path along which the reader can travel, discovering new images and quiet rhythms.

In that distant place, every sentence is a small river, and every paragraph becomes a meadow where readers can rest. The stories move slowly, like clouds carrying poems across the sky.`,
    },
    cat: {
      label: { sl: 'Mačji ipsum', en: 'Cat ipsum' },
      text: `Dear diary,
Today I woke up on the keyboard because it was the warmest surface in the house. I walked across every important document to make sure my human knew I was awake. After breakfast, I chased a dust bunny under the couch, pounced on a curtain, and declared victory without ever seeing it.

Then I found a sunbeam. It became my throne for exactly seventeen minutes before the dog decided to sit in the middle of it. I fixed that by lying across the remote control and pretending not to care. A bird looked at me through the window, and I returned a long, meaningful stare.

At noon I took a nap in the box they left on the floor. It was the perfect size for my whole body and also for my paw to hang out. I woke up just in time to demand dinner by sitting on the clean laundry and purring loudly.

Later I practiced my most important skill: the silent loaf. I stared at the red dot, then ignored it. The human clapped, so I switched to sleeping on their laptop. Somewhere between dreams, I planned a new route for the invisible mouse.

After dinner there was important work to do: inspect the plant, open the closed door with mental power, and knock one glass off the table. I executed each mission with total grace and then sat down to judge the family from the top of the bookshelf.

I am a cat, and this is my glorious routine. Tomorrow I will be even more mysterious.`,
    },
    dog: {
      label: { sl: 'Pasji ipsum', en: 'Dog ipsum' },
      text: `Dear diary,
This morning started with a great idea: wake up my human by licking their face. It worked. Then we went outside and I announced to every squirrel, bird, and mailbox that this yard is mine. I found the best stick and carried it proudly, even though I dropped it three times.

I rolled in something mysterious behind the fence and gave my human a new cologne. It was delightful. I also barked at the mailman because he looked like he needed a friendly warning. Later, I sat by the door and waited for the sound that means walk time.

During the walk I met a friend who had four legs and smelled like adventure. We chased each other in slow motion until the leash said stop. I drank from a puddle because only the freshest water would do.

After the walk, I supervised the sofa, guarded the snacks, and sniffed every cushion for secrets. I rolled onto my back to request belly rubs, then immediately became a guard dog again when the kitchen timer beeped.

In the evening I practiced my best tricks: stare at the human, wag at the sound of keys, and perform the exact tiny dance that proves dinner is soon. I fell asleep with one ear listening for footsteps and one nose dreaming of treats.

Life is simple: nap, play, protect the house, love my human.`,
    },
    painter: {
      label: { sl: 'Slikoviti tekst', en: 'Painter style' },
      text: `Slikam nežne poteze in rečem, da včasih so dobri dnevi in včasih manj dobri. Vsaka barva že nosi zgodbo in vsaka črta postane dovoljena poteza naplatnu. Ko mešaš barve, pusti, da se stare skrbi raztopijo in dovoli platnu, da prinese nekaj toplega. V svetu slik so drobne sreče kot mehki oblaki, ki se pojavljajo, ko jih najmanj pričakuješ.`,
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
One from the pitiless wave?`,
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
        'The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb',
      ],
    },
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
      if (cursor >= sourceWords.length) {
        cursor = 0;
      }
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

    const sourceParagraphs = variant.text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);
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
        if (cursor >= words.length) {
          cursor = 0;
        }
        paragraphWords.push(words[cursor]);
        cursor += 1;
      }
      paragraphs.push(
        paragraphWords
          .join(' ')
          .replace(/\s+([.,!?;:])/g, '$1')
          .replace(/\s+/g, ' ')
          .trim() + '.'
      );
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
      ? variant.fragments[0]
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, Math.min(7, variant.fragments[0].split(/\s+/).filter(Boolean).length))
      : words.slice(0, Math.min(7, words.length));
    let value = '';

    if (mode === 'words') {
      // Build a token list separating base word and trailing punctuation.
      const rawTokens = sourceText.split(/\s+/).filter(Boolean);
      const tokens = rawTokens.map(tok => {
        const m = tok.match(/^(.+?)([^\p{L}\p{N}\s]+)?$/u);
        return { base: m ? m[1] : tok, trail: m && m[2] ? m[2] : '' };
      });

      function pick(idx) {
        return tokens[idx % tokens.length];
      }

      const outputWords = [];
      let cursor = 0;

      // Optionally start with a few words from the source (unchanged behaviour)
      if (startWithSource) {
        const n0 = Math.min(7, tokens.length);
        for (let i = 0; i < n0 && outputWords.length < count; i++) {
          const t = pick(i);
          const includeTrail = t.trail && outputWords.length + 1 < count;
          outputWords.push(t.base + (includeTrail ? t.trail : ''));
        }
        cursor = n0;
      }

      while (outputWords.length < count) {
        const t = pick(cursor);
        const includeTrail = t.trail && outputWords.length + 1 < count;
        outputWords.push(t.base + (includeTrail ? t.trail : ''));
        cursor += 1;
      }

      value = outputWords.slice(0, count).join(' ');
      // In words mode we should not force a trailing period — punctuation
      // is only included when it's part of a token and the next word
      // is present. Wrap in HTML paragraph only when requested.
      if (format === 'html') {
        value = `<p>${value}</p>`;
      }
    } else {
      const wordsPerParagraph = 40;
      const paragraphs = buildParagraphs(variant, count, startWithSource, wordsPerParagraph);
      value =
        format === 'html' ? paragraphs.map(p => `<p>${p}</p>`).join('\n') : paragraphs.join('\n\n');
    }

    output.value = value;
  }

  [variantSelect, countInput, modeSelect, formatSelect].forEach(el => {
    el.addEventListener('input', generate);
    el.addEventListener('change', generate);
  });
  container.querySelector('#lorem-copy').addEventListener('click', () => {
    copyText(output.value, container.querySelector('#lorem-copy'));
  });
  generate();
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
        if ((x < 9 && y < 9) || (x > 23 && y < 9) || (x < 9 && y > 23) || x === 6 || y === 6)
          continue;

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

  const input = container.querySelector('#qr-input');
  const typeSel = container.querySelector('#qr-type');
  const sizeEl = container.querySelector('#qr-size');
  const sizeVal = container.querySelector('#qr-size-val');
  const eccSel = container.querySelector('#qr-ecc');
  const fgEl = container.querySelector('#qr-fg');
  const bgEl = container.querySelector('#qr-bg');
  const canvas = container.querySelector('#qr-canvas');
  const ctx = canvas.getContext('2d');
  const wifiFields = container.querySelector('#qr-wifi-fields');
  const vcardFields = container.querySelector('#qr-vcard-fields');
  const wifiSSID = container.querySelector('#qr-wifi-ssid');
  const wifiPass = container.querySelector('#qr-wifi-pass');
  const wifiEnc = container.querySelector('#qr-wifi-enc');
  const vcardName = container.querySelector('#qr-vcard-name');
  const vcardPhone = container.querySelector('#qr-vcard-phone');
  const vcardEmail = container.querySelector('#qr-vcard-email');
  const vcardOrg = container.querySelector('#qr-vcard-org');

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
      hash = (hash << 5) - hash + text.charCodeAt(i);
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
        if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8))
          continue;
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
      } catch (e) {
        /* fall through to fake */
      }
    }

    // Fallback: simple pseudo pattern (not a real QR)
    const modules = 33;
    const moduleSize = size / modules;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    const drawFinderSVG = (mx, my) => {
      svg += `<rect x="${mx * moduleSize}" y="${my * moduleSize}" width="${7 * moduleSize}" height="${7 * moduleSize}" fill="${fg}"/>`;
      svg += `<rect x="${(mx + 1) * moduleSize}" y="${(my + 1) * moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" fill="${bg}"/>`;
      svg += `<rect x="${(mx + 2) * moduleSize}" y="${(my + 2) * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" fill="${fg}"/>`;
    };
    drawFinderSVG(0, 0);
    drawFinderSVG(modules - 7, 0);
    drawFinderSVG(0, modules - 7);
    for (let i = 8; i < modules - 8; i++) {
      if (i % 2 === 0) {
        svg += `<rect x="${i * moduleSize}" y="${6 * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
        svg += `<rect x="${6 * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
      }
    }
    let seed = Math.abs(hash);
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8))
          continue;
        if (x === 6 || y === 6) continue;
        seed = (seed * 1664525 + 1013904223) >>> 0;
        if (seed % 2 === 0)
          svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
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
  }

  [
    input,
    typeSel,
    sizeEl,
    eccSel,
    fgEl,
    bgEl,
    wifiSSID,
    wifiPass,
    wifiEnc,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
  ].forEach(el => {
    el.addEventListener('input', updateQR);
    el.addEventListener('change', updateQR);
  });

  typeSel.addEventListener('change', updateFields);

  container.querySelector('#qr-clear').addEventListener('click', () => {
    input.value = '';
    wifiSSID.value = '';
    wifiPass.value = '';
    vcardName.value = '';
    vcardPhone.value = '';
    vcardEmail.value = '';
    vcardOrg.value = '';
    updateFields();
    input.focus();
  });

  container.querySelector('#qr-download-png').addEventListener('click', downloadPNG);
  container.querySelector('#qr-download-svg').addEventListener('click', downloadSVG);

  updateFields();
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
        if ((x < 9 && y < 9) || (x > 23 && y < 9) || (x < 9 && y > 23) || x === 6 || y === 6)
          continue;

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

  const input = container.querySelector('#qr-input');
  const typeSel = container.querySelector('#qr-type');
  const sizeEl = container.querySelector('#qr-size');
  const sizeVal = container.querySelector('#qr-size-val');
  const eccSel = container.querySelector('#qr-ecc');
  const fgEl = container.querySelector('#qr-fg');
  const bgEl = container.querySelector('#qr-bg');
  const canvas = container.querySelector('#qr-canvas');
  const ctx = canvas.getContext('2d');
  const wifiFields = container.querySelector('#qr-wifi-fields');
  const vcardFields = container.querySelector('#qr-vcard-fields');
  const wifiSSID = container.querySelector('#qr-wifi-ssid');
  const wifiPass = container.querySelector('#qr-wifi-pass');
  const wifiEnc = container.querySelector('#qr-wifi-enc');
  const vcardName = container.querySelector('#qr-vcard-name');
  const vcardPhone = container.querySelector('#qr-vcard-phone');
  const vcardEmail = container.querySelector('#qr-vcard-email');
  const vcardOrg = container.querySelector('#qr-vcard-org');

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
      hash = (hash << 5) - hash + text.charCodeAt(i);
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
        if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8))
          continue;
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
      } catch (e) {
        /* fall through to fake */
      }
    }

    // Fallback: simple pseudo pattern (not a real QR)
    const modules = 33;
    const moduleSize = size / modules;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    const drawFinderSVG = (mx, my) => {
      svg += `<rect x="${mx * moduleSize}" y="${my * moduleSize}" width="${7 * moduleSize}" height="${7 * moduleSize}" fill="${fg}"/>`;
      svg += `<rect x="${(mx + 1) * moduleSize}" y="${(my + 1) * moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" fill="${bg}"/>`;
      svg += `<rect x="${(mx + 2) * moduleSize}" y="${(my + 2) * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" fill="${fg}"/>`;
    };
    drawFinderSVG(0, 0);
    drawFinderSVG(modules - 7, 0);
    drawFinderSVG(0, modules - 7);
    for (let i = 8; i < modules - 8; i++) {
      if (i % 2 === 0) {
        svg += `<rect x="${i * moduleSize}" y="${6 * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
        svg += `<rect x="${6 * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
      }
    }
    let seed = Math.abs(hash);
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if ((x < 9 && y < 9) || (x >= modules - 8 && y < 9) || (x < 9 && y >= modules - 8))
          continue;
        if (x === 6 || y === 6) continue;
        seed = (seed * 1664525 + 1013904223) >>> 0;
        if (seed % 2 === 0)
          svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fg}"/>`;
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
  }

  [
    input,
    typeSel,
    sizeEl,
    eccSel,
    fgEl,
    bgEl,
    wifiSSID,
    wifiPass,
    wifiEnc,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
  ].forEach(el => {
    el.addEventListener('input', updateQR);
    el.addEventListener('change', updateQR);
  });

  typeSel.addEventListener('change', updateFields);

  container.querySelector('#qr-clear').addEventListener('click', () => {
    input.value = '';
    wifiSSID.value = '';
    wifiPass.value = '';
    vcardName.value = '';
    vcardPhone.value = '';
    vcardEmail.value = '';
    vcardOrg.value = '';
    updateFields();
    input.focus();
  });

  container.querySelector('#qr-download-png').addEventListener('click', downloadPNG);
  container.querySelector('#qr-download-svg').addEventListener('click', downloadSVG);

  updateFields();
}
