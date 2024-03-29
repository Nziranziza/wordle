import type { FunctionComponent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import type {
  ChipProps
} from '@mui/material';
import {
  Container,
  Chip,
  Grid,
  Button,
  Box,
  Dialog,
  Typography,
  IconButton,
  Popover
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { InfoOutlined, Close } from '@mui/icons-material';

import { dictionary } from '../data';
import styles from '~/styles/index.css';

/**
 * TODO: 
 * 1. Optimize keyboard on mobile
 */

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
const SmartChip: FunctionComponent<SmartChipProps & ChipProps> = ({
  label,
  exist,
  exact,
  submitted,
  ...props
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

  return <Chip className='chip' size='medium' label={label} color={color} {...props} />;
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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  /**
   * @description: Handle KeyPress
   * @param key
   * 1. If a row is full, then skip it(user must press enter to go to next row)
   * 2. If a row is not full, then add the key to the row
   */
  const onKeyPress = useCallback((key: string) => {
    window.navigator.vibrate(150);
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
  }, [currentGuess, board]);

  /**
   * @description: Handle backspace key press
   * Remove last character from current row
   */
  const onBackSpace = useCallback(() => {
    window.navigator.vibrate(150);
    const currentBoardRow = board[currentGuess];
    currentBoardRow[currentBoardRow.filter((c) => c).length - 1] = null;
    setBoard((board) =>
      board.map((row, index) =>
        index === currentGuess ? currentBoardRow : row
      )
    );
  }, [currentGuess, board]);

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
  const onEnter = useCallback(() => {
    window.navigator.vibrate(150);
    const currentBoardRow = board[currentGuess];
    if (!isWordInDictionary(currentBoardRow.join(''))) {
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
    if (currentGuess === board.length - 1) {
      setGameOver(true);
      setWinner(false);
      setMessage('You lost!');
    }
  }, [board, currentGuess, todayWord]);

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

  const onContinue = useCallback(() => {
    setMessage('');
  }, []);

  const handlePhysicalKeyboardPress = useCallback(({ key }: KeyboardEvent) => {
    if (key === 'Backspace') {
      onBackSpace();
    } else if (key === 'Enter') {
      onEnter();
    } else if (key === 'Escape') {
      onContinue();
    } else if (key === 'Delete') {
      onBackSpace();
    } else {
      const keys: string = keyboard.join('');
      if (keys.includes(key)) {
        onKeyPress(key);
      }
    }
  }, [keyboard, onBackSpace, onEnter, onContinue, onKeyPress]);

  useEffect(() => {
    window.document.addEventListener('keydown', handlePhysicalKeyboardPress);
    return () => window.document.removeEventListener('keydown', handlePhysicalKeyboardPress);
  }, [handlePhysicalKeyboardPress])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'popover' : undefined;
  const example = 'world';
  const closeExample = 'lower';
  const successExample = 'lowed';

  return (
    <ThemeProvider theme={theme}>
      <Box alignSelf='flex-start' pl={2}>
        <IconButton aria-describedby={id} onClick={handleClick}>
          <InfoOutlined />
        </IconButton>
      </Box>
      <Container maxWidth='xs' className='title'>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
        >
          <Box mt={2}>
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
            className="board"
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
      <Dialog open={Boolean(message)} onClose={!gameOver ? onContinue : restart}>
        <Box
          p={5}
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
        >
          <Typography align='center'>{message}</Typography>
          {gameOver && <Typography>The word was {todayWord}</Typography>}
          {gameOver || isWinner ? (
            <Button onClick={restart}>Restart</Button>
          ) : (
            <Button onClick={onContinue}>Continue</Button>
          )}
        </Box>
      </Dialog>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box p={4} pt={0} sx={{ maxWidth: 400 }}>
          <Box display="flex" justifyContent="flex-end" onClick={handleClose} position="sticky" top={0} sx={{ backgroundColor: "white" }} pt={2} pb={2}>
            <IconButton>
              <Close />
            </IconButton>
          </Box>
          <Typography variant='h6' mb={1}>How to play</Typography>
          <Typography pb={1}>
            You have to guess the hidden word in 6 tries and the color of the
            letters changes to show how close you are.
          </Typography>
          <Typography pb={1}>
            To start the game, just enter any word, for example:
          </Typography>
          <Grid
            container
            columnSpacing={1}
            rowSpacing={1}
            columns={5}
            mt={1}
            justifyContent="center"
          >
            {example.split('').map((c, index) => (
              <Grid key={index} item>
                <SmartChip size="small" label={c} submitted exist={index % 3 === 0} exact={index % 3 === 1} />
              </Grid>
            ))}
          </Grid>
          <Box mt={4} p={2} sx={{ bgcolor: 'text.disabled', borderRadius: 4 }}>
            <Box display="flex" alignItems="center">
              <Chip label="R" color="error" className="MuiChip-sizeSmaller" /><Typography color="primary.contrastText" pl={1}>is not in the target word</Typography>
            </Box>
            <Box pt={2} display="flex" alignItems="center">
              <Chip className="MuiChip-sizeSmaller" label="W" color="warning" /><Typography color="primary.contrastText" px={1}>and</Typography>
              <Chip className="MuiChip-sizeSmaller" label="L" color="warning" /><Typography color="primary.contrastText" pl={1}>are in the word but the wrong spot</Typography>
            </Box>
            <Box pt={2} display="flex" alignItems="center">
              <Chip className="MuiChip-sizeSmaller" label="E" color="success" /><Typography color="primary.contrastText" px={1}>and</Typography>
              <Chip className="MuiChip-sizeSmaller" label="0" color="success" /><Typography color="primary.contrastText" pl={1}>are in the word and the right spot</Typography>
            </Box>
          </Box>
          <Box pt={2}>
            <Typography align="center">One more try</Typography>
            <Grid
              container
              columnSpacing={1}
              rowSpacing={1}
              columns={5}
              justifyContent="center"
            >
              {closeExample.split('').map((c, index) => (
                <Grid key={index} item>
                  <SmartChip size="small" label={c} submitted exist={index < 4} exact={index < 4} />
                </Grid>
              ))}
            </Grid>
            <Typography align="center" mb={2}>So close! 💪</Typography>
            <Typography align="center">Last try to finish the game</Typography>
            <Grid
              container
              columnSpacing={1}
              rowSpacing={1}
              columns={5}
              justifyContent="center"
            >
              {successExample.split('').map((c, index) => (
                <Grid key={index} item>
                  <SmartChip size="small" label={c} submitted exist={true} exact={true} />
                </Grid>
              ))}
            </Grid>
            <Typography align="center">Got it! 🏆</Typography>
          </Box>
        </Box>
      </Popover>
    </ThemeProvider>
  );
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}
