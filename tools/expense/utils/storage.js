const STORAGE_KEY = 'expense_records'
const TEMPLATE_KEY = 'expense_template'

export function getRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function addRecord(record) {
  const records = getRecords()
  record.id = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
  record.createdAt = new Date().toISOString()
  record.updatedAt = record.createdAt
  records.unshift(record)
  saveRecords(records)
  return record
}

export function updateRecord(id, updates) {
  const records = getRecords()
  const index = records.findIndex(r => r.id === id)
  if (index === -1) return null
  records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() }
  saveRecords(records)
  return records[index]
}

export function deleteRecord(id) {
  const records = getRecords()
  const filtered = records.filter(r => r.id !== id)
  saveRecords(filtered)
  return filtered
}

export function getRecord(id) {
  const records = getRecords()
  return records.find(r => r.id === id) || null
}

export function checkDuplicate(invoiceNumber, excludeId = null) {
  const records = getRecords()
  return records.find(r => 
    r.invoiceNumber === invoiceNumber && 
    r.id !== excludeId
  ) || null
}

export function getTemplate() {
  try {
    const data = localStorage.getItem(TEMPLATE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function saveTemplate(templateData) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templateData))
}

export function hasTemplate() {
  return !!getTemplate()
}

export function generateMockInvoiceNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateId() {
  return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}