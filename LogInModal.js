const DIV = `
        <div class="overlay">
            <div class="form">
                <div class="form__content" id="sign-in-content">
                    <h1>Sign Up</h1>
                    <button class="form__button" type="button">Sign in with Google</button>
                    <p>or use your email password</p>
                    <input class="form__input" type="text" placeholder="Username">
                    <input class="form__input" type="text" placeholder="Password">
                    <button class="form__button" type="button">Sign in</button>
                </div>
                <div class="form__panel" id="log-in-card">
                    <div class="form__content" >
                        <h4 id="hiddable">Already have an account?</h4>
                        <button class="form__button form__button--outline" id="log-in-transition" type="button">Log In</button>
                        <h1>Log In</h1>
                        <button class="form__button form__button--dark" type="button">Log in with Google</button>
                        <p>or use your email password</p>
                        <input class="form__input" type="text" placeholder="Username">
                        <input class="form__input" type="text" placeholder="Password">
                        <button class="form__button form__button--dark" type="button">Log in</button>
                        <h4>Don't have an account?</h4>
                        <button class="form__button form__button--outline" id="sign-up-transition" type="button">Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
`

/**
 * LogInModal
 * 
 * Creates a login/sign-up modal that can be displayed anywhere on the page.
 * 
 * Usage:
 *   new LogInModal("SIGN_IN"); // Opens in Sign Up mode
 *   new LogInModal("LOG_IN");  // Opens in Log In mode
 * 
 * Methods:
 * - close(): closes and removes the modal from the DOM
 */
/*export*/ class LogInModal {
    //this is ideally exported elsewhere, but i cant do export/imports without a server i think?
    /**
    * Creates in log in modal
    * 
    * @param mode (string) - "LOG_IN" | "SIGN_IN"
    */
    constructor(mode) {
        if (typeof(mode) !== "string")
            console.error("LogInModal Error: mode arg for constructor must be a string!");

        if (mode !== "LOG_IN" && mode !== "SIGN_IN")
            console.error("LogInModal Error: mode string must be either LOG_IN or SIGN_IN!")

        this._init(mode);
    }

    /**
    * Closes and destroys modal div
    */
    close() {
        this._modal.remove();
        document.body.style.overflow = '';
    }

    _init(mode) {
        //BUG: This doesnt work & idk why
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

        this._modal = document.createElement("div");
        this._modal.innerHTML = DIV;
        document.body.appendChild(this._modal);
        document.body.style.overflow = "hidden";
        this._initListners();

        console.log(this._logInTransition);

        if(mode === "LOG_IN")
            this._modeLogIn();
    }

    _initListners() {
        this._logInTransition = this._modal.querySelector("#log-in-transition");
        this._signUpTransition = this._modal.querySelector("#sign-up-transition");
        this._logInCard = this._modal.querySelector("#log-in-card");
        this._signInContent = this._modal.querySelector("#sign-in-content");
        this._hiddableH4 = this._modal.querySelector("#hiddable");

        this._logInTransition.addEventListener("click", () => {
            this._modeLogIn();
        })

        this._signUpTransition.addEventListener("click", () => {
            this._modeSignUp();
        })

        //when clicking off the modal
        const form = this._modal.querySelector(".form");
        this._modal.addEventListener("click", (e) => {
            if (form.contains(e.target)) {
                return;
            }

            this.close();
            console.log(`test lol`);
        });
    }

    _modeLogIn() {
        this._hiddableH4.classList.add("is-transparent");
        this._logInTransition.classList.add("is-transparent");
        this._logInCard.classList.add("form__panel--active");
        this._signInContent.classList.add("is-transparent");
    }

    _modeSignUp() {
        this._hiddableH4.classList.remove("is-transparent");
        this._logInTransition.classList.remove("is-transparent");
        this._logInCard.classList.remove("form__panel--active")
        this._signInContent.classList.remove("is-transparent");
    }
}

//this is ideally exported elsewhere, but i cant do export/imports without a server i think?
document.getElementById("sign-in").addEventListener("click", () => {
    new LogInModal("SIGN_IN");
})

document.getElementById("register").addEventListener("click", () => {
    new LogInModal("LOG_IN");
})
