import { ValidationError, validate } from "class-validator";

export interface FieldError {
  name: string;
  value?: unknown;
  errors: string[];
}

type GetFieldErrorsFunc = (errors: ValidationError[]) => FieldError[];
type GetValidationErrors = (object: object) => Promise<FieldError[] | null>;

const getFieldErrors: GetFieldErrorsFunc = (errors: ValidationError[]): FieldError[] =>
  errors.map<FieldError>((error: ValidationError): FieldError => {
    let errors: string[] = [];

    if (error.constraints) {
      // @ts-expect-error error.constraints has already been checked for above, but it still complains about it possibly being undefined inside the map function
      errors = Object.keys(error.constraints).map<string>((key: string): string => error.constraints[key]);
    }

    return {
      name: error.property,
      value: error.value,
      errors,
    };
  });

export const getValidationErrors: GetValidationErrors = async (object: object): Promise<FieldError[] | null> => {
  const errors: ValidationError[] = await validate(object);
  if (errors.length > 0) {
    return getFieldErrors(errors);
  }

  return null;
};
