"use client";
import { getCalendars, subCalendar } from '@/utils/api';
import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, List, ListItem, ListItemText, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { calendarsState, themeState } from "../recoil/atom";

const Home = () => {
  const [calendars, setCalendars] = useRecoilState(calendarsState);
  const [loading, setLoading] = useState(true);
  const themes = useRecoilValue(themeState);

  const theme = createTheme({
    palette: {
      mode: themes as PaletteMode,
      background: {
        default: themes === 'dark' ? '#121212' : '#fff',
        paper: themes === 'dark' ? '#1e1e1e' : '#fff',
      },
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      success: {
        main: '#4caf50',
      },
      warning: {
        main: '#ff9800',
      },
    },
    typography: {
      fontFamily: 'Rubik, sans-serif',
      h1: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const getData = async () => {
      try {
        const data = await getCalendars(token as string);
        const newCalendars = data.map((element: any) => ({
          id: element.id,
          calendarName: element.calendarName,
          sharedBy: element.sharedBy,
          calendarDescription: element.calendarDescription,
          approvalrequired: element.approvalrequired === 1,
          isRequested: element.isrequested === 1,
          isSubscribed: element.isSubscribed === 1,
        }));
        setCalendars(newCalendars);
      } catch (error) {
        console.error('Failed to fetch calendars:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [setCalendars]);

  const handleSubscribe = async (calendarId: number, status: string) => {
    const token = localStorage.getItem('token');
    try {
      await subCalendar(calendarId, status, token as string);
      setCalendars((prevCalendars) =>
        prevCalendars.map((calendar) =>
          calendar.id === calendarId
            ? {
                ...calendar,
                isSubscribed: status === 'Subscribe',
                isRequested: status === 'Request',
              }
            : calendar
        )
      );
    } catch (error) {
      console.error(`Failed to ${status} calendar with ID: ${calendarId}`, error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" height="100vh">
        <Box flexGrow={1} p={3} overflow="auto">
          <Typography variant="h1" gutterBottom>
            Public Calendars
          </Typography>
          {calendars.length === 0 ? (
            <Typography variant="body1">No calendars available.</Typography>
          ) : (
            <List>
              {calendars.map((calendar) => (
                <ListItem key={calendar.id} divider>
                  <ListItemText
                    primary={
                      <>
                        <Typography variant="h6">{calendar.calendarName}</Typography>
                        <Typography variant="body2">by {calendar.sharedBy}</Typography>
                      </>
                    }
                    secondary={
                      <Typography variant="body2">Description: {calendar.calendarDescription}</Typography>
                    }
                  />
                  {calendar.isSubscribed ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleSubscribe(calendar.id, 'UnSubscribe')}
                    >
                      Unsubscribe
                    </Button>
                  ) : calendar.approvalrequired && calendar.isRequested ? (
                    <Typography variant="body2" color="textSecondary">
                      Waiting for approval
                    </Typography>
                  ) : calendar.approvalrequired && !calendar.isRequested ? (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleSubscribe(calendar.id, 'Request')}
                    >
                      Request Approval
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSubscribe(calendar.id, 'Subscribe')}
                    >
                      Subscribe
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Home;
