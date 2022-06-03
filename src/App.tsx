import React from 'react';
import logo from './logo.svg';
import './App.css';
import Axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Typography from '@mui/material/Typography';
import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';
import OnboardDrawer from './components/OnboardDrawer/OnboardDrawer';
import HeaderNav from './components/HeaderNav/HeaderNav';
import NFTTrader from './pages/NFTTrader/NFTTrader';
import Create from './pages/Create/Create';
import Fulfill from './pages/Fulfill/Fulfill';
import LinkDrawer from './components/LinkDrawer/LinkDrawer';
import ManageOrders from './pages/ManageOrders/ManageOrders';
import Offers from './pages/Offers/Offers';
import FulfillOffer from './pages/FulfillOffer/FulfillOffer';
import AdvancedCreateOffers from './pages/AdvancedCreateOffer/AdvancedCreateOffer';
import FulfillCollectionOffer from './pages/FulfillCollectionOffer/FulfillCollectionOffer';
import Home from './pages/Home/Home';

/*eslint no-unused-expressions: "off"*/
const theme = createTheme({
  palette: {
    //mode: 'dark',
  },
});
class App extends React.Component {
  render() {
    return (
      <Router>
        <ThemeProvider theme={theme}>
        <div className="App" style={{ width: '100vw', height: '100vh'}}>
            <OnboardDrawer />
            <LinkDrawer />
            <HeaderNav />
              <Routes>
                <Route path="/create" element={<Create />} />
                <Route path="/" element={<Home />} />
                <Route path="/manage-orders" element={<ManageOrders />} />
                <Route path="/create-offer" element={<Offers />} />
                <Route path="/fulfill" element={<Fulfill />} />
                <Route path="/fulfill-offer" element={<FulfillOffer />} />
                <Route path="/advanced-create-offer" element={<AdvancedCreateOffers />} />
                <Route path="/fulfill-collection-offer" element={<FulfillCollectionOffer/>} />
              </Routes>
        </div>
        </ThemeProvider>
      </Router>
    );
  }
}
export default App;
