const { equal } = require('assert');
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { Table } = require('./bin/table.class.js');

const table = new Table('Welcome', 'To', 'The Table!')
    .setOutputFormat('utf8', { flavor: 'rounded' })
    .addRowWithHead('features',
        { value: 'ANSI colors', color: 'magenta' },
        { value: 'ANSI bold', bold: true },
        { value: 'alignment', align: 'right' })
    .addRowWithHead('vertical',
        'auto-aligns numbers',
        { value: 'has borders', border: true },
        { value: 'HTML/MD links', link: 'https://github.com/gvarsanyi/nd-table' })
    .addRowWithHead('headers',
        1234,
        { value: 'multiline\ncontents with\nalignment', align: 'center' },
        { value: 'vertical align', valign: 'bottom' });

const variants = [
  table.toString(),
  table.toString({ ansi: true }),
  table.toString('utf8', { flavor: 'rounded' }),
  table.toString({ ansi: true, flavor: 'rounded' }),
  table.toASCII(),
  table.toASCII({ ansi: true }),
  table.toMarkdown(),
  table.toCSV(),
  table.toTSV(),
  table.toHTML(),
  table.toHTML({ styles: true }),
  table.toJSON(),
  table.toJSON({ compact: true }),
  table.setCellConfig(0, 0, { borderBottom: true }).setColumnConfig(0, { borderRight: true }).toString(),
  table.flip().toString(),
  table.flip().toString()
];

const output = variants.join('\n\n');
writeFileSync('test-result.txt', output);
const expectation = readFileSync('test-expectation.txt', 'utf8');
try {
  equal(output, expectation, 'Output matches expectation');
} catch (e) {
  console.error('Test failed:\n');
  try {
    console.error(execSync('diff test-result.txt test-expectation.txt', { encoding: 'utf8' }));
  } catch (e) {
    console.error(e.stdout);
  }
  process.exit(1);
}

console.log(variants[3]);
