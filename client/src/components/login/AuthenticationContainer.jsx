import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-materialize';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

/**
 * AuthenticationContainer - Renders an authentication page for a user
 * to either sign up or login.
 * @param {Object} props - The data passed to this component from its parent.
 * @return {Component|null} - Returns the React Component to be rendered or
 * null if nothing is to be rendered.
 */
export function AuthenticationContainer(props) {
  if (props.user.isLoggedIn) {
    $('#login-modal').modal('close');
    $('#sign-up-modal').modal('close');
    return <Redirect to="/dashboard" />;
  }

  return (
    <div
      id="authentication-container"
      className="authentication-container valign-wrapper full-height"
    >
      <div className="container">
        <div className="container section three-quarters-height">
          <div className="section z-depth-4 white">
            <h3 className="welcome-msg center-align">
              Welcome to Docs Cabinet!
            </h3>
            <div
              className="full-width center-align wraps-content"
            >
              <Modal
                id="sign-up-modal"
                header="Sign up"
                trigger={
                  <Button
                    id="sign-up-form-btn"
                    waves="light"
                    className="quarter-side-margin teal lighten-1"
                  >
                    Sign up
                  </Button>
                }
              >
                <SignUpForm {...props} />
              </Modal>
              <Modal
                id="login-modal"
                header="Login"
                trigger={
                  <Button
                    id="login-form-btn"
                    waves="light"
                    className="quarter-side-margin teal lighten-5 black-text"
                  >Login
                  </Button>
                }
              >
                <LoginForm {...props} />
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = storeState => ({
  user: storeState.user
});

AuthenticationContainer.propTypes = {
  user: PropTypes.objectOf(PropTypes.any).isRequired
};

export default connect(mapStateToProps)(AuthenticationContainer);
