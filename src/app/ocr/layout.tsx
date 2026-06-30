import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/ocr");

export { metadata };
export default ToolRouteLayout;
