import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector, useDispatch } from 'react-redux'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'

import { setOnboard, setOpen } from '../OnboardDrawer/OnboardDrawer.slice';
import { setLinkOpen } from '../LinkDrawer/LinkDrawer.slice';

const injected = injectedModule()
const INFURA_ID = "9aa3d95b3bc440fa88ea12eaa4456161";
export const MAINNET_RPC_URL = `https://mainnet.infura.io/v3/${INFURA_ID}`;
const onboar = Onboard({
    appMetadata: {
      name: 'My App',
      icon: 'seaport.png',
      description: 'My app using Onboard'
    },
    chains: [
      {
        id: '0x4',
        token: 'rETH',
        label: 'Ethereum Rinkeby Testnet',
        rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`
      }
      /*{
        id: '0x3',
        token: 'tROP',
        label: 'Ethereum Ropsten Testnet',
        rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`
      },*/
    ],
      wallets: [injected],
  });


export default function HeaderNav() {
    const dispatch = useDispatch();
    const initOnboard = async () => {
        const wallets = await onboar.connectWallet()
        if (wallets && wallets.length > 0) {
            dispatch(setOnboard(wallets));
            const connectedWallets = wallets.map(({ label }) => label)
            window.localStorage.setItem(
                'connectedWallets',
                JSON.stringify(connectedWallets)
              )
        }
      }; 
    React.useEffect(() => {
       const connector = async () => {
        const connectedWallets = window.localStorage.getItem('connectedWallets');
        if (connectedWallets) {
            const wallets = await onboar.connectWallet({ autoSelect: { label: JSON.parse(connectedWallets)[0], disableModals: true }})
            if (wallets && wallets.length > 0) {
                dispatch(setOnboard(wallets));
            }
        }
       }
       connector();
    }, []);
    return (
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
            <Toolbar>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={() => dispatch(setLinkOpen(true))}
            >
                <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                SEAPORT TEST SUITE
            </Typography>
            {/*<IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => dispatch(setOpen(true))}
            >
                <MenuIcon />
            </IconButton>*/}
            <Button 
                variant="contained"
                color="secondary"
                onClick={() => initOnboard()}
            >
                Connect Wallet
            </Button>
            </Toolbar>
        </AppBar>
        </Box>
    );
}