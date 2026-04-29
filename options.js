const addActivityButton = document.querySelector(".add-activity");
const addWebsiteButton = document.querySelector(".add-website");

const timeToUnlockElement = document.querySelector(".countdown");

loadActivities()
loadWebsites()
loadCountdown()

function loadCountdown() {
    chrome.storage.local.get(["countdown"]).then((storage) => {
        const countdown = parseInt(storage.countdown);

        if (countdown) {
            timeToUnlockElement.value = countdown;
        }
    })
}


function createItem(id, innerHtml, deleteOp) {
    const itemElement = document.createElement("div")
    itemElement.className = "item";
    itemElement.id = "item-" + id;

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

function loadActivities() {
    chrome.storage.local.get(["items"], (storage) => {
        const itemContainer = document.querySelector(".items");
        itemContainer.innerHTML = "";
        const items = storage.items;

        items.forEach(element => {
            const name = element.name + "";

            const child = createItem(name, name, () => deleteItem(name))

            itemContainer.appendChild(child);
        });
    })
}

function loadWebsites() {
    chrome.storage.local.get(["items", "websites"], (storage) => {
        console.log(storage.websites)
        const itemContainer = document.querySelector(".websites");
        itemContainer.innerHTML = "";
        const items = storage.websites;

        items.forEach(element => {
            const name = element.url + "";

            const child = createItem(name, name, () => deleteWebsite(name))

            itemContainer.appendChild(child);
        });
    })
}

function destroyPopup() {
    const popup = document.querySelector(".popup");
    if (popup) {
        popup.remove()
    }
}

async function deleteItem(name) {
    console.log(name)
    const element = document.getElementById("item-" + name);
    const { items } = await chrome.storage.local.get(["items"])

    await chrome.storage.local.set({
        items: Array.isArray(items) ? items.filter(i => i.name != name) : []
    })

    loadActivities()
}

async function deleteWebsite(url) {
    const element = document.getElementById("item-" + url);
    const { websites } = await chrome.storage.local.get(["websites"])

    await chrome.storage.local.set({
        websites: Array.isArray(websites) ? websites.filter(i => i.url != url) : []
    })

    loadWebsites()
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
            chrome.storage.local.get(["items"]).then(async (storage) => {
                const items = Array.isArray(storage.items) ? storage.items : [];
                console.log(items)
                await chrome.storage.local.set({
                    items: [
                        {
                            name: activity.value
                        },
                        ...items
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
        const websiteUrl = document.querySelector(".popup-input");

        if (websiteUrl) {
            chrome.storage.local.get(["websites"]).then(async (storage) => {
                const websites = Array.isArray(storage.websites) ? storage.websites : [];
                await chrome.storage.local.set({
                    websites: [
                        {
                            url: websiteUrl.value
                        },
                        ...websites
                    ]
                })
                loadWebsites()
                destroyPopup()
            })

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
            console.log(s.id, n.dataset.section)
            if (s.id == n.dataset.section) {
                s.classList.add("visible")
            } else {
                s.classList.remove("visible")
            }
        })
    });
})

const items = chrome.storage.local.get(["items"]).then((storage) => {
    console.log(storage)
})


timeToUnlockElement.addEventListener("change", (e) => {
    const input = e.target;

    console.log(input)

    if (!input) return;
    const time = Number.parseInt(input.value);

    console.log(time)

    if (time != NaN) {
        chrome.storage.local.set({
            countdown: time
        })
    }
});