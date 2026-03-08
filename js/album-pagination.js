/**
 * Album pagination functionality
 * Loads 10 images at a time with a "Load More" button
 */
(function() {
    const IMAGES_PER_PAGE = 10;
    let currentPage = 0;

    function initAlbumPagination() {
        const $gallery = $('.justified-gallery');
        if ($gallery.length === 0) {
            return; // Not on album page
        }

        // Wait for main.js to wrap images with <a> tags
        setTimeout(function() {
            // Get all gallery items (images wrapped in <a> tags by main.js)
            const $items = $gallery.find('.gallery-item');
            const totalImages = $items.length;

            if (totalImages === 0) {
                // If no gallery items yet, try with plain images
                const $images = $gallery.find('img');
                if ($images.length === 0) {
                    return;
                }
                // Mark images for easier selection
                $images.each(function(index) {
                    $(this).attr('data-album-index', index);
                });
            } else {
                // Mark gallery items for easier selection
                $items.each(function(index) {
                    $(this).attr('data-album-index', index);
                });
            }

            // Get all items to paginate (either .gallery-item or img)
            let $allItems = $items.length > 0 ? $items : $gallery.find('img');
            const total = $allItems.length;

            // Hide all items initially
            $allItems.hide();

            // Create load more button
            const $loadMoreBtn = $('<div class="has-text-centered" style="margin-top: 2rem;">' +
                '<button class="button is-primary load-more-btn">' +
                '<span class="icon"><i class="fas fa-images"></i></span>' +
                '<span>继续加载</span>' +
                '</button>' +
                '</div>');

            $gallery.after($loadMoreBtn);

            function loadMoreImages() {
                const startIndex = currentPage * IMAGES_PER_PAGE;
                const endIndex = Math.min(startIndex + IMAGES_PER_PAGE, total);

                // Show next batch of items
                for (let i = startIndex; i < endIndex; i++) {
                    $allItems.eq(i).fadeIn(300);
                }

                currentPage++;

                // Re-initialize justified gallery after images are shown
                setTimeout(function() {
                    if (typeof $.fn.justifiedGallery === 'function') {
                        $gallery.justifiedGallery('norewind');
                    }

                    // Re-initialize lightGallery if available
                    if (typeof $.fn.lightGallery === 'function') {
                        $('.article').lightGallery('destroy');
                        $('.article').lightGallery({selector: '.gallery-item'});
                    }
                }, 350);

                // Hide button if all images are loaded
                if (endIndex >= total) {
                    $loadMoreBtn.fadeOut(300);
                }
            }

            // Load first batch
            loadMoreImages();

            // Bind click event to load more button
            $loadMoreBtn.find('.load-more-btn').on('click', function() {
                loadMoreImages();
            });
        }, 200); // Wait for main.js to process images
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        initAlbumPagination();
    });
})();
