# Toolbox

A collection of essential developer tools - simple, fast, and completely client-side.

🔗 [tools.vlcdn.dev](https://tools.vlcdn.dev)

## Setup

This project uses Deno and Rsbuild. Install dependencies:

```bash
deno install
```

Install pre-commit hooks with [prek](https://github.com/j178/prek):

```bash
prek install
```

## Development

Start the dev server (opens automatically at [http://localhost:3000](http://localhost:3000)):

```bash
deno task dev
```

Format code:

```bash
deno task format
```

Lint code:

```bash
deno task check
```

## Build

Build the app for production:

```bash
deno task build
```

Preview the production build locally:

```bash
deno task preview
```

## Deploy

Deploy to production:

```bash
deno deploy --prod
```
