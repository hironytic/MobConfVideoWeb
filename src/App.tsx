import { AppBar, CssBaseline, Toolbar, Typography } from '@mui/material';

export function App(): JSX.Element {
  return (
    <>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" color="inherit">MobConfVideo</Typography>
        </Toolbar>
      </AppBar>
    </>
  );
}
