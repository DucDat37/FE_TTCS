// Initialize CKEditor for the description field
let editor;
let accessToken = '';

document.addEventListener("DOMContentLoaded", function() {
    // Get access token from localStorage
    accessToken = localStorage.getItem('access_token');
    
    // Check if user is authenticated
    if (!accessToken) {
        alert('Bạn cần đăng nhập để sử dụng chức năng này!');
        window.location.href = 'auth.html';
        return;
    }

    // Initialize CKEditor
    ClassicEditor
        .create(document.querySelector('#description'))
        .then(newEditor => {
            editor = newEditor;
        })
        .catch(error => {
            console.error('CKEditor initialization failed:', error);
        });

    // Load existing services when page loads
    loadServices();

    // Set up form submission handler
    document.getElementById('serviceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addService();
    });
});

// Function to get Authorization header
function getAuthHeader() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };
}

// Function to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    
    // Check if it's an authentication error
    if (error.status === 401 || error.message?.includes('access_token') || error.message?.includes('authorization')) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('access_token');
        window.location.href = 'auth.html';
    } else {
        alert('Đã xảy ra lỗi. Vui lòng thử lại sau!');
    }
}

// Function to add a new service
async function addService() {
    try {
        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const description = editor.getData();

        // Validate inputs
        if (!name || !price) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Prepare data to send to API
        const serviceData = {
            name: name,
            price: Number(price),
            description: description // HTML content from CKEditor
        };

        console.log('Sending data to API:', serviceData);
        console.log('Description length:', description.length, 'characters');
        console.log('Description:', description);
        // For debugging - show what's being sent
        const jsonData = JSON.stringify(serviceData);
        console.log('JSON data length:', jsonData.length, 'characters');
        console.log('Using token:', accessToken);

        // Call API to add service - using fetch with proper content type
        const response = await fetch('http://localhost:5000/api/service/add', {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Accept': 'application/json'
            },
            body: jsonData
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Convert text back to JSON if possible
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            alert('Server không trả về định dạng JSON hợp lệ');
            return;
        }

        if (!response.ok) {
            if (response.status === 401) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            console.error('API Error:', result);
            alert(`Lỗi từ server: ${result.message || 'Không xác định'}`);
            throw new Error(`Server responded with status: ${response.status}`);
        }

        if (result.isError === false) {
            // Reset form
            document.getElementById('serviceForm').reset();
            editor.setData('');
            
            // Show success message
            alert('Tạo mới dịch vụ thành công!');
            
            // Reload services list
            loadServices();
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error('Error adding service:', error);
        alert('Đã xảy ra lỗi khi thêm dịch vụ. Vui lòng thử lại sau!');
    }
}

// Function to load all services
async function loadServices() {
    try {
        const response = await fetch('http://localhost:5000/api/service', {
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
        console.log('API Response:', result);

        if (result.isError === false) {
            // Cấu trúc dữ liệu mới: result.data.services chứa mảng dịch vụ
            if (result.data && result.data.services) {
                displayServices(result.data.services);
            } else {
                console.error('Unexpected data structure:', result);
                displayServices([]);
            }
        } else {
            console.error('Error loading services:', result.message);
            displayServices([]);
        }
    } catch (error) {
        console.error('Error loading services:', error);
        displayServices([]);
    }
}

// Function to display services in the table
function displayServices(services) {
    const serviceList = document.getElementById('serviceList');
    serviceList.innerHTML = '';

    if (services && services.length > 0) {
        services.forEach(service => {
            const row = document.createElement('tr');
            
            // Format price as raw number with đ symbol at the end
            const formattedPrice = service.price + ' đ';
            
            row.innerHTML = `
                <td class="py-2 px-4 border-b border-gray-200">${service.name}</td>
                <td class="py-2 px-4 border-b border-gray-200">${formattedPrice}</td>
                <td class="py-2 px-4 border-b border-gray-200">${service.createdAt}</td>
                <td class="py-2 px-4 border-b border-gray-200">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs view-service" data-id="${service.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs edit-service" data-id="${service.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs delete-service" data-id="${service.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            serviceList.appendChild(row);
        });

        // Add event listeners for action buttons
        addServiceActionListeners();
    } else {
        serviceList.innerHTML = '<tr><td colspan="4" class="py-4 text-center border-b border-gray-200">Không có dịch vụ nào</td></tr>';
    }
}

// Function to add event listeners for service action buttons
function addServiceActionListeners() {
    // View service details
    document.querySelectorAll('.view-service').forEach(button => {
        button.addEventListener('click', async function() {
            const serviceId = this.getAttribute('data-id');
            await viewServiceDetails(serviceId);
        });
    });

    // Edit service
    document.querySelectorAll('.edit-service').forEach(button => {
        button.addEventListener('click', async function() {
            const serviceId = this.getAttribute('data-id');
            await loadServiceForEdit(serviceId);
        });
    });

    // Delete service
    document.querySelectorAll('.delete-service').forEach(button => {
        button.addEventListener('click', async function() {
            const serviceId = this.getAttribute('data-id');
            if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
                await deleteService(serviceId);
            }
        });
    });
}

// Function to view service details
async function viewServiceDetails(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/service/${serviceId}`, {
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

        if (result.isError === false) {
            const service = result.data;
            
            // Format price as raw number with đ symbol at the end
            const formattedPrice = service.price + ' đ';
            
            // Display service details in modal
            document.getElementById('serviceModalTitle').textContent = service.name;
            document.getElementById('serviceDetail').innerHTML = `
                <h4 class="text-lg font-semibold mb-3">Thông tin dịch vụ</h4>
                <p class="mb-2"><span class="font-semibold">Tên dịch vụ:</span> ${service.name}</p>
                <p class="mb-4"><span class="font-semibold">Giá:</span> ${formattedPrice}</p>
                
                <h5 class="text-md font-semibold mb-2">Mô tả dịch vụ:</h5>
                <div class="p-3 bg-gray-100 rounded">${service.description}</div>
            `;
            
            // Show modal
            document.getElementById('serviceDetailModal').classList.remove('hidden');
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error('Error viewing service details:', error);
        alert('Đã xảy ra lỗi khi tải thông tin dịch vụ. Vui lòng thử lại sau!');
    }
}

// Function to load service data for editing
async function loadServiceForEdit(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/service/${serviceId}`, {
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

        if (result.isError === false) {
            const service = result.data;
            
            // Fill form with service data
            document.getElementById('name').value = service.name;
            document.getElementById('price').value = service.price;
            editor.setData(service.description);
            
            // Change form submit button text
            const submitButton = document.querySelector('#serviceForm button[type="submit"]');
            submitButton.textContent = 'Cập nhật dịch vụ';
            
            // Add service ID to form as a data attribute
            document.getElementById('serviceForm').setAttribute('data-id', service.id);
            
            // Change form submission handler to update service
            document.getElementById('serviceForm').removeEventListener('submit', addService);
            document.getElementById('serviceForm').addEventListener('submit', function(e) {
                e.preventDefault();
                updateService(service.id);
            });
            
            // Scroll to form
            document.querySelector('.text-xl.font-bold').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error('Error loading service for edit:', error);
        alert('Đã xảy ra lỗi khi tải thông tin dịch vụ. Vui lòng thử lại sau!');
    }
}

// Function to update a service
async function updateService(serviceId) {
    try {
        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const description = editor.getData();

        // Validate inputs
        if (!name || !price) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Prepare data to send to API
        const serviceData = {
            name: name,
            price: Number(price),
            description: description // HTML content from CKEditor
        };

        console.log('Updating service:', serviceData);
        console.log('Description length:', description.length, 'characters');

        // Call API to update service
        const response = await fetch(`http://localhost:5000/api/service/update/${serviceId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader(),
                'Accept': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.isError === false) {
            // Reset form
            document.getElementById('serviceForm').reset();
            editor.setData('');
            
            // Reset form button and event listener
            const submitButton = document.querySelector('#serviceForm button[type="submit"]');
            submitButton.textContent = 'Lưu dịch vụ';
            
            document.getElementById('serviceForm').removeAttribute('data-id');
            document.getElementById('serviceForm').removeEventListener('submit', updateService);
            document.getElementById('serviceForm').addEventListener('submit', function(e) {
                e.preventDefault();
                addService();
            });
            
            // Show success message
            alert('Cập nhật dịch vụ thành công!');
            
            // Reload services list
            loadServices();
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error('Error updating service:', error);
        alert('Đã xảy ra lỗi khi cập nhật dịch vụ. Vui lòng thử lại sau!');
    }
}

// Function to delete a service
async function deleteService(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/service/delete/${serviceId}`, {
            method: 'DELETE',
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

        if (result.isError === false) {
            alert('Xóa dịch vụ thành công!');
            loadServices();
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Đã xảy ra lỗi khi xóa dịch vụ. Vui lòng thử lại sau!');
    }
} 