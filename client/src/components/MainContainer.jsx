import React from 'react';
import { Button, Icon, Modal, SideNav, SideNavItem } from 'react-materialize';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import uuid from 'uuid';
import { logout } from '../actions/UserActions';
import ViewUserDocumentsPage from './ViewUserDocumentsPage';
import UpdateUserPage from './UpdateUserPage';
import UsersPage from './UsersPage';
import UpdateDocument from './UpdateDocument';
import ViewAllDocumentsPage from './ViewAllDocumentsPage';

/**
 * MainContainer - Renders all the Components of the dashboard.
 */
class MainContainer extends React.Component {
  /**
   * Creates and initializes an instance of MainContainer.
   * @param {Object} props - The data passed to this Component from its parent.
   */
  constructor(props) {
    super(props);

    this.getAdminSection = this.getAdminSection.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * Renders menu options that are meant for admin users only.
   * @return {Array|null} - Returns an array of Components to render, or null
   * if the current user is not an admin.
   */
  getAdminSection() {
    if (this.props.user.user.roleId > 0) {
      return [
        (<li key={uuid.v4()}>
          <NavLink
            exact
            to="/dashboard/users"
            activeClassName="teal lighten-2 white-text disabled"
          >
            <Icon left>people</Icon>
            Users
          </NavLink>
        </li>),
        (<SideNavItem divider key={uuid.v4()} />)
      ];
    }
  }

  /**
   * Attempts to log a user out.
   * @return {null} - Returns nothing.
   */
  logout() {
    this.props.dispatch(logout());
  }

  /**
   * @return {Component|null} - Returns the React Component to be rendered or
   * null if nothing is to be rendered.
   */
  render() {
    if (this.props.user.status === 'deletedUser'
      && this.props.user.user.id === this.props.user.deletedUserId) {
      window.localStorage.clear();
      $('#deleteAccountModal').modal('close');
      Materialize.toast(this.props.user.statusMessage, 5000);
      return <Redirect to="/dashboard" />;
    }

    if (!this.props.user.isLoggedIn) {
      Materialize.toast(this.props.user.statusMessage, 5000);
      return <Redirect to="/" />;
    }

    if (this.props.documents.status === 'documentCreated') {
      $('#updateDocumentModal').modal('close');
    }

    const trigger = (<Button className="dashboard-menu-btn">
      Menu
      <Icon left>menu</Icon>
    </Button>);

    return (
      <div className="authenticated-user-area grey lighten-3">
        <SideNav
          trigger={trigger}
          options={{
            menuWidth: 300,
            closeOnClick: true,
            edge: 'right',
            draggable: true
          }}
        >
          <SideNavItem
            userView
            className="text-black"
            user={{
              background: '/img/dark-mountains-small.jpg',
              image: '/img/anonymous-user-thumbnail.png',
              name: `${this.props.user.user.firstName} ${this.props.user.user.lastName}`,
              email: this.props.user.user.username
            }}
          />
          <SideNavItem className="row">
            <Modal
              header="Create Document"
              id="updateDocumentModal"
              trigger={
                <Button className="col s12">Compose</Button>
              }
            >
              <UpdateDocument {...this.props} mode="create" modeMessage="Create document" />
            </Modal>
          </SideNavItem>
          <SideNavItem divider />
          <li key={uuid.v4()}>
            <NavLink
              exact
              to="/dashboard"
              activeClassName="teal lighten-2 white-text disabled"
            >
              <Icon left>home</Icon>
              Home
            </NavLink>
          </li>
          <li key={uuid.v4()}>
            <NavLink
              exact
              to="/dashboard/myDocuments"
              activeClassName="teal lighten-2 white-text disabled"
            >
              <Icon left>library_books</Icon>
              My documents
            </NavLink>
          </li>
          <li key={uuid.v4()}>
            <NavLink
              exact
              to={`/dashboard/profile/${this.props.user.user.id}`}
              activeClassName="teal lighten-2 white-text disabled"
            >
              <Icon left>person_outline</Icon>
              Update profile
            </NavLink>
          </li>
          <SideNavItem divider />
          {this.getAdminSection()}
          <SideNavItem waves onClick={this.logout} icon="input">Logout</SideNavItem>
        </SideNav>

        <Switch>
          <Route path="/dashboard/profile" render={() => <UpdateUserPage {...this.props} />} />
          <Route path="/dashboard/users" render={() => <UsersPage {...this.props} />} />
          <Route path="/dashboard/updateUser" render={() => <UpdateUserPage {...this.props} />} />
          <Route path="/dashboard/myDocuments" render={() => <ViewUserDocumentsPage {...this.props} />} />
          <Route exact path="*" render={() => <ViewAllDocumentsPage {...this.props} />} />
        </Switch>
      </div>
    );
  }
}

const mapStoreToProps = store => ({
  user: store.user,
  documents: store.documents
});

MainContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  documents: PropTypes.objectOf(PropTypes.any).isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired
};

export default connect(mapStoreToProps)(MainContainer);