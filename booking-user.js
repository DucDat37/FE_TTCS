// Dữ liệu mẫu ngày và khung giờ
let days = [
    { date: 'Th 4, 07-05', slots: 4 },
    { date: 'Th 6, 09-05', slots: 7 },
    { date: 'Th 2, 12-05', slots: 8 },
    { date: 'Th 4, 14-05', slots: 8 },
    { date: 'Th 6, 16-05', slots: 8 },
    { date: 'Th 2, 19-05', slots: 8 },
];
let slotList = [
    '18:00 - 18:15', '18:15 - 18:30', '18:30 - 18:45', '18:45 - 19:00',
    '19:00 - 19:15', '19:15 - 19:30', '19:30 - 19:45', '19:45 - 20:00'
];
let timeSlots = []; // Thêm mảng lưu thông tin khung giờ
let selectedDay = 3;
let selectedSlot = null;
let dayStartIdx = 0;
const daysPerPage = 5;
let services = []; // Thêm biến lưu trữ danh sách dịch vụ

/**
 * Hiển thị các khung giờ khám cho ngày đã chọn.
 * Khi chọn khung giờ sẽ cập nhật lại nút xác nhận và thông tin đặt khám.
 */
function renderSlots() {
    const slotGrid = document.getElementById('slotGrid');
    slotGrid.innerHTML = '';
    
    slotList.forEach((slot, idx) => {
        const btn = document.createElement('button');
        btn.className = `border rounded-lg py-3 text-center font-semibold transition-all ${selectedSlot === idx ? 'slot-active' : ''} hover:bg-blue-50`;
        btn.textContent = slot;
        btn.onclick = () => {
            selectedSlot = idx;
            renderSlots();
            updateConfirmBtn();
            updateSelectedInfo();
        };
        slotGrid.appendChild(btn);
    });
    updateConfirmBtn();
    updateSelectedInfo();
}

/**
 * Cập nhật trạng thái và style cho nút xác nhận đặt khám.
 * Chỉ bật nút khi đã chọn khung giờ.
 */
function updateConfirmBtn() {
    const btn = document.getElementById('confirmBtn');
    const serviceSelect = document.getElementById('serviceSelect');
    if (selectedSlot !== null && serviceSelect.value) {
        btn.className = 'w-full py-3 rounded-lg bg-blue-600 text-white font-semibold mb-3';
        btn.disabled = false;
        btn.style.cursor = 'pointer';
    } else {
        btn.className = 'w-full py-3 rounded-lg bg-gray-300 text-gray-500 font-semibold mb-3 cursor-not-allowed';
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    }
}

/**
 * Hiển thị thông tin ngày khám và khung giờ đã chọn bên dưới phần thông tin bác sĩ.
 */
function updateSelectedInfo() {
    const infoDiv = document.getElementById('selectedInfo');
    const serviceSelection = document.getElementById('serviceSelection');
    if (selectedSlot !== null) {
        infoDiv.innerHTML = `<div class='text-sm text-gray-700'>Ngày khám: <span class='font-semibold'>${days[selectedDay].date}</span></div><div class='text-sm text-gray-700'>Khung giờ: <span class='font-semibold'>${slotList[selectedSlot]}</span></div>`;
        serviceSelection.classList.remove('hidden');
    } else {
        infoDiv.innerHTML = '';
        serviceSelection.classList.add('hidden');
    }
}

// Hàm tạo và hiển thị toast
function showToast(title, message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? '<i class="fas fa-check-circle text-green-500 text-xl"></i>'
        : '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>';
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Thêm class show để hiển thị toast với animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Xử lý nút đóng
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };
    
    // Tự động đóng sau 5 giây
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Xử lý sự kiện khi bấm nút xác nhận đặt khám
document.getElementById('confirmBtn').onclick = async function() {
    const serviceSelect = document.getElementById('serviceSelect');
    if (selectedSlot !== null && serviceSelect.value) {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showToast('Lỗi', 'Vui lòng đăng nhập để đặt lịch', 'error');
            return;
        }

        try {
            const selectedServiceId = serviceSelect.value;
            const selectedTimeSlot = timeSlots[selectedSlot];

            const response = await fetch('http://localhost:5000/api/booking/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timeSlotId: selectedTimeSlot.id,
                    serviceId: selectedServiceId
                })
            });

            const result = await response.json();
            if (result.statusCode === 201) {
                showToast('Đặt khám thành công', 'Vui lòng kiểm tra email để xác nhận');
                // Reset form sau khi đặt lịch thành công
                selectedSlot = null;
                serviceSelect.value = '';
                renderSlots();
                updateSelectedInfo();
                updateConfirmBtn();
            } else {
                showToast('Lỗi', result.message || 'Đặt lịch thất bại', 'error');
            }
        } catch (error) {
            console.error('Lỗi khi đặt lịch:', error);
            showToast('Lỗi', 'Có lỗi xảy ra khi đặt lịch', 'error');
        }
    }
};

// Thêm sự kiện khi thay đổi dịch vụ
document.getElementById('serviceSelect').onchange = function() {
    updateConfirmBtn();
};

// Xử lý nút trượt sang trái (xem các ngày trước)
document.getElementById('prevDayBtn').onclick = function() {
    if (dayStartIdx > 0) {
        dayStartIdx--;
        renderTabs();
    }
};
// Xử lý nút trượt sang phải (xem các ngày sau)
document.getElementById('nextDayBtn').onclick = function() {
    if (dayStartIdx + daysPerPage < days.length) {
        dayStartIdx++;
        renderTabs();
    }
};

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const adminPage = document.getElementById('adminPage');
    
    if (token) {
        // Đã đăng nhập
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        if(userData.role === 'Admin'){
            adminPage.classList.remove('hidden');
        }

        // Cập nhật thông tin người dùng
        if (userData.img) {
            userAvatar.src = userData.img;
        }
        if (userData.userName) {
            userName.textContent = userData.userName;
        }
    } else {
        // Chưa đăng nhập
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
        adminPage.classList.add('hidden');
        
        // Thêm sự kiện click vào nút đăng nhập
        loginBtn.onclick = function() {
            window.location.href = 'auth.html';
        };
    }
}

// Hiển thị hoặc ẩn dropdown menu
function toggleDropdown() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    dropdownMenu.classList.toggle('hidden');
}

// Xử lý đăng xuất
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Ẩn dropdown khi click ra ngoài
window.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!userDropdown.contains(event.target) && !dropdownMenu.classList.contains('hidden')) {
        dropdownMenu.classList.add('hidden');
    }
});

// Lấy ID bác sĩ từ URL
function getDoctorIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        userId: urlParams.get('userId'),
        doctorId: urlParams.get('doctorId')
    };
}

// Fetch thông tin bác sĩ
async function fetchDoctorInfo() {
    const { userId, doctorId } = getDoctorIdFromUrl();
    if (!userId || !doctorId) {
        console.error('Không tìm thấy thông tin bác sĩ');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/doctor/${userId}`);
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            displayDoctorInfo(result.data);
        } else {
            console.error('Lỗi khi lấy thông tin bác sĩ:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
    }
}

// Hiển thị thông tin bác sĩ
function displayDoctorInfo(doctor) {
    const doctorInfoContainer = document.querySelector('.w-96.bg-white.rounded-xl.shadow.p-8.flex.flex-col.items-center');
    if (!doctorInfoContainer) return;

    const doctorInfo = doctorInfoContainer.querySelector('.flex.items-center.gap-4.mb-6.w-full');
    if (doctorInfo) {
        doctorInfo.innerHTML = `
            <img src="${doctor.img}" alt="${doctor.userName}" class="w-16 h-16 rounded-full object-cover border">
            <div>
                <div class="font-bold text-base">${doctor.degree} ${doctor.userName}</div>
                <div class="text-sm text-gray-500">${doctor.address}</div>
            </div>
        `;
    }
}

// Fetch lịch khám của bác sĩ
async function fetchDoctorSchedule() {
    const {userId, doctorId } = getDoctorIdFromUrl();
    if (!doctorId) {
        console.error('Không tìm thấy ID bác sĩ');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/timeSlot/schedule/${doctorId}`);
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            days = result.data.map(item => ({
                date: item.title,
                slots: item.total,
            }));
            renderTabs();
            renderSlots();
        } else {
            console.error('Lỗi khi lấy lịch khám:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
    }
}

// Fetch khung giờ khám của bác sĩ theo ngày
async function fetchTimeSlots(date) {
    const { doctorId } = getDoctorIdFromUrl();
    const token = localStorage.getItem('access_token');
    
    if (!doctorId) {
        console.error('Không tìm thấy ID bác sĩ');
        return;
    }

    if (!token) {
        console.error('Vui lòng đăng nhập để xem lịch khám');
        return;
    }

    // Chuyển đổi định dạng ngày từ "Th 4, 07-05" thành "07/05/2025"
    const formattedDate = date.split(', ')[1].replace('-', '/') + '/2025';

    try {
        const response = await fetch(`http://localhost:5000/api/timeSlot?doctorId=${doctorId}&date=${formattedDate}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            // Lưu toàn bộ thông tin khung giờ
            timeSlots = result.data;
            // Chuyển đổi dữ liệu từ API thành định dạng slotList
            slotList = timeSlots.map(slot => {
                const startTime = slot.startDate.split(' ')[1].substring(0, 5);
                const endTime = slot.endDate.split(' ')[1].substring(0, 5);
                return `${startTime} - ${endTime}`;
            });
            renderSlots();
        } else {
            console.error('Lỗi khi lấy khung giờ:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
    }
}

/**
 * Hiển thị các tab ngày (tối đa 5 ngày/lần), kèm nút trượt trái/phải.
 * Khi chọn ngày sẽ cập nhật lại tab và khung giờ.
 */
function renderTabs() {
    const tabWrap = document.getElementById('dateTabs');
    tabWrap.innerHTML = '';
    for (let i = dayStartIdx; i < Math.min(dayStartIdx + daysPerPage, days.length); i++) {
        const d = days[i];
        const idx = i;
        const tab = document.createElement('button');
        tab.className = `px-4 py-2 font-semibold text-sm focus:outline-none ${selectedDay === idx ? 'tab-active' : ''}`;
        tab.innerHTML = `<div>${d.date}</div><div class='text-green-600 text-xs'>${d.slots} khung giờ</div>`;
        tab.onclick = () => {
            selectedDay = idx;
            selectedSlot = null;
            renderTabs();
            // Fetch khung giờ khi chọn ngày
            fetchTimeSlots(d.date);
        };
        tabWrap.appendChild(tab);
    }
    // Enable/disable buttons
    document.getElementById('prevDayBtn').disabled = dayStartIdx === 0;
    document.getElementById('nextDayBtn').disabled = dayStartIdx + daysPerPage >= days.length;
}

// Fetch danh sách dịch vụ
async function fetchServices() {
    try {
        const response = await fetch('http://localhost:5000/api/service');
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            services = result.data.services;
            updateServiceSelect();
        } else {
            console.error('Lỗi khi lấy danh sách dịch vụ:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API dịch vụ:', error);
    }
}

// Cập nhật select box dịch vụ
function updateServiceSelect() {
    const serviceSelect = document.getElementById('serviceSelect');
    serviceSelect.innerHTML = '<option value="">-- Chọn dịch vụ --</option>';
    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} - ${service.price.toLocaleString('vi-VN')}đ`;
        serviceSelect.appendChild(option);
    });
}

// Gọi hàm checkLoginStatus, fetchDoctorInfo và fetchDoctorSchedule khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    fetchDoctorInfo();
    fetchDoctorSchedule();
    fetchServices(); // Thêm fetch danh sách dịch vụ
    // Fetch khung giờ cho ngày đầu tiên
    if (days.length > 0) {
        fetchTimeSlots(days[0].date);
    }
});

// Khởi tạo giao diện ban đầu
renderTabs();
renderSlots(); 