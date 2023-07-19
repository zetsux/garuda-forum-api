const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrate the get thread action correctly", async () => {
    // Arrange
    const useCasePayload = { threadId: "thread-123" };
    const expectedThread = {
      id: "thread-h_2FkLZhtgBKY2kh4CC02",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "uname",
    };

    const commentId1 = "comment-_pby2_tmXV6bcvcdev8xk";
    const commentId2 = "comment-yksuCoxM2s4MMrZJO-qVD";

    const expectedComments = [
      {
        id: commentId1,
        username: "uname2",
        date: "2021-08-08T07:22:33.555Z",
        content: "sebuah comment",
        is_deleted: false,
      },
      {
        id: commentId2,
        username: "uname3",
        date: "2021-08-08T07:26:21.338Z",
        content: "sebuah comment 2",
        is_deleted: true,
      },
    ];

    const expectedReplies = [
      {
        id: "reply-BErOXUSefjwWGW1Z10Ihk",
        content: "reply content",
        date: "2021-08-08T07:59:48.766Z",
        username: "johndoe",
        is_deleted: true,
        comment_id: commentId1,
      },
      {
        id: "reply-xNBtm9HPR-492AeiimpfN",
        content: "sebuah balasan",
        date: "2021-08-08T08:07:01.522Z",
        username: "dicoding",
        is_deleted: false,
        comment_id: commentId1,
      },
    ];

    const expectedResult = {
      id: "thread-h_2FkLZhtgBKY2kh4CC02",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "uname",
      comments: [
        {
          id: commentId1,
          username: "uname2",
          date: "2021-08-08T07:22:33.555Z",
          replies: [
            {
              id: "reply-BErOXUSefjwWGW1Z10Ihk",
              content: "**balasan telah dihapus**",
              date: "2021-08-08T07:59:48.766Z",
              username: "johndoe",
            },
            {
              id: "reply-xNBtm9HPR-492AeiimpfN",
              content: "sebuah balasan",
              date: "2021-08-08T08:07:01.522Z",
              username: "dicoding",
            },
          ],
          content: "sebuah comment",
        },
        {
          id: commentId2,
          username: "uname3",
          date: "2021-08-08T07:26:21.338Z",
          replies: [],
          content: "**komentar telah dihapus**",
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-h_2FkLZhtgBKY2kh4CC02",
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "uname",
      })
    );
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: commentId1,
          username: "uname2",
          date: "2021-08-08T07:22:33.555Z",
          content: "sebuah comment",
          is_deleted: false,
        },
        {
          id: commentId2,
          username: "uname3",
          date: "2021-08-08T07:26:21.338Z",
          content: "sebuah comment 2",
          is_deleted: true,
        },
      ])
    );
    mockReplyRepository.getRepliesByCommentId = jest
      .fn()
      // eslint-disable-next-line no-confusing-arrow
      .mockImplementation((commentId) =>
        commentId === commentId1
          ? Promise.resolve([
              {
                id: "reply-BErOXUSefjwWGW1Z10Ihk",
                content: "reply content",
                date: "2021-08-08T07:59:48.766Z",
                username: "johndoe",
                is_deleted: true,
                comment_id: commentId1,
              },
              {
                id: "reply-xNBtm9HPR-492AeiimpfN",
                content: "sebuah balasan",
                date: "2021-08-08T08:07:01.522Z",
                username: "dicoding",
                is_deleted: false,
                comment_id: commentId1,
              },
            ])
          : Promise.resolve([])
      );

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(result).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(commentId1);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(commentId2);
  });
});