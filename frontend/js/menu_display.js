
// qr-digital-menu-system/frontend/js/menu_display.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');

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
    let currentStoreData = null;
    let currentView = 'grid'; // Default view

    if (!storeId) {
        menuTitle.textContent = 'Menu Not Found';
        storeNameElem.textContent = 'Error: No Store ID provided.';
        loadingMessage.classList.add('hidden');
        noMenuMessage.textContent = 'Please scan a valid QR code.';
        noMenuMessage.classList.remove('hidden');
        console.error('No storeId found in URL for menu display.');
        return;
    }

    try {
        currentStoreData = await apiRequest(`/stores/${storeId}`, 'GET', null, false);
        menuTitle.textContent = `${currentStoreData.name}'s Menu`;
        storeNameElem.textContent = currentStoreData.name;

        if (currentStoreData.logo) {
            storeLogoImg.src = currentStoreData.logo;
            storeLogoImg.style.display = 'block';
        } else {
            storeLogoImg.src = '';
            storeLogoImg.style.display = 'none';
        }

        const categories = await apiRequest(`/categories/store/${storeId}`, 'GET', null, false);
        allProducts = await apiRequest(`/products/store/${storeId}`, 'GET', null, false);

        loadingMessage.classList.add('hidden');

        if (allProducts.length === 0) {
            noMenuMessage.classList.remove('hidden');
            return;
        }

        // Render Category Tabs
        function renderCategoryTabs(categoriesToRender) {
            categoryTabs.innerHTML = '';
            if (categoriesToRender.length > 0) {
                categoriesToRender.forEach((category, index) => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    // FIX: Prepend 'cat-' to category._id to make it a valid CSS selector
                    a.href = `#cat-${category._id}`;
                    a.textContent = category.name;
                    a.classList.add('block', 'py-2', 'px-4', 'text-gray-700', 'font-medium', 'border-b-2', 'border-transparent', 'hover:border-orange-500', 'hover:text-orange-600', 'transition', 'duration-300');
                    if (index === 0) {
                        a.classList.add('border-orange-600', 'text-orange-600');
                    }
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.querySelectorAll('#categoryTabs a').forEach(tab => {
                            tab.classList.remove('border-orange-600', 'text-orange-600');
                        });
                        a.classList.add('border-orange-600', 'text-orange-600');
                        // FIX: Use the prepended ID for querySelector
                        document.querySelector(a.hash).scrollIntoView({ behavior: 'smooth' });
                    });
                    li.appendChild(a);
                    categoryTabs.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#all-items`;
                a.textContent = 'All Items';
                a.classList.add('block', 'py-2', 'px-4', 'text-gray-700', 'font-medium', 'border-b-2', 'border-orange-600', 'text-orange-600');
                li.appendChild(a);
                categoryTabs.appendChild(li);
            }
        }

        // Render Menu Content based on current view
        function renderMenuContent(productsToRender, categoriesToRender) {
            menuContent.innerHTML = '';
            noSearchResultsMessage.classList.add('hidden');

            if (productsToRender.length === 0) {
                noSearchResultsMessage.classList.remove('hidden');
                return;
            }

            if (categoriesToRender.length > 0) {
                categoriesToRender.forEach(category => {
                    const categorySection = document.createElement('section');
                    // FIX: Prepend 'cat-' to category._id for the section ID
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
            } else {
                const allItemsSection = document.createElement('section');
                allItemsSection.id = 'all-items';
                allItemsSection.classList.add('mb-8');

                const allItemsTitle = document.createElement('h2');
                allItemsTitle.classList.add('text-2xl', 'font-bold', 'text-gray-800', 'mb-4', 'pb-2', 'border-b', 'border-orange-500', 'sticky', 'top-0', 'bg-gray-100', 'z-10', 'py-2');
                allItemsTitle.textContent = 'All Items';
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

            if (product.price !== undefined && product.price !== null) {
                const price = document.createElement('p');
                price.classList.add('text-orange-600', 'font-bold', 'text-md');
                price.textContent = `$${product.price.toFixed(2)}`;
                cardContent.appendChild(price);
            }

            productCard.appendChild(cardContent);

            productCard.addEventListener('click', () => {
                openImagePopup(product.image || defaultImage, product.title, product.description);
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

            if (product.price !== undefined && product.price !== null) {
                const price = document.createElement('p');
                price.classList.add('list-price');
                price.textContent = `$${product.price.toFixed(2)}`;
                listItem.appendChild(price);
            }

            listItem.addEventListener('click', () => {
                openImagePopup(product.image || defaultImage, product.title, product.description);
            });
            return listItem;
        }


        // Image popup functions
        function openImagePopup(imageUrl, productName, productDescription) {
            popupImage.src = imageUrl;
            popupProductName.textContent = productName;
            popupProductDescription.textContent = productDescription || 'No description available.';
            imagePopupModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeImagePopup() {
            imagePopupModal.classList.add('hidden');
            popupImage.src = '';
            popupProductName.textContent = '';
            popupProductDescription.textContent = '';
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
                const filteredProducts = allProducts.filter(product =>
                    product.title.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.category && product.category.name.toLowerCase().includes(searchTerm))
                );
                const filteredCategoryIds = new Set(filteredProducts.map(p => p.category ? p.category._id : null));
                const categoriesForFilteredProducts = categories.filter(cat => filteredCategoryIds.has(cat._id));
                renderMenuContent(filteredProducts, categoriesForFilteredProducts);
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
                const filteredProducts = allProducts.filter(product =>
                    product.title.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.category && product.category.name.toLowerCase().includes(searchTerm))
                );
                const filteredCategoryIds = new Set(filteredProducts.map(p => p.category ? p.category._id : null));
                const categoriesForFilteredProducts = categories.filter(cat => filteredCategoryIds.has(cat._id));
                renderMenuContent(filteredProducts, categoriesForFilteredProducts);
            });
        }


        // Initial render
        // This initial call will trigger the first rendering based on default 'grid' view
        renderCategoryTabs(categories);
        renderMenuContent(allProducts, categories);

        // Search functionality
        searchMenuInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = allProducts.filter(product =>
                product.title.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.name.toLowerCase().includes(searchTerm))
            );

            const filteredCategoryIds = new Set(filteredProducts.map(p => p.category ? p.category._id : null));
            const categoriesForFilteredProducts = categories.filter(cat => filteredCategoryIds.has(cat._id));

            renderCategoryTabs(categoriesForFilteredProducts);
            renderMenuContent(filteredProducts, categoriesForFilteredProducts);
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