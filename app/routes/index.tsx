import { Container, Chip, Grid, Button, Box } from '@mui/material';

export default function Index() {
  const name = 'WORDLE GAME';
  const board = new Array(6).fill(null).map(() => new Array(5).fill(null));
  const keyboard = 'qwertyuiop asdfghjkl zxcvbnm'.split(' ');
  return (
    <>
      <Container maxWidth='xs'>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
        >
          <Box>
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
          <Grid mt={5} container columnSpacing={1} rowSpacing={1} justifyContent="center">
            {board.map((column, colIndex) =>
              column.map((row, rowIndex) => (
                <Grid item key={`${colIndex}${rowIndex}`}>
                  <Chip
                    style={{ width: '64px', height: '64px' }}
                    size='medium'
                  />
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>
      <Container maxWidth='sm'>
        <Box mt={5} display='flex' gap={1} flexDirection='column'>
          <Box display='flex' gap={1}>
            {keyboard[0].split('').map((c) => (
              <Button
                color='secondary'
                variant='contained'
                style={{ minHeight: '46px', minWidth: 'unset', flex: 1 }}
                key={c}
              >
                {c}
              </Button>
            ))}
          </Box>
          <Box display='flex' gap={1}>
            {keyboard[1].split('').map((c) => (
              <Button
                color='secondary'
                variant='contained'
                style={{ minHeight: '46px', minWidth: 'unset', flex: 1 }}
                key={c}
              >
                {c}
              </Button>
            ))}
          </Box>
          <Box display='flex' gap={1}>
            <Button style={{ flex: 3 }} variant='contained' color="secondary">Back</Button>
            {keyboard[2].split('').map((c) => (
              <Button
                color='secondary'
                variant='contained'
                style={{ minHeight: '46px', minWidth: 'unset', flex: 1 }}
                key={c}
              >
                {c}
              </Button>
            ))}
            <Button style={{ flex: 3 }} variant='contained' color="secondary">Enter</Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}
