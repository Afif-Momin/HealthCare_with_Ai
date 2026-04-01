// Utility functions for date formatting

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (error) {
    return dateString
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleString()
  } catch (error) {
    return dateString
  }
}

export const formatDateInput = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 10)
  } catch (error) {
    return dateString
  }
}

export const formatDateTimeInput = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    return dateString
  }
}

