const PostedComment = require("../../Domains/comments/entities/PostedComment");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async postComment(postComment) {
    const { content, owner, threadId } = postComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, owner, threadId, false],
    };

    const result = await this._pool.query(query);

    return new PostedComment(result.rows[0]);
  }

  async checkComment(commentId, threadId) {
    const query = {
      text: "SELECT thread_id FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount || result.rows[0].thread_id !== threadId) {
      throw new NotFoundError("comment tidak ditemukan");
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1 AND owner = $2",
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("tidak dapat mengakses resource ini");
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: "UPDATE comments SET is_deleted = true WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.id, users.username, comments.date, comments.content, comments.is_deleted
        FROM comments
        INNER JOIN users ON users.id = comments.owner
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
