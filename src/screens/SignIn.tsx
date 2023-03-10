import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Auth, CheckPermission, Firebase } from "../utils";
import "./App.css";

interface ISignInPageProps extends RouteComponentProps {}

interface ISignInPageState {
  phoneNumber: string;
  signInButtonEnabled: boolean;
}

class SignInPage extends React.Component<ISignInPageProps, ISignInPageState> {
  auth: Auth;

  constructor(props: ISignInPageProps) {
    super(props);
    this.auth = new Auth();
    this.state = {
      phoneNumber: "010-",
      signInButtonEnabled: false,
    };
  }

  componentDidMount = () => {
    this.checkAvaility();
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
        this.props.history.push("/apply");
      }
    });
  };

  handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let phoneNumberWithoutHyphen: string;
    let phoneNumber: string;
    let signInButtonEnabled: boolean;

    phoneNumberWithoutHyphen = e.target.value.replace(/[^0-9]/g, "");

    if (phoneNumberWithoutHyphen.slice(0, 3) !== "010") {
      phoneNumberWithoutHyphen = "010";
    }

    if (phoneNumberWithoutHyphen.length < 8) {
      phoneNumber = `${phoneNumberWithoutHyphen.slice(
        0,
        3
      )}-${phoneNumberWithoutHyphen.slice(3, 7)}`;
    } else {
      phoneNumber = `${phoneNumberWithoutHyphen.slice(
        0,
        3
      )}-${phoneNumberWithoutHyphen.slice(
        3,
        7
      )}-${phoneNumberWithoutHyphen.slice(7, 11)}`;
    }

    if (phoneNumber.length === 13) {
      signInButtonEnabled = true;
    } else {
      signInButtonEnabled = false;
    }

    this.setState({
      phoneNumber: phoneNumber,
      signInButtonEnabled: signInButtonEnabled,
    });
  };

  handleClick = async () => {
    this.setState({ signInButtonEnabled: false });
    await this.auth.auth(`+82 ${this.state.phoneNumber}`);
    this.setState({ signInButtonEnabled: true });
  };

  handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && this.state.signInButtonEnabled) {
      this.setState({ signInButtonEnabled: false });
      await this.auth.auth(`+82 ${this.state.phoneNumber}`);
      this.setState({ signInButtonEnabled: true });
    }
  };

  render() {
    return (
      <div className="warp py-5 text-center  to-be-shown">
        <h1 className="title fw-bold">???????????????!????</h1>
        <p className="desp">??????????????? ???????????? ??????????????????.</p>
        <input
          autoFocus={true}
          type="text"
          inputMode="numeric"
          id="phoneNumber"
          className="text-center text-lg text-center text-monospace form-control"
          value={this.state.phoneNumber}
          onInput={this.handleInput}
          onKeyUp={this.handleKeyUp}
        />
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
          id="signinButton"
          disabled={!this.state.signInButtonEnabled}
          onClick={this.handleClick}
        >
          ?????????
        </button>
      </div>
    );
  }
}

export default SignInPage;
