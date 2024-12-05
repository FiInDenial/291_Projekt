document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const clearButton = document.getElementById("clearButton");
    const languageInput = document.getElementById("languageInput");
    const currencyInput = document.getElementById("currencyInput");
    const languageDropdown = document.getElementById("languageDropdown");
    const currencyDropdown = document.getElementById("currencyDropdown");
    const regionDropdown = document.getElementById("regionDropdown");
    const countryInfoDiv = document.getElementById("countryInfo");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Clear Button: Eingabefelder zurücksetzen
    clearButton.addEventListener("click", () => {
        languageInput.value = "";
        currencyInput.value = "";
        languageDropdown.value = "";
        currencyDropdown.value = "";
        regionDropdown.value = "";
        countryInfoDiv.innerHTML = "";
        errorMessagesDiv.innerHTML = "";
    });

    // Suchfunktion: Sprachen, Währungen und Regionen filtern
    async function fetchLanguageAndCurrencyData() {
        const language = languageInput.value.trim().toLowerCase();
        const currency = currencyInput.value.trim().toLowerCase();
        const selectedLanguage = languageDropdown.value;
        const selectedCurrency = currencyDropdown.value;
        const region = regionDropdown.value;

        // Eingaben validieren
        if ((!language && !selectedLanguage) || (!currency && !selectedCurrency)) {
            errorMessagesDiv.innerHTML = "<p class='text-danger'>Bitte sowohl eine Sprache als auch eine Währung eingeben oder auswählen.</p>";
            return;
        }

        if ((language.length > 0 && language.length < 3) || (currency.length > 0 && currency.length < 3)) {
            errorMessagesDiv.innerHTML = "<p class='text-danger'>Eingaben müssen mindestens 3 Zeichen lang sein.</p>";
            return;
        }

        try {
            const response = await fetch("https://restcountries.com/v3.1/all");
            if (!response.ok) throw new Error("Fehler beim Abrufen der Länderinformationen");

            const countryData = await response.json();

            // Filter anwenden
            const matchingCountries = countryData.filter(country => {
                const countryLanguages = country.languages
                    ? Object.values(country.languages).map(lang => lang.toLowerCase())
                    : [];
                const countryCurrencies = country.currencies
                    ? Object.values(country.currencies).map(curr => curr.name.toLowerCase())
                    : [];
                const languageMatch =
                    countryLanguages.some(lang => lang.includes(language)) ||
                    (selectedLanguage && countryLanguages.includes(selectedLanguage));
                const currencyMatch =
                    countryCurrencies.some(curr => curr.includes(currency)) ||
                    (selectedCurrency && countryCurrencies.includes(selectedCurrency));
                const regionMatch = !region || country.region.toLowerCase() === region;

                return languageMatch && currencyMatch && regionMatch;
            });

            // Ergebnisse anzeigen
            if (matchingCountries.length === 0) {
                countryInfoDiv.innerHTML = "<p class='text-danger'>Keine Länder mit der angegebenen Sprache, Währung und Region gefunden.</p>";
                return;
            }

            countryInfoDiv.innerHTML = matchingCountries.map((country, index) => {
                return `
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
                `;
            }).join('');
        } catch (error) {
            countryInfoDiv.innerHTML = "<p class='text-danger'>Fehler beim Abrufen der Daten oder keine Länder, die den Suchkriterien entsprechen.</p>";
        }
    }

    // Dropdowns für Sprache und Währung befüllen
    fetch("https://restcountries.com/v3.1/all")
        .then(response => response.json())
        .then(data => {
            const languages = new Set();
            const currencies = new Set();

            data.forEach(country => {
                if (country.languages) {
                    Object.values(country.languages).forEach(lang => languages.add(lang));
                }
                if (country.currencies) {
                    Object.values(country.currencies).forEach(curr => currencies.add(curr.name));
                }
            });

            // Alphabetisch sortieren
            const sortedLanguages = Array.from(languages).sort();
            const sortedCurrencies = Array.from(currencies).sort();

            // Dropdown für Sprachen
            languageDropdown.innerHTML = `<option value="">Sprache wählen</option>
                ${sortedLanguages.map(language => `<option value="${language}">${language}</option>`).join('')}`;

            // Dropdown für Währungen
            currencyDropdown.innerHTML = `<option value="">Währung wählen</option>
                ${sortedCurrencies.map(currency => `<option value="${currency}">${currency}</option>`).join('')}`;

            // Regionen-Dropdown befüllen
            const regions = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
            regionDropdown.innerHTML = `<option value="">Region aus der Liste auswählen</option>
                ${regions.map(region => `<option value="${region.toLowerCase()}">${region}</option>`).join('')}`;

            // Klick-Event für den Such-Button
            searchButton.addEventListener("click", fetchLanguageAndCurrencyData);
        })
        .catch(error => console.error("Fehler beim Initialisieren der Dropdowns:", error));
});
