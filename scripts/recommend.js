async function action() {
    const storage = await chrome.storage.local.get(["items", "countdown"])
    const items = Array.isArray(storage.items) ? storage.items : [];
    const hour = new Date().getHours();

    const bodyElement = document.querySelector("html");
    const reproElement = document.querySelector(".repro_popup");

    let countdown = !!parseInt(storage.countdown) ? parseInt(storage.countdown) : 60;




    if (bodyElement && !reproElement) {
        bodyElement.style.overflowY = "hidden"
        const popup = document.createElement("div");
        popup.className = "repro_popup";
        popup.style = "display: flex; align-items: center; justify-content: center; position: fixed; top:0; left: 0; width: calc(100vw - 200px); height: calc(100vh - 200px); background-color: rgba(37, 35, 35, 0.6); z-index: 100000; padding: 100px; backdrop-filter: blur(15px);";
        popup.innerHTML = `
            <div class="repro_content" style="display: grid; grid-template: auto 1fr auto / 1fr; gap: 20px; width: 70%; max-width: 600px; height: 100%; margin: 0 auto; max-height: 600px">
                <h2 style="font-size: 32px; text-align: center;">Do this instead</h2>
                <div style="overflow-y: auto; display: flex; flex-direction: column; gap: 10px; max-height: calc(70vh);">
                ${items.map(i => {
            return (
                `<div style="background-color: rgba(112, 121, 140, 0.8); padding: 7.5px 15px; border-radius: 7.5px; height: min-content;">
                            <p style="font-size: 22px; color: white; margin: 0; padding: 0;">${i?.name}</p>
                        </div>`
            )
        }).join("")}
                </div>
                <button class="close_repro" style="background-color: rgb(218, 210, 188); color: black; font-size: 20px; padding: 7.5px 15px; border-radius: 7.5px; height: fit-content;">I swear it's important</button>
            </div>`;
        bodyElement.appendChild(popup);

        const button = document.querySelector(".close_repro");
        if (button) {
            let interval = null; // To store the interval reference

            const startCountdown = () => {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                button.disabled = true; // Disable the button initially
                button.textContent = `Wait ${countdown} seconds...`; // Show countdown text

                interval = setInterval(() => {
                    countdown -= 1;
                    if (countdown > 0) {
                        button.textContent = `Wait ${countdown} seconds...`;
                    } else {
                        clearInterval(interval); // Stop the countdown
                        interval = null; // Reset the interval reference
                        button.disabled = false; // Enable the button
                        button.textContent = "I swear it's important"; // Reset button text
                    }
                }, 1000);
            };

            const stopCountdown = () => {
                clearInterval(interval);
                interval = null;
            }

            // Listen for visibility changes
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "hidden") {
                    stopCountdown(); // Start countdown when the page is visible
                } else {
                    startCountdown()
                }
            });

            // Start countdown immediately if the page is already visible
            if (document.visibilityState === "visible") {
                startCountdown();
            }

            button.addEventListener("click", () => {
                const popup = document.querySelector(".repro_popup");
                if (popup) {
                    popup.remove(); // Remove the popup
                }
                document.body.style.overflow = ""; // Restore scrolling
                console.log("Popup closed and cleaned up.");
                bodyElement.style.overflowY = "auto"
            });

            setTimeout(() => {
                console.log(document.querySelectorAll("video"))
                document.querySelectorAll("video").forEach(v => {
                    v.setAttribute("autoplay", false)
                    v.pause()
                })
            }, 1000)

        }
    }
}


chrome.storage.local.get(["websites"]).then((storage) => {
    const websites = Array.isArray(storage.websites) ? storage.websites : [];

    const host = window.location.hostname.replace("www.", "");
    console.log(host, websites.map(w => w.url));
    const applicable = websites.map(w => w.url).some(u => host.includes(u));

    if (applicable) {
        action()
    }

    navigation.addEventListener('navigate', () => {
        if(applicable){
            action()
        }
    });
})