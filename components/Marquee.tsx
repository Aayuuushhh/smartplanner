import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { getAlerts } from '@/utils/api'; // Assuming you have an API call to fetch alerts
import { themeState } from '@/app/recoil/atom';
import { useRecoilValue } from 'recoil';
import { Alert } from '@/app/types/types';

const AlertsMarquee = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const theme = useRecoilValue(themeState);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getAlerts(token!);
      const currentDate = new Date();
      let currentTime = currentDate.getTime();

      const offset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;

      // Adjust current time by +5:30 GMT
      currentTime += offset;

  
      // Filter alerts to show only those where current time is between start and end
      const filteredAlerts = data.filter((alert: Alert) => {
        const startDate = new Date(alert.start);
        const endDate = new Date(alert.end);
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
  
      
        // Check if the current time is within the range
        const isActive = currentTime >= startTime && currentTime <= endTime;
        return isActive;
      });
  
      console.log('Filtered alerts:', filteredAlerts);
  
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15 * 60 * 1000); // Fetch alerts every 15 minutes

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Return null if there are no ongoing alerts
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: '#FBBE24',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '10px 0',
        position: 'relative',
        width: '100%',
        height: '40px', // Set a fixed height for the marquee
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        component="div"
        sx={{
          display: 'flex',
          animation: 'marquee 15s linear infinite',
          alignItems: 'center',
          fontSize: '1rem',
          position: 'absolute',
          whiteSpace: 'nowrap',
          padding: '0 10px', // Add padding to ensure text is not clipped
          lineHeight: '40px', // Ensure line height matches the container height
        }}
      >
        {alerts.map((alert, index) => (
          <React.Fragment key={alert.id}>
            <Typography
              variant="body1"
              component="span"
              sx={{
                marginRight: '20px',
                color: 'black',
                display: 'inline-block',
                fontWeight: 'bold',
              }}
            >
              {alert.name}: {alert.description} (Start: {new Date(alert.start).toLocaleString()}, End: {new Date(alert.end).toLocaleString()})
            </Typography>
            {index < alerts.length - 1 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{ backgroundColor: 'black', height: '40px', alignSelf: 'center' }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
      <style>
        {`
          @keyframes marquee {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(-100%);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default AlertsMarquee;
