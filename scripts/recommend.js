async function action() {
    // Get chrome storage
    const storage = await chrome.storage.local.get()
    console.log(storage)
    // Get all activities from storage
    const activities = Array.isArray(storage.activities) ? storage.activities : [];
    const hour = new Date().getHours();

    const bodyElement = document.querySelector("html");
    const wtdiElement = document.querySelector(".wtdi_popup");

    const initialCountdown = !!parseInt(storage.countdown) ? parseInt(storage.countdown) : 60;
    let countdown = initialCountdown;




    if (bodyElement && !wtdiElement) {
        // Disable scroll so the scrollbar disapears if the popup is present
        bodyElement.style.overflowY = "hidden"

        // Render popup
        const popup = document.createElement("div");
        popup.className = "wtdi_popup";
        popup.style = "display: flex; box-sizing: initial; align-items: center; justify-content: center; position: fixed; top:0; left: 0; width: calc(100vw - 200px); height: calc(100vh - 200px); background-color: rgba(37, 35, 35, 0.6); z-index: 100000; padding: 100px; backdrop-filter: blur(15px);";
        popup.innerHTML = `
            <div class="wtdi_content" style="display: grid; grid-template: auto 1fr auto / 1fr; gap: 20px; width: 70%; max-width: 600px; min-width: 350px; height: 100%; margin: 0 auto; max-height: 600px; background: #F6F1DE; padding: 20px; border-radius: 20px;">
                <h2 style="font-size: 32px; text-align: center; color: black;">Do this instead</h2>
                <div style="overflow-y: auto; display: flex; flex-direction: column; gap: 10px; max-height: calc(70vh);">
                ${activities.map(a => {
            return (
                `<div style="background-color: rgba(112, 121, 140, 0.2); padding: 7.5px 15px; border-radius: 7.5px; height: min-content;">
                    <p style="font-size: 22px; color: black; margin: 0; padding: 0;">${a?.name}</p>
                </div>`
            )
        }).join("")}
                </div>
                <button class="close_wtdi" style="background-color: #3E3F5B; color: white; font-size: 20px; padding: 10px 20px; border-radius: 7.5px; height: fit-content;">I swear it's important</button>
            </div>`;
        bodyElement.appendChild(popup);

        // Render button
        const button = document.querySelector(".close_wtdi");
        if (button) {
            let interval = null; // To store the interval reference

            const startCountdown = () => {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                button.disabled = true; // Disable the button initially
                button.textContent = `Wait ${countdown} seconds...`; // Show countdown text

                // Count down and determine button state
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

            const resetCountdown = () => {
                stopCountdown();
                countdown = initialCountdown;
            };

            // Listen for visibility changes
            // Restart counter when user switches websites or window
            document.addEventListener("visibilitychange", () => {
                console.log(document.visibilityState)
                if (document.visibilityState === "hidden") {
                    stopCountdown();
                } else {
                    resetCountdown();
                    startCountdown()
                }
            });

            // Start countdown immediately if the page is already visible
            if (document.visibilityState === "visible") {
                startCountdown();
            }


            button.addEventListener("click", () => {
                // Remove the popup
                const popup = document.querySelector(".wtdi_popup");
                if (popup) {
                    popup.remove();
                }

                //Read websites scrolling capaility
                document.body.style.overflow = ""; // Restore scrolling
                bodyElement.style.overflowY = "auto"
            });


            // Disable video autoplay for blocked websites and repause every second
            setTimeout(() => {
                document.querySelectorAll("video").forEach(v => {
                    v.setAttribute("autoplay", false)
                    v.pause()
                })
            }, 1000)

        }
    }
}

// Block if website in block list
chrome.storage.local.get(["websites"]).then((storage) => {
    const websites = Array.isArray(storage.websites) ? storage.websites : [];


    // Check if host is in blocked website list
    const host = window.location.hostname.replace("www.", "");
    const applicable = websites.map(w => w.url).some(u => host.includes(u));
    if (applicable) {
        action()
    }

    // On page change reevaluate
    navigation.addEventListener('navigate', () => {
        if(applicable){
            action()
        }
    });
})