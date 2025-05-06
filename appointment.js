// Global variables
let currentPage = 1;
const itemsPerPage = 8;
let currentFilteredData = [];
let searchTimeout = null;

// Function to show/hide loading spinner
function toggleLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const table = document.querySelector('table');
    if (show) {
        spinner.classList.remove('hidden');
        table.classList.add('opacity-50');
    } else {
        spinner.classList.add('hidden');
        table.classList.remove('opacity-50');
    }
}

// Function to render pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchAppointments();
        }
    };
    paginationContainer.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            fetchAppointments();
        };
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchAppointments();
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Function to get status class
function getStatusClass(status) {
    switch (status) {
        case 'Chờ khám':
            return 'status-confirmed';
        case 'Đã khám xong':
            return 'status-completed';
        case 'Đã xuất hóa đơn':
            return 'status-billed';
        case 'Đã hủy':
            return 'status-cancelled';
        default:
            return '';
    }
}

// Function to render table data
function renderTableData(data) {
    const tableBody = document.getElementById('appointmentTableBody');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Không có dữ liệu
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        data.forEach((appointment, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${appointment.code}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${appointment.bookingCode}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${appointment.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(appointment.status)}">
                        ${appointment.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button class="text-blue-500 hover:text-blue-700 mr-3" onclick="openUpdateStatusModal('${appointment.id}', '${appointment.status}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteAppointment('${appointment.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('tableInfo').textContent = `Hiển thị ${data.length} kết quả`;
}

// Function to filter data based on search term and status
function filterData(data, searchTerm, statusFilter) {
    return data.filter(item => {
        const matchesSearch = searchTerm === '' || 
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === '' || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

// Function to fetch appointments
async function fetchAppointments() {
    try {
        const statusFilter = document.getElementById('filterStatus').value;
        const searchTerm = document.getElementById('searchInput').value.trim();
        toggleLoading(true);
        
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const url = `http://localhost:5000/api/appointment?page=${currentPage}&limit=${itemsPerPage}&sort=date&order=DESC`;
        
        const response = await fetch(url, {
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

        let filteredData = filterData(result.data.appointment, searchTerm, statusFilter);
        currentFilteredData = filteredData;
        renderTableData(currentFilteredData);
        renderPagination(result.data.total);

    } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Không thể tải danh sách xác nhận hẹn khám. Vui lòng thử lại sau.');
    } finally {
        toggleLoading(false);
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Modal functions
function openUpdateStatusModal(id, currentStatus) {
    document.getElementById('updateAppointmentId').value = id;
    document.getElementById('updateStatusSelect').value = currentStatus;
    document.getElementById('updateStatusModal').style.display = 'block';
}

function closeUpdateStatusModal() {
    document.getElementById('updateStatusModal').style.display = 'none';
}

// Handle form submit
document.getElementById('updateStatusForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('updateAppointmentId').value;
    const status = document.getElementById('updateStatusSelect').value;
    
    try {
        toggleLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch(`http://localhost:5000/api/appointment/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ status })
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        }

        toast.success('Cập nhật trạng thái thành công!');
        closeUpdateStatusModal();
        fetchAppointments();
    } catch (error) {
        console.error('Error updating appointment status:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
        toggleLoading(false);
    }
});

// Function to delete appointment
async function deleteAppointment(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
        return;
    }

    try {
        toggleLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch(`http://localhost:5000/api/appointment/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Có lỗi xảy ra khi xóa lịch hẹn');
        }

        toast.success('Xóa lịch hẹn thành công!');
        fetchAppointments();
    } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi xóa lịch hẹn');
    } finally {
        toggleLoading(false);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchAppointments();
    
    // Add event listener for status filter
    document.getElementById('filterStatus').addEventListener('change', () => {
        currentPage = 1;
        fetchAppointments();
    });

    // Add event listener for search input with debounce
    document.getElementById('searchInput').addEventListener('input', (e) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            fetchAppointments();
        }, 300); // 300ms debounce
    });
}); 