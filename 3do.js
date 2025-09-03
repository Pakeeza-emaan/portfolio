// Combined 3D Avatar Implementation
// This script consolidates both files and fixes potential issues

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, checking for Three.js');
    
    // First check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js library not loaded! Adding it dynamically...');
        
        // Dynamically load Three.js from CDN
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        threeScript.onload = initializeAvatar;
        threeScript.onerror = () => {
            console.error('Failed to load Three.js library');
            showOriginalImage();
        };
        document.head.appendChild(threeScript);
    } else {
        console.log('Three.js already loaded');
        initializeAvatar();
    }
});

function showOriginalImage() {
    const profileImage = document.querySelector('.position-relative.overflow-hidden img');
    if (profileImage) {
        profileImage.style.display = 'block';
    }
}

function initializeAvatar() {
    console.log('Initializing avatar setup');
    
    // Find the profile image container
    const profileContainer = document.querySelector('.position-relative.overflow-hidden');
    
    if (!profileContainer) {
        console.error('Profile container not found');
        return;
    }
    
    console.log('Profile container found, setting up 3D environment');
    
    // Remove the existing profile image
    const profileImage = profileContainer.querySelector('img');
    if (profileImage) {
        profileImage.style.display = 'none';
    }
    
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
    
    // Create a container for the 3D scene with INCREASED HEIGHT
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
    profileContainer.appendChild(loadingDiv);
    
    // Initialize the 3D scene
    initProfileAvatar(loadingDiv);
}

function initProfileAvatar(loadingElement) {
    console.log('Starting 3D avatar creation');
    
    // Scene, camera, and renderer setup
    const container = document.getElementById('profile-3d-container');
    if (!container) {
        console.error('3D container not found');
        return;
    }
    
    const scene = new THREE.Scene();
    
    // Set up camera with adjusted position for better view
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 6); // Adjusted camera position for better framing
    
    // Set up renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Add lighting
    setupLighting(scene);
    
    // Create a circular platform
    const platformGeometry = new THREE.CylinderGeometry(2, 2.2, 0.1, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222228,
        metalness: 0.8,
        roughness: 0.2
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -2;
    platform.receiveShadow = true;
    scene.add(platform);
    
    // Add subtle glow to the platform edge
    const platformGlowGeometry = new THREE.TorusGeometry(2, 0.1, 16, 32);
    const platformGlowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x6e57e0, // Primary color
        transparent: true,
        opacity: 0.7
    });
    const platformGlow = new THREE.Mesh(platformGlowGeometry, platformGlowMaterial);
    platformGlow.position.y = -1.95;
    platformGlow.rotation.x = Math.PI / 2;
    scene.add(platformGlow);
    
    // Create a group to hold the avatar elements
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    
    // Create stylized female avatar with UI/UX designer look
    createStylizedUXDesignerAvatar(avatarGroup).then(() => {
        // Remove loading indicator once avatar is created
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        console.log('Avatar created successfully');
    }).catch(error => {
        console.error("Error creating avatar:", error);
        // Show the original image as fallback if there's an error
        const profileImage = document.querySelector('.position-relative.overflow-hidden img');
        if (profileImage) {
            profileImage.style.display = 'block';
        }
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    });
    
    // Variables to track mouse movement
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    // Add mouse move event listener
    document.addEventListener('mousemove', (event) => {
        // Calculate mouse position relative to the center of the window
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        
        // Convert to rotation targets with limited range
        targetRotationY = mouseX * 0.5; // Horizontal rotation
        targetRotationX = -mouseY * 0.2; // Vertical rotation limited
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Smooth rotation transition for the avatar
        avatarGroup.rotation.y += (targetRotationY - avatarGroup.rotation.y) * 0.05;
        
        // Limit vertical rotation to prevent awkward angles
        const maxVerticalRotation = 0.15;
        const clampedTargetX = Math.max(Math.min(targetRotationX, maxVerticalRotation), -maxVerticalRotation);
        avatarGroup.rotation.x += (clampedTargetX - avatarGroup.rotation.x) * 0.05;
        
        // Animate platform glow
        platformGlow.rotation.z += 0.005;
        
        renderer.render(scene, camera);
    }
    
    // Start the animation loop
    animate();
}

function setupLighting(scene) {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Main directional light (key light)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(3, 5, 3);
    mainLight.castShadow = true;
    
    // Optimize shadow settings
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    mainLight.shadow.camera.left = -5;
    mainLight.shadow.camera.right = 5;
    mainLight.shadow.camera.top = 5;
    mainLight.shadow.camera.bottom = -5;
    mainLight.shadow.bias = -0.0005;
    
    scene.add(mainLight);
    
    // Fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xa0a0ff, 0.5);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);
    
    // Rim light for edge highlighting
    const rimLight = new THREE.DirectionalLight(0xff9f7f, 0.5);
    rimLight.position.set(0, 2, -5);
    scene.add(rimLight);
    
    // Add a subtle colored point light
    const accentLight = new THREE.PointLight(0x00d9ff, 1, 10); // Accent color
    accentLight.position.set(0, 0, 3);
    scene.add(accentLight);
    
    // Animate the accent light
    function animateAccentLight() {
        accentLight.intensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.002);
        requestAnimationFrame(animateAccentLight);
    }
    
    animateAccentLight();
}

async function createStylizedUXDesignerAvatar(group) {
    console.log('Creating stylized UX designer avatar');
    
    // Define colors based on website's theme
    const primaryColor = new THREE.Color(0x6e57e0);
    const accentColor = new THREE.Color(0x00d9ff);
    const highlightColor = new THREE.Color(0xff3e8e);
    
    // Create a new group for the female avatar
    const femaleAvatar = new THREE.Group();
    
    // ----- Head -----
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xffecd6,
        roughness: 0.5,
        metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    femaleAvatar.add(head);
    
    // ----- Hair ----- (Modern UI/UX Designer style)
    const hairMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
        metalness: 0.1
    });
    
    // Create stylish modern hairstyle (bob cut with side part)
    const hairTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.54, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
        hairMaterial
    );
    hairTop.position.y = 1.55;
    hairTop.castShadow = true;
    femaleAvatar.add(hairTop);
    
    // Hair bob cut (shorter than before)
    const hairBack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.35, 0.6, 32, 1, true),
        hairMaterial
    );
    hairBack.position.set(0, 1.2, -0.1);
    hairBack.castShadow = true;
    femaleAvatar.add(hairBack);
    
    // Side bangs (asymmetrical - modern style)
    const leftBang = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.5, 12),
        hairMaterial
    );
    leftBang.position.set(-0.4, 1.3, 0.1);
    leftBang.rotation.x = 0.2;
    leftBang.rotation.z = -0.3;
    femaleAvatar.add(leftBang);
    
    // Subtle highlight in hair - tech style
    const hairHighlight = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.3, 0.1),
        new THREE.MeshStandardMaterial({
            color: accentColor,
            roughness: 0.7,
            metalness: 0.3
        })
    );
    hairHighlight.position.set(0.25, 1.3, 0);
    hairHighlight.rotation.z = 0.2;
    femaleAvatar.add(hairHighlight);
    
    // ----- Face Features -----
    // Modern glasses - signature of tech/designer look
    const glassesFrontGeometry = new THREE.BoxGeometry(0.7, 0.12, 0.05);
    const glassesMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
        metalness: 0.8
    });
    const glassesFront = new THREE.Mesh(glassesFrontGeometry, glassesMaterial);
    glassesFront.position.set(0, 1.55, 0.4);
    femaleAvatar.add(glassesFront);
    
    // Left lens
    const lensGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
    const lensMaterial = new THREE.MeshStandardMaterial({
        color: 0x6BA5F2,
        transparent: true,
        opacity: 0.3,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-0.18, 1.55, 0.42);
    femaleAvatar.add(leftLens);
    
    // Right lens
    const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
    rightLens.rotation.x = Math.PI / 2;
    rightLens.position.set(0.18, 1.55, 0.42);
    femaleAvatar.add(rightLens);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.07, 16, 16);
    const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    leftEye.position.set(-0.18, 1.55, 0.42);
    leftEye.scale.z = 0.5;
    femaleAvatar.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    rightEye.position.set(0.18, 1.55, 0.42);
    rightEye.scale.z = 0.5;
    femaleAvatar.add(rightEye);
    
    // Eye pupils
    const pupilGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x463f3a });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.18, 1.55, 0.47);
    femaleAvatar.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.18, 1.55, 0.47);
    femaleAvatar.add(rightPupil);
    
    // Eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.03);
    const eyebrowMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    
    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.18, 1.67, 0.43);
    leftEyebrow.rotation.z = -0.1;
    femaleAvatar.add(leftEyebrow);
    
    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.18, 1.67, 0.43);
    rightEyebrow.rotation.z = 0.1;
    femaleAvatar.add(rightEyebrow);
    
    // Lips/mouth - subtle professional look
    const lipsMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(0xDB7093).lerp(new THREE.Color(0xFF69B4), 0.5), 
        shininess: 100 
    });
    const lips = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        lipsMaterial
    );
    lips.scale.y = 0.25;
    lips.scale.z = 0.4;
    lips.rotation.x = -Math.PI / 2;
    lips.position.set(0, 1.3, 0.4);
    femaleAvatar.add(lips);
    
    // Nose
    const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.1, 16),
        skinMaterial
    );
    nose.scale.z = 0.5;
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 1.45, 0.45);
    femaleAvatar.add(nose);
    
    // ----- Body ----- (Professional UI/UX designer outfit)
    // Neck
    const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.3, 32),
        skinMaterial
    );
    neck.position.y = 1.1;
    neck.castShadow = true;
    femaleAvatar.add(neck);
    
    // Torso - modern professional look
    const upperBodyGeometry = new THREE.CylinderGeometry(0.38, 0.32, 0.9, 32);
    const clothingMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333, // Dark professional top
        roughness: 0.7,
        metalness: 0.2
    });
    const upperBody = new THREE.Mesh(upperBodyGeometry, clothingMaterial);
    upperBody.position.y = 0.65;
    upperBody.castShadow = true;
    femaleAvatar.add(upperBody);
    
    // Add tech company logo/badge
    const badgeGeometry = new THREE.CircleGeometry(0.08, 16);
    const badgeMaterial = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.4,
        metalness: 0.6
    });
    const techBadge = new THREE.Mesh(badgeGeometry, badgeMaterial);
    techBadge.position.set(0.20, 0.9, 0.33);
    techBadge.rotation.y = Math.PI / 6;
    femaleAvatar.add(techBadge);
    
    // Professional pants/lower body
    const pantsGeometry = new THREE.CylinderGeometry(0.33, 0.28, 1.3, 32);
    const pantsMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, // Dark professional pants
        roughness: 0.8,
        metalness: 0.2
    });
    const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
    pants.position.y = -0.3;
    pants.castShadow = true;
    femaleAvatar.add(pants);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.8, 16);
    
    // Left arm - bent slightly to look like holding tablet/device
    const leftArm = new THREE.Group();
    
    const leftUpperArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftUpperArm.position.set(0, 0.2, 0);
    leftUpperArm.rotation.z = Math.PI/4;
    leftArm.add(leftUpperArm);
    
    const leftLowerArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftLowerArm.position.set(-0.3, -0.3, 0.2);
    leftLowerArm.rotation.z = -Math.PI/6;
    leftLowerArm.rotation.y = Math.PI/6;
    leftArm.add(leftLowerArm);
    
    leftArm.position.set(-0.4, 0.7, 0);
    femaleAvatar.add(leftArm);
    
    // Right arm - positioned for typing/working
    const rightArm = new THREE.Group();
    
    const rightUpperArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightUpperArm.position.set(0, 0.2, 0);
    rightUpperArm.rotation.z = -Math.PI/4;
    rightArm.add(rightUpperArm);
    
    const rightLowerArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightLowerArm.position.set(0.3, -0.3, 0.2);
    rightLowerArm.rotation.z = Math.PI/6;
    rightLowerArm.rotation.y = -Math.PI/6;
    rightArm.add(rightLowerArm);
    
    rightArm.position.set(0.4, 0.7, 0);
    femaleAvatar.add(rightArm);
    
    // Hands
    const handGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    
    // Left hand
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-0.7, 0.1, 0.3);
    leftHand.castShadow = true;
    femaleAvatar.add(leftHand);
    
    // Right hand
    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(0.7, 0.1, 0.3);
    rightHand.castShadow = true;
    femaleAvatar.add(rightHand);
    
    // Device/tablet in hand
    const tabletGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.02);
    const tabletMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.2,
        metalness: 0.8
    });
    const tablet = new THREE.Mesh(tabletGeometry, tabletMaterial);
    tablet.position.set(-0.5, 0.1, 0.4);
    tablet.rotation.y = Math.PI/10;
    femaleAvatar.add(tablet);
    
    // Screen of tablet
    const screenGeometry = new THREE.BoxGeometry(0.35, 0.25, 0.01);
    const screenMaterial = new THREE.MeshBasicMaterial({
        color: 0x6BA5F2,
        transparent: true,
        opacity: 0.9
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(-0.5, 0.1, 0.415);
    screen.rotation.y = Math.PI/10;
    femaleAvatar.add(screen);
    
    // UI elements on screen
    const uiElementMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    // UI element 1 (header)
    const uiHeader = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.03, 0.01),
        uiElementMaterial
    );
    uiHeader.position.set(-0.5, 0.2, 0.425);
    uiHeader.rotation.y = Math.PI/10;
    femaleAvatar.add(uiHeader);
    
    // UI element 2 (content block)
    const uiContent = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.08, 0.01),
        uiElementMaterial
    );
    uiContent.position.set(-0.5, 0.1, 0.425);
    uiContent.rotation.y = Math.PI/10;
    femaleAvatar.add(uiContent);
    
    // UI element 3 (button)
    const uiButton = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.03, 0.01),
        new THREE.MeshBasicMaterial({ color: accentColor })
    );
    uiButton.position.set(-0.5, 0, 0.425);
    uiButton.rotation.y = Math.PI/10;
    femaleAvatar.add(uiButton);
    
    // Legs with professional boots
    // Left leg
    const leftLegGeometry = new THREE.CylinderGeometry(0.12, 0.09, 1.4, 16);
    const leftLeg = new THREE.Mesh(leftLegGeometry, pantsMaterial);
    leftLeg.position.set(-0.15, -1.2, 0);
    femaleAvatar.add(leftLeg);
    
    // Right leg
    const rightLegGeometry = new THREE.CylinderGeometry(0.12, 0.09, 1.4, 16);
    const rightLeg = new THREE.Mesh(rightLegGeometry, pantsMaterial);
    rightLeg.position.set(0.15, -1.2, 0);
    femaleAvatar.add(rightLeg);
    
    // Boots
    const bootGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.25, 16);
    const bootMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9,
        metalness: 0.2
    });
    
    // Left boot
    const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
    leftBoot.position.set(-0.15, -1.9, 0);
    femaleAvatar.add(leftBoot);
    
    // Right boot
    const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
    rightBoot.position.set(0.15, -1.9, 0);
    femaleAvatar.add(rightBoot);
    
    // Smart watch
    const watchGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.04);
    const watchMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.2,
        metalness: 0.8
    });
    const smartWatch = new THREE.Mesh(watchGeometry, watchMaterial);
    smartWatch.position.set(0.7, 0.3, 0.3);
    smartWatch.rotation.z = Math.PI/12;
    femaleAvatar.add(smartWatch);
    
    // Watch screen
    const watchScreenGeometry = new THREE.BoxGeometry(0.06, 0.1, 0.01);
    const watchScreenMaterial = new THREE.MeshBasicMaterial({
        color: 0x6BA5F2,
        transparent: true,
        opacity: 0.9
    });
    const watchScreen = new THREE.Mesh(watchScreenGeometry, watchScreenMaterial);
    watchScreen.position.set(0.7, 0.3, 0.325);
    watchScreen.rotation.z = Math.PI/12;
    femaleAvatar.add(watchScreen);
    
    // Subtle necklace with tech pendant
    const necklaceGeometry = new THREE.TorusGeometry(0.12, 0.01, 8, 32, Math.PI);
    const necklaceMaterial = new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const necklace = new THREE.Mesh(necklaceGeometry, necklaceMaterial);
    necklace.position.set(0, 1.05, 0.18);
    necklace.rotation.x = Math.PI;
    femaleAvatar.add(necklace);
    
    // Tech pendant
    const pendantGeometry = new THREE.OctahedronGeometry(0.05, 0);
    const pendantMaterial = new THREE.MeshStandardMaterial({
        color: primaryColor,
        metalness: 0.8,
        roughness: 0.2
    });
    const pendant = new THREE.Mesh(pendantGeometry, pendantMaterial);
    pendant.position.set(0, 0.95, 0.25);
    femaleAvatar.add(pendant);
    
    // Add subtle animations for more liveliness
    function animateAvatar() {
        // Subtle breathing movement
        const time = Date.now() * 0.001;
        femaleAvatar.position.y = Math.sin(time) * 0.03;
        
        // Subtle head movement
        head.rotation.y = Math.sin(time * 0.5) * 0.1;
        head.rotation.x = Math.sin(time * 0.3) * 0.05;
        
        // Animate pendant
        pendant.rotation.y += 0.01;
        
        // Animate tablet screen with pulsing effect
        screen.material.opacity = 0.7 + Math.sin(time * 2) * 0.2;
        
        requestAnimationFrame(animateAvatar);
    }
    
    // Start avatar animation
    animateAvatar();
    
    // Add digital elements floating around (representing UI/UX design elements)
    addFloatingElements(femaleAvatar, primaryColor, accentColor, highlightColor);
    
    // Add avatar to the group
    group.add(femaleAvatar);
    
    // Position adjustments
    group.position.y = 0.2;
    
    return Promise.resolve();
}

function addFloatingElements(avatar, primaryColor, accentColor, highlightColor) {
    // Create a group for floating elements
    const floatingElements = new THREE.Group();
    
    // Create various UI design elements floating around the designer
    const elements = [
        // Wireframe cube (representing 3D design)
        {
            geometry: new THREE.BoxGeometry(0.2, 0.2, 0.2),
            material: new THREE.MeshBasicMaterial({
                color: primaryColor,
                wireframe: true
            }),
            position: new THREE.Vector3(-0.8, 1.0, -0.5),
            rotation: new THREE.Vector3(0.5, 0.5, 0),
            speed: 0.005
        },
        
        // Circle (representing UI button)
        {
            geometry: new THREE.CircleGeometry(0.1, 32),
            material: new THREE.MeshBasicMaterial({
                color: accentColor,
                transparent: true,
                opacity: 0.7
            }),
            position: new THREE.Vector3(0.9, 0.8, -0.3),
            rotation: new THREE.Vector3(0, 0, 0),
            speed: 0.007
        },
        
        // Menu bars (representing mobile navigation)
        {
            geometry: new THREE.BoxGeometry(0.2, 0.04, 0.01),
            material: new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            }),
            position: new THREE.Vector3(0.7, 1.5, -0.4),
            rotation: new THREE.Vector3(0, 0, 0),
            speed: 0.003
        },
        
        // Color palette circle
        {
            geometry: new THREE.CircleGeometry(0.15, 32),
            material: new THREE.MeshBasicMaterial({
                color: highlightColor,
                transparent: true,
                opacity: 0.6
            }),
            position: new THREE.Vector3(-0.7, 1.7, -0.6),
            rotation: new THREE.Vector3(0, 0, 0),
            speed: 0.004
        },
        
        // Code brackets (representing development)
        {
            geometry: new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI),
            material: new THREE.MeshBasicMaterial({
                color: 0x00FF00,
                transparent: true,
                opacity: 0.7
            }),
            position: new THREE.Vector3(0.5, 1.5, -0.7),
            rotation: new THREE.Vector3(Math.PI/2, 0, Math.PI/2),
            speed: 0.006
        }
    ];
    
    // Create and add each element
    elements.forEach((element, index) => {
        const mesh = new THREE.Mesh(element.geometry, element.material);
        mesh.position.copy(element.position);
        mesh.rotation.x = element.rotation.x;
        mesh.rotation.y = element.rotation.y;
        mesh.rotation.z = element.rotation.z;
        
        // Store animation properties
        mesh.userData = {
            originalPosition: element.position.clone(),
            originalRotation: new THREE.Vector3(
                element.rotation.x,
                element.rotation.y,
                element.rotation.z
            ),
            speed: element.speed,
            offset: index * Math.PI / elements.length * 2 // Different starting phase
        };
        
        // Animate floating elements
        function animateElement() {
            const time = Date.now() * 0.001;
            
            // Floating motion
            mesh.position.y = mesh.userData.originalPosition.y + 
                Math.sin(time + mesh.userData.offset) * 0.1;
                
            // Rotation
            mesh.rotation.x += mesh.userData.speed;
            mesh.rotation.y += mesh.userData.speed * 0.7;
            
            // Pulse opacity if material is transparent
            if (mesh.material.transparent) {
                mesh.material.opacity = 0.4 + 
                    Math.sin(time * 2 + mesh.userData.offset) * 0.3;
            }
            
            requestAnimationFrame(animateElement);
        }
        
        animateElement();
        floatingElements.add(mesh);
    });
    
    avatar.add(floatingElements);
}

// End of avatar implementation script