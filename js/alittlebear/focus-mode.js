(function() {
    /**
     * Focus/Study Mode - Early initialization
     *
     * Default: focus mode ON (hides non-study nav items, profile & comment widgets)
     * Persisted via localStorage. Toggle button in bottom-left, draggable.
     */
    var STORAGE_KEY = 'focus-mode';
    var DRAG_KEY = 'focus-btn-pos';
    var stored = localStorage.getItem(STORAGE_KEY);
    var isFocusMode = stored === null ? true : stored === 'true';

    if (isFocusMode) {
        document.body.classList.add('focus-mode');
    }

    function updateTocClass() {
        if (!document.getElementById('toc')) {
            document.body.classList.add('focus-no-toc');
        } else {
            document.body.classList.remove('focus-no-toc');
        }
    }

    function updateToggleIcon() {
        var el = document.getElementById('focus-mode-toggle');
        if (!el) return;
        var icon = el.querySelector('i');
        if (isFocusMode) {
            icon.className = 'fas fa-eye';
            el.title = '\u663e\u793a\u5168\u90e8\u5185\u5bb9';
        } else {
            icon.className = 'fas fa-graduation-cap';
            el.title = '\u5b66\u4e60\u6a21\u5f0f';
        }
    }

    function toggleFocusMode() {
        isFocusMode = !isFocusMode;
        localStorage.setItem(STORAGE_KEY, isFocusMode);
        document.body.classList.toggle('focus-mode', isFocusMode);
        updateTocClass();
        updateToggleIcon();
    }

    function createToggleButton() {
        if (document.getElementById('focus-mode-toggle')) return;
        var toggle = document.createElement('div');
        toggle.id = 'focus-mode-toggle';
        toggle.className = 'focus-toggle';
        toggle.title = isFocusMode ? '\u663e\u793a\u5168\u90e8\u5185\u5bb9' : '\u5b66\u4e60\u6a21\u5f0f';

        var icon = document.createElement('i');
        icon.className = 'fas ' + (isFocusMode ? 'fa-eye' : 'fa-graduation-cap');
        toggle.appendChild(icon);

        toggle.addEventListener('click', function() {
            if (toggle._wasDragged && toggle._wasDragged()) return;
            toggleFocusMode();
        });
        document.body.appendChild(toggle);

        makeDraggable(toggle, DRAG_KEY);
    }

    function makeDraggable(el, storageKey) {
        var pos = null;
        try { pos = JSON.parse(localStorage.getItem(storageKey)); } catch (e) { /* ignore */ }
        if (pos && typeof pos.left === 'number' && typeof pos.bottom === 'number') {
            el.style.left = pos.left + 'px';
            el.style.bottom = pos.bottom + 'px';
            el.style.right = 'auto';
            el.style.top = 'auto';
        }

        var startX, startY, startLeft, startBottom, dragging = false, moved = false;

        function onStart(e) {
            var touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            var rect = el.getBoundingClientRect();
            startLeft = rect.left;
            startBottom = window.innerHeight - rect.bottom;
            dragging = true;
            moved = false;
            e.preventDefault();
        }

        function onMove(e) {
            if (!dragging) return;
            var touch = e.touches ? e.touches[0] : e;
            var dx = touch.clientX - startX;
            var dy = touch.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                moved = true;
            }
            if (moved) {
                var newLeft = startLeft + dx;
                var newBottom = startBottom - dy;
                newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - el.offsetWidth));
                newBottom = Math.max(0, Math.min(newBottom, window.innerHeight - el.offsetHeight));
                el.style.left = newLeft + 'px';
                el.style.bottom = newBottom + 'px';
                el.style.right = 'auto';
                el.style.top = 'auto';
            }
        }

        function onEnd() {
            if (dragging && moved) {
                var rect = el.getBoundingClientRect();
                localStorage.setItem(storageKey, JSON.stringify({
                    left: rect.left,
                    bottom: window.innerHeight - rect.bottom
                }));
            }
            dragging = false;
        }

        el.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        el.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        el._wasDragged = function() { return moved; };
    }

    document.addEventListener('DOMContentLoaded', function() {
        updateTocClass();
        createToggleButton();
    });

    // Support PJAX: update TOC class after page navigation
    document.addEventListener('pjax:complete', function() {
        updateTocClass();
    });
}());
