// src/store/slices/dataSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSheetsConfig, fetchSheetData } from '../../services/sheetService';
import { findColumnName } from '../../utils';

// ... (các hàm parseDateString, fetchConfigAndUnits, fetchSheet giữ nguyên)
const parseDateString = (dateStr) => {
  if (typeof dateStr !== 'string' || !dateStr.includes('/')) return null;

  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // Tháng trong JS là 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month - 1, day);
};


// THUNK 1: Tải cấu hình và dữ liệu sheet mới nhất
export const fetchConfigAndUnits = createAsyncThunk(
  'data/fetchConfigAndUnits',
  async (_, { rejectWithValue }) => {
    try {
      const config = await fetchSheetsConfig();
      if (!config || config.length === 0) {
        return { sheetsConfig: [], allData: {}, units: [] };
      }

      // Sắp xếp danh sách các sheet theo ngày tháng giảm dần (mới nhất lên đầu)
      config.sort((a, b) => {
        const dateA = parseDateString(a.name);
        const dateB = parseDateString(b.name);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      });

      // Tải dữ liệu của sheet đầu tiên (mới nhất)
      const latestSheet = config[0];
      const { data: latestData } = await fetchSheetData(latestSheet);
      const dataBySheet = { [latestSheet.name]: latestData };

      let units = [];
      if (latestData && latestData.length > 0) {
        const headers = Object.keys(latestData[0]);
        const unitColumnName = findColumnName(headers, ['don vi', 'tendonvi', 'ten']);
        if (unitColumnName) {
          const uniqueUnits = [...new Set(latestData.map(item => item[unitColumnName]).filter(Boolean))];
          units = uniqueUnits.sort();
        } else {
          throw new Error("Không tìm thấy cột 'Đơn vị' trong sheet mới nhất.");
        }
      }

      return { sheetsConfig: config, allData: dataBySheet, units };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// THUNK 2: Tải dữ liệu cho một sheet cụ thể
export const fetchSheet = createAsyncThunk(
  'data/fetchSheet',
  async (sheet, { rejectWithValue }) => {
    try {
      const { name, data } = await fetchSheetData(sheet);
      return { name, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const initialState = {
  sheetsConfig: [],
  allData: {},
  units: [],
  loading: true,
  status: 'Đang khởi tạo...',
  error: null,
  // --- BẮT ĐẦU CODE MỚI ---
  onlineCount: 0,
  visitorCount: '...',
  // --- KẾT THÚC CODE MỚI ---
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  // --- BẮT ĐẦU CODE MỚI ---
  reducers: {
    setOnlineCount: (state, action) => {
      state.onlineCount = action.payload;
    },
    setVisitorCount: (state, action) => {
      state.visitorCount = action.payload;
    },
  },
  // --- KẾT THÚC CODE MỚI ---
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfigAndUnits.pending, (state) => {
        state.loading = true;
        state.status = 'Đang tải cấu hình...';
        state.error = null;
      })
      .addCase(fetchConfigAndUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'Tải thành công!';
        state.sheetsConfig = action.payload.sheetsConfig;
        state.allData = action.payload.allData;
        state.units = action.payload.units;
      })
      .addCase(fetchConfigAndUnits.rejected, (state, action) => {
        state.loading = false;
        state.status = 'Tải cấu hình thất bại!';
        state.error = action.payload;
      });

    builder
      .addCase(fetchSheet.fulfilled, (state, action) => {
        state.allData[action.payload.name] = action.payload.data;
      });
  },
});

// --- BẮT ĐẦU CODE MỚI ---
export const { setOnlineCount, setVisitorCount } = dataSlice.actions;
// --- KẾT THÚC CODE MỚI ---

export default dataSlice.reducer;