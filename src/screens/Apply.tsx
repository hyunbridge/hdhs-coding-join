import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Auth, CheckPermission, Firebase, SwalDefault } from "../utils";
import "./App.css";

interface IApplyPageProps extends RouteComponentProps {}

interface IApplyPageState {
  studentNumber: string;
  studentName: string;
  phoneNumber: string;
  q1: string;
  q2: string;
  q3: string;
  submitButtonEnabled: boolean;
  deleteButtonEnabled: boolean;
}

class ApplyPage extends React.Component<IApplyPageProps, IApplyPageState> {
  auth: Auth;
  uid: string;

  constructor(props: IApplyPageProps) {
    super(props);
    this.auth = new Auth();
    this.uid = "";
    this.state = {
      studentNumber: "",
      studentName: "",
      q1: "",
      q2: "",
      q3: "",
      phoneNumber: "",
      submitButtonEnabled: false,
      deleteButtonEnabled: true,
    };
  }

  componentDidMount = async () => {
    await this.checkAvaility();
    this.registerAuthStateChangeListener();
  };

  checkAvaility = async () => {
    if ((window as any)["isAvailable"] === undefined) {
      (window as any)["isAvailable"] = await CheckPermission();
    }
    if ((window as any)["isAvailable"] !== true) {
      this.props.history.push("/");
    }
  };

  registerAuthStateChangeListener = () => {
    Firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        if ((window as any)["isAvailable"] === true) {
          this.getForm(user);
        } else {
          this.signOut();
        }
      } else {
        this.props.history.push("/signIn");
      }
    });
  };

  handleInput = (
    event:
      | React.FormEvent<HTMLInputElement>
      | React.FormEvent<HTMLTextAreaElement>
  ) => {
    const input = event.target as HTMLTextAreaElement;
    let invalid: boolean = false;
    switch (input.id) {
      case "studentNumber":
        if (input.value.length <= 5) {
          input.classList.remove("is-invalid");
          this.setState({ studentNumber: input.value.replace(/[^0-9]/g, "") });
          if (/^[1-3]0[1-9][0-3][0-9]$/.test(input.value) === false) {
            input.classList.add("is-invalid");
            invalid = true;
          }
        }
        break;
      case "studentName":
        if (input.value.length <= 5) {
          input.classList.remove("is-invalid");
          this.setState({ studentName: input.value });
          if (/^([???-???]){2,5}$/.test(input.value) === false) {
            input.classList.add("is-invalid");
            invalid = true;
          }
        }
        break;
      case "q1":
        this.setState({ q1: input.value });
        break;
      case "q2":
        this.setState({ q2: input.value });
        break;
      case "q3":
        this.setState({ q3: input.value });
        break;
    }
    const form = document.querySelector("form");
    if (form !== null) {
      this.setState({ submitButtonEnabled: form.checkValidity() && !invalid });
    }
  };

  signOut = () => {
    Firebase.auth().signOut();
  };

  getForm = async (user: Firebase.User | null) => {
    if (user !== null) {
      this.uid = user.uid;
      let E164PhoneNumber: string;
      const form = Firebase.firestore()
        .collection("applicationForms")
        .doc(this.uid);

      if (user.phoneNumber !== null) {
        E164PhoneNumber = user.phoneNumber;
      } else {
        E164PhoneNumber = "";
      }
      this.setState({
        phoneNumber: `010-${E164PhoneNumber.slice(
          5,
          9
        )}-${E164PhoneNumber.slice(9, 13)}`,
      });

      try {
        const doc = await form.get();
        if (doc.exists) {
          const docData = doc.data();
          if (docData !== undefined) {
            this.setState({
              studentNumber: docData["??????"],
              studentName: docData["??????"],
              phoneNumber: `010-${E164PhoneNumber.slice(
                5,
                9
              )}-${E164PhoneNumber.slice(9, 13)}`,
              q1: docData["????????????"],
              q2: docData["????????????"],
              q3: docData["????????????"],
            });
          }
        }
      } catch (_) {
        SwalDefault.fire({
          icon: "error",
          title: "????????? ??? ????????????.",
          text: "????????? ?????? ????????? ?????????.",
        });
      }
    }
  };

  submitForm = async () => {
    this.setState({ submitButtonEnabled: false });
    const form = Firebase.firestore()
      .collection("applicationForms")
      .doc(this.uid);
    try {
      await form.set({
        ??????: parseInt(this.state.studentNumber),
        ??????: this.state.studentName,
        ????????????: this.state.phoneNumber,
        ????????????: this.state.q1,
        ????????????: this.state.q2,
        ????????????: this.state.q3,
      });
      await SwalDefault.fire({
        icon: "success",
        title: "?????????????????????.",
        text: "????????? ????????? ???????????????!",
      });
    } catch (_) {
      await SwalDefault.fire({
        icon: "error",
        title: "????????? ??? ????????????.",
        text: "????????? ?????? ????????? ?????????.",
      });
      this.setState({ submitButtonEnabled: true });
    }
  };

  deleteForm = async () => {
    this.setState({ deleteButtonEnabled: false });
    const form = Firebase.firestore()
      .collection("applicationForms")
      .doc(this.uid);
    const authenticated = await this.auth.auth(`+82 ${this.state.phoneNumber}`);
    if (authenticated) {
      try {
        await form.delete();
        await Firebase.auth().currentUser?.delete();
      } catch (_) {
        SwalDefault.fire({
          icon: "error",
          title: "????????? ??? ????????????.",
          text: "????????? ?????? ????????? ?????????.",
        });
      }
    }
    this.setState({ deleteButtonEnabled: true });
  };

  render() {
    return (
      <div className="warp py-5">
        <h1 className="title fw-bold">????????? ????????????</h1>
        <form>
          <div className="mt-3">
            <h3>#1</h3>
            <p>
              ????????? ????????? ??????, ????????? ????????? ????????? ???????????????. ????????????
              ????????? ?????? ???????????? ?????? ????????? ??????????????? ????????????.
            </p>
            <div
              className="btn-group btn-group-toggle"
              data-toggle="buttons"
              id="selGroup"
              style={{ width: "100%" }}
            >
              <div className="input-group-append">
                <label className="input-group-text" htmlFor="btnGroup">
                  ??????
                </label>
              </div>
              <input
                type="number"
                inputMode="numeric"
                id="studentNumber"
                className="form-control"
                placeholder="10101"
                required
                value={this.state.studentNumber}
                onInput={this.handleInput}
                style={{ padding: ".375rem .75rem" }}
              />
              <div className="input-group-append">
                <label className="input-group-text" htmlFor="btnGroup">
                  ??????
                </label>
              </div>
              <input
                type="text"
                id="studentName"
                className="form-control p-auto"
                minLength={2}
                maxLength={5}
                placeholder="?????????"
                required
                value={this.state.studentName}
                onInput={this.handleInput}
                style={{ padding: ".375rem .75rem" }}
              />
            </div>
            <div
              className="btn-group btn-group-toggle"
              data-toggle="buttons"
              id="selGroup"
              style={{ width: "100%" }}
            >
              <div className="input-group-append">
                <label className="input-group-text" htmlFor="btnGroup">
                  ????????????
                </label>
              </div>
              <input
                type="text"
                id="phoneNumber"
                className="form-control"
                readOnly
                value={this.state.phoneNumber}
              />
            </div>
            <p className="text-muted mt-2">
              ??????????????? ?????????????????? ????????? ?????? ??? ????????? ???????????? ??????
              ??????????????? ?????????.
            </p>
          </div>
          <div className="mt-4">
            <h3>#2</h3>
            <p>
              ?????? ????????? ???????????? ??????????????????. ?????? ??????????????? ?????????
              ????????????.
            </p>
            <h5>???????????? ???????????? ??? ????????? ???????????????.</h5>
            <textarea
              id="q1"
              cols={40}
              rows={3}
              className="mt-3 form-control"
              required
              value={this.state.q1}
              onInput={this.handleInput}
            ></textarea>
            <h5 className="mt-3">
              ????????? ?????????????????? ????????? ????????? ????????? ???????????????.
            </h5>
            <p className="text-muted mt-2">????????? ?????? ???????????? ?????????.</p>
            <textarea
              id="q2"
              cols={40}
              rows={3}
              className="mt-2 form-control"
              value={this.state.q2}
              onInput={this.handleInput}
            ></textarea>
            <h5 className="mt-3">??????????????? ???????????????.</h5>
            <p className="text-muted mt-2">
              ??? ?????? ???, ????????? ?????? ???... ?????? ???????????? ????????????.
            </p>
            <textarea
              id="q3"
              cols={40}
              rows={3}
              className="form-control"
              required
              value={this.state.q3}
              onInput={this.handleInput}
            ></textarea>
          </div>
        </form>

        <div className="text-muted mt-3">
          ??? ???????????? reCAPTCHA??? ???????????? ????????? Google???{" "}
          <a
            href="https://policies.google.com/privacy"
            className="text-dark"
            target="_blank"
            rel="noreferrer"
          >
            ????????????????????????
          </a>
          ???{" "}
          <a
            href="https://policies.google.com/terms"
            className="text-dark"
            target="_blank"
            rel="noreferrer"
          >
            ?????? ??????
          </a>
          ??? ???????????????.
        </div>

        <button
          className="btn btn-dark btn-lg btn-primary btn-block mt-3"
          type="button"
          id="submitButton"
          onClick={this.submitForm}
          disabled={!this.state.submitButtonEnabled}
        >
          ????????? ??????
        </button>
        <button
          className="btn btn-block mt-1"
          type="button"
          id="deleteButton"
          onClick={this.deleteForm}
          disabled={!this.state.deleteButtonEnabled}
        >
          ????????? ??????
        </button>
        <button
          className="btn btn-block mt-3"
          type="button"
          id="signOutButton"
          onClick={this.signOut}
        >
          ????????????
        </button>
      </div>
    );
  }
}

export default ApplyPage;
