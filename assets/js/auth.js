// Authentication related functionality
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.checkAuthStatus();
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
}

// Initialize auth
const auth = new Auth();

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
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
