import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMonthYearConstraint implements ValidatorConstraintInterface {
  validate(monthYear: string): boolean {
    const regex = /^(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    return typeof monthYear === 'string' && regex.test(monthYear);
  }

  defaultMessage(): string {
    return 'Month must be in the format MM-YYYY';
  }
}

export function IsMonthYear(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMonthYearConstraint,
    });
  };
}
