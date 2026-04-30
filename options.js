const addActivityButton = document.querySelector(".add-activity");
const addWebsiteButton = document.querySelector(".add-website");
const countdownElement = document.querySelector(".countdown");


// Inital load of content from storage or rerender them
function rerender() {
    loadActivities()
    loadWebsites()
    loadCountdown()
}



// Load countdown time fromstorage and load into input
function loadCountdown() {
    chrome.storage.local.get(["countdown"]).then((storage) => {
        const countdown = parseInt(storage.countdown);

        if (countdown) {
            countdown.value = countdown;
        }
    })
}

// Load activities from storage and render them
function loadActivities() {
    chrome.storage.local.get(["activities"], (storage) => {
        const itemContainer = document.querySelector(".items");
        itemContainer.innerHTML = "";
        const activities = storage.activities;

        activities.forEach(element => {
            const name = element.name + "";
            const id = element.id;

            const child = createItem("activities", id, name, () => deleteItem("activities", id))

            itemContainer.appendChild(child);
        });
    })
}

// Load website urls from storage and render them
function loadWebsites() {
    chrome.storage.local.get(["websites"], (storage) => {
        const itemContainer = document.querySelector(".websites");
        itemContainer.innerHTML = "";
        const websites = storage.websites;

        websites.forEach(element => {
            const url = element.url + "";
            const id = element.id

            const child = createItem("websites", id, url, () => deleteItem("websites", id))

            itemContainer.appendChild(child);
        });
    })
}

// Create items (websites or activities)
function createItem(scope, id, innerHtml, deleteOp) {
    const itemElement = document.createElement("div")
    itemElement.classList.add("item", scope + "-item");
    itemElement.id = `${scope}-${id}`;

    const nameElement = document.createElement("p");
    nameElement.innerHTML = innerHtml;

    const deleteElement = document.createElement("img")
    deleteElement.src = "assets/trash.png";
    deleteElement.height = 20
    deleteElement.width = 20
    deleteElement.addEventListener("click", () => {
        deleteOp()
    })

    itemElement.appendChild(nameElement)
    itemElement.appendChild(deleteElement)

    return itemElement;
}

// Delete items (websites or activities)
async function deleteItem(scope, id) {
    const element = document.getElementById(`${scope}-${id}`);
    const storage = await chrome.storage.local.get([scope])

    console.log(element, storage, scope, id);

    await chrome.storage.local.set({
        [scope]: Array.isArray(storage[scope]) ? storage[scope].filter(i => i.id != id) : []
    })

    rerender()
}
function destroyPopup() {
    const popup = document.querySelector(".popup");
    if (popup) {
        popup.remove()
    }
}


function popupWrapper(title, content, saveAction) {
    destroyPopup()

    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = (
        `<div class="popup-content">
            <h2>${title}</h2>
            ${content}
            <div class="popup-buttons">
                <button class="popup-cancel">Cancel</button>
                <button class="popup-save">Save</button>
            </div>
        </div>`
    )
    document.querySelector("body").appendChild(popup)

    const cancelButton = document.querySelector(".popup-cancel");
    cancelButton?.addEventListener("click", () => {
        if (document.querySelector(".popup")) {
            document.querySelector(".popup").remove()
        }
    })

    const saveButton = document.querySelector(".popup-save");
    saveButton?.addEventListener("click", () => {
        saveAction()
    })

}


addActivityButton.addEventListener("click", () => {
    popupWrapper("Add Activity", `
        <div class="popup-actions">
            <div class="popup-input-container">
                <p>Activity</p>
                <input type="text" class="popup-input" />
            </div>
        </div>
    `, () => {
        const activity = document.querySelector(".popup-input");

        if (activity) {
            chrome.storage.local.get(["activities"]).then(async (storage) => {
                const activities = Array.isArray(storage.activities) ? storage.activities : [];
                await chrome.storage.local.set({
                    activities: [
                        {
                            id: crypto.randomUUID(),
                            name: activity.value
                        },
                        ...activities
                    ]
                })
                loadActivities()
                destroyPopup()
            })

        }
    })
});


addWebsiteButton.addEventListener("click", () => {
    popupWrapper("Add website", `
        <div class="popup-actions">
            <div class="popup-input-container">
                <p>Website URL</p>
                <input type="text" class="popup-input" />
            </div>
        </div>
    `, () => {
        let websiteUrlInput = document.querySelector(".popup-input")?.value;

        if (websiteUrlInput) {
            if(!websiteUrlInput.startsWith("http")){
                websiteUrlInput = "https://" + websiteUrlInput;
            }

            try {
                const websiteUri = encodeURI(websiteUrlInput)
                const websiteUrl = new URL(websiteUri);


                chrome.storage.local.get(["websites"]).then(async (storage) => {
                    const websites = Array.isArray(storage.websites) ? storage.websites : [];
                    await chrome.storage.local.set({
                        websites: [
                            {
                                id: crypto.randomUUID(),
                                url: websiteUrl.host
                            },
                            ...websites
                        ]
                    })
                    loadWebsites()
                    destroyPopup()
                })
            } catch (err) {

            }

        }


    })
});





const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

navItems.forEach(n => {
    n.addEventListener("click", () => {
        navItems.forEach(nI => {
            nI.classList.remove("active")
        })
        n.classList.add("active")

        sections.forEach(s => {
            if (s.id == n.dataset.section) {
                s.classList.add("visible")
            } else {
                s.classList.remove("visible")
            }
        })
    });
})


countdownElement.addEventListener("change", (e) => {
    const input = e.target;

    if (!input) return;
    const time = Number.parseInt(input.value);

    if (time != NaN) {
        chrome.storage.local.set({
            countdown: time
        })
    }
});



rerender()