let fullTranscript = '';
let chatOverlay = null;

function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

async function fetchFullTranscript(videoId) {
  const url = `https://yt.lemnoslife.com/noKey/caption?videoId=${videoId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.captions || !data.captions.playerCaptionsTracklistRenderer) return '';
    const tracks = data.captions.playerCaptionsTracklistRenderer.captionTracks;
    if (!tracks.length) return '';
    const trackUrl = tracks[0].baseUrl;
    const trackRes = await fetch(trackUrl);
    const trackXml = await trackRes.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(trackXml, "text/xml");
    const texts = Array.from(xmlDoc.getElementsByTagName("text"));
    let transcript = '';
    texts.forEach(text => {
      transcript += text.textContent + ' ';
    });
    return transcript.trim();
  } catch (e) {
    return '';
  }
}

async function callHuggingFace(question, transcript) {
    const HF_TOKEN = "<HUGGING_FACE_TOKEN>";
    const PROVIDER = "featherless-ai";
    const MODEL = "mistralai/Magistral-Small-2506";
    const endpoint = `https://router.huggingface.co/${PROVIDER}/v1/chat/completions`;
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant. Use the transcript to answer user questions about the YouTube video. Answer simply for a beginner."
      },
      {
        role: "user",
        content: `Here is the transcript of a YouTube video:\n\n${transcript}\n\nQuestion: ${question}`
      }
    ];
  
    const body = {
      messages: messages,
      model: MODEL,
      stream: false
    };
  
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }
  
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || JSON.stringify(data);
    console.log(data);
    return answer;
}

function speakText(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

function createOverlayButton() {
  const button = document.createElement('button');
  button.textContent = '💬 Ask Video';
  button.style.position = 'fixed';
  button.style.bottom = '40px';
  button.style.right = '40px';
  button.style.zIndex = 9999;
  button.style.padding = '15px 25px';
  button.style.background = '#ff0000';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '30px';
  button.style.fontSize = '18px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
  button.onclick = showChatOverlay;
  document.body.appendChild(button);
}

function showChatOverlay() {
  if (chatOverlay) {
    chatOverlay.style.display = 'block';
    return;
  }

  chatOverlay = document.createElement('div');
  chatOverlay.style.position = 'fixed';
  chatOverlay.style.bottom = '100px';
  chatOverlay.style.right = '40px';
  chatOverlay.style.width = '350px';
  chatOverlay.style.maxHeight = '400px';
  chatOverlay.style.background = '#fff';
  chatOverlay.style.border = '2px solid #ff0000';
  chatOverlay.style.borderRadius = '16px';
  chatOverlay.style.boxShadow = '0 2px 16px rgba(0,0,0,0.25)';
  chatOverlay.style.zIndex = 10000;
  chatOverlay.style.display = 'flex';
  chatOverlay.style.flexDirection = 'column';

  const chatHistory = document.createElement('div');
  chatHistory.style.flex = '1';
  chatHistory.style.overflowY = 'auto';
  chatHistory.style.padding = '16px';
  chatHistory.id = 'explainthat-chat-history';

  const inputArea = document.createElement('div');
  inputArea.style.display = 'flex';
  inputArea.style.borderTop = '1px solid #eee';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ask a question about this video...';
  input.style.flex = '1';
  input.style.padding = '10px';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.fontSize = '16px';

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.background = '#ff0000';
  sendBtn.style.color = '#fff';
  sendBtn.style.border = 'none';
  sendBtn.style.padding = '0 16px';
  sendBtn.style.fontSize = '16px';
  sendBtn.style.cursor = 'pointer';

  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '8px';
  closeBtn.style.right = '16px';
  closeBtn.style.fontSize = '24px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => { chatOverlay.style.display = 'none'; };

  // Send handler
  sendBtn.onclick = async () => {
    const question = input.value.trim();
    if (!question) return;
    addChatBubble('user', question);
    input.value = '';
    addChatBubble('bot', 'Thinking...');
    const answer = await callHuggingFace(question, fullTranscript);
    updateLastBotBubble(answer);
    speakText(answer);
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBtn.onclick();
  });

  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);

  chatOverlay.appendChild(closeBtn);
  chatOverlay.appendChild(chatHistory);
  chatOverlay.appendChild(inputArea);

  document.body.appendChild(chatOverlay);
}

function addChatBubble(sender, text) {
  const chatHistory = document.getElementById('explainthat-chat-history');
  const bubble = document.createElement('div');
  bubble.style.marginBottom = '10px';
  bubble.style.padding = '10px 14px';
  bubble.style.borderRadius = '12px';
  bubble.style.maxWidth = '80%';
  bubble.style.wordBreak = 'break-word';
  bubble.style.fontSize = '15px';
  if (sender === 'user') {
    bubble.style.background = '#f0f0f0';
    bubble.style.alignSelf = 'flex-end';
    bubble.style.marginLeft = '20%';
  } else {
    bubble.style.background = '#ffeaea';
    bubble.style.alignSelf = 'flex-start';
    bubble.style.marginRight = '20%';
    bubble.id = 'last-bot-bubble';
  }
  bubble.textContent = text;
  chatHistory.appendChild(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function updateLastBotBubble(text) {
  const lastBot = document.getElementById('last-bot-bubble');
  if (lastBot) lastBot.textContent = text;
}

(async function() {
  if (!window.location.href.includes('watch?v=')) return;
  createOverlayButton();
  const videoId = getVideoId();
  addChatBubble('bot', 'Loading transcript...');
  fullTranscript = await fetchFullTranscript(videoId);
  if (!fullTranscript) {
    addChatBubble('bot', 'Could not fetch transcript for this video.');
  } else {
    addChatBubble('bot', 'Transcript loaded! Ask me anything about this video.');
  }
})();
