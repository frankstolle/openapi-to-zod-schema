/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { OpenAPISpec, convertOpenAPISpecToZodSchemas } from "./converter";

describe("OpenAPI to Zod Converter", () => {
  it("converts basic types correctly", () => {
    const spec: OpenAPISpec = {
      components: {
        schemas: {
          BasicTypes: {
            type: "object",
            properties: {
              stringProp: { type: "string" },
              numberProp: { type: "number" },
              integerProp: { type: "integer" },
              booleanProp: { type: "boolean" },
              arrayProp: { type: "array", items: { type: "string" } },
            },
            required: ["stringProp", "numberProp", "booleanProp", "arrayProp", "integerProp"],
          },
        },
      },
    };

    const zodSchemas = convertOpenAPISpecToZodSchemas(spec);
    const BasicTypesSchema = zodSchemas.map.BasicTypes as z.ZodObject<any>;

    expect(BasicTypesSchema.shape.stringProp).toBeInstanceOf(z.ZodString);
    expect(BasicTypesSchema.shape.numberProp).toBeInstanceOf(z.ZodNumber);
    expect(BasicTypesSchema.shape.integerProp).toBeInstanceOf(z.ZodNumber);
    expect(BasicTypesSchema.shape.booleanProp).toBeInstanceOf(z.ZodBoolean);
    expect(BasicTypesSchema.shape.arrayProp).toBeInstanceOf(z.ZodArray);

    const parsed = BasicTypesSchema.safeParse({
      stringProp: "test",
      numberProp: 123,
      integerProp: 456,
      booleanProp: true,
      arrayProp: ["a", "b", "c"],
    });

    expect(parsed.success).toBe(true);
  });

  it("handles $ref correctly", () => {
    const spec = {
      components: {
        schemas: {
          ReferencedType: {
            type: "object",
            properties: {
              prop: { type: "string" },
            },
            required: ["prop"],
          },
          MainType: {
            type: "object",
            properties: {
              refProp: { $ref: "#/components/schemas/ReferencedType" },
            },
            required: ["refProp"],
          },
        },
      },
    };

    const zodSchemas = convertOpenAPISpecToZodSchemas(spec);
    const MainTypeSchema = zodSchemas.map.MainType as z.ZodObject<any>;

    expect(MainTypeSchema.shape.refProp).toBeInstanceOf(z.ZodObject);

    const parsed = MainTypeSchema.safeParse({
      refProp: { prop: "test" },
    });

    expect(parsed.success).toBe(true);
  });

  it("handles allOf correctly", () => {
    const spec: OpenAPISpec = {
      components: {
        schemas: {
          AllOfType: {
            allOf: [
              { type: "object", properties: { prop1: { type: "string" } }, required: ["prop1"] },
              { type: "object", properties: { prop2: { type: "number" } }, required: ["prop2"] },
            ],
          },
        },
      },
    };

    const zodSchemas = convertOpenAPISpecToZodSchemas(spec);
    const AllOfTypeSchema = zodSchemas.map.AllOfType as z.ZodObject<any>;

    expect(AllOfTypeSchema.shape.prop1).toBeInstanceOf(z.ZodString);
    expect(AllOfTypeSchema.shape.prop2).toBeInstanceOf(z.ZodNumber);

    const parsed = AllOfTypeSchema.safeParse({
      prop1: "test",
      prop2: 123,
    });

    expect(parsed.success).toBe(true);

    const invalidParsed = AllOfTypeSchema.safeParse({
      prop2: 123,
    });

    expect(invalidParsed.success).toBe(false);
  });

  it("handles oneOf correctly", () => {
    const spec = {
      components: {
        schemas: {
          OneOfType: {
            oneOf: [
              { type: "object", properties: { prop: { type: "string" } } },
              { type: "object", properties: { prop: { type: "number" } } },
            ],
          },
        },
      },
    };

    const zodSchemas = convertOpenAPISpecToZodSchemas(spec);
    const OneOfTypeSchema = zodSchemas.map.OneOfType as z.ZodUnion<any>;

    const parsedString = OneOfTypeSchema.safeParse({ prop: "test" });
    const parsedNumber = OneOfTypeSchema.safeParse({ prop: 123 });

    expect(parsedString.success).toBe(true);
    expect(parsedNumber.success).toBe(true);
  });

  it("handles anyOf correctly", () => {
    const spec = {
      components: {
        schemas: {
          AnyOfType: {
            anyOf: [
              { type: "object", properties: { prop1: { type: "string" } } },
              { type: "object", properties: { prop2: { type: "number" } } },
            ],
          },
        },
      },
    };

    const zodSchemas = convertOpenAPISpecToZodSchemas(spec);
    const AnyOfTypeSchema = zodSchemas.map.AnyOfType as z.ZodUnion<any>;

    const parsed1 = AnyOfTypeSchema.safeParse({ prop1: "test" });
    const parsed2 = AnyOfTypeSchema.safeParse({ prop2: 123 });
    const parsedBoth = AnyOfTypeSchema.safeParse({ prop1: "test", prop2: 123 });

    expect(parsed1.success).toBe(true);
    expect(parsed2.success).toBe(true);
    expect(parsedBoth.success).toBe(true);
  });

  it("handles nested schemas correctly", () => {
    const spec = {
      components: {
        schemas: {
          NestedType: {
            type: "object",
            properties: {
              nested: {
                type: "object",
                properties: {
                  deepProp: { type: "string" },
                },
                required: ["deepProp"],
              },
            },
            required: ["nested"],
          },
        },
      },
    };

    const zodSchemas = convertOpenAPISpecToZodSchemas(spec);
    const NestedTypeSchema = zodSchemas.map.NestedType as z.ZodObject<any>;

    expect(NestedTypeSchema.shape.nested).toBeInstanceOf(z.ZodObject);
    expect((NestedTypeSchema.shape.nested as z.ZodObject<any>).shape.deepProp).toBeInstanceOf(z.ZodString);

    const parsed = NestedTypeSchema.safeParse({
      nested: { deepProp: "test" },
    });

    expect(parsed.success).toBe(true);
  });

  it("handles array items correctly", () => {
    const spec = {
      components: {
        schemas: {
          ArrayType: {
            type: "object",
            properties: {
              arrayProp: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itemProp: { type: "string" },
                  },
                },
              },
            },
            required: ["arrayProp"],
          },
        },
      },
    };

    const zodSchemas = convertOpenAPISpecToZodSchemas(spec);
    const ArrayTypeSchema = zodSchemas.map.ArrayType as z.ZodObject<any>;

    expect(ArrayTypeSchema.shape.arrayProp).toBeInstanceOf(z.ZodArray);

    const parsed = ArrayTypeSchema.safeParse({
      arrayProp: [{ itemProp: "test1" }, { itemProp: "test2" }],
    });

    expect(parsed.success).toBe(true);
  });
});
