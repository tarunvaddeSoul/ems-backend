import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          // DD-MM-YYYY format check using regex
          const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
          if (!dateRegex.test(value)) {
            return false;
          }

          // Additional validation to ensure it's a valid date
          const [day, month, year] = value.split('-').map(Number);
          const date = new Date(year, month - 1, day);

          return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date in DD-MM-YYYY format`;
        },
      },
    });
  };
}
