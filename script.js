const sendBtn = document.getElementById("sendBtn");
const prompt = document.getElementById("prompt");
const welcome = document.getElementById("welcome");
const chat = document.getElementById("chatContainer");

sendBtn.addEventListener("click", ()=>{
    sendMessage();
});

prompt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {

    const text = prompt.value.trim();

    if (!text) return;
    
    document.body.classList.add('has-input');

    welcome.style.display = "none";
    chat.style.display = "block";

    chat.innerHTML += `
    <div class="message user">
        <div class="bubble">${text}</div>
    </div>
    `;

    prompt.value = "";

    chat.innerHTML += `
    <div class="message ai" id="typing">
        <div class="bubble">Thinking...</div>
    </div>
    `;

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });

    try {

        const response = await fetch("/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: text
            })
        });

        const data = await response.json();

        document.getElementById("typing").remove();

        chat.innerHTML += `
        <div class="message ai">
            <div>
                <div class="bubble">${data.reply}</div>

                <div class="actions">
                    👍 👎 ⧉ ↻
                </div>
            </div>
        </div>
        `;

    } catch {

        document.getElementById("typing").remove();

        chat.innerHTML += `
        <div class="message ai">
            <div class="bubble">
                Error getting response.
            </div>
        </div>
        `;
    }

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });

}