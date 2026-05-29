import createWebhookRunner from "../webhook-runner";

const makeEventHub = () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  once: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  removeAllSubscribers: jest.fn(),
  destroy: jest.fn(),
});

const makeWebhook = () => ({
  id: "test",
  name: "test",
  url: "http://example.com/hook",
  headers: {},
  events: ["entry.create"],
  isEnabled: true,
});

describe("WebhookRunner", () => {
  describe("run()", () => {
    it("adds X-Webhook-Signature header when signatureGenerator is configured", async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
      const signatureGenerator = jest.fn().mockReturnValue("abc123");

      const runner = createWebhookRunner({
        eventHub: makeEventHub() as any,
        logger: { error: jest.fn() } as any,
        fetch: mockFetch,
        configuration: { signatureGenerator },
      });

      const webhook = makeWebhook();
      await runner.run(webhook, "entry.create");

      const [, fetchOptions] = mockFetch.mock.calls[0];
      expect(fetchOptions.headers["X-Webhook-Signature"]).toBe("abc123");
    });

    it("omits X-Webhook-Signature header when signatureGenerator is not configured", async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });

      const runner = createWebhookRunner({
        eventHub: makeEventHub() as any,
        logger: { error: jest.fn() } as any,
        fetch: mockFetch,
      });

      const webhook = makeWebhook();
      await runner.run(webhook, "entry.create");

      const [, fetchOptions] = mockFetch.mock.calls[0];
      expect(fetchOptions.headers).not.toHaveProperty("X-Webhook-Signature");
    });
  });
});
