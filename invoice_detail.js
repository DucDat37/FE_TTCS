function downloadPDF() {
  const element = document.querySelector(".invoice");
  const opt = {
    margin: 0.5,
    filename: 'hoa_don.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}


async function fetchInvoiceDetail(id) {
  try{
    toggleLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
          throw new Error('Không tìm thấy token đăng nhập');
      }
    const response = await fetch(`http://localhost:5000/api/invoice/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (response.status === 401) {
      handleLogout();
      return;
    }
    const result = await response.json();

    if (result.isError) {
        throw new Error(result.message);
    }
    const invoiceData = result.data;

    // Cập nhật giao diện trực tiếp
    updateInvoiceUI(invoiceData);
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    toast.error('Không thể tải chi tiết hóa đơn. Vui lòng thử lại sau.');
  } finally {
    toggleLoading(false);
  }
}
function updateInvoiceUI(invoiceData) {
  // Thông tin chung
  document.getElementById('invoice-id').textContent = invoiceData.id;
  document.getElementById('invoice-date').textContent = invoiceData.createdAt;
  
  // Thông tin bệnh nhân
  document.getElementById('patient-name').textContent = invoiceData.patient.userName;
  document.getElementById('patient-id').textContent = invoiceData.patient.id;
  document.getElementById('patient-phone').textContent = invoiceData.patient.phone;

  // Thông tin bác sĩ
  document.getElementById('doctor-name').textContent = invoiceData.doctor.userName;
  document.getElementById('doctor-phone').textContent = invoiceData.doctor.phone;
  
  // Thông tin cuộc hẹn
  document.getElementById('appointment-date').textContent = invoiceData.appointment.date;
  document.getElementById('appointment-status').textContent = invoiceData.appointment.status;
  
  // Thông tin khung giờ
  document.getElementById('time-slot').textContent = 
  `${invoiceData.timeSlot.startDate.split(" ")[1]} - ${invoiceData.timeSlot.endDate.split(" ")[1]} ngày ${invoiceData.timeSlot.startDate.split(" ")[0]}`;


  // Điền thông tin dịch vụ vào bảng
  const serviceTable = document.getElementById('service-table');
  const row = serviceTable.insertRow();
  row.insertCell(0).textContent = "1";
  row.insertCell(1).textContent = invoiceData.service.name;
  row.insertCell(2).textContent = "1";
  row.insertCell(3).textContent = invoiceData.service.price.toLocaleString('vi-VN');
  row.insertCell(4).textContent = invoiceData.service.price.toLocaleString('vi-VN');

  // Điền thông tin tổng
  document.getElementById('total-amount').textContent = invoiceData.total.toLocaleString('vi-VN');
  document.getElementById('paid-amount').textContent = invoiceData.total.toLocaleString('vi-VN');
  document.getElementById('remaining-amount').textContent = "0";
  document.getElementById('invoice-status').textContent = invoiceData.status;
  document.getElementById('invoice-note').textContent = invoiceData.note;
};
// Gọi fetchInvoiceDetail khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const invoiceId = new URLSearchParams(window.location.search).get('id'); // Lấy ID từ URL
  if (invoiceId) {
    fetchInvoiceDetail(invoiceId);
  }
});