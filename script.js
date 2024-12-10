document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const clearButton = document.getElementById("clearButton");
    const languageInput = document.getElementById("languageInput");
    const currencyInput = document.getElementById("currencyInput");
    const languageDropdown = document.getElementById("languageDropdown");
    const currencyDropdown = document.getElementById("currencyDropdown");
    const countryInfoDiv = document.getElementById("countryInfo");
    const errorMessagesDiv = document.getElementById("errorMessages");

    clearButton.addEventListener("click", () => {
        languageInput.value = "";
        currencyInput.value = "";
        languageDropdown.value = "";
        currencyDropdown.value = "";
        countryInfoDiv.innerHTML = "";
        errorMessagesDiv.innerHTML = "";
        toggleClearButton();
    });

    function toggleClearButton() {
        if (languageInput.value.trim() || currencyInput.value.trim() || languageDropdown.value || currencyDropdown.value) {
            clearButton.style.display = "inline-block";
        } else {
            clearButton.style.display = "none";
        }
    }

    clearButton.style.display = "none";

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    languageInput.addEventListener("input", debounce(toggleClearButton, 300));
    currencyInput.addEventListener("input", debounce(toggleClearButton, 300));
    languageDropdown.addEventListener("change", toggleClearButton);
    currencyDropdown.addEventListener("change", toggleClearButton);

    function clearErrorMessages() {
        errorMessagesDiv.innerHTML = "";
    }

    async function fetchLanguageAndCurrencyData() {
        clearErrorMessages();

        const language = languageInput.value.trim().toLowerCase();
        const currency = currencyInput.value.trim().toLowerCase();
        const selectedLanguage = languageDropdown.value.trim().toLowerCase();
        const selectedCurrency = currencyDropdown.value.trim().toLowerCase();

        const validLanguage = language || selectedLanguage;
        const validCurrency = currency || selectedCurrency;

        if (!validLanguage || !validCurrency) {
            errorMessagesDiv.innerHTML = "<p class='text-danger'>Bitte sowohl eine Sprache als auch eine Währung eingeben oder auswählen.</p>";
            return;
        }

        try {
            const response = await fetch("https://restcountries.com/v3.1/all");
            if (!response.ok) throw new Error("Fehler beim Abrufen der Länderinformationen");

            const countryData = await response.json();

            const matchingCountries = countryData.filter(country => {
                const countryLanguages = country.languages
                    ? Object.values(country.languages).map(lang => lang.toLowerCase())
                    : [];
                const countryCurrencies = country.currencies
                    ? Object.values(country.currencies).map(curr => curr.name.toLowerCase())
                    : [];

                const languageMatches = validLanguage && (
                    (language && countryLanguages.some(lang => lang.includes(language))) ||
                    (selectedLanguage && countryLanguages.some(lang => lang.includes(selectedLanguage)))
                );

                const currencyMatches = validCurrency && (
                    (currency && countryCurrencies.some(curr => curr.includes(currency))) ||
                    (selectedCurrency && countryCurrencies.some(curr => curr.includes(selectedCurrency)))
                );

                return languageMatches && currencyMatches;
            });

            if (matchingCountries.length === 0) {
                countryInfoDiv.innerHTML = "<p class='text-danger'>Keine Länder mit der angegebenen Sprache und Währung gefunden.</p>";
                return;
            }

            countryInfoDiv.innerHTML = matchingCountries.map((country, index) => `
                <div class="accordion" id="accordionExample">
                    <div class="card">
                        <div class="card-header" id="heading${index}">
                            <h2 class="mb-0">
                                <button class="btn btn-link" type="button" data-toggle="collapse" 
                                        data-target="#collapse${index}" aria-expanded="true" 
                                        aria-controls="collapse${index}">
                                    <img src="${country.flags.png}" alt="Flagge von ${country.name.common}" 
                                         style="max-width: 40px; margin-right: 10px;">
                                    ${country.name.common}
                                </button>
                            </h2>
                        </div>
                        <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}">
                            <div class="card-body">
                                <p><strong>Hauptstadt:</strong> ${country.capital ? country.capital[0] : "Keine Daten"}</p>
                                <p><strong>Region:</strong> ${country.region}</p>
                                <p><strong>Währung:</strong> ${country.currencies ? Object.values(country.currencies)[0].name : "Nicht verfügbar"}</p>
                                <p><strong>Sprache(n):</strong> ${country.languages ? Object.values(country.languages).join(", ") : "Nicht verfügbar"}</p>
                                <p><strong>Bevölkerung:</strong> ${country.population.toLocaleString()}</p>
                                <div class="text-center mt-3">
                                    <img src="${country.flags.png}" alt="Flagge von ${country.name.common}" style="max-width: 200px;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            errorMessagesDiv.innerHTML = `<p class='text-danger'>Fehler beim Abrufen der Daten: ${error.message}</p>`;
        }
    }

    async function loadDropdowns() {
        try {
            const response = await fetch("https://restcountries.com/v3.1/all");
            if (!response.ok) throw new Error("Fehler beim Laden der Länder");

            const countryData = await response.json();

            const languages = new Set();
            const currencies = new Set();

            countryData.forEach(country => {
                if (country.languages) {
                    Object.values(country.languages).forEach(language => languages.add(language));
                }
                if (country.currencies) {
                    Object.values(country.currencies).forEach(currency => currencies.add(currency.name));
                }
            });

            const languageArray = Array.from(languages).sort();
            const currencyArray = Array.from(currencies).sort();

            const placeholderLanguage = document.createElement("option");
            placeholderLanguage.value = "";
            placeholderLanguage.textContent = "Bitte auswählen";
            placeholderLanguage.disabled = true;
            placeholderLanguage.selected = true;
            languageDropdown.appendChild(placeholderLanguage);

            const placeholderCurrency = document.createElement("option");
            placeholderCurrency.value = "";
            placeholderCurrency.textContent = "Bitte auswählen";
            placeholderCurrency.disabled = true;
            placeholderCurrency.selected = true;
            currencyDropdown.appendChild(placeholderCurrency);

            languageArray.forEach(language => {
                const option = document.createElement("option");
                option.value = language;
                option.textContent = language;
                languageDropdown.appendChild(option);
            });

            currencyArray.forEach(currency => {
                const option = document.createElement("option");
                option.value = currency;
                option.textContent = currency;
                currencyDropdown.appendChild(option);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Dropdowns:", error);
        }
    }

    loadDropdowns();

    searchButton.addEventListener("click", fetchLanguageAndCurrencyData);
});
