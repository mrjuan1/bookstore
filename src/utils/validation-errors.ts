import { ValidationError, validate } from "class-validator";

export interface FieldError {
  name: string;
  value?: unknown;
  errors?: string[];
}

type GetFieldErrorsFunc = (errors: ValidationError[]) => FieldError[];
type GetValidationErrors = (object: object) => Promise<FieldError[] | null>;

const getFieldErrors: GetFieldErrorsFunc = (errors: ValidationError[]): FieldError[] =>
  errors.map<FieldError>(
    (error: ValidationError): FieldError => ({
      name: error.property,
      value: error.value,
      errors: Object.keys(error.constraints ?? {}).map<string>((key: string): string =>
        error.constraints ? error.constraints[key] : "",
      ),
    }),
  );

export const getValidationErrors: GetValidationErrors = async (object: object): Promise<FieldError[] | null> => {
  const errors: ValidationError[] = await validate(object);
  if (errors.length > 0) {
    return getFieldErrors(errors);
  }

  return null;
};
