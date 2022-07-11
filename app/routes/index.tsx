import type { FunctionComponent } from 'react';
import { useState } from 'react';
import {
  Container,
  Chip,
  Grid,
  Button,
  Box,
  Dialog,
  Typography,
} from '@mui/material';

import { dictionary } from '../data';
import styles from '~/styles/index.css';

const name = 'WORDLE GAME';
const GAP = 0.5;

const getRandomWord = (): string => {
  const index = Math.floor(Math.random() * dictionary.length);
  return dictionary[index];
}

type SmartChipProps = {
  label: string;
  exist?: boolean;
  exact?: boolean;
};
const SmartChip: FunctionComponent<SmartChipProps> = ({
  label,
  exist,
  exact,
}) => {
  let color: any = 'default';
  if (exact) {
    color = 'success';
  } else if (exist) {
    color = 'warning';
  }

  return (
    <Chip
      className="chip"
      size='medium'
      label={label}
      color={color}
    />
  );
};

export default function Index() {
  const [board, setBoard] = useState(
    new Array(6).fill(null).map(() => new Array(5).fill(null))
  );
  const keyboard = 'qwertyuiop asdfghjkl zxcvbnm'.split(' ');
  const [currentGuess, setCurrentGuess] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [todayWord, setWord] = useState(getRandomWord());

  const onKeyPress = (key: string) => {
    const currentBoardRow = board[currentGuess];
    if (currentGuess === 5 && currentBoardRow.filter((c) => !c).length === 1) {
      setGameOver(true);
    }
    if (!currentBoardRow.includes(null)) {
      const currentBoardRow = board[currentGuess + 1];
      currentBoardRow[currentBoardRow.filter((c) => c).length] = key;
      setCurrentGuess((guess) => guess + 1);
      setBoard((board) =>
        board.map((row, index) =>
          index === currentGuess + 1 ? currentBoardRow : row
        )
      );
    } else {
      currentBoardRow[currentBoardRow.filter((c) => c).length] = key;
      setBoard((board) =>
        board.map((row, index) =>
          index === currentGuess ? currentBoardRow : row
        )
      );
    }
  };

  const onBackSpace = () => {
    const currentBoardRow = board[currentGuess];
    currentBoardRow[currentBoardRow.filter((c) => c).length - 1] = null;
    setBoard((board) =>
        board.map((row, index) =>
          index === currentGuess ? currentBoardRow : row
        )
      );
  }

  const onEnter = () => {
    const currentBoardRow = board[currentGuess];
    if(!currentBoardRow.filter((c) => !c).length) {
      setCurrentGuess((guess) => guess + 1)
    }
    if (currentBoardRow.join('').toLowerCase() === todayWord.toLowerCase()) {
      setGameOver(true);
      setWinner(true);
    }
  }

  const doesItExist = (character: string): boolean => {
    if (!character) return false;
    return todayWord.toLowerCase().includes(character.toLowerCase());
  };

  const isExact = (character: string, characterIndex: number): boolean => {
    if (!character) return false;
    return character.toLowerCase() === todayWord.toLowerCase()[characterIndex];
  };

  const restart = () => {
    setWinner(false);
    setBoard(new Array(6).fill(null).map(() => new Array(5).fill(null)));
    setCurrentGuess(0);
    setGameOver(false);
    setWord(getRandomWord());
  };

  return (
    <>
      <Container maxWidth='xs' className="title">
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
              column.map((row, rowIndex) => (
                <Grid item key={`${colIndex}${rowIndex}`}>
                  <SmartChip
                    label={row}
                    exist={(colIndex < currentGuess || colIndex === 6) && doesItExist(row)}
                    exact={(colIndex < currentGuess || colIndex === 6) && isExact(row, rowIndex)}
                  />
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>
      <Container maxWidth='sm' className="keyboard">
        <Box mt={5} display='flex' gap={GAP} flexDirection='column'>
          <Box display='flex' gap={GAP}>
            {keyboard[0].split('').map((c) => (
              <Button
                color='secondary'
                variant='contained'
                className="keyboard-btn"
                key={c}
                onClick={() => onKeyPress(c)}
                disabled={gameOver}
              >
                {c}
              </Button>
            ))}
          </Box>
          <Box display='flex' gap={GAP}>
            {keyboard[1].split('').map((c) => (
              <Button
                color='secondary'
                variant='contained'
                className="keyboard-btn"
                key={c}
                onClick={() => onKeyPress(c)}
                disabled={gameOver}
              >
                {c}
              </Button>
            ))}
          </Box>
          <Box display='flex' gap={GAP}>
            <Button
              className="keyboard-btn flex-3"
              variant='contained'
              color='secondary'
              onClick={onBackSpace}
            >
              Back
            </Button>
            {keyboard[2].split('').map((c) => (
              <Button
                color='secondary'
                variant='contained'
                className="keyboard-btn"
                key={c}
                onClick={() => onKeyPress(c)}
                disabled={gameOver}
              >
                {c}
              </Button>
            ))}
            <Button
              className="keyboard-btn flex-3"
              variant='contained'
              color='secondary'
              onClick={onEnter}
            >
              Enter
            </Button>
          </Box>
        </Box>
      </Container>
      <Dialog open={winner}>
        <Box p={5}>
          <Typography align='center'>You won!</Typography>
          <Button onClick={restart}>Restart</Button>
        </Box>
      </Dialog>
    </>
  );
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}