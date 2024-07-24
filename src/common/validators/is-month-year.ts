// src/common/validators/is-month-year.ts
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMonthYearConstraint implements ValidatorConstraintInterface {
  validate(monthYear: any, args: ValidationArguments) {
    const regex = /^(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    return typeof monthYear === 'string' && regex.test(monthYear);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Month must be in the format MM-YYYY';
  }
}

export function IsMonthYear(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMonthYearConstraint,
    });
  };
}
