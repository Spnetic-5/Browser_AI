
var promptList = [];

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var div
  if (document.readyState === "complete") {
    div = injectDivBlock();
  } else {
    window.addEventListener("load", () => {
      div = injectDivBlock()
    });
  }

  const selectedTextElement = document.querySelector("#selected-text");
  const promptElement = document.querySelector("#prompts-dropdown");
  const newPromptContainer = document.querySelector("#new-prompt-container");
  const newPromptTextarea = document.querySelector("#new-prompt");
  const generateButton = document.querySelector("#generate-btn");
  // FUTURE SCOPE
  // const copyButton = document.querySelector("#copy-btn");
  const resultBlock = document.querySelector(".result-block");

  selectedTextElement.value = message.info.selectionText;

  async function fetchDataAndPopulateDropdown() {
    try {
      const response = await fetch(`https://browserai.onrender.com/api/getData?userEmail=${message?.browserAIEmail}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const prompts = data?.data;
      const validPrompts = prompts?.filter((prompt) => prompt?.title && prompt?.description);

      if (validPrompts.length > 0) {
        promptList = validPrompts;
        promptElement.innerHTML = `
        <option value="new-prompt">Write a new prompt</option>
        ${promptList
          .map((prompt) => `<option value="${prompt.description}">${prompt.title}</option>`)
          .join("")}
      `;
      }
    } catch (error) {
      console.error("Error getting data from the server:", error);
      console.log(error);
    }
  }
  
  // Call the function to fetch data and populate the dropdown
  fetchDataAndPopulateDropdown();

  if (message.browserAIEmail) {
    promptList = promptList.filter((prompt) => prompt.email.stringValue === message.browserAIEmail);
  }
  else {
    promptList = [];
  }

  // only show the new prompt container if "Write new prompt" is selected
  promptElement.addEventListener("change", () => {
    if (promptElement.value !== "new-prompt") {
      newPromptContainer.classList.add("hidden");
    } else {
      newPromptContainer.classList.remove("hidden");
    }
  });

  // Function to copy the suggestion to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy the suggestion.");
      });
  }
  generateButton.addEventListener("click", () => {
    const loadingDiv = div.querySelector(".result-content");
    loadingDiv.innerHTML = `
            <div class="loading-text">Generating response 💡️</div>
                <div class="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>`;

    const selectedPrompt = promptElement.value === "new-prompt" ? newPromptTextarea.value : promptElement.value;

    // ChatGPT API call
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + message.api_key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": selectedPrompt + message.info.selectionText }]
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Following error occured while fetching response \r\n Error " + response.status + ": " + response.statusText);
        }
        return response.json()
      })
      .then(data => {
        // get the first suggestion from the response
        const suggestion = data.choices[0].message.content.trim();
        // show the suggestion and copy button
        const resultContent = div.querySelector(".result-content");
        resultContent.innerHTML = suggestion;
        // FUTURE SCOPE 
        // copyButton.classList.remove("hidden");
        // copyButton.addEventListener("click", () => {
        //     copyToClipboard(suggestion);
        // });
        resultContent.addEventListener("click", () => {
          copyToClipboard(suggestion);
        })
      })
      .catch(error => {
        console.log(error)
        // show alert if something went wrong.
        loadingDiv.innerHTML = error.toString();
      });
  });
});

function injectDivBlock() {
  const div = document.createElement("div");
  div.innerHTML = `
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <div class="result-header">
      <span class="result-close">&times;</span>
    </div>
    <div class="result-content m-1">
    <h1 class="text-xl font-bold text-center text-green-500">
        BrowserAI 🚀️  
      </h1>
      <div class="p-2">
        <div id="ai-container" class="mb-2">
          <div class="mb-2">
            <label class="block text-lg font-semibold mb-2 -ml-2">📝 Selected Text:</label>
            <textarea
              id="selected-text"
              class="w-full h-14 border rounded py-2 px-3 bg-gray-100 text-gray-800"
              placeholder="Selected text will appear here"
              readonly
            ></textarea>
          </div>

          <div class="mb-2">
            <label class="block text-lg font-semibold mb-2 -ml-2">🌟️ Select/Write Prompt:</label>
            <select
              id="prompts-dropdown"
              class="w-full border rounded py-2 px-3 bg-white text-gray-800 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="new-prompt">Write a new prompt</option>
              <!-- Populate with user's prompts fetched from the server -->
              ${promptList.map((prompt) => `<option value="${prompt?.description.stringValue}">${prompt?.title.stringValue}</option>`).join("")}
            </select>
          </div>

          <div id="new-prompt-container" class="mb-2">
            <textarea
              id="new-prompt"
              class="w-full h-16 border rounded py-2 px-3 bg-white text-gray-800"
              placeholder="Write your new prompt here..."
            ></textarea>
          </div>

          <div class="mb-4">
            <button
              id="generate-btn"
              class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Generate 🚀
            </button>
          </div>
        </div>
      </div>
    <div id="copy-btn" class="hidden mb-4">
    <button
        class="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
    >
        Copy
    </button>
    </div>
  `;

  div.classList.add("result-block");
  document.body.appendChild(div);

  const closeButton = div.querySelector(".result-close");
  closeButton.addEventListener("click", () => {
    div.remove();
  });
  return div
}
