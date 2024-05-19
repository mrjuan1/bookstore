import { FieldError, getValidationErrors } from "@utils/validation-errors";
import { IsNotEmpty } from "class-validator";

class TestClass {
  @IsNotEmpty({ message: "Test class value cannot be an empty string" })
  public readonly value!: string;

  constructor(value: string) {
    this.value = value;
  }
}

describe("Getting validation errors", () => {
  test("Get validation errors for a valid object", async () => {
    try {
      const testClass: TestClass = new TestClass("value");

      const result: FieldError[] | null = await getValidationErrors(testClass);
      expect(result).toBeNull();
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });

  test("Get validation errors for an invalid object", async () => {
    try {
      const testClass: TestClass = new TestClass("");

      const result: FieldError[] | null = await getValidationErrors(testClass);
      expect(result).toBeTruthy();
      expect(result).toHaveLength(1);

      const fieldError: FieldError | null = result ? result[0] : null;
      expect(fieldError).toBeTruthy();
      expect(fieldError?.errors).toHaveLength(1);

      const errorStr: string | null = fieldError ? fieldError.errors[0] : null;
      expect(errorStr).toBeTruthy();
      expect(errorStr).toStrictEqual<string>("Test class value cannot be an empty string");
    } catch (error: unknown) {
      expect(error).toBeFalsy();
    }
  });
});
