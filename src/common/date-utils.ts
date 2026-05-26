const COL_UTC_OFFSET = 5;

function getColombiaDate(): { year: number; month: number; day: number } {
    const now = new Date();
    const colombiaMs = now.getTime() - COL_UTC_OFFSET * 60 * 60 * 1000;
    const colombiaDate = new Date(colombiaMs);
    return {
        year: colombiaDate.getUTCFullYear(),
        month: colombiaDate.getUTCMonth() + 1,
        day: colombiaDate.getUTCDate(),
    };
}

export function getColombiaNow(): Date {
    const { year, month, day } = getColombiaDate();
    return new Date(Date.UTC(year, month - 1, day));
}

export function getColombiaDateString(): string {
    const { year, month, day } = getColombiaDate();
    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}
