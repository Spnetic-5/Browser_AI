
chrome.runtime.onInstalled.addListener(() => {
    //create context menu
    chrome.contextMenus.create({
        id: "wording",
        title: "Apply BrowserAI",
        contexts: ["selection"],
    });
});

// listener for context menu
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    chrome.storage.sync.get(["chatGPT_api_key", "browserAIEmail", "browserAIPassword"], function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        console.log(result)
        const api_key = result.chatGPT_api_key;
        const browserAIEmail = result.browserAIEmail;
        const browserAIPassword = result.browserAIPassword;

        chrome.tabs.sendMessage(tab.id, {
            api_key: api_key,
            browserAIEmail: browserAIEmail,
            browserAIPassword: browserAIPassword,
            info: info,
        });
    });
});
