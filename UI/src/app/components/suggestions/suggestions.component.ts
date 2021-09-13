import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { UserService } from '../../services/user.service';
import { TYPE } from '../../constants/user.constant';
import { UserModel } from '../../models/user.model';

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss'],
})
export class SuggestionsComponent implements OnInit, OnDestroy {
  @Input() data: string;
  @Input() isError: boolean;
  @Input() errorMessage: string;
  @Input() userData: UserModel;
  @Input() type: string;
  @Output() updateUserData: EventEmitter<UserModel> =
    new EventEmitter<UserModel>();
  suggestions: string[] = [];
  citiesData: Array<{ name: string; lat: string; lng: string }> = [];
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {}

  onMenuOpen(): void {
    const {
      location: { countryCode, updatedTimezone },
    } = this.userData;
    if (this.type === TYPE.timezone) {
      this.suggestions = updatedTimezone ? [updatedTimezone] : [];
    } else {
      this.userService
        .getStatesAndCitiesBasedOnCountry(this.type, countryCode)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((data: any) => {
          const filteredData = [...new Set([...data.geonames])];
          this.suggestions = [...filteredData].map(({ name }) => name);
          this.citiesData = this.type === TYPE.city ? [...filteredData] : [];
        });
    }
  }

  onMenuSelect(selectedData: string): void {
    if (this.type === TYPE.city) {
      const {
        location: { timezone },
      } = this.userData;
      const { lat = '', lng = '' } = {
        ...this.citiesData.find(({ name }) => name === selectedData),
      };
      this.userService
        .getTimezoneDataBasedOnCoordinates(lat, lng)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: any) => {
          const { timezoneId } = res;
          const updatedTimezone = this.userService.getFormattedTimezone(timezoneId);
          this.updateUserData.emit({
            ...this.userData,
            location: {
              ...this.userData.location,
              [this.type]: selectedData,
              lat,
              lng,
              updatedTimezone,
            },
            errors: {
              ...this.userData.errors,
              [this.type]: false,
              timezone: updatedTimezone !== timezone,
            },
          });
        });
    } else {
      this.updateUserData.emit({
        ...this.userData,
        location: {
          ...this.userData.location,
          [this.type]: selectedData,
        },
        errors: {
          ...this.userData.errors,
          [this.type]: false,
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
