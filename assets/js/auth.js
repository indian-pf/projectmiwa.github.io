// Authentication related functionality
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.checkAuthStatus();
    }

    async register(userData) {
        try {
            // This is a placeholder for actual API call
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            this.isAuthenticated = true;
            this.user = data.user;
            localStorage.setItem('token', data.token);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    async login(email, password) {
        try {
            // This is a placeholder for actual API call
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            this.isAuthenticated = true;
            this.user = data.user;
            localStorage.setItem('token', data.token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.user = null;
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token validity here
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }

    getUser() {
        return this.user;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            strength: this.calculatePasswordStrength(password)
        };
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 12.5;
        if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
        return strength;
    }
}

// Initialize auth
const auth = new Auth();

// Form submission handlers
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        const passwordInput = registerForm.querySelector('#password');
        const strengthIndicator = registerForm.querySelector('.password-strength');
        
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const { strength } = auth.validatePassword(password);
            
            strengthIndicator.style.width = `${strength}%`;
            strengthIndicator.style.backgroundColor = 
                strength < 40 ? '#ff4444' :
                strength < 70 ? '#ffbb33' :
                '#00C851';
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = registerForm.querySelector('#password').value;
            const confirmPassword = registerForm.querySelector('#confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const { isValid } = auth.validatePassword(password);
            if (!isValid) {
                alert('Password does not meet security requirements');
                return;
            }

            const userData = {
                fullName: registerForm.querySelector('#fullName').value,
                email: registerForm.querySelector('#email').value,
                phone: registerForm.querySelector('#phone').value,
                password: password
            };

            const result = await auth.register(userData);
            if (result.success) {
                window.location.href = '/dashboard.html';
            } else {
                alert(result.error || 'Registration failed. Please try again.');
            }
        });
    }

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('[type="email"]').value;
            const password = loginForm.querySelector('[type="password"]').value;
            
            const success = await auth.login(email, password);
            if (success) {
                window.location.href = '/dashboard.html';
            } else {
                alert('Login failed. Please try again.');
            }
        });
    }
});
