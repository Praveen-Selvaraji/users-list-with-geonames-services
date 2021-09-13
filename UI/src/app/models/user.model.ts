export interface UserModel {
  dateOfBirth: string;
  email: string;
  firstName: string;
  gender: string;
  id: string;
  lastName: string;
  location: LocationModel;
  phone: string;
  picture: string;
  registerDate: string;
  title: string;
  isLoading?: boolean;
  isExpanded?: boolean;
  errors?: ErrorModel;
}

export interface LocationModel {
  street: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  countryCode?: string;
  updatedTimezone?: string;
  lat?: string;
  lng?: string;
}

interface ErrorModel {
  state: boolean;
  city: boolean;
  timezone: boolean;
}

export interface CountryModel {
  countryName: string;
  countryCode: string;
}
