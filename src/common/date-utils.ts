const COL_UTC_OFFSET = 5;

function getColombiaDate(now: Date = new Date()): { year: number; month: number; day: number } {
    const colombiaMs = now.getTime() - COL_UTC_OFFSET * 60 * 60 * 1000;
    const colombiaDate = new Date(colombiaMs);
    return {
        year: colombiaDate.getUTCFullYear(),
        month: colombiaDate.getUTCMonth() + 1,
        day: colombiaDate.getUTCDate(),
    };
}

export function getColombiaNow(now: Date = new Date()): Date {
    const { year, month, day } = getColombiaDate(now);
    return new Date(Date.UTC(year, month - 1, day));
}

export function getColombiaDateString(now: Date = new Date()): string {
    const { year, month, day } = getColombiaDate(now);
    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}
