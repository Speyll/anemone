class ThemeManager {
    constructor() {
        // Cache DOM elements once
        this.toggle = document.getElementById('theme-toggle');
        this.icon = document.getElementById('theme-icon');

        // Get data attributes once
        const { iconBase, iconDark, iconLight, soundSrc } = this.toggle.dataset;
        this.iconBase = iconBase;
        this.iconDark = iconDark;
        this.iconLight = iconLight;

        // Create audio element only when needed
        this.sound = new Audio(soundSrc);

        this.init();
    }

    init() {
        this.setInitialTheme();
        this.toggle.addEventListener('click', () => this.toggleTheme());
    }

    setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', initialTheme);
        this.updateIcon(initialTheme === 'dark');
    }

    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';

        document.body.classList.add('theme-transition');
        document.documentElement.setAttribute('data-theme', newTheme);

        // Use the inverse to update the icon to match the new theme
        this.updateIcon(!isDark);

        localStorage.setItem('theme', newTheme);

        // Use requestAnimationFrame for better performance on transition
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 300);
        });

        this.sound.play().catch(() => {});
    }


    // Extracted common functionality
    updateIcon(isDark) {
        this.icon.setAttribute('href', 
            `${this.iconBase}${isDark ? this.iconDark : this.iconLight}`);
    }
}

// Use modern syntax
document.addEventListener('DOMContentLoaded', () => new ThemeManager());
