// 3D Avatar Integration Script
document.addEventListener('DOMContentLoaded', function() {
    // Ensure Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js library not loaded. Please check your script imports.');
        return;
    }

    // Find the profile image container in the About section
    const profileContainer = document.querySelector('#about .position-relative.overflow-hidden');
    
    if (profileContainer) {
        console.log('Profile container found, initializing 3D avatar');
        
        // Hide the existing profile image
        const profileImage = profileContainer.querySelector('img');
        if (profileImage) {
            profileImage.style.display = 'none';
        }
        
        // Create a container for the 3D scene
        const threeContainer = document.createElement('div');
        threeContainer.id = 'profile-3d-container';
        threeContainer.style.width = '100%';
        threeContainer.style.height = '600px'; // Increased height for better visibility
        threeContainer.style.borderRadius = '20px';
        profileContainer.appendChild(threeContainer);
        
        // Create loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'profile-3d-loading';
        loadingDiv.innerHTML = '<div>Creating your digital avatar...</div>';
        loadingDiv.style.position = 'absolute';
        loadingDiv.style.top = '50%';
        loadingDiv.style.left = '50%';
        loadingDiv.style.transform = 'translate(-50%, -50%)';
        loadingDiv.style.color = 'white';
        loadingDiv.style.fontWeight = 'bold';
        loadingDiv.style.textAlign = 'center';
        loadingDiv.style.zIndex = '5';
        profileContainer.appendChild(loadingDiv);
        
        // Add necessary CSS for loading state
        if (!document.getElementById('3d-avatar-styles')) {
            const style = document.createElement('style');
            style.id = '3d-avatar-styles';
            style.textContent = `
                .profile-3d-loading {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0,0,0,0.5);
                    border-radius: 20px;
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 10;
                }
                
                .profile-3d-loading div {
                    padding: 15px 25px;
                    background: rgba(0,0,0,0.7);
                    border-radius: 10px;
                    border: 1px solid var(--accent-color);
                    color: white;
                    font-weight: 500;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Initialize the 3D scene - this will call your existing 3do.js code
        // but we need to ensure the function exists
        if (typeof initProfileAvatar === 'function') {
            initProfileAvatar(loadingDiv);
        } else {
            console.error('initProfileAvatar function not found. Ensure 3do.js is loaded correctly.');
            loadingDiv.innerHTML = '<div>Error loading 3D avatar. Please refresh the page.</div>';
            
            // Show the original image as fallback
            if (profileImage) {
                profileImage.style.display = 'block';
            }
        }
    } else {
        console.error('Profile container not found. Make sure the HTML structure is correct.');
    }
});