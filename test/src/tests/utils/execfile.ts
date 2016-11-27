export function execFile(path: string) {
  eval.call(global, require('fs').readFileSync(path, 'utf8'));
}
export default execFile;