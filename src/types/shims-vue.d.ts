// 解决 TS 无法识别 .vue 模块 与 Vite 环境类型补充
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 可在此扩展环境变量类型（根据需要补充）
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_WS_BASE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
