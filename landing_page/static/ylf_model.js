document.addEventListener('DOMContentLoaded', function() {
  // -------------------------------------------------
  // 1. Conversation Data + Helpers
  // -------------------------------------------------
  let conversations = [];
  let activeConversation = null;


// Fetch user data and conversations dynamically from the backend
async function initializeConversations() {
    return fetch('/get-user-data/')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                console.log('User is logged in:', data.username);
                if (data.conversations && data.conversations.length > 0) {
                    conversations = data.conversations; // Populate conversations array
                    console.log('Loaded conversation history:', conversations);
                } else {
                    console.log('No conversations found.');
                }
            } else {
                console.log('User is not logged in, starting with empty conversations.');
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

// Initialize the conversations array (no additional logic here)
initializeConversations();


  // LLM Helper functions

  function handleLlmResponse(data) {
  // Step 1: Extract content from JSON
  const markdownContent = data.content || "No content provided";

  // Step 2: Parse the Markdown content to HTML
  const renderedHtml = marked.parse(markdownContent); // Assuming 'marked.js' is included

  // Step 3: Pass the rendered HTML to addChatBubble
  addChatBubble(renderedHtml, 'llm');
}



  // Return a unique name for a new conversation:
  // "New Chat" if none exists, "New Chat 2", "New Chat 3", etc.
  function getNewChatTitle() {
    const baseTitle = "New Chat";
    let count = 0;
    let candidate = baseTitle;  // "New Chat"
    // If there's *already* a conversation with exactly `candidate` as title,
    // increment count. Then we try "New Chat 2", "New Chat 3", etc.
    while (conversations.some(c => c.title === candidate)) {
      count++;
      candidate = `${baseTitle} ${count}`;
    }
    return candidate;
  }

  function createNewConversation(title = "New Chat") {
    return {
      id: Date.now(),   // Simple unique ID
      title: title,
      messages: [],
    };
  }

  // -------------------------------------------------
  // PAGE SETUP
  // 2. DOM Elements
  // -------------------------------------------------

  const ylfData        = document.getElementById('ylf-data');
  if (!ylfData) {
    console.error("ylf-data element not found!");
    return;
  }
  const ylfUrl         = ylfData.dataset.url;
  const csrfToken      = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  const sendBtn        = document.getElementById('sendBtn');
  const chatMessages   = document.getElementById('chatMessages');
  const inputField     = document.getElementById('prompt');
  const newChatBtn     = document.getElementById('newChatBtn');
  const sidebarHistory = document.getElementById('sidebarHistory');


  // Page load setup wrapped in an async-await functions
async function setupPage() {
    // Wait for conversations to be initialized
    await initializeConversations();

  // -------------------------------------------------
  // 3. Page Load Setup
  // -------------------------------------------------
  // Create the initial conversation, add to array, render.
  activeConversation = createNewConversation(getNewChatTitle());
  conversations.push(activeConversation);
  console.log(`All Conversations: ${conversations}`)
  renderSidebarHistory();
  console.log("Initial conversations:", conversations); // debug log


}

// Call setupPage to handle page initialization
setupPage();

  // -------------------------------------------------
  // 4. Event Listeners
  // -------------------------------------------------
  newChatBtn.addEventListener('click', function() {
    // Make sure the current active conversation is updated in array
    updateConversationInArray(activeConversation);
    console.log("Updated conversations from new chat btn:", conversations); // debug log

    // Create a new conversation with a *unique* name
    const freshTitle = getNewChatTitle();
    activeConversation = createNewConversation(freshTitle);
    conversations.push(activeConversation);

    // Clear the chat window and re-render
    chatMessages.innerHTML = '';
    renderSidebarHistory();
  });

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keydown', function(evt) {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      sendMessage();
    }
  });

  // -------------------------------------------------
  // 5. Functions
  // -------------------------------------------------
  function sendMessage() {
    const prompt = inputField.value.trim();
    if (!prompt) return;

    // 1) Add user bubble
    addChatBubble(prompt, 'user');
    // 2) Store in activeConversation
    activeConversation.messages.push({ role: 'user', content: prompt });
    // 3) Clear input
    inputField.value = '';
    // 4) Temporary "Thinking..." bubble
    let loadingBubble = addChatBubble('Thinking...', 'llm');

//    // Create the spinner element - for LLM thinking effect
//      const spinner = document.createElement('div');
//      spinner.classList.add('spinner');
//      spinner.innerHTML = `
//        <svg viewBox="0 0 50 50" class="circular">
//          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
//        </svg>
//      `;
//
// ... your existing sendMessage function ...

const logoContainer = document.createElement('div');
logoContainer.classList.add('logo-container');

// Use img tag and set src attribute dynamically with a fallback
const logo = new Image();
logo.src = "/static/images/ylf_first_logo.png"; // Use the /static/ prefix
logo.alt = "Thinking...";
logo.classList.add('logo');

logo.onload = function() { // Handle image load success
  logoContainer.appendChild(logo);
  loadingBubble.insertBefore(logoContainer, loadingBubble.firstChild);
  logoContainer.style.marginRight = '5px';
};

// Optional: Handle potential error loading the image
logo.onerror = function() {
  console.error("Failed to load logo image.");
  // You can add alternative behavior here, like displaying an error message
};



    // Set a timeout to change the bubble text after 5 seconds
    let timeoutId = setTimeout(() => {
      chatMessages.removeChild(loadingBubble);
      loadingBubble = addChatBubble('Analyzing Context...', 'llm'); // Change the text of the bubble
        loadingBubble.insertBefore(logoContainer, loadingBubble.firstChild);
    }, 7000);


    // Set a timeout to change the bubble text after 5 seconds
    timeoutId = setTimeout(() => {
      chatMessages.removeChild(loadingBubble);
      loadingBubble = addChatBubble('Formatting & Processing response...', 'llm'); // Change the text of the bubble
        loadingBubble.insertBefore(logoContainer, loadingBubble.firstChild);
    }, 9000);


    // 5) POST to server
    fetch(ylfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken
      },
      body: new URLSearchParams({ 'prompt': prompt })
    })

    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      chatMessages.removeChild(loadingBubble);

      let llmResponse = "Unexpected response format.";
      if (data && data.paragraphs) {
        if (Array.isArray(data.paragraphs)) {
          llmResponse = data.paragraphs.join('\n\n');
        } else if (typeof data.paragraphs === 'string') {
          llmResponse = data.paragraphs;
        } else if (data.error) {
          llmResponse = "Error: " + data.error;
        }
      } else if (data && data.error) {
        llmResponse = "Error: " + data.error;
      }

      console.log(`Adding new chat bubble with LLM response.`)
      addChatBubble(llmResponse, 'llm');
      activeConversation.messages.push({ role: 'assistant', content: llmResponse });

      // Update store
      updateConversationInArray(activeConversation);
    })
    .catch(error => {
      console.error('Fetch Error:', error);
      chatMessages.removeChild(loadingBubble);

      const errMsg = `Error: ${error.message}`;
      addChatBubble(errMsg, 'llm');
      activeConversation.messages.push({ role: 'assistant', content: errMsg });
      updateConversationInArray(activeConversation);
    });
  }

// Handles adding new user & LLM responses to chat
function addChatBubble(message, sender) {
  // Create the bubble container
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', sender);

  // Create the content container
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('content-container');

  // Create the span for the message text
  const messageContent = document.createElement('span');

  // Testing Markdown
  // message = "## Hello World\n\n**This is bold text** and *this is italic text*.";
  const renderedHtml = marked.parse(message); // Parse Markdown into HTML

  messageContent.innerHTML = renderedHtml;
  contentContainer.appendChild(messageContent);

  console.log(`Rendered HTML before adding chat message: ${renderedHtml}`);

  // If it's an LLM message, add a copy button
  if (sender === 'llm') {
    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-btn');
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M19 21H9c-1.1 0-2-.9-2-2V7h2v12h10v2zm2-16h-8c-1.1 0-2 .9-2 2v8
                 c0 1.1.9 2 2 2h8c-1.1.0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 10h-8V7h8v8z"/>
      </svg>
    `;
    contentContainer.appendChild(copyBtn);

    // Add functionality to copy the message text
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(message).then(() => {
        console.log("Copied to clipboard!");
      });
    });
  }

  // Append the content container to the bubble
  bubble.appendChild(contentContainer);

  // Append the bubble to the chat container
  chatMessages.appendChild(bubble);

  // Auto-scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return bubble;
}

  function renderSidebarHistory() {
    sidebarHistory.innerHTML = '';
    // Reverse the conversations array to show the latest first
    const reversedConversations = [...conversations].reverse();

    reversedConversations.forEach((conv) => {
      // Create a row for each conversation
      const entry = document.createElement('div');
      entry.classList.add('sidebar-chat-entry');

      // If this is the active conversation, highlight it
      if (conv.id === activeConversation.id) {
        entry.classList.add('active-conversation');
      }

      // Title area (click to load)
      const titleSpan = document.createElement('span');
      titleSpan.classList.add('sidebar-chat-title');
      titleSpan.textContent = conv.title;
      // Clicking the title loads that conversation
      titleSpan.addEventListener('click', () => {
        loadConversation(conv.id);
      });

      // 3-dots button, dropdown, rename/delete logic
      const dotsBtn = document.createElement('button');
      dotsBtn.classList.add('chat-options-btn');
      dotsBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      `;

      const dropdown = document.createElement('div');
      dropdown.classList.add('chat-options-dropdown');

      const renameBtn = document.createElement('button');
      renameBtn.textContent = "Rename";
      renameBtn.addEventListener('click', () => {
        dropdown.classList.remove('show');
        renameConversation(conv.id);
      });
      dropdown.appendChild(renameBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener('click', () => {
        dropdown.classList.remove('show');
        deleteConversation(conv.id);
      });
      dropdown.appendChild(deleteBtn);

      dotsBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        // close all open dropdowns
        document.querySelectorAll('.chat-options-dropdown.show').forEach(d => d.classList.remove('show'));
        dropdown.classList.toggle('show');
      });

      document.body.addEventListener('click', () => {
        dropdown.classList.remove('show');
      }, { capture: true });

      // Build row
      entry.appendChild(titleSpan);
      entry.appendChild(dotsBtn);
      entry.appendChild(dropdown);

      sidebarHistory.appendChild(entry);
    });
  }

  function loadConversation(convoId) {
    const foundConv = conversations.find(c => c.id === convoId);
    console.log(`LoadConversation: Searching for conversation with id ${convoId}`)
    console.log(`Found conv: ${foundConv}`)
    if (!foundConv) {
      console.error("Conversation not found:", convoId);
      return;
    }

    // Make foundConv the new active
    activeConversation = foundConv;

    // Clear chat & rebuild
    chatMessages.innerHTML = '';
    activeConversation.messages.forEach(msgObj => {
      const sender = msgObj.role === "assistant" ? "llm" : msgObj.role;
      addChatBubble(msgObj.content, sender);
    });

    // Re-render sidebar so highlight is updated
    renderSidebarHistory();
  }

  function renameConversation(convoId) {
    const foundConv = conversations.find(c => c.id === convoId);
    if (!foundConv) return;

    const newTitle = prompt("Enter a new name:", foundConv.title);
    if (newTitle) {
      foundConv.title = newTitle.trim();
      renderSidebarHistory();
    }
  }

  function deleteConversation(convoId) {
    // If deleting the active conversation, create a new blank one
    if (activeConversation.id === convoId) {
      activeConversation = createNewConversation(getNewChatTitle());
      conversations = conversations.filter(c => c.id !== convoId);
      conversations.push(activeConversation);
      chatMessages.innerHTML = '';
    } else {
      // Just remove the chosen conversation
      conversations = conversations.filter(c => c.id !== convoId);
    }
    renderSidebarHistory();

    // Fetch user data dynamically and then save conversations to the backend
    fetchUserData().then(username => {
        saveConversationsToBackend(username, conversations);
    });


  }

  // Store or update a conversation in the array
  function updateConversationInArray(convObj) {
    const idx = conversations.findIndex(c => c.id === convObj.id);
    console.log(`Hello From update conv in array function, computed idx is ${idx}`)
    console.log(`Conversations: ${conversations}`)
    if (idx > -1) {
      conversations[idx] = convObj;
    } else {
      conversations.push(convObj);
    }

    // Fetch user data dynamically and then save conversations to the backend
    fetchUserData().then(username => {
        saveConversationsToBackend(username, conversations);
    });


  }

// Fetch user data dynamically from the backend
function fetchUserData() {
    return fetch('/get-user-data/')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                console.log('User data:', data);
                return data.username;
            } else {
                console.log('User is not logged in.');
                return null;
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            return null; // Handle fetch errors gracefully
        });
}


// Save conversations to the backend
function saveConversationsToBackend(username, updatedConversations) {
    fetch('/save-conversations/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username || null, // Pass username if logged in
            conversations: updatedConversations, // Pass the updated conversation array
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log('Conversations saved successfully:', data.message);
            } else {
                console.error('Error saving conversations:', data.error);
            }
        })
        .catch(error => console.error('Fetch error:', error));
}


});





