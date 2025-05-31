// Mobile UI management
class MobileUIManager {
    constructor() {
        this.setupMobileUI();
        this.toolbarVisible = false;
        this.propertiesVisible = false;
    }

    setupMobileUI() {
        // Mobile menu button
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileActions = document.getElementById('mobileActions');
        
        mobileMenuBtn.addEventListener('click', () => {
            mobileActions.classList.toggle('show');
        });

        // Mobile action buttons
        document.getElementById('mobileExportBtn').addEventListener('click', () => {
            document.getElementById('exportBtn').click();
            mobileActions.classList.remove('show');
        });

        document.getElementById('mobileEmbedBtn').addEventListener('click', () => {
            document.getElementById('embedBtn').click();
            mobileActions.classList.remove('show');
        });

        document.getElementById('mobileClearBtn').addEventListener('click', () => {
            document.getElementById('clearBtn').click();
            mobileActions.classList.remove('show');
        });

        // Toggle panels
        document.getElementById('mobileToggleToolbar').addEventListener('click', () => {
            this.toggleToolbar();
            mobileActions.classList.remove('show');
        });

        document.getElementById('mobileToggleProperties').addEventListener('click', () => {
            this.toggleProperties();
            mobileActions.classList.remove('show');
        });

        // Close panel buttons
        const closeToolbar = document.getElementById('closeToolbar');
        if (closeToolbar) {
            closeToolbar.addEventListener('click', () => this.toggleToolbar());
        }

        const closeProperties = document.getElementById('closeProperties');
        if (closeProperties) {
            closeProperties.addEventListener('click', () => this.toggleProperties());
        }

        // Close panels when clicking outside
        document.addEventListener('click', (e) => {
            const toolbar = document.getElementById('toolbar');
            const properties = document.getElementById('propertiesPanel');
            
            if (this.toolbarVisible && !toolbar.contains(e.target) && 
                !e.target.closest('#mobileToggleToolbar')) {
                const rect = toolbar.getBoundingClientRect();
                if (e.clientX > rect.right) {
                    this.toggleToolbar();
                }
            }
            
            if (this.propertiesVisible && !properties.contains(e.target) && 
                !e.target.closest('#mobileToggleProperties')) {
                const rect = properties.getBoundingClientRect();
                if (e.clientX < rect.left) {
                    this.toggleProperties();
                }
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.canvasManager) {
                    window.canvasManager.resizeCanvas();
                }
            }, 100);
        });
    }

    toggleToolbar() {
        const toolbar = document.getElementById('toolbar');
        this.toolbarVisible = !this.toolbarVisible;
        
        if (this.toolbarVisible) {
            toolbar.classList.add('show');
            // Close properties if open
            if (this.propertiesVisible) {
                this.toggleProperties();
            }
        } else {
            toolbar.classList.remove('show');
        }
    }

    toggleProperties() {
        const properties = document.getElementById('propertiesPanel');
        this.propertiesVisible = !this.propertiesVisible;
        
        if (this.propertiesVisible) {
            properties.classList.add('show');
            // Close toolbar if open
            if (this.toolbarVisible) {
                this.toggleToolbar();
            }
        } else {
            properties.classList.remove('show');
        }
    }

    isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    }

    isTablet() {
        return window.innerWidth <= 1024 && window.innerWidth > 768;
    }
}

// Global mobile UI manager instance
let mobileUIManager = null;