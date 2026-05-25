const COL_TZ = 'America/Bogota';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: COL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

export function getColombiaNow(): Date {
    const str = dateFormatter.format(new Date());
    const [year, month, day] = str.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

export function getColombiaDateString(): string {
    return dateFormatter.format(new Date()).replace(/-/g, '');
}
