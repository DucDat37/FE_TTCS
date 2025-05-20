let allDoctors = [];
let currentPage = 1;
const itemsPerPage = 5;
let totalDoctors = 0;
let currentSearch = '';
let currentSpecialty = '';
let filteredDoctors = [];
let specialtiesCache = [];

// Hàm render danh sách bác sĩ
function renderDoctors(doctors) {
    const tbody = document.getElementById('doctorTableBody');
    tbody.innerHTML = '';
    if (!doctors.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" class="text-center py-4 text-gray-500">Không có dữ liệu</td>`;
        tbody.appendChild(tr);
        updateTableInfo(0, 0, 0);
        return;
    }

    // Get current user data
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = userData.id;
    const isDoctor = userData.role === 'Doctor';

    // Phân trang trên mảng đã lọc
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, doctors.length);
    for (let i = startIndex; i < endIndex; i++) {
        const doctor = doctors[i];
        // Xác định trạng thái
        let statusText = 'Bị khóa';
        let statusClass = 'bg-red-100 text-red-800';
        if (doctor.status === true) {
            statusText = 'Đang làm việc';
            statusClass = 'bg-green-100 text-green-800';
        }

        // Check if current user is doctor and if this is their record
        const showActions = !isDoctor || (isDoctor && doctor.userId === currentUserId);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${i + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${doctor.img || 'https://via.placeholder.com/40'}" alt="Doctor" class="h-10 w-10 rounded-full">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${doctor.userName || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${doctor.specialtyName || '--'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${doctor.degree || '--'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${doctor.description || '--'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${showActions ? `
                    <button onclick="openEditModal('${doctor.id}')" class="text-blue-500 hover:text-blue-700 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteDoctor('${doctor.id}')" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    }
    updateTableInfo(startIndex + 1, endIndex, doctors.length);
}

function updateTableInfo(start, end, total) {
    const tableInfo = document.getElementById('tableInfo');
    if (total === 0) {
        tableInfo.textContent = 'Không có kết quả';
    } else {
        tableInfo.textContent = `Hiển thị ${start}-${end} trên ${total} kết quả`;
    }
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    let html = '';
    html += `<button class="px-3 py-1 border rounded" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Trước</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="px-3 py-1 ${currentPage === i ? 'bg-blue-500 text-white' : 'border'} rounded" onclick="changePage(${i})">${i}</button>`;
    }
    html += `<button class="px-3 py-1 border rounded" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Sau</button>`;
    paginationContainer.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderDoctors(filteredDoctors);
    renderPagination();
}

// Hàm lấy danh sách chuyên khoa và render vào select
async function fetchSpecialties() {
    try {
        const response = await fetch('http://localhost:5000/api/specialty');
        const result = await response.json();
        if (result.statusCode === 200 && result.data && Array.isArray(result.data.specialty)) {
            const select = document.getElementById('specialtySelect');
            select.innerHTML = '<option value="">Tất cả chuyên khoa</option>';
            result.data.specialty.forEach(spe => {
                const option = document.createElement('option');
                option.value = spe.id;
                option.textContent = spe.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
    }
}

// Hàm fetch danh sách bác sĩ (lấy tất cả để filter FE)
async function fetchDoctors() {
    try {
        const response = await fetch(`http://localhost:5000/api/doctor?page=1&limit=1000`);
        const result = await response.json();
        if (result.statusCode === 200 && result.data && Array.isArray(result.data.doctors)) {
            allDoctors = result.data.doctors;
            applyFilter();
        }
    } catch (error) {
        alert('Không thể tải danh sách bác sĩ!');
    }
}

function applyFilter() {
    // Lọc theo chuyên khoa và search
    const searchTerm = currentSearch.trim().toLowerCase();
    filteredDoctors = allDoctors.filter(doctor => {
        const matchSpecialty = !currentSpecialty || (doctor.specialtyId && doctor.specialtyId === currentSpecialty);
        const matchSearch =
            (doctor.userName && doctor.userName.toLowerCase().includes(searchTerm)) ||
            (doctor.phone && doctor.phone.toLowerCase().includes(searchTerm)) ||
            (doctor.email && doctor.email.toLowerCase().includes(searchTerm));
        return matchSpecialty && matchSearch;
    });
    currentPage = 1;
    renderDoctors(filteredDoctors);
    renderPagination();
}

function handleFilter() {
    const searchInput = document.getElementById('searchInput');
    const specialtySelect = document.getElementById('specialtySelect');
    currentSearch = searchInput.value;
    currentSpecialty = specialtySelect.value;
    applyFilter();
}

// Hàm lấy thống kê và cập nhật UI
async function fetchAndUpdateStatistics() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('http://localhost:5000/api/statistic/doctor', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.statusCode === 200 && result.data) {
            const stats = result.data;
            
            // Cập nhật các số liệu thống kê
            document.querySelector('.bg-blue-50 p:nth-child(2)').textContent = stats.doctorCount;
            document.querySelector('.bg-green-50 p:nth-child(2)').textContent = stats.doctorActive;
            document.querySelector('.bg-yellow-50 p:nth-child(2)').textContent = stats.countAllTimeSlotOfDays;
            document.querySelector('.bg-red-50 p:nth-child(2)').textContent = stats.doctorInactive;

            // Cập nhật biểu đồ
            const ctx = document.getElementById('doctorChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: stats.chart.label,
                    datasets: [{
                        data: stats.chart.data,
                        backgroundColor: stats.chart.color
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching statistics:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchDoctors();
    fetchSpecialties();
    fetchAndUpdateStatistics();
    const searchInput = document.getElementById('searchInput');
    const specialtySelect = document.getElementById('specialtySelect');
    if (searchInput) {
        searchInput.addEventListener('input', handleFilter);
    }
    if (specialtySelect) {
        specialtySelect.addEventListener('change', handleFilter);
    }
});

// === EDIT DOCTOR ===

// Lấy danh sách chuyên khoa cho modal edit
async function fetchSpecialtiesForEdit(selectedId) {
    if (specialtiesCache.length === 0) {
        try {
            const response = await fetch('http://localhost:5000/api/specialty');
            const result = await response.json();
            if (result.statusCode === 200 && result.data && Array.isArray(result.data.specialty)) {
                specialtiesCache = result.data.specialty;
            }
        } catch (error) {}
    }
    const select = document.getElementById('editSpecialty');
    select.innerHTML = '<option value="">Chọn chuyên khoa</option>';
    specialtiesCache.forEach(spe => {
        const option = document.createElement('option');
        option.value = spe.id;
        option.textContent = spe.name;
        if (selectedId && spe.id === selectedId) option.selected = true;
        select.appendChild(option);
    });
}

function openEditModal(doctorId) {
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return;
    document.getElementById('editDoctorId').value = doctor.id;
    document.getElementById('editDegree').value = doctor.degree || '';
    document.getElementById('editDescription').value = doctor.description || '';
    fetchSpecialtiesForEdit(doctor.specialtyId);
    document.getElementById('editDoctorModal').style.display = 'block';
}

function closeEditDoctorModal() {
    document.getElementById('editDoctorModal').style.display = 'none';
}

document.getElementById('editDoctorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const doctorId = document.getElementById('editDoctorId').value;
    const degree = document.getElementById('editDegree').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const specialtyId = document.getElementById('editSpecialty').value;
    if (!degree || !description || !specialtyId) {
        toast.error('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const response = await fetch(`http://localhost:5000/api/doctor/update-by-admin/${doctorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ degree, description, specialtyId })
        });
        const result = await response.json();
        if (response.ok && result.statusCode === 200) {
            closeEditDoctorModal();
            fetchDoctors();
            fetchAndUpdateStatistics();
            toast.success('Cập nhật thành công!');
        } else {
            toast.error(result.message || 'Cập nhật thất bại!');
        }
    } catch (error) {
        toast.error('Có lỗi xảy ra!');
    }
});

async function deleteDoctor(doctorId) {
    if (!doctorId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) return;
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const response = await fetch(`http://localhost:5000/api/doctor/delete/${doctorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            toast.success('Xóa bác sĩ thành công!');
            fetchDoctors();
            fetchAndUpdateStatistics();
        } else {
            const result = await response.json();
            toast.error(result.message || 'Xóa bác sĩ thất bại!');
        }
    } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa!');
    }
}
