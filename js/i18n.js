/**
 * Client-side i18n language switcher
 * Detects browser language and swaps UI text between zh-CN and en
 */
(function () {
    var en = {
        common: {
            archive: 'Archives',
            category: 'Categories',
            tag: 'Tags',
            post: 'Posts',
            page: 'Pages',
            prev: 'Prev',
            next: 'Next'
        },
        widget: {
            follow: 'Github',
            recents: 'Recent Posts',
            links: 'Links',
            catalogue: 'Contents',
            recommend_posts: 'Recommended',
            related_posts: 'Related Posts',
            latest_comment: 'Latest Comments',
            latest_comment_tip: 'Loading latest comments...',
            hot_recommend: 'Hot',
            hot_recommend_tip: 'Loading...',
            hitokoto_loading: ':D Loading quote...',
            view_all: 'View All >>'
        },
        article: {
            more: 'Read More >>',
            comments: 'Comments',
            comments_closed: 'Comments are closed.',
            last_modified: 'Last Modified:'
        },
        plugin: {
            backtotop: 'Back to Top'
        },
        search: {
            search: 'Search',
            hint: 'Search...',
            no_result: 'No results found',
            untitled: '(Untitled)',
            empty_preview: '(No preview available)',
            posts: 'Posts',
            pages: 'Pages',
            categories: 'Categories',
            tags: 'Tags'
        },
        nav: {
            '机器学习': 'ML',
            '杂谈': 'Blog',
            '项目': 'Projects',
            '美食与日常': 'Life',
            '分类': 'Categories',
            '关于': 'About',
            '音乐': 'Music',
            '相册': 'Album',
            '自用': 'Tools',
            '网盘': 'Drive'
        },
        cat: {
            '机器学习': 'ML',
            '杂谈': 'Blog',
            '项目': 'Projects',
            '美食与日常': 'Life',
            '学习': 'Study',
            '技术': 'Tech',
            '书籍': 'Books',
            '其他': 'Others',
            '工具': 'Tools',
            '影视推荐': 'Movies & Shows',
            '散': 'Prose',
            '游戏': 'Games',
            '电子书': 'E-books',
            '网盘': 'Drive',
            '视频': 'Videos',
            '软件': 'Software',
            '阅读经验': 'Reading',
            '集': 'Collection',
            '饮食': 'Food',
            'hexo': 'Hexo',
            'bat': 'bat'
        },
        tag: {
            'MD编辑器': 'MD Editor',
            '书籍': 'Books',
            '俄罗斯方块': 'Tetris',
            '其他': 'Others',
            '图片浏览器': 'Image Viewer',
            '开发工具': 'Dev Tools',
            '录像软件': 'Screen Recorder',
            '浏览器': 'Browser',
            '经验': 'Tips',
            '网站': 'Websites',
            '阅读软件': 'Reading Apps'
        },
        personal: {
            location: 'Solar System, Earth'
        }
    };

    function getTranslation(key) {
        return key.split('.').reduce(function (o, k) { return o && o[k]; }, en);
    }

    function getLang() {
        var saved = localStorage.getItem('blog_lang');
        if (saved) return saved;
        var bl = navigator.language || navigator.userLanguage || 'zh-CN';
        return bl.startsWith('zh') ? 'zh-CN' : 'en';
    }

    // Expose globally for other scripts
    window._getLang = getLang;
    window._i18nData = en;

    function translatePage() {
        if (getLang() !== 'en') return;

        // Translate elements with data-i18n attribute
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var key = els[i].getAttribute('data-i18n');
            var t = getTranslation(key);
            if (t) {
                // For elements that had "# " prefix in recommend titles
                if (key === 'widget.related_posts' || key === 'widget.recommend_posts') {
                    els[i].textContent = '# ' + t;
                } else {
                    els[i].textContent = t;
                }
            }
        }

        // Translate navbar menu items and link titles
        var navEls = document.querySelectorAll('[data-i18n-nav]');
        for (var j = 0; j < navEls.length; j++) {
            var zhName = navEls[j].getAttribute('data-i18n-nav');
            var navT = en.nav[zhName];
            if (navT) {
                // If has icon child, only update title attribute
                if (navEls[j].querySelector('i')) {
                    navEls[j].setAttribute('title', navT);
                } else {
                    navEls[j].textContent = navT;
                }
            }
        }

        // Translate category names (via data attribute)
        var catEls = document.querySelectorAll('[data-i18n-cat]');
        for (var ci = 0; ci < catEls.length; ci++) {
            var zhCat = catEls[ci].getAttribute('data-i18n-cat');
            var catT = en.cat[zhCat];
            if (catT) {
                catEls[ci].textContent = catT;
            }
        }

        // Translate tag names (via data attribute)
        var tagEls = document.querySelectorAll('[data-i18n-tag]');
        for (var ti = 0; ti < tagEls.length; ti++) {
            var zhTag = tagEls[ti].getAttribute('data-i18n-tag');
            var tagT = en.tag[zhTag];
            if (tagT) {
                tagEls[ti].textContent = tagT;
            }
        }

        // Translate /categories/ and /tags/ listing pages (external hexo-component-inferno widgets)
        translateListingPages();

        // Translate search UI
        translateSearchUI();

        // Translate archive calendar title
        translateArchiveCalendar();

        // Translate pagination (from hexo-component-inferno paginator)
        var pagEls = document.querySelectorAll('.pagination-previous, .pagination-next');
        for (var k = 0; k < pagEls.length; k++) {
            var txt = pagEls[k].textContent.trim();
            if (txt === '上一页') pagEls[k].textContent = 'Prev';
            if (txt === '下一页') pagEls[k].textContent = 'Next';
        }

        // Translate footer copyright description
        var footerCopy = document.getElementById('footer-copyright');
        if (footerCopy) {
            footerCopy.innerHTML = '\u00a9 Disclaimer: [All content on this site is collected from the Internet or created by the author,<br />&nbsp;&nbsp;&nbsp;&nbsp;for learning and sharing purposes. If there is any infringement, please <a href="/message" target="_blank">contact us</a> for immediate removal]<br />';
        }

        // Translate footer visitor counter
        var footerVisitor = document.getElementById('footer-visitor');
        if (footerVisitor) {
            footerVisitor.innerHTML = footerVisitor.innerHTML
                .replace('感谢', 'Thanks to')
                .replace('小伙伴的', 'visitors for')
                .replace('次光临！', 'views!');
        }

        // Translate footer website uptime (override createTime with English template)
        if (typeof window.createTime === 'function') {
            window.createTime = function (time) {
                var n = new Date(time);
                now.setTime(now.getTime() + 250);
                var days = (now - n) / 1e3 / 60 / 60 / 24,
                    dnum = Math.floor(days),
                    hours = (now - n) / 1e3 / 60 / 60 - 24 * dnum,
                    hnum = Math.floor(hours),
                    minutes, mnum, seconds, snum;
                if (String(hnum).length === 1) hnum = '0' + hnum;
                minutes = (now - n) / 1e3 / 60 - 1440 * dnum - 60 * hnum;
                mnum = Math.floor(minutes);
                if (String(mnum).length === 1) mnum = '0' + mnum;
                seconds = (now - n) / 1e3 - 86400 * dnum - 3600 * hnum - 60 * mnum;
                snum = Math.round(seconds);
                if (String(snum).length === 1) snum = '0' + snum;
                document.getElementById('statistic-times').innerHTML =
                    '\u2764\ufe0f Online since <strong>' + time.split(' ')[0].replace(/\//g, '.') +
                    '</strong> for <strong>' + dnum +
                    '</strong> days <strong>' + hnum +
                    '</strong> hours <strong>' + mnum +
                    '</strong> min <strong>' + snum +
                    '</strong> sec! \u2764\ufe0f';
            };
        }

        // Translate personal text (location) in English mode
        var personalEls = document.querySelectorAll('[data-i18n-personal]');
        for (var pi = 0; pi < personalEls.length; pi++) {
            var pKey = personalEls[pi].getAttribute('data-i18n-personal');
            var pT = en.personal && en.personal[pKey];
            if (pT) {
                var span = personalEls[pi].querySelector('span');
                if (span) {
                    span.textContent = pT;
                } else {
                    personalEls[pi].textContent = pT;
                }
            }
        }

        // Translate back-to-top button title
        var btt = document.getElementById('back-to-top');
        if (btt) btt.setAttribute('title', 'Back to Top');

        // Update html lang attribute
        document.documentElement.lang = 'en';
    }

    // Translate /categories/ and /tags/ listing pages rendered by external hexo-component-inferno
    function translateListingPages() {
        // Category listing page: category names appear as link text
        var catLinks = document.querySelectorAll('.category-list-link');
        for (var i = 0; i < catLinks.length; i++) {
            var name = catLinks[i].textContent.trim();
            if (en.cat[name]) catLinks[i].textContent = en.cat[name];
        }
        // Tag listing page: tag names appear as link text
        var tagLinks = document.querySelectorAll('.tag-list-link');
        for (var j = 0; j < tagLinks.length; j++) {
            var tname = tagLinks[j].textContent.trim();
            if (en.tag[tname]) tagLinks[j].textContent = en.tag[tname];
        }
        // Also translate category names in timeline (archive page ArticleMedia)
        var timelineCats = document.querySelectorAll('.timeline .media-content a');
        for (var m = 0; m < timelineCats.length; m++) {
            var cname = timelineCats[m].textContent.trim();
            if (en.cat[cname]) timelineCats[m].textContent = en.cat[cname];
        }
    }

    // Translate insight search box UI
    function translateSearchUI() {
        var searchMap = {
            '文章': en.search.posts,
            '页面': en.search.pages,
            '分类': en.search.categories,
            '标签': en.search.tags
        };
        // Search input placeholder
        var searchInput = document.querySelector('.searchbox-input');
        if (searchInput && searchInput.placeholder) {
            searchInput.placeholder = en.search.hint;
        }
        // Search result section headers
        var headers = document.querySelectorAll('.searchbox-result-section header');
        for (var i = 0; i < headers.length; i++) {
            var h = headers[i].textContent.trim();
            if (searchMap[h]) headers[i].textContent = searchMap[h];
        }
        // Observe searchbox for dynamically added content
        var searchbox = document.querySelector('.searchbox');
        if (searchbox && !searchbox._i18nObserver) {
            searchbox._i18nObserver = new MutationObserver(function () {
                var input = searchbox.querySelector('.searchbox-input');
                if (input && input.placeholder !== en.search.hint) {
                    input.placeholder = en.search.hint;
                }
                var sHeaders = searchbox.querySelectorAll('.searchbox-result-section header');
                for (var si = 0; si < sHeaders.length; si++) {
                    var sh = sHeaders[si].textContent.trim();
                    if (searchMap[sh]) sHeaders[si].textContent = searchMap[sh];
                }
                // Category/tag names in search results
                var resultItems = searchbox.querySelectorAll('.searchbox-result-item');
                for (var ri = 0; ri < resultItems.length; ri++) {
                    var titleEl = resultItems[ri].querySelector('.searchbox-result-title');
                    if (titleEl) {
                        var tText = titleEl.textContent.trim();
                        if (en.cat[tText]) titleEl.textContent = en.cat[tText];
                        if (en.tag[tText]) titleEl.textContent = en.tag[tText];
                    }
                }
            });
            searchbox._i18nObserver.observe(searchbox, { childList: true, subtree: true });
        }
    }

    // Translate archive page echarts calendar title
    function translateArchiveCalendar() {
        var calendarEl = document.getElementById('post-calendar');
        if (calendarEl && typeof echarts !== 'undefined') {
            var chart = echarts.getInstanceByDom(calendarEl);
            if (chart) {
                chart.setOption({ title: { text: 'Post Calendar' } });
            }
        }
    }

    // Run on initial page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', translatePage);
    } else {
        translatePage();
    }

    // Expose for PJAX re-translation and toggle
    window._i18nTranslate = translatePage;
    window.toggleLanguage = function () {
        var current = getLang();
        var next = current === 'en' ? 'zh-CN' : 'en';
        localStorage.setItem('blog_lang', next);
        location.reload();
    };
})();
