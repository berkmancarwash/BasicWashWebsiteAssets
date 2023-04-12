document.addEventListener("load", event => {
    document.querySelector("submitNumberPlate").addEventListener("click", searchNumberPlate);
});


var input = document.getElementById("enter");
input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("submitNumberPlate").click();
    }
});



var washboxes = [
    {name: "Barendrecht", height: "2900", width: "2580" },
    {name: "Express Breda", height: "2900", width: "2580"},
    {name: "Hellevoetsluis", height: "2600", width: "2380"},
    {name: "Hoek van Holland", height: "2900", width: "2580" },
    {name: "Oosterhout", height: "2600", width: "2580" },
    {name: "Sint Willebrord", height: "2400", width: "2380"},
    {name: "Terheijden", height: "2600", width: "2360" },
    {name: "Ulvenhout", height: "2400", width: "2380" },
];

// car information
var carMake;
var carModel;
var carYear;
var carWidth;
var carHeight;


function searchGekentekendeVoertuig(numberPlate) {
    let gekentekendeVoertuigUrl = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=' + numberPlate;
    var fetchoptions = {
        method: 'GET',
    };

    fetch(gekentekendeVoertuigUrl, fetchoptions)
        .then((res) =>
            res.json()
        )
        .then((res) => {
            // console.log(res[0]);
            carMake = res[0].merk;
            carModel = res[0].handelsbenaming;
            carYear = (res[0].datum_eerste_toelating).substring(0, 4);

            uitvoering = res[0].uitvoering;

            if (res[0].hoogte_voertuig != null && res[0].breedte != null) {
                carHeight = res[0].hoogte_voertuig;
                carWidth = res[0].breedte;
                checkToSeeIfCarFitsInWashBox()
            } else {
                searchEEGVoertuigtypegoedkeuring(res[0].typegoedkeuringsnummer);
            }

        })
        .catch(() => {
            let dataArea = document.getElementById('list');
            dataArea.innerHTML = `
                <p>Helaas! We hebben je kenteken niet gevonden in onze database</p>
                <p>Controleer het kenteken of neem anders contact op met de klantenservice</p>
                `;
        })
}


function searchEEGVoertuigtypegoedkeuring(typeGoedKeuringsNummer) {
    let EEGVoertuigtypegoedkeuringUrl = 'https://opendata.rdw.nl/resource/55kv-xf7m.json?typegoedkeuringsnummer=' + typeGoedKeuringsNummer;
    var fetchoptions = {
        method: 'GET',
    };

    fetch(EEGVoertuigtypegoedkeuringUrl, fetchoptions)
        .then((res2) =>
            res2.json()
        )
        .then((res2) => {
            // console.log(res2[0]);
            searchBasisgegevensEEGUitvoering(res2[0].eu_type_goedkeuringssleutel, uitvoering);

        })
        .catch(() => {
            let dataArea = document.getElementById('list');
            dataArea.innerHTML = `
                <p>Helaas! We hebben je kenteken niet gevonden in onze database</p>
                <p>Controleer het kenteken of neem anders contact op met de klantenservice</p>
                `;
        })
}


function searchBasisgegevensEEGUitvoering(eu_type_goedkeuringssleutel, eeg_uitvoeringscode) {
    let BasisgegevensEEGUitvoeringUrl = 'https://opendata.rdw.nl/resource/wx3j-69ie.json?eu_type_goedkeuringssleutel=' + eu_type_goedkeuringssleutel + '&eeg_uitvoeringscode=' + eeg_uitvoeringscode;
    var fetchoptions = {
        method: 'GET',
    };

    fetch(BasisgegevensEEGUitvoeringUrl, fetchoptions)
        .then((res3) =>
            res3.json()
        )
        .then((res3) => {
            // console.log(res3[0]);

            carWidth = res3[0].breedte_voertuig_uitvoering_bovengrens;
            carHeight = res3[0].hoogte_voertuig_uitvoering_bovengrens;

            checkToSeeIfCarFitsInWashBox();

        })
        .catch(() => {
            let dataArea = document.getElementById('list');
            dataArea.innerHTML = `
                <p>Helaas! We hebben je kenteken niet gevonden in onze database</p>
                <p>Controleer het kenteken of neem anders contact op met de klantenservice</p>
                `;
        })
}


function checkToSeeIfCarFitsInWashBox() {
    let dataArea = document.getElementById('list');
    dataArea.innerHTML = `
                        <p>${carMake}  ${carModel}</p>
                        <div id="heading"></div>
                        <table id="listWashBoxes">
                        <tr>
                            <th>Locatie</th>
                            <th>Hoogte</th>
                            <th>Breedte</th>
                        </tr>
                        </table>
                        <p>*Dit is alleen van toepassing op de standaarduitvoering. 
                        Heb je twijfels? Vraag het ons eerst. Deze autocheck is een 
                        hulpmiddel en hier kunnen geen rechten aan worden ontleend.</p>
                        `;

    var fitCounter = 0;
    for (let i = 0; i < washboxes.length; i++) {


        washboxesHightM = (washboxes[i].height).substring(0, 1) + '.' + (washboxes[i].height).substring(1, 3);
        washboxesWidthM = (washboxes[i].width).substring(0, 1) + '.' + (washboxes[i].width).substring(1, 3);

        if (carHeight <= washboxes[i].height && carWidth <= washboxes[i].width) {
            fitCounter++;
            let dataArea2 = document.getElementById('listWashBoxes');
            var row = `
                    <tr class="fit">
                    <td>${washboxes[i].name}</td>
                    <td>${washboxesHightM}m</td>
                    <td>${washboxesWidthM}m</td>
                        <td><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#6DD038"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></td>
                    </tr>
                    `
            dataArea2.innerHTML += row;

        } else {
            let dataArea2 = document.getElementById('listWashBoxes');
            var row = `
                    <tr class="nofit">
                        <td>${washboxes[i].name}</td>
                        <td>${washboxesHightM}m</td>
                        <td>${washboxesWidthM}m</td>
                        <td><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#AB0000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/></svg></td>
                    </tr>
                    `
            dataArea2.innerHTML += row;

        }
        var carHeightM = carHeight.substring(0, 1) + '.' + carHeight.substring(1, 3);
        var carWidthM = carWidth.substring(0, 1) + '.' + carWidth.substring(1, 3);

        if (fitCounter === 0) {
            let dataArea = document.getElementById('heading');
            dataArea.innerHTML = `
                        <h2>Jouw auto is ${carHeightM}m hoog en ${carWidthM}m breed en past helaas niet in onze wasstraten*</h2>
                        `;
        } else if (fitCounter === washboxes.length) {
            let dataArea = document.getElementById('heading');
            dataArea.innerHTML = `
                        <h2>Jouw auto is ${carHeightM}m hoog en ${carWidthM}m breed en past in onze wasstraten*</h2>
                        `;
        } else if (fitCounter > 0) {
            let dataArea = document.getElementById('heading');
            dataArea.innerHTML = `
                        <h2>Jouw auto is ${carHeightM}m hoog en ${carWidthM}m breed en past in een aantal van onze wasstraten*
                        `;
        }

    }
}


function searchNumberPlate(event) {
    let numberPlate = document.getElementById("numberPlateInput").value;

    // string formating
    let numberPlateFormatted = "";
    for (var i = 0; i < numberPlate.length; i++) {
        if (numberPlate[i] !== " " && numberPlate[i] !== "-") {
            numberPlateFormatted += numberPlate[i];
        }
    }

    if (numberPlateFormatted.length === 6) {
        searchGekentekendeVoertuig(numberPlateFormatted.toUpperCase());
    } else {
        alert("Vul een geldig kenteken \n" +
            "eg: ABC123, 12AB45");
    }
}
