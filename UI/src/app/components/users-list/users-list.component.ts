import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { UserService } from '../../services/user.service';
import {
  HEADER_LIST,
  FILE_NAME,
  FILE_EXTENSION,
  ERROR_MESSAGES,
  TYPE,
} from '../../constants/user.constant';
import { UserModel, CountryModel } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit, OnDestroy {
  usersList: UserModel[] = [];
  countries: CountryModel[] = [];
  errorMessages = ERROR_MESSAGES;
  type = TYPE;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getCountriesList();

    this.userService
      .getUsersList()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: any) => {
        const { data = [] } = { ...response };
        this.usersList = [...data];
      });
  }

  toggleContentView(userId: string): void {
    this.usersList = [...this.usersList].map((user) => {
      let updatedUser = { ...user };
      const { id, email, isLoading, isExpanded } = user;
      if (id === userId) {
        updatedUser = {
          ...user,
          isLoading: email ? isLoading : true,
          isExpanded: email ? !isExpanded : false,
        };

        if (!email) {
          this.getUserDataBasedOnId(userId);
        }
      }

      return updatedUser;
    });
  }

  getCountriesList(): void {
    this.userService
      .getCountriesList()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any) => {
        this.countries = [...data.geonames].map((d) => {
          const { countryName, countryCode } = d;
          return {
            countryName,
            countryCode,
          };
        });
      });
  }

  findIndexAndUpdateData(data: UserModel): void {
    const { id: idToUpdate } = data;
    const index = this.usersList.findIndex(({ id }) => id === idToUpdate);
    if (index > -1) {
      this.usersList.splice(index, 1, { ...data });
    }
  }

  getUserDataBasedOnId(userId: string): void {
    this.userService
      .validateUserData(userId, this.countries)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        const { userData, stateError, cityError, timezoneError } = data;
        this.findIndexAndUpdateData({
          ...userData,
          isLoading: false,
          isExpanded: true,
          errors: {
            state: stateError,
            city: cityError,
            timezone: timezoneError,
          },
        });
      });
  }

  exportToCsv(): void {
    const blob = new Blob([this.ConvertToCSV()], {
      type: 'text/csv;charset=utf-8;',
    });
    const element = document.createElement('a');
    element.setAttribute('href', URL.createObjectURL(blob));
    element.setAttribute('download', `${FILE_NAME}.${FILE_EXTENSION}`);
    element.style.visibility = 'hidden';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  ConvertToCSV(): string {
    return [
      [...HEADER_LIST].map(({ header }) => header).join(','),
      ...this.usersList.map((rowData) =>
        [...HEADER_LIST]
          .map(({ key, parentKey }) =>
            JSON.stringify(
              parentKey && rowData[parentKey]
                ? rowData[parentKey][key]
                : rowData[key],
              (key, value) => value || ''
            )
          )
          .join(',')
      ),
    ].join('\r\n');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
