console.log("ChatGPT Collapser loaded ✅");

function createSidebar() {
    if (document.getElementById("chatgpt-sidebar")) return;

    const sidebar = document.createElement("div");
    sidebar.id = "chatgpt-sidebar";

    sidebar.innerHTML = `
    <div id="sidebar-header">
      <h3>📑 Questions</h3>
      <div>
        <button id="toggle-all">Expand All</button>
        <button id="collapse-sidebar">⮞</button>
      </div>
    </div>
    <ul id="question-list"></ul>
  `;

    document.body.appendChild(sidebar);

    // Floating button (appears only when sidebar hidden)
    const floatBtn = document.createElement("button");
    floatBtn.id = "sidebar-float-btn";
    floatBtn.innerText = "⮜";
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

        btn.innerText = expand ? "Collapse All" : "Expand All";
    };

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

    answers.forEach((answer, i) => {
        // Add collapse button inside answers (if not exists)
        if (!answer.querySelector(".collapse-btn")) {
            const btn = document.createElement("button");
            btn.className = "collapse-btn";

            // Only decide collapsed/expanded when button is first added
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


        // Add entry in sidebar
        if (questions[i]) {
            const li = document.createElement("li");
            li.className = "sidebar-item";

            const qText = document.createElement("span");
            qText.innerText = `Q${i + 1}: ${questions[i].innerText.slice(0, 40)}...`;

            // "Go To" button
            const goBtn = document.createElement("button");
            goBtn.className = "sidebar-goto-btn";
            goBtn.innerText = "Go To";
            goBtn.onclick = () => {
                answer.scrollIntoView({ behavior: "smooth", block: "center" });
            };

            // "Expand/Collapse" button
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
        }

    });
}

createSidebar();
setInterval(addCollapsers, 3000);
