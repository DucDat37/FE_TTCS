let allDoctors = [];

// Hàm render danh sách bác sĩ
function renderDoctors(doctors) {
    const tbody = document.getElementById('doctorTableBody');
    tbody.innerHTML = '';
    if (!doctors.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" class="text-center py-4 text-gray-500">Không có dữ liệu</td>`;
        tbody.appendChild(tr);
        return;
    }
    doctors.forEach((doctor, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${idx + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${doctor.img || 'https://via.placeholder.com/40'}" alt="Doctor" class="h-10 w-10 rounded-full">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${doctor.userName || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">--</td>
            <td class="px-6 py-4 whitespace-nowrap">--</td>
            <td class="px-6 py-4 whitespace-nowrap">${doctor.phone || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Đang làm việc
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="openEditModal()" class="text-blue-500 hover:text-blue-700 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteDoctor()" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Hàm fetch danh sách bác sĩ và render vào bảng
async function fetchDoctors() {
    try {
        const response = await fetch('http://localhost:5000/api/doctor');
        const result = await response.json();

        if (result.statusCode === 200 && result.data && Array.isArray(result.data.doctors)) {
            allDoctors = result.data.doctors;
            renderDoctors(allDoctors);
        }
    } catch (error) {
        alert('Không thể tải danh sách bác sĩ!');
    }
}

// Hàm lấy danh sách chuyên khoa và render vào select
async function fetchSpecialties() {
    try {
        const response = await fetch('http://localhost:5000/api/specialty');
        const result = await response.json();
        if (result.statusCode === 200 && result.data && Array.isArray(result.data.specialty)) {
            const select = document.getElementById('specialtySelect');
            // Xóa các option cũ (trừ option đầu)
            select.innerHTML = '<option value="">Tất cả chuyên khoa</option>';
            result.data.specialty.forEach(spe => {
                const option = document.createElement('option');
                option.value = spe.id;
                option.textContent = spe.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        // Có thể log lỗi nếu cần
    }
}

// Sửa lại hàm filter để so sánh theo id chuyên khoa
function handleFilter() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const specialtyId = document.getElementById('specialtySelect').value;
    const filtered = allDoctors.filter(doctor => {
        const matchSearch =
            (doctor.userName && doctor.userName.toLowerCase().includes(searchTerm)) ||
            (doctor.phone && doctor.phone.toLowerCase().includes(searchTerm)) ||
            (doctor.email && doctor.email.toLowerCase().includes(searchTerm));
        const matchSpecialty =
            !specialtyId || (doctor.specialtyId && doctor.specialtyId === specialtyId);
        return matchSearch && matchSpecialty;
    });
    renderDoctors(filtered);
}

// Gọi hàm khi trang load
window.onload = function() {
    fetchDoctors();
    fetchSpecialties();
    // ... các hàm khác nếu có
    const searchInput = document.getElementById('searchInput');
    const specialtySelect = document.getElementById('specialtySelect');
    if (searchInput) {
        searchInput.addEventListener('input', handleFilter);
    }
    if (specialtySelect) {
        specialtySelect.addEventListener('change', handleFilter);
    }
};

// Nếu muốn export cho module
// export { fetchDoctors }; 