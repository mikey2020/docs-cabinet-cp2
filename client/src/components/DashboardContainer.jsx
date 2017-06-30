import React from 'react';
import { Button, Col, Icon, Modal, Preloader, Row, SideNav, SideNavItem } from 'react-materialize';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { fetchUserDocuments } from '../actions/DocumentActions';
import { logout } from '../actions/UserActions';
import Document from './Document';
import UpdateDocument from './UpdateDocument';

/**
 * DashboardContainer - Renders the dashboard.
 */
class DashboardContainer extends React.Component {
  /**
   * Creates and initializes an instance of DashboardContainer.
   * @param {Object} props - The data passed to this Component from its parent.
   */
  constructor(props) {
    super(props);

    this.state = {
      limit: 30,
      offset: 0
    };

    this.startDocumentsFetch = this.startDocumentsFetch.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * Called immediately after this Component is mounted.
   * @return {null} - Returns nothing.
   */
  componentDidMount() {
    this.startDocumentsFetch();
  }

  /**
   * Attempts to fetch a user's documents.
   * @return {null} - Returns nothing.
   */
  startDocumentsFetch() {
    this.props.dispatch(fetchUserDocuments(
      this.props.user.token,
      this.props.user.user.userId,
      this.state.limit,
      this.state.offset
    ));
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
    if (!this.props.user.isLoggedIn) {
      return <Redirect to="/" />;
    }

    if (this.props.documents.status === 'invalidTokenError') {
      window.localStorage.clear();
      Materialize.toast(this.props.documents.statusMessage, 5000);
      return <Redirect to="/" />;
    }

    if (this.props.documents.status !== 'fetchingDocuments') {
      Materialize.toast(this.props.documents.statusMessage, 3000);
    }

    if (this.props.documents.status === 'documentCreated') {
      $('#updateDocumentModal').modal('close');
    }

    const trigger = <Button>Menu<Icon left>menu</Icon></Button>;
    const showStatusMessage = this.props.documents.status === 'fetchingDocuments' ||
      this.props.documents.status === 'documentsFetchFailed';

    const documentsComponents = this.props.documents.documents.map(doc => (
      <Document
        key={doc.id}
        dispatch={this.props.dispatch}
        token={this.props.user.token}
        documentsStatus={this.props.documents.status}
        targetDocument={this.props.documents.targetDocument}
        {...doc}
      />
    ));

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
          <SideNavItem waves onClick={this.logout} icon="input">Logout</SideNavItem>
        </SideNav>
        <div className="dashboard-container">
          <div className="dashboard-welcome">
            <h3>Welcome to your dashboard!</h3>
            <h5 className={showStatusMessage ? '' : 'hide'}>{this.props.documents.statusMessage}</h5>
            <Row className={this.props.documents.status === 'fetchingDocuments' ? '' : 'hide'}>
              <Col s={4} offset="s4">
                <Preloader size="big" flashing />
              </Col>
            </Row>
            <Button
              onClick={this.startDocumentsFetch}
              className={this.props.documents.status === 'documentsFetchFailed' ? '' : 'hide'}
            >
              {this.props.documents.statusMessage}
            </Button>
          </div>
          <div className={this.props.documents.documents.length < 1 ? '' : 'hide'}>
            <h5 className="teal lighten-2 white-text center">
              You don&rsquo;t have any documents. Please create some.
            </h5>
          </div>
          <div className="dashboard-documents row">{documentsComponents}</div>
        </div>
      </div>
    );
  }
}

const mapStoreToProps = store => ({
  user: store.user,
  documents: store.documents
});

DashboardContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  documents: PropTypes.objectOf(PropTypes.any).isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired
};

export default connect(mapStoreToProps)(DashboardContainer);
