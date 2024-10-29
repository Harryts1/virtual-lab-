document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Determine if we're running on live server or localhost:5000
            const isLiveServer = window.location.origin.includes('127.0.0.1:5500');
            const apiUrl = isLiveServer ? 'http://localhost:5000/api/login' : '/api/login';
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('loggedInUser', username);
                    
                    // Redirect based on the server environment
                    if (isLiveServer) {
                        window.location.href = 'http://127.0.0.1:5500/src/home.html';
                    } else {
                        window.location.href = '/home.html';
                    }
                } else {
                    const errorElement = document.getElementById('error-message');
                    if (errorElement) {
                        errorElement.textContent = data.message;
                    } else {
                        const newErrorMessage = document.createElement('p');
                        newErrorMessage.id = 'error-message';
                        newErrorMessage.textContent = data.message;
                        newErrorMessage.style.color = 'red';
                        loginForm.appendChild(newErrorMessage);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                const errorElement = document.getElementById('error-message') || 
                    loginForm.appendChild(document.createElement('p'));
                errorElement.id = 'error-message';
                errorElement.textContent = 'An error occurred. Please try again.';
                errorElement.style.color = 'red';
            }
        });
    }
});