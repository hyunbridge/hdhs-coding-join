import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { SweetAlertResult } from 'sweetalert2';
import { SwalDefault, CheckPermission } from '../utils';
import './App.css';

interface IHomePageProps extends RouteComponentProps {
}

interface IHomePageState {
  buttonContent: JSX.Element;
  buttonEnabled: boolean;
}

class HomePage extends React.Component<IHomePageProps, IHomePageState> {
  constructor(props: IHomePageProps) {
    super(props);
    this.state = {
      buttonContent: <span className="spinner-border" role="status" aria-hidden="true" style={{ width: '1.5rem', height: '1.5rem' }}></span>,
      buttonEnabled: false
    };
  }

  componentDidMount() {
    this.checkAvaility();
  }

  checkAvaility = async () => {
    if ((window as any)['isAvailable'] === undefined) {
      (window as any)['isAvailable'] = await CheckPermission();
    }
    if ((window as any)['isAvailable'] === true) {
      this.setState({
        buttonContent: <span>지금 지원하기</span>,
        buttonEnabled: true
      });
    } else {
      this.setState({
        buttonContent: <span>지금은 지원 가능 기간이 아닙니다.</span>,
        buttonEnabled: false
      });
    }
  }

  handleClick = async () => {
    const result: SweetAlertResult<any> = await SwalDefault.fire({
      html: '<h3><a href="https://www.notion.so/c23f95d4dc6b49b1a4e0e64a496a3e36" target="_blank">개인정보처리방침</a>에 동의하시나요?</h3>',
      showCancelButton: true,
      confirmButtonText: '네',
      cancelButtonText: '아니요',
      focusCancel: true,
    });
    if (result.isConfirmed) {
      this.props.history.push('/signIn');
    }
  }

  render() {
    return (
      <div className="warp py-5 text-center">
        <h1 className="title fw-bold mb-3">융합코딩👩‍💻</h1>
        <h3>무엇을 하나요?</h3>
        <p>멘티-멘토 활동을 통해 Python의 기초를 배우고, 나아가 개인별 혹은 팀별로 간단한 프로그램을 구상하고 작성해 보는 활동을 계획하고 있습니다. 그러나, 코로나 19 혹은 학교의 사정 등으로 활동이
      일부 변경 혹은 삭제될 수 있음을 알아두시기 바랍니다.</p>
        <h3>누가 지원할 수 있나요?</h3>
        <p>실력에 관계 없이, 컴퓨터를 싫어하지만 않는 흥덕고등학교 학생이라면 누구나 지원할 수 있습니다.</p>
        <h3>어떻게 지원할 수 있나요?</h3>
        <p>온라인 지원 시스템을 통하여 SMS 인증 후 지원할 수 있습니다.</p>
        <button className="btn btn-dark btn-lg btn-primary btn-block mt-3" type="button" id="applyButton" onClick={this.handleClick} disabled={!this.state.buttonEnabled}>{this.state.buttonContent}</button>
      </div>
    );
  }
}

export default HomePage;
