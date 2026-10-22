/**
 * Date and time helper utilities
 */

export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Tomorrow';
  try {
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [y, m, d] = cleanDate.split('-').map(Number);
    if (y && m && d) {
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatTimeDisplay(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  try {
    const timePart = isoStr.includes('T') ? isoStr.split('T')[1].substring(0, 5) : isoStr.substring(0, 5);
    if (timePart && timePart.includes(':')) {
      const [hStr, mStr] = timePart.split(':');
      const h = parseInt(hStr, 10);
      if (!isNaN(h)) {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:${mStr} ${period}`;
      }
    }
    return isoStr.substring(11, 16);
  } catch {
    return isoStr.substring(11, 16);
  }
}

