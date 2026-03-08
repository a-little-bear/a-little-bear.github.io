/**
 * Annotation / Comment Feature for Study Mode
 *
 * In focus (study) mode on article pages, replaces the hidden profile widget area
 * with an annotation panel. Users can:
 *   1. Select text in the article to get a "Comment" popup
 *   2. Add a comment/annotation
 *   3. See annotations listed in the left sidebar panel
 *   4. Click an annotation to highlight both the sidebar item and the article text
 *   5. Click blank space to deselect
 *
 * Annotations are stored per-page in localStorage.
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'annotations-';
    var annotations = [];
    var activeId = null;
    var highlightElements = [];
    var panel = null;
    var popupEl = null;

    function isEnglish() {
        return typeof window._getLang === 'function' && window._getLang() === 'en';
    }

    function isFocusMode() {
        return document.body.classList.contains('focus-mode');
    }

    function isArticlePage() {
        return !!document.querySelector('.article .content');
    }

    function getPageKey() {
        return STORAGE_PREFIX + window.location.pathname;
    }

    function loadAnnotations() {
        try {
            var data = localStorage.getItem(getPageKey());
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    }

    function saveAnnotations() {
        try {
            localStorage.setItem(getPageKey(), JSON.stringify(annotations));
        } catch (e) { /* ignore */ }
    }

    // ---- Highlight text in article ----
    function clearHighlights() {
        for (var i = 0; i < highlightElements.length; i++) {
            var el = highlightElements[i];
            if (el.parentNode) {
                var parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            }
        }
        highlightElements = [];
    }

    function highlightText(selectedText, annotationId) {
        clearHighlights();
        if (!selectedText) return;

        var content = document.querySelector('.article .content');
        if (!content) return;

        var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
        var nodesToHighlight = [];
        var node;

        while ((node = walker.nextNode())) {
            if (node.nodeValue.indexOf(selectedText) !== -1) {
                nodesToHighlight.push(node);
            }
        }

        // Highlight the first match
        if (nodesToHighlight.length > 0) {
            var textNode = nodesToHighlight[0];
            var idx = textNode.nodeValue.indexOf(selectedText);
            if (idx >= 0) {
                var range = document.createRange();
                range.setStart(textNode, idx);
                range.setEnd(textNode, idx + selectedText.length);

                var mark = document.createElement('mark');
                mark.className = 'annotation-highlight';
                mark.setAttribute('data-annotation-id', annotationId);
                mark.style.cssText = 'background: rgba(97, 144, 232, 0.3); border-radius: 2px; padding: 0 1px; transition: background 0.2s;';
                range.surroundContents(mark);
                highlightElements.push(mark);

                // Scroll into view
                mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // ---- Annotation panel in sidebar ----
    function createPanel() {
        if (panel) return panel;

        var profileWidget = document.querySelector('.widget[data-type="profile"]');
        if (!profileWidget || !profileWidget.parentNode) return null;

        panel = document.createElement('div');
        panel.id = 'annotation-panel';
        panel.className = 'card widget annotation-panel';
        panel.setAttribute('data-type', 'annotations');

        renderPanel();

        // Insert after the profile widget (same location)
        profileWidget.parentNode.insertBefore(panel, profileWidget.nextSibling);

        return panel;
    }

    function renderPanel() {
        if (!panel) return;
        var en = isEnglish();
        var title = en ? 'Annotations' : '批注';
        var empty = en ? 'Select text to add annotations' : '选中文字来添加批注';

        var html = '<div class="card-content">';
        html += '<div class="annotation-panel-header">';
        html += '<span class="annotation-panel-title"><i class="fas fa-pen-nib"></i> ' + title + '</span>';
        if (annotations.length > 0) {
            html += '<span class="annotation-clear-btn" title="' + (en ? 'Clear all' : '清除全部') + '">';
            html += '<i class="fas fa-trash-alt"></i></span>';
        }
        html += '</div>';

        if (annotations.length === 0) {
            html += '<p class="annotation-empty">' + empty + '</p>';
        } else {
            html += '<div class="annotation-list">';
            for (var i = 0; i < annotations.length; i++) {
                var a = annotations[i];
                var isActive = activeId === a.id;
                html += '<div class="annotation-item' + (isActive ? ' active' : '') + '" data-id="' + a.id + '">';
                html += '<div class="annotation-selected-text">"' + escapeHtml(truncate(a.selectedText, 50)) + '"</div>';
                html += '<div class="annotation-comment">' + escapeHtml(a.comment) + '</div>';
                html += '<div class="annotation-actions">';
                html += '<span class="annotation-delete" data-id="' + a.id + '" title="' + (en ? 'Delete' : '删除') + '"><i class="fas fa-times"></i></span>';
                html += '</div>';
                html += '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        panel.innerHTML = html;

        // Bind events
        var items = panel.querySelectorAll('.annotation-item');
        for (var j = 0; j < items.length; j++) {
            items[j].addEventListener('click', onAnnotationClick);
        }

        var deleteButtons = panel.querySelectorAll('.annotation-delete');
        for (var k = 0; k < deleteButtons.length; k++) {
            deleteButtons[k].addEventListener('click', onDeleteClick);
        }

        var clearBtn = panel.querySelector('.annotation-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                annotations = [];
                activeId = null;
                clearHighlights();
                saveAnnotations();
                renderPanel();
            });
        }
    }

    function onAnnotationClick(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        if (activeId === id) {
            // Deselect
            activeId = null;
            clearHighlights();
        } else {
            activeId = id;
            var annotation = findAnnotation(id);
            if (annotation) {
                highlightText(annotation.selectedText, id);
            }
        }
        renderPanel();
    }

    function onDeleteClick(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-id');
        annotations = annotations.filter(function (a) { return a.id !== id; });
        if (activeId === id) {
            activeId = null;
            clearHighlights();
        }
        saveAnnotations();
        renderPanel();
    }

    function findAnnotation(id) {
        for (var i = 0; i < annotations.length; i++) {
            if (annotations[i].id === id) return annotations[i];
        }
        return null;
    }

    // ---- Selection popup ----
    function showSelectionPopup(x, y, selectedText) {
        removePopup();

        popupEl = document.createElement('div');
        popupEl.className = 'annotation-popup';
        var en = isEnglish();
        popupEl.innerHTML = '<button class="annotation-popup-btn"><i class="fas fa-comment"></i> ' +
            (en ? 'Comment' : '评论') + '</button>';

        popupEl.style.left = x + 'px';
        popupEl.style.top = y + 'px';

        document.body.appendChild(popupEl);

        popupEl.querySelector('.annotation-popup-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            removePopup();
            showCommentInput(x, y, selectedText);
        });

        // Close when clicking elsewhere (defer to avoid immediate trigger)
        setTimeout(function () {
            document.addEventListener('mousedown', onPopupOutsideClick);
        }, 0);
    }

    function showCommentInput(x, y, selectedText) {
        removePopup();

        popupEl = document.createElement('div');
        popupEl.className = 'annotation-input-popup';
        var en = isEnglish();
        popupEl.innerHTML = '<div class="annotation-input-header">' +
            '<i class="fas fa-pen"></i> ' + (en ? 'Add Comment' : '添加评论') +
            '</div>' +
            '<div class="annotation-input-preview">"' + escapeHtml(truncate(selectedText, 60)) + '"</div>' +
            '<textarea class="annotation-input-textarea" placeholder="' +
            (en ? 'Write your comment...' : '写下你的评论...') +
            '" rows="3"></textarea>' +
            '<div class="annotation-input-actions">' +
            '<button class="annotation-input-cancel">' + (en ? 'Cancel' : '取消') + '</button>' +
            '<button class="annotation-input-submit">' + (en ? 'Add' : '添加') + '</button>' +
            '</div>';

        // Position: try to keep within viewport
        var left = Math.min(x, window.innerWidth - 280);
        var top = Math.min(y, window.innerHeight - 220);
        popupEl.style.left = left + 'px';
        popupEl.style.top = top + 'px';

        document.body.appendChild(popupEl);

        var textarea = popupEl.querySelector('.annotation-input-textarea');
        textarea.focus();

        popupEl.querySelector('.annotation-input-cancel').addEventListener('click', function (e) {
            e.stopPropagation();
            removePopup();
        });

        popupEl.querySelector('.annotation-input-submit').addEventListener('click', function (e) {
            e.stopPropagation();
            var comment = textarea.value.trim();
            if (!comment) {
                textarea.focus();
                return;
            }
            addAnnotation(selectedText, comment);
            removePopup();
        });

        // Submit on Ctrl+Enter
        textarea.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                var comment = textarea.value.trim();
                if (comment) {
                    addAnnotation(selectedText, comment);
                    removePopup();
                }
            }
        });

        // Prevent mousedown from propagating (otherwise it would close via outside click)
        popupEl.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });

        setTimeout(function () {
            document.addEventListener('mousedown', onPopupOutsideClick);
        }, 0);
    }

    function removePopup() {
        if (popupEl && popupEl.parentNode) {
            popupEl.parentNode.removeChild(popupEl);
        }
        popupEl = null;
        document.removeEventListener('mousedown', onPopupOutsideClick);
    }

    function onPopupOutsideClick(e) {
        if (popupEl && !popupEl.contains(e.target)) {
            removePopup();
        }
    }

    function addAnnotation(selectedText, comment) {
        var id = 'ann-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        annotations.push({
            id: id,
            selectedText: selectedText,
            comment: comment,
            timestamp: Date.now()
        });
        activeId = id;
        saveAnnotations();
        renderPanel();
        highlightText(selectedText, id);
    }

    // ---- Text selection handler ----
    function onMouseUp(e) {
        if (!isFocusMode() || !isArticlePage()) return;

        // Don't trigger if clicking inside popups/panel
        if (popupEl && popupEl.contains(e.target)) return;
        if (panel && panel.contains(e.target)) return;

        var sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;

        var text = sel.toString().trim();
        if (!text || text.length < 2) return;

        // Check if the selection is within article content
        var content = document.querySelector('.article .content');
        if (!content) return;

        var range = sel.getRangeAt(0);
        if (!content.contains(range.commonAncestorContainer)) return;

        // Show popup near the selection
        var rect = range.getBoundingClientRect();
        var x = rect.left + window.scrollX;
        var y = rect.bottom + window.scrollY + 5;

        showSelectionPopup(x, y, text);
    }

    // ---- Click blank to deselect ----
    function onDocumentClick(e) {
        if (!activeId) return;
        if (panel && panel.contains(e.target)) return;
        if (popupEl && popupEl.contains(e.target)) return;

        // Check if clicking on annotation highlight
        if (e.target.classList && e.target.classList.contains('annotation-highlight')) return;

        activeId = null;
        clearHighlights();
        renderPanel();
    }

    // ---- Utilities ----
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function truncate(str, max) {
        return str.length > max ? str.substring(0, max) + '...' : str;
    }

    // ---- Visibility based on focus mode ----
    function updatePanelVisibility() {
        if (!panel) return;
        if (isFocusMode() && isArticlePage()) {
            panel.style.display = '';
        } else {
            panel.style.display = 'none';
        }
    }

    // ---- Initialize ----
    function init() {
        if (!isArticlePage()) return;

        annotations = loadAnnotations();

        // Wait for profile widget to be available
        var profileWidget = document.querySelector('.widget[data-type="profile"]');
        if (!profileWidget) {
            setTimeout(init, 200);
            return;
        }

        createPanel();
        updatePanelVisibility();

        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('click', onDocumentClick);

        // Watch for focus mode toggles
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'class') {
                    updatePanelVisibility();
                }
            }
        });
        observer.observe(document.body, { attributes: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Support PJAX
    document.addEventListener('pjax:complete', function () {
        // Clean up old state
        activeId = null;
        clearHighlights();
        removePopup();
        panel = null;
        setTimeout(init, 300);
    });
})();
