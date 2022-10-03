/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import { ilertApiRef } from '../../api';
import { useNewService } from '../../hooks/useNewService';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    minWidth: 120,
    width: '100%',
  },
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
  optionWrapper: {
    display: 'flex',
    width: '100%',
  },
  sourceImage: {
    height: 22,
    paddingRight: 4,
  },
}));

export const ServiceNewModal = ({
  isModalOpened,
  setIsModalOpened,
  refetchServices,
}: {
  isModalOpened: boolean;
  setIsModalOpened: (open: boolean) => void;
  refetchServices: () => void;
}) => {
  const [{ name, isLoading }, { setName, setIsLoading }] = useNewService();
  const ilertApi = useApi(ilertApiRef);
  const alertApi = useApi(alertApiRef);
  const classes = useStyles();

  const handleClose = () => {
    setIsModalOpened(false);
  };

  const handleCreate = () => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        await ilertApi.createService({
          name,
        });
        alertApi.post({ message: 'Service created.' });
        refetchServices();
      } catch (err) {
        alertApi.post({ message: err, severity: 'error' });
      }
      setIsModalOpened(false);
    }, 250);
  };

  const canCreate = !!name;

  return (
    <Dialog
      open={isModalOpened}
      onClose={handleClose}
      aria-labelledby="create-service-form-title"
    >
      <DialogTitle id="create-service-form-title">'New alert'</DialogTitle>
      <DialogContent>
        {/* <Alert severity="info">
          <Typography variant="body1" gutterBottom align="justify">
            Please describe the problem you want to report. Be as descriptive as
            possible. Your signed in user and a reference to the current page
            will automatically be amended to the alarm so that the receiver can
            reach out to you if necessary.
          </Typography>
        </Alert> */}
        <TextField
          disabled={isLoading}
          label="Name"
          fullWidth
          margin="normal"
          variant="outlined"
          classes={{
            root: classes.formControl,
          }}
          value={name}
          onChange={event => {
            setName(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!canCreate}
          onClick={handleCreate}
          color="secondary"
          variant="contained"
        >
          Create
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
