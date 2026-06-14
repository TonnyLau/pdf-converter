function setFAQItemState(item, shouldExpand, instant = false) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.setAttribute('aria-expanded', String(shouldExpand));

    if (shouldExpand) {
        item.classList.add('active');
        const targetHeight = answer.scrollHeight;

        if (instant) {
            answer.style.height = 'auto';
            return;
        }

        const startHeight = answer.offsetHeight;
        answer.style.height = `${startHeight}px`;
        requestAnimationFrame(() => {
            answer.style.height = `${targetHeight}px`;
        });
        return;
    }

    const currentHeight = answer.offsetHeight || answer.scrollHeight;
    answer.style.height = `${currentHeight}px`;

    if (instant) {
        item.classList.remove('active');
        answer.style.height = '0px';
        return;
    }

    // Ensure the browser commits current height before collapsing.
    void answer.offsetHeight;
    item.classList.remove('active');
    answer.style.height = '0px';
}

function initializeFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;

        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');

        if (!answer.dataset.faqTransitionBound) {
            answer.dataset.faqTransitionBound = 'true';
            answer.addEventListener('transitionend', (event) => {
                if (event.propertyName !== 'height') return;
                if (item.classList.contains('active')) {
                    answer.style.height = 'auto';
                }
            });
        }

        setFAQItemState(item, item.classList.contains('active'), true);

        // Prevent multiple listeners by checking for a marker
        if (!question.dataset.faqInitialized) {
            question.dataset.faqInitialized = 'true';
            question.addEventListener('click', () => {
                setFAQItemState(item, !item.classList.contains('active'), prefersReducedMotion);
            });
            question.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setFAQItemState(item, !item.classList.contains('active'), prefersReducedMotion);
                }
            });
        }
    });
}

function initializeLanguageSystem() {
    const languages = {
        en: { label: 'English', dir: 'ltr' },
        'zh-CN': { label: '简体中文', dir: 'ltr' },
        'zh-TW': { label: '繁體中文', dir: 'ltr' },
        ja: { label: '日本語', dir: 'ltr' },
        ko: { label: '한국어', dir: 'ltr' },
        fr: { label: 'Français', dir: 'ltr' },
        es: { label: 'Español', dir: 'ltr' },
        tr: { label: 'Türkçe', dir: 'ltr' },
        fa: { label: 'فارسی', dir: 'rtl' }
    };
    const storageKey = 'pdfswitch-language';

    const normalizeLanguage = (lang) => Object.prototype.hasOwnProperty.call(languages, lang) ? lang : 'en';
    const closeMenus = () => {
        document.querySelectorAll('.language-switcher.open').forEach((switcher) => {
            switcher.classList.remove('open');
            const toggle = switcher.querySelector('.language-toggle');
            const menu = switcher.querySelector('.language-menu');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
            if (menu) menu.hidden = true;
        });
    };
    const applyLanguage = (lang, persist = true) => {
        const resolved = normalizeLanguage(lang);
        const config = languages[resolved];
        document.documentElement.lang = resolved;
        document.documentElement.dir = config.dir;
        document.querySelectorAll('.language-menu').forEach((menu) => {
            menu.hidden = false;
        });
        document.querySelectorAll('[data-current-language]').forEach((label) => {
            label.textContent = config.label;
        });
        document.querySelectorAll('.language-option').forEach((option) => {
            const isActive = option.dataset.lang === resolved;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-pressed', String(isActive));
        });
        if (persist) {
            try {
                localStorage.setItem(storageKey, resolved);
            } catch (_) { /* noop */ }
        }
    };

    let savedLanguage = 'en';
    try {
        savedLanguage = localStorage.getItem(storageKey) || 'en';
    } catch (_) { /* noop */ }
    if (savedLanguage.toLowerCase().startsWith('zh-tw') || savedLanguage.toLowerCase().startsWith('zh-hk')) {
        savedLanguage = 'zh-TW';
    } else if (savedLanguage.toLowerCase().startsWith('zh')) {
        savedLanguage = 'zh-CN';
    } else {
        savedLanguage = savedLanguage.split('-')[0].toLowerCase();
    }
    applyLanguage(savedLanguage, false);

    if (window.__pdfswitchLanguageEventsBound) return;
    window.__pdfswitchLanguageEventsBound = true;

    document.addEventListener('click', (event) => {
        const option = event.target.closest('.language-option');
        if (option) {
            applyLanguage(option.dataset.lang || 'en', true);
            closeMenus();
            return;
        }

        const toggle = event.target.closest('.language-toggle');
        if (toggle) {
            const switcher = toggle.closest('.language-switcher');
            if (!switcher) return;
            const shouldOpen = !switcher.classList.contains('open');
            closeMenus();
            if (shouldOpen) {
                switcher.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
                const menu = switcher.querySelector('.language-menu');
                if (menu) menu.hidden = false;
            }
            return;
        }

        if (!event.target.closest('.language-switcher')) {
            closeMenus();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenus();
    });
}

// Initialize Mobile Navigation (universal)
function initializeMobileNav() {
    const headerContainer = document.querySelector('.header .container');
    if (!headerContainer) return; // Safety guard

    // Ensure hamburger markup exists (tool pages may not have it)
    let hamburgerMenu = document.querySelector('.hamburger-menu');
    if (!hamburgerMenu) {
        hamburgerMenu = document.createElement('div');
        hamburgerMenu.className = 'hamburger-menu';
        hamburgerMenu.innerHTML = `
            <div class="hamburger-icon">
                <span></span><span></span><span></span>
            </div>
        `;
        headerContainer.appendChild(hamburgerMenu);
    }

    const hamburgerIcon = hamburgerMenu.querySelector('.hamburger-icon');

    // Build/off-canvas mobile navigation
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';

    // Clone desktop navigation but REMOVE the 'nav' class so it isn't hidden by media-query
    const desktopNav = document.querySelector('.nav');
    if (!desktopNav) return; // no nav, abort
    const navClone = desktopNav.cloneNode(true);
    navClone.classList.add('mobile-nav-links');
    navClone.classList.remove('nav');
    mobileNav.appendChild(navClone);

    // Dark overlay behind menu
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';

    document.body.appendChild(mobileNav);
    document.body.appendChild(overlay);

    // Helper to open / close
    const toggleMobileMenu = () => {
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
        hamburgerIcon.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    };
    const closeMobileMenu = () => {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        hamburgerIcon.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Wire events
    hamburgerMenu.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
    // Close when any link (including in cloned menu) is tapped
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

function initializeHeroAudienceTyping() {
    const typingTarget = document.getElementById('hero-audience-text');
    if (!typingTarget) return;

    const audiences = [
        'Freelancers',
        'Students',
        'Small Businesses',
        'Privacy Enthusasists',
        'Journalists'
    ];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        typingTarget.textContent = audiences[0];
        return;
    }

    const typeSpeedMs = 95;
    const deleteSpeedMs = 55;
    const fullWordPauseMs = 1200;
    const transitionPauseMs = 250;
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
        const currentWord = audiences[wordIndex];

        if (isDeleting) {
            charIndex = Math.max(charIndex - 1, 0);
            typingTarget.textContent = currentWord.slice(0, charIndex);

            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % audiences.length;
                setTimeout(tick, transitionPauseMs);
                return;
            }

            setTimeout(tick, deleteSpeedMs);
            return;
        }

        charIndex = Math.min(charIndex + 1, currentWord.length);
        typingTarget.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(tick, fullWordPauseMs);
            return;
        }

        setTimeout(tick, typeSpeedMs);
    };

    typingTarget.textContent = '';
    setTimeout(tick, 300);
}

function initializeHomeSmartWorkspace(pdfConverter) {
    const workspace = document.getElementById('home-workspace');
    const selectedToolTitle = document.getElementById('home-selected-tool');
    const pdfOperationPanel = document.getElementById('pdf-operation-panel');
    const pdfOperationGrid = document.getElementById('pdf-operation-grid');
    const resetButton = document.getElementById('home-reset-btn');
    const processButton = document.getElementById('process-btn');

    if (!document.getElementById('upload-area') || !document.getElementById('file-input') || !workspace || !selectedToolTitle || !pdfOperationPanel || !pdfOperationGrid) {
        return;
    }

    const supportedAccept = '.pdf,.png,.jpg,.jpeg,.webp,.heif,.heic,.svg,.txt,.html,.htm,.md,.markdown,.docx,.rtf,.xls,.xlsx,.ppt,.pptx';
    const getUploadArea = () => document.getElementById('upload-area');
    const getFileInput = () => document.getElementById('file-input');
    const toolByExtension = new Map([
        ['png', 'png-to-pdf'],
        ['jpg', 'jpeg-to-pdf'],
        ['jpeg', 'jpeg-to-pdf'],
        ['webp', 'webp-to-pdf'],
        ['heif', 'heif-to-pdf'],
        ['heic', 'heif-to-pdf'],
        ['svg', 'svg-to-pdf'],
        ['txt', 'txt-to-pdf'],
        ['html', 'html-to-pdf'],
        ['htm', 'html-to-pdf'],
        ['md', 'markdown-to-pdf'],
        ['markdown', 'markdown-to-pdf'],
        ['docx', 'word-to-pdf'],
        ['rtf', 'rtf-to-pdf'],
        ['xls', 'excel-to-pdf'],
        ['xlsx', 'excel-to-pdf'],
        ['ppt', 'ppt-to-pdf'],
        ['pptx', 'ppt-to-pdf']
    ]);
    const pdfOperations = [
        { label: '合并 PDF', tool: 'merge-pdf', icon: 'fa-object-group' },
        { label: '拆分 PDF', tool: 'split-pdf', icon: 'fa-cut' },
        { label: '压缩 PDF', tool: 'compress-pdf', icon: 'fa-compress' },
        { label: 'PDF 转图片 PNG', tool: 'pdf-to-png', icon: 'fa-image' },
        { label: '加密 PDF', tool: 'add-password', icon: 'fa-lock' },
        { label: '解密 PDF', tool: 'remove-password', icon: 'fa-unlock' },
        { label: '旋转 PDF', tool: 'rotate-pdf', icon: 'fa-redo' },
        { label: '提取页面', tool: 'extract-pages', icon: 'fa-copy' }
    ];
    let pendingPdfFiles = [];
    let manualToolSelected = false;

    const originalHandleFileSelect = pdfConverter.handleFileSelect.bind(pdfConverter);
    const originalUpdateProcessButton = pdfConverter.updateProcessButton.bind(pdfConverter);

    pdfConverter.updateProcessButton = function () {
        originalUpdateProcessButton();
        const button = document.getElementById('process-btn');
        if (!button) return;

        const fileCount = this.uploadedFiles.length;
        if (!this.currentTool) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-cog"></i> 开始处理';
            return;
        }

        if (fileCount === 0) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-upload"></i> 请先上传文件';
            return;
        }

        button.innerHTML = `<i class="fas fa-cog"></i> 处理 ${fileCount} 个文件`;
    };

    const getExtension = (file) => {
        const name = (file && file.name) ? file.name : '';
        const dotIndex = name.lastIndexOf('.');
        return dotIndex >= 0 ? name.slice(dotIndex + 1).toLowerCase() : '';
    };

    const setWorkspaceTitle = (toolName) => {
        if (!toolName) {
            selectedToolTitle.textContent = '请先上传文件或选择工具';
            return;
        }
        selectedToolTitle.textContent = pdfConverter.getToolConfig(toolName).title || toolName;
    };

    const showTip = (message, type = 'info') => {
        if (typeof pdfConverter.showNotification === 'function') {
            pdfConverter.showNotification(message, type);
        }
    };

    const clearPdfChooser = () => {
        pendingPdfFiles = [];
        pdfOperationPanel.hidden = true;
        pdfOperationGrid.innerHTML = '';
    };

    const resetWorkspace = () => {
        clearPdfChooser();
        manualToolSelected = false;
        pdfConverter.currentTool = null;
        pdfConverter.uploadedFiles = [];
        pdfConverter.watermarkImageAsset = null;
        const currentFileInput = getFileInput();
        if (currentFileInput) currentFileInput.accept = supportedAccept;
        pdfConverter.clearFileList();
        pdfConverter.clearResults();
        pdfConverter.hideProgress();
        const options = document.getElementById('tool-options');
        if (options) options.innerHTML = '';
        setWorkspaceTitle(null);
        pdfConverter.updateProcessButton();
    };

    const activateTool = async (toolName, files = []) => {
        clearPdfChooser();
        manualToolSelected = true;
        pdfConverter.currentTool = toolName;
        pdfConverter.uploadedFiles = [];
        pdfConverter.watermarkImageAsset = null;
        const currentFileInput = getFileInput();
        if (currentFileInput) currentFileInput.accept = pdfConverter.getToolConfig(toolName).accept || supportedAccept;
        pdfConverter.clearFileList();
        pdfConverter.clearResults();
        pdfConverter.hideProgress();
        pdfConverter.setupToolOptions(toolName);
        setWorkspaceTitle(toolName);
        pdfConverter.updateProcessButton();

        if (files.length) {
            await originalHandleFileSelect(files);
        } else {
            getUploadArea()?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const showPdfOperations = (files) => {
        pendingPdfFiles = files;
        manualToolSelected = false;
        pdfConverter.currentTool = null;
        pdfConverter.uploadedFiles = [];
        pdfConverter.clearFileList();
        pdfConverter.clearResults();
        pdfConverter.hideProgress();
        const options = document.getElementById('tool-options');
        if (options) options.innerHTML = '';
        setWorkspaceTitle(null);
        pdfConverter.updateProcessButton();
        pdfOperationGrid.innerHTML = pdfOperations.map(operation => `
            <button class="pdf-operation-btn" type="button" data-tool="${operation.tool}">
                <i class="fas ${operation.icon}" aria-hidden="true"></i>
                <span>${operation.label}</span>
            </button>
        `).join('');
        pdfOperationPanel.hidden = false;
        pdfOperationPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const inferSmartTool = (files) => {
        const inferred = files.map(file => {
            const extension = getExtension(file);
            if (extension === 'pdf') return { kind: 'pdf', file };
            const tool = toolByExtension.get(extension);
            return tool ? { kind: 'tool', tool, file } : { kind: 'unsupported', extension, file };
        });

        const unsupported = inferred.find(item => item.kind === 'unsupported');
        if (unsupported) {
            return { error: `暂不支持该文件类型：${unsupported.file.name}` };
        }

        const hasPdf = inferred.some(item => item.kind === 'pdf');
        const nonPdfTools = new Set(inferred.filter(item => item.kind === 'tool').map(item => item.tool));
        if (hasPdf && nonPdfTools.size > 0) {
            return { error: '请按同一类型文件分批上传' };
        }
        if (nonPdfTools.size > 1) {
            return { error: '请按同一类型文件分批上传' };
        }
        if (hasPdf) {
            return { needsPdfChoice: true };
        }
        return { tool: Array.from(nonPdfTools)[0] };
    };

    pdfConverter.handleFileSelect = async (files) => {
        const selectedFiles = Array.from(files || []);
        if (!selectedFiles.length) {
            pdfConverter.resetFileInput();
            return;
        }

        if (manualToolSelected && pdfConverter.currentTool) {
            await originalHandleFileSelect(selectedFiles);
            return;
        }

        const inference = inferSmartTool(selectedFiles);
        if (inference.error) {
            resetWorkspace();
            showTip(inference.error, 'error');
            pdfConverter.resetFileInput();
            return;
        }

        if (inference.needsPdfChoice) {
            showPdfOperations(selectedFiles);
            pdfConverter.resetFileInput();
            return;
        }

        if (inference.tool) {
            await activateTool(inference.tool, selectedFiles);
            return;
        }
    };

    pdfOperationGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-tool]');
        if (!button) return;
        activateTool(button.dataset.tool, pendingPdfFiles);
    });

    document.querySelectorAll('.tool-card[data-tool], .home-tool-links .tool-link[data-tool]').forEach(element => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            activateTool(element.dataset.tool);
        });
    });

    document.querySelectorAll('.tool-category-pills [data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            document.querySelectorAll('.tool-category-pills [data-filter]').forEach(item => {
                item.classList.toggle('active', item === button);
            });
            document.querySelectorAll('.tool-card[data-category], .home-tool-links .tool-link[data-category]').forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                item.style.display = match ? '' : 'none';
            });
        });
    });

    const searchBar = document.getElementById('tool-search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', () => {
            const searchTerm = searchBar.value.toLowerCase().trim();
            document.querySelectorAll('.tool-card[data-tool], .home-tool-links .tool-link[data-tool]').forEach(item => {
                const text = item.textContent.toLowerCase();
                const tool = (item.dataset.tool || '').toLowerCase();
                item.style.display = (!searchTerm || text.includes(searchTerm) || tool.includes(searchTerm)) ? '' : 'none';
            });
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetWorkspace);
    }

    if (processButton) {
        processButton.addEventListener('click', () => {
            if (window.plausible) {
                setTimeout(() => {
                    window.plausible('ProcessButtonClick', { props: { tool: pdfConverter.currentTool } });
                    pdfConverter.processFiles();
                }, 0);
                return;
            }
            pdfConverter.processFiles();
        });
    }

    const currentFileInput = getFileInput();
    if (currentFileInput) currentFileInput.accept = supportedAccept;
    pdfConverter.setupDragAndDrop();
    pdfConverter.bindFileInputEvents();
    resetWorkspace();
}

// Enable touch-friendly sorting for page thumbnails using SortableJS
if (typeof PDFConverterPro !== 'undefined' && typeof Sortable !== 'undefined') {
    PDFConverterPro.prototype.enableThumbnailSorting = function () {
        const container = document.getElementById('page-thumbnails');
        if (!container) return;

        // Destroy previous instance to avoid duplicates
        if (this.thumbnailSortable && typeof this.thumbnailSortable.destroy === 'function') {
            this.thumbnailSortable.destroy();
        }

        this.thumbnailSortable = Sortable.create(container, {
            animation: 220,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            draggable: '.page-thumbnail',
            // allow drag from any part of the thumbnail
            delay: 700,              // ~1 second long-press on touch devices
            delayOnTouchOnly: true,
            touchStartThreshold: 3,
            forceFallback: true,     // consistent drag preview
            fallbackOnBody: true,
            fallbackTolerance: 3,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: () => {
                this.showNotification('Pages reordered! Click Process to generate the sorted PDF.', 'success');
            }
        });
    };
}

// Initialize the main application logic
document.addEventListener('DOMContentLoaded', function () {
    // Initialize FAQ on all pages
    initializeFAQAccordion();

    // Keep top nav ordering consistent across tool pages
    normalizeHeaderNavOrder();

    // Initialize global theming before cloning mobile nav
    initializeThemeSystem();

    // Initialize language controls before cloning mobile nav
    initializeLanguageSystem();

    // Initialize mobile navigation
    initializeMobileNav();
    updateThemeOptionState();

    // Check if we are on the main page (index.html) by looking for the tools layout
    const isMainPage = document.querySelector('.home-tool-grid, .tools-grid, .tools-table');

    if (isMainPage) {
        window.pdfConverter = new PDFConverterPro();
        console.log('PDF Converter Pro initialized for main page');
        initializeHeroAudienceTyping();
        initializeHomeSmartWorkspace(window.pdfConverter);

        // Handle newsletter form submission
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = document.getElementById('newsletter-email').value;
                if (email) {
                    window.pdfConverter.showNotification('Thank you for subscribing!', 'success');
                    this.reset();
                } else {
                    window.pdfConverter.showNotification('Please enter a valid email address.', 'error');
                }
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    // Note: Tool-specific pages have their own initialization script in their respective HTML files,
    // which creates an instance of PDFConverterPro and calls setupToolSpecificPage().
});
