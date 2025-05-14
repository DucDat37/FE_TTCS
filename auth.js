// Chuyển sang form đăng ký
document.getElementById("registerLink").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
});

document.getElementById("registerNow").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
});

document.getElementById("loginLink2").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
});

// Chuyển sang form quên mật khẩu
document.getElementById("forgotPassword").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("ForgotPass").style.display = "block";
});

document.getElementById("returnLoginForm").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("ForgotPass").style.display = "none";
});

// Quay lại form đăng nhập từ form đăng ký
document.getElementById("backToLoginLink").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
});

// Xử lý gửi OTP
document.getElementById("sendOtpBtn").addEventListener("click", function () {
    var phone = document.getElementById("registerPhone").value;
    var accept = document.getElementById("accept").checked;
});

function checkFields() {
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const phoneWarning = document.getElementById("phoneWarning");
    const passWordWarning = document.getElementById("passWordWarning");
    const loginButton = document.getElementById("loginButton");

    // Kiểm tra định dạng email hoặc số điện thoại
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0[0-9]{9}$/;
    const isValidInput = emailRegex.test(phone) || phoneRegex.test(phone);

    if (!isValidInput) {
        phoneWarning.classList.remove("hidden");
    } else {
        phoneWarning.classList.add("hidden");
    }

    if (password.length < 6) {
        passWordWarning.classList.remove("hidden");
    } else {
        passWordWarning.classList.add("hidden");
    }

    // Kiểm tra và cập nhật trạng thái nút đăng nhập
    if (isValidInput && password.length >= 6) {
        loginButton.disabled = false;
        loginButton.classList.remove('bg-gray-300', 'hover:bg-gray-400');
        loginButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
        loginButton.style.cursor = "pointer";
    } else {
        loginButton.disabled = true;
        loginButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        loginButton.classList.add('bg-gray-300', 'hover:bg-gray-400');
        loginButton.style.cursor = "not-allowed";
    }
}

function checkRegister() {
    var phone = document.getElementById("registerPhone");
    var otpButton = document.getElementById("sendOtpBtn")
    var accept = document.getElementById("accept").checked;
    var email = document.getElementById("emailRegister").value;
    var userName = document.getElementById("userName");
    var passWord = document.getElementById("passwordRegister").value;
    var confirmPass = document.getElementById("passwordRegister2").value;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (phone.value.length !== 10 || isNaN(phone.value)) {
        // Hiển thị thông báo cảnh báo
        phoneWarning2.classList.remove("hidden");
    } else {
        // Ẩn thông báo cảnh báo khi số điện thoại hợp lệ
        phoneWarning2.classList.add("hidden");
    }

    if (!emailRegex.test(email)) {
        emailWarning.classList.remove("hidden");
    } else {
        emailWarning.classList.add("hidden");
    }
    if (passWord.length < 6) {
        passWordWarning2.classList.remove("hidden");
    } else {
        passWordWarning2.classList.add("hidden");
    }
    if (confirmPass !== passWord) {
        passWordWarning3.classList.remove("hidden");
    } else {
        passWordWarning3.classList.add("hidden");
    }

    if (phone.value === "" || isNaN(phone.value) || phone.value.length !== 10 || userName.value === "" || !emailRegex.test(email) || !accept || confirmPass === "") {
        otpButton.disabled = true;
        otpButton.style.cursor = "not-allowed";
        otpButton.classList.add('bg-gray-300');
        otpButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    } else {
        otpButton.disabled = false;
        otpButton.classList.remove('bg-gray-300');
        otpButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
        otpButton.style.cursor = "pointer";
    }
}

function checkForgot() {
    var email = document.getElementById("email").value;
    var passWord = document.getElementById("passwordForgot").value;
    var confirmPassWord = document.getElementById("passwordForgot2").value;
    var sendOtpBtn = document.getElementById("sendOtp");
    var submitBtn = document.getElementById("submitButton");

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(email)) {
        emailWarning2.classList.remove("hidden");
    } else {
        emailWarning2.classList.add("hidden");
        sendOtpBtn.disabled = false;
        sendOtpBtn.style.cursor = "pointer";
        sendOtpBtn.classList.add('hover:bg-green-600');
    }
    if (passWord.length < 6) {
        passWordWarning4.classList.remove("hidden");
    } else {
        passWordWarning4.classList.add("hidden");
    }
    if (passWord !== confirmPassWord) {
        passWordWarning5.classList.remove("hidden");
    } else {
        passWordWarning5.classList.add("hidden");
    }
    if (passWord === "" || !emailRegex.test(email) || confirmPassWord === "") {
        submitBtn.disabled = true;
        submitBtn.style.cursor = "not-allowed";
        submitBtn.classList.add('bg-gray-300');
        submitBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('bg-gray-300');
        submitBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        submitBtn.style.cursor = "pointer";
    }
}

async function handleLogin() {
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    console.log('Attempting login with:', { phone, password }); // Debug log

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailOrPhone: phone,
                password: password
            })
        });

        console.log('Response status:', response.status); // Debug log

        const responseData = await response.json();
        console.log('Response data:', responseData); // Debug log

        if (response.ok) {
            // Store the access token in localStorage
            localStorage.setItem('access_token', responseData.data.access_token);
            // Store user data if needed
            localStorage.setItem('user', JSON.stringify(responseData.data.user));
            
            // Kiểm tra vai trò người dùng
            if (responseData.data.user.role === 'Admin' || responseData.data.user.role === 'Doctor') {
                // Nếu là Admin, chuyển hướng đến trang quản trị
                window.location.href = 'admin.html';
            } else {
                // Nếu không phải Admin, chuyển hướng đến trang chủ
                window.location.href = 'index.html';
            }
        } else {
            // Handle error response
            toast.error(responseData.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Error:', error);
        toast.error('Có lỗi xảy ra khi đăng nhập');
    }
}

// Xử lý sự kiện click cho nút SendOTP
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý sự kiện gửi OTP
    const sendOtpBtn = document.getElementById('sendOtp');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', function() {
            const email = document.getElementById('email').value.trim();
            if (email) {
                // Hiển thị trạng thái đang gửi
                const originalText = sendOtpBtn.textContent;
                sendOtpBtn.textContent = 'Đang gửi...';
                sendOtpBtn.classList.add('whitespace-nowrap');
                sendOtpBtn.disabled = true;
                
                // Gọi API gửi OTP
                fetch(`http://localhost:5000/api/auth/send-email-reset-password?email=${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.isError === false && data.statusCode === 200) {
                        // Hiển thị thông báo thành công
                        toast.success(data.message);
                        // Focus vào ô nhập OTP
                        document.getElementById('enterOtp').focus();
                    } else {
                        // Hiển thị thông báo lỗi
                        toast.error('Có lỗi xảy ra: ' + (data.message || 'Không thể gửi OTP'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    toast.error('Đã xảy ra lỗi khi gửi OTP. Vui lòng thử lại sau.');
                })
                .finally(() => {
                    // Khôi phục trạng thái nút
                    sendOtpBtn.textContent = originalText;
                    sendOtpBtn.classList.remove('whitespace-nowrap');
                    sendOtpBtn.disabled = false;
                });
            } else {
                toast.error('Vui lòng nhập email hợp lệ');
            }
        });
    }
    
    // Xử lý sự kiện đổi mật khẩu
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        // Gắn sự kiện cho form chứa nút submit
        const forgotPasswordForm = submitButton.closest('form');
        forgotPasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Lấy giá trị từ các trường nhập liệu
            const email = document.getElementById('email').value.trim();
            const otpCode = document.getElementById('enterOtp').value.trim();
            const password = document.getElementById('passwordForgot').value;
            const confirmPassword = document.getElementById('passwordForgot2').value;
            
            // Hiển thị trạng thái đang xử lý
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Đang xử lý...';
            submitButton.disabled = true;
            
            // Gọi API đổi mật khẩu
            fetch('http://localhost:5000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: otpCode,
                    password: password,
                    confirmPassword: confirmPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    // Đổi mật khẩu thành công
                    toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                    // Chuyển về trang đăng nhập
                    document.getElementById('loginForm').style.display = 'block';
                    document.getElementById('ForgotPass').style.display = 'none';
                } else {
                    // Xử lý lỗi
                    let errorMessage = data.message;
                    
                    // Hiển thị chi tiết lỗi nếu có
                    if (data.errors && data.errors.length > 0) {
                        errorMessage += ':\n';
                        data.errors.forEach(err => {
                            errorMessage += `- ${err.message}\n`;
                        });
                    }
                    
                    toast.error(errorMessage);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error('Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
            })
            .finally(() => {
                // Khôi phục trạng thái nút
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
});

// Xử lý đăng ký
async function handleRegister() {
    const userName = document.getElementById("userName").value;
    const email = document.getElementById("emailRegister").value;
    const phone = document.getElementById("registerPhone").value;
    const password = document.getElementById("passwordRegister").value;
    const confirmPassword = document.getElementById("passwordRegister2").value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName,
                email,
                phone,
                password,
                confirmPassword
            })
        });


        const data = await response.json();

        if (response.ok) {
            // Hiển thị thông báo thành công
            toast.success(data.message);
            // Chuyển về form đăng nhập sau 2 giây
            setTimeout(() => {
                document.getElementById("registerForm").style.display = "none";
                document.getElementById("loginForm").style.display = "block";
            }, 2000);
        } else {
            // Xử lý lỗi
            let errorMessage = data.message;
            if (data.errors && data.errors.length > 0) {
                errorMessage += ':\n';
                data.errors.forEach(err => {
                    errorMessage += `- ${err.message}\n`;
                });
            }
            toast.error(errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
        toast.error('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.');
    }
}

// Thêm event listener cho nút đăng ký
document.getElementById("sendOtpBtn").addEventListener("click", function(event) {
    event.preventDefault();
    handleRegister();
});

// Function to check if token is expired
function isTokenExpired(error) {
    return error.statusCode === 401 || error.message?.toLowerCase().includes('token expired');
}

// Function to handle logout
function handleLogout() {
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    // Redirect to login page
    window.location.href = 'login.html';
}

// Function to handle API response
async function handleApiResponse(response) {
    const result = await response.json();
    
    if (result.isError) {
        if (isTokenExpired(result)) {
            handleLogout();
            return null;
        }
        throw new Error(result.message);
    }
    
    return result;
}

// Function to make authenticated API calls
async function fetchWithAuth(url, options = {}) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            handleLogout();
            return null;
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        return await handleApiResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        if (error.status === 401) {
            handleLogout();
        }
        throw error;
    }
}

// Export functions for use in other files
window.auth = {
    fetchWithAuth,
    handleLogout,
    isTokenExpired
}; 