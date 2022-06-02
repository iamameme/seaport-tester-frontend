import { configureStore } from '@reduxjs/toolkit'
import drawer from './components/OnboardDrawer/OnboardDrawer.slice';
import linkDrawer from './components/LinkDrawer/LinkDrawer.slice';

const store = configureStore({
  reducer: { 
      drawer, 
      linkDrawer 
    },
})
export type RootState = ReturnType<typeof store.getState>
export default store;
