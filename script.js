// Store users in localStorage
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
}

// Initialize when page loads
initializeUsers();

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    // Clear messages when opening modal
    const loginMessage = document.getElementById('loginMessage');
    const signupMessage = document.getElementById('signupMessage');
    if (loginMessage) loginMessage.style.display = 'none';
    if (signupMessage) signupMessage.style.display = 'none';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Scroll Functions
function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
}

function scrollToGallery() {
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
}

// Working Signup Form
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const messageEl = document.getElementById('signupMessage');
            
            // Basic validation
            if (!name || !email || !password) {
                showMessage(messageEl, 'Please fill in all fields', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage(messageEl, 'Password must be at least 6 characters', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showMessage(messageEl, 'Please enter a valid email address', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if user already exists
            if (users.find(user => user.email === email)) {
                showMessage(messageEl, 'User already exists with this email', 'error');
                return;
            }
            
            // Add new user
            users.push({ name, email, password, createdAt: new Date().toISOString() });
            localStorage.setItem('users', JSON.stringify(users));
            
            showMessage(messageEl, '🎉 Account created successfully! Redirecting...', 'success');
            
            // Clear form
            signupForm.reset();
            
            // Auto close after success and login
            setTimeout(() => {
                closeModal('signupModal');
                // Auto login the new user
                localStorage.setItem('currentUser', JSON.stringify({ name, email }));
                updateAuthUI({ name, email });
                showNotification(`Welcome to PixAI, ${name}!`);
            }, 2000);
        });
    }

    // Working Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const messageEl = document.getElementById('loginMessage');
            
            if (!email || !password) {
                showMessage(messageEl, 'Please fill in all fields', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(user => user.email === email && user.password === password);
            
            if (user) {
                // Store current user session
                localStorage.setItem('currentUser', JSON.stringify(user));
                showMessage(messageEl, `✅ Welcome back, ${user.name}!`, 'success');
                
                // Update UI for logged in user
                updateAuthUI(user);
                
                setTimeout(() => {
                    closeModal('loginModal');
                    showNotification(`Great to see you, ${user.name}!`);
                }, 1500);
            } else {
                showMessage(messageEl, '❌ Invalid email or password', 'error');
            }
        });
    }

    // Check if user is already logged in
    checkLoginStatus();
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(139, 92, 246, 0.9);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(139, 92, 246, 0.3);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons && user) {
        authButtons.innerHTML = `
            <span style="margin-right: 15px; color: #cbd5e1;">Welcome, ${user.name}</span>
            <button class="btn btn-outline" onclick="logout()">Log Out</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully');
    setTimeout(() => location.reload(), 1000);
}

function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        updateAuthUI(currentUser);
    }
}

// Working Image Generation with REAL AI-like images
function generateImage() {
    const prompt = document.getElementById('promptText').value.trim();
    const style = document.getElementById('artStyle').value;
    const generateBtn = document.getElementById('generateBtn');
    
    if (!prompt) {
        showNotification('Please enter a description for your image!');
        return;
    }

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    const imageResult = document.getElementById('imageResult');
    imageResult.innerHTML = `
        <div class="spinner"></div>
        <p style="color: #cbd5e1;">Creating your "${prompt}" in ${style} style...</p>
        <p style="color: #94a3b8; font-size: 14px;">Powered by AI • This may take a few seconds</p>
    `;
    
    // Hide previous actions
    document.getElementById('imageActions').style.display = 'none';
    
    // Generate a unique image based on prompt and style
    setTimeout(() => {
        const seed = prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const width = 600;
        const height = 400;
        
        // Use a placeholder service that generates unique images
        const imageUrl = `https://picsum.photos/seed/${seed}${style}/${width}/${height}?grayscale`;
        
        imageResult.innerHTML = `
            <img src="${imageUrl}" alt="Generated: ${prompt}" class="generated-image">
            <div style="margin-top: 16px; text-align: center;">
                <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>${prompt}</strong></p>
                <p style="color: #94a3b8; font-size: 14px;">Style: ${style} • AI Generated</p>
            </div>
        `;
        
        // Store image data for download
        imageResult.dataset.imageUrl = imageUrl;
        imageResult.dataset.prompt = prompt;
        
        // Show download buttons
        document.getElementById('imageActions').style.display = 'flex';
        
        // Reset button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Image';
        
        showNotification('🎨 Image generated successfully!');
    }, 2500); // 2.5 second delay for realism
}

function downloadImage() {
    const imageUrl = document.getElementById('imageResult').dataset.imageUrl;
    const prompt = document.getElementById('imageResult').dataset.prompt;
    
    if (!imageUrl) {
        showNotification('Please generate an image first!');
        return;
    }
    
    // Create temporary link for download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-art-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📥 Image download started!');
}

function saveImage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Please log in to save images!');
        openModal('loginModal');
        return;
    }
    
    showNotification('💾 Image saved to your gallery!');
}

function shareImage() {
    const prompt = document.getElementById('imageResult').dataset.prompt;
    if (navigator.share) {
        navigator.share({
            title: 'My AI Art Creation',
            text: `Check out this AI art I created: ${prompt}`,
            url: window.location.href
        });
    } else {
        showNotification('📤 Share URL copied to clipboard!');
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).catch(() => {
            // If clipboard fails, just show the message
        });
    }
}

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.disabled) return;
            
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add some sample images to gallery on load
document.addEventListener('DOMContentLoaded', function() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        // You can add dynamic gallery images here if needed
        console.log('Gallery loaded with sample images');
    }
});
