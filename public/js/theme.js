/* theme.js — Dark / Light mode toggle for RABS */
(function () {
    const STORAGE_KEY = 'rabs-theme';
    const root = document.documentElement;

    // Apply saved theme immediately (before paint) to avoid flicker
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    root.setAttribute('data-theme', saved);

    function getTheme() {
        return root.getAttribute('data-theme');
    }

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        updateBtn();
    }

    function updateBtn() {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        const isDark = getTheme() === 'dark';
        btn.innerHTML = isDark ? '<i class="fa-solid fa-circle-half-stroke"></i>' : '<i class="fa-solid fa-circle-half-stroke"></i>';
        btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    function injectButton() {
        if (document.getElementById('themeToggleBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'themeToggleBtn';
        btn.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 9999;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 1px solid var(--border);
            background: var(--bg-card);
            color: var(--text-heading);
            font-size: 1.1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow);
            transition: all 0.2s ease;
            padding: 0;
        `;
        btn.onmouseenter = () => { btn.style.borderColor = 'var(--primary)'; btn.style.transform = 'scale(1.1)'; };
        btn.onmouseleave = () => { btn.style.borderColor = 'var(--border)';  btn.style.transform = 'scale(1)';   };
        btn.onclick = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');
        document.body.appendChild(btn);
        updateBtn();
    }

    // Inject after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectButton);
    } else {
        injectButton();
    }
})();
