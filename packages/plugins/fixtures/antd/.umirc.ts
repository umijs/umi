import { join } from "path"

// .umirc.ts
export default {
  plugins: [join(__dirname, '../../src/antd.ts')],
  antd: {
    momentPicker: true,
  }
}