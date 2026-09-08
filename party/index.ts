import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

export default class YjsServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection) {
    // Tự động đồng bộ Yjs state và con trỏ giữa các client
    return onConnect(conn, this.room, {
      persist: true, // Lưu tạm state trong bộ nhớ Durable Objects của phòng
    });
  }
}
