type ScheduleSlot = { day: string; period: string };

const WEEKS_PER_MONTH = 4;
const HOURS_PER_SHIFT = 4; // giả định 1 ca = 4 giờ khi tính từ "giờ"

/**
 * Quy đổi lương về /tháng. Coi 1 tháng = 4 tuần.
 * - "tháng" → giữ nguyên
 * - "buổi" | "ca" → salary × số ca/tuần × 4
 * - "giờ" → salary × HOURS_PER_SHIFT × số ca/tuần × 4
 */
export const calculateMonthlySalary = (
  salary: number,
  salaryUnit: string,
  workingSchedule: ScheduleSlot[] = []
): number => {
  if (!salary) return 0;
  const unit = (salaryUnit || "").toLowerCase().trim();

  if (unit === "tháng") return salary;

  const sessionsPerWeek = workingSchedule.length || 0;
  if (sessionsPerWeek === 0) return salary;

  if (unit === "giờ") {
    return salary * HOURS_PER_SHIFT * sessionsPerWeek * WEEKS_PER_MONTH;
  }

  // "buổi", "ca", hoặc rỗng → coi như mỗi slot là 1 buổi/ca
  return salary * sessionsPerWeek * WEEKS_PER_MONTH;
};
