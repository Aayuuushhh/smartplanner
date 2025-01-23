import { atom } from 'recoil';
import { Event , PublicCalendar , Alert} from '../types/types';

export const eventsState = atom<Event[]>({
  key: 'eventsState',
  default: [],
});

export const calendarsState = atom<PublicCalendar[]>({
  key : 'calendarsState',
  default : [],
}) ; 

export const eventsFetchedState = atom<boolean>({
  key : 'eventsFetchedState',
  default : false,
});

export const themeState = atom({
  key: 'themeState',
  default: 'light', 
  effects: [
    ({ onSet }) => {
      onSet(newValue => {
        localStorage.setItem('theme', newValue);
      });
    },
  ]
});

export const alertsState = atom<Alert[]>({
  key: 'alertsState',
  default : []
})

export const loadingState = atom<boolean>({
  key : 'loadingState', 
  default : false 
})

export const isSchoolAdminState = atom({
  key: 'isSchoolAdminState', 
  default: false, 
});

export const isAdminState = atom<boolean>({
  key: 'isAdminState', 
  default: false,
}) ; 

export const notificationsState = atom({
  key: 'notificationsState',
  default : 'none' ,
}) ;

export const autoLoginRetriesState = atom({
  key : 'autoLoginRetriesState',
  default : 0,
})