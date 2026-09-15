import { readFileSync } from 'node:fs';
const files = [
  'src/tools/pure/text-transform.ts',
  'src/utils/search.ts',
  'src/store/index.ts',
  'src/tools/pure/encoding.ts',
  'index.html'
];
console.log('--- RegExp g + .test() (stateful lastIndex hrošč) ---');
for (const f of files) {
  try {
    const c = readFileSync(f,'utf8');
    const re = /new RegExp\([^)]*['\"]giu?['\"]\)[\s\S]{0,120}\.test\(/g;
    let m; let cnt=0;
    while ((m=re.exec(c))) { cnt++; console.log(`${f}: ${m[0].slice(0,120).replace(/\n/g,' ')}`); }
    if (cnt===0) console.log(`${f}: OK (ni g+test v isti funkciji)`);
  } catch {}
}
console.log('\n--- filterLines specifično ---');
const tf = readFileSync('src/tools/pure/text-transform.ts','utf8');
const fl = tf.match(/filterLines[\s\S]{0,300}RegExp[\s\S]{0,200}\.test/);
console.log(fl ? 'NEVARNO: filterLines uporablja /giu + .test v .filter (lastIndex se premika!)' : 'OK');

console.log('\n--- lookbehind podpora ---');
console.log(`wholeWordPattern uporablja (?<= : ${readFileSync('src/tools/pure/encoding.ts','utf8').includes('(?<=') ? 'DA (modern browser OK, Safari 16.4+)' : 'NE'}`);

console.log('\n--- store batch gnezdenje ---');
const store = readFileSync('src/store/index.ts','utf8');
console.log(`batchDepth: ${store.includes('batchDepth') ? 'OK' : 'manjka'}`);
console.log(`pushRecent znotraj batch: ${store.includes('pushRecent') && store.includes('store.batch') ? 'preveri gnezdenje' : 'OK'}`);

console.log('\n--- qrcode global ---');
const html = readFileSync('index.html','utf8');
console.log(`qrcode.min.js lokalno: ${html.includes('qrcode.min.js') ? 'OK' : 'manjka'}`);
console.log(`qrcode npm hkrati v package.json: ${readFileSync('package.json','utf8').includes('"qrcode"') ? 'DA (dvojno — pojasni v README)' : 'NE'}`);
