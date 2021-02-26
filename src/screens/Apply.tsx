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
          if (/^([가-힣]){2,5}$/.test(input.value) === false) {
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
              studentNumber: docData["학번"],
              studentName: docData["이름"],
              phoneNumber: `010-${E164PhoneNumber.slice(
                5,
                9
              )}-${E164PhoneNumber.slice(9, 13)}`,
              q1: docData["지원동기"],
              q2: docData["관련경험"],
              q3: docData["자기소개"],
            });
          }
        }
      } catch (_) {
        SwalDefault.fire({
          icon: "error",
          title: "불러올 수 없습니다.",
          text: "나중에 다시 시도해 보세요.",
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
        학번: parseInt(this.state.studentNumber),
        이름: this.state.studentName,
        전화번호: this.state.phoneNumber,
        지원동기: this.state.q1,
        관련경험: this.state.q2,
        자기소개: this.state.q3,
      });
      await SwalDefault.fire({
        icon: "success",
        title: "제출되었습니다.",
        text: "신청해 주셔서 감사합니다!",
      });
    } catch (_) {
      await SwalDefault.fire({
        icon: "error",
        title: "제출할 수 없습니다.",
        text: "나중에 다시 시도해 보세요.",
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
          title: "삭제할 수 없습니다.",
          text: "나중에 다시 시도해 보세요.",
        });
      }
    }
    this.setState({ deleteButtonEnabled: true });
  };

  render() {
    return (
      <div className="warp py-5">
        <h1 className="title fw-bold">지원서 작성✍️</h1>
        <form>
          <div className="mt-3">
            <h3>#1</h3>
            <p>
              동아리 가입을 위해, 정확한 학번과 이름을 남겨주세요. 부정확한
              정보로 인해 발생하는 모든 책임은 지원자에게 있습니다.
            </p>
            <div
              className="btn-group btn-group-toggle"
              data-toggle="buttons"
              id="selGroup"
              style={{ width: "100%" }}
            >
              <div className="input-group-append">
                <label className="input-group-text" htmlFor="btnGroup">
                  학번
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
                  이름
                </label>
              </div>
              <input
                type="text"
                id="studentName"
                className="form-control p-auto"
                minLength={2}
                maxLength={5}
                placeholder="폰은정"
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
                  전화번호
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
              전화번호를 수정하시려면 지원서 삭제 후 새로운 지원서를 다시
              작성하셔야 합니다.
            </p>
          </div>
          <div className="mt-4">
            <h3>#2</h3>
            <p>
              다음 질문에 간단하게 답변해주세요. 너무 부담갖으실 필요는
              없습니다.
            </p>
            <h5>동아리에 지원하게 된 동기를 남겨주세요.</h5>
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
              컴퓨터 프로그래밍과 관련된 경험을 간단히 적어주세요.
            </h5>
            <p className="text-muted mt-2">없으면 적지 않으셔도 됩니다.</p>
            <textarea
              id="q2"
              cols={40}
              rows={3}
              className="mt-2 form-control"
              value={this.state.q2}
              onInput={this.handleInput}
            ></textarea>
            <h5 className="mt-3">자기소개를 남겨주세요.</h5>
            <p className="text-muted mt-2">
              잘 하는 것, 어려워 하는 것... 아무 것들이나 좋습니다.
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
          이 사이트는 reCAPTCHA로 보호받고 있으며 Google의{" "}
          <a
            href="https://policies.google.com/privacy"
            className="text-dark"
            target="_blank"
            rel="noreferrer"
          >
            개인정보처리방침
          </a>
          과{" "}
          <a
            href="https://policies.google.com/terms"
            className="text-dark"
            target="_blank"
            rel="noreferrer"
          >
            이용 약관
          </a>
          이 적용됩니다.
        </div>

        <button
          className="btn btn-dark btn-lg btn-primary btn-block mt-3"
          type="button"
          id="submitButton"
          onClick={this.submitForm}
          disabled={!this.state.submitButtonEnabled}
        >
          지원서 제출
        </button>
        <button
          className="btn btn-block mt-1"
          type="button"
          id="deleteButton"
          onClick={this.deleteForm}
          disabled={!this.state.deleteButtonEnabled}
        >
          지원서 삭제
        </button>
        <div className="text-muted text-right fixed-top m-2">
          <button
            className="btn"
            type="button"
            id="signOutButton"
            onClick={this.signOut}
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }
}

export default ApplyPage;
