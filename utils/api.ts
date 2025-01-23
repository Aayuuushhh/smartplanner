"use client";

import axios from "axios";
import { encryptObject } from "./encrypt";
import generateFingerprint from "./deviceId";
import { AutoLoginResponse, BackendEvent, Event } from "../app/types/types";
import { calendar } from "googleapis/build/src/apis/calendar";

interface LoginDetail {
    username: string;
    DeviceId?: string;
    isTrusted?: null;
}

export interface otpVerification {
    isVerified: boolean;
    isNewUser: boolean;
    failed: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_SERVICE_APP_URL;

export const validateUser = async (signInDetail: LoginDetail) => {
    const payload = {
        Username: signInDetail.username,
        DeviceId: signInDetail.DeviceId, //
        isTrusted: signInDetail.isTrusted,
        url: `${API_URL}${process.env.NEXT_PUBLIC_VALIDATE_USER}`
    };
    console.log(payload); 
    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post("/api/posthandler", { data: encryptedPayload });
        return response.data === "Code Sent";
    } catch (error) {
        console.error("Error during OTP validation:", error);
        throw error;
    }
};

export const verifyOTP = async (signInDetail: LoginDetail, otp: string): Promise<otpVerification> => {
    const payload = {
        Username: signInDetail.username,
        DeviceId: signInDetail.DeviceId,
        Code: Number(otp),
        url: `${API_URL}${process.env.NEXT_PUBLIC_VERIFY_USER}`
    };
    console.log(payload);   
    const encryptedPayload = encryptObject(payload);
    const returnable: otpVerification = {
        isVerified: false,
        isNewUser: false,
        failed: false
    };
    try {
        const response = await axios.post("/api/posthandler", { data: encryptedPayload });
        console.log(response.data) ;  
        if (response.data.action === "Verified") {
            returnable.isVerified = true;
            if (response.data.code === "New User") {
                returnable.isNewUser = true;
            } else {
                localStorage.setItem("token", "Bearer " + response.data.code);
            }
        } else if (response.data.action === "Failed") {
            returnable.failed = true;
        }
        return returnable;
    } catch (error) {
        throw error;
    }
};

export const submitUserDetails = async (userData: { firstName: string; lastName: string; displayName: string; phoneNumber: string }, signInDetail: LoginDetail) => {
    const payload = {
        DisplayName: userData.displayName,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        PhoneNumber: userData.phoneNumber,
        DeviceId: signInDetail.DeviceId,
        Email: signInDetail.username,
        url: `${API_URL}${process.env.NEXT_PUBLIC_SUBMIT_USER}`
    };
    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post("/api/posthandler", { data: encryptedPayload });
        console.log(response);
        return response.status === 200;
    } catch (error) {
        throw error;
    }
};


export const submitNextAuthUserDetails = async (userData: { firstName: any,  lastName: any ,displayName: any, guser : string , muser:  string ,  deviceId : string , email: any
}) => {
    const payload = {
        DisplayName: userData.displayName,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        PhoneNumber: null,
        DeviceId: userData.deviceId,
        Email: userData.email,
        guser : userData.guser,
        url: `${API_URL}${process.env.NEXT_PUBLIC_SUBMIT_USER}`
    };

    console.log(payload); 
    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post("/api/posthandler", { data: encryptedPayload });
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createEvent = async (event: BackendEvent, token: string) => {
    console.log(event.Description) ; 
    const payload = {
        StartDate: event.StartDate,
        EndDate: event.EndDate,
        Title: event.Title,
        Id: 0,
        Color: event.Color,
        calendartypeid : event.calendartypeid || ""  ,
        calendartype : event.calendartype || "" , 
        Recurrence: event.Recurrence,
        timezone: event.timezone,
        recurrencedata: event.recurrencedata,
        Location: event.Location,
        Description: event.Description,
        recenddate: event.recenddate,
        url: `${API_URL}${process.env.NEXT_PUBLIC_CREATE_EVENT}`
    };

    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        if(response.status === 200) {
            console.log("F yes");
        }
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

export const autoLogin = async (email :string ) => {
    const deviceId = localStorage.getItem("deviceId");
    const payload = {
        username: email,
        DeviceId: deviceId,
        url: `${API_URL}/calendar/api/user/v1/autologin`
    };
    console.log(payload) ; 
    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post("/api/posthandler", { data: encryptedPayload });
        if (response.data) {
            console.log(response.data);
            return response.data;
        }
        return response.data;
    } catch (error) {
        console.error("Error during auto login:", error);
        throw error;
    }
};

export const getAllEvents = async (token: string) => {
    const payload = {
        Month: 0,
        url: `${API_URL}${process.env.NEXT_PUBLIC_GET_EVENTS}`
    };
    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const handleDelete = async (id: number, token: string) => {
    const payload = {
        url: `${API_URL}${process.env.NEXT_PUBLIC_DELETE_EVENT}`.replace("ID", id.toString())
    };
    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};

export const getGoogleCalendarEvents = async (accessToken: string) => {
    try {
        const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log(response.data)
        return response.data.items;
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        return error;
    }
};

export const getCalendars = async (token: string) => {
    const payload = {
        url: `${API_URL}${process.env.NEXT_PUBLIC_GET_PUBLIC_CALENDARS}`
    };
    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching the calendars:', error);
        throw error;
    }
};

export const subCalendar = async (id: number, status: string, token: string) => {
    const payload = {
        calendarId: id,
        Status: status,
        url: `${API_URL}${process.env.NEXT_PUBLIC_SUBSCRIBE_CALENDAR}`
    };

    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error('Error occurred', error);
        throw error;
    }
};

export const getSubsCalendars = async (token: string) => {
    const payload = {
        url: `${API_URL}${process.env.NEXT_PUBLIC_GET_SUB_CALENDARS}`
    };

    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error occurred', error);
        throw error;
    }
};

export const getSubscribedCalendarEvent = async (id: number, token: string) => {
    const payload = {
        calendarid: id,
        month: 0,
        url: `${API_URL}${process.env.NEXT_PUBLIC_GET_SUB_EVENTS}`
    };

    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error occurred', error);
        throw error;
    }
};

export const getImage = async (startdate: string, token: string) => {
    const payload = {
        StartDate: startdate,
        url: `${API_URL}${process.env.NEXT_PUBLIC_GET_IMAGE}`
    };
    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
                headers: {
                    Authorization: `${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error occurred', error);
        throw error;
    }
};

export const getWord = async (today: string, token: string) => {
    const payload = {
        url: `${API_URL}${process.env.NEXT_PUBLIC_WORD_OF_THE_DAY}`.replace("DATE", today)
    };

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post("/api/posthandler", { data: encryptedPayload }, {
            headers: {
                Authorization: `${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error occurred', error);
        throw error;
    }
};

export const getAlerts = async (token: string) => {
    const payload = {
      url: `${API_URL}${process.env.NEXT_PUBLIC_GET_ALERTS}`
    };
    const encryptedPayload = encryptObject(payload);
    try {
      const response = await axios.post(
        '/api/posthandler',
        { data: encryptedPayload },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  };


  export const createOrUpdateAlert = async (alert: {
    id: number;
    name: string;
    description: string;
    type: string;
    start: string;
    end: string;
    action?: string;
  }, token: string) => {
    const payload = {
      id: alert.id,
      name: alert.name,
      description: alert.description,
      type: alert.type,
      start: alert.start,
      end: alert.end,
      action: alert.action,
      url: `${API_URL}${process.env.NEXT_PUBLIC_CREATE_UPDATE_ALERT}`
    };
    const encryptedPayload = encryptObject(payload);
    try {
      const response = await axios.post(
        "/api/posthandler",
        { data: encryptedPayload },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating or updating alert:", error);
      throw error;
    }
  };

export const shareCalendar = async ( token :string , name : string , desc : string , approvalRequired : Number , op : string ) => {
    const payload =  {
        Id: 0, 
        calendarName: name,
        calendarDescription: desc,
        approvalRequried: approvalRequired,
        operation: op,
        url: `${API_URL}${process.env.NEXT_PUBLIC_SHARE_CALENDAR}`
    } ; 
    const encryptedPayload = encryptObject(payload);
    try {
      const response = await axios.post(
        "/api/posthandler",
        { data: encryptedPayload },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating or updating alert:", error);
      throw error;
    }

}


export const checkDuplicates = async ( token : string , gtypeid : String[] ) =>{
    const payload = {
        gtypeid : gtypeid , 
        url: `${API_URL}${process.env.NEXT_PUBLIC_CHECK_DUPLICATE}`
    } ; 

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
          "/api/posthandler",
          { data: encryptedPayload },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error creating or updating alert:", error);
        throw error;
      }
  
  }


  export const getAccessToken = async (token : string) =>{
    const payload = {
      url: `${API_URL}${process.env.NEXT_PUBLIC_GET_ACCESS_TOKEN}`
    } ; 

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
          "/api/posthandler",
          { data: encryptedPayload },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error getting token", error);
        throw error;
      }
  }

export const setAccessToken = async (token : string , accessToken : string , email :string, name : string , refreshToken : string, scope :string , caltype :number  ) => {
    const payload = {
        userid: null,
        caltype: caltype,
        refreshToken: refreshToken,
        accessToken: accessToken,
        deviceCode: null,
        scope: scope,
        deviceId: null,
        email: email,
        name : name ,
        lastsync: new Date(),
        url : `${API_URL}${process.env.NEXT_PUBLIC_SET_ACCESS_TOKEN}`
    }
    console.log(payload)
    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
          "/api/posthandler",
          { data: encryptedPayload },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error Saving token   ", error);
        throw error;
      }
}


export const fetchUserInfo = async (accessToken:string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
  
      const data = await response.json();
      return {
        name: data.name,
        email: data.email,
        picture: data.picture, // optional: profile picture
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
};

export const getPendingRequests = async (token :string) => {
    const payload = {
        url : `${API_URL}${process.env.NEXT_PUBLIC_GET_PENDING_REQUESTS}`
    }

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
        return response.data;
      } catch (error) {
            console.error("Error Fetching the Pending Requests" , error); 
            return error ;  
    }
}

export const getApprovedRequest = async (token :string) =>{

    const payload = {
        url : `${API_URL}${process.env.NEXT_PUBLIC_GET_APPROVED_REQUESTS}` 
    }

    const encryptedPayload = encryptObject(payload);
    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
        return response.data;
      } catch (error) {
             console.error("Error Fetching the Approved Request" , error);  
        }
}

export const acceptRequest = async (id : Number , type : string , token : string) =>{
    const payload = {
        id : id , 
        operation : type , 
        url : `${API_URL}${process.env.NEXT_PUBLIC_ACCEPT_REQUEST}`
    } ; 

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          return response ; 
    }
    catch(error){
        console.error("Error Accepting request" , error);  
    }

}

export const updateNotificationSettings = async (token :string  , time :any ) =>{
    const payload = {
        action : "update", 
        data : JSON.stringify({
            onEvent : time > 0 ? true : false ,
            before30 : time == 30 ? true : false ,
            before60 : time == 60 ? true : false 
        }), 
        url : `${API_URL}${process.env.NEXT_PUBLIC_UPDATE_NOTIFICATION_SETTINGS}`
    } ; 

    console.log(payload)

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          return response ; 
    }
    catch(error){
        console.error("Error Updating notification settings" , error);  
    }
}

export const getNotificationSettings = async (token :string ) =>{
    const payload = {
        action : "get", 
        url : `${API_URL}${process.env.NEXT_PUBLIC_GET_NOTIFICATION_SETTINGS}`
    } ; 

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          return response ; 
    }
    catch(error){
        console.error("Error Getting notification settings" , error);  
    }
}

export const getDeletedEvents = async (token :string ,id : Number ) =>{
    const payload = {
        id : id,
        action : "get", 
        url : `${API_URL}${process.env.NEXT_PUBLIC_REMOVE_EVENTS}`
    }

    const encryptedPayload = encryptObject(payload); 

    try{
            const response = await axios.post(
                "/api/posthandler",
                { data: encryptedPayload },
                {
                  headers: {
                    Authorization: `${token}`,
                  },
                }
              );
            console.log(response.data) ; 
            return response.data ; 
        }
        catch(error){
            console.error("Error" , error);  
        }
}


export const setDeletedEvent = async (token : string , data: any) =>{
    const payload = {
        ...data , 
        action : "update", 
        url : `${API_URL}${process.env.NEXT_PUBLIC_REMOVE_EVENTS}`
    }
    const encryptedPayload = encryptObject(payload);

    try{ 
        const response = await axios.post(
            "/api/posthandler" , 
            {data : encryptedPayload} ,
            {
                headers : {
                    Authorization : `${token}` ,
                }, 
            }
        ) ;
        
        return response.data ; 
    }
    catch(error){
        console.error("Error" , error);  
    }
}

export const getSchoolAdmin = async (token : string) =>{
    const payload = {
        url : `${API_URL}${process.env.NEXT_PUBLIC_GET_SCHOOL_ADMIN}`
    }

    const encryptedPayload = encryptObject(payload);

    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          return response.data ;
    }
    catch(error){
        console.error("Error Fetching the School Admin" , error);  
    }
}

export const SchoolAdminFunction = async (token : string, email : string , method : string) =>{
    const payload = {
        email : email, 
        action : method, 
        url : `${API_URL}${process.env.NEXT_PUBLIC_SCHOOL_ADMIN}`
    }

    const encryptedPayload = encryptObject(payload) ; 

    try {
        const response = await axios.post(
            "/api/posthandler",
            { data: encryptedPayload },
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          return response.data ;
    }
    catch(error){
        console.error("Error Removing the School Admin" , error);  
    }
}

