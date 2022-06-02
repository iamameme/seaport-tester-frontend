import { Button, Drawer } from '@mui/material';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store';
import { setOnboard, setOpen } from './OnboardDrawer.slice';
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { omit } from 'lodash';

const OnboardDrawer = () => {
    const open = useSelector((state: RootState) => state.drawer.open);
    const dispatch = useDispatch();
    /*const initOnboard = async () => {
        const wallets = await onboar.connectWallet()
        if (wallets) {
            dispatch(setOnboard(wallets));
        }
      };*/
    return (
        <Drawer
            anchor="right"
            open={open}
            style={{ zIndex: 9}}
            onClose={() => dispatch(setOpen(false))}
        >
            <Button 
                variant="outlined"
                //onClick={() => initOnboard()}
            >
                Connect Wallet
            </Button>
        </Drawer>
    );
}

export default OnboardDrawer;