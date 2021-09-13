export const HEADER_LIST = [
  {
    header: 'First Name',
    key: 'firstName',
  },
  {
    header: 'Last Name',
    key: 'lastName',
  },
  {
    header: 'Gender',
    key: 'gender',
  },
  {
    header: 'Date Of Birth',
    key: 'dateOfBirth',
  },
  {
    header: 'Email',
    key: 'email',
  },
  {
    header: 'Phone',
    key: 'phone',
  },
  {
    header: 'Register Date',
    key: 'registerDate',
  },
  {
    header: 'Street',
    parentKey: 'location',
    key: 'street',
  },
  {
    header: 'City',
    parentKey: 'location',
    key: 'city',
  },
  {
    header: 'State',
    parentKey: 'location',
    key: 'state',
  },
  {
    header: 'Country',
    parentKey: 'location',
    key: 'country',
  },
  {
    header: 'Timezone',
    parentKey: 'location',
    key: 'timezone',
  },
];

export const FILE_NAME = 'User_Data';
export const FILE_EXTENSION = 'csv';

export const ERROR_MESSAGES = {
  city: "City doesn't match. Please select different city.",
  state: "State doesn't match. Please select different state.",
  timezone: "Timezone doesn't match. Please select different timezone.",
};

export const TYPE = {
  city: 'city',
  state: 'state',
  timezone: 'timezone',
};
