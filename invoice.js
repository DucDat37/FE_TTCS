let currentPage = 1;
const limit = 8;
let allInvoices = [];
let filteredInvoices = [];
let searchQuery = '';
let statusFilter = '';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('access_token');
}

// Check authentication
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// Format currency to VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date to dd/mm/yyyy
function formatDate(dateString) {
    const datePart = dateString.split(' ')[0];
    return datePart;
}

// Format time slot to separate date and time
function formatTimeSlot(timeSlot) {
    if (!timeSlot || !timeSlot.startDate || !timeSlot.endDate) return { date: '-', time: '-' };
    const startDate = timeSlot.startDate.split(' ')[0];
    const startTime = timeSlot.startDate.split(' ')[1].substring(0, 5);
    const endTime = timeSlot.endDate.split(' ')[1].substring(0, 5);
    return {
        date: startDate,
        time: `${startTime} - ${endTime}`
    };
}

// Create status badge
function createStatusBadge(status) {
    const badge = document.createElement('span');
    badge.className = `status-badge ${status === 'Đã thanh toán' ? 'status-paid' : 'status-unpaid'}`;
    badge.textContent = status;
    return badge;
}

// Filter invoices based on search and status
function filterInvoices() {
    return allInvoices.filter(invoice => {
        const matchesSearch = !searchQuery || 
            invoice.appointment.code.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = !statusFilter || invoice.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

// Render invoices in the table
function renderInvoices(invoices) {
    const tbody = document.getElementById('invoiceTableBody');
    tbody.innerHTML = '';
    
    invoices.forEach((invoice, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-3 px-4 whitespace-nowrap">${(currentPage - 1) * limit + index + 1}</td>
            <td class="py-3 px-4 whitespace-nowrap">${invoice.appointment.code}</td>
            <td class="py-3 px-4 whitespace-nowrap">${invoice.doctor.userName}</td>
            <td class="py-3 px-4 whitespace-nowrap">${invoice.patient.userName}</td>
            <td class="py-3 px-4 whitespace-nowrap">${invoice.service.name}</td>
            <td class="py-3 px-4 whitespace-nowrap">${formatCurrency(invoice.total)}</td>
            <td class="py-3 px-4 whitespace-nowrap">${createStatusBadge(invoice.status).outerHTML}</td>
            <td class="py-3 px-4 whitespace-nowrap">${formatDate(invoice.createdAt)}</td>
            <td class="py-3 px-4 whitespace-nowrap">${formatTimeSlot(invoice.timeSlot).time}</td>
            <td class="py-3 px-4 whitespace-nowrap">
                <div class="flex space-x-2">
                    <button onclick="showInvoiceDetail('${invoice.id}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="openEditInvoiceModal('${invoice.id}')" class="text-yellow-600 hover:text-yellow-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="confirmDeleteInvoice('${invoice.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Render pagination
function renderPagination(total) {
    const totalPages = Math.ceil(total / limit);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.onclick = () => changePage(currentPage - 1);
    prevButton.disabled = currentPage === 1;
    pagination.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i);
        pagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.onclick = () => changePage(currentPage + 1);
    nextButton.disabled = currentPage === totalPages;
    pagination.appendChild(nextButton);

    // Update display count
    document.getElementById('currentDisplayed').textContent = filteredInvoices.length;
    document.getElementById('totalInvoices').textContent = total;
}

// Load invoices from API
async function loadInvoices() {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`http://localhost:5000/api/invoice?page=1&limit=9999`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();
        
        if (data?.statusCode === 200 && data?.data?.invoices) {
            allInvoices = data.data.invoices;
            updateDisplay();
        } else {
            showToast('error', 'Lỗi khi tải danh sách hóa đơn');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Lỗi khi tải danh sách hóa đơn');
    }
}

// Update display with current filters
function updateDisplay() {
    filteredInvoices = filterInvoices();
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const currentPageInvoices = filteredInvoices.slice(startIndex, endIndex);
    
    renderInvoices(currentPageInvoices);
    renderPagination(filteredInvoices.length);
}

// Change page
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    updateDisplay();
}

// Show invoice detail
async function showInvoiceDetail(invoiceId) {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`http://localhost:5000/api/invoice/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();
        
        if (data.statusCode === 200) {
            const invoice = data.data;
            
            document.getElementById('detailAppointmentCode').textContent = invoice.appointment.code;
            document.getElementById('detailStatus').innerHTML = createStatusBadge(invoice.status).outerHTML;
            
            const timeSlot = formatTimeSlot(invoice.timeSlot);
            document.getElementById('detailTimeSlotDate').textContent = timeSlot.date;
            document.getElementById('detailTimeSlotTime').textContent = timeSlot.time;
            
            document.getElementById('detailPatientName').textContent = invoice.patient.userName;
            document.getElementById('detailPatientEmail').textContent = invoice.patient.email;
            document.getElementById('detailPatientPhone').textContent = invoice.patient.phone;
            
            document.getElementById('detailDoctorName').textContent = invoice.doctor.userName;
            document.getElementById('detailDoctorEmail').textContent = invoice.doctor.email;
            document.getElementById('detailDoctorPhone').textContent = invoice.doctor.phone;
            
            document.getElementById('detailServiceName').textContent = invoice.service.name;
            document.getElementById('detailServicePrice').textContent = formatCurrency(invoice.service.price);
            
            document.getElementById('detailTotal').textContent = formatCurrency(invoice.total);
            document.getElementById('detailNote').textContent = invoice.note || '-';
            
            // Set medical record information
            if (invoice.medicalRecord) {
                document.getElementById('detailDiagnosis').textContent = invoice.medicalRecord.diagnosis || '-';
                document.getElementById('detailPrescription').textContent = invoice.medicalRecord.prescription || '-';
                document.getElementById('detailMedicalNote').textContent = invoice.medicalRecord.notes || '-';
            } else {
                document.getElementById('detailDiagnosis').textContent = '-';
                document.getElementById('detailPrescription').textContent = '-';
                document.getElementById('detailMedicalNote').textContent = '-';
            }
            
            document.getElementById('detailCreatedAt').textContent = formatDate(invoice.createdAt);
            document.getElementById('detailUpdatedAt').textContent = formatDate(invoice.updatedAt);
            
            document.getElementById('detailInvoiceModal').classList.remove('hidden');
        } else {
            showToast('error', 'Lỗi khi tải thông tin hóa đơn');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Lỗi khi tải thông tin hóa đơn');
    }
}

// Close invoice detail modal
function closeDetailInvoiceModal() {
    document.getElementById('detailInvoiceModal').classList.add('hidden');
}

// Format number to currency format
function formatNumber(number) {
    return new Intl.NumberFormat('vi-VN').format(number);
}

// Parse currency format to number
function parseCurrency(currencyString) {
    return parseInt(currencyString.replace(/[^\d]/g, '')) || 0;
}

// Load appointments for create invoice
async function loadAppointments() {
    if (!checkAuth()) return;

    try {
        const response = await fetch('http://localhost:5000/api/appointment?page=1&limit=9999', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();
        
        if (data?.statusCode === 200 && data?.data?.appointment) {
            const appointments = data.data.appointment.filter(apt => apt.status !== "Đã hủy");
            const select = document.getElementById('appointmentSelect');
            select.innerHTML = '<option value="">Chọn cuộc hẹn...</option>';
            
            appointments.forEach(apt => {
                const option = document.createElement('option');
                option.value = apt.id;
                option.textContent = `${apt.code} - ${apt.date} - ${apt.status}`;
                select.appendChild(option);
            });
        } else {
            showToast('error', 'Lỗi khi tải danh sách cuộc hẹn');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Lỗi khi tải danh sách cuộc hẹn');
    }
}

// Open create invoice modal
function openCreateInvoiceModal() {
    document.getElementById('createInvoiceModal').classList.remove('hidden');
    loadAppointments();
}

// Close create invoice modal
function closeCreateInvoiceModal() {
    document.getElementById('createInvoiceModal').classList.add('hidden');
    document.getElementById('createInvoiceForm').reset();
}

// Handle total amount input
document.getElementById('totalAmount')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
        value = parseInt(value);
        e.target.value = formatNumber(value);
    } else {
        e.target.value = '';
    }
});

// Handle create invoice form submission
document.getElementById('createInvoiceForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!checkAuth()) return;

    const appointmentId = document.getElementById('appointmentSelect').value;
    const totalInput = document.getElementById('totalAmount').value;
    const total = totalInput ? parseCurrency(totalInput) : null;
    const status = document.getElementById('invoiceStatus').value;
    const note = document.getElementById('invoiceNote').value;

    try {
        const response = await fetch('http://localhost:5000/api/invoice/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                appointmentId,
                total,
                status,
                note
            })
        });

        const data = await response.json();
        
        if (data.statusCode === 201 || data.statusCode === 200) {
            showToast('success', data.message || 'Tạo hóa đơn thành công');
            closeCreateInvoiceModal();
            await loadInvoices(); // Reload invoice list
        } else {
            showToast('error', data.message || 'Lỗi khi tạo hóa đơn');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Lỗi khi tạo hóa đơn');
    }
});

// Open edit invoice modal
async function openEditInvoiceModal(invoiceId) {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`http://localhost:5000/api/invoice/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        const data = await response.json();
        
        if (data.statusCode === 200) {
            const invoice = data.data;
            
            // Set invoice ID
            document.getElementById('editInvoiceId').value = invoice.id;
            
            // Set total amount
            document.getElementById('editTotalAmount').value = invoice.total ? formatNumber(invoice.total) : '';
            
            // Set status
            document.getElementById('editInvoiceStatus').value = invoice.status;
            
            // Set note
            document.getElementById('editInvoiceNote').value = invoice.note || '';
            
            // Show modal
            document.getElementById('editInvoiceModal').classList.remove('hidden');
        } else {
            showToast('error', 'Lỗi khi tải thông tin hóa đơn');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Lỗi khi tải thông tin hóa đơn');
    }
}

// Close edit invoice modal
function closeEditInvoiceModal() {
    document.getElementById('editInvoiceModal').classList.add('hidden');
    document.getElementById('editInvoiceForm').reset();
}

// Handle edit total amount input
document.getElementById('editTotalAmount')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value) {
        value = parseInt(value);
        e.target.value = formatNumber(value);
    } else {
        e.target.value = '';
    }
});

// Handle edit invoice form submission
document.getElementById('editInvoiceForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!checkAuth()) return;

    const invoiceId = document.getElementById('editInvoiceId').value;
    const totalInput = document.getElementById('editTotalAmount').value;
    const total = totalInput ? parseCurrency(totalInput) : null;
    const status = document.getElementById('editInvoiceStatus').value;
    const note = document.getElementById('editInvoiceNote').value;

    try {
        const response = await fetch(`http://localhost:5000/api/invoice/update/${invoiceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                total,
                status,
                note
            })
        });

        const data = await response.json();
        
        if (data.statusCode === 200) {
            showToast('success', data.message || 'Cập nhật hóa đơn thành công');
            closeEditInvoiceModal();
            await loadInvoices(); // Reload invoice list
        } else {
            showToast('error', data.message || 'Lỗi khi cập nhật hóa đơn');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Lỗi khi cập nhật hóa đơn');
    }
});

// Confirm and delete invoice
async function confirmDeleteInvoice(invoiceId) {
    if (!checkAuth()) return;
    
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/invoice/${invoiceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const data = await response.json();
            
            if (data.statusCode === 200) {
                showToast('success', data.message || 'Xóa hóa đơn thành công');
                await loadInvoices(); // Reload invoice list
            } else {
                showToast('error', data.message || 'Lỗi khi xóa hóa đơn');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('error', 'Lỗi khi xóa hóa đơn');
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!checkAuth()) return;

    // Initial load
    loadInvoices();

    // Search input event - search as user types
    document.getElementById('searchInput').addEventListener('input', () => {
        searchQuery = document.getElementById('searchInput').value;
        currentPage = 1;
        updateDisplay();
    });

    // Status filter event - filter immediately on change
    document.getElementById('statusFilter').addEventListener('change', () => {
        statusFilter = document.getElementById('statusFilter').value;
        currentPage = 1;
        updateDisplay();
    });

    // Close modal when clicking outside
    document.getElementById('detailInvoiceModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailInvoiceModal')) {
            closeDetailInvoiceModal();
        }
    });

    // Close create modal when clicking outside
    document.getElementById('createInvoiceModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('createInvoiceModal')) {
            closeCreateInvoiceModal();
        }
    });

    // Close edit modal when clicking outside
    document.getElementById('editInvoiceModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('editInvoiceModal')) {
            closeEditInvoiceModal();
        }
    });
}); 