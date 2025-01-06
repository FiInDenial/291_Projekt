document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton"); //suchen Button
    const clearButton = document.getElementById("clearButton"); // Eingabe löschen
    const languageDropdown = document.getElementById("languageDropdown"); //Sprache Dropdown
    const manualLanguageInput = document.getElementById("manualLanguageInput"); // Sprache suchfeld
    const currencyDropdown = document.getElementById("currencyDropdown"); //Währung dropdown
    const currencyGroup = document.getElementById("currencyGroup"); // Währung Dropdown im div (ein oder ausblenden)
    const countryInfoDiv = document.getElementById("countryInfo"); // Länderliste (anzeigen)
    const errorMessagesDiv = document.getElementById("errorMessages"); // Fehlerdiv für Meldungen
    const languageDropdownGroup = document.getElementById("languageDropdownGroup"); //Sprache dropdown

    // Clear Button: Eingabefelder zurücksetzen
    clearButton.addEventListener("click", () => { 
        languageDropdown.value = ""; 
        manualLanguageInput.value = "";
        currencyDropdown.value = "";
        currencyGroup.style.display = "none"; //Währung Dropdown wird versteckt
        searchButton.disabled = true; // Suchen Button wird deaktiviert
        countryInfoDiv.innerHTML = ""; //Accordion leer
        errorMessagesDiv.innerHTML = ""; // Fehlerdiv zurücksetzen entfernen
        languageDropdown.style.display = "block"; // Dropdown wieder anzeigen
        languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen
    });

    // Suchbutton: Länder basierend auf Sprache und Währung suchen
    searchButton.addEventListener("click", async () => {
        const selectedLanguage = manualLanguageInput.value.trim() || languageDropdown.value;
        const selectedCurrency = currencyDropdown.value;

        fetchCountriesByLanguageAndCurrency(selectedLanguage, selectedCurrency);
    });


    // Funktion zum Anzeigen der Fehlermeldung
    function showErrorMessage(message) {
        errorMessagesDiv.innerHTML = `<p class="text-danger">${message}</p>`;
    }

   // Überprüfen, ob die Eingabe nur Buchstaben und Leerzeichen enthält
function isValidLanguage(input) {
    const regex = /^[A-Za-zÄäÖöÜüß\s]+$/; // Nur Buchstaben und Leerzeichen
    return regex.test(input);
}


// Manuelle Spracheingabe 
manualLanguageInput.addEventListener("input", () => {
    const manualInputValue = manualLanguageInput.value.trim(); //Leerzeichen am Anfang und Ende entfernen

     // 1. Wenn eine gültige Eingabe vorliegt (nur Buchstaben)
    if (manualInputValue && isValidLanguage(manualInputValue)) { //wenn InputValue und IsValidLanguage true sind
        languageDropdown.style.display = "none"; // Sprache Dropdown ausblenden
        fetchCurrenciesByLanguage(manualInputValue); // Währungen basierend auf der manuellen Eingabe holen
        searchButton.disabled = false; // Suchbutton aktivieren
        languageDropdownGroup.querySelector("label").style.display = "none"; // Label ausblenden
        errorMessagesDiv.style.display = "none"; // Fehlermeldung entfernen

     // 2. Wenn eine ungültige Eingabe vorliegt (z. B. Zahlen oder Sonderzeichen)
    } else if (manualInputValue) {
        languageDropdown.style.display = "block"; // Sprache-Dropdown anzeigen
        currencyGroup.style.display = "none"; // Währungs-Dropdown ausblenden
        searchButton.disabled = true; // Suchbutton deaktivieren
        errorMessagesDiv.style.display = "block"; // Fehlermeldung anzeigen
        showErrorMessage("Nur Buchstaben erlaubt"); // Fehler anzeigen
        languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen

     // 3. Wenn nichts eingegeben wurde
    } else {
        languageDropdown.style.display = "block"; // Dropdown anzeigen
        currencyGroup.style.display = "none"; // Währungs-Dropdown ausblenden
        searchButton.disabled = true; // Suchbutton deaktivieren
        errorMessagesDiv.style.display = "none"; // Fehlermeldung entfernen
        languageDropdownGroup.querySelector("label").style.display = "block"; // Label wieder anzeigen
    }
});



    // Funktion: Währungen basierend auf der manuellen Spracheingabe holen
    async function fetchCurrenciesByLanguage(language) { // async funktion wartet auf Daten von API
        currencyDropdown.innerHTML = '<option value="">Währung wählen</option>'; // Dropdown zurücksetzen
        currencyGroup.style.display = "none"; // Initial ausblenden vorübergehend bis Daten erhalten wurden

        try {
            const response = await fetch(`https://restcountries.com/v3.1/lang/${language}`); // (Language) ist dynmaisch - Länder mit der eingegebenen Sprache suchen
            if (!response.ok) throw new Error("Fehler beim Abrufen der Länderdaten für diese Sprache"); //Wenn keine gültige Anwort Fehlermeldung

            const countryData = await response.json(); // wird mit .json() in javascript Objekt umgewandelt
            const currencies = new Set(); // Ein Set wird erstellt, um alle Währungen zu speichern. Ein Set speichert jeden Wert nur einmal

            countryData.forEach(country => { // Es wird durch alle Länder-Daten iteriert
                if (country.currencies) { //Prüfen, ob das Land überhaupt Währungen hat
                    Object.values(country.currencies).forEach(currency => { //Die Währungsobjekte zb Euro werden in ein Array umgewandelt.
                        currencies.add(currency.name); // Jede Währung wird zum Set hinzugefügt (keine Duplikate!).
                    });
                }
            });


            // Währungs-Dropdown befüllen und alphabetisch sortieren
            if (currencies.size > 0) { // Prüfen, ob das Set Währungen enthält
                const sortedCurrencies = Array.from(currencies).sort(); //sortieren alphabetisch
                sortedCurrencies.forEach(currency => { //alphabetisches Array 
                    const option = document.createElement("option"); // neues HTML-Element vom Typ <option> erstellt.
                    option.value = currency; // setzt den Wert (Attribut value) des <option>-Elements - zb <option value="Euro">.
                    option.textContent = currency; // bestimmt den Text, der im Dropdown-Menü angezeigt wird. zb Euro
                    currencyDropdown.appendChild(option); // Neu erstelltes <option>-Element in das Dropdown hinzugefügt.
                });
                currencyGroup.style.display = "block"; // Dropdown anzeigen
            }
        } catch (error) {
            console.error(`Fehler beim Abrufen der Währungen: ${error.message}`); //Wennfehller wirds in Konsole angezeigt
        }
    }

    //DROPDOWN FüR Währung
    // Währungen basierend auf der Auswahl im Dropdown holen
    languageDropdown.addEventListener("change", () => { // wenn etwas im Dropdown ausgewählt wurde
        const selectedLanguage = languageDropdown.value.trim(); //Liefert ausgewähöte Sprache 
    
        if (selectedLanguage) {   //Prüft, ob eine Sprache ausgewählt wurde wenn ja dann wird folgender Code ausgeführt
            manualLanguageInput.value = ''; // manuelles Sprache-Eingabefeld zurücksetzen
            fetchCurrenciesByLanguage(selectedLanguage); //  Funktion holt Währungen für die ausgewählte Sprache von der API ab und fügt sie ins Währungs-Dropdown ein
            searchButton.disabled = false; // Suchbutton aktivieren
            languageDropdownGroup.querySelector("label").style.display = "none"; // Label "Sprache wählen" ausblenden
            errorMessagesDiv.innerHTML = ""; // Fehlermeldung entfernen falls vorhanden

        }
    });


    // Länder basierend auf Sprache und Währung suchen
    async function fetchCountriesByLanguageAndCurrency(language, currency) { 
        countryInfoDiv.innerHTML = ''; // Suchergebnisse zurücksetzen

        try {
            const response = await fetch(`https://restcountries.com/v3.1/lang/${language}`); //ruft API auf 
            if (!response.ok) throw new Error("Ungültige Sprache"); // wenn keine Antowrt > Fehlermeldung

            const countryData = await response.json();//countryData: Array mit Länder- offizielle Sprache mit (language) übereinstimmt.
            //Filter: Durchläuft das Array von Ländern und wählt nur die Länder aus, die die gewünschte Währung haben.
            const matchingCountries = countryData.filter(country => { 
                if (country.currencies) { //Überprüft, ob das Land eine Währungsinformation enthält 
                    const countryCurrencies = Object.values(country.currencies).map(curr => curr.name.toLowerCase()); //Die Währungsinformationen sind als  im Array gespeichert
                    return countryCurrencies.includes(currency.toLowerCase()); //andelt die Namen der Währungen in Kleinbuchstaben um
                }
                return false; //Falls ein Land keine Währungsinformationen hat, wird es ausgeschlossen
            });



            // matchingCountires:  Array der Länder, die sowohl die gewünschte Sprache und Währung erfüllen 
            // Länder alphabetisch sortieren
            const sortedCountries = matchingCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));

            if (sortedCountries.length === 0) { //Überprüft die Anzahl der Länder im sortedCountries-Array.
                countryInfoDiv.innerHTML = "<p class='text-danger'>Keine Länder gefunden, die sowohl die Sprache als auch die Währung enthalten.</p>";
                return; //Wenn keine im Array sind dann Fehlermeldung
            }




// durchläuft das Array sortedCountries >erzeugt für jedes Land einen HTML-String
            countryInfoDiv.innerHTML = sortedCountries.map((country, index) => {  // index wird verwendet, um eindeutige IDs für die HTML-Elemente zu erstellen.
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
            }).join(''); //die einzelnen HTML-Strings zu einem großen String , damit sie direkt in innerHTML eingefügt werden können.

            
        } catch (error) { //Es wird eine Fehlermeldung angezeigt wenn API, Internet, Serverfehler gibt
            countryInfoDiv.innerHTML = `<p class='text-danger'>Fehler beim Abrufen der Länder: ${error.message}</p>`;
        }
    }


    // Initiale Sprache und Währung laden (nur einmal beim ersten Laden der Seite)
    async function fetchLanguages() {
        try {
            const response = await fetch("https://restcountries.com/v3.1/all"); //Liste aller Länder abrufen
            if (!response.ok) throw new Error("Fehler beim Laden der Länder"); //wenn nicht geht Fehlermeldung

            const countryData = await response.json(); //json lesen und umwandeln
            const languages = new Set(); // Set speichert alle sprachen (nur 1 mal)

            countryData.forEach(country => { //geht durch jedes Land in der Antwort
                if (country.languages) {
                    Object.values(country.languages).forEach(language => {  //Sprache feld wird in Objekt gefügt
                        languages.add(language); //Für jede Sprache wird languages.add(language) aufgerufen, um die Sprache zum Set hinzuzufügen
                    });
                }
            });



            // Sprachen alphabetisch sortieren
            const sortedLanguages = Array.from(languages).sort();  // Sprachen werden in Array gefügt


            sortedLanguages.forEach(language => { //Sprache im Sortierten Array iterieren
                const option = document.createElement("option"); //für jedesprache wird option erstellt 
                option.value = language; //setzt value auf namen der Sprache
                option.textContent = language; //Angezeigten Text des Dropdown-Menüs auf den Namen der Sprache
                languageDropdown.appendChild(option); //fügt das neue option-Element in languageDropdown ein
            });
            
        } catch (error) {
            console.error(`Fehler beim Abrufen der Sprachen: ${error.message}`);
        }
    }
    

    fetchLanguages(); // Sprachen beim Laden der Seite abrufen
});
