// qr-digital-menu-system/frontend/js/menu_display.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search); // Add this line
    const publicSlug = urlParams.get('slug');


    const menuTitle = document.getElementById('menuTitle');
    const storeHeaderInfo = document.getElementById('storeHeaderInfo');
    const storeLogoImg = document.getElementById('storeLogo');
    const storeNameElem = document.getElementById('storeName');
    const categoryTabs = document.getElementById('categoryTabs');
    const menuContent = document.getElementById('menuContent');
    const loadingMessage = document.getElementById('loadingMessage');
    const noMenuMessage = document.getElementById('noMenuMessage');
    const searchMenuInput = document.getElementById('searchMenuInput');
    const noSearchResultsMessage = document.getElementById('noSearchResultsMessage');

    const imagePopupModal = document.getElementById('imagePopupModal');
    const popupImage = document.getElementById('popupImage');
    const closeImagePopupBtn = document.getElementById('closeImagePopupBtn');
    const popupProductName = document.getElementById('popupProductName');
    const popupProductDescription = document.getElementById('popupProductDescription');
    const popupProductPrice = document.getElementById('popupProductPrice'); // NEW: Reference to the price element

    const storeInfoModal = document.getElementById('storeInfoModal');
    const closeStoreInfoBtn = document.getElementById('closeStoreInfoBtn');
    const modalStoreLogo = document.getElementById('modalStoreLogo');
    const modalStoreName = document.getElementById('modalStoreName');
    const modalStoreDescription = document.getElementById('modalStoreDescription');
    const modalStorePhone = document.getElementById('modalStorePhone').querySelector('span');
    const modalStoreAddress = document.getElementById('modalStoreAddress').querySelector('span');
    const socialFacebook = document.getElementById('socialFacebook');
    const socialTelegram = document.getElementById('socialTelegram');
    const socialTikTok = document.getElementById('socialTikTok');
    const socialWebsite = document.getElementById('socialWebsite');

    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');

    let allProducts = [];
    let allCategories = []; // Store all categories fetched initially
    let currentStoreData = null;
    let currentView = 'grid'; // Default view

  if (!publicSlug) { // Now correctly checking for publicSlug
        menuTitle.textContent = 'Menu Not Found';
        storeNameElem.textContent = 'Error: No Store ID provided.';
        loadingMessage.classList.add('hidden');
        noMenuMessage.textContent = 'Please scan a valid QR code.';
        noMenuMessage.classList.remove('hidden');
        console.error('No publicUrlId found in URL for menu display.');
        return;
    }

    try {
        // Fetch store details using publicUrlId
       currentStoreData = await apiRequest(`/stores/public/slug/${publicSlug}`, 'GET', null, false);
        menuTitle.textContent = `${currentStoreData.name}'s Menu`;
        storeNameElem.textContent = currentStoreData.name;

        if (currentStoreData.logo) {
            storeLogoImg.src = currentStoreData.logo;
            storeLogoImg.style.display = 'block';
        } else {
            storeLogoImg.src = '';
            storeLogoImg.style.display = 'none';
        }

        // Fetch categories and products using the actual MongoDB _id from currentStoreData
        // The backend routes for categories and products still expect the MongoDB _id
        allCategories = await apiRequest(`/categories/store/${currentStoreData._id}`, 'GET', null, false);
      allProducts = await apiRequest(`/products/public-store/slug/${publicSlug}`, 'GET', null, false); // Use publicUrlId for products API

        loadingMessage.classList.add('hidden');

        if (allProducts.length === 0) {
            noMenuMessage.classList.remove('hidden');
            return;
        }

        // Render Category Tabs
        function renderCategoryTabs(categoriesToRender, activeTabId = 'all-items') {
            categoryTabs.innerHTML = '';

            // Add "All" tab
            const allLi = document.createElement('li');
            const allA = document.createElement('a');
            allA.href = `#all-items`;
            allA.textContent = 'All';
            allA.classList.add('block', 'py-2', 'px-4', 'text-gray-700', 'font-medium', 'border-b-2', 'border-transparent', 'hover:border-orange-500', 'hover:text-orange-600', 'transition', 'duration-300');
            allA.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveCategoryTab('all-items');
                renderMenuContent(allProducts, allCategories); // Show all products
                // Use a try-catch block to gracefully handle if the element doesn't exist
                try {
                    document.querySelector('#all-items-section').scrollIntoView({ behavior: 'smooth' });
                } catch (error) {
                    console.warn("Element #all-items-section not found for scrolling.", error);
                }
            });
            allLi.appendChild(allA);
            categoryTabs.appendChild(allLi);

            // Add other category tabs
            categoriesToRender.forEach((category) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#cat-${category._id}`;
                a.textContent = category.name;
                a.classList.add('block', 'py-2', 'px-4', 'text-gray-700', 'font-medium', 'border-b-2', 'border-transparent', 'hover:border-orange-500', 'hover:text-orange-600', 'transition', 'duration-300');
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    setActiveCategoryTab(`cat-${category._id}`);
                    const productsInCategory = allProducts.filter(product => product.category && product.category._id === category._id);
                    renderMenuContent(productsInCategory, [category]); // Show only products for this category
                    // Use a try-catch block to gracefully handle if the element doesn't exist
                    try {
                        document.querySelector(a.hash).scrollIntoView({ behavior: 'smooth' });
                    } catch (error) {
                        console.warn(`Element ${a.hash} not found for scrolling.`, error);
                    }
                });
                li.appendChild(a);
                categoryTabs.appendChild(li);
            });

            // Set active tab
            setActiveCategoryTab(activeTabId);
        }

        // Helper function to set the active category tab
        function setActiveCategoryTab(tabId) {
            document.querySelectorAll('#categoryTabs a').forEach(tab => {
                tab.classList.remove('border-orange-600', 'text-orange-600');
            });
            const activeTab = document.querySelector(`#categoryTabs a[href="#${tabId}"]`);
            if (activeTab) {
                activeTab.classList.add('border-orange-600', 'text-orange-600');
            }
        }

        // Render Menu Content based on current view and filtered products/categories
        function renderMenuContent(productsToRender, categoriesToRender) {
            menuContent.innerHTML = '';
            noSearchResultsMessage.classList.add('hidden');

            if (productsToRender.length === 0) {
                noSearchResultsMessage.classList.remove('hidden');
                return;
            }

            // If "All" tab is active or search is active, show all products in one section
            const isAllOrSearch = categoriesToRender.length === allCategories.length || searchMenuInput.value.trim() !== '';

            if (isAllOrSearch) {
                const allItemsSection = document.createElement('section');
                allItemsSection.id = 'all-items-section'; // Unique ID for the 'All' section
                allItemsSection.classList.add('mb-8');

                const allItemsTitle = document.createElement('h2');
                allItemsTitle.classList.add('text-2xl', 'font-bold', 'text-gray-800', 'mb-4', 'pb-2', 'border-b', 'border-orange-500', 'sticky', 'top-0', 'bg-gray-100', 'z-10', 'py-2');
                allItemsTitle.textContent = searchMenuInput.value.trim() !== '' ? 'Search Results' : 'All Items';
                allItemsSection.appendChild(allItemsTitle);

                if (currentView === 'grid') {
                    const productGrid = document.createElement('div');
                    productGrid.classList.add('grid', 'grid-cols-2', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'gap-4');
                    productsToRender.forEach(product => {
                        productGrid.appendChild(createProductGridCard(product));
                    });
                    allItemsSection.appendChild(productGrid);
                } else { // List View
                    const productList = document.createElement('div');
                    productList.classList.add('divide-y', 'divide-gray-200');
                    productsToRender.forEach(product => {
                        productList.appendChild(createProductListItem(product));
                    });
                    allItemsSection.appendChild(productList);
                }
                menuContent.appendChild(allItemsSection);

            } else {
                // Render by category if a specific category tab is active and no search term
                categoriesToRender.forEach(category => {
                    const categorySection = document.createElement('section');
                    categorySection.id = `cat-${category._id}`;
                    categorySection.classList.add('mb-8');

                    const categoryTitle = document.createElement('h2');
                    categoryTitle.classList.add('text-2xl', 'font-bold', 'text-gray-800', 'mb-4', 'pb-2', 'border-b', 'border-orange-500', 'sticky', 'top-0', 'bg-gray-100', 'z-10', 'py-2');
                    categoryTitle.textContent = category.name;
                    categorySection.appendChild(categoryTitle);

                    const productsInCategory = productsToRender.filter(product => product.category && product.category._id === category._id);

                    if (productsInCategory.length === 0) {
                        const noItemsMessage = document.createElement('p');
                        noItemsMessage.classList.add('text-gray-500', 'text-center', 'col-span-full');
                        noItemsMessage.textContent = 'No items in this category yet.';
                        categorySection.appendChild(noItemsMessage);
                    } else {
                        if (currentView === 'grid') {
                            const productGrid = document.createElement('div');
                            productGrid.classList.add('grid', 'grid-cols-2', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'gap-4');
                            productsInCategory.forEach(product => {
                                productGrid.appendChild(createProductGridCard(product));
                            });
                            categorySection.appendChild(productGrid);
                        } else { // List View
                            const productList = document.createElement('div');
                            productList.classList.add('divide-y', 'divide-gray-200');
                            productsInCategory.forEach(product => {
                                productList.appendChild(createProductListItem(product));
                            });
                            categorySection.appendChild(productList);
                        }
                    }
                    menuContent.appendChild(categorySection);
                });
            }
        }

        // Helper function to create a product card for grid view
        function createProductGridCard(product) {
            const productCard = document.createElement('div');
            productCard.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'flex', 'flex-col', 'cursor-pointer');

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('product-image-container');
            const defaultImage = `https://placehold.co/400x400/e2e8f0/64748b?text=No+Image`;
            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image;
                img.alt = product.title;
                img.classList.add('product-image');
                imgContainer.appendChild(img);
            } else {
                const placeholderImg = document.createElement('img');
                placeholderImg.src = defaultImage;
                placeholderImg.alt = 'No Image Available';
                placeholderImg.classList.add('product-image');
                imgContainer.appendChild(placeholderImg);
            }
            productCard.appendChild(imgContainer);

            const cardContent = document.createElement('div');
            cardContent.classList.add('p-3', 'flex-grow', 'flex', 'flex-col', 'justify-between');

            const title = document.createElement('h3');
            title.classList.add('text-base', 'font-semibold', 'text-gray-800', 'mb-1');
            title.textContent = product.title;
            cardContent.appendChild(title);

            if (product.description) {
                const description = document.createElement('p');
                description.classList.add('text-gray-600', 'text-xs', 'mb-2', 'line-clamp-2');
                description.textContent = product.description;
                cardContent.appendChild(description);
            }

            if (product.price !== undefined && product.price !== null && product.price !== '') {
                const price = document.createElement('p');
                price.classList.add('text-orange-600', 'font-bold', 'text-md');
                price.textContent = product.price; // Display price as string
                cardContent.appendChild(price);
            }

            productCard.appendChild(cardContent);

            productCard.addEventListener('click', () => {
                // Pass product.price to openImagePopup
                openImagePopup(product.image || defaultImage, product.title, product.description, product.price);
            });
            return productCard;
        }

        // Helper function to create a product item for list view
        function createProductListItem(product) {
            const listItem = document.createElement('div');
            listItem.classList.add('product-list-item');

            const defaultImage = `https://placehold.co/60x60/e2e8f0/64748b?text=No+Img`;

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('list-image-container');
            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image;
                img.alt = product.title;
                img.classList.add('list-image');
                imgContainer.appendChild(img);
            } else {
                const placeholderImg = document.createElement('img');
                placeholderImg.src = defaultImage;
                placeholderImg.alt = 'No Image Available';
                placeholderImg.classList.add('list-image');
                imgContainer.appendChild(placeholderImg);
            }
            listItem.appendChild(imgContainer);

            const listContent = document.createElement('div');
            listContent.classList.add('list-content');

            const title = document.createElement('h3');
            title.textContent = product.title;
            listContent.appendChild(title);

            if (product.description) {
                const description = document.createElement('p');
                description.textContent = product.description;
                listContent.appendChild(description);
            }
            listItem.appendChild(listContent);

            if (product.price !== undefined && product.price !== null && product.price !== '') {
                const price = document.createElement('p');
                price.classList.add('list-price');
                price.textContent = product.price; // Display price as string
                listItem.appendChild(price);
            }

            listItem.addEventListener('click', () => {
                // Pass product.price to openImagePopup
                openImagePopup(product.image || defaultImage, product.title, product.description, product.price);
            });
            return listItem;
        }


        // Image popup functions
        function openImagePopup(imageUrl, productName, productDescription, productPrice) { // NEW: Added productPrice parameter
            popupImage.src = imageUrl;
            popupProductName.textContent = productName;
            popupProductDescription.textContent = productDescription || 'No description available.';
            
            // NEW: Set the price in the popup
            if (productPrice !== undefined && productPrice !== null && productPrice !== '') {
                popupProductPrice.textContent = productPrice;
                popupProductPrice.classList.remove('hidden');
            } else {
                popupProductPrice.textContent = '';
                popupProductPrice.classList.add('hidden');
            }

            imagePopupModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeImagePopup() {
            imagePopupModal.classList.add('hidden');
            popupImage.src = '';
            popupProductName.textContent = '';
            popupProductDescription.textContent = '';
            popupProductPrice.textContent = ''; // Clear price
            popupProductPrice.classList.add('hidden'); // Hide price
            document.body.style.overflow = '';
        }


        // Store Info popup functions
        function openStoreInfoPopup() {
            if (!currentStoreData) return;

            if (currentStoreData.logo) {
                modalStoreLogo.src = currentStoreData.logo;
                modalStoreLogo.style.display = 'block';
            } else {
                modalStoreLogo.src = '';
                modalStoreLogo.style.display = 'none';
            }
            modalStoreName.textContent = currentStoreData.name || 'N/A';
            modalStoreDescription.textContent = currentStoreData.description || 'មិនមានការពិពណ៌នាទេ។';
            modalStorePhone.textContent = currentStoreData.phone || 'N/A';
            modalStoreAddress.textContent = currentStoreData.address || 'N/A';

            if (currentStoreData.facebookUrl) {
                socialFacebook.href = currentStoreData.facebookUrl;
                socialFacebook.classList.remove('hidden');
            } else { socialFacebook.classList.add('hidden'); }
            
            if (currentStoreData.telegramUrl) {
                socialTelegram.href = currentStoreData.telegramUrl;
                socialTelegram.classList.remove('hidden');
            } else { socialTelegram.classList.add('hidden'); }

            if (currentStoreData.tiktokUrl) {
                socialTikTok.href = currentStoreData.tiktokUrl;
                socialTikTok.classList.remove('hidden');
            } else { socialTikTok.classList.add('hidden'); }

            if (currentStoreData.websiteUrl) {
                socialWebsite.href = currentStoreData.websiteUrl;
                socialWebsite.classList.remove('hidden');
            } else { socialWebsite.classList.add('hidden'); }


            storeInfoModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeStoreInfoPopup() {
            storeInfoModal.classList.add('hidden');
            document.body.style.overflow = '';
        }


        // Event listeners for popup close
        if (closeImagePopupBtn) {
            closeImagePopupBtn.addEventListener('click', closeImagePopup);
        }
        if (closeStoreInfoBtn) {
            closeStoreInfoBtn.addEventListener('click', closeStoreInfoPopup);
        }

        // Close popup if clicking on the overlay itself
        if (imagePopupModal) {
            imagePopupModal.addEventListener('click', (e) => {
                if (e.target === imagePopupModal) {
                    closeImagePopup();
                }
            });
        }
        if (storeInfoModal) {
            storeInfoModal.addEventListener('click', (e) => {
                if (e.target === storeInfoModal) {
                    closeStoreInfoPopup();
                }
            });
        }

        // Event listener for store header (logo/name) click
        if (storeHeaderInfo) {
            storeHeaderInfo.addEventListener('click', openStoreInfoPopup);
        }

        // View Toggle Event Listeners
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                currentView = 'grid';
                gridViewBtn.classList.add('text-orange-600');
                listViewBtn.classList.remove('text-orange-600');
                listViewBtn.classList.add('text-gray-400');
                // Re-render with current filters (from search input)
                const searchTerm = searchMenuInput.value.toLowerCase();
                if (searchTerm) {
                    const filteredProducts = allProducts.filter(product =>
                        product.title.toLowerCase().includes(searchTerm) ||
                        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                        (product.category && product.category.name.toLowerCase().includes(searchTerm))
                    );
                    renderMenuContent(filteredProducts, allCategories); // Search results always show all
                } else {
                    // If no search term, render based on currently active category tab (which could be 'All')
                    const activeTabHref = document.querySelector('#categoryTabs a.text-orange-600')?.getAttribute('href');
                    if (activeTabHref === '#all-items') {
                        renderMenuContent(allProducts, allCategories);
                    } else if (activeTabHref) {
                        const categoryId = activeTabHref.replace('#cat-', '');
                        const category = allCategories.find(cat => cat._id === categoryId);
                        const productsInCategory = allProducts.filter(product => product.category && product.category._id === categoryId);
                        renderMenuContent(productsInCategory, category ? [category] : []);
                    } else {
                        renderMenuContent(allProducts, allCategories); // Fallback to all if no active tab
                    }
                }
            });
        }

        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                currentView = 'list';
                listViewBtn.classList.add('text-orange-600');
                gridViewBtn.classList.remove('text-orange-600');
                gridViewBtn.classList.add('text-gray-400');
                // Re-render with current filters (from search input)
                const searchTerm = searchMenuInput.value.toLowerCase();
                if (searchTerm) {
                    const filteredProducts = allProducts.filter(product =>
                        product.title.toLowerCase().includes(searchTerm) ||
                        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                        (product.category && product.category.name.toLowerCase().includes(searchTerm))
                    );
                    renderMenuContent(filteredProducts, allCategories); // Search results always show all
                } else {
                    const activeTabHref = document.querySelector('#categoryTabs a.text-orange-600')?.getAttribute('href');
                    if (activeTabHref === '#all-items') {
                        renderMenuContent(allProducts, allCategories);
                    } else if (activeTabHref) {
                        const categoryId = activeTabHref.replace('#cat-', '');
                        const category = allCategories.find(cat => cat._id === categoryId);
                        const productsInCategory = allProducts.filter(product => product.category && product.category._id === categoryId);
                        renderMenuContent(productsInCategory, category ? [category] : []);
                    } else {
                        renderMenuContent(allProducts, allCategories); // Fallback to all if no active tab
                    }
                }
            });
        }

        // Initial render
        renderCategoryTabs(allCategories, 'all-items'); // Set 'All' as active initially
        renderMenuContent(allProducts, allCategories); // Show all products initially

        // Search functionality
        searchMenuInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = allProducts.filter(product =>
                product.title.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.name.toLowerCase().includes(searchTerm))
            );

            // When searching, we always show all filtered products, not grouped by category
            // So, pass allCategories to renderCategoryTabs to ensure all relevant tabs are shown
            // And pass allCategories to renderMenuContent to indicate we're not filtering by a single category
            renderCategoryTabs(allCategories, 'all-items'); // Keep 'All' tab active during search
            renderMenuContent(filteredProducts, allCategories); // Pass allCategories to trigger 'All Items' rendering logic
        });


    } catch (error) {
        console.error('Error fetching menu:', error.message);
        loadingMessage.classList.add('hidden');
        noMenuMessage.textContent = `Failed to load menu: ${error.message}`;
        noMenuMessage.classList.remove('hidden');
        menuTitle.textContent = 'Menu Load Error';
        storeNameElem.textContent = 'Error loading menu details.';
        storeLogoImg.style.display = 'none';
    }
});
