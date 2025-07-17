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
    let allCategories = []; // Store all categories for filtering
    let currentStoreData = null;
    let currentView = 'grid'; // Default view

    // Ensure modals are hidden by default via JS, in case CSS fails
    imagePopupModal.classList.add('hidden');
    storeInfoModal.classList.add('hidden');

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

        allCategories = await apiRequest(`/categories/store/${storeId}`, 'GET', null, false);
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
                    a.href = `#cat-${category._id}`;
                    a.textContent = category.name;
                    // Apply custom CSS classes
                    a.classList.add('category-tab-link');
                    if (index === 0) {
                        a.classList.add('active'); // Add 'active' class for the first tab
                    }
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.querySelectorAll('#categoryTabs .category-tab-link').forEach(tab => {
                            tab.classList.remove('active');
                        });
                        a.classList.add('active');
                        document.querySelector(a.hash).scrollIntoView({ behavior: 'smooth' });
                    });
                    li.appendChild(a);
                    categoryTabs.appendChild(li);
                });
            } else {
                // If no categories, show an "All Items" tab
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#all-items`;
                a.textContent = 'All Items';
                a.classList.add('category-tab-link', 'active');
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

            // If there are categories, group products by category
            if (categoriesToRender.length > 0) {
                categoriesToRender.forEach(category => {
                    const categorySection = document.createElement('section');
                    categorySection.id = `cat-${category._id}`;
                    categorySection.classList.add('category-section'); // Custom class

                    const categoryTitle = document.createElement('h2');
                    categoryTitle.classList.add('category-section-title'); // Custom class
                    categoryTitle.textContent = category.name;
                    categorySection.appendChild(categoryTitle);

                    const productsInCategory = productsToRender.filter(product => product.category && product.category._id === category._id);

                    if (productsInCategory.length === 0) {
                        const noItemsMessage = document.createElement('p');
                        noItemsMessage.classList.add('no-items-message'); // Custom class
                        noItemsMessage.textContent = 'No items in this category yet.';
                        categorySection.appendChild(noItemsMessage);
                    } else {
                        if (currentView === 'grid') {
                            const productGrid = document.createElement('div');
                            productGrid.classList.add('product-grid'); // Custom class
                            productsInCategory.forEach(product => {
                                productGrid.appendChild(createProductGridCard(product));
                            });
                            categorySection.appendChild(productGrid);
                        } else { // List View
                            const productList = document.createElement('div');
                            productList.classList.add('product-list'); // Custom class
                            productsInCategory.forEach(product => {
                                productList.appendChild(createProductListItem(product));
                            });
                            categorySection.appendChild(productList);
                        }
                    }
                    menuContent.appendChild(categorySection);
                });
            } else {
                // If no categories, display all products under a single "All Items" section
                const allItemsSection = document.createElement('section');
                allItemsSection.id = 'all-items';
                allItemsSection.classList.add('category-section'); // Custom class

                const allItemsTitle = document.createElement('h2');
                allItemsTitle.classList.add('category-section-title'); // Custom class
                allItemsTitle.textContent = 'All Items';
                allItemsSection.appendChild(allItemsTitle);

                if (currentView === 'grid') {
                    const productGrid = document.createElement('div');
                    productGrid.classList.add('product-grid'); // Custom class
                    productsToRender.forEach(product => {
                        productGrid.appendChild(createProductGridCard(product));
                    });
                    allItemsSection.appendChild(productGrid);
                } else { // List View
                    const productList = document.createElement('div');
                    productList.classList.add('product-list'); // Custom class
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
            productCard.classList.add('product-card'); // Custom class

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('product-image-container'); // Custom class
            const defaultImage = `https://placehold.co/400x400/e2e8f0/64748b?text=No+Image`;
            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image;
                img.alt = product.title;
                img.classList.add('product-image'); // Custom class
                imgContainer.appendChild(img);
            } else {
                const placeholderImg = document.createElement('img');
                placeholderImg.src = defaultImage;
                placeholderImg.alt = 'No Image Available';
                placeholderImg.classList.add('product-image'); // Custom class
                imgContainer.appendChild(placeholderImg);
            }
            productCard.appendChild(imgContainer);

            const cardContent = document.createElement('div');
            cardContent.classList.add('product-card-content'); // Custom class

            const title = document.createElement('h3');
            title.classList.add('product-card-title'); // Custom class
            title.textContent = product.title;
            cardContent.appendChild(title);

            if (product.description) {
                const description = document.createElement('p');
                description.classList.add('product-card-description'); // Custom class
                description.textContent = product.description;
                cardContent.appendChild(description);
            }

            if (product.price !== undefined && product.price !== null) {
                const price = document.createElement('p');
                price.classList.add('product-card-price'); // Custom class
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
            listItem.classList.add('product-list-item'); // Custom class

            const defaultImage = `https://placehold.co/60x60/e2e8f0/64748b?text=No+Img`;

            const imgContainer = document.createElement('div');
            imgContainer.classList.add('list-image-container'); // Custom class
            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image;
                img.alt = product.title;
                img.classList.add('list-image'); // Custom class
                imgContainer.appendChild(img);
            } else {
                const placeholderImg = document.createElement('img');
                placeholderImg.src = defaultImage;
                placeholderImg.alt = 'No Image Available';
                placeholderImg.classList.add('list-image'); // Custom class
                imgContainer.appendChild(placeholderImg);
            }
            listItem.appendChild(imgContainer);

            const listContent = document.createElement('div');
            listContent.classList.add('list-content'); // Custom class

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
                price.classList.add('list-price'); // Custom class
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

            // Social media links visibility
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
                gridViewBtn.classList.add('active'); // Add 'active' class
                listViewBtn.classList.remove('active'); // Remove 'active' class
                listViewBtn.classList.add('inactive'); // Add 'inactive' class
                // Re-render with current filters (from search input)
                const searchTerm = searchMenuInput.value.toLowerCase();
                const filteredProducts = allProducts.filter(product =>
                    product.title.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.category && product.category.name.toLowerCase().includes(searchTerm))
                );
                // Filter categories based on filtered products
                const filteredCategoryIds = new Set(filteredProducts.map(p => p.category ? p.category._id : null));
                const categoriesForFilteredProducts = allCategories.filter(cat => filteredCategoryIds.has(cat._id));

                renderMenuContent(filteredProducts, categoriesForFilteredProducts);
            });
        }

        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                currentView = 'list';
                listViewBtn.classList.add('active'); // Add 'active' class
                gridViewBtn.classList.remove('active'); // Remove 'active' class
                gridViewBtn.classList.add('inactive'); // Add 'inactive' class
                // Re-render with current filters (from search input)
                const searchTerm = searchMenuInput.value.toLowerCase();
                const filteredProducts = allProducts.filter(product =>
                    product.title.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.category && product.category.name.toLowerCase().includes(searchTerm))
                );
                // Filter categories based on filtered products
                const filteredCategoryIds = new Set(filteredProducts.map(p => p.category ? p.category._id : null));
                const categoriesForFilteredProducts = allCategories.filter(cat => filteredCategoryIds.has(cat._id));

                renderMenuContent(filteredProducts, categoriesForFilteredProducts);
            });
        }


        // Initial render
        // This initial call will trigger the first rendering based on default 'grid' view
        renderCategoryTabs(allCategories);
        renderMenuContent(allProducts, allCategories);

        // Search functionality
        searchMenuInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = allProducts.filter(product =>
                product.title.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.name.toLowerCase().includes(searchTerm))
            );

            // Filter categories based on filtered products
            const filteredCategoryIds = new Set(filteredProducts.map(p => p.category ? p.category._id : null));
            const categoriesForFilteredProducts = allCategories.filter(cat => filteredCategoryIds.has(cat._id));

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
        // Do NOT open the store info modal on error by default.
        // If you want to show an error message in the modal, you'd need specific logic here.
    }
});
