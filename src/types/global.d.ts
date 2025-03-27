declare module "@editorjs/header" {
  import { type EditorConfig } from "@editorjs/editorjs";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Header: new (config?: EditorConfig) => any;
  export default Header;
}
