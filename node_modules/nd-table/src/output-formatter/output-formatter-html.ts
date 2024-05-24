import { TableRenderData } from '../table-render-data.class';

export function outputFormatterHTML(renderData: TableRenderData, options?: { styles?: boolean }): string {
  const { cellConfig, cellValueRendered, columnHeaders, columns, rows, startX, startY } = renderData;
  const tab = columnHeaders ? '  ' : '';
  let out = '<table>\n';
  for (let y = startY; y < rows; y++) {
    if (y === -1) {
      out += '  <thead>\n';
    }
    if (columnHeaders && !y) {
      out += '  </thead>\n';
      out += '  <tbody>\n';
    }
    out += tab + '  <tr>\n';
    const tag = (y === -1 ? 'th' : 'td');
    for (let x = startX; x < columns; x++) {
      const styles: string[] = [];
      let link1 = '';
      let link2 = '';
      const config = cellConfig[x][y];
      if (options?.styles) {
        config.color && config.color !== 'default' && styles.push('color: ' + config.color);
        config.bold && styles.push('font-weight: bold');
        config.italic && styles.push('font-style: italic');
        config.align && styles.push('text-align: ' + config.align);
      }
      if (config.link) {
        link1 = `<a href="${config.link}">`;
        link2 = '</a>';
      }
      const content = cellValueRendered[x][y].split('<').join('&lt;').split('>').join('&gt;').split('\n').join('<br>').trim() ||
        (link1 ? 'link' : '');
      out += `${tab}    <${tag}${content && styles.length ? ` style="${styles.join('; ')}"` : ''}>${link1}${content}${link2}</${tag}>\n`;
    }
    out += tab + '  </tr>\n';
  }
  if (columnHeaders) {
    out += '  </tbody>\n';
  }
  return out + '</table>\n';
}
