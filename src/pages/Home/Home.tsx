import * as React from 'react';
import { Typography } from "@mui/material"


const Home = () => {
    return (
        <div>
             <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                the home page
            </Typography>
            <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                Ya know, some flashy home page would probably be here or something. It would say like, how to use this and stuff.
            </Typography>
            <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                For now, here are some instructions.
            </Typography>
            <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                1) Click on that connect wallet button at the top right to like, connect your wallet
            </Typography>
            <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                2) Theres a bunch of links if you click the button at the top left, play around with some
            </Typography>
            <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                {'Note: If you want a collection to test, try searching "ummmm", youll see my great NFT collection titled "ummmmmmm what?"'}
            </Typography>
        </div>
    )
}

export default Home;