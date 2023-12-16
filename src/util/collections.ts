export default class Collections {
    static find<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
        for (const item of array) {
            if (predicate(item)) {
                return item;
            }
        }
        return undefined;
    }
    static shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}