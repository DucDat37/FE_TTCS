// Global variables
let currentPage = 1;
const limit = 8;
let totalBookings = 0;
let bookings = [];
let allBookings = []; // Store all bookings for filtering

// Add Booking Modal Functions
let selectedTimeSlotId = null;

function openAddBookingModal() {
    document.getElementById('addBookingModal').classList.remove('hidden');
    loadServices();
    loadPatients();
    loadDoctors();
}

function closeAddBookingModal() {
    document.getElementById('addBookingModal').classList.add('hidden');
    document.getElementById('addBookingForm').reset();
    selectedTimeSlotId = null;
    document.getElementById('timeSlotsContainer').innerHTML = '';
}

// Load Services
async function loadServices() {
    try {
        const response = await fetch('http://localhost:5000/api/service', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }

        const result = await response.json();
        if (result.isError) {
            throw new Error(result.message);
        }

        const serviceSelect = document.getElementById('serviceSelect');
        serviceSelect.innerHTML = '<option value="">Chọn dịch vụ</option>';
        result.data.services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} - ${service.price.toLocaleString('vi-VN')}đ`;
            serviceSelect.appendChild(option);
        });
    } catch (error) {
        toast.error('Lỗi', error.message);
    }
}

// Load Patients
async function loadPatients() {
    try {
        const response = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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

        const patientSelect = document.getElementById('patientSelect');
        patientSelect.innerHTML = '<option value="">Chọn bệnh nhân</option>';
        
        // Group users by role
        const usersByRole = {};
        result.data.users.forEach(user => {
            if (!usersByRole[user.roleName]) {
                usersByRole[user.roleName] = [];
            }
            usersByRole[user.roleName].push(user);
        });

        // Add users to select box grouped by role
        Object.keys(usersByRole).forEach(roleName => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = roleName;
            
            usersByRole[roleName].forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.userName} - ${user.email}${user.phone ? ` (${user.phone})` : ''}`;
                optgroup.appendChild(option);
            });
            
            patientSelect.appendChild(optgroup);
        });
    } catch (error) {
        toast.error('Lỗi', error.message);
    }
}

// Load Doctors
async function loadDoctors() {
    try {
        // Get current user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = userData.id;
        const isDoctor = userData.role === 'Doctor';

        const response = await fetch('http://localhost:5000/api/doctor', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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

        const doctorSelect = document.getElementById('doctorSelect');
        doctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>';
        
        // If user is Doctor, filter to show only their record
        const doctors = isDoctor 
            ? result.data.doctors.filter(doctor => doctor.userId === currentUserId)
            : result.data.doctors;
        
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.userName} - ${doctor.degree}${doctor.specialtyName ? ` - ${doctor.specialtyName}` : ''}`;
            doctorSelect.appendChild(option);
        });
    } catch (error) {
        toast.error('Lỗi', error.message);
    }
}

// Load Time Slots
async function loadTimeSlots() {
    const doctorId = document.getElementById('doctorSelect').value;
    const date = document.getElementById('dateSelect').value;

    if (!doctorId || !date) {
        const timeSlotsContainer = document.getElementById('timeSlotsContainer');
        timeSlotsContainer.innerHTML = `
            <div class="col-span-4 text-center text-gray-500 py-4">
                Vui lòng chọn bác sĩ và ngày khám
            </div>
        `;
        return;
    }

    try {
        const formattedDate = date.split('-').reverse().join('/');
        const response = await fetch(`http://localhost:5000/api/timeSlot?doctorId=${doctorId}&date=${formattedDate}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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

        const timeSlotsContainer = document.getElementById('timeSlotsContainer');
        timeSlotsContainer.innerHTML = '';

        if (result.data.length === 0) {
            timeSlotsContainer.innerHTML = `
                <div class="col-span-4 text-center text-gray-500 py-4">
                    Không có khung giờ khám nào trong ngày này
                </div>
            `;
            return;
        }

        result.data.forEach(timeSlot => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.className = `p-3 border rounded-md text-center cursor-pointer transition-colors ${
                timeSlot.status ? 'hover:bg-blue-50' : 'bg-gray-100 cursor-not-allowed opacity-50'
            } ${selectedTimeSlotId === timeSlot.id ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`;
            
            if (timeSlot.status) {
                timeSlotDiv.onclick = () => selectTimeSlot(timeSlot.id, timeSlotDiv);
            }

            // Format time safely
            const formatTime = (dateStr) => {
                try {
                    // Split the date string into parts
                    const [datePart, timePart] = dateStr.split(' ');
                    const [day, month, year] = datePart.split('/');
                    const [hours, minutes] = timePart.split(':');
                    
                    // Create a new date object with the parsed values
                    const date = new Date(year, month - 1, day, hours, minutes);
                    
                    // Check if the date is valid
                    if (isNaN(date.getTime())) {
                        return 'Invalid Time';
                    }
                    
                    // Format the time
                    return date.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    });
                } catch (error) {
                    console.error('Error formatting time:', error);
                    return 'Invalid Time';
                }
            };

            const startTime = formatTime(timeSlot.startDate);
            const endTime = formatTime(timeSlot.endDate);
            timeSlotDiv.textContent = `${startTime} - ${endTime}`;
            
            timeSlotsContainer.appendChild(timeSlotDiv);
        });
    } catch (error) {
        toast.error('Lỗi', error.message);
        const timeSlotsContainer = document.getElementById('timeSlotsContainer');
        timeSlotsContainer.innerHTML = `
            <div class="col-span-4 text-center text-red-500 py-4">
                Không thể tải danh sách khung giờ khám. Vui lòng thử lại sau.
            </div>
        `;
    }
}

function selectTimeSlot(timeSlotId, element) {
    selectedTimeSlotId = timeSlotId;
    const timeSlots = document.querySelectorAll('#timeSlotsContainer > div');
    timeSlots.forEach(slot => {
        slot.classList.remove('bg-blue-500', 'text-white', 'hover:bg-blue-600');
        slot.classList.add('hover:bg-blue-50');
    });
    element.classList.remove('hover:bg-blue-50');
    element.classList.add('bg-blue-500', 'text-white', 'hover:bg-blue-600');
}

// Handle form submission
document.getElementById('addBookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedTimeSlotId) {
        toast.error('Lỗi', 'Vui lòng chọn khung giờ khám');
        return;
    }

    const serviceId = document.getElementById('serviceSelect').value;
    const patientId = document.getElementById('patientSelect').value;

    if (!serviceId || !patientId) {
        toast.error('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/booking/admin/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                timeSlotId: selectedTimeSlotId,
                serviceId: serviceId,
                patientId: patientId
            })
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();
        if (result.isError) {
            throw new Error(result.message);
        }

        toast.success('Thành công', 'Tạo lịch hẹn thành công');
        closeAddBookingModal();
        loadBookings(currentPage);
    } catch (error) {
        toast.error('Lỗi', error.message);
    }
});

// Event Listeners
document.getElementById('addBookingBtn').addEventListener('click', openAddBookingModal);
document.getElementById('doctorSelect').addEventListener('change', loadTimeSlots);
document.getElementById('dateSelect').addEventListener('change', loadTimeSlots);

// Fetch bookings data
async function fetchBookings(page = 1) {
    try {
        const response = await fetch(`http://localhost:5000/api/booking?page=${page}&limit=${limit}&sort=createdAt&order=DESC`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        if (data.isError) {
            throw new Error(data.message);
        }

        return data.data;
    } catch (error) {
        toast.error('Lỗi', error.message);
        return null;
    }
}

// Update bookings table
function updateBookingsTable(bookings) {
    const tableBody = document.getElementById('bookingsTable');
    tableBody.innerHTML = '';

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-3 px-4">${booking.code}</td>
            <td class="py-3 px-4">${booking.timeSlot.doctor.userName}</td>
            <td class="py-3 px-4">${booking.patient.userName}</td>
            <td class="py-3 px-4">${booking.timeSlot.startDate}</td>
            <td class="py-3 px-4">${booking.timeSlot.endDate}</td>
            <td class="py-3 px-4">${booking.service.name}</td>
            <td class="py-3 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }">
                    <span class="w-2 h-2 mr-1.5 rounded-full ${
                        booking.status 
                        ? 'bg-green-400' 
                        : 'bg-yellow-400'
                    }"></span>
                    ${booking.status ? 'Đã xác nhận' : 'Chờ xác nhận'}
                </span>
            </td>
            <td class="py-3 px-4">
                <button onclick="viewBooking('${booking.id}')" class="text-blue-500 hover:text-blue-700 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="updateBookingStatus('${booking.id}', ${!booking.status})" class="${
                    booking.status 
                    ? 'text-red-500 hover:text-red-700' 
                    : 'text-green-500 hover:text-green-700'
                }">
                    <i class="fas ${booking.status ? 'fa-times' : 'fa-check'}"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update pagination
function updatePagination(total, currentPage) {
    const totalPages = Math.ceil(total / limit);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            loadBookings(currentPage - 1);
        }
    };
    paginationContainer.appendChild(prevButton);

    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50';
        firstPageButton.textContent = '1';
        firstPageButton.onclick = () => loadBookings(1);
        paginationContainer.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded-md ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => loadBookings(i);
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.className = 'px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50';
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => loadBookings(totalPages);
        paginationContainer.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            loadBookings(currentPage + 1);
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Load bookings
async function loadBookings(page = 1) {
    currentPage = page;
    const data = await fetchBookings(page);
    if (data) {
        allBookings = data.bookings;
        totalBookings = data.total;
        updateBookingsTable(allBookings);
        updatePagination(totalBookings, currentPage);
        document.getElementById('currentDisplayed').textContent = allBookings.length;
        document.getElementById('totalBookings').textContent = totalBookings;
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filteredBookings = allBookings;

    // Apply status filter
    if (statusFilter !== '') {
        filteredBookings = filteredBookings.filter(booking => 
            booking.status.toString() === statusFilter
        );
    }

    // Apply search filter
    if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking => 
            booking.code.toLowerCase().includes(searchTerm) ||
            booking.timeSlot.doctor.userName.toLowerCase().includes(searchTerm) ||
            booking.patient.userName.toLowerCase().includes(searchTerm) ||
            booking.service.name.toLowerCase().includes(searchTerm)
        );
    }

    updateBookingsTable(filteredBookings);
    document.getElementById('currentDisplayed').textContent = filteredBookings.length;
    document.getElementById('totalBookings').textContent = totalBookings;
}

// View booking details
async function viewBooking(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/booking/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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

        const booking = result.data;

        // Update modal content
        document.getElementById('detailCode').textContent = booking.code;
        
        // Update status badge
        const statusElement = document.getElementById('detailStatus');
        statusElement.innerHTML = `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                booking.status 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }">
                <span class="w-2 h-2 mr-1.5 rounded-full ${
                    booking.status 
                    ? 'bg-green-400' 
                    : 'bg-yellow-400'
                }"></span>
                ${booking.status ? 'Đã xác nhận' : 'Chờ xác nhận'}
            </span>
        `;

        // Update patient info
        document.getElementById('detailPatientName').textContent = booking.patient.userName;
        document.getElementById('detailPatientEmail').textContent = booking.patient.email;
        document.getElementById('detailPatientPhone').textContent = booking.patient.phone || 'Chưa cập nhật';

        // Update time slot
        document.getElementById('detailStartDate').textContent = `Bắt đầu: ${booking.timeSlot.startDate}`;
        document.getElementById('detailEndDate').textContent = `Kết thúc: ${booking.timeSlot.endDate}`;

        // Update service info
        document.getElementById('detailServiceName').textContent = booking.service.name;
        document.getElementById('detailServicePrice').textContent = `Giá: ${booking.service.price.toLocaleString('vi-VN')}đ`;

        // Update timestamps
        document.getElementById('detailCreatedAt').textContent = booking.createdAt;
        document.getElementById('detailUpdatedAt').textContent = booking.updatedAt;

        // Show modal
        document.getElementById('detailBookingModal').classList.remove('hidden');
    } catch (error) {
        toast.error('Lỗi', error.message);
    }
}

// Close detail modal
function closeDetailBookingModal() {
    document.getElementById('detailBookingModal').classList.add('hidden');
}

// Update booking status
async function updateBookingStatus(id, newStatus) {
    try {
        const response = await fetch('http://localhost:5000/api/booking/update-status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                bookingId: id,
                status: newStatus
            })
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();
        if (result.isError) {
            throw new Error(result.message);
        }

        toast.success('Thành công', 'Cập nhật trạng thái lịch hẹn thành công');
        loadBookings(currentPage);
    } catch (error) {
        toast.error('Lỗi', error.message);
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', debounce(function() {
    applyFilters();
}, 300));

// Apply filters button
document.getElementById('applyFilters').addEventListener('click', () => {
    applyFilters();
});

// Status filter change
document.getElementById('statusFilter').addEventListener('change', () => {
    applyFilters();
});

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
}); 