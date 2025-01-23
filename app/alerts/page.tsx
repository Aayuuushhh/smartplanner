"use client"
import React, { useEffect, useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  PaletteMode,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  CssBaseline
} from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { alertsState, isSchoolAdminState, themeState } from '@/app/recoil/atom';
import { createOrUpdateAlert, getAlerts } from '../../utils/api';
import { FaTrash } from 'react-icons/fa';

const AlertsPage = () => {
  const theme = useRecoilValue(themeState);
  const [alerts, setAlerts] = useRecoilState(alertsState);
  const [newAlert, setNewAlert] = useState({
    id: 0,
    name: '',
    description: '',
    type: 'Normal',
    start: '',
    end: '',
    action: ''
  });
  const isSchoolAdmin = useRecoilValue(isSchoolAdminState);
  const muiTheme = createTheme({
    palette: {
      mode: theme as PaletteMode,
      background: {
        default: theme === 'dark' ? '#121212' : '#fff', // Dark mode background
        paper: theme === 'dark' ? '#1e1e1e' : '#fff', // Dark mode paper background
      },
    },
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        const fetchedAlerts = await getAlerts(token!);
        setAlerts(fetchedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, [setAlerts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewAlert((prevAlert) => ({
      ...prevAlert,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await createOrUpdateAlert(newAlert, token!);
      setNewAlert({ id: 0, name: '', description: '', type: 'Normal', start: '', end: '', action: '' });
      const fetchedAlerts = await getAlerts(token!);
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error('Error creating or updating alert:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await createOrUpdateAlert({ id, name: '', description: '', type: '', start: '', end: '', action: 'delete' }, token!);
      const fetchedAlerts = await getAlerts(token!);
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleRequestAdminAccess = () => {
    // Implement the logic to request admin access
    console.log('Requesting admin access');
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Container 
        className='flex items-center flex-col mt-10'
        sx={{
          backgroundColor: muiTheme.palette.background.default,
          color: theme === 'dark' ? '#fff' : '#000',
          minHeight: '100vh', // Ensure it covers the full viewport height
          padding: 2,
        }}
      >
        {isSchoolAdmin ? (
          <>
          <Container>
          <Typography variant="h4" component="h1" gutterBottom>
            Alerts
          </Typography>
          <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '100%' },
              '& .MuiButton-root': { m: 1 },
              backgroundColor: muiTheme.palette.background.paper,
              color: theme === 'dark' ? '#fff' : '#000',
              padding: 2,
              borderRadius: 2,
            }}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <TextField
              required
              id="name"
              label="Alert Name"
              variant="outlined"
              value={newAlert.name}
              onChange={handleInputChange}
              InputLabelProps={{
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
              InputProps={{
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
            />
            <TextField
              required
              id="description"
              label="Alert Description"
              variant="outlined"
              multiline
              rows={4}
              value={newAlert.description}
              onChange={handleInputChange}
              InputLabelProps={{
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
              InputProps={{
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
            />
            <TextField
              required
              id="start"
              label="Start Time"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
              value={newAlert.start}
              onChange={handleInputChange}
              InputProps={{
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
            />
            <TextField
              required
              id="end"
              label="End Time"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
              value={newAlert.end}
              onChange={handleInputChange}
              InputProps={{
                style: { color: theme === 'dark' ? '#fff' : '#000' }
              }}
            />
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </Container>
        <Container>
          <Paper elevation={3} sx={{ mt: 4, p: 2, backgroundColor: muiTheme.palette.background.paper }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Existing Alerts
            </Typography>
            <List>
              {alerts.map((alert) => (
                <React.Fragment key={alert.id}>
                  <ListItem>
                    <ListItemText
                      primary={alert.name}
                      secondary={`${alert.description} (Start: ${new Date(alert.start).toLocaleString()}, End: ${new Date(alert.end).toLocaleString()})`}
                    />
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(alert.id)}>
                      <FaTrash />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Container>
        </>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Not School Admin
            </Typography>
            <Button variant="contained" color="primary" onClick={handleRequestAdminAccess}>
              Request Admin Access
            </Button>
          </Box>
        )}
        
      </Container>
    </ThemeProvider>
  );
};

export default AlertsPage;
