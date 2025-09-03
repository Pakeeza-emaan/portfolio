// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    // Add scrolled class slightly earlier for floating effect
    if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Optional: Active link highlighting based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLi = document.querySelectorAll('.navbar-nav .nav-item');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Adjust offset based on navbar height + tolerance
        const offset = 150;
        if (pageYOffset >= sectionTop - offset) {
            current = section.getAttribute('id');
        }
    });

    navLi.forEach(li => {
        li.classList.remove('active');
        const link = li.querySelector('a');
        if (link && link.getAttribute('href') === '#' + current) {
            li.classList.add('active');
        }
         // Handle home link specifically
        if (!current && link && link.getAttribute('href') === '#home') {
             li.classList.add('active');
        }
    });
     // Ensure home is active when at the very top
     if (window.scrollY < 100) {
          navLi.forEach(li => li.classList.remove('active'));
          document.querySelector('.navbar-nav .nav-item a[href="#home"]').parentElement.classList.add('active');
     }
});


// Three.js Background Animation (Keep as is)
(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('three-background'),
        antialias: true,
        alpha: true // Ensure alpha for transparency
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // --- Modified Particles ---
     const particleCount = 400; // More particles
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorChoices = [
        new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()),
        new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim()),
        new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--highlight-color').trim()),
        new THREE.Color(0xffffff) // Add white
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

         // Spread particles more widely, including behind the camera initially
         positions[i3] = (Math.random() - 0.5) * 25; // x
         positions[i3 + 1] = (Math.random() - 0.5) * 25; // y
         positions[i3 + 2] = (Math.random() - 0.5) * 20 - 5; // z


        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

     const particlesGeometry = new THREE.BufferGeometry();
     particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Use PointsMaterial for better particle look
     const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08, // Adjust size
         sizeAttenuation: true, // Particles smaller further away
         vertexColors: true, // Use colors defined above
         transparent: true,
         opacity: 0.8,
         depthWrite: false, // Prevent particles from blocking each other weirdly
         blending: THREE.AdditiveBlending // Glowing effect when overlapping
     });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);


    // Position camera
    camera.position.z = 8; // Slightly closer

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Mouse movement effect
    let mouseX = 0;
    let mouseY = 0;
     let targetX = 0;
     let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;


    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.001; // Smaller multiplier for subtle effect
        mouseY = (event.clientY - windowHalfY) * 0.001;
    });

    // Clock for animation timing
     const clock = new THREE.Clock();

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Smooth camera movement following mouse (Parallax effect)
         targetX = mouseX * 2; // Adjust multiplier for desired parallax intensity
         targetY = mouseY * 2;
        camera.position.x += (targetX - camera.position.x) * 0.03;
        camera.position.y += (-targetY - camera.position.y) * 0.03; // Invert Y for natural parallax
        camera.lookAt(scene.position);

        // Animate particles
         // Option 1: Simple rotation
         // particleSystem.rotation.y = elapsedTime * 0.05;
         // particleSystem.rotation.x = elapsedTime * 0.02;

         // Option 2: Animate individual particles (more complex, more dynamic)
         const positions = particleSystem.geometry.attributes.position.array;
         for (let i = 0; i < particleCount; i++) {
             const i3 = i * 3;
             const x = positions[i3];
             const y = positions[i3 + 1];

             // Example: Subtle sine wave movement
             positions[i3 + 1] = Math.sin(elapsedTime * 0.5 + x * 0.5) * 0.5 + y * 0.99; // Adjust factors for different effects

              // Reset particles that move too far (simple loop) - adjust threshold as needed
              if (positions[i3 + 1] < -12) positions[i3 + 1] = 12;
              if (positions[i3 + 1] > 12) positions[i3 + 1] = -12;
              if (positions[i3] < -12) positions[i3] = 12;
              if (positions[i3] > 12) positions[i3] = -12;


         }
          particleSystem.geometry.attributes.position.needsUpdate = true; // Important!

        renderer.render(scene, camera);
    };

    animate();
})();






// Aboout Section 








// Ensure Three.js and Bootstrap JS are loaded before this script

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const enableThreeJs = true; // Set to false to disable Three.js
    const enableScrollAnimations = true;
    const enableSkillBarAnimations = true;
    const enableMouseParallax = true;
    const parallaxIntensity = 0.01;

    // --- Element Preparation ---
    const animatedElements = [];
    const skillBars = [];

    // Prepare elements for scroll animation
    if (enableScrollAnimations) {
        const elementsToAnimate = document.querySelectorAll(
            '#about .col-lg-7 > div:nth-child(1),' +
            '#about .col-lg-7 > div:nth-child(2),' +
            '#about .col-lg-7 > div:nth-child(3),' +
            '#about .col-lg-7 > div:nth-child(4),' + // Skills block container
            '#about .col-lg-7 > div:nth-child(5),' +
            '#about .col-lg-7 > div:nth-child(6)'
        );
        elementsToAnimate.forEach((el, index) => {
            el.style.animation = 'none'; // Remove potential inline animation
            // Optional: Assign animation type based on index if needed later
            el.dataset.animationType = (index === 0) ? 'fadeInRight' : 'fadeInUp';
            animatedElements.push(el);
        });
    }

    // Prepare Skill bars
    if (enableSkillBarAnimations) {
        const skillBarContainers = document.querySelectorAll('#about .row .col-6 > div:nth-child(2)'); // Target the container div holding the inner bar
        skillBarContainers.forEach(container => {
             const innerBar = container.querySelector('div'); // Get the first inner div
             if (innerBar && innerBar.style.width) {
                 // Add a specific class for easier targeting in CSS/JS
                 innerBar.classList.add('progress-bar-inner-div');

                 const targetWidth = innerBar.style.width; // Read original width
                 innerBar.dataset.targetWidth = targetWidth; // Store it
                 innerBar.style.width = '0%'; // Set initial width via JS
                 innerBar.style.transition = 'width 1.5s 0.2s ease-out'; // Add transition via JS (with slight delay)
                 skillBars.push(innerBar); // Add the inner bar itself to the list
             }
        });
    }

    // --- Three.js Setup (Dynamic Canvas) ---
    let scene, camera, renderer, cube, threeJsCanvas;
    const imageContainerParent = document.querySelector('#about .col-lg-5 > .position-relative'); // Parent container

    function initThreeJs() {
        if (!imageContainerParent) {
            console.warn("Three.js parent container not found.");
            return;
        }

        // 1. Create Canvas Dynamically
       // Apply styles via this ID

        // 2. Append Canvas to the container
        // Insert it after the gradient border but before the image wrapper
        const gradientBorder = imageContainerParent.querySelector('div:first-child');
        if (gradientBorder) {
             gradientBorder.insertAdjacentElement('afterend', threeJsCanvas);
        } else {
             imageContainerParent.prepend(threeJsCanvas); // Fallback
        }


        // 3. Standard Three.js Init using the created canvas
        scene = new THREE.Scene();
        const fov = 75;
        const aspect = imageContainerParent.offsetWidth / imageContainerParent.offsetHeight || 1; // Prevent 0 height
        const near = 0.1;
        const far = 1000;
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 4; // Adjusted position slightly

        renderer = new THREE.WebGLRenderer({
            canvas: threeJsCanvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(imageContainerParent.offsetWidth, imageContainerParent.offsetHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); // Different shape
        const material = new THREE.MeshStandardMaterial({
             color: 0x6f42c1, // Example color (purpleish)
             roughness: 0.4,
             metalness: 0.1
        });
        cube = new THREE.Mesh(geometry, material); // Still named cube, but it's a TorusKnot
        scene.add(cube);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 0.9);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.003;
            cube.rotation.y += 0.004;
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', onWindowResize, false);
         // Initial size update in case container size changes after load
        setTimeout(onWindowResize, 100);
    }

    function onWindowResize() {
         if (!renderer || !camera || !imageContainerParent || !threeJsCanvas) return;
         const width = imageContainerParent.offsetWidth;
         const height = imageContainerParent.offsetHeight;
         if (width > 0 && height > 0) {
             camera.aspect = width / height;
             camera.updateProjectionMatrix();
             renderer.setSize(width, height);
         }
    }

    if (enableThreeJs) {
        // Delay slightly to ensure layout is stable for size calculations
        setTimeout(initThreeJs, 50);
    }


    // --- Intersection Observer for Scroll Animations & Skills ---
    function initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;

                    // General scroll animations
                    if (animatedElements.includes(target)) {
                         target.classList.add('is-visible');
                         // Optional: Apply specific animation class if needed
                         // target.style.animationName = target.dataset.animationType;
                         observer.unobserve(target); // Animate only once
                    }

                    // Check if the skills container itself is intersecting
                    if (enableSkillBarAnimations && target.matches('#about .col-lg-7 > div:nth-child(4)')) {
                        // Animate all skill bars within this container
                        skillBars.forEach(bar => {
                            if (bar.style.width === '0%') { // Only animate if not already done
                                 bar.style.width = bar.dataset.targetWidth;
                            }
                        });
                         // Unobserve the container after triggering skills
                        observer.unobserve(target);
                    }

                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe general animated elements
        animatedElements.forEach(el => observer.observe(el));

        // Observe the SKILLS CONTAINER block (if animations enabled)
         if (enableSkillBarAnimations) {
             const skillsContainer = document.querySelector('#about .col-lg-7 > div:nth-child(4)');
             if (skillsContainer) {
                 observer.observe(skillsContainer);
             }
         }
    }

    if (enableScrollAnimations || enableSkillBarAnimations) {
        initIntersectionObserver();
    }


    // --- Bootstrap Tab Styling Enhancement (Underline) ---
    const tabButtons = document.querySelectorAll('#aboutTabs button[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        // Ensure the span exists or create it - check the original HTML again
        let underlineSpan = button.querySelector('span'); // Assumes span exists like the example
        if (!underlineSpan) {
             // If the span doesn't exist in the actual original HTML,
             // we might need to target differently (e.g., ::after pseudo-element in CSS)
             // or dynamically create spans here (more intrusive).
             // Let's *assume* the spans exist based on the example HTML provided for now.
             console.warn("Underline span not found in tab button:", button);
        } else {
             underlineSpan.classList.add('underline-span'); // Add class for CSS targeting
        }


        button.addEventListener('shown.bs.tab', event => {
             // Reset all spans first
             tabButtons.forEach(btn => {
                 const span = btn.querySelector('.underline-span');
                 if(span) {
                      span.style.opacity = '0';
                      span.style.transform = 'scaleX(0)';
                 }
                 btn.style.opacity = '0.7'; // Reset opacity for all buttons
             });

            // Activate the current one
            const currentSpan = event.target.querySelector('.underline-span');
            if (currentSpan) {
                 currentSpan.style.opacity = '1';
                 currentSpan.style.transform = 'scaleX(1)';
            }
            event.target.style.opacity = '1'; // Ensure active button text is fully opaque
        });
    });

    // Initial state setup for the active tab's underline
    const initiallyActiveButton = document.querySelector('#aboutTabs button.active');
    if (initiallyActiveButton) {
        const activeSpan = initiallyActiveButton.querySelector('.underline-span');
        if (activeSpan) {
            activeSpan.style.opacity = '1';
            activeSpan.style.transform = 'scaleX(1)';
        }
        // Set initial opacity for others
        document.querySelectorAll('#aboutTabs button:not(.active)').forEach(inactiveBtn => {
            inactiveBtn.style.opacity = '0.7';
        });
    }


    // --- Mouse Parallax Effect (Optional) ---
    const parallaxContainer = document.querySelector('#about .col-lg-5 > .position-relative');
    const image = parallaxContainer?.querySelector('img'); // Target the image directly
    // Target decorative elements by structure (less robust, assumes order)
    const decor1 = parallaxContainer?.querySelector('div[style*="bottom: -15px"]');
    const decor2 = parallaxContainer?.querySelector('div[style*="top: -20px"]');

    function handleMouseMove(e) {
        if (!parallaxContainer || !image || !decor1 || !decor2) return;

        const rect = parallaxContainer.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Need to apply transforms relative to existing ones if needed
        // Keep original rotates for decor elements!
        image.style.transform = `translateX(${x * parallaxIntensity * 0.8}px) translateY(${y * parallaxIntensity * 0.8}px)`;
        decor1.style.transform = `translateX(${-x * parallaxIntensity * 1.2}px) translateY(${-y * parallaxIntensity * 1.2}px) rotate(-15deg)`;
        decor2.style.transform = `translateX(${-x * parallaxIntensity * 0.5}px) translateY(${-y * parallaxIntensity * 0.5}px) rotate(30deg)`;
    }

    function resetParallax() {
         if (!image || !decor1 || !decor2) return;
         image.style.transform = `translateX(0px) translateY(0px)`;
         decor1.style.transform = `translateX(0px) translateY(0px) rotate(-15deg)`;
         decor2.style.transform = `translateX(0px) translateY(0px) rotate(30deg)`;
    }

    if (enableMouseParallax && parallaxContainer) {
         parallaxContainer.addEventListener('mousemove', handleMouseMove);
         parallaxContainer.addEventListener('mouseleave', resetParallax);
         [image, decor1, decor2].forEach(el => {
             if(el) el.style.transition = 'transform 0.1s linear';
         });
    }

}); // End DOMContentLoaded














// Aboout Section - 3D Object Animation



// Initialize 3D Object for CTA Banner
document.addEventListener('DOMContentLoaded', function() {
    // Setup Three.js scene for CTA banner
    const ctaCanvas = document.getElementById('cta-3d-canvas');
    
    if (ctaCanvas) {
        const ctaScene = new THREE.Scene();
        const ctaCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const ctaRenderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        
        ctaRenderer.setSize(200, 200);
        ctaCanvas.appendChild(ctaRenderer.domElement);
        
        // Create a simple 3D cube with custom material
        const geometry = new THREE.IcosahedronGeometry(5, 0);
        const material = new THREE.MeshBasicMaterial({
            color: 0x8A2BE2,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        
        const cube = new THREE.Mesh(geometry, material);
        ctaScene.add(cube);
        
        ctaCamera.position.z = 15;
        
        // Animation function
        const animateCta = function() {
            requestAnimationFrame(animateCta);
            
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            
            ctaRenderer.render(ctaScene, ctaCamera);
        };
        
        animateCta();
        
        // Add a glow effect to the canvas
        const glow = document.createElement('div');
        glow.style.position = 'absolute';
        glow.style.width = '100%';
        glow.style.height = '100%';
        glow.style.top = '0';
        glow.style.left = '0';
        glow.style.borderRadius = '50%';
        glow.style.background = 'radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, rgba(0, 0, 0, 0) 70%)';
        glow.style.pointerEvents = 'none';
        ctaCanvas.appendChild(glow);
    }
    
    // Add hover effects to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Find all other cards
            serviceCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.opacity = '0.7';
                    otherCard.style.transform = 'scale(0.98)';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset all cards
            serviceCards.forEach(otherCard => {
                otherCard.style.opacity = '1';
                otherCard.style.transform = '';
            });
        });
    });
});











// Projects Section

const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        const filter = this.dataset.filter;

        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        portfolioItems.forEach(item => {
            if (filter === 'all' || item.classList.contains(filter)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});


// 3D Canvas Setup (Project 4) - Ensure this is correctly implemented.
const canvas = document.getElementById('project-3d-preview');
if (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setClearColor(0x533483); // Match the background color of the portfolio-img

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);


    // 3D Object (Example: a rotating cube)
    const geometry = new THREE.TorusGeometry( 1, 0.3, 16, 100 );
    const material = new THREE.MeshStandardMaterial({ color: 0x9867C5, roughness: 0.3, metalness: 0.5 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Function to handle resizing of the canvas and update the camera
    function resizeCanvas() {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // Initial call to set the correct size
    resizeCanvas();

    // Listen for the window resize event, and call the function
    window.addEventListener('resize', resizeCanvas);


    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;

        renderer.render(scene, camera);
    }

    // Start the animation.
    animate();
}







// Contact Section 
document.addEventListener('DOMContentLoaded', function() {
    // Form validation and submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !subject || !message) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call with timeout
            setTimeout(function() {
                // Reset form
                contactForm.reset();
                
                // Show success message
                alert('Your message has been sent successfully!');
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Add glowing effect to the map
    const mapContainer = document.querySelector('.map-container');
    
    if (mapContainer) {
        // Create a glow effect on the map
        const glow = document.createElement('div');
        glow.style.position = 'absolute';
        glow.style.width = '300px';
        glow.style.height = '300px';
        glow.style.top = '50%';
        glow.style.left = '50%';
        glow.style.transform = 'translate(-50%, -50%)';
        glow.style.borderRadius = '50%';
        glow.style.background = 'radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, rgba(0, 0, 0, 0) 70%)';
        glow.style.pointerEvents = 'none';
        glow.style.zIndex = '1';
        
        mapContainer.appendChild(glow);
    }
    
    // Floating animation for map pin
    const mapPin = document.querySelector('.map-pin');
    
    if (mapPin) {
        let floatValue = 0;
        const floatAnimation = function() {
            floatValue += 0.01;
            mapPin.style.transform = `translateY(${Math.sin(floatValue) * 5}px)`;
            
            requestAnimationFrame(floatAnimation);
        };
        
        floatAnimation();
    }
});



// Footer Section

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterMessage = document.getElementById('newsletter-message');
    
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        newsletterMessage.classList.remove('d-none');
        newsletterForm.querySelector('input').value = '';
        setTimeout(() => {
          newsletterMessage.classList.add('d-none');
        }, 3000);
      });
    }
    
    // Back to top button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
      backToTopButton.addEventListener('click', function() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
      
      // Show/hide the button based on scroll position
      window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
          backToTopButton.style.display = 'flex';
        } else {
          backToTopButton.style.display = 'none';
        }
      });
    }
  });