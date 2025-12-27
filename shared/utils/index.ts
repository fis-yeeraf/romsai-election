export function formatThaiDate(dateInput: Date | string | number): string {
  // แปลง input ให้เป็น Date Object (รองรับทั้ง string และ timestamp)
  const date = new Date(dateInput)

  // ตรวจสอบว่าเป็นวันที่ที่ถูกต้องหรือไม่
  if (isNaN(date.getTime())) return "Invalid Date"

  // 1. จัดการเรื่องเวลา (18.00)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0") // เติม 0 ข้างหน้าถ้าไม่ครบ 2 หลัก

  // 2. จัดการเรื่องเดือน (ม.ค.)
  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ]
  const month = thaiMonths[date.getMonth()]

  // 3. จัดการเรื่องปี (69) -> ค.ศ. + 543 แล้วตัดเอา 2 ตัวท้าย
  const yearBE = date.getFullYear() + 543
  const shortYear = yearBE.toString().slice(-2)

  // 4. ประกอบร่าง
  return `เวลา ${hours}.${minutes} น. ${date.getDate()} ${month} ${shortYear}`
}
