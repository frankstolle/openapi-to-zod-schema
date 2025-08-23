# OpenAPI to Zod Schema

This package provides a CLI and library to convert OpenAPI schemas to Zod schemas and generate schema code.

## Features

- Convert OpenAPI schemas (YAML or JSON) to Zod schemas
- Support for complex schema structures including `allOf`, `oneOf`, and `anyOf`
- Handle references (`$ref`) in OpenAPI schemas
- CLI tool for easy conversion from the command line
- Support for both local files and remote URLs as input

## Installation

You can install the package from [NPM](https://www.npmjs.com/openapi-to-zod-schema):

```bash
# install
npm i -D openapi-to-zod-schema

# or run it directly
npx openapi-to-zod-schema https://raw.githubusercontent.com/openai/openai-openapi/refs/heads/manual_spec/openapi.yaml
npx openapi-to-zod-schema .openapi.yaml -o openai-schemas.ts
```

## Usage

### As a Library

You can use the library in your project like this:

```typescript
import { convertOpenAPISpecToZodSchemas, codegen } from "openapi-to-zod-schema";

const openAPISpec = {
  components: {
    // Your OpenAPI spec's components here
  },
};

const zodSchemas = convertOpenAPISpecToZodSchemas(openAPISpec);
console.log(zodSchemas); // { items: [], map: Record<name, {}> }

// Generate TypeScript code
const code = codegen(openAPISpec);
console.log(code);
```

### As a CLI Tool

You can use the CLI wrapper to convert OpenAPI schemas to Zod schemas like this:

```bash
npx openapi-to-zod-schema ./path/to/your/openapi-spec.yaml
```

Or for remote files:

```bash
npx openapi-to-zod-schema https://example.com/path/to/openapi-spec.yaml
```

By default, the CLI tool will output the generated Zod schema to the console. If you want to save it to a file, you can use the `-o` option:

```bash
npx openapi-to-zod-schema ./path/to/your/openapi-spec.yaml -o ./output-schema.ts
```

## API Reference

### `convertOpenAPISpecToZodSchemas(spec: OpenAPISpec): { map: Record<string, z.ZodTypeAny>, items: Array<{ name: string, schema: z.ZodTypeAny }> }`

Converts an OpenAPI specification to Zod schemas.

- `spec`: The OpenAPI specification object.
- Returns: An object containing:
  - `map`: A record of schema names to their corresponding Zod schemas.
  - `items`: An array of objects, each containing the schema name and the Zod schema.

Example:

```typescript
const { map, items } = convertOpenAPISpecToZodSchemas(openAPISpec);

console.log(map.UserSchema); // Zod schema for User
console.log(items[0]); // { name: 'User', schema: ZodSchema }
```

### `codegen(spec: OpenAPISpec): string`

Generates TypeScript code for the Zod schemas based on the OpenAPI specification.

- `spec`: The OpenAPI specification object.
- Returns: A string containing the generated TypeScript code.

Example:

```typescript
const code = codegen(openAPISpec);
console.log(code);
// Output: TypeScript code defining Zod schemas
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
