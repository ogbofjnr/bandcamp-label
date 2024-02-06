
async function clickShowMoreButton() {
    console.log('clickThirdShowMoreButton');

    const containers = document.querySelectorAll('.expand-container');
    // Итерировать через каждый контейнер
    containers.forEach(container => {
        // Внутри каждого контейнера найти кнопку 'show-more'
        const button = container.querySelector('.show-more');
        // Если кнопка найдена, нажать на неё
        if (button) {
            button.click();
         console.log('Found show-more buttons, attempting to click');
        }else{
         console.log('Didnt find show more button');

        }
    });
}

function simulateMouseScroll() {
    return new Promise((resolve, reject) => {
        let lastScrollY = window.scrollY;
        let sameScrollCount = 0;

        const scrollInterval = setInterval(() => {
            window.scrollBy({ top: 1000 });
            if (window.scrollY === lastScrollY) {
                sameScrollCount++;
                if (sameScrollCount >= 50) { // Adjust based on your needs
                    console.log('Scrolling stopped, position unchanged for 50 consecutive checks.');
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


async function extractLabelData() {
    // Assuming 'followeer-item-container' is the class that each label item has
    const items = document.querySelectorAll('.followeer-item-container');
    const labels = [];

    items.forEach(item => {
        const labelURL = item.querySelector('.fan-image a')?.href;
        const labelName = item.querySelector('.fan-username')?.textContent;
        if (labelURL && labelName) {
            labels.push({ labelName, labelURL });
        }
    });

    // Logging each label's name and URL
    // labels.forEach(label => {
    //     console.log(`labelName=${label.labelName} labelURL=${label.labelURL}`);
    // });

    // Return the labels array if you need to use the extracted data elsewhere
    return labels;
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadLabels() {
    try {
        console.log('Starting process...');
        if (window.location.pathname.replace(/\/$/, '') === '/following/artists_and_labels') {
            console.log(window.location.pathname)
            console.log("wrong page, can't load labels")
            return
        }
        await clickShowMoreButton(); // Ensure this function is set up for async operation
        await simulateMouseScroll(); // Ensure this function is set up for async operation
        const labels = await extractLabelData(); // No need for await unless this function becomes async
        console.log("total labels : " + labels.length);
        await saveArtistsInBulk(labels)
        window.alert("successfully loaded " + labels.length + " labels")
    } catch (error) {
        window.alert("error loading labels " + error)
    }
}

function injectSaveLabelsButton() {
    // Find the "Share Profile" button container
    const shareProfileContainer = document.querySelector('.share-items');

    if (shareProfileContainer) {
        // Define the "Save Labels" button HTML with inline CSS
        const buttonHTML = `
            <button class="save-labels-btn" style="margin-left: 10px; padding: 5px 10px; font-size: 14px; cursor: pointer;">
                Save Labels
            </button>
        `;

        // Create a container for the new button to control styling and placement easily
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'inline-block'; // Ensure it aligns correctly with existing buttons
        buttonContainer.innerHTML = buttonHTML;

        // Append the new button container to the share profile container
        shareProfileContainer.appendChild(buttonContainer);

        // Add click event listener to the newly added button
        const saveLabelsButton = buttonContainer.querySelector('.save-labels-btn');
        saveLabelsButton.addEventListener('click', function () {
            console.log('Save Labels button clicked');
            loadLabels()
        });
    }
}

async function saveArtistsInBulk(labels) {
    console.log("saveArtistsInBulk");

    // Map each label to only include 'name' and 'bandcamp_url' based on 'labelName' and 'labelURL'
    let dbModels = labels.map(label => ({
        name: label.labelName, // Map 'labelName' to 'name'
        bandcamp_url: label.labelURL, // Map 'labelURL' to 'bandcamp_url'
    }));

    const profile_url = window.location.href.split('/', 4).join('/');

    // Constructing the JSON payload to send
    let payload = JSON.stringify({ artists: dbModels, profile_url:profile_url });

    $.ajax({
        url: 'http://localhost:8092/artist/save-batch-from-supporter', // Adjusted to the bulk save endpoint
        type: 'POST',
        contentType: 'application/json',
        data: payload,
        success: function (response) {
            console.log('Labels saved in bulk:', response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error saving labels in bulk:', textStatus, errorThrown);
        }
    });
}

injectSaveLabelsButton();