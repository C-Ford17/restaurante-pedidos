/**
 * Utility functions for handling dates in Colombia Time (UTC-5)
 */

export function getColombiaDateRange(startDateStr?: string | null, endDateStr?: string | null) {
    // If no startDate provided, use current day in Colombia
    let startStr = startDateStr;
    let endStr = endDateStr || startDateStr;

    if (!startStr) {
        const now = new Date();
        const colTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
        startStr = colTime.toISOString().split('T')[0];
        endStr = startStr;
    }

    // Ensure we take only the YYYY-MM-DD part if a full ISO string was passed
    const cleanStart = startStr!.substring(0, 10);
    const cleanEnd = endStr!.substring(0, 10);

    // Construct dates with Colombia offset (-05:00)
    // This correctly converts them to UTC for Prisma queries
    const start = new Date(`${cleanStart}T00:00:00-05:00`);
    const end = new Date(`${cleanEnd}T23:59:59.999-05:00`);

    return { start, end };
}

/**
 * Returns the date string (YYYY-MM-DD) for a given UTC date in Colombia Time
 */
export function toColombiaDateString(utcDate: Date | string) {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    const colTime = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    return colTime.toISOString().split('T')[0];
}

/**
 * Returns the current date in Colombia as YYYY-MM-DD
 */
export function getColombiaToday() {
    const now = new Date();
    const colTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
    return colTime.toISOString().split('T')[0];
}
