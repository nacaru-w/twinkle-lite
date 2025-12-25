/**
 * Finds today's date and returns it as a timestamp
 * @returns today's date as timestamp
 */
export function todayAsTimestamp(): string {
    const today = new Date();
    const timestamp = today.getTime().toString();

    return timestamp
}

/**
 * Parses a timestamp string and returns it formatted as a localized date string in Spanish.
 * 
 * @param timeStamp - The timestamp string to be parsed.
 * @returns A formatted date string in the format "day month year" in Spanish locale.
 */
export function parseTimestamp(timeStamp: string): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const date = new Date(timeStamp);
    return date.toLocaleDateString('es-ES', options)
}

/**
 * Converts a Date object to ISO timestamp format
 * 
 * @param date - A date object
 * @returns The date object converted to ISO timestamp format (string)
 */
export function convertDateToISO(date: Date): string {
    return date.toISOString();
}
export const today: string = parseTimestamp(todayAsTimestamp());