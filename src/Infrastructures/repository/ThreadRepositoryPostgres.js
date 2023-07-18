const PostedThread = require("../../Domains/threads/entities/PostedThread");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async postThread(postThread) {
    const { title, body, owner } = postThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);

    return new PostedThread({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;
