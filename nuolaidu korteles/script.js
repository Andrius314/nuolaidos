import { v4 as uuidv4 } from 'uuid';

document.addEventListener('DOMContentLoaded', () => {
    const cardImageUpload = document.getElementById('card-image-upload');
    const cardCategorySelect = document.getElementById('card-category-select');
    const addCardButton = document.getElementById('add-card-button');
    const cardsList = document.getElementById('cards-list');
    const fullscreenOverlay = document.createElement('div');
    fullscreenOverlay.classList.add('fullscreen-card-overlay');
    document.body.appendChild(fullscreenOverlay);
    const categorySelectDropdown = document.getElementById('category-select');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const addCategoryButton = document.getElementById('add-category-button');
    const categoryList = document.getElementById('category-list');

    // Menu button and dropdown functionality
    const categoryManagementButton = document.getElementById('category-management-button');
    const categoryManagementSection = document.getElementById('category-management-section');
    const addCardButtonMenu = document.getElementById('add-card-button-menu');
    const uploadSection = document.getElementById('upload-section');

    categoryManagementButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent immediate closing if clicking on button
        categoryManagementSection.classList.toggle('show');
        uploadSection.classList.remove('show'); // Close other dropdown if open
    });

    addCardButtonMenu.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent immediate closing if clicking on button
        uploadSection.classList.toggle('show');
        categoryManagementSection.classList.remove('show'); // Close other dropdown if open
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', (event) => {
        if (!categoryManagementSection.contains(event.target) && event.target !== categoryManagementButton) {
            categoryManagementSection.classList.remove('show');
        }
        if (!uploadSection.contains(event.target) && event.target !== addCardButtonMenu) {
            uploadSection.classList.remove('show');
        }
    });


    let cards = [];
    let categories = [];

    function displayCards(filterCategory = 'visos') {
        cardsList.innerHTML = '';
        let filteredCards = [...cards];

        if (filterCategory !== 'visos' && filterCategory !== 'dažniausiai') {
            filteredCards = cards.filter(card => card.category === filterCategory);
        } else if (filterCategory === 'dažniausiai') {
            filteredCards.sort((a, b) => b.usageCount - a.usageCount);
            filteredCards = filteredCards.slice(0, 5);
        }

        filteredCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.innerHTML = `
                <img src="${card.imageSrc}" alt="Nuolaidų kortelė">
                <p>Kategorija: ${card.category}</p>
            `;
            cardElement.addEventListener('click', () => openFullscreenCard(card));
            cardsList.appendChild(cardElement);
        });
    }

    function updateCategoryFilterDropdown() {
        // Update category filter dropdown
        while (categorySelectDropdown.options.length > 2) {
            categorySelectDropdown.remove(2);
        }
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelectDropdown.appendChild(option);
        });
    }

    function updateCardCategorySelect() {
        // Update card category select in add card section
        cardCategorySelect.innerHTML = '<option value="">Pasirinkite kategoriją</option>'; // Reset options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            cardCategorySelect.appendChild(option);
        });
    }

    function displayCategoryList() {
        categoryList.innerHTML = ''; // Clear existing list
        categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.textContent = category;
            categoryList.appendChild(listItem);
        });
    }

    function openFullscreenCard(card) {
        const categoryOptionsHTML = categories.map(category => `<option value="${category}" ${card.category === category ? 'selected' : ''}>${category}</option>`).join('');

        fullscreenOverlay.innerHTML = `
            <div class="fullscreen-card-content">
                <img src="${card.imageSrc}" alt="Nuolaidų kortelė">
                <p>Kategorija: ${card.category}</p>
                <div>
                    <label for="fullscreen-category-select">Keisti kategoriją:</label>
                    <select id="fullscreen-category-select">
                        ${categoryOptionsHTML}
                    </select>
                    <button id="save-category-button">Išsaugoti</button>
                </div>
            </div>
        `;
        fullscreenOverlay.classList.add('active');
        fullscreenOverlay.addEventListener('click', closeFullscreenCard);
        card.usageCount = (card.usageCount || 0) + 1;

        const saveCategoryButton = fullscreenOverlay.querySelector('#save-category-button');
        const fullscreenCategorySelect = fullscreenOverlay.querySelector('#fullscreen-category-select');

        saveCategoryButton.addEventListener('click', () => {
            const newCategory = fullscreenCategorySelect.value;
            if (newCategory && newCategory !== card.category) {
                card.category = newCategory;
                displayCards(categorySelectDropdown.value); // Re-display cards to reflect category change
                updateCategoryFilterDropdown(); // Update category filter dropdown
                updateCardCategorySelect(); // Update card category select dropdown
                closeFullscreenCard();
            }
        });
    }

    function closeFullscreenCard(event) {
        if (event.target === fullscreenOverlay) {
            fullscreenOverlay.classList.remove('active');
            fullscreenOverlay.removeEventListener('click', closeFullscreenCard);
        }
    }

    addCardButton.addEventListener('click', () => {
        const imageFile = cardImageUpload.files[0];
        const category = cardCategorySelect.value;

        if (imageFile && category) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const card = {
                    id: uuidv4(),
                    imageSrc: e.target.result,
                    category: category,
                    usageCount: 0
                };
                cards.push(card);
                displayCards(categorySelectDropdown.value);
                cardImageUpload.value = '';
                cardCategorySelect.value = '';
            }
            reader.readAsDataURL(imageFile);
        } else {
            alert('Prašome pasirinkti nuotrauką ir kategoriją.');
        }
    });

    categorySelectDropdown.addEventListener('change', () => {
        displayCards(categorySelectDropdown.value);
    });

    addCategoryButton.addEventListener('click', () => {
        const newCategoryName = newCategoryNameInput.value.trim();
        if (newCategoryName && !categories.includes(newCategoryName)) {
            categories.push(newCategoryName);
            categories.sort();
            displayCategoryList();
            updateCategoryFilterDropdown();
            updateCardCategorySelect();
            newCategoryNameInput.value = '';
        } else if (categories.includes(newCategoryName)) {
            alert('Kategorija jau egzistuoja.');
        } else {
            alert('Prašome įvesti kategorijos pavadinimą.');
        }
    });

    displayCards('visos');
    displayCategoryList();
    updateCategoryFilterDropdown();
    updateCardCategorySelect();
});