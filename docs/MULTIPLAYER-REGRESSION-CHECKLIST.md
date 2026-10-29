# Multiplayer regression checklist

These are required acceptance tests for the Cloudflare room Worker and browser client.

1. With one connected player, a forged start request must be rejected.
2. With exactly two players and identical build + roster hashes, start must succeed.
3. With two players but differing modern pack hashes, the lobby must disable Start and the Worker must reject forged start.
4. With Original on one peer and Modern on the other, the room must not start.
5. With three or more players, a forged start request must be rejected.
6. After disconnecting mid-match, reconnect using the same slot and exact version must succeed during the grace window.
7. Reconnect using the same slot but a changed roster version must fail.
8. A corrupt modern pack must fail verification before any patched archive pointers are published.
9. Both players must select IPL sides and finish a full match without netplay state-hash divergence.
10. Repeat after page reload and on separate networks.

Status: source-level protections exist for scenarios 1, 3, 4, 5 and 7; automated and live integration tests have **not** been run.
