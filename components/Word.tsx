import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Skeleton, Box, ThemeProvider, createTheme, PaletteMode, CssBaseline } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { getWord, getImage } from '@/utils/api';
import { themeState } from '@/app/recoil/atom';

interface WordProp {
  selectedDate: Date;
}

const WordOfTheDayCard: React.FC<WordProp> = ({ selectedDate }) => {
  const [wordData, setWordData] = useState({ word: '', meaning: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const theme = useRecoilValue(themeState);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        const token = localStorage.getItem('token') as string;
        const date = formatDate(selectedDate);
        const wordResponse = await getWord(date, token);
        const imageResponse = await getImage(date, token);

        setWordData({ word: wordResponse.word, meaning: wordResponse.meaning, imageUrl: imageResponse });
      } catch (error) {
        console.error('Error fetching word of the day:', error);
        setWordData({ word: 'Error', meaning: 'Error fetching word of the day', imageUrl: '' });
      } finally {
        setLoading(false);
      }
      console.log(theme); 
    };

    fetchWordOfTheDay();
  }, [selectedDate, theme]);

  const muiTheme = createTheme({
    typography: {
      fontFamily: 'Rubik, sans-serif',
    },
    palette: {
      mode: theme === 'light' || theme === 'dark' ? theme : 'light', // Fallback to 'light'
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Card sx={{ fontFamily: 'Roboto Slab, serif', backgroundColor: muiTheme.palette.background.paper, color: muiTheme.palette.text.primary }}>
        <CardContent>
          <Typography variant="h6" component="div">
            Word of the Day
          </Typography>
          {loading ? (
            <>
              <Skeleton variant="text" width={120} height={40} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="70%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={200} />
            </>
          ) : (
            <>
              <Typography variant="h6" component="div" mt={0.5}>
                {wordData.word}
              </Typography>
              <Typography variant="caption" color="textSecondary" mt={1} sx={{ lineHeight: '1 ' }}>
                {wordData.meaning}
              </Typography>
              {imageLoading && <Skeleton variant="rectangular" width="100%" height={200} />}
              <Box
                component="img"
                src={wordData.imageUrl}
                alt="Word of the Day"
                sx={{ display: imageLoading ? 'none' : 'block', width: '100%', height: '100%' }}
                marginTop={1}
                onLoad={() => setImageLoading(false)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default WordOfTheDayCard;
