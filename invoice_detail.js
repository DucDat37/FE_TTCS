let isDataLoaded = false;
function printInvoice() {
  // Ẩn nút in trước khi in
  const btn = document.querySelector('.print-btn');
  btn.style.display = 'none';

  window.print();

  // Hiện lại nút in sau khi in (chờ 1 giây để đảm bảo quá trình in đã bắt đầu)
  setTimeout(() => {
    btn.style.display = 'block';
  }, 1000);
}
function exportToPDF() {
  const element = document.querySelector('.invoice');

  const options = {
    margin: 0.5,
    filename: 'hoa_don.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 1.5,                      // tăng độ phân giải ảnh cho nét hơn
      useCORS: true,                 // hỗ trợ lấy ảnh từ domain khác
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.body.scrollWidth
    },
    jsPDF: {
      unit: 'mm',                   // đơn vị inch
      format: [210, 300],            // khổ giấy A4
      orientation: 'portrait'       // dọc
    }
  }

  html2pdf().set(options).from(element).save();
}

function toggleLoading(show) {
  const loadingElement = document.getElementById('loading');
  if (!loadingElement) return;

  if (show) {
    loadingElement.style.display = 'block';
  } else {
    loadingElement.style.display = 'none';
  }
}
// Gọi fetchInvoiceDetail khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const invoiceId = new URLSearchParams(window.location.search).get('id'); // Lấy ID từ URL
  console.log(invoiceId)
  if (invoiceId) {
    fetchInvoiceDetail(invoiceId);
  }
});
function getAuthHeader() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`
  };
}
function handleApiError(error) {
  console.error('API Error:', error);

  if (error.status === 401 || error.message?.includes('access_token') || error.message?.includes('authorization')) {
    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
    localStorage.removeItem('access_token');
    window.location.href = 'auth.html';
  } else {
    alert('Đã xảy ra lỗi. Vui lòng thử lại sau!');
  }
}
async function fetchInvoiceDetail(id) {
  try {
    toggleLoading(true);
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Không tìm thấy token đăng nhập');
    }
    const response = await fetch(`http://localhost:5000/api/invoice/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) {
      if (response.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('access_token');
        window.location.href = 'auth.html';
        return;
      }
      throw new Error(`Server responded with status: ${response.status}`);
    }
    const result = await response.json();

    if (result.isError) {
      throw new Error(result.message);
    }

    const invoiceData = result.data;
    console.log(invoiceData);
    // Cập nhật giao diện trực tiếp
    updateInvoiceUI(invoiceData);
    isDataLoaded = true;
    // Hiển thị nút xuất PDF sau khi có dữ liệu
    document.querySelector('.print-btn').style.display = 'block';
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

