(function () {
    "use strict";

    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function storedTheme() {
        try {
            return localStorage.getItem("theme");
        } catch (error) {
            return null;
        }
    }

    toggle.addEventListener("click", function () {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        root.classList.add("theme-transition");
        root.dataset.theme = next;

        try {
            localStorage.setItem("theme", next);
        } catch (error) {
            /* The theme still changes for this page view. */
        }

        window.setTimeout(function () {
            root.classList.remove("theme-transition");
        }, 300);
    });

    // Follow the operating system while the visitor has not chosen a theme.
    media.addEventListener("change", function (event) {
        if (!storedTheme()) {
            root.dataset.theme = event.matches ? "dark" : "light";
        }
    });
})();
