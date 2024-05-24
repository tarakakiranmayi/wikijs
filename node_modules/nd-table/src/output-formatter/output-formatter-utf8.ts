import { Color } from '../config/config.class';
import { TableRenderData } from '../table-render-data.class';

const separatorTypes = {
  ascii: ' -|+--++|+|+++++',
  rounded: ' ╴╷╮╶─╭┬╵╯│┤╰┴├┼',
  utf8: ' ╴╷┐╶─┌┬╵┘│┤└┴├┼'
} as const;

const ANSI_RESET = '\u001b[0m';

const ansiColors: { [color in Color]: string } = {
  black: '\u001b[30m',
  blue: '\u001b[34m',
  cyan: '\u001b[36m',
  default: '',
  green: '\u001b[32m',
  magenta: '\u001b[35m',
  red: '\u001b[31m',
  white: '\u001b[37m',
  yellow: '\u001b[33m'
};

type OutputFormatterFlavor = 'ascii' | 'utf8' | 'rounded';

interface UTF8OutputOptions {
  ansi?: boolean;
  flavor?: OutputFormatterFlavor;
  separatorSpaces?: number;
}

export function outputFormatterUTF8(renderData: TableRenderData, options?: UTF8OutputOptions): string {
  const ansi = !!(options?.ansi);
  const flavor = options?.flavor || 'utf8';
  const separators = separatorTypes[flavor] || separatorTypes.utf8;
  const separatorSpaces = (Math.floor(options?.separatorSpaces || 1) > 1 ? Math.floor(options?.separatorSpaces || 1) : 3);
  const { borders, cellConfig, columns, rows, startX, startY } = renderData;
  let out = '';
  for (let y = startY; y < rows; y++) {
    const len = borders.grid[startX]?.[y].length || 0;
    for (let i = 0; i < len; i++) {
      for (let x = startX; x < columns; x++) {
        const { bold, color } = cellConfig[x][y];
        const gridRow = borders.grid[x][y][i];
        const gridRowLen = gridRow.length;
        for (let ii = 0; ii < gridRowLen; ii++) {
          const part = gridRow[ii];
          if (Array.isArray(part)) {
            out += (ansi ? '\u001b[38;5;240m' : '') +
              separators[part[0]].repeat(ii === 1 && part[1] === 1 && gridRow[0] === '' ? separatorSpaces : part[1]) +
              (ansi ? ANSI_RESET : '');
          } else if (ansi && part.trim()) {
            const colorCode = color && color !== 'default' && ansiColors[color] || '';
            out += `${bold ? '\u001b[1m' : ''}${colorCode}${part}${bold || colorCode ? ANSI_RESET : ''}`;
          } else {
            out += part;
          }
        }
      }
    }
  }
  return out;
}
