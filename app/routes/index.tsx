import type { FunctionComponent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Chip,
  Grid,
  Button,
  Box,
  Dialog,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

import { dictionary } from '../data';
import styles from '~/styles/index.css';

const name = 'WORDLE GAME';
const GAP = 0.5;
const theme = createTheme({
  palette: {
    error: {
      main: grey[600],
    },
  },
});

const getRandomWord = (): string => {
  const index = Math.floor(Math.random() * dictionary.length);
  return dictionary[index];
};

type SmartChipProps = {
  label: string;
  exist?: boolean;
  exact?: boolean;
  submitted?: boolean;
};
const SmartChip: FunctionComponent<SmartChipProps> = ({
  label,
  exist,
  exact,
  submitted,
}) => {
  let color: any = 'default';
  if (submitted) {
    if (exact) {
      color = 'success';
    } else if (exist) {
      color = 'warning';
    } else {
      color = 'error';
    }
  }

  return <Chip className='chip' size='medium' label={label} color={color} />;
};

type Blacklisted = {
  [key: string]: 'warning' | 'error' | 'success';
};

export default function Index() {
  const [board, setBoard] = useState(
    new Array(6).fill(null).map(() => new Array(5).fill(null))
  );
  const keyboard: string[] = 'qwertyuiop asdfghjkl zxcvbnm'.split(' ');
  const [currentGuess, setCurrentGuess] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isWinner, setWinner] = useState<boolean>(false);
  const [todayWord, setWord] = useState<string>(getRandomWord());
  const [message, setMessage] = useState('');
  const [blackListed, setBlackListed] = useState<Blacklisted>({});

  /**
   * @description: Handle KeyPress
   * @param key
   * 1. If a row is full, then skip it(user must press enter to go to next row)
   * 2. If a row is not full, then add the key to the row
   */
  const onKeyPress = (key: string) => {
    const currentBoardRow = board[currentGuess];
    if (!currentBoardRow.filter((c) => !c).length) {
      return;
    }
    currentBoardRow[currentBoardRow.filter((c) => c).length] = key;
    setBoard((board) =>
      board.map((row, index) =>
        index === currentGuess ? currentBoardRow : row
      )
    );
  };

  /**
   * @description: Handle backspace key press
   * Remove last character from current row
   */
  const onBackSpace = () => {
    const currentBoardRow = board[currentGuess];
    currentBoardRow[currentBoardRow.filter((c) => c).length - 1] = null;
    setBoard((board) =>
      board.map((row, index) =>
        index === currentGuess ? currentBoardRow : row
      )
    );
  };

  /**
   * Check if a word is in the dictionary
   */
  const isWordInDictionary = (word: string) => {
    return dictionary.includes(word);
  };

  /**
   * @description: Handle enter key press
   * 1. If current guess is not the last row, move to next row
   * 2. If current guess is same as today word, set isWinner to true and set gameOver to true
   * 3. If current guess is the last row, check if it is the last row of the board
   */
  const onEnter = () => {
    const currentBoardRow = board[currentGuess];
    if (!isWordInDictionary(currentBoardRow.join())) {
      setMessage('Word not found');
      return;
    }
    if (!currentBoardRow.filter((c) => !c).length) {
      setCurrentGuess((guess) => guess + 1);
    }
    if (currentBoardRow.join('').toLowerCase() === todayWord.toLowerCase()) {
      setGameOver(true);
      setWinner(true);
      setMessage('You won!');
    }
    if(currentGuess === board.length - 1) {
      setGameOver(true);
      setWinner(false);
      setMessage('You lost!');
    }
  };

  /**
   * @description: This function checks if the character is contained in today word
   * @param character
   * @returns boolean
   */
  const doesItExist = useCallback(
    (character: string): boolean => {
      if (!character) return false;
      return todayWord.toLowerCase().includes(character.toLowerCase());
    },
    [todayWord]
  );

  /**
   * @description: This function check is the character is exact match
   * To be exact match, a charact must be in the word and the position must be the same
   * @param character
   * @param characterIndex
   * @returns boolean
   */
  const isExact = useCallback(
    (character: string, characterIndex: number): boolean => {
      if (!character) return false;
      return (
        character.toLowerCase() === todayWord.toLowerCase()[characterIndex]
      );
    },
    [todayWord]
  );

  /**
   * @description: This function reset game to the default state
   * 1. Set isWinner to false
   * 2. Reset the board
   * 3. Set game over to false
   * 4. Get a new random word
   * 5. Set blackisted to empty object
   */
  const restart = () => {
    onContinue();
    setWinner(false);
    setBoard(new Array(6).fill(null).map(() => new Array(5).fill(null)));
    setCurrentGuess(0);
    setGameOver(false);
    setWord(getRandomWord());
    setBlackListed({});
  };

  useEffect(() => {
    let keys: Blacklisted = {};
    board.forEach((column, colIndex) => {
      const isSubmitted = colIndex < currentGuess || colIndex === 6;
      if (isSubmitted) {
        column.forEach((character, characterIndex) => {
          keys = {
            ...keys,
            [character]:
              keys[character] === 'success' ||
              isExact(character, characterIndex)
                ? 'success'
                : doesItExist(character)
                ? 'warning'
                : 'error',
          };
        });
      }
    });
    if (Object.keys(keys).length) {
      setBlackListed(keys);
    }
  }, [board, currentGuess, isExact, doesItExist]);

  const onContinue = () => {
    setMessage('');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth='xs' className='title'>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
        >
          <Box mt={3}>
            {name
              .split(' ')[0]
              .split('')
              .map((c) => (
                <Chip color='primary' label={c} key={c} />
              ))}
            {name
              .split(' ')[1]
              .split('')
              .map((c) => (
                <Chip color='warning' label={c} key={c} />
              ))}
          </Box>
          <Grid
            mt={3}
            container
            columnSpacing={1}
            rowSpacing={1}
            justifyContent='center'
            columns={5}
          >
            {board.map((column, colIndex) =>
              column.map((row, rowIndex) => {
                return (
                  <Grid item key={`${colIndex}${rowIndex}`}>
                    <SmartChip
                      label={row}
                      submitted={colIndex < currentGuess || colIndex === 6}
                      exist={doesItExist(row)}
                      exact={isExact(row, rowIndex)}
                    />
                  </Grid>
                );
              })
            )}
          </Grid>
        </Box>
      </Container>
      <Container maxWidth='sm' className='keyboard'>
        <Box mt={5} display='flex' gap={GAP} flexDirection='column'>
          <Box display='flex' gap={GAP}>
            {keyboard[0].split('').map((c) => (
              <Button
                color={blackListed[c] || 'secondary'}
                variant='contained'
                className='keyboard-btn'
                key={c}
                onClick={() => onKeyPress(c)}
              >
                {c}
              </Button>
            ))}
          </Box>
          <Box display='flex' gap={GAP}>
            {keyboard[1].split('').map((c) => (
              <Button
                color={blackListed[c] || 'secondary'}
                variant='contained'
                className='keyboard-btn'
                key={c}
                onClick={() => onKeyPress(c)}
              >
                {c}
              </Button>
            ))}
          </Box>
          <Box display='flex' gap={GAP}>
            <Button
              className='keyboard-btn flex-3'
              variant='contained'
              color='secondary'
              onClick={onBackSpace}
            >
              Back
            </Button>
            {keyboard[2].split('').map((c) => (
              <Button
                color={blackListed[c] || 'secondary'}
                variant='contained'
                className='keyboard-btn'
                key={c}
                onClick={() => onKeyPress(c)}
              >
                {c}
              </Button>
            ))}
            <Button
              className='keyboard-btn flex-3'
              variant='contained'
              color='secondary'
              onClick={onEnter}
            >
              Enter
            </Button>
          </Box>
        </Box>
      </Container>
      <Dialog open={Boolean(message)}>
        <Box p={5} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Typography align='center'>{message}</Typography>
          {gameOver || isWinner ? (
            <Button onClick={restart}>Restart</Button>
          ) : (
            <Button onClick={onContinue}>Continue</Button>
          )}
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}
