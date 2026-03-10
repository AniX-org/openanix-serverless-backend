# Api-Proxy module

Proxies the requests to/from anixart api

- prefix: /api/

## Hooks

Hooks are a functions with a matcher that modify the API response

Type:

```ts
export type Hook = {
  priority: number;
  match: (url: URL, method: "GET" | "POST") => boolean;
  hook: (url: URL, data: any, method: "GET" | "POST") => Promise<any>;
};
```

To view how to write a hook, you can see the build-in hooks as a reference:

- [addUserRoles.ts](./hooks/addUserRoles.ts)
- [show3rdPartyReleaseRating.ts](./hooks/show3rdPartyReleaseRating.ts)

To enable the hook, you need to import it inside [enabledHooks.ts](./hooks/enabledHooks.ts), and add it to `enabledHooks` list inside
