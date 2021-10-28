export function assert(value, message) {
    if (!value)
        throw new Error(message);
}
export function compose({ fns, args, }) {
    if (fns.length === 1) {
        return fns[0];
    }
    const last = fns.pop();
    return fns.reduce((a, b) => () => b(a, args), last);
}
export function isPromiseLike(obj) {
    return !!obj && typeof obj === 'object' && typeof obj.then === 'function';
}
