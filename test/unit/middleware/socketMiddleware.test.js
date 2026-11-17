import { expect } from "chai";
import sinon from "sinon";
import { createSocketMiddleware } from "../../../src/client/middleware/socketMiddleware";
import { emit, on, off, ping } from "../../../src/client/actions/server";

describe("Socket middleware", () => {
  let socket;
  let next;
  let dispatch;

  beforeEach(() => {
    socket = { emit: sinon.spy(), on: sinon.spy(), off: sinon.spy() };
    next = sinon.spy();
    dispatch = createSocketMiddleware(socket)()(next);
  });

  it("emits server events", () => {
    dispatch(emit("join-room", { room: "r", player: "bob" }));
    expect(socket.emit.calledOnceWith("join-room", { room: "r", player: "bob" }))
      .to.be.true;
    expect(next.called).to.be.false;
  });

  it("subscribes and unsubscribes to server events", () => {
    const handler = () => {};
    dispatch(on("next-piece", handler));
    dispatch(off("next-piece", handler));
    dispatch(off("rooms"));

    expect(socket.on.calledOnceWith("next-piece", handler)).to.be.true;
    expect(socket.off.firstCall.args).to.deep.equal(["next-piece", handler]);
    expect(socket.off.secondCall.args).to.deep.equal(["rooms"]);
  });

  it("passes other actions to the next middleware", () => {
    dispatch(ping());
    expect(next.calledOnceWith(ping())).to.be.true;
    expect(socket.emit.called).to.be.false;
  });
});
