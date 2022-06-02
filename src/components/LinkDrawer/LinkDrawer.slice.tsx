import { createSlice, PayloadAction  } from '@reduxjs/toolkit'

export type LinkDrawerSlice = {
  open: boolean;
}

const initialState: LinkDrawerSlice = {
  open: false,
}
export const linkDrawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    setLinkOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
  },
})
export const { setLinkOpen } = linkDrawerSlice.actions
export default linkDrawerSlice.reducer