console.log("ChatGPT Collapser loaded ✅");

function createSidebar() {
    if (document.getElementById("chatgpt-sidebar")) return;

    const sidebar = document.createElement("div");
    sidebar.id = "chatgpt-sidebar";

    sidebar.innerHTML = `
    <div id="sidebar-header">
      <h3>📑 Questions</h3>
      <div>
        <button id="sort-toggle">☰</button>
        <button id="toggle-all">Expand All</button>
        <button id="collapse-sidebar">▶</button>
      </div>
    </div>
    <ul id="question-list"></ul>
  `;

    document.body.appendChild(sidebar);

    // Floating button (appears only when sidebar hidden)
    const floatBtn = document.createElement("button");
    floatBtn.id = "sidebar-float-btn";
    floatBtn.innerText = "◀";
    floatBtn.style.display = "none"; // hidden by default
    document.body.appendChild(floatBtn);

    console.log("Sidebar + float button created");

    // Global expand/collapse all
    document.getElementById("toggle-all").onclick = () => {
        const allAnswers = document.querySelectorAll("div[data-message-author-role='assistant']");
        const btn = document.getElementById("toggle-all");
        const expand = btn.innerText === "Expand All";

        allAnswers.forEach(ans => {
            ans.classList.toggle("collapsed", !expand);
            const collapseBtn = ans.querySelector(".collapse-btn");
            if (collapseBtn) collapseBtn.innerText = expand ? "Collapse" : "Expand";
        });

        // Update sidebar toggle buttons
        const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle-btn");
        sidebarToggleBtns.forEach(toggleBtn => {
            toggleBtn.innerText = expand ? "Collapse" : "Expand";
        });

        btn.innerText = expand ? "Collapse All" : "Expand All";
    };

    // Initialize default sort (default Descending)
    if (typeof window.__chatgptSortAsc === "undefined") {
        window.__chatgptSortAsc = false;
    }

    // Sort toggle (Asc/Desc)
    const sortBtn = document.getElementById("sort-toggle");
    if (sortBtn) {
        sortBtn.setAttribute("title", window.__chatgptSortAsc ? "Sort: Asc" : "Sort: Desc");
        sortBtn.onclick = () => {
            window.__chatgptSortAsc = !window.__chatgptSortAsc;
            sortBtn.setAttribute("title", window.__chatgptSortAsc ? "Sort: Asc" : "Sort: Desc");
            addCollapsers();
        };
    }

    // Sidebar collapse button
    document.getElementById("collapse-sidebar").onclick = () => {
        const sidebar = document.getElementById("chatgpt-sidebar");
        const floatBtn = document.getElementById("sidebar-float-btn");
        sidebar.classList.add("hidden");
        floatBtn.style.display = "block"; // show floating button
    };

    // Floating button to bring sidebar back
    floatBtn.onclick = () => {
        const sidebar = document.getElementById("chatgpt-sidebar");
        sidebar.classList.remove("hidden");
        floatBtn.style.display = "none"; // hide floating button
    };
}

function addCollapsers() {
    const answers = document.querySelectorAll("div[data-message-author-role='assistant']");
    const questions = document.querySelectorAll("div[data-message-author-role='user']");

    const qList = document.getElementById("question-list");
    if (!qList) return;
    qList.innerHTML = ""; // clear old list

    // Ensure answer collapse buttons exist
    answers.forEach((answer, i) => {
        if (!answer.querySelector(".collapse-btn")) {
            const btn = document.createElement("button");
            btn.className = "collapse-btn";

            if (i === answers.length - 1) {
                answer.classList.remove("collapsed");
                btn.innerText = "Collapse";
            } else {
                answer.classList.add("collapsed");
                btn.innerText = "Expand";
            }

            btn.onclick = () => {
                answer.classList.toggle("collapsed");
                btn.innerText = answer.classList.contains("collapsed") ? "Expand" : "Collapse";
            };

            answer.prepend(btn);
        }
    });

    // Build pairs and sort order
    const pairs = [];
    answers.forEach((answer, i) => {
        if (questions[i]) {
            pairs.push({ index: i, answer, question: questions[i] });
        }
    });

    const asc = window.__chatgptSortAsc === true; // default is false (Desc)
    const ordered = asc ? pairs : pairs.slice().reverse();

    ordered.forEach(({ index, answer, question }) => {
        const li = document.createElement("li");
        li.className = "sidebar-item";

        const qText = document.createElement("span");
        qText.innerText = `Q${index + 1}: ${question.innerText.slice(0, 40)}...`;

        const goBtn = document.createElement("button");
        goBtn.className = "sidebar-goto-btn";
        goBtn.innerText = "Jump";
        goBtn.onclick = () => {
            answer.scrollIntoView({ behavior: "smooth", block: "center" });
        };

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "sidebar-toggle-btn";
        toggleBtn.innerText = answer.classList.contains("collapsed") ? "Expand" : "Collapse";
        toggleBtn.onclick = () => {
            answer.classList.toggle("collapsed");
            const mainBtn = answer.querySelector(".collapse-btn");
            if (mainBtn) {
                mainBtn.innerText = answer.classList.contains("collapsed") ? "Expand" : "Collapse";
            }
            toggleBtn.innerText = answer.classList.contains("collapsed") ? "Expand" : "Collapse";
        };

        li.appendChild(qText);
        li.appendChild(goBtn);
        li.appendChild(toggleBtn);
        qList.appendChild(li);
    });
    
    // Scroll sidebar to end/start depending on sort order
    // if (qList && qList.children.length > 0) {
    //     if (asc && qList.lastElementChild) {
    //         qList.lastElementChild.scrollIntoView({ behavior: "smooth", block: "end" });
    //     } else if (!asc && qList.firstElementChild) {
    //         qList.firstElementChild.scrollIntoView({ behavior: "smooth", block: "start" });
    //     }
    // }
}

createSidebar();
// setInterval(addCollapsers, 3000);

// Use a debounced MutationObserver and ignore mutations originating from our sidebar
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
                console.error("ChatGPT Collapser error:", e);
            } finally {
                isUpdating = false;
            }
        }, 300);
    };
})();

observer = new MutationObserver((mutations) => {
    const sidebar = document.getElementById("chatgpt-sidebar");
    const floatBtn = document.getElementById("sidebar-float-btn");
    // Ignore mutations inside our own UI
    for (const m of mutations) {
        if ((sidebar && sidebar.contains(m.target)) || (floatBtn && floatBtn.contains(m.target))) {
            return;
        }
    }
    debouncedAddCollapsers();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial build
debouncedAddCollapsers();

