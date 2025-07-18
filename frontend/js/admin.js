// qr-digital-menu-system/frontend/js/admin.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Authentication Check
    // Ensure the user is authenticated and is an admin
    if (!window.checkAuthAndRedirect('admin')) {
        return; // Redirect handled by auth.js if not authenticated or wrong role
    }

    // --- DOM Element References ---
    // Mobile Menu
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const sidebar = document.getElementById('sidebar');

    // Dashboard Overview
    const totalProductsCount = document.getElementById('totalProductsCount');
    const totalCategoriesCount = document.getElementById('totalCategoriesCount');

    // Store Management
    const storeForm = document.getElementById('storeForm');
    const storeNameInput = document.getElementById('storeName');
    const storeAddressInput = document.getElementById('storeAddress');
    const storePhoneInput = document.getElementById('storePhone');
    const storeDescriptionInput = document.getElementById('storeDescription');
    const storeFacebookInput = document.getElementById('storeFacebook');
    const storeTelegramInput = document.getElementById('storeTelegram');
    const storeTikTokInput = document.getElementById('storeTikTok');
    const storeWebsiteInput = document.getElementById('storeWebsite');
    const storeLogoInput = document.getElementById('storeLogo');
    const currentLogoImg = document.getElementById('currentLogo');
    const removeLogoContainer = document.getElementById('removeLogoContainer');
    const removeStoreLogoCheckbox = document.getElementById('removeStoreLogo');
    const storeMessage = document.getElementById('storeMessage');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    const publicMenuLinkInput = document.getElementById('publicMenuLink');
    const copyMenuLinkBtn = document.getElementById('copyMenuLinkBtn');
    const copyMessage = document.getElementById('copyMessage');

    // Category Management
    const categoryForm = document.getElementById('categoryForm');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryMessage = document.getElementById('categoryMessage');
    const categoryListTableBody = document.getElementById('categoryList');
    const editCategoryModal = document.getElementById('editCategoryModal');
    const editCategoryForm = document.getElementById('editCategoryForm');
    const editCategoryIdInput = document.getElementById('editCategoryId');
    const editCategoryNameInput = document.getElementById('editCategoryName');
    const editCategoryMessage = document.getElementById('editCategoryMessage');
    const cancelEditCategoryBtn = document.getElementById('cancelEditCategoryBtn');

    // Product Management
    const productForm = document.getElementById('productForm');
    const productNameInput = document.getElementById('productName');
    const productCategorySelect = document.getElementById('productCategory');
    const productDescriptionInput = document.getElementById('productDescription');
    const productPriceInput = document.getElementById('productPrice');
    const productImageInput = document.getElementById('productImage');
    const newProductImagePreview = document.getElementById('newProductImagePreview');
    const productMessage = document.getElementById('productMessage');
    const productListTableBody = document.getElementById('productListTableBody');
    const productFilterCategorySelect = document.getElementById('productFilterCategory');
    const editProductModal = document.getElementById('editProductModal');
    const editProductForm = document.getElementById('editProductForm');
    const editProductIdInput = document.getElementById('editProductId');
    const editProductNameInput = document.getElementById('editProductName');
    const editProductCategorySelect = document.getElementById('editProductCategory');
    const editProductDescriptionInput = document.getElementById('editProductDescription');
    const editProductPriceInput = document.getElementById('editProductPrice');
    const editProductImageInput = document.getElementById('editProductImage');
    const currentProductImageImg = document.getElementById('currentProductImage');
    const editProductMessage = document.getElementById('editProductMessage');
    const cancelEditProductBtn = document.getElementById('cancelEditProductBtn');

    // Product Image Popup Modal (for admin page)
    const productImagePopupModal = document.getElementById('productImagePopupModal');
    const popupProductImage = document.getElementById('popupProductImage');
    const popupProductTitle = document.getElementById('popupProductTitle');
    const popupProductDescriptionDetail = document.getElementById('popupProductDescriptionDetail');
    const closeProductImagePopupBtn = document.getElementById('closeProductImagePopupBtn');


    let currentStore = null;

    // --- Utility Functions ---
    function displayMessage(element, message, isError = false) {
        element.textContent = message;
        element.classList.remove('hidden', 'text-red-500', 'text-green-500');
        element.classList.add(isError ? 'text-red-500' : 'text-green-500');
    }

    function clearMessage(element) {
        element.textContent = '';
        element.classList.add('hidden');
    }

    // --- Mobile Menu Toggle ---
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
        });
        sidebar.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    sidebar.classList.add('hidden');
                }
            });
        });
    }

    // --- Dashboard Overview Functions ---
    async function updateDashboardOverview() {
        try {
            const products = await apiRequest('/products/my-store', 'GET');
            const categories = await apiRequest('/categories/my-store', 'GET');

            totalProductsCount.textContent = products.length;
            totalCategoriesCount.textContent = categories.length;
        } catch (error) {
            console.error('Error fetching dashboard overview:', error.message);
            totalProductsCount.textContent = 'N/A';
            totalCategoriesCount.textContent = 'N/A';
        }
    }


    // --- Store Management Functions ---

    async function fetchStoreDetails() {
        clearMessage(storeMessage);
        clearMessage(copyMessage);
        try {
            currentStore = await apiRequest('/stores/my-store', 'GET');
            storeNameInput.value = currentStore.name;
            storeAddressInput.value = currentStore.address || '';
            storePhoneInput.value = currentStore.phone || '';
            storeDescriptionInput.value = currentStore.description || '';
            storeFacebookInput.value = currentStore.facebookUrl || '';
            storeTelegramInput.value = currentStore.telegramUrl || '';
            storeTikTokInput.value = currentStore.tiktokUrl || '';
            storeWebsiteInput.value = currentStore.websiteUrl || '';


            if (currentStore.logo) {
                currentLogoImg.src = currentStore.logo;
                currentLogoImg.style.display = 'block';
                removeLogoContainer.style.display = 'block';
                removeStoreLogoCheckbox.checked = false;
            } else {
                currentLogoImg.src = '';
                currentLogoImg.style.display = 'none';
                removeLogoContainer.style.display = 'none';
                removeStoreLogoCheckbox.checked = false;
            }

            // Generate QR code and display public link using the slug
            // THIS IS THE LINE THAT GENERATES THE URL IN ADMIN PANEL
            if (currentStore.slug) { 
                const publicMenuUrl = `${window.location.origin}/menu_display.html?slug=${currentStore.slug}`; 
                const qrCanvas = window.generateQRCode(publicMenuUrl, qrCodeContainer, 256);
                if (qrCanvas) {
                    downloadQrBtn.style.display = 'inline-block';
                    downloadQrBtn.onclick = () => {
                        window.downloadCanvasAsPNG(qrCanvas, `${currentStore.name}_menu_qr.png`);
                    };
                }

                // Display the public menu link
                publicMenuLinkInput.value = publicMenuUrl;
                copyMenuLinkBtn.style.display = 'inline-block';

            } else {
                qrCodeContainer.innerHTML = '<p class="text-gray-500">Save store info to generate QR.</p>';
                downloadQrBtn.style.display = 'none';
                publicMenuLinkInput.value = 'Link will appear here after saving store info.';
                copyMenuLinkBtn.style.display = 'none';
            }

        }
        catch (error) {
            displayMessage(storeMessage, `Error fetching store details: ${error.message}`, true);
            currentLogoImg.src = '';
            currentLogoImg.style.display = 'none';
            removeLogoContainer.style.display = 'none';
            qrCodeContainer.innerHTML = '<p class="text-gray-500">Failed to load QR code.</p>';
            downloadQrBtn.style.display = 'none';
            publicMenuLinkInput.value = 'Failed to load menu link.';
            copyMenuLinkBtn.style.display = 'none';
        }
    }

    if (storeForm) {
        storeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(storeMessage);

            const formData = new FormData();
            formData.append('name', storeNameInput.value);
            formData.append('address', storeAddressInput.value);
            formData.append('phone', storePhoneInput.value);
            formData.append('description', storeDescriptionInput.value);
            formData.append('facebookUrl', storeFacebookInput.value);
            formData.append('telegramUrl', storeTelegramInput.value);
            formData.append('tiktokUrl', storeTikTokInput.value);
            formData.append('websiteUrl', storeWebsiteInput.value);
            
            if (storeLogoInput.files[0]) {
                formData.append('logo', storeLogoInput.files[0]);
            } else if (removeStoreLogoCheckbox.checked) {
                formData.append('logo', ''); 
            }

            try {
                const updatedStore = await apiRequest('/stores/my-store', 'PUT', formData, true, true);
                displayMessage(storeMessage, 'Store details updated successfully!', false);
                await fetchStoreDetails();
            } catch (error) {
                displayMessage(storeMessage, `Error updating store: ${error.message}`, true);
            }
        });
    }

    // Copy Menu Link functionality
    if (copyMenuLinkBtn) {
        copyMenuLinkBtn.addEventListener('click', async () => {
            try {
                publicMenuLinkInput.select();
                document.execCommand('copy');
                displayMessage(copyMessage, 'Link copied to clipboard!', false);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                displayMessage(copyMessage, 'Failed to copy link. Please copy manually.', true);
            }
            setTimeout(() => clearMessage(copyMessage), 3000);
        });
    }


    // --- Category Management Functions ---

    async function fetchCategories() {
        clearMessage(categoryMessage);
        categoryListTableBody.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-gray-500">Loading categories...</td></tr>';
        try {
            const categories = await apiRequest('/categories/my-store', 'GET');
            categoryListTableBody.innerHTML = '';
            productCategorySelect.innerHTML = '<option value="">Select a Category</option>';
            editProductCategorySelect.innerHTML = '';
            productFilterCategorySelect.innerHTML = '<option value="all">All Categories</option>';

            if (categories.length === 0) {
                categoryListTableBody.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-gray-500">No categories added yet.</td></tr>';
                return;
            }

            categories.forEach(category => {
                const row = categoryListTableBody.insertRow();
                row.innerHTML = `
                    <td class="py-2 px-4 border-b border-gray-200">${category.name}</td>
                    <td class="py-2 px-4 border-b border-gray-200">
                        <button data-id="${category._id}" data-name="${category.name}" class="edit-category-btn bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-2 rounded mr-2 transition duration-300">Edit</button>
                        <button data-id="${category._id}" class="delete-category-btn bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded transition duration-300">Delete</button>
                    </td>
                `;

                const optionAdd = document.createElement('option');
                optionAdd.value = category._id;
                optionAdd.textContent = category.name;
                productCategorySelect.appendChild(optionAdd);

                const optionEdit = document.createElement('option');
                optionEdit.value = category._id;
                optionEdit.textContent = category.name;
                editProductCategorySelect.appendChild(optionEdit);

                const optionFilter = document.createElement('option');
                optionFilter.value = category._id;
                optionFilter.textContent = category.name;
                productFilterCategorySelect.appendChild(optionFilter);
            });

            document.querySelectorAll('.edit-category-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    openEditCategoryModal(e.target.dataset.id, e.target.dataset.name);
                });
            });

            document.querySelectorAll('.delete-category-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    if (confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
                        deleteCategory(e.target.dataset.id);
                    }
                });
            });

        } catch (error) {
            displayMessage(categoryMessage, `Error fetching categories: ${error.message}`, true);
            categoryListTableBody.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-gray-500">Failed to load categories.</td></tr>';
        }
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(categoryMessage);
            const name = categoryNameInput.value.trim();
            if (!name) {
                displayMessage(categoryMessage, 'Category name cannot be empty.', true);
                return;
            }

            try {
                await apiRequest('/categories', 'POST', { name });
                displayMessage(categoryMessage, 'Category added successfully!', false);
                categoryNameInput.value = '';
                fetchCategories();
                fetchProducts(productFilterCategorySelect.value);
                updateDashboardOverview();
            } catch (error) {
                displayMessage(categoryMessage, `Error adding category: ${error.message}`, true);
            }
        });
    }

    function openEditCategoryModal(id, name) {
        editCategoryIdInput.value = id;
        editCategoryNameInput.value = name;
        clearMessage(editCategoryMessage);
        editCategoryModal.classList.remove('hidden');
    }

    if (cancelEditCategoryBtn) {
        cancelEditCategoryBtn.addEventListener('click', () => {
            editCategoryModal.classList.add('hidden');
        });
    }

    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(editCategoryMessage);
            const id = editCategoryIdInput.value;
            const name = editCategoryNameInput.value.trim();
            if (!name) {
                displayMessage(editCategoryMessage, 'Category name cannot be empty.', true);
                return;
            }

            try {
                await apiRequest(`/categories/${id}`, 'PUT', { name });
                displayMessage(editCategoryMessage, 'Category updated successfully!', false);
                editCategoryModal.classList.add('hidden');
                fetchCategories();
                fetchProducts(productFilterCategorySelect.value);
            } catch (error) {
                displayMessage(editCategoryMessage, `Error updating category: ${error.message}`, true);
            }
        });
    }

    async function deleteCategory(id) {
        clearMessage(categoryMessage);
        try {
            await apiRequest(`/categories/${id}`, 'DELETE');
            displayMessage(categoryMessage, 'Category deleted successfully!', false);
            fetchCategories();
            fetchProducts(productFilterCategorySelect.value);
            updateDashboardOverview();
        } catch (error) {
                displayMessage(categoryMessage, `Error deleting category: ${error.message}`, true);
        }
    }

    // --- Product Management Functions ---

    async function fetchProducts(categoryId = 'all') {
        clearMessage(productMessage);
        productListTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Loading products...</td></tr>';
        try {
            let products;
            if (categoryId === 'all') {
                products = await apiRequest('/products/my-store', 'GET');
            } else {
                products = await apiRequest(`/products/my-store?category=${categoryId}`, 'GET');
            }
            
            productListTableBody.innerHTML = '';

            if (products.length === 0) {
                productListTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No products added yet.</td></tr>';
                return;
            }

            products.forEach(product => {
                const row = productListTableBody.insertRow();
                const defaultImage = `https://placehold.co/50x50/e2e8f0/64748b?text=No+Img`;

                row.innerHTML = `
                    <td class="py-2 px-4 border-b border-gray-200">
                        <div class="product-list-image-container cursor-pointer" data-image="${product.image || defaultImage}" data-title="${product.title}" data-description="${product.description || ''}">
                            <img src="${product.image || defaultImage}" alt="${product.title}" class="product-list-image">
                        </div>
                    </td>
                    <td class="py-2 px-4 border-b border-gray-200">${product.title}</td>
                    <td class="py-2 px-4 border-b border-gray-200">${product.category ? product.category.name : 'Uncategorized'}</td>
                    <td class="py-2 px-4 border-b border-gray-200">${product.price !== undefined && product.price !== null ? product.price : 'N/A'}</td>
                    <td class="py-2 px-4 border-b border-gray-200">
                        <button data-id="${product._id}" class="edit-product-btn bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-2 rounded mr-2 transition duration-300">Edit</button>
                        <button data-id="${product._id}" class="delete-product-btn bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded transition duration-300">Delete</button>
                    </td>
                `;
            });

            document.querySelectorAll('.edit-product-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    const product = products.find(p => p._id === productId);
                    if (product) {
                        openEditProductModal(product);
                    }
                });
            });

            document.querySelectorAll('.delete-product-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    if (confirm('Are you sure you want to delete this product?')) {
                        deleteProduct(productId);
                    }
                });
            });

            document.querySelectorAll('.product-list-image-container').forEach(container => {
                container.addEventListener('click', (e) => {
                    const imageUrl = e.currentTarget.dataset.image;
                    const title = e.currentTarget.dataset.title;
                    const description = e.currentTarget.dataset.description;
                    openProductImagePopup(imageUrl, title, description);
                });
            });

        } catch (error) {
            displayMessage(productMessage, `Error fetching products: ${error.message}`, true);
            productListTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Failed to load products.</td></tr>';
        }
    }

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(productMessage);

            const formData = new FormData();
            formData.append('title', productNameInput.value);
            formData.append('category', productCategorySelect.value);
            formData.append('description', productDescriptionInput.value);
            formData.append('price', productPriceInput.value);

            if (productImageInput.files[0]) {
                formData.append('image', productImageInput.files[0]);
            }

            try {
                await apiRequest('/products', 'POST', formData, true, true);
                displayMessage(productMessage, 'Product added successfully!', false);
                productForm.reset();
                productImageInput.value = '';
                newProductImagePreview.src = '';
                newProductImagePreview.classList.add('hidden');
                fetchProducts(productFilterCategorySelect.value);
                updateDashboardOverview();
            } catch (error) {
                displayMessage(productMessage, `Error adding product: ${error.message}`, true);
            }
        });
    }

    if (productImageInput) {
        productImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newProductImagePreview.src = e.target.result;
                    newProductImagePreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                newProductImagePreview.src = '';
                newProductImagePreview.classList.add('hidden');
            }
        });
    }


    function openEditProductModal(product) {
        editProductIdInput.value = product._id;
        editProductNameInput.value = product.title;
        editProductCategorySelect.value = product.category ? product.category._id : '';
        editProductDescriptionInput.value = product.description || '';
        editProductPriceInput.value = product.price !== undefined && product.price !== null ? product.price : '';

        if (product.image) {
            currentProductImageImg.src = product.image;
            currentProductImageImg.style.display = 'block';
        } else {
            currentProductImageImg.src = '';
            currentProductImageImg.style.display = 'none';
        }
        editProductImageInput.value = '';

        clearMessage(editProductMessage);
        editProductModal.classList.remove('hidden');
    }

    if (cancelEditProductBtn) {
        cancelEditProductBtn.addEventListener('click', () => {
            editProductModal.classList.add('hidden');
        });
    }

    if (editProductForm) {
        editProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(editProductMessage);

            const formData = new FormData();
            formData.append('title', editProductNameInput.value);
            formData.append('category', editProductCategorySelect.value);
            formData.append('description', editProductDescriptionInput.value);
            formData.append('price', editProductPriceInput.value);
            
            if (editProductImageInput.files[0]) {
                formData.append('image', editProductImageInput.files[0]);
            } else if (currentProductImageImg.style.display === 'none' && currentProductImageImg.src === '') {
                formData.append('image', '');
            }

            try {
                await apiRequest(`/products/${editProductIdInput.value}`, 'PUT', formData, true, true);
                displayMessage(editProductMessage, 'Product updated successfully!', false);
                editProductModal.classList.add('hidden');
                fetchProducts(productFilterCategorySelect.value);
            } catch (error) {
                displayMessage(editProductMessage, `Error updating product: ${error.message}`, true);
            }
        });
    }

    async function deleteProduct(id) {
        clearMessage(productMessage);
        try {
            await apiRequest(`/products/${id}`, 'DELETE');
            displayMessage(productMessage, 'Product deleted successfully!', false);
            fetchProducts(productFilterCategorySelect.value);
            updateDashboardOverview();
        } catch (error) {
            displayMessage(productMessage, `Error deleting product: ${error.message}`, true);
        }
    }

    // --- Product Image Popup Functions (for admin page) ---
    function openProductImagePopup(imageUrl, title, description) {
        popupProductImage.src = imageUrl;
        popupProductTitle.textContent = title;
        popupProductDescriptionDetail.textContent = description || 'No description available.';
        productImagePopupModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeProductImagePopup() {
        productImagePopupModal.classList.add('hidden');
        popupProductImage.src = '';
        popupProductTitle.textContent = '';
        popupProductDescriptionDetail.textContent = '';
        document.body.style.overflow = '';
    }

    if (closeProductImagePopupBtn) {
        closeProductImagePopupBtn.addEventListener('click', closeProductImagePopup);
    }
    if (productImagePopupModal) {
        productImagePopupModal.addEventListener('click', (e) => {
            if (e.target === productImagePopupModal) {
                closeProductImagePopup();
            }
        });
    }

    // --- Event listener for product category filter ---
    if (productFilterCategorySelect) {
        productFilterCategorySelect.addEventListener('change', (e) => {
            const selectedCategoryId = e.target.value;
            fetchProducts(selectedCategoryId);
        });
    }


    // --- Initial Data Load on Page Load ---
    (async () => {
        await fetchStoreDetails();
        await fetchCategories();
        await fetchProducts('all');
        await updateDashboardOverview();
    })();
});
