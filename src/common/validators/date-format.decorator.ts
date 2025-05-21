import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsDateFormatConstraint implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    return /^\d{2}-\d{2}-\d{4}$/.test(date); // Check if the date matches the DD-MM-YYYY format
  }

  defaultMessage(args: ValidationArguments) {
    return 'Date ($value) must be in the format DD-MM-YYYY';
  }
}

export function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateFormatConstraint,
    });
  };
}
