import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Housing } from '@/types';
import productionApiSlice from '@/services/productionBaseApi';

export interface SavedHousing {
  id: string;
  savedTime: string;
}

interface HousingState {
  savedHouses: SavedHousing[];
  apiFavorites: string[]; // IDs de favoritos desde la API
  isInitialized: boolean;
}

const getSavedHouses = (): SavedHousing[] => {
  if (typeof window !== 'undefined') {
    const savedHousesJSON = localStorage.getItem('savedHouses');
    if (savedHousesJSON) return JSON.parse(savedHousesJSON as string);
  }
  return [];
};

const initialState: HousingState = { 
  savedHouses: getSavedHouses(),
  apiFavorites: [],
  isInitialized: false,
};

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
    setApiFavorites: (state, action: PayloadAction<string[]>) => {
      state.apiFavorites = action.payload;
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    // Integración con RTK Query para mantener lista de favoritos actualizada
    builder.addMatcher(
      productionApiSlice.endpoints.getFavorites.matchFulfilled,
      (state, { payload }) => {
        if (payload?.items) {
          // Extraer IDs de los favoritos de la API
          state.apiFavorites = payload.items.map((item: Housing) => item.id);
          state.isInitialized = true;
        }
      }
    );
    builder.addMatcher(
      productionApiSlice.endpoints.addFavorite.matchFulfilled,
      (state, { payload, meta }) => {
        // Añadir el ID a la lista si la operación fue exitosa
        if (payload && meta.arg.originalArgs && meta.arg.originalArgs.id) {
          const id = meta.arg.originalArgs.id;
          if (!state.apiFavorites.includes(id)) {
            state.apiFavorites.push(id);
          } else {
            // Si ya existe, lo quitamos (toggle)
            state.apiFavorites = state.apiFavorites.filter(itemId => itemId !== id);
          }
        }
      }
    );
  },
});

export const { toggleSaveHouse, clearSavedHouses, setApiFavorites } = savedHousesSlice.actions

export default savedHousesSlice.reducer;
