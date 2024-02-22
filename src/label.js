var selectorStates = {
    type: "",
    genre: "",
    is_subscribed: ""
};

function insertCustomBlock() {
    console.log('Attempting to insert custom block');

    let target = document.querySelector('.artists-bio-pic.artists-bio-pic-uploaded.landscape');
    console.log('Querying for .artists-bio-pic.artists-bio-pic-uploaded.landscape');

    if (!target){
        target = document.querySelector('.artists-bio-pic.artists-bio-pic-uploaded.portrait');
        console.log('Querying for .artists-bio-pic.artists-bio-pic-uploaded.portrait');
    }

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
        <div class="custom-row">
            <button id="syncAlbumsButton">Sync albums</button>
        </div>
        <div class="custom-row">
            <button id="fetchUsers">Fetch profiles</button>
        </div>
        <style>
            .custom-row {
                margin-bottom: 10px; /* Space out each row */
            }
            #myCustomBlock select, #myCustomBlock button {
                box-sizing: border-box; /* Includes padding and border in the element's total width and height */
                width: 100%; /* Sets width to fill its container */
                margin: 0; /* Removes default margin */
                border: 1px solid #ccc; /* Optional: Adds a border */
            }
            #myCustomBlock button {
                background-color: #f0f0f0; /* Light grey background */
                cursor: pointer; /* Changes cursor to pointer on hover */
                padding: 2.5px 5px; /* Reduced padding to make the button smaller in height */
                font-size: 12px; /* Optionally reduce font size to fit the smaller button */
                color: black; /* Sets the text color to black */
            }
        </style>
        `;

        // Insert the custom block
        target.insertAdjacentElement('afterend', customBlock);
        console.log('Custom block inserted');

        // Fetch and update UI based on saved state
        fetchSelectorStates();

        $('#selector1, #selector2, #genreSelector').change(function () {
            // Directly update the selectorStates object based on the changes
            selectorStates.type = $('#selector1').val(); // 'artist' or 'label'
            selectorStates.is_subscribed = $('#selector2').val(); // 'yes' or 'no'
            selectorStates.genre = $('#genreSelector').val();

            // Save the updated states
            saveSelectorStates();
        });
        $('#syncAlbumsButton').click(async function () {
            try {
                const albumsData = parseAlbumsData();
                response = await saveAlbumsBatch(albumsData);
                console.log(albumsData);
                artist_url = getURL()
                console.log('Albums data saved successfully:', response);
                window.alert("successfully loaded " + albumsData.length + " albums");
                document.dispatchEvent(new CustomEvent('syncAlbumUsersSuccess', { detail: { artist_url } }));
                console.log('syncArtistSuccess event sent');
            } catch (error) {
                console.error('Error saving albums:', error);
                window.alert("error loading albums " + error);
                document.dispatchEvent(new CustomEvent('syncAlbumUsersError', { detail: { message: error.message, artist_url: artist_url } }));
                console.log('syncArtistError event sent');
            }
        });


        $('#fetchUsers').click(async function () {
            try {
                const albumsData = parseAlbumsData();
                response, users = await saveUsersBatch()
                album_url = getURL()
                console.log('Users data saved successfully:', response);
                window.alert("successfully loaded " + users.length + " users")
                document.dispatchEvent(new CustomEvent('syncAlbumUsersSuccess', { detail: { album_url } }));
            } catch (error) {
                console.error('Error saving users data:', error);
                window.alert("error loading users " + error)
                document.dispatchEvent(new CustomEvent('syncAlbumUsersError', { detail: { message: error.message, album_url: album_url } }));
            }
        });
    } else {
        console.log('Target element not found. Ensure the page has the correct structure.');
    }
}

function fetchSelectorStates() {
    console.log("fetchSelectorStates")
    const baseUrl = window.location.href.match(/^(https?:\/\/[^\/]+\.com)/)[0];

    $.ajax({
        url: 'http://localhost:8092/artist/get',
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
        url: 'http://localhost:8092/artist/save',
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

function parseAlbumsData() {
    // Select the music grid container
    const musicGrid = document.querySelector('#music-grid');
    // Initialize an array to hold the parsed data
    const albumsData = [];

    // Check if musicGrid exists
    if (musicGrid) {
        // Select all album items
        const albumItems = musicGrid.querySelectorAll('li.music-grid-item');

        // Iterate over each album item
        albumItems.forEach(item => {
            // Extract the album title
            const titleElement = item.querySelector('.title');
            const title = titleElement ? titleElement.textContent.trim() : '';

            // Extract the artist name
            const artistElement = item.querySelector('.title .artist-override');
            const artist = artistElement ? artistElement.textContent.trim() : '';

            // Extract the Bandcamp URL
            const linkElement = item.querySelector('a');
            const bandcamp_url = linkElement ? linkElement.href : '';



            // Add the parsed data to the albumsData array
            albumsData.push({ title, artist, bandcamp_url });
        });
    } else {
        console.log('Music grid not found');
    }

    // Return the parsed data
    return albumsData;
}

function getURL() {
    const currentUrl = window.location.href;
    const artistBandcampUrl = currentUrl.split("/")[2]; // Получаем часть до первого "/"
    const baseUrl = artistBandcampUrl.includes('.com') ? artistBandcampUrl.split('.com')[0] + '.com' : artistBandcampUrl;
    return `https://${baseUrl}`
}

async function saveAlbumsBatch(albumsData) {
    await simulateMouseScroll();
    const currentUrl = getURL();

    const dataToSend = {
        albums: albumsData,
        artist_bandcamp_url: currentUrl
    };

    const response = await new Promise((resolve, reject) => {
        $.ajax({
            url: 'http://localhost:8092/album/save-batch',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: resolve,
            error: function (xhr, status, error) {
                reject(error);
            }
        });
    });

    return response
}


async function saveUsersBatch() {
    await clickMoreThumbsUntilDone();
    const userLinks = document.querySelectorAll('.no-writing .fan.pic');
    
    // Извлечь информацию каждого поддерживающего и сохранить в массив
    const users = Array.from(userLinks).map(link => {
        const bandcamp_url = link.getAttribute('href');
        return { bandcamp_url };
    });

    // Формируем данные для отправки
    const dataToSend = {
        users: users,
        album_url: window.location.href,
    };

    // Ожидаем выполнение AJAX-запроса
    const response = await new Promise((resolve, reject) => {
        $.ajax({
            url: 'http://localhost:8092/users/save-batch',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: resolve,
            error: function (xhr, status, error) {
                console.error('Error saving users data:', error);
                reject(error);
            }
        });
    });

    return response, users
}


async function clickMoreThumbsUntilDone() {
    // Найти кнопку "more..."
    const moreButton = document.querySelector('a.more-thumbs');

    // Функция для проверки и клика по кнопке
    async function clickAndCheck() {
        // Проверяем, видима ли кнопка "more..."
        if (moreButton && getComputedStyle(moreButton).display !== 'none') {
            // Кликаем по кнопке
            moreButton.click();
            await delay(2000)
            await clickAndCheck();
        } else {
            console.log('No more items to load or button is not visible');
        }
    }

    // Начать процесс
    await clickAndCheck();
}

function simulateMouseScroll() {
    return new Promise((resolve, reject) => {
        let lastScrollY = window.scrollY;
        let sameScrollCount = 0;

        const scrollInterval = setInterval(() => {
            window.scrollBy({ top: 1000 });
            if (window.scrollY === lastScrollY) {
                sameScrollCount++;
                if (sameScrollCount >= 15) { // Adjust based on your needs
                    console.log('Scrolling stopped, position unchanged for 15 consecutive checks.');
                    clearInterval(scrollInterval);
                    resolve(); // Scrolling finished, resolve the Promise
                }
            } else {
                sameScrollCount = 0; // Reset if we've moved
            }
            lastScrollY = window.scrollY;
        }, 100); // Check every 100ms
    });
}



insertCustomBlock();