document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const clearButton = document.getElementById("clearButton");
    const languageDropdown = document.getElementById("languageDropdown");
    const manualLanguageInput = document.getElementById("manualLanguageInput");
    const currencyDropdown = document.getElementById("currencyDropdown");
    const currencyGroup = document.getElementById("currencyGroup");
    const countryInfoDiv = document.getElementById("countryInfo");
    const errorMessagesDiv = document.getElementById("errorMessages"); // Fehlerdiv für Meldungen
    const languageDropdownGroup = document.getElementById("languageDropdownGroup");

    // Clear Button: Eingabefelder zurücksetzen
    clearButton.addEventListener("click", () => {
        languageDropdown.value = "";
        manualLanguageInput.value = "";
        currencyDropdown.value = "";
        currencyGroup.style.display = "none";
        searchButton.disabled = true;
        countryInfoDiv.innerHTML = "";
        errorMessagesDiv.innerHTML = ""; // Fehlerdiv zurücksetzen
        languageDropdown.style.display = "block"; // Dropdown wieder anzeigen
        languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen
    });

   // Überprüfen, ob die Eingabe nur Buchstaben und Leerzeichen enthält
function isValidLanguage(input) {
    const regex = /^[A-Za-zÄäÖöÜüß\s]+$/; // Nur Buchstaben und Leerzeichen
    return regex.test(input);
}

// Manuelle Spracheingabe
manualLanguageInput.addEventListener("input", () => {
    const manualInputValue = manualLanguageInput.value.trim();

    if (manualInputValue && isValidLanguage(manualInputValue)) {
        languageDropdown.style.display = "none"; // Dropdown ausblenden
        fetchCurrenciesByLanguage(manualInputValue); // Währungen basierend auf der manuellen Eingabe holen
        searchButton.disabled = false; // Suchbutton aktivieren
        languageDropdownGroup.querySelector("label").style.display = "none"; // Label ausblenden
        errorMessagesDiv.style.display = "none"; // Fehlermeldung entfernen
    } else if (manualInputValue) {
        languageDropdown.style.display = "block"; // Dropdown anzeigen
        currencyGroup.style.display = "none"; // Währungs-Dropdown ausblenden
        searchButton.disabled = true; // Suchbutton deaktivieren
        errorMessagesDiv.style.display = "block"; // Fehlermeldung anzeigen
        showErrorMessage("Nur Buchstaben erlaubt"); // Fehler anzeigen
        languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen
    } else {
        languageDropdown.style.display = "block"; // Dropdown anzeigen
        currencyGroup.style.display = "none"; // Währungs-Dropdown ausblenden
        searchButton.disabled = true; // Suchbutton deaktivieren
        errorMessagesDiv.style.display = "none"; // Fehlermeldung entfernen
        languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen
    }
});

    // Funktion zum Anzeigen der Fehlermeldung
    function showErrorMessage(message) {
        errorMessagesDiv.innerHTML = `<p class="text-danger">${message}</p>`;
    }

    // Währungen basierend auf der manuellen Spracheingabe holen
    async function fetchCurrenciesByLanguage(language) {
        currencyDropdown.innerHTML = '<option value="">Währung wählen</option>'; // Dropdown zurücksetzen
        currencyGroup.style.display = "none"; // Initial ausblenden

        try {
            const response = await fetch(`https://restcountries.com/v3.1/lang/${language}`);
            if (!response.ok) throw new Error("Fehler beim Abrufen der Länderdaten für diese Sprache");

            const countryData = await response.json();
            const currencies = new Set();

            countryData.forEach(country => {
                if (country.currencies) {
                    Object.values(country.currencies).forEach(currency => {
                        currencies.add(currency.name);
                    });
                }
            });

            // Währungs-Dropdown befüllen und alphabetisch sortieren
            if (currencies.size > 0) {
                const sortedCurrencies = Array.from(currencies).sort();
                sortedCurrencies.forEach(currency => {
                    const option = document.createElement("option");
                    option.value = currency;
                    option.textContent = currency;
                    currencyDropdown.appendChild(option);
                });
                currencyGroup.style.display = "block"; // Dropdown anzeigen
            }
        } catch (error) {
            console.error(`Fehler beim Abrufen der Währungen: ${error.message}`);
        }
    }

    // Währungen basierend auf der Auswahl im Dropdown holen
    languageDropdown.addEventListener("change", () => {
        const selectedLanguage = languageDropdown.value.trim();
        if (selectedLanguage) {
            manualLanguageInput.value = ''; // Eingabefeld zurücksetzen
            fetchCurrenciesByLanguage(selectedLanguage); // Währungen basierend auf der Auswahl holen
            searchButton.disabled = false; // Suchbutton aktivieren
            languageDropdownGroup.querySelector("label").style.display = "none"; // Label ausblenden
            errorMessagesDiv.innerHTML = ""; // Fehlermeldung entfernen
        }
    });

    // Manuelle Spracheingabe
    manualLanguageInput.addEventListener("input", () => {
        const manualInputValue = manualLanguageInput.value.trim();

        if (manualInputValue && isValidLanguage(manualInputValue)) {
            languageDropdown.style.display = "none"; // Dropdown ausblenden
            fetchCurrenciesByLanguage(manualInputValue); // Währungen basierend auf der manuellen Eingabe holen
            searchButton.disabled = false; // Suchbutton aktivieren
            languageDropdownGroup.querySelector("label").style.display = "none"; // Label ausblenden
            errorMessagesDiv.innerHTML = ""; // Fehlermeldung entfernen
        } else if (manualInputValue) {
            languageDropdown.style.display = "block"; // Dropdown anzeigen
            currencyGroup.style.display = "none"; // Währungs-Dropdown ausblenden
            searchButton.disabled = true; // Suchbutton deaktivieren
            errorMessagesDiv.innerHTML = `<p class="text-danger">Nur Buchstaben erlaubt</p>`; // Fehlermeldung anzeigen
            languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen
        } else {
            languageDropdown.style.display = "block"; // Dropdown anzeigen
            currencyGroup.style.display = "none"; // Währungs-Dropdown ausblenden
            searchButton.disabled = true; // Suchbutton deaktivieren
            errorMessagesDiv.innerHTML = ""; // Fehlermeldung entfernen
            languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen
        }
    });

    // Suchbutton-Click: Länder basierend auf Sprache und Währung suchen
    searchButton.addEventListener("click", async () => {
        const selectedLanguage = manualLanguageInput.value.trim() || languageDropdown.value;
        const selectedCurrency = currencyDropdown.value;

        fetchCountriesByLanguageAndCurrency(selectedLanguage, selectedCurrency);
    });

    // Länder basierend auf Sprache und Währung suchen
    async function fetchCountriesByLanguageAndCurrency(language, currency) {
        countryInfoDiv.innerHTML = ''; // Suchergebnisse zurücksetzen

        try {
            const response = await fetch(`https://restcountries.com/v3.1/lang/${language}`);
            if (!response.ok) throw new Error("Ungültige Sprache");

            const countryData = await response.json();
            const matchingCountries = countryData.filter(country => {
                if (country.currencies) {
                    const countryCurrencies = Object.values(country.currencies).map(curr => curr.name.toLowerCase());
                    return countryCurrencies.includes(currency.toLowerCase());
                }
                return false;
            });

            // Länder alphabetisch sortieren
            const sortedCountries = matchingCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));

            if (sortedCountries.length === 0) {
                countryInfoDiv.innerHTML = "<p class='text-danger'>Keine Länder gefunden, die sowohl die Sprache als auch die Währung enthalten.</p>";
                return;
            }

            countryInfoDiv.innerHTML = sortedCountries.map((country, index) => {
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
                                    <p><strong>Sprache(n):</strong> ${country.languages ? Object.values(country.languages).join(", ") : "Nicht verfügbar"}</p>
                                    <p><strong>Währung:</strong> ${country.currencies ? Object.values(country.currencies)[0].name : "Nicht verfügbar"}</p>
                                    <p><strong>Bevölkerung:</strong> ${country.population.toLocaleString()}</p>
                                    <p><strong>Fläche:</strong> ${country.area ? `${country.area.toLocaleString()} km²` : "Keine Daten"}</p>
                                    <p><strong>Region:</strong> ${country.region}</p>
                                    <p><strong>Nachbarländer:</strong> ${country.borders ? country.borders.join(", ") : "Keine Daten"}</p>
                                    <p><strong>Einheimischer Name:</strong> ${country.name.nativeName ? Object.values(country.name.nativeName).map(n => n.common).join(", ") : "Nicht verfügbar"}</p>
                                    <p><strong>Kartenlink:</strong> <a href="${country.maps.googleMaps}" target="_blank">Google Maps</a></p>

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
            countryInfoDiv.innerHTML = `<p class='text-danger'>Fehler beim Abrufen der Länder: ${error.message}</p>`;
        }
    }

    // Initiale Sprache und Währung laden (nur einmal beim ersten Laden der Seite)
    async function fetchLanguages() {
        try {
            const response = await fetch("https://restcountries.com/v3.1/all");
            if (!response.ok) throw new Error("Fehler beim Laden der Länder");

            const countryData = await response.json();
            const languages = new Set();

            countryData.forEach(country => {
                if (country.languages) {
                    Object.values(country.languages).forEach(language => {
                        languages.add(language);
                    });
                }
            });

            // Sprachen alphabetisch sortieren
            const sortedLanguages = Array.from(languages).sort();

            sortedLanguages.forEach(language => {
                const option = document.createElement("option");
                option.value = language;
                option.textContent = language;
                languageDropdown.appendChild(option);
            });
        } catch (error) {
            console.error(`Fehler beim Abrufen der Sprachen: ${error.message}`);
        }
    }
    

    fetchLanguages(); // Sprachen beim Laden der Seite abrufen
});
