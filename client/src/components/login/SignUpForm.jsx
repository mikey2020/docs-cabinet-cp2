import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Icon, Input, ProgressBar, Row } from 'react-materialize';
import { signUp } from '../../actions/UserActions';

/**
 * SignUpForm - Renders the sign up form.
 */
class SignUpForm extends React.Component {
  /**
   * Creates and initializes an instance of SignUpForm.
   * @param {Object} props - The data passed to this component from its parent.
   */
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      password: ''
    };

    this.updateFirstName = this.updateFirstName.bind(this);
    this.updateLastName = this.updateLastName.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.attemptSignUp = this.attemptSignUp.bind(this);
  }

  /**
   * Updates the value of firstName in this Component's state.
   * @param {JqueryEvent} event - Info about the event that occurred on the
   * DOM element this is attached to.
   * @return {null} - Returns nothing.
   */
  updateFirstName(event) {
    event.preventDefault();
    this.setState({
      firstName: event.target.value
    });
  }

  /**
   * Updates the value of lastName in this Component's state.
   * @param {JqueryEvent} event - Info about the event that occurred on the
   * DOM element this is attached to.
   * @return {null} - Returns nothing.
   */
  updateLastName(event) {
    event.preventDefault();
    this.setState({
      lastName: event.target.value
    });
  }

  /**
   * Updates the value of username in this Component's state.
   * @param {JqueryEvent} event - Info about the event that occurred on the
   * DOM element this is attached to.
   * @return {null} - Returns nothing.
   */
  updateUsername(event) {
    event.preventDefault();
    this.setState({
      username: event.target.value
    });
  }

  /**
   * Updates the value of password in this Component's state.
   * @param {JqueryEvent} event - Info about the event that occurred on the
   * DOM element this is attached to.
   * @return {null} - Returns nothing.
   */
  updatePassword(event) {
    event.preventDefault();
    this.setState({
      password: event.target.value
    });
  }

  /**
   * Attempts to create a new account using the supplied credentials.
   * @param {JqueryEvent} event - Info about the event that occurred on the
   * DOM element this is attached to.
   * @return {null} - Returns nothing.
   */
  attemptSignUp(event) {
    // TODO: Validate form input here and, if appropriate, show an error.
    event.preventDefault();
    this.props.dispatch(signUp(
      this.state.firstName,
      this.state.lastName,
      this.state.username,
      this.state.password
    ));
  }

  /**
   * @return {Component|null} - Returns the React Component to be rendered or
   * null if nothing is to be rendered.
   */
  render() {
    return (
      <div id="sign-up-form">
        <h6 className="red-text text-lighten-2">**All fields are required.</h6>
        <form>
          <div
            className={
              this.props.user.status === 'signUpFailed' ?
              'msg-container red lighten-2' :
              'hide msg-container red lighten-2'
            }
          >
            <p className="error-msg white-text center">
              {this.props.user.statusMessage}
            </p>
          </div>
          <Row>
            <Input
              id="update-first-name"
              s={6}
              label="First name"
              onChange={this.updateFirstName}
            >
              <Icon>face</Icon>
            </Input>
            <Input
              id="update-last-name"
              s={6}
              label="Last name"
              onChange={this.updateLastName}
            >
              <Icon>face</Icon>
            </Input>
            <Input
              id="update-username"
              s={12}
              label="Email"
              type="email"
              validate
              onChange={this.updateUsername}
            >
              <Icon>account_circle</Icon>
            </Input>
            <div className="red-text text-lighten-2">
              <p>**An acceptable password must at least contain one
                uppercase letter, one lower case letter, a number
                and a symbol (e.g $, *, #, @ etc).
              </p>
            </div>
            <Input
              id="update-password"
              s={12}
              label="Password"
              type="password"
              onChange={this.updatePassword}
            >
              <Icon>lock</Icon>
            </Input>
            <Button
              id="sign-up-btn"
              className={this.props.user.isLoggingIn ? 'disabled' : ''}
              waves="light"
              onClick={this.attemptSignUp}
            >
              Sign up
              <Icon left>send</Icon>
            </Button>
          </Row>
        </form>
        <Col
          s={12}
          className={
            this.props.user.isLoggingIn ?
            'progress-bar-container' :
            'hide progress-bar-container'
          }
        >
          <ProgressBar />
        </Col>
      </div>
    );
  }
}

SignUpForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired
};

export default SignUpForm;
