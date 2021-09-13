import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as moment from 'moment-timezone';

import { TYPE } from '../constants/user.constant';
import { CountryModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  GEONAMES_BASE_URL = 'http://api.geonames.org';
  API_URL = 'https://dummyapi.io';
  APP_ID = '613c5df95aad423c8c8b2997';
  USERNAME = 'kaushalparik27';

  constructor(private httpClient: HttpClient) {}

  getUsersList() {
    const params = new HttpParams().set('limit', '50');
    return this.httpClient.get(`${this.API_URL}/data/v1/user`, {
      headers: {
        'app-id': this.APP_ID,
      },
      params,
    });
  }

  getUserDataBasedOnId(userId: string) {
    return this.httpClient.get(`${this.API_URL}/data/v1/user/${userId}`, {
      headers: {
        'app-id': this.APP_ID,
      },
    });
  }

  getCountriesList() {
    const params = new HttpParams().set('username', this.USERNAME);
    return this.httpClient.get(`${this.GEONAMES_BASE_URL}/countryInfoJSON`, {
      params,
    });
  }

  searchStatesAndCitiesBasedOnCountry(
    type: string,
    countryCode: string,
    value: string
  ) {
    const params = this.getRequestParametersForStatesAndCities(
      type,
      countryCode
    )
      .append('q', value)
      .append('name_equals', value);
    return this.httpClient.get(`${this.GEONAMES_BASE_URL}/searchJSON`, {
      params,
    });
  }

  getRequestParametersForStatesAndCities(type: string, countryCode: string) {
    let params = new HttpParams()
      .set('username', 'ksuhiyp')
      .set('country', countryCode)
      .set('style', 'SHORT');

    if (type === TYPE.state) {
      params = params
        .append('featureCode', 'ADM1')
        .append('featureCode', 'PCLF')
        .append('featureClass', 'A');
    } else if (type === TYPE.city) {
      params = params
        .append('featureCode', 'PPL')
        .append('featureCode', 'PPLW')
        .append('featureClass', 'P');
    }
    return params;
  }

  getRequestParametersForTimezone(latitude: string, longitude: string) {
    return new HttpParams()
      .set('username', 'ksuhiyp')
      .set('lat', latitude)
      .set('lng', longitude);
  }

  getTimezoneDataBasedOnCoordinates(latitude: string, longitude: string) {
    return this.httpClient.get(`${this.GEONAMES_BASE_URL}/timezoneJSON`, {
      params: this.getRequestParametersForTimezone(latitude, longitude),
    });
  }

  getFormattedTimezone(timezoneId): string {
    return moment().tz(timezoneId).format('Z').toString().replace(/0+/, '');
  }

  validateUserData(userId: string, countriesList: CountryModel[]) {
    return this.getUserDataBasedOnId(userId).pipe(
      switchMap((userData: any) => {
        const {
          location: { country, state, city },
        } = userData;
        const { countryCode = '' } = {
          ...countriesList.find(({ countryName }) => countryName === country),
        };
        const updatedUserData = {
          ...userData,
          location: {
            ...userData.location,
            countryCode,
          },
        };
        return countryCode
          ? forkJoin([
              this.searchStatesAndCitiesBasedOnCountry(
                TYPE.state,
                countryCode,
                state
              ),
              this.searchStatesAndCitiesBasedOnCountry(
                TYPE.city,
                countryCode,
                city
              ),
            ]).pipe(
              map((data: any) => {
                const [statesData, citiesData] = data;
                const { geonames: statesGeonames = [] } = { ...statesData };
                const { geonames: citiesGeonames = [] } = { ...citiesData };
                return {
                  userData: updatedUserData,
                  stateError: statesGeonames.length === 0,
                  cityError: citiesGeonames.length === 0,
                  citiesData: [...citiesGeonames],
                };
              })
            )
          : of({
              userData: updatedUserData,
              stateError: false,
              cityError: false,
              citiesData: [],
            });
      }),
      switchMap((data: any) => {
        const { userData, cityError, citiesData } = data;
        const {
          location: { city, timezone },
        } = userData;
        const { lat = 0, lng = 0 } = {
          ...citiesData.find(({ name }) => name === city),
        };
        const [timezoneData] = timezone.split(':');
        const updatedUserData = {
          ...userData,
          location: {
            ...userData.location,
            lat,
            lng,
          },
        };
        return cityError
          ? of({ ...data, userData: updatedUserData, timezoneError: false })
          : this.getTimezoneDataBasedOnCoordinates(lat, lng).pipe(
              map((res: any) => {
                const { timezoneId } = res;
                const updatedTimezone = this.getFormattedTimezone(timezoneId);
                return {
                  ...data,
                  userData: {
                    ...updatedUserData,
                    location: {
                      ...updatedUserData.location,
                      updatedTimezone,
                    },
                  },
                  timezoneError: updatedTimezone !== timezoneData,
                };
              })
            );
      })
    );
  }

  getStatesAndCitiesBasedOnCountry(type: string, countryCode: string) {
    return this.httpClient.get(`${this.GEONAMES_BASE_URL}/searchJSON`, {
      params: this.getRequestParametersForStatesAndCities(type, countryCode),
    });
  }
}
