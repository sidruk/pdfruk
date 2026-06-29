import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/watermark");

export { metadata };
export default ToolRouteLayout;
