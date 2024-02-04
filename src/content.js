var selectorStates = {
    type: "", // "artist" or "label"
    genre: "",
    is_subscribed: "" // "yes" or "no"
};


function insertCustomBlock() {
    console.log('Attempting to insert custom block');

    let target = document.querySelector('.artists-bio-pic.artists-bio-pic-uploaded.landscape');
    console.log('Querying for .artists-bio-pic.artists-bio-pic-uploaded.landscape');

    if (target) {
        console.log('Target element found:', target);

        // Create the container for the custom content
        let customBlock = document.createElement('div');
        customBlock.id = "myCustomBlock";
        customBlock.style.padding = "10px";
        customBlock.style.backgroundColor = "transparent";
        customBlock.innerHTML = `
            <div class="custom-row">
                <select id="selector1">
                    <option value="" selected disabled>Select</option>
                    <option value="artist">Artist</option>
                    <option value="label">Label</option>
                </select>
            </div>
            <div class="custom-row">
                <select id="genreSelector">
                    <option value="" selected disabled>Select</option>
                    <option value="techno">Techno</option>
                    <option value="hardTechno">Hard Techno</option>
                    <option value="house">House</option>
                    <option value="techHouse">Tech House</option>
                    <option value="melodic">Melodic</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="custom-row">
                <select id="selector2">
                    <option value="" selected disabled>Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
            </div>
            <style>
                .custom-row {
                    margin-bottom: 10px; /* Space out each row */
                }
                #myCustomBlock select {
                    box-sizing: border-box; /* Includes padding and border in the element's total width and height */
                    width: 100%; /* Sets width to fill its container */
                    padding: 5px; /* Adjust padding as needed */
                    margin: 0; /* Removes default margin */
                    border: 1px solid #ccc; /* Optional: Adds a border */
                }
            </style>
        `;

        // Insert the custom block
        target.insertAdjacentElement('afterend', customBlock);
        console.log('Custom block inserted');

        // Fetch and update UI based on saved state
        fetchSelectorStates();
        
        $('#selector1, #selector2, #genreSelector').change(function() {
            // Directly update the selectorStates object based on the changes
            selectorStates.type = $('#selector1').val(); // 'artist' or 'label'
            selectorStates.is_subscribed = $('#selector2').val(); // 'yes' or 'no'
            selectorStates.genre = $('#genreSelector').val();
        
            // Save the updated states
            saveSelectorStates();
        });
        
    } else {
        console.log('Target element not found. Ensure the page has the correct structure.');
    }
}

function fetchSelectorStates() {
    console.log("fetchSelectorStates")
    const baseUrl = window.location.href.match(/^(https?:\/\/[^\/]+\.com)/)[0];

    $.ajax({
        url: 'http://localhost:8092/get',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            bandcamp_url: baseUrl // Use the base URL
        }),
        success: function (response) {
            console.log("fetchSelectorStates : success")
            var dbModel = typeof response === 'string' ? JSON.parse(response) : response;
            selectorStates.type = dbModel.type; // Could be 'artist' or 'label'
            selectorStates.is_subscribed = dbModel.is_subscribed ? 'yes' : 'no'; // Convert boolean to 'yes' or 'no'
            selectorStates.genre = dbModel.genre; // Directly use the genre
            $('#selector1').val(selectorStates.type);
            $('#selector2').val(selectorStates.is_subscribed);
            $('#genreSelector').val(selectorStates.genre);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error fetching selector states:', textStatus, errorThrown);
        }
    });
}

function saveSelectorStates() {
    console.log("saveSelectorStates")
    const baseUrl = window.location.href.match(/^(https?:\/\/[^\/]+\.com)/)[0];
    let dbModel = {
        type: selectorStates.type, // Directly use 'artist' or 'label'
        is_subscribed: selectorStates.is_subscribed === 'yes', // Convert 'yes'/'no' to boolean
        genre: selectorStates.genre,
        bandcamp_url: baseUrl,
    };

    $.ajax({
        url: 'http://localhost:8092/save',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dbModel),
        success: function (response) {
            console.log('Selector states saved:', response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error saving selector states:', textStatus, errorThrown);
        }
    });
}

insertCustomBlock();