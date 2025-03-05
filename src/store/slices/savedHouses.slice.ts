import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface SavedHousing {
  id: string;
  savedTime: string;
}

interface HousingState {
  savedHouses: SavedHousing[];
}

const getSavedHouses = (): SavedHousing[] => {
  if (typeof window !== 'undefined') {
    const savedHousesJSON = localStorage.getItem('savedHouses');
    if (savedHousesJSON) return JSON.parse(savedHousesJSON as string);
  }
  return [];
};

const initialState: HousingState = { savedHouses: getSavedHouses() };

const savedHousesSlice = createSlice({
  name: 'savedHouses',
  initialState,
  reducers: {
    toggleSaveHouse: (state, action: PayloadAction<SavedHousing>) => {
      const existingIndex = state.savedHouses.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingIndex !== -1) {
        // حذف آیتم اگر از قبل ذخیره شده باشد
        state.savedHouses.splice(existingIndex, 1);
      } else {
        // اضافه کردن آیتم جدید
        state.savedHouses.unshift(action.payload);
        if (state.savedHouses.length > 15) {
          state.savedHouses.pop();
        }
      }

      // بروزرسانی localStorage
      localStorage.setItem('savedHouses', JSON.stringify(state.savedHouses));
    },
    clearSavedHouses: (state) => {
      state.savedHouses = [];
      localStorage.removeItem('savedHouses');
    },
  },
});

export const { toggleSaveHouse, clearSavedHouses } = savedHousesSlice.actions

export default savedHousesSlice.reducer;
