/**
 * Collapsible Blockquotes, Headings & PDF/Iframe Embeds
 * Adds a toggle button to markdown blockquotes (">"), headings (#, ##, ###, ####, #####),
 * and embedded PDFs/iframes so they can be collapsed/expanded by the reader.
 */
(function () {
    'use strict';

    var ARROW_EXPANDED = '\u25BC'; // ▼
    var ARROW_COLLAPSED = '\u25B6'; // ▶

    function initBlockquotes() {
        // Select blockquotes inside article content only
        var blockquotes = document.querySelectorAll('.article .content > blockquote, .article .content blockquote');
        for (var i = 0; i < blockquotes.length; i++) {
            var bq = blockquotes[i];
            // Skip if already initialized
            if (bq.getAttribute('data-collapsible')) continue;
            bq.setAttribute('data-collapsible', 'true');

            // Wrap blockquote content
            var wrapper = document.createElement('div');
            wrapper.className = 'bq-content';
            while (bq.firstChild) {
                wrapper.appendChild(bq.firstChild);
            }
            bq.appendChild(wrapper);

            // Create toggle button
            var toggle = document.createElement('span');
            toggle.className = 'bq-toggle';
            toggle.textContent = ARROW_EXPANDED;
            toggle.title = '\u6298\u53e0/\u5c55\u5f00'; // 折叠/展开
            bq.insertBefore(toggle, wrapper);

            // Add collapsed class styling
            bq.classList.add('bq-collapsible');

            // Bind click
            (function (bqEl, toggleEl) {
                toggleEl.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var isCollapsed = bqEl.classList.toggle('bq-collapsed');
                    toggleEl.textContent = isCollapsed ? ARROW_COLLAPSED : ARROW_EXPANDED;
                });
            })(bq, toggle);
        }
    }

    function getHeadingLevel(el) {
        var m = el.tagName.match(/^H(\d)$/i);
        return m ? parseInt(m[1], 10) : 0;
    }

    function initHeadings() {
        var container = document.querySelector('.article .content');
        if (!container) return;

        var headings = container.querySelectorAll('h1, h2, h3, h4, h5');
        for (var i = 0; i < headings.length; i++) {
            var heading = headings[i];
            // Skip if already initialized
            if (heading.getAttribute('data-collapsible')) continue;
            heading.setAttribute('data-collapsible', 'true');

            var level = getHeadingLevel(heading);

            // Collect all sibling elements that belong to this section
            // (everything until the next heading of the same or higher level)
            var sectionContent = [];
            var sibling = heading.nextElementSibling;
            while (sibling) {
                var sibLevel = getHeadingLevel(sibling);
                if (sibLevel > 0 && sibLevel <= level) break; // stop at same or higher level heading
                sectionContent.push(sibling);
                sibling = sibling.nextElementSibling;
            }

            // Only add toggle if there's content to collapse
            if (sectionContent.length === 0) continue;

            // Create wrapper for the section content
            var wrapper = document.createElement('div');
            wrapper.className = 'heading-section-content';
            // Insert wrapper after the heading
            heading.parentNode.insertBefore(wrapper, heading.nextSibling);
            // Move all section content into wrapper
            for (var j = 0; j < sectionContent.length; j++) {
                wrapper.appendChild(sectionContent[j]);
            }

            // Add toggle arrow to heading
            heading.classList.add('heading-collapsible');
            var toggle = document.createElement('span');
            toggle.className = 'heading-toggle';
            toggle.textContent = ARROW_EXPANDED;
            toggle.title = '\u6298\u53e0/\u5c55\u5f00'; // 折叠/展开
            heading.insertBefore(toggle, heading.firstChild);

            // Bind click on toggle
            (function (headingEl, toggleEl, wrapperEl) {
                toggleEl.addEventListener('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var isCollapsed = headingEl.classList.toggle('heading-collapsed');
                    toggleEl.textContent = isCollapsed ? ARROW_COLLAPSED : ARROW_EXPANDED;
                    wrapperEl.style.display = isCollapsed ? 'none' : '';
                });
            })(heading, toggle, wrapper);
        }
    }

    function initPdfEmbeds() {
        // Find iframes that are PDFs or within .video-container inside article content
        var container = document.querySelector('.article .content');
        if (!container) return;

        // Target: .video-container with iframes, and standalone iframes (PDF or general embeds)
        var iframes = container.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            var iframe = iframes[i];
            // Determine the wrapper element: .video-container parent or the iframe itself
            var target = iframe.closest('.video-container') || iframe;

            // Skip if already initialized
            if (target.getAttribute('data-pdf-collapsible')) continue;
            target.setAttribute('data-pdf-collapsible', 'true');

            // Determine label from iframe src
            var src = iframe.getAttribute('src') || '';
            var isPdf = /\.pdf/i.test(src) || /pdf/i.test(iframe.getAttribute('type') || '');
            var label = isPdf ? 'PDF' : '';

            // Try to get a title from the iframe or preceding text
            if (!label) {
                var title = iframe.getAttribute('title') || iframe.getAttribute('name') || '';
                if (title) {
                    label = title;
                } else {
                    // Extract filename from src
                    var match = src.match(/([^/]+)(\?|#|$)/);
                    if (match && match[1]) {
                        label = decodeURIComponent(match[1]);
                        if (label.length > 30) label = label.substring(0, 27) + '...';
                    }
                }
            }
            if (!label) label = 'Embed';

            // Create collapsible wrapper
            var wrapper = document.createElement('div');
            wrapper.className = 'pdf-collapsible';

            // Create header bar with toggle
            var header = document.createElement('div');
            header.className = 'pdf-collapsible-header';
            header.innerHTML = '<span class="pdf-collapsible-toggle">' + ARROW_EXPANDED + '</span>' +
                '<i class="fas fa-file-pdf pdf-collapsible-icon"></i>' +
                '<span class="pdf-collapsible-label">' + label + '</span>';

            // Create content container
            var content = document.createElement('div');
            content.className = 'pdf-collapsible-content';

            // Insert wrapper before target, move target into content
            target.parentNode.insertBefore(wrapper, target);
            content.appendChild(target);
            wrapper.appendChild(header);
            wrapper.appendChild(content);

            // Bind click
            (function (wrapperEl, headerEl, contentEl) {
                var toggleEl = headerEl.querySelector('.pdf-collapsible-toggle');
                headerEl.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var isCollapsed = wrapperEl.classList.toggle('pdf-collapsed');
                    toggleEl.textContent = isCollapsed ? ARROW_COLLAPSED : ARROW_EXPANDED;
                    contentEl.style.display = isCollapsed ? 'none' : '';
                });
            })(wrapper, header, content);
        }
    }

    function initAll() {
        initBlockquotes();
        initHeadings();
        initPdfEmbeds();
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // Support PJAX: re-init on page navigation
    document.addEventListener('pjax:complete', function () {
        setTimeout(initAll, 200);
    });
})();
