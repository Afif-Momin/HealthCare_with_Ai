// Utility functions for date formatting (all display times in IST — Asia/Kolkata)

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000 // UTC+5:30

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
  } catch (error) {
    return dateString
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' IST'
  } catch (error) {
    return dateString
  }
}

export const formatDateInput = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const ist = new Date(date.getTime() + IST_OFFSET_MS)
    return ist.toISOString().slice(0, 10)
  } catch (error) {
    return dateString
  }
}

// Returns a YYYY-MM-DDTHH:mm string in IST — suitable for datetime-local inputs
export const formatDateTimeInput = (dateString) => {
  if (!dateString) return ''
  try {
    const ist = new Date(new Date(dateString).getTime() + IST_OFFSET_MS)
    return ist.toISOString().slice(0, 16)
  } catch (error) {
    return dateString
  }
}

// Current IST time as a datetime-local input value
export const nowIST = () => {
  const ist = new Date(Date.now() + IST_OFFSET_MS)
  return ist.toISOString().slice(0, 16)
}

// Convert a datetime-local string (treated as IST) to UTC ISO for API submission
export const istInputToUTC = (localStr) => {
  if (!localStr) return new Date().toISOString()
  const utcMs = new Date(localStr).getTime() - IST_OFFSET_MS
  return new Date(utcMs).toISOString()
}
