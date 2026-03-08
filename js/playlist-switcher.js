(function () {
    var playlists = window.__sideMusicPlaylists;
    if (!playlists || playlists.length < 2) return;

    var STORAGE_KEY = 'side-music-playlist-id';
    var DRAG_KEY = 'playlist-btn-pos';
    var container = document.querySelector('.sideMusic');
    if (!container) return;

    var defaultId = String(playlists[0].id);
    var savedId = localStorage.getItem(STORAGE_KEY) || defaultId;

    // Validate saved ID exists in playlists
    var validIds = playlists.map(function (p) { return String(p.id); });
    if (validIds.indexOf(savedId) === -1) savedId = defaultId;

    // If saved playlist differs from the server-rendered one, switch after APlayer initializes
    var metingEl = container.querySelector('meting-js');
    var renderedId = metingEl ? metingEl.getAttribute('id') : null;
    if (renderedId && renderedId !== savedId) {
        waitAndSwitch(savedId);
    }

    createSelector(savedId);

    function waitAndSwitch(id) {
        var attempts = 0;
        var timer = setInterval(function () {
            var m = container.querySelector('meting-js');
            attempts++;
            if ((m && m.aplayer) || attempts > 100) {
                clearInterval(timer);
                if (m && m.aplayer) doSwitch(id);
            }
        }, 100);
    }

    function doSwitch(id) {
        // Destroy existing player
        var m = container.querySelector('meting-js');
        if (m) {
            if (m.aplayer) m.aplayer.destroy();
            m.remove();
        }
        // Clean up any leftover APlayer DOM
        var old = container.querySelectorAll('.aplayer');
        for (var i = 0; i < old.length; i++) old[i].remove();

        // Create new meting-js element
        var el = document.createElement('meting-js');
        el.setAttribute('server', 'netease');
        el.setAttribute('type', 'playlist');
        el.setAttribute('id', String(id));
        el.setAttribute('theme', '#2980b9');
        el.setAttribute('loop', 'all');
        el.setAttribute('autoplay', 'false');
        el.setAttribute('order', 'list');
        el.setAttribute('storageName', 'aplayer-setting');
        el.setAttribute('lrctype', '0');
        el.setAttribute('list-max-height', '400px');
        el.setAttribute('fixed', 'true');
        el.style.cssText = 'width:auto;height:2000px;';
        container.appendChild(el);

        localStorage.setItem(STORAGE_KEY, String(id));
        updateActive(String(id));
    }

    function createSelector(currentId) {
        var btn = document.createElement('button');
        btn.className = 'playlist-selector-btn';
        btn.innerHTML = '<i class="fas fa-list-ul"></i>';
        btn.title = '\u5207\u6362\u6b4c\u5355'; // 切换歌单

        var menu = document.createElement('div');
        menu.className = 'playlist-selector-menu';

        for (var i = 0; i < playlists.length; i++) {
            (function (p) {
                var item = document.createElement('div');
                item.className = 'playlist-item' + (String(p.id) === currentId ? ' active' : '');
                item.textContent = p.name;
                item.setAttribute('data-id', String(p.id));
                item.addEventListener('click', function () {
                    var current = localStorage.getItem(STORAGE_KEY) || defaultId;
                    if (String(p.id) !== current) {
                        doSwitch(p.id);
                    }
                    menu.classList.remove('active');
                });
                menu.appendChild(item);
            })(playlists[i]);
        }

        btn.addEventListener('click', function (e) {
            if (btn._wasDragged && btn._wasDragged()) return;
            e.stopPropagation();
            // Position menu above the button dynamically
            var rect = btn.getBoundingClientRect();
            menu.style.left = rect.left + 'px';
            menu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
            menu.style.right = 'auto';
            menu.style.top = 'auto';
            menu.classList.toggle('active');
        });

        document.addEventListener('click', function () {
            menu.classList.remove('active');
        });

        menu.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        document.body.appendChild(btn);
        document.body.appendChild(menu);

        makeDraggable(btn, DRAG_KEY);
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

        el._wasDragged = function () { return moved; };
    }

    function updateActive(id) {
        var items = document.querySelectorAll('.playlist-selector-menu .playlist-item');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('data-id') === id) {
                items[i].classList.add('active');
            } else {
                items[i].classList.remove('active');
            }
        }
    }
})();
