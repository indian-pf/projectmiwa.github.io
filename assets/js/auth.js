// Authentication related functionality
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentStep = 1;
        this.resendTimeout = 30; // seconds
        this.setupOTPInputs();
        this.setupFormSteps();
        this.user = null;
        this.checkAuthStatus();
        this.initGoogleAuth();
    }

    setupOTPInputs() {
        // Auto-focus and navigation for OTP inputs
        document.querySelectorAll('.otp-input-group').forEach(group => {
            const inputs = group.querySelectorAll('.otp-input');
            
            inputs.forEach((input, index) => {
                input.addEventListener('keyup', (e) => {
                    if (e.key >= 0 && e.key <= 9) {
                        if (index < inputs.length - 1) {
                            inputs[index + 1].focus();
                        }
                    } else if (e.key === 'Backspace') {
                        if (index > 0) {
                            inputs[index - 1].focus();
                        }
                    }
                });

                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, inputs.length);
                    
                    [...pastedData].forEach((char, i) => {
                        if (i < inputs.length && /[0-9]/.test(char)) {
                            inputs[i].value = char;
                            if (i < inputs.length - 1) {
                                inputs[i + 1].focus();
                            }
                        }
                    });
                });

                input.addEventListener('input', () => {
                    if (input.value) {
                        input.classList.add('filled');
                    } else {
                        input.classList.remove('filled');
                    }
                });
            });
        });
    }

    setupFormSteps() {
        const steps = document.querySelectorAll('.form-step');
        steps.forEach((step, index) => {
            if (index === 0) {
                step.classList.add('active');
            }
        });
    }

    async sendVerificationCodes() {
        const button = document.querySelector('#step1 .cta-button');
        this.setLoading(button, true);

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const terms = document.getElementById('terms').checked;

        // Validate inputs
        if (!this.validateInputs(fullName, email, phone, terms)) {
            this.setLoading(button, false);
            return;
        }

        try {
            // Send OTP to email and phone
            await this.sendEmailOTP(email);
            await this.sendPhoneOTP(phone);

            // Move to email verification step
            this.showStep(2);
            this.updateProgress(2);
            this.startResendTimer('email');
        } catch (error) {
            alert('Failed to send verification codes. Please try again.');
        } finally {
            this.setLoading(button, false);
        }
    }

    validateInputs(fullName, email, phone, terms) {
        let isValid = true;

        if (!fullName || fullName.length < 2) {
            this.showInputError('fullName', 'Please enter your full name');
            isValid = false;
        }

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            this.showInputError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!phone || !phone.match(/^[0-9]{10}$/)) {
            this.showInputError('phone', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }

        if (!terms) {
            this.showInputError('terms', 'Please accept the terms and privacy policy');
            isValid = false;
        }

        return isValid;
    }

    async sendEmailOTP(email) {
        // Placeholder for API call
        console.log(`Sending OTP to email: ${email}`);
        // Implement your API call here
    }

    async sendPhoneOTP(phone) {
        // Placeholder for API call
        console.log(`Sending OTP to phone: ${phone}`);
        // Implement your API call here
    }

    async verifyEmailOTP() {
        const button = document.querySelector('#step2 .cta-button');
        this.setLoading(button, true);

        try {
            // Your existing verification logic
            await this.verifyOTP();
            
            // Show success animation
            this.showFeedback('success', 'Email verified successfully!');
            
            this.showStep(3);
            this.updateProgress(3);
            this.startResendTimer('phone');
        } catch (error) {
            this.showFeedback('error', 'Invalid verification code');
            document.querySelector('#step2').classList.add('error');
            setTimeout(() => document.querySelector('#step2').classList.remove('error'), 500);
        } finally {
            this.setLoading(button, false);
        }
    }

    async verifyPhoneOTP() {
        const otp = this.getOTPValue('step3');
        if (!otp) {
            alert('Please enter the phone verification code');
            return;
        }

        try {
            // Verify phone OTP
            // Implement your API call here
            
            // Complete registration
            await this.completeRegistration();
        } catch (error) {
            alert('Invalid phone verification code. Please try again.');
        }
    }

    getOTPValue(stepId) {
        const inputs = document.querySelector(`#${stepId} .otp-input-group`).querySelectorAll('.otp-input');
        return Array.from(inputs).map(input => input.value).join('');
    }

    showStep(step) {
        const steps = document.querySelectorAll('.form-step');
        steps.forEach((s, index) => {
            if (index + 1 === step) {
                s.style.display = 'block';
                setTimeout(() => s.classList.add('active'), 10);
            } else {
                s.classList.remove('active');
                s.style.display = 'none';
            }
        });
        this.currentStep = step;
    }

    startResendTimer(type) {
        const button = document.querySelector(`#step${type === 'email' ? '2' : '3'} .resend-button`);
        let timeLeft = this.resendTimeout;
        
        button.disabled = true;
        button.textContent = `Resend in ${timeLeft}s`;

        const timer = setInterval(() => {
            timeLeft--;
            button.textContent = `Resend in ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                button.disabled = false;
                button.textContent = 'Resend';
            }
        }, 1000);
    }

    async resendEmailOTP() {
        const email = document.getElementById('email').value;
        await this.sendEmailOTP(email);
        this.startResendTimer('email');
    }

    async resendPhoneOTP() {
        const phone = document.getElementById('phone').value;
        await this.sendPhoneOTP(phone);
        this.startResendTimer('phone');
    }

    async completeRegistration() {
        const userData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        try {
            // Implement your API call here
            console.log('Registration completed:', userData);
            
            // Redirect to dashboard or success page
            window.location.href = '/dashboard.html';
        } catch (error) {
            alert('Registration failed. Please try again.');
        }
    }

    updateProgress(step) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((s, index) => {
            if (index + 1 < step) {
                s.classList.add('completed');
                s.classList.remove('active');
            } else if (index + 1 === step) {
                s.classList.add('active');
                s.classList.remove('completed');
            } else {
                s.classList.remove('active', 'completed');
            }
        });
    }

    setLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showFeedback(type, message) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('active'));

        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showInputError(inputId, message) {
        const formGroup = document.getElementById(inputId).closest('.form-group');
        formGroup.classList.add('error');
        
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message error';
        feedback.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        
        formGroup.appendChild(feedback);
        formGroup.querySelector('input').addEventListener('input', () => {
            formGroup.classList.remove('error');
            feedback.remove();
        }, { once: true });
    }

    async initGoogleAuth() {
        // Initialize Google Sign-In
        // Note: Replace with your Google Client ID
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        document.head.appendChild(script);

        script.onload = () => {
            google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID',
                callback: this.handleGoogleSignIn.bind(this)
            });
        };
    }

    async signInWithGoogle() {
        google.accounts.id.prompt();
    }

    async handleGoogleSignIn(response) {
        try {
            // Send the token to your backend
            const result = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: response.credential
                })
            });

            if (!result.ok) throw new Error('Google sign in failed');

            const data = await result.json();
            this.handleAuthSuccess(data);
        } catch (error) {
            console.error('Google sign in error:', error);
            this.showFeedback('error', 'Google sign in failed. Please try again.');
        }
    }

    async login(email, password, rememberMe) {
        try {
            // Your existing login logic
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error('Login failed');

            const data = await response.json();
            
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('email', email);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('email');
            }

            this.handleAuthSuccess(data);
        } catch (error) {
            console.error('Login error:', error);
            this.showFeedback('error', 'Login failed. Please check your credentials.');
        }
    }

    handleAuthSuccess(data) {
        this.isAuthenticated = true;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard.html';
    }

    checkAuthStatus() {
        // Check if user was remembered
        const rememberMe = localStorage.getItem('rememberMe');
        const email = localStorage.getItem('email');
        
        if (rememberMe && email) {
            document.getElementById('email').value = email;
            document.getElementById('rememberMe').checked = true;
        }

        // Your existing auth status check
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
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            await auth.login(email, password, rememberMe);
        });
    }
});
