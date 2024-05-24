import { TableRenderData } from '../table-render-data.class';

const pipeRx = /\|/g;
const spacedContentRx = /^(\s*)(.*[^\s])(\s*)$/;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function outputFormatterMarkdown(renderData: TableRenderData, options?: {}): string {
  const { cellConfig, cellValueRendered, columnWidth, columns, rows, startX, startY } = renderData;
  let out = '';
  if (startY === 0) {
    for (let x = startX; x < columns; x++) {
      out += '|' + ' '.repeat(columnWidth[x] + 2);
    }
    out += '|\n';
  }
  for (let y = startY; y < rows; y++) {
    if (y === 0) {
      for (let x = startX; x < columns; x++) {
        const cellConfigs = cellConfig[x];
        const rightCount = cellConfigs.filter((config) => config.align === 'right').length;
        const centerCount = cellConfigs.filter((config) => config.align === 'center').length;
        const align = (rightCount > rows / 2 ? 'right' : centerCount > rows / 2 ? 'center' : undefined);
        out += '|' + (align === 'center' ? ':' : '-') + '-'.repeat(columnWidth[x]) + (align ? ':' : '-');
      }
      out += '|\n';
    }
    let targetLen = 0;
    let rowLen = 0;
    for (let x = startX; x < columns; x++) {
      const rendered = cellValueRendered[x][y];
      const width = columnWidth[x];
      let content = (rendered.trim() ? rendered.split('\n').join('<br>') : ' '.repeat(width))
        .replace(pipeRx, '&#124;');
      const { bold, italic, link } = cellConfig[x][y];
      if (!!content.trim()) {
        const pre = (italic ? '_' : '') + (bold ? '**' : '') + (link ? '[' : '');
        const post = (link ? `](${link})` : '') + (bold ? '**' : '') + (italic ? '_' : '');
        content = content.replace(spacedContentRx, `$1${pre}$2${post}$3`);
      }
      content = ' ' + content + (content.length < width ? ' '.repeat(width - content.length) : '') + ' ';
      targetLen += width + 3;
      rowLen += 1 + content.length;
      while (rowLen > targetLen && !content[content.length - 1].trim()) {
        content = content.substring(0, content.length - 1);
        rowLen--;
      }
      while (rowLen > targetLen && !content[0].trim()) {
        content = content.substring(1);
        rowLen--;
      }
      out += '|' + content;
    }
    out += '|\n';
  }
  return out;
}
