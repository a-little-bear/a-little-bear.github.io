/**
 * Light Mode Theme Switcher
 * Separates backgrounds and color tones (like dark mode does).
 *
 * Backgrounds:
 *   1. default   - Original background image
 *   2. bing      - Bing daily wallpaper
 *   3. grid      - CSS grid pattern
 *   4. gradient  - Animated flowing gradient
 *   5. waves     - Layered wave curves
 *   6. bokeh     - Floating blurred light spots
 *   7. dots      - Polka dot pattern
 *   8. topography - Topographic contour lines
 *
 * Color tones:
 *   1. default - White
 *   2. sepia   - Warm sepia eye-care
 *   3. green   - Soft green eye-care
 *   4. blue    - Blue tone
 *   5. brown   - Warm brown tone
 *   6. pink    - Pink/Rose tone
 *   7. purple  - Lavender/Purple tone
 */
(function () {
    'use strict';

    // ---- Backgrounds ----
    var bgTypes = ['default', 'bing', 'grid', 'gradient', 'waves', 'bokeh', 'dots', 'topography'];
    var bgNames = {
        default: '默认背景',
        bing: 'Bing 壁纸',
        grid: '网格',
        gradient: '渐变流光',
        waves: '波浪',
        bokeh: '光斑',
        dots: '圆点',
        topography: '等高线'
    };
    var bgNamesEn = {
        default: 'Default',
        bing: 'Bing Wallpaper',
        grid: 'Grid',
        gradient: 'Gradient Flow',
        waves: 'Waves',
        bokeh: 'Bokeh',
        dots: 'Polka Dots',
        topography: 'Topography'
    };
    var bgIcons = {
        default: 'fas fa-image',
        bing: 'fas fa-globe',
        grid: 'fas fa-th',
        gradient: 'fas fa-palette',
        waves: 'fas fa-water',
        bokeh: 'fas fa-circle',
        dots: 'fas fa-braille',
        topography: 'fas fa-mountain'
    };

    // ---- Color tones ----
    var colorTones = ['default', 'sepia', 'green', 'blue', 'brown', 'pink', 'purple'];
    var colorNames = {
        default: '白色',
        sepia: '护眼暖色',
        green: '护眼绿色',
        blue: '蓝色调',
        brown: '暖棕色调',
        pink: '粉色调',
        purple: '紫色调'
    };
    var colorNamesEn = {
        default: 'White',
        sepia: 'Warm Sepia',
        green: 'Soft Green',
        blue: 'Blue Tone',
        brown: 'Warm Brown',
        pink: 'Pink Tone',
        purple: 'Purple Tone'
    };
    var colorIcons = {
        default: 'fas fa-sun',
        sepia: 'fas fa-coffee',
        green: 'fas fa-leaf',
        blue: 'fas fa-tint',
        brown: 'fas fa-paw',
        pink: 'fas fa-heart',
        purple: 'fas fa-gem'
    };

    function isEnglish() {
        return typeof window._getLang === 'function' && window._getLang() === 'en';
    }

    // ---- Migrate from old lightTheme key ----
    (function migrateOldTheme() {
        try {
            var old = localStorage.getItem('lightTheme');
            if (old && !localStorage.getItem('lightBgType') && !localStorage.getItem('lightColorTone')) {
                if (old === 'bing') {
                    localStorage.setItem('lightBgType', 'bing');
                    localStorage.setItem('lightColorTone', 'default');
                } else {
                    localStorage.setItem('lightBgType', 'default');
                    localStorage.setItem('lightColorTone', old);
                }
                localStorage.removeItem('lightTheme');
            }
        } catch (e) { /* ignore */ }
    })();

    // ---- Saved state ----
    function getSavedBg() {
        try { return localStorage.getItem('lightBgType') || 'default'; } catch (e) { return 'default'; }
    }
    function getSavedColor() {
        try { return localStorage.getItem('lightColorTone') || 'sepia'; } catch (e) { return 'sepia'; }
    }

    // ---- Bing wallpaper ----
    var bingUrl = null;
    var bingLoading = false;

    function fetchBingWallpaper(cb) {
        if (bingUrl) { cb(bingUrl); return; }
        if (bingLoading) return;
        bingLoading = true;
        var img = new Image();
        var url = 'https://bing.img.run/1920x1080.php';
        img.onload = function () {
            bingUrl = url;
            bingLoading = false;
            cb(url);
        };
        img.onerror = function () {
            bingUrl = 'https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=images&method=pc';
            bingLoading = false;
            cb(bingUrl);
        };
        img.src = url;
    }

    // ---- Migrate saved particles to gradient ----
    (function migrateParticles() {
        try {
            if (localStorage.getItem('lightBgType') === 'particles') {
                localStorage.setItem('lightBgType', 'gradient');
            }
        } catch (e) { /* ignore */ }
    })();

    // ---- Background management ----
    function removeAllBgClasses() {
        for (var i = 0; i < bgTypes.length; i++) {
            document.body.classList.remove('light-bg-' + bgTypes[i]);
        }
        // Also remove legacy classes
        document.body.classList.remove('light-theme-bing');
        document.body.classList.remove('light-bg-particles');
    }

    function applyBackground(type) {
        removeAllBgClasses();
        document.body.style.removeProperty('--light-bg-image');

        if (type === 'bing') {
            document.body.classList.add('light-bg-bing');
            fetchBingWallpaper(function (url) {
                document.body.style.setProperty('--light-bg-image', 'url("' + url + '")');
            });
        } else if (type === 'grid') {
            document.body.classList.add('light-bg-grid');
        } else if (type === 'gradient') {
            document.body.classList.add('light-bg-gradient');
        } else if (type === 'waves') {
            document.body.classList.add('light-bg-waves');
        } else if (type === 'bokeh') {
            document.body.classList.add('light-bg-bokeh');
        } else if (type === 'dots') {
            document.body.classList.add('light-bg-dots');
        } else if (type === 'topography') {
            document.body.classList.add('light-bg-topography');
        } else {
            // default - original background
            document.body.classList.add('light-bg-default');
        }

        try { localStorage.setItem('lightBgType', type); } catch (e) { /* ignore */ }
        updateBgUI();
    }

    // ---- Color tone management ----
    function removeAllColorClasses() {
        for (var i = 0; i < colorTones.length; i++) {
            if (colorTones[i] !== 'default') {
                document.body.classList.remove('light-theme-' + colorTones[i]);
            }
        }
    }

    function applyColorTone(tone) {
        removeAllColorClasses();
        if (tone !== 'default') {
            document.body.classList.add('light-theme-' + tone);
        }
        try { localStorage.setItem('lightColorTone', tone); } catch (e) { /* ignore */ }
        updateColorUI();
    }

    // ---- Build popup UI ----
    function buildPopup() {
        if (document.getElementById('light-theme-popup')) return;
        var popup = document.createElement('div');
        popup.id = 'light-theme-popup';
        popup.className = 'light-theme-popup';
        popup.style.display = 'none';

        var en = isEnglish();

        // Background section
        var bgLabel = document.createElement('div');
        bgLabel.className = 'light-theme-label';
        bgLabel.textContent = en ? 'Background' : '背景';
        popup.appendChild(bgLabel);

        for (var i = 0; i < bgTypes.length; i++) {
            var key = bgTypes[i];
            var item = document.createElement('div');
            item.className = 'light-theme-item light-theme-bg-item';
            item.setAttribute('data-bg', key);
            item.innerHTML = '<i class="' + bgIcons[key] + '"></i><span>' + (en ? bgNamesEn[key] : bgNames[key]) + '</span>';
            item.addEventListener('click', (function (k) {
                return function (e) {
                    e.stopPropagation();
                    applyBackground(k);
                };
            })(key));
            popup.appendChild(item);
        }

        // Separator
        var separator = document.createElement('div');
        separator.className = 'light-theme-separator';
        popup.appendChild(separator);

        // Color tone section
        var colorLabel = document.createElement('div');
        colorLabel.className = 'light-theme-label';
        colorLabel.textContent = en ? 'Color Tone' : '色调';
        popup.appendChild(colorLabel);

        for (var j = 0; j < colorTones.length; j++) {
            var cKey = colorTones[j];
            var cItem = document.createElement('div');
            cItem.className = 'light-theme-item light-theme-color-item';
            cItem.setAttribute('data-color', cKey);
            cItem.innerHTML = '<i class="' + colorIcons[cKey] + '"></i><span>' + (en ? colorNamesEn[cKey] : colorNames[cKey]) + '</span>';
            cItem.addEventListener('click', (function (k) {
                return function (e) {
                    e.stopPropagation();
                    applyColorTone(k);
                };
            })(cKey));
            popup.appendChild(cItem);
        }

        document.body.appendChild(popup);
    }

    function updateBgUI() {
        var saved = getSavedBg();
        var items = document.querySelectorAll('.light-theme-bg-item');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('data-bg') === saved) {
                items[i].classList.add('active');
            } else {
                items[i].classList.remove('active');
            }
        }
    }

    function updateColorUI() {
        var saved = getSavedColor();
        var items = document.querySelectorAll('.light-theme-color-item');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('data-color') === saved) {
                items[i].classList.add('active');
            } else {
                items[i].classList.remove('active');
            }
        }
    }

    function positionPopup() {
        var btn = document.getElementById('light-theme-nav');
        var popup = document.getElementById('light-theme-popup');
        if (!btn || !popup) return;
        var rect = btn.getBoundingClientRect();
        popup.style.top = (rect.bottom + 8) + 'px';
        popup.style.right = (window.innerWidth - rect.right) + 'px';
    }

    function closePopupOutside(e) {
        var popup = document.getElementById('light-theme-popup');
        var btn = document.getElementById('light-theme-nav');
        if (!popup) return;
        if (!popup.contains(e.target) && !(btn && btn.contains(e.target))) {
            popup.style.display = 'none';
            document.removeEventListener('click', closePopupOutside);
        }
    }

    function togglePopup() {
        var popup = document.getElementById('light-theme-popup');
        if (!popup) return;
        if (popup.style.display === 'none') {
            positionPopup();
            popup.style.display = 'block';
            updateBgUI();
            updateColorUI();
            setTimeout(function () {
                document.addEventListener('click', closePopupOutside);
            }, 0);
        } else {
            popup.style.display = 'none';
            document.removeEventListener('click', closePopupOutside);
        }
    }

    // ---- Initialize ----
    function init() {
        var btn = document.getElementById('light-theme-nav');
        if (!btn) {
            setTimeout(init, 100);
            return;
        }
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            togglePopup();
        });
        buildPopup();
        // Apply saved settings if in light mode
        if (!document.body.classList.contains('night')) {
            applyBackground(getSavedBg());
            applyColorTone(getSavedColor());
        }
    }

    init();

    // Expose for theme-setting.js
    window._lightTheme = {
        apply: function () {
            applyBackground(getSavedBg());
            applyColorTone(getSavedColor());
        },
        remove: function () {
            removeAllBgClasses();
            removeAllColorClasses();
            document.body.style.removeProperty('--light-bg-image');
        }
    };
})();
