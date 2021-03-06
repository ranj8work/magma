/**
 * Copyright 2020 The Magma Authors.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @flow strict-local
 * @format
 */
/*[object Object]*/
import type {GatewayPoolEditProps} from './GatewayPoolEdit';

import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormLabel from '@material-ui/core/FormLabel';
import GatewayContext from '../../components/context/GatewayContext';
import GatewayPoolsContext from '../../components/context/GatewayPoolsContext';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import Select from '@material-ui/core/Select';

import {AltFormField} from '../../components/FormField';
import {
  DEFAULT_GW_POOL_CONFIG,
  DEFAULT_GW_PRIMARY_CONFIG,
  DEFAULT_GW_SECONDARY_CONFIG,
} from '../../components/GatewayUtils';
import {useContext, useEffect, useState} from 'react';
import {useEnqueueSnackbar} from '@fbcnms/ui/hooks/useSnackbar';

export default function GatewayEdit(props: GatewayPoolEditProps) {
  const enqueueSnackbar = useEnqueueSnackbar();
  const [error, setError] = useState('');
  const ctx = useContext(GatewayPoolsContext);
  const gwCtx = useContext(GatewayContext);
  const [gwIds, _setGwIds] = useState(Object.keys(gwCtx.state));
  const [isPrimary, setIsPrimary] = useState(props.isPrimary || false);
  const [gwPool, setGwPool] = useState(props.gwPool);
  const [gateways, setGateways] = useState(
    isPrimary ? props.gatewayPrimary : props.gatewaySecondary,
  );

  useEffect(() => {
    setGwPool(props.gwPool || DEFAULT_GW_POOL_CONFIG);
  }, [props.gwPool]);

  const handleGwIdChange = (id: string, index: number) => {
    const newGwList = gateways;
    newGwList[index].gateway_id = id;
    props.onRecordChange?.([...newGwList]);
    setGateways([...newGwList]);
  };

  const handleGwChange = (index: number, value: number, key) => {
    const newGwList = gateways;
    newGwList[index][key] = value;
    props.onRecordChange?.([...newGwList]);
    setGateways([...newGwList]);
  };

  const handleGwAdd = () => {
    const newGwList = [
      ...gateways,
      isPrimary
        ? {...DEFAULT_GW_PRIMARY_CONFIG}
        : {...DEFAULT_GW_SECONDARY_CONFIG},
    ];
    setGateways([...newGwList]);
  };

  const handleGwDelete = (gatewayId: string) => {
    const newGwList = isPrimary
      ? props.gatewayPrimary.filter(gw => gw.gateway_id !== gatewayId)
      : props.gatewaySecondary.filter(gw => gw.gateway_id !== gatewayId);
    if (newGwList) {
      props.onRecordChange?.([...newGwList]);
      setGateways([...newGwList]);
    }
  };

  useEffect(() => {
    setIsPrimary(props.isPrimary || false);
  }, [props.isPrimary]);

  const onSave = async () => {
    try {
      await ctx.updateGatewayPoolRecords(gwPool.gateway_pool_id, gwPool, [
        ...props.gatewayPrimary,
        ...props.gatewaySecondary,
      ]);
      enqueueSnackbar('Gateway Pool Record(s) saved successfully', {
        variant: 'success',
      });
      props.onSave(gwPool);
    } catch (e) {
      setError(e.response?.data?.message ?? e.message);
    }
  };
  return (
    <>
      <DialogContent data-testid={`${isPrimary ? 'Primary' : 'Secondary'}Edit`}>
        <List>
          {error !== '' && (
            <AltFormField label={''}>
              <FormLabel data-testid="configEditError" error>
                {error}
              </FormLabel>
            </AltFormField>
          )}

          {gateways.length > 0 &&
            gateways.map((gw, index) => (
              <ListItem component={Paper}>
                <AltFormField
                  label={`${isPrimary ? 'Primary' : 'Secondary'} Gateway ID`}>
                  <Select
                    variant={'outlined'}
                    displayEmpty={true}
                    value={gw.gateway_id}
                    onChange={({target}) =>
                      handleGwIdChange(target.value, index)
                    }
                    input={
                      <OutlinedInput
                        data-testid={`gwId${
                          isPrimary ? 'Primary' : 'Secondary'
                        }`}
                        fullWidth={true}
                      />
                    }>
                    {gwIds.map(id => (
                      <MenuItem key={id} value={id}>
                        <ListItemText primary={id} />
                      </MenuItem>
                    ))}
                  </Select>
                </AltFormField>
                <AltFormField label={'MME Code'}>
                  <OutlinedInput
                    data-testid="mmeCode"
                    placeholder="Ex: 12020000261814C0021"
                    fullWidth={true}
                    type="number"
                    value={gw.mme_code}
                    onChange={({target}) => {
                      handleGwChange(index, parseInt(target.value), 'mme_code');
                    }}
                  />
                </AltFormField>
                <AltFormField label={'MME Relative Capacity'}>
                  <OutlinedInput
                    data-testid="mmeCapacity"
                    placeholder="Enter Description"
                    fullWidth={true}
                    type="number"
                    value={gw.mme_relative_capacity}
                    onChange={({target}) => {
                      handleGwChange(
                        index,
                        parseInt(target.value),
                        'mme_relative_capacity',
                      );
                    }}
                  />
                </AltFormField>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleGwDelete(gw.gateway_id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          <>
            Add New Gateway
            <IconButton
              data-testid="addGwButton"
              onClick={handleGwAdd}
              disabled={isPrimary ? false : gateways.length > 0}>
              <AddCircleOutline />
            </IconButton>
          </>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} skin="regular">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          {props.isPrimary ?? false ? 'Save And Continue' : 'Save'}
        </Button>
      </DialogActions>
    </>
  );
}
