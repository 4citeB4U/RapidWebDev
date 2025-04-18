document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('skillTradeForm');
    
    // Form validation and submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            try {
                const formData = new FormData(form);
                const response = await submitApplication(formData);
                
                if (response.success) {
                    showSuccessMessage();
                    form.reset();
                } else {
                    showErrorMessage(response.message);
                }
            } catch (error) {
                showErrorMessage('An error occurred. Please try again later.');
            }
        }
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const required = form.querySelectorAll('[required]');
        
        required.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                showFieldError(field, 'This field is required');
            } else {
                clearFieldError(field);
            }
        });
        
        // Validate email format
        const email = form.querySelector('#email');
        if (email.value && !isValidEmail(email.value)) {
            isValid = false;
            showFieldError(email, 'Please enter a valid email address');
        }
        
        return isValid;
    }
    
    // Helper functions
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showFieldError(field, message) {
        const errorDiv = field.parentElement.querySelector('.error-message') 
            || document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        if (!field.parentElement.querySelector('.error-message')) {
            field.parentElement.appendChild(errorDiv);
        }
        
        field.classList.add('error');
    }
    
    function clearFieldError(field) {
        const errorDiv = field.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.classList.remove('error');
    }
    
    async function submitApplication(formData) {
        // Replace with your actual API endpoint
        const response = await fetch('/api/skill-trade/apply', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    }
    
    function showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = 'Application submitted successfully! We\'ll contact you soon.';
        form.parentElement.insertBefore(message, form);
        
        setTimeout(() => message.remove(), 5000);
    }
    
    function showErrorMessage(text) {
        const message = document.createElement('div');
        message.className = 'error-message global';
        message.textContent = text;
        form.parentElement.insertBefore(message, form);
        
        setTimeout(() => message.remove(), 5000);
    }
});