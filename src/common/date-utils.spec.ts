import { getColombiaNow, getColombiaDateString } from './date-utils';

describe('date-utils (Colombia timezone UTC-5)', () => {

    it('8PM Colombia = 1AM UTC next day, debe dar fecha Colombia actual', () => {
        const utcDate = new Date('2026-04-30T01:00:00Z');
        const result = getColombiaDateString(utcDate);
        expect(result).toBe('20260429');
    });

    it('11PM Colombia = 4AM UTC next day, debe dar fecha Colombia actual', () => {
        const utcDate = new Date('2026-04-30T04:00:00Z');
        const result = getColombiaDateString(utcDate);
        expect(result).toBe('20260429');
    });

    it('Mediodia Colombia = 5PM UTC, debe dar la misma fecha', () => {
        const utcDate = new Date('2026-04-29T17:00:00Z');
        const result = getColombiaDateString(utcDate);
        expect(result).toBe('20260429');
    });

    it('getColombiaNow retorna Date a medianoche UTC de la fecha Colombia', () => {
        const utcDate = new Date('2026-04-30T03:00:00Z');
        const result = getColombiaNow(utcDate);
        expect(result.toISOString()).toBe('2026-04-29T00:00:00.000Z');
    });

    it('getColombiaNow medianoche Colombia = 5AM UTC', () => {
        const utcDate = new Date('2026-04-30T05:00:00Z');
        const result = getColombiaNow(utcDate);
        expect(result.toISOString()).toBe('2026-04-30T00:00:00.000Z');
    });

    it('cruce de mes: 30 Abril 11PM Colombia = 1 Mayo 4AM UTC', () => {
        const utcDate = new Date('2026-05-01T04:00:00Z');
        const result = getColombiaDateString(utcDate);
        expect(result).toBe('20260430');
    });

    it('cruce de año: 31 Dic 11PM Colombia = 1 Ene 4AM UTC', () => {
        const utcDate = new Date('2027-01-01T04:00:00Z');
        const result = getColombiaDateString(utcDate);
        expect(result).toBe('20261231');
    });

});
