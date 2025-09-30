import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSheetsConfig, fetchSheetData } from '../../services/sheetService';
import { findColumnName } from '../../utils';

// THUNK 1: Chỉ tải cấu hình và dữ liệu sheet mới nhất để lấy danh sách đơn vị
export const fetchConfigAndUnits = createAsyncThunk(
  'data/fetchConfigAndUnits',
  async (_, { rejectWithValue }) => {
    try {
      const config = await fetchSheetsConfig();
      if (!config || config.length === 0) {
        return { sheetsConfig: [], allData: {}, units: [] };
      }

      // Chỉ tải dữ liệu của sheet đầu tiên (mới nhất)
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

// THUNK 2: Tải dữ liệu cho một sheet cụ thể theo yêu cầu
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
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Reducers cho fetchConfigAndUnits
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

    // Reducers cho fetchSheet
    builder
      .addCase(fetchSheet.fulfilled, (state, action) => {
        // Thêm dữ liệu của sheet vừa tải vào state
        state.allData[action.payload.name] = action.payload.data;
      });
  },
});

export default dataSlice.reducer;