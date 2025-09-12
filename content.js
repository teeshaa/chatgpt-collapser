console.log("ChatGPT Collapser v2.0 loaded ✅");

// Global state management
window.chatGPTCollapser = {
    settings: {
        sidebarPosition: localStorage.getItem('cgpt-sidebar-position') || 'right',
        theme: 'auto',
        showFavorites: false,
        itemsPerPage: parseInt(localStorage.getItem('cgpt-items-per-page')) || 5,
        autoCollapse: true
    },
    favorites: JSON.parse(localStorage.getItem('cgpt-favorites') || '[]'),
    allQuestions: [], // Store complete question data
    currentPage: 1,
    loadedItems: 0,
    isArcBrowser: navigator.userAgent.includes('Arc'),
    browserType: detectBrowser()
};

function detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Arc')) return 'arc';
    if (userAgent.includes('Edge')) return 'edge';
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    return 'unknown';
}

function createSidebar() {
    if (document.getElementById("chatgpt-sidebar")) return;

    const sidebar = document.createElement("div");
    sidebar.id = "chatgpt-sidebar";
    sidebar.className = `sidebar-${window.chatGPTCollapser.settings.sidebarPosition}`;

    // Adjust for Arc browser
    if (window.chatGPTCollapser.isArcBrowser) {
        sidebar.classList.add('arc-browser-adjusted');
    }

    sidebar.innerHTML = `
    <div id="sidebar-header">
      <div class="header-left">
        <h3>Conversations</h3>
        <span id="question-count">0</span>
      </div>
      <div class="header-controls">
        <button id="search-toggle" title="Search">🔍</button>
        <button id="favorites-toggle" title="Favorites">⭐</button>
        <button id="settings-toggle" title="Settings">⚙️</button>
        <button id="collapse-sidebar" title="Collapse Sidebar">»</button>
      </div>
    </div>
    <div id="search-container" style="display: none;">
      <input type="text" id="search-input" placeholder="Search questions..." />
    </div>
    <div id="favorites-view" style="display: none;">
      <div class="section-header">
        <span>⭐ Favorites</span>
        <button id="clear-favorites" title="Clear favorites">×</button>
      </div>
      <ul id="favorites-list"></ul>
    </div>
    <ul id="question-list"></ul>
    <div id="sidebar-footer">
      <div id="load-more-container" style="display: none;">
        <button id="load-more-btn">Next</button>
      </div>
      <div class="footer-controls">
        <button id="toggle-all" title="Expand/Collapse All">⟷</button>
        <button id="sort-toggle" title="Sort Order">↕</button>
      </div>
    </div>
  `;

    document.body.appendChild(sidebar);

    // Floating button (appears only when sidebar hidden)
    const floatBtn = document.createElement("button");
    floatBtn.id = "sidebar-float-btn";
    floatBtn.innerHTML = window.chatGPTCollapser.settings.sidebarPosition === 'right' ? "«" : "»";
    floatBtn.style.display = "none"; // hidden by default
    floatBtn.className = `float-btn-${window.chatGPTCollapser.settings.sidebarPosition}`;
    document.body.appendChild(floatBtn);

    // Create settings modal (initially hidden)
    createSettingsModal();

    console.log("Enhanced sidebar + float button created");

    // Initialize event handlers
    initializeEventHandlers();

    // Initialize default sort (default Descending)
    if (typeof window.__chatgptSortAsc === "undefined") {
        window.__chatgptSortAsc = false;
    }

    // Load settings
    loadSettings();
}

function createSettingsModal() {
    const modal = document.createElement("div");
    modal.id = "settings-modal";
    modal.style.display = "none";
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Settings</h3>
                <button id="close-settings" title="Close">×</button>
            </div>
            <div class="modal-body">
                <div class="setting-group">
                    <label>Sidebar Position</label>
                    <select id="position-select">
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>Items per page</label>
                    <input type="number" id="items-per-page" min="1" max="50" value="${window.chatGPTCollapser.settings.itemsPerPage}" />
                </div>
                <div class="setting-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="auto-collapse" ${window.chatGPTCollapser.settings.autoCollapse ? 'checked' : ''} />
                        Auto-collapse old answers
                    </label>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function initializeEventHandlers() {
    const elements = {
        toggleAll: document.getElementById("toggle-all"),
        sortToggle: document.getElementById("sort-toggle"),
        searchToggle: document.getElementById("search-toggle"),
        searchContainer: document.getElementById("search-container"),
        searchInput: document.getElementById("search-input"),
        collapseSidebar: document.getElementById("collapse-sidebar"),
        floatBtn: document.getElementById("sidebar-float-btn"),
        favoritesToggle: document.getElementById("favorites-toggle"),
        favoritesView: document.getElementById("favorites-view"),
        favoritesList: document.getElementById("favorites-list"),
        clearFavorites: document.getElementById("clear-favorites"),
        settingsToggle: document.getElementById("settings-toggle"),
        settingsModal: document.getElementById("settings-modal"),
        closeSettings: document.getElementById("close-settings"),
        positionSelect: document.getElementById("position-select"),
        itemsPerPage: document.getElementById("items-per-page"),
        autoCollapse: document.getElementById("auto-collapse"),
        loadMoreBtn: document.getElementById("load-more-btn"),
        questionCount: document.getElementById("question-count")
    };

    // Global expand/collapse all
    elements.toggleAll.onclick = () => {
        const allAnswers = document.querySelectorAll("div[data-message-author-role='assistant']");
        const expand = elements.toggleAll.innerText === "Expand All";

        allAnswers.forEach(ans => {
            ans.classList.toggle("collapsed", !expand);
            const collapseBtn = ans.querySelector(".collapse-btn");
            if (collapseBtn) collapseBtn.innerText = expand ? "Collapse" : "Expand";
        });

        const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle-btn");
        sidebarToggleBtns.forEach(toggleBtn => {
            toggleBtn.innerText = expand ? "Collapse" : "Expand";
        });

        elements.toggleAll.innerText = expand ? "Collapse All" : "Expand All";
    };

    // Sort toggle
    elements.sortToggle.onclick = () => {
        window.__chatgptSortAsc = !window.__chatgptSortAsc;
        elements.sortToggle.setAttribute("title", window.__chatgptSortAsc ? "Sort: Asc" : "Sort: Desc");
        addCollapsers();
    };

    // Search functionality
    elements.searchToggle.onclick = () => {
        const isVisible = elements.searchContainer.style.display !== "none";
        elements.searchContainer.style.display = isVisible ? "none" : "block";

        if (!isVisible) {
            elements.searchToggle.classList.add("active");
            setTimeout(() => elements.searchInput.focus(), 100);
        } else {
            elements.searchToggle.classList.remove("active");
            elements.searchInput.value = "";
            filterQuestions("");
        }
    };

    elements.searchInput.oninput = () => {
        filterQuestions(elements.searchInput.value);
    };

    // Sidebar controls
    elements.collapseSidebar.onclick = () => {
        const sidebar = document.getElementById("chatgpt-sidebar");
        sidebar.classList.add("hidden");
        elements.floatBtn.style.display = "block";
    };

    elements.floatBtn.onclick = () => {
        const sidebar = document.getElementById("chatgpt-sidebar");
        sidebar.classList.remove("hidden");
        elements.floatBtn.style.display = "none";
    };

    // Favorites functionality
    elements.favoritesToggle.onclick = () => {
        const isVisible = elements.favoritesView.style.display !== "none";
        elements.favoritesView.style.display = isVisible ? "none" : "block";
        elements.favoritesToggle.classList.toggle("active", !isVisible);
        
        if (!isVisible) {
            updateFavoritesList();
        }
    };

    elements.clearFavorites.onclick = () => {
        if (confirm("Clear all favorites?")) {
            window.chatGPTCollapser.favorites = [];
            saveFavorites();
            updateFavoritesList();
        }
    };

    // Settings functionality
    elements.settingsToggle.onclick = () => {
        elements.settingsModal.style.display = "flex";
        loadSettingsInModal();
    };

    elements.closeSettings.onclick = () => {
        elements.settingsModal.style.display = "none";
    };

    // Close modal when clicking backdrop
    elements.settingsModal.onclick = (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            elements.settingsModal.style.display = "none";
        }
    };

    elements.positionSelect.onchange = () => {
        changeSidebarPosition(elements.positionSelect.value);
    };

    // Settings controls
    elements.itemsPerPage.oninput = () => {
        const value = parseInt(elements.itemsPerPage.value);
        if (value > 0 && value <= 50) {
            window.chatGPTCollapser.settings.itemsPerPage = value;
            localStorage.setItem('cgpt-items-per-page', value.toString());
            saveSettings();
            window.chatGPTCollapser.loadedItems = 0; // Reset loaded items
            addCollapsers();
        }
    };

    elements.autoCollapse.onchange = () => {
        window.chatGPTCollapser.settings.autoCollapse = elements.autoCollapse.checked;
        saveSettings();
    };

    // Load more functionality
    elements.loadMoreBtn.onclick = () => {
        window.chatGPTCollapser.loadedItems += window.chatGPTCollapser.settings.itemsPerPage;
        addCollapsers();
    };
}

function addCollapsers() {
    try {
        // Enhanced selectors to catch all assistant messages including image-only responses
        const answers = document.querySelectorAll("div[data-message-author-role='assistant'], div[data-testid*='assistant'], .group.w-full.text-token-text-primary");
        const questions = document.querySelectorAll("div[data-message-author-role='user'], div[data-testid*='user'], .group.w-full.text-token-text-primary");

        const qList = document.getElementById("question-list");
        if (!qList) return;

        // Clear old data and rebuild
        window.chatGPTCollapser.allQuestions = [];
        qList.innerHTML = "";

        // Build comprehensive question data including full text
        const pairs = [];
        let questionIndex = 0;

        answers.forEach((answer, i) => {
            // Find corresponding question - handle cases where questions/answers don't match 1:1
            let correspondingQuestion = null;
            
            // Try multiple methods to find the right question
            if (questions[i]) {
                correspondingQuestion = questions[i];
            } else if (questions[questionIndex]) {
                correspondingQuestion = questions[questionIndex];
            } else {
                // Look for previous sibling that might be a question
                let sibling = answer.previousElementSibling;
                while (sibling) {
                    if (sibling.matches("div[data-message-author-role='user']") || 
                        sibling.matches("div[data-testid*='user']")) {
                        correspondingQuestion = sibling;
                        break;
                    }
                    sibling = sibling.previousElementSibling;
                }
            }

            if (correspondingQuestion) {
                const questionText = correspondingQuestion.innerText || correspondingQuestion.textContent || `Question ${questionIndex + 1}`;
                const answerText = answer.innerText || answer.textContent || '';
                
                // Check if this is an image-only or special content answer
                const hasImage = answer.querySelector('img, canvas, svg, video');
                const hasCode = answer.querySelector('pre, code');
                const isEmpty = !answerText.trim() && !hasImage && !hasCode;

                const questionData = {
                    index: questionIndex,
                    answer,
                    question: correspondingQuestion,
                    questionText: questionText,
                    answerText: answerText,
                    displayText: questionText.slice(0, 40) + (questionText.length > 40 ? '...' : ''),
                    hasImage,
                    hasCode,
                    isEmpty,
                    isFavorite: window.chatGPTCollapser.favorites.includes(questionIndex)
                };

                pairs.push(questionData);
                window.chatGPTCollapser.allQuestions.push(questionData);
                questionIndex++;
            }

            // Add collapse button if not exists
            if (!answer.querySelector(".collapse-btn")) {
                const btn = document.createElement("button");
                btn.className = "collapse-btn";
                btn.setAttribute("aria-label", "Toggle answer visibility");

                // Auto-collapse logic
                if (window.chatGPTCollapser.settings.autoCollapse && i < answers.length - 1) {
                    answer.classList.add("collapsed");
                    btn.innerText = "Expand";
                } else {
                    answer.classList.remove("collapsed");
                    btn.innerText = "Collapse";
                }

                btn.onclick = (e) => {
                    e.stopPropagation();
                    answer.classList.toggle("collapsed");
                    btn.innerText = answer.classList.contains("collapsed") ? "Expand" : "Collapse";
                    
                    // Update corresponding sidebar button
                    const sidebarBtn = document.querySelector(`[data-question-index="${i}"] .sidebar-toggle-btn`);
                    if (sidebarBtn) {
                        sidebarBtn.innerText = btn.innerText;
                    }
                };

                answer.prepend(btn);
            }
        });

        // Update question count
        const questionCount = document.getElementById("question-count");
        if (questionCount) {
            questionCount.textContent = pairs.length;
        }

        // Apply load-more pagination
        const itemsPerPage = window.chatGPTCollapser.settings.itemsPerPage;
        const maxItems = window.chatGPTCollapser.loadedItems + itemsPerPage;
        const hasMore = pairs.length > maxItems;

        // Update load more button
        const loadMoreContainer = document.getElementById("load-more-container");
        const loadMoreBtn = document.getElementById("load-more-btn");
        if (loadMoreContainer && loadMoreBtn) {
            if (hasMore) {
                loadMoreContainer.style.display = "block";
                loadMoreBtn.textContent = `Next (${pairs.length - maxItems} remaining)`;
            } else {
                loadMoreContainer.style.display = "none";
            }
        }

        // Get items to display (from start to maxItems)
        const displayItems = pairs.slice(0, Math.min(maxItems, pairs.length));

        // Sort order - maintain original order for proper numbering
        const asc = window.__chatgptSortAsc === true;
        const ordered = asc ? displayItems : displayItems.slice().reverse();

        // Build sidebar items
        ordered.forEach((questionData) => {
            const li = document.createElement("li");
            li.className = "sidebar-item";
            li.setAttribute("data-question-index", questionData.index);

            const qNumber = document.createElement("span");
            qNumber.className = "question-number";
            qNumber.textContent = questionData.index + 1;

            const qText = document.createElement("span");
            qText.className = "question-text";
            qText.textContent = questionData.displayText;
            qText.title = questionData.questionText; // Full text on hover

            const buttonsContainer = document.createElement("div");
            buttonsContainer.className = "sidebar-buttons";

            // Favorite button
            const favBtn = document.createElement("button");
            favBtn.className = "sidebar-favorite-btn";
            favBtn.innerHTML = questionData.isFavorite ? "⭐" : "☆";
            favBtn.title = questionData.isFavorite ? "Remove from favorites" : "Add to favorites";
            favBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(questionData.index);
            };

            // Jump button (main action)
            const goBtn = document.createElement("button");
            goBtn.className = "sidebar-goto-btn";
            goBtn.innerText = "→";
            goBtn.title = "Go to answer";
            goBtn.onclick = () => {
                questionData.answer.scrollIntoView({ behavior: "smooth", block: "start" });
            };

            buttonsContainer.appendChild(favBtn);
            buttonsContainer.appendChild(goBtn);

            li.appendChild(qNumber);
            li.appendChild(qText);
            li.appendChild(buttonsContainer);
            qList.appendChild(li);
        });

    } catch (error) {
        console.error("ChatGPT Collapser: Error in addCollapsers:", error);
    }
}

function filterQuestions(searchTerm) {
    const qList = document.getElementById("question-list");
    if (!qList) return;

    const items = qList.querySelectorAll(".sidebar-item");
    const term = searchTerm.toLowerCase().trim();

    items.forEach(item => {
        const questionIndex = parseInt(item.getAttribute("data-question-index"));
        const questionData = window.chatGPTCollapser.allQuestions.find(q => q.index === questionIndex);
        
        if (!questionData) {
            item.style.display = "none";
            return;
        }

        // Search in question text (full text, not just display text)
        const matches = questionData.questionText.toLowerCase().includes(term);
        item.style.display = matches ? "flex" : "none";

        // Add highlight effect for matched text
        if (matches && term) {
            item.classList.add("search-highlight");
        } else {
            item.classList.remove("search-highlight");
        }
    });

    // Show "No results" message if no matches
    let noResultsMsg = document.getElementById("no-results-msg");
    const visibleItems = Array.from(items).filter(item => item.style.display !== "none");

    if (visibleItems.length === 0 && term) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement("div");
            noResultsMsg.id = "no-results-msg";
            noResultsMsg.className = "no-results";
            noResultsMsg.textContent = "No questions found";
            qList.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = "block";
    } else if (noResultsMsg) {
        noResultsMsg.style.display = "none";
    }
}

// Utility functions for new features

function toggleFavorite(questionIndex) {
    const favorites = window.chatGPTCollapser.favorites;
    const index = favorites.indexOf(questionIndex);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(questionIndex);
    }
    
    saveFavorites();
    
    // Update the UI
    const item = document.querySelector(`[data-question-index="${questionIndex}"]`);
    if (item) {
        const favBtn = item.querySelector('.sidebar-favorite-btn');
        const isFavorite = favorites.includes(questionIndex);
        favBtn.innerHTML = isFavorite ? "⭐" : "☆";
        favBtn.title = isFavorite ? "Remove from favorites" : "Add to favorites";
    }
    
    // Update favorites view if visible
    const favoritesView = document.getElementById("favorites-view");
    if (favoritesView.style.display !== "none") {
        updateFavoritesList();
    }
}

function updateFavoritesList() {
    const favoritesList = document.getElementById("favorites-list");
    if (!favoritesList) return;

    favoritesList.innerHTML = "";

    if (window.chatGPTCollapser.favorites.length === 0) {
        const emptyMsg = document.createElement("li");
        emptyMsg.textContent = "No favorites yet";
        emptyMsg.style.cssText = "text-align: center; padding: 20px; color: #6b7280; font-style: italic;";
        favoritesList.appendChild(emptyMsg);
        return;
    }

    window.chatGPTCollapser.favorites.forEach(questionIndex => {
        const questionData = window.chatGPTCollapser.allQuestions.find(q => q.index === questionIndex);
        if (!questionData) return;

        const li = document.createElement("li");
        li.className = "sidebar-item favorite-item";

        const qNumber = document.createElement("span");
        qNumber.className = "question-number";
        qNumber.textContent = questionData.index + 1;

        const qText = document.createElement("span");
        qText.className = "question-text";
        qText.textContent = questionData.displayText;
        qText.title = questionData.questionText;

        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "sidebar-buttons";

        const goBtn = document.createElement("button");
        goBtn.className = "sidebar-goto-btn";
        goBtn.innerText = "→";
        goBtn.onclick = () => {
            questionData.answer.scrollIntoView({ behavior: "smooth", block: "start" });
        };

        const removeBtn = document.createElement("button");
        removeBtn.className = "sidebar-favorite-btn";
        removeBtn.innerHTML = "×";
        removeBtn.title = "Remove from favorites";
        removeBtn.onclick = () => {
            toggleFavorite(questionIndex);
        };

        buttonsContainer.appendChild(goBtn);
        buttonsContainer.appendChild(removeBtn);

        li.appendChild(qNumber);
        li.appendChild(qText);
        li.appendChild(buttonsContainer);
        favoritesList.appendChild(li);
    });
}

function changeSidebarPosition(newPosition) {
    const sidebar = document.getElementById("chatgpt-sidebar");
    const floatBtn = document.getElementById("sidebar-float-btn");
    
    // Update classes
    sidebar.className = sidebar.className.replace(/sidebar-(left|right)/, `sidebar-${newPosition}`);
    floatBtn.className = floatBtn.className.replace(/float-btn-(left|right)/, `float-btn-${newPosition}`);
    
    // Update float button arrow
    floatBtn.innerHTML = newPosition === 'right' ? "◀" : "▶";
    
    // Update settings
    window.chatGPTCollapser.settings.sidebarPosition = newPosition;
    saveSettings();
    
    // Update position select
    const positionSelect = document.getElementById("position-select");
    if (positionSelect) {
        positionSelect.value = newPosition;
    }
}

function loadSettings() {
    // This function is called when sidebar is created
    // Settings are loaded from localStorage in the global state
}

function loadSettingsInModal() {
    const settings = window.chatGPTCollapser.settings;
    
    // Apply position setting
    const positionSelect = document.getElementById("position-select");
    if (positionSelect) {
        positionSelect.value = settings.sidebarPosition;
    }
    
    // Apply items per page setting
    const itemsPerPage = document.getElementById("items-per-page");
    if (itemsPerPage) {
        itemsPerPage.value = settings.itemsPerPage.toString();
    }
    
    // Apply auto-collapse setting
    const autoCollapse = document.getElementById("auto-collapse");
    if (autoCollapse) {
        autoCollapse.checked = settings.autoCollapse;
    }
}

function saveSettings() {
    localStorage.setItem('cgpt-sidebar-position', window.chatGPTCollapser.settings.sidebarPosition);
    localStorage.setItem('cgpt-settings', JSON.stringify(window.chatGPTCollapser.settings));
}

function saveFavorites() {
    localStorage.setItem('cgpt-favorites', JSON.stringify(window.chatGPTCollapser.favorites));
}


// Initialize the extension
function initializeExtension() {
    try {
        createSidebar();
        console.log("ChatGPT Collapser v2.0 initialized successfully");
    } catch (error) {
        console.error("ChatGPT Collapser: Initialization error:", error);
    }
}

// Enhanced debounced observer with error handling
let isUpdating = false;
let observer = null;

const debouncedAddCollapsers = (() => {
    let timerId = null;
    return () => {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
            if (isUpdating) return;
            isUpdating = true;
            try {
                if (!document.getElementById("chatgpt-sidebar")) {
                    createSidebar();
                }
                addCollapsers();
            } catch (e) {
                console.error("ChatGPT Collapser: Update error:", e);
            } finally {
                isUpdating = false;
            }
        }, 300);
    };
})();

// Enhanced mutation observer
observer = new MutationObserver((mutations) => {
    const sidebar = document.getElementById("chatgpt-sidebar");
    const floatBtn = document.getElementById("sidebar-float-btn");
    
    // Ignore mutations inside our own UI
    for (const m of mutations) {
        if ((sidebar && sidebar.contains(m.target)) || 
            (floatBtn && floatBtn.contains(m.target))) {
            return;
        }
    }
    
    // Check if we need to update
    let shouldUpdate = false;
    for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1) { // Element node
                    if (node.matches && (
                        node.matches("div[data-message-author-role]") ||
                        node.querySelector && node.querySelector("div[data-message-author-role]")
                    )) {
                        shouldUpdate = true;
                        break;
                    }
                }
            }
        }
        if (shouldUpdate) break;
    }
    
    if (shouldUpdate) {
        debouncedAddCollapsers();
    }
});

observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: false,
    characterData: false
});

// Enhanced keyboard shortcuts
document.addEventListener("keydown", (e) => {
    // Skip if user is typing in input fields
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (document.activeElement.contentEditable === "true") return;

    const shortcuts = {
        // Ctrl+Shift+F for search toggle
        'ctrl+shift+f': () => {
            const searchBtn = document.getElementById("search-toggle");
            if (searchBtn) {
                searchBtn.click();
                console.log("✅ Search toggled via keyboard");
            }
        },
        
        // Ctrl+Shift+Z for sort toggle
        'ctrl+shift+z': () => {
            const sortBtn = document.getElementById("sort-toggle");
            if (sortBtn) {
                sortBtn.click();
                console.log("✅ Sort toggled via keyboard");
            }
        },
        
        // Ctrl+Shift+X for expand/collapse all
        'ctrl+shift+x': () => {
            const toggleBtn = document.getElementById("toggle-all");
            if (toggleBtn) {
                toggleBtn.click();
                console.log("✅ Expand/Collapse all toggled via keyboard");
            }
        },
        
        // Ctrl+Shift+S for settings
        'ctrl+shift+s': () => {
            const settingsBtn = document.getElementById("settings-toggle");
            if (settingsBtn) {
                settingsBtn.click();
                console.log("✅ Settings toggled via keyboard");
            }
        },
        
        // Ctrl+Shift+V for favorites
        'ctrl+shift+v': () => {
            const favoritesBtn = document.getElementById("favorites-toggle");
            if (favoritesBtn) {
                favoritesBtn.click();
                console.log("✅ Favorites toggled via keyboard");
            }
        },
        
        // Ctrl+Shift+H to hide/show sidebar
        'ctrl+shift+h': () => {
            const sidebar = document.getElementById("chatgpt-sidebar");
            const floatBtn = document.getElementById("sidebar-float-btn");
            
            if (sidebar.classList.contains("hidden")) {
                sidebar.classList.remove("hidden");
                floatBtn.style.display = "none";
                console.log("✅ Sidebar shown via keyboard");
            } else {
                sidebar.classList.add("hidden");
                floatBtn.style.display = "block";
                console.log("✅ Sidebar hidden via keyboard");
            }
        },
        
        // Escape to close all panels
        'escape': () => {
            const panels = ['search-container', 'settings-panel', 'favorites-view'];
            let closed = false;
            
            panels.forEach(panelId => {
                const panel = document.getElementById(panelId);
                const toggle = document.getElementById(panelId.replace('-container', '-toggle').replace('-panel', '-toggle').replace('-view', '-toggle'));
                
                if (panel && panel.style.display !== "none") {
                    panel.style.display = "none";
                    if (toggle) toggle.classList.remove("active");
                    closed = true;
                }
            });
            
            if (closed) {
                console.log("✅ Panels closed via Escape key");
            }
        }
    };

    // Build shortcut key
    let shortcut = '';
    if (e.ctrlKey) shortcut += 'ctrl+';
    if (e.shiftKey) shortcut += 'shift+';
    if (e.altKey) shortcut += 'alt+';
    shortcut += e.key.toLowerCase();

    // Execute shortcut if exists
    if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

// Initial build after a short delay to ensure ChatGPT has loaded
setTimeout(() => {
    debouncedAddCollapsers();
}, 1000);

