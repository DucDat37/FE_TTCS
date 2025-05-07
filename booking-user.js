// Dữ liệu mẫu ngày và khung giờ
const days = [
    { date: 'Th 4, 07-05', slots: 2 },
    { date: 'Th 6, 09-05', slots: 7 },
    { date: 'Th 2, 12-05', slots: 8 },
    { date: 'Th 4, 14-05', slots: 8 },
    { date: 'Th 6, 16-05', slots: 8 },
    { date: 'Th 2, 19-05', slots: 8 },
];
const slotList = [
    '18:00 - 18:15', '18:15 - 18:30', '18:30 - 18:45', '18:45 - 19:00',
    '19:00 - 19:15', '19:15 - 19:30', '19:30 - 19:45', '19:45 - 20:00'
];
let selectedDay = 3;
let selectedSlot = null;
let dayStartIdx = 0;
const daysPerPage = 5;

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
            renderSlots();
        };
        tabWrap.appendChild(tab);
    }
    // Enable/disable buttons
    document.getElementById('prevDayBtn').disabled = dayStartIdx === 0;
    document.getElementById('nextDayBtn').disabled = dayStartIdx + daysPerPage >= days.length;
}

/**
 * Hiển thị các khung giờ khám cho ngày đã chọn.
 * Khi chọn khung giờ sẽ cập nhật lại nút xác nhận và thông tin đặt khám.
 */
function renderSlots() {
    const slotGrid = document.getElementById('slotGrid');
    slotGrid.innerHTML = '';
    slotList.forEach((slot, idx) => {
        // Giả lập: chỉ 2 slot đầu tiên của ngày đầu là disabled
        let disabled = (selectedDay === 0 && idx > 1);
        const btn = document.createElement('button');
        btn.className = `border rounded-lg py-3 text-center font-semibold transition-all ${selectedSlot === idx ? 'slot-active' : ''} ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50'}`;
        btn.textContent = slot;
        btn.disabled = disabled;
        btn.onclick = () => {
            if (disabled) return;
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
    if (selectedSlot !== null) {
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
    if (selectedSlot !== null) {
        infoDiv.innerHTML = `<div class='text-sm text-gray-700'>Ngày khám: <span class='font-semibold'>${days[selectedDay].date}</span></div><div class='text-sm text-gray-700'>Khung giờ: <span class='font-semibold'>${slotList[selectedSlot]}</span></div>`;
    } else {
        infoDiv.innerHTML = '';
    }
}

// Xử lý sự kiện khi bấm nút xác nhận đặt khám
// Nếu đã chọn khung giờ thì hiện alert thành công
// (Bạn có thể thay alert bằng logic gửi dữ liệu thực tế)
document.getElementById('confirmBtn').onclick = function() {
    if (selectedSlot !== null) {
        alert('Đặt lịch thành công!');
    }
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

// Khởi tạo giao diện ban đầu
renderTabs();
renderSlots(); 