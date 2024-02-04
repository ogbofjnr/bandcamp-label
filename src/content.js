// content.js
console.log('Content script loaded');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Saving evnet');
    if (request.action === "testSave") {
      saveHtmlToFile();
    }
  });

function clickThirdShowMoreButton() {
    let showMoreButtons = document.querySelectorAll('.show-more');
    if (showMoreButtons.length >= 3) {
        console.log('Found show-more buttons, attempting to click the 3rd one');
        showMoreButtons[2].click(); 
        console.log('Click event on the third button should have been fired');
        setTimeout(startScrolling, 3000); // Delay to allow any dynamic content to load
    } else {
        console.log('Not enough show-more buttons found');
    }
}

function startScrolling() {
    console.log('Starting infinite scroll');
    let lastScrollHeight = document.body.scrollHeight;

    function scrollToBottom() {
        console.log('Scrolling');
        window.scrollTo(0, document.body.scrollHeight);

        setTimeout(() => {
            if (document.body.scrollHeight > lastScrollHeight) {
                lastScrollHeight = document.body.scrollHeight;
                scrollToBottom(); // Recursive call if new content is added
            } else {
                console.log('Reached the bottom or no new content loaded');
            }
        }, 3000); // Wait before the next check
    }

    scrollToBottom();
}

function saveHtmlToFile() {
    console.log('Saving page');
    var htmlContent = document.documentElement.outerHTML;
    chrome.runtime.sendMessage({action: "saveHTML", html: htmlContent});
}

// clickThirdShowMoreButton();

function insertCustomBlock() {
    console.log('Attempting to insert custom block');

    // Find the target element with the specific class combination
    let target = document.querySelector('.artists-bio-pic.artists-bio-pic-uploaded.landscape');
    console.log('Querying for .artists-bio-pic.artists-bio-pic-uploaded.landscape');

    if (target) {
        console.log('Target element found:', target);

        // Create a container for your custom content
        let customBlock = document.createElement('div');
        customBlock.innerHTML = `
        <div id="myCustomBlock" style="padding: 10px; background-color: transparent;">
        <!-- Row 1: Selector -->
        <div class="custom-row">
            <select id="selector1">
                <option value="artist">Artist</option>
                <option value="label">Label</option>
                <!-- Add more options as needed -->
            </select>
        </div>
        <!-- Row 2: Input -->
        <div class="custom-row">
            <input type="text" id="input1" placeholder="Genre">
        </div>
        <!-- Row 3: Selector -->
        <div class="custom-row">
            <select id="selector2">
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <!-- Add more options as needed -->
            </select>
        </div>
    </div>
    
    <style>
        .custom-row {
            margin-bottom: 10px; /* Space out each row */
        }
        #myCustomBlock input[type="text"], #myCustomBlock select {
            box-sizing: border-box; /* Includes padding and border in the element's total width and height */
            width: 100%; /* Sets width to fill its container */
            padding: 5px; /* Adjust padding as needed */
            margin: 0; /* Removes default margin */
            border: 1px solid #ccc; /* Optional: Adds a border */
        }
    </style>
           
        `;
        console.log('Custom block created:', customBlock);

        // Insert the custom block
        target.insertAdjacentElement('afterend', customBlock);
        console.log('Custom block inserted');
    } else {
        console.log('Target element not found. Ensure the page has the correct structure.');
    }
}


insertCustomBlock();