import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import './Application.css';

import ApplicationBar from './ApplicationBar';
import Workspace from './Workspace';
import BottomNav from './BottomNav';

export const Application = ({classes, username, languageId, reference, manifests, setReference}) =>
  <div className={classes.root}>
    <div className={classes.appFrame}>
      <main className={classes.main}>
        <ApplicationBar
          username={username}
          languageId={languageId}
          manifests={manifests}
          reference={reference}
          setReference={setReference}
        />
        <div className={classes.workspace}>
          <Workspace
            username={username}
            languageId={languageId}
            manifests={manifests}
            reference={reference}
            setReference={setReference}
          />
        </div>
      </main>
      <nav className={classes.bottomNav}>
        <BottomNav
          reference={reference}
          setReference={setReference}
        />
      </nav>
    </div>
  </div>

Application.propTypes = {
  classes: PropTypes.object.isRequired,
  username: PropTypes.string.isRequired,
  languageId: PropTypes.string.isRequired,
  reference: PropTypes.object.isRequired,
  setReference: PropTypes.func.isRequired,
  manifests: PropTypes.object,
};

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appFrame: {
    zIndex: 1,
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  main: {
    width: '100%',
    minWidth: '20em',
    fontSize: '0.9em',
    lineHeight: '1.75em',
  },
  workspace: {
    padding: '1em 1em 5.5em 1em',
  },
  bottomNav: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    zIndex: 10,
  }
});

export default withStyles(styles)(Application);
