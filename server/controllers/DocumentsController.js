import _ from 'lodash';
import Document from '../models/Document';
import User from '../models/User';
import getLimitAndOffset from '../util/getLimitAndOffset';

/**
 * Defines the controller for the /api/documents route.
 * @export
 * @class DocumentsController
 */
export default class DocumentsController {
  /**
   * Creates a new document for a particular user.
   * @param {Request} req - An express Request object with data about the
   * original request sent to this endpoint e.g document title, content etc.
   * @param {Response} res - An express Response object that will contain
   * the info this app will send back to the user e.g success or error
   * messages.
   * @return {void}
   */
  static createDocument(req, res) {
    const reqBody = req.body;
    const title = reqBody.title;
    const content = reqBody.content;
    const access = reqBody.access.toLowerCase();
    const categories = reqBody.categories;
    const tags = reqBody.tags;

    const createdBy = req.decodedUserProfile.id;

    const newDocument = {
      title,
      content,
      access,
      categories,
      tags,
      createdBy
    };
    Document
      .create(newDocument)
      .then((createdDocument) => {
        res.status(200)
          .json({
            message: 'Your document was successfully created.',
            documents: [{
              id: createdDocument.id,
              title: createdDocument.title,
              content: createdDocument.content,
              access: createdDocument.access,
              categories: createdDocument.categories,
              tags: createdDocument.tags,
              createdAt: createdDocument.createdAt,
              createdBy: createdDocument.createdBy
            }]
          });
      });
  }

  /**
   * Sends an authenticated user a document identified by a particular id.
   * Other details include:
   * - if the specified id is invalid, it sends an InvalidDocumentIdError
   * response. The id is invalid if it cannot be parsed to an integer.
   * - if the requested document has an access type that does not fit the
   * role of user making this request, this function sends a
   * ForbiddenOperationError response.
   * @param {Request} req - An express Request object with data about the
   * original request sent to this endpoint.
   * @param {Response} res - An express Response object that will contain
   * the identified document, error messages, HTTP status codes etc.
   * @return {void}
   */
  static getDocument(req, res) {
    const pathInfo = req.path.split('/');
    const documentIdString = pathInfo[1];

    const documentId = Number(documentIdString);
    if (Number.isNaN(documentId)) {
      res.status(400)
        .json({
          message: 'The document id you supplied is not a valid number.',
          error: 'InvalidDocumentIdError'
        });
      return;
    }

    const id = req.decodedUserProfile.id;
    const roleId = req.decodedUserProfile.roleId;

    Document
      .findOne({
        where: {
          id: documentId
        },
        attributes: ['id', 'title', 'content', 'access', 'categories', 'tags', 'createdAt', 'createdBy']
      })
      .then((foundDocument) => {
        if (foundDocument) {
          if (foundDocument.access === 'public') {
            res.status(200)
              .json({
                message: 'Document found.',
                documents: [foundDocument]
              });
            return;
          }

          if (foundDocument.access === 'private') {
            if (id === foundDocument.createdBy || roleId > 0) {
              res.status(200)
                .json({
                  message: 'Document found.',
                  documents: [foundDocument]
                });
            } else {
              res.status(403)
                .json({
                  message: 'You cannot access this document.',
                  error: 'ForbiddenOperationError'
                });
            }
            return;
          }

          if (foundDocument.access === 'role') {
            User
              .findOne({
                where: {
                  id: foundDocument.createdBy
                },
                attributes: ['id', 'roleId']
              })
              .then((foundAuthor) => {
                if (foundAuthor) {
                  if (foundAuthor.roleId === roleId) {
                    res.status(200)
                      .json({
                        message: 'Document found.',
                        documents: [foundDocument]
                      });
                  } else {
                    res.status(403)
                      .json({
                        message: 'You cannot access this document.',
                        error: 'ForbiddenOperationError'
                      });
                  }
                }
              });
          }
        } else {
          res.status(404)
            .json({
              message: 'The document you requested for doesn\'t exist.',
              error: 'NoDocumentsFoundError'
            });
        }
      });
  }

  /**
   * Sends an authenticated user a list of documents.
   * @param {Request} req - An express Request object with data about the
   * original request sent to this endpoint.
   * @param {Response} res - An express Response object that will contain
   * the list of documents available and other data e.g HTTP status codes etc.
   * @return {void}
   */
  static getAllDocuments(req, res) {
    const limitAndOffset = getLimitAndOffset(req.query.limit, req.query.offset);
    const limit = limitAndOffset.limit;
    const offset = limitAndOffset.offset;
    const id = req.decodedUserProfile.id;

    Document
      .findAll({
        // TODO: Add restrictions for 'role' and admin access of private
        // files, using hasMany(), belongsTo() etc.
        where: {
          $or: [
            { access: 'public' },
            { createdBy: id },
          ]
        },
        attributes: ['id', 'title', 'content', 'access', 'categories', 'tags', 'createdAt', 'createdBy'],
        limit,
        offset
      })
      .then((foundDocuments) => {
        res.status(200)
          .json({
            message: 'Documents found.',
            documents: foundDocuments
          });
      });
  }

  /**
   * Updates a document's title, content, access type, categories or tags. Before
   * performing the update, this function checks that:
   * - the HTTP request includes the id of the document that is to be updated.
   * Else, it sends a DocumentIdNotSuppliedError response.
   * - the included document id is valid, else it sends an InvalidDocumentIdError
   * response. A document id is invalid if it is not an integer.
   * - the included document id belongs to an existing document in this app,
   * else it sends a TargetDocumentNotFoundError response.
   * - the person performing this request is the one who initially created the
   * document. Else, it sends a ForbiddenOperationError response.
   * @param {Request} req - An express Request object with data about the
   * original request sent to this endpoint.
   * @param {Response} res - An express Response object that will contain
   * the info this app will send back to the user e.g error messages for
   * failed updates etc.
   * @return {void}
   */
  static updateDocument(req, res) {
    const userProfile = req.decodedUserProfile;
    const documentUpdate = req.body;

    const documentIdString = req.path.split('/')[1];
    if (documentIdString === undefined || documentIdString === '') {
      res.status(400)
        .json({
          message: 'Oops! You didn\'t supply the id of the document.',
          error: 'DocumentIdNotSuppliedError'
        });
      return;
    }

    const documentId = Number(documentIdString);
    if (Number.isNaN(documentId)) {
      res.status(400)
        .json({
          message: 'The document id you supplied is not a number.',
          error: 'InvalidDocumentIdError'
        });
      return;
    }

    if (!documentUpdate || _.isEqual(documentUpdate, {})) {
      res.status(400)
        .json({
          message: 'You didn\'t supply any info for the update.',
          error: 'EmptyDocumentBodyError'
        });
    }

    Document
      .findById(documentId)
      .then((foundDocument) => {
        if (foundDocument) {
          const updaterId = userProfile.id;
          if (foundDocument.createdBy === updaterId) {
            const document = {};
            if (documentUpdate.title) {
              document.title = documentUpdate.title;
            }
            if (documentUpdate.content) {
              document.content = documentUpdate.content;
            }
            if (documentUpdate.access) {
              document.access = documentUpdate.access;
            }
            if (documentUpdate.categories) {
              document.categories = documentUpdate.categories;
            }
            if (documentUpdate.tags) {
              document.tags = documentUpdate.tags;
            }

            Document
              .update(document, {
                where: {
                  id: documentId
                },
                returning: true
              })
              .then((docs) => {
                const updatedDocument = docs[1][0];
                res.status(200)
                  .json({
                    message: 'Document updated.',
                    documents: [{
                      id: updatedDocument.id,
                      title: updatedDocument.title,
                      content: updatedDocument.content,
                      access: updatedDocument.access,
                      categories: updatedDocument.categories,
                      tags: updatedDocument.tags,
                      createdAt: updatedDocument.createdAt,
                      createdBy: updatedDocument.createdBy,
                    }]
                  });
              });
          } else {
            res.status(403)
              .json({
                message: 'Halt! You cannot modify this document.',
                error: 'ForbiddenOperationError'
              });
          }
        } else {
          res.status(404)
            .json({
              message: 'The document you tried to update doesn\'t exist.',
              error: 'TargetDocumentNotFoundError'
            });
        }
      });
  }

  /**
   * Delete a document. Before performing the update, this function checks
   * that:
   * - the HTTP request includes the id of the document that is to be deleted.
   * Else, it sends a DocumentIdNotSuppliedError response.
   * - the included document id is valid, else it sends an InvalidDocumentIdError
   * response. A document id is invalid if it is not an integer.
   * - the included document id belongs to an existing document in this app,
   * else it sends a TargetDocumentNotFoundError response.
   * - the person performing this request is either the one who initially created the
   * document or an admin. Else, it sends a ForbiddenOperationError response.
   * @param {Request} req - An express Request object with data about the
   * original request sent to this endpoint.
   * @param {Response} res - An express Response object that will contain
   * the info this app will send back to the user e.g error messages for
   * failed updates etc.
   * @return {void}
   */
  static deleteDocument(req, res) {
    const userProfile = req.decodedUserProfile;
    const documentIdString = req.path.split('/')[1];
    if (documentIdString === undefined || documentIdString === '') {
      res.status(400)
        .json({
          message: 'Oops! You didn\'t supply the id of the document.',
          error: 'DocumentIdNotSuppliedError'
        });
      return;
    }

    const documentId = Number(documentIdString);
    if (Number.isNaN(documentId)) {
      res.status(400)
        .json({
          message: 'The document id you supplied is not a number.',
          error: 'InvalidDocumentIdError'
        });
      return;
    }

    Document
      .findById(documentId)
      .then((foundDocument) => {
        if (foundDocument) {
          const deleterId = userProfile.id;
          if (foundDocument.createdBy === deleterId || userProfile.roleId > 0) {
            Document
              .destroy({
                where: {
                  id: documentId
                }
              })
              .then(() => {
                res.status(200)
                  .json({
                    message: 'Document deleted.'
                  });
              });
          } else {
            res.status(403)
              .json({
                message: 'Halt! You cannot modify this document.',
                error: 'ForbiddenOperationError'
              });
          }
        } else {
          res.status(404)
            .json({
              message: 'The document you tried to delete doesn\'t exist.',
              error: 'TargetDocumentNotFoundError'
            });
        }
      });
  }
}
