// Save API Key button click event
const saveApiKeyButton = document.getElementById("save-api-key");
const feedbackContainer = document.getElementById("feedback-container");
const popupContainer = document.getElementById("popup-container");
const loginContainer = document.getElementById("login-container");

// Function to check if the user is logged in
function checkLoginStatus() {

    chrome.storage.sync.get("browserAIEmail", function (result) {
        const browserAIEmail = result.browserAIEmail;
        console.log(browserAIEmail);
    });

    chrome.storage.sync.get("browserAIPassword", function (result) {
        const browserAIPassword = result.browserAIPassword;
        console.log(browserAIPassword);
    });

    chrome.storage.sync.get("chatGPT_api_key", function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        const api_key = result.chatGPT_api_key;
        console.log(api_key);
        if (api_key) {
            feedbackContainer.classList.remove("text-red-500");
            feedbackContainer.classList.add("text-green-500");
            feedbackContainer.innerText = "You are already Logged In!";
            feedbackContainer.style.display = 'block'
        } else {
            loginContainer.style.display = 'block';
            feedbackContainer.style.display = 'block';
        }
    });
}

// Check login status on page load
checkLoginStatus();

saveApiKeyButton.addEventListener("click", function () {
    const apiKey = document.getElementById("api-key-input").value;
    const baiEmail = document.getElementById("email").value;
    const baiPass = document.getElementById("pass").value;
    chrome.storage.sync.set({ "chatGPT_api_key": apiKey }, function () {
        console.log(apiKey, "API key saved");
    });
    chrome.storage.sync.set({ "browserAIEmail": baiEmail }, function () {
        console.log(baiEmail, "Email saved");
    });
    chrome.storage.sync.set({ "browserAIPassword": baiPass }, function () {
        console.log(baiPass, "Password saved");
    });
    feedbackContainer.innerText = "You have Logged In successfully ✅️";
    feedbackContainer.classList.remove("text-red-500");
    feedbackContainer.classList.add("text-green-500");
});

