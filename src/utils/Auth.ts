import { SwalDefault, Firebase } from "../utils";

let recaptchaVerifier = (window as any)["recaptchaVerifier"];

class Auth {
  firebaseAuth: Firebase.auth.Auth;

  constructor() {
    this.firebaseAuth = Firebase.auth();

    if (recaptchaVerifier === undefined) {
      recaptchaVerifier = new Firebase.auth.RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          "expired-callback": () => recaptchaVerifier.reset(),
        }
      );
      this.firebaseAuth.setPersistence(Firebase.auth.Auth.Persistence.LOCAL);
      if (
        document.getElementById("recaptcha-container")?.childNodes.length === 0
      ) {
        recaptchaVerifier.render();
      }
    }
  }

  async auth(phoneNumber: string) {
    let result: Firebase.auth.UserCredential;
    let user: Firebase.User | null = null;
    try {
      const confirmationResult = await this.firebaseAuth.signInWithPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );
      recaptchaVerifier.reset();
      await SwalDefault.fire({
        title: "인증번호 입력",
        html: `<label for="authCode" class="m-2">인증문자가 발송되었습니다. 발송된 6자리 인증번호를 입력해 주세요.</label>
                       <input inputmode="numeric" id="authCode" class="text-center text-lg text-monospace form-control my-3 p-0" maxlength="6" />`,
        showCancelButton: true,
        willOpen: () => {
          const input = document.querySelector("#authCode") as HTMLInputElement;
          const confirmButton = document.querySelector(
            ".swal2-confirm"
          ) as HTMLButtonElement;
          confirmButton.disabled = true;
          input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            input.value = input.value.replace(/[^0-9]/g, "");
            if (input.value.length === 6) {
              confirmButton.disabled = false;
            } else {
              confirmButton.disabled = true;
            }
          });
          input.addEventListener("keyup", async (e) => {
            if (e.key === "Enter") {
              confirmButton.click();
            }
          });
        },
        preConfirm: async () => {
          const input = document.querySelector("#authCode") as HTMLInputElement;
          try {
            result = await confirmationResult.confirm(input.value);
            user = result.user;
          } catch (_) {
            input.classList.add("is-invalid");
            return false;
          }
        },
      });
    } catch (_) {
      await SwalDefault.fire({
        icon: "error",
        title: "인증할 수 없습니다.",
      });
    }
    return Boolean(user);
  }

  async checkPermission() {
    const form = Firebase.firestore().collection("permissions").doc("form");
    try {
      const doc = await form.get();
      if (doc.exists && doc.data()?.access === true) {
        return true;
      }
    } catch (_) {
      // Pass
    }
    return false;
  }
}

export default Auth;
