class ThemeManager {
    constructor() {
        this.toggle = document.getElementById('theme-toggle');
        if (!this.toggle) return;

        this.icon = document.getElementById('theme-icon');
        const { iconBase, iconDark, iconLight, soundSrc } = this.toggle.dataset;
        this.iconBase = iconBase;
        this.iconDark = iconDark;
        this.iconLight = iconLight;

        // Create audio element lazily only when needed
        this.sound = null;
        this.soundSrc = soundSrc;

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
        document.body.classList.add('theme-transition');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        this.updateIcon(!isDark);
        localStorage.setItem('theme', newTheme);

        // Lazy load sound only when needed
        if (!this.sound && this.soundSrc) {
            this.sound = new Audio(this.soundSrc);
        }

        if (this.sound) {
            this.sound.play().catch(() => {});
        }

        // Use requestAnimationFrame for better performance on transition
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 300);
        });
    }

    updateIcon(isDark) {
        if (this.icon) {
            this.icon.setAttribute('href',
                `${this.iconBase}${isDark ? this.iconDark : this.iconLight}`);
        }
    }
}


class SearchManager {
    constructor() {
        this.toggle = document.getElementById('search-toggle');
        this.overlay = document.getElementById('search-overlay');
        this.background = document.getElementById('search-background');
        this.input = document.getElementById('search-input');
        this.results = document.getElementById('search-results');
        this.resultsList = document.getElementById('search-results-list');
        
        this.searchIndex = null;
        this.debounceTimer = null;
        this.init();
    }
    
    init() {
        this.toggle.addEventListener('click', () => this.openSearch());
        this.background.addEventListener('click', () => this.closeSearch());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('input', () => this.handleSearch());
        
        // Load search index only if elasticlunr is available (search enabled)
        if (window.elasticlunr) {
            this.loadSearchIndex();
        }
    }
    
    loadSearchIndex() {
        console.log('Checking for search index...');
        if (window.searchIndex && window.elasticlunr) {
            console.log('Window searchIndex found:', window.searchIndex);
            this.searchIndex = elasticlunr.Index.load(window.searchIndex);
            console.log('Search index loaded successfully');
        } else {
            console.warn('Window searchIndex not found or elasticlunr not available');
        }
    }
    
    openSearch() {
        this.overlay.classList.remove('hidden');
        this.input.focus();
    }
    
    closeSearch() {
        this.hideResults();
        this.overlay.classList.add('hidden');
        this.input.value = '';
    }
    
    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.closeSearch();
        }
    }
    
    handleSearch() {
        // Clear any existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Set a new timer to execute search after 300ms
        this.debounceTimer = setTimeout(() => {
            this.performSearch();
        }, 300);
    }
    
    performSearch() {
        const query = this.input.value.trim();
        
        if (query.length === 0) {
            this.hideResults();
            return;
        }
        
        if (!this.searchIndex) {
            console.warn('Search index not available');
            this.showNoResults('Search index not loaded');
            return;
        }
        
        const results = this.searchIndex.search(query, {
            fields: {
                title: { boost: 2 },
                body: { boost: 1 }
            },
            bool: "OR",
            expand: true
        });
        
        console.log('Search results:', results);
        this.displayResults(results);
    }
    
    displayResults(results) {
        this.resultsList.innerHTML = '';
        
        if (results.length === 0) {
            this.showNoResults('No results found');
            return;
        }
        
        results.slice(0, 10).forEach(result => {
            const li = document.createElement('li');
            const doc = this.searchIndex.documentStore.getDoc(result.ref);
            
            const url = result.ref;
            
            li.innerHTML = `
                <a href="${url}">
                    <div class="search-result-title">${doc.title || 'Untitled'}</div>
                    ${doc.body ? `<div class="search-result-excerpt">${doc.body.substring(0, 150)}...</div>` : ''}
                </a>
            `;
            
            this.resultsList.appendChild(li);
        });
        
        this.showResults();
    }
    
    showResults() {
        this.results.classList.remove('hidden');
    }
    
    hideResults() {
        this.results.classList.add('hidden');
    }
    
    showNoResults(message) {
        this.resultsList.innerHTML = `<li class="no-results">${message}</li>`;
        this.showResults();
    }
}

// Initialize when content is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
        new SearchManager();
    });
} else {
    new ThemeManager();
    new SearchManager();
}
