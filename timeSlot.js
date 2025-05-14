// Global variables
let doctorData = {};
let currentPage = 1;
const itemsPerPage = 4;
let currentFilteredData = [];
let timeSlotChart = null;

// Function to fetch statistics
async function fetchStatistics() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/statistic/timeslot', {
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

        // Update statistics
        updateStatistics(result.data);
        
        // Update chart
        if (timeSlotChart) {
            timeSlotChart.data.datasets[0].data = result.data.chart.data;
            timeSlotChart.update();
        }

    } catch (error) {
        console.error('Error fetching statistics:', error);
        toast.error('Không thể tải thống kê. Vui lòng thử lại sau.');
    }
}

// Function to update statistics
function updateStatistics(data) {
    document.getElementById('totalCount').textContent = data.totalCount;
    document.getElementById('todayCount').textContent = data.todayCount;
    document.getElementById('readyCount').textContent = data.readyCount;
    document.getElementById('rejectCount').textContent = data.rejectCount;
}

// Chart initialization
function initChart() {
    const ctx = document.getElementById('timeSlotChart').getContext('2d');
    timeSlotChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Lịch khám mới',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Function to format datetime-local input
function formatDateTimeForInput(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month}-${day}T${timePart}`;
}

// Function to format date from DD/MM/YYYY HH:mm:ss to DD/MM/YYYY
function formatDateOnly(dateString) {
    return dateString.split(' ')[0];
}

// Function to format time from DD/MM/YYYY HH:mm:ss to HH:mm:ss
function formatTimeOnly(dateString) {
    return dateString.split(' ')[1];
}

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
            renderTableData(currentFilteredData);
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
            renderTableData(currentFilteredData);
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
            renderTableData(currentFilteredData);
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Function to render table data
function renderTableData(filteredData) {
    const tableBody = document.getElementById('timeSlotTableBody');
    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                Không có dữ liệu
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        const currentPageData = filteredData.slice(startIndex, endIndex);

        currentPageData.forEach((slot, index) => {
            const doctor = doctorData[slot.doctorId] || {};
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${startIndex + index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${doctor.userName || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${doctor.specialtyName || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${formatDateOnly(slot.startDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${formatTimeOnly(slot.startDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${formatTimeOnly(slot.endDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${slot.status ? 'status-confirmed' : 'status-cancelled'}">
                        ${slot.status ? 'Sẵn sàng' : 'Bị hủy'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button onclick="editTimeSlot('${slot.id}')" class="text-blue-500 hover:text-blue-700 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTimeSlot('${slot.id}')" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('tableInfo').textContent = `Hiển thị ${filteredData.length} kết quả`;
    renderPagination(filteredData.length);
}

// Function to populate doctor selects
async function populateDoctorSelects() {
    try {
        // Get current user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = userData.id;
        const isDoctor = userData.role === 'Doctor';

        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/doctor', {
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

        // If user is Doctor, filter to show only their record
        const doctors = isDoctor 
            ? result.data.doctors.filter(doctor => doctor.userId === currentUserId)
            : result.data.doctors;

        doctorData = {};
        doctors.forEach(doctor => {
            doctorData[doctor.id] = doctor;
        });

        const createOption = (doctor) => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.userName} - ${doctor.degree}${doctor.specialtyName ? ` - ${doctor.specialtyName}` : ''}`;
            return option;
        };

        // Populate filter doctor select
        const filterDoctorSelect = document.getElementById('filterDoctor');
        filterDoctorSelect.innerHTML = '<option value="">Tất cả bác sĩ</option>';
        doctors.forEach((doctor, index) => {
            filterDoctorSelect.appendChild(createOption(doctor));
            if (index === 0) {
                filterDoctorSelect.value = doctor.id;
            }
        });

        // Populate add modal doctor select
        const doctorSelect = document.getElementById('doctorSelect');
        doctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>';
        doctors.forEach(doctor => {
            doctorSelect.appendChild(createOption(doctor));
        });

        // Populate edit modal doctor select
        const editDoctorSelect = document.getElementById('editDoctorSelect');
        editDoctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>';
        doctors.forEach(doctor => {
            editDoctorSelect.appendChild(createOption(doctor));
        });

        fetchTimeSlots();
    } catch (error) {
        console.error('Error populating doctor selects:', error);
        toast.error('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
    }
}

// Function to fetch time slots
async function fetchTimeSlots() {
    try {
        const doctorId = document.getElementById('filterDoctor').value;
        const date = document.getElementById('filterDate').value;
        
        if (!doctorId || !date) {
            const tableBody = document.getElementById('timeSlotTableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                        Vui lòng chọn bác sĩ và ngày khám
                    </td>
                </tr>
            `;
            document.getElementById('tableInfo').textContent = 'Hiển thị 0 kết quả';
            document.getElementById('pagination').innerHTML = '';
            currentFilteredData = [];
            return;
        }

        toggleLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }
        
        const formattedDate = date.split('-').reverse().join('/');
        const url = `http://localhost:5000/api/timeSlot?doctorId=${doctorId}&date=${formattedDate}`;
        
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

        const statusFilter = document.getElementById('filterStatus').value;
        let filteredData = result.data;
        if (statusFilter !== '') {
            filteredData = result.data.filter(item => item.status.toString() === statusFilter);
        }

        currentFilteredData = filteredData;
        currentPage = 1;
        renderTableData(currentFilteredData);

    } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Không thể tải danh sách lịch khám. Vui lòng thử lại sau.');
    } finally {
        toggleLoading(false);
    }
}

// Function to open add modal
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

// Function to close add modal
function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

// Function to open edit modal and fetch time slot details
async function editTimeSlot(timeSlotId) {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        toggleLoading(true);

        const response = await fetch(`http://localhost:5000/api/timeSlot/${timeSlotId}`, {
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

        const timeSlot = result.data;
        document.getElementById('editTimeSlotId').value = timeSlot.id;
        document.getElementById('editDoctorSelect').value = timeSlot.doctorId;
        document.getElementById('editStartTime').value = formatDateTimeForInput(timeSlot.startDate);
        document.getElementById('editEndTime').value = formatDateTimeForInput(timeSlot.endDate);
        document.getElementById('editStatus').value = timeSlot.status.toString();

        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        console.error('Error fetching time slot details:', error);
        toast.error('Không thể tải thông tin lịch khám. Vui lòng thử lại sau.');
    } finally {
        toggleLoading(false);
    }
}

// Function to close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Function to delete time slot
async function deleteTimeSlot(timeSlotId) {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch khám này?')) {
        return;
    }

    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        toggleLoading(true);

        const response = await fetch(`http://localhost:5000/api/timeSlot/delete/${timeSlotId}`, {
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
            throw new Error(result.message || 'Có lỗi xảy ra khi xóa lịch khám');
        }

        toast.success('Xóa lịch khám thành công!');
        fetchTimeSlots();

    } catch (error) {
        console.error('Error deleting time slot:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi xóa lịch khám. Vui lòng thử lại sau.');
    } finally {
        toggleLoading(false);
    }
}

// Function to create default time slot
async function createDefaultTimeSlot() {
    const doctorId = document.getElementById('doctorSelect').value;
    
    if (!doctorId) {
        toast.warning('Vui lòng chọn bác sĩ!');
        return;
    }

    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/timeSlot/createDefaultTimeSlot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ doctorId })
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Có lỗi xảy ra khi tạo lịch khám mặc định');
        }

        toast.success('Tạo lịch khám mặc định thành công!');
        closeAddModal();
        document.getElementById('addAppointmentForm').reset();
        fetchTimeSlots();
    } catch (error) {
        console.error('Error creating default time slot:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi tạo lịch khám mặc định. Vui lòng thử lại sau.');
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    populateDoctorSelects();
    fetchStatistics();
    
    // Set current date as default
    document.getElementById('filterDate').valueAsDate = new Date();

    // Add event listeners for filters
    document.getElementById('filterDoctor').addEventListener('change', fetchTimeSlots);
    document.getElementById('filterDate').addEventListener('change', fetchTimeSlots);
    document.getElementById('filterStatus').addEventListener('change', fetchTimeSlots);

    // Add form submission handlers
    document.getElementById('addAppointmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const doctorId = document.getElementById('doctorSelect').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const status = document.getElementById('status').value === 'true';

        if (!doctorId) {
            toast.warning('Vui lòng chọn bác sĩ!');
            return;
        }

        if (!startTime) {
            toast.warning('Vui lòng chọn giờ bắt đầu!');
            return;
        }

        if (!endTime) {
            toast.warning('Vui lòng chọn giờ kết thúc!');
            return;
        }

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        };

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (startDate >= endDate) {
            toast.warning('Giờ kết thúc phải sau giờ bắt đầu!');
            return;
        }

        const requestBody = {
            doctorId: doctorId,
            startDate: formatDate(startTime),
            endDate: formatDate(endTime),
            status: status
        };

        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('Không tìm thấy token đăng nhập');
            }

            const response = await fetch('http://localhost:5000/api/timeSlot/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Có lỗi xảy ra khi thêm lịch khám');
            }

            toast.success('Thêm lịch khám thành công!');
            closeAddModal();
            this.reset();
            fetchTimeSlots();
        } catch (error) {
            console.error('Error adding time slot:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi thêm lịch khám. Vui lòng thử lại sau.');
        }
    });

    document.getElementById('editAppointmentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const timeSlotId = document.getElementById('editTimeSlotId').value;
        const doctorId = document.getElementById('editDoctorSelect').value;
        const startTime = document.getElementById('editStartTime').value;
        const endTime = document.getElementById('editEndTime').value;
        const status = document.getElementById('editStatus').value === 'true';

        if (!doctorId) {
            toast.warning('Vui lòng chọn bác sĩ!');
            return;
        }

        if (!startTime) {
            toast.warning('Vui lòng chọn giờ bắt đầu!');
            return;
        }

        if (!endTime) {
            toast.warning('Vui lòng chọn giờ kết thúc!');
            return;
        }

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        };

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (startDate >= endDate) {
            toast.warning('Giờ kết thúc phải sau giờ bắt đầu!');
            return;
        }

        const requestBody = {
            doctorId: doctorId,
            startDate: formatDate(startTime),
            endDate: formatDate(endTime),
            status: status
        };

        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                throw new Error('Không tìm thấy token đăng nhập');
            }

            const response = await fetch(`http://localhost:5000/api/timeSlot/update/${timeSlotId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Có lỗi xảy ra khi cập nhật lịch khám');
            }

            toast.success('Cập nhật lịch khám thành công!');
            closeEditModal();
            this.reset();
            fetchTimeSlots();
        } catch (error) {
            console.error('Error updating time slot:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật lịch khám. Vui lòng thử lại sau.');
        }
    });
}); 