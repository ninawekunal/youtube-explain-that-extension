# YouTube ExplainThat Assistant

An overlay Chrome extension that can explain anything from a YouTube video using AI.

---

## 🚀 Motivation

- I often listen to podcasts or educational content on YouTube & Spotify while driving.
- Sometimes, I want a quick explanation of a term or concept mentioned in the video, but it’s not safe or possible to open ChatGPT or type while driving.
- Voice assistants like Siri are handy, but they don’t have context from the video.
- This inspired me to build an assistant that can answer questions about the currently playing YouTube video, using the video’s own transcript for context.

This project was built as a Minimum Viable Product (MVP) for a hackathon, with a focus on rapid prototyping and extensibility for future improvements.

---

## 📝 Features

- **Overlay Chat Button:** A floating “Ask Video” button appears on YouTube video pages.
- **Full Transcript Extraction:** Automatically fetches the entire transcript/captions of the current video (if available).
- **Chatbox UI:** Click the button to open a chatbox where you can type any question about the video.
- **Contextual AI Answers:** Sends your question + the transcript to a powerful language model for a relevant, beginner-friendly answer.
- **Text-to-Speech:** The answer is both displayed in the chat and spoken out loud.
- **No backend required:** All logic runs in the browser; only the AI inference is cloud-based.

---

## Future enhancements
 - **Voice Command Integration**: trigger explanations with phrases like “Explain that” or “What does that mean?” using the Web Speech API.
   - While the chrome extension is enabled, it'll keep listening for that phrase as trigger.
   - The video should pause when the user speaks that phrase.
 - **Smart Context Detection**: Now that we have a rough timestamp of when the user says that, instead of reading the full transcript, automatically select and send only the most relevant segment (_e.g., the last minute or the segment around the current timestamp._)
 - **History retention**: Store the history of the chat for that video.
   - **Link to Google Account**: To remember the user and save the history for the videos they interact with.
 - **Better Error Handling**: Show clearer errors when transcripts or AI responses are unavailable, gracefully fail, and send the user some feedback.
 - Maybe extend the support to Spotify/other podcast platforms for the same use-case.

**Note**: This project was built with the help of AI coding assistants (e.g., ChatGPT/Cascade).
All code, architecture, and documentation were generated or heavily assisted by AI, with the developer (me) providing the idea, guidance, and integration to rapidly prototype an idea.

## 🧑‍🏫 Usage
## 🚀 Install the Extension

1. **Download or clone this repository.**
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle at the top right).
4. Click **Load unpacked** and select this project folder.

## 🔑 Set Up Your API Key

1. Get a free Hugging Face API token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
2. Open `content.js` in the project folder.
3. Replace the placeholder in:
   ```javascript
   const HF_TOKEN = "...";
   ```
   with your token.

## ▶️ Use the Extension
1. **Open a YouTube video**
   - Go to any YouTube video page.
   - Wait a few seconds for the extension to fetch the transcript (if available).

2. **Ask questions**
   - Click the red 💬 **Ask Video** button in the bottom-right corner.
   - Type your question about the video’s content in the chatbox and press **Enter** or click **Send**.
   - The extension will use the video’s transcript and an AI model to generate a relevant, beginner-friendly answer.
   - The answer will be displayed in the chat and spoken out loud.

3. **Repeat as needed**
   - Ask as many questions as you like during the video.
   - Close the chatbox with the `×` button when finished.

## ⚠️ Notes

- Works best on videos with **English captions/transcripts**.
- Requires an **internet connection** for AI responses.

## 📈 Flow Chart

```mermaid
flowchart TD
    A(User opens YouTube video page) --> B(Extension loads)
    B --> C(Fetch full transcript via API)
    C --> D(Show floating Ask Video button)
    D --> E(User clicks button)
    E --> F(Show chatbox overlay)
    F --> G(User types a question and presses send)
    G --> H(Send transcript + question to Hugging Face Provider API)
    H --> I(Receive answer from model)
    I --> J(Display answer in chatbox)
    I --> K(Speak answer out loud)
---
