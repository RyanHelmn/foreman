---
id: nest-gateway-handshake-auth
title: Authenticate WebSocket clients in handleConnection and disconnect on failure
impact: CRITICAL
impactDescription: "an anonymous socket stays connected, joins rooms and receives every broadcast"
roles: [implementer, reviewer, security]
tags: auth, websockets, nestjs
---
Source: the socket handshake. Sink: room joins and `server.to(room).emit`. Guards on a gateway run per `@SubscribeMessage` message, never on connect, so an unauthenticated client still receives everything the server pushes. In `handleConnection` (or a `server.use` middleware in `afterInit`), verify the token from `client.handshake.auth` or the session cookie in `client.handshake.headers.cookie`, store the user on `client.data`, and `client.disconnect(true)` on failure. Join rooms only for resources that user may read; never from a room name the client sent.

**Incorrect:**

```ts
@WebSocketGateway()
export class EventsGateway {
  handleConnection(client: Socket) {
    client.join(`org-${client.handshake.query.orgId}`)
  }
}
```

**Correct:**

```ts
@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection {
  constructor(private auth: AuthService) {}

  async handleConnection(client: Socket) {
    const user = await this.auth.verify(client.handshake.auth?.token).catch(() => null)
    if (!user) return client.disconnect(true)
    client.data.user = user
    client.join(`org-${user.orgId}`)
  }
}
```

Reference: https://docs.nestjs.com/websockets/guards
