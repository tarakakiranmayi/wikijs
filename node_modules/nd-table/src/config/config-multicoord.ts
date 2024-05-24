import { Container2D } from '../container-2d.class';

export function configMulticoord(input: number | string): number[] {
  const list: number[] = [];
  if (typeof input === 'string') {
    const parts = input.replace(/\s/g, '').split(',');
    for (const part of parts) {
      const matched = part.match(/^(-1|[0-9]+)(..(-1|[0-9]+))*$/);
      if (!matched || !(+matched[1] >= -1) || (matched[3] && !(+matched[3] >= -1))) {
        throw new Error(`Invalid coordinate spec: "${part}" in "${input}"`);
      }
      let from = +matched[1];
      let til = +matched[matched[3] != null ? 3 : 1];
      if (from > til) {
        [from, til] = [til, from];
      }
      for (let i = from; i <= til; i++) {
        list.push(i);
      }
    }
  } else {
    Container2D.checkCoordinate(input);
    list.push(input);
  }
  return list;
}
