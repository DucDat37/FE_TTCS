let editor;
let accessToken = '';

document.addEventListener("DOMContentLoaded", function() {
    accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        toast.error('Bạn cần đăng nhập để sử dụng chức năng này!');
        window.location.href = 'auth.html';
        return;
    }

    ClassicEditor
        .create(document.querySelector('#description'))
        .then(newEditor => {
            editor = newEditor;
        })
        .catch(error => {
            toast.error('Khởi tạo CKEditor thất bại');
        });

    loadServices();

    document.getElementById('serviceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const serviceId = this.getAttribute('data-id');
        if (serviceId) {
            updateService(serviceId);
        } else {
            addService();
        }
    });
});

function getAuthHeader() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };
}

function handleApiError(error) {
    if (error.status === 401 || error.message?.includes('access_token') || error.message?.includes('authorization')) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('access_token');
        window.location.href = 'auth.html';
    } else {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau!');
    }
}

async function addService() {
    try {
        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const description = editor.getData();

        if (!name || !price) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const serviceData = {
            name: name,
            price: Number(price),
            description: description
        };

        const response = await fetch('http://localhost:5000/api/service/add', {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Accept': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });

        const responseText = await response.text();
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            toast.error('Server không trả về định dạng JSON hợp lệ');
            return;
        }

        if (!response.ok) {
            if (response.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            toast.error(`Lỗi từ server: ${result.message || 'Không xác định'}`);
            throw new Error(`Server responded with status: ${response.status}`);
        }

        if (result.isError === false) {
            document.getElementById('serviceForm').reset();
            editor.setData('');
            
            toast.success('Tạo mới dịch vụ thành công!');
            
            loadServices();
        } else {
            toast.error(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        toast.error('Đã xảy ra lỗi khi thêm dịch vụ. Vui lòng thử lại sau!');
    }
}

async function loadServices() {
    try {
        const response = await fetch('http://localhost:5000/api/service', {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.isError === false) {
            if (result.data && result.data.services) {
                displayServices(result.data.services);
            } else {
                displayServices([]);
            }
        } else {
            displayServices([]);
        }
    } catch (error) {
        displayServices([]);
    }
}

function displayServices(services) {
    const serviceList = document.getElementById('serviceList');
    serviceList.innerHTML = '';

    if (services && services.length > 0) {
        services.forEach(service => {
            const row = document.createElement('tr');
            
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

        addServiceActionListeners();
    } else {
        serviceList.innerHTML = '<tr><td colspan="4" class="py-4 text-center border-b border-gray-200">Không có dịch vụ nào</td></tr>';
    }
}

function addServiceActionListeners() {
    document.querySelectorAll('.view-service').forEach(button => {
        button.addEventListener('click', async function() {
            const serviceId = this.getAttribute('data-id');
            await viewServiceDetails(serviceId);
        });
    });

    document.querySelectorAll('.edit-service').forEach(button => {
        button.addEventListener('click', async function() {
            const serviceId = this.getAttribute('data-id');
            await loadServiceForEdit(serviceId);
        });
    });

    document.querySelectorAll('.delete-service').forEach(button => {
        button.addEventListener('click', async function() {
            const serviceId = this.getAttribute('data-id');
            if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
                await deleteService(serviceId);
            }
        });
    });
}

async function viewServiceDetails(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/service/${serviceId}`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.isError === false) {
            const service = result.data;
            
            const formattedPrice = service.price + ' đ';
            
            document.getElementById('serviceModalTitle').textContent = service.name;
            document.getElementById('serviceDetail').innerHTML = `
                <h4 class="text-lg font-semibold mb-3">Thông tin dịch vụ</h4>
                <p class="mb-2"><span class="font-semibold">Tên dịch vụ:</span> ${service.name}</p>
                <p class="mb-4"><span class="font-semibold">Giá:</span> ${formattedPrice}</p>
                
                <h5 class="text-md font-semibold mb-2">Mô tả dịch vụ:</h5>
                <div class="p-3 bg-gray-100 rounded">${service.description}</div>
            `;
            
            document.getElementById('serviceDetailModal').classList.remove('hidden');
        } else {
            toast.error(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        toast.error('Đã xảy ra lỗi khi tải thông tin dịch vụ. Vui lòng thử lại sau!');
    }
}

async function loadServiceForEdit(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/service/${serviceId}`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.isError === false) {
            const service = result.data;
            
            document.getElementById('name').value = service.name;
            document.getElementById('price').value = service.price;
            editor.setData(service.description);
            
            const submitButton = document.querySelector('#serviceForm button[type="submit"]');
            submitButton.textContent = 'Cập nhật dịch vụ';
            
            document.getElementById('serviceForm').setAttribute('data-id', service.id);
            
            document.querySelector('.text-xl.font-bold').scrollIntoView({ behavior: 'smooth' });
        } else {
            toast.error(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        toast.error('Đã xảy ra lỗi khi tải thông tin dịch vụ. Vui lòng thử lại sau!');
    }
}

async function updateService(serviceId) {
    try {
        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const description = editor.getData();

        if (!name || !price) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const serviceData = {
            name: name,
            price: Number(price),
            description: description
        };

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
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.isError === false) {
            document.getElementById('serviceForm').reset();
            editor.setData('');
            
            const submitButton = document.querySelector('#serviceForm button[type="submit"]');
            submitButton.textContent = 'Lưu dịch vụ';
            
            document.getElementById('serviceForm').removeAttribute('data-id');
            
            toast.success('Cập nhật dịch vụ thành công!');
            
            loadServices();
        } else {
            toast.error(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        toast.error('Đã xảy ra lỗi khi cập nhật dịch vụ. Vui lòng thử lại sau!');
    }
}

async function deleteService(serviceId) {
    try {
        const response = await fetch(`http://localhost:5000/api/service/delete/${serviceId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                localStorage.removeItem('access_token');
                window.location.href = 'auth.html';
                return;
            }
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.isError === false) {
            toast.success('Xóa dịch vụ thành công!');
            loadServices();
        } else {
            toast.error(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        toast.error('Đã xảy ra lỗi khi xóa dịch vụ. Vui lòng thử lại sau!');
    }
}