jsplate pre-processes javascript in Markdown files. It interprets code in js code blocks and inline variables and renders directly into md. Such as this:

~~~

This is a Markdown file

```js
  x = "This used to be a js code block";
  y = "nice";
  name = process.argv[2];

  return x
```

Have a ${y} day ${name}!

~~~

Ran using `jsplate template.md "Madam"`, will render:

```

This is a Markdown file

This used to be a js code block

Have a nice day Madam!

```

Additional details:
- If you want to re-use variables between code blocks, be sure to declare them as global (not using `const`).
- If you are allergic to global variables jsplate is also declaring a `global` object that you can enrich, for example using `global.x = "some value"`
- Blocks are evaluated in an async context, you can use `await`!