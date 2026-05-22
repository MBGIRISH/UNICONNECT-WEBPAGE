/**
 * UniConnect — High-Performance Interactivity Engine
 * Handles Simulator Toggles, Modals, Form Validation, Scroll Animations, & Statistics Counters
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7ixNypd0koXkKFn66AK4UkqRUcECbyyo",
  authDomain: "uniconnect-web-450c0.firebaseapp.com",
  projectId: "uniconnect-web-450c0",
  storageBucket: "uniconnect-web-450c0.firebasestorage.app",
  messagingSenderId: "1011516689900",
  appId: "1:1011516689900:web:b569c2883b0be1c54b04c9",
  measurementId: "G-03VVHYD3JT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MOBILE MENU DRAWER CONTROLLER
    // ==========================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            // Toggle hamburger animation
            const bars = mobileMenuToggle.querySelectorAll('.menu-bar');
            if (mobileMenuToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                const bars = mobileMenuToggle.querySelectorAll('.menu-bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            });
        });
    }

    // ==========================================
    // 2. MOBILE APP SIMULATOR & AUTO-ROTATION
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const appViews = document.querySelectorAll('.app-view');
    const deviceFrame = document.querySelector('.device-frame');
    
    let simulatorRotationInterval;
    let isSimulatorHoveredOrClicked = false;
    const viewsList = ['view-feed', 'view-groups', 'view-marketplace', 'view-resources', 'view-events'];
    let currentViewIndex = 0;
    
    function switchSimulatorView(targetViewId) {
        // Remove active class from all tabs and views
        tabButtons.forEach(btn => btn.classList.remove('active'));
        appViews.forEach(view => view.classList.remove('active'));
        
        // Find corresponding button and view
        const targetBtn = Array.from(tabButtons).find(btn => btn.getAttribute('data-target') === targetViewId);
        const targetView = document.getElementById(targetViewId);
        
        if (targetBtn && targetView) {
            targetBtn.classList.add('active');
            targetView.classList.add('active');
            
            // Keep tracked index aligned
            currentViewIndex = viewsList.indexOf(targetViewId);
            
            // Scroll internal chat to bottom if switching to groups (chat panel inside groups view)
            if (targetViewId === 'view-groups') {
                const chatContainer = document.getElementById('chat-msg-area');
                if (chatContainer) {
                    setTimeout(() => {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }, 50);
                }
            }
        }
    }
    
    // Tab Button manual clicks
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            isSimulatorHoveredOrClicked = true;
            clearInterval(simulatorRotationInterval);
            const target = button.getAttribute('data-target');
            switchSimulatorView(target);
        });
    });
    
    // Auto Rotation Loop
    function startSimulatorAutoRotation() {
        simulatorRotationInterval = setInterval(() => {
            if (!isSimulatorHoveredOrClicked) {
                currentViewIndex = (currentViewIndex + 1) % viewsList.length;
                switchSimulatorView(viewsList[currentViewIndex]);
            }
        }, 4500); // Shift app mock screens every 4.5 seconds
    }
    
    // Pause auto rotation on device frame mouse hover
    if (deviceFrame) {
        deviceFrame.addEventListener('mouseenter', () => {
            isSimulatorHoveredOrClicked = true;
            clearInterval(simulatorRotationInterval);
        });
        
        deviceFrame.addEventListener('mouseleave', () => {
            isSimulatorHoveredOrClicked = false;
            startSimulatorAutoRotation();
        });
    }
    
    // Initialize auto rotation
    startSimulatorAutoRotation();

    // ==========================================
    // 3. INTERSECTION OBSERVER FOR SCROLL REVEALS
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Trigger stats number counts if the market stats section is revealed
                if (entry.target.classList.contains('section-market')) {
                    triggerStatsCounters();
                }
                
                // Unobserve once revealed to keep scrolling fast
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
    
    // If market section starts visible
    const marketSec = document.getElementById('market');
    if (marketSec) {
        revealObserver.observe(marketSec);
    }

    // ==========================================
    // 4. METRIC SHOWCASE COUNTER ANIMATIONS
    // ==========================================
    let countersInitiated = false;
    
    function triggerStatsCounters() {
        if (countersInitiated) return;
        countersInitiated = true;
        
        animateCounter('stat-students', 0, 40, 1500, 'M+');
        animateCounter('stat-spend', 0, 2.5, 1800, 'L Cr+', '₹');
        animateCounter('stat-engagement', 0, 92, 1200, '%');
    }
    
    function animateCounter(elementId, startValue, endValue, durationMs, suffix = '', prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let startTime = null;
        const isFloat = !Number.isInteger(endValue) || !Number.isInteger(startValue);
        
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / durationMs, 1);
            
            // Cubic bezier out easing
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const rawValue = easeProgress * (endValue - startValue) + startValue;
            const currentValue = isFloat ? rawValue.toFixed(1) : Math.floor(rawValue);
            
            element.textContent = `${prefix}${currentValue}${suffix}`;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = `${prefix}${endValue}${suffix}`;
            }
        }
        
        window.requestAnimationFrame(step);
    }

    // ==========================================
    // 5. INTERACTIVE ROADMAP TAB SWITCHING
    // ==========================================
    const roadmapTabs = document.querySelectorAll('.roadmap-tab');
    const phaseContents = document.querySelectorAll('.roadmap-phase-content');
    
    roadmapTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roadmapTabs.forEach(t => t.classList.remove('active'));
            phaseContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetPhase = tab.getAttribute('data-phase');
            const targetContent = document.getElementById(`phase-${targetPhase}`);
            
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ==========================================
    // 6. INTERACTIVE MODAL ACTIONS
    // ==========================================
    const modalWaitlist = document.getElementById('modal-waitlist');
    const modalAmbassador = document.getElementById('modal-ambassador');
    const modalPartner = document.getElementById('modal-partner');
    
    const triggerWaitlistBtns = document.querySelectorAll('.trigger-waitlist-modal');
    const triggerAmbassadorBtns = document.querySelectorAll('.trigger-ambassador-modal');
    
    const triggerPartnerBtn = document.getElementById('trigger-partner-modal');
    const triggerInvestorBtn = document.getElementById('trigger-investor-modal');
    
    const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
    const allModals = document.querySelectorAll('.modal-overlay');

    // Check Local Storage on load to update buttons if user previously signed up
    if (localStorage.getItem('uniconnect_waitlist_registered') === 'true') {
        updateAllWaitlistButtons();
    }
    
    function openModal(modalEl) {
        modalEl.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }
    
    function closeModal(modalEl) {
        modalEl.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Reset forms inside on close
        const form = modalEl.querySelector('form');
        const success = modalEl.querySelector('.modal-success-state');
        if (form && success) {
            form.style.display = 'block';
            success.style.display = 'none';
            form.reset();
        }
    }
    
    // Bind triggers
    triggerWaitlistBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // If already registered, don't open modal, just let them feel secure
            if (localStorage.getItem('uniconnect_waitlist_registered') === 'true') {
                showFloatingToast("✓ You are already securely on the UniConnect premium waitlist!");
                return;
            }
            
            // Proactively auto-populate email from final section signup if present
            const finalEmailInput = document.getElementById('input-final-email');
            const modalEmailInput = document.getElementById('wl-email');
            if (finalEmailInput && modalEmailInput && finalEmailInput.value) {
                modalEmailInput.value = finalEmailInput.value;
            }
            
            openModal(modalWaitlist);
        });
    });
    
    triggerAmbassadorBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(modalAmbassador);
        });
    });
    
    if (triggerPartnerBtn && modalPartner) {
        triggerPartnerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('partner-modal-title').textContent = "University Partnerships";
            document.getElementById('partner-modal-desc').textContent = "Learn how to officially sponsor departments, integrate safe-exchange lockers, or request institutional admin portals.";
            openModal(modalPartner);
        });
    }
    
    if (triggerInvestorBtn && modalPartner) {
        triggerInvestorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('partner-modal-title').textContent = "Investor Relations Portal";
            document.getElementById('partner-modal-desc').textContent = "Inquire regarding seed allocation, metrics deck request, and expansion financials. We respond within 1 business day.";
            openModal(modalPartner);
        });
    }
    
    // Bind close actions
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const parentModal = btn.closest('.modal-overlay');
            if (parentModal) closeModal(parentModal);
        });
    });
    
    // Close on overlay backing click
    allModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Keypress ESC to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            allModals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });

    // ==========================================
    // 7. FORM SUBMISSIONS & SECURE .EDU VALIDATION
    // ==========================================
    
    // Helper to validate university email domains (supporting .edu, .edu.in, .ac.in, .res.in, and general academic .in domains)
    function isValidUniversityEmail(email) {
        const emailLower = email.toLowerCase();
        return emailLower.endsWith('.edu') || 
               emailLower.endsWith('.edu.in') || 
               emailLower.endsWith('.ac.in') || 
               emailLower.endsWith('.res.in') ||
               emailLower.endsWith('.in');
    }
    
    // A. Waitlist Form
    const formWaitlist = document.getElementById('form-waitlist');
    if (formWaitlist) {
        formWaitlist.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('wl-email');
            const nameInput = document.getElementById('wl-name');
            const collegeSelect = document.getElementById('wl-college');
            const email = emailInput.value.trim().toLowerCase();
            const name = nameInput.value.trim();
            const college = collegeSelect.value;
            
            // Institutional SSO .edu / .in Gate Check
            if (!isValidUniversityEmail(email)) {
                showInputFieldError(emailInput, "A valid university email ending in .edu or .in is required to gate active campus networks.");
                return;
            }
            
            const submitBtn = formWaitlist.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Verifying SSO & Saving...";
            
            // Save to Firestore waitlist collection
            addDoc(collection(db, "waitlist"), {
                name: name,
                email: email,
                college: college,
                timestamp: serverTimestamp()
            })
            .then(() => {
                // Generate a personalized referral code and dynamic URL based on current host domain
                const refCode = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) + Math.floor(100 + Math.random() * 900);
                const refUrl = `${window.location.origin}/?ref=${refCode}`;
                
                const refLinkEl = document.getElementById('ref-link');
                if (refLinkEl) {
                    refLinkEl.textContent = refUrl;
                }

                // Simulated validation success response transition
                simulateFormSuccess(formWaitlist, 'wl-success');
                
                // Persistent storage tracking
                localStorage.setItem('uniconnect_waitlist_registered', 'true');
                localStorage.setItem('uniconnect_waitlist_name', name);
                localStorage.setItem('uniconnect_referral_code', refCode);
                updateAllWaitlistButtons();
            })
            .catch((error) => {
                console.error("Firebase save error: ", error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                showInputFieldError(emailInput, "Unable to save waitlist reservation. Please try again.");
            });
        });
    }
    
    // B. Ambassador Form
    const formAmbassador = document.getElementById('form-ambassador');
    if (formAmbassador) {
        formAmbassador.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('amb-name');
            const emailInput = document.getElementById('amb-email');
            const collegeInput = document.getElementById('amb-college');
            const socialInput = document.getElementById('amb-social');
            const roleInput = document.getElementById('amb-role');
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const college = collegeInput.value.trim();
            const social = socialInput.value.trim();
            const role = roleInput.value.trim();
            
            if (!isValidUniversityEmail(email)) {
                showInputFieldError(emailInput, "Ambassadors must verify enrollment using an official university email (.edu or .in).");
                return;
            }
            
            const submitBtn = formAmbassador.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting Application...";
            
            // Save to Firestore ambassadors collection
            addDoc(collection(db, "ambassadors"), {
                name: name,
                email: email,
                college: college,
                social: social,
                role: role,
                timestamp: serverTimestamp()
            })
            .then(() => {
                simulateFormSuccess(formAmbassador, 'amb-success');
            })
            .catch((error) => {
                console.error("Firebase save error: ", error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                showInputFieldError(emailInput, "Unable to submit application. Please try again.");
            });
        });
    }
    
    // C. Partner / Investor Form
    const formPartner = document.getElementById('form-partner');
    if (formPartner) {
        formPartner.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('pt-name');
            const emailInput = document.getElementById('pt-email');
            const orgInput = document.getElementById('pt-org');
            const msgInput = document.getElementById('pt-msg');
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const org = orgInput.value.trim();
            const msg = msgInput.value.trim();
            
            const submitBtn = formPartner.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending Inquiry...";
            
            // Save to Firestore partnerships collection
            addDoc(collection(db, "partnerships"), {
                name: name,
                email: email,
                organization: org,
                message: msg,
                timestamp: serverTimestamp()
            })
            .then(() => {
                simulateFormSuccess(formPartner, 'pt-success');
            })
            .catch((error) => {
                console.error("Firebase save error: ", error);
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                alert("Unable to send inquiry. Please try again.");
            });
        });
    }

    // Copy Referral link mock mechanism
    const btnCopyRef = document.getElementById('btn-copy-ref');
    if (btnCopyRef) {
        btnCopyRef.addEventListener('click', () => {
            const refLink = document.getElementById('ref-link').textContent;
            navigator.clipboard.writeText(refLink).then(() => {
                btnCopyRef.textContent = "Copied!";
                btnCopyRef.style.background = "#10b981";
                setTimeout(() => {
                    btnCopyRef.textContent = "Copy";
                    btnCopyRef.style.background = "";
                }, 2000);
            }).catch(() => {
                showFloatingToast("Link copied to clipboard!");
            });
        });
    }

    // ==========================================
    // HELPER FUNCTIONS & UI TOASTS
    // ==========================================
    
    function showInputFieldError(inputEl, errorMessage) {
        // Prevent stacking errors
        const existingErr = inputEl.parentNode.querySelector('.field-error-msg');
        if (existingErr) existingErr.remove();
        
        // Add border flash
        inputEl.style.borderColor = '#f43f5e';
        inputEl.style.boxShadow = '0 0 10px rgba(244, 63, 94, 0.3)';
        
        const errSpan = document.createElement('span');
        errSpan.className = 'field-error-msg';
        errSpan.style.color = '#f43f5e';
        errSpan.style.fontSize = '0.72rem';
        errSpan.style.marginTop = '0.4rem';
        errSpan.style.display = 'block';
        errSpan.textContent = errorMessage;
        
        inputEl.parentNode.appendChild(errSpan);
        
        // Remove error states when typing resumes
        inputEl.addEventListener('input', function clearError() {
            inputEl.style.borderColor = '';
            inputEl.style.boxShadow = '';
            errSpan.remove();
            inputEl.removeEventListener('input', clearError);
        });
    }
    
    function simulateFormSuccess(formEl, successContainerId) {
        const successState = document.getElementById(successContainerId);
        if (successState) {
            formEl.style.display = 'none';
            successState.style.display = 'flex';
        }
    }
    
    function updateAllWaitlistButtons() {
        const wlButtons = document.querySelectorAll('.trigger-waitlist-modal, #btn-final-signup');
        wlButtons.forEach(btn => {
            btn.innerHTML = 'Registered ✓';
            btn.style.background = 'rgba(16, 185, 129, 0.1)';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            btn.classList.remove('btn-glow');
            btn.style.boxShadow = 'none';
        });
        
        // Update final inline box placeholder
        const finalEmailBox = document.getElementById('input-final-email');
        if (finalEmailBox) {
            finalEmailBox.value = "";
            finalEmailBox.disabled = true;
            finalEmailBox.placeholder = "Secured early access slot. Welcome aboard! 🎓";
        }
    }
    // Elegant toast utility
    function showFloatingToast(message) {
        const toast = document.createElement('div');
        toast.className = 'glass-panel';
        toast.style.position = 'fixed';
        toast.style.bottom = '2rem';
        toast.style.right = '2rem';
        toast.style.zIndex = '1200';
        toast.style.padding = '1rem 1.5rem';
        toast.style.borderRadius = '12px';
        toast.style.borderColor = 'var(--primary)';
        toast.style.boxShadow = 'var(--shadow-glow)';
        toast.style.fontSize = '0.9rem';
        toast.style.color = 'var(--text-main)';
        toast.style.animation = 'fadeReveal 0.4s ease-in-out forwards';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeReveal 0.4s ease-in-out reverse forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // ==========================================
    // 8. CAMPUS FEED CHANNELS & POST CREATOR INTERACTIVITY
    // ==========================================
    const channelTabs = document.querySelectorAll('.channel-tab');
    const postsContainer = document.getElementById('feed-posts-container');
    const feedPostTrigger = document.getElementById('feed-post-trigger');
    const feedCreatorModal = document.getElementById('feed-creator-modal');
    const closeCreatorBtn = document.getElementById('btn-close-creator');
    const submitPostBtn = document.getElementById('btn-submit-post');
    const postText = document.getElementById('post-text');
    const postChannel = document.getElementById('post-channel');

    function switchFeedChannel(channel) {
        channelTabs.forEach(t => {
            if (t.getAttribute('data-channel') === channel) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        const mockPosts = document.querySelectorAll('.mock-post');
        mockPosts.forEach(post => {
            if (channel === 'all' || post.getAttribute('data-channel') === channel) {
                post.style.display = 'block';
                post.style.opacity = '0';
                setTimeout(() => {
                    post.style.transition = 'opacity 0.3s ease';
                    post.style.opacity = '1';
                }, 50);
            } else {
                post.style.display = 'none';
            }
        });
    }

    if (channelTabs) {
        channelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const channel = tab.getAttribute('data-channel');
                switchFeedChannel(channel);
            });
        });
    }

    if (feedPostTrigger && feedCreatorModal) {
        feedPostTrigger.addEventListener('click', () => {
            feedCreatorModal.style.display = 'flex';
        });
    }

    if (closeCreatorBtn && feedCreatorModal) {
        closeCreatorBtn.addEventListener('click', () => {
            feedCreatorModal.style.display = 'none';
        });
    }

    if (submitPostBtn && postsContainer) {
        submitPostBtn.addEventListener('click', () => {
            const text = postText.value.trim();
            if (!text) {
                showFloatingToast("⚠️ Please enter post content first!");
                return;
            }
            const channel = postChannel.value;
            
            const newPost = document.createElement('div');
            newPost.className = 'mock-post';
            newPost.setAttribute('data-channel', channel);
            newPost.innerHTML = `
                <div class="post-header">
                    <div class="post-avatar p1" style="background: var(--primary-glow)"></div>
                    <div class="post-meta">
                        <span class="post-author">You <span class="badge-tag">RVCE '28</span></span>
                        <span class="post-time">Just now in #${channel}</span>
                    </div>
                    <span class="post-menu">•••</span>
                </div>
                <div class="post-content">
                    <p>${text}</p>
                </div>
                <div class="post-footer">
                    <span class="post-action post-like-btn" data-liked="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> <span class="like-count">0</span> Likes</span>
                    <span class="post-action"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 0 Comments</span>
                </div>
            `;
            
            postsContainer.insertBefore(newPost, postsContainer.firstChild);
            postText.value = '';
            feedCreatorModal.style.display = 'none';
            switchFeedChannel('all');
            showFloatingToast("🎉 Gated post published to RVCE feed!");
        });
    }

    // Like Button delegator
    document.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.post-like-btn');
        if (likeBtn) {
            const isLiked = likeBtn.getAttribute('data-liked') === 'true';
            const likeCountEl = likeBtn.querySelector('.like-count');
            let likes = parseInt(likeCountEl.textContent);
            if (isLiked) {
                likeBtn.setAttribute('data-liked', 'false');
                likeBtn.classList.remove('liked');
                likeBtn.style.color = '';
                likeBtn.querySelector('svg').style.fill = 'none';
                likeCountEl.textContent = likes - 1;
            } else {
                likeBtn.setAttribute('data-liked', 'true');
                likeBtn.classList.add('liked');
                likeBtn.style.color = '#f43f5e';
                likeBtn.querySelector('svg').style.fill = '#f43f5e';
                likeCountEl.textContent = likes + 1;
            }
        }
    });


    // ==========================================
    // 9. GROUPS CHAT INTERACTION & JOIN/REQUEST TOGGLES
    // ==========================================
    const openChatTriggers = document.querySelectorAll('.open-chat-trigger, .btn-active-chat');
    const groupsDirView = document.getElementById('groups-dir-view');
    const nestedChatPane = document.getElementById('nested-chat-pane');
    const chatBackBtn = document.getElementById('chat-back-to-dir');
    const chatActiveTitle = document.getElementById('chat-active-title');
    const chatMsgArea = document.getElementById('chat-msg-area');
    const typingIndicator = document.getElementById('chat-typing-indicator');
    const chatInputBox = document.getElementById('chat-input-box');
    const chatSendTrigger = document.getElementById('chat-send-trigger');

    // Hide typing indicator initially
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }

    if (openChatTriggers && groupsDirView && nestedChatPane) {
        openChatTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Get group name
                let groupName = "CS106B Study Group";
                const parentCard = trigger.closest('.group-card-item');
                if (parentCard) {
                    groupName = parentCard.getAttribute('data-group');
                }
                
                if (chatActiveTitle) {
                    chatActiveTitle.textContent = groupName;
                }

                groupsDirView.classList.remove('active');
                nestedChatPane.style.display = 'flex';
                
                // Scroll to bottom
                setTimeout(() => {
                    chatMsgArea.scrollTop = chatMsgArea.scrollHeight;
                }, 50);
            });
        });
    }

    if (chatBackBtn && groupsDirView && nestedChatPane) {
        chatBackBtn.addEventListener('click', () => {
            nestedChatPane.style.display = 'none';
            groupsDirView.classList.add('active');
        });
    }

    // Message Send Interaction
    function handleSendMessage() {
        if (!chatInputBox || !chatMsgArea) return;
        const msg = chatInputBox.value.trim();
        if (!msg) return;

        const sentMsg = document.createElement('div');
        sentMsg.className = 'chat-bubble sent';
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sentMsg.innerHTML = `
            <p>${msg}</p>
            <span class="msg-time">${timeStr}</span>
        `;

        if (typingIndicator) {
            chatMsgArea.insertBefore(sentMsg, typingIndicator);
        } else {
            chatMsgArea.appendChild(sentMsg);
        }

        chatInputBox.value = '';
        chatMsgArea.scrollTop = chatMsgArea.scrollHeight;

        // Auto Typing Simulation
        setTimeout(() => {
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
                chatMsgArea.scrollTop = chatMsgArea.scrollHeight;
            }

            setTimeout(() => {
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }

                const replies = [
                    "That's so true! Let's meet up soon.",
                    "Awesome insight. Let me double check.",
                    "Sounds good to me, see you at the campus canteen for some hot chai!",
                    "Perfect, let's write code together! 💻"
                ];
                const replyText = replies[Math.floor(Math.random() * replies.length)];

                const replyMsg = document.createElement('div');
                replyMsg.className = 'chat-bubble received';
                replyMsg.innerHTML = `
                    <span class="sender-name">Sofia Rossi</span>
                    <p>${replyText}</p>
                    <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                `;

                if (typingIndicator) {
                    chatMsgArea.insertBefore(replyMsg, typingIndicator);
                } else {
                    chatMsgArea.appendChild(replyMsg);
                }
                chatMsgArea.scrollTop = chatMsgArea.scrollHeight;
            }, 1500);
        }, 800);
    }

    if (chatSendTrigger) {
        chatSendTrigger.addEventListener('click', handleSendMessage);
    }

    if (chatInputBox) {
        chatInputBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }

    // Join/Request toggles on Click Delegator
    document.addEventListener('click', (e) => {
        const btn = e.target;
        if (btn.classList.contains('btn-join-group') || btn.classList.contains('btn-join-comm')) {
            const isJoined = btn.getAttribute('data-joined') === 'true';
            if (!isJoined) {
                btn.setAttribute('data-joined', 'true');
                btn.textContent = 'Joined ✓';
                btn.style.background = 'rgba(6, 182, 212, 0.15)';
                btn.style.borderColor = 'var(--secondary)';
                btn.style.color = 'var(--secondary)';
                showFloatingToast("✓ Securely joined campus community directory!");
            } else {
                btn.setAttribute('data-joined', 'false');
                btn.textContent = 'Join';
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
                showFloatingToast("Left community directory.");
            }
        }

        if (btn.classList.contains('btn-request-group') || btn.classList.contains('btn-request-comm')) {
            const isRequested = btn.getAttribute('data-requested') === 'true';
            if (!isRequested) {
                btn.setAttribute('data-requested', 'true');
                btn.textContent = 'Pending 🕒';
                btn.style.background = 'rgba(234, 179, 8, 0.15)';
                btn.style.borderColor = '#eab308';
                btn.style.color = '#eab308';
                showFloatingToast("🕒 Access request sent safely to group admin!");
            } else {
                btn.setAttribute('data-requested', 'false');
                btn.textContent = 'Request';
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
                showFloatingToast("Cancelled private access request.");
            }
        }
    });


    // ==========================================
    // 10. STUDENT RESOURCES VAULT INTERACTIVITY & SIMULATED UPLOADER
    // ==========================================
    const resTags = document.querySelectorAll('.course-tag');
    const resItems = document.querySelectorAll('.resource-card-item');
    const triggerUploadModal = document.getElementById('btn-trigger-upload-modal');
    const uploadModal = document.getElementById('res-upload-modal');
    const closeUploadBtn = document.getElementById('btn-close-upload');
    const submitUploadBtn = document.getElementById('btn-submit-upload');
    const upTitle = document.getElementById('up-title');
    const upCourse = document.getElementById('up-course');
    const resListContainer = document.getElementById('resources-list-container');

    // Tags filtering
    if (resTags) {
        resTags.forEach(tag => {
            tag.addEventListener('click', () => {
                resTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');

                const filter = tag.getAttribute('data-filter');
                resItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-course') === filter) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Download Simulator (Spinning progress state transitions)
    document.addEventListener('click', (e) => {
        const dlBtn = e.target.closest('.btn-res-download, .btn-preview-dl');
        if (dlBtn) {
            if (dlBtn.classList.contains('saved') || dlBtn.classList.contains('downloading')) return;

            const fileName = dlBtn.getAttribute('data-file') || "document.pdf";
            dlBtn.classList.add('downloading');
            dlBtn.textContent = "...";

            setTimeout(() => {
                dlBtn.classList.remove('downloading');
                dlBtn.classList.add('saved');
                dlBtn.textContent = "Saved ✓";
                showFloatingToast(`🎉 "${fileName}" safely saved to your secure Student Vault!`);
            }, 1200);
        }
    });

    // Upload note dialog interactions (Simulator screen)
    if (triggerUploadModal && uploadModal) {
        triggerUploadModal.addEventListener('click', () => {
            uploadModal.style.display = 'flex';
        });
    }

    if (closeUploadBtn && uploadModal) {
        closeUploadBtn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });
    }

    if (submitUploadBtn && resListContainer) {
        submitUploadBtn.addEventListener('click', () => {
            const title = upTitle.value.trim();
            if (!title) {
                showFloatingToast("⚠️ Please enter a document name first!");
                return;
            }
            const course = upCourse.value;
            const courseLower = course.toLowerCase();

            const newCard = document.createElement('div');
            newCard.className = 'resource-card-item';
            newCard.setAttribute('data-course', courseLower);
            newCard.innerHTML = `
                <div class="res-type-icon">📝</div>
                <div class="res-info-meta">
                    <span class="res-title">${title}.pdf</span>
                    <span class="res-meta-details">${course} • ⭐ 5.0 (0 DLs)</span>
                </div>
                <button class="btn-res-download" data-file="${title}.pdf">Download</button>
            `;

            resListContainer.insertBefore(newCard, resListContainer.firstChild);
            upTitle.value = '';
            uploadModal.style.display = 'none';
            
            // Switch filter to show all
            if (resTags && resTags[0]) {
                resTags[0].click();
            }
            showFloatingToast(`✓ Successfully uploaded ${title} to ${course} Vault!`);
        });
    }

    // ==========================================
    // 11. FEATURE BLOCK 5 TOUR INTERACTIVE SIMULATOR
    // ==========================================
    const tourUploadTrigger = document.getElementById('preview-upload-trigger');
    const tourUploadBox = document.getElementById('preview-upload-box');
    const tourUploadCancel = document.getElementById('preview-upload-cancel');
    const tourUploadSubmit = document.getElementById('preview-upload-submit');
    const tourUpName = document.getElementById('preview-up-name');
    const tourUpCourse = document.getElementById('preview-up-course');
    const tourResList = document.getElementById('preview-res-list');

    if (tourUploadTrigger && tourUploadBox) {
        tourUploadTrigger.addEventListener('click', () => {
            tourUploadBox.style.display = 'flex';
        });
    }

    if (tourUploadCancel && tourUploadBox) {
        tourUploadCancel.addEventListener('click', () => {
            tourUploadBox.style.display = 'none';
        });
    }

    if (tourUploadSubmit && tourResList) {
        tourUploadSubmit.addEventListener('click', () => {
            const name = tourUpName.value.trim();
            if (!name) {
                showFloatingToast("⚠️ Please enter a document title first!");
                return;
            }
            const course = tourUpCourse.value;
            const fileName = name.endsWith('.pdf') ? name : `${name}.pdf`;

            const newPreviewCard = document.createElement('div');
            newPreviewCard.className = 'res-preview-card';
            newPreviewCard.innerHTML = `
                <div class="res-icon">📄</div>
                <div class="res-details">
                    <span class="name">${fileName}</span>
                    <span class="meta">${course} • ⭐ 5.0 (0 DLs)</span>
                </div>
                <button class="btn btn-primary btn-xs btn-preview-dl" data-file="${fileName}">Download</button>
            `;

            tourResList.insertBefore(newPreviewCard, tourResList.firstChild);
            tourUpName.value = '';
            tourUploadBox.style.display = 'none';
            showFloatingToast(`✓ Successfully uploaded "${fileName}" to the Feature Tour!`);
        });
    }

    // ==========================================
    // 12. STATE-OF-THE-ART 3D ORBITING FEATURES WHEEL CONTROLLER
    // ==========================================
    const hubVisual = document.querySelector('.hub-visual');
    const orbitRing = document.querySelector('.hub-orbit-ring');
    const satellites = document.querySelectorAll('.satellite-node');

    if (hubVisual && orbitRing && satellites.length > 0) {
        let currentRotation = 0; // Degrees
        let targetRotation = 0; // Smooth easing target
        let isDragging = false;
        let startX = 0;
        let previousX = 0;
        let lastTime = 0;
        let velocity = 0; // Kinetic momentum speed
        let autoRotateActive = true;
        let autoRotateTimeout = null;

        // Apply 3D upright billboarding counter-rotation on every satellite
        function updateRingTransform() {
            orbitRing.style.setProperty('--ring-rotation', `${currentRotation}deg`);
            satellites.forEach(sat => {
                const satAngle = parseFloat(sat.getAttribute('data-angle'));
                // Standard billboard transformation that completely neutralizes ring tilt and rotation
                sat.style.transform = `rotateY(${satAngle}deg) translateZ(var(--orbit-radius, 200px)) rotateY(${-satAngle - currentRotation}deg) rotateX(-65deg)`;
            });
        }

        // Kinetic physics and auto-rotation animation loop
        function animationLoop(timestamp) {
            if (isDragging) {
                // Dragging computes immediate changes, no loop damping
                lastTime = timestamp;
            } else {
                // Apply drag friction/inertia decay
                if (Math.abs(velocity) > 0.05) {
                    currentRotation += velocity;
                    velocity *= 0.95; // Friction coefficient
                } else {
                    velocity = 0;
                    
                    // Smoothly animate towards click-to-focus targets
                    if (Math.abs(targetRotation - currentRotation) > 0.1) {
                        currentRotation += (targetRotation - currentRotation) * 0.1;
                    } else if (autoRotateActive) {
                        // Regular constant auto spin when idle
                        currentRotation += 0.08; 
                        targetRotation = currentRotation;
                    }
                }
            }

            // Normalization to keep rotation coordinates clean [0, 360]
            if (currentRotation > 360) {
                currentRotation -= 360;
                targetRotation -= 360;
            } else if (currentRotation < 0) {
                currentRotation += 360;
                targetRotation += 360;
            }

            updateRingTransform();
            requestAnimationFrame(animationLoop);
        }

        // Temporarily pause auto rotation during interaction
        function pauseAutoRotateTemporarily() {
            autoRotateActive = false;
            clearTimeout(autoRotateTimeout);
            autoRotateTimeout = setTimeout(() => {
                autoRotateActive = true;
                targetRotation = currentRotation;
            }, 3500); // Resume auto-rotate after 3.5 seconds of absolute silence
        }

        // Drag start triggers (Desktop & Mobile)
        function onDragStart(clientX) {
            isDragging = true;
            startX = clientX;
            previousX = clientX;
            lastTime = performance.now();
            velocity = 0;
            pauseAutoRotateTemporarily();
        }

        // Drag moving triggers (Desktop & Mobile)
        function onDragMove(clientX) {
            if (!isDragging) return;
            const deltaX = clientX - previousX;
            const now = performance.now();
            const elapsed = now - lastTime;

            // Translate horizontal swipe/drag screen pixels into angular rotation degrees
            const sensitivity = 0.45; 
            currentRotation += deltaX * sensitivity;
            targetRotation = currentRotation;

            // Compute instant swipe speed for momentum release
            if (elapsed > 0) {
                velocity = (deltaX * sensitivity) / (elapsed / 16.66); // Normalized speed
            }

            previousX = clientX;
            lastTime = now;
        }

        // Drag release triggers (Desktop & Mobile)
        function onDragEnd() {
            isDragging = false;
            // Cap maximum inertia velocity to avoid dizzying spinning
            velocity = Math.max(-10, Math.min(10, velocity));
        }

        // Mouse listeners
        hubVisual.addEventListener('mousedown', (e) => {
            onDragStart(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            onDragMove(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            onDragEnd();
        });

        // Touch listeners (Mobile native support)
        hubVisual.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                onDragStart(e.touches[0].clientX);
            }
        }, { passive: true });

        hubVisual.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                onDragMove(e.touches[0].clientX);
            }
        }, { passive: true });

        hubVisual.addEventListener('touchend', () => {
            onDragEnd();
        });

        // Click a satellite node to bring it straight to the absolute front (closest perspective point)
        satellites.forEach(sat => {
            sat.addEventListener('click', (e) => {
                e.stopPropagation();
                pauseAutoRotateTemporarily();

                const satAngle = parseFloat(sat.getAttribute('data-angle'));
                
                // Front position on a X-tilted circle is at 180 degrees index, 
                // so we align target rotation to place it straight forward
                let targetAngle = 180 - satAngle;

                // Adjust to spin along the shortest mathematical path
                let diff = (targetAngle - currentRotation) % 360;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;

                targetRotation = currentRotation + diff;
                velocity = 0; // Interrupt any ongoing momentum spins

                // Play custom glowing active states
                satellites.forEach(s => {
                    s.style.borderColor = '';
                    s.style.boxShadow = '';
                });
                sat.style.borderColor = 'var(--secondary)';
                sat.style.boxShadow = 'var(--shadow-glow-cyan)';
            });
        });

        // Kickoff Animation Loop
        requestAnimationFrame(animationLoop);
    }
});
