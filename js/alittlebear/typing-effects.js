/**
 * Typing Effects Switcher for Gitalk comments
 * Allows switching between different typing visual effects:
 *   1. particles  - Original POWERMODE colorful particles
 *   2. sparkle    - Sparkle/star burst effect
 *   3. bubbles    - Rising bubbles effect
 *   4. none       - No effect
 *
 * The switcher button is placed inside the Gitalk header area,
 * next to the Edit/Preview buttons.
 */
(function () {
    'use strict';

    var effects = ['particles', 'sparkle', 'bubbles', 'none'];
    var effectNames = {
        particles: '粒子爆炸',
        sparkle: '星光闪烁',
        bubbles: '气泡上升',
        none: '无效果'
    };
    var effectNamesEn = {
        particles: 'Particles',
        sparkle: 'Sparkle',
        bubbles: 'Bubbles',
        none: 'None'
    };
    var effectIcons = {
        particles: 'fas fa-fire',
        sparkle: 'fas fa-star',
        bubbles: 'fas fa-circle',
        none: 'fas fa-ban'
    };

    var currentEffect = 'particles';
    var canvas, ctx;

    function getSaved() {
        try { return localStorage.getItem('typingEffect') || 'particles'; } catch (e) { return 'particles'; }
    }

    function isEnglish() {
        return typeof window._getLang === 'function' && window._getLang() === 'en';
    }

    function getNames() {
        return isEnglish() ? effectNamesEn : effectNames;
    }

    // ---- Sparkle effect ----
    var sparkles = [];
    var sparkleIdx = 0;

    function createSparkle(x, y, color) {
        var count = 3 + Math.floor(Math.random() * 5);
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = 1 + Math.random() * 3;
            sparkles[sparkleIdx] = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                alpha: 1,
                size: 1 + Math.random() * 2,
                color: color,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.3
            };
            sparkleIdx = (sparkleIdx + 1) % 300;
        }
    }

    function drawSparkles() {
        for (var i = 0; i < sparkles.length; i++) {
            var s = sparkles[i];
            if (!s || s.alpha <= 0.05) continue;
            s.vy += 0.04;
            s.x += s.vx;
            s.y += s.vy;
            s.alpha *= 0.94;
            s.rotation += s.rotSpeed;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            // Draw a 4-point star
            ctx.beginPath();
            var sz = s.size;
            for (var p = 0; p < 4; p++) {
                var a = (p / 4) * Math.PI * 2;
                ctx.lineTo(Math.cos(a) * sz * 2, Math.sin(a) * sz * 2);
                var a2 = ((p + 0.5) / 4) * Math.PI * 2;
                ctx.lineTo(Math.cos(a2) * sz * 0.5, Math.sin(a2) * sz * 0.5);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    // ---- Bubble effect ----
    var bubbles = [];
    var bubbleIdx = 0;

    function createBubble(x, y, color) {
        var count = 2 + Math.floor(Math.random() * 3);
        for (var i = 0; i < count; i++) {
            bubbles[bubbleIdx] = {
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: (Math.random() - 0.5) * 1,
                vy: -1.5 - Math.random() * 2,
                alpha: 0.8,
                size: 3 + Math.random() * 6,
                color: color,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.05 + Math.random() * 0.05
            };
            bubbleIdx = (bubbleIdx + 1) % 200;
        }
    }

    function drawBubbles() {
        for (var i = 0; i < bubbles.length; i++) {
            var b = bubbles[i];
            if (!b || b.alpha <= 0.05) continue;
            b.wobble += b.wobbleSpeed;
            b.x += b.vx + Math.sin(b.wobble) * 0.5;
            b.y += b.vy;
            b.alpha *= 0.97;
            b.size *= 0.995;

            ctx.globalAlpha = b.alpha * 0.6;
            // Bubble border
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.stroke();
            // Inner highlight
            ctx.globalAlpha = b.alpha * 0.3;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ---- Combined animation loop ----
    var animating = false;
    var frameCount = 0;

    function animate() {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var hasActive = false;

        if (currentEffect === 'sparkle') {
            drawSparkles();
            for (var i = 0; i < sparkles.length; i++) {
                if (sparkles[i] && sparkles[i].alpha > 0.05) { hasActive = true; break; }
            }
        } else if (currentEffect === 'bubbles') {
            drawBubbles();
            for (var j = 0; j < bubbles.length; j++) {
                if (bubbles[j] && bubbles[j].alpha > 0.05) { hasActive = true; break; }
            }
        }

        frameCount++;
        if (hasActive || frameCount < 60) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
        }
    }

    function startAnim() {
        frameCount = 0;
        if (!animating) {
            animating = true;
            requestAnimationFrame(animate);
        }
    }

    // ---- Accurate caret position calculation using mirror div ----
    var mirrorProps = [
        'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
        'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
        'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform',
        'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'
    ];

    function getCaretCoordinates(el, position) {
        var mirror = document.createElement('div');
        mirror.id = 'typing-effect-mirror';
        document.body.appendChild(mirror);

        var style = mirror.style;
        var computed = window.getComputedStyle(el);

        style.whiteSpace = 'pre-wrap';
        if (el.nodeName !== 'INPUT') {
            style.wordWrap = 'break-word';
        }
        style.position = 'absolute';
        style.visibility = 'hidden';

        for (var i = 0; i < mirrorProps.length; i++) {
            style[mirrorProps[i]] = computed[mirrorProps[i]];
        }

        if (el.scrollHeight > parseInt(computed.height)) {
            style.overflowY = 'scroll';
        } else {
            style.overflow = 'hidden';
        }

        mirror.textContent = el.value.substring(0, position);
        if (el.nodeName === 'INPUT') {
            mirror.textContent = mirror.textContent.replace(/\s/g, '\u00a0');
        }

        var span = document.createElement('span');
        span.textContent = el.value.substring(position) || '.';
        mirror.appendChild(span);

        var coords = {
            top: span.offsetTop + parseInt(computed.borderTopWidth),
            left: span.offsetLeft + parseInt(computed.borderLeftWidth)
        };

        document.body.removeChild(mirror);
        return coords;
    }

    // ---- Get caret position helper ----
    function getCaretPos() {
        var el = document.activeElement;
        if (!el) return null;
        var rect = el.getBoundingClientRect();
        // Random colorful
        var hue = Math.floor(Math.random() * 360);
        var colorful = 'hsl(' + hue + ', 100%, 65%)';

        if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.getAttribute('type') === 'text')) {
            // Use mirror div to get accurate caret position
            var coords = getCaretCoordinates(el, el.selectionStart);
            return {
                x: coords.left + rect.left - el.scrollLeft,
                y: coords.top + rect.top - el.scrollTop,
                color: colorful
            };
        }
        if (el.isContentEditable) {
            var sel = window.getSelection();
            if (sel && sel.rangeCount) {
                var range = sel.getRangeAt(0);
                var r = range.getBoundingClientRect();
                if (r.left === 0 && r.top === 0) {
                    // Fallback: use element rect
                    return { x: rect.left + 20, y: rect.top + 15, color: colorful };
                }
                return { x: r.left, y: r.top, color: colorful };
            }
        }
        return null;
    }

    // ---- Input handler ----
    function onInput() {
        if (currentEffect === 'none' || currentEffect === 'particles') return;
        var pos = getCaretPos();
        if (!pos) return;

        if (currentEffect === 'sparkle') {
            createSparkle(pos.x, pos.y, pos.color);
        } else if (currentEffect === 'bubbles') {
            createBubble(pos.x, pos.y, pos.color);
        }
        startAnim();
    }

    // ---- Effect switching ----
    function switchEffect(effect) {
        currentEffect = effect;
        try { localStorage.setItem('typingEffect', effect); } catch (e) { /* ignore */ }

        // Toggle POWERMODE
        if (typeof POWERMODE !== 'undefined') {
            if (effect === 'particles') {
                document.body.removeEventListener('input', onInput);
                document.body.addEventListener('input', POWERMODE);
            } else {
                document.body.removeEventListener('input', POWERMODE);
                if (effect !== 'none') {
                    document.body.addEventListener('input', onInput);
                } else {
                    document.body.removeEventListener('input', onInput);
                }
            }
        }
        updateSwitcherUI();
    }

    // ---- Build inline button for Gitalk header ----
    function tryInsertInlineBtn() {
        // Look for Gitalk header controls area (contains Edit/Preview tabs)
        var controls = document.querySelector('.gt-header-controls');
        if (!controls) return false;
        // Check if already inserted and still in DOM
        var existing = document.getElementById('typing-effect-inline');
        if (existing && controls.contains(existing)) return true;

        var wrapper = document.createElement('span');
        wrapper.id = 'typing-effect-inline';
        wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;margin-right:8px;vertical-align:middle;';

        var btn = document.createElement('a');
        btn.className = 'typing-effect-inline-btn';
        btn.style.cssText = 'cursor:pointer;display:inline-flex;align-items:center;gap:4px;' +
            'padding:2px 8px;border-radius:4px;font-size:12px;color:rgba(106,115,125,0.9);' +
            'transition:color 0.2s,background 0.2s;text-decoration:none;';
        btn.innerHTML = '<i class="fas fa-keyboard" style="filter:none!important;font-size:12px;"></i>' +
            '<span class="typing-effect-label" style="filter:none!important;">' +
            (isEnglish() ? 'Effect' : '打字效果') + '</span>';
        btn.title = isEnglish() ? 'Typing Effect' : '打字效果';

        var menu = document.createElement('div');
        menu.id = 'typing-effect-menu';
        menu.style.cssText = 'position:absolute;top:100%;left:0;margin-top:4px;background:rgba(15,18,35,0.95);' +
            'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(100,120,200,0.3);' +
            'border-radius:8px;padding:6px;min-width:130px;display:none;box-shadow:0 6px 24px rgba(0,0,0,0.5);z-index:10001;';

        var names = getNames();
        for (var i = 0; i < effects.length; i++) {
            var key = effects[i];
            var item = document.createElement('div');
            item.className = 'typing-effect-item';
            item.setAttribute('data-effect', key);
            item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;' +
                'cursor:pointer;color:rgba(200,200,220,0.85);font-size:13px;transition:background 0.2s,color 0.2s;white-space:nowrap;';
            item.innerHTML = '<i class="' + effectIcons[key] + '" style="width:16px;text-align:center;font-size:13px;filter:none!important;"></i>' +
                '<span style="filter:none!important;">' + names[key] + '</span>';
            item.addEventListener('mouseenter', function () { this.style.background = 'rgba(100,120,200,0.2)'; });
            item.addEventListener('mouseleave', function () {
                if (!this.classList.contains('active')) this.style.background = '';
            });
            item.addEventListener('click', (function (k) {
                return function (e) {
                    e.stopPropagation();
                    switchEffect(k);
                    // Keep menu open so user can continue selecting
                };
            })(key));
            menu.appendChild(item);
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) {
                menu.style.display = 'none';
            }
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(menu);
        // Insert before the first child (left of Edit/Preview)
        controls.insertBefore(wrapper, controls.firstChild);
        updateSwitcherUI();
        return true;
    }

    function updateSwitcherUI() {
        var items = document.querySelectorAll('.typing-effect-item');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('data-effect') === currentEffect) {
                items[i].classList.add('active');
                items[i].style.background = 'rgba(80,110,220,0.35)';
                items[i].style.color = 'rgba(230,230,230,0.95)';
            } else {
                items[i].classList.remove('active');
                items[i].style.background = '';
                items[i].style.color = 'rgba(200,200,220,0.85)';
            }
        }
    }

    // ---- Init ----
    function init() {
        // Create our own canvas for sparkle/bubble effects
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:999998;';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        window.addEventListener('resize', function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        currentEffect = getSaved();
        updateSwitcherUI();

        // Set up initial effect binding
        if (currentEffect !== 'particles' && typeof POWERMODE !== 'undefined') {
            document.body.removeEventListener('input', POWERMODE);
            if (currentEffect !== 'none') {
                document.body.addEventListener('input', onInput);
            }
        }

        // Watch for Gitalk to render and insert inline button
        watchForGitalk();
    }

    var gitalkObserver = null;

    function watchForGitalk() {
        // Try immediately
        tryInsertInlineBtn();

        // Disconnect previous observer if any (e.g. from PJAX re-init)
        if (gitalkObserver) {
            gitalkObserver.disconnect();
            gitalkObserver = null;
        }

        // Use MutationObserver to watch for Gitalk rendering and re-rendering.
        // Gitalk uses Preact which replaces DOM nodes on state changes (e.g. typing),
        // so we must keep watching and re-insert the button when it gets removed.
        gitalkObserver = new MutationObserver(function () {
            tryInsertInlineBtn();
        });
        var container = document.getElementById('comment-container') || document.body;
        gitalkObserver.observe(container, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Support PJAX: re-init on page navigation
    document.addEventListener('pjax:complete', function () {
        watchForGitalk();
    });
})();
