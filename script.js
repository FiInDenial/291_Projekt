async function fetchLanguageAndCurrencyData() {
    const languageInput = document.getElementById("languageInput").value.trim().toLowerCase();
    const currencyInput = document.getElementById("currencyInput").value.trim().toLowerCase();
    const selectedLanguage = document.getElementById("languageDropdown").value.toLowerCase();
    const selectedCurrency = document.getElementById("currencyDropdown").value.toLowerCase();
    const region = document.getElementById("regionDropdown").value.toLowerCase();
    const countryInfoDiv = document.getElementById("countryInfo");

    // Fehlerbereich zurücksetzen
    document.getElementById("errorMessages").innerHTML = "";

    // Validierung: Mindestens ein Eingabe- oder Dropdown-Wert erforderlich
    if ((!languageInput && !selectedLanguage) || (!currencyInput && !selectedCurrency)) {
        document.getElementById("errorMessages").innerHTML =
            "<p class='text-danger'>Bitte geben Sie eine Sprache und eine Währung ein oder wählen Sie sie aus.</p>";
        return;
    }

    // Validierung: Mindestens 3 Zeichen für Eingaben erforderlich
    if ((languageInput && languageInput.length < 3) || (currencyInput && currencyInput.length < 3)) {
        document.getElementById("errorMessages").innerHTML =
            "<p class='text-danger'>Eingaben müssen mindestens 3 Zeichen lang sein.</p>";
        return;
    }

    try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) throw new Error("Fehler beim Abrufen der Länderinformationen.");

        const countryData = await response.json();

        // Filterlogik: Verarbeite die Länderdaten und filtere sie nach den Eingabewerten
        const matchingCountries = countryData.filter(country => {
            const countryLanguages = country.languages ? Object.values(country.languages).map(lang => lang.toLowerCase()) : [];
            const countryCurrencies = country.currencies ? Object.values(country.currencies).map(curr => curr.name.toLowerCase()) : [];
            const countryRegion = country.region ? country.region.toLowerCase() : "";

            // Überprüfe die Übereinstimmung von Sprache
            const languageMatch = 
                (languageInput && countryLanguages.some(lang => lang.includes(languageInput))) ||
                (selectedLanguage && countryLanguages.includes(selectedLanguage));

            // Überprüfe die Übereinstimmung der Währung
            const currencyMatch =
                (currencyInput && countryCurrencies.some(curr => curr.includes(currencyInput))) ||
                (selectedCurrency && countryCurrencies.includes(selectedCurrency));

            // Überprüfe die Übereinstimmung der Region (optional)
            const regionMatch = !region || countryRegion === region;

            // Alle drei Bedingungen müssen zutreffen
            return languageMatch && currencyMatch && regionMatch;
        });

        // Ergebnisse anzeigen
        if (matchingCountries.length === 0) {
            countryInfoDiv.innerHTML = "<p class='text-danger'>Keine Länder gefunden, die den Kriterien entsprechen.</p>";
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
                    <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#accordionExample">
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
        document.getElementById("errorMessages").innerHTML =
            "<p class='text-danger'>Fehler beim Abrufen der Daten oder bei der Verarbeitung.</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const languageDropdown = document.getElementById("languageDropdown");
    const currencyDropdown = document.getElementById("currencyDropdown");
    const regionDropdown = document.getElementById("regionDropdown");

    // Regionen-Dropdown befüllen
    const regions = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
    regionDropdown.innerHTML = `<option value="">Region aus der Liste auswählen</option>
        ${regions.map(region => `<option value="${region.toLowerCase()}">${region}</option>`).join('')}`;

    // Dropdowns für Sprache und Währung befüllen
    fetch("https://restcountries.com/v3.1/all").then(response => response.json())
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

            searchButton.addEventListener("click", fetchLanguageAndCurrencyData);
        });
});
