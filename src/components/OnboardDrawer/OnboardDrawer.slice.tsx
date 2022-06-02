import { createSlice, PayloadAction  } from '@reduxjs/toolkit'
import { OnboardAPI, ConnectedChain, WalletState } from '@web3-onboard/core';
import { Account } from '@web3-onboard/core/dist/types';

export type OnboardDrawerSlice = {
  open: boolean;
  onboard?: WalletState[];
}

const initialState: OnboardDrawerSlice = {
  open: false,
  onboard: undefined,
}
export const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
    setOnboard: (state, action: PayloadAction<WalletState[]>) => {
      state.onboard = action.payload;
    }
  },
})
export const { setOpen, setOnboard } = drawerSlice.actions
export default drawerSlice.reducer