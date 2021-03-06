import React from 'react';
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer } from "@mui/material";
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'react-router-dom';
import { RootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux'
import { setLinkOpen } from './LinkDrawer.slice';

const LinkDrawer = () => {
    const open = useSelector((state: RootState) => state.linkDrawer.open);
    const dispatch = useDispatch();
    const color = "#1876D1";
    const style = {backgroundColor: color};
    const path = window.location.pathname;
    const isSelected = (x: string) => path === x ? style : {};
    return (
        <SwipeableDrawer
            anchor={'left'}
            open={open}
            onClose={() => dispatch(setLinkOpen(false))}
            onOpen={() => dispatch(setLinkOpen(true))}
          >
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={() => dispatch(setLinkOpen(false))}
            onKeyDown={() => dispatch(setLinkOpen(false))}
            >
            <List>
                <ListItem key={'Home'} disablePadding>
                    <ListItemButton component={Link} to={'/'}  style={isSelected('/')} >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Home'} />
                    </ListItemButton>
                </ListItem>
                {/*<ListItem key={'Trade NFTs'} disablePadding>
                    <ListItemButton component={Link} to={'/'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Trade NFTs'} />
                    </ListItemButton>
                </ListItem>*/}
                <ListItem key={'Create Order'} disablePadding style={isSelected('/create')}>
                    <ListItemButton component={Link} to={'/create'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Create Order'} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={'Create Offer'} disablePadding style={isSelected('/create-offer')}>
                    <ListItemButton component={Link} to={'/create-offer'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Create Offer'} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={'Advanced Create Offer'} disablePadding style={isSelected('/advanced-create-offer')}>
                    <ListItemButton component={Link} to={'/advanced-create-offer'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Advanced Create Offer'} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={'Fulfill Order'} disablePadding style={isSelected('/fulfill')}>
                    <ListItemButton component={Link} to={'/fulfill'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Fulfill Order'} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={'Fulfill Offer'} disablePadding style={isSelected('/fulfill-offer')}>
                    <ListItemButton component={Link} to={'/fulfill-offer'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Fulfill Offer'} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={'Fulfill Offer'} disablePadding style={isSelected('/fulfill-collection-offer')}>
                    <ListItemButton component={Link} to={'/fulfill-collection-offer'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Fulfill Collection/Trait Offer'} />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem key={'Manage Orders'} disablePadding style={isSelected('/manage-orders')}>
                    <ListItemButton component={Link} to={'/manage-orders'}  >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={'Manage Orders'} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    </SwipeableDrawer>
  );
};

  export default LinkDrawer;