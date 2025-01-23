"use client"

import React, { useEffect, useState } from 'react';
import { TextField, Box, Typography, Button, Radio, RadioGroup, FormControl, FormLabel, FormGroup, FormControlLabel, CssBaseline, PaletteMode, Chip, Card, CardContent, CardActions, Grid, Container } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useRecoilState, useRecoilValue } from 'recoil';
import { notificationsState, themeState } from '@/app/recoil/atom';
import { shareCalendar, updateNotificationSettings } from '@/utils/api';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { FaGoogle, FaMicrosoft, FaSignOutAlt, FaSync, FaBell } from 'react-icons/fa';
import { useGoogleCalendarSync } from '../hooks/useGoogleCalendarSync';
import { useOutlookCalendarSync } from '../hooks/useOutlookCalendarSync';


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Component() {
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);
  const [calendarName, setCalendarName] = useState('');
  const [calendarDescription, setCalendarDescription] = useState('');
  const [isApprovalRequired, setIsApprovalRequired] = useState(false);
  const [queryTags, setQueryTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notificationTime, setNotificationTime] = useRecoilState(notificationsState) ; 
  
  const router = useRouter();
  const theme = useRecoilValue(themeState);
  const [saved, setIsSaved] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { syncGoogleCalendar } = useGoogleCalendarSync();
  const { syncOutlookCalendar } = useOutlookCalendarSync();
  
  const handleSharingToggle = () => {
    setIsSharingEnabled(!isSharingEnabled);
  };

  const handleApprovalToggle = () => {
    setIsApprovalRequired(!isApprovalRequired);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && emailRegex.test(currentTag)) {
      setQueryTags((prevTags) => [...prevTags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setQueryTags((prevTags) => prevTags.filter(tag => tag !== tagToDelete));
  };

  const handleSave = async () => {  
    if (!calendarName.trim()) {
      enqueueSnackbar('Calendar name is required.', { variant: 'error' });
      return;
    }
  
    if (!calendarDescription.trim()) {
      enqueueSnackbar('Calendar description is required.', { variant: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('token') as string;
      const appRq = isApprovalRequired ? 1 : 0;
      const response = await shareCalendar(token, calendarName, calendarDescription, appRq, "update");

      if (response && response.id) {
        enqueueSnackbar('Calendar shared successfully!', { variant: 'success' });
        setIsSaved(true);
      } else {
        throw new Error('Failed to share calendar');
      }
    } catch (error) {
      enqueueSnackbar('Error: Some Error Occurred', { variant: 'error' });
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      const token = localStorage.getItem('token') as string;
      const response = await updateNotificationSettings(token, notificationTime);

      if (response) {
        enqueueSnackbar('Notification settings updated successfully!', { variant: 'success' });
      } else {
        throw new Error('Failed to update notification settings');
      }
    } catch (error) {
      enqueueSnackbar('Error: Failed to update notification settings', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token') && localStorage.getItem('email')) {
      setIsLoggedIn(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  const muiTheme = createTheme({
    palette: {
      mode: theme as PaletteMode,
    },
    typography: {
      fontFamily: 'Rubik, sans-serif',
    },
  });

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTag(e.target.value);
  };

  if (isLoggedIn) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom align="center">
                      Calendar Sharing Settings
                    </Typography>
                    <TextField
                      fullWidth
                      label="Calendar Name"
                      variant="outlined"
                      margin="normal"
                      value={calendarName}
                      onChange={(e) => setCalendarName(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Calendar Description"
                      variant="outlined"
                      margin="normal"
                      multiline
                      rows={4}
                      value={calendarDescription}
                      onChange={(e) => setCalendarDescription(e.target.value)}
                    />
                    <FormControl component="fieldset" margin="normal" fullWidth>
                      <FormLabel component="legend" sx={{ textAlign: 'center' }}>Approval Settings</FormLabel>
                      <FormGroup>
                        <FormControlLabel
                          control={<Radio checked={isApprovalRequired} onChange={handleApprovalToggle} color="primary" />}
                          label="Approval Required to Subscribe"
                          sx={{ justifyContent: 'center' }}
                        />
                      </FormGroup>
                    </FormControl>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: '4px',
                        padding: '8px',
                        minHeight: '56px',
                        mt: 2
                      }}
                    >
                      {queryTags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          color="primary"
                          onDelete={() => handleTagDelete(tag)}
                          sx={{ margin: 0.5 }}
                        />
                      ))}
                      <TextField
                        placeholder="Add emails..."
                        value={currentTag}
                        onChange={handleTagInputChange}
                        onKeyPress={handleTagKeyPress}
                        InputProps={{
                          disableUnderline: true,
                          sx: { flexGrow: 1, minWidth: '150px' },
                        }}
                        variant="standard"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      disabled={!calendarName.trim() || !calendarDescription.trim()}
                    >
                      Save
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container direction="column" spacing={3}>
                  <Grid item>
                    <Card>
                      <CardContent>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <Box display="flex" alignItems="center" mb={2}>
                            <FaGoogle fontSize="large" color="error" />
                            <Typography variant="h6" ml={2}>Sync with Google Calendar</Typography>
                          </Box>
                          <Box display="flex" justifyContent="center" width="100%">
                            <Button startIcon={<FaSync />} onClick={() => syncGoogleCalendar()}>
                              Sync
                            </Button>
                            <Button startIcon={<FaSignOutAlt />} color="error">
                              Sign Out
                            </Button>
                          </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
                          <Box display="flex" alignItems="center" mb={2}>
                            <FaMicrosoft fontSize="large" color="primary" />
                            <Typography variant="h6" ml={2}>Sync with Outlook Calendar</Typography>
                          </Box>
                          <Box display="flex" justifyContent="center" width="100%">
                            <Button startIcon={<FaSync />} onClick={() => syncOutlookCalendar()}>
                              Sync
                            </Button>
                            <Button startIcon={<FaSignOutAlt />} color="error">
                              Sign Out
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item>
                    <Card>
                      <CardContent>
                        <Box display="flex" flexDirection="column" alignItems="center">
                          <Box display="flex" alignItems="center" mb={2}>
                            <FaBell fontSize="large" color="primary" />
                            <Typography variant="h6" ml={2}>Notification Settings</Typography>
                          </Box>
                          <FormControl component="fieldset">
                            <RadioGroup
                              aria-label="notification-time"
                              name="notification-time"
                              value={notificationTime}
                              onChange={(e) => setNotificationTime(e.target.value)}
                            >
                              <FormControlLabel value="none" control={<Radio />} label="No notification" />
                              <FormControlLabel value="30" control={<Radio />} label="Notify 30 minutes prior" />
                              <FormControlLabel value="60" control={<Radio />} label="Notify 60 minutes prior" />
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleUpdateNotifications}
                        >
                          Update Notification Settings
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
  return null;
}