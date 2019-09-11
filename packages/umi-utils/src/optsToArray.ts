/**
 * Convert string to arrays，make sure you return to an array
 * @param item
 * @return Array<any>
 */
export default function optsToArray(item?: any): Array<any> {
  if (item === null || item === undefined) return [];
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}
