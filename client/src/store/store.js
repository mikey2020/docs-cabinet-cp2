import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';

const middleware = applyMiddleware(thunk);

const token = window.localStorage.getItem('token');
const userString = window.localStorage.getItem('user');
let isLoggedIn = false;
const isLoggingIn = false;
const isLoggingOut = false;
let user = {};
if (token) {
  isLoggedIn = true;
  user = JSON.parse(userString);
}

const store = createStore(
  reducers,
  {
    user: {
      isLoggedIn,
      isLoggingIn,
      isLoggingOut,
      token,
      user,
      allUsers: [],
      status: '',
      statusMessage: '',
      deletedUserId: -1,
      userToUpdate: {}
    },
    documents: {
      userDocumentsCount: 0,
      userDocuments: [],
      allDocumentsCount: 0,
      allDocuments: [],
      status: 'fetchingAllDocuments',
      statusMessage: 'Loading documents... Please wait...',
      targetDocumentId: -1,
      documentToUpdate: {}
    },
    search: {
      users: {
        lastSearchQuery: '',
        lastSearchResultsCount: 0,
        lastSearchResults: []
      },
      documents: {
        lastSearchQuery: '',
        lastSearchResultsCount: 0,
        lastSearchResults: []
      }
    }
  },
  middleware
);

export default store;
