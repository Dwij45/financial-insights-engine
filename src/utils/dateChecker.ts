export const isFutureDate = (dateStr: string): boolean => {
  const inputDate = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)  // end of today is still valid
  return inputDate > today
}
