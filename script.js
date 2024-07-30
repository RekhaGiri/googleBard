const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");


let userMsg = null;
let isResponseGetting=false;

const loadLocalStorageData= ()=>{
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode=(localStorage.getItem("themeColor")==="light_mode");

    document.body.classList.toggle("light_mode",isLightMode);
    toggleThemeButton.innerText=isLightMode?"dark_mode":"light_mode";

    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header",savedChats);
    chatList.scrollTo(0,chatList.scrollHeight);
}

loadLocalStorageData();
const API_KEY="AIzaSyBYg4adDNiwxmf00Jz88xzSdW8HLejBF4I";
const API_URL=`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const createMsgElement = (content,...classes) =>{
    const div=document.createElement("div");
    div.classList.add("msg",...classes);
    div.innerHTML=content;
    return div;
}
 
const showTypingEffect = (text,textElement,incomingMsgDiv)=>{
    const words = text.split(" ");
    let currentWordIndex = 0;

    const typingInterval = setInterval(()=>{


        textElement.innerText+=(currentWordIndex===0 ? " ": " ")+words[currentWordIndex++];
        incomingMsgDiv.querySelector(".icon").classList.add("hide");

        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            isResponseGetting=false;
            incomingMsgDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML);
            
        }
        chatList.scrollTo(0,chatList.scrollHeight);
    },75);
}

const generateAPIResponse= async (incomingMsgDiv) =>{
try{

    const textElement = incomingMsgDiv.querySelector(".text");
    const response =await fetch(API_URL,{
    method:"POST",
    headers:{"Content-Type": "application/json"},
    body:JSON.stringify({
        contents : [{
            role:"user",
            parts:[{text:userMsg}]
        }]
    })
    });

    const data = await response.json();

    if(!response.ok) throw new Error(data.error.message);
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1");
    // textElement.innerText=apiResponse;
    showTypingEffect(apiResponse,textElement,incomingMsgDiv);
}catch(error){
    isResponseGetting=false;
    textElement.innerText=error.message;
    textElement.classList.add("error");
}finally{
    incomingMsgDiv.classList.remove("loading");
}
}

const showLoadingAnimation = () =>{
    const html= ` <div class="msg-content">
                <img src="images/gemini.svg" alt="gemini image" class="avtar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

 const incomingMsgDiv= createMsgElement(html,"incoming","loading");
 chatList.appendChild(incomingMsgDiv);

 chatList.scrollTo(0,chatList.scrollHeight);
 generateAPIResponse(incomingMsgDiv);
}

const copyMessage = (copyIcon)=>{
const msgText = copyIcon.parentElement.querySelector(".text").innerText;
navigator.clipboard.writeText(msgText);
copyIcon.innerText="done";
setTimeout(()=>copyIcon.innerText="content_copy",1000);
}

const handleOutgoingChat = () =>{
    userMsg= typingForm.querySelector(".typing-input").value.trim() || userMsg;
    if(!userMsg || isResponseGetting) return;

    isResponseGetting=true;

    const html= `<div class="msg-content">
    <img src="images/user.png" alt="user image" class="avtar">
    <p class="text"></p>
</div>`;

 const outgoingMsgDiv= createMsgElement(html,"outgoing");
 outgoingMsgDiv.querySelector(".text").innerText = userMsg;
 chatList.appendChild(outgoingMsgDiv);
 
 typingForm.reset();
 chatList.scrollTo(0,chatList.scrollHeight);
 document.body.classList.add("hide-header");
 setTimeout(showLoadingAnimation,500);
}


suggestions.forEach(suggestions =>{
    suggestions.addEventListener("click",()=>{
        userMsg = suggestions.querySelector(".text").innerText;
        handleOutgoingChat()
    })

});

toggleThemeButton.addEventListener("click",()=>{
   const isLightMode= document.body.classList.toggle("light_mode");
   localStorage.setItem("themeColor",isLightMode ? "light_mode":"drak_mode");
   toggleThemeButton.innerText= isLightMode ? "dark_mode":"light_mode";
})


deleteChatButton.addEventListener("click",()=>{

        if(confirm("Are you sure you want to delete all messages ??")){
            localStorage.removeItem("savedChats");
        loadLocalStorageData();
        }
        
});


typingForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    handleOutgoingChat();


});