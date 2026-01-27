const logInTransition = document.getElementById("log-in-transition");
const signUpTransition  = document.getElementById("sign-up-transition");
const logInCard = document.getElementById("log-in-card");
const signInContent = document.getElementById("sign-in-content");

logInTransition.addEventListener("click", () => {
    logInCard.classList.add("active");
    signInContent.classList.add("no-opacity");
})

signUpTransition.addEventListener("click", () => {
    logInCard.classList.remove("active")
    signInContent.classList.remove("no-opacity");
})

