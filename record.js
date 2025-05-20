// Biến toàn cục
let currentPage = 1;
const itemsPerPage = 12;
let totalRecords = 0;
let allRecords = [];
let doctorData = {};

async function populateDoctorSelect() {
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

        // Filter doctors if user is Doctor
        const doctors = isDoctor 
            ? result.data.doctors.filter(doctor => doctor.userId === currentUserId)
            : result.data.doctors;

        doctorData = {};
        doctors.forEach(doctor => {
            doctorData[doctor.id] = doctor;
        });

        const filterDoctorSelect = document.getElementById('filterDoctor');
        filterDoctorSelect.innerHTML = '<option value="">Tất cả bác sĩ</option>';
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.userName} - ${doctor.degree}${doctor.specialtyName ? ` - ${doctor.specialtyName}` : ''}`;
            filterDoctorSelect.appendChild(option);
        });

        fetchRecords();
    } catch (error) {
        console.error('Error populating doctor select:', error);
        toast.error('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
    }
}

// Hàm lấy danh sách hồ sơ bệnh án
async function fetchRecords() {
    try {
        toggleLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const doctorId = document.getElementById('filterDoctor').value;
        const url = `http://localhost:5000/api/record?page=${currentPage}&limit=${itemsPerPage}&sort=createdAt&order=DESC`;

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

        if (!response.ok) {
            throw new Error(result.message || 'Có lỗi xảy ra khi lấy danh sách hồ sơ bệnh án');
        }

        // Lọc theo doctorId nếu có
        let filteredRecords = result.data.record;
        if (doctorId) {
            filteredRecords = result.data.record.filter(record => record.doctorId === doctorId);
        }

        allRecords = filteredRecords;
        totalRecords = filteredRecords.length;
        renderTableData(allRecords);
        renderPagination();
    } catch (error) {
        console.error('Error fetching records:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi lấy danh sách hồ sơ bệnh án');
    } finally {
        toggleLoading(false);
    }
}

// Hàm render dữ liệu bảng
function renderTableData(data) {
    const tableBody = document.getElementById('recordTableBody');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                Không có dữ liệu
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        data.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${record.appointment ? record.appointment.code : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${record.doctor.userName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${record.diagnosis}</td>
                <td class="px-6 py-4 text-sm text-center" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${record.prescription}">${record.prescription}</td>
                <td class="px-6 py-4 text-sm text-center" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${record.notes === 'None' ? 'N/A' : record.notes}">${record.notes === 'None' ? 'N/A' : record.notes}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">${record.createdAt}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button onclick="openUpdateModal('${record.id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="confirmDelete('${record.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('tableInfo').textContent = `Hiển thị ${data.length} kết quả`;
}

// Hàm render phân trang
function renderPagination() {
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.className = `px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`;
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchRecords();
        }
    };
    paginationContainer.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `px-3 py-1 rounded mx-1 ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        pageButton.onclick = () => {
            currentPage = i;
            fetchRecords();
        };
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.className = `px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchRecords();
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Hàm hiển thị/ẩn loading spinner
function toggleLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

// Hàm xử lý đăng xuất
function handleLogout() {
    localStorage.removeItem('access_token');
    window.location.href = 'auth.html';
}

// Các hàm modal
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
    fetchAppointmentsForSelect();
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addRecordForm').reset();
}

// Hàm lấy danh sách lịch hẹn cho select
async function fetchAppointmentsForSelect() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/appointment?page=1&limit=100&sort=date&order=DESC', {
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

        const appointmentSelect = document.getElementById('appointmentSelect');
        appointmentSelect.innerHTML = '<option value="">Chọn lịch hẹn</option>';
        
        // Lọc các lịch hẹn chưa có hồ sơ bệnh án
        const appointments = result.data.appointment.filter(appointment => !appointment.recordId);
        
        appointments.forEach(appointment => {
            const option = document.createElement('option');
            option.value = appointment.id;
            option.textContent = `${appointment.code} - ${appointment.date}`;
            appointmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
    }
}

async function addRecord(e) {
    e.preventDefault();
    
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const appointmentId = document.getElementById('appointmentSelect').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const prescription = document.getElementById('prescription').value;
        const notes = document.getElementById('notes').value;

        if (!appointmentId || !diagnosis || !prescription) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const response = await fetch('http://localhost:5000/api/record/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                medicalAppointmentId : appointmentId,
                diagnosis,
                prescription,
                notes: notes || ''
            })
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Có lỗi xảy ra khi thêm hồ sơ bệnh án');
        }

        toast.success('Thêm hồ sơ bệnh án thành công');
        closeAddModal();
        fetchRecords();
    } catch (error) {
        console.error('Error adding record:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi thêm hồ sơ bệnh án');
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredRecords = allRecords.filter(record => 
        (record.appointment ? record.appointment.code.toLowerCase().includes(searchTerm) : false) ||
        record.doctor.userName.toLowerCase().includes(searchTerm) ||
        record.doctor.specialtyName.toLowerCase().includes(searchTerm) ||
        record.diagnosis.toLowerCase().includes(searchTerm) ||
        record.prescription.toLowerCase().includes(searchTerm) ||
        (record.notes !== 'None' && record.notes.toLowerCase().includes(searchTerm))
    );
    renderTableData(filteredRecords);
});


document.addEventListener('DOMContentLoaded', () => {
    populateDoctorSelect();
    

    document.getElementById('filterDoctor').addEventListener('change', () => {
        currentPage = 1;
        fetchRecords();
    });

    document.getElementById('addRecordForm').addEventListener('submit', addRecord);
});


document.addEventListener('DOMContentLoaded', () => {
    const modalHtml = `
        <div id="updateModal" class="modal">
            <div class="modal-content" style="width: 500px;">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Cập nhật hồ sơ bệnh án</h3>
                    <button onclick="closeUpdateModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="updateRecordForm" class="space-y-4">
                    <input type="hidden" id="updateRecordId">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Chuẩn đoán</label>
                        <input type="text" id="updateDiagnosis" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Kê đơn thuốc</label>
                        <textarea id="updatePrescription" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Ghi chú</label>
                        <textarea id="updateNotes" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="closeUpdateModal()" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                            Hủy
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    

    document.getElementById('updateRecordForm').addEventListener('submit', updateRecord);
});


async function openUpdateModal(recordId) {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch(`http://localhost:5000/api/record/${recordId}`, {
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

        document.getElementById('updateRecordId').value = recordId;
        document.getElementById('updateDiagnosis').value = result.data.diagnosis;
        document.getElementById('updatePrescription').value = result.data.prescription;
        document.getElementById('updateNotes').value = result.data.notes;
        
        document.getElementById('updateModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching record details:', error);
        toast.error('Không thể tải thông tin hồ sơ bệnh án. Vui lòng thử lại sau.');
    }
}


function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
    document.getElementById('updateRecordForm').reset();
}


async function updateRecord(e) {
    e.preventDefault();
    
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const recordId = document.getElementById('updateRecordId').value;
        const diagnosis = document.getElementById('updateDiagnosis').value;
        const prescription = document.getElementById('updatePrescription').value;
        const notes = document.getElementById('updateNotes').value;

        if (!diagnosis || !prescription) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const response = await fetch(`http://localhost:5000/api/record/update/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                diagnosis,
                prescription,
                notes: notes || ''
            })
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Có lỗi xảy ra khi cập nhật hồ sơ bệnh án');
        }

        toast.success('Cập nhật hồ sơ bệnh án thành công');
        closeUpdateModal();
        fetchRecords();
    } catch (error) {
        console.error('Error updating record:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ bệnh án');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modalHtml = `
        <div id="deleteModal" class="modal">
            <div class="modal-content" style="width: 400px;">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Xác nhận xóa</h3>
                    <button onclick="closeDeleteModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mb-4">
                    <p class="text-gray-600">Bạn có chắc chắn muốn xóa hồ sơ bệnh án này không?</p>
                </div>
                <div class="flex justify-end space-x-3">
                    <button onclick="closeDeleteModal()" class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                        Hủy
                    </button>
                    <button onclick="deleteRecord()" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
});

let recordToDelete = null;


function confirmDelete(recordId) {
    recordToDelete = recordId;
    document.getElementById('deleteModal').style.display = 'block';
}


function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    recordToDelete = null;
}


async function deleteRecord() {
    if (!recordToDelete) return;
    
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch(`http://localhost:5000/api/record/delete/${recordToDelete}`, {
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
            throw new Error(result.message || 'Có lỗi xảy ra khi xóa hồ sơ bệnh án');
        }

        toast.success('Xóa hồ sơ bệnh án thành công');
        closeDeleteModal();
        fetchRecords();
    } catch (error) {
        console.error('Error deleting record:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi xóa hồ sơ bệnh án');
    }
}